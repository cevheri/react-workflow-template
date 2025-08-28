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
| Workflow Engine            | GET    | `/api/v1/workflows/instances/{id}/retrieve`                 | Get workflow instance                |
| Workflow Engine            | GET    | `/api/v1/workflows/instances/{id}/available_actions`        | List available actions               |
| Workflow Engine            | POST   | `/api/v1/workflows/instances/{id}/transitions/{action}`     | Perform transition action            |
| Workflow Engine            | POST   | `/api/v1/workflows/instances/{id}/comments/add`             | Add comment                          |
| Workflow Engine            | POST   | `/api/v1/workflows/instances/{id}/attachments/add`          | Add attachment (multipart)           |
| Workflow Engine            | GET    | `/api/v1/workflows/instances/{id}/histories`                | Instance history                     |
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

Workflow Engine
```json
{
  "WorkflowDefinition": {
    "id": "number",
    "name": "string",
    "description": "string|optional",
    "initialStateId": "number|optional"
  },
  "WorkflowState": {
    "id": "number",
    "workflowDefinitionId": "number",
    "name": "string",
    "description": "string|optional"
  },
  "WorkflowTransition": {
    "id": "number",
    "name": "string",
    "description": "string|optional",
    "fromStateId": "number",
    "toStateId": "number"
  },
  "WorkflowInstance": {
    "id": "number",
    "workflowDefinitionId": "number",
    "currentStateId": "number",
    "targetType": "string|optional",
    "targetTypeId": "number|optional",
    "context": { "any": "object" },
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T11:00:00Z",
    "workflowDefinition": "WorkflowDefinition|optional",
    "currentState": "WorkflowState|optional"
  },
  "WorkflowAction": { "id": "number", "name": "string", "fromStateId": "number", "toStateId": "number", "description": "string|optional" },
  "WorkflowHistory": {
    "id": "number",
    "workflowInstanceId": "number",
    "actionName": "string",
    "fromStateId": "number",
    "toStateId": "number",
    "notes": "string|optional",
    "createdAt": "2024-01-01T10:00:00Z",
    "createdBy": "string"
  },
  "WorkflowComment": { "id": "number", "workflowInstanceId": "number", "comment": "string", "createdAt": "2024-01-01T10:00:00Z", "createdBy": "string" },
  "WorkflowAttachment": { "id": "number", "workflowInstanceId": "number", "fileName": "string", "fileUrl": "string", "uploadedAt": "2024-01-01T11:00:00Z", "uploadedBy": "string" }
}
```

WorkflowTransition (deprecated inline format)
```json
{ "id": 10, "name": "Approve", "fromStateId": 2, "toStateId": 3 }
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

Workflow actions for a request (Deprecated)

This section is superseded by the generic Workflow Engine endpoints under `/api/v1/workflows/instances/*`.

---

### Workflows
Resource: `/workflows`

Generic Workflow Engine

The workflow engine provides generic endpoints to retrieve instance details, list available actions,
perform transitions, and manage comments/attachments/histories regardless of the target domain entity.

- GET `/workflows/instances/{id}/retrieve`
  - Description: Retrieve a workflow instance by id.
  - 200:
    ```json
    {
      "data": {
        "id": 1001,
        "workflowDefinitionId": 10,
        "currentStateId": 3,
        "targetType": "PURCHASE_REQUEST",
        "targetTypeId": 1,
        "context": {
          "purchase_request_id": 1,
          "purchase_request_number": "PR-001",
          "purchase_request_date": "2021-01-01",
          "purchase_request_amount": 1000,
          "purchase_request_status": "SUBMITTED"
        },
        "createdAt": "2021-01-01T09:00:00Z",
        "updatedAt": "2021-01-01T10:00:00Z",
        "workflowDefinition": { "id": 10, "name": "PURCHASE_REQUEST_FLOW", "initialStateId": 1 },
        "currentState": { "id": 3, "name": "SUBMITTED" }
      }
    }
    ```

- GET `/workflows/instances/{id}/available_actions`
  - Description: List available actions for the current state and caller permissions.
  - 200:
    ```json
    {
      "data": [
        { "id": 20, "name": "Submit", "fromStateId": 1, "toStateId": 3 },
        { "id": 21, "name": "Approve", "fromStateId": 3, "toStateId": 4 },
        { "id": 22, "name": "Reject", "fromStateId": 3, "toStateId": 5 }
      ]
    }
    ```

- POST `/workflows/instances/{id}/transitions/{action}`
  - Description: Execute a transition action on the instance (e.g., `approve`, `reject`).
  - Path param `{action}` can be either transition id or action slug, server SHOULD accept both. Recommended: use id.
  - Body:
    ```json
    { "transitionId": 21, "comment": "Approved by manager", "metadata": { "key": "value" } }
    ```
  - 200: same shape as `retrieve` with updated `currentStateId` and embedded `currentState`.
  - 409: invalid transition for current state
  - 403: caller not authorized for transition

- POST `/workflows/instances/{id}/comments/add`
  - Description: Add a comment to the instance.
  - Body: `{ "comment": "string" }`
  - 201:
    ```json
    { "data": { "id": 301, "workflowInstanceId": 1001, "comment": "Submitted by John", "createdAt": "2021-01-01T10:00:00Z", "createdBy": "john" } }
    ```

- POST `/workflows/instances/{id}/attachments/add`
  - Content-Type: `multipart/form-data`
  - Fields: `file` (binary), `fileName` (string|optional)
  - 201:
    ```json
    { "data": { "id": 401, "workflowInstanceId": 1001, "fileName": "quote.pdf", "fileUrl": "https://...", "uploadedAt": "2021-01-01T10:10:00Z", "uploadedBy": "john" } }
    ```

- GET `/workflows/instances/{id}/histories`
  - Description: List audit trail entries.
  - 200:
    ```json
    {
      "data": [
        { "id": 201, "workflowInstanceId": 1001, "actionName": "Submit", "fromStateId": 1, "toStateId": 3, "notes": "Submitted by John Doe", "createdAt": "2021-01-01T10:00:00Z", "createdBy": "john" },
        { "id": 202, "workflowInstanceId": 1001, "actionName": "Approve", "fromStateId": 3, "toStateId": 4, "notes": "Approved by Jane", "createdAt": "2021-01-01T12:00:00Z", "createdBy": "jane" }
      ]
    }
    ```

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


