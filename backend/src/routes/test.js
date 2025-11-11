// backend/src/routes/test.js
import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/protected', auth, (req, res) => {
  res.json({ msg: 'You have accessed a protected route', user: req.user });
});

export default router;
