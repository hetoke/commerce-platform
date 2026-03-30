// controllers/uploadController.js
import { uploadToSupabase } from "../services/uploadService.ts";

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  try {
    const url = await uploadToSupabase(req.file);
    return res.status(201).json({ path: url });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};