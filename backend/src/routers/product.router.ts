import express from "express";
import { ProductController } from "../controllers/product.controller";
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

// Mora biti poslednja ruta - :id bi inace "pojeo" /top5 i /pretraga.
productRouter
  .route("/:id")
  .get((req, res) => new ProductController().getById(req, res));

export default productRouter;
