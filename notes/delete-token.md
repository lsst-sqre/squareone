# Gafaelfawr Token Delete API Endpoint

## Endpoint Information

### DELETE `/auth/api/v1/users/{username}/tokens/{key}`

Revoke/delete a user token.

- **Tags:** `["user"]`
- **Operation ID:** `delete_token_auth_api_v1_users__username__tokens__key__delete`
- **Summary:** "Revoke token"

## Path Parameters

### `username` (required)
- **Type:** `string`
- **Location:** path
- **Min Length:** 1
- **Max Length:** 64
- **Pattern:** `^[a-z0-9](?:[a-z0-9]|-[a-z0-9])*[a-z](?:[a-z0-9]|-[a-z0-9])*$`
- **Title:** "Username"
- **Example:** `"someuser"`
- **Description:** Username of the token owner. Must contain only lowercase letters, digits, and hyphens. Cannot start or end with a dash, and must contain at least one letter.

### `key` (required)
- **Type:** `string`
- **Location:** path
- **Min Length:** 22
- **Max Length:** 22
- **Title:** "Token key"
- **Example:** `"GpbIL3_qhgZlpfGTFF"`
- **Description:** The unique token identifier to delete. Must be exactly 22 characters.

## Header Parameters

### `x-csrf-token` (optional)
- **Type:** `string` or `null`
- **Location:** header
- **Title:** "CSRF token"
- **Description:** "Only required when authenticating with a cookie, such as via the JavaScript UI."
- **Example:** `"OmNdVTtKKuK_VuJsGFdrqg"`

## Request Body

No request body required.

## Response Codes

### 204 No Content
- **Description:** "Successful Response"
- **Content:** None (empty response body)
- Token was successfully deleted

### 401 Unauthorized
- **Description:** "Unauthenticated"
- User is not authenticated

### 403 Forbidden
- **Description:** "Permission denied"
- **Content Type:** `application/json`
- **Schema:** `ErrorModel` (see below)
- User does not have permission to delete this token

### 404 Not Found
- **Description:** "Token not found"
- **Content Type:** `application/json`
- **Schema:** `ErrorModel` (see below)
- The specified token does not exist

### 422 Unprocessable Entity
- **Description:** "Validation Error"
- **Content Type:** `application/json`
- **Schema:** `HTTPValidationError` (see below)
- Request parameters failed validation

## Error Response Schemas

### ErrorModel
```json
{
  "detail": [
    {
      "loc": ["area", "field"],  // optional, array of strings
      "msg": "Some error message",  // required string
      "type": "some_code"  // required string
    }
  ]
}
```

**Properties:**
- `detail` (required): Array of ErrorDetail objects

### ErrorDetail
**Properties:**
- `loc` (optional): Array of strings or null - Location of the error
- `msg` (required): string - Error message
- `type` (required): string - Error type code

### HTTPValidationError
```json
{
  "detail": [
    {
      "loc": ["field_name"],  // required, array of strings or integers
      "msg": "validation error message",  // required string
      "type": "validation_error_type"  // required string
    }
  ]
}
```

**Properties:**
- `detail`: Array of ValidationError objects

### ValidationError
**Properties:**
- `loc` (required): Array of strings or integers - Field location
- `msg` (required): string - Validation error message
- `type` (required): string - Validation error type

## Authentication

The endpoint requires authentication via one of:
1. **Bearer token** in the Authorization header: `Authorization: Bearer <token>`
2. **Cookie authentication** with CSRF token in the `x-csrf-token` header

## Usage Examples

### Using Bearer Token
```bash
curl -X DELETE \
  "https://example.com/auth/api/v1/users/someuser/tokens/GpbIL3_qhgZlpfGTFF" \
  -H "Authorization: Bearer <your-auth-token>"
```

### Using Cookie Authentication
```bash
curl -X DELETE \
  "https://example.com/auth/api/v1/users/someuser/tokens/GpbIL3_qhgZlpfGTFF" \
  -H "Cookie: <session-cookie>" \
  -H "X-CSRF-Token: OmNdVTtKKuK_VuJsGFdrqg"
```

## JavaScript/TypeScript Implementation Notes

When implementing in a React/Next.js application:

1. **CSRF Token:** If using cookie authentication (common in browser-based UIs), you must include the CSRF token in the `X-CSRF-Token` header
2. **Response Handling:** A successful deletion returns 204 with no content
3. **Error Handling:** Handle 401, 403, 404, and 422 responses appropriately
4. **Path Construction:** Ensure the username and key are properly URL-encoded if they contain special characters

### Example TypeScript Interface
```typescript
interface DeleteTokenParams {
  username: string;
  key: string;
  csrfToken?: string;
}

interface ErrorDetail {
  loc?: string[] | null;
  msg: string;
  type: string;
}

interface ErrorModel {
  detail: ErrorDetail[];
}

interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface HTTPValidationError {
  detail: ValidationError[];
}
```

## Important Notes

- Users can only delete their own tokens unless they have admin privileges
- The token key must be exactly 22 characters long
- Once deleted, a token cannot be recovered
- The deletion is immediate and does not require confirmation via the API