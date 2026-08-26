import express from "express";
import { JavnaNabavkaController } from "../controllers/javna-nabavka.controller";
const javnaNabavkaRouter = express.Router();

javnaNabavkaRouter
  .route("/pokreni")
  .post((req, res) => new JavnaNabavkaController().pokreni(req, res));

javnaNabavkaRouter
  .route("/klijent/:klijentId")
  .get((req, res) => new JavnaNabavkaController().mojeNabavke(req, res));

javnaNabavkaRouter
  .route("/otvorene")
  .get((req, res) => new JavnaNabavkaController().otvorene(req, res));

javnaNabavkaRouter
  .route("/stampar/:stamparId")
  .get((req, res) => new JavnaNabavkaController().zaStampara(req, res));

javnaNabavkaRouter
  .route("/:id/ponuda")
  .post((req, res) => new JavnaNabavkaController().posaljiPonudu(req, res));

export default javnaNabavkaRouter;
