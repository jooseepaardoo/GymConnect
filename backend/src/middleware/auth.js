const admin = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    // Verificar que el header de autorización exista y tenga el formato correcto
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No authentication token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar y decodificar el token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Verificar claims adicionales si es necesario
      if (decodedToken.email_verified === false) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Email not verified' 
        });
      }

      // Agregar información del usuario al request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        authTime: decodedToken.auth_time,
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Manejar diferentes tipos de errores de token
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Token expired' 
        });
      }
      
      if (error.code === 'auth/id-token-revoked') {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Token has been revoked' 
        });
      }

      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication process failed' 
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(req.user.uid)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({ 
          error: 'Not Found', 
          message: 'User profile not found' 
        });
      }

      const userData = userDoc.data();
      if (!userData.roles || !userData.roles.includes(role)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Insufficient permissions' 
        });
      }

      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Role verification failed' 
      });
    }
  };
};

module.exports = { 
  verifyToken,
  requireRole,
};