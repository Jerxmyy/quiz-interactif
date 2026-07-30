// quiz.js
import {
  getElement,
  showElement,
  hideElement,
  setText,
  createAnswerButton,
  createImageAnswerButton,
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

function emojiSvg(emoji) {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' rx='8' fill='#f5f5f5'/><text x='40' y='52' font-size='40' text-anchor='middle'>${emoji}</text></svg>`
    )
  );
}

const I18N = {
  fr: {
    title: "Quiz Dynamique",
    notice: "Testez vos connaissances en quelques questions chronométrées !",
    bestScore: "Meilleur score",
    langLabel: "Langue",
    themeLabel: "Thème",
    themeAll: "Tous les thèmes",
    themeCulture: "Culture générale",
    themeMaths: "Maths",
    themeImages: "Images",
    startClassic: "Commencer le quiz",
    startProgressive: "Difficulté progressive",
    startTimed: "Contre-la-montre",
    startFlashcard: "Mode Flashcard",
    startInfinite: "Mode infini",
    questionWord: "Question",
    globalTime: "Temps global",
    audio: "Lecture",
    reveal: "Voir la réponse",
    hint: "Indice",
    timeLeft: "Temps restant",
    next: "Question suivante",
    stopInfinite: "Arrêter le mode infini",
    resultTitle: "Résultat final",
    recapTitle: "Récapitulatif",
    recapQuestion: "Question",
    recapChosen: "Votre réponse",
    recapCorrect: "Bonne réponse",
    share: "Partager",
    restart: "Recommencer",
    dark: "Mode sombre",
    light: "Mode clair",
    noAnswer: "Pas de réponse",
    scoreLabel: "Votre score",
    stats: (c, w, avg) =>
      `Bonnes réponses : ${c} | Mauvaises réponses : ${w} | Temps moyen : ${avg}s`,
    newBadges: (labels) => `Nouveau(x) badge(s) : ${labels}`,
    noBadges: "Aucun badge pour le moment.",
    shareText: (score, total) => `Mon score au Quiz Dynamique : ${score}/${total}`,
    audioUnsupported: "Audio non supporté par ce navigateur.",
  },
  en: {
    title: "Dynamic Quiz",
    notice: "Test your knowledge with timed questions!",
    bestScore: "Best score",
    langLabel: "Language",
    themeLabel: "Theme",
    themeAll: "All themes",
    themeCulture: "General knowledge",
    themeMaths: "Maths",
    themeImages: "Images",
    startClassic: "Start quiz",
    startProgressive: "Progressive difficulty",
    startTimed: "Time attack",
    startFlashcard: "Flashcard mode",
    startInfinite: "Infinite mode",
    questionWord: "Question",
    globalTime: "Global time",
    audio: "Play",
    reveal: "Show answer",
    hint: "Hint",
    timeLeft: "Time left",
    next: "Next question",
    stopInfinite: "Stop infinite mode",
    resultTitle: "Final result",
    recapTitle: "Summary",
    recapQuestion: "Question",
    recapChosen: "Your answer",
    recapCorrect: "Correct answer",
    share: "Share",
    restart: "Restart",
    dark: "Dark mode",
    light: "Light mode",
    noAnswer: "No answer",
    scoreLabel: "Your score",
    stats: (c, w, avg) =>
      `Correct : ${c} | Wrong : ${w} | Average time : ${avg}s`,
    newBadges: (labels) => `New badge(s) : ${labels}`,
    noBadges: "No badges yet.",
    shareText: (score, total) => `My Dynamic Quiz score : ${score}/${total}`,
    audioUnsupported: "Audio is not supported in this browser.",
  },
};

const QUESTIONS_BANK = [
  {
    theme: "culture",
    difficulty: 1,
    text: { fr: "Quelle est la capitale de la France ?", en: "What is the capital of France?" },
    answers: {
      fr: ["Marseille", "Paris", "Lyon", "Bordeaux"],
      en: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    },
    correct: 1,
    timeLimit: 10,
    hint: { fr: "Ville lumière.", en: "Also called the City of Light." },
  },
  {
    theme: "maths",
    difficulty: 1,
    text: { fr: "Combien font 2 + 3 ?", en: "What is 2 + 3?" },
    answers: { fr: ["3", "4", "5", "1"], en: ["3", "4", "5", "1"] },
    correct: 2,
    timeLimit: 5,
    hint: { fr: "Additionne 2 et 3.", en: "Add 2 and 3." },
  },
  {
    theme: "culture",
    difficulty: 2,
    text: {
      fr: "Quelle planète est la plus proche du Soleil ?",
      en: "Which planet is closest to the Sun?",
    },
    answers: {
      fr: ["Vénus", "Mercure", "Mars", "Terre"],
      en: ["Venus", "Mercury", "Mars", "Earth"],
    },
    correct: 1,
    timeLimit: 10,
    hint: { fr: "Métal liquide.", en: "Named after a liquid metal." },
  },
  {
    theme: "maths",
    difficulty: 2,
    text: { fr: "Combien font 7 × 8 ?", en: "What is 7 × 8?" },
    answers: { fr: ["54", "56", "63", "48"], en: ["54", "56", "63", "48"] },
    correct: 1,
    timeLimit: 10,
    hint: { fr: "7 × 7 = 49, puis +7.", en: "7 × 7 = 49, then +7." },
  },
  {
    theme: "culture",
    difficulty: 3,
    text: { fr: "Qui a peint la Joconde ?", en: "Who painted the Mona Lisa?" },
    answers: {
      fr: ["Picasso", "Van Gogh", "Léonard de Vinci", "Monet"],
      en: ["Picasso", "Van Gogh", "Leonardo da Vinci", "Monet"],
    },
    correct: 2,
    timeLimit: 10,
    hint: { fr: "Renaissance italienne.", en: "Italian Renaissance artist." },
  },
  {
    theme: "maths",
    difficulty: 3,
    text: {
      fr: "Quelle est la racine carrée de 144 ?",
      en: "What is the square root of 144?",
    },
    answers: { fr: ["10", "11", "12", "14"], en: ["10", "11", "12", "14"] },
    correct: 2,
    timeLimit: 12,
    hint: { fr: "12 × 12 = ?", en: "12 × 12 = ?" },
  },
  {
    theme: "images",
    difficulty: 1,
    text: {
      fr: "Quel fruit est représenté ?",
      en: "Which fruit is shown?",
    },
    questionImage:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='#fff3e0'/><text x='60' y='75' font-size='64' text-anchor='middle'>🍎</text></svg>`
      ),
    answers: {
      fr: [
        { label: "Pomme", image: emojiSvg("🍎") },
        { label: "Banane", image: emojiSvg("🍌") },
        { label: "Raisin", image: emojiSvg("🍇") },
        { label: "Orange", image: emojiSvg("🍊") },
      ],
      en: [
        { label: "Apple", image: emojiSvg("🍎") },
        { label: "Banana", image: emojiSvg("🍌") },
        { label: "Grape", image: emojiSvg("🍇") },
        { label: "Orange", image: emojiSvg("🍊") },
      ],
    },
    correct: 0,
    timeLimit: 10,
    hint: { fr: "Fruit rouge du prof.", en: "Classic red fruit." },
    imageAnswers: true,
  },
  {
    theme: "images",
    difficulty: 2,
    text: {
      fr: "Quel animal est représenté ?",
      en: "Which animal is shown?",
    },
    questionImage:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='#e3f2fd'/><text x='60' y='75' font-size='64' text-anchor='middle'>🦁</text></svg>`
      ),
    answers: {
      fr: [
        { label: "Chat", image: emojiSvg("🐱") },
        { label: "Chien", image: emojiSvg("🐶") },
        { label: "Lion", image: emojiSvg("🦁") },
        { label: "Ours", image: emojiSvg("🐻") },
      ],
      en: [
        { label: "Cat", image: emojiSvg("🐱") },
        { label: "Dog", image: emojiSvg("🐶") },
        { label: "Lion", image: emojiSvg("🦁") },
        { label: "Bear", image: emojiSvg("🐻") },
      ],
    },
    correct: 2,
    timeLimit: 10,
    hint: { fr: "Roi de la savane.", en: "King of the savannah." },
    imageAnswers: true,
  },
];

const BADGE_DEFINITIONS = [
  {
    id: "first-win",
    label: { fr: "Première victoire", en: "First win" },
    description: {
      fr: "Obtenir au moins 1 bonne réponse",
      en: "Get at least 1 correct answer",
    },
    check: (stats) => stats.lifetimeCorrect >= 1,
  },
  {
    id: "perfect-classic",
    label: { fr: "Sans faute", en: "Flawless" },
    description: {
      fr: "Terminer un quiz classique avec 100%",
      en: "Finish a classic quiz with 100%",
    },
    check: (stats) => stats.lastPerfectClassic,
  },
  {
    id: "ten-correct",
    label: { fr: "10 bonnes réponses", en: "10 correct answers" },
    description: {
      fr: "Cumuler 10 bonnes réponses",
      en: "Reach 10 correct answers total",
    },
    check: (stats) => stats.lifetimeCorrect >= 10,
  },
  {
    id: "infinite-runner",
    label: { fr: "Marathon", en: "Marathon" },
    description: {
      fr: "Répondre à 5 questions en mode infini",
      en: "Answer 5 questions in infinite mode",
    },
    check: (stats) => stats.lastInfiniteAnswered >= 5,
  },
];

const GLOBAL_TIME_LIMIT = 60;

let lang = loadFromLocalStorage("lang", "fr");
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;
let globalTimerId = null;
let userAnswers = [];
let playMode = "classic"; // classic | progressive | timed | flashcard | infinite
let unlockedBadges = loadFromLocalStorage("badges", []);
let lifetimeCorrect = loadFromLocalStorage("lifetimeCorrect", 0);
let correctCount = 0;
let wrongCount = 0;
let answerTimes = [];
let currentTimeLeft = 0;
let globalTimeLeft = GLOBAL_TIME_LIMIT;
let answered = false;

const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const resultScreen = getElement("#result-screen");
const bestScoreValue = getElement("#best-score-value");
const bestScoreEnd = getElement("#best-score-end");
const questionText = getElement("#question-text");
const answersDiv = getElement("#answers");
const nextBtn = getElement("#next-btn");
const startBtn = getElement("#start-btn");
const progressiveBtn = getElement("#progressive-btn");
const timedBtn = getElement("#timed-btn");
const flashcardBtn = getElement("#flashcard-btn");
const infiniteBtn = getElement("#infinite-btn");
const stopInfiniteBtn = getElement("#stop-infinite-btn");
const restartBtn = getElement("#restart-btn");
const shareBtn = getElement("#share-btn");
const shareLink = getElement("#share-link");
const hintBtn = getElement("#hint-btn");
const hintText = getElement("#hint-text");
const audioBtn = getElement("#audio-btn");
const revealBtn = getElement("#reveal-btn");
const flashcardAnswer = getElement("#flashcard-answer");
const progressTotal = getElement("#progress-total");
const badgesIntro = getElement("#badges-intro");
const badgesResult = getElement("#badges-result");
const newBadges = getElement("#new-badges");
const scoreText = getElement("#score-text");
const statsText = getElement("#stats-text");
const recapBody = getElement("#recap-body");
const timeLeftSpan = getElement("#time-left");
const timerDiv = getElement("#timer-div");
const globalTimer = getElement("#global-timer");
const globalTimeLeftSpan = getElement("#global-time-left");
const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");
const themeToggle = getElement("#theme-toggle");
const langSelect = getElement("#lang-select");
const themeSelect = getElement("#theme-select");
const questionImageWrap = getElement("#question-image-wrap");
const questionImage = getElement("#question-image");

startBtn.addEventListener("click", () => startQuiz("classic"));
progressiveBtn.addEventListener("click", () => startQuiz("progressive"));
timedBtn.addEventListener("click", () => startQuiz("timed"));
flashcardBtn.addEventListener("click", () => startQuiz("flashcard"));
infiniteBtn.addEventListener("click", () => startQuiz("infinite"));
stopInfiniteBtn.addEventListener("click", endQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);
shareBtn.addEventListener("click", shareScore);
hintBtn.addEventListener("click", showHint);
audioBtn.addEventListener("click", playQuestionAudio);
revealBtn.addEventListener("click", revealFlashcardAnswer);
themeToggle.addEventListener("click", toggleTheme);
langSelect.addEventListener("change", () => {
  lang = langSelect.value;
  saveToLocalStorage("lang", lang);
  applyI18n();
});

langSelect.value = lang;
setText(bestScoreValue, bestScore);
applyTheme(loadFromLocalStorage("theme", "light"));
applyI18n();
renderBadges(badgesIntro, unlockedBadges);

function t(key) {
  return I18N[lang][key];
}

function applyI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (typeof I18N[lang][key] === "string") {
      el.textContent = I18N[lang][key];
    }
  });
  document.querySelectorAll("[data-i18n-option]").forEach((el) => {
    const key = el.getAttribute("data-i18n-option");
    el.textContent = I18N[lang][key];
  });
  const isDark = document.body.classList.contains("dark");
  setText(themeToggle, isDark ? t("light") : t("dark"));
  renderBadges(badgesIntro, unlockedBadges);
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  setText(themeToggle, isDark ? t("light") : t("dark"));
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  saveToLocalStorage("theme", nextTheme);
  applyTheme(nextTheme);
}

function getSelectedThemeQuestions() {
  const theme = themeSelect.value;
  if (theme === "all") return [...QUESTIONS_BANK];
  return QUESTIONS_BANK.filter((q) => q.theme === theme);
}

function localizeQuestion(q) {
  const answersRaw = q.answers[lang] || q.answers.fr;
  return {
    ...q,
    text: q.text[lang] || q.text.fr,
    hint: q.hint ? q.hint[lang] || q.hint.fr : null,
    answers: answersRaw,
  };
}

function startQuiz(mode) {
  playMode = mode;
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  answerTimes = [];
  userAnswers = [];
  globalTimeLeft = GLOBAL_TIME_LIMIT;

  let pool = getSelectedThemeQuestions();
  if (!pool.length) pool = [...QUESTIONS_BANK];

  clearInterval(globalTimerId);
  globalTimer.classList.add("hidden");
  timerDiv.classList.remove("hidden");
  stopInfiniteBtn.classList.add("hidden");
  revealBtn.classList.add("hidden");
  flashcardAnswer.classList.add("hidden");

  if (mode === "infinite") {
    questions = pool.map(localizeQuestion);
    progressTotal.classList.add("hidden");
    stopInfiniteBtn.classList.remove("hidden");
  } else if (mode === "progressive") {
    questions = pool
      .slice()
      .sort((a, b) => a.difficulty - b.difficulty)
      .map(localizeQuestion);
    progressTotal.classList.remove("hidden");
    setText(totalQuestionsSpan, questions.length);
  } else if (mode === "timed") {
    questions = shuffleArray(pool).map(localizeQuestion);
    progressTotal.classList.remove("hidden");
    setText(totalQuestionsSpan, questions.length);
    globalTimer.classList.remove("hidden");
    setText(globalTimeLeftSpan, globalTimeLeft);
    globalTimerId = startTimer(
      GLOBAL_TIME_LIMIT,
      (timeLeft) => {
        globalTimeLeft = timeLeft;
        setText(globalTimeLeftSpan, timeLeft);
      },
      () => {
        endQuiz();
      }
    );
  } else if (mode === "flashcard") {
    questions = shuffleArray(pool).map(localizeQuestion);
    progressTotal.classList.remove("hidden");
    setText(totalQuestionsSpan, questions.length);
    timerDiv.classList.add("hidden");
  } else {
    questions = shuffleArray(pool).map(localizeQuestion);
    progressTotal.classList.remove("hidden");
    setText(totalQuestionsSpan, questions.length);
  }

  showQuestion();
}

function pickInfiniteQuestion() {
  const pool = getSelectedThemeQuestions();
  return localizeQuestion(shuffleArray(pool)[0]);
}

function showQuestion() {
  clearInterval(timerId);
  stopSpeech();
  answered = false;

  if (playMode === "infinite") {
    questions[currentQuestionIndex] = pickInfiniteQuestion();
  }

  const q = questions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  if (q.questionImage) {
    questionImage.src = q.questionImage;
    questionImage.alt = q.text;
    questionImageWrap.classList.remove("hidden");
  } else {
    questionImageWrap.classList.add("hidden");
    questionImage.removeAttribute("src");
  }

  answersDiv.innerHTML = "";
  flashcardAnswer.classList.add("hidden");
  setText(flashcardAnswer, "");

  if (playMode === "flashcard") {
    revealBtn.classList.remove("hidden");
    hintBtn.classList.add("hidden");
    audioBtn.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    return;
  }

  revealBtn.classList.add("hidden");
  q.answers.forEach((answer, index) => {
    const onClick = () => {
      answered = true;
      selectAnswer(index, btn);
    };
    let btn;
    if (q.imageAnswers && answer.image) {
      btn = createImageAnswerButton(answer.image, answer.label, onClick);
    } else {
      const label = typeof answer === "string" ? answer : answer.label;
      btn = createAnswerButton(label, onClick);
    }
    answersDiv.appendChild(btn);
  });

  nextBtn.classList.add("hidden");
  resetHint(q);
  audioBtn.classList.remove("hidden");

  if (playMode === "flashcard") return;

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
        userAnswers.push({
          question: q.text,
          chosen: t("noAnswer"),
          correct: answerLabel(q, q.correct),
        });
      }
      lockAnswers(answersDiv);
      nextBtn.classList.remove("hidden");
      hintBtn.classList.add("hidden");
    }
  );
}

function answerLabel(q, index) {
  const a = q.answers[index];
  return typeof a === "string" ? a : a.label;
}

function resetHint(question) {
  setText(hintText, "");
  hintText.classList.add("hidden");
  hintBtn.disabled = false;
  if (question.hint && playMode !== "flashcard") {
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

function revealFlashcardAnswer() {
  const q = questions[currentQuestionIndex];
  setText(flashcardAnswer, answerLabel(q, q.correct));
  flashcardAnswer.classList.remove("hidden");
  revealBtn.classList.add("hidden");
}

function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function playQuestionAudio() {
  const q = questions[currentQuestionIndex];
  if (!window.speechSynthesis) {
    setText(hintText, t("audioUnsupported"));
    hintText.classList.remove("hidden");
    return;
  }
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(q.text);
  utterance.lang = lang === "en" ? "en-US" : "fr-FR";
  window.speechSynthesis.speak(utterance);
}

function selectAnswer(index, btn) {
  clearInterval(timerId);
  answered = true;

  const q = questions[currentQuestionIndex];
  const timeTaken = q.timeLimit - currentTimeLeft;
  answerTimes.push(timeTaken);
  userAnswers.push({
    question: q.text,
    chosen: answerLabel(q, index),
    correct: answerLabel(q, q.correct),
  });

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
  if (playMode === "infinite") {
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
  clearInterval(globalTimerId);
  stopSpeech();
  hideElement(questionScreen);
  showElement(resultScreen);

  const totalForDisplay =
    playMode === "infinite" || playMode === "timed"
      ? correctCount + wrongCount || questions.length
      : questions.length;

  if (playMode === "flashcard") {
    setText(scoreText, lang === "fr" ? "Entraînement terminé (sans score)." : "Practice finished (no score).");
    setText(statsText, "");
  } else {
    scoreText.textContent = `${t("scoreLabel")} : ${score} / ${totalForDisplay || score}`;
    const avgTime =
      answerTimes.length > 0
        ? (answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length).toFixed(1)
        : 0;
    setText(statsText, t("stats")(correctCount, wrongCount, avgTime));
  }

  shareLink.classList.add("hidden");
  setText(shareLink, "");
  newBadges.classList.add("hidden");
  setText(newBadges, "");

  recapBody.innerHTML = "";
  userAnswers.forEach((entry) => {
    const row = document.createElement("tr");
    [entry.question, entry.chosen, entry.correct].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    recapBody.appendChild(row);
  });

  if (playMode !== "flashcard" && playMode !== "infinite" && score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);

  saveToLocalStorage("lifetimeCorrect", lifetimeCorrect);
  const freshlyUnlocked = unlockBadges({
    lifetimeCorrect,
    lastPerfectClassic:
      playMode === "classic" &&
      questions.length > 0 &&
      score === questions.length,
    lastInfiniteAnswered:
      playMode === "infinite" ? correctCount + wrongCount : 0,
  });

  renderBadges(badgesResult, unlockedBadges);
  if (freshlyUnlocked.length > 0) {
    setText(
      newBadges,
      t("newBadges")(freshlyUnlocked.map((b) => b.label[lang] || b.label.fr).join(", "))
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
  if (newlyUnlocked.length > 0) saveToLocalStorage("badges", unlockedBadges);
  return newlyUnlocked;
}

function renderBadges(container, badgeIds) {
  if (!container) return;
  if (!badgeIds.length) {
    container.innerHTML = `<p class="badges-empty">${t("noBadges")}</p>`;
    return;
  }
  container.innerHTML = badgeIds
    .map((id) => {
      const badge = BADGE_DEFINITIONS.find((item) => item.id === id);
      if (!badge) return "";
      const label = badge.label[lang] || badge.label.fr;
      const description = badge.description[lang] || badge.description.fr;
      return `<span class="badge" title="${description}">${label}</span>`;
    })
    .join("");
}

function buildShareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("score", String(score));
  url.searchParams.set(
    "total",
    String(
      playMode === "infinite" ? correctCount + wrongCount : questions.length
    )
  );
  return url.toString();
}

function shareScore() {
  const total =
    playMode === "infinite" ? correctCount + wrongCount : questions.length;
  const shareUrl = buildShareUrl();
  const shareText = t("shareText")(score, total);
  setText(shareLink, shareUrl);
  shareLink.classList.remove("hidden");
  if (navigator.share) {
    navigator.share({ title: t("title"), text: shareText, url: shareUrl }).catch(() => {});
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
  applyI18n();
}
