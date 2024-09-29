import { Request, Response } from "express";
import path from "path";
import { instance, mock, verify, when } from "ts-mockito"; // Or use Jest Mocks
import { ProductController } from "../../../src/controllers/product.controller";
import { ProductService } from "../../../src/services/product.service";
import { generateAdminToken } from "../../helpers/jwt.helper";

// Mocking request and response objects
const mockRequest = (): Request => {
  const req = {} as Request;
  req.query = {};
  req.body = {};
  req.file = {} as Express.Multer.File;
  return req;
};

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe("ProductController", () => {
  let productController: ProductController;
  let productService: ProductService;
  let req: Request;
  let res: Response;
  let adminToken: string;

  beforeEach(() => {
    // Mock the service
    productService = mock(ProductService);
    productController = new ProductController(instance(productService));

    // Mock request and response objects
    adminToken = generateAdminToken();
    req = mockRequest();
    res = mockResponse();
  });

  it("should return 400 for invalid sortBy values (GET /products)", async () => {
    req.query.sortBy = "invalid_column"; // Invalid column

    // Call the controller method
    await productController.listProducts(req, res, jest.fn());

    // Verify that the controller responded with the correct status and message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid sorting options provided",
    });
  });

  it("should return 400 if no CSV file is uploaded (POST /products/import)", async () => {
    req.file = undefined; // Simulate no file uploaded

    // Call the controller method
    await productController.importProducts(req, res, jest.fn());

    // Verify that the controller returned a 400 error
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded" });
  });

  it("should import products from a CSV file (POST /products/import)", async () => {
    // Mock the file upload object as provided by multer
    req.file = {
      fieldname: "file",
      originalname: "products.csv",
      encoding: "7bit",
      mimetype: "text/csv",
      size: 1024,
      destination: path.join(__dirname, "../uploads"),
      filename: "products.csv",
      path: path.join(__dirname, "../../mocks/products.csv"), // Path to your CSV file
      buffer: Buffer.from(""), // If you want to simulate file contents as a buffer
    } as Express.Multer.File;

    // Mock service response
    when(productService.parseAndProcessCSV(req.file.path)).thenResolve([
      { row: { title: "Pizza Margherita" }, status: "success" },
    ]);

    // Call the controller method
    await productController.importProducts(req, res, jest.fn());

    // Verify the service was called with the correct file path
    verify(productService.parseAndProcessCSV(req.file.path)).once();

    // Check the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "CSV import completed",
      successful: 1,
      failed: 0,
      errors: [],
    });
  });
});
