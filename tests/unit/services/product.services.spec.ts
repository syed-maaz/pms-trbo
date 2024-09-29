import { deepEqual, instance, mock, verify, when } from "ts-mockito"; // For mocking
import { ProductRepository } from "../../../src/repositories/product.repository";
import { ProductService } from "../../../src/services/product.service";

describe("ProductService", () => {
  let productService: ProductService;
  let productRepository: ProductRepository;

  beforeEach(() => {
    // Mock the ProductRepository
    productRepository = mock(ProductRepository);

    // Pass the mocked repository to the service
    productService = new ProductService(instance(productRepository));
  });

  /**
   * Test case: List products with filters
   */
  it("should list products with correct filters and sorting", async () => {
    const filters = { price: 9.99 };
    const sortBy = "price";
    const order = "ASC";

    // Mock repository response
    when(
      productRepository.findAll(deepEqual(filters), sortBy, order)
    ).thenResolve([{ title: "Pizza Margherita", price: 9.99 } as any]);

    // Call the service method
    const result = await productService.listProducts(filters, sortBy, order);

    // Verify that the repository method was called with the correct parameters
    verify(productRepository.findAll(deepEqual(filters), sortBy, order)).once();

    // Check the result
    expect(result).toEqual([{ title: "Pizza Margherita", price: 9.99 }]);
  });

  /**
   * Test case: Recommend products based on SKU
   */
  it("should recommend products based on SKU", async () => {
    const sku = "PIZZA01";

    // Mock repository response for related SKUs
    when(productRepository.findRelatedSkus(sku)).thenResolve([
      "PIZZA02",
      "PIZZA03",
    ]);

    // Call the service method
    const result = await productService.recommendProducts(sku);

    // Verify that the repository method was called
    verify(productRepository.findRelatedSkus(sku)).once();

    // Check the result
    expect(result).toEqual(["PIZZA02", "PIZZA03"]);
  });
});
