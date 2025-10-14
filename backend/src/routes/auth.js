import express from "express";
import {
  registerUser,
  loginUser/*,
  refreshAccessToken, // we’ll add this later*/
} from "../controllers/authController.js";

const router = express.Router();

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
//router.post("/refresh", refreshAccessToken); // optional, for later use

export default router;
