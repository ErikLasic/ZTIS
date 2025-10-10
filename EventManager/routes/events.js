const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./database.db');

// Middleware za preverjanje prijave
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Potrebna je prijava' });
    }
};

// Pridobi vse dogodke (z možnostjo iskanja)
router.get('/', (req, res) => {
    const { search, lokacija, datum } = req.query;
    let query = `
        SELECT e.*, u.ime as organizator_ime, u.priimek as organizator_priimek,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'potrjena') as stevilo_prijavljenih
        FROM events e
        JOIN users u ON e.organizator_id = u.id
        WHERE e.aktiven = 1
    `;
    
    const params = [];
    
    if (search) {
        query += ` AND (e.ime LIKE ? OR e.opis LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }
    
    if (lokacija) {
        query += ` AND e.lokacija LIKE ?`;
        params.push(`%${lokacija}%`);
    }
    
    if (datum) {
        query += ` AND e.datum = ?`;
        params.push(datum);
    }
    
    query += ` ORDER BY e.datum ASC, e.cas ASC`;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Napaka pri branju dogodkov:', err);
            return res.status(500).json({ error: 'Napaka pri branju dogodkov' });
        }
        
        res.json(rows);
    });
});

// POZOR: Vse specifične poti (npr. /my/...) morajo biti definirane PRED dinamičnimi (/ :id)

// Pridobi dogodke trenutnega uporabnika
router.get('/my/events', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    const query = `
        SELECT e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'potrjena') as stevilo_prijavljenih
        FROM events e
        WHERE e.organizator_id = ? AND e.aktiven = 1
        ORDER BY e.datum ASC, e.cas ASC
    `;
    
    db.all(query, [userId], (err, events) => {
        if (err) {
            console.error('Napaka pri branju mojih dogodkov:', err);
            return res.status(500).json({ error: 'Napaka pri branju dogodkov' });
        }
        
        res.json(events);
    });
});

// Pridobi prijave trenutnega uporabnika
router.get('/my/registrations', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    const query = `
        SELECT r.*, e.ime, e.opis, e.datum, e.cas, e.lokacija,
        u.ime as organizator_ime, u.priimek as organizator_priimek
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        JOIN users u ON e.organizator_id = u.id
        WHERE r.user_id = ? AND e.aktiven = 1
        ORDER BY e.datum ASC, e.cas ASC
    `;
    
    db.all(query, [userId], (err, registrations) => {
        if (err) {
            console.error('Napaka pri branju mojih prijav:', err);
            return res.status(500).json({ error: 'Napaka pri branju prijav' });
        }
        
        res.json(registrations);
    });
});

// Pridobi posamezen dogodek
router.get('/:id', (req, res) => {
    const eventId = req.params.id;
    
    const query = `
        SELECT e.*, u.ime as organizator_ime, u.priimek as organizator_priimek, u.email as organizator_email,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'potrjena') as stevilo_prijavljenih
        FROM events e
        JOIN users u ON e.organizator_id = u.id
        WHERE e.id = ? AND e.aktiven = 1
    `;
    
    db.get(query, [eventId], (err, event) => {
        if (err) {
            console.error('Napaka pri branju dogodka:', err);
            return res.status(500).json({ error: 'Napaka pri branju dogodka' });
        }
        
        if (!event) {
            return res.status(404).json({ error: 'Dogodek ni najden' });
        }
        
        res.json(event);
    });
});

// Ustvari nov dogodek
router.post('/', requireAuth, (req, res) => {
    const { ime, opis, datum, cas, lokacija, maxUdelezenci } = req.body;
    const organizatorId = req.session.userId;
    
    // Validacija
    if (!ime || !datum || !lokacija) {
        return res.status(400).json({ error: 'Ime, datum in lokacija so obvezni' });
    }
    
    // Preveri, če je datum v prihodnosti
    const eventDate = new Date(datum + (cas ? ` ${cas}` : ''));
    if (eventDate <= new Date()) {
        return res.status(400).json({ error: 'Datum dogodka mora biti v prihodnosti' });
    }
    
    const query = `
        INSERT INTO events (ime, opis, datum, cas, lokacija, maxUdelezenci, organizator_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [ime, opis, datum, cas, lokacija, maxUdelezenci || null, organizatorId], 
           function(err) {
        if (err) {
            console.error('Napaka pri ustvarjanju dogodka:', err);
            return res.status(500).json({ error: 'Napaka pri ustvarjanju dogodka' });
        }
        
        // Vrni ustvarjen dogodek
        router.get(`/${this.lastID}`, (req, res) => {}); // Reuse get logic
        
        res.json({
            success: true,
            message: 'Dogodek uspešno ustvarjen',
            eventId: this.lastID
        });
    });
});

// Posodobi dogodek
router.put('/:id', requireAuth, (req, res) => {
    const eventId = req.params.id;
    const { ime, opis, datum, cas, lokacija, maxUdelezenci } = req.body;
    const userId = req.session.userId;
    
    // Preveri, če je uporabnik organizator dogodka ali admin
    db.get('SELECT organizator_id FROM events WHERE id = ?', [eventId], (err, event) => {
        if (err) {
            console.error('Napaka pri iskanju dogodka:', err);
            return res.status(500).json({ error: 'Napaka pri posodabljanju dogodka' });
        }
        
        if (!event) {
            return res.status(404).json({ error: 'Dogodek ni najden' });
        }
        
        if (event.organizator_id !== userId && !req.session.isAdmin) {
            return res.status(403).json({ error: 'Nimate pravic za urejanje tega dogodka' });
        }
        
        // Validacija
        if (!ime || !datum || !lokacija) {
            return res.status(400).json({ error: 'Ime, datum in lokacija so obvezni' });
        }
        
        const query = `
            UPDATE events 
            SET ime = ?, opis = ?, datum = ?, cas = ?, lokacija = ?, maxUdelezenci = ?
            WHERE id = ?
        `;
        
        db.run(query, [ime, opis, datum, cas, lokacija, maxUdelezenci || null, eventId], 
               function(err) {
            if (err) {
                console.error('Napaka pri posodabljanju dogodka:', err);
                return res.status(500).json({ error: 'Napaka pri posodabljanju dogodka' });
            }
            
            res.json({
                success: true,
                message: 'Dogodek uspešno posodobljen'
            });
        });
    });
});

// Izbriši dogodek (soft delete)
router.delete('/:id', requireAuth, (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.userId;
    
    // Preveri, če je uporabnik organizator dogodka ali admin
    db.get('SELECT organizator_id FROM events WHERE id = ?', [eventId], (err, event) => {
        if (err) {
            console.error('Napaka pri iskanju dogodka:', err);
            return res.status(500).json({ error: 'Napaka pri brisanju dogodka' });
        }
        
        if (!event) {
            return res.status(404).json({ error: 'Dogodek ni najden' });
        }
        
        if (event.organizator_id !== userId && !req.session.isAdmin) {
            return res.status(403).json({ error: 'Nimate pravic za brisanje tega dogodka' });
        }
        
        // Soft delete - nastavi aktiven na 0
        db.run('UPDATE events SET aktiven = 0 WHERE id = ?', [eventId], function(err) {
            if (err) {
                console.error('Napaka pri brisanju dogodka:', err);
                return res.status(500).json({ error: 'Napaka pri brisanju dogodka' });
            }
            
            res.json({
                success: true,
                message: 'Dogodek uspešno izbrisan'
            });
        });
    });
});

// Prijavi se na dogodek
router.post('/:id/register', requireAuth, (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.userId;
    
    // Preveri, če dogodek obstaja in je aktiven
    const eventQuery = `
        SELECT e.*, 
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'potrjena') as stevilo_prijavljenih
        FROM events e
        WHERE e.id = ? AND e.aktiven = 1
    `;
    
    db.get(eventQuery, [eventId], (err, event) => {
        if (err) {
            console.error('Napaka pri iskanju dogodka:', err);
            return res.status(500).json({ error: 'Napaka pri prijavi na dogodek' });
        }
        
        if (!event) {
            return res.status(404).json({ error: 'Dogodek ni najden' });
        }
        
        // Preveri, če je dogodek v prihodnosti
        const eventDate = new Date(event.datum + (event.cas ? ` ${event.cas}` : ''));
        if (eventDate <= new Date()) {
            return res.status(400).json({ error: 'Na pretekle dogodke se ne morete prijaviti' });
        }
        
        // Preveri, če je še prostor (če je maksimum določen)
        if (event.maxUdelezenci && event.stevilo_prijavljenih >= event.maxUdelezenci) {
            return res.status(400).json({ error: 'Dogodek je že poln' });
        }
        
        // Preveri, če se uporabnik že ni prijavil
        db.get('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', 
               [userId, eventId], (err, registration) => {
            if (err) {
                console.error('Napaka pri preverjanju prijave:', err);
                return res.status(500).json({ error: 'Napaka pri prijavi na dogodek' });
            }
            
            if (registration) {
                return res.status(409).json({ error: 'Že ste prijavljeni na ta dogodek' });
            }
            
            // Ustvari prijavo
            db.run('INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, ?)',
                   [userId, eventId, 'potrjena'], function(err) {
                if (err) {
                    console.error('Napaka pri ustvarjanju prijave:', err);
                    return res.status(500).json({ error: 'Napaka pri prijavi na dogodek' });
                }
                
                res.json({
                    success: true,
                    message: 'Uspešno ste se prijavili na dogodek'
                });
            });
        });
    });
});

// Odjavi se z dogodka
router.delete('/:id/register', requireAuth, (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.userId;
    
    // Preveri, če je uporabnik prijavljen
    db.get('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', 
           [userId, eventId], (err, registration) => {
        if (err) {
            console.error('Napaka pri iskanju prijave:', err);
            return res.status(500).json({ error: 'Napaka pri odjavi z dogodka' });
        }
        
        if (!registration) {
            return res.status(404).json({ error: 'Niste prijavljeni na ta dogodek' });
        }
        
        // Izbriši prijavo
        db.run('DELETE FROM registrations WHERE user_id = ? AND event_id = ?',
               [userId, eventId], function(err) {
            if (err) {
                console.error('Napaka pri brisanju prijave:', err);
                return res.status(500).json({ error: 'Napaka pri odjavi z dogodka' });
            }
            
            res.json({
                success: true,
                message: 'Uspešno ste se odjavili z dogodka'
            });
        });
    });
});

// Pridobi seznam prijavljenih uporabnikov
router.get('/:id/registrations', requireAuth, (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.userId;
    
    // Preveri, če je uporabnik organizator dogodka ali admin
    db.get('SELECT organizator_id FROM events WHERE id = ?', [eventId], (err, event) => {
        if (err) {
            console.error('Napaka pri iskanju dogodka:', err);
            return res.status(500).json({ error: 'Napaka pri branju prijav' });
        }
        
        if (!event) {
            return res.status(404).json({ error: 'Dogodek ni najden' });
        }
        
        if (event.organizator_id !== userId && !req.session.isAdmin) {
            return res.status(403).json({ error: 'Nimate pravic za ogled prijav' });
        }
        
        // Pridobi prijave
        const query = `
            SELECT r.*, u.ime, u.priimek, u.email
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.event_id = ?
            ORDER BY r.prijavljen ASC
        `;
        
        db.all(query, [eventId], (err, registrations) => {
            if (err) {
                console.error('Napaka pri branju prijav:', err);
                return res.status(500).json({ error: 'Napaka pri branju prijav' });
            }
            
            res.json(registrations);
        });
    });
});


module.exports = router;