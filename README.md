# BajriX — Multi-Seller Construction Materials Marketplace

[![Java](https://img.shields.io/badge/Java-21_LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue.svg)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-Migrations-red.svg)](https://flywaydb.org/)
[![React](https://img.shields.io/badge/React-19_Vite-cyan.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/JUnit_5-30_Passed-success.svg)](https://junit.org/junit5/)

BajriX is a full-stack, multi-seller marketplace engineered for construction and home-building materials (cement, TMT steel rebars, kiln-burnt bricks, AAC blocks, manufactured sand, aggregates, CPVC plumbing, and industrial electrical supplies).

The platform allows buyers to discover materials and compare offers from multiple certified sellers on a single catalogue product. Each seller independently manages pricing, on-hand warehouse inventory, minimum order quantities (MOQ), and active availability.

---

## Table of Contents

1. [Executive Overview & Key Features](#1-executive-overview--key-features)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Request Flow](#3-architecture--request-flow)
4. [Database Design & Migrations](#4-database-design--migrations)
5. [Prerequisites & Local Setup](#5-prerequisites--local-setup)
6. [Running Locally (Without Docker)](#6-running-locally-without-docker)
7. [Running with Docker & Docker Compose](#7-running-with-docker--docker-compose)
8. [Sample Seed Data & Reviewer Identity Switcher](#8-sample-seed-data--reviewer-identity-switcher)
9. [REST API Documentation](#9-rest-api-documentation)
10. [Business Rules Implementation](#10-business-rules-implementation)
11. [Testing & Verification](#11-testing--verification)
12. [Production Deployment Guide](#12-production-deployment-guide)
13. [Security Architecture & Disclaimers](#13-security-architecture--disclaimers)
14. [Scalability Considerations & Future Enhancements](#14-scalability-considerations--future-enhancements)

---

## 1. Executive Overview & Key Features

### The Multi-Seller Challenge
In traditional construction material supply chains, contractors face opaque pricing and fragmented suppliers. On BajriX:
- **Single Catalogue Reference**: A product (e.g. *UltraTech PPC Cement 50 kg*) exists once in the global catalogue.
- **Independent Seller Offers**: Multiple approved sellers list their own independent prices, stock levels, and MOQs for that exact product.
  - *Seller A (Apex Supplies)*: ₹390 / bag, 500 bags stock, 50 MOQ
  - *Seller B (BuildPro)*: ₹385 / bag, 200 bags stock, 25 MOQ (**Lowest Price**)
  - *Seller C (SolidRock)*: ₹405 / bag, 1,000 bags stock, 100 MOQ
- **Strict Compliance Filtering**: Offers from **PENDING** or **REJECTED** sellers, as well as deactivated listings (`active = false`), are automatically filtered out from buyer search results.
- **Interactive Bulk Order Calculator**: Buyers can enter their desired site requirement (e.g. 150 bags) and see dynamic real-time price comparisons, stock sufficiency checks, and cost savings across every eligible seller.
- **Dedicated Seller Workspace**: Sellers have a full portal to view real-time inventory statistics, search and filter listings, toggle active status, and perform CRUD operations with optimistic concurrency control.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: JavaScript (ES6+)
- **Routing**: React Router v6
- **Styling**: Pure CSS Design System (`src/styles/design-system.css` and `app.css`) using CSS variables for typography, elevation shadows, responsive breakpoints, and industrial palettes.
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API client with automatic seller isolation header injection (`X-Seller-Id`) and error normalization.

### Backend
- **Runtime**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4
- **Persistence**: Spring Data JPA / Hibernate 6
- **Validation**: Jakarta Bean Validation (`@NotNull`, `@DecimalMin`, `@Min`, `@Valid`)
- **Database Migrations**: Flyway Core & Flyway Database PostgreSQL
- **Monitoring**: Spring Boot Actuator (`/actuator/health`, `/actuator/metrics`)
- **Build Tool**: Apache Maven 3.9+

### Database
- **Engine**: PostgreSQL 17
- **Features**: Foreign keys with `ON DELETE CASCADE`, composite unique constraint `uq_seller_product (seller_id, product_id)`, check constraints for non-negative stock and positive price, and B-tree indexes for fast filtered lookups.

### Testing
- **Framework**: JUnit 5, Mockito
- **Coverage**: 30 automated unit and integration slice tests verifying all business rules, pagination, concurrency, and validation.

---

## 3. Architecture & Request Flow

The backend follows a clean, decoupled layered architecture:

```
[ React 18 Frontend ] 
         │ (HTTP JSON REST / X-Seller-Id)
         ▼
[ Spring Boot Controller Layer ] 
    ├── ProductController (/api/products, /api/categories)
    ├── OfferController   (/api/products/{id}/offers)
    ├── SellerController  (/api/sellers, /api/seller/profile)
    └── SellerListingController (/api/seller/listings)
         │
         ▼
[ HandlerMethodArgumentResolver ] ────► Injects @CurrentSellerId from header
         │
         ▼
[ Service Layer (Business Rules & Security Enforcer) ]
    ├── ProductService (Paginated search, 2-phase batch offer stats)
    ├── OfferService   (Buyer-visible filtering: approved + active, lowest price tag)
    └── SellerListingService (Ownership enforcement, duplicate check, MOQ/stock rule, @Version)
         │
         ▼
[ Spring Data JPA Repository Layer ]
    ├── ProductRepository
    ├── SellerRepository
    └── SellerListingRepository
         │
         ▼
[ PostgreSQL Database (Managed by Flyway) ]
```

### Request Flow Example: Updating a Listing
1. **Client**: Frontend sends `PUT /api/seller/listings/1` with header `X-Seller-Id: 1` and payload `{ "price": 395.00, "availableStock": 450, "minOrderQuantity": 50, "version": 0 }`.
2. **Security Injection**: `SellerIdentityResolver` extracts `X-Seller-Id: 1` and passes `Long sellerId` to the controller.
3. **Validation**: Jakarta Bean Validation checks `@DecimalMin("0.01")`, `@Min(0)`, `@NotNull`.
4. **Ownership Verification**: `SellerListingService` loads the listing from PostgreSQL and validates `listing.getSeller().getId().equals(sellerId)`. If a different seller attempts this, an `UnauthorizedSellerException` (403 Forbidden) is thrown immediately.
5. **Optimistic Locking Check**: Validates `request.version() == listing.getVersion()`. If another concurrent update occurred, throws `ObjectOptimisticLockingFailureException` (409 Conflict).
6. **Business Rule Check**: Validates `availableStock >= minOrderQuantity` when stock is positive.
7. **Persistence**: Entity is updated and saved. Hibernate auto-increments `version` to `1`.
8. **Response**: Returns normalized `ApiResponse<SellerListingDto>` with HTTP 200 OK.

---

## 4. Database Design & Migrations

Database schema management is handled exclusively by **Flyway versioned migrations**. Hibernate DDL auto-generation is set to `ddl-auto: validate` in both development and production.

### Entity Relationship Diagram

```
+--------------------------------------------------------+
|                        SELLERS                         |
+--------------------------------------------------------+
| PK  id             BIGSERIAL                           |
|     name           VARCHAR(255) NOT NULL               |
|     email          VARCHAR(255) NOT NULL UNIQUE        |
|     phone          VARCHAR(50)                         |
|     location       VARCHAR(255)                        |
|     seller_status  VARCHAR(20) NOT NULL [APPROVED,...] |
|     rating         NUMERIC(3,2) DEFAULT 4.50           |
|     created_at     TIMESTAMPTZ NOT NULL                |
|     updated_at     TIMESTAMPTZ NOT NULL                |
+--------------------------------------------------------+
                           │ 1
                           │
                           │ has many
                           ▼ N
+--------------------------------------------------------+         +--------------------------------------+
|                     SELLER_LISTINGS                    |         |               PRODUCTS               |
+--------------------------------------------------------+         +--------------------------------------+
| PK  id                 BIGSERIAL                       |  N    1 | PK  id          BIGSERIAL            |
| FK  seller_id          BIGINT NOT NULL ───────────────┼─────────┤     name        VARCHAR(255) NOT NULL  |
| FK  product_id         BIGINT NOT NULL ────────────────┼─────────►     description TEXT NOT NULL          |
|     price              NUMERIC(12,2) NOT NULL (>0)     |         |     category    VARCHAR(100) NOT NULL  |
|     available_stock    INTEGER NOT NULL (>=0)          |         |     unit        VARCHAR(50) NOT NULL   |
|     min_order_quantity INTEGER NOT NULL (>0)           |         |     image_url   VARCHAR(500)           |
|     active             BOOLEAN NOT NULL DEFAULT TRUE   |         |     created_at  TIMESTAMPTZ NOT NULL   |
|     version            BIGINT NOT NULL DEFAULT 0       |         |     updated_at  TIMESTAMPTZ NOT NULL   |
|     created_at         TIMESTAMPTZ NOT NULL            |         +--------------------------------------+
|     updated_at         TIMESTAMPTZ NOT NULL            |
| CONSTRAINT uq_seller_product UNIQUE(seller_id, product_id)
+--------------------------------------------------------+
```

### Migrations
- `V1__initial_schema.sql`: Creates `sellers`, `products`, `seller_listings`, unique constraints, foreign keys, and indexes on `(product_id, active, price)`, `category`, and `seller_status`.
- `V2__seed_data.sql`: Seeds 5 sellers, 10 catalogue products across 7 categories, and 18 multi-seller listings with varying prices and stock levels.

---

## 5. Prerequisites & Local Setup

- **Java**: OpenJDK 21 LTS installed and on `PATH`
- **Node.js**: Node v20+ or v24+ with npm installed
- **PostgreSQL**: PostgreSQL 16+ or 17 running on `localhost:5432`
- **Maven**: Apache Maven 3.9+ (or use the portable maven in `bajrix-marketplace/../maven`)

---

## 6. Running Locally (Without Docker)

### Step 1: Initialize Database
Connect to PostgreSQL and create the database `bajrix_db`:
```sql
CREATE DATABASE bajrix_db;
```

### Step 2: Start the Spring Boot Backend
Open a terminal in `bajrix-marketplace/backend`:
```powershell
# Windows
mvn clean spring-boot:run
```
Flyway will automatically execute migrations `V1` and `V2` on startup.
The backend will start on **http://localhost:8085**.

Verify backend health:
```bash
curl http://localhost:8085/actuator/health
```
Expected output:
```json
{"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"}}}
```

### Step 3: Start the React Frontend
Open a new terminal in `bajrix-marketplace/frontend`:
```bash
npm install
npm run dev
```
The frontend dev server will launch at **http://localhost:5173**.
API requests are automatically proxied from `/api` to `http://localhost:8085`.

---

## 7. Running with Docker & Docker Compose

To start the full stack (PostgreSQL + Spring Boot + React/Nginx) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:8085
- **PostgreSQL**: localhost:5432

To stop containers:
```bash
docker-compose down -v
```

---

## 8. Sample Seed Data & Reviewer Identity Switcher

BajriX includes a **Mock Identity Switcher** prominently positioned in the top navigation bar. This enables evaluators to test multi-seller isolation, ownership verification, and compliance visibility rules with a single click:

| Seller ID | Seller Name | Status | Location | Buyer Visibility |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Apex Building Supplies** | `APPROVED` | Navi Mumbai, MH | Active listings appear in public search & offer comparisons |
| **2** | **BuildPro Infrastructure Ltd** | `APPROVED` | Sector 62, Noida, UP | Active listings appear (**Holds lowest price of ₹385 for cement**) |
| **3** | **SolidRock Cement & Aggregates**| `APPROVED` | Bengaluru, KA | Active listings appear in public search |
| **4** | **NovaTech Steel & Infra** | `PENDING` | Ahmedabad, GJ | **Strictly hidden from buyers.** Seller can manage private portal. |
| **5** | **Shady Materials Trading** | `REJECTED` | Pune, MH | **Strictly hidden from buyers.** Compliance rejection alert shown. |

### How to Test Seller Isolation:
1. Switch to **Seller 1 (Apex)**: View his dashboard showing 6 listings. Edit price or stock.
2. In the buyer view (`/products/1`), notice offers from Apex (₹390), BuildPro (₹385), and SolidRock (₹405).
3. Switch to **Seller 4 (NovaTech - PENDING)**: Note that NovaTech has an offer for ₹375 in his seller portal.
4. Open the buyer view for Cement (`/products/1`): Notice that NovaTech's ₹375 offer **DOES NOT appear** because NovaTech is PENDING.
5. Open Product #9 (*UltraTech Super Cement Weather Plus*): Shows clean zero-offers state because no approved seller has an active offer for it.

---

## 9. REST API Documentation

All responses are wrapped in a standard JSON response envelope:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Public Buyer APIs

#### 1. `GET /api/products`
Retrieves a paginated list of catalogue products with starting prices and seller offer count.
- **Query Parameters**:
  - `category` (optional): Filter by material category (e.g. `Cement`, `Steel & TMT`).
  - `query` (optional): Search in name and description.
  - `page` (default: 0): Page number.
  - `size` (default: 12, max: 50): Items per page.
  - `sort` (default: `id_asc`): `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`.
- **Sample Request**:
  ```http
  GET /api/products?category=Cement&size=2 HTTP/1.1
  Host: localhost:8085
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {
      "content": [
        {
          "id": 1,
          "name": "UltraTech PPC Cement 50 kg",
          "description": "Portland Pozzolana Cement offering superior durability...",
          "category": "Cement",
          "unit": "50 kg bag",
          "imageUrl": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f",
          "minPrice": 385.00,
          "maxPrice": 405.00,
          "availableOffersCount": 3,
          "totalStock": 1700,
          "hasOffers": true
        }
      ],
      "page": 0,
      "size": 2,
      "totalElements": 2,
      "totalPages": 1,
      "first": true,
      "last": true
    }
  }
  ```

#### 2. `GET /api/products/{id}`
Returns full product specifications and market summary.
- **Sample Request**: `GET /api/products/1`

#### 3. `GET /api/products/{id}/offers`
Returns all active offers from approved sellers for the specified product. Automatically tags `isLowestPrice: true` on the cheapest offer.
- **Query Parameters**:
  - `sort`: `price_asc` (default), `price_desc`, `stock_desc`, `rating_desc`.
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": [
      {
        "id": 2,
        "sellerId": 2,
        "sellerName": "BuildPro Infrastructure Ltd",
        "sellerLocation": "Sector 62, Noida, UP",
        "sellerRating": 4.65,
        "price": 385.00,
        "availableStock": 200,
        "minOrderQuantity": 25,
        "active": true,
        "isLowestPrice": true
      },
      {
        "id": 1,
        "sellerId": 1,
        "sellerName": "Apex Building Supplies",
        "sellerLocation": "Navi Mumbai, MH",
        "sellerRating": 4.80,
        "price": 390.00,
        "availableStock": 500,
        "minOrderQuantity": 50,
        "active": true,
        "isLowestPrice": false
      }
    ]
  }
  ```

#### 4. `GET /api/categories`
Returns distinct material categories with product counts.

---

### Seller APIs (Requires `X-Seller-Id` Header)

#### 1. `GET /api/seller/listings`
Returns current seller's listings with pagination, active status filter, and keyword search.
- **Header**: `X-Seller-Id: 1`
- **Query Parameters**: `active=true|false`, `query=...`, `page=0`, `size=10`.

#### 2. `GET /api/seller/listings/stats`
Returns total listings count, active count, and low stock warnings.

#### 3. `POST /api/seller/listings`
Creates a new listing for the current authenticated seller.
- **Header**: `X-Seller-Id: 1`
- **Request Body**:
  ```json
  {
    "productId": 3,
    "price": 8100.00,
    "availableStock": 250,
    "minOrderQuantity": 20,
    "active": true
  }
  ```
- **Response**: `201 Created` with created listing DTO.

#### 4. `PUT /api/seller/listings/{id}`
Updates price, stock, MOQ, or active status. Requires `version` token for optimistic concurrency control.
- **Header**: `X-Seller-Id: 1`
- **Request Body**:
  ```json
  {
    "price": 392.00,
    "availableStock": 480,
    "minOrderQuantity": 50,
    "active": true,
    "version": 0
  }
  ```
- **Response**: `200 OK` on success, or `409 Conflict` if another process incremented the version.

#### 5. `PATCH /api/seller/listings/{id}/status`
Toggles or updates listing active status.
- **Header**: `X-Seller-Id: 1`
- **Request Body**: `{ "active": false }`

#### 6. `DELETE /api/seller/listings/{id}`
Deletes listing belonging to current seller. Returns `204 No Content`.

---

## 10. Business Rules Implementation

1. **Multi-Seller Independence**: Multiple sellers can offer the same catalogue product without overwriting each other.
2. **Duplicate Prevention**: A seller can have only one listing per product. Enforced by database unique constraint `uq_seller_product` and service check `listingRepository.existsBySellerIdAndProductId(...)` returning `409 Conflict`.
3. **Price Validation**: Must be positive (`@DecimalMin("0.01")` and DB `CHECK (price > 0)`).
4. **Stock Validation**: Cannot be negative (`@Min(0)` and DB `CHECK (available_stock >= 0)`).
5. **MOQ Validation**: Must be $\ge 1$ (`@Min(1)` and DB `CHECK (min_order_quantity > 0)`).
6. **Stock vs. MOQ Rule**: If available stock is positive, it must be $\ge$ MOQ (`stock >= moq`). A seller cannot offer a batch size smaller than their minimum order requirement. When stock is 0 (out-of-stock), the listing remains active for backorders/restocking.
7. **Strict Ownership Enforcement**: A seller cannot view, modify, or delete another seller's listing. Enforced in `SellerListingService.verifyOwnership` throwing `UnauthorizedSellerException` (403 Forbidden).
8. **Compliance Buyer Visibility**: Buyers only see offers where `listing.active = true` AND `seller.seller_status = 'APPROVED'`. Pending and rejected sellers are excluded via indexed SQL WHERE clauses.
9. **Optimistic Concurrency Control**: Listings use JPA `@Version`. Concurrent updates on stale data fail with `409 Conflict`.

---

## 11. Testing & Verification

Automated testing covers business rules, validation constraints, seller isolation, error responses, and pagination.

To execute tests:
```bash
cd backend
mvn clean test
```

### Verified Test Results:
```text
[INFO] Running com.bajrix.controller.AuthControllerTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bajrix.controller.ProductControllerTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bajrix.controller.SellerListingControllerTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bajrix.service.OfferServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bajrix.service.OrderServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bajrix.service.ProductServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bajrix.service.SellerListingServiceTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] Results:
[INFO] Tests run: 30, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 12. Production Deployment Guide

The application is structured for cloud hosting platforms (e.g. Render, Railway, AWS ECS, Google Cloud Run) connected to a managed PostgreSQL database (e.g. AWS RDS, Supabase, Neon).

### Backend Configuration via Environment Variables:
- `SPRING_PROFILES_ACTIVE`: `prod`
- `SPRING_DATASOURCE_URL`: Managed PostgreSQL JDBC URL (e.g. `jdbc:postgresql://db.cloud.internal:5432/bajrix_db?sslmode=require`)
- `SPRING_DATASOURCE_USERNAME`: PostgreSQL username
- `SPRING_DATASOURCE_PASSWORD`: Secure database password
- `PORT`: Port assigned by hosting platform (default: `8085`)
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of production frontend domains (e.g. `https://bajrix.example.com`)

### Frontend Static Build:
- Build command: `npm run build`
- Output directory: `dist/`
- Build-time variable: `VITE_API_BASE_URL=https://api.bajrix.example.com`

---

## 13. Security Architecture & Disclaimers

### Assessment Mock Identity vs. Production Authentication
- **Current Assessment Implementation**: For the evaluation assignment, seller identity is resolved via the `X-Seller-Id` HTTP header using Spring's `HandlerMethodArgumentResolver` (`SellerIdentityResolver`). This allows the reviewer to seamlessly switch between approved, pending, and rejected sellers using the UI switcher.
- **Production Architecture**: In production, `SellerIdentityResolver` should be replaced with Spring Security's `@AuthenticationPrincipal` extracting claims from a signed JWT token (OAuth2 / OpenID Connect / AWS Cognito / Auth0). Passwords and credentials must never be passed in headers.
- **Strict Isolation**: Even with mock identity, seller ownership is enforced in the backend service layer; the backend never trusts client-supplied seller IDs inside request bodies.

---

## 14. Scalability Considerations & Future Enhancements

With more time, the following enhancements could be incorporated:
1. **Redis Caching**: Cache catalogue product summaries and category counts with TTL invalidation on listing changes.
2. **Elasticsearch / OpenSearch**: Full-text fuzzy search for regional construction material names and brand synonyms.
3. **Automated Order Quotation Workflow**: Convert buyer quotation requests into formal RFQs (Request For Quotations) with multi-truck logistics dispatch tracking.
4. **GST / E-Way Bill Integration**: Integrate Indian GST compliance verification API to automate vendor onboarding from PENDING to APPROVED status.
