(ns lunchpick.vote-manager)

(def votes (atom {})) ;durable persistence is for sissies. Map of restaurant->[usernames]

(defn add-vote [restaurant user]
  (swap! votes update-in [restaurant] conj user))

(defn remove-vote [restaurant user]
  (swap! votes update-in [restaurant] disj user))
