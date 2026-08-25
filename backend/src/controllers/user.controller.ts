import * as express from "express";
import UserModel from "../models/user";

export class UserController {
  login = (req: express.Request, res: express.Response) => {
    let kor_ime = req.body.kor_ime;
    let lozinka = req.body.lozinka;

    UserModel.findOne({ kor_ime: kor_ime, lozinka: lozinka })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => console.log(err));
  };

  getUser = (req: express.Request, res: express.Response) => {
    let kor_ime = req.body.kor_ime;

    UserModel.findOne({ kor_ime: kor_ime })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => console.log(err));
  };
}
