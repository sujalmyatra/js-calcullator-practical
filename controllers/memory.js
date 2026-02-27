import { formatResult, updateDisplay, renderHistoryPanel } from "./utilities.js";
import { calc } from "./Calculator.js";

// MEMORY Functions

export function memoryClear() {
    calc.memory      = 0;
    calc.hasMemory   = false;
    calc.memoryList  = [];
    updateMemoryButtons();
    if (calc.currentTab === 'memory') renderHistoryPanel();
}

export function memoryRecall() {
    calc.display     = formatResult(calc.memory);
    calc.expression = calc.display;
    calc.shouldReset = true;
    updateDisplay();
    renderHistoryPanel();

}

export function memoryAdd() {
    calc.memory += parseFloat(calc.display);
    calc.hasMemory = true;
    calc.memoryList.push({ val: calc.memory });
    updateMemoryButtons();
    renderHistoryPanel();
}

export function memorySub() {
    calc.memory -= parseFloat(calc.display);
    calc.hasMemory = true;
    calc.memoryList.push({ val: calc.memory });
    updateMemoryButtons();
    renderHistoryPanel();

}

export function memoryStore() {
    calc.memory      = parseFloat(calc.display);
    calc.hasMemory   = true;
    calc.memoryList  = [{ val: calc.memory }];
    updateMemoryButtons();
    renderHistoryPanel();

}

export function updateMemoryButtons() {
    document.getElementById('mcBtn').disabled = !calc.hasMemory;
    document.getElementById('mrBtn').disabled = !calc.hasMemory;
}