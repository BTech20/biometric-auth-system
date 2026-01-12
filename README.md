# Biometric Authentication System

🔐 Advanced multimodal biometric authentication system using deep hashing with face and fingerprint recognition.

## 🎯 Features

- **Multimodal Biometrics**: Face + Fingerprint authentication
- **Deep Learning**: ResNet-based feature extraction with 128-bit binary codes
- **Real-time Quality Check**: Image quality analysis with brightness, sharpness, and resolution checks
- **Adjustable Threshold**: Dynamic security levels (5-50 Hamming distance)
- **Hardware Support**: Dell Latitude fingerprint scanner via WebAuthn/Windows Hello
- **Mobile Ready**: Phone camera support for remote data collection
- **Analytics Dashboard**: Comprehensive authentication statistics and history
- **Secure**: JWT authentication, password hashing, HTTPS required

## 📱 Technology Stack

### Frontend
- React 18.2.0
- Material-UI (MUI) v5
- React Router v6
- Axios
- react-webcam
- WebAuthn API

### Backend
- Flask 3.0.0
- PyTorch
- SQLAlchemy
- JWT Authentication
- ResNet50/ResNet18
- Deep Hashing (128-bit binary codes)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- Modern browser (Chrome/Firefox/Safari)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/biometric-system.git
cd biometric-system
```

2. **Setup Backend**
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python App.py
```
Backend runs on: `http://localhost:5000`

3. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

## 📖 Usage

### Registration
1. Navigate to Register page
2. Enter username, email, password
3. Capture face using camera or upload photo
4. Capture fingerprint using camera/upload or hardware scanner
5. Submit registration

### Verification
1. Login with credentials
2. Navigate to Verify Biometrics
3. Adjust threshold slider (default: 20)
4. Capture face and fingerprint
5. Click "Verify Biometrics"
6. View results with Hamming distance

### Dashboard
- View user profile
- Check authentication statistics
- Review recent authentication history
- Access analytics page

## 🔧 Configuration

### Frontend Environment Variables
Create `.env.production` in frontend folder:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Backend Configuration
Edit `backend/App.py`:
- Secret key
- Database URI
- CORS origins
- Upload folder path

## 📊 Hamming Distance Thresholds

| Range | Security Level | Use Case |
|-------|---------------|----------|
| 0-15  | Maximum Security | Critical systems |
| 16-25 | High Security | Standard enterprise |
| 26-35 | Balanced | General purpose |
| 36-50 | User Friendly | Convenience priority |

## 🌐 Deployment

### Production Build
```bash
cd frontend
npm run build
```

### Deployment Options
- **Frontend**: Vercel, Netlify, Namecheap, GitHub Pages
- **Backend**: Render.com, Heroku, Railway, AWS

See deployment guides:
- `DEPLOYMENT.md` - General deployment
- `NAMECHEAP_DEPLOYMENT.md` - Namecheap-specific

## 📱 Mobile Support

✅ Works on phone browsers (iOS/Android)
✅ Direct camera access (front/rear)
✅ HTTPS required for camera permissions
✅ PWA support - installable as app

### Camera Attributes
- Face: `capture="user"` (front camera)
- Fingerprint: `capture="environment"` (rear camera)

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- HTTPS enforcement
- CORS configuration
- XSS protection headers
- SQL injection prevention
- Input validation

## 🧪 Testing

### Test Accounts
Create test accounts and verify with:
- Same person (should verify)
- Different person (should fail)
- Poor image quality (should warn)

### Quality Metrics
- Brightness: 80-180 ideal
- Sharpness: Edge detection score
- Resolution: Minimum 50,000 pixels

## 📈 Research Application

This system is designed for biometric research:
- Collect genuine/impostor datasets
- Calculate FAR/FRR/EER metrics
- Test threshold optimization
- Analyze multimodal fusion
- Remote data collection from volunteers

## 🐛 Troubleshooting

**Camera not working:**
- Ensure HTTPS is enabled
- Check browser permissions
- Use Chrome/Safari for best support

**Verification failing:**
- Check image quality warnings
- Use better lighting
- Hold device steady
- Adjust threshold slider

**Backend connection error:**
- Verify backend is running
- Check API URL in frontend
- Ensure CORS is configured

## 📁 Project Structure

```
biometric-system/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── App.py
│   ├── models/
│   ├── uploads/
│   └── requirements.txt
├── DEPLOYMENT.md
├── NAMECHEAP_DEPLOYMENT.md
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Deep Hashing for biometric template generation
- ResNet architecture for feature extraction
- Material-UI for modern React components
- WebAuthn for hardware biometric integration

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check deployment documentation
- Review troubleshooting section

## 🔮 Future Enhancements

- [ ] Iris recognition module
- [ ] Voice biometrics
- [ ] Multi-factor authentication
- [ ] Advanced analytics dashboard
- [ ] Export authentication logs
- [ ] Batch enrollment
- [ ] API documentation (Swagger)
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Real-time monitoring

---

Made with ❤️ for biometric security research
