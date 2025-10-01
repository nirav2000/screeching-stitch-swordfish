let isPlayingBack = false;

function playbackNotes() {
    if (isPlayingBack) return; 
    isPlayingBack = true;

    resetPlaybackChart();

    let playbackIndex = 0;
    const playbackInterval = setInterval(() => {
        if (playbackIndex < gameplayData.length) {
            const noteData = gameplayData[playbackIndex];
            playNote(noteData.note);
            playbackChart.data.datasets[0].data[playbackIndex] = noteData.timeTaken;
            playbackChart.update();
            playbackIndex++;
        } else {
            clearInterval(playbackInterval);
            isPlayingBack = false;
        }
    }, 1000);
}