const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let particlesArray;

// Set canvas dimensions
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = document.getElementById('inicio').offsetHeight;
}
setCanvasSize();

// Handle resize
window.addEventListener('resize', () => {
    setCanvasSize();
    init();
});

// Mouse position
let mouse = {
    x: null,
    y: null,
    radius: 150 // Radius of interaction
}

// Update mouse position on mouse move
window.addEventListener('mousemove', function (event) {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

// Reset mouse position when leaving the hero section
document.getElementById('inicio').addEventListener('mouseleave', function () {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Create Particle class
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1; // Used for mouse interaction weight
    }

    // Method to draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Check particle position, check mouse position, move the particle, draw the particle
    update() {
        // Check if particle is still within canvas
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Check collision detection - mouse position / particle position
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            // Push particles away (if you want them to attract, use + instead of -)
            this.x -= directionX;
            this.y -= directionY;
        } else {
            // Return to base position slowly
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }

        // Move particle normally
        this.baseX += this.directionX;
        this.baseY += this.directionY;
        this.x += this.directionX;
        this.y += this.directionY;

        // Draw particle
        this.draw();
    }
}

// Create particles array
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;

    // Scale number of particles down for performance on smaller screens
    if (window.innerWidth < 768) {
        numberOfParticles = numberOfParticles / 2;
    }

    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1; // Make particles slightly smaller
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);

        let directionX = (Math.random() * 0.4) - 0.2; // Slower movement
        let directionY = (Math.random() * 0.4) - 0.2;

        // Brand colors: JM Borracharia Blue, and white/grey variants, with opacity
        const colors = [
            'rgba(0, 84, 166, 0.7)', // --color-primary #0054A6
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0.1)'
        ];
        let color = colors[Math.floor(Math.random() * colors.length)];

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Check if particles are close enough to draw line between them
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

            // If they are close, draw a line
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 10000);
                // Line color: slight blue tint
                ctx.strokeStyle = `rgba(0, 84, 166, ${opacityValue * 0.15})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

// Start
init();
animate();
