import "./config/env.ts";

import app from "./app.ts";
import connectDB from "./config/db.ts";

const PORT = process.env.PORT || 5000;
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
startServer();