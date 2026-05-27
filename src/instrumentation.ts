export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { default: dbConnect } = await import("@/lib/mongodb");
      await dbConnect();
      console.log(" MONGODB CONNECTED ON SERVER STARTUP");
    } catch (error) {
      console.error("❌ MongoDB startup connection failed:", error);
    }
  }
}
