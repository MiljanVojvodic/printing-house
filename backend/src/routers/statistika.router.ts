import express from "express";
import { StatistikaController } from "../controllers/statistika.controller";
const statistikaRouter = express.Router();

statistikaRouter
  .route("/promet-po-stampariji")
  .get((req, res) => new StatistikaController().prometPoStampariji(req, res));

statistikaRouter
  .route("/najcesci-proizvodi")
  .get((req, res) => new StatistikaController().najcesceNarucivaniProizvodi(req, res));

statistikaRouter
  .route("/ocena-kroz-vreme")
  .get((req, res) => new StatistikaController().ocenaProizvodaKrozVreme(req, res));

export default statistikaRouter;
