# User Flow Diagrams

## 📱 Complete User Journeys

### 1. Registration Flow

```mermaid
flowchart TD
    Start([User Visits App]) --> Landing{Has Account?}
    Landing -->|No| RegClick[Click Register]
    Landing -->|Yes| Login[Go to Login]
    
    RegClick --> Step1[Step 1: Account Details]
    Step1 --> InputDetails[Enter Username, Email, Password]
    InputDetails --> Validate1{Valid Input?}
    Validate1 -->|No| ShowError1[Show Error Message]
    ShowError1 --> InputDetails
    Validate1 -->|Yes| Step2[Step 2: Face Capture]
    
    Step2 --> FaceChoice{Capture Method?}
    FaceChoice -->|Camera| OpenWebcam1[Open Webcam]
    FaceChoice -->|Upload| FileUpload1[Choose File]
    FaceChoice -->|Hardware| HWScanner[Use Hardware Scanner]
    
    OpenWebcam1 --> CaptureFace[Capture Face Image]
    FileUpload1 --> CaptureFace
    HWScanner --> CaptureFace
    
    CaptureFace --> QualityCheck1[Image Quality Check]
    QualityCheck1 --> Quality1{Good Quality?}
    Quality1 -->|No| ShowWarning1[Show Quality Warning]
    ShowWarning1 --> FaceChoice
    Quality1 -->|Yes| Step3[Step 3: Fingerprint Capture]
    
    Step3 --> FPChoice{Capture Method?}
    FPChoice -->|Camera| OpenWebcam2[Open Webcam Rear Camera]
    FPChoice -->|Upload| FileUpload2[Choose File]
    FPChoice -->|Dell Scanner| WindowsHello[Windows Hello Auth]
    
    OpenWebcam2 --> CaptureFP[Capture Fingerprint]
    FileUpload2 --> CaptureFP
    WindowsHello --> CaptureFP
    
    CaptureFP --> QualityCheck2[Image Quality Check]
    QualityCheck2 --> Quality2{Good Quality?}
    Quality2 -->|No| ShowWarning2[Show Quality Warning]
    ShowWarning2 --> FPChoice
    Quality2 -->|Yes| SubmitReg[Submit Registration]
    
    SubmitReg --> ProcessReg[Backend Processing]
    ProcessReg --> HashPass[Hash Password]
    HashPass --> ProcessBio[Process Biometrics]
    ProcessBio --> ExtractFeatures[Extract Features ResNet]
    ExtractFeatures --> GenerateHash[Generate 128-bit Hash]
    GenerateHash --> SaveDB[Save to Database]
    SaveDB --> CreateToken[Generate JWT Token]
    CreateToken --> Success[Registration Success]
    Success --> Dashboard[Redirect to Dashboard]
    
    style Success fill:#00ff88
    style Dashboard fill:#00ff88
```

---

### 2. Login Flow

```mermaid
flowchart TD
    Start([User Visits Login]) --> LoginPage[Login Page]
    LoginPage --> AuthChoice{Login Method?}
    
    AuthChoice -->|Password| PasswordAuth[Enter Username/Email & Password]
    AuthChoice -->|Biometric| BiometricAuth[Choose Biometric Login]
    
    PasswordAuth --> SubmitCreds[Submit Credentials]
    SubmitCreds --> ValidateCreds{Valid Credentials?}
    ValidateCreds -->|No| ErrorMsg[Show Error: Invalid Credentials]
    ErrorMsg --> LoginPage
    ValidateCreds -->|Yes| GenerateToken[Generate JWT Token]
    
    BiometricAuth --> CaptureBio[Capture Face & Fingerprint]
    CaptureBio --> VerifyBio[Verify Biometrics]
    VerifyBio --> BioResult{Verified?}
    BioResult -->|No| ErrorBio[Show Error: Verification Failed]
    ErrorBio --> LoginPage
    BioResult -->|Yes| GenerateToken
    
    GenerateToken --> SaveToken[Store Token in LocalStorage]
    SaveToken --> FetchProfile[Fetch User Profile]
    FetchProfile --> LoginSuccess[Login Successful]
    LoginSuccess --> Dashboard[Redirect to Dashboard]
    
    Dashboard --> ShowStats[Display User Stats]
    ShowStats --> ShowHistory[Show Auth History]
    
    style LoginSuccess fill:#00ff88
    style Dashboard fill:#00ff88
```

---

### 3. Biometric Verification Flow

```mermaid
flowchart TD
    Start([User on Dashboard]) --> ClickVerify[Click Verify Biometrics]
    ClickVerify --> VerifyPage[Biometric Verification Page]
    
    VerifyPage --> ThresholdSet[Set Custom Threshold 5-50]
    ThresholdSet --> CaptureFlow[Begin Capture]
    
    CaptureFlow --> FaceSection[Face Verification Section]
    FaceSection --> FaceMethod{Capture Method?}
    FaceMethod -->|Camera| FaceWebcam[Open Front Camera]
    FaceMethod -->|Upload| FaceUpload[Upload Face Image]
    
    FaceWebcam --> CaptureFaceImg[Capture Face]
    FaceUpload --> CaptureFaceImg
    CaptureFaceImg --> FaceQuality[Check Image Quality]
    FaceQuality --> FaceQualityOK{Quality OK?}
    FaceQualityOK -->|No| FaceWarning[Show Quality Warning]
    FaceWarning --> FaceMethod
    FaceQualityOK -->|Yes| FPSection[Fingerprint Section]
    
    FPSection --> FPMethod{Capture Method?}
    FPMethod -->|Camera| FPWebcam[Open Rear Camera]
    FPMethod -->|Upload| FPUpload[Upload Fingerprint]
    FPMethod -->|Hardware| DellScanner[Dell Fingerprint Scanner]
    
    FPWebcam --> CaptureFPImg[Capture Fingerprint]
    FPUpload --> CaptureFPImg
    DellScanner --> CaptureFPImg
    
    CaptureFPImg --> FPQuality[Check Image Quality]
    FPQuality --> FPQualityOK{Quality OK?}
    FPQualityOK -->|No| FPWarning[Show Quality Warning]
    FPWarning --> FPMethod
    FPQualityOK -->|Yes| ReadyVerify[Both Biometrics Captured]
    
    ReadyVerify --> ClickVerifyBtn[Click Verify Button]
    ClickVerifyBtn --> SendToBackend[Send to Backend]
    
    SendToBackend --> BackendProcess[Backend Processing]
    BackendProcess --> DecodeImages[Decode Base64 Images]
    DecodeImages --> PreprocessFace[Preprocess Face Image]
    PreprocessFace --> PreprocessFP[Preprocess Fingerprint]
    PreprocessFP --> ResNetFace[ResNet50 Face Features]
    ResNetFace --> ResNetFP[ResNet18 Fingerprint Features]
    ResNetFP --> HashFace[Generate Face Hash 128-bit]
    HashFace --> HashFP[Generate Fingerprint Hash 128-bit]
    
    HashFP --> QueryDB[Query All User Templates]
    QueryDB --> LoopUsers[For Each User]
    LoopUsers --> CalcFaceDist[Calculate Face Hamming Distance]
    CalcFaceDist --> CalcFPDist[Calculate FP Hamming Distance]
    CalcFPDist --> CombineDist[Combined Distance = Face + FP / 2]
    CombineDist --> CompareThreshold{Distance < Threshold?}
    
    CompareThreshold -->|Yes| MatchFound[Match Found!]
    CompareThreshold -->|No| NextUser{More Users?}
    NextUser -->|Yes| LoopUsers
    NextUser -->|No| NoMatch[No Match Found]
    
    MatchFound --> LogSuccess[Log Success Verification]
    LogSuccess --> ReturnSuccess[Return Success Response]
    ReturnSuccess --> DisplaySuccess[Display Success UI]
    DisplaySuccess --> ShowUsername[Show Verified Username]
    ShowUsername --> ShowDistances[Show Hamming Distances]
    ShowDistances --> ShowMetrics[Show Verification Metrics]
    
    NoMatch --> LogFailure[Log Failed Verification]
    LogFailure --> ReturnFailure[Return Failure Response]
    ReturnFailure --> DisplayFailure[Display Failure UI]
    DisplayFailure --> ShowReason[Show Failure Reason]
    ShowReason --> ShowTips[Show Improvement Tips]
    
    ShowMetrics --> Done[Verification Complete]
    ShowTips --> Done
    Done --> Options{Next Action?}
    Options -->|Verify Again| VerifyPage
    Options -->|Dashboard| Dashboard
    Options -->|Analytics| Analytics
    
    style MatchFound fill:#00ff88
    style DisplaySuccess fill:#00ff88
    style NoMatch fill:#ff4444
    style DisplayFailure fill:#ff4444
```

---

### 4. Mobile Camera Access Flow

```mermaid
flowchart TD
    Start([User Opens App on Mobile]) --> CheckHTTPS{HTTPS Enabled?}
    CheckHTTPS -->|No| ErrorHTTPS[Error: Camera Requires HTTPS]
    CheckHTTPS -->|Yes| CapturePage[Navigate to Capture Page]
    
    CapturePage --> ClickCapture[Click Capture Button]
    ClickCapture --> RequestPerm[Browser Requests Camera Permission]
    RequestPerm --> PermDialog[Show Permission Dialog]
    
    PermDialog --> UserDecision{User Decision?}
    UserDecision -->|Deny| PermDenied[Permission Denied]
    UserDecision -->|Allow| PermGranted[Permission Granted]
    
    PermDenied --> ShowError[Show Error: Camera Access Required]
    ShowError --> TryAgain{Try Again?}
    TryAgain -->|Yes| ClickCapture
    TryAgain -->|No| UseUpload[Use File Upload Instead]
    
    PermGranted --> CameraType{Camera Type?}
    CameraType -->|Face| FrontCam[Access Front Camera capture=user]
    CameraType -->|Fingerprint| RearCam[Access Rear Camera capture=environment]
    
    FrontCam --> ShowPreview[Show Camera Preview]
    RearCam --> ShowPreview
    
    ShowPreview --> UserAction{User Action?}
    UserAction -->|Capture| TakePhoto[Take Photo]
    UserAction -->|Cancel| CapturePage
    
    TakePhoto --> ProcessImage[Convert to Base64]
    ProcessImage --> DisplayPreview[Display Captured Image]
    DisplayPreview --> QualityCheck[Run Quality Check]
    
    QualityCheck --> QualityResult{Quality Good?}
    QualityResult -->|No| ShowQualityWarning[Show Quality Alert]
    ShowQualityWarning --> RetryOption{Retry or Continue?}
    RetryOption -->|Retry| ShowPreview
    RetryOption -->|Continue| ProceedWithImage[Proceed with Image]
    QualityResult -->|Yes| ProceedWithImage
    
    ProceedWithImage --> NextStep[Continue to Next Step]
    UseUpload --> NextStep
    
    style PermGranted fill:#00ff88
    style ProceedWithImage fill:#00ff88
    style PermDenied fill:#ff4444
```

---

### 5. Hardware Fingerprint Scanner Flow

```mermaid
flowchart TD
    Start([User Selects Hardware Scanner]) --> CheckSupport{WebAuthn Supported?}
    CheckSupport -->|No| NotSupported[Show Error: Not Supported]
    CheckSupport -->|Yes| CheckAuthenticator{Platform Authenticator Available?}
    
    CheckAuthenticator -->|No| NoAuthenticator[Show Error: No Hardware Found]
    CheckAuthenticator -->|Yes| CheckWinHello{Windows Hello Configured?}
    
    CheckWinHello -->|No| ShowSetup[Show Setup Instructions]
    ShowSetup --> SetupSteps[1. Open Settings<br/>2. Accounts → Sign-in<br/>3. Configure Fingerprint]
    SetupSteps --> UserSetup{User Configured?}
    UserSetup -->|No| CancelHW[Cancel Hardware Scan]
    UserSetup -->|Yes| ReadyToScan[Ready to Scan]
    CheckWinHello -->|Yes| ReadyToScan
    
    ReadyToScan --> Mode{Scan Mode?}
    Mode -->|Registration| RegisterFP[Register Fingerprint]
    Mode -->|Authentication| AuthFP[Authenticate Fingerprint]
    
    RegisterFP --> CreateCred[Create Credential]
    CreateCred --> ScanPrompt1[Show Windows Hello Prompt]
    ScanPrompt1 --> UserScan1[User Places Finger on Scanner]
    UserScan1 --> ScanResult1{Scan Successful?}
    ScanResult1 -->|No| ScanError1[Show Error]
    ScanError1 --> RetryReg{Retry?}
    RetryReg -->|Yes| ScanPrompt1
    RetryReg -->|No| CancelHW
    ScanResult1 -->|Yes| CredCreated[Credential Created]
    
    AuthFP --> GetCred[Get Credential]
    GetCred --> ScanPrompt2[Show Windows Hello Prompt]
    ScanPrompt2 --> UserScan2[User Places Finger on Scanner]
    UserScan2 --> ScanResult2{Scan Successful?}
    ScanResult2 -->|No| ScanError2[Show Error]
    ScanError2 --> RetryAuth{Retry?}
    RetryAuth -->|Yes| ScanPrompt2
    RetryAuth -->|No| CancelHW
    ScanResult2 -->|Yes| CredRetrieved[Credential Retrieved]
    
    CredCreated --> ConvertToImage[Convert Credential to Image Format]
    CredRetrieved --> ConvertToImage
    ConvertToImage --> ProcessHW[Process Through Pipeline]
    ProcessHW --> Complete[Hardware Scan Complete]
    
    CancelHW --> FallbackOption[Use Camera/Upload Instead]
    NotSupported --> FallbackOption
    NoAuthenticator --> FallbackOption
    
    style Complete fill:#00ff88
    style ScanError1 fill:#ff9800
    style ScanError2 fill:#ff9800
```

---

### 6. Analytics Dashboard Flow

```mermaid
flowchart TD
    Start([User Clicks Analytics]) --> LoadPage[Analytics Page Loads]
    LoadPage --> FetchData[Fetch Analytics Data]
    
    FetchData --> Parallel{Parallel Requests}
    Parallel --> GetProfile[GET /api/profile]
    Parallel --> GetStats[GET /api/stats]
    Parallel --> GetHistory[GET /api/history]
    
    GetProfile --> ProfileData[User Profile Data]
    GetStats --> StatsData[Statistics Data]
    GetHistory --> HistoryData[Authentication History]
    
    ProfileData --> DisplayProfile[Display User Info]
    StatsData --> DisplayStats[Display Statistics Cards]
    HistoryData --> DisplayHistory[Display History Table]
    
    DisplayStats --> Card1[Total Users Card]
    DisplayStats --> Card2[Active Users Card]
    DisplayStats --> Card3[Total Auth Card]
    DisplayStats --> Card4[Success Rate Card]
    
    DisplayHistory --> TableHeaders[Timestamp, Method, Distance, Status]
    TableHeaders --> TableRows[Render Authentication Logs]
    TableRows --> ColorCode[Color Code by Status]
    
    ColorCode --> SuccessGreen[Success → Green Chip]
    ColorCode --> FailureRed[Failure → Red Chip]
    
    Card1 --> HoverEffect[Hover Effects]
    Card2 --> HoverEffect
    Card3 --> HoverEffect
    Card4 --> HoverEffect
    
    DisplayProfile --> ActionButtons[Action Buttons]
    ActionButtons --> VerifyBtn[Verify Biometrics Button]
    ActionButtons --> ViewAnalytics[View Full Analytics]
    
    VerifyBtn --> GoVerify[Navigate to Verify Page]
    ViewAnalytics --> ShowCharts[Show Additional Charts]
    
    ShowCharts --> FAR[False Accept Rate Chart]
    ShowCharts --> FRR[False Reject Rate Chart]
    ShowCharts --> EER[Equal Error Rate]
    ShowCharts --> DistDist[Distance Distribution]
    
    style SuccessGreen fill:#00ff88
    style FailureRed fill:#ff4444
```

---

### 7. Error Handling Flow

```mermaid
flowchart TD
    Start([Error Occurs]) --> ErrorType{Error Type?}
    
    ErrorType -->|Network| NetworkError[Network Error]
    ErrorType -->|Validation| ValidationError[Validation Error]
    ErrorType -->|Authentication| AuthError[Auth Error]
    ErrorType -->|Server| ServerError[Server Error]
    ErrorType -->|Client| ClientError[Client Error]
    
    NetworkError --> CheckOnline{Device Online?}
    CheckOnline -->|No| ShowOffline[Show Offline Message]
    CheckOnline -->|Yes| CheckServer{Server Reachable?}
    CheckServer -->|No| ShowServerDown[Show Server Down Message]
    CheckServer -->|Yes| RetryRequest[Retry Request]
    
    ValidationError --> ShowValidation[Show Validation Error]
    ShowValidation --> HighlightField[Highlight Problem Field]
    HighlightField --> ShowHint[Show Correction Hint]
    
    AuthError --> TokenStatus{Token Status?}
    TokenStatus -->|Expired| RefreshToken[Attempt Token Refresh]
    TokenStatus -->|Invalid| ClearToken[Clear Token]
    TokenStatus -->|Missing| RedirectLogin[Redirect to Login]
    
    RefreshToken --> RefreshSuccess{Refresh OK?}
    RefreshSuccess -->|Yes| RetryOriginal[Retry Original Request]
    RefreshSuccess -->|No| ClearToken
    ClearToken --> RedirectLogin
    
    ServerError --> ErrorCode{Status Code?}
    ErrorCode -->|500| InternalError[Internal Server Error]
    ErrorCode -->|503| ServiceUnavailable[Service Unavailable]
    ErrorCode -->|Other| GenericError[Generic Server Error]
    
    InternalError --> LogError[Log Error Details]
    ServiceUnavailable --> LogError
    GenericError --> LogError
    LogError --> ShowMessage[Show User-Friendly Message]
    ShowMessage --> ContactSupport[Offer Contact Support]
    
    ClientError --> ClientType{Error Category?}
    ClientType -->|Camera| CameraIssue[Camera Access Issue]
    ClientType -->|Browser| BrowserIssue[Browser Compatibility]
    ClientType -->|Storage| StorageIssue[Storage Problem]
    
    CameraIssue --> CheckPermission[Check Camera Permission]
    CheckPermission --> PermSolution[Show Permission Solution]
    
    BrowserIssue --> CheckCompatibility[Check Browser Version]
    CheckCompatibility --> SuggestBrowser[Suggest Compatible Browser]
    
    StorageIssue --> CheckQuota[Check Storage Quota]
    CheckQuota --> ClearStorage[Suggest Clear Storage]
    
    RetryRequest --> Success{Retry Successful?}
    Success -->|Yes| Resolved[Error Resolved]
    Success -->|No| ShowRetryLimit[Max Retries Reached]
    
    Resolved --> ContinueFlow[Continue Normal Flow]
    ShowRetryLimit --> ManualIntervention[Request Manual Action]
    
    style Resolved fill:#00ff88
    style ShowOffline fill:#ff9800
    style ShowServerDown fill:#ff4444
```

---

### 8. Session Management Flow

```mermaid
flowchart TD
    Start([App Initialization]) --> CheckToken{Token Exists?}
    CheckToken -->|No| GuestState[Guest State]
    CheckToken -->|Yes| ValidateToken[Validate JWT Token]
    
    GuestState --> ShowPublic[Show Public Pages]
    ShowPublic --> Landing[Landing/Login/Register]
    
    ValidateToken --> TokenValid{Token Valid?}
    TokenValid -->|No| ExpiredToken[Token Expired]
    TokenValid -->|Yes| CheckExpiry{Token Expiring Soon?}
    
    ExpiredToken --> ClearStorage[Clear LocalStorage]
    ClearStorage --> GuestState
    
    CheckExpiry -->|No| LoadUser[Load User Data]
    CheckExpiry -->|Yes| RefreshFlow[Token Refresh Flow]
    
    RefreshFlow --> RequestRefresh[Request New Token]
    RequestRefresh --> RefreshSuccess{Refresh OK?}
    RefreshSuccess -->|Yes| UpdateToken[Update Stored Token]
    RefreshSuccess -->|No| ExpiredToken
    UpdateToken --> LoadUser
    
    LoadUser --> FetchProfile[Fetch User Profile]
    FetchProfile --> AuthState[Authenticated State]
    AuthState --> ShowProtected[Show Protected Pages]
    ShowProtected --> Dashboard
    
    Dashboard --> UserActivity[Monitor User Activity]
    UserActivity --> ActivityCheck{Activity Detected?}
    ActivityCheck -->|Yes| ResetTimer[Reset Inactivity Timer]
    ActivityCheck -->|No| InactiveCheck{Inactive > 30min?}
    
    ResetTimer --> UserActivity
    InactiveCheck -->|No| UserActivity
    InactiveCheck -->|Yes| WarnTimeout[Show Timeout Warning]
    
    WarnTimeout --> UserResponse{User Response?}
    UserResponse -->|Active| ResetTimer
    UserResponse -->|No Response| AutoLogout[Auto Logout]
    
    AutoLogout --> ClearSession[Clear Session Data]
    ClearSession --> ExpiredMessage[Show Session Expired Message]
    ExpiredMessage --> GuestState
    
    AuthState --> LogoutAction{User Logs Out?}
    LogoutAction -->|Yes| ManualLogout[Manual Logout]
    ManualLogout --> RevokeToken[Revoke Token Server]
    RevokeToken --> ClearSession
    
    style AuthState fill:#00ff88
    style GuestState fill:#ff9800
    style AutoLogout fill:#ff4444
```

---

**Document Version:** 1.0  
**Last Updated:** January 2026
