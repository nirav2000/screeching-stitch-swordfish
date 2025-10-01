const learningScores = {};

function updateLearningScores(note, isCorrect, timeTaken) {
    if (!learningScores[note]) {
        learningScores[note] = { attempts: 0, correct: 0, times: [] };
    }
    learningScores[note].attempts++;
    if (isCorrect) learningScores[note].correct++;
    learningScores[note].times.push(timeTaken);

    updateStatisticsTable(note, learningScores[note]);
}

function updateStatisticsTable(note, stats) {
    const tbody = document.getElementById("statisticsTableBody");
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${note}</td>
        <td>${stats.attempts}</td>
        <td>${stats.correct}</td>
        <td>${Math.min(...stats.times) || 0}</td>
        <td>${(stats.times.reduce((a, b) => a + b, 0) / stats.times.length) || 0).toFixed(2)}</td>
        <td>${Math.max(...stats.times) || 0}</td>
        <td>${((stats.correct / stats.attempts) * 100 || 0).toFixed(2)}</td>
    `;
}