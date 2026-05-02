# Firebase Backend & Security architecture

Because CivicVoice is a serverless application, the frontend JavaScript talks directly to the database. To keep things secure, we rely on **Firestore Security Rules**.

You can find these rules defined in `firestore.rules`.

## The Rule Structure

### 1. The `users` collection
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.auth.uid == userId;
  allow update: if request.auth != null && request.auth.uid == userId;
}
```
- A user can only create or update a profile document if the document ID matches their own authentication UID. 
- You cannot edit someone else's role.

### 2. The `complaints` collection
```javascript
match /complaints/{complaintId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null;
  allow delete: if request.auth != null;
}
```
- **Read/Create**: Anyone logged in (verified `@mgits.ac.in` email) can fetch the feed or post a new complaint.
- **Update**: Users need the ability to update complaints so they can append their vote to the `votedBy` field and increment the `votes` counter.
- **Delete**: We explicitly opened this rule for authenticated users to support the Admin Delete feature from `admin.html`.

## Admin Validation Logic
If anyone can technically delete a complaint via the rules, how do we stop students from doing it?
1. The UI delete buttons are only rendered on `admin.html`.
2. To access `admin.html`, the page executes an observer:
```javascript
onAuthStateChanged(auth, async (user) => {
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "Faculty") {
    // Redirects the user away if they don't have the Faculty role
    window.location.href = "dashboard.html"; 
  }
});
```
This ensures normal students cannot easily access the deletion tools.

## Absolute Anonymity
The most critical requirement of CivicVoice is guaranteed anonymity. 
- When `submit.html` pushes a new complaint via `addDoc(collection(db, "complaints"), {...})`, it never attaches the `user.uid` or the user's email.
- `created_by` is always hardcoded as the literal string `"Anonymous"`.
- Because the author data is never stored in the database in the first place, it is mathematically impossible for anyone—not even the site administrators looking directly at the Firebase Console—to figure out who posted a specific complaint. 
