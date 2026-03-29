// spatial-engine.js
// Via-OS Spatial Engine

class SpatialEngine {
  constructor() {
    this.nodes = {};
    this.macros = this.createMacroRegistry();
  }

  createMacroRegistry() {
    const macros = {
      "0,0|0,1|1,0": "decision-core",
      "1,0|1,1|2,0": "creator-studio",
      "-1,-1|-1,0|-1,1": "utility-subsystem",
      "2,2|2,3|3,2": "analytics-bay",
    };

    if (window.masterKeySigil) {
      macros[window.masterKeySigil] = "root";
    }

    return macros;
  }

  registerNode(id, data) {
    this.nodes[id] = data;
  }

  getNode(id) {
    return this.nodes[id];
  }

  detectMacro(pattern) {
    return this.macros[pattern] || null;
  }

  connectNodes(source, target) {
    if (!this.nodes[source] || !this.nodes[target]) {
      console.warn("Invalid node connection:", source, target);
      return;
    }

    if (!this.nodes[source].outputs) {
      this.nodes[source].outputs = [];
    }

    this.nodes[source].outputs.push(target);
  }

  exportGraph() {
    return JSON.stringify(this.nodes, null, 2);
  }
}

window.SpatialEngine = new SpatialEngine();
