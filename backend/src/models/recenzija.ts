import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Jedna recenzija po paru (proizvod, klijent) - "za svaki primljeni proizvod,
// klijent moze ostaviti svidjanje ili nesvidjanje i komentar". Ponovno slanje
// azurira postojecu recenziju umesto da pravi novu.
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
    // denormalizovano radi prikaza komentara bez dodatnog upita
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
