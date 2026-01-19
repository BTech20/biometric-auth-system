# 🔐 Multimodal Biometric Authentication System - User Participation Guide

**Welcome!** You've been invited to participate in a research study testing an advanced biometric authentication system that uses both **face recognition** and **fingerprint identification** for secure access.

---

## 📋 Table of Contents
1. [What is This System?](#what-is-this-system)
2. [What You'll Need](#what-youll-need)
3. [Privacy & Data Protection](#privacy--data-protection)
4. [Step-by-Step Registration Guide](#step-by-step-registration-guide)
5. [How to Authenticate (Login)](#how-to-authenticate-login)
6. [Troubleshooting & Tips](#troubleshooting--tips)
7. [Frequently Asked Questions](#frequently-asked-questions)
8. [Contact & Support](#contact--support)

---

## 🎯 What is This System?

This is an **MSc research project** testing a next-generation biometric authentication system that combines:
- ✅ **Face Recognition** (using your device's camera)
- ✅ **Fingerprint Recognition** (captured via camera or uploaded image)
- ✅ **Deep Learning Technology** (AI-powered matching)

### Why Participate?
Your participation helps validate cutting-edge security technology that could replace traditional passwords with more secure biometric authentication. Your data contributes to academic research in cybersecurity and biometric systems.

### What Makes It Special?
- **Multimodal Security:** Uses two biometric traits for enhanced accuracy
- **Privacy-Preserving:** Stores only encrypted mathematical templates (not actual images)
- **Fast:** Authentication happens in under 1 second
- **Cancelable:** Your biometric template can be revoked and regenerated if needed

---

## 🛠️ What You'll Need

### Required Equipment:
1. **Device with Camera:**
   - Laptop/desktop with webcam (720p or better)
   - Smartphone with front camera
   - Tablet with camera

2. **Fingerprint Image:**
   - Option A: Take a photo of your fingerprint using your device camera
   - Option B: Use a fingerprint scanner (if available) and upload the image
   - Option C: Take a clear photo of your thumb/index finger on a clean surface

3. **Modern Web Browser:**
   - ✅ Google Chrome (recommended)
   - ✅ Microsoft Edge
   - ✅ Firefox
   - ✅ Safari (Mac/iOS)

4. **Stable Internet Connection:**
   - Minimum: 2 Mbps upload speed
   - Required for image uploads

### Optional but Helpful:
- Good lighting (natural or bright indoor lighting)
- Plain background for face capture
- Clean fingers for fingerprint capture

---

## 🔒 Privacy & Data Protection

### What Data is Collected?

**During Registration:**
- Username (your choice)
- Email address (for account recovery)
- Password (encrypted)
- Face image (converted to encrypted template, original discarded)
- Fingerprint image (converted to encrypted template, original discarded)

**During Authentication:**
- Timestamp of login attempt
- Match success/failure
- Hamming distance (similarity score)

### How Your Data is Protected:

✅ **No Storage of Original Images:** Your face and fingerprint photos are processed immediately and only mathematical codes (128-bit hashes) are stored.

✅ **Encrypted Storage:** All data stored in secure PostgreSQL database with encryption.

✅ **HTTPS Encryption:** All communication between your device and the server is encrypted.

✅ **Data Protection Compliance:** All data handling complies with the Republic of Zambia Data Protection Act (2021).

✅ **Research Use Only:** Data is used solely for MSc thesis research and system evaluation at UNZA.

✅ **Anonymization:** Published research results will not include personally identifiable information.

✅ **Right to Deletion:** You can request deletion of your data at any time by contacting the researcher.

✅ **Secure Access:** Only authorized UNZA research team members can access the data.

✅ **Limited Retention:** Data retained only for the duration of the research study (approximately 6 months).

### What Happens to Your Biometrics?

1. **Face & Fingerprint Capture** → Your images are captured temporarily
2. **AI Processing** → Deep learning models extract features
3. **Hashing** → Features converted to a 128-bit binary code (non-reversible)
4. **Storage** → Only the binary code is saved (original images permanently deleted)
5. **Authentication** → Future logins compare new codes with stored code
6. **Research Analysis** → Anonymized performance metrics used for thesis
7. **Data Deletion** → After study completion, data can be deleted or retained (your choice)

**Important:** Even if someone accessed the database, they could not reconstruct your face or fingerprint from the stored codes. This is called "cancelable biometrics" - a privacy-preserving approach compliant with international data protection standards.

---

## 📝 Step-by-Step Registration Guide

### Access the System

**Website URL:** [https://biometric-auth-system-production.up.railway.app](https://biometric-auth-system-production.up.railway.app)

**Expected Load Time:** 2-5 seconds

---

### Step 1: Create Your Account

1. **Open the registration page** - Click "Register" or "Sign Up" button

2. **Enter Your Credentials:**
   - **Username:** Choose a unique username (3-20 characters)
     - Examples: `john_doe`, `researcher23`, `testuser01`
   - **Email:** Your valid email address
     - Format: `yourname@example.com`
   - **Password:** Strong password (minimum 8 characters)
     - Requirements: At least 1 uppercase, 1 lowercase, 1 number
     - Example: `SecurePass123!`
   - **Confirm Password:** Re-enter your password

3. **Click "Next"** to proceed to biometric capture

**⚠️ Important:** Remember your username and password - you'll need them along with biometrics to login!

---

### Step 2: Capture Your Face

**Tips for Best Results:**
- 📸 Look directly at the camera
- 💡 Ensure good lighting (face clearly visible)
- 🎨 Use a plain background (avoid busy patterns)
- 😊 Neutral expression (no sunglasses or hats)
- 📏 Position your face in the center of the frame

**Instructions:**

1. **Allow Camera Access:**
   - Browser will prompt: "Allow camera access?"
   - Click **"Allow"** or **"Yes"**
   - If denied by mistake, look for camera icon in address bar to grant permission

2. **Position Your Face:**
   - Center your face in the camera preview
   - Ensure entire face is visible (including ears)
   - Maintain a distance of about 30-50 cm from camera

3. **Capture Photo:**
   - Click **"Capture Face"** button when ready
   - Image will be processed (takes 1-2 seconds)
   - You'll see a preview of captured image

4. **Retake if Needed:**
   - Not happy with the photo? Click **"Retake"**
   - Adjust lighting or position and try again

5. **Click "Next"** to proceed to fingerprint capture

**Common Issues:**
- Camera not working? → Check browser permissions
- Image too dark? → Move to a brighter location
- Face not detected? → Ensure you're looking at camera and centered

---

### Step 3: Capture Your Fingerprint

You have **two options** for fingerprint capture:

#### **Option A: Upload Fingerprint Image (Recommended)**

**How to Get a Good Fingerprint Photo:**

1. **Clean Your Finger:** Wash and dry your thumb or index finger
2. **Use Good Lighting:** Bright, even lighting works best
3. **Capture Methods:**
   - **Method 1:** Take a close-up photo with phone camera (macro mode if available)
   - **Method 2:** Press finger on scanner and save image
   - **Method 3:** Press finger lightly on clean glass, photograph from opposite side

**Image Requirements:**
- ✅ Clear ridge patterns visible
- ✅ Format: JPG, PNG, or BMP
- ✅ Size: 500 KB - 5 MB
- ✅ Resolution: Minimum 300x300 pixels (higher is better)

**Upload Steps:**
1. Click **"Upload Fingerprint"** button
2. Select your fingerprint image from device
3. Image will be processed (takes 2-3 seconds)
4. Preview will appear

#### **Option B: Capture with Camera**

1. Click **"Use Camera"** button
2. Allow camera access (if not already granted)
3. Hold finger close to camera lens
4. Ensure fingerprint ridges are visible
5. Click **"Capture Fingerprint"**
6. Review and retake if needed

**Pro Tips for Fingerprint Capture:**
- Use your **index finger** or **thumb** (most distinctive patterns)
- Ensure **high contrast** (dark ridges, light valleys)
- Avoid **blurry or smudged** images
- Capture **full fingerprint** (not partial)

---

### Step 4: Complete Registration

1. **Review Your Data:**
   - Username, email displayed
   - Face and fingerprint previews shown

2. **Click "Complete Registration"**
   - System processes your biometrics (5-10 seconds)
   - AI models extract features
   - Secure template is generated and stored

3. **Success Confirmation:**
   - ✅ "Registration Successful!" message appears
   - You'll be redirected to login page

**What Just Happened?**
- Your face and fingerprint were processed by AI models
- Features extracted and converted to 128-bit binary code
- Code saved securely in database
- Original images were **permanently deleted**

---

## 🔓 How to Authenticate (Login)

Once registered, you can log in using **both password and biometrics**.

### Login Process

**Website URL:** [https://biometric-auth-system-production.up.railway.app](https://biometric-auth-system-production.up.railway.app)

---

### Step 1: Password Authentication

1. **Go to Login Page**
2. **Enter Credentials:**
   - Username: Your chosen username
   - Password: Your password
3. **Click "Login"**
4. If correct → Proceed to biometric verification
5. If incorrect → Error message appears, try again

---

### Step 2: Biometric Verification

After successful password login, you'll be prompted for biometric verification:

1. **Capture Face:**
   - Allow camera access
   - Position face as during registration
   - Click "Capture Face"
   - Try to maintain similar lighting/angle as registration

2. **Capture Fingerprint:**
   - Upload fingerprint image OR use camera
   - Use the **same finger** as during registration
   - Ensure clear image quality

3. **Click "Verify":**
   - System compares your biometrics with stored template
   - Matching happens in real-time (<1 second)

---

### Step 3: Authentication Result

**✅ Success (Match Found):**
- "Authentication Successful!" message
- Redirected to your dashboard
- Match score (Hamming distance) displayed

**❌ Failure (No Match):**
- "Authentication Failed" message
- Possible reasons:
  - Different lighting conditions
  - Different finger used
  - Different facial expression/angle
  - Poor image quality
- You can retry authentication

**Retry Tips:**
- Use same lighting as registration
- Ensure same finger for fingerprint
- Look directly at camera
- Check image is clear before submitting

---

## 📊 Your Dashboard

After successful authentication, you'll access your personal dashboard:

### Features Available:

1. **Profile Information:**
   - Username and email
   - Account creation date
   - Account status (Active)

2. **Authentication History:**
   - Recent login attempts
   - Timestamps
   - Success/failure status
   - Match scores (Hamming distances)

3. **System Statistics:**
   - Total authentication attempts
   - Success rate percentage
   - Average match score

4. **Security Settings:**
   - Change password option
   - View stored biometric hash (encrypted)
   - Request data deletion

### What is Hamming Distance?

The **Hamming distance** is the similarity score between your submitted biometrics and stored template:

- **0-15:** Excellent match (very likely the same person)
- **16-30:** Good match (likely the same person)
- **31-40:** Moderate match (possible genuine, threshold dependent)
- **41-64:** Poor match (likely impostor)

**Lower distance = Better match**

Your authentication is successful when the Hamming distance is below the system threshold (typically 32).

---

## 🔧 Troubleshooting & Tips

### Camera Issues

**Problem:** Camera not detected
- ✅ Check browser permissions (click lock icon in address bar)
- ✅ Close other apps using camera (Zoom, Skype, etc.)
- ✅ Try a different browser
- ✅ Restart your device

**Problem:** Camera permission denied
- ✅ Click camera icon in browser address bar
- ✅ Select "Always allow" for this site
- ✅ Refresh the page

**Problem:** Camera shows black screen
- ✅ Check if camera is covered physically
- ✅ Update browser to latest version
- ✅ Check device settings to ensure camera is enabled

---

### Image Quality Issues

**Problem:** Face not detected during capture
- ✅ Ensure good lighting (face clearly visible)
- ✅ Remove sunglasses, hats, or obstructions
- ✅ Position face centered in frame
- ✅ Maintain 30-50 cm distance from camera

**Problem:** Fingerprint image rejected
- ✅ Ensure ridges are clearly visible
- ✅ Use higher resolution camera
- ✅ Try different lighting angle
- ✅ Clean your finger and try again
- ✅ Use macro/close-up mode on phone camera

**Problem:** Images too large to upload
- ✅ Resize image to 1920x1080 or smaller
- ✅ Compress using online tools (tinypng.com, compressor.io)
- ✅ Convert to JPG format (smaller file size)

---

### Authentication Issues

**Problem:** Authentication fails repeatedly
- ✅ **Check Lighting:** Use similar lighting as registration
- ✅ **Use Same Finger:** Ensure same finger as registration
- ✅ **Face Position:** Maintain similar angle/distance
- ✅ **Image Quality:** Ensure clear, non-blurry images
- ✅ **Wait & Retry:** Sometimes processing needs time

**Problem:** "User not found" error
- ✅ Check username spelling (case-sensitive)
- ✅ Verify you completed registration successfully
- ✅ Contact administrator if account missing

**Problem:** Password incorrect
- ✅ Check CAPS LOCK is off
- ✅ Verify password spelling
- ✅ Use "Forgot Password" option if needed

---

### Browser Compatibility

**Recommended Browsers:**
1. **Chrome 90+** (Best performance)
2. **Edge 90+** (Excellent compatibility)
3. **Firefox 88+** (Good support)
4. **Safari 14+** (Mac/iOS users)

**Not Recommended:**
- ❌ Internet Explorer (outdated, unsupported)
- ❌ Very old browser versions

**Mobile Devices:**
- ✅ Works on modern smartphones/tablets
- ✅ Responsive design adapts to screen size
- ✅ Use front camera for face capture
- ✅ Use rear camera for fingerprint capture

---

### Performance Tips

**For Faster Registration/Login:**
1. Use high-speed internet (>5 Mbps)
2. Close unnecessary browser tabs
3. Ensure device has sufficient RAM (>4GB)
4. Use wired connection if WiFi is slow
5. Optimize images before upload (compress if >2MB)

**For Better Accuracy:**
1. Register in good lighting conditions
2. Use high-quality camera (1080p or better)
3. Maintain consistency (same finger, similar pose)
4. Ensure images are sharp and in focus
5. Avoid extreme angles or unusual expressions

---

## ❓ Frequently Asked Questions

### General Questions

**Q: Is this system safe to use?**
A: Yes! The system uses enterprise-grade security:
- HTTPS encryption for all data transmission
- Password hashing (bcrypt)
- No storage of original biometric images
- Secure PostgreSQL database
- Regular security audits

**Q: What happens to my biometric data?**
A: Your face and fingerprint images are:
1. Processed immediately upon upload
2. Converted to encrypted mathematical templates
3. Original images permanently deleted
4. Only encrypted templates stored in database

**Q: Can someone steal my biometrics from the database?**
A: No. The stored templates are 128-bit binary codes that:
- Cannot be reverse-engineered to recreate images
- Are useless without the specific AI models
- Can be revoked and regenerated if compromised

**Q: Is my data shared with third parties?**
A: No. Your data is used exclusively for:
- System authentication during your participation
- MSc research analysis at UNZA
- Academic publication (anonymized results only)
- Potential monitoring by UNZA Ethics Committee for compliance
- No commercial use or sharing with external parties
- No data transfer outside of Zambia without explicit consent

**Q: How long is my data stored?**
A: Data is retained for:
- Duration of the research study (approximately 6 months from registration)
- Required retention for MSc thesis examination and verification
- Anonymized data may be retained longer for future research (with your consent)
- You can request deletion at any time during or after the study
- Personal identifying information (name, email) deleted after study completion

**Q: Can I use this on my phone?**
A: Yes! The system is fully responsive and works on:
- Smartphones (Android/iOS)
- Tablets
- Laptops/Desktops

---

### Technical Questions

**Q: What browsers are supported?**
A: Modern browsers with camera API support:
- Chrome 90+ ✅
- Edge 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Internet Explorer ❌ (not supported)

**Q: Why does authentication sometimes fail?**
A: Common reasons:
- Different lighting conditions than registration
- Different finger used
- Poor image quality
- Extreme facial angles
- System threshold settings

**Q: What is an acceptable Hamming distance?**
A: Generally:
- 0-15: Excellent (genuine user)
- 16-30: Good (genuine user)
- 31-40: Borderline (threshold dependent)
- 41+: Poor (likely impostor)

Default threshold: 32 bits

**Q: How accurate is the system?**
A: Research results show:
- **EER (Equal Error Rate):** ~0% on controlled dataset
- **FAR (False Accept Rate):** <1%
- **FRR (False Reject Rate):** <5%
- Production accuracy may vary based on capture conditions

**Q: Can I register multiple times?**
A: Each email/username can only register once. If you need to re-register:
- Contact administrator to delete old account
- Use different email/username
- Note: This helps prevent duplicate data in research

**Q: Why do I need both password AND biometrics?**
A: This is **multi-factor authentication:**
- **Password:** Something you know
- **Biometrics:** Something you are
- **Combined:** Maximum security

---

### Participation Questions

**Q: How long does participation take?**
A: Time commitment:
- Registration: 3-5 minutes
- Each authentication test: 30-60 seconds
- Recommended: Test 5-10 times over 2 weeks

**Q: How many times should I authenticate?**
A: For best research results:
- Minimum: 5 authentication attempts
- Recommended: 10-15 attempts over 2 weeks
- Vary conditions: different times of day, lighting, devices if possible
- Total time commitment: 15-20 minutes registration + 5-10 minutes testing
- You can test as many times as you like - more data helps the research!

**Q: Will I receive results?**
A: Yes! Participants will receive:
- Summary of their personal authentication statistics (upon request)
- Research findings summary after study completion (emailed to participants)
- Access to published MSc thesis (available in UNZA library)
- Invitation to research presentation/dissemination event (if organized)
- Certificate of participation (upon request)

**Q: Do I have to participate?**
A: No, participation is completely voluntary:
- No adverse consequences if you decline
- No impact on your relationship with UNZA
- You can withdraw at any time without giving a reason
- No penalties for non-participation or withdrawal

**Q: Can I withdraw from the study?**
A: Absolutely! You can:
- Stop participating at any time
- Request data deletion
- No penalties or consequences

**Q: Is participation compensated?**
A: This is a voluntary academic research study:
- No monetary compensation
- Certificate of participation available upon request
- Contributing to cybersecurity and biometric research in Zambia
- Helping advance digital identity solutions for African contexts

**Q: What are the risks of participating?**
A: Risks are minimal and similar to everyday life:
- No physical harm anticipated
- No psychological distress expected
- Camera use standard for any video call
- Data protection measures in place
- You can stop at any time if uncomfortable

**Q: What are the benefits of participating?**
A: While there are no direct personal benefits:
- Contribute to African research in biometric security
- Help advance digital identity solutions for Zambia
- Learn about cutting-edge authentication technology
- Receive certificate of participation
- Be part of pioneering research at UNZA

**Q: Who do I contact with issues?**
A: See [Contact & Support](#contact--support) section below.

---

## 📞 Contact & Support

### Researcher Information

**Principal Investigator:** Boyd Sinkala, Master's Student  
**Institution:** University of Zambia (UNZA)  
**Department:** Department of Computing and Informatics  
**Program:** MSc in Computer Science  
**Email:** boyd.sinkala@cs.unza.zm  
**Academic Supervisor:** Prof. Jackson Phiri  
**Supervisor Email:** jackson.phiri@cs.unza.zm

### Getting Help

**Technical Issues:**
- Principal Investigator: boyd.sinkala@cs.unza.zm
- Subject: "Biometric System - Technical Issue"
- Include: Screenshot, error message, browser/device info

**Research Questions:**
- Principal Investigator: boyd.sinkala@cs.unza.zm
- Academic Supervisor: jackson.phiri@cs.unza.zm
- Subject: "Biometric System - Research Inquiry"

**Data Deletion Requests:**
- Email: boyd.sinkala@cs.unza.zm
- Subject: "Data Deletion Request"
- Include: Username and registered email

**Complaints or Concerns:**
- If you have concerns about how you've been treated during this study:
  - Contact Principal Investigator: boyd.sinkala@cs.unza.zm
  - Contact Academic Supervisor: jackson.phiri@cs.unza.zm
- If concerns remain unresolved:
  - Contact: Directorate of Research and Graduate Studies, UNZA
  - Email: drgs@unza.zm

**Expected Response Time:** 24-48 hours (weekdays)

---

## 📱 Quick Start Checklist

Use this checklist when participating:

### Before Registration:
- [ ] Read Privacy & Data Protection section
- [ ] Prepare device with working camera
- [ ] Ensure good lighting in your location
- [ ] Have fingerprint image ready or plan to capture
- [ ] Choose username and strong password
- [ ] Confirm browser is up-to-date

### During Registration:
- [ ] Enter accurate email address
- [ ] Create strong, memorable password
- [ ] Capture clear face photo (centered, well-lit)
- [ ] Capture or upload clear fingerprint image
- [ ] Review information before submitting
- [ ] Note your username and password securely

### During Authentication Tests:
- [ ] Use same lighting conditions as registration
- [ ] Use same finger as registration
- [ ] Maintain similar face position/angle
- [ ] Ensure images are clear before submitting
- [ ] Note your Hamming distance scores
- [ ] Try at different times of day for varied data

### After Participation:
- [ ] Record your authentication statistics
- [ ] Provide feedback if requested
- [ ] Request data deletion if desired (optional)

---

## 🎓 Research Information

### Study Title
"Multimodal Deep Hashing for Secure Biometric Authentication: A Feature-Level Fusion Approach Using Face and Fingerprint Recognition"

### Project Context
This research is part of an MSc Computer Science thesis at the University of Zambia (UNZA), investigating advanced biometric security systems that could enhance digital identity verification and access control systems in Zambian institutions and organizations.

### Research Objectives
1. Evaluate real-world performance of multimodal biometric authentication
2. Compare face-only vs fingerprint-only vs combined authentication accuracy
3. Assess user experience and system usability in diverse settings
4. Analyze performance under varying capture conditions (lighting, devices, etc.)
5. Validate deep learning hash-based template protection methods
6. Investigate feasibility of deploying biometric systems in Zambian context
7. Document challenges and opportunities for biometric adoption in developing regions

### What Your Participation Contributes
- Real-world authentication data from diverse participants
- Performance metrics under varied environmental conditions
- User experience feedback from African context
- Validation of theoretical research findings with practical data
- Advancement of biometric security technology
- Insights into deployment challenges in developing regions
- Evidence for policy recommendations on digital identity in Zambia
- Contribution to Zambian research in artificial intelligence and cybersecurity

### Ethical Approval
This research has been reviewed and approved by the University of Zambia Research Ethics Committee to ensure participant safety, data protection, and compliance with the Republic of Zambia Data Protection Act (2021).

### Publications
Results will be published in:
- MSc Computer Science Thesis (available in UNZA library)
- Academic conferences and journals (anonymized data only)
- Potential presentation at Zambian ICT conferences
- Research reports shared with participants upon request

---

## 🌟 Thank You!

Your participation in this research is **invaluable** to advancing biometric security technology. By testing this system, you're contributing to:

✅ Academic research in cybersecurity  
✅ Development of privacy-preserving authentication  
✅ Replacement of vulnerable password-based systems  
✅ Future of secure digital identity  

**Questions?** Don't hesitate to reach out!

**Ready to start?** Visit: [https://biometric-auth-system-production.up.railway.app](https://biometric-auth-system-production.up.railway.app)

---

**Document Version:** 1.1  
**Last Updated:** January 19, 2026  
**System Status:** ✅ Online and Operational  
**Participants Enrolled:** [Updated Regularly]

---

*This guide is part of an MSc Computer Science research project at the University of Zambia. All data is handled in accordance with the Republic of Zambia Data Protection Act (2021) and UNZA institutional research ethics guidelines.*
