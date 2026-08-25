import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Podkategorija = new Schema(
  {
    naziv: { type: String, required: true },
  },
  { _id: false }
);

let Category = new Schema({
  naziv: {
    type: String,
    required: true,
    unique: true,
  },
  podkategorije: {
    type: [Podkategorija],
    default: [],
  },
});

export default mongoose.model("CategoryModel", Category, "categories");
