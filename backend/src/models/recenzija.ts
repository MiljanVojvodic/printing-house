import mongoose from "mongoose";

const Schema = mongoose.Schema;

let Recenzija = new Schema({
  proizvod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductModel",
    required: true,
  },
  klijent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  korIsmenaKlijenta: {
    type: String,
    required: true,
  },
  tipReakcije: {
    type: String,
    enum: ["lajk", "dislajk"],
    required: true,
  },
  tekst: {
    type: String,
    default: "",
  },
  datum: {
    type: Date,
    default: Date.now,
  },
});

Recenzija.index({ proizvod: 1, klijent: 1 }, { unique: true });

export default mongoose.model("RecenzijaModel", Recenzija, "recenzije");
