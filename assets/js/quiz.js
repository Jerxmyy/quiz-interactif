// quiz.js
import {
  getElement,
  showElement,
  hideElement,
  setText,
  createAnswerButton,
  updateScoreDisplay,
  lockAnswers,
  markCorrectAnswer,
} from "./dom.js";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  startTimer,
  shuffleArray,
} from "./utils.js";

console.log("Quiz JS loaded...");

let questions = [
  {
    text: "Quelle est la capitale de la France ?",
    answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    correct: 1,
    timeLimit: 10,
  },
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 5,
  },
];

let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;

let correctCount = 0;
let wrongCount = 0;
let answerTimes = [];
let currentTimeLeft = 0;
let answered = false;

// DOM Elements
const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const resultScreen = getElement("#result-screen");

const bestScoreValue = getElement("#best-score-value");
const bestScoreEnd = getElement("#best-score-end");

const questionText = getElement("#question-text");
const answersDiv = getElement("#answers");
const nextBtn = getElement("#next-btn");
const startBtn = getElement("#start-btn");
const restartBtn = getElement("#restart-btn");
const shareBtn = getElement("#share-btn");
const shareLink = getElement("#share-link");

const scoreText = getElement("#score-text");
const statsText = getElement("#stats-text");
const timeLeftSpan = getElement("#time-left");

const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");
const themeToggle = getElement("#theme-toggle");

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);
shareBtn.addEventListener("click", shareScore);
themeToggle.addEventListener("click", toggleTheme);

setText(bestScoreValue, bestScore);
applyTheme(loadFromLocalStorage("theme", "light"));

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  setText(themeToggle, isDark ? "Mode clair" : "Mode sombre");
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  saveToLocalStorage("theme", nextTheme);
  applyTheme(nextTheme);
}

function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  answerTimes = [];
  questions = shuffleArray(questions);

  setText(totalQuestionsSpan, questions.length);

  showQuestion();
}

function showQuestion() {
  clearInterval(timerId);
  answered = false;

  const q = questions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  nextBtn.classList.add("hidden");

  timeLeftSpan.textContent = q.timeLimit;
  currentTimeLeft = q.timeLimit;
  timerId = startTimer(
    q.timeLimit,
    (timeLeft) => {
      currentTimeLeft = timeLeft;
      setText(timeLeftSpan, timeLeft);
    },
    () => {
      if (!answered) {
        answered = true;
        wrongCount++;
        answerTimes.push(q.timeLimit);
      }
      lockAnswers(answersDiv);
      nextBtn.classList.remove("hidden");
    }
  );
}

function selectAnswer(index, btn) {
  clearInterval(timerId);
  answered = true;

  const q = questions[currentQuestionIndex];
  const timeTaken = q.timeLimit - currentTimeLeft;
  answerTimes.push(timeTaken);

  if (index === q.correct) {
    score++;
    correctCount++;
    btn.classList.add("correct");
  } else {
    wrongCount++;
    btn.classList.add("wrong");
  }

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);

  updateScoreDisplay(scoreText, score, questions.length);
  shareLink.classList.add("hidden");
  setText(shareLink, "");

  const avgTime =
    answerTimes.length > 0
      ? (answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length).toFixed(1)
      : 0;
  setText(
    statsText,
    `Bonnes réponses : ${correctCount} | Mauvaises réponses : ${wrongCount} | Temps moyen par question : ${avgTime}s`
  );

  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);
}

function buildShareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("score", String(score));
  url.searchParams.set("total", String(questions.length));
  return url.toString();
}

function shareScore() {
  const shareUrl = buildShareUrl();
  const shareText = `Mon score au Quiz Dynamique : ${score}/${questions.length}`;

  setText(shareLink, shareUrl);
  shareLink.classList.remove("hidden");

  if (navigator.share) {
    navigator.share({ title: "Quiz Dynamique", text: shareText, url: shareUrl }).catch(() => {});
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).catch(() => {});
  }
}

function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  setText(bestScoreValue, bestScore);
}