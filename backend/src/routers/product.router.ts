import express from "express";
import { ProductController } from "../controllers/product.controller";
import { upload } from "../middleware/upload";
const productRouter = express.Router();

productRouter
  .route("/getAll")
  .get((req, res) => new ProductController().getAll(req, res));

productRouter
  .route("/top5")
  .get((req, res) => new ProductController().top5(req, res));

productRouter
  .route("/pretraga")
  .get((req, res) => new ProductController().pretraga(req, res));

productRouter
  .route("/stampar/:korIme")
  .get((req, res) => new ProductController().getByStampar(req, res));

productRouter
  .route("/dodaj")
  .post(upload.array("slike", 6), (req, res) =>
    new ProductController().dodaj(req, res)
  );

productRouter
  .route("/kolicina/:id")
  .put((req, res) => new ProductController().azurirajKolicinu(req, res));

// Mora biti poslednja ruta - :id bi inace "pojeo" sve rute iznad.
productRouter
  .route("/:id")
  .get((req, res) => new ProductController().getById(req, res));

export default productRouter;
