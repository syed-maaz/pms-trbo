import csv from "csv-parser";
import fs from "fs";
import { logger } from "./logger";

/**
 * Parses a CSV file and processes each row.
 * @param filePath Path to the CSV file.
 * @param onRow Function to call for each row. Should be an async function.
 * @returns Promise<void>
 */
export async function parseCSV(
  filePath: string,
  onRow: (row: any) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    // Create a read stream from the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        try {
          // Call the onRow callback for each parsed row
          await onRow(row);
          results.push(row);
        } catch (error) {
          logger.error("Error processing row in CSV", { row, error });
        }
      })
      .on("end", () => {
        logger.info(
          `CSV file ${filePath} parsed successfully with ${results.length} rows`
        );
        resolve();
      })
      .on("error", (err) => {
        logger.error("Error parsing CSV file", { filePath, err });
        reject(err);
      });
  });
}
