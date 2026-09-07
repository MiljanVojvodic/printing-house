import express from "express";
import JavnaNabavkaModel from "../models/javna-nabavka";
import PonudaModel from "../models/ponuda";
import InvoiceModel from "../models/invoice";
import UserModel from "../models/user";
import ProductModel from "../models/product";
import { posaljiMejl } from "../utils/mailer";
import { generisiIzvestajPdf } from "../utils/izvestaj-pdf";

const TRAJANJE_MINUTA = 10;

async function zatvoriIstekleNabavke() {
  const istekle = await JavnaNabavkaModel.find({
    status: "otvorena",
    rokIsteka: { $lt: new Date() },
  });

  for (const nabavka of istekle) {
    const ponude = await PonudaModel.find({ javnaNabavka: nabavka._id });

    const validne = ponude.filter((ponuda) =>
      nabavka.stavke!.every((trazena) => {
        const stavka = ponuda.stavke!.find(
          (s) => String(s.proizvod) === String(trazena.proizvod)
        );
        return !!stavka && stavka.dostupnaKolicina! >= trazena.kolicina!;
      })
    );

    let pobednik = null as (typeof ponude)[number] | null;
    for (const p of validne) {
      if (!pobednik || p.ukupnaCena! < pobednik.ukupnaCena!) {
        pobednik = p;
      }
    }

    if (pobednik) {
      const stavkeFakture = nabavka.stavke!.map((trazena) => {
        const stavkaPonude = pobednik!.stavke!.find(
          (s) => String(s.proizvod) === String(trazena.proizvod)
        )!;
        const ukupnaCenaStavke = stavkaPonude.cenaPoJedinici! * trazena.kolicina!;
        return {
          proizvod: trazena.proizvod,
          naziv: trazena.naziv!,
          kolicina: trazena.kolicina!,
          cenaPoJedinici: stavkaPonude.cenaPoJedinici!,
          boja: trazena.boja || "Bela",
          tipStampe: trazena.tipStampe || "",
          tekstPersonalizacije: trazena.tekstPersonalizacije || "",
          ukupnaCenaStavke,
        };
      });
      const ukupanIznos = stavkeFakture.reduce((z, s) => z + s.ukupnaCenaStavke, 0);

      await new InvoiceModel({
        kupac: nabavka.klijent,
        stampar: pobednik.stampar,
        stavke: stavkeFakture,
        ukupanIznos,
        status: "u_stampi",
      }).save();

      nabavka.pobednik = pobednik.stampar as any;
      nabavka.ukupanIznosPobednika = pobednik.ukupnaCena!;
    }

    nabavka.status = "zatvorena";
    await nabavka.save();
  }
}

interface StavkaZahteva {
  proizvodId: string;
  kolicina: number;
  boja: string;
  tipStampe: string;
  tekstPersonalizacije: string;
}

interface StavkaPonudeBody {
  proizvodId: string;
  cenaPoJedinici: number;
  dostupnaKolicina: number;
}

export class JavnaNabavkaController {
  pokreni = async (req: express.Request, res: express.Response) => {
    try {
      const { klijentId, stavke } = req.body as {
        klijentId: string;
        stavke: StavkaZahteva[];
      };

      if (!klijentId || !Array.isArray(stavke) || stavke.length === 0) {
        return res.status(400).json({ message: "Korpa je prazna." });
      }

      const klijent = await UserModel.findById(klijentId);
      if (!klijent || klijent.tip !== "pravno") {
        return res.status(403).json({
          message: "Javne nabavke su dostupne samo klijentima - pravnim licima.",
        });
      }

      const proizvodi = await ProductModel.find({
        _id: { $in: stavke.map((s) => s.proizvodId) },
      });
      const mapa = new Map(proizvodi.map((p) => [String(p._id), p]));

      const nabavkaStavke = stavke.map((s) => {
        const p = mapa.get(s.proizvodId);
        if (!p) {
          throw new Error("Jedan od proizvoda vise ne postoji.");
        }
        return {
          proizvod: p._id,
          naziv: p.naziv!,
          kolicina: s.kolicina,
          boja: s.boja || "Bela",
          tipStampe: s.tipStampe || "",
          tekstPersonalizacije: s.tekstPersonalizacije || "",
        };
      });

      const sada = new Date();
      const nabavka = await new JavnaNabavkaModel({
        klijent: klijent._id,
        stavke: nabavkaStavke,
        datumRaspisivanja: sada,
        rokIsteka: new Date(sada.getTime() + TRAJANJE_MINUTA * 60 * 1000),
        status: "otvorena",
      }).save();

      const stamparije = await UserModel.find({ tip: "stampar", status: "odobren" });
      const listaProizvoda = nabavkaStavke
        .map((s) => `${s.naziv} (${s.kolicina} kom)`)
        .join(", ");
      for (const s of stamparije) {
        posaljiMejl(
          s.mejl!,
          "Nova javna nabavka - Printing House",
          `Otvorena je nova licitacija (ID: ${nabavka._id}) za sledece proizvode: ${listaProizvoda}. ` +
            `Rok za dostavljanje ponuda je ${TRAJANJE_MINUTA} minuta od trenutka raspisivanja (${sada.toLocaleString(
              "sr-RS"
            )}).`
        );
      }

      res.status(201).json({
        message: "Javna nabavka je raspisana. Štamparije su obaveštene mejlom.",
        nabavkaId: nabavka._id,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Doslo je do greske prilikom raspisivanja javne nabavke." });
    }
  };

  mojeNabavke = async (req: express.Request, res: express.Response) => {
    try {
      await zatvoriIstekleNabavke();
      const nabavke = await JavnaNabavkaModel.find({ klijent: req.params.klijentId })
        .populate("pobednik", "nazivInstitucije grad")
        .sort({ datumRaspisivanja: -1 });
      res.json(nabavke);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  otvorene = async (req: express.Request, res: express.Response) => {
    try {
      await zatvoriIstekleNabavke();
      const nabavke = await JavnaNabavkaModel.find({ status: "otvorena" })
        .populate("klijent", "nazivInstitucije grad")
        .sort({ datumRaspisivanja: -1 });
      res.json(nabavke);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  zaStampara = async (req: express.Request, res: express.Response) => {
    try {
      await zatvoriIstekleNabavke();
      const ponude = await PonudaModel.find({ stampar: req.params.stamparId });
      const idsPonudjenih = ponude.map((p) => p.javnaNabavka);

      const nabavke = await JavnaNabavkaModel.find({
        $or: [{ status: "otvorena" }, { _id: { $in: idsPonudjenih } }],
      })
        .populate("klijent", "nazivInstitucije grad")
        .populate("pobednik", "nazivInstitucije")
        .sort({ datumRaspisivanja: -1 });

      const ponudaMapa = new Map(ponude.map((p) => [String(p.javnaNabavka), p]));
      const rezultat = nabavke.map((n) => ({
        ...n.toObject(),
        mojaPonuda: ponudaMapa.get(String(n._id)) || null,
      }));
      res.json(rezultat);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske." });
    }
  };

  posaljiPonudu = async (req: express.Request, res: express.Response) => {
    try {
      const { stamparId, stavke } = req.body as {
        stamparId: string;
        stavke: StavkaPonudeBody[];
      };

      const nabavka = await JavnaNabavkaModel.findById(req.params.id);
      if (!nabavka) {
        return res.status(404).json({ message: "Javna nabavka ne postoji." });
      }
      if (nabavka.status !== "otvorena" || nabavka.rokIsteka! < new Date()) {
        return res
          .status(400)
          .json({ message: "Rok za dostavljanje ponuda za ovu nabavku je istekao." });
      }

      const stampar = await UserModel.findOne({ _id: stamparId, tip: "stampar" });
      if (!stampar) {
        return res.status(403).json({ message: "Samo štamparije mogu slati ponude." });
      }

      const ukupnaCena = stavke.reduce((zbir, s) => {
        const trazena = nabavka.stavke!.find(
          (tz) => String(tz.proizvod) === s.proizvodId
        );
        return zbir + (trazena ? s.cenaPoJedinici * trazena.kolicina! : 0);
      }, 0);

      const ponuda = await PonudaModel.findOneAndUpdate(
        { javnaNabavka: nabavka._id, stampar: stampar._id },
        {
          javnaNabavka: nabavka._id,
          stampar: stampar._id,
          stavke: stavke.map((s) => ({
            proizvod: s.proizvodId,
            cenaPoJedinici: s.cenaPoJedinici,
            dostupnaKolicina: s.dostupnaKolicina,
          })),
          ukupnaCena,
          datumSlanja: new Date(),
        },
        { upsert: true, new: true }
      );

      res.status(201).json(ponuda);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske prilikom slanja ponude." });
    }
  };

  izvestajPdf = async (req: express.Request, res: express.Response) => {
    try {
      await zatvoriIstekleNabavke();

      const nabavka = await JavnaNabavkaModel.findById(req.params.id).populate(
        "klijent",
        "nazivInstitucije"
      );
      if (!nabavka) {
        return res.status(404).json({ message: "Javna nabavka ne postoji." });
      }
      if (nabavka.status !== "zatvorena") {
        return res.status(400).json({
          message: "Izvestaj je dostupan tek nakon zatvaranja licitacije.",
        });
      }

      const ponude = await PonudaModel.find({ javnaNabavka: nabavka._id }).populate(
        "stampar",
        "nazivInstitucije"
      );

      const pobednikId = nabavka.pobednik ? String(nabavka.pobednik) : null;

      const podaciPonude = ponude.map((p) => {
        const stampar = p.stampar as any;
        return {
          stamparNaziv: stampar?.nazivInstitucije || "Nepoznata stamparija",
          ukupnaCena: p.ukupnaCena!,
          datumSlanja: p.datumSlanja!,
          pobednik: pobednikId === String(stampar?._id ?? p.stampar),
          stavke: p.stavke!.map((s) => {
            const trazena = nabavka.stavke!.find(
              (tz) => String(tz.proizvod) === String(s.proizvod)
            );
            return {
              naziv: trazena ? trazena.naziv! : "Nepoznat proizvod",
              cenaPoJedinici: s.cenaPoJedinici!,
              dostupnaKolicina: s.dostupnaKolicina!,
            };
          }),
        };
      });

      const pdfBuffer = await generisiIzvestajPdf({
        nabavkaId: String(nabavka._id),
        datumRaspisivanja: nabavka.datumRaspisivanja!,
        klijentNaziv: (nabavka.klijent as any)?.nazivInstitucije || "",
        trazeneStavke: nabavka.stavke!.map((s) => ({
          naziv: s.naziv!,
          kolicina: s.kolicina!,
        })),
        ponude: podaciPonude,
        pobednikNaziv: podaciPonude.find((p) => p.pobednik)?.stamparNaziv || null,
        ukupanIznosPobednika: nabavka.ukupanIznosPobednika ?? null,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="izvestaj-${nabavka._id}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Doslo je do greske prilikom generisanja izvestaja." });
    }
  };
}
