import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      required: true,
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      default: "customer",
    },

    avatar: String,

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