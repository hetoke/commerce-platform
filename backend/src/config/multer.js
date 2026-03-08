import multer from "multer";
import path from "path";

const fileFilter = (_, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only jpg, jpeg, png, and webp are allowed."));
  }
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});