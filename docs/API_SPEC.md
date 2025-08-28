## API Specification – Workflow Purchase Requests

Base URL: `/api/v1`

Conventions
- IDs are opaque strings.
- Dates use ISO 8601 in UTC, e.g., `2024-01-01T09:00:00Z`.
- Pagination: `page` (default 1), `pageSize` (default 20, max 100).
- Standard error shape:

```json
{
  "error": {
    "code": "string",
    "message": "human readable",
    "details": { "optional": "object" }
  }
}
```

---

### Endpoints Summary

Quick index of endpoints with HTTP methods and short descriptions. See detailed sections below.

| Group                      | Method | Path                                                        | Description                          |
|----------------------------|--------|-------------------------------------------------------------|--------------------------------------|
| Purchase Requests          | GET    | `/api/v1/purchase-requests`                                 | List requests (filters, pagination)  |
| Purchase Requests          | POST   | `/api/v1/purchase-requests`                                 | Create Draft request                 |
| Purchase Requests          | GET    | `/api/v1/purchase-requests/{id}`                            | Get request by id                    |
| Purchase Requests          | PUT    | `/api/v1/purchase-requests/{id}`                            | Update request (Draft only)          |
| Purchase Requests          | PATCH  | `/api/v1/purchase-requests/{id}`                            | Partial update (Draft only)          |
| Purchase Requests          | DELETE | `/api/v1/purchase-requests/{id}`                            | Delete (Draft/Rejected recommended)  |
| Purchase Requests          | GET    | `/api/v1/purchase-requests/{id}/transitions`                | Current valid transitions            |
| Purchase Requests          | POST   | `/api/v1/purchase-requests/{id}/submit`                     | Draft → Pending Approval             |
| Purchase Requests          | POST   | `/api/v1/purchase-requests/{id}/approve`                    | Pending Approval → Approved          |
| Purchase Requests          | POST   | `/api/v1/purchase-requests/{id}/reject`                     | Pending Approval → Rejected          |
| Purchase Requests          | POST   | `/api/v1/purchase-requests/{id}/withdraw`                   | Pending Approval → Draft             |
| Purchase Requests          | POST   | `/api/v1/purchase-requests/{id}/revise`                     | Rejected → Draft                     |
| Purchase Requests          | GET    | `/api/v1/purchase-requests/{id}/history`                    | Full activity timeline               |
| Purchase Requests          | GET    | `/api/v1/purchase-requests/{id}/comments`                   | List comments                        |
| Purchase Requests          | POST   | `/api/v1/purchase-requests/{id}/comments`                   | Add comment                          |
| Purchase Requests          | GET    | `/api/v1/purchase-requests/{id}/attachments`                | List attachments                     |
| Purchase Requests          | POST   | `/api/v1/purchase-requests/{id}/attachments`                | Upload attachment (multipart)        |
| Purchase Requests          | DELETE | `/api/v1/purchase-requests/{id}/attachments/{attachmentId}` | Delete attachment                    |
| Workflows                  | GET    | `/api/v1/workflows/purchase-requests/transitions`           | Static transition definitions        |
| Workflows                  | GET    | `/api/v1/workflows/purchase-requests/statuses`              | Status list                          |
| Workflows                  | GET    | `/api/v1/workflows/purchase-requests/{id}/transitions`      | Context-aware transitions (alias)    |
| Products                   | GET    | `/api/v1/products`                                          | List materials (filters, pagination) |
| Products                   | GET    | `/api/v1/products/{id}`                                     | Get material by id                   |
| Products                   | GET    | `/api/v1/products/categories`                               | List categories                      |
| Products                   | GET    | `/api/v1/products/categories/{category}/subcategories`      | List subcategories by category       |
| Products                   | GET    | `/api/v1/products/specifications`                           | Global specification schema          |
| Products                   | GET    | `/api/v1/products/{id}/specifications`                      | Item specifications                  |
| Products (Admin, optional) | POST   | `/api/v1/products`                                          | Create material                      |
| Products (Admin, optional) | PUT    | `/api/v1/products/{id}`                                     | Update material                      |
| Products (Admin, optional) | DELETE | `/api/v1/products/{id}`                                     | Delete material                      |
| Search (optional)          | GET    | `/api/v1/search`                                            | Cross-entity search                  |

### Schemas

PurchaseRequest
```json
{
  "id": "string",
  "title": "string",
  "requester": "string",
  "department": "string",
  "status": "Draft|Pending Approval|Approved|Rejected",
  "createdAt": "2024-01-01T09:00:00Z",
  "items": [
    {
      "id": "string",
      "name": "string",
      "quantity": 1,
      "unit": "Piece|Kg|Liter|Package",
      "materialId": "string|optional",
      "category": "string|optional",
      "subcategory": "string|optional",
      "code": "string|optional"
    }
  ],
  "history": [
    {
      "id": "string",
      "user": "string",
      "action": "string",
      "timestamp": "2024-01-01T10:00:00Z",
      "comment": "string|optional"
    }
  ],
  "attachments": [
    {
      "id": "string",
      "fileName": "string",
      "fileUrl": "string",
      "uploadedAt": "2024-01-01T11:00:00Z"
    }
  ],
  "notes": [
    {
      "id": "string",
      "user": "string",
      "action": "Comment Added",
      "timestamp": "2024-01-01T11:30:00Z",
      "comment": "string"
    }
  ]
}
```

Material (Product)
```json
{
  "id": "string",
  "code": "string|optional",
  "name": "string",
  "category": "string",
  "subcategory": "string",
  "unit": "Piece|Kg|Liter|Package"
}
```

WorkflowTransition
```json
{ "from": "Draft|Pending Approval|Approved|Rejected", "to": "Draft|Pending Approval|Approved|Rejected", "action": "string" }
```

---

### Purchase Requests
Resource: `/purchase-requests`

- GET `/purchase-requests`
  - Description: List requests with filters and pagination.
  - Query: `status?`, `department?`, `requester?`, `q?` (search title/ids), `from?` (date), `to?` (date), `page?`, `pageSize?`, `sort?` (e.g., `createdAt:desc`).
  - 200:
    ```json
    { "data": [/* PurchaseRequest (summary allowed) */], "page": 1, "pageSize": 20, "total": 123 }
    ```

- POST `/purchase-requests`
  - Description: Create a request in Draft.
  - Body:
    ```json
    { "title": "string", "requester": "string", "department": "string", "items": [ {"name": "string", "quantity": 1, "unit": "Piece|Kg|Liter|Package", "materialId": "string|optional"} ] }
    ```
  - 201: `PurchaseRequest`

- GET `/purchase-requests/{id}`
  - 200: `PurchaseRequest`

- PUT `/purchase-requests/{id}`
  - Description: Full update. Allowed only when `status=Draft`.
  - Body: same shape as POST create (server preserves history/attachments/notes/status).
  - 200: `PurchaseRequest`
  - 409: if not Draft.

- PATCH `/purchase-requests/{id}`
  - Description: Partial update of editable fields (`title`, `requester`, `department`, `items`). `Draft` only.
  - 200: `PurchaseRequest`
  - 409: if not Draft.

- DELETE `/purchase-requests/{id}`
  - Description: Delete a request. Recommended to allow when `status in [Draft, Rejected]`.
  - 204

Workflow actions for a request

- GET `/purchase-requests/{id}/transitions`
  - 200: `{ "data": [ WorkflowTransition ] }`

- POST `/purchase-requests/{id}/submit`
  - From: Draft → Pending Approval.
  - Body: `{ "comment": "string|optional" }`
  - 200: `PurchaseRequest`

- POST `/purchase-requests/{id}/approve`
  - From: Pending Approval → Approved.
  - Body: `{ "comment": "string|optional" }`
  - 200: `PurchaseRequest`

- POST `/purchase-requests/{id}/reject`
  - From: Pending Approval → Rejected.
  - Body: `{ "comment": "string|optional" }`
  - 200: `PurchaseRequest`

- POST `/purchase-requests/{id}/withdraw`
  - From: Pending Approval → Draft.
  - Body: `{ "comment": "string|optional" }`
  - 200: `PurchaseRequest`

- POST `/purchase-requests/{id}/revise`
  - From: Rejected → Draft.
  - Body: `{ "comment": "string|optional" }`
  - 200: `PurchaseRequest`

History, comments, attachments

- GET `/purchase-requests/{id}/history`
  - 200: `{ "data": [HistoryLog] }`

- GET `/purchase-requests/{id}/comments`
  - 200: `{ "data": [HistoryLog] }` (where `action = "Comment Added"`)

- POST `/purchase-requests/{id}/comments`
  - Body: `{ "comment": "string" }`
  - 201: `HistoryLog`

- GET `/purchase-requests/{id}/attachments`
  - 200: `{ "data": [Attachment] }`

- POST `/purchase-requests/{id}/attachments`
  - Content-Type: `multipart/form-data`
  - Fields: `file` (binary), `fileName` (string|optional)
  - 201: `Attachment`

- DELETE `/purchase-requests/{id}/attachments/{attachmentId}`
  - 204

---

### Workflows
Resource: `/workflows`

- GET `/workflows/purchase-requests/transitions`
  - Description: Static transition definitions for PurchaseRequest.
  - 200: `{ "data": [ WorkflowTransition ] }`

- GET `/workflows/purchase-requests/statuses`
  - 200: `{ "data": [ "Draft", "Pending Approval", "Approved", "Rejected" ] }`

Optionally, a context-aware endpoint:

- GET `/workflows/purchase-requests/{id}/transitions` → same as `/purchase-requests/{id}/transitions`.

---

### Products (Materials Catalog)
Resource: `/products`

- GET `/products`
  - Description: List products/materials with filters and pagination.
  - Query: `category?`, `subcategory?`, `q?` (name/code), `page?`, `pageSize?`.
  - 200: `{ "data": [ Material ], "page": 1, "pageSize": 20, "total": 200 }`

- GET `/products/{id}`
  - 200: `Material`

- GET `/products/categories`
  - 200: `{ "data": ["Office", "Lab", "IT", "Maintenance", "..."] }`

- GET `/products/categories/{category}/subcategories`
  - 200: `{ "data": ["Stationery", "Furniture", "..."] }`

- GET `/products/specifications`
  - Description: Catalog-wide specification schema definitions for products.
  - 200:
    ```json
    {
      "data": [
        { "name": "color", "type": "string", "enum": ["red","blue"], "appliesTo": ["Office"] },
        { "name": "capacity", "type": "number", "unit": "L", "appliesTo": ["Lab", "Maintenance"] }
      ]
    }
    ```

- GET `/products/{id}/specifications`
  - 200: `{ "data": { "color": "blue", "capacity": 1.5 } }`

Admin (optional, not required by current UI)

- POST `/products`
  - Body: `Material`
  - 201: `Material`

- PUT `/products/{id}`
  - Body: `Material`
  - 200: `Material`

- DELETE `/products/{id}`
  - 204

---

### Search helpers (optional)

- GET `/search`
  - Query: `q` (free text), `type` in `[purchase-requests, products]`, pagination params.
  - 200: `{ "data": [ {"type": "purchase-request|product", "id": "...", "title": "..."} ], "page": 1, "pageSize": 20, "total": 42 }`

---

### Notes on authorization (out of scope here)
This spec omits authentication/authorization. In production, protect mutating operations and workflow actions. Consider role-based access (Requester, Approver, Admin).


