import PDFDocument from "pdfkit";

interface StavkaZaPdf {
  naziv: string;
  kolicina: number;
  cenaPoJedinici: number;
  boja?: string;
  tipStampe?: string;
  ukupnaCenaStavke: number;
}

interface PodaciZaFakturu {
  fakturaId: string;
  datum: Date;
  kupacIme: string;
  stamparijaNaziv: string;
  stamparijaGrad: string;
  stavke: StavkaZaPdf[];
  ukupanIznos: number;
}

// Generise PDF fakture u memoriji (bez cuvanja na disk) - stream se
// sakuplja u Buffer koji se zatim salje kao prilog mejla (mailer.ts).
export function generisiFakturuPdf(podaci: PodaciZaFakturu): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunkovi: Buffer[] = [];
    doc.on("data", (chunk) => chunkovi.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunkovi)));
    doc.on("error", reject);

    doc.fontSize(18).text("Printing House", { align: "center" });
    doc.fontSize(12).text("Faktura", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Broj fakture: ${podaci.fakturaId}`);
    doc.text(`Datum narudzbine: ${podaci.datum.toLocaleString("sr-RS")}`);
    doc.text(`Kupac: ${podaci.kupacIme}`);
    doc.text(`Stamparija: ${podaci.stamparijaNaziv} (${podaci.stamparijaGrad})`);
    doc.moveDown();

    doc.fontSize(12).text("Stavke", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10);
    for (const s of podaci.stavke) {
      const dodatno = [s.boja, s.tipStampe].filter(Boolean).join(", ");
      doc.text(
        `${s.naziv}${dodatno ? ` (${dodatno})` : ""} - ${s.kolicina} x ${s.cenaPoJedinici} RSD = ${s.ukupnaCenaStavke} RSD`
      );
    }

    doc.moveDown();
    doc.fontSize(12).text(`Ukupan iznos: ${podaci.ukupanIznos} RSD`, { align: "right" });

    doc.end();
  });
}
