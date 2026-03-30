/**
 * scripts/registry-core.js — VIA User App Registry
 * 
 * Maps sigil patterns to local workspace applications.
 * Handles "Day One" state and user-defined Forge bindings.
 */

window.UserRegistry = {
  // Pre-loaded "Day One" Portfolio State
  defaults: {
    // SkillHex -> Pattern 2-5-8 (Right vertical slice)
    "2,0|2,1|2,2": {
      name: "SkillHex",
      url: "../decide.engine-tools/tools/games/skillhex-mission-control/index.html",
      icon: "🎯",
      lore: "Interactive hiring operations console."
    },
    // Alchemist -> Pattern 0-3-6 (Left vertical slice)
    "0,0|0,1|0,2": {
      name: "Alchemist",
      url: "../VIA/alchemist_app/index.html",
      icon: "🧪",
      lore: "Swipe-based chemistry learning crucible."
    },
    // Viaco -> Pattern 3-4-5 (Middle horizontal - custom mapping to center row)
    "0,1|1,1|2,1": {
      name: "Viaco",
      url: "../VIA/viadecide.html",
      icon: "💼",
      lore: "AI Agent Business Hub."
    },
    // Mars Rover -> Pattern 0-4-8 (Diagonal slice)
    "0,0|1,1|2,2": {
      name: "Mars Rover",
      url: "../decide.engine-tools/mars.html",
      icon: "🚀",
      lore: "Cognitive assessment and rover simulation."
    }
  },

  init() {
    const saved = localStorage.getItem('viaos_user_registry');
    this.apps = saved ? JSON.parse(saved) : {};
    
    // Merge defaults with user apps (user overrides defaults if keys clash)
    this.merged = { ...this.defaults, ...this.apps };
    console.log("[VIA OS] Registry Initialized with", Object.keys(this.merged).length, "endpoints.");
  },

  register(pattern, appData) {
    this.apps[pattern] = appData;
    localStorage.setItem('viaos_user_registry', JSON.stringify(this.apps));
    this.merged = { ...this.defaults, ...this.apps };
    window.dispatchEvent(new CustomEvent('os:registry_updated'));
  },

  get(pattern) {
    return this.merged[pattern];
  }
};

// Auto-init on load
UserRegistry.init();

// Maintain legacy AppRegistry shim for spatial-engine backward compatibility if needed
window.AppRegistry = window.UserRegistry.merged;
