// Moving Ball ASCII Animation
class MovingBall {
    constructor(containerId) {
        this.asciiAnimationDiv = document.getElementById(containerId);
        this.ballX = 0;
        this.ballY = 0;
        this.velocityX = 1;
        this.velocityY = 1;
        this.width = 20;
        this.height = 12;
        this.trail = [];
        this.frame = 0;
        
        this.ballChars = ["o", "O", "*", "@", "#", "+"];
        this.trailChars = [".", ":", "-", " "];
        
        this.init();
    }
    
    updateBall() {
        this.ballX += this.velocityX;
        this.ballY += this.velocityY;

        if (this.ballX <= 0 || this.ballX >= this.width - 1) {
            this.velocityX = -this.velocityX;
            this.ballX = Math.max(0, Math.min(this.width - 1, this.ballX));
        }
        if (this.ballY <= 0 || this.ballY >= this.height - 1) {
            this.velocityY = -this.velocityY;
            this.ballY = Math.max(0, Math.min(this.height - 1, this.ballY));
        }

        // Add to trail
        this.trail.push({ x: this.ballX, y: this.ballY, age: 0 });
        if (this.trail.length > 8) this.trail.shift();

        // Age trail
        this.trail.forEach((t) => t.age++);

        let field = [];
        for (let y = 0; y < this.height; y++) {
            field[y] = [];
            for (let x = 0; x < this.width; x++) {
                field[y][x] = " ";
            }
        }

        this.trail.forEach((t, i) => {
            if (t.age < this.trailChars.length) {
                field[Math.floor(t.y)][Math.floor(t.x)] =
                    this.trailChars[t.age];
            }
        });

        const ballChar = this.ballChars[this.frame % this.ballChars.length];
        field[Math.floor(this.ballY)][Math.floor(this.ballX)] = ballChar;

        // Convert to string
        let output = "";
        for (let y = 0; y < this.height; y++) {
            output += field[y].join("") + "\n";
        }

        this.asciiAnimationDiv.textContent = output;
        this.frame++;
    }
    
    init() {
        setInterval(() => this.updateBall(), 150);
        this.updateBall();
    }
}
