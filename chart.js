const ctxNote = document.getElementById('noteChart').getContext('2d');
const noteChart = new Chart(ctxNote, {
    type: 'bar',
    data: {
        labels: Object.keys(noteKeyMap),
        datasets: [{
            label: 'Correct Attempts',
            data: Array(Object.keys(noteKeyMap).length).fill(0), // Initialize data
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const ctxPlayback = document.getElementById('playbackChart').getContext('2d');
const playbackChart = new Chart(ctxPlayback, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Playback Timing',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2
        }]
    }
});

function resetPlaybackChart() {
    playbackChart.data.labels = [];
    playbackChart.data.datasets[0].data = [];
    playbackChart.update();
}