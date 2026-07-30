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

const QUESTIONS_BANK = [
  {
    text: "Quelle est la capitale de la France ?",
    answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    correct: 1,
    timeLimit: 10,
    hint: "C’est aussi appelée la Ville lumière.",
  },
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 5,
    hint: "Additionne 2 et 3.",
  },
  {
    text: "Quelle planète est la plus proche du Soleil ?",
    answers: ["Vénus", "Mercure", "Mars", "Terre"],
    correct: 1,
    timeLimit: 10,
    hint: "Son nom rappelle un métal liquide.",
  },
  {
    text: "Combien y a-t-il de continents ?",
    answers: ["5", "6", "7", "8"],
    correct: 2,
    timeLimit: 8,
    hint: "Europe, Asie, Afrique, Amérique, Antarctique, Océanie…",
  },
  {
    text: "Qui a peint la Joconde ?",
    answers: ["Picasso", "Van Gogh", "Léonard de Vinci", "Monet"],
    correct: 2,
    timeLimit: 10,
    hint: "Artiste italien de la Renaissance.",
  },
  {
    text: "Quel est le plus grand océan ?",
    answers: ["Atlantique", "Indien", "Arctique", "Pacifique"],
    correct: 3,
    timeLimit: 8,
    hint: "Il borde l’Asie et l’Amérique.",
  },
];

const BADGE_DEFINITIONS = [
  {
    id: "first-win",
    label: "Première victoire",
    description: "Obtenir au moins 1 bonne réponse",
    check: (stats) => stats.lifetimeCorrect >= 1,
  },
  {
    id: "perfect-classic",
    label: "Sans faute",
    description: "Terminer un quiz classique avec 100%",
    check: (stats) => stats.lastPerfectClassic,
  },
  {
    id: "ten-correct",
    label: "10 bonnes réponses",
    description: "Cumuler 10 bonnes réponses",
    check: (stats) => stats.lifetimeCorrect >= 10,
  },
  {
    id: "infinite-runner",
    label: "Marathon",
    description: "Répondre à 5 questions en mode infini",
    check: (stats) => stats.lastInfiniteAnswered >= 5,
  },
];

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;
let infiniteMode = false;
let unlockedBadges = loadFromLocalStorage("badges", []);
let lifetimeCorrect = loadFromLocalStorage("lifetimeCorrect", 0);

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
const infiniteBtn = getElement("#infinite-btn");
const stopInfiniteBtn = getElement("#stop-infinite-btn");
const restartBtn = getElement("#restart-btn");
const shareBtn = getElement("#share-btn");
const shareLink = getElement("#share-link");
const hintBtn = getElement("#hint-btn");
const hintText = getElement("#hint-text");
const audioBtn = getElement("#audio-btn");
const progressTotal = getElement("#progress-total");
const badgesIntro = getElement("#badges-intro");
const badgesResult = getElement("#badges-result");
const newBadges = getElement("#new-badges");

const scoreText = getElement("#score-text");
const statsText = getElement("#stats-text");
const timeLeftSpan = getElement("#time-left");

const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");
const themeToggle = getElement("#theme-toggle");

// Init
startBtn.addEventListener("click", () => startQuiz(false));
infiniteBtn.addEventListener("click", () => startQuiz(true));
stopInfiniteBtn.addEventListener("click", endQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);
shareBtn.addEventListener("click", shareScore);
hintBtn.addEventListener("click", showHint);
audioBtn.addEventListener("click", playQuestionAudio);
themeToggle.addEventListener("click", toggleTheme);

setText(bestScoreValue, bestScore);
applyTheme(loadFromLocalStorage("theme", "light"));
renderBadges(badgesIntro, unlockedBadges);

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

function startQuiz(isInfinite) {
  hideElement(introScreen);
  showElement(questionScreen);

  infiniteMode = isInfinite;
  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  answerTimes = [];

  if (infiniteMode) {
    questions = [...QUESTIONS_BANK];
    progressTotal.classList.add("hidden");
    stopInfiniteBtn.classList.remove("hidden");
    setText(nextBtn, "Question suivante");
  } else {
    questions = shuffleArray(QUESTIONS_BANK);
    progressTotal.classList.remove("hidden");
    stopInfiniteBtn.classList.add("hidden");
    setText(totalQuestionsSpan, questions.length);
  }

  showQuestion();
}

function pickInfiniteQuestion() {
  const pool = shuffleArray(QUESTIONS_BANK);
  return pool[0];
}

function showQuestion() {
  clearInterval(timerId);
  stopSpeech();
  answered = false;

  if (infiniteMode) {
    questions[currentQuestionIndex] = pickInfiniteQuestion();
  }

  const q = questions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  nextBtn.classList.add("hidden");
  resetHint(q);
  audioBtn.classList.remove("hidden");

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
      hintBtn.classList.add("hidden");
    }
  );
}

function resetHint(question) {
  setText(hintText, "");
  hintText.classList.add("hidden");
  hintBtn.disabled = false;

  if (question.hint) {
    hintBtn.classList.remove("hidden");
  } else {
    hintBtn.classList.add("hidden");
  }
}

function showHint() {
  const q = questions[currentQuestionIndex];
  if (!q.hint) return;

  setText(hintText, q.hint);
  hintText.classList.remove("hidden");
  hintBtn.disabled = true;
}

function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function playQuestionAudio() {
  const q = questions[currentQuestionIndex];
  if (!window.speechSynthesis) {
    setText(hintText, "Audio non supporté par ce navigateur.");
    hintText.classList.remove("hidden");
    return;
  }

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(q.text);
  utterance.lang = "fr-FR";
  window.speechSynthesis.speak(utterance);
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
    lifetimeCorrect++;
    btn.classList.add("correct");
  } else {
    wrongCount++;
    btn.classList.add("wrong");
  }

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
  hintBtn.classList.add("hidden");
}

function nextQuestion() {
  if (infiniteMode) {
    currentQuestionIndex++;
    showQuestion();
    return;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  clearInterval(timerId);
  stopSpeech();
  hideElement(questionScreen);
  showElement(resultScreen);

  const totalForDisplay = infiniteMode
    ? correctCount + wrongCount
    : questions.length;

  updateScoreDisplay(scoreText, score, totalForDisplay || score);
  shareLink.classList.add("hidden");
  setText(shareLink, "");
  newBadges.classList.add("hidden");
  setText(newBadges, "");

  const avgTime =
    answerTimes.length > 0
      ? (answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length).toFixed(1)
      : 0;
  setText(
    statsText,
    `Bonnes réponses : ${correctCount} | Mauvaises réponses : ${wrongCount} | Temps moyen par question : ${avgTime}s`
  );

  if (!infiniteMode && score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);

  saveToLocalStorage("lifetimeCorrect", lifetimeCorrect);
  const freshlyUnlocked = unlockBadges({
    lifetimeCorrect,
    lastPerfectClassic:
      !infiniteMode && questions.length > 0 && score === questions.length,
    lastInfiniteAnswered: infiniteMode ? correctCount + wrongCount : 0,
  });

  renderBadges(badgesResult, unlockedBadges);
  if (freshlyUnlocked.length > 0) {
    setText(
      newBadges,
      `Nouveau(x) badge(s) : ${freshlyUnlocked.map((b) => b.label).join(", ")}`
    );
    newBadges.classList.remove("hidden");
  }
}

function unlockBadges(stats) {
  const newlyUnlocked = [];

  BADGE_DEFINITIONS.forEach((badge) => {
    if (!unlockedBadges.includes(badge.id) && badge.check(stats)) {
      unlockedBadges.push(badge.id);
      newlyUnlocked.push(badge);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveToLocalStorage("badges", unlockedBadges);
  }

  return newlyUnlocked;
}

function renderBadges(container, badgeIds) {
  if (!container) return;

  if (!badgeIds.length) {
    container.innerHTML = "<p class='badges-empty'>Aucun badge pour le moment.</p>";
    return;
  }

  container.innerHTML = badgeIds
    .map((id) => {
      const badge = BADGE_DEFINITIONS.find((item) => item.id === id);
      if (!badge) return "";
      return `<span class="badge" title="${badge.description}">${badge.label}</span>`;
    })
    .join("");
}

function buildShareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("score", String(score));
  url.searchParams.set(
    "total",
    String(infiniteMode ? correctCount + wrongCount : questions.length)
  );
  return url.toString();
}

function shareScore() {
  const total = infiniteMode ? correctCount + wrongCount : questions.length;
  const shareUrl = buildShareUrl();
  const shareText = `Mon score au Quiz Dynamique : ${score}/${total}`;

  setText(shareLink, shareUrl);
  shareLink.classList.remove("hidden");

  if (navigator.share) {
    navigator
      .share({ title: "Quiz Dynamique", text: shareText, url: shareUrl })
      .catch(() => {});
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
  renderBadges(badgesIntro, unlockedBadges);
}
