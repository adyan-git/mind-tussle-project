// backend/src/models/Session.js
import mongoose from 'mongoose';

const ParticipantAnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number, default: 0 } // seconds
}, { _id: false });

const ParticipantSchema = new mongoose.Schema({
  participantId: { type: String, required: true, index: true }, // <- important
  name: { type: String, default: 'Player' },
  score: { type: Number, default: 0 },
  answers: { type: [ParticipantAnswerSchema], default: [] },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  joinCode: { type: String, unique: true, required: true },
  isActive: { type: Boolean, default: true },
  activeQuestionIndex: { type: Number, default: 0 },
  participants: { type: [ParticipantSchema], default: [] },
  settings: {
    questionTimeLimit: { type: Number, default: 20 },
    shuffleQuestions: { type: Boolean, default: false },
    allowLateJoin: { type: Boolean, default: true }
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, { timestamps: true });

// convenience method
SessionSchema.methods.findParticipant = function(participantId) {
  return this.participants.find(p => p.participantId === participantId);
};

const Session = mongoose.model('Session', SessionSchema);
export default Session;
