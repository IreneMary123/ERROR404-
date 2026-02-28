from firebase_admin import firestore

def upvote_complaint(uid, complaint_id):
    db = firestore.client()
    votes_ref = db.collection("votes")
    
    # Check if user already voted
    existing_votes = votes_ref.where("user_id", "==", uid)\
                              .where("complaint_id", "==", complaint_id)\
                              .stream()
    
    if any(existing_votes):
        return "You have already voted!"
    
    # Add vote
    votes_ref.add({
        "user_id": uid,
        "complaint_id": complaint_id
    })
    
    # Increment vote count in the complaint
    complaint_ref = db.collection("complaints").document(complaint_id)
    complaint_ref.update({
        "votes": firestore.Increment(1)
    })
    
    return "Vote added successfully!"