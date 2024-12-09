const express = require('express');
const admin = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validaciones para actualización de perfil
const profileValidations = [
  body('displayName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('age')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  
  body('location')
    .optional()
    .isObject()
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Location must include latitude and longitude');
      }
      if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
        throw new Error('Latitude and longitude must be numbers');
      }
      if (value.latitude < -90 || value.latitude > 90) {
        throw new Error('Invalid latitude');
      }
      if (value.longitude < -180 || value.longitude > 180) {
        throw new Error('Invalid longitude');
      }
      return true;
    }),
  
  body('preferences')
    .optional()
    .isObject()
    .custom((value) => {
      const allowedPreferences = ['notifications', 'privacy', 'matchingDistance'];
      const invalidKeys = Object.keys(value).filter(key => !allowedPreferences.includes(key));
      if (invalidKeys.length > 0) {
        throw new Error(\`Invalid preferences: \${invalidKeys.join(', ')}\`);
      }
      return true;
    }),
];

// Obtener perfil del usuario
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Obtener datos de autenticación
    const userRecord = await admin.auth().getUser(req.user.uid);
    
    // Obtener perfil de Firestore
    const userProfile = await admin.firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();

    if (!userProfile.exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User profile not found'
      });
    }

    // Combinar datos y filtrar información sensible
    const profileData = userProfile.data();
    const safeProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      bio: profileData.bio,
      age: profileData.age,
      location: profileData.location,
      preferences: profileData.preferences,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
    };

    res.json(safeProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile'
    });
  }
});

// Actualizar perfil del usuario
router.put('/profile', 
  verifyToken, 
  profileValidations,
  async (req, res) => {
    try {
      // Validar input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
      }

      // Filtrar campos permitidos
      const allowedFields = ['displayName', 'bio', 'age', 'location', 'preferences'];
      const updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      // Agregar timestamp de actualización
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      // Actualizar en Firestore
      await admin.firestore()
        .collection('users')
        .doc(req.user.uid)
        .set(updateData, { merge: true });

      // Si se actualizó el displayName, actualizarlo también en Auth
      if (updateData.displayName) {
        await admin.auth().updateUser(req.user.uid, {
          displayName: updateData.displayName
        });
      }

      res.json({
        message: 'Profile updated successfully',
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update profile'
      });
    }
});

// Eliminar cuenta de usuario
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Eliminar datos de Firestore
    await admin.firestore().runTransaction(async (transaction) => {
      // Eliminar perfil
      transaction.delete(
        admin.firestore().collection('users').doc(uid)
      );

      // Eliminar chats
      const chats = await admin.firestore()
        .collection('chats')
        .where('participants', 'array-contains', uid)
        .get();
      
      chats.docs.forEach(doc => {
        transaction.delete(doc.ref);
      });

      // Eliminar matches
      const matches = await admin.firestore()
        .collection('matches')
        .where('users', 'array-contains', uid)
        .get();
      
      matches.docs.forEach(doc => {
        transaction.delete(doc.ref);
      });
    });

    // Eliminar cuenta de autenticación
    await admin.auth().deleteUser(uid);

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete account'
    });
  }
});

// Ruta protegida por rol (ejemplo para administradores)
router.get('/admin/users', 
  verifyToken, 
  requireRole('admin'),
  async (req, res) => {
    try {
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .limit(100)
        .get();

      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch users'
      });
    }
});

module.exports = router;