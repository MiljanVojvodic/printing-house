import express from "express";
import ProductModel from "../models/product";
import UserModel from "../models/user";

// Za dati niz proizvoda, doda naziv i grad stamparije (kreatora) u svaki
// objekat, jednim batch upitom nad korisnicima (kreator je string kor_ime,
// ne Mongo ref).
async function saPodacimaOStampariji(proizvodi: any[]) {
  const korIsmena = [...new Set(proizvodi.map((p) => p.kreator))];
  const stamparije = await UserModel.find({ kor_ime: { $in: korIsmena } });
  const mapa = new Map(stamparije.map((s) => [s.kor_ime, s]));

  return proizvodi.map((p) => {
    const obj = p.toObject ? p.toObject() : p;
    const st = mapa.get(p.kreator);
    return {
      ...obj,
      nazivStamparije: st?.nazivInstitucije || "",
      gradStamparije: st?.grad || "",
    };
  });
}

export class ProductController {
  getAll = (req: express.Request, res: express.Response) => {
    ProductModel.find({})
      .then((products) => {
        res.json(products);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "error" });
      });
  };

  top5 = async (req: express.Request, res: express.Response) => {
    try {
      const proizvodi = await ProductModel.find({})
        .sort({ lajkovi: -1 })
        .limit(5);
      res.json(await saPodacimaOStampariji(proizvodi));
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  pretraga = async (req: express.Request, res: express.Response) => {
    try {
      const naziv = (req.query.naziv as string) || "";
      const kategorija = (req.query.kategorija as string) || "";

      const upit: any = { kolicinaNaStanju: { $gt: 0 } };
      if (naziv.trim()) {
        upit.naziv = { $regex: naziv.trim(), $options: "i" };
      }
      if (kategorija && kategorija !== "Sve kategorije") {
        upit.kategorija = kategorija;
      }

      const proizvodi = await ProductModel.find(upit);
      res.json(await saPodacimaOStampariji(proizvodi));
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  getById = async (req: express.Request, res: express.Response) => {
    try {
      const proizvod = await ProductModel.findById(req.params.id);
      if (!proizvod) {
        return res.status(404).json({ message: "Proizvod ne postoji." });
      }
      const [saStamparijom] = await saPodacimaOStampariji([proizvod]);
      res.json(saStamparijom);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: "Proizvod ne postoji." });
    }
  };
}
