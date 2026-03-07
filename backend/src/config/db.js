import mongoose from "mongoose";
import dns from "dns";


dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "myDatabase", // optional
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
