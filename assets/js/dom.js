// dom.js
export const getElement = (selector) => document.querySelector(selector);
export const showElement = (element) => (element.style.display = "block");
export const hideElement = (element) => (element.style.display = "none");
export const setText = (element, text) => (element.textContent = text);

export const createAnswerButton = (text, onClick) => {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
};

export const createImageAnswerButton = (imageSrc, label, onClick) => {
  const btn = document.createElement("button");
  btn.className = "image-answer";
  btn.setAttribute("aria-label", label);
  const img = document.createElement("img");
  img.src = imageSrc;
  img.alt = label;
  const span = document.createElement("span");
  span.textContent = label;
  btn.appendChild(img);
  btn.appendChild(span);
  btn.addEventListener("click", onClick);
  return btn;
};

export const updateScoreDisplay = (scoreElement, score, total) => {
  scoreElement.textContent = `Votre score : ${score} / ${total}`;
};

export const lockAnswers = (container) => {
  const buttons = container.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));
};

export const markCorrectAnswer = (container, correctIndex) => {
  const buttons = container.querySelectorAll("button");
  if (buttons[correctIndex]) {
    buttons[correctIndex].classList.add("correct");
  }
};
