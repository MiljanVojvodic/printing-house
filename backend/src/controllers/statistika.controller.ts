import express from "express";
import InvoiceModel from "../models/invoice";
import RecenzijaModel from "../models/recenzija";

const TOP_PROIZVODA_U_PITA_GRAFIKONU = 7;

export class StatistikaController {
  prometPoStampariji = async (req: express.Request, res: express.Response) => {
    try {
      const trimeseciUnazad = new Date();
      trimeseciUnazad.setMonth(trimeseciUnazad.getMonth() - 3);

      const rezultat = await InvoiceModel.aggregate([
        {
          $match: {
            datumNarudzbine: { $gte: trimeseciUnazad },
            status: { $ne: "otkazano" },
          },
        },
        {
          $group: {
            _id: "$stampar",
            ukupanPromet: { $sum: "$ukupanIznos" },
          },
        },
        { $sort: { ukupanPromet: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "stampar",
          },
        },
        { $unwind: "$stampar" },
        {
          $project: {
            _id: 0,
            naziv: "$stampar.nazivInstitucije",
            ukupanPromet: 1,
          },
        },
      ]);

      res.json(rezultat);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  najcesceNarucivaniProizvodi = async (req: express.Request, res: express.Response) => {
    try {
      const mesecUnazad = new Date();
      mesecUnazad.setMonth(mesecUnazad.getMonth() - 1);

      const rezultat = await InvoiceModel.aggregate([
        {
          $match: {
            datumNarudzbine: { $gte: mesecUnazad },
            status: { $ne: "otkazano" },
          },
        },
        { $unwind: "$stavke" },
        {
          $group: {
            _id: "$stavke.naziv",
            kolicina: { $sum: "$stavke.kolicina" },
          },
        },
        { $sort: { kolicina: -1 } },
      ]);

      const top = rezultat.slice(0, TOP_PROIZVODA_U_PITA_GRAFIKONU);
      const ostalo = rezultat
        .slice(TOP_PROIZVODA_U_PITA_GRAFIKONU)
        .reduce((zbir, r) => zbir + r.kolicina, 0);

      const konacno = top.map((r) => ({ naziv: r._id, kolicina: r.kolicina }));
      if (ostalo > 0) {
        konacno.push({ naziv: "Ostalo", kolicina: ostalo });
      }

      res.json(konacno);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  ocenaProizvodaKrozVreme = async (req: express.Request, res: express.Response) => {
    try {
      const recenzije = await RecenzijaModel.find({})
        .populate("proizvod", "naziv")
        .sort({ datum: 1 });

      const poProizvodu = new Map<
        string,
        { naziv: string; tacke: { datum: Date; ocena: number }[] }
      >();

      for (const r of recenzije) {
        const proizvod = r.proizvod as any;
        if (!proizvod) continue;

        const id = String(proizvod._id);
        if (!poProizvodu.has(id)) {
          poProizvodu.set(id, { naziv: proizvod.naziv, tacke: [] });
        }
        const zapis = poProizvodu.get(id)!;
        const prethodnaOcena =
          zapis.tacke.length > 0 ? zapis.tacke[zapis.tacke.length - 1].ocena : 0;
        const delta = r.tipReakcije === "lajk" ? 1 : -1;
        zapis.tacke.push({ datum: r.datum!, ocena: prethodnaOcena + delta });
      }

      const rezultat = [...poProizvodu.entries()].map(([id, v]) => ({
        proizvodId: id,
        naziv: v.naziv,
        tacke: v.tacke,
      }));

      res.json(rezultat);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };
}
