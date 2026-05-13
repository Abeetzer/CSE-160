class Camera {
    constructor(aspectRatio, near, far){
      this.fov = 60;
      this.eye = new Vector3([0, 0, 0]);
      this.at = new Vector3([0, 0, -1]);
      this.up = new Vector3([0, 1, 0]);

      this.speed = 0.3;

    }

applyMovement(moveX, moveZ) {
    let buffer = 0.2;

    this.eye.elements[0] += moveX;
    this.at.elements[0] += moveX;
    let checkX = this.eye.elements[0] + (moveX > 0 ? buffer : -buffer);
    if (this.isSolid(checkX, this.eye.elements[2])) {
      this.eye.elements[0] -= moveX;
      this.at.elements[0] -= moveX;
    }

    this.eye.elements[2] += moveZ;
    this.at.elements[2] += moveZ;
    let checkZ = this.eye.elements[2] + (moveZ > 0 ? buffer : -buffer);
    if (this.isSolid(this.eye.elements[0], checkZ)) {
      this.eye.elements[2] -= moveZ;
      this.at.elements[2] -= moveZ;
    }
  }

  isSolid(x, z) {
    let gridX = Math.floor(x) + 16;
    let gridZ = Math.floor(z) + 16;

    if (gridX < 0 || gridX >= 32 || gridZ < 0 || gridZ >= 32) return true;
    if (g_map[gridX][gridZ] > 0) return true;

    for (let i = 0; i < g_customBlocks.length; i++) {
      let b = g_customBlocks[i];
      if (x >= b.x && x <= b.x + 0.5 && z >= b.z && z <= b.z + 0.5) {
        return true;
      }
    }
    return false;
  }

  moveForward() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.elements[1] = 0;
    f.normalize();
    f.mul(this.speed);
    this.applyMovement(f.elements[0], f.elements[2]);
  }

  moveBackwards() {
    let b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.elements[1] = 0;
    b.normalize();
    b.mul(this.speed);
    this.applyMovement(b.elements[0], b.elements[2]);
  }

  moveLeft() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.elements[1] = 0;
    let s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(this.speed);
    this.applyMovement(s.elements[0], s.elements[2]);
  }

  moveRight() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.elements[1] = 0;
    let s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(this.speed);
    this.applyMovement(s.elements[0], s.elements[2]);
  }

  /*
    moveBackwards(){
      let b = new Vector3();
      b.set(this.eye);
      b.sub(this.at);
      b.normalize();
      b.mul(this.speed);
      this.eye.add(b);
      this.at.add(b);
    }

    moveLeft(){
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      let s = Vector3.cross(this.up, f);
      s.normalize();
      s.mul(this.speed);
      this.eye.add(s);
      this.at.add(s);
    }

    moveRight(){
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      let s = Vector3.cross(f, this.up);
      s.normalize();
      s.mul(this.speed);
      this.eye.add(s);
      this.at.add(s);
    }
*/
    panLeft(alpha){
      // 1. Compute forward vector f = at - eye
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);

      // 2. Convert to polar coordinates (on the XZ plane)
      // r = radius (distance from at), theta = current angle
      let r = Math.sqrt(f.elements[0]*f.elements[0] + f.elements[2]*f.elements[2]);
      let theta = Math.atan2(f.elements[2], f.elements[0]);

      // 3. Change theta by the desired amount 
      // (We convert alpha from degrees to radians because Math.sin/cos expect radians)
      let rad = alpha * (Math.PI / 180);
      theta -= rad; // Subtracting turns the camera left

      // 4. Change back to Cartesian coordinates
      f.elements[0] = r * Math.cos(theta);
      f.elements[2] = r * Math.sin(theta);
      // Note: f.elements[1] (the Y value) stays the exact same!

      // 5. Update the "at" vector: at = eye + f_prime
      this.at.set(this.eye);
      this.at.add(f);
    }

    panRight(alpha){
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);

      let r = Math.sqrt(f.elements[0]*f.elements[0] + f.elements[2]*f.elements[2]);
      let theta = Math.atan2(f.elements[2], f.elements[0]);

      // Convert degrees to radians
      let rad = alpha * (Math.PI / 180);
      theta += rad; // Adding turns the camera right

      f.elements[0] = r * Math.cos(theta);
      f.elements[2] = r * Math.sin(theta);

      this.at.set(this.eye);
      this.at.add(f);

  }

  panUp(alpha) {
      // 1. Calculate the forward vector
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);

      // 2. Find the "Right" vector (the axis we want to tilt around)
      // Cross product of Forward and Up gives us Right
      let right = Vector3.cross(f, this.up);
      right.normalize();

      // 3. Create a rotation matrix around that Right vector
      let rotMat = new Matrix4();
      rotMat.setRotate(alpha, right.elements[0], right.elements[1], right.elements[2]);

      // 4. Apply the rotation to our forward vector
      let f_prime = rotMat.multiplyVector3(f);

      // 5. Update the 'at' point
      this.at.set(this.eye);
      this.at.add(f_prime);
    }

}
