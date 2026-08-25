import express from "express";
import ProductModel from "../models/product";

// NAPOMENA: ovaj kontroler je privremeno svden na minimum da bi projekat
// ostao kompajlabilan nakon promene Product seme (Faza 0). Prave rute za
// pretragu/katalog/upravljanje proizvodima dodaju se u Fazi 2 i Fazi 5
// plana implementacije.
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
}
