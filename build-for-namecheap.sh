#!/bin/bash

# Biometric System - Namecheap Deployment Script
# Run this script to prepare files for upload

echo "🚀 Building Biometric System for Namecheap Deployment..."

# Navigate to frontend
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building production bundle..."
npm run build

echo "✅ Build complete!"
echo ""
echo "📁 Files ready in: frontend/build/"
echo ""
echo "📤 Next Steps:"
echo "1. Login to Namecheap cPanel"
echo "2. Go to File Manager → public_html"
echo "3. Delete default files"
echo "4. Upload ALL files from frontend/build/"
echo "5. Upload .htaccess file"
echo "6. Enable SSL certificate"
echo ""
echo "📖 Full guide: NAMECHEAP_DEPLOYMENT.md"
echo ""
echo "🎉 Ready to deploy!"
