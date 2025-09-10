class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  clear() {
    this.currentOperand = "";
    this.previousOperand = "";
    this.operation = undefined;
    this.updateDisplay();
  }

  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    this.updateDisplay();
  }

  appendNumber(number) {
    if (number === "." && this.currentOperand.includes(".")) return;
    this.currentOperand = this.currentOperand.toString() + number.toString();
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentOperand === "") return;
    if (this.previousOperand !== "") {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = "";
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case "+":
        computation = prev + current;
        break;
      case "-":
        computation = prev - current;
        break;
      case "×":
        computation = prev * current;
        break;
      case "÷":
        if (current === 0) {
          this.showError();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Fix floating point precision issues
    computation =
      Math.round((computation + Number.EPSILON) * 100000000000000) /
      100000000000000;

    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = "";
    this.updateDisplay();
  }

  showError() {
    this.currentOperand = "Error";
    this.operation = undefined;
    this.previousOperand = "";
    this.updateDisplay();

    // Add error animation
    const calculator = document.querySelector(".calculator");
    calculator.classList.add("error");
    setTimeout(() => {
      calculator.classList.remove("error");
      this.clear();
    }, 1000);
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;

    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0,
      });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    if (this.currentOperand === "") {
      this.currentOperandElement.innerText = "0";
    } else {
      this.currentOperandElement.innerText = this.getDisplayNumber(
        this.currentOperand
      );
    }

    if (this.operation != null) {
      this.previousOperandElement.innerText = `${this.getDisplayNumber(
        this.previousOperand
      )} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = "";
    }
  }
}

const previousOperandElement = document.getElementById("previous-operand");
const currentOperandElement = document.getElementById("current-operand");
const calculator = new Calculator(
  previousOperandElement,
  currentOperandElement
);

// Keyboard support
document.addEventListener("keydown", function (event) {
  const key = event.key;

  if ((key >= "0" && key <= "9") || key === ".") {
    calculator.appendNumber(key);
  } else if (key === "+") {
    calculator.chooseOperation("+");
  } else if (key === "-") {
    calculator.chooseOperation("-");
  } else if (key === "*") {
    calculator.chooseOperation("×");
  } else if (key === "/") {
    event.preventDefault();
    calculator.chooseOperation("÷");
  } else if (key === "Enter" || key === "=") {
    calculator.compute();
  } else if (key === "Escape") {
    calculator.clear();
  } else if (key === "Backspace") {
    calculator.delete();
  }
});

// Add click sound effect (optional)
document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", function () {
    // Create a subtle click sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  });
});
