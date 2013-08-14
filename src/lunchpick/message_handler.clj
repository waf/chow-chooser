(ns lunchpick.message-handler
  (:use [org.httpkit.server])
  (:require [lunchpick.channel-manager :as channel-mgr]
            [lunchpick.vote-manager :as vote-mgr]
            [clojure.data.json :as json]))

(defn vote-message [request]
  (if (vote-mgr/add-vote (:restaurant request) (:user request))
    request)) ;the request is the delta message response

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

(defn message-handler [request]
  (with-channel request channel
    (on-close channel (partial close-message channel))
    (on-receive channel (partial message-router channel))))
