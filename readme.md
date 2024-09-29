
# Product Management Microservice (trbo-pms)

This is a **Product Management Microservice** built using **Node.js** and **TypeScript**. The microservice is responsible for handling product-related operations such as listing, importing from CSV, selling products, managing stock, and recommending related products based on sales data. JWT-based authentication is used to secure API endpoints, and tests are written using **Jest** and **Supertest** to ensure proper functionality.

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

---

## Architecture Decisions

### Domain-Driven Design (DDD)
The **Domain-Driven Design (DDD)** approach is central to the design of this microservice. We have structured the project around core business domains, which ensures that we focus on the core behavior and rules of the application instead of merely the technical implementation.

#### Why DDD?

1. **Business Logic-Centric**: DDD allows the development team to structure the application based on the business logic rather than technical concerns, which is important in a product management system where business rules (e.g., stock management, product relationships) are vital.
   
2. **Separation of Concerns**: By dividing the application into distinct domains and layers (services, repositories, controllers), the code is more modular, scalable, and easier to maintain.

3. **Adaptable to Changes**: In an evolving domain such as product management, DDD allows us to easily adapt to changing business requirements without disrupting the entire codebase. Changes in business rules or domain objects only affect the corresponding domain services.

#### Best Practices Followed

- **Layered Architecture**: The project follows a layered architecture where each layer is responsible for a specific concern:
  - **Controller Layer**: Responsible for handling HTTP requests and responses.
  - **Service Layer**: Contains business logic and rules.
  - **Repository Layer**: Handles interactions with the database.

- **Single Responsibility Principle**: Each service or class is focused on a single responsibility, which makes testing and maintaining code much easier.

- **Test-Driven Development (TDD)**: Comprehensive unit and integration tests ensure that each piece of functionality is verified, improving code quality and reducing bugs.

- **Clear Boundaries**: The boundaries between domains and services are clear, ensuring that each part of the application is independent and reusable.

---

## Database Decisions

The current implementation uses **SQLite** for development purposes due to its simplicity and zero-configuration setup. However, for production environments, **PostgreSQL** would be a more robust choice. 

### Why Use PostgreSQL?

1. **Scalability**: PostgreSQL offers better scalability and is more suited for a production environment that handles large datasets and complex queries.

2. **ACID Compliance**: PostgreSQL ensures **Atomicity, Consistency, Isolation, and Durability (ACID)**, which is critical for financial operations, such as handling stock reductions and sales transactions.

3. **Advanced Features**: PostgreSQL offers powerful features such as indexing, transactions, and support for complex queries that will be beneficial as the product grows.

4. **Data Integrity**: PostgreSQL supports advanced data integrity features like foreign key constraints, making it easier to enforce data relationships such as between products and their stock levels.

To switch to PostgreSQL, you could update the `DB_FILENAME` in the `.env` file to point to a PostgreSQL database connection string and update the ORM configuration accordingly.

---

## What Can Be Done More in the Application

### Enhancements and Future Improvements

1. **API Pagination**: Currently, the product listing API returns all products in a single response. Implementing pagination would improve performance, especially when dealing with a large number of products.

2. **Caching Layer**: Implementing a caching layer (e.g., Redis) for frequently accessed data such as product listings or recommendations would enhance performance by reducing database queries.

3. **CI/CD Integration**: Automated deployment pipelines using GitHub Actions or similar tools can be integrated to automate the deployment and testing process on staging/production environments.

4. **GraphQL Support**: Introducing GraphQL for flexible querying of product data could allow for more powerful and efficient client-side requests.

5. **Webhook Support for Orders**: The microservice could support webhooks that notify other services (e.g., order service) when a product stock changes or when products are sold together, allowing seamless communication in a microservices architecture.

---

## Code Review

1. **Clear Separation of Concerns**: The application architecture follows DDD principles and layered architecture, making the code modular and easy to maintain.

2. **Comprehensive Test Suite**: The project contains well-defined unit and integration tests with good coverage. Tests ensure that all critical functionality is verified.

3. **Security Considerations**: JWT authentication is used to protect sensitive routes (e.g., product import and sales). The role-based access (admin and user) ensures that different parts of the application are only accessible by authorized users.

4. **Extensible Codebase**: The code is structured in a way that future features can be easily added. For instance, more business rules can be added in the service layer without affecting the controllers or repositories.

5. **Solid Error Handling**: Thoughtful error handling is applied throughout the application to ensure graceful degradation and meaningful error messages for the user, preventing unhandled exceptions from crashing the app.

6. **Well-Organized Folder Structure**: The folder structure is intuitive and follows best practices, with clear separation between routes, controllers, services, and repositories.

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/trbo-pms.git
   cd trbo-pms
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create an `.env` file in the project root and configure the following environment variables:
   ```env
   NODE_ENV=development
   JWT_SECRET=yourSecretKey
   PORT=3000
   DB_FILENAME=trbo_pms.db
   ```

4. Run the project in development mode:
   ```bash
   npm run start:dev
   ```

5. To build the project for production:
   ```bash
   npm run build
   ```

6. Start the production server:
   ```bash
   npm run start:prod
   ```

---

## Testing

1. Run the test suite:
   ```bash
   npm run test
   ```

2. Check code coverage:
   ```bash
   npm run test -- --coverage
   ```

---

## Contribution

To contribute to this project:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Submit a pull request.

---

## License

This project is licensed under the **ISC License**.