import dns from "node:dns";

import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let isConnected = false;

export const mongooseConnect = async () => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;
    console.log("✅ MongoDB Connected");
    console.log("Ready State:", mongoose.connection.readyState);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  }
};


/**
 * Disconnect MongoDB cleanly
 */
export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();

    isConnected = false;
    console.log("[MongoDB] Disconnected from MongoDB");
  }
}

