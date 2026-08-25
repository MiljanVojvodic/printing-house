import express from "express";
import { CategoryController } from "../controllers/category.controller";
const categoryRouter = express.Router();

categoryRouter
  .route("/all")
  .get((req, res) => new CategoryController().getAll(req, res));

categoryRouter
  .route("/aktivne")
  .get((req, res) => new CategoryController().getAktivne(req, res));

export default categoryRouter;
