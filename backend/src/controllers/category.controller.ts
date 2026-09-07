import express from "express";
import CategoryModel from "../models/category";
import ProductModel from "../models/product";

export class CategoryController {
  getAll = async (req: express.Request, res: express.Response) => {
    try {
      const kategorije = await CategoryModel.find({}).sort({ naziv: 1 });
      res.json(kategorije);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  getAktivne = async (req: express.Request, res: express.Response) => {
    try {
      const nazivi: string[] = await ProductModel.distinct("kategorija", {
        kolicinaNaStanju: { $gt: 0 },
      });
      const kategorije = await CategoryModel.find({
        naziv: { $in: nazivi },
      }).sort({ naziv: 1 });
      res.json(kategorije);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  dodajKategoriju = async (req: express.Request, res: express.Response) => {
    try {
      const naziv = (req.body.naziv || "").trim();
      if (!naziv) {
        return res.status(400).json({ message: "Naziv kategorije je obavezan." });
      }
      if (await CategoryModel.findOne({ naziv })) {
        return res.status(409).json({ message: "Kategorija sa tim nazivom vec postoji." });
      }
      const kategorija = await new CategoryModel({ naziv, podkategorije: [] }).save();
      res.status(201).json(kategorija);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  dodajPodkategoriju = async (req: express.Request, res: express.Response) => {
    try {
      const naziv = (req.body.naziv || "").trim();
      if (!naziv) {
        return res.status(400).json({ message: "Naziv potkategorije je obavezan." });
      }
      const kategorija = await CategoryModel.findById(req.params.id);
      if (!kategorija) {
        return res.status(404).json({ message: "Kategorija ne postoji." });
      }
      if (kategorija.podkategorije!.some((p) => p.naziv === naziv)) {
        return res
          .status(409)
          .json({ message: "Potkategorija sa tim nazivom vec postoji u ovoj kategoriji." });
      }
      kategorija.podkategorije!.push({ naziv } as any);
      await kategorija.save();
      res.status(201).json(kategorija);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };
}
