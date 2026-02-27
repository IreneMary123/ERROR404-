from datetime import datetime

def submit_complaint(uid, title, description, category, is_anonymous=False):
    complaint_ref = db.collection("complaints")
    complaint_data = {
        "title": title,
        "description": description,
        "category": category,
        "created_by": uid,
        "is_anonymous": is_anonymous,
        "votes": 0,
        "impact_score": 0,
        "status": "Pending",
        "created_at": datetime.utcnow()
    }
    complaint_ref.add(complaint_data)
    return "Complaint submitted successfully"