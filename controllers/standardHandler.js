import { calc } from './Calculator.js';
import { updateDisplay, addToHistory, calculate, formatResult } from './utilities.js';

// Standard button handlers
export function handleDigit(digit) {

    const last = calc.expression.slice(-1);

    if (calc.display === 'Error' || calc.display === 'Cannot divide by zero') {
        handleClear();
    }

    if (calc.shouldReset && !calc.waitingForSecond) {

        if (last === '(') {
            calc.display = digit;
            calc.shouldReset = false;
        } else {
            calc.display = digit;
            calc.expression = digit;
            calc.shouldReset = false;
            updateDisplay();
            return;
        }
    }

    if (last === ')') {
        calc.expression += '*';
        calc.display = digit;
        calc.waitingForSecond = false;
        calc.shouldReset = false;
    }

    else if (calc.waitingForSecond || last === '(') {
        calc.display = digit;
        calc.waitingForSecond = false;
        calc.shouldReset = false;
    }

    else if (calc.display === '0') {
        if (digit === '0') return;
        calc.display = digit;
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

        if (!calc.expression) return;

        if (calc.shouldReset && calc.lastOperator) {

            const replayExpr =
                `${calc.display} ${getSymbol(calc.lastOperator)} ${calc.lastSecondOperand}`;

            const expr = replayExpr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/mod/g, '%');

            let result;

            try {
                result = Function('"use strict";return (' + expr + ')')();

                if (!isFinite(result)) {
                    result = 'Cannot divide by zero';
                }

            } catch {
                result = 'Error';
            }

            addToHistory(`${replayExpr} =`, formatResult(result));

            calc.display = formatResult(result);
            calc.expression = calc.display;

            updateDisplay();
            return;
        }


        let balancedExpr = calc.expression;

        const openCount  = (balancedExpr.match(/\(/g) || []).length;
        const closeCount = (balancedExpr.match(/\)/g) || []).length;

        if (closeCount > openCount) {
            calc.display = 'Error';
            updateDisplay();
            return;
        }

        for (let i = 0; i < openCount - closeCount; i++) {
            balancedExpr += ')';
        }


        let expr = balancedExpr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/mod/g, '%')

            .replace(/([\d.]+)\s+logY\s+([\d.]+)/g, (m, base, x) => {
                const b = parseFloat(base), xv = parseFloat(x);
                if (b <= 0 || b === 1 || xv <= 0) return 'NaN';
                return `(Math.log(${x})/Math.log(${base}))`;
            })

            .replace(/([\d.]+)\s+EXP_OP\s+(-?[\d.]+)/g,
                (m, base, exp) => `(${base} * Math.pow(10, ${exp}))`)

            .replace(/\(\s*-\s*([\d.]+)\s*\)\s*\^\s*(-?[\d.]+)/g,
                (m, base, exp) => `Math.pow(-${base},${exp})`)
            .replace(/(-?[\d.]+)\s*\^\s*(-?[\d.]+)/g,
                (m, base, exp) => `Math.pow(${base},${exp})`)

            .replace(/abs\(/g, 'Math.abs(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/∛\(/g, 'Math.cbrt(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/sqr\((.*?)\)/g, 'Math.pow($1,2)')
            .replace(/cube\((.*?)\)/g, 'Math.pow($1,3)')
            .replace(/10\^\(/g, 'Math.pow(10,')
            .replace(/2\^\(/g, 'Math.pow(2,')
            .replace(/e\^\(/g, 'Math.exp(')
            .replace(/n!\((.*?)\)/g, 'factorial($1)')
            .replace(/sin⁻¹\(/g, 'Math.asin(')
            .replace(/cos⁻¹\(/g, 'Math.acos(')
            .replace(/tan⁻¹\(/g, 'Math.atan(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/sinh\(/g, 'Math.sinh(')
            .replace(/cosh\(/g, 'Math.cosh(')
            .replace(/tanh\(/g, 'Math.tanh(');


        let result;

        try {
            result = Function('"use strict";return (' + expr + ')')();

            if (!isFinite(result)) {
                result = 'Cannot divide by zero';
            }

        } catch {
            result = 'Error';
        }

        addToHistory(`${balancedExpr} =`, formatResult(result));

        if (calc.operator && calc.waitingForSecond === false) {
            calc.lastOperator = calc.operator;
            calc.lastSecondOperand = calc.display;
        }

        calc.display = formatResult(result);
        calc.expression = calc.display;

        calc.firstOperand = null;
        calc.operator = null;
        calc.waitingForSecond = false;
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
    calc.lastSecondOperand = null;
    calc.operator = null;
    calc.waitingForSecond = false;
    calc.shouldReset = false;
    calc.parenCount = 0;
    updateDisplay();
}

export function handleCE() {
    calc.display = '0';
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

    const isNeg = calc.display.startsWith('-');
    calc.display = isNeg ? calc.display.slice(1) : '-' + calc.display;

    const numRegex = /\(?-?([\d.]+)\)?$/;
    const exprMatch = calc.expression.match(numRegex);
    if (exprMatch) {
        const num = exprMatch[1];
        const replacement = isNeg ? num : `(-${num})`;
        calc.expression = calc.expression.slice(0, calc.expression.length - exprMatch[0].length) + replacement;
    }

    updateDisplay();
}

export function handlePercent() {
    const val = parseFloat(calc.display);

    let newDisplay;

    if (calc.firstOperand !== null && calc.operator) {
        const a = parseFloat(calc.firstOperand);
        switch (calc.operator) {
            case 'add':
            case 'subtract':
                newDisplay = formatResult(a * val / 100);
                break;
            case 'multiply':
            case 'divide':
                newDisplay = formatResult(val / 100);
                break;
            default:
                newDisplay = formatResult(val / 100);
        }

        const opSymbols = {
            add: '+', subtract: '-', multiply: '×', divide: '÷',
            power: '^', nthRoot: 'ʸ√', mod: 'mod', logY: 'logY', EXP_OP: 'EXP_OP'
        };
        const sym = opSymbols[calc.operator] || calc.operator;
        calc.expression = `${calc.firstOperand} ${sym} ${newDisplay}`;
    } else {
        newDisplay = formatResult(val / 100);
        calc.expression = newDisplay;
    }

    calc.display = newDisplay;
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

    if (
        calc.display === 'Error' ||
        calc.display === 'Cannot divide by zero'
    ) {
        return;
    }

    const opSymbols = {
        add: '+',
        subtract: '-',
        multiply: '×',
        divide: '÷',
        power: '^',
        nthRoot: 'ʸ√',
        mod: 'mod',
        logY: 'logY',
        EXP_OP: 'EXP_OP'
    };

    const sym = opSymbols[op] || op;

    const trimmed = calc.expression.trim();
    const lastChar = trimmed.slice(-1);
    const operatorChars = ['+', '-', '×', '÷', '^'];

    if (op === 'subtract') {

        if (trimmed === '' || lastChar === '(') {
            calc.expression += '-';
            calc.display = '-';
            calc.shouldReset = false;
            updateDisplay();
            return;
        }
    }

    if (trimmed === '') return;

    if (operatorChars.includes(lastChar)) {

        if (lastChar === '-' && trimmed.length === 1) return;

        calc.expression =
            trimmed.slice(0, -1) + sym + ' ';

        calc.operator = op;
        updateDisplay();
        return;
    }

    if (
        calc.operator &&
        calc.firstOperand !== null &&
        !calc.waitingForSecond
    ) {

        if (
            calc.display === '' ||
            calc.display === '-' ||
            isNaN(parseFloat(calc.display))
        ) {
            return;
        }

        const result = calculate(
            calc.firstOperand,
            calc.operator,
            calc.display
        );

        if (!isFinite(result)) {
            calc.display = 'Error';
            calc.expression = '';
            calc.firstOperand = null;
            calc.operator = null;
            calc.waitingForSecond = false;
            calc.shouldReset = true;
            updateDisplay();
            return;
        }

        calc.display = formatResult(result);
        calc.firstOperand = calc.display;
    }

    calc.operator = op;
    calc.waitingForSecond = true;
    calc.shouldReset = true;

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
        add: '+', subtract: '-', multiply: '×', divide: '÷',
        power: '^', nthRoot: 'ʸ√', mod: 'mod', logY: 'logY', EXP_OP: 'EXP_OP'
    };
    return opSymbols[op] || op;
}