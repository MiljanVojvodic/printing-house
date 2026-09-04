import express from "express";
import { UserController } from "../controllers/user.controller";
import { upload } from "../middleware/upload";
const userRouter = express.Router();

userRouter
  .route("/register")
  .post(upload.single("slika"), (req, res) =>
    new UserController().register(req, res)
  );

userRouter
  .route("/login")
  .post((req, res) => new UserController().login(req, res));

userRouter
  .route("/admin-login")
  .post((req, res) => new UserController().adminLogin(req, res));

userRouter
  .route("/getUser")
  .post((req, res) => new UserController().getUser(req, res));

userRouter
  .route("/stamparije-count")
  .get((req, res) => new UserController().stamparijeCount(req, res));

userRouter
  .route("/profil/:kor_ime")
  .put(upload.single("slika"), (req, res) =>
    new UserController().azurirajProfil(req, res)
  );

userRouter
  .route("/zaboravljena-lozinka")
  .post((req, res) => new UserController().zatraziResetLozinke(req, res));

userRouter
  .route("/zaboravljena-lozinka/:token")
  .get((req, res) => new UserController().proveriTokenReset(req, res));

userRouter
  .route("/nova-lozinka")
  .post((req, res) => new UserController().postaviNovuLozinku(req, res));

userRouter
  .route("/svi")
  .get((req, res) => new UserController().sviKorisnici(req, res));

userRouter
  .route("/na-cekanju")
  .get((req, res) => new UserController().naCekanju(req, res));

userRouter
  .route("/status/:kor_ime")
  .put((req, res) => new UserController().azurirajStatus(req, res));

userRouter
  .route("/:kor_ime")
  .delete((req, res) => new UserController().obrisiNalog(req, res));

export default userRouter;
