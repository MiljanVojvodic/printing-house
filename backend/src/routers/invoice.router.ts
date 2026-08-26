import express from "express";
import { InvoiceController } from "../controllers/invoice.controller";
const invoiceRouter = express.Router();

invoiceRouter
  .route("/klijent/:kupacId")
  .get((req, res) => new InvoiceController().mojeNarudzbine(req, res));

invoiceRouter
  .route("/potvrdi")
  .post((req, res) => new InvoiceController().potvrdiNarudzbinu(req, res));

invoiceRouter
  .route("/stampar/:stamparId")
  .get((req, res) => new InvoiceController().narudzbineStampara(req, res));

invoiceRouter
  .route("/sledeci-status/:id")
  .post((req, res) => new InvoiceController().sledeciStatus(req, res));

invoiceRouter
  .route("/arhiva/:kupacId")
  .get((req, res) => new InvoiceController().arhivaProizvoda(req, res));

invoiceRouter
  .route("/oznaci-primljeno/:id")
  .post((req, res) => new InvoiceController().oznaciPrimljeno(req, res));

export default invoiceRouter;
