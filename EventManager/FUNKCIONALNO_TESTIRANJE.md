# Funkcionalno testiranje – EventManager

**Avtor:** Erik Lasic  
**Predmet:** Zanesljivost in testiranje informacijskih sistemov  
**Datum:** Oktober 2025

---

## 1. Opis projekta

EventManager je spletna aplikacija za upravljanje in prijavljanje na dogodke, razvita z namenom omogočiti testiranje zanesljivosti in funkcionalnosti informacijskega sistema. Sistem omogoča registracijo uporabnikov, ustvarjanje dogodkov, prijavljanje na dogodke ter administratorski nadzor nad celotnim sistemom.

### Uporabljene tehnologije
- **Backend:** Node.js z Express.js okvirom
- **Baza podatkov:** SQLite
- **Avtentikacija:** Express Session + bcrypt (hash-iranje gesel)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

### Ključne funkcionalnosti sistema
Sistem vsebuje naslednje glavne funkcionalnosti:

1. **Registracija uporabnika** – Ustvarjanje novega uporabniškega računa
2. **Prijava uporabnika** – Dostop do sistema z email in geslom
3. **Dodajanje dogodka** – Organizator lahko ustvari nov dogodek
4. **Pregled dogodkov** – Prikaz vseh aktivnih dogodkov s filtriranjem
5. **Iskanje dogodkov** – Filtriranje po imenu, lokaciji in datumu
6. **Prijava na dogodek** – Uporabnik se lahko prijavi na izbran dogodek
7. **Seznam prijavljenih** – Organizator lahko pregleda prijavljene udeležence
8. **Urejanje/brisanje dogodkov** – Organizator lahko upravlja svoje dogodke
9. **Email obvestila** – Simulacija pošiljanja obvestil udeležencem
10. **Administrator panel** – Pregled nad uporabniki, dogodki in statistikami sistema

Za namene funkcionalnega testiranja je bilo izbranih 5 ključnih funkcionalnosti, ki predstavljajo kritične uporabniške scenarije in poslovne procese.

---

## 2. Testni primeri

### TC-01: Registracija novega uporabnika

#### Identifikacijski podatki
- **ID testnega primera:** TC-01
- **Naziv:** Registracija novega uporabnika z veljavnimi podatki
- **Pokrita funkcionalnost:** F1 – Registracija uporabnika
- **Prioriteta:** Visoka
- **Tip testa:** Pozitiven test

#### Namen testa
Namen tega testnega primera je preveriti, ali se nov uporabnik lahko uspešno registrira v sistem EventManager z vnašanjem veljavnih podatkov. Test preverja pravilnost delovanja registracijskega postopka, vključno s shranjevanjem podatkov v bazo, hash-iranjem gesla ter preusmeritvijo na prijavno stran.

#### Predpogoji
- Aplikacija EventManager teče na naslovu http://localhost:3000
- Baza podatkov je inicializirana (izvedena skripta `npm run init-db`)
- Testni uporabnik s predvidenim emailom še ne obstaja v bazi podatkov
- Spletni brskalnik je odprt in dostopa do registracijske strani

#### Testni podatki

| Polje | Vrednost |
|-------|----------|
| Ime | Ana |
| Priimek | Testna |
| Email | ana.testna@test.si |
| Geslo | Test1234! |
| Potrdi geslo | Test1234! |

#### Koraki izvajanja testa
1. V spletnem brskalniku odpri registracijsko stran: `http://localhost:3000/register`
2. V polje "Ime" vnesi vrednost: Ana
3. V polje "Priimek" vnesi vrednost: Testna
4. V polje "Email" vnesi vrednost: ana.testna@test.si
5. V polje "Geslo" vnesi vrednost: Test1234!
6. V polje "Potrdi geslo" vnesi vrednost: Test1234!
7. Klikni na gumb "Registriraj se"
8. Počakaj na odziv sistema

#### Pričakovani rezultat
- Sistem prikaže zeleno obvestilo z besedilom: "Uspešna registracija! Preusmerjam na prijavo..."
- Uporabnik je avtomatsko preusmerjen na prijavno stran (`/login`)
- V bazi podatkov (tabela `users`) je ustvarjen nov zapis z naslednjimi lastnostmi:
  - Email: ana.testna@test.si
  - Ime: Ana
  - Priimek: Testna
  - Geslo: hash-irano z bcrypt algoritmom (ni vidno v čisti obliki)
  - isAdmin: 0 (uporabnik nima administratorskih pravic)
  - Polje `ustvarjen` vsebuje trenutni časovni žig registracije
- HTTP zahteva POST `/api/auth/register` vrne status 200 z odgovorom:
  ```json
  {
    "success": true,
    "message": "Uspešna registracija"
  }
  ```

#### Dejanski rezultat
_(Polje za izpolnitev po izvedbi testa)_

#### Status testa
_(Izpolni: PASSED / FAILED / BLOCKED)_

#### Opombe
- Pred ponovnim izvajanjem testa je potrebno izbrisati testnega uporabnika iz baze ali uporabiti nov email naslov
- Preveri, da geslo v bazi podatkov ni shranjeno v čisti obliki (plain text), ampak je hash-irano
- Test lahko razširiš z negativnimi scenariji (npr. neujemajoča se gesla, neveljaven email format)

---

### TC-02: Prijava uporabnika z veljavnimi podatki

#### Identifikacijski podatki
- **ID testnega primera:** TC-02
- **Naziv:** Prijava obstoječega uporabnika z veljavnimi prijavljenimi podatki
- **Pokrita funkcionalnost:** F2 – Prijava uporabnika
- **Prioriteta:** Visoka
- **Tip testa:** Pozitiven test

#### Namen testa
Namen tega testnega primera je preveriti, ali se že registriran uporabnik lahko uspešno prijavi v sistem EventManager z uporabo veljavnega emaila in gesla. Test preverja delovanje avtentikacijskega mehanizma, ustvarjanje uporabniške seje ter dostop do zaščitenih strani aplikacije.

#### Predpogoji
- Aplikacija EventManager teče na naslovu http://localhost:3000
- V bazi podatkov obstaja testni uporabnik z naslednjimi podatki:
  - Email: janez@test.si
  - Geslo: test123
  - (Ta uporabnik je ustvarjen s skriptom `npm run init-db`)
- Uporabnik trenutno ni prijavljen (ni aktivne seje)
- Spletni brskalnik je odprt

#### Testni podatki

| Polje | Vrednost |
|-------|----------|
| Email | janez@test.si |
| Geslo | test123 |

#### Koraki izvajanja testa
1. V spletnem brskalniku odpri prijavno stran: `http://localhost:3000/login`
2. V polje "Email" vnesi vrednost: janez@test.si
3. V polje "Geslo" vnesi vrednost: test123
4. Klikni na gumb "Prijava"
5. Počakaj na odziv sistema

#### Pričakovani rezultat
- Sistem prikaže zeleno obvestilo z besedilom: "Uspešna prijava!"
- Uporabnik je avtomatsko preusmerjen na stran Dashboard (`/dashboard`)
- V navigacijskem meniju (zgoraj desno) se prikaže ime prijavljenega uporabnika: "Janez Novak"
- Navigacijska vrstica vsebuje povezave: "Domov" in "Dogodki" (ne pa "Prijava" ali "Registracija")
- V session storage brskalnika je shranjena seja uporabnika z naslednjimi podatki:
  - userId: ID uporabnika iz baze
  - isAdmin: false (ali 0)
- Uporabnik lahko dostopa do zaščitenih strani (`/dashboard`)
- Poskus dostopa do `/login` ali `/register` preusmeri na `/dashboard` (uporabnik je že prijavljen)
- HTTP zahteva POST `/api/auth/login` vrne status 200 z odgovorom:
  ```json
  {
    "success": true,
    "message": "Uspešna prijava"
  }
  ```

#### Dejanski rezultat
_(Polje za izpolnitev po izvedbi testa)_

#### Status testa
_(Izpolni: PASSED / FAILED / BLOCKED)_

#### Opombe
- Seja uporabnika poteče po 24 urah (nastavitev maxAge v server.js)
- Test lahko razširiš z negativnimi scenariji:
  - TC-02-NEG-01: Prijava z napačnim geslom
  - TC-02-NEG-02: Prijava z neobstoječim emailom
  - TC-02-NEG-03: Prijava s praznimi polji
- Preveri, da geslo pri prijavi pošlje preko HTTPS v produkcijskem okolju

---

### TC-03: Ustvarjanje novega dogodka

#### Identifikacijski podatki
- **ID testnega primera:** TC-03
- **Naziv:** Uspešno ustvarjanje novega dogodka z vsemi obveznimi in opcijskimi polji
- **Pokrita funkcionalnost:** F3 – Dodajanje dogodka
- **Prioriteta:** Visoka
- **Tip testa:** Pozitiven test

#### Namen testa
Namen tega testnega primera je preveriti, ali prijavljen uporabnik lahko uspešno ustvari nov dogodek v sistemu EventManager. Test preverja pravilnost vnosa vseh obveznih in opcijskih polj, shranjevanje podatkov v bazo ter prikaz dogodka na uporabniškem vmesniku.

#### Predpogoji
- Aplikacija EventManager teče
- Uporabnik je prijavljen v sistem (npr. janez@test.si / test123)
- Uporabnik se nahaja na strani Dashboard (`/dashboard`)
- Datum dogodka, ki ga bo uporabnik vnašal, je v prihodnosti (vsaj 1 dan naprej od trenutnega datuma)

#### Testni podatki

| Polje | Vrednost |
|-------|----------|
| Ime dogodka | Testni seminar o varnosti |
| Opis | Seminar o osnovah kibernetske varnosti za začetnike |
| Datum | 2025-11-20 |
| Čas | 15:00 |
| Lokacija | Ljubljana, FRI |
| Maksimalno število udeležencev | 25 |

#### Koraki izvajanja testa
1. Prijavljen uporabnik se nahaja na strani Dashboard (`/dashboard`)
2. Klikni na gumb "+ Nov dogodek" (zgoraj desno na strani)
3. Sistem odpre modalno okno z naslovom "Nov dogodek"
4. V polje "Ime dogodka" vnesi: Testni seminar o varnosti
5. V polje "Opis" vnesi: Seminar o osnovah kibernetske varnosti za začetnike
6. V polje "Datum" vnesi: 2025-11-20
7. V polje "Čas" vnesi: 15:00
8. V polje "Lokacija" vnesi: Ljubljana, FRI
9. V polje "Maksimalno število udeležencev" vnesi: 25
10. Klikni na gumb "Shrani"
11. Počakaj na odziv sistema

#### Pričakovani rezultat
- Sistem prikaže zeleno obvestilo z besedilom: "Dogodek uspešno ustvarjen"
- Modalno okno se avtomatsko zapre
- Uporabnik ostane na strani Dashboard
- Zavihek "Moji dogodki" prikaže novo ustvarjen dogodek z naslednjimi podatki:
  - **Naslov:** Testni seminar o varnosti
  - **Datum in čas:** sreda, 20. november 2025 ob 15:00
  - **Lokacija:** Ljubljana, FRI
  - **Opis:** Seminar o osnovah kibernetske varnosti za začetnike
  - **Prijavljenih:** 0/25
  - Gumbi: "Uredi", "Prijave (0)", "Izbriši"
- V bazi podatkov (tabela `events`) je ustvarjen nov zapis z naslednjimi lastnostmi:
  - ime: "Testni seminar o varnosti"
  - opis: "Seminar o osnovah kibernetske varnosti za začetnike"
  - datum: 2025-11-20
  - cas: 15:00
  - lokacija: "Ljubljana, FRI"
  - maxUdelezenci: 25
  - organizator_id: ID prijavljenega uporabnika
  - aktiven: 1 (dogodek je aktiven)
  - Polje `ustvarjen` vsebuje trenutni časovni žig
- HTTP zahteva POST `/api/events` vrne status 200 z odgovorom:
  ```json
  {
    "success": true,
    "message": "Dogodek uspešno ustvarjen",
    "eventId": <ID dogodka>
  }
  ```

#### Dejanski rezultat
_(Polje za izpolnitev po izvedbi testa)_

#### Status testa
_(Izpolni: PASSED / FAILED / BLOCKED)_

#### Opombe
- Če uporabnik poskusi vnesti datum v preteklosti, sistem mora zavrniti zahtevo s sporočilom "Datum dogodka mora biti v prihodnosti"
- Polje "Maksimalno število udeležencev" je opcijsko; če ni izpolnjeno, dogodek nima omejitve
- Polje "Čas" je prav tako opcijsko; če ni izpolnjeno, se prikaže samo datum
- Test lahko razširiš z negativnimi scenariji:
  - TC-03-NEG-01: Ustvarjanje dogodka s preteklim datumom
  - TC-03-NEG-02: Ustvarjanje dogodka brez obveznih polj (ime, datum, lokacija)

---

### TC-04: Prijava na dogodek in preverjanje kapacitete

#### Identifikacijski podatki
- **ID testnega primera:** TC-04
- **Naziv:** Prijava uporabnika na dogodek in preverjanje omejitve kapacitete
- **Pokrita funkcionalnost:** F6 – Prijava na dogodek, F4 – Pregled dogodkov
- **Prioriteta:** Srednja
- **Tip testa:** Pozitiven in negativen test (mejni pogoj)

#### Namen testa
Namen tega testnega primera je preveriti, ali se uporabnik lahko uspešno prijavi na prihajajoč dogodek ter ali sistem pravilno upošteva omejitev maksimalnega števila udeležencev. Test preverja poslovno logiko prijave, posodobitev števca prijavljenih ter preprečitev dodatnih prijav, ko je dogodek poln.

#### Predpogoji
- Aplikacija EventManager teče
- V bazi podatkov obstaja prihajajoč dogodek z naslednjimi lastnostmi:
  - Datum dogodka: prihodnji datum (npr. 2025-11-20)
  - Maksimalno število udeležencev: 2
  - Trenutno število prijavljenih: 0
  - Status: aktiven (aktiven = 1)
- V sistemu obstajajo trije testni uporabniki:
  - Uporabnik A: janez@test.si / test123
  - Uporabnik B: maja@test.si / test123
  - Uporabnik C: peter@test.si / test123
- Noben uporabnik še ni prijavljen na ta dogodek

#### Testni podatki

| Uporabnik | Email | Geslo | Pričakovana akcija |
|-----------|-------|-------|---------------------|
| Uporabnik A | janez@test.si | test123 | Prva prijava (uspešna) |
| Uporabnik B | maja@test.si | test123 | Druga prijava (uspešna) |
| Uporabnik C | peter@test.si | test123 | Tretja prijava (zavrnjena – dogodek poln) |

#### Koraki izvajanja testa
1. **Uporabnik A:** Prijavi se v sistem z računom janez@test.si / test123
2. Odpri stran Dashboard in klikni na zavihek "Vsi dogodki"
3. Poišči testni dogodek (z maksimalno kapaciteto 2 udeleženca)
4. Pri izbranem dogodku klikni na gumb "Prijavite se"
5. Počakaj na odziv sistema
6. Preveri prikaz kartice dogodka (gumb, oznaka, števec)
7. Klikni na gumb "Odjavi se" v zgornjem desnem kotu (odjava iz računa)
8. **Uporabnik B:** Prijavi se v sistem z računom maja@test.si / test123
9. Ponovi korake 2–6 (sedaj mora števec kazati 2/2)
10. Odjavi se iz računa
11. **Uporabnik C:** Prijavi se v sistem z računom peter@test.si / test123
12. Odpri stran Dashboard in klikni na zavihek "Vsi dogodki"
13. Poišči isti testni dogodek
14. Poskusi klikniti na gumb "Prijavite se"

#### Pričakovani rezultat

**Po koraku 5 (Uporabnik A):**
- Sistem prikaže zeleno obvestilo: "Uspešno ste se prijavili na dogodek"
- Kartica dogodka se posodobi:
  - Gumb "Prijavite se" se spremeni v gumb "Odjavi se"
  - Prikaže se zelena oznaka "✅ Prijavljeni"
  - Števec prikaže: "Prijavljenih: 1/2"
- V bazi podatkov (tabela `registrations`) je ustvarjen nov vnos:
  - user_id: ID uporabnika A
  - event_id: ID testnega dogodka
  - status: "potrjena"
  - Polje `prijavljen` vsebuje trenutni časovni žig

**Po koraku 9 (Uporabnik B):**
- Sistem prikaže zeleno obvestilo: "Uspešno ste se prijavili na dogodek"
- Kartica dogodka se posodobi:
  - Gumb "Prijavite se" se spremeni v gumb "Odjavi se"
  - Prikaže se zelena oznaka "✅ Prijavljeni"
  - Števec prikaže: "Prijavljenih: 2/2"
- V bazi podatkov je ustvarjen nov vnos za uporabnika B

**Po koraku 14 (Uporabnik C):**
- Gumb "Prijavite se" je onemogočen ali ni prikazan (dogodek je poln)
- Pri poskusu prijave (če je gumb viden) sistem prikaže rdeče obvestilo: "Dogodek je že poln"
- V bazi podatkov NI ustvarjen vnos za uporabnika C (prijava je zavrnjena)
- HTTP zahteva POST `/api/events/:id/register` vrne status 400 z odgovorom:
  ```json
  {
    "error": "Dogodek je že poln"
  }
  ```

#### Dejanski rezultat
_(Polje za izpolnitev po izvedbi testa)_

#### Status testa
_(Izpolni: PASSED / FAILED / BLOCKED)_

#### Opombe
- Ta test preverja tudi funkcionalnost F4 (Pregled dogodkov) – dinamična posodobitev števca prijavljenih
- Če se eden od prijavljenih uporabnikov odjavi z dogodka, se prostor sprosti in nov uporabnik se lahko prijavi
- Test potrdi pravilnost poslovne logike: sistem prepreči prijavo, ko je dogodek poln
- Preveri, da se število prijavljenih pravilno prikazuje tudi na zavihku "Vsi dogodki" za vse uporabnike

---

### TC-05: Administracija uporabnikov in dodelitev admin pravic

#### Identifikacijski podatki
- **ID testnega primera:** TC-05
- **Naziv:** Admin dodeli administratorske pravice običajnemu uporabniku
- **Pokrita funkcionalnost:** F10 – Administrator panel
- **Prioriteta:** Srednja
- **Tip testa:** Pozitiven test

#### Namen testa
Namen tega testnega primera je preveriti, ali lahko administrator preko admin panela pregleda vse uporabnike sistema ter ali lahko uspešno dodeli ali odvzame administratorske pravice drugemu uporabniku. Test preverja delovanje administratorskega vmesnika, avtorizacijo in pravilnost posodobitve uporabniških pravic.

#### Predpogoji
- Aplikacija EventManager teče
- V sistem je prijavljen uporabnik z administratorskimi pravicami:
  - Email: admin@eventmanager.si
  - Geslo: admin123
  - isAdmin: 1
- V bazi podatkov obstaja navaden uporabnik (brez administratorskih pravic):
  - Email: janez@test.si
  - Ime: Janez
  - Priimek: Novak
  - isAdmin: 0
- Admin uporabnik se nahaja na strani Admin (`/admin`)

#### Testni podatki

| Uporabnik | Email | Geslo | Začetna vloga | Pričakovana sprememba |
|-----------|-------|-------|---------------|------------------------|
| Admin | admin@eventmanager.si | admin123 | Administrator | (ni spremembe) |
| Janez | janez@test.si | test123 | Običajen uporabnik | Postane administrator |

#### Koraki izvajanja testa
1. Prijavi se v sistem kot administrator (admin@eventmanager.si / admin123)
2. V navigacijskem meniju klikni na povezavo "Admin"
   - (Ta povezava je vidna samo uporabnikom z administratorskimi pravicami)
3. Sistem odpre stran Admin nadzorna plošča (`/admin`)
4. Preveri, da se prikaže pregled s statistikami (število uporabnikov, dogodkov, prijav)
5. Klikni na zavihek "Uporabniki"
6. V tabeli uporabnikov poišči vnos za uporabnika "Janez Novak" (janez@test.si)
7. Preveri, da v stolpcu "Admin" piše "Ne" (ali gumb ima oznako "btn-secondary")
8. Pri uporabniku Janez Novak klikni na gumb "Dodeli admin"
9. Potrdi akcijo v potrditvenem oknu (če se prikaže)
10. Počakaj na odziv sistema

#### Pričakovani rezultat
- Sistem prikaže zeleno obvestilo z besedilom: "Uporabniške pravice uspešno dodeljene"
- Tabela uporabnikov se avtomatsko osveži
- Pri uporabniku Janez Novak se v stolpcu "Admin" prikaže "Da" (ali gumb ima oznako "btn-success")
- Gumb pri uporabniku Janez Novak se spremeni iz "Dodeli admin" v "Odvzemi admin"
- V bazi podatkov (tabela `users`) se za uporabnika janez@test.si posodobi polje:
  - isAdmin: 1
- HTTP zahteva PUT `/api/admin/users/:id/admin` vrne status 200 z odgovorom:
  ```json
  {
    "success": true,
    "message": "Uporabniške pravice uspešno dodeljene"
  }
  ```
- Če se uporabnik Janez sedaj prijavi v sistem, v navigacijskem meniju vidi povezavo "Admin" (dostop do admin panela)

#### Dejanski rezultat
_(Polje za izpolnitev po izvedbi testa)_

#### Status testa
_(Izpolni: PASSED / FAILED / BLOCKED)_

#### Opombe
- Test lahko razširiš z negativnim scenarijem:
  - TC-05-NEG-01: Administrator poskuša sam sebi odvzeti admin pravice → sistem mora zavrniti zahtevo s sporočilom "Ne morete si sami odvzeti admin pravic"
- Admin panel prikazuje tudi sistemske statistike:
  - Skupaj uporabnikov
  - Skupaj dogodkov
  - Aktivnih dogodkov
  - Skupaj prijav
  - Preteklih dogodkov
  - Povprečje prijav na dogodek
- Preveri pravilnost vseh prikazanih številk v admin statistikah
- Samo uporabniki z isAdmin = 1 lahko dostopajo do strani `/admin`; vsi ostali so preusmerjeni ali prejmejo napako 403 (Forbidden)

---

## 3. Matrika povezav med funkcionalnostmi in testnimi primeri

Spodnja tabela prikazuje povezavo med funkcionalnostmi sistema EventManager in pripravljenimi testnimi primeri. Vsak testni primer pokriva eno ali več funkcionalnosti, kar omogoča sistematično preverjanje delovanja aplikacije.

### Matrika sledljivosti: Funkcionalnosti → Testni primeri

| Funkcionalnost | Opis | TC-01 | TC-02 | TC-03 | TC-04 | TC-05 |
|----------------|------|:-----:|:-----:|:-----:|:-----:|:-----:|
| **F1:** Registracija uporabnika | Ustvari novega uporabnika in shrani v bazo z hash-iranim geslom | ✅ | - | - | - | - |
| **F2:** Prijava uporabnika | Omogoča dostop do sistema z email/geslo, ustvari sejo | - | ✅ | - | - | - |
| **F3:** Dodajanje dogodka | Organizator vnese ime, datum, opis in lokacijo novega dogodka | - | - | ✅ | - | - |
| **F4:** Pregled dogodkov | Prikaz vseh aktivnih dogodkov z možnostjo filtriranja in štetjem prijavljenih | - | - | - | ✅ | - |
| **F6:** Prijava na dogodek | Uporabnik se prijavi na izbran prihajajoč dogodek (s preverjanjem kapacitete) | - | - | - | ✅ | - |
| **F10:** Administrator panel | Pregled vseh uporabnikov, dogodkov, prijav in sistemskih statistik; dodelitev admin pravic | - | - | - | - | ✅ |

**Legenda:**
- ✅ = Testni primer pokriva to funkcionalnost
- \- = Testni primer ne pokriva te funkcionalnosti

### Pokritost funkcionalnosti

**Pokrite funkcionalnosti:** 6 od 10 (60%)
- ✅ F1: Registracija uporabnika
- ✅ F2: Prijava uporabnika
- ✅ F3: Dodajanje dogodka
- ✅ F4: Pregled dogodkov (delno)
- ✅ F6: Prijava na dogodek
- ✅ F10: Administrator panel

**Nepokrite funkcionalnosti:** 4 od 10 (40%)
- F5: Iskanje dogodkov
- F7: Seznam prijavljenih
- F8: Urejanje/brisanje dogodkov
- F9: Email obvestila

### Povzetek

Pripravljenih pet testnih primerov (TC-01 do TC-05) pokriva **60% funkcionalnosti** sistema EventManager, pri čemer vključuje vse **kritične poslovne scenarije**:
- Registracija in avtentikacija uporabnikov (TC-01, TC-02)
- Upravljanje dogodkov (TC-03)
- Prijava na dogodke z validacijo kapacitete (TC-04)
- Administratorsko upravljanje sistema (TC-05)

Nepokrite funkcionalnosti predstavljajo sekundarne značilnosti sistema (iskanje, urejanje) ali simulirane funkcionalnosti (pošiljanje emailov), ki niso ključnega pomena za osnovno delovanje aplikacije.

---

## 4. Zaključek

V okviru te naloge je bilo pripravljenih **pet podrobnih testnih primerov** za funkcionalno testiranje sistema EventManager. Vsak testni primer vsebuje vse priporočene atribute:
- Identifikacijske podatke (ID, naziv, pokrita funkcionalnost, prioriteta, tip)
- Namen testa
- Predpogoje
- Testne podatke
- Podrobne korake izvajanja
- Pričakovane rezultate
- Polja za beleženje dejanskih rezultatov in statusa

Matrika sledljivosti jasno prikazuje povezavo med funkcionalnostmi sistema in testnimi primeri ter omogoča pregleden pregled pokritosti testiranja.

Testni primeri so zasnovani tako, da pokrivajo **kritične uporabniške scenarije** in **poslovne procese** sistema EventManager. Za dosego popolne pokritosti funkcionalnosti se priporočajo dodatni testni primeri, ki bi pokrivali še iskanje dogodkov, urejanje in brisanje dogodkov ter pregled seznama prijavljenih uporabnikov.

---

**Avtor:** Erik Lasic  
**Datum:** Oktober 2025  
**Predmet:** Zanesljivost in testiranje informacijskih sistemov
