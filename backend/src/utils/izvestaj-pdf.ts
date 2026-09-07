import PDFDocument from "pdfkit";
import { postaviUnicodeFont } from "./pdf-fonts";

interface StavkaPonudeZaIzvestaj {
  naziv: string;
  cenaPoJedinici: number;
  dostupnaKolicina: number;
}

interface PonudaZaIzvestaj {
  stamparNaziv: string;
  ukupnaCena: number;
  datumSlanja: Date;
  pobednik: boolean;
  stavke: StavkaPonudeZaIzvestaj[];
}

interface PodaciZaIzvestaj {
  nabavkaId: string;
  datumRaspisivanja: Date;
  klijentNaziv: string;
  trazeneStavke: { naziv: string; kolicina: number }[];
  ponude: PonudaZaIzvestaj[];
  pobednikNaziv: string | null;
  ukupanIznosPobednika: number | null;
}

export function generisiIzvestajPdf(podaci: PodaciZaIzvestaj): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunkovi: Buffer[] = [];
    doc.on("data", (chunk) => chunkovi.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunkovi)));
    doc.on("error", reject);
    postaviUnicodeFont(doc);

    doc.fontSize(18).text("Printing House", { align: "center" });
    doc.fontSize(12).text("Izveštaj o javnoj nabavci", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`ID nabavke: ${podaci.nabavkaId}`);
    doc.text(`Datum raspisivanja: ${podaci.datumRaspisivanja.toLocaleString("sr-RS")}`);
    doc.text(`Naručilac: ${podaci.klijentNaziv}`);
    doc.moveDown();

    doc.fontSize(12).text("Traženi proizvodi", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    for (const s of podaci.trazeneStavke) {
      doc.text(`${s.naziv} - ${s.kolicina} kom`);
    }
    doc.moveDown();

    doc.fontSize(12).text("Pristigle ponude", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    if (podaci.ponude.length === 0) {
      doc.text("Nije pristigla nijedna ponuda.");
    }
    for (const p of podaci.ponude) {
      doc.text(
        `${p.stamparNaziv}${p.pobednik ? " — POBEDNIK" : ""} — ukupno ${p.ukupnaCena} RSD (poslato ${p.datumSlanja.toLocaleString("sr-RS")})`
      );
      for (const s of p.stavke) {
        doc.text(`   ${s.naziv}: ${s.cenaPoJedinici} RSD/kom, dostupno ${s.dostupnaKolicina} kom`);
      }
      doc.moveDown(0.3);
    }

    doc.moveDown();
    doc.fontSize(12);
    if (podaci.pobednikNaziv) {
      doc.text(`Pobednik nabavke: ${podaci.pobednikNaziv} — ${podaci.ukupanIznosPobednika} RSD`);
    } else {
      doc.text("Nabavka je zatvorena bez pobednika.");
    }

    doc.end();
  });
}
