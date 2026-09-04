import mongoose from "mongoose";

const Schema = mongoose.Schema;

const StavkaFakture = new Schema(
  {
    proizvod: { type: mongoose.Schema.Types.ObjectId, ref: "ProductModel", required: true },
    naziv: { type: String, required: true },
    kolicina: { type: Number, required: true },
    cenaPoJedinici: { type: Number, required: true },
    boja: { type: String },
    tipStampe: { type: String },
    tekstPersonalizacije: { type: String },
    ukupnaCenaStavke: { type: Number, required: true },
  },
  { _id: false }
);

let Invoice = new Schema({
  kupac: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  stampar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  stavke: {
    type: [StavkaFakture],
    default: [],
  },
  ukupanIznos: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["naruceno", "u_stampi", "isporuceno", "primljeno", "otkazano"],
    default: "naruceno",
  },
  datumNarudzbine: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("InvoiceModel", Invoice, "invoices");
