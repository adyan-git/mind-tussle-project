import React, { useState, useEffect } from 'react';
import Join from './pages/Join';
import Play from './pages/Play';
import Results from './pages/Results';

// --- HELPER COMPONENTS & ICONS ---
// In a real multi-file project, these would be in separate files.

// Icon component to render Lucide SVG icons
const Icon = ({ name, className = "h-5 w-5", ...props }) => {
  const icons = {
    'brain-circuit': <><path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" /></>,
    'layout-dashboard': <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
    'plus-circle': <><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></>,
    'swords': <><path d="m14.5 17.5 4-4" /><path d="m20.5 11.5-4-4" /><path d="M10 14V5l-5 5" /><path d="M5 14v5l5-5" /></>,
    'bar-chart-3': <><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
    'history': <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>,
    'trophy': <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>,
    'log-out': <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></>,
    'gamepad-2': <><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><path d="M17.5 17a2.5 2.5 0 0 1-5 0" /><path d="M10 2H14" /><path d="M12 18V12" /><path d="M4.5 12.5a2.5 2.5 0 0 1-3 0V8.5a2.5 2.5 0 0 1 3 0" /><path d="M19.5 12.5a2.5 2.5 0 0 0 3 0V8.5a2.5 2.5 0 0 0-3 0" /></>,
    'check-circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    'x-circle': <><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></>,
    'rocket': <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05A7.5 7.5 0 0 0 8 10c0 0-2.5-1.5-5.5-2.5Z" /><path d="m14 6 3.4 3.4a.5.5 0 0 0 .8-.2l1.3-5.2c.2-.8-.4-1.5-1.2-1.2L13 3.4a.5.5 0 0 0-.2.8Z" /><path d="M21.5 16.5c1.5.01 2.5-1.34 2.5-3 0-1.4-1.08-2.5-2.5-2.5-.83 0-1.5.37-2 1a2.5 2.5 0 0 0 2 4.5Z" /></>,
    'landmark': <><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></>,
    'upload-cloud': <><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></>,
    'ticket': <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></>,
    'clock': <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    'play-circle': <><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></>,
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {icons[name] || ''}
    </svg>
  );
};

// --- PAGE COMPONENTS ---

const DashboardPage = ({ setCurrentPage }) => (
    <div>
        <h2 className="text-3xl font-bold mb-6">Welcome back, User!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon="gamepad-2" title="Quizzes Played" value="12" color="indigo" />
            <StatCard icon="check-circle" title="Avg. Score" value="85%" color="green" />
            <StatCard icon="trophy" title="Rank" value="#3" color="yellow" />
            <StatCard icon="swords" title="Challenges Won" value="7" color="red" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Continue Playing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuizCard category="Science" title="Space Exploration" questions={15} progress={45} icon="rocket" color="blue" onContinue={() => setCurrentPage('quiz')} />
            <QuizCard category="History" title="Ancient Civilizations" questions={20} progress={70} icon="landmark" color="purple" onContinue={() => setCurrentPage('quiz')} />
            <div 
              onClick={() => setCurrentPage('create')}
              className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="text-center">
                    <Icon name="plus-circle" className="h-12 w-12 mx-auto" />
                    <p className="mt-2 font-semibold">Create a New Quiz</p>
                </div>
            </div>
        </div>
    </div>
);

const CreateQuizPage = () => (
    <div>
        <h2 className="text-3xl font-bold mb-6">Create a New Quiz</h2>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            {/* Form fields */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-bold mb-4">Generate Quiz from File</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Upload a .pdf, .docx, or .txt file to automatically generate questions.</p>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Icon name="upload-cloud" className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 font-semibold">Drag & drop your file here</p>
                    <p className="text-sm text-gray-500">or</p>
                    <button className="mt-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 py-2 px-4 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                        Choose File
                    </button>
                </div>
            </div>
            <div className="mt-8 text-right">
                <button className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Create & Add Questions
                </button>
            </div>
        </div>
    </div>
);

const JoinQuizPage = ({ setCurrentPage }) => (
    <div>
        <h2 className="text-3xl font-bold mb-6">Join a Quiz</h2>
        <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <Icon name="ticket" className="h-16 w-16 mx-auto text-indigo-500 mb-4" />
                <h3 className="text-2xl font-bold">Enter Quiz Code</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Enter the code provided by the host to join the quiz.</p>
                <input type="text" placeholder="X7B2K9" maxLength="6" className="w-full text-center text-3xl font-bold tracking-[1em] uppercase bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => setCurrentPage('quiz')} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg">
                   Join Now
                </button>
            </div>
        </div>
    </div>
);

const QuizPage = ({ setCurrentPage }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const correctAnswer = 2; // Jupiter is the 3rd option (index 2)

    const handleAnswerClick = (index) => {
        if (!isAnswered) {
            setSelectedAnswer(index);
            setIsAnswered(true);
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Space Exploration</h2>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-indigo-500 font-semibold">Question 3 of 15</p>
                    <div className="flex items-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-1 rounded-full">
                        <Icon name="clock" className="h-4 w-4 mr-1.5" />
                        <span className="font-mono">00:23</span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">What is the largest planet in our solar system?</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Mars", "Earth", "Jupiter", "Saturn"].map((option, index) => (
                         <AnswerOption 
                            key={index}
                            text={option}
                            onClick={() => handleAnswerClick(index)}
                            isAnswered={isAnswered}
                            isSelected={selectedAnswer === index}
                            isCorrect={correctAnswer === index}
                        />
                    ))}
                </div>
                
                {isAnswered && (
                     <div className="text-center mt-8">
                        <button className="bg-indigo-600 text-white py-3 px-10 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg">
                           Next Question
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const NoDataPlaceholder = ({ title, message, buttonText, onButtonClick }) => (
    <div className="text-center mt-16">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <button onClick={onButtonClick} className="bg-indigo-600 text-white py-2 px-5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            {buttonText}
        </button>
    </div>
);

const ResultsPage = ({ setCurrentPage }) => (
    <div>
        <h2 className="text-3xl font-bold mb-6">Results</h2>
        <NoDataPlaceholder
            title="No Results Found"
            message="You haven't completed any quizzes yet."
            buttonText="Take a Quiz"
            onButtonClick={() => setCurrentPage('join')}
        />
    </div>
);

const HistoryPage = ({ setCurrentPage }) => (
    <div>
        <h2 className="text-3xl font-bold mb-6">Quiz History</h2>
         <NoDataPlaceholder
            title="No Quiz Attempts Yet"
            message="Your quiz history will appear here once you play."
            buttonText="Find a Quiz to Join"
            onButtonClick={() => setCurrentPage('join')}
        />
    </div>
);

const LeaderboardPage = () => (
    <div>
        <h2 className="text-3xl font-bold mb-6">Leaderboard</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 grid grid-cols-12 font-bold text-sm uppercase text-gray-500 dark:text-gray-400">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-6">Player</div>
                <div className="col-span-2 text-center">Quizzes</div>
                <div className="col-span-3 text-right">Score</div>
            </div>
            <ul>
                <LeaderboardItem rank={1} name="Alice" quizzes={15} score={12850} isUser={false} />
                <LeaderboardItem rank={2} name="Bob" quizzes={14} score={11900} isUser={false} />
                <LeaderboardItem rank={3} name="You" quizzes={12} score={10200} isUser={true} />
                <LeaderboardItem rank={4} name="Charlie" quizzes={11} score={9800} isUser={false} />
                <LeaderboardItem rank={5} name="David" quizzes={10} score={9540} isUser={false} />
            </ul>
        </div>
    </div>
);

// --- REUSABLE UI ELEMENTS ---

const StatCard = ({ icon, title, value, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-500',
        green: 'bg-green-100 dark:bg-green-900 text-green-500',
        yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500',
        red: 'bg-red-100 dark:bg-red-900 text-red-500',
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                <Icon name={icon} className="h-6 w-6" />
            </div>
            <div className="ml-4">
                <p className="text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

const QuizCard = ({ category, title, questions, progress, icon, color, onContinue }) => {
     const colorClasses = {
        blue: {
            tag: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
            icon: 'text-blue-500',
            progress: 'bg-blue-600',
        },
        purple: {
            tag: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
            icon: 'text-purple-500',
            progress: 'bg-purple-600',
        }
    };
    const classes = colorClasses[color];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
             <div>
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-sm px-2 py-1 rounded-full inline-block ${classes.tag}`}>{category}</p>
                        <h4 className="text-xl font-bold mt-2">{title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{questions} Questions</p>
                    </div>
                    <div className="text-right">
                        <Icon name={icon} className={`h-10 w-10 ${classes.icon}`} />
                    </div>
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={`${classes.progress} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-sm text-right mt-1 text-gray-500 dark:text-gray-400">{progress}% Completed</p>
                </div>
            </div>
            <button onClick={onContinue} className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <Icon name="play-circle" className="mr-2 h-5 w-5" />
                Continue
            </button>
        </div>
    );
};

const LeaderboardItem = ({ rank, name, quizzes, score, isUser }) => (
    <li className={`grid grid-cols-12 items-center p-4 transition-colors ${isUser ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
        <div className="col-span-1 text-center font-bold text-gray-500 dark:text-gray-400">{rank}</div>
        <div className="col-span-6 flex items-center">
            <img src={`https://placehold.co/32x32/${isUser ? '6366f1' : 'a8a29e'}/ffffff?text=${name.charAt(0)}`} alt="avatar" className="rounded-full mr-3" />
            <span className="font-semibold">{name}</span>
        </div>
        <div className="col-span-2 text-center text-gray-500 dark:text-gray-400">{quizzes}</div>
        <div className="col-span-3 text-right font-bold text-indigo-500">{score.toLocaleString()} pts</div>
    </li>
);

const AnswerOption = ({ text, onClick, isAnswered, isSelected, isCorrect }) => {
    const getBackgroundColor = () => {
        if (!isAnswered) {
            return "hover:bg-indigo-100 dark:hover:bg-gray-700";
        }
        if (isCorrect) {
            return "bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-300";
        }
        if (isSelected && !isCorrect) {
            return "bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-300";
        }
        return "bg-gray-100 dark:bg-gray-700";
    };

    return (
        <button
            onClick={onClick}
            disabled={isAnswered}
            className={`p-4 w-full text-left rounded-lg border-2 transition-all duration-300 text-lg font-medium flex items-center justify-between ${getBackgroundColor()} ${!isAnswered ? 'cursor-pointer border-transparent' : 'cursor-default'}`}
        >
            <span>{text}</span>
            {isAnswered && isCorrect && <Icon name="check-circle" className="text-green-500" />}
            {isAnswered && isSelected && !isCorrect && <Icon name="x-circle" className="text-red-500" />}
        </button>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
    }, []);
    
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    
    const navLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
        { id: 'create', label: 'Create Quiz', icon: 'plus-circle' },
        { id: 'join', label: 'Join Quiz', icon: 'swords' },
        { id: 'quiz', label: 'Live Quiz (Demo)', icon: 'play-circle' }, // Added for demo
        { id: 'results', label: 'Results', icon: 'bar-chart-3' },
        { id: 'history', label: 'History', icon: 'history' },
        { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
    ];
    
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardPage setCurrentPage={setCurrentPage} />;
            case 'create': return <CreateQuizPage />;
            case 'join': return <Join setCurrentPage={setCurrentPage} />;
            case 'quiz': return <Play setCurrentPage={setCurrentPage} />;
            case 'results': return <Results setCurrentPage={setCurrentPage} />;
            case 'history': return <HistoryPage setCurrentPage={setCurrentPage} />;
            case 'leaderboard': return <LeaderboardPage />;
            default: return <DashboardPage setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-colors duration-300">
                <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <Icon name="brain-circuit" className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold ml-3">Mind Tussle</h1>
                </div>
                <div className="flex-grow p-4">
                    {navLinks.map(link => (
                         <a href="#" 
                            key={link.id}
                            onClick={(e) => { e.preventDefault(); setCurrentPage(link.id); }} 
                            className={`flex items-center px-4 py-3 mb-2 rounded-lg font-medium transition-colors ${currentPage === link.id ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100 dark:hover:bg-gray-700'}`}>
                             <Icon name={link.icon} className="h-5 w-5 mr-3" /> {link.label}
                         </a>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <img src="https://placehold.co/40x40/6366f1/ffffff?text=U" alt="User Avatar" className="rounded-full" />
                            <span className="ml-3 font-semibold">User</span>
                        </div>
                        <button className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                             <Icon name="log-out" className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm">Dark Mode</span>
                         <button onClick={toggleDarkMode} className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <span className="sr-only">Toggle dark mode</span>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950/50">
                {renderPage()}
            </main>
        </div>
    );
}
