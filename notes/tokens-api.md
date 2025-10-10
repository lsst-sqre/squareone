# Gafaelfawr Tokens API Documentation

## GET /auth/api/v1/users/{username}/tokens

### Overview
Lists all tokens for a specific user. This endpoint returns an array of TokenInfo objects containing details about each token.

### Endpoint Details
- **Path**: `/auth/api/v1/users/{username}/tokens`
- **Method**: `GET`
- **Tags**: `["user"]`
- **Operation ID**: `get_tokens_auth_api_v1_users__username__tokens_get`
- **Summary**: List tokens

### Path Parameters

#### username (required)
- **Type**: `string`
- **Location**: `path`
- **Constraints**:
  - minLength: 1
  - maxLength: 64
  - pattern: `^[a-z0-9](?:[a-z0-9]|-[a-z0-9])*[a-z](?:[a-z0-9]|-[a-z0-9])*$`
- **Example**: `someuser`
- **Description**: Username for which to list tokens

### Responses

#### 200 - Successful Response
Returns an array of TokenInfo objects.

**Content-Type**: `application/json`

**Response Schema**: Array of TokenInfo objects

#### 401 - Unauthenticated
User is not authenticated.

#### 403 - Permission Denied
User lacks permission to access this resource.

**Content-Type**: `application/json`

**Response Schema**: ErrorModel

#### 422 - Validation Error
Request validation failed.

**Content-Type**: `application/json`

**Response Schema**: HTTPValidationError

## Schema Definitions

### TokenInfo
Information about a token, including all data stored in the underlying database.

#### Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | User to whom the token was issued |
| `token_type` | TokenType | Yes | Type of the token |
| `service` | string \| null | No | Service to which the token was delegated (internal tokens only) |
| `scopes` | array[string] | Yes | Scopes of the token |
| `created` | integer | No | Creation timestamp in seconds since epoch |
| `expires` | integer \| null | No | Expiration timestamp in seconds since epoch |
| `token` | string | Yes | Token key (22 characters) |
| `token_name` | string \| null | No | User-given name of the token |
| `last_used` | integer \| null | No | Last used timestamp in seconds since epoch |
| `parent` | string \| null | No | Parent token key (22 characters) |

#### Field Details

- **username**:
  - minLength: 1, maxLength: 64
  - Example: `"someuser"`

- **token_type**:
  - See TokenType enum below
  - Example: `"session"`

- **service**:
  - minLength: 1, maxLength: 64 (when not null)
  - Example: `"some-service"`

- **scopes**:
  - Array of scope strings
  - Example: `["read:all", "user:token"]`

- **created**:
  - Unix timestamp (integer)
  - Example: `1614986130`

- **expires**:
  - Unix timestamp (integer) or null for no expiration
  - Example: `1616986130`

- **token**:
  - Exactly 22 characters
  - Example: `"5KVApqcVbSQWtO3VIRgOhQ"`

- **token_name**:
  - minLength: 1, maxLength: 64 (when not null)
  - Example: `"laptop token"`

- **last_used**:
  - Unix timestamp (integer) or null if never used
  - Example: `1614986130`

- **parent**:
  - Exactly 22 characters (when not null)
  - Example: `"DGO1OnPohl0r3C7wqhzRgQ"`

### TokenType (Enum)
The class/type of token.

**Possible values**:
- `"session"` - Session token
- `"user"` - User-created token
- `"notebook"` - Notebook token
- `"internal"` - Internal service token
- `"service"` - Service token
- `"oidc"` - OpenID Connect token

### ErrorModel
A structured API error message.

#### Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `detail` | array[ErrorDetail] | Yes | Array of error details |

### ErrorDetail
The detail of an error message.

#### Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `loc` | array[string] \| null | No | Location of the error |
| `msg` | string | Yes | Error message |
| `type` | string | Yes | Error type code |

#### Examples
- `loc`: `["area", "field"]`
- `msg`: `"Some error message"`
- `type`: `"some_code"`

### HTTPValidationError
Validation error response from FastAPI.

#### Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `detail` | array[ValidationError] | No | Array of validation errors |

### ValidationError
Individual validation error detail.

#### Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `loc` | array[string \| integer] | Yes | Location of the validation error |
| `msg` | string | Yes | Error message |
| `type` | string | Yes | Error type |

## Usage Example

### Request
```http
GET /auth/api/v1/users/someuser/tokens
Authorization: Bearer <token>
```

### Successful Response (200)
```json
[
  {
    "username": "someuser",
    "token_type": "user",
    "service": null,
    "scopes": ["read:all", "user:token"],
    "created": 1614986130,
    "expires": 1616986130,
    "token": "5KVApqcVbSQWtO3VIRgOhQ",
    "token_name": "laptop token",
    "last_used": 1615072530,
    "parent": null
  },
  {
    "username": "someuser",
    "token_type": "notebook",
    "service": null,
    "scopes": ["read:all"],
    "created": 1614990000,
    "expires": null,
    "token": "DGO1OnPohl0r3C7wqhzRgQ",
    "token_name": "notebook session",
    "last_used": 1615000000,
    "parent": "5KVApqcVbSQWtO3VIRgOhQ"
  }
]
```

### Error Response (403)
```json
{
  "detail": [
    {
      "loc": null,
      "msg": "Permission denied",
      "type": "permission_denied"
    }
  ]
}
```

## Authentication Requirements
This endpoint requires authentication via:
- Bearer token in the Authorization header
- Cookie authentication (for browser-based access)

Users can only list their own tokens unless they have admin privileges.

## Implementation Notes
- The username in the path must match the authenticated user's username (unless admin)
- Returns all token types associated with the user
- Token keys are truncated/shortened versions for security
- Timestamps are Unix timestamps in seconds since epoch
- Null values indicate optional fields that may not be present