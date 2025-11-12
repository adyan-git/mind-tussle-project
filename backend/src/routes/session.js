// backend/src/routes/session.js
import express from 'express';
import crypto from 'crypto';
import Session from '../models/Session.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();
// DEBUG: view session participants (safe, remove after debugging)
router.get('/:sessionId/debug', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId).lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });
    return res.json({
      sessionId: session._id,
      isActive: session.isActive,
      participants: session.participants || []
    });
  } catch (err) {
    console.error('[DEBUG SESSION] error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- Lookup route: find session by human join code (case-insensitive) ---
// Add this *right after*: const router = express.Router();
router.get('/lookup/:joinCode', async (req, res) => {
  try {
    const { joinCode } = req.params;
    if (!joinCode) return res.status(400).json({ message: 'joinCode required' });

    // try case-insensitive lookup (session.joinCode should be stored uppercase by demo)
    const code = String(joinCode).toUpperCase();
    console.log('[SESSION-LOOKUP] incoming joinCode:', joinCode, 'normalized:', code);

    const session = await Session.findOne({ joinCode: code }).lean();
    if (!session) {
      console.log('[SESSION-LOOKUP] not found for code:', code);
      return res.status(404).json({ message: 'Session not found' });
    }

    console.log('[SESSION-LOOKUP] found session:', session._id.toString());
    return res.json({
      sessionId: session._id,
      joinCode: session.joinCode,
      isActive: session.isActive,
      quizId: session.quiz
    });
  } catch (err) {
    console.error('[SESSION-LOOKUP] error:', err);
    return res.status(500).json({ message: 'Failed to lookup session', error: err.message });
  }
});

function makeId(len = 8) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}

/**
 * POST /api/sessions
 * Create a session from a quizId (body: { quizId })
 * Returns session doc
 */
router.post('/', async (req, res) => {
  try {
    const { quizId } = req.body;
    if (!quizId) return res.status(400).json({ message: 'quizId required' });

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const joinCode = makeId(6).toUpperCase();
    const session = await Session.create({
      quiz: quiz._id,
      joinCode,
      isActive: true,
      activeQuestionIndex: 0,
      participants: [],
      settings: { questionTimeLimit: 20 }
    });

    return res.status(201).json({ sessionId: session._id, joinCode });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create session', error: err.message });
  }
});

/**
 * POST /api/sessions/:sessionId/join
 * body: { name }
 * returns: { participantId, name }
 */
router.post('/:sessionId/join', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.isActive) return res.status(400).json({ message: 'Session is not active' });

    const participantId = makeId(8);
    const participant = {
      participantId,
      name: name || `Player-${participantId.slice(0,4)}`,
      score: 0,
      answers: []
    };
    session.participants.push(participant);
    await session.save();

    return res.status(201).json({ participantId, name: participant.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to join session', error: err.message });
  }
});

/**
 * GET /api/sessions/:sessionId/current
 * Returns current question (without revealing correctIndex) and session state
 * Response: { sessionId, joinCode, activeQuestionIndex, question: { text, options, timeLimit }, participantsCount, isActive }
 */
router.get('/:sessionId/current', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId).populate('quiz').lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const quiz = session.quiz;
    const idx = session.activeQuestionIndex;
    const question = quiz.questions[idx];
    if (!question) return res.status(200).json({ message: 'No active question', isActive: false });

    // strip correctIndex before sending to players
    const safeQuestion = {
      text: question.text,
      options: question.options,
      timeLimit: question.timeLimit || session.settings.questionTimeLimit
    };

    return res.json({
      sessionId: session._id,
      joinCode: session.joinCode,
      activeQuestionIndex: idx,
      question: safeQuestion,
      participantsCount: (session.participants || []).length,
      isActive: session.isActive
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch current question', error: err.message });
  }
});

/**
 * POST /api/sessions/:sessionId/answer
 * body: { participantId, selectedIndex }
 * Records an answer for the current question and updates score if correct.
 */
router.post('/:sessionId/answer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { participantId, selectedIndex } = req.body;
    if (!participantId || typeof selectedIndex !== 'number') {
      return res.status(400).json({ message: 'participantId and selectedIndex are required' });
    }

    const session = await Session.findById(sessionId).populate('quiz');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.isActive) return res.status(400).json({ message: 'Session is not active' });

   // robust string comparison to handle ObjectId/string mismatches
const participant = session.participants.find(p => String(p.participantId) === String(participantId));

    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    const qIdx = session.activeQuestionIndex;
    const question = session.quiz.questions[qIdx];
    if (!question) return res.status(400).json({ message: 'Question not found' });

    // prevent multiple answers for same question by same participant
    const already = participant.answers.find(a => a.questionIndex === qIdx);
    if (already) return res.status(400).json({ message: 'Answer already submitted for this question' });

    const isCorrect = question.correctIndex === selectedIndex;
    const answerRecord = {
      questionIndex: qIdx,
      selectedIndex,
      isCorrect,
      timeTaken: 0
    };
    participant.answers.push(answerRecord);
    if (isCorrect) participant.score = (participant.score || 0) + 1;

    await session.save();

    return res.json({ message: 'Answer recorded', isCorrect, currentScore: participant.score });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to record answer', error: err.message });
  }
});

/**
 * POST /api/sessions/:sessionId/next
 * Advance to next question (host action). If no more questions -> ends session.
 * body optional: { forceEnd: true } to finish session immediately.
 */
router.post('/:sessionId/next', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { forceEnd } = req.body || {};
    const session = await Session.findById(sessionId).populate('quiz');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (forceEnd) {
      session.isActive = false;
      session.endedAt = new Date();
      await session.save();
      return res.json({ message: 'Session ended' });
    }

    const nextIndex = session.activeQuestionIndex + 1;
    if (nextIndex >= (session.quiz.questions.length)) {
      // no more questions -> end session
      session.isActive = false;
      session.endedAt = new Date();
      await session.save();
      return res.json({ message: 'Session finished', isActive: false });
    }

    session.activeQuestionIndex = nextIndex;
    await session.save();

    // return brief info about new question (without correctIndex)
    const q = session.quiz.questions[nextIndex];
    const safeQuestion = { text: q.text, options: q.options, timeLimit: q.timeLimit || session.settings.questionTimeLimit };
    return res.json({ message: 'Advanced', activeQuestionIndex: nextIndex, question: safeQuestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to advance', error: err.message });
  }
});

/**
 * GET /api/sessions/:sessionId/results
 * Returns leaderboard (participants sorted by score) and optionally per-player answers.
 */
router.get('/:sessionId/results', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId).lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const leaderboard = (session.participants || [])
      .map(p => ({ participantId: p.participantId, name: p.name, score: p.score || 0, answers: p.answers }))
      .sort((a,b) => b.score - a.score);

    return res.json({ sessionId: session._id, joinCode: session.joinCode, isActive: session.isActive, leaderboard });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch results', error: err.message });
  }
});
// existing routes above...

// Get quiz results
router.get('/:sessionId/results', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId).populate('quiz');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const leaderboard = session.participants
      .map(p => ({ name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get results', error: err.message });
  }
});

/**
 * GET /api/sessions/lookup/:joinCode
 * Look up a session by human join code (case-insensitive).
 * Returns { sessionId, joinCode, isActive, quizId }
 */
router.get('/lookup/:joinCode', async (req, res) => {
  try {
    const { joinCode } = req.params;
    if (!joinCode) return res.status(400).json({ message: 'joinCode required' });

    const session = await Session.findOne({ joinCode: joinCode.toUpperCase() }).lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });

    return res.json({
      sessionId: session._id,
      joinCode: session.joinCode,
      isActive: session.isActive,
      quizId: session.quiz
    });
  } catch (err) {
    console.error('Lookup error:', err);
    return res.status(500).json({ message: 'Failed to lookup session', error: err.message });
  }
});



export default router;


