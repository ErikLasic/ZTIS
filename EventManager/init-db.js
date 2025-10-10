const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

console.log('Inicializacija baze podatkov...');

// Ustvari novo bazo (ali se poveži z obstoječo)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Napaka pri ustvarjanju baze:', err.message);
        return;
    }
    console.log('Povezan z SQLite bazo podatkov.');
});

// Ustvari tabele
db.serialize(() => {
    // Tabela uporabnikov
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        geslo TEXT NOT NULL,
        ime TEXT NOT NULL,
        priimek TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0,
        ustvarjen DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Napaka pri ustvarjanju tabele users:', err.message);
        } else {
            console.log('✓ Tabela users ustvarjena');
        }
    });

    // Tabela dogodkov
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ime TEXT NOT NULL,
        opis TEXT,
        datum DATE NOT NULL,
        cas TIME,
        lokacija TEXT NOT NULL,
        maxUdelezenci INTEGER DEFAULT NULL,
        organizator_id INTEGER NOT NULL,
        ustvarjen DATETIME DEFAULT CURRENT_TIMESTAMP,
        aktiven BOOLEAN DEFAULT 1,
        FOREIGN KEY (organizator_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('Napaka pri ustvarjanju tabele events:', err.message);
        } else {
            console.log('✓ Tabela events ustvarjena');
        }
    });

    // Unikatni indeks, da se testni dogodki ne duplikatijo pri ponovnem zagonu init (ime+datum+lokacija)
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique ON events(ime, datum, lokacija)`, (err) => {
        if (err) {
            console.warn('Opomba: Unikatnega indeksa za events ni bilo mogoče ustvariti (morda zaradi obstoječe strukture):', err.message);
        } else {
            console.log('✓ Unikatni indeks za events (ime, datum, lokacija) ustvarjen');
        }
    });

    // Tabela prijav na dogodke
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        prijavljen DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'potrjena',
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (event_id) REFERENCES events (id),
        UNIQUE(user_id, event_id)
    )`, (err) => {
        if (err) {
            console.error('Napaka pri ustvarjanju tabele registrations:', err.message);
        } else {
            console.log('✓ Tabela registrations ustvarjena');
        }
    });

    // Ustvari testnega administratorja
    const adminEmail = 'admin@eventmanager.si';
    const adminPassword = 'admin123';
    
    bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Napaka pri hash-anju gesla:', err.message);
            return;
        }

        db.run(`INSERT OR IGNORE INTO users (email, geslo, ime, priimek, isAdmin) 
                VALUES (?, ?, ?, ?, ?)`, 
                [adminEmail, hashedPassword, 'Admin', 'Administrator', 1], 
                function(err) {
                    if (err) {
                        console.error('Napaka pri ustvarjanju admin uporabnika:', err.message);
                    } else if (this.changes > 0) {
                        console.log('✓ Admin uporabnik ustvarjen:', adminEmail, '/ geslo:', adminPassword);
                    } else {
                        console.log('→ Admin uporabnik že obstaja');
                    }
                });
    });

    // Ustvari nekaj testnih uporabnikov
    const testUsers = [
        { email: 'janez@test.si', geslo: 'test123', ime: 'Janez', priimek: 'Novak' },
        { email: 'maja@test.si', geslo: 'test123', ime: 'Maja', priimek: 'Kovač' },
        { email: 'peter@test.si', geslo: 'test123', ime: 'Peter', priimek: 'Kranjc' }
    ];

    testUsers.forEach(user => {
        bcrypt.hash(user.geslo, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Napaka pri hash-anju gesla:', err.message);
                return;
            }

            db.run(`INSERT OR IGNORE INTO users (email, geslo, ime, priimek) 
                    VALUES (?, ?, ?, ?)`, 
                    [user.email, hashedPassword, user.ime, user.priimek], 
                    function(err) {
                        if (err) {
                            console.error('Napaka pri ustvarjanju uporabnika:', err.message);
                        } else if (this.changes > 0) {
                            console.log(`✓ Testni uporabnik ustvarjen: ${user.email}`);
                        }
                    });
        });
    });

    // Ustvari nekaj testnih dogodkov
    setTimeout(() => {
        const testEvents = [
            {
                ime: 'Tehnološka konferenca 2025',
                opis: 'Letna konferenca o najnovejših tehnologijah',
                datum: '2025-11-15',
                cas: '09:00',
                lokacija: 'Ljubljana, Kongresni center',
                maxUdelezenci: 200
            },
            {
                ime: 'Workshop o testiranju',
                opis: 'Praktični workshop o testiranju programske opreme',
                datum: '2025-10-25',
                cas: '14:00',
                lokacija: 'Maribor, Fakulteta za računalništvo',
                maxUdelezenci: 30
            },
            {
                ime: 'Startup networking',
                opis: 'Mreženje mladih podjetnikov',
                datum: '2025-12-05',
                cas: '18:00',
                lokacija: 'Celje, Poslovna cona',
                maxUdelezenci: 50
            }
        ];

        testEvents.forEach(event => {
            db.run(`INSERT OR IGNORE INTO events (ime, opis, datum, cas, lokacija, maxUdelezenci, organizator_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [event.ime, event.opis, event.datum, event.cas, event.lokacija, event.maxUdelezenci, 1], 
                function(err) {
                    if (err) {
                        console.error('Napaka pri ustvarjanju dogodka:', err.message);
                    } else if (this.changes > 0) {
                        console.log(`✓ Testni dogodek ustvarjen: ${event.ime}`);
                    } else {
                        console.log(`→ Testni dogodek že obstaja: ${event.ime}`);
                    }
                }
            );
        });

        console.log('\n🎉 Baza podatkov je uspešno inicializirana!');
        console.log('\nPrijavni podatki:');
        console.log('Admin: admin@eventmanager.si / admin123');
        console.log('Testni uporabniki: janez@test.si, maja@test.si, peter@test.si / test123');
        
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Povezava z bazo je zaprta.');
        });
    }, 1000); // Počakaj 1 sekundo, da se uporabniki ustvarijo
});