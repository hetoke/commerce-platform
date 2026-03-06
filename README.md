# MiniStore

A compact and easy-to-use full-stack commerce platform for small sellers, built with React, Node.js, Express, and MongoDB.

MiniStore demonstrates how a modern web application can be designed with a modular backend architecture, secure authentication, API protection, and automated developer tooling.

The project focuses on clean architecture, maintainability, and secure API design, while remaining lightweight enough for small sellers or content creators.

## Demo

**Live Demo:** (add Render URL here)

**Demo User Account:**
- Username: `bob`
- Password: `customer123`

Admin access is restricted to prevent abuse of the live demo.

## Features

### User Features

- Browse items
- View item details
- Purchase items
- View purchase history
- Leave item reviews
- Authentication with secure sessions

### Admin Features

Admin capabilities include:

- Creating items
- Editing items
- Deleting items

Admin access credentials are not publicly shared to prevent abuse of the live demo.
If you would like to explore these features, please contact me.

## Tech Stack

### Frontend

- React
- React Router
- TailwindCSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security

- OAuth2 (Login with Google)
- JWT session management
- HTTP-only cookies
- Request validation
- Rate limiting

### Testing

- Vitest
- Supertest

### DevOps

- GitHub Actions (CI)
- Render (Deployment)
- MongoDB Atlas (Cloud Database)

## Developer Tooling

This project includes LLM-assisted tooling that automatically generates:

- Swagger/OpenAPI documentation
- API regression tests

The tooling analyzes backend routes and controllers to produce documentation and tests automatically, reducing manual development overhead.

**The LLM used is:** `qwen3-coder:480b-cloud` via Ollama

## Architecture

The backend follows a modular layered architecture:
```
routes → controllers → services → models
```
Layer responsibilities

Layer	Responsibility
Routes	Define API endpoints and attach middleware (authentication, validation).
Controllers	Handle HTTP requests and responses. Controllers remain thin and delegate business logic to services.
Services	Implement core business logic such as purchases, item management, and reviews.
Models	Define MongoDB schemas using Mongoose.

Example flow
```
POST /api/purchases
        ↓
purchaseController.createPurchase()
        ↓
purchaseService.createPurchaseService()
        ↓
Purchase model
```

This separation provides several benefits:

- Maintainability — database schema changes are isolated in the model/service layers.

- Testability — services can be tested independently from HTTP logic.

- Clear responsibility boundaries — routes handle API concerns while services handle business logic.



## API Protection

Security protections include:

- request validation using express-validator
- rate limiting on authentication endpoints
- secure HTTP-only cookies
- role-based access control

These mechanisms help mitigate:

- brute-force attacks
- malformed requests
- unauthorized access

## Testing

API regression tests are implemented using Vitest and Supertest.

The test suite validates:

- endpoint availability
- request validation
- authentication behavior
- authorization logic

### Example test categories:

- Auth routes
- Account routes
- Item routes
- Purchase routes
- Review routes

### Current test status:

- 44 tests passing
- 6 test suites

## CI / CD

Continuous Integration is implemented using GitHub Actions.

Each push triggers:

- dependency installation
- automated test execution

The application is deployed to Render, with MongoDB Atlas as the production database.

## Future Improvements

Potential improvements if development continued:

- TypeScript refactor for stronger type safety
- Redis caching for high-traffic endpoints
- Supabase or S3-compatible object storage for media uploads
- payment gateway integration (VNPay / MoMo / ZaloPay)
- email verification and password reset using Nodemailer

## Local Development

Clone the repository:
```bash
git clone https://github.com/hetoke/ministore.git
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
```bash
cp .env.example .env
```

Start the development server:
```bash
npm run dev
```

Run tests:
```bash
npm run test
```

## Author

Built as a solo full-stack project focusing on secure backend design, API architecture, and automated development tooling.

If you are interested in the project or would like to explore the admin features, feel free to reach out.