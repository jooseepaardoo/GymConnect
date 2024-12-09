const express = require('express');
const admin = require('../config/firebase');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Validaciones para registro de usuario
const registerValidations = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain at least one letter and one number'),
  
  body('displayName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
];

// Registro de usuario
router.post('/register', registerValidations, async (req, res) => {
  try {
    // Validar input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { email, password, displayName } = req.body;

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Crear perfil en Firestore
    await admin.firestore()
      .collection('users')
      .doc(userRecord.uid)
      .set({
        email,
        displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        roles: ['user'],
        preferences: {
          notifications: true,
          privacy: 'public',
          matchingDistance: 10 // km
        }
      });

    // Enviar email de verificación
    const emailVerificationLink = await admin.auth()
      .generateEmailVerificationLink(email);

    res.status(201).json({
      message: 'User registered successfully',
      uid: userRecord.uid,
      verificationLink: emailVerificationLink
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        error: 'Registration Error',
        message: 'Email already in use'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Registration failed'
    });
  }
});

// Verificar token de autenticación
router.post('/verify-token', 
  body('token').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
      }

      const { token } = req.body;
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Verificar si el usuario existe en Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User profile not found'
        });
      }

      res.json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      });
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token expired'
        });
      }

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
});

// Cerrar sesión (revocar tokens)
router.post('/logout', verifyToken, async (req, res) => {
  try {
    await admin.auth().revokeRefreshTokens(req.user.uid);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed'
    });
  }
});

// Solicitar restablecimiento de contraseña
router.post('/reset-password',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
      }

      const { email } = req.body;
      const resetLink = await admin.auth()
        .generatePasswordResetLink(email);

      res.json({
        message: 'Password reset link sent successfully',
        resetLink
      });
    } catch (error) {
      console.error('Password reset error:', error);

      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No user found with this email'
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send password reset link'
      });
    }
});

module.exports = router;