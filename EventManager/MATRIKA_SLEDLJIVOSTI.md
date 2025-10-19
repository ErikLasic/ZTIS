# EventManager – Matrika sledljivosti testnih primerov

**Projekt:** EventManager – sistem za prijavo na dogodke  
**Avtor:** Erik  
**Predmet:** Zanesljivost in testiranje informacijskih sistemov  
**Datum:** Oktober 2025

---

## 1. Pregled funkcionalnosti

Spodnja tabela prikazuje **10 ključnih funkcionalnosti** sistema EventManager, kot so definirane v vzpostavitveni dokumentaciji.

| ID | Funkcionalnost | Kratek opis |
|----|----------------|-------------|
| F1 | **Registracija uporabnika** | Ustvari novega uporabnika in shrani v bazo z hash-iranim geslom |
| F2 | **Prijava uporabnika** | Omogoča dostop do sistema z email/geslo, ustvari sejo |
| F3 | **Dodajanje dogodka** | Organizator vnese ime, datum, opis in lokacijo novega dogodka |
| F4 | **Pregled dogodkov** | Prikaz vseh aktivnih dogodkov z možnostjo filtriranja in štetjem prijavljenih |
| F5 | **Iskanje dogodkov** | Filtriranje dogodkov po imenu/opisu, lokaciji ali datumu |
| F6 | **Prijava na dogodek** | Uporabnik se prijavi na izbran prihajajoč dogodek (s preverjanjem kapacitete) |
| F7 | **Seznam prijavljenih** | Organizator dogodka vidi prijavljene osebe na svoje dogodke |
| F8 | **Urejanje/brisanje dogodkov** | Možno le za organizatorja dogodka ali administratorja (soft delete) |
| F9 | **Email obvestilo** | Simulacija pošiljanja potrditve prijavljenim uporabnikom (admin funkcija) |
| F10 | **Administrator panel** | Pregled vseh uporabnikov, dogodkov, prijav in sistemskih statistik; dodelitev admin pravic |

---

## 2. Matrika sledljivosti: Funkcionalnosti → Testni primeri

Spodnja matrika prikazuje **povezavo med funkcionalnostmi in testnimi primeri**. Vsaka celica označuje, ali testni primer pokriva določeno funkcionalnost.

| Funkcionalnost | TC-01<br>Registracija | TC-02<br>Prijava | TC-03<br>Ustvari dogodek | TC-04<br>Prijava na dogodek | TC-05<br>Admin panel |
|----------------|:---------------------:|:----------------:|:------------------------:|:---------------------------:|:--------------------:|
| F1: Registracija uporabnika | ✅ **Primarno** | - | - | - | - |
| F2: Prijava uporabnika | - | ✅ **Primarno** | - | - | - |
| F3: Dodajanje dogodka | - | - | ✅ **Primarno** | - | - |
| F4: Pregled dogodkov | - | - | - | ✅ Sekundarno | - |
| F5: Iskanje dogodkov | - | - | - | - | - |
| F6: Prijava na dogodek | - | - | - | ✅ **Primarno** | - |
| F7: Seznam prijavljenih | - | - | - | - | - |
| F8: Urejanje/brisanje dogodkov | - | - | - | - | - |
| F9: Email obvestilo | - | - | - | - | - |
| F10: Administrator panel | - | - | - | - | ✅ **Primarno** |

### Legenda
- **✅ Primarno:** Testni primer neposredno in poglobljeno testira to funkcionalnost
- **✅ Sekundarno:** Testni primer delno ali posredno testira to funkcionalnost (npr. preverjanje prikaza)
- **-:** Testni primer ne pokriva te funkcionalnosti

---

## 3. Matrika sledljivosti: Testni primeri → Funkcionalnosti

Obrnjena perspektiva, ki prikazuje **katere funkcionalnosti pokriva vsak testni primer**.

| Testni primer | Pokrite funkcionalnosti | Tip testa | Prioriteta |
|---------------|-------------------------|-----------|------------|
| **TC-01:** Registracija novega uporabnika | F1 (Registracija uporabnika) | Pozitiven | Visoka |
| **TC-02:** Prijava uporabnika z veljavnimi podatki | F2 (Prijava uporabnika) | Pozitiven | Visoka |
| **TC-03:** Ustvarjanje novega dogodka | F3 (Dodajanje dogodka) | Pozitiven | Visoka |
| **TC-04:** Prijava na dogodek in preverjanje kapacitete | F6 (Prijava na dogodek), F4 (Pregled dogodkov – posodobitev števca) | Pozitiven + negativen (mejni pogoj) | Srednja |
| **TC-05:** Administracija uporabnikov in dodelitev admin pravic | F10 (Administrator panel) | Pozitiven | Srednja |

---

## 4. Pokritost funkcionalnosti

### Pokrite funkcionalnosti (6/10)
- ✅ F1: Registracija uporabnika
- ✅ F2: Prijava uporabnika
- ✅ F3: Dodajanje dogodka
- ✅ F4: Pregled dogodkov (delno – posodobitev števca)
- ✅ F6: Prijava na dogodek
- ✅ F10: Administrator panel

### Nepokrite funkcionalnosti (4/10)
- ❌ F5: Iskanje dogodkov
- ❌ F7: Seznam prijavljenih
- ❌ F8: Urejanje/brisanje dogodkov
- ❌ F9: Email obvestilo

### Stopnja pokritosti
- **Pokritost:** 60% (6 od 10 funkcionalnosti)
- **Opomba:** Testni primeri pokrivajo **vse kritične funkcionalnosti** (avtentikacija, CRUD dogodkov, osnovna administracija). Nepokrite funkcionalnosti so bodisi sekundarne (iskanje, urejanje) ali simulirane (email).

---

## 5. Priporočila za razširitev testiranja

Za dosego 100% pokritosti priporočamo dodatne testne primere:

| Priporočen TC | Funkcionalnost | Opis |
|---------------|----------------|------|
| TC-06 | F5: Iskanje dogodkov | Testiranje iskanja po imenu, lokaciji in datumu; preverjanje pravilnosti rezultatov |
| TC-07 | F8: Urejanje dogodkov | Organizator posodobi podatke svojega dogodka; preverjanje avtorizacije |
| TC-08 | F8: Brisanje dogodkov | Organizator izbriše dogodek (soft delete); preverjanje, da prijavl.eni uporabniki ne vidijo več dogodka |
| TC-09 | F7: Seznam prijavljenih | Organizator odpre seznam prijavljenih na svoj dogodek; preveri pravilnost podatkov |
| TC-10 | F9: Email obvestilo | Admin pošlje simulirana obvestila; preveri, da API vrne seznam prejemnikov |

---

## 6. Kritične poti in scenariji

### Kritična pot 1: Uporabniška registracija in prijava na dogodek
**Scenarij:** Nov uporabnik → Registracija → Prijava → Prijava na dogodek

| Korak | Testni primer | Funkcionalnost |
|-------|---------------|----------------|
| 1 | TC-01 | F1: Registracija |
| 2 | TC-02 | F2: Prijava |
| 3 | TC-04 | F6: Prijava na dogodek |

**Status:** ✅ Pokrito

### Kritična pot 2: Organizator ustvari dogodek in pregleda prijave
**Scenarij:** Prijavljen uporabnik → Ustvari dogodek → Uporabniki se prijavijo → Organizator pregleda prijave

| Korak | Testni primer | Funkcionalnost |
|-------|---------------|----------------|
| 1 | TC-02 | F2: Prijava |
| 2 | TC-03 | F3: Dodajanje dogodka |
| 3 | TC-04 | F6: Prijava na dogodek |
| 4 | *(TC-09 – priporočeno)* | F7: Seznam prijavljenih |

**Status:** ⚠️ Delno pokrito (manjka TC-09)

### Kritična pot 3: Admin upravlja sistem
**Scenarij:** Admin → Pregled uporabnikov → Dodelitev pravic → Pregled dogodkov → Pošiljanje obvestil

| Korak | Testni primer | Funkcionalnost |
|-------|---------------|----------------|
| 1 | TC-02 | F2: Prijava (admin) |
| 2 | TC-05 | F10: Admin panel (uporabniki) |
| 3 | *(TC-10 – priporočeno)* | F9: Email obvestilo |

**Status:** ⚠️ Delno pokrito (manjka TC-10)

---

## 7. Tveganja in prioritizacija

### Visoka prioriteta
- **TC-01, TC-02:** Brez registracije in prijave sistem ni uporaben
- **TC-03:** Brez ustvarjanja dogodkov ni vsebine v sistemu

### Srednja prioriteta
- **TC-04:** Kritična poslovna logika (kapaciteta) in uporabniška izkušnja
- **TC-05:** Administracija je pomembna, a ne vpliva na osnovne uporabniške tokove

### Nizka prioriteta (priporočeni dodatni testi)
- **TC-06–TC-10:** Izboljšujejo uporabniško izkušnjo in pokrivajo sekundarne funkcionalnosti

---

## 8. Sklep

Pripravljenih pet testnih primerov (TC-01 do TC-05) **pokriva 60% funkcionalnosti** sistema EventManager, vključno z vsemi **kritičnimi potmi** (registracija, prijava, CRUD dogodkov, prijava na dogodek, osnovna administracija).

Za popolno pokritost sistema priporočamo razširitev s testnimi primeri TC-06 do TC-10, ki pokrivajo iskanje, urejanje/brisanje dogodkov, pregled prijavljenih in simulacijo obvestil.

---

**Datum priprave:** Oktober 2025  
**Pripravil:** Erik  
**Verzija:** 1.0
