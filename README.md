<h1 align="center">Aroma 3D — Interactive Coffee Shop Experience</h1>

<p align="center">
  <em>A premium 3D landing page where every scroll tells a story — procedurally rendered, zero assets, pure WebGL.</em>
</p>

<p align="center">
  <a href="https://coffeeshop-3d.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=flat-square&logo=vercel" alt="Live Demo"/></a>
  <a href="https://github.com/sa1165/Espresso_web"><img src="https://img.shields.io/github/stars/sa1165/Espresso_web?style=flat-square&color=FFD700" alt="Stars"/></a>
  <img src="https://img.shields.io/badge/HTML5-Semantic-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-Vanilla-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Three.js-v128-000000?style=flat-square&logo=threedotjs" alt="Three.js"/>
  <img src="https://img.shields.io/badge/GSAP-ScrollTrigger-88CE02?style=flat-square" alt="GSAP"/>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"/></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [3D Scene Breakdown](#3d-scene-breakdown)
- [Animation System](#animation-system)
- [Performance & Optimizations](#performance--optimizations)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**Aroma 3D** is a premium, fully interactive 3D landing page for an artisanal coffee shop — built with **zero external 3D assets**. Every element of the 3D scene (the coffee cup, saucer, handle, liquid surface, rim, and floating coffee beans) is generated **procedurally in JavaScript** using Three.js geometries, eliminating asset loading lag and CORS errors entirely.

The project demonstrates advanced frontend engineering across three disciplines simultaneously: **WebGL 3D rendering**, **scroll-linked animation architecture**, and **interactive state management** — all in vanilla HTML, CSS, and JavaScript with no build tools, no frameworks, and no bundler.

> Built to showcase production-level frontend capability — scroll-bound WebGL, decoupled animation layers, a physics-like bounce system, and a 65-particle steam system — in a single `main.js` file.

**Quick links:**
🌐 [Live Demo](https://coffeeshop-3d.vercel.app) &nbsp;·&nbsp;
📁 [index.html](https://github.com/sa1165/Espresso_web/blob/main/index.html) &nbsp;·&nbsp;
🎨 [styles.css](https://github.com/sa1165/Espresso_web/blob/main/styles.css) &nbsp;·&nbsp;
⚙️ [main.js](https://github.com/sa1165/Espresso_web/blob/main/main.js)

---

## Live Demo

🌐 **[coffeeshop-3d.vercel.app](https://coffeeshop-3d.vercel.app)**

> Best experienced on desktop with a mouse for full parallax and scroll effects. Mobile-responsive with a simplified nav.

---

## Features

### ☕ Procedural 3D Modeling — Zero Asset Lag

The entire 3D coffee cup scene is built programmatically inside `main.js` using Three.js geometries — no `.gltf`, no `.obj`, no `.fbx` files are loaded.

Components generated in code:

| Part | Geometry | Notes |
|---|---|---|
| Outer cup wall | `CylinderGeometry` with vertex manipulation | Tapered profile |
| Inner cup wall | Scaled inner cylinder | Separate material for interior depth |
| Cup rim | `TorusGeometry` | Smooth ceramic lip |
| Liquid surface | `CircleGeometry` | Color-morphable per drink selection |
| Handle | Custom `TubeGeometry` along a `CatmullRomCurve3` | Ergonomic C-curve |
| Ceramic saucer | Flat `CylinderGeometry` | Dish with rim edge |
| Floating coffee beans | `SphereGeometry` + rotation offset | 3D orbiting decorative beans |

**Why this matters:** No network requests for 3D assets = instant scene load, zero CORS errors in local development, fully self-contained deployment.

---

### 🎬 Decoupled Animation Architecture

The 3D scene uses a **two-group hierarchy** to prevent GSAP scroll timelines from conflicting with interaction animations:

```
THREE.Scene
└── cupGroup                  ← GSAP ScrollTrigger owns this
    ├── position.x            (shifts cup left / right / center on scroll)
    ├── rotation.z            (tilts cup on scroll)
    └── cupModelGroup         ← Interaction animations own this
        ├── position.y        (physics-like bounce on menu click)
        └── [all cup parts]   (cup walls, rim, handle, liquid, beans)
```

- **`cupGroup`** handles **layout** — where the cup sits on the page as you scroll.
- **`cupModelGroup`** handles **local interactions** — bouncing, floating, tilting in response to user actions.

This clean separation means scroll animations and click interactions can run simultaneously without fighting over the same transform properties.

---

### 🍵 Interactive 3D Drink Menu

Clicking a menu item triggers a coordinated multi-system response:

1. **Flavor card** — fades in a glassmorphic details panel with the drink's flavor profile
2. **Cup bounce** — `cupModelGroup.position.y` animates a physics-like bounce (up → overshoot → settle)
3. **Liquid color morph** — the liquid surface material transitions smoothly to the drink's color and roughness

| Drink | Liquid Color | Roughness | Profile |
|---|---|---|---|
| Classic Espresso | `#3b1a08` (deep brown) | 0.1 | Bold, intense |
| Velvet Latte | `#c4956a` (creamy beige) | 0.3 | Smooth, milky |
| Frothy Cappuccino | `#e8d5b7` (foam white) | 0.5 | Airy, textured |
| Ceremonial Matcha | `#4a7c59` (ceremonial green) | 0.2 | Earthy, vibrant |

---

### 💨 Drifting Steam Particle System

65 particles rise organically from the liquid surface using canvas-drawn circular textures:

- Each particle has a randomised `speed`, `size`, `drift amplitude`, and `phase offset`
- Drift path computed per-frame: `x += sin(time × speed + phase) × driftAmount`
- Vertical drift: `y += speed × 0.01` — resets to liquid surface when particle exits the scene
- Rendered as `THREE.Points` with `AdditiveBlending` for a soft, glowing steam look

---

### 🖱️ Mouse Parallax

Mouse coordinates are tracked globally and mapped to camera tilt:

```javascript
// Normalised mouse position → camera offset
camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05
camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.05
camera.lookAt(scene.position)
```

The lerp factor (`0.05`) gives a smooth, laggy follow — not a direct snap — creating the perception of real 3D depth as the cursor moves.

---

### 🎞️ Scroll-Linked Scene Choreography

GSAP ScrollTrigger drives the 3D cup through a multi-act narrative as the user scrolls:

| Scroll Section | Animation |
|---|---|
| Hero (0%) | Cup centred, upright, full opacity |
| Menu section | Cup shifts left, menu cards fade in right |
| About section | Cup shifts right, tilts slightly, text appears left |
| Footer approach | Cup scales down, fades, beans drift off |

---

## Technical Architecture

```
Browser
  │
  ├── index.html          Semantic markup, CDN imports (Three.js, GSAP)
  │
  ├── styles.css          Design tokens, layout, glassmorphism, media queries
  │
  └── main.js
        │
        ├── WebGL Setup
        │   ├── THREE.WebGLRenderer (antialias, alpha: true)
        │   ├── PerspectiveCamera (FOV 45, responsive aspect ratio)
        │   └── Lighting rig (Spotlight + Ambient + Rim + Cup glow PointLight)
        │
        ├── Scene Graph
        │   ├── cupGroup (ScrollTrigger target)
        │   │   └── cupModelGroup (Interaction target)
        │   │       ├── Outer wall, inner wall, rim
        │   │       ├── Handle (CatmullRomCurve3 tube)
        │   │       ├── Liquid surface (color-morphable)
        │   │       ├── Saucer
        │   │       └── Coffee beans (orbit group)
        │   └── Steam particle system (THREE.Points)
        │
        ├── GSAP Timeline
        │   └── ScrollTrigger → cupGroup transforms
        │
        ├── Event Listeners
        │   ├── Menu item click → bounce + color morph + flavor card
        │   ├── mousemove → camera parallax
        │   └── resize → renderer + camera aspect update
        │
        └── Animation Loop (requestAnimationFrame)
            ├── Steam particle update
            ├── Bean orbit rotation
            ├── Camera parallax lerp
            └── renderer.render(scene, camera)
```

---

## 3D Scene Breakdown

### Lighting Rig

Four lights combine to give the cup its ceramic premium look:

| Light | Type | Role |
|---|---|---|
| Key light | `SpotLight` | Primary illumination — casts shadows |
| Ambient | `AmbientLight` | Fills shadow areas, prevents pitch black |
| Rim light | `DirectionalLight` (rear) | Edge highlight on cup wall |
| Cup glow | `PointLight` (inside cup) | Warm internal glow from liquid |

### Materials

| Part | Material | Properties |
|---|---|---|
| Cup body | `MeshStandardMaterial` | Roughness 0.2, Metalness 0.1 — ceramic |
| Liquid surface | `MeshStandardMaterial` | Color-morphable, roughness varies per drink |
| Coffee beans | `MeshStandardMaterial` | Dark brown, roughness 0.8 |
| Steam particles | `PointsMaterial` | Canvas texture, AdditiveBlending, transparent |

---

## Animation System

### GSAP ScrollTrigger Timeline

```javascript
// Example scroll binding (simplified)
gsap.timeline({
  scrollTrigger: {
    trigger: "#menu",
    start: "top center",
    end: "bottom center",
    scrub: 1.5             // Smooth lag behind scroll
  }
})
.to(cupGroup.position, { x: -2.5, duration: 1 })
.to(cupGroup.rotation, { z: 0.08, duration: 0.5 }, "<")
```

- `scrub: 1.5` — animation follows scroll with 1.5s lag for a cinematic feel
- All `cupGroup` transforms are driven here — never mixed with interaction code

### Drink Menu Bounce (Interaction Layer)

```javascript
// Physics-like bounce on cupModelGroup — independent of ScrollTrigger
gsap.to(cupModelGroup.position, {
  y: 0.3,                  // Rise
  duration: 0.15,
  ease: "power2.out",
  onComplete: () => {
    gsap.to(cupModelGroup.position, {
      y: 0,                // Fall + overshoot settle
      duration: 0.6,
      ease: "elastic.out(1, 0.4)"
    })
  }
})
```

---

## Performance & Optimizations

| Optimization | Implementation | Impact |
|---|---|---|
| **Procedural geometry** | All 3D parts built from Three.js primitives — no file I/O | Zero network requests for 3D assets |
| **Zero CORS errors** | No external `.gltf`/`.obj` files | Works offline, works on `file://` protocol |
| **Canvas-drawn particle texture** | Steam texture drawn to `<canvas>` at runtime | No PNG/sprite sheet loading |
| **Decoupled animation groups** | Separate `cupGroup` / `cupModelGroup` hierarchy | Prevents GSAP conflicts, predictable transforms |
| **RAF-based loop** | Single `requestAnimationFrame` loop for all updates | No redundant renders |
| **Scrub-based ScrollTrigger** | `scrub: 1.5` — no `onUpdate` callbacks needed | Minimal JS execution per scroll event |
| **Responsive renderer** | `renderer.setPixelRatio(window.devicePixelRatio)` + resize listener | Sharp on retina, no over-rendering on low-DPI |
| **CDN imports** | Three.js and GSAP via CDN — no bundler | Zero build time, instant setup |

---

## Project Structure

```
Espresso_web/
│
├── index.html          # Semantic HTML — <header>, <section>, <footer>, inline SVGs
├── styles.css          # Custom design system — tokens, grid, glassmorphism, media queries
├── main.js             # WebGL renderer, 3D scene, GSAP bindings, all interaction logic
│
└── README.md
```

No `node_modules`. No `package.json`. No build step. Three files — ship it.

---

## Getting Started

### Option 1 — View Live

🌐 **[coffeeshop-3d.vercel.app](https://coffeeshop-3d.vercel.app)** — nothing to install.

### Option 2 — Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/sa1165/Espresso_web.git
cd Espresso_web
```

Then serve with any static server (required for ES module CDN imports):

**Python (built-in):**
```bash
python -m http.server 8080
# Open http://localhost:8080
```

**Node.js:**
```bash
npx serve .
# Open http://localhost:3000
```

**VS Code Live Server:**
- Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- Right-click `index.html` → Open with Live Server

> ⚠️ Do not open `index.html` directly via `file://` protocol — CDN modules require HTTP. Use any of the servers above.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#1a0f0a` (charcoal-chocolate) | Page background |
| Primary text | `#f5f0e8` (warm cream) | Body copy |
| Gold accent | `#d4af37` | Headlines, borders, CTAs |
| Glass panel | `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)` | Menu cards, flavor details |
| Scrollbar | Custom — gold thumb on dark track | `webkit-scrollbar` |
| Font | System serif stack + monospace accents | Premium editorial feel |

---

## Roadmap

- [ ] **Sound design** — ambient café sounds on scroll + coffee pour on drink select
- [ ] **Pour animation** — animated liquid fill when switching drinks
- [ ] **Bean physics** — coffee beans with `Cannon.js` gravity and collisions
- [ ] **Mobile touch parallax** — `DeviceMotionEvent` for gyroscope tilt on mobile
- [ ] **Order flow** — Add to cart interaction with a 3D cup-to-bag animation
- [ ] **Dark/light mode** — toggle between night café and morning light themes

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## Author

**Sanjeev A**  
B.Tech Computer Science (Data Science) — SRMIST Kattankulathur

[![GitHub](https://img.shields.io/badge/GitHub-sa1165-181717?style=flat-square&logo=github)](https://github.com/sa1165)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-coffeeshop--3d.vercel.app-000000?style=flat-square&logo=vercel)](https://coffeeshop-3d.vercel.app)

---

<p align="center">
  <sub>Built with ☕ Three.js + GSAP + Vanilla JS — <em>because great coffee deserves great engineering.</em></sub>
</p>
