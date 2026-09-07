import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TipStampe = new Schema(
  {
    naziv: { type: String, required: true },
    maxSirinaMm: { type: Number },
    maxVisinaMm: { type: Number },
    dodatnaCenaPoKomadu: { type: Number, default: 0 },
  },
  { _id: false }
);

let Product = new Schema({
  naziv: {
    type: String,
    required: true,
  },
  kratakOpis: {
    type: String,
  },
  duziOpis: {
    type: String,
  },
  cena: {
    type: Number,
    required: true,
  },
  kategorija: {
    type: String,
    required: true,
  },
  podkategorija: {
    type: String,
    required: true,
  },
  kreator: {
    type: String,
    required: true,
  },
  kolicinaNaStanju: {
    type: Number,
    default: 0,
  },
  slike: {
    type: [String],
    default: [],
  },
  boje: {
    type: [String],
    default: ["Bela"],
  },
  tipoviStampe: {
    type: [TipStampe],
    default: [],
  },
  lajkovi: {
    type: Number,
    default: 0,
  },
  dislajkovi: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("ProductModel", Product, "products");
