const express = require('express');
const admin = require('../config/firebase');
const router = express.Router();

router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ uid: decodedToken.uid });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;