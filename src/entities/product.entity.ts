export class Product {
  constructor(
    public id: number,
    public title: string,
    public link: string,
    public image_link: string,
    public pizza_type: string,
    public price: number,
    public sale_price: number,
    public explanation: string,
    public rating: number,
    public rating_count: number,
    public stock: number,
    public sku: string,
    public category: string,
    public diet: string,
    public last_updated?: Date
  ) {}

  // Check if the product is in stock
  public isAvailable(): boolean {
    return this.stock === 0;
  }

  // Update the stock status of the product
  public updateStock(status: number): void {
    this.stock = status;
  }
}

export const getProductColumns = (): string[] => {
  return Object.keys(
    new Product(0, "", "", "", "", 0, 0, "", 0, 0, 0, "", "", "", "" as any)
  );
};
