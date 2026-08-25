# Prošireni test podaci — 5 štamparija + 20 proizvoda

Ovo je opciona dopuna uz `DATABASE_SETUP.md` — veći set demo podataka da imaš više toga za
testiranje (pretraga, sortiranje, TOP 5, filtriranje po kategoriji, izuzimanje proizvoda bez
stanja...). Nije obavezno, samo olakšava ručno istraživanje aplikacije.

U MongoDB Compass, otvori kolekciju, klikni **ADD DATA → Insert Document**, prebaci se na JSON
prikaz (dugme `{}`) i nalepi ceo niz odjednom — Compass ubacuje sve dokumente iz niza u jednom
potezu.

Svi štampari imaju istu lozinku za prijavu: **`Test123!`** (hash ispod je za nju).

---

## Kolekcija `users` — 5 štamparija

```json
[
  {
    "kor_ime": "stampa_beograd1",
    "lozinka": "$2b$10$PpIiy5G/.jL5X7TJZApxOu4Nc2Ckm4VWJ8xLiKAOK5aiUw3s3okzi",
    "ime": "Nikola", "prezime": "Kovačević", "telefon": "0601111111",
    "mejl": "stampa_beograd1@example.com", "slika": "default_profile_image.jpg",
    "tip": "stampar", "status": "odobren",
    "nazivInstitucije": "Copy Studio Kumanovska", "adresa": "Kumanovska 12", "grad": "Beograd",
    "maticniBroj": "61111111", "pib": "611111111"
  },
  {
    "kor_ime": "stampa_novisad1",
    "lozinka": "$2b$10$PpIiy5G/.jL5X7TJZApxOu4Nc2Ckm4VWJ8xLiKAOK5aiUw3s3okzi",
    "ime": "Jelena", "prezime": "Popović", "telefon": "0602222222",
    "mejl": "stampa_novisad1@example.com", "slika": "default_profile_image.jpg",
    "tip": "stampar", "status": "odobren",
    "nazivInstitucije": "PrintMax Novi Sad", "adresa": "Bulevar Oslobođenja 45", "grad": "Novi Sad",
    "maticniBroj": "62222222", "pib": "622222222"
  },
  {
    "kor_ime": "stampa_nis1",
    "lozinka": "$2b$10$PpIiy5G/.jL5X7TJZApxOu4Nc2Ckm4VWJ8xLiKAOK5aiUw3s3okzi",
    "ime": "Marko", "prezime": "Stanković", "telefon": "0603333333",
    "mejl": "stampa_nis1@example.com", "slika": "default_profile_image.jpg",
    "tip": "stampar", "status": "odobren",
    "nazivInstitucije": "Grafika Niš", "adresa": "Vožda Karađorđa 8", "grad": "Niš",
    "maticniBroj": "63333333", "pib": "633333333"
  },
  {
    "kor_ime": "stampa_beograd2",
    "lozinka": "$2b$10$PpIiy5G/.jL5X7TJZApxOu4Nc2Ckm4VWJ8xLiKAOK5aiUw3s3okzi",
    "ime": "Ana", "prezime": "Jovanović", "telefon": "0604444444",
    "mejl": "stampa_beograd2@example.com", "slika": "default_profile_image.jpg",
    "tip": "stampar", "status": "odobren",
    "nazivInstitucije": "Reklamni Centar", "adresa": "Zemunska 3", "grad": "Beograd",
    "maticniBroj": "64444444", "pib": "644444444"
  },
  {
    "kor_ime": "stampa_krusevac1",
    "lozinka": "$2b$10$PpIiy5G/.jL5X7TJZApxOu4Nc2Ckm4VWJ8xLiKAOK5aiUw3s3okzi",
    "ime": "Stefan", "prezime": "Milošević", "telefon": "0605555555",
    "mejl": "stampa_krusevac1@example.com", "slika": "default_profile_image.jpg",
    "tip": "stampar", "status": "odobren",
    "nazivInstitucije": "Kreativa Print", "adresa": "Trg Fontana 1", "grad": "Kruševac",
    "maticniBroj": "65555555", "pib": "655555555"
  }
]
```

---

## Kolekcija `products` — 20 proizvoda

Namerno uključuje: 2 proizvoda sa `kolicinaNaStanju: 0` (Vizit karte i Fototapeta — da testiraš
da se ne pojavljuju u pretrazi/početnoj), raspon lajkova od 2 do 40 (za TOP 5), proizvode sa i
bez usluga štampe, i sve tri kategorije/većinu potkategorija.

```json
[
  { "naziv": "Pamučna Polo Majica", "kratakOpis": "Kvalitetna pamučna polo majica 180g/m2", "duziOpis": "Pogodna za brendiranje i korporativne uniforme.", "cena": 1200, "kategorija": "Kreativne štampe", "podkategorija": "Štampa na majicama", "kreator": "stampa_beograd1", "kolicinaNaStanju": 150, "slike": [], "boje": ["Bela", "Crna", "Tamno plava", "Siva"], "tipoviStampe": [{ "naziv": "Direktna štampa na tekstil (DTG)", "maxSirinaMm": 300, "maxVisinaMm": 400, "dodatnaCenaPoKomadu": 350 }, { "naziv": "Preslikač (Sito preslikač)", "maxSirinaMm": 280, "maxVisinaMm": 350, "dodatnaCenaPoKomadu": 200 }], "lajkovi": 18, "dislajkovi": 2 },
  { "naziv": "Keramička šolja 330ml", "kratakOpis": "Bela keramička šolja visokog sjaja", "duziOpis": "Idealna za sublimacionu štampu visoke rezolucije.", "cena": 320, "kategorija": "Kreativne štampe", "podkategorija": "Šolje", "kreator": "stampa_beograd1", "kolicinaNaStanju": 500, "slike": [], "boje": ["Bela"], "tipoviStampe": [{ "naziv": "Sublimaciona štampa", "maxSirinaMm": 200, "maxVisinaMm": 85, "dodatnaCenaPoKomadu": 150 }], "lajkovi": 32, "dislajkovi": 1 },
  { "naziv": "Promotivni Roll-up Baner 85x200cm", "kratakOpis": "Lagan aluminijumski mehanizam sa torbom", "duziOpis": "Štampa na kvalitetnom baner platnu.", "cena": 4500, "kategorija": "Štampa velikih formata", "podkategorija": "Rollups", "kreator": "stampa_beograd1", "kolicinaNaStanju": 20, "slike": [], "boje": ["Bela", "Crna"], "tipoviStampe": [{ "naziv": "Eko-solventna štampa visoke rezolucije", "maxSirinaMm": 850, "maxVisinaMm": 2000, "dodatnaCenaPoKomadu": 800 }], "lajkovi": 9, "dislajkovi": 0 },
  { "naziv": "Hemijska olovka", "kratakOpis": "Plastična hemijska olovka sa logom", "duziOpis": "Standardna promotivna hemijska olovka.", "cena": 45, "kategorija": "Štampa malih formata", "podkategorija": "Olovke", "kreator": "stampa_beograd1", "kolicinaNaStanju": 1000, "slike": [], "boje": ["Plava", "Crna", "Crvena"], "tipoviStampe": [], "lajkovi": 5, "dislajkovi": 0 },
  { "naziv": "Vizit karte 300g", "kratakOpis": "Mat plastificirane vizit karte", "duziOpis": "Paket od 100 komada, obostrana štampa.", "cena": 25, "kategorija": "Štampa malih formata", "podkategorija": "Vizit karte", "kreator": "stampa_beograd1", "kolicinaNaStanju": 0, "slike": [], "boje": ["Bela"], "tipoviStampe": [], "lajkovi": 3, "dislajkovi": 0 },

  { "naziv": "Flajer A5 sjajni", "kratakOpis": "Flajer A5 formata, sjajni papir", "duziOpis": "Stampa u boji, 250g papir.", "cena": 18, "kategorija": "Štampa malih formata", "podkategorija": "Flajeri", "kreator": "stampa_novisad1", "kolicinaNaStanju": 2000, "slike": [], "boje": ["Bela"], "tipoviStampe": [], "lajkovi": 7, "dislajkovi": 1 },
  { "naziv": "Zahvalnica sa zlatotiskom", "kratakOpis": "Elegantna zahvalnica", "duziOpis": "Zlatotisak na kunstdruk kartonu.", "cena": 150, "kategorija": "Štampa malih formata", "podkategorija": "Zahvalnice", "kreator": "stampa_novisad1", "kolicinaNaStanju": 80, "slike": [], "boje": ["Bela", "Krem"], "tipoviStampe": [], "lajkovi": 21, "dislajkovi": 0 },
  { "naziv": "Pozivnica za venčanje", "kratakOpis": "Luksuzna pozivnica sa tisnjenjem", "duziOpis": "Setovi po 50 komada, razne teme.", "cena": 200, "kategorija": "Štampa malih formata", "podkategorija": "Pozivnice", "kreator": "stampa_novisad1", "kolicinaNaStanju": 60, "slike": [], "boje": ["Bela", "Krem", "Roze"], "tipoviStampe": [], "lajkovi": 40, "dislajkovi": 3 },
  { "naziv": "Duks sa kapuljačom", "kratakOpis": "Pamučni duks 320g/m2", "duziOpis": "Unisex kroj, dostupne sve veličine.", "cena": 2600, "kategorija": "Kreativne štampe", "podkategorija": "Štampa na duksevima", "kreator": "stampa_novisad1", "kolicinaNaStanju": 40, "slike": [], "boje": ["Siva", "Crna", "Bordo"], "tipoviStampe": [{ "naziv": "Direktna štampa na tekstil (DTG)", "maxSirinaMm": 350, "maxVisinaMm": 450, "dodatnaCenaPoKomadu": 400 }], "lajkovi": 14, "dislajkovi": 1 },
  { "naziv": "Fototapeta Pejzaž", "kratakOpis": "Fototapeta visoke rezolucije", "duziOpis": "Štampa na zidnom platnu, po meri.", "cena": 6000, "kategorija": "Štampa velikih formata", "podkategorija": "Fototapete", "kreator": "stampa_novisad1", "kolicinaNaStanju": 0, "slike": [], "boje": ["Bela"], "tipoviStampe": [], "lajkovi": 6, "dislajkovi": 0 },

  { "naziv": "Poster A2", "kratakOpis": "Poster A2 formata, sjajni papir", "duziOpis": "Visoka rezolucija štampe, 200g papir.", "cena": 900, "kategorija": "Štampa velikih formata", "podkategorija": "Posteri", "kreator": "stampa_nis1", "kolicinaNaStanju": 100, "slike": [], "boje": ["Bela"], "tipoviStampe": [], "lajkovi": 11, "dislajkovi": 0 },
  { "naziv": "Fascikla sa džepovima", "kratakOpis": "Plastificirana fascikla A4", "duziOpis": "Sa unutrašnjim džepovima za dokumenta.", "cena": 180, "kategorija": "Štampa malih formata", "podkategorija": "Fascikle", "kreator": "stampa_nis1", "kolicinaNaStanju": 150, "slike": [], "boje": ["Bela", "Plava", "Zelena"], "tipoviStampe": [], "lajkovi": 8, "dislajkovi": 0 },
  { "naziv": "Ceger platneni", "kratakOpis": "Platneni ceger za brendiranje", "duziOpis": "Prirodno platno, ojačane drške.", "cena": 450, "kategorija": "Kreativne štampe", "podkategorija": "Štampa na cegerima", "kreator": "stampa_nis1", "kolicinaNaStanju": 300, "slike": [], "boje": ["Bela", "Prirodna", "Crna"], "tipoviStampe": [{ "naziv": "Preslikač (Sito preslikač)", "maxSirinaMm": 300, "maxVisinaMm": 300, "dodatnaCenaPoKomadu": 180 }], "lajkovi": 25, "dislajkovi": 2 },
  { "naziv": "Šolja sa fotografijom", "kratakOpis": "Personalizovana šolja", "duziOpis": "Sublimaciona štampa fotografije po izboru.", "cena": 380, "kategorija": "Kreativne štampe", "podkategorija": "Šolje", "kreator": "stampa_nis1", "kolicinaNaStanju": 200, "slike": [], "boje": ["Bela"], "tipoviStampe": [{ "naziv": "Sublimaciona štampa", "maxSirinaMm": 200, "maxVisinaMm": 85, "dodatnaCenaPoKomadu": 150 }], "lajkovi": 19, "dislajkovi": 1 },
  { "naziv": "Majica za trke", "kratakOpis": "Sportska majica, brzosušeći materijal", "duziOpis": "Lagana tehnicka majica za trkace.", "cena": 1100, "kategorija": "Kreativne štampe", "podkategorija": "Štampa na majicama", "kreator": "stampa_nis1", "kolicinaNaStanju": 5, "slike": [], "boje": ["Bela", "Neon zelena"], "tipoviStampe": [], "lajkovi": 4, "dislajkovi": 0 },

  { "naziv": "Roll-up mini 60x160", "kratakOpis": "Kompaktni roll-up baner", "duziOpis": "Idealan za sajmove i manje prostore.", "cena": 3200, "kategorija": "Štampa velikih formata", "podkategorija": "Rollups", "kreator": "stampa_beograd2", "kolicinaNaStanju": 15, "slike": [], "boje": ["Bela"], "tipoviStampe": [], "lajkovi": 10, "dislajkovi": 0 },
  { "naziv": "Olovka metalna", "kratakOpis": "Metalna hemijska olovka", "duziOpis": "Gravura loga, poklon kutija opciono.", "cena": 90, "kategorija": "Štampa malih formata", "podkategorija": "Olovke", "kreator": "stampa_beograd2", "kolicinaNaStanju": 400, "slike": [], "boje": ["Srebrna", "Zlatna", "Crna"], "tipoviStampe": [], "lajkovi": 16, "dislajkovi": 0 },
  { "naziv": "Vizit karta mat plastifikacija", "kratakOpis": "Premium vizit karta", "duziOpis": "Mat plastifikacija, zaobljeni uglovi opciono.", "cena": 35, "kategorija": "Štampa malih formata", "podkategorija": "Vizit karte", "kreator": "stampa_beograd2", "kolicinaNaStanju": 700, "slike": [], "boje": ["Bela"], "tipoviStampe": [], "lajkovi": 13, "dislajkovi": 1 },

  { "naziv": "Duks bez kapuljače", "kratakOpis": "Klasičan duks bez kapuljače", "duziOpis": "Pamučni duks 300g/m2.", "cena": 2400, "kategorija": "Kreativne štampe", "podkategorija": "Štampa na duksevima", "kreator": "stampa_krusevac1", "kolicinaNaStanju": 25, "slike": [], "boje": ["Siva", "Crna"], "tipoviStampe": [], "lajkovi": 2, "dislajkovi": 0 },
  { "naziv": "Pozivnica minimalistička", "kratakOpis": "Moderna minimalistička pozivnica", "duziOpis": "Jednostavan dizajn, kunstdruk karton.", "cena": 170, "kategorija": "Štampa malih formata", "podkategorija": "Pozivnice", "kreator": "stampa_krusevac1", "kolicinaNaStanju": 90, "slike": [], "boje": ["Bela", "Krem"], "tipoviStampe": [], "lajkovi": 29, "dislajkovi": 2 }
]
```

---

## Šta ovo pokriva

- **5 gradova** (Beograd x2, Novi Sad, Niš, Kruševac) — za testiranje prikaza grada na
  detaljima proizvoda i u tabeli porudžbina.
- **Sve 3 kategorije** i skoro sve potkategorije zastupljene.
- **2 proizvoda bez stanja** (Vizit karte 300g, Fototapeta Pejzaž) — ne bi trebalo da se pojave
  u pretrazi ni na početnoj stranici.
- **Raspon lajkova 2–40** — "Pozivnica za venčanje" (40) bi trebalo da bude #1 na TOP 5.
- Prijava kao bilo koja štamparija: gore navedeno `kor_ime` / lozinka `Test123!`.

Ako želiš i klijenta koji odmah može da naruči nešto od ovih proizvoda (bez čekanja na admin
odobrenje), evo i njega:

```json
{
  "kor_ime": "test_klijent",
  "lozinka": "$2b$10$PpIiy5G/.jL5X7TJZApxOu4Nc2Ckm4VWJ8xLiKAOK5aiUw3s3okzi",
  "ime": "Milica", "prezime": "Ilić", "telefon": "0611234567",
  "mejl": "test_klijent@example.com", "slika": "default_profile_image.jpg",
  "tip": "fizicko", "status": "odobren"
}
```

Prijava: `test_klijent` / `Test123!`.
