# 2. naloga – Oblikovanje testnih primerov (ZTIS)

## Pogoji zaključka

- Za izbrani projekt EventManager ustvarjenih **5 testnih primerov** za funkcionalno testiranje.
- Vsak testni primer vsebuje vse priporočene atribute (ID, naziv, opis, predpogoji, koraki, pričakovani rezultati, prioriteta, testni podatki).
- Pripravljena **matrika sledljivosti**, ki povezuje funkcionalnosti s testnimi primeri.
- Oddaja dokumentiranih testnih primerov in matrike.

## Roki za oddajo

- 100 točk: 20. 10. 2025
- 75 točke: 27. 10. 2025
- 50 točk: do konca zimskega semestra

---

## Oddani dokumenti

### 1. Testni primeri (`TESTNI_PRIMERI.md`)
Dokument vsebuje **5 podrobnih testnih primerov** za funkcionalno testiranje sistema EventManager:

| ID | Naziv | Pokrita funkcionalnost | Prioriteta |
|----|-------|------------------------|------------|
| TC-01 | Registracija novega uporabnika | F1: Registracija uporabnika | Visoka |
| TC-02 | Prijava uporabnika z veljavnimi podatki | F2: Prijava uporabnika | Visoka |
| TC-03 | Ustvarjanje novega dogodka | F3: Dodajanje dogodka | Visoka |
| TC-04 | Prijava na dogodek in preverjanje kapacitete | F6: Prijava na dogodek, F4: Pregled dogodkov | Srednja |
| TC-05 | Administracija uporabnikov in dodelitev admin pravic | F10: Administrator panel | Srednja |

**Struktura vsakega testnega primera:**
- ID in naziv
- Opis testnega scenarija
- Prioriteta in tip testa (pozitiven/negativen)
- Zahtevana funkcionalnost
- Predpogoji (okolje, začetno stanje)
- Testni podatki (v obliki tabel)
- Podrobni koraki testiranja (1, 2, 3, ...)
- Pričakovani rezultati (vključno z API odzivi in spremembami v bazi)
- Polja za dejanski rezultat in status (PASSED/FAILED/BLOCKED)
- Opombe in priporočila

**Pokritost:** 60% funkcionalnosti (6/10), vključno z vsemi kritičnimi potmi.

### 2. Matrika sledljivosti (`MATRIKA_SLEDLJIVOSTI.md`)
Dokument vsebuje:

- **Pregled vseh 10 funkcionalnosti** sistema EventManager (F1–F10)
- **Matriko sledljivosti Funkcionalnosti → Testni primeri** (tabela z oznako ✅ za primarno/sekundarno pokritost)
- **Matriko sledljivosti Testni primeri → Funkcionalnosti** (obrnjena perspektiva)
- **Analizo pokritosti:** pokrite (6) in nepokrite (4) funkcionalnosti
- **Kritične poti in scenariji:** npr. "Nov uporabnik → Registracija → Prijava → Prijava na dogodek"
- **Priporočila za razširitev testiranja:** TC-06 do TC-10 za dosego 100% pokritosti

**Ključne ugotovitve:**
- Testni primeri pokrivajo vse **visoko prioritetne** funkcionalnosti (avtentikacija, CRUD dogodkov).
- Nepokrite funkcionalnosti so sekundarne (iskanje, urejanje) ali simulirane (email).

---

## Struktura dokumentov

```
EventManager/
├── TESTNI_PRIMERI.md          # Pet podrobnih testnih primerov
├── MATRIKA_SLEDLJIVOSTI.md    # Matrika povezav funkcionalnosti ↔ testi
├── ODDAJA_2.md                # Ta dokument (povzetek oddaje)
├── VZPOSTAVITVENA_DOKUMENTACIJA.md  # Popolna vzpostavitev in API referenca
└── README.md                  # Hitra navodila
```

---

## Kako pregledati testne primere

1. **Odpri `TESTNI_PRIMERI.md`** za podrobne testne scenarije.
2. **Odpri `MATRIKA_SLEDLJIVOSTI.md`** za pregled pokritosti in povezav.
3. Za izvajanje testov vzpostavi projekt (glej `VZPOSTAVITVENA_DOKUMENTACIJA.md`):
   ```bash
   npm install
   npm run init-db
   npm start
   ```
4. Sledi korakom v testnih primerih in beležij rezultate v polja "Dejanski rezultat" in "Status".

---

## Dodatne opombe

- **Format:** Testni primeri in matrika so pripravljeni v Markdown formatu za enostavno verzioniranje in deljenje. Lahko se izvozita v PDF ali Word, če je potrebno.
- **Avtomatizacija:** Testni primeri so trenutno namenjeni **ročnemu** testiranju. Za avtomatizacijo priporočamo Playwright/Cypress (E2E) ali Supertest + Jest (API).
- **Testno okolje:** Windows 10/11, Node.js 18+, Google Chrome ali Firefox.

---

S tem dokumentom potrjujem oddajo testnih primerov in matrike sledljivosti za 2. nalogo predmeta ZTIS.

**Avtor:** Erik  
**Datum:** Oktober 2025
