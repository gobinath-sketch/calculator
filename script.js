class Calculator {
    constructor() {
        this.previousOperandElement = document.querySelector('.previous-operand');
        this.currentOperandElement = document.querySelector('.current-operand');
        this.clear();
        this.history = [];
        this.setupHistoryPanel();
        this.setupKeyboardSupport();
    }

    setupHistoryPanel() {
        this.historyPanel = document.querySelector('.history-panel');
        this.historyList = document.querySelector('.history-list');
        this.historyBtn = document.querySelector('.history-btn');
        this.clearHistoryBtn = document.querySelector('.clear-history');

        this.historyBtn.addEventListener('click', () => {
            this.historyPanel.classList.toggle('active');
        });

        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });

        // Close history panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.historyPanel.contains(e.target) && 
                !this.historyBtn.contains(e.target) && 
                this.historyPanel.classList.contains('active')) {
                this.historyPanel.classList.remove('active');
            }
        });
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        this.showError('History cleared');
    }

    addToHistory(expression, result) {
        this.history.unshift({
            expression,
            result,
            timestamp: new Date()
        });
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${item.result}</div>
            `;
            historyItem.addEventListener('click', () => {
                this.currentOperand = item.result;
                this.updateDisplay();
                this.historyPanel.classList.remove('active');
            });
            this.historyList.appendChild(historyItem);
        });
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand.toString() + number;
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = (prev * current) / 100;
                break;
            default:
                return;
        }

        const expression = `${prev} ${this.operation} ${current}`;
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
        this.addToHistory(expression, this.currentOperand);
    }

    specialFunction(func) {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;

        let result;
        let expression;

        switch (func) {
            case 'sin':
                result = Math.sin(current * Math.PI / 180);
                expression = `sin(${current}°)`;
                break;
            case 'cos':
                result = Math.cos(current * Math.PI / 180);
                expression = `cos(${current}°)`;
                break;
            case 'tan':
                result = Math.tan(current * Math.PI / 180);
                expression = `tan(${current}°)`;
                break;
            case '√':
                if (current < 0) {
                    this.showError('Cannot calculate square root of negative number');
                    return;
                }
                result = Math.sqrt(current);
                expression = `√${current}`;
                break;
            case 'ln':
                if (current <= 0) {
                    this.showError('Cannot calculate natural logarithm of non-positive number');
                    return;
                }
                result = Math.log(current);
                expression = `ln(${current})`;
                break;
            case 'log':
                if (current <= 0) {
                    this.showError('Cannot calculate logarithm of non-positive number');
                    return;
                }
                result = Math.log10(current);
                expression = `log(${current})`;
                break;
            case 'x²':
                result = current * current;
                expression = `${current}²`;
                break;
            case 'x³':
                result = current * current * current;
                expression = `${current}³`;
                break;
            case '1/x':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = 1 / current;
                expression = `1/${current}`;
                break;
            case '±':
                result = -current;
                expression = `-${current}`;
                break;
            case 'π':
                result = Math.PI;
                expression = 'π';
                break;
            case 'e':
                result = Math.E;
                expression = 'e';
                break;
            default:
                return;
        }

        this.currentOperand = result.toString();
        this.updateDisplay();
        this.addToHistory(expression, this.currentOperand);
    }

    appendParenthesis(parenthesis) {
        this.currentOperand = this.currentOperand.toString() + parenthesis;
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.textContent = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.className = 'ripple';

        button.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    setupKeyboardSupport() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            
            if (key >= '0' && key <= '9' || key === '.') {
                this.appendNumber(key);
            } else if (key === '+' || key === '-' || key === '*' || key === '/') {
                const operationMap = {
                    '*': '×',
                    '/': '÷'
                };
                this.chooseOperation(operationMap[key] || key);
            } else if (key === 'Enter' || key === '=') {
                this.compute();
            } else if (key === 'Backspace') {
                this.delete();
            } else if (key === 'Escape') {
                this.clear();
            } else if (key === '^') {
                this.chooseOperation('^');
            } else if (key === '(' || key === ')') {
                this.appendParenthesis(key);
            } else if (key === 'p' || key === 'P') {
                this.specialFunction('π');
            } else if (key === 'e' || key === 'E') {
                this.specialFunction('e');
            } else if (key === 's' || key === 'S') {
                this.specialFunction('sin');
            } else if (key === 'c' || key === 'C') {
                this.specialFunction('cos');
            } else if (key === 't' || key === 'T') {
                this.specialFunction('tan');
            } else if (key === 'l' || key === 'L') {
                this.specialFunction('log');
            } else if (key === 'n' || key === 'N') {
                this.specialFunction('ln');
            } else if (key === 'r' || key === 'R') {
                this.specialFunction('√');
            } else if (key === '%') {
                this.chooseOperation('%');
            } else if (key === 'm' || key === 'M') {
                this.specialFunction('±');
            } else if (key === 'i' || key === 'I') {
                this.specialFunction('1/x');
            } else if (key === 'h' || key === 'H') {
                this.historyPanel.classList.toggle('active');
            }

            this.updateDisplay();
        });
    }
}

const calculator = new Calculator();

// Add ripple effect to all buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', calculator.createRipple.bind(calculator));
});

// Add touch event handling to all buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double-firing of events
        calculator.createRipple.bind(calculator)(e);
    }, { passive: false });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        const buttonText = button.innerText;
        
        if (button.classList.contains('number')) {
            calculator.appendNumber(buttonText);
        } else if (button.classList.contains('operator')) {
            calculator.chooseOperation(buttonText);
        } else if (button.classList.contains('function')) {
            if (['(', ')'].includes(buttonText)) {
                calculator.appendParenthesis(buttonText);
            } else if (!['History'].includes(buttonText)) {
                calculator.specialFunction(buttonText);
            }
        } else if (button.classList.contains('clear')) {
            calculator.clear();
        } else if (button.classList.contains('delete')) {
            calculator.delete();
        } else if (button.classList.contains('equals')) {
            calculator.compute();
        }
        
        calculator.updateDisplay();
    }, { passive: false });
});

// Prevent double-tap zoom on mobile
document.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.target.click();
}, { passive: false });

// Number buttons
document.querySelectorAll('.number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

// Operator buttons
document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

// Function buttons
document.querySelectorAll('.function').forEach(button => {
    button.addEventListener('click', () => {
        if (['(', ')'].includes(button.innerText)) {
            calculator.appendParenthesis(button.innerText);
        } else {
            calculator.specialFunction(button.innerText);
        }
        calculator.updateDisplay();
    });
});

// Clear button
document.querySelector('.clear').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Delete button
document.querySelector('.delete').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Equals button
document.querySelector('.equals').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
}); 