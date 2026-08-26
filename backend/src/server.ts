import path from "path";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routers/user.router";
import productRouter from "./routers/product.router";
import categoryRouter from "./routers/category.router";
import invoiceRouter from "./routers/invoice.router";
import recenzijaRouter from "./routers/recenzija.router";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

mongoose.connect("mongodb://127.0.0.1:27017/stamparija");
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("db connection ok");
});

const router = express.Router();
router.use("/users", userRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/invoices", invoiceRouter);
router.use("/recenzije", recenzijaRouter);

app.use("/", router);

app.listen(4000, () => console.log(`Express server running on port 4000`));
