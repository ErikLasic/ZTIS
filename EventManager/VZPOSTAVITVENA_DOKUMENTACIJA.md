# EventManager - Vzpostavitvena dokumentacija

**Naziv projekta:** EventManager – sistem za prijavo na dogodke  
**Avtor:** Erik  
**Predmet:** Zanesljivost in testiranje informacijskih sistemov  

---

## 1. Opis projekta

EventManager je spletna aplikacija, ki omogoča ustvarjanje in upravljanje dogodkov. Uporabniki se lahko registrirajo, prijavljajo na dogodke ter jih urejajo. Projekt je zasnovan z namenom omogočiti testiranje zanesljivosti, validacije in pravilnosti informacijskega sistema.

Sistem omogoča organizatorjem dogodkov enostavno upravljanje prijav, udeležencem pa pregledno iskanje in prijavljanje na zanimive dogodke. Vključuje tudi administratorski panel za nadzor celotnega sistema.

---

## 2. Uporabljene tehnologije

| Komponenta | Tehnologija | Verzija |
|------------|-------------|---------|
| **Programski jezik** | JavaScript (Node.js) | Node.js 18+ |
| **Okvir (framework)** | Express.js | ^4.18.2 |
| **Baza podatkov** | SQLite | ^5.1.6 |
| **Avtentikacija** | Express Session + bcrypt | ^1.17.3, ^5.1.1 |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | - |
| **Razvojno okolje** | Visual Studio Code | - |

### Ključne odvisnosti:
- **express**: Spletni okvir za Node.js
- **sqlite3**: SQLite driver za Node.js
- **express-session**: Middleware za upravljanje sej
- **bcrypt**: Knjižnica za hash-iranje gesel
- **body-parser**: Middleware za razčlenjevanje HTTP zahtev
- **nodemon**: Razvojna odvisnost za avtomatsko osvežitev (dev)

---

## 3. Navodila za vzpostavitev

### Predpogoji
- Node.js (verzija 18 ali novejša)
- npm (Node Package Manager)
- Git (opcijsko)

### Korak za korakom:

#### 1. Namestitev odvisnosti
```bash
npm install
```
Ta ukaz bo namestil vse potrebne Node.js pakete, navedene v `package.json`.

#### 2. Inicializacija baze podatkov
```bash
npm run init-db
```
Ali direktno:
```bash
node init-db.js
```

Ta korak ustvari:
- SQLite bazo podatkov (`database.db`)
- Tabele: `users`, `events`, `registrations`
- Testne uporabnike in dogodke
- Administratorskega uporabnika

#### 3. Zagon aplikacije

**Produkcijski način:**
```bash
npm start
```

**Razvojni način (z avtomatskim osveževanjem):**
```bash
npm run dev
```

#### 4. Dostop do aplikacije
Odpri spletni brskalnik in pojdi na:
```
http://localhost:3000
```

---

## 4. Struktura projekta

```
EventManager/
├── public/                 # Statične datoteke (frontend)
│   ├── css/
│   │   └── style.css      # Glavni CSS
│   ├── js/
│   │   ├── common.js      # Skupne JS funkcije
│   │   ├── dashboard.js   # Dashboard funkcionalnost
│   │   └── admin.js       # Admin funkcionalnost
│   ├── index.html         # Domača stran
│   ├── login.html         # Prijavna stran
│   ├── register.html      # Registracijska stran
│   ├── dashboard.html     # Glavna nadzorna plošča
│   ├── admin.html         # Admin panel
│   └── 404.html          # Stran za napake
├── routes/                # Express rute
│   ├── auth.js           # Avtentikacija (prijava/registracija)
│   ├── events.js         # Upravljanje dogodkov
│   └── admin.js          # Admin funkcionalnosti
├── middleware/           # Express middleware (rezervirano)
├── server.js            # Glavni strežniški file
├── init-db.js          # Inicializacija baze podatkov
├── package.json        # NPM konfiguracija in odvisnosti
├── README.md           # Osnovna dokumentacija
└── database.db         # SQLite baza (ustvari se ob prvi uporabi)
```

---

## 5. Ključne funkcionalnosti

| Št. | Funkcionalnost | Kratek opis |
|-----|---------------|-------------|
| 1   | **Registracija uporabnika** | Ustvari novega uporabnika in shrani v bazo |
| 2   | **Prijava uporabnika** | Omogoča dostop do sistema z email/geslo |
| 3   | **Dodajanje dogodka** | Organizator vnese ime, datum, opis in lokacijo |
| 4   | **Pregled dogodkov** | Prikaz vseh aktivnih dogodkov z možnostjo filtriranja |
| 5   | **Iskanje dogodkov** | Filtriranje po imenu, lokaciji ali datumu |
| 6   | **Prijava na dogodek** | Uporabnik se prijavi na izbran dogodek |
| 7   | **Seznam prijavljenih** | Organizator vidi prijavljene osebe na svoje dogodke |
| 8   | **Urejanje/brisanje dogodkov** | Možno le za organizatorja dogodka ali admin |
| 9   | **Email obvestilo** | Simulacija pošiljanja potrditve (admin funkcija) |
| 10  | **Administrator panel** | Pregled vseh uporabnikov, dogodkov in sistemskih statistik |

---

## 6. Testni dostopi

Po inicializaciji baze podatkov so na voljo naslednji testni računi:

### Administrator
- **Email:** `admin@eventmanager.si`
- **Geslo:** `admin123`
- **Pravice:** Polne administratorske pravice

### Testni uporabniki
- **Email:** `janez@test.si` | **Geslo:** `test123`
- **Email:** `maja@test.si` | **Geslo:** `test123`  
- **Email:** `peter@test.si` | **Geslo:** `test123`

---

## 7. API končne točke

### Avtentikacija (`/api/auth/`)
- `POST /register` - Registracija novega uporabnika
- `POST /login` - Prijava uporabnika
- `POST /logout` - Odjava uporabnika
- `GET /status` - Preveri stanje prijave

### Dogodki (`/api/events/`)
- `GET /` - Seznam vseh dogodkov (z iskanjem)
- `GET /:id` - Podrobnosti dogodka
- `POST /` - Ustvari nov dogodek
- `PUT /:id` - Posodobi dogodek
- `DELETE /:id` - Izbriši dogodek
- `POST /:id/register` - Prijavi se na dogodek
- `DELETE /:id/register` - Odjavi se z dogodka
- `GET /:id/registrations` - Seznam prijavljenih (samo organizator)
- `GET /my/events` - Moji dogodki
- `GET /my/registrations` - Moje prijave

### Admin (`/api/admin/`)
- `GET /users` - Seznam vseh uporabnikov
- `GET /events` - Seznam vseh dogodkov
- `GET /registrations` - Seznam vseh prijav
- `GET /stats` - Sistemske statistike
- `PUT /users/:id/admin` - Posodobi admin pravice
- `DELETE /events/:id` - Forsiraj izbris dogodka
- `POST /send-notifications/:eventId` - Pošlji obvestila

---

## 8. Varnost

- **Gesla:** Hash-irana z bcrypt algoritmom
- **Seje:** Varno upravljanje z express-session
- **Validacija:** Strežniška validacija vseh vnosov
- **Avtorizacija:** Preverjanje pravic za vse zaščitene operacije
- **XSS zaščita:** Escape-iranje HTML vsebin

---

## 9. Baza podatkov

### Tabela `users`
- `id` (INTEGER, PRIMARY KEY)
- `email` (TEXT, UNIQUE, NOT NULL)
- `geslo` (TEXT, NOT NULL) - hash-irano
- `ime` (TEXT, NOT NULL)
- `priimek` (TEXT, NOT NULL)
- `isAdmin` (BOOLEAN, DEFAULT 0)
- `ustvarjen` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Tabela `events`
- `id` (INTEGER, PRIMARY KEY)
- `ime` (TEXT, NOT NULL)
- `opis` (TEXT)
- `datum` (DATE, NOT NULL)
- `cas` (TIME)
- `lokacija` (TEXT, NOT NULL)
- `maxUdelezenci` (INTEGER)
- `organizator_id` (INTEGER, FK -> users.id)
- `ustvarjen` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `aktiven` (BOOLEAN, DEFAULT 1)

### Tabela `registrations`
- `id` (INTEGER, PRIMARY KEY)
- `user_id` (INTEGER, FK -> users.id)
- `event_id` (INTEGER, FK -> events.id)
- `prijavljen` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `status` (TEXT, DEFAULT 'potrjena')

---

## 10. Morebitne težave in rešitve

### Napaka: "Cannot find module"
**Rešitev:** Zagotovi, da so nameščene vse odvisnosti z `npm install`

### Napaka: "Database locked"
**Rešitev:** Zapri aplikacijo in znova zaženi. SQLite včasih zaklene datoteko.

### Port 3000 je zaseden
**Rešitev:** Spremeni port v `server.js` ali ustavi drugo aplikacijo na tem portu.

### Gesla se ne ujemajo pri registraciji
**Rešitev:** Preveri JavaScript konzolo v brskalniku za napake.

---

## 11. Dodatne funkcionalnosti za razvoj

Sistem je pripravljen za dodajanje novih funkcionalnosti:
- Email obvestila (trenutno simulirana)
- Plačilni sistem za dogodki
- Koledarske integracije
- Mobilna aplikacija
- Real-time chat
- Ocenjevanje dogodkov

---

**Projekt je pripravljen za testiranje zanesljivosti in funkcionalnosti v okviru predmeta ZTIS.**