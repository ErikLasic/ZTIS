# EventManager – Testni primeri za funkcionalno testiranje

**Projekt:** EventManager – sistem za prijavo na dogodke  
**Avtor:** Erik  
**Predmet:** Zanesljivost in testiranje informacijskih sistemov  
**Datum:** Oktober 2025

---

## Pregled testnih primerov

| ID | Naziv testnega primera | Pokrita funkcionalnost | Prioriteta |
|----|------------------------|------------------------|------------|
| TC-01 | Registracija novega uporabnika | F1: Registracija uporabnika | Visoka |
| TC-02 | Prijava uporabnika z veljavnimi podatki | F2: Prijava uporabnika | Visoka |
| TC-03 | Ustvarjanje novega dogodka | F3: Dodajanje dogodka | Visoka |
| TC-04 | Prijava na dogodek in preverjanje kapacitete | F6: Prijava na dogodek | Srednja |
| TC-05 | Administracija uporabnikov in dodelitev admin pravic | F10: Administrator panel | Srednja |

---

## TC-01: Registracija novega uporabnika

### Osnovni podatki
- **ID:** TC-01
- **Naziv:** Registracija novega uporabnika z veljavnimi podatki
- **Opis:** Preveri, da se nov uporabnik lahko uspešno registrira v sistem z veljavnimi podatki in da so vsi podatki pravilno shranjeni v bazo.
- **Prioriteta:** Visoka
- **Tip:** Pozitiven test
- **Zahtevana funkcionalnost:** F1 – Registracija uporabnika

### Predpogoji
- Aplikacija EventManager teče na `http://localhost:3000`
- Baza podatkov je inicializirana
- Testni uporabnik s testnim emailom še ne obstaja v bazi
- Brskalnik je odprt in dostopa do registracijske strani

### Testni podatki
| Polje | Vrednost |
|-------|----------|
| Ime | Ana |
| Priimek | Testna |
| Email | ana.testna@test.si |
| Geslo | Test1234! |
| Potrdi geslo | Test1234! |

### Koraki testiranja
1. Odpri registracijsko stran: `http://localhost:3000/register`
2. Vnesi ime: "Ana"
3. Vnesi priimek: "Testna"
4. Vnesi email: "ana.testna@test.si"
5. Vnesi geslo: "Test1234!"
6. Vnesi potrditev gesla: "Test1234!"
7. Klikni gumb "Registriraj se"

### Pričakovani rezultat
- Sistem prikaže sporočilo "Uspešna registracija! Preusmerjam na prijavo..."
- Uporabnik je preusmerjen na prijavno stran (`/login`)
- V bazi podatkov (tabela `users`) se ustvari nov vnos z:
  - Email: ana.testna@test.si
  - Ime: Ana
  - Priimek: Testna
  - Geslo: hash-irano z bcrypt
  - isAdmin: 0 (false)
  - Polje `ustvarjen` vsebuje trenutni časovni žig

### Dejanski rezultat
_(izpolni po izvedbi testa)_

### Status
_(izpolni: PASSED / FAILED / BLOCKED)_

### Opombe
- Preveri, da geslo ni shranjeno v čisti obliki (plain text)
- Če se test izvaja večkrat, pred ponovnim testom izbriši testnega uporabnika iz baze ali uporabi nov email

---

## TC-02: Prijava uporabnika z veljavnimi podatki

### Osnovni podatki
- **ID:** TC-02
- **Naziv:** Prijava obstoječega uporabnika z veljavnimi prijavljenimi podatki
- **Opis:** Preveri, da se registriran uporabnik lahko prijavi z veljavnim emailom in geslom ter pridobi dostop do dashboarda.
- **Prioriteta:** Visoka
- **Tip:** Pozitiven test
- **Zahtevana funkcionalnost:** F2 – Prijava uporabnika

### Predpogoji
- Aplikacija EventManager teče na `http://localhost:3000`
- Baza podatkov vsebuje testnega uporabnika:
  - Email: `janez@test.si`
  - Geslo: `test123`
- Uporabnik ni prijavljen (seje ni aktivne)

### Testni podatki
| Polje | Vrednost |
|-------|----------|
| Email | janez@test.si |
| Geslo | test123 |

### Koraki testiranja
1. Odpri prijavno stran: `http://localhost:3000/login`
2. Vnesi email: "janez@test.si"
3. Vnesi geslo: "test123"
4. Klikni gumb "Prijava"

### Pričakovani rezultat
- Sistem prikaže sporočilo "Uspešna prijava!"
- Uporabnik je preusmerjen na dashboard stran (`/dashboard`)
- V navigacijskem meniju se prikaže ime uporabnika: "Janez Novak"
- Navigacija vsebuje povezave: "Domov", "Dogodki" (ne pa "Prijava" ali "Registracija")
- V session storage je shranjena seja uporabnika (userId in isAdmin)
- Uporabnik lahko dostopa do zaščitenih strani (dashboard, dogodki)

### Dejanski rezultat
_(izpolni po izvedbi testa)_

### Status
_(izpolni: PASSED / FAILED / BLOCKED)_

### Opombe
- Negativni scenarij (napačno geslo) lahko testiramo ločeno v TC-02-NEG
- Preveri, da seja poteče po 24 urah (cookie maxAge)

---

## TC-03: Ustvarjanje novega dogodka

### Osnovni podatki
- **ID:** TC-03
- **Naziv:** Uspešno ustvarjanje novega dogodka z vsemi obveznimi in opcijskimi polji
- **Opis:** Preveri, da prijavljen uporabnik lahko ustvari nov dogodek z imenom, datumom, časom, lokacijo, opisom in maksimalnim številom udeležencev.
- **Prioriteta:** Visoka
- **Tip:** Pozitiven test
- **Zahtevana funkcionalnost:** F3 – Dodajanje dogodka

### Predpogoji
- Aplikacija EventManager teče
- Uporabnik je prijavljen (npr. janez@test.si / test123)
- Uporabnik je na strani `/dashboard`
- Datum dogodka je v prihodnosti (vsaj 1 dan naprej)

### Testni podatki
| Polje | Vrednost |
|-------|----------|
| Ime dogodka | Testni seminar o varnosti |
| Opis | Seminar o osnovah kibernetske varnosti za začetnike |
| Datum | 2025-11-20 |
| Čas | 15:00 |
| Lokacija | Ljubljana, FRI |
| Maks. število udeležencev | 25 |

### Koraki testiranja
1. Prijavljen uporabnik odpre dashboard (`/dashboard`)
2. Klikni gumb "+ Nov dogodek"
3. V modalnem oknu "Nov dogodek" vnesi:
   - Ime dogodka: "Testni seminar o varnosti"
   - Opis: "Seminar o osnovah kibernetske varnosti za začetnike"
   - Datum: "2025-11-20"
   - Čas: "15:00"
   - Lokacija: "Ljubljana, FRI"
   - Maksimalno število udeležencev: "25"
4. Klikni gumb "Shrani"

### Pričakovani rezultat
- Sistem prikaže zeleno obvestilo: "Dogodek uspešno ustvarjen"
- Modalno okno se zapre
- Zavihek "Moji dogodki" prikaže novo ustvarjen dogodek:
  - Ime: "Testni seminar o varnosti"
  - Datum: sreda, 20. november 2025 ob 15:00
  - Lokacija: Ljubljana, FRI
  - Prijavljenih: 0/25
- V bazi podatkov (tabela `events`) se ustvari nov vnos z:
  - ime: "Testni seminar o varnosti"
  - opis, datum, cas, lokacija, maxUdelezenci kot vnešeni
  - organizator_id: ID prijavljenega uporabnika
  - aktiven: 1
  - Polje `ustvarjen` vsebuje trenutni časovni žig
- API klic `POST /api/events` vrne status 200 in `{ success: true, message: "...", eventId: <ID> }`

### Dejanski rezultat
_(izpolni po izvedbi testa)_

### Status
_(izpolni: PASSED / FAILED / BLOCKED)_

### Opombe
- Če uporabnik vnese datum v preteklosti, sistem mora zavrniti zahtevo s sporočilom "Datum dogodka mora biti v prihodnosti"
- Maksimalno število udeležencev je opcijsko polje

---

## TC-04: Prijava na dogodek in preverjanje kapacitete

### Osnovni podatki
- **ID:** TC-04
- **Naziv:** Prijava uporabnika na dogodek in preverjanje omejitve kapacitete
- **Opis:** Preveri, da se uporabnik lahko prijavi na prihajajoč dogodek, da se števec prijavljenih posodobi in da sistem prepreči prijavo, ko je dogodek poln.
- **Prioriteta:** Srednja
- **Tip:** Pozitiven in negativen test (mejni pogoj)
- **Zahtevana funkcionalnost:** F6 – Prijava na dogodek, F4 – Pregled dogodkov

### Predpogoji
- Aplikacija EventManager teče
- V bazi obstaja prihajajoč dogodek z maksimalno kapaciteto 2 osebi (ID = X)
- Uporabnik A (janez@test.si) je prijavljen
- Uporabnik B (maja@test.si) in Uporabnik C (peter@test.si) sta na voljo za testiranje
- Nihče še ni prijavljen na ta dogodek

### Testni podatki
| Uporabnik | Email | Geslo | Akcija |
|-----------|-------|-------|--------|
| A | janez@test.si | test123 | Prva prijava |
| B | maja@test.si | test123 | Druga prijava |
| C | peter@test.si | test123 | Tretja prijava (nad kapaciteto) |

### Koraki testiranja
1. **Uporabnik A:** Prijavi se kot janez@test.si
2. Odpri zavihek "Vsi dogodki"
3. Poišči testni dogodek (z max. 2 udeleženca)
4. Klikni gumb "Prijavite se"
5. Preveri, da se prikaže sporočilo "Uspešno ste se prijavili na dogodek"
6. Preveri, da kartica dogodka sedaj kaže:
   - Gumb "Odjavi se" namesto "Prijavite se"
   - "✅ Prijavljeni"
   - Prijavljenih: 1/2
7. Odjavi se iz računa
8. **Uporabnik B:** Prijavi se kot maja@test.si
9. Ponovi korake 2–6 (sedaj mora kazati Prijavljenih: 2/2)
10. Odjavi se
11. **Uporabnik C:** Prijavi se kot peter@test.si
12. Odpri isti dogodek
13. Poskusi klikniti gumb "Prijavite se"

### Pričakovani rezultat
- **Po koraku 5 (Uporabnik A):**
  - Sporočilo: "Uspešno ste se prijavili na dogodek"
  - Števec: "Prijavljenih: 1/2"
  - Gumb: "Odjavi se", oznaka "✅ Prijavljeni"
- **Po koraku 9 (Uporabnik B):**
  - Sporočilo: "Uspešno ste se prijavili na dogodek"
  - Števec: "Prijavljenih: 2/2"
  - Gumb: "Odjavi se", oznaka "✅ Prijavljeni"
- **Po koraku 13 (Uporabnik C):**
  - Gumb "Prijavite se" je onemogočen ali ni viden
  - Pri poskusu prijave sistem prikaže rdeče sporočilo: "Dogodek je že poln"
  - API vrne status 400 z `{ error: "Dogodek je že poln" }`
  - V bazi ni vnosa za uporabnika C pri tem dogodku

### Dejanski rezultat
_(izpolni po izvedbi testa)_

### Status
_(izpolni: PASSED / FAILED / BLOCKED)_

### Opombe
- Ta test preverja tudi funkcionalnost F4 (Pregled dogodkov) – posodobitev števca v realnem času
- Preveri, da se po odjavi enega uporabnika prostor sprosti in Nov uporabnik se lahko prijavi

---

## TC-05: Administracija uporabnikov in dodelitev admin pravic

### Osnovni podatki
- **ID:** TC-05
- **Naziv:** Admin dodeli administratorske pravice običajnemu uporabniku
- **Opis:** Preveri, da lahko administrator preko admin panela pregleda vse uporabnike in dodeli ali odvzame admin pravice drugemu uporabniku.
- **Prioriteta:** Srednja
- **Tip:** Pozitiven test
- **Zahtevana funkcionalnost:** F10 – Administrator panel

### Predpogoji
- Aplikacija EventManager teče
- Admin uporabnik je prijavljen:
  - Email: admin@eventmanager.si
  - Geslo: admin123
- V bazi obstaja navaden uporabnik (npr. janez@test.si) z `isAdmin = 0`

### Testni podatki
| Uporabnik | Email | Geslo | Začetna vloga |
|-----------|-------|-------|---------------|
| Admin | admin@eventmanager.si | admin123 | Administrator |
| Janez | janez@test.si | test123 | Običajen uporabnik |

### Koraki testiranja
1. Prijavi se kot admin (admin@eventmanager.si / admin123)
2. V navigacijskem meniju klikni "Admin" (ta link je viden samo admin uporabnikom)
3. Odpre se admin nadzorna plošča (`/admin`)
4. Klikni na zavihek "Uporabniki"
5. V tabeli poišči uporabnika "Janez Novak" (janez@test.si)
6. Preveri, da v stolpcu "Admin" piše "Ne" (ali gumb je označen kot "btn-secondary")
7. Klikni gumb "Dodeli admin" pri uporabniku Janez Novak
8. Potrdi akcijo (če se prikaže potrditveno okno)
9. Počakaj na odziv sistema

### Pričakovani rezultat
- Sistem prikaže zeleno sporočilo: "Uporabniške pravice uspešno dodeljene"
- Tabela se osveži
- Pri uporabniku Janez Novak se v stolpcu "Admin" prikaže "Da" (ali gumb je označen kot "btn-success")
- Gumb se spremeni v "Odvzemi admin"
- V bazi podatkov (tabela `users`) se za uporabnika janez@test.si posodobi polje `isAdmin` na 1
- API klic `PUT /api/admin/users/:id/admin` vrne status 200 z `{ success: true, message: "..." }`
- Če se Janez sedaj prijavi, v navigaciji vidi povezavo "Admin"

### Dejanski rezultat
_(izpolni po izvedbi testa)_

### Status
_(izpolni: PASSED / FAILED / BLOCKED)_

### Opombe
- Testiramo lahko tudi negativen scenarij: Admin poskuša sam sebi odvzeti pravice → sistem mora vrniti napako "Ne morete si sami odvzeti admin pravic"
- Admin panel prikazuje tudi statistike (skupaj uporabnikov, dogodkov, prijav) – preveri njihovo pravilnost

---

## Povzetek in opombe

### Pokritost funkcionalnosti
Testni primeri pokrivajo **5 od 10 ključnih funkcionalnosti** sistema EventManager:
- ✅ F1: Registracija uporabnika (TC-01)
- ✅ F2: Prijava uporabnika (TC-02)
- ✅ F3: Dodajanje dogodka (TC-03)
- ✅ F4: Pregled dogodkov (TC-04, delno)
- ✅ F6: Prijava na dogodek (TC-04)
- ✅ F10: Administrator panel (TC-05)

### Priporočila za nadaljnje testiranje
- **TC-06:** Iskanje dogodkov po imenu, lokaciji in datumu (F5)
- **TC-07:** Urejanje in brisanje dogodkov (F8)
- **TC-08:** Pregled seznama prijavljenih uporabnikov na dogodek (F7)
- **TC-09:** Simulacija pošiljanja email obvestil (F9)
- **TC-10:** Negativni testi (napačna gesla, prazna polja, SQL injection, XSS)

### Testno okolje
- **OS:** Windows 10/11
- **Brskalnik:** Google Chrome (najnovejša verzija) ali Firefox
- **Node.js:** 18+
- **Baza:** SQLite (database.db)

### Avtomatizacija
Testni primeri so trenutno namenjeni ročnemu testiranju. Za avtomatizacijo priporočamo:
- **End-to-end:** Playwright ali Cypress
- **API testi:** Supertest + Jest/Mocha
- **Unit testi:** Jest za posamezne module (auth, events, admin)

---

**Datum priprave:** Oktober 2025  
**Pripravil:** Erik  
**Verzija:** 1.0
