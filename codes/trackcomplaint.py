def track_complaint_status(complaint_id):
    complaint_ref = db.collection("complaints").document(complaint_id)
    comp = complaint_ref.get()
    if comp.exists:
        return comp.to_dict()["status"]
    else:
        return "Complaint not found"