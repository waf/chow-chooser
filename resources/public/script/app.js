var App = angular.module('app', ['ngCookies']);
App.controller('AppCtrl', function($socket, $scope, $cookies) {
    $scope.votes = {};
    $scope.history = [];
    $scope.winner = [];
    $scope.user = $cookies.user = $cookies.user || prompt("Please enter your name:");
    $scope.voteSubmitted = function() {
        castVote(this.restaurant, $scope.user);
        this.restaurant = '';
        document.lunchform.restaurant.blur();
    }
    $scope.svgClicked = function($event) {
        var data = $event.target.__data__.data;
        castVote(data.restaurant, $scope.user);
    };

    var chart = App.VoteChart($scope.user);
    chart.attach("svg");
    webSocketInit();

    function castVote(restaurant, user) {
        if(!restaurant || !user)
           return;

        var vote = userHasVotedForRestaurant(restaurant, user) ? -1 : 1;
        updateLocalVotes(restaurant, user, vote);
        updateRemoteVotes(restaurant, user, vote);
    }

    function webSocketInit() {
        $socket.connect("ws://" + window.location.host + "/realtime/");
        $socket.on("connect", function() {
            $socket.send("init");
        });
        $socket.on("init", function(allVotes) {
            $scope.votes = allVotes;
            chart.update($scope.votes);
            updateWinner();
        });
        $socket.on("vote", function(newVote) {
            updateLocalVotes(newVote.restaurant, newVote.user, newVote.amount);
        });
    }
    function updateWinner() {
        var max = [];
        var maxcount = 0;
        for(var r in $scope.votes) {
            var current = $scope.votes[r].length;
            if(current > maxcount ) {
                max = [r];
                maxcount = current
            } else if (current === maxcount) {
                max.push(r);
            }
        }
        $scope.winner = max;
    }
    function updateLocalVotes(restaurant, user, amount) {
        var log = user; 
        if(amount > 0) {
            log += " voted for " + restaurant;
            if(!$scope.votes[restaurant])
                $scope.votes[restaurant] = [];
            $scope.votes[restaurant].push(user);
        } else {
            log += " removed a vote for " + restaurant;
            if($scope.votes[restaurant].length === 1) {
                delete $scope.votes[restaurant];
            } else {
                var toDelete = $scope.votes[restaurant].indexOf(user);
                $scope.votes[restaurant].splice(toDelete, 1);
            }
        }
        updateWinner();
        $scope.history.push({time:Date.now(),text:log});
        chart.update($scope.votes);
    }
    function updateRemoteVotes(restaurant, user, amount) {
        $socket.send('vote', {restaurant:restaurant, user:user, amount:amount});
    }
    function userHasVotedForRestaurant(restaurant, user) {
        return $scope.votes[restaurant] && 
            $scope.votes[restaurant].indexOf(user) !== -1;
    }
});
