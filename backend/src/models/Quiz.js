// backend/src/models/Quiz.js
import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [{ type: String }],
    validate: {
      validator: v => Array.isArray(v) && v.length === 4,
      message: 'Each question must have exactly 4 options.'
    },
    required: true
  },
  correctIndex: { type: Number, required: true }, // 0..3
  timeLimit: { type: Number, default: 20 } // seconds (optional)
}, { timestamps: true });

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  questions: { type: [QuestionSchema], default: [] }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', QuizSchema);
export default Quiz;
