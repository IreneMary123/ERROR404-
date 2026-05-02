# HTML Pages Architecture

The application is split into four primary HTML files. Each file represents a different "view" or page in the application. They all share the same CSS stylesheet (`styles.css`) but have distinct structures.

## 1. `index.html` (Authentication Page)
This is the entry point of the application.
- **Purpose**: Handles user login and registration.
- **Key Elements**: 
  - An `<div class="auth-tabs">` at the top allows users to toggle between "Student" and "Admin" mode.
  - Two forms (`#loginForm` and `#registerForm`) that are toggled via JavaScript.
  - A hidden input (`#selectedRole`) that stores whether the user is registering as a Student or Faculty.
- **Scripted By**: `js/auth.js` handles the submission of these forms.

## 2. `dashboard.html` (Main Feed)
This is where users view and interact with complaints.
- **Purpose**: Displays the list of community complaints, allowing users to upvote and filter them.
- **Key Elements**:
  - **Navbar**: Contains the logo, search bar, and a "+ Create Post" button. The Admin link only appears if the logged-in user has the Faculty role.
  - **Main Feed (`<main class="feed">`)**: A container (`#complaintsFeed`) where JavaScript dynamically injects complaint cards.
  - **Sidebar (`<aside class="sidebar">`)**: Contains widgets for filtering by category (Academics, Infrastructure, etc.) and displaying total stats.
- **Scripted By**: `js/complaints.js` (handles fetching and rendering the feed).

## 3. `submit.html` (Creation Page)
The page where users write new complaints.
- **Purpose**: A clean, focused form for submitting a title, category, and description.
- **Key Elements**:
  - The form (`#submitForm`) collects the input.
  - An inline script at the bottom of the file handles the submission.
  - It imports the `checkMultiple` function from `js/moderation.js` to run the content through the AI profanity filter *before* it gets sent to Firebase.
  - If the content is clean, it pushes a new document to the `complaints` collection in Firestore, hardcoding the `created_by` field to `"Anonymous"`.

## 4. `admin.html` (Admin Dashboard)
A restricted page only accessible by users with the "Faculty" role.
- **Purpose**: Allows admins to track complaint metrics, change their status, and delete inappropriate ones.
- **Key Elements**:
  - A metric grid (`.stats-grid`) showing the total, pending, resolved, and high-priority complaints.
  - A feed (`#complaintList`) containing admin-specific versions of the complaint cards.
  - These cards have action buttons (`✓ Resolve`, `In Progress`, `🗑️ Delete`).
  - A hidden modal (`#deleteModal`) that pops up to confirm deletion to prevent accidental clicks.
- **Scripted By**: An inline script block handles the admin logic, verifying the user's role on load.
