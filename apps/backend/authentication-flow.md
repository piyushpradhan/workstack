# Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as API
    participant Auth as Auth Controller
    participant DB as Database

    Note over Client, DB: Registration
    Client->>API: POST /auth/register<br/>{email, password}
    API->>Auth: register()
    Auth->>Auth: hash password
    Auth->>DB: create user
    API-->>Client: 201 Created

    Note over Client, DB: Login
    Client->>API: POST /auth/login<br/>{email, password}
    API->>Auth: login()
    Auth->>DB: find user
    Auth->>Auth: verify password
    
    alt Valid credentials
        Auth->>DB: create session
        Auth->>Auth: generate JWT token
        API-->>Client: {accessToken, sessionId}
    else Invalid credentials
        API-->>Client: 401 Unauthorized
    end

    Note over Client, DB: Protected Route
    Client->>API: GET /protected<br/>Authorization: Bearer <token>
    API->>API: verify JWT token
    API->>DB: validate session
    API-->>Client: Protected resource
```

## Key Components

### 1. **Registration**
- User provides email and password
- Password is hashed and stored in database
- Returns success response

### 2. **Login**
- User provides email and password
- System validates credentials
- On success: creates session and returns JWT token
- On failure: returns unauthorized error

### 3. **Protected Routes**
- Client sends JWT token in Authorization header
- API verifies token and validates session
- Grants access to protected resources

## Security Features
- **Password Hashing**: bcrypt encryption
- **JWT Tokens**: Secure access tokens with expiration
- **Session Management**: Database-backed sessions
- **Token Validation**: Signature and type verification
