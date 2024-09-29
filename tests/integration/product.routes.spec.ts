import path from "path";
import request from "supertest";
import app from "../../src/app";
import { generateAdminToken, generateUserToken } from "../helpers/jwt.helper"; // JWT helper

const testDBPath = path.join(__dirname, "../../test_pms.db");

describe("Product Routes", () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Generate tokens before the tests run
    adminToken = generateAdminToken();
    userToken = generateUserToken();
  });

  //   afterAll(async () => {
  //     // Delete the test database after all tests are done
  //     if (fs.existsSync(testDBPath)) {
  //       fs.unlinkSync(testDBPath); // Deletes the test database
  //     }
  //   });

  /**
   * Test for importing products from CSV file
   */
  it("should import products from CSV file (POST /v1/products/import)", async () => {
    const csvFilePath = path.join(__dirname, "../mocks/products.csv");

    const response = await request(app)
      .post("/v1/products/import")
      .set("Authorization", `Bearer ${adminToken}`) // Admin token for protected route
      .attach("file", csvFilePath); // Attach the CSV file

    expect(response.status).toBe(200); // Expect success
    expect(response.body.message).toBe("CSV import completed"); // Custom message
    expect(response.body.successful).toBeGreaterThan(0); // At least one successful import
  });

  /**
   * Test for importing products from CSV file
   */
  it("should import products from CSV file (POST /v1/products/import)", async () => {
    const csvFilePath = path.join(__dirname, "../mocks/products.csv");

    const response = await request(app)
      .post("/v1/products/import")
      .set("Authorization", `Bearer ${adminToken}`) // Admin token for protected route
      .attach("file", csvFilePath); // Attach the CSV file

    expect(response.status).toBe(200); // Expect success
    expect(response.body.message).toBe("CSV import completed"); // Custom message
    expect(response.body.successful).toBeGreaterThan(0); // At least one successful import
  });

  /**
   * Test for listing products with authorization (Basic product list)
   */
  it("should return a list of products (GET /v1/products) with authorization", async () => {
    const response = await request(app)
      .get("/v1/products")
      .set("Authorization", `Bearer ${userToken}`); // User token for authorization

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Array)); // Expect response to be an array
    expect(response.body.length).toBeGreaterThan(0); // Should return products
  });

  /**
   * Test for filtering products by price
   */
  it("should filter products by price (GET /v1/products)", async () => {
    const response = await request(app)
      .get("/v1/products")
      .query({ price: 9.9 }) // Filter by price
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0); // Products should exist with this price

    // Check that all returned products have the correct price
    response.body.forEach((product: any) => {
      expect(product.price).toBe(9.9);
    });
  });

  /**
   * Test for filtering products by SKU
   */
  it("should filter products by SKU (GET /v1/products)", async () => {
    const productResponse = await request(app)
      .get("/v1/products")
      .set("Authorization", `Bearer ${userToken}`);

    const products = productResponse.body;
    if (products.length === 0) {
      throw new Error("No products found in the API");
    }

    const sku = products.find((p: any) => p.stock === 1)?.sku;

    const response = await request(app)
      .get("/v1/products")
      .query({ sku: sku }) // Filter by SKU
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);

    expect(response.body.length).toBe(1); // Expect only one product with this SKU

    // Check that the returned product has the correct SKU
    const product = response.body[0];
    expect(product.sku).toBe(sku);
  });

  /**
   * Test for filtering products by stock level
   */
  it("should filter products by stock level (GET /v1/products)", async () => {
    const response = await request(app)
      .get("/v1/products")
      .query({ stock: 0 }) // Filter by stock
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);

    // Check that all returned products have the correct stock
    response.body.forEach((product: any) => {
      expect(product.stock).toBe(0);
    });
  });

  /**
   * Test for filtering products by title (partial match)
   */
  it("should filter products by title (GET /v1/products)", async () => {
    const response = await request(app)
      .get("/v1/products")
      .query({ title: "Pizza" }) // Filter by title (partial match)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0); // Expect products with matching titles

    // Check that all returned products have 'Pizza' in the title
    response.body.forEach((product: any) => {
      expect(product.title).toMatch(/Pizza/i);
    });
  });

  /**
   * Test for sorting products by price (ascending)
   */
  it("should sort products by price in ascending order (GET /v1/products)", async () => {
    const response = await request(app)
      .get("/v1/products")
      .query({ sortBy: "price", order: "ASC" }) // Sort by price ascending
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);

    // Ensure that the prices are sorted in ascending order
    const prices = response.body.map((product: any) => product.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b)); // Ascending order
  });

  /**
   * Test for sorting products by SKU
   */
  it("should sort products by SKU (GET /v1/products)", async () => {
    const response = await request(app)
      .get("/v1/products")
      .query({ sortBy: "sku", order: "ASC" }) // Sort by SKU ascending
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);

    // Ensure that the SKUs are sorted in ascending order
    const skus = response.body.map((product: any) => product.sku);
    expect(skus).toEqual([...skus].sort((a, b) => a.localeCompare(b)));
  });

  /**
   * Test for sorting products by last_updated
   */
  it("should sort products by last_updated in descending order (GET /v1/products)", async () => {
    const response = await request(app)
      .get("/v1/products")
      .query({ sortBy: "last_updated", order: "DESC" }) // Sort by last_updated descending
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);

    // Ensure that the products are sorted by last_updated in descending order
    const timestamps = response.body.map((product: any) =>
      new Date(product.last_updated).getTime()
    );
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a)); // Descending order
  });

  /**
   * Test for handling invalid sortBy and order values
   */
  it("should handle invalid sortBy and order values (GET /v1/products)", async () => {
    const response = await request(app)
      .get("/v1/products")
      .query({ sortBy: "invalid_column", order: "WRONG_ORDER" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(400); // Bad request due to invalid sorting options
    expect(response.body.message).toBe("Invalid sorting options provided");
  });

  /**
   * Test for missing CSV file during import
   */
  it("should return 400 when no file is uploaded (POST /v1/products/import)", async () => {
    const response = await request(app)
      .post("/v1/products/import")
      .set("Authorization", `Bearer ${adminToken}`); // Admin token for authorization

    expect(response.status).toBe(400); // Bad request due to missing file
    expect(response.body.message).toBe("No file uploaded");
  });

  /**
   * Test for 401 Unauthorized when token is missing
   */
  it("should return 401 if no token is provided (GET /v1/products)", async () => {
    const response = await request(app).get("/v1/products");

    expect(response.status).toBe(401); // Unauthorized
    expect(response.body.message).toBe(
      "Authorization header missing or malformed"
    );
  });

  /**
   * Test for 401 Unauthorized when trying to import without a token
   */
  it("should return 401 when trying to import products without a token", async () => {
    const csvFilePath = path.join(__dirname, "../mocks/products.csv");

    const response = await request(app)
      .post("/v1/products/import")
      .attach("file", csvFilePath); // Attach the CSV file without Authorization

    expect(response.status).toBe(401); // Unauthorized
    expect(response.body.message).toBe(
      "Authorization header missing or malformed"
    );
  });

  /**
   * Test for selling products and reducing stock
   */
  it("should sell products and reduce stock (POST /v1/products/sell)", async () => {
    // Fetch product SKUs via API to get valid SKUs to sell
    const productResponse = await request(app)
      .get("/v1/products")
      .set("Authorization", `Bearer ${userToken}`);

    const products = productResponse.body;
    // Take the first two products for selling
    const skusToSell = products
      .filter((d: any) => d.stock === 1)
      .slice(0, 2)
      .map((p: any) => p.sku);

    const sellPayload = { skus: skusToSell };

    // Make the sell request with the selected SKUs
    const response = await request(app)
      .post("/v1/products/sell")
      .set("Authorization", `Bearer ${userToken}`) // User token
      .send(sellPayload);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Products sold successfully");

    // Check if the stock for the sold products has been reduced
    for (const sku of skusToSell) {
      const stockResponse = await request(app)
        .get("/v1/products")
        .query({ sku })
        .set("Authorization", `Bearer ${userToken}`);

      const product = stockResponse.body[0];
      expect(product.stock).toBeLessThan(10); // Assuming the stock starts from 10
    }
  });

  /**
   * Test for recommending SKUs based on sales data
   */
  it("should recommend SKUs based on product sales (GET /v1/products/recommend/:sku)", async () => {
    // Fetch product SKUs to get valid SKUs for recommendation
    const productResponse = await request(app)
      .get("/v1/products")
      .set("Authorization", `Bearer ${userToken}`);

    const products = productResponse.body;
    const skuToCheck = products[0].sku; // Take the first product for recommendations

    // Fetch recommendations for the selected SKU
    const response = await request(app)
      .get(`/v1/products/recommend/${skuToCheck}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.recommended_products.length).toBeGreaterThan(0); // At least one recommendation should exist
  });
});
