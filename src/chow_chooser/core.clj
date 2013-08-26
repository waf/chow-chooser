(ns chow-chooser.core
  (:use [compojure.core]
        [compojure.route])
  (:require [chow-chooser.message-handler :as handler]
            [org.httpkit.server :as httpkit]
            [ring.util.response :as response])
  (:gen-class))

(defroutes app-routes
  (GET "/" [] (response/redirect "/index.html"))
  (GET "/realtime/" [] handler/channel-callbacks)
  (resources "/") ; reads from default filesystem location "resources/public"
  (not-found "Not Found"))

(defn -main []
  (httpkit/run-server app-routes {:port 8000}))
