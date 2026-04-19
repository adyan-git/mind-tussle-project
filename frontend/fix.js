const fs = require('fs');
let content = fs.readFileSync('d:/quiz-mindtussle/frontend/src/components/RealTimeQuizRestored.jsx', 'utf8');
content = content.replace(/\\\\\/g, '\').replace(/\\\\\$/g, '');
fs.writeFileSync('d:/quiz-mindtussle/frontend/src/components/RealTimeQuizRestored.jsx', content);
