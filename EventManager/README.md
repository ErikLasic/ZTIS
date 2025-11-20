# EventManager

Sistem za vodenje prijav na dogodke

## Vzpostavitev

1. Namesti odvisnosti:
```bash
npm install
```

2. Ustvari bazo podatkov:
```bash
npm run init-db
```

3. Zaženi aplikacijo:
```bash
npm start
```

ali za razvoj:
```bash
npm run dev
```

Aplikacija bo dostopna na http://localhost:3000

## Deployment

Za enostavno objavo aplikacije na spletu (brez sprememb kode):

1. Pushaj kodo na GitHub
2. Prijavi se na [Render.com](https://render.com)
3. Ustvari nov Web Service in poveži z repozitorijem
4. Po prvem deploymentu poženi `npm run init-db` v Render Shell

Podrobna navodila: `DEPLOYMENT_SIMPLE.md`

## Funkcionalnosti

1. Registracija uporabnikov
2. Prijava uporabnikov
3. Dodajanje dogodkov
4. Pregled dogodkov
5. Iskanje dogodkov
6. Prijava na dogodke
7. Seznam prijavljenih uporabnikov
8. Urejanje in brisanje dogodkov
9. Email obvestila (simulirana)
10. Administrator panel

## Tehnologije

- Node.js + Express
- SQLite
- HTML/CSS/JavaScript
- Session-based authentication