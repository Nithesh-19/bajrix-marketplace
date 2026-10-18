# AI Usage Log & Architectural Transparency — BajriX Marketplace

This document details the AI tools utilized during the engineering of the BajriX full-stack platform, what areas they accelerated, and specific instances of suggestions that were modified, rejected, or corrected during implementation.

---

## 1. AI Tools Used & Roles

- **Antigravity AI (Pair Programming Assistant)**:
  - Guided scaffolding of Spring Boot 3.3.4 (Java 21) REST endpoints, DTO records, and Flyway versioned migrations.
  - Accelerated writing repetitive boilerplate (JPA entities, validation constraints, DTO mapping records).
  - Designed the modern CSS design system tokens and responsive component layouts in React with Vite.
  - Generated unit and integration tests across services, validation rules, and REST controllers.

---

## 2. Key Engineering Decisions & Corrections (Real Instances)

### Example 1: Rejection of N+1 / `@Formula` Approach in Favor of Batch Page Aggregation

- **Initial Suggestion**:
  When planning how to display each catalogue card with starting prices (`minPrice`, `maxPrice`) and seller count (`availableOffersCount`), an initial approach suggested mapping a `@OneToMany` list of `SellerListing` inside the `Product` entity or using Hibernate `@Formula` subqueries.
- **Why It Was Rejected**:
  1. Adding `@OneToMany` to `Product` risks accidental lazy-loading exceptions outside transactions (`open-in-view: false`) and causes severe $N+1$ query performance issues when listing products on the home page.
  2. Doing in-memory aggregation of all offers would require loading the entire marketplace dataset into heap memory, violating the requirement: *"Avoid fetching the entire catalogue into application memory to perform filtering or sorting."*
  3. Hibernate `@Formula` annotations hardcode vendor SQL snippets inside domain entities, hindering portability and testing across H2 and PostgreSQL.
- **Correction Applied**:
  Implemented an optimized two-phase query pattern:
  1. `ProductRepository.searchProducts(...)` executes database-level SQL `LIKE` and category filtering with `Pageable (LIMIT/OFFSET)`.
  2. `SellerListingRepository.getOfferStatsForProductIds(productIds)` executes a single indexed `GROUP BY` query for only the active products on that specific page (`WHERE sl.active = true AND s.seller_status = 'APPROVED'`).
  This keeps database queries strictly constant (2 queries per page regardless of how many sellers exist) and completely preserves database-level pagination.

---

### Example 2: Resolving Generic Type Inference in Mockito Test Stubbing

- **Issue Encountered**:
  During the initial build execution, `mvn test` failed during compilation of `ProductServiceTest.java`:
  ```text
  [ERROR] no suitable method found for thenReturn(java.util.List<java.lang.Object>)
  method OngoingStubbing.thenReturn(java.util.List<java.lang.Object[]>) is not applicable
  ```
- **Correction Applied**:
  `List.of(statsRow)` where `statsRow` is `Object[]` was interpreted by javac as a single array argument passed to varargs `List.of(E... elements)`, resulting in `List<Object>` instead of `List<Object[]>`.
  Replaced with `Collections.singletonList(statsRow)`, giving the compiler explicit type bounds matching the repository signature `List<Object[]>`. The test suite subsequently passed 100% (24/24 tests).

---

### Example 3: Defining and Enforcing the MOQ vs. Stock Business Rule

- **Context**:
  The assignment asked: *"Decide and document the rule for whether minimum order quantity may exceed available stock. Make the application consistent with that rule."*
- **Naive Suggestion**:
  Enforce `availableStock >= minOrderQuantity` under all conditions.
- **Why It Was Modified**:
  In industrial construction supply chains, warehouse stock frequently depletes to `0` (e.g. while waiting for next cement clinker consignment or steel trailer arrival). If a system strictly prevents stock from being `0` whenever MOQ is 50, sellers would be forced to delete their listings or fake high inventory numbers.
- **Refined Business Rule**:
  - `min_order_quantity` must always be $\ge 1$.
  - `available_stock` must always be $\ge 0$.
  - **Rule**: If `available_stock > 0`, then `available_stock >= min_order_quantity`. A seller cannot offer a positive quantity that is impossible for a buyer to order.
  - If `available_stock == 0`, the listing can remain saved/active in the seller's portal for restock tracking, but the public buyer interface will show insufficient stock to accept immediate checkout.

---

## 3. Human Oversight & Verification Summary

Every line of Java, SQL, React, CSS, and configuration was inspected, verified against real local PostgreSQL 17 on port 5432, compiled using Apache Maven with Java 21, and built using Vite without any mock data or stubbed responses.
