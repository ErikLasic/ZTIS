const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: 'eventmanager_secret_key_2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database connection
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Napaka pri povezavi z bazo:', err.message);
    } else {
        console.log('Povezan z SQLite bazo podatkov.');
    }
});

// Middleware za preverjanje prijave
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware za preverjanje admin pravic
const requireAdmin = (req, res, next) => {
    if (req.session.userId && req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Potrebne so administratorske pravice' });
    }
};

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

// Osnovne strani
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API za pridobivanje trenutnega uporabnika
app.get('/api/user', (req, res) => {
    if (req.session.userId) {
        db.get(
            'SELECT id, email, ime, priimek, isAdmin FROM users WHERE id = ?',
            [req.session.userId],
            (err, row) => {
                if (err) {
                    res.status(500).json({ error: 'Napaka pri branju uporabnika' });
                } else if (row) {
                    res.json(row);
                } else {
                    res.status(404).json({ error: 'Uporabnik ni najden' });
                }
            }
        );
    } else {
        res.status(401).json({ error: 'Niste prijavljeni' });
    }
});

// 404 error handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Prišlo je do napake na strežniku' });
});

// Zagon strežnika
app.listen(PORT, () => {
    console.log(`EventManager server teče na portu ${PORT}`);
    console.log(`Odpri http://localhost:${PORT} v brskalniku`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Baza podatkov je zaprta.');
        process.exit(0);
    });
});