import express from "express";
import InvoiceModel from "../models/invoice";
import ProductModel from "../models/product";
import UserModel from "../models/user";

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

      const kreiraneFakture = [];

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

        kreiraneFakture.push(faktura);

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
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Doslo je do greske prilikom potvrde narudzbine." });
    }
  };
}
