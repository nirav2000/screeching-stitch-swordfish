window.onload = function() {
    const { Renderer, Stave, StaveNote, Formatter, Voice, Accidental } = VexFlow;

    // DOM Elements
    const div = document.getElementById("grandStaff");
    const noteButtonsDiv = document.getElementById("noteButtons");
    const noteChartElement = document.getElementById("noteChart");
    const playbackChartElement = document.getElementById("playbackChart");
    const learningChartElement = document.getElementById("learningChart");
    const statisticsTableBody = document.getElementById("statisticsTableBody");
    const keyboard = document.getElementById('keyboard');
    const timerCanvas = document.getElementById('timerCanvas');
    const timerCtx = timerCanvas.getContext('2d');
    const scorecard = document.getElementById("scorecard");
    const feedbackDisplay = document.getElementById("feedback");
    const statisticsDisplay = document.getElementById("statistics");
    const badgesDisplay = document.getElementById("badges");
    const customTimeInput = document.getElementById('customTime');

    const whiteKeys = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5'];
    const blackKeys = ['c#/4', 'd#/4', 'f#/4', 'g#/4', 'a#/4'];
    const noteNames = [...whiteKeys, ...blackKeys]; // All keys

    // Game state variables
    let currentNote = null;
    let score = 0;
    let totalRounds = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let timeLeft = 15;
    let lastTimestamp = 0;
    let timerRequested = false;
    let startTime = null;
    let mode = 'normal';
    let isProcessing = false;
    let isPlayingBack = false;  
    let username = '';
    let gameplayData = []; // Store selected notes data
    const learningScores = initializeLearningScores();

    // Setup Chart.js
    const noteChart = createNoteChart(noteNames);
    const playbackChart = createPlaybackChart();
    const learningChart = createLearningChart(noteNames);

    // Load profile from local storage if available
    loadProfile();

    // Game mode selection
    document.getElementById('gameMode').addEventListener('change', function() {
        mode = this.value;
        if (mode === 'timed') {
            startTimer();
        } else {
            timerRequested = false;
            resetGame();
        }
        changeNote();
    });

    // Save user profile
    document.getElementById('saveProfile').addEventListener('click', saveProfile);

    // Clear user profile
    document.getElementById('clearProfile').addEventListener('click', clearProfile);

    // Load user profile
    document.getElementById('loadProfile').addEventListener('click', loadProfile); // Load profile button event

    // Create Piano Keyboard
    createKeyboard();

    // Handle button clicks for notes
    noteNames.forEach(note => createNoteButton(note));

    // Add keyboard input functionality
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
    
    document.addEventListener('keydown', function(event) {
        const note = noteKeyMap[event.key.toLowerCase()];
        if (note) {
            handleButtonClick(note); // Trigger the same function on note button click
        }
    });
document.getElementById('playbackButton').addEventListener('click', function() {
    playbackNotes();
});

function playbackNotes() {
    if (isPlayingBack) return; // Prevent multiple playbacks
    isPlayingBack = true; // Set playback flag true
    let playbackIndex = 0; // Start with the first note
		
			resetPlaybackChart(); // Clear previous playback chart
			// Clear the previous chart data if necessary
    clearNoteChart();
                playbackChart.data.labels = gameplayData.map((_, index) => index + 1); // X-axis labels
                playbackChart.update();

               
    const playbackInterval = setInterval(() => {
        if (playbackIndex < gameplayData.length) {
			         const noteData = gameplayData[playbackIndex];
                        const timeTaken = noteData.timeTaken;

                        // Play the note
                        renderStaff(noteData.note);
                        playNote(noteData.note);
 // Plot the current note on the selection chart
            updateNoteChart(noteData.note, noteData.isCorrect); // Update chart as the note is played

                        // Update playback chart
                        playbackChart.data.datasets[0].data.push(timeTaken);
                        playbackChart.update();

                        playbackIndex++;
                 
						
        } else {
            clearInterval(playbackInterval);
            isPlayingBack = false; // Reset playing flag when playback finished
        }
    }, 1000); // Adjust time between notes as necessary
}
   /*  // Playback notes function to update the chart
    function playbackNotes() {
        if (isPlayingBack) return; // Prevent multiple playbacks
        isPlayingBack = true;
        let playbackIndex = 0;
        resetPlaybackChart(); // Clear previous playback chart
        playbackChart.data.labels = gameplayData.map((_, index) => index + 1); // X-axis labels
        playbackChart.update();
    
        const playbackInterval = setInterval(() => {
            if (playbackIndex < gameplayData.length) {
                // Play the note
                renderStaff(gameplayData[playbackIndex].note);
                playNote(gameplayData[playbackIndex].note);
    
                // Update playback timing on the playback chart
                playbackChart.data.datasets[0].data[playbackIndex] = gameplayData[playbackIndex].timeTaken;
                playbackChart.update();
    
                playbackIndex++;
            } else {
                clearInterval(playbackInterval);
                isPlayingBack = false; // Reset playback status
            }
        }, 1000); // Adjust timing here based on your requirements
    }
     */
		 
		             // Reset the playback chart
            function resetPlaybackChart() {
                playbackChart.data.labels = [];
                playbackChart.data.datasets[0].data = [];
                playbackChart.update();
            }
						


/* function clearNoteChart() {
    if (noteChart) {
        // Clear the data and reset the chart
        noteChart.data.labels = [];
        noteChart.data.datasets.forEach((dataset) => {
            dataset.data = []; // Clear data for each dataset
        });
        noteChart.update(); // Refresh the chart to reflect changes
    }
} */

function clearNoteChart() {
    if (noteChart) {
        // Clear data for each dataset
        noteChart.data.datasets.forEach((dataset) => {
            dataset.data = Array(dataset.data.length).fill(0); // Reset values to 0 instead of emptying
        });

        // Optionally clear labels based on your requirements. Uncomment if you need to clear labels:
        // noteChart.data.labels = []; 
        
        noteChart.update(); // Refresh the chart to reflect changes
    }
}

/* noteChart.data.datasets[0].data[index] += 1; // Increment correct count
        } else {
            noteChart.data.datasets[1].data[index] += 1;  */
		 
    function initializeLearningScores() {
        const scores = {};
        noteNames.forEach(note => {
            scores[note] = { attempts: 0, correct: 0, times: [] };
        });
        return scores;
    }

    function loadProfile() {
        const profile = JSON.parse(localStorage.getItem('profile')) || {};

        username = profile.username || '';
        if (username) {
            document.getElementById('username').value = username;
            updateProfileMessage();
            document.getElementById('clearProfile').style.display = 'inline';

            // Load learning scores
            Object.keys(learningScores).forEach(note => {
                if (profile.learningScores && profile.learningScores[note]) {
                    learningScores[note] = profile.learningScores[note];
                }
            });
            updateStatisticsTableWithLearningScores();
        } else {
            feedbackDisplay.innerText = "No profile found!";
        }
    }

    function saveProfile() {
        username = document.getElementById('username').value;
        if (username) {
            const profile = {
                username: username,
                learningScores: learningScores
            };
            localStorage.setItem('profile', JSON.stringify(profile));
            document.getElementById('clearProfile').style.display = 'inline';
            updateProfileMessage();
        } else {
            feedbackDisplay.innerText = `Please enter your name to save your profile.`;
        }
    }

    function clearProfile() {
        localStorage.removeItem('profile');
        username = '';
        document.getElementById('username').value = '';
        this.style.display = 'none';
        feedbackDisplay.innerText = `Profile cleared.`;
    }

    function updateProfileMessage() {
        feedbackDisplay.innerText = `Welcome, ${username}!`;
    }

    function createNoteButton(note) {
        const button = document.createElement("button");
        button.className = "note-button";
        button.innerText = note.split('/')[0].toUpperCase();
        button.onclick = function () {
            handleButtonClick(note);
        };
        noteButtonsDiv.appendChild(button);
    }

    function createKeyboard() {
        // Create white keys
        whiteKeys.forEach((note) => {
            const key = document.createElement('div');
            key.classList.add('key', 'white');
            key.textContent = note.split('/')[0].toUpperCase();
            key.addEventListener('click', () => handleButtonClick(note));
            keyboard.appendChild(key);
        });

        // Create black keys with appropriate offsets
        const blackKeyOffsets = [9, 20, 42, 53, 65]; // Offsets for black keys
        blackKeys.forEach((note, index) => {
            const key = document.createElement('div');
            key.classList.add('key', 'black');
            key.style.left = `${blackKeyOffsets[index]}%`;
            key.textContent = ''; // Black keys do not have text content
            key.addEventListener('click', () => handleButtonClick(note));
            keyboard.appendChild(key);
        });
    }

    function createNoteChart(noteNames) {
        const noteChartCtx = noteChartElement.getContext('2d');
        return new Chart(noteChartCtx, {
            type: 'bar',
            data: {
                labels: noteNames,
                datasets: [{
                        label: 'Correctly Selected Notes',
                        data: Array(noteNames.length).fill(0),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                    {
                        label: 'Incorrectly Selected Notes',
                        data: Array(noteNames.length).fill(0),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    }
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createPlaybackChart() {
        const playbackChartCtx = playbackChartElement.getContext('2d');
        return new Chart(playbackChartCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Note Selection Timing',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    borderWidth: 2
                }],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Selection Index'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Time Taken (s)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createLearningChart(noteNames) {
        const learningChartCtx = learningChartElement.getContext('2d');
        return new Chart(learningChartCtx, {
            type: 'bar',
            data: {
                labels: noteNames,
                datasets: [{
                    label: 'Learning Factor Score',
                    data: Array(noteNames.length).fill(0),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                }],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Score (0-100)'
                        }
                    }
                }
            }
        });
    }

    function drawTimer(remainingTime, totalTime) {
        const radius = 40; // Radius for the circular timer
        const centerX = timerCanvas.width / 2;
        const centerY = timerCanvas.height / 2;
        const totalArcLength = 2 * Math.PI; // Full circle length
        const remainingArcLength = (remainingTime / totalTime) * totalArcLength; // Remaining time arc length

        // Clear the canvas
        timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);

        // Draw background circle
        timerCtx.beginPath();
        timerCtx.arc(centerX, centerY, radius, 0, totalArcLength);
        timerCtx.fillStyle = '#ffb6c1'; // Light pink background
        timerCtx.fill();

        // Draw remaining time arc
        timerCtx.beginPath();
        timerCtx.arc(centerX, centerY, radius, 1.5 * Math.PI, 1.5 * Math.PI - remainingArcLength);
        timerCtx.lineTo(centerX, centerY);
        timerCtx.fillStyle = '#FF6F61'; // Warm pink for remaining time
        timerCtx.fill();
    }

    function startTimer() {
        timeLeft = parseInt(customTimeInput.value) || 15;
        drawTimer(timeLeft, timeLeft); // Draw initial timer
        lastTimestamp = performance.now(); // Set last timestamp for animation frame
        timerRequested = true;

        requestAnimationFrame(updateTimer); // Start the animation loop
    }

    function updateTimer(timestamp) {
        if (timerRequested) {
            const elapsed = (timestamp - lastTimestamp) / 1000; // Calculate elapsed time in seconds
            lastTimestamp = timestamp; // Update the last timestamp
            timeLeft -= elapsed; // Decrement time left
            drawTimer(timeLeft, parseInt(customTimeInput.value)); // Update timer visualization

            if (timeLeft <= 0) {
                timeLeft = 0; // Prevent time from going negative
                timerRequested = false; // Stop the timer
                endGame(); // End the game if time runs out
            } else {
                requestAnimationFrame(updateTimer); // Request the next animation frame
            }
        }
    }

    function endGame() {
        feedbackDisplay.innerText = `${username ? username : 'Player'}! Time's up! Your final score is: ${score}`;
        scorecard.innerText = 'Score: ' + score; // Show final score
        resetGame(); // Reset game state
    }

    function resetGame() {
        score = 0;
        totalRounds = 0;
        totalCorrect = 0; // Reset total correct
        totalIncorrect = 0; // Reset total incorrect
        gameplayData = []; // Reset gameplay data
        scorecard.innerText = 'Score: ' + score;

        // Reset learning scores
        Object.keys(learningScores).forEach(note => {
            learningScores[note] = { attempts: 0, correct: 0, times: [] };
        });

        timerRequested = false; // Stop the timer
        feedbackDisplay.innerText = ''; // Clear feedback
        statisticsDisplay.innerText = ''; // Clear statistics
        badgesDisplay.innerText = ''; // Clear badges
        resetPlaybackChart();  // Reset playback chart
        learningChart.data.datasets[0].data = Array(noteNames.length).fill(0); // Reset learning chart
        learningChart.update(); // Update chart

        // Clear statistics table
        while (statisticsTableBody.firstChild) {
            statisticsTableBody.removeChild(statisticsTableBody.firstChild);
        }
    }

    function handleButtonClick(selectedNote) {
        if (isProcessing) return; // Prevent processing if already handling a click
        isProcessing = true; // Set flag to true

        const endTime = Date.now();
        const reactionTime = (endTime - startTime) / 1000; // Calculate reaction time in seconds

        playNote(selectedNote); // Play the selected note
        const noteData = {
            note: selectedNote,
            isCorrect: selectedNote === currentNote,
            timeTaken: reactionTime,
						dateTime: new Date().toISOString() // Add current date & time in ISO format
        };
        gameplayData.push(noteData);
        
        totalRounds++; // Increase totalRounds for every attempt
        updateNoteChart(selectedNote, noteData.isCorrect);

        if (selectedNote === currentNote) {
            renderStaff(currentNote, 'green'); // Change to green if correct
            score++; // Increment score
            totalCorrect++; // Increment total correct
            updateScoreDisplay();

            updateLearningScores(currentNote, true, reactionTime);
            setTimeout(() => {
                isProcessing = false; // Reset processing flag
                changeNote(); // Change to a new note after a second
            }, 1000);
        } else {
            renderStaff(currentNote, 'red'); // Show original note in red
            totalIncorrect++; // Increment total incorrect
            updateLearningScores(selectedNote, false, reactionTime);
            setTimeout(() => {
                renderStaff(currentNote, 'black'); // Return to original note
                isProcessing = false; // Reset processing flag
            }, 1000);
        }

        // Provide feedback every 5 rounds
        if (totalRounds % 5 === 0) {
            provideStatistics();
        }
    }

    function updateNoteChart(selectedNote, isCorrect) {
        const index = noteNames.indexOf(selectedNote);
				console.log(index, selectedNote);
        if (isCorrect) {
            noteChart.data.datasets[0].data[index] += 1; // Increment correct count
        } else {
            noteChart.data.datasets[1].data[index] += 1; // Increment incorrect count
        }
        noteChart.update();
    }

    function updateLearningScores(note, isCorrect, timeTaken) {
        learningScores[note].times.push(timeTaken); // Always add the time taken
        learningScores[note].attempts++; // Increment attempts regardless of correctness
        if (isCorrect) {
            learningScores[note].correct++;
        }

        // Calculate learning factor score
        const correctnessRatio = learningScores[note].correct / learningScores[note].attempts || 0;
        const averageTime = learningScores[note].times.reduce((a, b) => a + b, 0) / learningScores[note].times.length || 1;
        const learningFactorScore = Math.max(0, Math.min(100, (correctnessRatio * 100 + (1 - averageTime / 5) * 100) / 2));
        
        // Update the learning chart
        learningChart.data.datasets[0].data[noteNames.indexOf(note)] = learningFactorScore;
        learningChart.update();

        // Update statistics table
        updateStatisticsTable(note, learningScores[note]);
        
        // Adjust note display frequency
        adjustNoteDisplayFrequency(note, isCorrect, timeTaken);
    }

    function adjustNoteDisplayFrequency(note, isCorrect, timeTaken) {
        if (isCorrect) {
            // Reduce frequency of displaying correct notes if selection was fast
            if (timeTaken < 1) { // Time taken is less than 1 second
                learningScores[note].attempts -= Math.ceil(learningScores[note].attempts / 2); // Reduce attempts significantly
            }
        } else {
            // Increase frequency of wrong notes
            learningScores[note].attempts += 1; // Increase attempts for incorrect notes
        }
    }

    function updateStatisticsTable(note, stats) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${note}</td>
            <td>${stats.attempts}</td>
            <td>${stats.correct}</td>
            <td>${Math.min(...stats.times).toFixed(2) || 0}</td>
            <td>${(stats.times.reduce((a, b) => a + b, 0) / stats.times.length).toFixed(2) || 0}</td>
            <td>${Math.max(...stats.times).toFixed(2) || 0}</td>
            <td>${((stats.correct / stats.attempts) * 100).toFixed(1) || 0}</td>
        `;

        // Clear any previous row for the note and append the new one
        const existingRow = Array.from(statisticsTableBody.rows).find(r => r.cells[0].innerText === note);
        if (existingRow) {
            statisticsTableBody.removeChild(existingRow);
        }
        statisticsTableBody.appendChild(row);
    }

    function updateStatisticsTableWithLearningScores() {
        // Update the statistics table with learning scores from the loaded profile
        Object.keys(learningScores).forEach(note => {
            updateStatisticsTable(note, learningScores[note]);
        });
    }

    function changeNote() {
        let randomIndex;
        const incorrectNotes = noteNames.filter(note => learningScores[note].attempts > 0 && learningScores[note].correct < learningScores[note].attempts);

        if (incorrectNotes.length > 0 && Math.random() < 0.7) {
            randomIndex = Math.floor(Math.random() * incorrectNotes.length);
            currentNote = incorrectNotes[randomIndex];
        } else {
            randomIndex = Math.floor(Math.random() * noteNames.length);
            currentNote = noteNames[randomIndex];
        }

        playNote(currentNote);
        renderStaff(currentNote);
        resetTiming(); // Track timing for reaction time
    }

    function resetTiming() {
        startTime = Date.now(); // Reset start time for timing
    }

    function playNote(note) {
        const frequency = getNoteFrequency(note);
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease(frequency, "8n");
    }

    function getNoteFrequency(note) {
        const noteFrequencies = {
            'c/4': 261.63,
            'c#/4': 277.18,
            'd/4': 293.66,
            'd#/4': 311.13,
            'e/4': 329.63,
            'f/4': 349.23,
            'f#/4': 369.99,
            'g/4': 392.00,
            'g#/4': 415.30,
            'a/4': 440.00,
            'a#/4': 466.16,
            'b/4': 493.88,
            'c/5': 523.25,
            'd/5': 587.33
        };
        return noteFrequencies[note] || 440; // Default frequency (A4)
    }

    function renderStaff(note, color = 'black') {
        div.innerHTML = ''; // Clear previous SVG elements

        const renderer = new Renderer(div, Renderer.Backends.SVG);
        renderer.resize(600, 200);
        const context = renderer.getContext();

        const stave = new Stave(10, 10, 200);
        stave.addClef('treble').addKeySignature('C');
        stave.setContext(context).draw();
        context.scale(1.7, 1.7);

        const staveNote = new StaveNote({
            keys: [note],
            duration: "q",
        });

        staveNote.setStyle({ fillStyle: color, strokeStyle: color });

        if (note.includes("#")) {
            staveNote.addModifier(new Accidental("#"));
        }

        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.setStrict(false);
        voice.addTickables([staveNote]);

        const formatter = new Formatter().joinVoices([voice]).format([voice], 500);
        voice.draw(context, stave);
    }

    function updateScoreDisplay() {
        scorecard.innerText = `Score: ${score}`;
    }

document.getElementById('downloadData').addEventListener('click', function() {
    const data = {
        username: username,
        learningScores: learningScores,
        gameplayData: gameplayData,
        score: score
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a'); // Create a temporary link element
    a.href = url;
    a.download = 'user_data.json'; // Name of the downloaded file
    document.body.appendChild(a);
    a.click(); // Programmatically click the link to trigger the download
    document.body.removeChild(a); // Clean up the DOM
});
  
	
	function provideStatistics() {
    if (!gameplayData.length) {
        console.log("No data available to provide statistics.");
        return; // If there is no data, return early
    }
    
    // Calculate total notes, correct notes, and success rate
    const totalNotes = gameplayData.length;
    const correctNotes = gameplayData.filter(data => data.isCorrect).length;
    const successRate = (correctNotes / totalNotes) * 100; // Calculate success rate percentage

    // Prepare statistics summary
    const statistics = {
        totalNotes: totalNotes,
        correctNotes: correctNotes,
        successRate: successRate.toFixed(2), // Rounds to 2 decimal places
    };

    // Display statistics
    console.log("Statistics Summary:");
    console.log("Total Notes Played: ", statistics.totalNotes);
    console.log("Correct Notes: ", statistics.correctNotes);
    console.log("Success Rate: ", `${statistics.successRate}%`);

    return statistics; // Optionally return the statistics object
}



document.getElementById('importData').addEventListener('click', function() {
    const fileInput = document.getElementById('importFile');
    fileInput.click();
    
    if (fileInput.files.length === 0) {
        alert("Please select a file to import.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            // Parse the JSON data
            const data = JSON.parse(event.target.result);
            
            // Example: Assign the imported data to your variables
            if (data.gameplayData) {
                gameplayData = data.gameplayData; // Update gameplayData with imported data
            }
            if (data.score !== undefined) {
                score = data.score; // Update score with imported data
            }
            if (data.learningScores) {
                learningScores = data.learningScores; // Update learningScores
            }
            
            // Optionally update the UI to reflect the imported data
            updateScoreDisplay();
            // You may also want to display or use the imported gameplayData as needed
            
            alert("Data imported successfully!");
        } catch (error) {
            console.error("Failed to import data:", error);
            alert("Error parsing JSON data. Please ensure the file format is correct.");
        }
    };

    reader.onerror = function() {
        console.error("Failed to read file:", reader.error);
        alert("Error reading file. Please try again.");
    };

    // Read the file as text to be parsed as JSON
    reader.readAsText(file);
});
	
	
	// Call changeNote to start the game
    changeNote();
};