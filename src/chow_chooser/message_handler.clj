(ns chow-chooser.message-handler
  (:use [org.httpkit.server])
  (:require [chow-chooser.channel-manager :as channel-mgr]
            [chow-chooser.vote-manager :as vote-mgr]
            [clojure.data.json :as json]))

(defn vote-message [request]
  (if (> (:amount request) 0)
    (if (vote-mgr/add-vote (:restaurant request) (:user request))
      request)
    (if (vote-mgr/remove-vote (:restaurant request) (:user request))
      request)))

(defn initial-state-message []
  (assoc @vote-mgr/votes :cmd "init"))

(defn close-message [channel status]
  (channel-mgr/stop-tracking channel))

(defn message-router [channel datastr]
  (channel-mgr/start-tracking channel)
  (let [request (json/read-str datastr :key-fn keyword)]
    (case (:cmd request)
      "init" (channel-mgr/targeted-response channel (initial-state-message))
      "vote" (channel-mgr/broadcast-response channel (vote-message request)))))

(defn channel-callbacks [request]
  (with-channel request channel
    (on-close channel (partial close-message channel))
    (on-receive channel (partial message-router channel))))
