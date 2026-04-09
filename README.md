# Wasabi Shop Web

React + Vite storefront with Firebase Authentication, Firestore, and Firebase Storage.

This README documents how to set up Firebase for this project, how the database is structured, what field types are expected, and which CRUD helpers are already implemented in the codebase.

## Stack

- Frontend: React + Vite
- Auth: Firebase Authentication
- Database: Cloud Firestore
- File storage: Firebase Storage

## Firebase Setup

### 1. Create a Firebase project

In Firebase Console:

1. Create a new project.
2. Add a Web App to the project.
3. Enable:
   - Authentication
   - Firestore Database
   - Storage

### 2. Add environment variables

Create a local `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Reference file:

- [.env.example](D:/portfolio/wasabi/shop-web/.env.example)

Firebase initialization lives in:

- [firebase.js](D:/portfolio/wasabi/shop-web/src/services/firebase.js)

After editing `.env`, restart the dev server.

## Firebase Services Used

This project initializes:

- Firebase App
- Firebase Authentication
- Firestore
- Firebase Storage

Code reference:

- [firebase.js](D:/portfolio/wasabi/shop-web/src/services/firebase.js)

## Firestore Collections

Collection names are defined in:

- [firebase-schema.js](D:/portfolio/wasabi/shop-web/src/config/firebase-schema.js)

Current collections:

- `products`
- `adminUsers`

## Data Model Overview

### Product Model

Collection:

- `products`

Document ID:

- `id: string`
- Firestore auto-generates the ID on create
- In app code, `id` comes from `snapshot.id`

Fields:

- `id: string`
- `name: string`
- `price: number`
- `isAvailable: boolean`
- `category: string`
- `photoUrl: string`
- `shortDescription: string`
- `createdAt: Firestore Timestamp`
- `updatedAt: Firestore Timestamp`

Notes:

- `price` must be a number, not a string
- `photoUrl` should be a downloadable Storage URL or any valid image URL
- `createdAt` and `updatedAt` are written with Firestore `serverTimestamp()`
- Public storefront only shows products that are:
  - valid
  - `isAvailable === true`

Relevant files:

- [product.model.js](D:/portfolio/wasabi/shop-web/src/features/products/product.model.js)
- [product.utils.js](D:/portfolio/wasabi/shop-web/src/features/products/product.utils.js)
- [products.js](D:/portfolio/wasabi/shop-web/src/services/firestore/products.js)

Example Firestore product document:

```json
{
  "name": "Matcha Latte",
  "price": 8.5,
  "isAvailable": true,
  "category": "Drinks",
  "photoUrl": "https://firebasestorage.googleapis.com/...",
  "shortDescription": "Ceremonial matcha with oat milk.",
  "createdAt": "server timestamp",
  "updatedAt": "server timestamp"
}
```

### Admin User Model

Collection:

- `adminUsers`

Document ID:

- `uid: string`
- This must exactly match the Firebase Authentication user UID

Fields:

- `uid: string`
- `name: string`
- `email: string`
- `role: string`
- `createdAt: Firestore Timestamp`
- `isActive: boolean`

Allowed `role` values:

- `admin`
- `superadmin`

Notes:

- There is no numeric ID here
- The Firestore document key must be the auth user UID
- A user can sign in to the admin area only if:
  - they exist in Firebase Authentication
  - `adminUsers/{uid}` exists
  - `isActive === true`
  - `role` is `admin` or `superadmin`

Relevant files:

- [admin-user.model.js](D:/portfolio/wasabi/shop-web/src/features/admin-users/admin-user.model.js)
- [admin-users.js](D:/portfolio/wasabi/shop-web/src/services/firestore/admin-users.js)
- [AuthContext.jsx](D:/portfolio/wasabi/shop-web/src/contexts/AuthContext.jsx)

Example Firestore admin document:

```json
{
  "uid": "firebase_auth_uid_here",
  "name": "Main Admin",
  "email": "admin@example.com",
  "role": "superadmin",
  "createdAt": "server timestamp",
  "isActive": true
}
```

## Firebase Storage Structure

Storage path constants are defined in:

- [firebase-schema.js](D:/portfolio/wasabi/shop-web/src/config/firebase-schema.js)

Current storage bucket path prefix:

- `products`

Product image path pattern:

- `products/{productId}/{timestamp}-{sanitizedFileName}`

Example:

```text
products/abc123/1775801122334-matcha-latte.png
```

Relevant file:

- [product-images.js](D:/portfolio/wasabi/shop-web/src/services/storage/product-images.js)

## CRUD Helpers

### Product CRUD

Implemented in:

- [products.js](D:/portfolio/wasabi/shop-web/src/services/firestore/products.js)

Functions:

- `listProducts()`
- `listPublicProducts()`
- `getProductById(productId)`
- `createProduct(input)`
- `updateProduct(productId, input)`
- `deleteProduct(productId)`

Input shape for `createProduct(input)`:

```ts
{
  name: string
  price: number
  isAvailable?: boolean
  category?: string
  photoUrl?: string
  shortDescription?: string
}
```

Input shape for `updateProduct(productId, input)`:

```ts
{
  name?: string
  price?: number
  isAvailable?: boolean
  category?: string
  photoUrl?: string
  shortDescription?: string
}
```

Behavior:

- `createProduct()` creates a new Firestore document with auto-generated `id`
- `updateProduct()` supports partial updates
- `deleteProduct()` removes the Firestore document
- `listPublicProducts()` filters for public storefront use
- Admin area also supports create-only CSV product import from a dedicated import page

### Admin User CRUD

Implemented in:

- [admin-users.js](D:/portfolio/wasabi/shop-web/src/services/firestore/admin-users.js)

Functions:

- `listAdminUsers()`
- `getAdminUserByUid(uid)`
- `createAdminUser(input)`
- `updateAdminUser(uid, input)`
- `updateAdminUserRole(uid, role)`
- `setAdminUserStatus(uid, isActive)`
- `deleteAdminUser(uid)`

Input shape for `createAdminUser(input)`:

```ts
{
  uid: string
  name: string
  email: string
  role?: "admin" | "superadmin"
  isActive?: boolean
}
```

Input shape for `updateAdminUser(uid, input)`:

```ts
{
  uid?: string
  name?: string
  email?: string
  role?: "admin" | "superadmin"
  isActive?: boolean
}
```

Behavior:

- `createAdminUser()` writes to `adminUsers/{uid}`
- `uid` must match a real Firebase Authentication user
- `updateAdminUserRole()` changes only the role
- `setAdminUserStatus()` activates or deactivates access
- `deleteAdminUser()` removes the Firestore admin record

### Product Image Upload CRUD

Implemented in:

- [product-images.js](D:/portfolio/wasabi/shop-web/src/services/storage/product-images.js)

Functions:

- `createProductImagePath(productId, fileName)`
- `uploadProductImage({ file, productId })`
- `deleteProductImage(imagePath)`

Expected input:

- `productId: string`
- `fileName: string`
- `file: File`

Upload result shape:

```ts
{
  path: string
  photoUrl: string
}
```

Behavior:

- uploads image bytes into Firebase Storage
- returns the Storage path and public download URL
- `photoUrl` should usually be saved into the related product document

## Firestore Document IDs

This project currently uses:

- Product `id`: `string`
- Admin `uid`: `string`

This project does not use numeric document IDs.

If you need numeric business IDs later, add a separate field such as:

```json
{
  "productNumber": 1001
}
```

Do not replace Firestore document IDs with numbers unless you intentionally redesign the CRUD layer.

## Manual Firestore Setup

### Create the `products` collection

In Firestore:

1. Create collection `products`
2. Add documents with fields:
   - `name` as string
   - `price` as number
   - `isAvailable` as boolean
   - `category` as string
   - `photoUrl` as string
   - `shortDescription` as string
   - `createdAt` as timestamp
   - `updatedAt` as timestamp

### Create the `adminUsers` collection

In Firestore:

1. Create collection `adminUsers`
2. Create a document whose document ID is the Firebase Auth user UID
3. Add fields:
   - `uid` as string
   - `name` as string
   - `email` as string
   - `role` as string
   - `createdAt` as timestamp
   - `isActive` as boolean

## Admin Sign-In Flow

Admin sign-in uses:

- Firebase Authentication email/password
- Firestore admin profile lookup

Flow:

1. User signs in with email/password
2. App reads `adminUsers/{uid}`
3. App allows access only if:
   - document exists
   - `isActive === true`
   - `role` is `admin` or `superadmin`

Relevant files:

- [LoginPage.jsx](D:/portfolio/wasabi/shop-web/src/pages/LoginPage.jsx)
- [AuthContext.jsx](D:/portfolio/wasabi/shop-web/src/contexts/AuthContext.jsx)
- [AdminRoute.jsx](D:/portfolio/wasabi/shop-web/src/components/auth/AdminRoute.jsx)

## Public Storefront Product Rules

Guest storefront displays only products that pass validation.

A product must have:

- `name: string`
- `category: string`
- `shortDescription: string`
- `price: number`
- `isAvailable === true`

If `photoUrl` is empty, the storefront still shows the product with a placeholder image so shoppers can add it to the basket.

## Product CSV Import

Admins can bulk-create products from a dedicated admin import page opened from the product creation area.

Expected columns:

- `name`
- `price`
- `category`
- `shortDescription`
- `photoUrl` optional
- `isAvailable` optional

Behavior:

- import is create-only
- valid rows are imported even if other rows fail
- row-level validation errors are shown in the import page
- products without `photoUrl` stay visible in the catalog with a placeholder
- admins can add or replace a product image later from the existing product edit form

Validation lives in:

- [product.utils.js](D:/portfolio/wasabi/shop-web/src/features/products/product.utils.js)

## Suggested Firestore Rules

These are example rules only. Adjust them for your app.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /adminUsers/{uid} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For production, tighten these rules to real role-based access control.

## Suggested Storage Rules

Example only:

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

For production, restrict writes to true admins only.

## Local Development

Install packages:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

## Current Source Map

Main Firebase setup:

- [firebase.js](D:/portfolio/wasabi/shop-web/src/services/firebase.js)

Schema constants:

- [firebase-schema.js](D:/portfolio/wasabi/shop-web/src/config/firebase-schema.js)

Product model helpers:

- [product.model.js](D:/portfolio/wasabi/shop-web/src/features/products/product.model.js)
- [product.utils.js](D:/portfolio/wasabi/shop-web/src/features/products/product.utils.js)

Product Firestore CRUD:

- [products.js](D:/portfolio/wasabi/shop-web/src/services/firestore/products.js)

Admin model helpers:

- [admin-user.model.js](D:/portfolio/wasabi/shop-web/src/features/admin-users/admin-user.model.js)

Admin Firestore CRUD:

- [admin-users.js](D:/portfolio/wasabi/shop-web/src/services/firestore/admin-users.js)

Storage helpers:

- [product-images.js](D:/portfolio/wasabi/shop-web/src/services/storage/product-images.js)

Auth and protected routes:

- [AuthContext.jsx](D:/portfolio/wasabi/shop-web/src/contexts/AuthContext.jsx)
- [AdminRoute.jsx](D:/portfolio/wasabi/shop-web/src/components/auth/AdminRoute.jsx)
