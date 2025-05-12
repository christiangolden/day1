document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    const choices = ['rock', 'paper', 'scissors'];
    let playerScore = 0;
    let computerScore = 0;
    let currentRound = 0;
    const maxRounds = 3;
    let gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
    let currentStreak = 0;
    let longestStreak = 0;
    let totalGames = 0;
    let moveCounts = { rock: 0, paper: 0, scissors: 0 };

    // DOM Elements
    const rockBtn = document.getElementById('rock');
    const paperBtn = document.getElementById('paper');
    const scissorsBtn = document.getElementById('scissors');
    const resetBtn = document.getElementById('reset');
    const resultDisplay = document.getElementById('result');
    const playerScoreDisplay = document.getElementById('player-score');
    const computerScoreDisplay = document.getElementById('computer-score');
    const playerChoiceDisplay = document.getElementById('player-choice');
    const computerChoiceDisplay = document.getElementById('computer-choice');
    const currentRoundDisplay = document.getElementById('current-round');
    const gameHistoryDisplay = document.getElementById('game-history');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rulesBtn = document.getElementById('rules-btn');
    const statsBtn = document.getElementById('stats-btn');
    const rulesModal = document.getElementById('rules-modal');
    const statsModal = document.getElementById('stats-modal');
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    // Web Audio API for sound effects
    function playTone(frequency, duration = 200, type = 'sine', volume = 0.2) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration / 1000);
        osc.onended = () => ctx.close();
    }

    function playWinSound() {
        playTone(523.25, 120, 'triangle', 0.18); // C5
        setTimeout(() => playTone(659.25, 120, 'triangle', 0.18), 120); // E5
        setTimeout(() => playTone(783.99, 180, 'triangle', 0.18), 240); // G5
    }
    function playLoseSound() {
        playTone(196, 180, 'sawtooth', 0.18); // G3
        setTimeout(() => playTone(130.81, 180, 'sawtooth', 0.18), 180); // C3
    }
    function playTieSound() {
        playTone(349.23, 120, 'square', 0.15); // F4
        setTimeout(() => playTone(349.23, 120, 'square', 0.15), 120);
    }

    // Modal functionality
    function showModal(modal) {
        modal.classList.add('show');
    }

    function hideModal(modal) {
        modal.classList.remove('show');
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === rulesModal) hideModal(rulesModal);
        if (e.target === statsModal) hideModal(statsModal);
    });

    // Modal event listeners
    rulesBtn.addEventListener('click', () => showModal(rulesModal));
    statsBtn.addEventListener('click', () => {
        updateStats();
        showModal(statsModal);
    });

    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            hideModal(rulesModal);
            hideModal(statsModal);
        });
    });

    // Update statistics
    function updateStats() {
        document.getElementById('total-games').textContent = totalGames;
        const winRate = totalGames > 0 ? Math.round((playerScore / totalGames) * 100) : 0;
        document.getElementById('win-rate').textContent = `${winRate}%`;
        
        const mostUsedMove = Object.entries(moveCounts)
            .sort((a, b) => b[1] - a[1])[0];
        document.getElementById('most-used-move').textContent = 
            mostUsedMove ? `${mostUsedMove[0]} (${mostUsedMove[1]})` : '-';
        
        document.getElementById('longest-streak').textContent = longestStreak;
    }

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'r') playGame('rock');
        if (key === 'p') playGame('paper');
        if (key === 's') playGame('scissors');
    });

    // Add shake animation to choices
    function shakeChoice(choice) {
        const button = document.getElementById(choice);
        button.classList.add('shake');
        setTimeout(() => button.classList.remove('shake'), 500);
    }

    // Confetti configuration
    const confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    let confettiParticles = [];
    let animationId;

    // Create confetti particle
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 10 + 5;
            this.weight = Math.random() * 1 + 1;
            this.directionX = Math.random() * 2 - 1;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 5 + 2;
            this.opacity = 1;
        }

        update() {
            this.y += this.weight;
            this.x += this.directionX;
            this.rotation += this.rotationSpeed;
            
            if (this.y > canvas.height) {
                this.opacity -= 0.01;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(0, 0, this.size, this.size);
            ctx.restore();
        }
    }

    // Create confetti shower
    function createConfetti() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        confettiParticles = [];
        
        for (let i = 0; i < 150; i++) {
            confettiParticles.push(new Particle());
        }
        
        function animateConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let particlesToKeep = [];
            
            confettiParticles.forEach(particle => {
                particle.update();
                particle.draw();
                
                if (particle.opacity > 0.1) {
                    particlesToKeep.push(particle);
                }
            });
            
            confettiParticles = particlesToKeep;
            
            if (confettiParticles.length > 0) {
                animationId = requestAnimationFrame(animateConfetti);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
        
        animateConfetti();
    }

    // Event listeners
    rockBtn.addEventListener('click', () => playGame('rock'));
    paperBtn.addEventListener('click', () => playGame('paper'));
    scissorsBtn.addEventListener('click', () => playGame('scissors'));
    resetBtn.addEventListener('click', resetGame);

    // Function to get computer's choice
    function getComputerChoice() {
        const randomIndex = Math.floor(Math.random() * 3);
        return choices[randomIndex];
    }

    // Function to update display with emoji
    function updateChoiceDisplay(playerChoice, computerChoice) {
        const emojis = {
            'rock': '✊',
            'paper': '✋',
            'scissors': '✌️'
        };
        
        playerChoiceDisplay.textContent = emojis[playerChoice];
        computerChoiceDisplay.textContent = emojis[computerChoice];
        
        // Add shake animation
        shakeChoice(playerChoice);
        shakeChoice(computerChoice);
    }

    // Function to update game history
    function updateGameHistory(playerChoice, computerChoice, result) {
        // Check if this round resulted in winning the match
        let matchResult = '';
        if (result.includes('win')) {
            if (result.includes('You win') && playerScore >= 2) {
                matchResult = ' (Match Won by Player!)';
            } else if (result.includes('Computer wins') && computerScore >= 2) {
                matchResult = ' (Match Won by Computer!)';
            }
        } else if (currentRound === maxRounds) {
            // Check for match winner after all rounds
            if (playerScore > computerScore) {
                matchResult = ' (Match Won by Player!)';
            } else if (computerScore > playerScore) {
                matchResult = ' (Match Won by Computer!)';
            } else {
                matchResult = ' (Match Tied!)';
            }
        }

        const historyEntry = {
            round: currentRound,
            player: playerChoice,
            computer: computerChoice,
            result: result + matchResult,
            timestamp: new Date().toISOString()
        };
        
        gameHistory.unshift(historyEntry);
        
        // Keep only last 50 entries
        if (gameHistory.length > 50) {
            gameHistory.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
        
        // Update history display
        gameHistoryDisplay.innerHTML = gameHistory.map(entry => `
            <p>Round ${entry.round}: ${entry.player} vs ${entry.computer} - ${entry.result}</p>
        `).join('');
    }

    // Function to check for early win
    function checkForEarlyWin() {
        if (playerScore >= 2) {
            return "You won the game!";
        } else if (computerScore >= 2) {
            return "Computer won the game!";
        }
        return null;
    }

    // Function to determine the winner
    function determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            playTieSound();
            currentStreak = 0;
            return "It's a tie!";
        }

        if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
            playWinSound();
            createConfetti();
            currentStreak++;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
            return "You win!";
        } else {
            computerScore++;
            computerScoreDisplay.textContent = computerScore;
            playLoseSound();
            currentStreak = 0;
            return "Computer wins!";
        }
    }

    // Main game function
    function playGame(playerChoice) {
        // Check if game is already over
        if (currentRound >= maxRounds || playerScore >= 2 || computerScore >= 2) {
            resultDisplay.textContent = "Game Over! Click Reset to play again.";
            return;
        }

        currentRound++;
        currentRoundDisplay.textContent = currentRound;
        moveCounts[playerChoice]++;

        const computerChoice = getComputerChoice();
        updateChoiceDisplay(playerChoice, computerChoice);

        const result = determineWinner(playerChoice, computerChoice);
        const explanation = getResultExplanation(playerChoice, computerChoice);
        resultDisplay.textContent = `${result} ${explanation}`;
        
        updateGameHistory(playerChoice, computerChoice, result);

        // Check for early win
        const earlyWin = checkForEarlyWin();
        if (earlyWin) {
            totalGames++;
            resultDisplay.textContent = `Game Over! ${earlyWin}`;
            updateStats();
            return;
        }

        // Check if it's the last round
        if (currentRound === maxRounds) {
            totalGames++;
            const finalResult = playerScore > computerScore ? 
                "You won the game!" : 
                playerScore < computerScore ? 
                "Computer won the game!" : 
                "The game ended in a tie!";
            resultDisplay.textContent = `Game Over! ${finalResult}`;
            updateStats();
        }
    }

    // Function to explain the result
    function getResultExplanation(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return `Both chose ${playerChoice}.`;
        }

        const explanations = {
            'rock': {
                'paper': 'Paper covers rock.',
                'scissors': 'Rock crushes scissors.'
            },
            'paper': {
                'rock': 'Paper covers rock.',
                'scissors': 'Scissors cut paper.'
            },
            'scissors': {
                'rock': 'Rock crushes scissors.',
                'paper': 'Scissors cut paper.'
            }
        };

        return explanations[playerChoice][computerChoice] || explanations[computerChoice][playerChoice];
    }

    // Function to reset the game
    function resetGame() {
        playerScore = 0;
        computerScore = 0;
        currentRound = 0;
        currentStreak = 0;
        
        playerScoreDisplay.textContent = '0';
        computerScoreDisplay.textContent = '0';
        currentRoundDisplay.textContent = '0';
        playerChoiceDisplay.textContent = '❓';
        computerChoiceDisplay.textContent = '❓';
        resultDisplay.textContent = 'Choose your weapon!';
        
        if (animationId) {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Load initial game history display
    gameHistoryDisplay.innerHTML = gameHistory.map(entry => `
        <p>Round ${entry.round}: ${entry.player} vs ${entry.computer} - ${entry.result}</p>
    `).join('');
});