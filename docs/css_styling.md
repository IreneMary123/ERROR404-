# CSS Styling & UI Guide

CivicVoice uses a single, comprehensive CSS file (`css/styles.css`) written in Vanilla CSS. It implements a modern, light aesthetic heavily reliant on "Glassmorphism".

## Core Design Concepts

### 1. CSS Variables (`:root`)
Instead of hardcoding colors everywhere, all theme colors, fonts, spacing, and transition speeds are defined at the top of the file in the `:root` pseudo-class.
- **Benefit**: If you ever want to change the primary brand color from Purple to Blue, you only have to change the `--accent` variable, and the whole site updates instantly.
- Examples: `--bg-canvas` (background color), `--accent` (primary purple), `--text-primary` (main text color).

### 2. Glassmorphism
The modern "frosted glass" effect is achieved using the `backdrop-filter: blur(10px)` CSS property.
- The `body` background is a solid, light color.
- We place an animated background element (`.bg-orbs`) behind the main content.
- Containers like the Navbar and Post Cards have a semi-transparent white background (`rgba(255, 255, 255, 0.7)`) and a `blur` filter. This allows the animated background to blur organically behind the UI elements.

### 3. Animated Background Orbs (`.bg-orbs`)
The lively feeling comes from pure CSS animations.
- We define four `div` elements positioned absolutely in the background (`.orb`).
- They use `filter: blur(80px)` to look like soft glowing blobs of color.
- A CSS `@keyframes orbFloat` animation makes them drift and scale continuously across the screen asynchronously (using different `animation-delay` values).

## Key Components

- **`.post-card`**: The main UI unit for a complaint. It uses CSS Grid/Flexbox to arrange the voting sidebar on the left and the content on the right. It includes a subtle hover effect that lifts the card (`transform: translateY(-3px)`) and expands its shadow.
- **Voting Buttons (`.vote-btn`)**: Designed to house the 🔥 emoji. When clicked, it triggers a quick `@keyframes votePop` animation.
- **Modals & Popups**: Toasts and Modals use keyframe animations (`fadeIn`, `modalSlideIn`) to smoothly appear rather than jarringly popping into existence.

## Responsive Design
At the bottom of the file are `@media` queries.
- They check the screen width. For example, `@media (max-width: 768px)` targets iPads and mobile phones.
- On these smaller screens, the CSS hides the Sidebar (`display: none;`), changes grids to single columns, and adjusts padding/font sizes to ensure the site remains perfectly usable on mobile.
