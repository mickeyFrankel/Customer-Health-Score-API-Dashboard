# Customer Health API - Quick Reference

## Base URL
```
http://localhost:3000/api/checklists
```

## Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create new checklist | - |
| GET | `/` | List checklists | - |
| GET | `/:id` | Get single checklist | - |
| PUT | `/:id` | Update checklist | - |
| DELETE | `/:id` | Delete checklist | - |
| GET | `/customer/:customerId/stats` | Get customer stats | - |

## Request Examples

### Create Checklist
```bash
curl -X POST http://localhost:3000/api/checklists \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-456",
    "score": 85,
    "notes": "Customer is doing well"
  }'
```

### List Checklists
```bash
# All checklists
curl http://localhost:3000/api/checklists

# With filters
curl "http://localhost:3000/api/checklists?customerId=customer-456&minScore=70&maxScore=90&sortBy=score&sortOrder=desc&limit=20"
```

### Get Checklist
```bash
curl http://localhost:3000/api/checklists/checklist-123
```

### Update Checklist
```bash
curl -X PUT http://localhost:3000/api/checklists/checklist-123 \
  -H "Content-Type: application/json" \
  -d '{
    "score": 95,
    "notes": "Improved significantly"
  }'
```

### Delete Checklist
```bash
curl -X DELETE http://localhost:3000/api/checklists/checklist-123
```

### Get Customer Stats
```bash
curl http://localhost:3000/api/checklists/customer/customer-456/stats
```

## Query Parameters (List Endpoint)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `customerId` | string | - | Filter by customer ID |
| `minScore` | number | - | Minimum score (0-100) |
| `maxScore` | number | - | Maximum score (0-100) |
| `limit` | number | 10 | Items per page (1-100) |
| `offset` | number | 0 | Pagination offset |
| `sortBy` | enum | createdAt | Sort field: createdAt, updatedAt, score |
| `sortOrder` | enum | desc | Sort order: asc, desc |

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 404 | Not Found |
| 500 | Server Error |

## Data Model

```typescript
{
  id: string;           // Auto-generated CUID
  customerId: string;   // Required, 1-100 chars
  score: number;        // Required, integer 0-100
  notes: string | null; // Optional, max 1000 chars
  createdAt: Date;      // Auto-generated
  updatedAt: Date;      // Auto-updated
}
```

## Running the API

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate -w api

# Run development server
npm run dev -w api

# Run tests
npm test -w api
```

## Testing

```bash
# Run all tests
npm test -w api

# Watch mode
npm run test:watch -w api

# With coverage
npm test -- --coverage -w api
```
