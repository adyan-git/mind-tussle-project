import React, { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../utils/axios";
import config from "../config/config";
import { useNotification } from "../hooks/useNotification";
import NotificationModal from "../components/NotificationModal";
import "./AdminCreateQuiz.css";

const emptyQuestion = () => ({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "A",
    difficulty: "medium",
    explanation: "",
});

const AdminCreateQuiz = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin = user?.role === "admin";
    const { notification, showSuccess, showError, hideNotification } = useNotification();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [passingMarks, setPassingMarks] = useState(1);
    const [questions, setQuestions] = useState([emptyQuestion()]);
    const [geminiPassage, setGeminiPassage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const maxPassingMarks = useMemo(() => Math.max(1, questions.length), [questions.length]);

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const updateQuestion = (index, key, value) => {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== index) return q;
                return { ...q, [key]: value };
            })
        );
    };

    const updateOption = (qIndex, oIndex, value) => {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== qIndex) return q;
                const options = [...q.options];
                options[oIndex] = value;
                return { ...q, options };
            })
        );
    };

    const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
    const removeQuestion = (index) => {
        setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    };

    const autofillWithGemini = async () => {
        if (!geminiPassage.trim()) {
            showError("Paste a paragraph first.");
            return;
        }
        setIsGenerating(true);
        try {
            const token = localStorage.getItem("token");
            const requestData = { passage: geminiPassage };
            console.log("Gemini Request Sent:", requestData);
            const { data: responseData } = await axios.post(
                `${config.API_URL}/api/quizzes/gemini-autofill`,
                requestData,
                token
                    ? {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                    : undefined
            );
            setTitle(responseData.title || "");
            setCategory(responseData.category || "");
            setPassingMarks(responseData.passingMarks || 1);
            setQuestions(responseData.questions?.length ? responseData.questions : [emptyQuestion()]);
            showSuccess("Gemini draft loaded into the form.");
        } catch (error) {
            console.error("Gemini Request Failed:", error);
            showError(error?.response?.data?.message || "Failed to generate with Gemini.");
        } finally {
            setIsGenerating(false);
        }
    };

    const submitQuiz = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                category: category.trim(),
                passingMarks: Math.min(Number(passingMarks) || 1, maxPassingMarks),
                questions: questions.map((q) => ({
                    question: q.question.trim(),
                    options: q.options.map((opt) => opt.trim()),
                    correctAnswer: q.correctAnswer,
                    difficulty: q.difficulty,
                    explanation: q.explanation?.trim() || "",
                })),
            };
            await axios.post("/api/quizzes", payload);
            showSuccess("Admin quiz created successfully.");
            setTitle("");
            setCategory("");
            setPassingMarks(1);
            setQuestions([emptyQuestion()]);
            setGeminiPassage("");
        } catch (error) {
            showError(error?.response?.data?.message || "Failed to create quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-create-page">
            <h1>Admin Suite - Manual Quiz Creator</h1>
            <p className="subtext">Create quizzes manually or auto-fill from Gemini.</p>

            <div className="gemini-box">
                <h2>Generate via Gemini</h2>
                <textarea
                    value={geminiPassage}
                    onChange={(e) => setGeminiPassage(e.target.value)}
                    placeholder="Paste source paragraph here..."
                    rows={6}
                />
                <button type="button" onClick={autofillWithGemini} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Draft"}
                </button>
            </div>

            <form onSubmit={submitQuiz} className="admin-create-form">
                <div className="quiz-meta">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz Title" required />
                    <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required />
                    <input
                        type="number"
                        min="1"
                        max={maxPassingMarks}
                        value={Math.min(Number(passingMarks) || 1, maxPassingMarks)}
                        onChange={(e) => setPassingMarks(e.target.value)}
                        placeholder="Passing Marks"
                        required
                    />
                </div>

                {questions.map((q, index) => (
                    <div key={`question-${index}`} className="question-card">
                        <div className="question-card-header">
                            <h3>Question {index + 1}</h3>
                            <button type="button" onClick={() => removeQuestion(index)}>Remove</button>
                        </div>
                        <input
                            value={q.question}
                            onChange={(e) => updateQuestion(index, "question", e.target.value)}
                            placeholder="Question text"
                            required
                        />
                        {q.options.map((option, optIndex) => (
                            <input
                                key={`opt-${index}-${optIndex}`}
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                required
                            />
                        ))}
                        <div className="question-row">
                            <select
                                value={q.correctAnswer}
                                onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                            >
                                <option value="A">Correct: A</option>
                                <option value="B">Correct: B</option>
                                <option value="C">Correct: C</option>
                                <option value="D">Correct: D</option>
                            </select>
                            <select
                                value={q.difficulty}
                                onChange={(e) => updateQuestion(index, "difficulty", e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <textarea
                            value={q.explanation}
                            onChange={(e) => updateQuestion(index, "explanation", e.target.value)}
                            placeholder="Optional explanation"
                            rows={3}
                        />
                    </div>
                ))}

                <div className="actions">
                    <button type="button" onClick={addQuestion}>Add Question</button>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Create Quiz"}
                    </button>
                </div>
            </form>

            <NotificationModal
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
                autoClose={notification.autoClose}
            />
        </div>
    );
};

export default AdminCreateQuiz;
