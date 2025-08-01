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
    
    // Cambiar el icono del botón de alternar tema
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDarkMode ? 
        //Sun icon
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3 m15.364 6.364l-.707-.707 M6.343 6.343l-.707-.707 m12.728 0l-.707.707 M6.343 17.657l-.707.707 M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>` : 

        //Moon icon
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M 12 2.5 A 9.5 9.5 0 1 0 21.5 12 A 7.5 7.5 0 1 1 12 2.5 Z"/>
        </svg>`;
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
        timerState.textContent = 'Trabajando...';
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

    isRunning = false;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');

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

    const pomodoroIndicators = document.querySelectorAll('.bg-primary-accent, .bg-secondary-bg');
    pomodoroIndicators.forEach((indicator, index) => {
        if (index < pomodorosCompleted) {
            indicator.classList.remove('bg-secondary-bg'); // Remover el color de fondo secundario
            indicator.classList.add('bg-primary-accent'); // Agregar el color de fondo primario
        } else {
            indicator.classList.remove('bg-primary-accent'); // Remover el color de fondo primario
            indicator.classList.add(document.body.classList.contains('dark-mode') ? 'bg-secondary-bg' : 'bg-primary-accent'); // Agregar el color de fondo según el modo
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
        taskItem.className = 'flex items-center justify-between p-2 bg-[var(--primary-bg)] dark:bg-[var(--secondary-bg)] rounded shadow';
        taskItem.setAttribute('draggable', 'true'); // Hacer el elemento arrastrable
        
        taskItem.innerHTML = `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[var(--secondary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>${taskText}</span>
            </div>
            <button class="p-1 text-[var(--primary-accent)] hover:text-[var(--primary-accent-hover)]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
        
        const deleteBtn = taskItem.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            taskList.removeChild(taskItem);
        });

        // Eventos de arrastre
        taskItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', taskText);
            e.dataTransfer.effectAllowed = 'move';
            taskItem.classList.add('opacity-50'); // Opcional: cambiar la opacidad al arrastrar
        });

        taskItem.addEventListener('dragend', () => {
            taskItem.classList.remove('opacity-50'); // Restaurar opacidad
        });

        taskItem.addEventListener('dragover', (e) => {
            e.preventDefault(); // Permitir el arrastre
            e.dataTransfer.dropEffect = 'move';
        });

        taskItem.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedTaskText = e.dataTransfer.getData('text/plain');
            const draggedTaskItem = Array.from(taskList.children).find(item => item.textContent.includes(draggedTaskText));
            if (draggedTaskItem && draggedTaskItem !== taskItem) {
                // Reordenar las tareas
                if (e.target === taskItem) {
                    taskList.insertBefore(draggedTaskItem, taskItem.nextSibling);
                } else {
                    taskList.insertBefore(draggedTaskItem, taskItem);
                }
            }
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
