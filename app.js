let currentNote = '';
let score = 0;
let totalRounds = 0;
let totalCorrect = 0;
let totalIncorrect = 0;
let gameplayData = [];
const noteKeyMap = {
    'a': 'c/4',
    'w': 'c#/4',
    's': 'd/4',
    'e': 'd#/4',
    'd': 'e/4',
    'f': 'f/4',
    't': 'f#/4',
    'g': 'g/4',
    'y': 'g#/4',
    'h': 'a/4',
    'u': 'a#/4',
    'j': 'b/4',
    'k': 'c/5',
    'o': 'd/5'
};

window.onload = function () {
    initializeApp();
};

function renderStaff(noteName) {
    const VF = VexFlow;
    const div = document.getElementById("grandStaff");
    div.innerHTML = ""; // Clear previous staff
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(400, 200);
    
    const stave = new VF.Stave(10, 40, 300);
    stave.addClef("treble").addTimeSignature("4/4");
    stave.setContext(renderer.getContext()).draw();

    const note = new VF.StaveNote({
        keys: [noteName],
        duration: "q",
    });

    VexFlow.Formatter.FormatAndDraw(renderer.getContext(), stave, [note]);
    renderer.getContext().fillText("Current Note: " + noteName, 10, 20);
}

// Main initialization function
function initializeApp() {
    loadProfile();
    createKeyboard();
    setupEventListeners();
    changeNote();
}

// Function to set up event listeners
function setupEventListeners() {
    document.getElementById("playRecordedNotes").addEventListener("click", playbackNotes);
    document.getElementById("saveProfile").addEventListener("click", saveProfile);
    document.getElementById("clearProfile").addEventListener("click", clearProfile);
    document.getElementById("gameMode").addEventListener("change", toggleCustomTimeInput);
    document.addEventListener('keydown', handleKeyPress);
}

// Handle key press for note selection
function handleKeyPress(event) {
    const note = noteKeyMap[event.key.toLowerCase()];
    if (note) {
        handleButtonClick(note);
    }
}

// Function to load user profile
function loadProfile() {
    const username = localStorage.getItem("username");
    if (username) {
        document.getElementById("username").value = username;
    }
}

// Function to save user profile
function saveProfile() {
    const username = document.getElementById("username").value;
    localStorage.setItem("username", username);
}

// Function to clear user profile
function clearProfile() {
    localStorage.removeItem("username");
    document.getElementById("username").value = '';
}

// Toggle custom time input visibility
function toggleCustomTimeInput() {
    const gameMode = document.getElementById("gameMode").value;
    document.getElementById("customTime").style.display = (gameMode === "timed") ? "block" : "none";
}

// Function to change the current note
function changeNote() {
    const notesArray = Object.values(noteKeyMap);
    currentNote = notesArray[Math.floor(Math.random() * notesArray.length)];
    renderStaff(currentNote);

    // Reset game state for the next round
    gameplayData.push({ note: currentNote, timeTaken: null });
}

// Function to handle button click (when a note is pressed)
function handleButtonClick(selectedNote) {
    const startTime = performance.now(); // Start timing
    const isCorrect = selectedNote === currentNote;
    const endTime = performance.now(); // End timing
    const timeTaken = endTime - startTime;

    // Log gameplay data
    gameplayData[gameplayData.length - 1].timeTaken = timeTaken;

    // Update statistics
    if (isCorrect) {
        totalCorrect++;
    } else {
        totalIncorrect++;
    }

    totalRounds++;
    score = Math.round((totalCorrect / totalRounds) * 100);
    document.getElementById("scorecard").innerText = `Score: ${score}`;
    
    // Provide feedback and change the note
    changeNote();
}