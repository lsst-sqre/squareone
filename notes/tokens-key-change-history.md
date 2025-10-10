# Token Change History API Endpoint

## Endpoint Information

**Path**: `/auth/api/v1/users/{username}/tokens/{key}/change-history`
**Method**: `GET`
**Tags**: `["user"]`
**Operation ID**: `get_token_change_history_auth_api_v1_users__username__tokens__key__change_history_get`

## Summary
Get change history of token - All changes are returned. Pagination is not supported.

## Path Parameters

### username
- **Type**: `string`
- **Location**: `path`
- **Required**: `true`
- **Constraints**:
  - `minLength`: 1
  - `maxLength`: 64
  - `pattern`: `^[a-z0-9](?:[a-z0-9]|-[a-z0-9])*[a-z](?:[a-z0-9]|-[a-z0-9])*$`
- **Title**: Username
- **Example**: `"someuser"`

### key
- **Type**: `string`
- **Location**: `path`
- **Required**: `true`
- **Constraints**:
  - `minLength`: 22
  - `maxLength`: 22
- **Title**: Token key
- **Example**: `"GpbIL3_qhgZlpfGTFF"`

## Responses

### 200 - Successful Response
**Content Type**: `application/json`
**Schema**: Array of `TokenChangeHistoryEntry` objects

### 401 - Unauthenticated
No content returned

### 403 - Permission denied
**Content Type**: `application/json`
**Schema**: `ErrorModel`

### 404 - Token not found
**Content Type**: `application/json`
**Schema**: `ErrorModel`

### 422 - Validation Error
**Content Type**: `application/json`
**Schema**: `HTTPValidationError`

## Schema Definitions

### TokenChangeHistoryEntry
A record of a change to a token.

**Required fields**: `token`, `username`, `token_type`, `scopes`, `actor`, `action`

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `token` | `string` (22 chars) | Token key | `"dDQg_NTNS51GxeEteqnkag"` |
| `username` | `string` (1-64 chars) | Username of the token | `"someuser"` |
| `token_type` | `TokenType` | Type of the token | `"user"` |
| `token_name` | `string` or `null` | Name of the token (only for user tokens). If the name was changed, this will be the new name | `"a token"` |
| `parent` | `string` or `null` | Key of parent token of this token | `"1NOV_8aPwhCWj6rM-p1XgQ"` |
| `scopes` | `array[string]` | Scopes of the token | `["read:all"]` |
| `service` | `string` or `null` | Service to which the token was issued (only for internal tokens) | `"some-service"` |
| `expires` | `integer` or `null` | Expiration timestamp (seconds since epoch). If changed, this is the new expiration | `1615785631` |
| `actor` | `string` (1-64 chars) | Username of person making the change | `"adminuser"` |
| `action` | `TokenChange` | Type of change that was made | `"edit"` |
| `old_token_name` | `string` or `null` | Previous name (only for edit changes that changed the name) | `"old name"` |
| `old_scopes` | `array[string]` or `null` | Previous scopes (only for edit changes that changed scopes) | `["read:some"]` |
| `old_expires` | `integer` or `null` | Previous expiration timestamp (only for edit changes that changed expiration) | `1614985631` |
| `ip_address` | `string` or `null` | IP address from which the change was made (null for internal changes) | `"198.51.100.50"` |
| `event_time` | `integer` | When the change was made (timestamp) | `1614985631` |

### TokenType (Enum)
The class of token. Possible values:
- `"session"`
- `"user"`
- `"notebook"`
- `"internal"`
- `"service"`
- `"oidc"`

### TokenChange (Enum)
Type of change made to a token. Possible values:
- `"create"`
- `"revoke"`
- `"expire"`
- `"edit"`

### ErrorModel
A structured API error message.

| Field | Type | Description |
|-------|------|-------------|
| `detail` | `array[ErrorDetail]` | Array of error details |

### ErrorDetail
The detail of the error message.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `loc` | `array[string]` or `null` | No | Location | `["area", "field"]` |
| `msg` | `string` | Yes | Message | `"Some error message"` |
| `type` | `string` | Yes | Error type | `"some_code"` |

### HTTPValidationError
Validation error response.

| Field | Type | Description |
|-------|------|-------------|
| `detail` | `array[ValidationError]` | Validation error details |

### ValidationError
| Field | Type | Description |
|-------|------|-------------|
| `loc` | `array[string or integer]` | Location of error |
| `msg` | `string` | Error message |
| `type` | `string` | Error type |

## Usage Notes

1. **Authentication**: This endpoint requires authentication. The user must be authenticated to access token change history.

2. **Authorization**: Users can only access change history for their own tokens (when username matches the authenticated user) unless they have admin privileges.

3. **No Pagination**: All change history entries are returned in a single response. There's no pagination support for this endpoint.

4. **Change Tracking**: The endpoint tracks various types of changes:
   - Token creation (`create`)
   - Token revocation (`revoke`)
   - Token expiration (`expire`)
   - Token edits (`edit`) - tracks changes to name, scopes, or expiration

5. **Edit Changes**: When an edit is made, the response includes:
   - Current values in the main fields (`token_name`, `scopes`, `expires`)
   - Previous values in `old_*` fields (only for fields that were changed)

6. **Timestamps**: All timestamps are Unix timestamps (seconds since epoch)

## Example Request

```http
GET /auth/api/v1/users/someuser/tokens/GpbIL3_qhgZlpfGTFF/change-history
Authorization: Bearer <token>
```

## Example Response

```json
[
  {
    "token": "dDQg_NTNS51GxeEteqnkag",
    "username": "someuser",
    "token_type": "user",
    "token_name": "Updated laptop token",
    "parent": null,
    "scopes": ["read:all", "write:data"],
    "service": null,
    "expires": 1615785631,
    "actor": "someuser",
    "action": "edit",
    "old_token_name": "Laptop token",
    "old_scopes": ["read:all"],
    "old_expires": null,
    "ip_address": "198.51.100.50",
    "event_time": 1614985631
  },
  {
    "token": "dDQg_NTNS51GxeEteqnkag",
    "username": "someuser",
    "token_type": "user",
    "token_name": "Laptop token",
    "parent": null,
    "scopes": ["read:all"],
    "service": null,
    "expires": null,
    "actor": "someuser",
    "action": "create",
    "old_token_name": null,
    "old_scopes": null,
    "old_expires": null,
    "ip_address": "198.51.100.50",
    "event_time": 1614985000
  }
]
```

## Integration Notes for UI Development

1. **Error Handling**: Be prepared to handle:
   - 401 for unauthenticated users
   - 403 for unauthorized access
   - 404 when the token doesn't exist
   - 422 for invalid parameters

2. **Display Considerations**:
   - Show change type clearly (create, revoke, expire, edit)
   - For edits, highlight what was changed using old_* fields
   - Convert Unix timestamps to human-readable dates
   - Display IP addresses for audit purposes
   - Show actor to identify who made changes

3. **Security**:
   - Token keys should be handled carefully
   - Consider masking or truncating token displays
   - Validate username and key formats before making requests

4. **Performance**:
   - Since there's no pagination, be prepared to handle potentially large response arrays
   - Consider implementing client-side pagination or filtering for better UX