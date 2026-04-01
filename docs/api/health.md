# Health Check API

## GET /api/health

- Description: Simple liveness/readiness endpoint for monitoring.
- Response example:

```
200 OK
{
  "success": true,
  "message": "OK",
  "data": {
    "service": "e-warranty-backend",
    "status": "ok",
    "time": "2026-04-01T10:00:00Z"
  }
}
```
