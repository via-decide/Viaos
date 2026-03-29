/**
 * scripts/spatial-engine.js — v3 8-Way Gesture OS
 *
 * UPGRADE: 8-way angular swipe (N, S, E, W, NE, NW, SE, SW),
 *          minimalist UX (no zoom/buttons), pattern-based discovery.
 */

// =============================================================================
// PROCEDURAL ROOM ENGINE — Infinite Deterministic Generation
// =============================================================================
class ProceduralRoomEngine {
  constructor() {
    this.sectors = ["Nexus", "Obsidian", "Quantum", "Aegis", "Void", "Echo", "Helios", "Apex"];
    this.departments = ["Archives", "Engineering", "Synthetics", "Logic Core", "Terminal", "Containment", "Armory", "Hub"];
    this.descriptors = ["Classified operations", "Automated drone bay", "Abandoned data sector", "High-security vault", "Processing relay", "Dormant server farm"];
  }

  getRoom(seed, overrideZ = null) {
    if (!seed || seed === '0,0' || seed === 'center' || seed === '0') {
      return { title: 'Galaxy Center', desc: 'The main nexus.', z: overrideZ !== null ? overrideZ : 0 };
    }

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);
    
    const sector = this.sectors[hash % this.sectors.length];
    const dept = this.departments[(hash * 7) % this.departments.length];
    const desc = this.descriptors[(hash * 11) % this.descriptors.length];

    // Z depth derived from pattern complexity (length) if not overridden
    let z = overrideZ;
    if (z === null) {
      z = 0;
      if (seed.length > 20) z = -99;
      else if (seed.length > 14) z = -10;
      else if (seed.length > 7) z = -1;
    }

    if (z === 0) {
      return { title: `${sector} ${dept}`, desc: `Surface Level: ${desc}`, z };
    } else if (z < 0) {
      return { title: `${sector} ${dept} // Sub-Level ${Math.abs(z)}`, desc: `Deep Storage: ${desc}`, z };
    } else {
      return { title: `${sector} ${dept} // Tower ${z}`, desc: `Atmospheric: ${desc}`, z };
    }
  }
}

const RoomMatrix = new ProceduralRoomEngine();

// =============================================================================
// SPATIAL MATRIX — Warp Gate Engine
// =============================================================================
class SpatialMatrix {
  constructor() {
    this.canvas    = document.getElementById('spatial-canvas');
    this.roomName  = document.getElementById('hud-room-name');
    this.roomDesc  = document.getElementById('hud-room-desc');

    // 3D global OS state
    this.currentSeed = '0,0';
    this.currentZ = 0;

    this.ensureNodeExists(); // Populates initial content
    this.attachDelegatedListeners();
    this.attachWarpListener();
    this.updateHUD(RoomMatrix.getRoom(this.currentSeed, this.currentZ));
  }

  attachWarpListener() {
    window.addEventListener('os:pattern_locked', (e) => {
      if (e.detail && e.detail.seed) {
        this.handleWarpGate(e.detail.seed);
      }
    });
  }

  async handleWarpGate(seed) {
    this.currentSeed = seed;
    const room = RoomMatrix.getRoom(seed);
    this.currentZ = room.z;

    // Phase 1: Warp out
    this.centerNode.classList.add('warp-transition', 'warp-out');
    
    await new Promise(r => setTimeout(r, 400));
    
    // Phase 2: Inject remote data
    this.updateHUD(room);
    this.renderNodeContent(this.centerNode, this.currentSeed, this.currentZ);

    // Phase 3: Settle with flash
    this.centerNode.classList.remove('warp-out');
    this.centerNode.classList.add('warp-in');
    
    await new Promise(r => setTimeout(r, 600));
    this.centerNode.classList.remove('warp-transition', 'warp-in');

    this.dispatchNodeChanged(room);
  }

  updateHUD(room) {
    if (!room) return;
    if (this.roomName) this.roomName.textContent = room.title;
    if (this.roomDesc) this.roomDesc.textContent = room.desc;
  }

  renderNodeContent(node, seed, z) {
    const room = RoomMatrix.getRoom(seed, z);
    if (!room) return;

    let html = `<h2>${room.title}</h2><div id="room-environment" class="node-grid">`;

    // hash to generate dummy nodes based on seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);
    
    // Always provide ascend/descend nodes based on formal spec rules
    if (z <= 0) {
      html += `<button class="access-node depth-descend" data-delta="-1">[ DECRYPT : SUB-LEVEL ${Math.abs(z - 1)} ]</button>`;
    }
    if (z < 0) {
      html += `<button class="access-node depth-ascend" data-delta="1">[ AIRLOCK : RETURN TO Z-${z + 1} ]</button>`;
    }

    // Add dummy active nodes to make the room feel operational (1 to 3)
    const dummyCount = (hash % 3) + 1;
    const dummyTasks = ["EXTRACT LOGS", "SYSTEM SCAN", "SYNC TERMINAL", "BYPASS PROTOCOL", "MONITOR FEED", "DIAGNOSTIC"];
    
    for (let i = 0; i < dummyCount; i++) {
        const tIndex = (hash + i * 5) % dummyTasks.length;
        html += `<button class="access-node dummy-node">[ ${dummyTasks[tIndex]} ]</button>`;
    }

    html += `</div>`;
    node.innerHTML = html;
  }

  ensureNodeExists() {
    this.canvas.innerHTML = '';
    this.centerNode = document.createElement('div');
    this.centerNode.className = 'os-node discovery-node centered';
    this.canvas.appendChild(this.centerNode);
    this.renderNodeContent(this.centerNode, this.currentSeed, this.currentZ);
  }

  dispatchNodeChanged(room) {
    window.dispatchEvent(new CustomEvent('os:node_changed', {
      detail: { 
        seed: this.currentSeed,
        z: this.currentZ, 
        title: room ? room.title : 'Uncharted Sector' 
      }
    }));
  }

  // ─── Z-AXIS ELEVATOR (INTERACTIVE DEPTH) ────────────────────────────────────

  attachDelegatedListeners() {
    this.canvas.addEventListener('click', (e) => {
      const target = e.target.closest('.depth-ascend, .depth-descend');
      if (!target) return;
      
      const delta = parseInt(target.getAttribute('data-delta'));
      if (delta) this.changeFloor(delta);
    });
  }

  async changeFloor(delta) {
    const targetZ = this.currentZ + delta;
    const room = RoomMatrix.getRoom(this.currentSeed, targetZ);
    if (!room) return;

    // Transition: scale up (dive in) or scale down (return)
    const direction = delta > 0 ? 'ascend' : 'descend';
    
    // Phase 1: Dive out of current view
    this.canvas.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
    this.canvas.style.opacity = '0';
    this.canvas.style.transform += delta < 0 ? ' scale(1.5)' : ' scale(0.5)';

    await new Promise(r => setTimeout(r, 600));

    // Phase 2: Swap content & render depth
    this.currentZ = targetZ;
    this.updateHUD(room);
    
    // Re-render centralized node
    this.renderNodeContent(this.centerNode, this.currentSeed, this.currentZ);

    // Position for "arrival"
    this.centerNode.style.transition = 'none';
    this.centerNode.style.transform = `scale(${delta < 0 ? 0.5 : 1.5})`;
    
    // Phase 3: Settle in
    requestAnimationFrame(() => {
      this.centerNode.style.transition = 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.6s ease';
      this.centerNode.style.opacity = '1';
      this.centerNode.style.transform = `scale(1.0)`;
    });

    this.dispatchNodeChanged(room);
    window.dispatchEvent(new CustomEvent('os:floor_changed', { detail: { z: this.currentZ } }));
  }
}

document.addEventListener('DOMContentLoaded', () => { window.OS = new SpatialMatrix(); });
