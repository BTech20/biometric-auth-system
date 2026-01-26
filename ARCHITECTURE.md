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
flowchart TB
    A[Web Browser] --> B[React App]
    B --> C[Material UI]
    B --> D[HTTP Client]
    D --> E[Flask API]
    E --> F[JWT Auth]
    F --> G[Route Handlers]
    G --> H[Business Logic]
    H --> I[ML Models]
    I --> J[ResNet50 Face]
    I --> K[ResNet18 Fingerprint]
    J --> L[Feature Extraction]
    K --> L
    L --> M[Binary Hashing]
    M --> N[SQLite DB]
    H --> O[File System]
```

## 🔄 Component Architecture

### Frontend Architecture

```mermaid
flowchart LR
    A[App.js] --> B[Router]
    B --> C[Login]
    B --> D[Register]
    B --> E[Dashboard]
    B --> F[Verify]
    B --> G[Analytics]
    C --> H[AuthService]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I[API Client]
```

### Backend Architecture

```mermaid
flowchart TB
    A[Flask App] --> B[Routes]
    B --> C[Register]
    B --> D[Login]
    B --> E[Verify]
    B --> F[Profile]
    B --> G[Stats]
    C --> H[Auth Controller]
    D --> H
    E --> I[Verify Controller]
    F --> J[Profile Controller]
    G --> K[Analytics Controller]
    H --> L[User Model]
    I --> L
    J --> L
    K --> L
    L --> M[Database]
```

## 🗄️ Database Schema

```mermaid
flowchart TB
    A[Users Table] --> B[Authentication Logs]
    C[id username email] --> A
    D[password_hash face_template] --> A
    E[fingerprint_template created_at] --> A
    F[user_id auth_method success] --> B
    G[timestamp ip_address] --> B
```

## 🧠 Deep Learning Pipeline

```mermaid
flowchart LR
    A[Input Image] --> B[Resize]
    B --> C[Normalize]
    C --> D[Tensor]
    D --> E[ResNet]
    E --> F[Features]
    F --> G[Hash Layer]
    G --> H[Sigmoid]
    H --> I[Binary Code]
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
flowchart TB
    A[Client Request] --> B[HTTPS Check]
    B --> C[Valid]
    B --> D[Invalid]
    C --> E[CORS Check]
    E --> F[JWT Validation]
    F --> G[Input Validation]
    G --> H[Process Request]
    H --> I[Response]
    D --> J[Reject]
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
flowchart LR
    A[Client] --> B[Registration]
    A --> C[Authentication]
    A --> D[Profile]
    A --> E[Verification]
    A --> F[Analytics]
    B --> G[201 Created]
    C --> H[200 OK]
    D --> I[200 OK]
    E --> J[200 OK]
    F --> K[200 OK]
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
flowchart TB
    A[Capture Image] --> B[Encode Base64]
    B --> C[POST Backend]
    C --> D[Decode]
    D --> E[Save Upload]
    E --> F[Load Image]
    F --> G[Preprocess]
    G --> H[ML Inference]
    H --> I[Extract Features]
    I --> J[Generate Hash]
    J --> K[Store DB]
    K --> L[Verify Request]
    L --> M[Load Hash]
    M --> N[New Image]
    N --> O[New Hash]
    O --> P[Compare]
    P --> Q[Result]
```

## 🔄 Verification Process

```mermaid
flowchart TB
    A[Start] --> B[Capture]
    B --> C[Quality Check]
    C --> D[Good Quality]
    C --> E[Poor Quality]
    E --> B
    D --> F[Preprocess]
    F --> G[Extract Features]
    G --> H[Generate Hash]
    H --> I[Query DB]
    I --> J[Calculate Distance]
    J --> K[Compare Threshold]
    K --> L[Verified]
    K --> M[Failed]
```

## 🌐 Deployment Architecture

```mermaid
flowchart TB
    A[Desktop Browser] --> D[Static Assets]
    B[Mobile Browser] --> D
    C[Tablet Browser] --> D
    D --> E[React Build]
    E --> F[Flask API]
    F --> G[Gunicorn]
    G --> H[ML Models]
    H --> I[Database]
    F --> J[File Storage]
```

## 📱 Mobile Architecture

```mermaid
flowchart TB
    A[Mobile Browser] --> B[Camera API]
    B --> C[Permission]
    C --> D[Access Camera]
    C --> E[Show Error]
    D --> F[Front Camera]
    D --> G[Rear Camera]
    F --> H[Base64 Image]
    G --> H
    H --> I[Upload]
    I --> J[Process]
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
flowchart LR
    A[Optimization] --> B[Frontend]
    A --> C[Backend]
    B --> D[Code Splitting]
    B --> E[Lazy Loading]
    B --> F[Compression]
    C --> G[Model Caching]
    C --> H[Connection Pool]
    C --> I[Async Process]
```

### Performance Metrics
- Image upload: < 2 seconds
- Model inference: < 500ms (CPU) / < 100ms (GPU)
- Database query: < 50ms
- Total verification time: < 3 seconds
- API response time: < 1 second (avg)

## 📊 Scalability

```mermaid
flowchart TB
    A[Load Balancer] --> B[Frontend 1]
    A --> C[Frontend 2]
    D[API Gateway] --> E[Backend 1]
    D --> F[Backend 2]
    E --> G[ML Models]
    F --> G
    G --> H[Database]
    G --> I[Storage]
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
