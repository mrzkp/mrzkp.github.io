class MathQuiz {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      position: options.position || "fixed-right",
      width: options.width || "250px",
      ...options,
    };

    this.currentAnswer = 0;
    this.container = null;
    this.equationElement = null;
    this.answerInput = null;
    this.feedbackElement = null;

    this.init();
  }

  init() {
    this.createContainer();
    this.createElements();
    this.applyStyles();
    this.generateNewEquation();
    this.setupEventListeners();
  }

  createContainer() {
    const existingContainer = document.getElementById(this.containerId);
    if (existingContainer) {
      existingContainer.remove();
    }

    this.container = document.createElement("div");
    this.container.id = this.containerId;
    this.container.className = "math-quiz";
    document.body.appendChild(this.container);
  }

  createElements() {
    this.container.innerHTML = `
            <div class="quiz-row">
                <div class="equation" id="${this.containerId}-equation"></div>
                <input type="number" class="math-input" id="${this.containerId}-answer" placeholder="" tabindex="1" />
            </div>
        `;

    this.equationElement = document.getElementById(
      `${this.containerId}-equation`,
    );
    this.answerInput = document.getElementById(`${this.containerId}-answer`);
  }

  applyStyles() {
    let styleElement = document.getElementById("math-quiz-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "math-quiz-styles";
      document.head.appendChild(styleElement);
    }

    const styles = `
            .math-quiz {
                ${
                  this.options.position === "fixed-right"
                    ? `
                    position: fixed;
                    right: 20px;
                    top: 20px;
                `
                    : ""
                }
                width: auto;
                min-width: 180px;
                background-color: transparent;
                padding: 12px;
                font-family: "Alliance No.2", Consolas, monospace;
                font-size: 14px;
                color: #333333;
                z-index: 1000;
            }
           
            .math-quiz .quiz-row {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
            }
           
            .math-quiz .equation {
                font-size: 16px;
                color: #333333;
                white-space: nowrap;
                text-align: right;
            }
           
            .math-quiz .math-input {
                width: 50px;
                height: 24px;
                padding: 2px 4px;
                font-size: 14px;
                text-align: center;
                border: 1px solid #ccc;
                background-color: #ffffff;
                font-family: "Alliance No.2", Consolas, monospace;
                color: #333333;
                -moz-appearance: textfield;
            }
           
            .math-quiz .math-input::-webkit-outer-spin-button,
            .math-quiz .math-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
           
            .math-quiz .math-input:focus {
                border-color: #4a90e2;
                outline: none;
            }
           
           
            @media (max-width: 1024px) {
                .math-quiz {
                    position: static !important;
                    transform: none !important;
                    width: auto !important;
                    margin: 20px auto;
                    max-width: 200px;
                }
            }
        `;

    styleElement.textContent = styles;
  }

  generateNewEquation() {
    const operations = ["+", "-", "*", "/"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, answer;

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        answer = num1 + num2;
        break;

      case "-":
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
        answer = num1 - num2;
        break;

      case "*":
        num1 = Math.floor(Math.random() * 11) + 2; // 2-12
        num2 = Math.floor(Math.random() * 99) + 1; // 1-100
        answer = num1 * num2;
        break;

      case "/":
        answer = Math.floor(Math.random() * 99) + 1; // 1-100
        num2 = Math.floor(Math.random() * 11) + 2; // 2-12
        num1 = answer * num2;
        break;
    }

    this.currentAnswer = answer;
    this.equationElement.textContent = `${num1} ${operation} ${num2} =`;
    this.answerInput.value = "";
  }

  checkAnswer() {
    const userAnswer = parseInt(this.answerInput.value);

    if (isNaN(userAnswer)) {
      return;
    }

    if (userAnswer === this.currentAnswer) {
      this.generateNewEquation();
    }
  }

  setupEventListeners() {
    this.answerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.checkAnswer();
      }
    });

    this.answerInput.addEventListener("input", () => {
      if (this.answerInput.value !== "") {
        this.checkAnswer();
      }
    });
  }

  destroy() {
    if (this.container) {
      this.container.remove();
    }
    const styleElement = document.getElementById("math-quiz-styles");
    if (styleElement) {
      styleElement.remove();
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = "none";
    }
  }

  show() {
    if (this.container) {
      this.container.style.display = "block";
    }
  }

  newQuestion() {
    this.generateNewEquation();
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = MathQuiz;
}
