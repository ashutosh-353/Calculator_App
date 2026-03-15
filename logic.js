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
    this.isIntegrating = false;
    this.integrationStep = 0; // 0: inactive, 1: lower bound(a), 2: upper bound(b), 3: intervals(n), 4: expr(fx)
    this.integrationParams = { a: 0, b: 0, n: 0, fx: "" };
    this.updateDisplay();
  }

  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    this.updateDisplay();
  }

  appendNumber(number) {
    if (number === "." && this.currentOperand.includes(".") && !this.isIntegrating) {
      const chunks = this.currentOperand.split(/[\+\-\*\/\^\(\)]/);
      if (chunks[chunks.length - 1].includes(".")) return;
    }
    this.currentOperand = this.currentOperand.toString() + number.toString();
    this.updateDisplay();
  }

  startIntegration() {
    if (this.isIntegrating) return;
    this.isIntegrating = true;
    this.integrationStep = 1;
    this.currentOperand = "";
    this.previousOperand = "Enter the expression for f(x)";
    this.operation = undefined;
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentOperand === "" && !this.isIntegrating && operation !== "-" && operation !== "(") return;

    this.currentOperand = this.currentOperand.toString() + operation.toString();
    this.updateDisplay();
  }

  compute() {
    if (this.isIntegrating) {
      this.handleIntegrationStep();
      return;
    }

    if (this.currentOperand === "") return;

    try {
      // Evaluate full geometric string. Handle power operators.
      let expression = this.currentOperand.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
      let computation = new Function(`'use strict'; return (${expression})`)();

      if (isNaN(computation) || !isFinite(computation)) {
        this.showError();
        return;
      }

      // Fix floating point precision issues
      computation = Math.round((computation + Number.EPSILON) * 100000000000000) / 100000000000000;

      this.previousOperand = this.currentOperand + " =";
      this.currentOperand = computation.toString();
      this.operation = undefined;
    } catch (e) {
      this.showError();
    }
    this.updateDisplay();
  }

  handleIntegrationStep() {
    switch (this.integrationStep) {
      case 1:
        this.integrationParams.fx = this.currentOperand;
        this.integrationStep = 2;
        this.currentOperand = "";
        this.previousOperand = "Enter the lower limit 'a'";
        break;
      case 2:
        this.integrationParams.a = parseFloat(this.currentOperand);
        if (isNaN(this.integrationParams.a)) { this.showError(); return; }
        this.integrationStep = 3;
        this.currentOperand = "";
        this.previousOperand = "Enter the upper limit 'b'";
        break;
      case 3:
        this.integrationParams.b = parseFloat(this.currentOperand);
        if (isNaN(this.integrationParams.b)) { this.showError(); return; }
        // Hardcode intervals to 20 and skip prompting
        this.integrationParams.n = 20;
        this.executeIntegration();
        break;
    }
    this.updateDisplay();
  }

  executeIntegration() {
    try {
      let { a, b, n, fx } = this.integrationParams;

      // Clean up multiplication signs and power operators for JS evaluation
      fx = fx.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');

      const h = (b - a) / n;
      let x_0 = a;

      const functionalValue = (valX) => {
        // Replace 'x' with the numerical value (valX), handling basic algebraic notation
        let finalExp = fx.replace(/x/g, `(${valX})`);

        // Evaluating the function
        return new Function(`'use strict'; return (${finalExp})`)();
      };

      let arr = new Array(n + 1);
      arr[0] = functionalValue(x_0);

      for (let i = 1; i <= n; i++) {
        x_0 = x_0 + h;
        arr[i] = functionalValue(x_0);
      }

      let calcValue = 0;
      for (let i = 0; i < n - 1; i++) {
        calcValue = calcValue + arr[i + 1];
      }

      let fValue = h * (((arr[0] + arr[n]) / 2) + calcValue);

      // Reset integration state and show results
      this.currentOperand = Math.round((fValue + Number.EPSILON) * 100000000000000) / 100000000000000;
      this.isIntegrating = false;
      this.integrationStep = 0;
      this.previousOperand = `Final answer for ∫(${a}, ${b}) ${this.integrationParams.fx}:`;
    } catch (e) {
      this.showError();
    }
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
      this.currentOperandElement.innerText = this.currentOperand;
    }

    this.previousOperandElement.innerText = this.previousOperand;
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

  if ((key >= "0" && key <= "9") || key === "." || key === "x" || key === "(" || key === ")") {
    calculator.appendNumber(key);
  } else if (key === "+") {
    calculator.chooseOperation("+");
  } else if (key === "-") {
    calculator.chooseOperation("-");
  } else if (key === "*") {
    calculator.chooseOperation("*");
  } else if (key === "/") {
    event.preventDefault();
    calculator.chooseOperation("/");
  } else if (key === "^") {
    calculator.chooseOperation("^");
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
