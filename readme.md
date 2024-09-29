# Product Management Microservice (trbo-pms)

This is a **Product Management Microservice** built using **Node.js** and **TypeScript**. The microservice is responsible for handling product-related operations such as listing, importing from CSV, selling products, managing stock, and recommending related products based on sales data. JWT-based authentication is used to secure API endpoints, and tests are written using **Jest**  to ensure proper functionality.

## Features

- **Product Listing**: Retrieve products with various filters (price, SKU, stock, title) and sorting options (price, SKU, last updated).
- **Product Import**: Import products from a CSV file (admin access required).
- **Product Selling**: Decrease stock when products are sold and track relationships between SKUs bought together.
- **Product Recommendations**: Recommend related products based on SKU.
- **JWT Authentication**: Secures routes with role-based access (admin/user).
- **Comprehensive Testing**: Unit and integration tests using **Jest** and **Supertest**.

## Technologies Used

- **Node.js**: Core framework for the application.
- **TypeScript**: Provides type safety and better code clarity.
- **Express.js**: Web framework for routing and handling middleware.
- **SQLite/PostgreSQL**: Database for storing product information.
- **JWT**: Used for securing routes with role-based access control (admin/user).
- **Multer**: For handling CSV file uploads.
- **Jest**: Testing framework.
- **Supertest**: Used for integration testing of HTTP routes.
- **ts-mockito**: For mocking dependencies in unit tests.
- **Pino**: Fast logger for tracking application logs.
- **dotenv**: Loads environment variables from `.env` file.

## Installation and Setup

1. Clone the repository:
bash
   git clone https://github.com/your-username/trbo-pms.git
   cd trbo-pms
   
2. Install dependencies:
bash
   npm install
   
3. Create an `.env` file in the project root and configure the following environment variables:
env
   NODE_ENV=development
   JWT_SECRET=yourSecretKey
   PORT=3000
   DB_FILENAME=trbo_pms.db
   
4. Run the project in development mode:
bash
   npm run start:dev
   
5. To build the project for production:
bash
   npm run build
   
6. Start the production server:
bash
   npm run start:prod
   
## API Endpoints

### **Product Routes**

- **GET /v1/products**: Retrieve a list of products with optional filters and sorting.
  - **Filters**: `price`, `sku`, `stock`, `title`.
  - **Sorting**: `price`, `sku`, `last_updated` (supports `ASC` and `DESC`).

- **POST /v1/products/import**: Import products via CSV file upload (Admin only).
  - Requires Bearer Token for Admin authentication.
  - Upload the CSV file with a valid format.

- **POST /v1/products/sell**: Sell products and reduce stock. Tracks relationships between sold SKUs.
  - Requires Bearer Token for User authentication.

- **GET /v1/products/recommend/:sku**: Recommend products based on a provided SKU.

### **Sample Request for Listing Products**:
bash
GET /v1/products?price=9.99&sortBy=price&order=ASC
### **CSV Import Example**:
bash
POST /v1/products/import
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
File: products.csv
## Testing

Tests include both unit and integration tests, covering routes, services, and database interactions.

1. Run the test suite:
bash
   npm run test
   
2. Check code coverage:
bash
   npm run test -- --coverage
   
## Example Test Cases

### **product.routes.spec.ts**

- **Import Products**: Test for uploading products from CSV.
- **List Products**: Test with various filters (price, SKU, stock level, title).
- **Sell Products**: Test product selling and stock reduction.
- **Recommend Products**: Test recommendations based on SKU.
- **Error Handling**: Handles cases like missing file uploads, invalid tokens, or incorrect sorting values.

### **product.services.spec.ts**

- **Product Listing**: Tests service layer for listing products with filters and sorting.
- **Product Recommendations**: Tests product recommendations based on SKU.
- **Unit Tests**: Mocks the repository layer using `ts-mockito` for isolation.

## Folder Structure

├── src
│   ├── app.ts                   # Application entry point
│   ├── controllers               # Controllers for handling HTTP requests
│   ├── services                  # Business logic layer
│   ├── repositories              # Database access layer
│   ├── routes                    # Route definitions
│   └── middlewares               # Middlewares for auth, error handling, etc.
├── tests
│   ├── integration               # Integration tests
│   ├── unit                      # Unit tests
│   ├── helpers                   # Helpers for test cases (e.g., JWT)
│   └── mocks                     # Mock files for testing (e.g., CSV files)
├── .env                          # Environment variables
├── jest.config.js                # Jest configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
## Development

### Running in Development Mode
bash
npm run start:dev
This uses `nodemon` to watch for file changes and automatically restart the server.

### Linting
bash
npm run lint
Runs **ESLint** to check for code quality and consistency.

## Environment Variables

- `NODE_ENV`: The environment mode (development, production, test).
- `JWT_SECRET`: Secret key for JWT token signing.
- `PORT`: The port number for the server.
- `DB_FILENAME`: The filename for the SQLite database (or connection string for PostgreSQL).

## Logging

- Uses **Pino** for fast, lightweight logging.
- Logs are output to the console during development and production.

## Database

- Uses **SQLite** in development mode for quick, file-based storage.
- Can be switched to **PostgreSQL** for production by adjusting the database connection string.

## JWT Authentication

- **Admin Token**: Required for importing products.
- **User Token**: Required for listing, filtering, and selling products.
- Tokens are generated dynamically during tests using **jsonwebtoken**.

## Contribution

To contribute to this project:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Submit a pull request.


## Contact

For further questions or support, reach out to the author.

---
