document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    
    let timeLeft = 120; // 2 minutes in seconds
    const countdown = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `Please wait ${minutes}:${seconds < 10 ? '0' : ''}${seconds} to claim your bundle`;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(countdown);
            timerDisplay.textContent = 'Bundle ready to claim!';
        }
    }, 800); // Timer runs 20% faster (800ms)
});