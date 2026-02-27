import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    path: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);