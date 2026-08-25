import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { imageSize } from "image-size";

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

const DOZVOLJENI_TIPOVI = ["image/jpeg", "image/png", "image/gif"];

function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (DOZVOLJENI_TIPOVI.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Slika mora biti u JPG, PNG ili GIF formatu."));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const MIN_DIMENZIJA = 100;
const MAX_DIMENZIJA = 250;

// Vraca poruku o gresci ako slika ne zadovoljava dimenzije (100x100 do 250x250),
// ili null ako je sve u redu. Brise fajl sa diska ako je nevalidan.
export function proveriDimenzijeSlike(filePath: string): string | null {
  try {
    const { width, height } = imageSize(fs.readFileSync(filePath));
    if (
      !width ||
      !height ||
      width < MIN_DIMENZIJA ||
      width > MAX_DIMENZIJA ||
      height < MIN_DIMENZIJA ||
      height > MAX_DIMENZIJA
    ) {
      fs.unlinkSync(filePath);
      return `Slika mora biti izmedju ${MIN_DIMENZIJA}x${MIN_DIMENZIJA} i ${MAX_DIMENZIJA}x${MAX_DIMENZIJA} piksela.`;
    }
    return null;
  } catch (err) {
    fs.unlinkSync(filePath);
    return "Slika je ostecena ili u nepodrzanom formatu.";
  }
}
