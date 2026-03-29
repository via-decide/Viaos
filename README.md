# ViaDecide: Spatial Navigation Framework

![Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)

> "The app grid is a fossil of the desktop era. We don't need folders; we need intent."

**ViaDecide Spatial OS** is an experimental human-computer interface (HCI) designed to eliminate digital friction through **Intent-Based Navigation**. By replacing the traditional icon-based grid with a 3x3 pattern matrix, the OS transforms user interaction into a series of cryptographic, geometric signatures known as **Sigils**.

---

## 🏛 The Philosophy: Spatial Intent

Traditional operating systems force the user to "hunt and peck" through layers of menus and icon clusters. This creates cognitive load and fragmentation of focus. 

ViaDecide proposes a **Spatial Tower** architecture:
- **Zero Friction:** No searching for apps. You draw the shape of your intent.
- **Muscle Memory:** Complex workflows are mapped to simple geometric patterns (Warp Gates).
- **Infinite Depth:** The OS is modeled as a 3D skyscraper. Patterns determine your sector and your depth (Z-level), allowing for deterministic, procedural exploration of tools.

---

## 🛠 Technical Stack: The Hardware-Agnostic Core

The framework is built with a strict **"No-Framework"** philosophy to ensure maximum performance, zero dependency rot, and total hardware agnosticism.

- **Engine:** Pure Vanilla JavaScript (ES6+).
- **Rendering:** CSS Hardware Acceleration & Transitions (Composite Layers).
- **Architecture:** Progressive Web App (PWA) with Service Worker caching.
- **Portability:** Designed to run on anything with a browser—from high-end workstations to minimalist mobile devices.

---

## 🔮 The Sigil System (`pattern-tracer.js`)

The heart of the OS is the **Sigil Engine**. Unlike standard pattern locks, the ViaDecide tracer supports:
- **Infinite Length:** Complex paths that can cross the same node multiple times.
- **Overlap Logic:** Geometric recursion allowed for advanced cryptographic routing.
- **Warp Gates:** Traces are converted into a coordinate-agnostic `seed` string, which is then hashed to determine your destination in the Spatial Matrix.

Each "Macro Zone" (Decision Core, Logic Academy, Orchard Engine, etc.) is anchored to a specific geometric signature, while procedural generation handles the "uncharted" space between them.

---

## 🚀 Quick Start

### 1. Local Hosting
The OS requires a secure context (or localhost) for PWA features. You can host it instantly using Python or Node:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx http-server . -p 8080
```

### 2. PWA Installation
For the intended "fullscreen" immersive experience:
- **Android:** Open the URL in Chrome -> "Add to Home Screen".
- **iOS:** Open in Safari -> "Share" -> "Add to Home Screen".

---

## 🤝 Contribution: Expanding the Tower

We invite cyber-architects and engineers to expand the Spatial OS. 

- **Macro Zones:** Define new functional sectors in `scripts/ecosystem-data.js`.
- **Glass Viewport:** Contribute new Micro-Tools designed for the split-screen window manager.
- **Warp Extensions:** Enhance the `spatial-engine.js` with new procedural descriptors.

*Join the synthesis. Redefine the interface.*

---

**© 2026 ViaDecide. Released under the Apache 2.0 License.**
