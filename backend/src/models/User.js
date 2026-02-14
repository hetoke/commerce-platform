import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true, // hashed
    },

    role: {
      type: String,
      default: "customer",
    },

    items: [
      {
        name: String,
        price: Number,
        location: String,
        description: String,
        path: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
