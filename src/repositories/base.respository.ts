import { db } from "../db";
import { logger } from "../utils/logger";

export abstract class BaseRepository {
  // Execute a query for insert/update/delete operations
  protected async runQuery(query: string, params: any[] = []): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.run(query, params, (err: Error | null) => {
        if (err) {
          logger.error(`Database error on query: ${query}`, err);
          reject(new Error(`Database error: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  // Execute a query for fetching a single result
  protected async getQuery<T>(
    query: string,
    params: any[] = []
  ): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      db.get(query, params, (err: Error | null, row: T | undefined) => {
        if (err) {
          logger.error(`Database error on query: ${query}`, err);
          reject(new Error(`Database error: ${err.message}`));
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // Execute a query for fetching multiple results
  protected async allQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      db.all(query, params, (err: Error | null, rows: T[]) => {
        if (err) {
          logger.error(`Database error on query: ${query}`, err);
          reject(new Error(`Database error: ${err.message}`));
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Start a transaction
  async beginTransaction(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err: Error | null) => {
        if (err) {
          logger.error("Failed to begin transaction", err);
          reject(new Error(`Failed to begin transaction: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  // Commit a transaction
  async commitTransaction(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.run("COMMIT", (err: Error | null) => {
        if (err) {
          logger.error("Failed to commit transaction", err);
          reject(new Error(`Failed to commit transaction: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  // Rollback a transaction
  async rollbackTransaction(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.run("ROLLBACK", (err: Error | null) => {
        if (err) {
          logger.error("Failed to rollback transaction", err);
          reject(new Error(`Failed to rollback transaction: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }
}
