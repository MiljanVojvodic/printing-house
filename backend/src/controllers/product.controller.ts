import express from "express";
import ProductModel from "../models/product";
import UserModel from "../models/user";
import CategoryModel from "../models/category";

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

  // Svi (sopstveni) proizvodi stamparije, ukljucujuci i one bez stanja -
  // za razliku od javne pretrage koja izuzima proizvode na 0 stanja.
  getByStampar = async (req: express.Request, res: express.Response) => {
    try {
      const proizvodi = await ProductModel.find({
        kreator: req.params.korIme,
      }).sort({ naziv: 1 });
      res.json(proizvodi);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  dodaj = async (req: express.Request, res: express.Response) => {
    try {
      const {
        naziv,
        kratakOpis,
        duziOpis,
        cena,
        kategorija,
        podkategorija,
        kreator,
        kolicinaNaStanju,
      } = req.body;

      if (!naziv || !cena || !kategorija || !podkategorija || !kreator) {
        return res.status(400).json({
          message: "Naziv, cena, kategorija, potkategorija i kreator su obavezni.",
        });
      }

      const kategorijaDok = await CategoryModel.findOne({ naziv: kategorija });
      if (!kategorijaDok) {
        return res.status(400).json({ message: "Nepoznata kategorija." });
      }
      const potkategorijaPostoji = kategorijaDok.podkategorije!.some(
        (p) => p.naziv === podkategorija
      );
      if (!potkategorijaPostoji) {
        return res
          .status(400)
          .json({ message: "Nepoznata potkategorija za odabranu kategoriju." });
      }

      const stampar = await UserModel.findOne({ kor_ime: kreator, tip: "stampar" });
      if (!stampar) {
        return res.status(400).json({ message: "Nepoznata stamparija." });
      }

      let boje: string[] = ["Bela"];
      if (req.body.boje) {
        try {
          const parsirano = JSON.parse(req.body.boje);
          if (Array.isArray(parsirano) && parsirano.length > 0) boje = parsirano;
        } catch {
          // ostaje podrazumevano ["Bela"]
        }
      }

      let tipoviStampe: any[] = [];
      if (req.body.tipoviStampe) {
        try {
          const parsirano = JSON.parse(req.body.tipoviStampe);
          if (Array.isArray(parsirano)) tipoviStampe = parsirano;
        } catch {
          // ostaje []
        }
      }

      const slike = ((req.files as Express.Multer.File[]) || []).map(
        (f) => f.filename
      );

      const noviProizvod = await new ProductModel({
        naziv,
        kratakOpis,
        duziOpis,
        cena: Number(cena),
        kategorija,
        podkategorija,
        kreator,
        kolicinaNaStanju: Number(kolicinaNaStanju) || 0,
        slike,
        boje,
        tipoviStampe,
        lajkovi: 0,
        dislajkovi: 0,
      }).save();

      res.status(201).json(noviProizvod);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Doslo je do greske prilikom dodavanja proizvoda." });
    }
  };

  azurirajKolicinu = async (req: express.Request, res: express.Response) => {
    try {
      const { kolicinaNaStanju, kor_ime } = req.body;
      if (kolicinaNaStanju === undefined || kolicinaNaStanju === null || kolicinaNaStanju < 0) {
        return res
          .status(400)
          .json({ message: "Kolicina mora biti nenegativan broj." });
      }

      const proizvod = await ProductModel.findById(req.params.id);
      if (!proizvod) {
        return res.status(404).json({ message: "Proizvod ne postoji." });
      }
      if (proizvod.kreator !== kor_ime) {
        return res
          .status(403)
          .json({ message: "Ne mozete menjati proizvod koji nije vas." });
      }

      proizvod.kolicinaNaStanju = Number(kolicinaNaStanju);
      await proizvod.save();
      res.json(proizvod);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };
}
