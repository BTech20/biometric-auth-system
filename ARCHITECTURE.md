# System Architecture

## 🏗️ Overview

The Biometric Authentication System is a research-oriented multimodal biometric authentication platform that combines **face recognition** and **fingerprint recognition** using deep learning techniques. The system follows a modern **client-server architecture** with clear separation of concerns across multiple layers.

### Architecture Philosophy

The architecture is designed with the following principles:

1. **Modularity**: Each component has a single, well-defined responsibility
2. **Scalability**: Stateless design allows horizontal scaling of services
3. **Security**: Defense-in-depth approach with multiple security layers
4. **Flexibility**: Support for multiple biometric modalities and input methods
5. **Performance**: Optimized deep learning pipeline with efficient hashing
6. **Accessibility**: Cross-platform web interface accessible from desktop and mobile devices

### Key Architectural Decisions

**Client-Side Processing**
- Image capture and quality checks performed in browser to reduce server load
- Base64 encoding enables seamless transmission without file upload complexity
- Real-time preview and validation improve user experience

**Deep Hashing Approach**
- 512-dimensional feature vectors compressed to 128-bit binary codes
- Hamming distance enables O(1) similarity computation vs O(n) for Euclidean distance
- Binary codes reduce storage from 2KB (float32) to 16 bytes per template
- Configurable threshold (5-50) allows tuning for security vs usability

**Multimodal Fusion**
- Separate ResNet models (ResNet50 for face, ResNet18 for fingerprint) optimize for each modality
- Score-level fusion averages Hamming distances for final decision
- Multimodal approach significantly reduces False Accept Rate (FAR) and False Reject Rate (FRR)

**Stateless Authentication**
- JWT tokens eliminate server-side session storage
- Enables horizontal scaling without sticky sessions
- 24-hour token expiry balances security and convenience

The system processes biometric data through a seven-layer architecture, from client capture to persistent storage, with security controls applied at each layer.

## 📊 High-Level Architecture

```mermaid
graph TB
    subgraph ClientLayer["Client Layer"]
        A[Web Browser] --> B[React Application]
        B --> C[Material-UI Components]
        B --> D[React Router]
        B --> E[Axios HTTP Client]
    end
    
    subgraph CommLayer["Communication Layer"]
        E --> F[REST API]
        F --> G[JWT Authentication]
    end
    
    subgraph ServerLayer["Server Layer"]
        G --> H[Flask Application]
        H --> I[Route Handlers]
        I --> J[Business Logic]
    end
    
    subgraph DataLayer["Data Processing Layer"]
        J --> K[Image Preprocessing]
        K --> L[Deep Learning Models]
        L --> M[ResNet50 Face]
        L --> N[ResNet18 Fingerprint]
        M --> O[Feature Extraction]
        N --> O
        O --> P[Deep Hashing]
        P --> Q[Binary Codes]
    end
    
    subgraph PersistLayer["Persistence Layer"]
        J --> R[SQLAlchemy ORM]
        R --> S[SQLite Database]
        Q --> S
        J --> T[File System]
        T --> U[Uploaded Images]
    end
```

## 🔄 Component Architecture

### Frontend Architecture

```mermaid
graph LR
    A[App.js] --> B[Router]
    B --> C[Login]
    B --> D[Register]
    B --> E[Dashboard]
    B --> F[BiometricVerify]
    B --> G[Analytics]
    
    C --> H[AuthService]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Axios API Client]
    
    D --> J[HardwareFingerprintScanner]
    D --> K[ImageQualityCheck]
    D --> L[ThresholdConfig]
    
    F --> J
    F --> K
    F --> L
    
    J --> M[WebAuthn Utilities]
```

### Backend Architecture

```mermaid
graph TB
    A[Flask App] --> B[Blueprints Routes]
    B --> C[POST api register]
    B --> D[POST api login]
    B --> E[POST api verify]
    B --> F[GET api profile]
    B --> G[GET api stats]
    
    C --> H[Auth Controller]
    D --> H
    E --> I[Verify Controller]
    F --> J[Profile Controller]
    G --> K[Analytics Controller]
    
    H --> L[User Model]
    I --> L
    J --> L
    K --> L
    
    L --> M[SQLAlchemy]
    M --> N[SQLite Database]
    
    I --> O[Biometric Processor]
    O --> P[Image Preprocessing]
    P --> Q[Model Inference]
    Q --> R[Deep Hashing]
    R --> S[Hamming Distance]
```

## 🗄️ Database Schema

```mermaid
graph TB
    subgraph USERS["USERS Table"]
        U1[id - Primary Key]
        U2[username - Unique]
        U3[email - Unique]
        U4[password_hash]
        U5[face_template]
        U6[fingerprint_template]
        U7[is_active]
        U8[created_at]
        U9[updated_at]
    end
    
    subgraph AUTH_LOGS["AUTHENTICATION_LOGS Table"]
        A1[id - Primary Key]
        A2[user_id - Foreign Key]
        A3[auth_method]
        A4[success]
        A5[hamming_distance]
        A6[threshold]
        A7[timestamp]
        A8[ip_address]
    end
    
    USERS --> AUTH_LOGS
```

## 🧠 Deep Learning Pipeline

```mermaid
graph LR
    A[Input Image] --> B[Resize 224x224]
    B --> C[Normalize RGB]
    C --> D[Tensor Conversion]
    D --> E[ResNet Backbone]
    E --> F[Feature Vector 512D]
    F --> G[Hash Layer]
    G --> H[Sigmoid Activation]
    H --> I[Binary Quantization]
    I --> J[Binary Hash Code]
```

### Model Specifications

**Face Recognition Model:**
- Architecture: ResNet50
- Input: 224x224x3 RGB
- Feature Dimension: 512
- Hash Size: 128 bits
- Pretrained: ImageNet

**Fingerprint Recognition Model:**
- Architecture: ResNet18
- Input: 224x224x3 (grayscale converted)
- Feature Dimension: 512
- Hash Size: 128 bits
- Pretrained: ImageNet

## 🔐 Security Architecture

```mermaid
graph TB
    A[Client Request] --> B{HTTPS Check}
    B --> C[Reject Request]
    B --> D[CORS Check]
    D --> E{Valid Origin Check}
    E --> C
    E --> F[JWT Validation]
    F --> G{Valid Token Check}
    G --> H[401 Unauthorized]
    G --> I[Input Validation]
    I --> J{Valid Input Check}
    J --> K[400 Bad Request]
    J --> L[Process Request]
    L --> M[Response]
```

### Security Layers

1. **Transport Security**
   - HTTPS/TLS encryption
   - Certificate validation

2. **Authentication**
   - JWT tokens (24h expiry)
   - Password hashing (bcrypt)
   - Token refresh mechanism

3. **Authorization**
   - Role-based access control
   - Resource ownership validation

4. **Data Protection**
   - Biometric templates hashed
   - Passwords never stored plaintext
   - SQL injection prevention (ORM)
   - XSS protection headers

## 📡 API Architecture

### RESTful Endpoints

```mermaid
graph LR
    A[Client] --> B[Registration]
    A --> C[Authentication]
    A --> D[Profile Retrieval]
    A --> E[Biometric Verification]
    A --> F[Analytics]
    
    B --> G[201 Created]
    C --> H[200 OK Token]
    D --> I[200 OK Data]
    E --> J[200 OK Result]
    F --> K[200 OK Stats]
    
    A -.->|POST register| B
    A -.->|POST login| C
    A -.->|GET profile| D
    A -.->|POST verify| E
    A -.->|GET stats| F
```

### Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant A as API
    participant B as Backend
    participant M as ML Model
    participant D as Database
    
    C->>F: User Action
    F->>A: HTTP Request + JWT
    A->>B: Validate Token
    B->>B: Authorize
    B->>M: Process Biometrics
    M->>M: Extract Features
    M->>M: Generate Hash
    B->>D: Query/Update
    D->>B: Result
    B->>A: Response
    A->>F: JSON Data
    F->>C: Update UI
```

## 💾 Data Flow

```mermaid
graph TB
    A[User Captures Image] --> B[Base64 Encoding]
    B --> C[HTTP POST Backend]
    C --> D[Decode Base64]
    D --> E[Save to Uploads]
    E --> F[Load Image]
    F --> G[Preprocess]
    G --> H[Model Inference]
    H --> I[Extract Features]
    I --> J[Hash Generation]
    J --> K[Store in Database]
    
    K --> L[Verification Request]
    L --> M[Load Stored Hash]
    M --> N[New Image Capture]
    N --> O[Generate New Hash]
    O --> P[Hamming Distance]
    P --> Q{Distance Less Than Threshold}
    Q --> R[Verified]
    Q --> S[Failed]
```

## 🔄 Verification Process

```mermaid
graph TB
    A[Start] --> B[Capture Images]
    B --> C{Quality Check}
    C -->|Poor Quality| B
    C -->|Quality OK| D[Preprocessing]
    D --> E[Feature Extraction]
    E --> F[Hash Generation]
    F --> G[Database Query]
    G --> H[Distance Calculation]
    H --> I{Threshold Comparison}
    I -->|Distance Low| J[Verified]
    I -->|Distance High| K[Failed]
    J --> L[End]
    K --> L[End]
```

## 🌐 Deployment Architecture

```mermaid
graph TB
    subgraph ClientDevices["Client Devices"]
        A[Desktop Browser]
        B[Mobile Browser]
        C[Tablet Browser]
    end
    
    subgraph CDNHosting["CDN Hosting"]
        D[Static Assets]
        E[React Build]
    end
    
    subgraph AppServer["Application Server"]
        F[Flask API]
        G[Gunicorn]
        H[WSGI]
    end
    
    subgraph MLInfra["ML Infrastructure"]
        I[PyTorch Models]
        J[GPU CPU Compute]
    end
    
    subgraph DataStorage["Data Storage"]
        K[Database Server]
        L[File Storage]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    F --> K
    F --> L
```

## 📱 Mobile Architecture

```mermaid
graph TB
    A[Mobile Browser] --> B[Camera API]
    B --> C{Permission Check}
    C --> D[Access Camera]
    C --> E[Show Error]
    D --> F[Front Camera Face]
    D --> G[Rear Camera Finger]
    F --> H[Base64 Image]
    G --> H
    H --> I[Upload to Server]
    I --> J[Process Verify]
    
    K[PWA Manifest] --> L[Install Prompt]
    L --> M[Standalone Mode]
```

## 🔧 Technology Stack Details

### Frontend Stack
```yaml
Core:
  - React: 18.2.0
  - React Router: 6.20.0
  - Material-UI: 5.x

HTTP:
  - Axios: 1.6.0

Biometrics:
  - react-webcam: 7.x
  - WebAuthn API (native)

State Management:
  - React Hooks (useState, useEffect, useRef)

Styling:
  - Emotion (MUI)
  - Custom CSS
```

### Backend Stack
```yaml
Framework:
  - Flask: 3.0.0
  - Flask-CORS: 4.x
  - Flask-JWT-Extended: 4.x

Database:
  - SQLAlchemy: 2.x
  - SQLite: 3.x

Deep Learning:
  - PyTorch: 2.x
  - torchvision: 0.x
  - ResNet50, ResNet18

Security:
  - bcrypt: 4.x
  - PyJWT: 2.x

Utilities:
  - Pillow: 10.x
  - NumPy: 1.x
```

## 🚀 Performance Considerations

```mermaid
graph LR
    A[Optimization Strategies]
    A --> B[Frontend]
    A --> C[Backend]
    
    B --> D[Code Splitting]
    B --> E[Lazy Loading]
    B --> F[Image Compression]
    B --> G[Caching]
    
    C --> H[Model Caching]
    C --> I[Connection Pooling]
    C --> J[Async Processing]
    C --> K[GPU Acceleration]
```

### Performance Metrics
- Image upload: < 2 seconds
- Model inference: < 500ms (CPU) / < 100ms (GPU)
- Database query: < 50ms
- Total verification time: < 3 seconds
- API response time: < 1 second (avg)

## 📊 Scalability

```mermaid
graph TB
    A[Load Balancer] --> B[Frontend Server 1]
    A --> C[Frontend Server 2]
    A --> D[Frontend Server N]
    
    E[API Gateway] --> F[Backend Server 1]
    E --> G[Backend Server 2]
    E --> H[Backend Server N]
    
    F --> I[Model Serving]
    G --> I
    H --> I
    
    I --> J[Shared Database]
    I --> K[Object Storage]
```

### Scaling Strategies
1. **Horizontal Scaling**: Add more backend instances
2. **Model Optimization**: TensorRT, ONNX conversion
3. **Caching**: Redis for frequent queries
4. **CDN**: Static asset distribution
5. **Database**: Read replicas, sharding

---

**Last Updated:** January 2026
**Version:** 1.0.0
