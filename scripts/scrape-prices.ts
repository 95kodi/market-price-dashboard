import { runPriceScan } from "../src/lib/price-service";

async function main() {
  console.log("Starting price scraper script...");
  try {
    const summary = await runPriceScan();
    console.log("Price scan complete!");
    console.log("Summary:", JSON.stringify(summary, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Scraper execution failed:", err);
    process.exit(1);
  }
}

main();
