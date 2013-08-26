(ns chow-chooser.vote-manager
  (require [clojure.set :refer [union]]))

(def votes (atom {})) ;durable persistence is for sissies. Map of restaurant->[usernames]

(defn add-vote [restaurant user]
  (let [old (count (@votes restaurant))]
    (do
      (swap! votes update-in [restaurant] union #{user})
      (not (= old (count (@votes restaurant)))))))

(defn remove-vote [restaurant user]
  (let [old (count (@votes restaurant))]
    (do
      (swap! votes update-in [restaurant] disj user)
      (not (= old (count (@votes restaurant)))))))
