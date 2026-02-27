//Class Declaration
export class Calculator {
    constructor() {
        this.mode = 'standard';
        this.display = '0';
        this.expression = '';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecond = false;
        this.shouldReset = false;
        this.memory = 0;
        this.hasMemory = false;
        this.historyList = [];
        this.memoryList = [];
        this.angleMode = 'DEG';
        this.feMode = false;
        this.secondMode = false;
        this.activeTrig = 'sin';
        this.activeFunc = 'floor';
        this.currentTab = 'history';
        this.parenCount = 0;
        this.lastOperator = null;
        this.lastSecondOperand = null;
    }
}
export const calc = new Calculator();

//PROTOTYPE Declaration
Calculator.prototype.calculateBinary = function(a, operator, b) {
    switch(operator) {
        case 'add': return a + b;
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide': return b === 0 ? 'Error' : a / b;
        default: return b;
    }
};