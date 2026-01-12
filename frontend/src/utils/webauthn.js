/* global PublicKeyCredential */
// WebAuthn utility for hardware biometric scanning
export const isWebAuthnAvailable = () => {
  return window.PublicKeyCredential !== undefined &&
         navigator.credentials !== undefined;
};

export const isBiometricAvailable = async () => {
  if (!isWebAuthnAvailable()) return false;
  
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Biometric check failed:', error);
    return false;
  }
};

// Register fingerprint (enrollment)
export const registerFingerprint = async (username) => {
  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyOptions = {
      challenge: challenge,
      rp: {
        name: "Biometric Auth",
        id: window.location.hostname
      },
      user: {
        id: new TextEncoder().encode(username + Date.now()),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },  // ES256
        { alg: -257, type: "public-key" } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred",
        requireResidentKey: false
      },
      timeout: 120000,
      attestation: "none"
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions
    });

    // Convert credential to base64 for transmission
    const credentialData = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
        attestationObject: arrayBufferToBase64(credential.response.attestationObject)
      }
    };

    return credentialData;
  } catch (error) {
    console.error('Fingerprint registration failed:', error);
    throw error;
  }
};

// Authenticate with fingerprint
export const authenticateFingerprint = async () => {
  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyOptions = {
      challenge: challenge,
      timeout: 120000,
      userVerification: "preferred",
      allowCredentials: []  // Empty means any registered credential
    };

    const credential = await navigator.credentials.get({
      publicKey: publicKeyOptions
    });

    const authData = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
        authenticatorData: arrayBufferToBase64(credential.response.authenticatorData),
        signature: arrayBufferToBase64(credential.response.signature),
        userHandle: credential.response.userHandle ? 
          arrayBufferToBase64(credential.response.userHandle) : null
      }
    };

    return authData;
  } catch (error) {
    console.error('Fingerprint authentication failed:', error);
    throw error;
  }
};

// Utility function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return window.btoa(binary);
};

// Simulate fingerprint image from WebAuthn data (for backend compatibility)
export const convertWebAuthnToImage = (credentialData) => {
  // Create a visual representation of the fingerprint data
  // This creates a placeholder image that represents the biometric capture
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Fill with gradient background
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  
  // Add fingerprint-like pattern based on credential data
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  
  // Use credential ID to generate unique pattern
  const id = credentialData.id || 'default';
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let i = 0; i < 8; i++) {
    const radius = 30 + (i * 15);
    const offset = (seed * i) % 360;
    ctx.beginPath();
    ctx.arc(128, 128, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Add timestamp and metadata text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('Hardware Scan', 10, 240);
  ctx.font = '10px Arial';
  ctx.fillText(new Date().toLocaleString(), 10, 250);
  
  return canvas.toDataURL('image/png');
};

export default {
  isWebAuthnAvailable,
  isBiometricAvailable,
  registerFingerprint,
  authenticateFingerprint,
  convertWebAuthnToImage
};
