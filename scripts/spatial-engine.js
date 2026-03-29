/**
 * scripts/spatial-engine.js — v2 3D Spatial Hyper-Structure
 *
 * UPGRADE: Z-axis depth (Floors/Nested Rooms), RoomDictionary (no raw coords),
 *          holographic minimap, GPU-accelerated camera with distinct Z transitions.
 */

// =============================================================================
// ROOM DICTIONARY — [X,Y,Z] → immersive name + description
// Never expose raw coordinate strings to the user.
// =============================================================================
const RoomDictionary = {
  '0,0,0':   { title: 'Main Room',           desc: 'The main nexus of all operations.' },
  '0,-1,0':  { title: 'Observation Deck',    desc: 'Search & Files wing. Sky-level access.' },
  '-1,0,0':  { title: 'Media Vault',         desc: 'Media & Movies archive. Visual immersion bay.' },
  '1,0,0':   { title: 'Simulation Chamber',  desc: 'Games & Logic arena. Reality sandbox.' },
  '0,0,-1':  { title: 'Command Core',        desc: 'Sub-level control systems. Deep operations.' },
  '0,-1,-1': { title: 'Research Archives',   desc: 'Sub-basement data level. Classified records.' },
};

// Expose for session-compiler.js
window.RoomDictionary = RoomDictionary;

// =============================================================================
// GESTURE INTERCEPTOR — touch events with conflict resolution
// =============================================================================
class GestureInterceptor {
  constructor(onSwipe) {
    this.onSwipe = onSwipe;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isTracking = false;

    this.SWIPE_THRESHOLD = 60; // px
    this.SWIPE_TIME_MAX = 300; // ms

    this.bindListeners();
  }

  bindListeners() {
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
  }

  isScrollableElement(target) {
    return target.closest('.scroll-area, canvas, [data-no-swipe], .elevator-btn, #btn-conclude-session, #btn-install-os') !== null;
  }

  handleTouchStart(e) {
    if (this.isScrollableElement(e.target)) { this.isTracking = false; return; }
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.startTime = Date.now();
    this.isTracking = true;
  }

  handleTouchMove(e) {
    // Reserved for future 1:1 resistance tracking
  }

  handleTouchEnd(e) {
    if (!this.isTracking) return;
    this.isTracking = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = Date.now() - this.startTime;

    if (duration > this.SWIPE_TIME_MAX) return;
    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD && Math.abs(deltaY) < this.SWIPE_THRESHOLD) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) this.onSwipe(-1, 0); else this.onSwipe(1, 0);
    } else {
      if (deltaY < 0) this.onSwipe(0, -1); else this.onSwipe(0, 1);
    }
  }
}

// =============================================================================
// SPATIAL MATRIX — Core 3D OS state, camera, and navigation
// =============================================================================
class SpatialMatrix {
  constructor() {
    this.canvas    = document.getElementById('spatial-canvas');
    this.minimap   = document.getElementById('os-minimap');
    this.roomName  = document.getElementById('hud-room-name');
    this.roomDesc  = document.getElementById('hud-room-desc');
    this.btnDescend = document.getElementById('btn-descend');
    this.btnAscend  = document.getElementById('btn-ascend');

    // 3D global OS state
    this.currentX = 0;
    this.currentY = 0;
    this.currentZ = 0;

    this.initMinimap();
    this.setupGestureInterceptor();
    this.updateCamera();
    this.updateHUD();
    this.updateAllNodeLabels();
    this.updateZButtons();
    this.attachMinimapListener();
    this.attachZButtonListeners();
  }

  // ─── ROOM HELPERS ───────────────────────────────────────────────────────────

  getRoomKey(x, y, z) {
    return `${x},${y},${z}`;
  }

  getRoomAt(x, y, z) {
    return RoomDictionary[this.getRoomKey(x, y, z)] || null;
  }

  getCurrentRoom() {
    return this.getRoomAt(this.currentX, this.currentY, this.currentZ);
  }

  // ─── MINIMAP ────────────────────────────────────────────────────────────────

  initMinimap() {
    this.minimap.innerHTML = '';
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        const dot = document.createElement('div');
        dot.className = 'hud-dot';
        dot.setAttribute('data-x', x);
        dot.setAttribute('data-y', y);
        if (x === this.currentX && y === this.currentY) dot.classList.add('active');
        this.minimap.appendChild(dot);
      }
    }
  }

  setupGestureInterceptor() {
    this.interceptor = new GestureInterceptor((moveX, moveY) => this.requestMove(moveX, moveY));
  }

  // ─── MOVEMENT ───────────────────────────────────────────────────────────────

  /**
   * Request X/Y movement — validated against RoomDictionary at current Z.
   */
  requestMove(moveX, moveY) {
    const tx = this.currentX + moveX;
    const ty = this.currentY + moveY;

    if (this.getRoomAt(tx, ty, this.currentZ)) {
      this.currentX = tx;
      this.currentY = ty;
      this.updateCamera();
      this.updateHUD();
      this.updateAllNodeLabels();
      this.updateZButtons();
      this.dispatchNodeChanged();
    } else {
      this.triggerResistance();
    }
  }

  /**
   * Descend one floor (Z - 1). Applies a distinct scale-zoom CSS transition.
   */
  requestDescend() {
    const tz = this.currentZ - 1;
    if (this.getRoomAt(this.currentX, this.currentY, tz)) {
      this.currentZ = tz;
      this.triggerZTransition('descend');
      this.updateCamera();
      this.updateHUD();
      this.updateAllNodeLabels();
      this.updateZButtons();
      this.dispatchNodeChanged();
    }
  }

  /**
   * Ascend one floor (Z + 1). Only valid when below surface level.
   */
  requestAscend() {
    if (this.currentZ >= 0) return;
    const tz = this.currentZ + 1;
    if (this.getRoomAt(this.currentX, this.currentY, tz)) {
      this.currentZ = tz;
      this.triggerZTransition('ascend');
      this.updateCamera();
      this.updateHUD();
      this.updateAllNodeLabels();
      this.updateZButtons();
      this.dispatchNodeChanged();
    }
  }

  /**
   * Teleport directly to [x, y, z] — used by the session compiler on reset.
   */
  teleportTo(x, y, z) {
    if (!this.getRoomAt(x, y, z)) return;
    this.currentX = x;
    this.currentY = y;
    this.currentZ = z;
    this.updateCamera();
    this.updateHUD();
    this.updateAllNodeLabels();
    this.updateZButtons();
    this.dispatchNodeChanged();
  }

  // ─── CAMERA ─────────────────────────────────────────────────────────────────

  /**
   * GPU-accelerated camera.
   * X/Y: translate3d sliding (cubic-bezier 0.4s — handled by base CSS transition).
   * Z:   scale zoom — each depth level zooms in by 40% (Z=-1 → scale 1.4).
   *      The z-transition-* class temporarily overrides to a slower, distinct easing.
   */
  updateCamera() {
    const tx = (this.currentX * 100) - 100;
    const ty = (this.currentY * -100) - 100;
    const zScale = 1 + (this.currentZ * -0.4); // Z=0→1.0, Z=-1→1.4, Z=-2→1.8

    this.canvas.style.transform =
      `translate3d(calc(${tx}vw), calc(${ty}vh), 0) scale(${zScale})`;
  }

  // ─── HUD ────────────────────────────────────────────────────────────────────

  updateHUD() {
    const room = this.getCurrentRoom();
    if (!room) return;
    if (this.roomName) this.roomName.textContent = room.title;
    if (this.roomDesc) this.roomDesc.textContent = room.desc;
  }

  /**
   * Update every node's h2 label to reflect the room name at the current Z level.
   * Nodes with no room at the current Z are visually dimmed.
   */
  updateAllNodeLabels() {
    document.querySelectorAll('.os-node').forEach(node => {
      const nx = parseInt(node.getAttribute('data-x'));
      const ny = parseInt(node.getAttribute('data-y'));
      const room = this.getRoomAt(nx, ny, this.currentZ);
      const h2 = node.querySelector('h2');
      if (!h2) return;

      if (room) {
        h2.textContent = room.title;
        node.classList.remove('node-void');
      } else {
        // Keep the Z=0 name as a ghost label, visually faded
        const surfaceRoom = this.getRoomAt(nx, ny, 0);
        h2.textContent = surfaceRoom ? surfaceRoom.title : '—';
        node.classList.add('node-void');
      }
    });
  }

  updateZButtons() {
    const canDescend = this.getRoomAt(this.currentX, this.currentY, this.currentZ - 1) !== null;
    const canAscend  = this.currentZ < 0 &&
                       this.getRoomAt(this.currentX, this.currentY, this.currentZ + 1) !== null;

    if (this.btnDescend) this.btnDescend.style.display = canDescend ? 'flex' : 'none';
    if (this.btnAscend)  this.btnAscend.style.display  = canAscend  ? 'flex' : 'none';
  }

  attachZButtonListeners() {
    if (this.btnDescend) this.btnDescend.addEventListener('click', () => this.requestDescend());
    if (this.btnAscend)  this.btnAscend.addEventListener('click',  () => this.requestAscend());
  }

  // ─── Z TRANSITION EFFECT ────────────────────────────────────────────────────

  /**
   * Add a CSS class to override the transition easing to a slower, more dramatic
   * scale curve — making Z movement feel distinctly different from X/Y sliding.
   */
  triggerZTransition(direction) {
    this.canvas.classList.add(`z-transition-${direction}`);
    setTimeout(() => this.canvas.classList.remove(`z-transition-${direction}`), 700);
  }

  // ─── EVENTS & RESISTANCE ────────────────────────────────────────────────────

  dispatchNodeChanged() {
    const room = this.getCurrentRoom();
    window.dispatchEvent(new CustomEvent('os:node_changed', {
      detail: {
        x: this.currentX,
        y: this.currentY,
        z: this.currentZ,
        title: room ? room.title : ''
      }
    }));
  }

  triggerResistance() {
    const baseTx = (this.currentX * 100) - 100;
    const baseTy = (this.currentY * -100) - 100;
    const zScale = 1 + (this.currentZ * -0.4);

    this.canvas.style.transform =
      `translate3d(calc(${baseTx - 2}vw), calc(${baseTy - 2}vh), 0) scale(${zScale})`;
    setTimeout(() => {
      this.canvas.style.transform =
        `translate3d(calc(${baseTx}vw), calc(${baseTy}vh), 0) scale(${zScale})`;
    }, 150);
  }

  // ─── MINIMAP DATA BINDING ───────────────────────────────────────────────────

  attachMinimapListener() {
    window.addEventListener('os:node_changed', (event) => {
      const { x, y, z } = event.detail;
      this.minimap.querySelectorAll('.hud-dot').forEach(dot => dot.classList.remove('active'));
      const activeDot = this.minimap.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (activeDot) activeDot.classList.add('active');

      // Show depth indicator on minimap
      const depthEl = document.getElementById('hud-depth-label');
      if (depthEl) {
        depthEl.textContent = z < 0 ? `Floor ${z}` : 'Surface';
        depthEl.style.color = z < 0 ? 'rgba(0,255,150,0.9)' : 'rgba(255,255,255,0.4)';
      }
    });
  }
}

// =============================================================================
// BOOT
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  window.OS = new SpatialMatrix();
  console.log('[VIA OS] 3D Spatial Matrix online. RoomDictionary loaded:', Object.keys(RoomDictionary).length, 'nodes.');
});
