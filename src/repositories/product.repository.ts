import { ProductRow } from "../controllers/product.types";
import { Product } from "../entities/product.entity";
import { logger } from "../utils/logger";
import { BaseRepository } from "./base.respository";

export class ProductRepository extends BaseRepository {
  // Fetch all products with sorting
  async findAll(
    filters: { price?: number; sku?: string; stock?: string; title?: string },
    sortBy: string = "price",
    order: "ASC" | "DESC" = "ASC"
  ): Promise<Product[]> {
    let query = `
      SELECT p.*, c.name AS category, d.name AS diet 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN diets d ON p.diet_id = d.id
    `;

    const params: any[] = [];

    // Apply filters if provided
    const filterConditions: string[] = [];

    if (filters.price) {
      filterConditions.push("p.price = ?");
      params.push(filters.price);
    }

    if (filters.sku) {
      console.log("here", filters.sku);
      filterConditions.push("p.sku = ?");
      params.push(filters.sku);
    }

    if (filters.stock) {
      filterConditions.push("p.stock = ?");
      params.push(filters.stock);
    }

    if (filters.title) {
      filterConditions.push("p.title LIKE ?");
      params.push(`%${filters.title}%`);
    }

    // Append filters to the query if any were added
    if (filterConditions.length > 0) {
      query += " WHERE " + filterConditions.join(" AND ");
    }

    // Order by the specified column (defaults to price)
    query += ` ORDER BY ${sortBy} ${order}`;

    try {
      const rows = await this.allQuery<ProductRow>(query, params);
      return rows.map((row) => this.mapProduct(row));
    } catch (err) {
      logger.error("Error fetching products from the database", err);
      throw new Error("Error fetching products");
    }
  }

  // Map database row to a Product entity
  private mapProduct(row: ProductRow): Product {
    return new Product(
      row.id,
      row.title,
      row.link,
      row.image_link,
      row.pizza_type,
      row.price,
      row.sale_price,
      row.explanation,
      row.rating,
      row.rating_count,
      row.stock as number,
      row.sku,
      row.category,
      row.diet
    );
  }

  // Save a new product
  async saveProduct(product: Product): Promise<void> {
    // const transaction = await this.beginTransaction();

    try {
      // Find or insert diet, category, and price type
      const dietId = await this.findOrInsert("diets", product.diet);
      const categoryId = await this.findOrInsert(
        "categories",
        product.category
      );
      const pizzaType = await this.findOrInsert(
        "pizza_types",
        product.pizza_type
      );

      // Insert the product
      await this.runQuery(
        `INSERT INTO products (title, link, image_link, diet_id, category_id, pizza_type, price, sale_price, explanation, rating, rating_count, stock, sku, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          product.title,
          product.link,
          product.image_link,
          dietId,
          categoryId,
          pizzaType,
          product.price,
          product.sale_price,
          product.explanation,
          product.rating,
          product.rating_count,
          product.stock,
          product.sku,
        ]
      );

      // Commit transaction
      // await this.commitTransaction();

      logger.info(`Product ${product.sku} added to the database`);
    } catch (err) {
      // Rollback transaction on error
      // await this.rollbackTransaction();
      logger.error(`Error saving product ${product.sku} to the database:`, err);
      throw new Error(`Error saving product ${product.sku}`);
    }
  }

  // Find or insert a price type (for normalization)
  async findOrInsertPriceType(priceType: string): Promise<number> {
    let row = await this.getQuery<{ id: number }>(
      "SELECT id FROM price_types WHERE type = ?",
      [priceType]
    );

    if (!row) {
      await this.runQuery("INSERT INTO price_types (type) VALUES (?)", [
        priceType,
      ]);
      row = await this.getQuery<{ id: number }>(
        "SELECT id FROM price_types WHERE type = ?",
        [priceType]
      );
    }

    if (!row) {
      throw new Error(`Failed to insert or retrieve price type: ${priceType}`);
    }

    return row.id;
  }

  // Reusable function to insert/find diet, category, etc.
  async findOrInsert(table: string, name: string): Promise<number> {
    let row = await this.getQuery<{ id: number }>(
      `SELECT id FROM ${table} WHERE name = ?`,
      [name]
    );

    if (!row) {
      await this.runQuery(`INSERT INTO ${table} (name) VALUES (?)`, [name]);
      row = await this.getQuery<{ id: number }>(
        `SELECT id FROM ${table} WHERE name = ?`,
        [name]
      );
    }

    if (!row) {
      throw new Error(`Failed to insert or retrieve ${table}: ${name}`);
    }

    return row.id;
  }

  // Find product by SKU
  async findBySku(sku: string): Promise<Product | null> {
    const query = `
      SELECT p.*, c.name AS category, d.name AS diet
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN diets d ON p.diet_id = d.id
      JOIN pizza_types pt ON p.pizza_type = pt.id
      WHERE p.sku = ? AND p.stock = 1
    `;

    try {
      const row = await this.getQuery<ProductRow>(query, [sku]);
      return row ? this.mapProduct(row) : null;
    } catch (err) {
      logger.error(`Error fetching product with SKU: ${sku}`, err);
      throw new Error("Error fetching product by SKU");
    }
  }

  // Update the stock of a product
  async updateStock(product: Product): Promise<void> {
    const query =
      "UPDATE products SET stock = ?, last_updated = CURRENT_TIMESTAMP WHERE sku = ?";
    try {
      await this.runQuery(query, [product.stock, product.sku]);
      logger.info(
        `Updated stock for product ${product.sku}. New stock: ${product.stock}`
      );
    } catch (err) {
      logger.error(`Error updating stock for product ${product.sku}`, err);
      throw new Error(`Error updating stock for product ${product.sku}`);
    }
  }

  // Record a product sale
  async recordSale(sku_a: string, sku_b: string): Promise<void> {
    const query = "INSERT INTO product_sales (sku, related_sku) VALUES (?, ?)";
    try {
      await this.runQuery(query, [sku_a, sku_b]);
      logger.info(
        `Recorded sale for product ${sku_a} with related SKU: ${sku_b}`
      );
    } catch (err) {
      logger.error(
        `Error recording sale for products: ${sku_a} and ${sku_b}`,
        err
      );
      throw new Error(`Error recording sale for product ${sku_a}`);
    }
  }

  // Find related SKUs based on product sales data
  async findRelatedSkus(sku: string): Promise<string[]> {
    const query = "SELECT related_sku FROM product_sales WHERE sku = ?";
    try {
      const rows = await this.allQuery<{ related_sku: string }>(query, [sku]);
      return rows.map((row) => row.related_sku); // Return a list of related SKUs
    } catch (err) {
      logger.error(`Error fetching related SKUs for product ${sku}`, err);
      throw new Error("Error fetching related SKUs");
    }
  }
}
