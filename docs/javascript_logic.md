# JavaScript & Application Logic

The application uses Vanilla JavaScript utilizing ES6 Modules to import functions directly from the Firebase SDK.

## 1. Firebase Initialization (`js/firebase.js`)
This file holds your Firebase project configuration keys. It initializes the core Firebase app and exports two critical instances that other files use:
- `auth`: The Authentication service instance.
- `db`: The Firestore Database instance.

## 2. Authentication Flow (`js/auth.js`)
Handles everything related to logging in and registering.
- **MGITS Enforcement**: On registration, a simple `if` statement checks if the email ends with `@mgits.ac.in`. If not, it blocks registration.
- **User Document**: When a user registers successfully, their email and role (Student/Faculty) are saved into a `users` collection in Firestore using their unique Auth UID as the document ID.
- **Error Handling**: The `getFriendlyError()` function catches raw Firebase errors (like `auth/wrong-password`) and displays beautifully styled popups (`showAuthPopup`) instead of ugly browser alerts.

## 3. The Feed & Voting Logic (`js/complaints.js`)
The core engine for the dashboard.
- **State Management**: It maintains arrays representing the data globally (e.g., `allComplaints`, `categories`, `currentUser`).
- **`fetchComplaints()`**: Reaches out to Firestore, grabs the `complaints` collection, and passes the array to the renderer.
- **`renderComplaints()`**: The UI templater. It iterates through the complaints array, builds HTML strings using template literals (`` ` ``), and injects them into the DOM.
- **Filtering**: Before rendering, it filters the array based on the `currentCategory` selected, the search bar queries, and it runs the content through the moderation filter to catch any sneaky vulgar words that bypassed submission checks.
- **Voting (`handleVote()`)**: 
  1. Checks if the user is authenticated.
  2. Modifies the vote state locally for immediate UI feedback (optimistic updating).
  3. Sends an `updateDoc` request to Firestore to securely increment the `votes` integer and record the user's UID in the `votedBy` map (to prevent double-voting).

## 4. AI Content Moderation (`js/moderation.js`)
A client-side dictionary-based profanity filter supporting English and Malayalam.
- **Dictionaries**: Contains arrays of blocked words (`BLOCKED_WORDS_EN`, `BLOCKED_WORDS_ML`).
- **Leet-speak Normalization**: The `normalizeEnglish()` function replaces masked characters (e.g., `$h!t` becomes `shit`) so users cannot easily bypass the filter.
- **Regex Checking**: It checks word boundaries to ensure it accurately catches offensive terms without accidentally flagging innocent words that happen to contain a substring. 
- Other files import the `checkContent` or `checkMultiple` functions from this module before allowing data to be saved to the database.
