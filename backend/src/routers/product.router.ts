import express from "express";
import { ProductController } from "../controllers/product.controller";
const productRouter = express.Router();

productRouter
  .route("/getAllProductsSorted")
  .get((req, res) => new ProductController().getAllProductsInShop(req, res));

productRouter
  .route("/getAllProductsWaiting")
  .get((req, res) => new ProductController().getAllProductsWaiting(req, res));

productRouter
  .route("/like")
  .post((req, res) => new ProductController().like(req, res));

productRouter
  .route("/add")
  .post((req, res) => new ProductController().add(req, res));

productRouter
  .route("/change")
  .post((req, res) => new ProductController().change(req, res));

export default productRouter;
