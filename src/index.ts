import dotenv from "dotenv";

dotenv.config();

async function main(): Promise<void> {
  console.log("Blog Generator CLI starting...");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Ready to generate blog content.");
}

main().catch((error: Error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
