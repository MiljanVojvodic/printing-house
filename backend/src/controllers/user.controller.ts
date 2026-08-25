import express from "express";
import bcrypt from "bcrypt";
import UserModel from "../models/user";
import { proveriDimenzijeSlike } from "../middleware/upload";
import {
  LOZINKA_REGEX,
  MATICNI_BROJ_REGEX,
  PIB_REGEX,
  MEJL_REGEX,
  validacionePoruke,
} from "../utils/validators";

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

  // Azuriranje sopstvenih podataka. kor_ime (iz rute) je nepromenljivo -
  // cak i ako stigne u telu zahteva, ignorise se. Nema posebne provere
  // vlasnistva (nema tokena/sesije u ovom projektu) - frontend uvek salje
  // kor_ime ulogovanog korisnika iz localStorage.
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
}
