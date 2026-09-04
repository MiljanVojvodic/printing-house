import path from "path";
import PDFDocument from "pdfkit";

// pdfkit-ovi ugradjeni fontovi (Helvetica i sl.) koriste WinAnsi kodiranje
// koje NE sadrzi srpska latinicna slova sa dijakriticima (c, c, z, s, dj) -
// tekst sa tim slovima (npr. stvarno uneto ime klijenta ili naziv
// stamparije iz baze) bi se u PDF-u prikazao izobicen. DejaVu Sans je
// besplatan font (Bitstream Vera licenca, slobodna redistribucija - vidi
// assets/fonts/LICENSE-DejaVuSans.txt) sa punom podrskom za ta slova, pa
// ga registrujemo i koristimo kao podrazumevani font za sve PDF izvestaje.
const FONT_REGULAR = path.join(__dirname, "..", "..", "assets", "fonts", "DejaVuSans.ttf");
const FONT_BOLD = path.join(__dirname, "..", "..", "assets", "fonts", "DejaVuSans-Bold.ttf");

export function postaviUnicodeFont(doc: PDFKit.PDFDocument) {
  doc.registerFont("DejaVu", FONT_REGULAR);
  doc.registerFont("DejaVu-Bold", FONT_BOLD);
  doc.font("DejaVu");
}
