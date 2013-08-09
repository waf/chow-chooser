(ns lunchpick.channel-manager
  (:use [org.httpkit.server :only [send!]])
  (:require [clojure.data.json :as json]))

(def channels (atom #{}))

(defn get-peers [channel]
  (disj @channels channel))

(defn start-tracking [channel]
  (swap! channels conj channel))

(defn stop-tracking [channel]
  (swap! channels disj channel))

; send the response to the single, specified channel
(defn targeted-response [channel response]
  (send! channel (json/write-str response)))

; send the response to all connected clients, except for the specified channel
(defn broadcast-response [channel response]
  (pmap send! (get-peers channel)
    (repeat (json/write-str response))))
