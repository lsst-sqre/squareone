# Token Change History API Endpoint

## Endpoint Details

### GET `/auth/api/v1/users/{username}/token-change-history`

Get the change history of tokens for the current user.

**Operation ID**: `get_user_token_change_history_auth_api_v1_users__username__token_change_history_get`

**Tags**: `user`

**Description**: Get the change history of tokens for the current user. If a limit or cursor was specified, links to paginated results may be found in the `Link` header of the reply and the total number of records in the `X-Total-Count` header.

## Path Parameters

### `username` (required)
- **Type**: `string`
- **Location**: `path`
- **Constraints**:
  - minLength: 1
  - maxLength: 64
  - pattern: `^[a-z0-9](?:[a-z0-9]|-[a-z0-9])*[a-z](?:[a-z0-9]|-[a-z0-9])*$`
- **Example**: `someuser`

## Query Parameters

### `cursor` (optional)
- **Type**: `string` or `null`
- **Description**: Pagination cursor
- **Pattern**: `^p?[0-9]+_[0-9]+$`
- **Example**: `1614985055_4234`

### `limit` (optional)
- **Type**: `integer` or `null`
- **Description**: Maximum number of entries to return
- **Minimum**: 1
- **Example**: `500`

### `since` (optional)
- **Type**: `UtcDatetime` (string format: date-time) or `null`
- **Description**: Only show entries at or after this time
- **Example**: `2021-03-05T14:59:52Z`

### `until` (optional)
- **Type**: `UtcDatetime` (string format: date-time) or `null`
- **Description**: Only show entries before or at this time
- **Example**: `2021-03-05T14:59:52Z`

### `key` (optional)
- **Type**: `string` or `null`
- **Description**: Only show changes for this token
- **Constraints**:
  - minLength: 22
  - maxLength: 22
- **Example**: `dDQg_NTNS51GxeEteqnkag`

### `token_type` (optional)
- **Type**: `TokenType` enum or `null`
- **Description**: Only show tokens of this type
- **Example**: `user`
- **Allowed values**: `session`, `user`, `notebook`, `internal`, `service`, `oidc`

### `ip_address` (optional)
- **Type**: `string` or `null`
- **Description**: Only show changes from this IP or CIDR block
- **Example**: `198.51.100.0/24`

## Response

### 200 - Successful Response

**Content-Type**: `application/json`

**Body**: Array of `TokenChangeHistoryEntry` objects

**Response Headers**:
- **Link**: Links to paginated results if `limit` or `cursor` was given, structured according to [RFC 5988](https://datatracker.ietf.org/doc/html/rfc5988). One or more of `prev`, `next`, and `first` relation types may be provided.
- **X-Total-Count**: Total number of results if `limit` or `cursor` was given (integer)

### Error Responses

- **401**: Unauthenticated
- **403**: Permission denied (returns `ErrorModel`)
- **422**: Validation Error (returns `HTTPValidationError`)

## Schema Definitions

### TokenChangeHistoryEntry

Represents a record of a change to a token.

```json
{
  "token": "string",          // Token key (22 chars), e.g. "dDQg_NTNS51GxeEteqnkag"
  "username": "string",       // Username (1-64 chars), e.g. "someuser"
  "token_type": "TokenType",  // Type of token (enum)
  "token_name": "string|null", // Name of token (only for user tokens)
  "parent": "string|null",    // Key of parent token
  "scopes": ["string"],       // Array of scope strings
  "service": "string|null",   // Service name (for internal tokens)
  "expires": "integer|null",  // Expiration timestamp (seconds since epoch)
  "actor": "string",          // Username of person making the change
  "action": "TokenChange",    // Type of change (enum)
  "old_token_name": "string|null",  // Previous name (for edits)
  "old_scopes": ["string"]|null,    // Previous scopes (for edits)
  "old_expires": "integer|null",    // Previous expiration (for edits)
  "ip_address": "string|null",      // IP address of change
  "event_time": "integer"           // When the change was made (required but missing in schema)
}
```

**Required fields**: `token`, `username`, `token_type`, `scopes`, `actor`, `action`

### TokenType Enum
- `session`
- `user`
- `notebook`
- `internal`
- `service`
- `oidc`

### TokenChange Enum
- `create`
- `revoke`
- `expire`
- `edit`

### ErrorModel
```json
{
  "detail": [
    {
      "loc": ["string"],  // Location of error (optional)
      "msg": "string",     // Error message
      "type": "string"     // Error type code
    }
  ]
}
```

## Usage Notes

1. **Authentication**: This endpoint requires authentication (401 response for unauthenticated requests)

2. **Pagination**:
   - Use `cursor` parameter for pagination
   - Use `limit` to control number of results
   - Check `Link` header for navigation links
   - Check `X-Total-Count` header for total count

3. **Filtering**:
   - Filter by time range using `since` and `until`
   - Filter by specific token using `key`
   - Filter by token type using `token_type`
   - Filter by IP address or CIDR block using `ip_address`

4. **Change Types**:
   - `create`: Token was created
   - `revoke`: Token was revoked
   - `expire`: Token expired
   - `edit`: Token was modified (check `old_*` fields for previous values)

5. **Edit Changes**:
   - When `action` is `edit`, the response may include:
     - `old_token_name`: Previous token name
     - `old_scopes`: Previous scopes
     - `old_expires`: Previous expiration
   - Current values are in the main fields

6. **IP Address**:
   - May be `null` for internal changes (e.g., automatic expiration)
   - Supports CIDR notation for filtering

## Example Request

```bash
GET /auth/api/v1/users/someuser/token-change-history?limit=10&token_type=user
```

## Example Response

```json
[
  {
    "token": "dDQg_NTNS51GxeEteqnkag",
    "username": "someuser",
    "token_type": "user",
    "token_name": "laptop token",
    "parent": "1NOV_8aPwhCWj6rM-p1XgQ",
    "scopes": ["read:all"],
    "service": null,
    "expires": 1615785631,
    "actor": "adminuser",
    "action": "create",
    "ip_address": "198.51.100.50",
    "event_time": 1614985631
  },
  {
    "token": "dDQg_NTNS51GxeEteqnkag",
    "username": "someuser",
    "token_type": "user",
    "token_name": "new laptop token",
    "parent": "1NOV_8aPwhCWj6rM-p1XgQ",
    "scopes": ["read:all", "write:all"],
    "service": null,
    "expires": 1616785631,
    "actor": "someuser",
    "action": "edit",
    "old_token_name": "laptop token",
    "old_scopes": ["read:all"],
    "old_expires": 1615785631,
    "ip_address": "198.51.100.50",
    "event_time": 1615085631
  }
]
```

## Implementation Considerations

1. **Permissions**: Users can only view their own token change history (path parameter must match authenticated user)

2. **Timestamps**: All timestamps are in seconds since Unix epoch

3. **Usernames**: Follow strict pattern - lowercase letters, numbers, and hyphens only

4. **Token Keys**: Always exactly 22 characters

5. **CIDR Support**: IP address filtering supports both individual IPs and CIDR blocks

6. **Pagination Cursor Format**: Follows pattern `^p?[0-9]+_[0-9]+$`