import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserQuiz from "../models/User.js";
import XPLog from "../models/XPLog.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const unlockThemesForLevel = (user) => {
    // ... (Your theme unlocking logic stays exactly the same)
};

// 🛡️ REFACTORED SECURITY: Don't crash, just warn!
const isGoogleConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL;

if (!isGoogleConfigured) {
    console.warn("⚠️  Google OAuth keys are missing. Google Login will be disabled, but the server is starting!");
}

if (!JWT_SECRET) {
    console.error("❌ CRITICAL: JWT_SECRET is missing. Server cannot start.");
    throw new Error("Missing JWT_SECRET");
}

// ✅ Only initialize Google Strategy if keys exist
if (isGoogleConfigured) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    let user = await UserQuiz.findOne({ email });

                    if (!user) {
                        user = new UserQuiz({
                            name: profile.displayName,
                            email: email,
                            role: "user",
                            xp: 0,
                            totalXP: 0,
                            level: 1,
                            loginStreak: 0,
                            quizStreak: 0,
                            badges: [],
                            unlockedThemes: [],
                            selectedTheme: "Default",
                        });
                        await user.save();
                        user = await UserQuiz.findById(user._id);
                    }

                    // ... (Your daily XP and level-up logic stays exactly the same)

                    const token = jwt.sign(
                        { id: user._id, email: user.email, role: user.role },
                        JWT_SECRET,
                        { expiresIn: "1h" }
                    );

                    return done(null, {
                        token,
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            level: user.level || 1,
                            // ... return other user fields as you had them
                        },
                    });
                } catch (err) {
                    console.error("Google OAuth error:", err);
                    return done(err, null);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    done(null, user);
});

export default passport;