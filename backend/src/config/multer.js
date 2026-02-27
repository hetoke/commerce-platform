// config/multer.js
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsRoot = path.resolve(process.cwd(), "uploads");
const productsDir = path.join(uploadsRoot, "products");

fs.mkdirSync(productsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, productsDir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("Only jpg, jpeg, png, and webp are allowed."));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});