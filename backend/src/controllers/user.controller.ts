import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import UserModel from "../models/user";
import { proveriDimenzijeSlike } from "../middleware/upload";
import { posaljiMejl } from "../utils/mailer";
import {
  LOZINKA_REGEX,
  MATICNI_BROJ_REGEX,
  PIB_REGEX,
  MEJL_REGEX,
  validacionePoruke,
} from "../utils/validators";

const TRAJANJE_RESET_TOKENA_MINUTA = 5;
const FRONTEND_URL = "http://localhost:4200";

function hesirajToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const PRAVNI_TIPOVI = ["pravno", "stampar"];

function bezLozinke(user: any) {
  const obj = user.toObject();
  delete obj.lozinka;
  return obj;
}

export class UserController {
  register = async (req: express.Request, res: express.Response) => {
    try {
      const { kor_ime, lozinka, ime, prezime, telefon, mejl, tip } = req.body;
      const poruke = validacionePoruke();

      if (!["fizicko", "pravno", "stampar"].includes(tip)) {
        return res.status(400).json({ message: "Nepoznat tip korisnika." });
      }
      if (!kor_ime || !lozinka || !ime || !prezime || !mejl) {
        return res
          .status(400)
          .json({ message: "Sva obavezna polja moraju biti popunjena." });
      }
      if (!LOZINKA_REGEX.test(lozinka)) {
        return res.status(400).json({ message: poruke.lozinka });
      }
      if (!MEJL_REGEX.test(mejl)) {
        return res.status(400).json({ message: poruke.mejl });
      }

      const noviKorisnik: any = {
        kor_ime,
        ime,
        prezime,
        telefon,
        mejl,
        tip,
        status: "na_cekanju",
      };

      if (PRAVNI_TIPOVI.includes(tip)) {
        const { nazivInstitucije, adresa, grad, maticniBroj, pib } = req.body;
        if (!nazivInstitucije || !adresa || !grad || !maticniBroj || !pib) {
          return res.status(400).json({
            message: "Sva polja za pravno lice/stampariju su obavezna.",
          });
        }
        if (!MATICNI_BROJ_REGEX.test(maticniBroj)) {
          return res.status(400).json({ message: poruke.maticniBroj });
        }
        if (!PIB_REGEX.test(pib)) {
          return res.status(400).json({ message: poruke.pib });
        }
        noviKorisnik.nazivInstitucije = nazivInstitucije;
        noviKorisnik.adresa = adresa;
        noviKorisnik.grad = grad;
        noviKorisnik.maticniBroj = maticniBroj;
        noviKorisnik.pib = pib;
      }

      if (await UserModel.findOne({ kor_ime })) {
        return res
          .status(409)
          .json({ message: "Korisnicko ime je vec zauzeto." });
      }
      if (await UserModel.findOne({ mejl })) {
        return res
          .status(409)
          .json({ message: "Nalog sa ovom mejl adresom vec postoji." });
      }
      if (
        noviKorisnik.maticniBroj &&
        (await UserModel.findOne({ maticniBroj: noviKorisnik.maticniBroj }))
      ) {
        return res
          .status(409)
          .json({ message: "Maticni broj je vec registrovan." });
      }
      if (noviKorisnik.pib && (await UserModel.findOne({ pib: noviKorisnik.pib }))) {
        return res.status(409).json({ message: "PIB je vec registrovan." });
      }

      if (req.file) {
        const greska = proveriDimenzijeSlike(req.file.path);
        if (greska) {
          return res.status(400).json({ message: greska });
        }
        noviKorisnik.slika = req.file.filename;
      }

      noviKorisnik.lozinka = await bcrypt.hash(lozinka, 10);

      await new UserModel(noviKorisnik).save();
      return res.status(201).json({
        message:
          "Zahtev za registraciju je poslat. Saceka odobrenje administratora.",
      });
    } catch (err: any) {
      console.log(err);
      if (err.code === 11000) {
        return res.status(409).json({
          message:
            "Neko od unetih jedinstvenih podataka (korisnicko ime / mejl / maticni broj / PIB) je vec zauzeto.",
        });
      }
      return res
        .status(500)
        .json({ message: "Doslo je do greske prilikom registracije." });
    }
  };

  login = async (req: express.Request, res: express.Response) => {
    try {
      const { kor_ime, lozinka } = req.body;
      const user = await UserModel.findOne({ kor_ime });
      if (!user || user.tip === "admin") {
        return res
          .status(401)
          .json({ message: "Pogresno korisnicko ime ili lozinka." });
      }
      const poklapaSe = await bcrypt.compare(lozinka || "", user.lozinka);
      if (!poklapaSe) {
        return res
          .status(401)
          .json({ message: "Pogresno korisnicko ime ili lozinka." });
      }
      if (user.status === "na_cekanju") {
        return res.status(403).json({
          message: "Vas nalog jos uvek ceka odobrenje administratora.",
        });
      }
      if (user.status === "odbijen") {
        return res
          .status(403)
          .json({ message: "Vas zahtev za registraciju je odbijen." });
      }
      return res.json(bezLozinke(user));
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  adminLogin = async (req: express.Request, res: express.Response) => {
    try {
      const { kor_ime, lozinka } = req.body;
      const user = await UserModel.findOne({ kor_ime, tip: "admin" });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Pogresno korisnicko ime ili lozinka." });
      }
      const poklapaSe = await bcrypt.compare(lozinka || "", user.lozinka);
      if (!poklapaSe) {
        return res
          .status(401)
          .json({ message: "Pogresno korisnicko ime ili lozinka." });
      }
      return res.json(bezLozinke(user));
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  zatraziResetLozinke = async (req: express.Request, res: express.Response) => {
    try {
      const { korIsmeIliMejl } = req.body;
      if (!korIsmeIliMejl) {
        return res
          .status(400)
          .json({ message: "Unesite korisnicko ime ili mejl adresu." });
      }

      const user = await UserModel.findOne({
        $or: [{ kor_ime: korIsmeIliMejl }, { mejl: korIsmeIliMejl }],
      });

      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        user.resetTokenHash = hesirajToken(token);
        user.resetTokenIstice = new Date(
          Date.now() + TRAJANJE_RESET_TOKENA_MINUTA * 60 * 1000
        );
        await user.save();

        posaljiMejl(
          user.mejl!,
          "Resetovanje lozinke - Printing House",
          `Zatrazeno je resetovanje lozinke za nalog "${user.kor_ime}". ` +
            `Kliknite na sledeci link da postavite novu lozinku (link vazi ${TRAJANJE_RESET_TOKENA_MINUTA} minuta): ` +
            `${FRONTEND_URL}/nova-lozinka/${token}\n\n` +
            `Ako niste vi zatrazili ovo, slobodno ignorisite ovaj mejl.`
        );
      }

      return res.json({
        message:
          "Ako nalog sa unetim podatkom postoji, poslat je mejl sa uputstvom za resetovanje lozinke.",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  proveriTokenReset = async (req: express.Request, res: express.Response) => {
    try {
      const tokenHash = hesirajToken(String(req.params.token));
      const user = await UserModel.findOne({
        resetTokenHash: tokenHash,
        resetTokenIstice: { $gt: new Date() },
      });
      res.json({ validan: !!user });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  postaviNovuLozinku = async (req: express.Request, res: express.Response) => {
    try {
      const { token, lozinka } = req.body;
      if (!token || !lozinka) {
        return res.status(400).json({ message: "Nedostaju podaci." });
      }
      if (!LOZINKA_REGEX.test(lozinka)) {
        return res.status(400).json({ message: validacionePoruke().lozinka });
      }

      const tokenHash = hesirajToken(token);
      const user = await UserModel.findOne({
        resetTokenHash: tokenHash,
        resetTokenIstice: { $gt: new Date() },
      });
      if (!user) {
        return res.status(400).json({
          message: "Link za resetovanje lozinke je nevazeci ili je istekao.",
        });
      }

      user.lozinka = await bcrypt.hash(lozinka, 10);
      user.resetTokenHash = null;
      user.resetTokenIstice = null;
      await user.save();

      res.json({ message: "Lozinka je uspesno promenjena. Mozete se prijaviti." });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  azurirajProfil = async (req: express.Request, res: express.Response) => {
    try {
      const kor_ime = req.params.kor_ime;
      const postojeci = await UserModel.findOne({ kor_ime });
      if (!postojeci) {
        return res.status(404).json({ message: "Korisnik ne postoji." });
      }

      const { ime, prezime, telefon, mejl } = req.body;
      const poruke = validacionePoruke();

      if (!ime || !prezime || !mejl) {
        return res
          .status(400)
          .json({ message: "Ime, prezime i mejl su obavezni." });
      }
      if (!MEJL_REGEX.test(mejl)) {
        return res.status(400).json({ message: poruke.mejl });
      }

      const izmene: any = { ime, prezime, telefon, mejl };

      if (PRAVNI_TIPOVI.includes(postojeci.tip!)) {
        const { nazivInstitucije, adresa, grad } = req.body;
        if (!nazivInstitucije || !adresa || !grad) {
          return res.status(400).json({
            message: "Naziv institucije, adresa i grad su obavezni.",
          });
        }
        izmene.nazivInstitucije = nazivInstitucije;
        izmene.adresa = adresa;
        izmene.grad = grad;
      }

      if (
        mejl !== postojeci.mejl &&
        (await UserModel.findOne({ mejl, kor_ime: { $ne: kor_ime } }))
      ) {
        return res
          .status(409)
          .json({ message: "Nalog sa ovom mejl adresom vec postoji." });
      }

      if (req.file) {
        const greska = proveriDimenzijeSlike(req.file.path);
        if (greska) {
          return res.status(400).json({ message: greska });
        }
        izmene.slika = req.file.filename;
      }

      const azuriran = await UserModel.findOneAndUpdate(
        { kor_ime },
        izmene,
        { new: true }
      );
      return res.json(bezLozinke(azuriran));
    } catch (err: any) {
      console.log(err);
      if (err.code === 11000) {
        return res
          .status(409)
          .json({ message: "Nalog sa ovom mejl adresom vec postoji." });
      }
      return res
        .status(500)
        .json({ message: "Doslo je do greske prilikom azuriranja." });
    }
  };

  stamparijeCount = async (req: express.Request, res: express.Response) => {
    try {
      const broj = await UserModel.countDocuments({
        tip: "stampar",
        status: "odobren",
      });
      return res.json({ broj });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  getUser = async (req: express.Request, res: express.Response) => {
    try {
      const kor_ime = req.body.kor_ime;
      const user = await UserModel.findOne({ kor_ime });
      if (!user) {
        return res.status(404).json({ message: "Korisnik ne postoji." });
      }
      return res.json(bezLozinke(user));
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  // Admin
  sviKorisnici = async (req: express.Request, res: express.Response) => {
    try {
      const korisnici = await UserModel.find({}, "-lozinka").sort({ kor_ime: 1 });
      res.json(korisnici);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  naCekanju = async (req: express.Request, res: express.Response) => {
    try {
      const korisnici = await UserModel.find(
        { status: "na_cekanju" },
        "-lozinka"
      ).sort({ kor_ime: 1 });
      res.json(korisnici);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  azurirajStatus = async (req: express.Request, res: express.Response) => {
    try {
      const { status } = req.body;
      if (!["odobren", "odbijen", "na_cekanju"].includes(status)) {
        return res.status(400).json({ message: "Nepoznat status." });
      }
      const azuriran = await UserModel.findOneAndUpdate(
        { kor_ime: req.params.kor_ime },
        { status },
        { new: true }
      );
      if (!azuriran) {
        return res.status(404).json({ message: "Korisnik ne postoji." });
      }
      res.json(bezLozinke(azuriran));
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  obrisiNalog = async (req: express.Request, res: express.Response) => {
    try {
      const obrisan = await UserModel.findOneAndDelete({
        kor_ime: req.params.kor_ime,
      });
      if (!obrisan) {
        return res.status(404).json({ message: "Korisnik ne postoji." });
      }
      res.json({ message: "Nalog je obrisan." });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };
}
