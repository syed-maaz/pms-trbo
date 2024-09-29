import sqlite3 from "sqlite3";
import { config } from "./config";
import { logger } from "./utils/logger";

export let db: sqlite3.Database;

export async function initDB(): Promise<void> {
  try {
    db = await openDBConnection(); // Using helper to open DB connection
    await createTables();
    logger.info("Tables created successfully");
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

// Open database connection
function openDBConnection(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(config.db.filename, (err) => {
      if (err) {
        reject(err);
      } else {
        logger.info("Database opened successfully");
        resolve(database);
      }
    });
  });
}

const pizzaTypeTable = `
    CREATE TABLE IF NOT EXISTS pizza_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    );
  `;

function createTables(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      link TEXT,
      image_link TEXT,
      diet_id INTEGER,
      category_id INTEGER,
      pizza_type TEXT,
      price REAL,
      sale_price REAL,
      explanation TEXT,
      rating REAL,
      rating_count INTEGER,
      stock INTEGER DEFAULT 0,  -- Stock management
      sku TEXT UNIQUE NOT NULL,  -- SKU must be unique
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Track the last time product was updated
      FOREIGN KEY (diet_id) REFERENCES diets(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  `;

  const sqlIngredients = `
    CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )
  `;

  const sqlProductIngredients = `
    CREATE TABLE IF NOT EXISTS product_ingredients (
        product_id INTEGER,
        ingredient_id INTEGER,
        PRIMARY KEY (product_id, ingredient_id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    )
  `;

  const sqlDiets = `
    CREATE TABLE IF NOT EXISTS diets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )
  `;

  const sqlCategories = `
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )
  `;

  const sqlProductSales = `
    CREATE TABLE IF NOT EXISTS product_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT,
        related_sku TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  return Promise.all([
    db.run(sql),
    db.run(sqlIngredients),
    db.run(sqlProductIngredients),
    db.run(sqlDiets),
    db.run(sqlCategories),
    db.run(sqlProductSales),
    db.run(pizzaTypeTable),
  ]).then(() => {
    console.log("All tables created");
  });
}
