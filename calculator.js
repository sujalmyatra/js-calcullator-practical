import { calc } from './controllers/Calculator.js';
import { renderButtons,renderHistoryPanel, addToHistory, updateDisplay } from './controllers/utilities.js';
import { handleButtonClick } from './controllers/buttonHandler.js';
import { handleTrig } from './controllers/sciHandler.js';

// Mode Switch
function switchMode(mode) {
    calc.mode = mode;
    
    document.getElementById('modeTitle').textContent      = mode === 'standard' ? 'Standard' : 'Scientific';
    // document.getElementById('keepOnTopBtn').style.display = mode === 'standard' ? 'block' : 'none';

    const sciControls = document.getElementById('scientificControls');
    const sciExtra    = document.getElementById('scientificExtra');
    const calcWrapper = document.getElementById('calcWrapper');

    if (mode === 'scientific') {
        sciControls.classList.remove('d-none'); sciControls.classList.add('d-flex');
        sciExtra.classList.remove('d-none');    sciExtra.classList.add('d-flex');
        calcWrapper.style.height='76vh';


    } else {
        sciControls.classList.add('d-none'); sciControls.classList.remove('d-flex');
        sciExtra.classList.add('d-none');    sciExtra.classList.remove('d-flex');
        calcWrapper.style.height='';

    }

    document.getElementById('checkStandard').style.visibility  = mode === 'standard'   ? 'visible' : 'hidden';
    document.getElementById('checkScientific').style.visibility = mode === 'scientific' ? 'visible' : 'hidden';
        calcWrapper.classList.remove('calc-height');


    renderButtons();
    closeModeMenu();
}

//  Menus
function closeModeMenu() {
    document.getElementById('modeMenu').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('hamburgerBtn').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('modeMenu').classList.toggle('show');
    });

    document.getElementById('modeMenu').addEventListener('click', e => {
        const item = e.target.closest('[data-mode]');
        if (item) switchMode(item.dataset.mode);
    });

    document.getElementById('histTab').addEventListener('click', () => {
        calc.currentTab = 'history';
        document.getElementById('histTab').classList.add('active');
        document.getElementById('memTab').classList.remove('active');
        renderHistoryPanel();
    });

    document.getElementById('memTab').addEventListener('click', () => {
        calc.currentTab = 'memory';
        document.getElementById('memTab').classList.add('active');
        document.getElementById('histTab').classList.remove('active');
        renderHistoryPanel();
    });

    init();
});
function closeAllDropdowns() {
    document.getElementById('modeMenu').classList.remove('show');
    document.getElementById('trigDropdown')?.classList.remove('show');
    document.getElementById('funcDropdown')?.classList.remove('show');
}
document.addEventListener('click', () => closeAllDropdowns());

document.getElementById('trigBtn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('trigDropdown').classList.toggle('show');
    document.getElementById('funcDropdown').classList.remove('show');
});

document.getElementById('funcBtn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('funcDropdown').classList.toggle('show');
    document.getElementById('trigDropdown').classList.remove('show');
});

document.getElementById('trigDropdown').addEventListener('click', e => {
    const item = e.target.closest('[data-trig]');
    if (item) {
        calc.activeTrig = item.dataset.trig;
        document.getElementById('trigDropdown').querySelectorAll('.func-dropdown-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        document.getElementById('trigBtn').innerHTML = `<span>&#9651;</span> ${calc.activeTrig} <span class="arrow">&#8964;</span>`;
        document.getElementById('trigDropdown').classList.remove('show');
    }
     handleTrig();
});

document.getElementById('funcDropdown').addEventListener('click', e => {
    const item = e.target.closest('[data-func]');
    if (item) {
        calc.activeFunc = item.dataset.func;
        document.getElementById('funcDropdown').querySelectorAll('.func-dropdown-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        document.getElementById('funcBtn').innerHTML = `<span style="font-style:italic">f</span> ${calc.activeFunc} <span class="arrow">&#8964;</span>`;
        document.getElementById('funcDropdown').classList.remove('show');
        handleButtonClick(calc.activeFunc);
    }
});

document.getElementById('degBtn').addEventListener('click', () => {
    const modes = ['DEG','RAD','GRAD'];
    const idx   = modes.indexOf(calc.angleMode);
    calc.angleMode = modes[(idx + 1) % modes.length];
    document.getElementById('degBtn').textContent = calc.angleMode;
});

document.getElementById('feBtn').addEventListener('click', () => {
    calc.feMode = !calc.feMode;
    document.getElementById('feBtn').style.color = calc.feMode ? '#4a6fa5' : '';
    updateDisplay();
});


// KEYBOARD SUPPORT
document.addEventListener('keydown', e => {
    const keyMap = {
        '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
        '.':'decimal',
        '+':'add', '-':'subtract', '*':'multiply', '/':'divide',
        'Enter':'equals', '=':'equals',
        'Backspace':'backspace',
        'Escape':'clear',
        '%':'percent',
    };
    if (keyMap[e.key]) {
        e.preventDefault();
        handleButtonClick(keyMap[e.key]);
    }
});

// Closure Mobile History

// Mobile History/Memory Bottom Sheet 
(function () {
    const BREAKPOINT = 700;

    const btn        = document.getElementById('mobileHistoryBtn');
    const sheet      = document.getElementById('bottomSheet');
    const backdrop   = document.getElementById('bottomSheetBackdrop');
    const closeBtn   = document.getElementById('bottomSheetClose');
    const mHistTab   = document.getElementById('mobileHistTab');
    const mMemTab    = document.getElementById('mobileMemTab');
    const mContent   = document.getElementById('mobileHistoryContent');

    function syncMobileContent() {
        const desktopContent = document.getElementById('historyContent');
        mContent.innerHTML = desktopContent.innerHTML;
        mContent.querySelectorAll('.history-item[data-index]').forEach(el => {
            el.addEventListener('click', () => {
                const desktopItem = document.querySelector('#historyContent .history-item[data-index="' + el.dataset.index + '"]');
                if (desktopItem) desktopItem.click();
                closeSheet();
            });
        });
    }

    function openSheet() {
        syncMobileContent();
        sheet.classList.add('open');
        backdrop.classList.remove('d-none');
        backdrop.classList.add('show');
    }

    function closeSheet() {
        sheet.classList.remove('open');
        backdrop.classList.remove('show');
        setTimeout(function() { backdrop.classList.add('d-none'); }, 300);
    }

    btn.addEventListener('click', openSheet);
    closeBtn.addEventListener('click', closeSheet);
    backdrop.addEventListener('click', closeSheet);

    mHistTab.addEventListener('click', function() {
        mHistTab.classList.add('active');
        mMemTab.classList.remove('active');
        document.getElementById('histTab').click();
        setTimeout(syncMobileContent, 50);
    });

    mMemTab.addEventListener('click', function() {
        mMemTab.classList.add('active');
        mHistTab.classList.remove('active');
        document.getElementById('memTab').click();
        setTimeout(syncMobileContent, 50);
    });

    function applyResponsive() {
        var isMobile = window.innerWidth < BREAKPOINT;
        var histPanel = document.getElementById('historyPanel');

        if (isMobile) {
            histPanel.classList.add('history-panel-hidden');
            btn.classList.remove('d-none');
        } else {
            histPanel.classList.remove('history-panel-hidden');
            btn.classList.add('d-none');
            closeSheet();
        }
    }

    applyResponsive();
    window.addEventListener('resize', applyResponsive);
})();

// Closure theme toggle
// Dark Mode Toggle 
(function () {
    var btn = document.getElementById('keepOnTopBtn');
    function applyTheme(dark) {
        document.body.classList.toggle('dark', dark);
        document.getElementById('themeIcon').className = dark ? 'bi bi-sun' : 'bi bi-moon';
    }
    btn.addEventListener('click', function () {
        var isDark = !document.body.classList.contains('dark');
        localStorage.setItem('calcDark', isDark);
        applyTheme(isDark);
    });
    applyTheme(localStorage.getItem('calcDark') === 'true');
})();

document.getElementById('mcBtn').addEventListener('click', () => handleButtonClick('mc'));
document.getElementById('mrBtn').addEventListener('click', () => handleButtonClick('mr'));
document.getElementById('mpBtn').addEventListener('click', () => handleButtonClick('mp'));
document.getElementById('mmBtn').addEventListener('click', () => handleButtonClick('mm'));
document.getElementById('msBtn').addEventListener('click', () => handleButtonClick('ms'));

// Init
function init() {
    renderButtons();
    updateDisplay();
    renderHistoryPanel();
}

init();


