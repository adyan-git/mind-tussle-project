// backend/src/routes/demo.js
import express from 'express';
import Quiz from '../models/Quiz.js';
import Session from '../models/Session.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * Helper: generate a short uppercase join code (6 chars)
 */
function generateJoinCode(len = 6) {
  // crypto random bytes -> base36 -> uppercase -> keep alphanum
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len).toUpperCase();
}

/**
 * GET /api/demo
 * Creates a demo quiz (if not exists) and starts a session from it.
 * Returns: { sessionId, joinCode, quiz }
 */
router.get('/', async (req, res) => {
  try {
    // Demo quiz content (author-controlled, safe for demo)
    const demoQuizPayload = {
      title: "Space & History — Demo Quiz",
      description: "A short demo quiz with a few curated questions.",
      questions: [
        {
          text: "Which planet is the largest in our solar system?",
          options: ["Mars", "Earth", "Jupiter", "Saturn"],
          correctIndex: 2,
          timeLimit: 20
        },
        {
          text: "Who is known as the father of modern physics?",
          options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Niels Bohr"],
          correctIndex: 1,
          timeLimit: 20
        },
        {
          text: "Which ancient civilization built the Machu Picchu?",
          options: ["Aztec", "Maya", "Inca", "Olmec"],
          correctIndex: 2,
          timeLimit: 20
        }
      ]
    };

    // Optional: try to reuse an existing demo quiz with same title to avoid duplicates
    let quiz = await Quiz.findOne({ title: demoQuizPayload.title }).lean();
    if (!quiz) {
      const created = await Quiz.create(demoQuizPayload);
      quiz = created.toObject();
    }

    // Create a session for the quiz
    const joinCode = generateJoinCode(6);
    const sessionDoc = await Session.create({
      quiz: quiz._id,
      host: null,
      joinCode,
      activeQuestionIndex: 0,
      isActive: true,
      participants: [],
      settings: {
        questionTimeLimit: 20
      }
    });

    // Populate quiz details for response (so frontend can show questions immediately)
    const populatedQuiz = await Quiz.findById(quiz._id).lean();

    return res.status(201).json({
      sessionId: sessionDoc._id,
      joinCode,
      quiz: populatedQuiz
    });
  } catch (err) {
    console.error("Demo route error:", err);
    return res.status(500).json({ message: "Failed to create demo session", error: err.message });
  }
});

export default router;
