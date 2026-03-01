import {
    handleDigit, handleEquals, handleClear, handleCE, handleBackspace, handleNegate,
    handlePercent, handleDecimal, handleOperator, handleUnary
} from './standardHandler.js';
import { memoryClear, memoryRecall, memoryAdd, memorySub, memoryStore, updateMemoryButtons } from './memory.js';
import { insertConstant, handleCloseParen, handleOpenParen, toggleSecond, factorial, handleTrig, handleAbs, toDegrees, toRadians } from './sciHandler.js';
import { renderButtons, formatResult, updateDisplay } from './utilities.js';
import { calc } from './Calculator.js';

// BUTTON HANDLER
export function handleButtonClick(action) {

    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const operators = ['add', 'subtract', 'multiply', 'divide', 'power', 'nthRoot', 'mod', 'logY', 'EXP_OP'];

    if (action === 'subtract' && calc.operator === 'EXP_OP' && calc.waitingForSecond) {
        if (calc.expression.endsWith(' EXP_OP ')) {
            calc.expression += '-';
            calc.display = '-';
        } else if (calc.expression.endsWith(' EXP_OP -')) {
            calc.expression = calc.expression.slice(0, -1);
            calc.display = '0';
        }
        updateDisplay();
        return;
    }

    if (digits.includes(action)) {
        handleDigit(action);
    } else if (action === 'decimal') {
        handleDecimal();
    } else if (operators.includes(action)) {
        handleOperator(action);
    } else {
        switch (action) {
            case 'clear': handleClear(); break;
            case 'ce': handleCE(); break;
            case 'backspace': handleBackspace(); break;
            case 'negate': handleNegate(); break;
            case 'percent': handlePercent(); break;
            case 'equals': handleEquals(); break;
            case 'reciprocal': handleUnary(x => x === 0 ? 'Error' : 1 / x, '1/('); break;
            case 'square': handleUnary(x => x * x, 'sqr('); break;
            case 'cube': handleUnary(x => x * x * x, 'cube('); break;
            case 'sqrt': handleUnary(x => x < 0 ? 'Error' : Math.sqrt(x), '√('); break;
            case 'cbrt': handleUnary(x => Math.cbrt(x), '∛('); break;
            case 'abs': handleUnary(x => Math.abs(x), 'abs('); break;
            case 'factorial': handleUnary(x => factorial(x), 'n!('); break;
            case 'ln': handleUnary(x => x <= 0 ? 'Error' : Math.log(x), 'ln('); break;
            case 'log10': handleUnary(x => x <= 0 ? 'Error' : Math.log10(x), 'log('); break;
            case 'pow10': handleUnary(x => Math.pow(10, x), '10^('); break;
            case 'pow2': handleUnary(x => Math.pow(2, x), '2^('); break;
            case 'eToX': handleUnary(x => Math.exp(x), 'e^('); break;
            case 'exp':
                handleOperator('EXP_OP');
                break;
            case 'pi': insertConstant(Math.PI, 'π'); break;
            case 'euler': insertConstant(Math.E, 'e'); break;
            case 'second': toggleSecond(); break;
            case 'openParen': handleOpenParen(); break;
            case 'closeParen': handleCloseParen(); break;
            case 'trigFunc': handleTrig(); break;
            case 'floor': handleUnary(x => Math.floor(x), 'floor('); break;
            case 'ceil': handleUnary(x => Math.ceil(x), 'ceil('); break;
            case 'rand': {
                const r = formatResult(Math.random());
                if (calc.expression && /\d|\)/.test(calc.expression.slice(-1))) {
                    calc.expression += '*';
                }
                calc.display = r;
                calc.expression += r;
                calc.shouldReset = true;
                updateDisplay();
                break;
            }
            case 'mc': memoryClear(); break;
            case 'mr': memoryRecall(); break;
            case 'mp': memoryAdd(); break;
            case 'mm': memorySub(); break;
            case 'ms': memoryStore(); break;
        }
    }
    if (action === 'second') renderButtons();
}
