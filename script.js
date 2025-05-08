document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    const choices = ['rock', 'paper', 'scissors'];
    let playerScore = 0;
    let computerScore = 0;

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
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

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
        // Clear any existing animation
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        confettiParticles = [];
        
        // Create particles
        for (let i = 0; i < 150; i++) {
            confettiParticles.push(new Particle());
        }
        
        // Animate the confetti
        function animateConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let particlesToKeep = [];
            
            confettiParticles.forEach(particle => {
                particle.update();
                particle.draw();
                
                // Keep particles that are still visible
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
    }

    // Function to determine the winner
    function determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return "It's a tie!";
        }

        if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
            
            // Launch confetti for the win!
            createConfetti();
            
            return "You win!";
        } else {
            computerScore++;
            computerScoreDisplay.textContent = computerScore;
            return "Computer wins!";
        }
    }

    // Main game function
    function playGame(playerChoice) {
        const computerChoice = getComputerChoice();
        updateChoiceDisplay(playerChoice, computerChoice);

        const result = determineWinner(playerChoice, computerChoice);
        resultDisplay.textContent = `${result} ${getResultExplanation(playerChoice, computerChoice)}`;
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
        playerScoreDisplay.textContent = '0';
        computerScoreDisplay.textContent = '0';
        playerChoiceDisplay.textContent = '❓';
        computerChoiceDisplay.textContent = '❓';
        resultDisplay.textContent = 'Choose your weapon!';
        
        // Clear any existing confetti
        if (animationId) {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
});