# DigitalOcean App Platform Deployment Guide

## Quick Fix for "No Components Detected" Error

### Option 1: Use the App Spec File (Recommended)
I've created a `.do/app.yaml` file in your repository. Use it:

1. In DigitalOcean dashboard, instead of letting it auto-detect, choose **"Use App Spec"**
2. Upload or paste the contents from `.do/app.yaml`
3. Click **"Next"** to proceed with deployment

### Option 2: Manual Source Directory Configuration

If you prefer manual setup:

#### Frontend Component:
- **Source Directory**: `/frontend`
- **Build Command**: `npm install && npm run build`
- **Run Command**: `npx serve -s build -l $PORT`
- **Environment**: Node.js
- **HTTP Port**: 3000

#### Backend Component:
- **Source Directory**: `/backend`
- **Build Command**: `pip install -r requirements.txt`
- **Run Command**: `gunicorn --bind 0.0.0.0:$PORT App:app`
- **Environment**: Python
- **HTTP Port**: 5000

## Step-by-Step Deployment

### Step 1: Push the App Spec to GitHub
```bash
cd c:\Users\Digital Library\Pictures\biometric-system
git add .do/app.yaml
git commit -m "Add DigitalOcean App Platform configuration"
git push origin main
```

### Step 2: Create App on DigitalOcean
1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Select **"GitHub"** as source
4. Choose repository: `BTech20/biometric-auth-system`
5. Select branch: `main`
6. When prompted, select **"Edit App Spec"** or **"Import from Repository"**
7. It should detect the `.do/app.yaml` file

### Step 3: Configure Environment Variables

#### Frontend Environment Variables:
```
REACT_APP_API_URL=${backend.PUBLIC_URL}
NODE_ENV=production
```

#### Backend Environment Variables:
```
FLASK_ENV=production
SECRET_KEY=<generate-random-secret-key>
CORS_ORIGINS=${frontend.PUBLIC_URL}
```

### Step 4: Review and Deploy
1. Review the detected components (should show frontend and backend)
2. Choose instance sizes (Basic or Pro)
3. Click **"Create Resources"**
4. Wait for deployment (5-10 minutes)

## Important Notes

### Backend Requirements
Ensure your backend has:
- `requirements.txt` with all dependencies including:
  ```
  flask
  flask-cors
  gunicorn
  torch
  torchvision
  numpy
  Pillow
  opencv-python-headless
  ```

### Frontend Build
Ensure `package.json` has:
```json
{
  "scripts": {
    "build": "react-scripts build",
    "start": "react-scripts start"
  }
}
```

### Port Configuration
- DigitalOcean provides `$PORT` environment variable
- Backend must bind to `0.0.0.0:$PORT`
- Frontend serve command uses `-l $PORT`

## Alternative: Set Source Directory in UI

If you don't want to use app.yaml:

1. When adding repository, expand **"Source Directory (Optional)"**
2. For frontend component, enter: `frontend`
3. For backend component, enter: `backend`
4. DigitalOcean will then detect the package.json and requirements.txt

## Troubleshooting

### "No components detected"
- Make sure you specified the source directory
- Verify package.json exists in `/frontend`
- Verify requirements.txt exists in `/backend`

### Build Failures
- Check build logs in DigitalOcean console
- Ensure all dependencies are listed in package.json/requirements.txt
- Verify Python version compatibility

### CORS Errors
- Add frontend URL to CORS_ORIGINS in backend
- Update Flask CORS configuration

## Cost Estimate
- Basic XXS instances: ~$12/month (2 components)
- Basic XS instances: ~$24/month (2 components)
- Professional instances start at ~$24/month per component

## Post-Deployment
1. Test the deployed application
2. Configure custom domain (optional)
3. Enable automatic deploys on push
4. Set up monitoring and alerts
