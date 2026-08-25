import express from "express";
import InvoiceModel from "../models/invoice";

export class InvoiceController {
  mojeNarudzbine = async (req: express.Request, res: express.Response) => {
    try {
      const fakture = await InvoiceModel.find({ kupac: req.params.kupacId })
        .populate("stampar", "nazivInstitucije grad")
        .sort({ datumNarudzbine: -1 });
      res.json(fakture);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };
}
