// Type for a row from the products table (joined with categories and diets)
export type ProductRow = {
  id: number;
  title: string;
  price: number;
  stock: string | number;
  sku: string;
  category_id: number;
  diet_id: number;
  category: string;
  diet: string;
  link: string;
  image_link: string;
  pizza_type: string;
  sale_price: number;
  explanation: string;
  rating: number;
  rating_count: number;
};

// Type for a row from the diets table
export type DietRow = {
  id: number;
  name: string;
};

// Type for a row from the categories table
export type CategoryRow = {
  id: number;
  name: string;
};

// Type for a row from the product_sales table
export type RelatedSkusRow = {
  related_skus: string;
};
