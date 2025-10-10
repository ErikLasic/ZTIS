const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./database.db');

// Middleware za preverjanje admin pravic
const requireAdmin = (req, res, next) => {
    if (req.session.userId && req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Potrebne so administratorske pravice' });
    }
};

// Pregled vseh uporabnikov
router.get('/users', requireAdmin, (req, res) => {
    const query = `
        SELECT u.id, u.email, u.ime, u.priimek, u.isAdmin, u.ustvarjen,
        COUNT(e.id) as stevilo_dogodkov,
        COUNT(r.id) as stevilo_prijav
        FROM users u
        LEFT JOIN events e ON u.id = e.organizator_id AND e.aktiven = 1
        LEFT JOIN registrations r ON u.id = r.user_id AND r.status = 'potrjena'
        GROUP BY u.id
        ORDER BY u.ustvarjen DESC
    `;
    
    db.all(query, [], (err, users) => {
        if (err) {
            console.error('Napaka pri branju uporabnikov:', err);
            return res.status(500).json({ error: 'Napaka pri branju uporabnikov' });
        }
        
        res.json(users);
    });
});

// Pregled vseh dogodkov
router.get('/events', requireAdmin, (req, res) => {
    const query = `
        SELECT e.*, u.ime as organizator_ime, u.priimek as organizator_priimek, u.email as organizator_email,
        COUNT(r.id) as stevilo_prijavljenih
        FROM events e
        JOIN users u ON e.organizator_id = u.id
        LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'potrjena'
        WHERE e.aktiven = 1
        GROUP BY e.id
        ORDER BY e.ustvarjen DESC
    `;
    
    db.all(query, [], (err, events) => {
        if (err) {
            console.error('Napaka pri branju vseh dogodkov:', err);
            return res.status(500).json({ error: 'Napaka pri branju dogodkov' });
        }
        
        res.json(events);
    });
});

// Pregled vseh prijav
router.get('/registrations', requireAdmin, (req, res) => {
    const query = `
        SELECT r.*, 
        u.ime as uporabnik_ime, u.priimek as uporabnik_priimek, u.email as uporabnik_email,
        e.ime as dogodek_ime, e.datum, e.cas, e.lokacija,
        org.ime as organizator_ime, org.priimek as organizator_priimek
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        JOIN events e ON r.event_id = e.id
        JOIN users org ON e.organizator_id = org.id
        WHERE e.aktiven = 1
        ORDER BY r.prijavljen DESC
    `;
    
    db.all(query, [], (err, registrations) => {
        if (err) {
            console.error('Napaka pri branju vseh prijav:', err);
            return res.status(500).json({ error: 'Napaka pri branju prijav' });
        }
        
        res.json(registrations);
    });
});

// Sistemske statistike
router.get('/stats', requireAdmin, (req, res) => {
    const queries = {
        totalUsers: 'SELECT COUNT(*) as count FROM users',
        totalEvents: 'SELECT COUNT(*) as count FROM events WHERE aktiven = 1',
        totalRegistrations: `
            SELECT COUNT(*) as count
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.status = 'potrjena' AND e.aktiven = 1
        `,
        activeEvents: `
            SELECT COUNT(*) as count FROM events 
            WHERE aktiven = 1 AND datum >= date('now')
        `,
        pastEvents: `
            SELECT COUNT(*) as count FROM events 
            WHERE aktiven = 1 AND datum < date('now')
        `,
        avgRegistrationsPerEvent: `
            SELECT ROUND(AVG(reg_count), 2) as average
            FROM (
                SELECT COUNT(*) as reg_count 
                FROM registrations r 
                JOIN events e ON r.event_id = e.id 
                WHERE e.aktiven = 1 AND r.status = 'potrjena'
                GROUP BY e.id
            )
        `,
        topOrganizers: `
            SELECT u.ime, u.priimek, u.email, COUNT(e.id) as stevilo_dogodkov
            FROM users u
            JOIN events e ON u.id = e.organizator_id
            WHERE e.aktiven = 1
            GROUP BY u.id
            ORDER BY stevilo_dogodkov DESC
            LIMIT 5
        `,
        recentActivity: `
            SELECT 'registration' as tip, u.ime || ' ' || u.priimek as uporabnik, 
                   e.ime as dogodek, r.prijavljen as datum
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            JOIN events e ON r.event_id = e.id
            WHERE e.aktiven = 1
            UNION ALL
            SELECT 'event' as tip, u.ime || ' ' || u.priimek as uporabnik,
                   e.ime as dogodek, e.ustvarjen as datum
            FROM events e
            JOIN users u ON e.organizator_id = u.id
            WHERE e.aktiven = 1
            ORDER BY datum DESC
            LIMIT 10
        `
    };
    
    const stats = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
        db.all(query, [], (err, result) => {
            if (err) {
                console.error(`Napaka pri ${key}:`, err);
                stats[key] = null;
            } else {
                if (key === 'topOrganizers' || key === 'recentActivity') {
                    stats[key] = result;
                } else if (key === 'avgRegistrationsPerEvent') {
                    stats[key] = result[0]?.average || 0;
                } else {
                    stats[key] = result[0]?.count || 0;
                }
            }
            
            completedQueries++;
            if (completedQueries === totalQueries) {
                res.json(stats);
            }
        });
    });
});

// Posodobi uporabniške pravice
router.put('/users/:id/admin', requireAdmin, (req, res) => {
    const userId = req.params.id;
    const { isAdmin } = req.body;
    
    // Ne dovoli, da se admin sam sebi odvzame pravice
    if (userId == req.session.userId && !isAdmin) {
        return res.status(400).json({ error: 'Ne morete si sami odvzeti admin pravic' });
    }
    
    db.run('UPDATE users SET isAdmin = ? WHERE id = ?', 
           [isAdmin ? 1 : 0, userId], function(err) {
        if (err) {
            console.error('Napaka pri posodabljanju uporabnika:', err);
            return res.status(500).json({ error: 'Napaka pri posodabljanju uporabnika' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Uporabnik ni najden' });
        }
        
        res.json({
            success: true,
            message: `Uporabniške pravice uspešno ${isAdmin ? 'dodeljene' : 'odvzete'}`
        });
    });
});

// Deaktiviraj uporabnika (soft delete)
router.delete('/users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    // Ne dovoli brisanja samega sebe
    if (userId == req.session.userId) {
        return res.status(400).json({ error: 'Ne morete izbrisati samega sebe' });
    }
    
    // V tej implementaciji bi lahko dodali polje "aktiven" v tabelo users
    // Za sedaj samo vrnemo napako, če bi poskusili izbrisati uporabnika
    res.status(501).json({ 
        error: 'Brisanje uporabnikov ni implementirano iz varnostnih razlogov',
        note: 'Lahko pa jim odvzamete admin pravice'
    });
});

// Forsiraj izbris dogodka
router.delete('/events/:id', requireAdmin, (req, res) => {
    const eventId = req.params.id;
    
    // Najprej izbriši vse prijave
    db.run('DELETE FROM registrations WHERE event_id = ?', [eventId], (err) => {
        if (err) {
            console.error('Napaka pri brisanju prijav:', err);
            return res.status(500).json({ error: 'Napaka pri brisanju dogodka' });
        }
        
        // Nato deaktiviraj dogodek
        db.run('UPDATE events SET aktiven = 0 WHERE id = ?', [eventId], function(err) {
            if (err) {
                console.error('Napaka pri brisanju dogodka:', err);
                return res.status(500).json({ error: 'Napaka pri brisanju dogodka' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Dogodek ni najden' });
            }
            
            res.json({
                success: true,
                message: 'Dogodek in vse prijave uspešno izbrisani'
            });
        });
    });
});

// Simulacija pošiljanja email obvestil
router.post('/send-notifications/:eventId', requireAdmin, (req, res) => {
    const eventId = req.params.eventId;
    
    // Pridobi podatke o dogodku in prijavljenih uporabnikih
    const query = `
        SELECT e.ime as dogodek_ime, e.datum, e.cas, e.lokacija,
               u.email, u.ime, u.priimek
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ? AND r.status = 'potrjena' AND e.aktiven = 1
    `;
    
    db.all(query, [eventId], (err, recipients) => {
        if (err) {
            console.error('Napaka pri iskanju prejemnikov:', err);
            return res.status(500).json({ error: 'Napaka pri pošiljanju obvestil' });
        }
        
        if (recipients.length === 0) {
            return res.status(404).json({ error: 'Ni prijavljenih uporabnikov' });
        }
        
        // Simulacija pošiljanja emailov
        const notifications = recipients.map(recipient => {
            return {
                to: recipient.email,
                subject: `Obvestilo o dogodku: ${recipient.dogodek_ime}`,
                body: `Pozdravljeni ${recipient.ime} ${recipient.priimek},

To je obvestilo o dogodku "${recipient.dogodek_ime}", na katerega ste se prijavili.

Datum: ${recipient.datum}
${recipient.cas ? `Čas: ${recipient.cas}` : ''}
Lokacija: ${recipient.lokacija}

Hvala za prijavo!

EventManager sistem`,
                sent: new Date().toISOString(),
                status: 'sent' // Simulacija - v resnici bi tu bila logika za pošiljanje
            };
        });
        
        res.json({
            success: true,
            message: `Poslano ${notifications.length} obvestil`,
            notifications: notifications
        });
    });
});

module.exports = router;