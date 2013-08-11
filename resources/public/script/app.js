var App = angular.module('app', []);
App.controller('AppCtrl', function($socket, $scope) {
    $scope.votes = [];
    $scope.user = Math.floor(Math.random() * 100);
    $scope.voteSubmitted = function() {
        if(!this.restaurant)
            return;
        castVote(this.restaurant);
        this.restaurant = '';
        document.lunchform.restaurant.blur();
    }
    $scope.svgClicked = function($event) {
        var data = $event.target.__data__.data;
        castVote(data.restaurant);
    };

    var chart = App.VoteChart($scope.votes);
    chart.attach("svg");
    webSocketInit();

    function updateVotes(restaurant, user) {
        var found = false;
        for(var v in $scope.votes) {
            var vote = $scope.votes[v];
            if(vote.restaurant === restaurant) {
                vote.users.push(user);
                found = true;
                break;
            }
        }
        if(!found) {
            $scope.votes.push({restaurant:restaurant, users:[user]});
        }
        chart.update();
    }
    function webSocketInit() {
        $socket.connect("ws://" + window.location.host + "/realtime/");
        $socket.on("connect", function() {
            $socket.send("init");
        });
        $socket.on("init", function(allVotes) {
            for(var r in allVotes) {
                $scope.votes.push({restaurant:r, users:allVotes[r]});
                chart.update();
            }
        });
        $socket.on("vote", function(newVote) {
            updateVotes(newVote.restaurant, newVote.user, true);
        });
    }
    function castVote(restaurant) {
        updateVotes(restaurant, $scope.user);
        $socket.send('vote', {restaurant:restaurant, user: $scope.user});
    }
});
