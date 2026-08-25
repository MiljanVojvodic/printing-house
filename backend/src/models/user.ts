import mongoose from "mongoose";

const Schema = mongoose.Schema;

let User = new Schema({
  kor_ime: {
    type: String,
    required: true,
    unique: true,
  },
  lozinka: {
    type: String,
    required: true,
  },
  ime: {
    type: String,
    required: true,
  },
  prezime: {
    type: String,
    required: true,
  },
  telefon: {
    type: String,
  },
  mejl: {
    type: String,
    required: true,
    unique: true,
  },
  slika: {
    type: String,
    default: "default_profile_image.jpg",
  },
  tip: {
    type: String,
    enum: ["fizicko", "pravno", "stampar", "admin"],
    required: true,
  },
  status: {
    type: String,
    enum: ["na_cekanju", "odobren", "odbijen"],
    default: "na_cekanju",
  },

  // Samo za tip: "pravno" i "stampar"
  nazivInstitucije: {
    type: String,
  },
  adresa: {
    type: String,
  },
  grad: {
    type: String,
  },
  maticniBroj: {
    type: String,
    unique: true,
    sparse: true,
  },
  pib: {
    type: String,
    unique: true,
    sparse: true,
  },
});

export default mongoose.model("UserModel", User, "users");
