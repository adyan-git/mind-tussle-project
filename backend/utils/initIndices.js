import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Import models to ensure collections are registered
import UserQuiz from "../models/User.js";
import Quiz from "../models/Quiz.js";
import Report from "../models/Report.js";
import LearningAnalytics from "../models/LearningAnalytics.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not set in environment. Aborting index initialization.");
    process.exit(1);
}

const isEquivalentExistingIndexError = (err) =>
    err?.code === 85 && typeof err?.errorResponse?.errmsg === "string" &&
    err.errorResponse.errmsg.includes("Index already exists with a different name");

async function ensureIndex(collection, keys, options, label) {
    try {
        await collection.createIndex(keys, options);
        console.log(`✅ Ensured index: ${label}`);
    } catch (err) {
        if (isEquivalentExistingIndexError(err)) {
            console.log(`ℹ️ Index already exists with another name: ${label}`);
            return;
        }
        throw err;
    }
}

async function initIndices() {
    console.log("🔧 Starting MongoDB index initialization for MindTussle…");

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
        });

        console.log("✅ Connected to MongoDB");

        // USER COLLECTION INDEXES
        // Underlying model name is "UserQuiz"
        const userCollection = UserQuiz.collection;

        // Unique index on email (enforces at DB level)
        await ensureIndex(
            userCollection,
            { email: 1 },
            { unique: true, name: "user_email_unique" },
            "UserQuiz.email (unique)"
        );

        // Performance indexes for leaderboards
        await ensureIndex(
            userCollection,
            { xp: -1 },
            { name: "user_xp_desc" },
            "UserQuiz.xp (descending)"
        );

        await ensureIndex(
            userCollection,
            { totalXP: -1 },
            { name: "user_totalXP_desc" },
            "UserQuiz.totalXP (descending)"
        );

        await ensureIndex(
            userCollection,
            { quizStreak: -1 },
            { name: "user_quizStreak_desc" },
            "UserQuiz.quizStreak (descending)"
        );

        // QUIZ COLLECTION INDEXES
        const quizCollection = Quiz.collection;

        // Search/filter index on title + category
        await ensureIndex(
            quizCollection,
            { title: 1, category: 1 },
            { name: "quiz_title_category" },
            "Quiz.title + Quiz.category"
        );

        // Admin queries by author in current schema
        await ensureIndex(
            quizCollection,
            { "createdBy._id": 1, "createdBy.name": 1 },
            { name: "quiz_createdBy" },
            "Quiz.createdBy (_id + name)"
        );

        // REPORT / ANALYTICS COLLECTION INDEXES
        const reportCollection = Report.collection;

        // User history: newest reports first per user
        await ensureIndex(
            reportCollection,
            { username: 1, createdAt: -1 },
            { name: "report_username_createdAt" },
            "Report.username + createdAt"
        );

        // Quiz statistics: newest reports first per quiz
        await ensureIndex(
            reportCollection,
            { quizId: 1, createdAt: -1 },
            { name: "report_quizId_createdAt" },
            "Report.quizId + createdAt"
        );

        // LearningAnalytics collection: per-user / per-quiz time series
        const learningAnalyticsCollection = LearningAnalytics.collection;

        await ensureIndex(
            learningAnalyticsCollection,
            { user: 1, createdAt: -1 },
            { name: "learningAnalytics_user_createdAt" },
            "LearningAnalytics.user + createdAt"
        );

        await ensureIndex(
            learningAnalyticsCollection,
            { quiz: 1, createdAt: -1 },
            { name: "learningAnalytics_quiz_createdAt" },
            "LearningAnalytics.quiz + createdAt"
        );

        console.log("🎉 All requested indexes have been ensured successfully.");
    } catch (err) {
        console.error("❌ Error while initializing indexes:", err);
        process.exitCode = 1;
    } finally {
        try {
            await mongoose.disconnect();
            console.log("🔌 Disconnected from MongoDB");
        } catch (disconnectErr) {
            console.error("⚠️ Error while disconnecting from MongoDB:", disconnectErr);
        }
    }
}

// Execute when run as a script
initIndices().catch((err) => {
    console.error("❌ Unhandled error in initIndices:", err);
    process.exit(1);
});

