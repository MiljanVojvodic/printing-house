import express from "express";
import ProductModel from "../models/product";

export class ProductController {
  add = (req: express.Request, res: express.Response) => {
    let proizvod = new ProductModel(req.body);
    let x = 1;

    ProductModel.find({}).sort({ idP: -1 }).limit(1)
      .then((max) => {
        if (max.length > 0) {
          // provera za slucaj da je kolekcija inicijalno prazna
          // tada ce prvi objekat imati id = x = 1
          // ako kolekcija nije prazna, dodelicemo prvi sledeci id
          x = max[0].idP! + 1;
        }

        proizvod.idP = x;

        proizvod.save().then((p) => {
            res.status(200).json({ message: "proizvod added" });
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json({ message: "error" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "error" });
      });
  };

  getAllProductsInShop = (req: express.Request, res: express.Response) => {
    ProductModel.find({ status: "u prodavnici" })
      .then((products) => {
        res.json(products);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getAllProductsWaiting = (req: express.Request, res: express.Response) => {
    ProductModel.find({ status: "na cekanju" })
      .then(
        products => {
          res.json(products);
        },
        err => {
          console.log(err);
        }
        // moze i ovakav zapis, bez catch
      );
  };

  like = (req: express.Request, res: express.Response) => {
    let idP = req.body.idP;

    ProductModel.findOneAndUpdate({ idP: idP }, { $inc: { lajkovi: 1 } })
      .then((success) => {
        res.json({ msg: "Success" });
      })
      .catch((err) => console.log(err));
  };

  change = (req: express.Request, res: express.Response) => {
    let idP = req.body.idP;
    let status = req.body.status;
    let cena = req.body.cena;

    ProductModel.findOneAndUpdate({ idP: idP }, { status: status, cena: cena })
      .then((success) => {
        res.json({ msg: "Success" });
      })
      .catch((err) => console.log(err));
  };
}
