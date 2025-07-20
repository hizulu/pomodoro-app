// DOM Elements
const timeDisplay = document.getElementById('time-display');
const timerState = document.getElementById('timer-state');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const progressCircle = document.getElementById('progress-circle');
const pomodoroCount = document.getElementById('pomodoro-count');
const cycleCount = document.getElementById('cycle-count');
const themeToggle = document.getElementById('theme-toggle');
const workDuration = document.getElementById('work-duration');
const shortBreak = document.getElementById('short-break');
const longBreak = document.getElementById('long-break');
const newTask = document.getElementById('new-task');
const addTask = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

// Timer Variables
let timer;
let timeLeft = 25 * 60;
let isRunning = false;
let isWorkTime = true;
let pomodorosCompleted = 0;
let currentCycle = 1;
const totalCycles = 4;

// Initialize the timer display
updateTimerDisplay();
updatePomodoroCounter();

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
});

// Timer Button Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Task List Event Listeners
addTask.addEventListener('click', addNewTask);
newTask.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNewTask();
});

// Start Timer Function
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            updateProgressRing();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                handleTimerCompletion();
            }
        }, 1000);
    }
}

// Pause Timer Function
function pauseTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    }
}

// Reset Timer Function
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    
    if (isWorkTime) {
        timeLeft = parseInt(workDuration.value) * 60;
        timerState.textContent = 'Trabajo';
    } else {
        timeLeft = pomodorosCompleted === totalCycles - 1 
            ? parseInt(longBreak.value) * 60 
            : parseInt(shortBreak.value) * 60;
        timerState.textContent = pomodorosCompleted === totalCycles - 1 ? 'Descanso Largo' : 'Descanso Corto';
    }
    
    updateTimerDisplay();
    updateProgressRing();
}

// Handle Timer Completion
function handleTimerCompletion() {
    if (isWorkTime) {
        pomodorosCompleted++;
        currentCycle = pomodorosCompleted < totalCycles ? currentCycle : 1;
        updatePomodoroCounter();

        showNotification('¡Tiempo de trabajo completado!', 'Es hora de un descanso.');
        isWorkTime = false;
        timeLeft = pomodorosCompleted === totalCycles 
            ? parseInt(longBreak.value) * 60 
            : parseInt(shortBreak.value) * 60;
        timerState.textContent = pomodorosCompleted === totalCycles ? 'Descanso Largo' : 'Descanso Corto';

        if (pomodorosCompleted === totalCycles) {
            pomodorosCompleted = 0;
        }
    } else {
        showNotification('¡Descanso terminado!', 'De vuelta al trabajo.');
        isWorkTime = true;
        timeLeft = parseInt(workDuration.value) * 60;
        timerState.textContent = 'Trabajo';
        if (pomodorosCompleted === totalCycles) {
            currentCycle++;
        }
    }
    
    updateTimerDisplay();
    updateProgressRing();
    flashTimerState();

    if (isRunning) {
        setTimeout(startTimer, 1000);
    }
}

// Update Timer Display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update Progress Ring
function updateProgressRing() {
    const totalTime = isWorkTime 
        ? parseInt(workDuration.value) * 60 
        : (pomodorosCompleted === totalCycles - 1 ? parseInt(longBreak.value) : parseInt(shortBreak.value)) * 60;
    const progress = 1 - (timeLeft / totalTime);
    const circumference = 283;
    const offset = circumference * (1 - progress);
    
    progressCircle.style.strokeDashoffset = offset;
}

// Update Pomodoro Counter
function updatePomodoroCounter() {
    pomodoroCount.textContent = pomodorosCompleted;
    
    const pomodoroIndicators = document.querySelectorAll('.bg-gray-300, .bg-gray-600');
    pomodoroIndicators.forEach((indicator, index) => {
        if (index < pomodorosCompleted) {
            indicator.classList.remove('bg-gray-300', 'bg-gray-600');
            indicator.classList.add('bg-indigo-500');
        } else {
            indicator.classList.remove('bg-indigo-500');
            indicator.classList.add(document.body.classList.contains('dark-mode') ? 'bg-gray-600' : 'bg-gray-300');
        }
    });
    
    cycleCount.textContent = currentCycle === totalCycles 
        ? '4/4' 
        : `${currentCycle}/4`;
}

// Show Notification using electronAPI
function showNotification(title, body) {
    if (window.electronAPI?.notify) {
        window.electronAPI.notify(title, body);
    }
    if (window.electronAPI?.sendFocusRequest) {
        window.electronAPI.sendFocusRequest();
    }
}

// Flash Timer State
function flashTimerState() {
    timerState.classList.add('pulse-animation');
    setTimeout(() => {
        timerState.classList.remove('pulse-animation');
    }, 5000);
}

// Add New Task
function addNewTask() {
    const taskText = newTask.value.trim();
    if (taskText) {
        const taskItem = document.createElement('li');
        taskItem.className = 'flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded shadow';
        
        taskItem.innerHTML = `
            <span>${taskText}</span>
            <button class="p-1 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
        
        const deleteBtn = taskItem.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            taskList.removeChild(taskItem);
        });
        
        taskList.appendChild(taskItem);
        newTask.value = '';
    }
}

// Settings change listeners
workDuration.addEventListener('change', () => {
    if (!isRunning && isWorkTime) {
        timeLeft = parseInt(workDuration.value) * 60;
        updateTimerDisplay();
        updateProgressRing();
    }
});

shortBreak.addEventListener('change', () => {
    if (!isRunning && !isWorkTime && pomodorosCompleted !== totalCycles - 1) {
        timeLeft = parseInt(shortBreak.value) * 60;
        updateTimerDisplay();
        updateProgressRing();
    }
});

longBreak.addEventListener('change', () => {
    if (!isRunning && !isWorkTime && pomodorosCompleted === totalCycles - 1) {
        timeLeft = parseInt(longBreak.value) * 60;
        updateTimerDisplay();
        updateProgressRing();
    }
});
