# Ručno kreiranje baze — MongoDB "stamparija"

Ovaj dokument prati fazu implementacije i ažurira se kad god neka faza uvede novo polje ili
kolekciju. Trenutno pokriva **Fazu 0** (temeljne šeme). Backend očekuje bazu pod imenom
`stamparija` na `mongodb://127.0.0.1:27017/stamparija` (vidi `backend/src/server.ts`).

Šeme ispod su izvor istine iz koda (`backend/src/models/*.ts`) — ako ručno uneti dokument ne
prati tačna imena polja/tipove, aplikacija neće raditi ispravno.

Kreiraj bazu `stamparija` u MongoDB Compass (ili `mongosh`) sa 4 kolekcije: `users`,
`categories`, `products`, `invoices`. Za sada (Faza 0) potrebno je popuniti samo `categories` i
admin nalog u `users` — `products` i `invoices` pune se kasnije kroz aplikaciju (registracija/
dodavanje proizvoda/naručivanje), pa nije potrebno ništa ručno ubacivati u njih sada.

---

## Kolekcija `categories`

Polja: `naziv` (string, unique), `podkategorije` (niz objekata `{ naziv: string }`).

Ubaci tačno ova 3 dokumenta (fiksne kategorije iz teksta zadatka + potkategorije iz primera u
tekstu i iz Priloga 1 JSON primera):

```json
{
  "naziv": "Štampa malih formata",
  "podkategorije": [
    { "naziv": "Olovke" },
    { "naziv": "Vizit karte" },
    { "naziv": "Flajeri" },
    { "naziv": "Zahvalnice" },
    { "naziv": "Pozivnice" },
    { "naziv": "Fascikle" }
  ]
}
```

```json
{
  "naziv": "Štampa velikih formata",
  "podkategorije": [
    { "naziv": "Posteri" },
    { "naziv": "Rollups" },
    { "naziv": "Fototapete" }
  ]
}
```

```json
{
  "naziv": "Kreativne štampe",
  "podkategorije": [
    { "naziv": "Šolje" },
    { "naziv": "Štampa na majicama" },
    { "naziv": "Štampa na duksevima" },
    { "naziv": "Štampa na cegerima" }
  ]
}
```

---

## Kolekcija `users`

Polja (zajednička za sve tipove): `kor_ime` (string, unique), `lozinka` (string — **bcrypt
hash**, nikad plain text), `ime`, `prezime`, `telefon`, `mejl` (string, unique), `slika` (string
— putanja/naziv fajla, podrazumevano `default_profile_image.jpg`), `tip` (jedno od: `"fizicko"`,
`"pravno"`, `"stampar"`, `"admin"`), `status` (jedno od: `"na_cekanju"`, `"odobren"`,
`"odbijen"`).

Dodatna polja **samo** za `tip: "pravno"` i `tip: "stampar"`: `nazivInstitucije` (string),
`adresa` (string), `grad` (string), `maticniBroj` (string, unique, tačno 8 cifara), `pib`
(string, unique, tačno 9 cifara, ne počinje sa 0).

Polja za reset zaboravljene lozinke: `resetTokenHash` (string, SHA-256 heš privremenog tokena,
`null` kad nije aktivan zahtev za reset) i `resetTokenIstice` (datum isteka, 5 minuta od zahteva).
Ne treba ih ručno postavljati — postavlja ih i briše aplikacija sama kroz tok resetovanja
lozinke.

Za sada ubaci samo admin nalog (registracija ostalih korisnika ide kroz aplikaciju od Faze 1
nadalje, pa ćeš njih dodavati kroz UI, ne ručno):

```json
{
  "kor_ime": "admin",
  "lozinka": "$2b$10$3O9o5bLbzRO3hK0KFmkv6uPdeGjDZC4aS.sIw6LppIhkIkJQfd5za",
  "ime": "Admin",
  "prezime": "Administrator",
  "telefon": "",
  "mejl": "admin@stamparija.rs",
  "slika": "default_profile_image.jpg",
  "tip": "admin",
  "status": "odobren"
}
```

Ovo je bcrypt hash za lozinku `Admin123!` (generisan sa istom bcrypt bibliotekom koju backend
koristi, cost factor 10) — na login formi za admina kucaš `admin` / `Admin123!`. Ako želiš
drugu lozinku, javi mi pa ti generišem odgovarajući hash, ili je promeni kasnije direktno u
bazi.

---

## Kolekcija `products`

Polja: `naziv`, `kratakOpis`, `duziOpis`, `cena` (broj), `kategorija` (string — mora se tačno
poklapati sa `naziv` iz kolekcije `categories`, npr. `"Kreativne štampe"`), `podkategorija`
(string), `kreator` (string — `kor_ime` štamparije vlasnika, mora postojati u `users` sa
`tip: "stampar"` i `status: "odobren"` da bi se proizvod uopšte pojavio u katalogu), `kolicinaNaStanju`
(broj — `0` znači da se proizvod ne prikazuje u pretrazi ni na početnoj strani), `slike` (niz
stringova, može ostati `[]` dok ne uradimo upload proizvoda u Fazi 5), `boje` (niz stringova),
`tipoviStampe` (niz `{ naziv, maxSirinaMm, maxVisinaMm, dodatnaCenaPoKomadu }`, može ostati
`[]`), `lajkovi` (broj), `dislajkovi` (broj).

Pravo dodavanje proizvoda kroz UI (štampar registruje nalog pa dodaje proizvode) stiže u Fazi 5.
Do tada, ako želiš da vidiš katalog/početnu stranu sa pravim sadržajem, možeš ručno ubaciti
par test proizvoda — zameni `"kreator"` ispod sa `kor_ime` štamparije koju registruješ i odobriš:

```json
{
  "naziv": "Hemijska olovka",
  "kratakOpis": "Plava hemijska olovka sa logom",
  "duziOpis": "Kvalitetna plasticna hemijska olovka, idealna za brendiranje.",
  "cena": 50,
  "kategorija": "Štampa malih formata",
  "podkategorija": "Olovke",
  "kreator": "TVOJA_STAMPARIJA_KOR_IME",
  "kolicinaNaStanju": 200,
  "slike": [],
  "boje": ["Bela", "Plava"],
  "tipoviStampe": [],
  "lajkovi": 12,
  "dislajkovi": 1
}
```

```json
{
  "naziv": "Pamučna polo majica",
  "kratakOpis": "Polo majica 180g/m2",
  "duziOpis": "Kvalitetna pamucna polo majica, pogodna za brendiranje i korporativne uniforme.",
  "cena": 1200,
  "kategorija": "Kreativne štampe",
  "podkategorija": "Štampa na majicama",
  "kreator": "TVOJA_STAMPARIJA_KOR_IME",
  "kolicinaNaStanju": 150,
  "slike": [],
  "boje": ["Bela", "Crna", "Tamno plava"],
  "tipoviStampe": [
    { "naziv": "Direktna štampa na tekstil (DTG)", "maxSirinaMm": 300, "maxVisinaMm": 400, "dodatnaCenaPoKomadu": 350 }
  ],
  "lajkovi": 27,
  "dislajkovi": 2
}
```

## Kolekcija `invoices` — šema (za kasnije, referenca)

`kupac` (ObjectId → `users`), `stampar` (ObjectId → `users`), `stavke` (niz `{ proizvod,
naziv, kolicina, cenaPoJedinici, boja, tipStampe, tekstPersonalizacije, ukupnaCenaStavke }`),
`ukupanIznos` (broj), `status` (`"naruceno"` | `"u_stampi"` | `"isporuceno"` | `"primljeno"` |
`"otkazano"`), `datumNarudzbine` (datum). Puni se kroz aplikaciju u Fazi 4 (klijent potvrđuje
e-korpu). Klijent može da otkaže porudžbinu (status → `"otkazano"`) samo dok je status još
`"naruceno"`.

---

## Statična slika

Backend servira `/uploads` folder statički (`backend/uploads/`). Tamo je već ubačen
`default_profile_image.jpg` kao placeholder — zameni ga svojom slikom po želji, samo zadrži
isto ime fajla.
