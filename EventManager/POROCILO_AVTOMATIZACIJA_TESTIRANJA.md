# Poročilo o avtomatizaciji testiranja

## Naloga 7 - Avtomatizacija testiranja
**Predmet:** ZTIS  
**Avtor:** Erik Lasic  
**Datum:** 30. november 2025  
**Aplikacija:** EventManager - Sistem za vodenje prijav na dogodke

---

## 1. Izbrani nivo in vrsta testiranja

**Nivo:** Funkcionalno testiranje spletne aplikacije (E2E)  
**Vrsta:** Avtomatizirano funkcionalno testiranje  
**Maksimalno število točk:** 100

### Utemeljitev izbire
Izbral sem avtomatizacijo funkcionalnega testiranja spletne aplikacije, ker:
- Omogoča testiranje celotnega uporabniškega toka (end-to-end)
- Simulira realno uporabniško interakcijo z aplikacijo
- Odkriva napake na nivoju integracije med frontend in backend
- Zagotavlja regresijsko testiranje ob spremembah kode

---

## 2. Izbrano orodje

### Playwright
**Verzija:** @playwright/test (najnovejša)  
**Uradna stran:** https://playwright.dev

### Zakaj Playwright?
| Prednost | Opis |
|----------|------|
| **Moderno orodje** | Razvito s strani Microsoft, aktivno vzdrževano |
| **Hitrost** | Hitrejši od Selenium, podpira vzporedno izvajanje |
| **Zanesljivost** | Avtomatsko čakanje na elemente, manj flaky testov |
| **Podpora brskalnikom** | Chromium, Firefox, WebKit v enem orodju |
| **Vgrajeni reporterji** | HTML, JSON, JUnit poročila brez dodatne konfiguracije |
| **TypeScript podpora** | Močno tipiziran, boljša IDE podpora |
| **Debugging** | UI mode, trace viewer, video posnetki |

---

## 3. Testni primeri

Pripravil sem **3 testne primere** z **17 posameznimi testi**, ki pokrivajo ključne funkcionalnosti aplikacije:

### Testni primer 1: Registracija uporabnika
**Datoteka:** `tests/01-registracija.spec.ts`  
**Število testov:** 4

| Test | Vrsta | Opis |
|------|-------|------|
| 1.1 | Negativni | Validacija praznih polj - sistem ne dovoli oddaje praznega obrazca |
| 1.2 | Negativni | Validacija prekratkega gesla (< 6 znakov) |
| 1.3 | Pozitivni | Uspešna registracija z veljavnimi podatki |
| 1.4 | Negativni | Preverjanje duplikatnih email naslovov |

**Kompleksnost:** Srednja  
**Pokritost:** Registracijski obrazec, validacija, preusmeritev

---

### Testni primer 2: Prijava in upravljanje dogodkov
**Datoteka:** `tests/02-prijava-dogodki.spec.ts`  
**Število testov:** 7

| Test | Vrsta | Opis |
|------|-------|------|
| 2.1 | Negativni | Neuspešna prijava z napačnim geslom |
| 2.2 | Pozitivni | Uspešna prijava z veljavnimi podatki |
| 2.3 | Pozitivni | Pregled seznama dogodkov |
| 2.4 | Pozitivni | Prijava in odjava z dogodka |
| 2.5 | Pozitivni | Pregled zavihka "Moje prijave" |
| 2.6 | Pozitivni | Iskanje dogodkov po ključni besedi |
| 2.7 | Pozitivni | Odjava iz sistema |

**Kompleksnost:** Visoka  
**Pokritost:** Avtentikacija, seznam dogodkov, prijave, iskanje, odjava

---

### Testni primer 3: Admin upravljanje z dogodki
**Datoteka:** `tests/03-admin-upravljanje.spec.ts`  
**Število testov:** 6

| Test | Vrsta | Opis |
|------|-------|------|
| 3.1 | Pozitivni | Dostop do admin panela |
| 3.2 | Pozitivni | Ustvarjanje novega dogodka |
| 3.3 | Pozitivni | Urejanje obstoječega dogodka |
| 3.4 | Pozitivni | Pregled admin statistik |
| 3.5 | Pozitivni | Brisanje dogodka |
| 3.6 | Negativni | Preverjanje dostopa - navaden uporabnik ne more dostopati admin panel |

**Kompleksnost:** Visoka  
**Pokritost:** Admin pravice, CRUD operacije na dogodkih, avtorizacija

---

## 4. Rezultati testiranja

### Povzetek izvajanja
```
Running 17 tests using 1 worker

✓  1 › 1.1 Validacija - prazna polja prikazujejo napako
✓  2 › 1.2 Validacija - prekratko geslo
✓  3 › 1.3 Uspešna registracija z veljavnimi podatki
✓  4 › 1.4 Validacija - obstoječi email
✓  5 › 2.1 Neuspešna prijava - napačno geslo
✓  6 › 2.2 Uspešna prijava z veljavnimi podatki
✓  7 › 2.3 Pregled seznama dogodkov
✓  8 › 2.4 Prijava in odjava z dogodka
✓  9 › 2.5 Pregled zavihka Moje prijave
✓ 10 › 2.6 Iskanje dogodkov
✓ 11 › 2.7 Odjava iz sistema
✓ 12 › 3.1 Dostop do admin panela
✓ 13 › 3.2 Ustvarjanje novega dogodka
✓ 14 › 3.3 Urejanje obstoječega dogodka
✓ 15 › 3.4 Pregled admin statistik
✓ 16 › 3.5 Brisanje dogodka
✓ 17 › 3.6 Preverjanje dostopa - navaden uporabnik ne more dostopati admin

17 passed (51.8s)
```

### Statistika
| Metrika | Vrednost |
|---------|----------|
| Skupaj testov | 17 |
| Uspešnih | 17 |
| Neuspešnih | 0 |
| Preskočenih | 0 |
| Čas izvajanja | ~52 sekund |
| Uspešnost | 100% |

---

## 5. Struktura projekta

```
EventManager/
├── tests/
│   ├── 01-registracija.spec.ts      # Testni primer 1
│   ├── 02-prijava-dogodki.spec.ts   # Testni primer 2
│   └── 03-admin-upravljanje.spec.ts # Testni primer 3
├── playwright.config.ts              # Playwright konfiguracija
├── playwright-report/                # HTML poročilo
└── test-results/                     # Screenshots, videos
```

---

## 6. Zagon testov

### Predpogoji
- Node.js 18+
- npm

### Namestitev
```bash
npm install
npx playwright install
```

### Zagon testov
```bash
# Inicializacija baze (če še ni)
npm run init-db

# Zagon vseh testov
npm test

# Zagon testov z UI (interaktivni način)
npm run test:ui

# Prikaz HTML poročila
npm run test:report
```

### Zagon posameznega testa
```bash
# Samo testni primer 1
npx playwright test 01-registracija

# Samo testni primer 2
npx playwright test 02-prijava-dogodki

# Samo testni primer 3
npx playwright test 03-admin-upravljanje
```

---

## 7. Konfiguracija Playwright

Konfiguracija v `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run server',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Ključne nastavitve:
- **baseURL:** Avtomatsko doda prefix vsem `page.goto()` klicem
- **webServer:** Samodejno zažene strežnik pred izvajanjem testov
- **screenshot/video:** Shranjuje dokaze ob neuspešnih testih
- **trace:** Omogoča debugging z trace viewer

---

## 8. Pokritost funkcionalnosti

| Funkcionalnost | Pokrita | Testni primer |
|----------------|---------|---------------|
| Registracija uporabnika | ✅ | 1 |
| Prijava uporabnika | ✅ | 2 |
| Odjava uporabnika | ✅ | 2 |
| Pregled dogodkov | ✅ | 2 |
| Iskanje dogodkov | ✅ | 2 |
| Prijava na dogodek | ✅ | 2 |
| Odjava z dogodka | ✅ | 2 |
| Admin panel dostop | ✅ | 3 |
| Ustvarjanje dogodka | ✅ | 3 |
| Urejanje dogodka | ✅ | 3 |
| Brisanje dogodka | ✅ | 3 |
| Avtorizacija (admin/user) | ✅ | 3 |

---

## 9. Zaključek

Uspešno sem avtomatiziral funkcionalno testiranje spletne aplikacije EventManager z orodjem Playwright. Pripravil sem 3 testne primere s skupno 17 testi, ki pokrivajo vse ključne funkcionalnosti aplikacije:

1. **Registracija** - validacija vnosnih polj in uspešna registracija
2. **Prijava in dogodki** - avtentikacija in upravljanje s prijavami na dogodke
3. **Admin funkcionalnosti** - CRUD operacije in preverjanje pravic dostopa

Vsi testi so uspešno prestali izvajanje, kar potrjuje pravilno delovanje aplikacije.

### Prednosti avtomatizacije:
- ⏱️ **Hitrost:** 17 testov v ~52 sekundah
- 🔄 **Ponovljivost:** Enaki testi ob vsaki spremembi kode
- 📊 **Dokumentacija:** HTML poročila s screenshoti
- 🐛 **Debugging:** Video posnetki in trace ob napakah
- ✅ **Regresija:** Avtomatsko preverjanje ob novih spremembah

---

## 10. Dokumentacija vzpostavitve

### 10.1 Predpogoji
- **Node.js** verzija 18 ali novejša (priporočeno LTS)
- **npm** (priložen Node.js)
- **Git** za kloniranje repozitorija

### 10.2 Namestitev aplikacije

```bash
# 1. Kloniranje repozitorija
git clone https://github.com/ErikLasic/ZTIS.git
cd ZTIS/EventManager

# 2. Namestitev odvisnosti
npm install

# 3. Inicializacija podatkovne baze
npm run init-db

# 4. Zagon aplikacije
npm start
```

Aplikacija je dostopna na: **http://localhost:3000**

### 10.3 Testni uporabniki

| Vloga | Email | Geslo |
|-------|-------|-------|
| Administrator | admin@eventmanager.si | admin123 |
| Navaden uporabnik | test@test.si | test123 |

### 10.4 Zagon avtomatiziranih testov

```bash
# 1. Namestitev Playwright brskalnikov (enkratno)
npx playwright install

# 2. Zagon vseh testov
npm test

# 3. Zagon testov v interaktivnem UI načinu
npm run test:ui

# 4. Prikaz HTML poročila po končanih testih
npm run test:report
```

### 10.5 Struktura npm skriptov

| Ukaz | Opis |
|------|------|
| `npm start` | Zažene aplikacijo |
| `npm run server` | Zažene samo strežnik (brez init) |
| `npm run init-db` | Inicializira podatkovno bazo |
| `npm test` | Požene vse Playwright teste |
| `npm run test:ui` | Odpre interaktivni UI za testiranje |
| `npm run test:report` | Prikaže HTML poročilo testov |

### 10.6 Pomembne opombe

1. **Pred zagonom testov** se mora podatkovna baza inicializirati z `npm run init-db`
2. **Playwright avtomatsko zažene strežnik** pred izvajanjem testov (konfigurirano v `playwright.config.ts`)
3. **Testi se izvajajo zaporedno** (1 worker), ker delijo isto podatkovno bazo
4. **Video posnetki in screenshoti** se shranijo v `test-results/` ob neuspelih testih

---

## 11. Viri

- Playwright dokumentacija: https://playwright.dev/docs/intro
- EventManager aplikacija: Projekt za predmet ZTIS
- Node.js: https://nodejs.org/

---

**Datum oddaje:** 30. november 2025  
**Avtor:** Erik Lasic
