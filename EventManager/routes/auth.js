const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

// Povezava z bazo
const db = new sqlite3.Database('./database.db');

// Registracija novega uporabnika
router.post('/register', async (req, res) => {
    const { email, geslo, ime, priimek } = req.body;

    try {
        // Validacija
        if (!email || !geslo || !ime || !priimek) {
            return res.status(400).json({ error: 'Vsa polja so obvezna' });
        }

        if (geslo.length < 6) {
            return res.status(400).json({ error: 'Geslo mora imeti vsaj 6 znakov' });
        }

        // Preveri, če uporabnik že obstaja
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error('Napaka pri preverjanju uporabnika:', err);
                return res.status(500).json({ error: 'Napaka pri registraciji' });
            }

            if (row) {
                return res.status(409).json({ error: 'Uporabnik s tem emailom že obstaja' });
            }

            // Hash gesla
            const hashedPassword = await bcrypt.hash(geslo, 10);

            // Vstavi novega uporabnika
            db.run('INSERT INTO users (email, geslo, ime, priimek) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, ime, priimek],
                function(err) {
                    if (err) {
                        console.error('Napaka pri vstavitvi uporabnika:', err);
                        return res.status(500).json({ error: 'Napaka pri registraciji' });
                    }

                    // Avtomatična prijava po registraciji
                    req.session.userId = this.lastID;
                    req.session.isAdmin = false;

                    res.json({
                        success: true,
                        message: 'Registracija uspešna',
                        user: {
                            id: this.lastID,
                            email: email,
                            ime: ime,
                            priimek: priimek,
                            isAdmin: false
                        }
                    });
                });
        });

    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        res.status(500).json({ error: 'Napaka pri registraciji' });
    }
});

// Prijava uporabnika
router.post('/login', (req, res) => {
    const { email, geslo } = req.body;

    if (!email || !geslo) {
        return res.status(400).json({ error: 'Email in geslo sta obvezna' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error('Napaka pri iskanju uporabnika:', err);
            return res.status(500).json({ error: 'Napaka pri prijavi' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Napačen email ali geslo' });
        }

        try {
            const isValid = await bcrypt.compare(geslo, user.geslo);
            
            if (!isValid) {
                return res.status(401).json({ error: 'Napačen email ali geslo' });
            }

            // Nastavi sejo
            req.session.userId = user.id;
            req.session.isAdmin = user.isAdmin === 1;

            res.json({
                success: true,
                message: 'Prijava uspešna',
                user: {
                    id: user.id,
                    email: user.email,
                    ime: user.ime,
                    priimek: user.priimek,
                    isAdmin: user.isAdmin === 1
                }
            });

        } catch (error) {
            console.error('Napaka pri preverjanju gesla:', error);
            res.status(500).json({ error: 'Napaka pri prijavi' });
        }
    });
});

// Odjava uporabnika
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Napaka pri odjavi:', err);
            return res.status(500).json({ error: 'Napaka pri odjavi' });
        }

        res.json({ success: true, message: 'Uspešno odjavljen' });
    });
});

// Preveri stanje prijave
router.get('/status', (req, res) => {
    if (req.session.userId) {
        db.get('SELECT id, email, ime, priimek, isAdmin FROM users WHERE id = ?', 
               [req.session.userId], (err, user) => {
            if (err || !user) {
                return res.json({ authenticated: false });
            }

            res.json({
                authenticated: true,
                user: {
                    id: user.id,
                    email: user.email,
                    ime: user.ime,
                    priimek: user.priimek,
                    isAdmin: user.isAdmin === 1
                }
            });
        });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;