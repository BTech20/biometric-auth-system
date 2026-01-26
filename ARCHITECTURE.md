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
    subgraph Client["🖥️ Client Layer"]
        A[Web Browser] --> B[React Application]
        B --> C[Material-UI Components]
        B --> D[React Router]
        B --> E[Axios HTTP Client]
    end
    
    subgraph Communication["📡 Communication Layer"]
        F[REST API]
        G[JWT Authentication]
    end
    
    subgraph Server["⚙️ Server Layer"]
        H[Flask Application]
        I[Route Handlers]
        J[Business Logic]
    end
    
    subgraph Processing["🧠 Data Processing Layer"]
        K[Image Preprocessing]
        L[Deep Learning Models]
        M[ResNet50 Face]
        N[ResNet18 Fingerprint]
        O[Feature Extraction]
        P[Deep Hashing]
        Q[128-bit Binary Codes]
    end
    
    subgraph Storage["💾 Persistence Layer"]
        R[SQLAlchemy ORM]
        S[SQLite Database]
        T[File System]
        U[Uploaded Images]
    end
    
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    L --> N
    M --> O
    N --> O
    O --> P
    P --> Q
    J --> R
    R --> S
    Q --> S
    J --> T
    T --> U
```

## 🔄 Component Architecture

### Frontend Architecture

```mermaid
graph TD
    A["App.js (Main)"] 
    B["React Router"]
    C["Login Page"]
    D["Register Page"]
    E["Dashboard Page"]
    F["BiometricVerify Page"]
    G["Analytics Page"]
    H["Auth Service"]
    I["API Client"]
    J["Hardware Scanner"]
    K["Image Quality Check"]
    L["Threshold Config"]
    
    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I
    D --> J
    D --> K
    D --> L
    F --> J
    F --> K
    F --> L
```

### Backend Architecture

```mermaid
graph TD
    A["Flask Application"]
    B["API Routes"]
    C["Register Endpoint"]
    D["Login Endpoint"]
    E["Verify Endpoint"]
    F["Profile Endpoint"]
    G["Stats Endpoint"]
    H["Auth Controller"]
    I["Verify Controller"]
    J["Profile Controller"]
    K["Analytics Controller"]
    L["User Model"]
    M["SQLAlchemy ORM"]
    N["SQLite Database"]
    O["Biometric Processor"]
    P["ML Pipeline"]
    
    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    C --> H
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> L
    J --> L
    K --> L
    L --> M
    M --> N
    I --> O
    O --> P
```

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        text multimodal_hash
        boolean is_active
        datetime created_at
        datetime last_login
    }
    
    AUTHENTICATION_LOGS {
        int id PK
        int user_id FK
        string authentication_method
        boolean success
        string ip_address
        string user_agent
        datetime timestamp
    }
    
    USERS ||--o{ AUTHENTICATION_LOGS : "has many"
```

## 🧠 Deep Learning Pipeline

```mermaid
flowchart LR
    A["Input Image"] --> B["Resize 224x224"]
    B --> C["Normalize RGB"]
    C --> D["Tensor Conversion"]
    D --> E["ResNet Backbone"]
    E --> F["512D Feature Vector"]
    F --> G["Hash Layer"]
    G --> H["Sigmoid Activation"]
    H --> I["Binary Quantization"]
    I --> J["128-bit Hash Code"]
    
    style J fill:#90EE90
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
flowchart TD
    A["Client Request"] --> B{"HTTPS?"}
    B -->|"No"| C["Reject"]
    B -->|"Yes"| D["CORS Check"]
    D --> E{"Valid Origin?"}
    E -->|"No"| C
    E -->|"Yes"| F["JWT Validation"]
    F --> G{"Valid Token?"}
    G -->|"No"| H["401 Unauthorized"]
    G -->|"Yes"| I["Input Validation"]
    I --> J{"Valid Input?"}
    J -->|"No"| K["400 Bad Request"]
    J -->|"Yes"| L["Process Request"]
    L --> M["Success Response"]
    
    style M fill:#90EE90
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
    A["Client"] --> B["Register API"]
    A --> C["Login API"]
    A --> D["Profile API"]
    A --> E["Verify API"]
    A --> F["Stats API"]
    
    B --> G["201 Created"]
    C --> H["200 OK + Token"]
    D --> I["200 User Data"]
    E --> J["200 Verification"]
    F --> K["200 Analytics"]
```

### Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant A as API
    participant B as Backend
    participant M as ML_Model
    participant D as Database
    
    C->>F: User_Action
    F->>A: HTTP_Request_JWT
    A->>B: Validate_Token
    B->>B: Authorize_User
    B->>M: Process_Biometrics
    M->>M: Extract_Features
    M->>M: Generate_Hash
    B->>D: Query_Update
    D->>B: Return_Result
    B->>A: Send_Response
    A->>F: JSON_Data
    F->>C: Update_UI
```

## 💾 Data Flow

```mermaid
flowchart TD
    A["User Captures Image"] --> B["Base64 Encoding"]
    B --> C["HTTP POST to Backend"]
    C --> D["Decode Base64"]
    D --> E["Save to Uploads"]
    E --> F["Load Image"]
    F --> G["Preprocess"]
    G --> H["Model Inference"]
    H --> I["Extract Features"]
    I --> J["Hash Generation"]
    J --> K["Store in Database"]
    
    L["Verification Request"] --> M["Load Stored Hash"]
    M --> N["New Image Capture"]
    N --> O["Generate New Hash"]
    O --> P["Hamming Distance"]
    P --> Q{"Distance < Threshold?"}
    Q -->|"Yes"| R["Verified ✓"]
    Q -->|"No"| S["Failed ✗"]
    
    K --> L
    
    style R fill:#90EE90
    style S fill:#FFB6C1
```

## 🔄 Verification Process

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> CaptureImages : User_Initiates
    CaptureImages --> QualityCheck : Images_Captured
    QualityCheck --> Preprocessing : Quality_OK
    QualityCheck --> CaptureImages : Quality_Poor
    Preprocessing --> FeatureExtraction : Images_Processed
    FeatureExtraction --> HashGeneration : Features_Extracted
    HashGeneration --> DatabaseQuery : Hashes_Generated
    DatabaseQuery --> DistanceCalculation : Templates_Retrieved
    DistanceCalculation --> ThresholdComparison : Distance_Computed
    ThresholdComparison --> Verified : Distance_Below_Threshold
    ThresholdComparison --> Failed : Distance_Above_Threshold
    Verified --> [*]
    Failed --> [*]
```

## 🌐 Deployment Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Devices"]
        A["Desktop Browser"]
        B["Mobile Browser"]
        C["Tablet Browser"]
    end
    
    subgraph Hosting["CDN/Hosting"]
        D["Static Assets"]
        E["React Build"]
    end
    
    subgraph AppServer["Application Server"]
        F["Flask API"]
        G["Gunicorn WSGI"]
    end
    
    subgraph ML["ML Infrastructure"]
        H["PyTorch Models"]
        I["CPU/GPU Compute"]
    end
    
    subgraph Storage["Data Storage"]
        J["Database"]
        K["File Storage"]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    F --> J
    F --> K
```

## 📱 Mobile Architecture

```mermaid
flowchart TD
    A["Mobile Browser"] --> B["Camera API"]
    B --> C{"Permission Granted?"}
    C -->|"Yes"| D["Access Camera"]
    C -->|"No"| E["Show Error"]
    D --> F["Face Camera"]
    D --> G["Fingerprint Scanner"]
    F --> H["Base64 Image"]
    G --> H
    H --> I["Upload to Server"]
    I --> J["Process & Verify"]
    
    K["PWA Manifest"] --> L["Install Prompt"]
    L --> M["Standalone Mode"]
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
flowchart TD
    A["Optimization Strategies"]
    A --> B["Frontend"]
    A --> C["Backend"]
    
    B --> D["Code Splitting"]
    B --> E["Lazy Loading"]
    B --> F["Image Compression"]
    B --> G["Caching"]
    
    C --> H["Model Caching"]
    C --> I["Connection Pooling"]
    C --> J["Async Processing"]
    C --> K["GPU Acceleration"]
```

### Performance Metrics
- Image upload: < 2 seconds
- Model inference: < 500ms (CPU) / < 100ms (GPU)
- Database query: < 50ms
- Total verification time: < 3 seconds
- API response time: < 1 second (avg)

## 📊 Scalability

```mermaid
flowchart TD
    A["Load Balancer"] --> B["Frontend Server 1"]
    A --> C["Frontend Server 2"]
    A --> D["Frontend Server N"]
    
    E["API Gateway"] --> F["Backend Server 1"]
    E --> G["Backend Server 2"]
    E --> H["Backend Server N"]
    
    F --> I["Model Serving"]
    G --> I
    H --> I
    
    I --> J["Shared Database"]
    I --> K["Object Storage"]
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
