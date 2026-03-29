/**
 * scripts/spatial-engine.js
 * PWA Spatial Operating System Gesture Controller
 */

class SpatialMatrix {
  constructor() {
    this.canvas = document.getElementById('spatial-canvas');
    
    // Virtual Coordinate Map
    // Start at Home [0, 0]
    this.currentX = 0;
    this.currentY = 0;

    // Gesture Tracking
    this.startX = 0;
    this.startY = 0;
    this.isTracking = false;

    // Validation Grid Mask
    this.validNodes = [
      '0,0',
      '0,-1',
      '-1,0',
      '1,0'
    ];

    this.bindGestures();
    this.updateCamera();
  }

  bindGestures() {
    // Prevent default bounce and browser scrolling
    document.body.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.isTracking = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!this.isTracking) return;
      // Optional: We could add live resistance logic here for perfect 1:1 finger tracking, 
      // but the prompt specified triggering a cubic-bezier transition on successful swipe.
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!this.isTracking) return;
      this.isTracking = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - this.startX;
      const deltaY = endY - this.startY;

      const threshold = 50;

      // Determine Axis of dominant intent
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal Swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX < 0) this.requestMove(-1, 0); // Swipe Left -> Look Right (-1)
          else this.requestMove(1, 0);             // Swipe Right -> Look Left (1)
        }
      } else {
        // Vertical Swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) this.requestMove(0, -1); // Swipe Down -> Look Up (-1)
          else this.requestMove(0, 1);             // Swipe Up -> Look Down (1) (None exists in map)
        }
      }
    });
  }

  requestMove(moveX, moveY) {
    const targetX = this.currentX + moveX;
    const targetY = this.currentY + moveY;

    // Boundary Validation
    if (this.validNodes.includes(`${targetX},${targetY}`)) {
      this.currentX = targetX;
      this.currentY = targetY;
      this.updateCamera();
    } else {
      // Hit a wall / No OS node here.
      this.triggerResistance();
    }
  }

  updateCamera() {
    // Math to align Cartesian coords to CSS viewport units
    const translateX = (this.currentX * 100) - 100;
    const translateY = (this.currentY * -100) - 100;
    
    this.canvas.style.transform = `translate(${translateX}vw, ${translateY}vh)`;
  }

  triggerResistance() {
    // A quick micro-animation feedback proving the edge of the OS map was hit.
    // Preserves the existing translation but bounces.
    const baseTx = (this.currentX * 100) - 100;
    const baseTy = (this.currentY * -100) - 100;
    
    // Slightly push outside the matrix natively
    this.canvas.style.transform = `translate(${baseTx - 2}vw, ${baseTy - 2}vh)`;
    setTimeout(() => {
      this.canvas.style.transform = `translate(${baseTx}vw, ${baseTy}vh)`;
    }, 150);
  }
}

// Boot Operating System
document.addEventListener('DOMContentLoaded', () => {
  window.OS = new SpatialMatrix();
});
