(ns lunchpick.vote-manager
  (require [clojure.set :refer [union]]))

(def votes (atom {})) ;durable persistence is for sissies. Map of restaurant->[usernames]

(defn add-vote [restaurant user]
  (swap! votes update-in [restaurant] union #{user}))

(defn remove-vote [restaurant user]
  (swap! votes update-in [restaurant] disj user))
