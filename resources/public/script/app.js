var App = angular.module('app', []);
App.controller('AppCtrl', function($socket, $scope) {
    $scope.votes = [];
    var chart = App.VoteChart($scope.votes);
    chart.attach("form");
    $scope.user = Math.floor(Math.random() * 100);

    var host = window.location.host;
    $socket.connect("ws://" + host + "/realtime/");
    $socket.on("connect", function() {
        $socket.send("init");
    });
    $socket.on("init", function(allVotes) {
        for(var r in allVotes) {
            $scope.votes.push({restaurant:r, users:allVotes[r]});
        chart.update();
        }
    });
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
    $socket.on("vote", function(newVote) {
        updateVotes(newVote.restaurant, newVote.user, true);
    });
    $scope.voteSubmitted = function(r) {
        updateVotes(r, $scope.user);
        $socket.send('vote', {restaurant:r, user: $scope.user});
    }
});
