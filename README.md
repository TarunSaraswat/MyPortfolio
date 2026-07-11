# Tarun Saraswat — Portfolio

A visually striking portfolio website featuring a particle-based DNA double helix that rotates on scroll, with skills displayed alongside and an AR-style holographic detail panel.

## Features

- **Particle DNA Strand** — Thousands of glowing particles forming a volumetric double helix (Three.js + custom shaders)
- **Scroll-driven rotation** — DNA revolves as you scroll, powered by GSAP ScrollTrigger
- **Skill labels** — Alternating left/right with fade-in animations
- **AR Holographic Frame** — Click any skill to see a sci-fi detail panel with experience context
- **Hero section** — Name + title with typewriter effect, blurred DNA background
- **Contact section** — Copy email to clipboard, LinkedIn, phone, Google Maps

## Tech Stack

- **Three.js** — WebGL particle rendering with additive blending
- **GSAP + ScrollTrigger** — Scroll-driven animations
- **Lenis** — Smooth scrolling
- **Vanilla HTML/CSS/JS** — No build tools required

## Run Locally

```bash
# Just open index.html in a browser
open index.html

# Or use a local server
npx serve .
```

## Deploy

Static files — deploy directly to GitHub Pages, Netlify, or Vercel with zero configuration.
