# Chow Chooser

A realtime voting system for one of life's most important questions: Where the hell should we go to lunch?

![Application Screenshot](https://raw.github.com/waf/lunchpick/master/resources/screenshot/chow-chooser.png)

Written in Clojure (Compojure, HTTP Kit), WebSockets, AngularJS.

## Status

Not even alpha status. Still under development.

## Build/Install

Install [leiningen](https://github.com/technomancy/leiningen), then run

```
$ lein uberjar
$ java -jar target/chow-chooser-*-standalone.jar
```

This spins up a server on localhost, port 8000.

## License

Distributed under the Eclipse Public License.
