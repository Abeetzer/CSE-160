class Game {
  constructor() {
    this.isActive = false;
    this.score = 0;
    this.targets = []; // Holds the active circle shapes
    this.intervalId = null;
  }


  start() {
    this.isActive = true;
    this.score = 0;
    this.targets = [];
    this.updateScoreUI();
    

    document.getElementById('scoreBoard').style.display = 'block';

    // clear timer then start new one
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.spawnTarget(), 1000);
  }

  // stops
  stop() {
    this.isActive = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.targets = [];
    document.getElementById('scoreBoard').style.display = 'none';
  }

  // Creates a new random target
  spawnTarget() {
    if (!this.isActive) return;

    let x = (Math.random() * 2) - 1;
    let y = (Math.random() * 2) - 1;

    let target = new Circle(10); // Assuming your Circle takes segments as an argument
    target.position = [x, y];
    target.color = [1.0, 0.0, 0.0, 1.0]; // Red
    target.size = 20;
    
    this.targets.push(target);
    renderAllShapes(); // Force a redraw so the new target appears
  }

  // Checks if a click hit any of the targets
  checkHit(clickX, clickY) {
    if (!this.isActive) return false;

    for (let i = 0; i < this.targets.length; i++) {
      let target = this.targets[i];
      let dx = clickX - target.position[0];
      let dy = clickY - target.position[1];
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      let hitRadius = target.size / 200; // Matches your rendering scale

      if (distance <= hitRadius) {
        this.targets.splice(i, 1); // Remove the hit target
        this.score++;
        this.updateScoreUI();
        return true; // hit
      }
    }
    return false;
  }

  // render
  renderTargets() {
    for (let i = 0; i < this.targets.length; i++) {
      this.targets[i].render();
    }
  }

  // update html
  updateScoreUI() {
    let scoreSpan = document.getElementById('scoreValue');
    if (scoreSpan) scoreSpan.innerText = this.score;
  }
}