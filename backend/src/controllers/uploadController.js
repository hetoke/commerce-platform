// controllers/uploadController.js
import { buildProductImagePath } from "../services/uploadService.js";

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  return res.status(201).json({
    path: buildProductImagePath(req.file.filename),
  });
};