import express from "express";
import RecenzijaModel from "../models/recenzija";
import ProductModel from "../models/product";

export class RecenzijaController {
  // Salje/azurira lajk-dislajk + komentar za proizvod (jedna recenzija po
  // paru proizvod-klijent). Odrzava agregatne brojace na Product-u.
  posalji = async (req: express.Request, res: express.Response) => {
    try {
      const { proizvodId, klijentId, korIme, tipReakcije, tekst } = req.body;

      if (!proizvodId || !klijentId || !korIme) {
        return res.status(400).json({ message: "Nedostaju obavezni podaci." });
      }
      if (!["lajk", "dislajk"].includes(tipReakcije)) {
        return res.status(400).json({ message: "Nepoznat tip reakcije." });
      }

      const postojeca = await RecenzijaModel.findOne({
        proizvod: proizvodId,
        klijent: klijentId,
      });

      if (postojeca) {
        if (postojeca.tipReakcije !== tipReakcije) {
          const poljeStaro = postojeca.tipReakcije === "lajk" ? "lajkovi" : "dislajkovi";
          const poljeNovo = tipReakcije === "lajk" ? "lajkovi" : "dislajkovi";
          await ProductModel.updateOne(
            { _id: proizvodId },
            { $inc: { [poljeStaro]: -1, [poljeNovo]: 1 } }
          );
        }
        postojeca.tipReakcije = tipReakcije;
        postojeca.tekst = tekst || "";
        postojeca.datum = new Date();
        await postojeca.save();
        return res.json(postojeca);
      }

      const polje = tipReakcije === "lajk" ? "lajkovi" : "dislajkovi";
      await ProductModel.updateOne({ _id: proizvodId }, { $inc: { [polje]: 1 } });

      const nova = await new RecenzijaModel({
        proizvod: proizvodId,
        klijent: klijentId,
        korIsmenaKlijenta: korIme,
        tipReakcije,
        tekst: tekst || "",
      }).save();
      res.status(201).json(nova);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Poslednjih 5 komentara za dati proizvod, za prikaz na strani detalja.
  poslednjiKomentari = async (req: express.Request, res: express.Response) => {
    try {
      const komentari = await RecenzijaModel.find({
        proizvod: req.params.proizvodId,
        tekst: { $ne: "" },
      })
        .sort({ datum: -1 })
        .limit(5);
      res.json(komentari);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Sopstvena recenzija ulogovanog klijenta za dati proizvod (ako postoji) -
  // da forma na Arhivi proizvoda moze da se predpopuni.
  mojaRecenzija = async (req: express.Request, res: express.Response) => {
    try {
      const recenzija = await RecenzijaModel.findOne({
        proizvod: req.params.proizvodId,
        klijent: req.params.klijentId,
      });
      res.json(recenzija);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };
}
