import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet50, resnet18
import torchvision.transforms as T
from PIL import Image
import io
import base64
import numpy as np
from datetime import datetime, timedelta
import jwt

app = Flask(__name__)
CORS(app, resources={r'/*': {'origins': '*', 'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 'allow_headers': ['Content-Type', 'Authorization']}})

app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///biometric_auth.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Auto-create database tables on startup
with app.app_context():
    db.create_all()
    print(' Database tables initialized')
device = "cuda" if torch.cuda.is_available() else "cpu"

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    multimodal_hash = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class AuthenticationLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    success = db.Column(db.Boolean)
    hamming_distance = db.Column(db.Float)
    auth_method = db.Column(db.String(50))

# Neural Network Models
class MarginCosineHead(nn.Module):
    def __init__(self, feature_dim, num_classes, scale=30.0, margin=0.35):
        super().__init__()
        self.scale = scale
        self.margin = margin
        self.weight = nn.Parameter(torch.randn(num_classes, feature_dim))
        nn.init.xavier_uniform_(self.weight)

    def forward(self, embeddings, labels=None):
        W = F.normalize(self.weight, dim=1)
        x = F.normalize(embeddings, dim=1)
        cosine = torch.matmul(x, W.t())
        if labels is None:
            return cosine * self.scale
        one_hot = F.one_hot(labels, num_classes=W.size(0)).float().to(embeddings.device)
        logits = cosine - one_hot * self.margin
        return logits * self.scale

class MultimodalHashNet(nn.Module):
    def __init__(self, num_classes=1000, hash_bits=128):
        super().__init__()
        self.face_model = resnet50(weights="IMAGENET1K_V2")
        self.face_model.fc = nn.Identity()
        
        self.fp_model = resnet18(weights="IMAGENET1K_V1")
        old_conv = self.fp_model.conv1
        self.fp_model.conv1 = nn.Conv2d(1, old_conv.out_channels,
            kernel_size=old_conv.kernel_size, stride=old_conv.stride,
            padding=old_conv.padding, bias=False)
        self.fp_model.fc = nn.Identity()
        
        self.fusion = nn.Sequential(
            nn.Linear(2048 + 512, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(inplace=True)
        )
        self.hash_layer = nn.Linear(1024, hash_bits)
        self.margin_head = MarginCosineHead(hash_bits, num_classes)

    def forward(self, face, fp, labels=None):
        f_face = self.face_model(face)
        f_fp = self.fp_model(fp)
        fused = torch.cat([f_face, f_fp], dim=1)
        fused = self.fusion(fused)
        h = torch.tanh(self.hash_layer(fused))
        logits = None if labels is None else self.margin_head(h, labels)
        return h, logits

model = MultimodalHashNet(num_classes=1000, hash_bits=128).to(device)
model.eval()

face_transform = T.Compose([
    T.Resize((112, 112)),
    T.ToTensor(),
    T.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

fp_transform = T.Compose([
    T.Grayscale(num_output_channels=1),
    T.Resize((112, 112)),
    T.ToTensor(),
    T.Normalize([0.5], [0.5])
])

def decode_base64_image(base64_string):
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    image_data = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(image_data))

def generate_hash(face_img, fp_img):
    with torch.no_grad():
        if face_img.mode != 'RGB':
            face_img = face_img.convert('RGB')
        face_tensor = face_transform(face_img).unsqueeze(0).to(device)
        fp_tensor = fp_transform(fp_img).unsqueeze(0).to(device)
        h, _ = model(face_tensor, fp_tensor, labels=None)
        return (h > 0).float().cpu().squeeze(0).numpy()

def hamming_distance(hash1, hash2):
    return np.sum(hash1 != hash2)

def hash_to_string(hash_array):
    return ','.join(map(str, hash_array.astype(int).tolist()))

def string_to_hash(hash_string):
    return np.array([float(x) for x in hash_string.split(',')])

def generate_token(user_id):
    payload = {'user_id': user_id, 'exp': datetime.utcnow() + timedelta(hours=24)}
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': True, 'device': device})

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not all(k in data for k in ['username', 'email', 'password', 'face_image', 'fingerprint_image']):
            return jsonify({'error': 'Missing required fields'}), 400
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        face_img = decode_base64_image(data['face_image'])
        fp_img = decode_base64_image(data['fingerprint_image'])
        multimodal_hash = generate_hash(face_img, fp_img)
        
        user = User(username=data['username'], email=data['email'],
                   multimodal_hash=hash_to_string(multimodal_hash))
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        token = generate_token(user.id)
        return jsonify({'message': 'User registered successfully',
                       'user_id': user.id, 'username': user.username, 'token': token}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        if 'username' in data and 'password' in data:
            user = User.query.filter_by(username=data['username']).first()
            if not user or not user.check_password(data['password']):
                return jsonify({'error': 'Invalid credentials'}), 401
            if not user.is_active:
                return jsonify({'error': 'Account is inactive'}), 403
            user.last_login = datetime.utcnow()
            db.session.commit()
            token = generate_token(user.id)
            return jsonify({'message': 'Login successful', 'user_id': user.id,
                          'username': user.username, 'token': token, 'auth_method': 'password'})
        
        elif 'face_image' in data and 'fingerprint_image' in data:
            face_img = decode_base64_image(data['face_image'])
            fp_img = decode_base64_image(data['fingerprint_image'])
            input_hash = generate_hash(face_img, fp_img)
            
            best_match = None
            min_distance = float('inf')
            threshold = data.get('threshold', 15)
            
            for user in User.query.filter_by(is_active=True).all():
                if user.multimodal_hash:
                    stored_hash = string_to_hash(user.multimodal_hash)
                    distance = hamming_distance(input_hash, stored_hash)
                    if distance < min_distance:
                        min_distance = distance
                        best_match = user
            
            if best_match:
                log = AuthenticationLog(user_id=best_match.id, success=(min_distance <= threshold),
                                      hamming_distance=float(min_distance), auth_method='multimodal')
                db.session.add(log)
            
            if best_match and min_distance <= threshold:
                best_match.last_login = datetime.utcnow()
                db.session.commit()
                token = generate_token(best_match.id)
                return jsonify({'message': 'Biometric authentication successful',
                              'user_id': best_match.id, 'username': best_match.username,
                              'token': token, 'hamming_distance': float(min_distance),
                              'auth_method': 'biometric'})
            else:
                db.session.commit()
                return jsonify({'error': 'Biometric authentication failed',
                              'hamming_distance': float(min_distance) if best_match else None}), 401
        else:
            return jsonify({'error': 'Invalid login method'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify', methods=['POST'])
def verify():
    try:
        data = request.json
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        face_img = decode_base64_image(data['face_image'])
        fp_img = decode_base64_image(data['fingerprint_image'])
        input_hash = generate_hash(face_img, fp_img)
        stored_hash = string_to_hash(user.multimodal_hash)
        distance = hamming_distance(input_hash, stored_hash)
        threshold = data.get('threshold', 15)
        
        log = AuthenticationLog(user_id=user.id, success=(distance <= threshold),
                              hamming_distance=float(distance), auth_method='verification')
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'verified': bool(distance <= threshold), 'hamming_distance': float(distance),
                       'threshold': threshold, 'username': user.username})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
        token = auth_header.split(' ')[1]
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        logs = AuthenticationLog.query.filter_by(user_id=user.id).order_by(
            AuthenticationLog.timestamp.desc()).limit(10).all()
        return jsonify({
            'user_id': user.id, 'username': user.username, 'email': user.email,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'is_active': user.is_active,
            'recent_logins': [{'timestamp': log.timestamp.isoformat(), 'success': log.success,
                             'hamming_distance': log.hamming_distance, 'auth_method': log.auth_method}
                            for log in logs]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # User-specific stats
        user_logs = AuthenticationLog.query.filter_by(user_id=user.id).all()
        total_attempts = len(user_logs)
        successful_attempts = sum(1 for log in user_logs if log.success)
        
        # Calculate average Hamming distance
        hamming_distances = [log.hamming_distance for log in user_logs if log.hamming_distance is not None]
        avg_hamming = sum(hamming_distances) / len(hamming_distances) if hamming_distances else 0
        
        return jsonify({
            'user_stats': {
                'total_attempts': total_attempts,
                'successful_attempts': successful_attempts,
                'success_rate': (successful_attempts / total_attempts * 100) if total_attempts > 0 else 0,
                'avg_hamming_distance': avg_hamming,
                'best_match': min(hamming_distances) if hamming_distances else None,
                'worst_match': max(hamming_distances) if hamming_distances else None
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)




