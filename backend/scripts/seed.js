import dotenv from "dotenv";
import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const buildQuiz = (title, category, questions) => ({
    title,
    category,
    questions,
    totalMarks: questions.length,
    passingMarks: Math.ceil(questions.length * 0.6),
    duration: Math.max(10, questions.length * 2),
    createdBy: { _id: null, name: "Admin" },
});

const quizzes = [
    buildQuiz("Computer Science Fundamentals", "Computer Science", [
        {
            question: "Which data structure uses LIFO ordering?",
            options: ["Queue", "Stack", "Heap", "Graph"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "A stack follows Last-In, First-Out ordering.",
            bloomLevel: "remember",
        },
        {
            question: "What is the average-case time complexity of binary search on a sorted array?",
            options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "Binary search halves the search space each step, giving O(log n).",
            bloomLevel: "understand",
        },
        {
            question: "Which SQL clause is used to filter grouped results after aggregation?",
            options: ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
            correctAnswer: "C",
            difficulty: "medium",
            explanation: "HAVING filters grouped rows after aggregate functions are applied.",
            bloomLevel: "apply",
        },
        {
            question: "Why are B-tree indexes commonly used in databases?",
            options: [
                "They only support exact-match lookups",
                "They keep keys ordered and support efficient range queries",
                "They avoid any disk I/O",
                "They require no balancing operations",
            ],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "B-trees maintain balanced sorted keys for efficient search and range scans.",
            bloomLevel: "analyze",
        },
        {
            question: "In ACID transactions, which property ensures committed data survives system failures?",
            options: ["Atomicity", "Consistency", "Isolation", "Durability"],
            correctAnswer: "D",
            difficulty: "medium",
            explanation: "Durability guarantees committed changes persist after crashes.",
            bloomLevel: "remember",
        },
    ]),
    buildQuiz("IPL Legends", "Sports", [
        {
            question: "Which franchise won the inaugural IPL season in 2008?",
            options: ["Mumbai Indians", "Rajasthan Royals", "Chennai Super Kings", "Kolkata Knight Riders"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "Rajasthan Royals won IPL 2008 under Shane Warne.",
            bloomLevel: "remember",
        },
        {
            question: "Which player is widely known as 'Mr. IPL' for consistent batting performances?",
            options: ["Virat Kohli", "Suresh Raina", "Rohit Sharma", "AB de Villiers"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "Suresh Raina earned the nickname for years of high IPL impact.",
            bloomLevel: "understand",
        },
        {
            question: "In IPL auctions, what does the 'base price' represent?",
            options: ["Final selling price", "Minimum starting bid", "Team salary cap", "Player retention value"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Base price is the minimum bid at which a player enters the auction.",
            bloomLevel: "apply",
        },
        {
            question: "Which venue has hosted multiple IPL finals and is home to Mumbai Indians?",
            options: ["Eden Gardens", "Wankhede Stadium", "M. Chinnaswamy Stadium", "Arun Jaitley Stadium"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Wankhede Stadium in Mumbai has hosted several IPL finals.",
            bloomLevel: "remember",
        },
        {
            question: "Why did IPL introduce strategic timeouts?",
            options: ["To reduce ticket prices", "To support ad breaks and tactical planning", "To shorten innings", "To replace powerplays"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Strategic timeouts provide planning pauses and scheduled commercial slots.",
            bloomLevel: "analyze",
        },
    ]),
    buildQuiz("Full-Stack Development", "Technology", [
        {
            question: "Which layer is primarily responsible for storing and retrieving persistent application data?",
            options: ["Presentation layer", "Data layer", "Routing layer", "Caching layer"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "The data layer handles persistent storage concerns in full-stack systems.",
            bloomLevel: "remember",
        },
        {
            question: "What is a common purpose of backend middleware in Express-style frameworks?",
            options: ["Rendering CSS files", "Handling cross-cutting concerns like auth and logging", "Compiling frontend assets at runtime", "Replacing the database"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Middleware centralizes cross-cutting concerns across request pipelines.",
            bloomLevel: "understand",
        },
        {
            question: "Which HTTP method is most appropriate for a partial update to an existing resource?",
            options: ["GET", "POST", "PATCH", "DELETE"],
            correctAnswer: "C",
            difficulty: "easy",
            explanation: "PATCH is designed for partial resource updates.",
            bloomLevel: "apply",
        },
        {
            question: "Why is schema validation important at API boundaries?",
            options: ["It increases bundle size", "It prevents invalid payloads from corrupting application flow", "It removes need for tests", "It guarantees zero latency"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Validation catches malformed input early and improves system reliability.",
            bloomLevel: "analyze",
        },
        {
            question: "In CI/CD, what is a key benefit of automated test pipelines?",
            options: ["Eliminates version control", "Detects regressions before deployment", "Removes need for code review", "Disables rollback"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Automated pipelines reduce risk by failing fast when regressions are introduced.",
            bloomLevel: "evaluate",
        },
    ]),
    buildQuiz("Space Exploration", "Science", [
        {
            question: "Which mission first landed humans on the Moon?",
            options: ["Apollo 8", "Apollo 11", "Sputnik 1", "Vostok 1"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "Apollo 11 achieved the first human Moon landing in 1969.",
            bloomLevel: "remember",
        },
        {
            question: "What is the primary purpose of the James Webb Space Telescope?",
            options: ["Monitor Earth's weather only", "Observe early universe infrared signals", "Transport astronauts", "Mine asteroids"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "JWST is optimized for infrared astronomy and early cosmic observations.",
            bloomLevel: "understand",
        },
        {
            question: "Why are reusable rockets economically important?",
            options: ["They increase one-time launch costs only", "They lower cost per launch through hardware reuse", "They remove payload limits", "They eliminate mission risk"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Reusability reduces manufacturing cost across multiple launches.",
            bloomLevel: "apply",
        },
        {
            question: "What challenge does long-duration human spaceflight face most critically?",
            options: ["No communication tools", "Microgravity effects on health", "Absence of vacuum", "Unlimited radiation shielding"],
            correctAnswer: "B",
            difficulty: "hard",
            explanation: "Microgravity can degrade bone density, muscle mass, and overall physiology.",
            bloomLevel: "analyze",
        },
        {
            question: "Which planet is the primary target for current crewed mission roadmaps?",
            options: ["Venus", "Mars", "Mercury", "Neptune"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "Many agencies and private firms focus long-term crewed plans on Mars.",
            bloomLevel: "remember",
        },
    ]),
    buildQuiz("Cyber Security", "Technology", [
        {
            question: "Which security principle grants users only the minimum access needed?",
            options: ["Defense in depth", "Least privilege", "Open access", "Security through obscurity"],
            correctAnswer: "B",
            difficulty: "easy",
            explanation: "Least privilege limits blast radius by reducing unnecessary permissions.",
            bloomLevel: "understand",
        },
        {
            question: "What is phishing primarily designed to do?",
            options: ["Improve network speed", "Trick users into revealing sensitive information", "Patch OS vulnerabilities", "Encrypt backups safely"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Phishing attacks use deception to steal credentials or financial data.",
            bloomLevel: "apply",
        },
        {
            question: "Which practice best protects passwords at rest in a database?",
            options: ["Store in plain text", "Encrypt with reversible key only", "Hash with a strong adaptive algorithm and salt", "Store in logs for auditing"],
            correctAnswer: "C",
            difficulty: "medium",
            explanation: "Adaptive salted hashes like bcrypt or Argon2 improve password storage security.",
            bloomLevel: "apply",
        },
        {
            question: "What is the main purpose of multi-factor authentication (MFA)?",
            options: ["Reduce app features", "Add independent verification factors beyond passwords", "Replace HTTPS", "Disable session management"],
            correctAnswer: "B",
            difficulty: "hard",
            explanation: "MFA reduces account takeover risk even if a password is compromised.",
            bloomLevel: "analyze",
        },
        {
            question: "What does a well-designed incident response plan primarily improve?",
            options: ["Marketing conversion", "Detection, containment, and recovery speed", "Compiler performance", "UI theme consistency"],
            correctAnswer: "B",
            difficulty: "medium",
            explanation: "Prepared response workflows minimize impact and downtime during security events.",
            bloomLevel: "evaluate",
        },
    ]),
];

const seed = async () => {
    // REPLACE THE URL BELOW WITH YOUR ACTUAL CONNECTION STRING FROM MONGODB ATLAS
    const mongoUri = process.env.MONGO_URI;
     console.log("🚀 Attempting to seed database...");

    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB!");

        await Quiz.deleteMany({});
        console.log("🗑️  Old quizzes cleared.");

        await Quiz.insertMany(quizzes);
        console.log("🌱 5 New Quizzes inserted successfully!");

        await mongoose.connection.close();
        console.log("🔌 Connection closed.");
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
        process.exit(1);
    }
};

seed()
    .then(() => {
        console.log("Database seeded with demo quizzes.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Seeding failed:", error.message);
        process.exit(1);
    });
