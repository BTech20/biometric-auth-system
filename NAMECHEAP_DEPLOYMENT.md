# 🌐 Namecheap Hosting Deployment Guide

## 📋 Prerequisites

- Namecheap hosting account (Shared/VPS/Dedicated)
- Domain name (or use temporary Namecheap subdomain)
- FTP/SFTP credentials from Namecheap
- SSL certificate (free with hosting)

---

## 🎯 Deployment Strategy

### Frontend (React)
- Build static files
- Upload to `public_html` via FTP/cPanel

### Backend (Flask)
- Option 1: Namecheap Node.js hosting (if available)
- Option 2: External backend (Heroku/Render) + CORS setup
- Option 3: VPS with Python support

---

## 🚀 Step 1: Build Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create production build
npm run build
```

This creates a `build/` folder with static files.

---

## 📤 Step 2: Upload to Namecheap

### Method A: cPanel File Manager (Easiest)

1. **Login to cPanel:**
   - Go to: `https://yourdomain.com/cpanel`
   - Or access via Namecheap dashboard → Hosting List → Manage

2. **Navigate to File Manager:**
   - Click "File Manager" in cPanel
   - Go to `public_html` folder

3. **Clear Default Files:**
   - Delete default `index.html` and placeholder files
   - Keep `.htaccess` if exists

4. **Upload Build Files:**
   - Click "Upload" button
   - Select ALL files from `frontend/build/` folder
   - Upload: `index.html`, `static/` folder, `manifest.json`, etc.
   - **Important:** Upload contents OF build folder, not the folder itself

5. **File Structure Should Be:**
   ```
   public_html/
   ├── index.html
   ├── manifest.json
   ├── static/
   │   ├── css/
   │   ├── js/
   │   └── media/
   └── .htaccess (we'll create this)
   ```

---

### Method B: FTP/SFTP (FileZilla)

1. **Get FTP Credentials:**
   - cPanel → FTP Accounts → Create/View credentials
   - Host: `ftp.yourdomain.com` or IP address
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Download FileZilla:**
   - https://filezilla-project.org/download.php

3. **Connect:**
   - Open FileZilla
   - File → Site Manager → New Site
   - Enter FTP credentials
   - Connect

4. **Upload:**
   - Navigate to `public_html` on remote (right panel)
   - Navigate to `frontend/build/` on local (left panel)
   - Select ALL files in build folder
   - Drag to `public_html`
   - Wait for upload to complete

---

## 🔧 Step 3: Configure .htaccess (React Routing)

Create `.htaccess` in `public_html` to handle React Router:

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l

  # Rewrite everything else to index.html
  RewriteRule . /index.html [L]
</IfModule>

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Enable Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**To create .htaccess in cPanel:**
1. File Manager → public_html
2. Click "+ File" button
3. Name: `.htaccess`
4. Right-click → Edit
5. Paste above content
6. Save

---

## 🔌 Step 4: Backend Deployment Options

### Option 1: Namecheap Python/Node.js Support (Check Your Plan)

**If your Namecheap plan supports Python:**

1. **Check SSH Access:**
   - cPanel → Terminal (if available)
   - Or use SSH: `ssh username@yourdomain.com`

2. **Upload Backend:**
   - Use FTP to upload `backend` folder to home directory (not public_html)
   - Structure:
   ```
   home/username/
   ├── backend/
   │   ├── App.py
   │   ├── requirements.txt
   │   ├── models/
   │   └── uploads/
   └── public_html/ (frontend)
   ```

3. **Install Dependencies:**
   ```bash
   cd ~/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure App.py:**
   - Set host to `0.0.0.0`
   - Set port to available port (ask hosting support)

5. **Keep Backend Running:**
   - Use `screen` or `tmux` for persistent session
   - Or set up as systemd service (VPS only)

**Problem:** Most shared hosting doesn't support long-running Python processes.

---

### Option 2: External Backend (Recommended for Shared Hosting)

**Deploy backend to free platform, frontend on Namecheap:**

#### A. Deploy Backend to Render.com (FREE):

1. **Create account:** https://render.com
2. **New Web Service**
3. **Connect GitHub repo** (push backend code to GitHub)
4. **Settings:**
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn App:app`
5. **Get backend URL:** `https://your-backend.onrender.com`

#### B. Update Frontend API Configuration:

Edit `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend.onrender.com/api',  // Change this
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### C. Rebuild and Redeploy Frontend:

```bash
cd frontend
npm run build
# Upload new build to Namecheap
```

#### D. Configure CORS on Backend:

Edit `backend/App.py`:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://yourdomain.com'])  # Your Namecheap domain
```

---

### Option 3: Namecheap VPS (If You Have One)

**Full control, can run Python:**

1. **SSH into VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install Requirements:**
   ```bash
   apt update
   apt install python3 python3-pip nginx
   ```

3. **Upload Backend:**
   ```bash
   scp -r backend root@your-vps-ip:/var/www/
   ```

4. **Setup Application:**
   ```bash
   cd /var/www/backend
   pip3 install -r requirements.txt
   pip3 install gunicorn
   ```

5. **Create Systemd Service:**
   ```bash
   nano /etc/systemd/system/biometric.service
   ```

   ```ini
   [Unit]
   Description=Biometric Flask App
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/backend
   Environment="PATH=/var/www/backend/venv/bin"
   ExecStart=/var/www/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 App:app

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Service:**
   ```bash
   systemctl enable biometric
   systemctl start biometric
   ```

7. **Configure Nginx:**
   ```bash
   nano /etc/nginx/sites-available/biometric
   ```

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           root /var/www/html/public_html;
           try_files $uri /index.html;
       }

       location /api {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

8. **Enable Site:**
   ```bash
   ln -s /etc/nginx/sites-available/biometric /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

---

## 🔒 Step 5: Enable SSL/HTTPS

### Namecheap cPanel SSL:

1. **cPanel → SSL/TLS Status**
2. **AutoSSL is usually enabled** (free Let's Encrypt)
3. **Click "Run AutoSSL"** if not active
4. Wait 5-10 minutes for certificate
5. Your site will be available at `https://yourdomain.com`

### Force HTTPS:

Already included in `.htaccess` above, but verify:
- Visit: `http://yourdomain.com`
- Should redirect to: `https://yourdomain.com`

---

## 📱 Step 6: Test Mobile Access

1. **Open on phone:** `https://yourdomain.com`
2. **Test camera permissions**
3. **Register test account**
4. **Capture face/fingerprint**
5. **Verify biometrics**

---

## 🐛 Troubleshooting

### **Blank Page After Upload:**
- Check `.htaccess` is present
- Verify `index.html` is in root of `public_html`
- Check browser console for errors (F12)
- Ensure all files uploaded correctly

### **404 Errors on Refresh:**
- `.htaccess` rewrite rules missing
- Verify mod_rewrite is enabled (cPanel → Apache modules)

### **API Calls Failing:**
- Check `src/services/api.js` has correct backend URL
- Verify CORS is configured on backend
- Check backend is running (if on same server)

### **Camera Not Working:**
- Ensure HTTPS is active (SSL certificate installed)
- Check browser console for permission errors
- Verify manifest.json uploaded

### **Images Not Loading:**
- Check `static/` folder uploaded
- Verify file permissions (644 for files, 755 for directories)
- Clear browser cache

---

## 📊 Quick Checklist

- [ ] Build frontend (`npm run build`)
- [ ] Upload build contents to `public_html`
- [ ] Create `.htaccess` for routing
- [ ] Enable SSL certificate
- [ ] Deploy backend (Render/Heroku/VPS)
- [ ] Update API URL in frontend
- [ ] Configure CORS on backend
- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Verify camera access
- [ ] Test registration flow
- [ ] Test verification flow

---

## 🎉 Your Site is Live!

**Frontend URL:** `https://yourdomain.com`

**Share with volunteers:**
- Direct link for registration
- Works on any device
- Mobile camera support
- Secure HTTPS connection

---

## 💡 Cost-Effective Setup

**Recommended for Testing:**
- Frontend: Namecheap shared hosting ($3-10/month)
- Backend: Render.com free tier (0 cost)
- SSL: Free (Let's Encrypt via cPanel)
- Domain: Included with hosting

**Total: ~$3-10/month**

---

## 📞 Support Resources

- **Namecheap Support:** Live chat in dashboard
- **cPanel Docs:** https://docs.cpanel.net/
- **FileZilla Guide:** https://wiki.filezilla-project.org/
- **Render.com Docs:** https://render.com/docs

---

Need help? Check error logs in cPanel → Error Log for diagnostics!
