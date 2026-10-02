# Shoply — AI-Ready Multi-Vendor E-Commerce Marketplace

> A Meesho-inspired multi-vendor e-commerce marketplace built with Node.js, Express, React 19, MySQL, and Prisma ORM to practically explore real-world system design, modular monolith architecture, transactional workflows, multi-role authorization, logistics lifecycle, and end-to-end return/refund state management.

---

## 📌 Project Overview

**Shoply** is a full-stack, multi-vendor e-commerce platform inspired by marketplace apps like **Meesho**. While it provides a complete e-commerce experience for **Customers**, **Sellers**, **Delivery Agents**, and **Administrators**, the core objective of the project is to serve as a practical exploration of **real-world system design principles**. 

Instead of building a basic CRUD application, Shoply focuses on solving complex marketplace engineering challenges:
- Maintaining **inventory consistency** under concurrent checkout flows.
- Orchestrating **multi-vendor order splitting** where a single customer cart creates sub-orders for individual sellers.
- Managing an **end-to-end logistics state machine** for forward delivery and customer returns/refunds.
- Designing a **domain-driven modular monolithic architecture** that isolates business capabilities while sharing a unified relational datastore.

---

## 🎯 Why This Project?

Building a multi-vendor marketplace requires solving engineering patterns beyond standard single-seller stores:

1. **Modular Architecture:** Business domain isolation (Auth, Product, Order, Inventory, Delivery, Return, Payment, Seller, Admin) to prevent code coupling.
2. **Transactional Integrity:** SQL ACID transactions for order creation, stock deduction, and refund processing.
3. **Multi-Role Security:** Granular Role-Based Access Control (RBAC) separating Customer, Seller, Delivery Agent, and Admin privileges.
4. **Multi-Vendor Order Splitting:** Automatically partitioning customer orders by seller for independent fulfillment, payouts, and shipping.
5. **Reverse Logistics (Returns & Refunds):** A 9-step return lifecycle tracing customer return requests, seller approval, agent pickup, physical inspection, and automated refund/inventory restock.

---

## ✨ Key Features

### 🛍️ Customer Experience
- **Catalog & Search:** Browse products by nested category trees, brands, price filters, keywords, and ratings.
- **Cart & Wishlist:** Persistent shopping cart and product wishlist.
- **Checkout & Address Management:** Saved shipping addresses and multi-item order placement.
- **Payment Integration:** Interactive mock Razorpay payment gateway supporting UPI, QR Code scan, Credit/Debit Cards, Net Banking, and Wallets.
- **Order Tracking:** Detailed order status progression (`CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`).
- **Returns & Refunds:** Self-service return requests with real-time status tracking (`RETURN_APPROVED` $\rightarrow$ `PICKUP_SCHEDULED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `RECEIVED` $\rightarrow$ `INSPECTION` $\rightarrow$ `REFUNDED`).
- **Verified Reviews:** Submit 1–5 star ratings and reviews restricted strictly to verified delivered order items.

### 🏢 Seller Portal
- **Seller Onboarding:** Application process with GST/PAN verification and admin approval.
- **Product Management:** Add/edit products with image upload to Cloudinary and administrative approval status tracking.
- **Inventory Control:** Live stock monitoring, low-stock threshold alerts, and stock history audit logs.
- **Order Fulfillment:** Filter incoming orders, update fulfillment statuses, and schedule delivery pickups.
- **Payout Setup:** Encrypted bank account configuration (`IFSC`, masked account numbers) and settlement tracking.
- **Return Inspection:** Review customer return requests, approve/reject returns, and inspect returned items.

### 🚚 Delivery Agent Portal
- **Delivery Onboarding:** Partner registration and admin review workflow.
- **Available Pickups Discovery:** View pending forward shipments and customer return pickups in the agent's region.
- **Shipment Management:** Accept pickups, track active deliveries, and update shipment status (`PICKUP_CREATED` $\rightarrow$ `OUT_FOR_PICKUP` $\rightarrow$ `PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `DELIVERED`).

### 🛡️ Marketplace Governance (Admin)
- **Moderation Dashboards:** Review and approve/reject seller and delivery agent applications.
- **Product Approval Pipeline:** Admin moderation queue for new seller product listings before public display.
- **Platform Analytics:** Overview of revenue, total orders, active sellers, customers, and system audit logs.

---

## 🏗️ System Architecture

Shoply follows a **Modular Monolithic Architecture**. Each business domain is implemented as an independent module inside the Express backend application with isolated routes, controllers, services, and validation schemas.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               React 19 Frontend (Vite)                 │
                    │      Redux Toolkit | React Router v7 | Tailwind v4     │
                    └───────────────────────────┬────────────────────────────┘
                                                │ REST API (JSON / HTTP-Only Cookies)
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │             Express.js API Gateway / Server            │
                    │         Helmet | CORS | Rate Limiter | Morgan          │
                    └───────────────────────────┬────────────────────────────┘
                                                │
         ┌───────────────────┬──────────────────┼──────────────────┬──────────────────┐
         ▼                   ▼                  ▼                  ▼                  ▼
  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │ Auth & User  │    │ Product &    │   │ Cart & Order │   │ Delivery &   │   │ Return &     │
  │ Module       │    │ Inventory    │   │ Engine       │   │ Logistics    │   │ Refund V1    │
  └──────┬───────┘    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
         │                   │                  │                  │                  │
         └───────────────────┴──────────────────┼──────────────────┴──────────────────┘
                                                │ Prisma ORM 6
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                    MySQL Database                      │
                    │  Users | Products | Inventories | Orders | Returns ... │
                    └────────────────────────────────────────────────────────┘
```

For complete architectural specifications, refer to the included design document: [`MEESHO_CLONE_DOC.docx`](./MEESHO_CLONE_DOC.docx).

---

## 🛠️ Technology Stack

| Category | Technology | Usage in Project |
| --- | --- | --- |
| **Frontend** | React 19, Vite | Single Page Application framework & HMR build tool |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Framer Motion | Modern styling, icon set, and subtle animations |
| **State & Forms** | Redux Toolkit, React Hook Form, Zod | Global state management, form state, and client-side validation |
| **Backend** | Node.js, Express.js 5 | REST API web server and modular domain routing |
| **Database & ORM**| MySQL, Prisma ORM 6 | Relational datastore and type-safe query builder |
| **Auth & Security** | JWT, HTTP-Only Cookies, Bcrypt, Helmet | Access/Refresh token rotation, password hashing, and HTTP security |
| **Storage & Email**| Cloudinary, Multer, Nodemailer | Cloud image uploads, multipart handling, and email OTPs |
| **Payment** | Razorpay (Mock Gateway Modal) | Simulated payment processing, signature verification, and webhooks |
| **API Docs** | Swagger UI (`swagger-ui-express`) | OpenAPI 3.0 specification available at `/api-docs` |

---

## 📂 Project Structure

```
meesho_clone/
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # Database migration history
│   │   └── schema.prisma        # Prisma data models & relations
│   ├── src/
│   │   ├── config/              # Prisma, Cloudinary, Swagger, & Env configuration
│   │   ├── controllers/         # System controllers (Health check)
│   │   ├── middleware/          # Auth, RBAC, Rate Limiter, Error, Upload middleware
│   │   ├── modules/             # Business domain modules
│   │   │   ├── address/         # Customer address management
│   │   │   ├── admin/           # Platform governance & analytics
│   │   │   ├── auth/            # Registration, login, OTP verification, tokens
│   │   │   ├── cart/            # Shopping cart operations
│   │   │   ├── checkout/        # Checkout preview & order creation
│   │   │   ├── delivery/        # Delivery agent pickup & delivery portal
│   │   │   ├── inventory/       # Stock tracking & inventory history logs
│   │   │   ├── order/           # Multi-vendor order lifecycle
│   │   │   ├── payment/         # Payment verification & status handling
│   │   │   ├── product/         # Catalog search, filtering, seller products
│   │   │   ├── return/          # End-to-end Return & Refund lifecycle (V1)
│   │   │   ├── review/          # Delivered item reviews & ratings
│   │   │   ├── seller/          # Seller portal, dashboard, & payout setup
│   │   │   └── ...
│   │   ├── routes/              # Centralized Express router mounting
│   │   ├── scripts/             # Admin seeding & verification scripts
│   │   ├── utils/               # Encryption, hashing, token, & response helpers
│   │   ├── app.js               # Express application setup
│   │   └── server.js            # HTTP server entry point
│   ├── .env.example             # Backend environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API clients for backend endpoints
│   │   ├── assets/              # Static branding and media assets
│   │   ├── components/          # Reusable UI components & modals
│   │   ├── config/              # Navigation and environment constants
│   │   ├── layouts/             # Customer, Seller, Admin, & Delivery layouts
│   │   ├── pages/               # Application view components (Customer/Seller/Admin/Delivery)
│   │   ├── routes/              # React Router v7 configuration & Protected Routes
│   │   ├── store/               # Redux slices (auth, cart, wishlist)
│   │   ├── styles/              # Global CSS & Tailwind configuration (`#570D48` brand theme)
│   │   └── main.jsx             # React DOM root mounting
│   ├── index.html               # Entry HTML
│   ├── package.json
│   └── vite.config.js
│
├── MEESHO_CLONE_DOC.docx         # Detailed System Architecture Document
├── README.md                    # Project entry point & summary documentation
└── .gitignore
```

---

## 📖 Documentation Reference

Detailed system design and architectural specifications are available in the repository:

- [`MEESHO_CLONE_DOC.docx`](./MEESHO_CLONE_DOC.docx): Contains comprehensive design specifications including domain module boundaries, database ER diagrams, identity management workflows, payment consistency logic, and scalability considerations.

---

## 🚦 Current Implementation Status

| Feature / System Module | Status | Notes |
| --- | --- | --- |
| **Modular Monolith Backend** | ✅ Implemented | 22 Express domain modules with isolated routing |
| **Authentication & RBAC** | ✅ Implemented | JWT + HTTP-Only Cookie strategy for Customer, Seller, Agent, Admin |
| **Product Catalog & Search** | ✅ Implemented | Filtering by category, brand, price, keyword search, & pagination |
| **Inventory Tracking** | ✅ Implemented | Stock reservation, history logs, & low stock threshold alerts |
| **Multi-Vendor Orders** | ✅ Implemented | Shopping cart, address selection, order creation, & seller sub-orders |
| **Logistics & Delivery Agent Portal** | ✅ Implemented | Agent application, available pickup discovery, & shipment updates |
| **Return & Refund V1 Lifecycle** | ✅ Implemented | Customer request $\rightarrow$ Seller approval $\rightarrow$ Pickup $\rightarrow$ Inspection $\rightarrow$ Refund |
| **Mock Razorpay Payment Gateway** | ✅ Implemented | Interactive checkout modal (UPI, Card, Net Banking) & verification |
| **Seller & Admin Dashboards** | ✅ Implemented | Application approval queues, seller payout setup, & analytics |
| **Product Reviews & Ratings** | ✅ Implemented | 1–5 star reviews restricted strictly to verified delivered order items |
| **Redis Caching & Distributed Locking** | ⏳ Planned | Documented in architecture spec for high-concurrency catalog & stock locking |
| **RabbitMQ Event Queue** | ⏳ Planned | Documented in architecture spec for asynchronous notification workers |
| **OpenRouter AI Listing Assistant** | ⏳ Planned | Documented in architecture spec for AI seller description/hashtag generation |

---

## 💡 Engineering Highlights

- **Domain-Driven Module Boundaries:** Code is organized by business domain (`modules/order`, `modules/return`, `modules/inventory`) rather than technical layers (`controllers/`, `services/`), facilitating maintainability and future microservice extraction.
- **Order & Return State Machines:** Strictly enforced status transitions for both forward delivery (`PENDING` $\rightarrow$ `DELIVERED`) and reverse logistics (`RETURN_REQUESTED` $\rightarrow$ `REFUNDED`) to guarantee data integrity across customer, seller, agent, and admin views.
- **Multi-Role Security Model:** Middleware layer enforces role checks (`CUSTOMER`, `SELLER`, `DELIVERY_AGENT`, `ADMIN`) before executing sensitive business logic or accessing operational routes.
- **Interactive Gateway Simulation:** Complete end-to-end payment workflow including signature verification without requiring external paid sandbox accounts.

---

## 💻 Setup & Local Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **MySQL Database Server** (v8.0+)

---

### 1. Database Setup
Create a local MySQL database for the project:
```sql
CREATE DATABASE meesho_clone;
```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` variables (see [Environment Variables](#-environment-variables)).
5. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. (Optional) Seed the initial Administrator account:
   ```bash
   npm run seed:admin
   ```
7. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000` (or specified `PORT`).  
   Swagger API documentation will be accessible at `http://localhost:5000/api-docs`.

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
CLIENT_URL=http://localhost:5173

# Database Connection (MySQL)
DATABASE_URL=mysql://root:password@localhost:3306/meesho_clone

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Integration (Mock/Live)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email / SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Documentation & CORS
SWAGGER_TITLE="Shoply Marketplace API"
SWAGGER_VERSION=1.0.0
CORS_ORIGIN=http://localhost:5173
```

---

## 📜 License

This project is licensed under the **ISC License** as specified in [`backend/package.json`](./backend/package.json).
