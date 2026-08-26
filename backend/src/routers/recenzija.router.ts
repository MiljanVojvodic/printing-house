import express from "express";
import { RecenzijaController } from "../controllers/recenzija.controller";
const recenzijaRouter = express.Router();

recenzijaRouter
  .route("/")
  .post((req, res) => new RecenzijaController().posalji(req, res));

recenzijaRouter
  .route("/proizvod/:proizvodId")
  .get((req, res) => new RecenzijaController().poslednjiKomentari(req, res));

recenzijaRouter
  .route("/moja/:proizvodId/:klijentId")
  .get((req, res) => new RecenzijaController().mojaRecenzija(req, res));

export default recenzijaRouter;
