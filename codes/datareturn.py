def get_admin_data():
    complaints_ref = db.collection("complaints")
    complaints = complaints_ref.stream()
    
    total_complaints = 0
    pending = 0
    in_progress = 0
    resolved = 0
    
    for comp in complaints:
        total_complaints += 1
        status = comp.to_dict()["status"]
        if status == "Pending":
            pending += 1
        elif status == "In Progress":
            in_progress += 1
        elif status == "Resolved":
            resolved += 1

    return {
        "total_complaints": total_complaints,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved
    }