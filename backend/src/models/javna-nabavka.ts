import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TrazenaStavka = new Schema(
  {
    proizvod: { type: mongoose.Schema.Types.ObjectId, ref: "ProductModel", required: true },
    naziv: { type: String, required: true },
    kolicina: { type: Number, required: true },
    boja: { type: String },
    tipStampe: { type: String },
    tekstPersonalizacije: { type: String },
  },
  { _id: false }
);

let JavnaNabavka = new Schema({
  klijent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  stavke: {
    type: [TrazenaStavka],
    default: [],
  },
  datumRaspisivanja: {
    type: Date,
    default: Date.now,
  },
  rokIsteka: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["otvorena", "zatvorena"],
    default: "otvorena",
  },
  pobednik: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    default: null,
  },
  ukupanIznosPobednika: {
    type: Number,
    default: null,
  },
});

export default mongoose.model("JavnaNabavkaModel", JavnaNabavka, "javne_nabavke");
