import express from "express";
import { CategoryController } from "../controllers/category.controller";
const categoryRouter = express.Router();

categoryRouter
  .route("/all")
  .get((req, res) => new CategoryController().getAll(req, res));

categoryRouter
  .route("/aktivne")
  .get((req, res) => new CategoryController().getAktivne(req, res));

categoryRouter
  .route("/")
  .post((req, res) => new CategoryController().dodajKategoriju(req, res));

categoryRouter
  .route("/:id/podkategorije")
  .post((req, res) => new CategoryController().dodajPodkategoriju(req, res));

export default categoryRouter;
