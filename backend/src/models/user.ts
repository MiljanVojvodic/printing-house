import mongoose from "mongoose";

const Schema = mongoose.Schema;

let User = new Schema({
  ime: {
    type: String,
  },
  prezime: {
    type: String,
  },
  kor_ime: {
    type: String,
  },
  lozinka: {
    type: String,
  },
  mejl: {
    type: String,
  },
  opstina: {
    type: String,
  },
  tip: {
    type: String,
  },
});

export default mongoose.model("UserModel", User, "users");
