import { calc } from './Calculator.js';
import { updateDisplay,addToHistory,calculate, formatResult } from './utilities.js';

// Standard button handlers
export function handleDigit(digit) {
    const last = calc.expression.slice(-1);

    if (last === ')') {
        calc.expression += '*';

        calc.firstOperand = null;
        calc.operator = null;
        calc.waitingForSecond = false;

        calc.display = digit;
        calc.shouldReset = false;
    }

    else if (
        calc.shouldReset ||
        calc.display === '0' ||
        last === '(' ||
        calc.waitingForSecond
    ) {
        calc.display = digit;
        calc.shouldReset = false;
        calc.waitingForSecond = false;
    }

    else {
        if (calc.display.length >= 16) return;
        calc.display += digit;
    }

    calc.expression += digit;

    updateDisplay();
}


export function handleEquals() {
    try {

        if (calc.shouldReset && calc.lastOperator) {

            const replayExpr =
                `${calc.display} ${getSymbol(calc.lastOperator)} ${calc.lastSecondOperand}`;

            const expr = replayExpr
                .replace(/×/g,'*')
                .replace(/÷/g,'/')
                .replace(/mod/g,'%');

            const result = Function('"use strict";return ('+expr+')')();

            addToHistory(`${replayExpr} =`, formatResult(result));

            calc.display = formatResult(result);
            calc.expression = replayExpr;

            updateDisplay();
            return;
        }

        while (calc.parenCount > 0) {
            calc.expression += ')';
            calc.parenCount--;
        }

        let expr = calc.expression
            .replace(/×/g,'*')
            .replace(/÷/g,'/')
            .replace(/−/g,'-')
            .replace(/mod/g,'%')

            // unary conversions
            .replace(/abs\(/g,'Math.abs(')
            .replace(/√\(/g,'Math.sqrt(')
            .replace(/∛\(/g,'Math.cbrt(')
            .replace(/ln\(/g,'Math.log(')
            .replace(/log\(/g,'Math.log10(')
            .replace(/sqr\((.*?)\)/g,'Math.pow($1,2)')
            .replace(/cube\((.*?)\)/g,'Math.pow($1,3)')
            .replace(/10\^\(/g,'Math.pow(10,')
            .replace(/2\^\(/g,'Math.pow(2,')
            .replace(/e\^\(/g,'Math.exp(')
            .replace(/n!\((.*?)\)/g,'factorial($1)')
            .replace(/sin⁻¹\(/g,'asin(')
            .replace(/cos⁻¹\(/g,'acos(')
            .replace(/tan⁻¹\(/g,'atan(')
            .replace(/sin\(/g,'sin(')
            .replace(/cos\(/g,'cos(')
            .replace(/tan\(/g,'tan(')
            .replace(/sinh\(/g,'sinh(')
            .replace(/cosh\(/g,'cosh(')
            .replace(/tanh\(/g,'tanh(');

        const result = Function('"use strict";return ('+expr+')')();

        addToHistory(`${calc.expression} =`, formatResult(result));

        if (calc.operator) {
            calc.lastOperator = calc.operator;
        }

        calc.display = formatResult(result);
        calc.expression = calc.display;
        calc.shouldReset = true;

    } catch {
        calc.display = 'Error';
    }

    updateDisplay();
}

export function handleClear() {
    calc.display = '0';
    calc.expression = '';
    calc.firstOperand = null;
    calc.operator = null;
    calc.waitingForSecond = false;
    calc.shouldReset = false;
    calc.parenCount = 0;
    updateDisplay();
}

export function handleCE() {
    calc.display     = '0';
    calc.shouldReset = false;
    updateDisplay();
}

export function handleBackspace() {
    if (calc.shouldReset) return;

    if (calc.expression.length === 0) return;

    const lastChar = calc.expression.slice(-1);

    if (lastChar === '(') calc.parenCount = Math.max(0, calc.parenCount - 1);
    if (lastChar === ')') calc.parenCount++;

    calc.expression = calc.expression.slice(0, -1);

    if (!isNaN(lastChar) || lastChar === '.') {
        if (calc.display.length === 1 || (calc.display.length === 2 && calc.display[0] === '-')) {
            calc.display = '0';
        } else {
            calc.display = calc.display.slice(0, -1);
        }
    }

    updateDisplay();
}
export function handleNegate() {
    if (calc.display === '0') return;
    calc.display = calc.display.startsWith('-') ? calc.display.slice(1) : '-' + calc.display;
    updateDisplay();
}

export function handlePercent() {
    const val = parseFloat(calc.display);
    if (calc.firstOperand !== null) {
        calc.display = formatResult(parseFloat(calc.firstOperand) * val / 100);
    } else {
        calc.display = formatResult(val / 100);
    }
    calc.shouldReset = true;
    updateDisplay();
}

export function handleDecimal() {

    const last = calc.expression.slice(-1);

    if (last === ')') {
        calc.expression += '*0.';
        calc.display = '0.';
        calc.shouldReset = false;
    }

    else if (calc.shouldReset) {
        calc.display = '0.';
        calc.shouldReset = false;
        calc.expression += '0.';
    }

    else if (!calc.display.includes('.')) {
        calc.display += '.';
        calc.expression += '.';
    }

    updateDisplay();
}

export function handleOperator(op) {

    if (calc.operator && !calc.waitingForSecond) {
        const result = calculate(calc.firstOperand, calc.operator, calc.display);
        calc.display = formatResult(result);
    }

    calc.firstOperand = calc.display;
    calc.lastSecondOperand = calc.display;

    calc.operator = op;
    calc.waitingForSecond = true;
    calc.shouldReset = true;

    const opSymbols = {
        add:'+',
        subtract:'-',
        multiply:'×',
        divide:'÷',
        power:'^',
        nthRoot:'ʸ√',
        mod:'mod',
        logY:'logY'
    };

    const sym = opSymbols[op] || op;

    calc.expression += ` ${sym} `;

    updateDisplay();
}
export function handleUnary(fn, label) {

    const val = parseFloat(calc.display);
    const result = fn(val);

    if (result === 'Error' || isNaN(result)) {
        calc.display = 'Error';
        updateDisplay();
        return;
    }

    const numberRegex = /(-?\d+\.?\d*)$/;
    calc.expression = calc.expression.replace(numberRegex, '');

    const lastChar = calc.expression.slice(-1);
    if (lastChar === ')' || /\d/.test(lastChar)) {
        calc.expression += '*';
    }

    if (label.endsWith('(')) {
        calc.expression += `${label}${calc.display})`;
    } else {
        calc.expression += `${label}(${calc.display})`;
    }

    calc.display = formatResult(result);
    calc.shouldReset = true;

    updateDisplay();
}

function getSymbol(op) {
    const opSymbols = {
        add:'+',
        subtract:'-',
        multiply:'×',
        divide:'÷',
        power:'^',
        nthRoot:'ʸ√',
        mod:'mod',
        logY:'logY'
    };
    return opSymbols[op] || op;
}