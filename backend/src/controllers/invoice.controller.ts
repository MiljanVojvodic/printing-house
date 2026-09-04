import express from "express";
import InvoiceModel from "../models/invoice";
import ProductModel from "../models/product";
import UserModel from "../models/user";
import { generisiFakturuPdf } from "../utils/faktura-pdf";
import { posaljiMejl } from "../utils/mailer";

export class InvoiceController {
  mojeNarudzbine = async (req: express.Request, res: express.Response) => {
    try {
      const fakture = await InvoiceModel.find({ kupac: req.params.kupacId })
        .populate("stampar", "nazivInstitucije grad")
        .sort({ datumNarudzbine: -1 });
      res.json(fakture);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Prima korpu (stavke iz vise stamparija), pravi po jednu fakturu za
  // svaku stampariju, i umanjuje stanje naruceniih proizvoda. Sva provera
  // stanja se ponavlja server-side (klijent je vec proverio na frontendu,
  // ali se stanje moglo promeniti u medjuvremenu).
  potvrdiNarudzbinu = async (req: express.Request, res: express.Response) => {
    try {
      const { kupacId, stavke } = req.body as {
        kupacId: string;
        stavke: {
          proizvodId: string;
          kolicina: number;
          boja: string;
          tipStampe: string;
          tekstPersonalizacije: string;
        }[];
      };

      if (!kupacId || !Array.isArray(stavke) || stavke.length === 0) {
        return res.status(400).json({ message: "Korpa je prazna." });
      }

      const kupac = await UserModel.findById(kupacId);
      if (!kupac) {
        return res.status(404).json({ message: "Korisnik ne postoji." });
      }

      const proizvodi = await ProductModel.find({
        _id: { $in: stavke.map((s) => s.proizvodId) },
      });
      const proizvodMapa = new Map(proizvodi.map((p) => [String(p._id), p]));

      for (const s of stavke) {
        const p = proizvodMapa.get(s.proizvodId);
        if (!p) {
          return res
            .status(400)
            .json({ message: "Jedan od proizvoda vise ne postoji." });
        }
        if (!s.kolicina || s.kolicina <= 0) {
          return res
            .status(400)
            .json({ message: "Kolicina mora biti pozitivan broj." });
        }
        if (p.kolicinaNaStanju! < s.kolicina) {
          return res.status(409).json({
            message: `Nema dovoljno proizvoda trenutno na stanju za "${p.naziv}".`,
          });
        }
      }

      const grupePoStampariji = new Map<string, typeof stavke>();
      for (const s of stavke) {
        const p = proizvodMapa.get(s.proizvodId)!;
        const lista = grupePoStampariji.get(p.kreator!) || [];
        lista.push(s);
        grupePoStampariji.set(p.kreator!, lista);
      }

      const stamparije = await UserModel.find({
        kor_ime: { $in: [...grupePoStampariji.keys()] },
        tip: "stampar",
      });
      const stamparijaMapa = new Map(stamparije.map((s) => [s.kor_ime, s]));

      const kreiraneFakture: { faktura: InstanceType<typeof InvoiceModel>; stampar: InstanceType<typeof UserModel> }[] = [];

      for (const [korIme, lista] of grupePoStampariji) {
        const stampar = stamparijaMapa.get(korIme);
        if (!stampar) continue;

        const stavkeFakture = lista.map((s) => {
          const proizvod = proizvodMapa.get(s.proizvodId)!;
          const tipStampeObj = proizvod.tipoviStampe!.find(
            (t) => t.naziv === s.tipStampe
          );
          const dodatnaCena = tipStampeObj ? tipStampeObj.dodatnaCenaPoKomadu! : 0;
          const cenaPoJedinici = proizvod.cena! + dodatnaCena;
          return {
            proizvod: proizvod._id,
            naziv: proizvod.naziv!,
            kolicina: s.kolicina,
            cenaPoJedinici,
            boja: s.boja || "Bela",
            tipStampe: s.tipStampe || "",
            tekstPersonalizacije: s.tekstPersonalizacije || "",
            ukupnaCenaStavke: cenaPoJedinici * s.kolicina,
          };
        });

        const ukupanIznos = stavkeFakture.reduce(
          (zbir, st) => zbir + st.ukupnaCenaStavke,
          0
        );

        const faktura = await new InvoiceModel({
          kupac: kupac._id,
          stampar: stampar._id,
          stavke: stavkeFakture,
          ukupanIznos,
          status: "naruceno",
        }).save();

        kreiraneFakture.push({ faktura, stampar });

        for (const s of lista) {
          await ProductModel.updateOne(
            { _id: s.proizvodId, kolicinaNaStanju: { $gte: s.kolicina } },
            { $inc: { kolicinaNaStanju: -s.kolicina } }
          );
        }
      }

      const n = kreiraneFakture.length;
      const jednina = n === 1 ? "fakturu" : n >= 2 && n <= 4 ? "fakture" : "faktura";
      res.status(201).json({
        message: `Uspesno kreirano ${n} ${jednina}.`,
        brojFaktura: n,
      });

      // Slanje mejla je pomocna funkcionalnost - ne sme da uspori niti da
      // obori odgovor za samu narudzbinu (odgovor je vec poslat iznad).
      // Generisanje PDF-a se cuva u memoriji (faktura-pdf.ts), bez pisanja
      // na disk.
      (async () => {
        try {
          const prilozi = await Promise.all(
            kreiraneFakture.map(async ({ faktura, stampar }) => {
              const pdfBuffer = await generisiFakturuPdf({
                fakturaId: String(faktura._id),
                datum: faktura.datumNarudzbine!,
                kupacIme: `${kupac.ime} ${kupac.prezime}`,
                stamparijaNaziv: stampar.nazivInstitucije || stampar.kor_ime!,
                stamparijaGrad: stampar.grad || "",
                stavke: faktura.stavke!.map((s) => ({
                  naziv: s.naziv!,
                  kolicina: s.kolicina!,
                  cenaPoJedinici: s.cenaPoJedinici!,
                  boja: s.boja ?? undefined,
                  tipStampe: s.tipStampe ?? undefined,
                  ukupnaCenaStavke: s.ukupnaCenaStavke!,
                })),
                ukupanIznos: faktura.ukupanIznos!,
              });
              return { filename: `faktura-${faktura._id}.pdf`, content: pdfBuffer };
            })
          );

          posaljiMejl(
            kupac.mejl!,
            "Vasa narudzbina - Printing House",
            `Hvala na narudzbini! U prilogu ${prilozi.length === 1 ? "se nalazi faktura" : "se nalaze " + prilozi.length + " fakture"} za Vasu porudzbinu.`,
            prilozi
          );
        } catch (err) {
          console.log("Greska pri generisanju/slanju PDF fakture na mejl:", err);
        }
      })();
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Doslo je do greske prilikom potvrde narudzbine." });
    }
  };

  narudzbineStampara = async (req: express.Request, res: express.Response) => {
    try {
      const fakture = await InvoiceModel.find({ stampar: req.params.stamparId })
        .populate("kupac", "ime prezime")
        .sort({ datumNarudzbine: -1 });
      res.json(fakture);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Pomera fakturu na sledeci status u nizu naruceno -> u_stampi -> isporuceno.
  // Stampar ide samo do "isporuceno" - "primljeno" iskljucivo postavlja
  // klijent kroz Arhivu proizvoda (drugi endpoint ispod).
  sledeciStatus = async (req: express.Request, res: express.Response) => {
    try {
      const niz = ["naruceno", "u_stampi", "isporuceno"];
      const faktura = await InvoiceModel.findById(req.params.id);
      if (!faktura) {
        return res.status(404).json({ message: "Faktura ne postoji." });
      }

      const trenutniIndeks = niz.indexOf(faktura.status!);
      if (trenutniIndeks === -1 || trenutniIndeks === niz.length - 1) {
        return res
          .status(400)
          .json({ message: "Faktura je vec u zavrsnom statusu." });
      }

      faktura.status = niz[trenutniIndeks + 1] as any;
      await faktura.save();
      res.json(faktura);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Arhiva proizvoda: fakture klijenta koje su isporucene ili vec primljene.
  arhivaProizvoda = async (req: express.Request, res: express.Response) => {
    try {
      const fakture = await InvoiceModel.find({
        kupac: req.params.kupacId,
        status: { $in: ["isporuceno", "primljeno"] },
      })
        .populate("stampar", "nazivInstitucije grad")
        .sort({ datumNarudzbine: -1 });
      res.json(fakture);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Klijent otkazuje fakturu - dozvoljeno samo dok stampa jos nije pocela
  // (status "naruceno"), sto stiti sve kasnije statuse od otkazivanja.
  // Kolicina rezervisana pri potvrdi narudzbine (potvrdiNarudzbinu) se vraca
  // nazad na stanje proizvoda.
  otkaziNarudzbinu = async (req: express.Request, res: express.Response) => {
    try {
      const faktura = await InvoiceModel.findById(req.params.id);
      if (!faktura) {
        return res.status(404).json({ message: "Faktura ne postoji." });
      }
      if (faktura.status !== "naruceno") {
        return res.status(400).json({
          message: "Porudzbina se moze otkazati samo dok jos nije preneta u stampu.",
        });
      }

      for (const s of faktura.stavke!) {
        await ProductModel.updateOne(
          { _id: s.proizvod },
          { $inc: { kolicinaNaStanju: s.kolicina } }
        );
      }

      faktura.status = "otkazano";
      await faktura.save();
      res.json(faktura);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Klijent oznacava isporucenu fakturu kao primljenu.
  oznaciPrimljeno = async (req: express.Request, res: express.Response) => {
    try {
      const faktura = await InvoiceModel.findById(req.params.id);
      if (!faktura) {
        return res.status(404).json({ message: "Faktura ne postoji." });
      }
      if (faktura.status !== "isporuceno") {
        return res
          .status(400)
          .json({ message: "Faktura mora prvo biti isporucena." });
      }
      faktura.status = "primljeno";
      await faktura.save();
      res.json(faktura);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };
}
