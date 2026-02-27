def view_complaints(sort_by="impact_score"):
    complaints_ref = db.collection("complaints")
    
    if sort_by == "votes":
        complaints = complaints_ref.order_by("votes", direction=firestore.Query.DESCENDING).stream()
    elif sort_by == "impact_score":
        complaints = complaints_ref.order_by("impact_score", direction=firestore.Query.DESCENDING).stream()
    else:  # default priority = impact_score
        complaints = complaints_ref.order_by("impact_score", direction=firestore.Query.DESCENDING).stream()

    result = []
    for comp in complaints:
        c = comp.to_dict()
        c["id"] = comp.id
        result.append(c)
    return result
