import dns from "node:dns";

import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const mongooseConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("✅ MongoDB Connected");
    console.log("Ready State:", mongoose.connection.readyState);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  }
};
