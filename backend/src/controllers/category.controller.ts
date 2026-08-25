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

  // Samo kategorije koje trenutno imaju bar jedan proizvod na stanju.
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
}
