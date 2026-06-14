# TaskFlow API Documentation

Base URL: `http://localhost:5000/api` (development)

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication

### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login User
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User
```
GET /api/auth/me
```
🔒 Protected

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Tasks

### Get Dashboard Stats
```
GET /api/tasks/stats
```
🔒 Protected

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "completed": 15,
    "pending": 7,
    "inProgress": 3,
    "completionPercentage": 60
  }
}
```

---

### Get All Tasks
```
GET /api/tasks
```
🔒 Protected

**Query Parameters:**
| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| search    | string | Search in title and description      |
| status    | string | Filter: Pending, In Progress, Completed |
| priority  | string | Filter: Low, Medium, High            |
| sortBy    | string | dueDate, createdAt, title, priority, status |
| order     | string | asc or desc (default: asc)           |

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Complete project proposal",
      "description": "Draft and submit the Q1 project proposal",
      "status": "In Progress",
      "priority": "High",
      "dueDate": "2024-02-15T00:00:00.000Z",
      "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-12T14:30:00.000Z"
    }
  ]
}
```

---

### Get Single Task
```
GET /api/tasks/:id
```
🔒 Protected

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Complete project proposal",
    "description": "Draft and submit the Q1 project proposal",
    "status": "In Progress",
    "priority": "High",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-12T14:30:00.000Z"
  }
}
```

---

### Create Task
```
POST /api/tasks
```
🔒 Protected

**Request Body:**
```json
{
  "title": "Complete project proposal",
  "description": "Draft and submit the Q1 project proposal",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2024-02-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { ... }
}
```

---

### Update Task
```
PUT /api/tasks/:id
```
🔒 Protected

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "status": "Completed",
  "priority": "Medium"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { ... }
}
```

---

### Delete Task
```
DELETE /api/tasks/:id
```
🔒 Protected

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Health Check

### API Status
```
GET /api/health
```

**Response (200):**
```json
{
  "success": true,
  "message": "TaskFlow API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

| Status Code | Description          |
|-------------|----------------------|
| 400         | Bad Request / Validation Error |
| 401         | Unauthorized         |
| 404         | Not Found            |
| 500         | Internal Server Error |
