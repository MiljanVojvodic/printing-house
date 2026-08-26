import mongoose from "mongoose";

const Schema = mongoose.Schema;

const StavkaPonude = new Schema(
  {
    proizvod: { type: mongoose.Schema.Types.ObjectId, ref: "ProductModel", required: true },
    cenaPoJedinici: { type: Number, required: true },
    // Kolicina koju stampar izjavljuje da moze da isporuci za tu stavku -
    // mora biti >= trazene kolicine da bi ponuda vazila za tu stavku.
    dostupnaKolicina: { type: Number, required: true },
  },
  { _id: false }
);

// Jedna ponuda po paru (javnaNabavka, stampar) - "stampar salje za svoju
// stampariju jednu ponudu (sa svim trazenim proizvodima) po javnoj nabavci".
let Ponuda = new Schema({
  javnaNabavka: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JavnaNabavkaModel",
    required: true,
  },
  stampar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  stavke: {
    type: [StavkaPonude],
    default: [],
  },
  ukupnaCena: {
    type: Number,
    required: true,
  },
  datumSlanja: {
    type: Date,
    default: Date.now,
  },
});

Ponuda.index({ javnaNabavka: 1, stampar: 1 }, { unique: true });

export default mongoose.model("PonudaModel", Ponuda, "ponude");
