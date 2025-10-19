// --- CONSTANT FOR QUIZ LENGTH ---
const QUIZ_LENGTH = 10;

// --- FEEDBACK MESSAGES (Cycling Arrays) ---
const correctMessages = [
    "Affirmative!",
    "Perfect resolution!",
    "Well done!",
    "You've got the satellite view.",
    "Mission success!"
];

const incorrectMessages = [
    "Missed the mark.",
    "Negative. Recalibrate your coordinates.",
    "That's not the right spectral band.",
    "Try again, surveyor.",
    "Nah, that ain't it..."
];

// --- STATE VARIABLES ---
let currentQuestionIndex = 0;
let score = 0;
let questionAnswered = false;
let activeQuizQuestions = []; // Holds the 10 questions for the current session

// --- DOM REFERENCES ---
const scoreDisplay = document.getElementById('score-display');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
const resultMessage = document.getElementById('result-message');

// Helper to mix up array elements (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Loads questions from the JSON bank and initializes the quiz with 10 random questions.
 */
async function loadQuestionsAndInit() {
    try {
        const res = await fetch('questions.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load questions.json (${res.status})`);
        const quizData = await res.json();

        // Shuffle and pick 10
        const shuffled = [...quizData];
        shuffleArray(shuffled);
        activeQuizQuestions = shuffled.slice(0, QUIZ_LENGTH);

        initQuiz();
    } catch (err) {
        console.error('Error loading question bank:', err);
        questionText.textContent = 'Failed to load questions. Please make sure questions.json is available.';
    }
}

/**
 * Initializes or restarts the quiz. Assumes activeQuizQuestions is already populated.
 */
function initQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questionAnswered = false;

    updateScoreDisplay();
    restartButton.classList.add('hidden');
    resultMessage.classList.add('hidden');
    loadQuestion();
}

/**
 * Updates the score text.
 */
function updateScoreDisplay() {
    // Use activeQuizQuestions.length (which is 10) for the total
    scoreDisplay.textContent = `Score: ${score} / ${activeQuizQuestions.length || QUIZ_LENGTH}`;
}

/**
 * Loads and displays the current question and its options.
 */
function loadQuestion() {
    if (currentQuestionIndex >= activeQuizQuestions.length) {
        showResults();
        return;
    }

    const current = activeQuizQuestions[currentQuestionIndex];
    questionText.textContent = `Q${currentQuestionIndex + 1}: ${current.question}`;
    optionsContainer.innerHTML = '';
    nextButton.classList.add('hidden');
    resultMessage.classList.add('hidden');
    questionAnswered = false;

    // Shuffle options for variety
    const shuffledOptions = [...current.options];
    shuffleArray(shuffledOptions);

    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add(
            'option-button', // Custom class for selection
            'py-3', 'px-4', 'text-white', 'font-medium', 'rounded-lg',
            'shadow-md', 'text-left', 'transition', 'duration-150',
            'bg-gray-600', 'hover:bg-indigo-500', 'focus:outline-none', 'focus:ring-4', 'focus:ring-indigo-500', 'focus:ring-opacity-50'
        );
        button.onclick = () => checkAnswer(button, option, current.answer);
        optionsContainer.appendChild(button);
    });
}

/**
 * Checks the user's selected answer against the correct answer.
 */
function checkAnswer(selectedButton, selectedOption, correctAnswer) {
    if (questionAnswered) return; // Prevent multiple clicks

    questionAnswered = true;
    const isCorrect = selectedOption === correctAnswer;

    // Disable all option buttons
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-indigo-500'); // Remove hover effect
        btn.classList.remove('focus:ring-indigo-500'); // Remove focus effect
    });

    // Highlight the correct answer
    document.querySelectorAll('.option-button').forEach(btn => {
        if (btn.textContent === correctAnswer) {
            btn.classList.remove('bg-gray-600');
            btn.classList.add('bg-emerald-600', 'ring-2', 'ring-emerald-400');
        }
    });

    // Handle user selection
    if (isCorrect) {
        score++;
        selectedButton.classList.add('ring-4', 'ring-emerald-300/80');

        // Randomly select a correct message
        const randomCorrectMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
        showMessage(randomCorrectMessage, 'bg-emerald-900/50', 'text-emerald-300');
    } else {
        selectedButton.classList.remove('bg-gray-600');
        selectedButton.classList.add('bg-red-600', 'ring-4', 'ring-red-300/80');

        // Randomly select an incorrect prefix and append the correct answer
        const randomIncorrectPrefix = incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
        showMessage(`${randomIncorrectPrefix} The correct answer was: ${correctAnswer}.`, 'bg-red-900/50', 'text-red-300');
    }

    updateScoreDisplay();
    nextButton.classList.remove('hidden');
}

/**
 * Displays a message to the user.
 */
function showMessage(message, bgColorClass, textColorClass) {
    resultMessage.textContent = message;
    resultMessage.classList.remove('hidden', 'bg-yellow-900/50', 'text-yellow-300', 'bg-emerald-900/50', 'text-emerald-300', 'bg-red-900/50', 'text-red-300');
    resultMessage.classList.add(bgColorClass, textColorClass);
}

/**
 * Proceeds to the next question or shows results.
 */
function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

/**
 * Displays the final results of the quiz.
 */
function showResults() {
    questionText.textContent = "Quiz Complete!";
    optionsContainer.innerHTML = '';
    nextButton.classList.add('hidden');
    restartButton.classList.remove('hidden');

    const finalMessage = score === activeQuizQuestions.length
        ? "You've achieved perfect resolution! All correct!"
        : `You scored ${score} out of ${activeQuizQuestions.length}. Keep learning about our world!`;

    showMessage(finalMessage, 'bg-indigo-900/50', 'text-indigo-300');
}

// Start the quiz when the script loads by fetching the question bank and selecting 10 random questions
window.onload = loadQuestionsAndInit;
