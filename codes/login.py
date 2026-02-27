def get_user(uid):
    user_ref = db.collection("users").document(uid)
    user = user_ref.get()
    if user.exists:
        return user.to_dict()
    else:
        return None