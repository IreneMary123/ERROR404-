# CivicVoice — System Overview

Welcome to the CivicVoice documentation! This folder contains guides to help you and your team understand how the complaint portal works under the hood.

## Architecture at a Glance

CivicVoice is a **Single Page Application (SPA)** built with Vanilla web technologies and a Serverless Backend. It does not use Node.js or a traditional server for hosting its API.

### Frontend
- **HTML**: Provides the structure for the pages (Login, Dashboard, Submit, Admin).
- **CSS**: Uses a custom, vanilla CSS file (`styles.css`) for all styling, implementing a modern "glassmorphism" light theme.
- **JavaScript (Vanilla)**: Handles all interactivity, DOM manipulation, authentication, and database operations directly from the browser.

### Backend (Firebase)
- **Firebase Authentication**: Handles user registration and login securely. Validates that users have a `@mgits.ac.in` email address.
- **Firestore Database**: A NoSQL document database that securely stores all complaints and user profiles in the cloud.
- **Firebase Hosting**: Serves the static HTML, CSS, and JS files to the web securely over HTTPS.

## Documentation Index

Explore the following files in this `docs` folder to learn more about specific parts of the codebase:

1. **[HTML Pages Setup](./html_pages.md)** — Explains the structure of the different views (`index.html`, `dashboard.html`, `submit.html`, `admin.html`).
2. **[CSS Styling & UI](./css_styling.md)** — Breakdown of the CSS variables, layout system, animations, and the glassmorphism approach.
3. **[JavaScript Logic](./javascript_logic.md)** — How the frontend logic works, including authentication, complaint fetching, rendering, voting, and the AI moderation system.
4. **[Firebase Backend & Security](./firebase_backend.md)** — How the database is structured and how Firestore Security Rules enforce anonymity and admin privileges.

---

*Tip: These documents are written in Markdown. If you are reading this in VS Code or GitHub, use the built-in Markdown Preview feature to read them comfortably.*
