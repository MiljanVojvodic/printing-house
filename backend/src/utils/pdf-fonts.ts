import path from "path";
import PDFDocument from "pdfkit";

const FONT_REGULAR = path.join(__dirname, "..", "..", "assets", "fonts", "DejaVuSans.ttf");
const FONT_BOLD = path.join(__dirname, "..", "..", "assets", "fonts", "DejaVuSans-Bold.ttf");

export function postaviUnicodeFont(doc: PDFKit.PDFDocument) {
  doc.registerFont("DejaVu", FONT_REGULAR);
  doc.registerFont("DejaVu-Bold", FONT_BOLD);
  doc.font("DejaVu");
}
