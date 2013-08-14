var App = angular.module('app', []);
App.controller('AppCtrl', function($socket, $scope) {
    $scope.votes = {};
    $scope.user = Math.floor(Math.random() * 100);
    $scope.voteSubmitted = function() {
        castVote(this.restaurant, $scope.user);
        this.restaurant = '';
        document.lunchform.restaurant.blur();
    }
    $scope.svgClicked = function($event) {
        var data = $event.target.__data__.data;
        castVote(data.restaurant, $scope.user);
    };

    var chart = App.VoteChart($scope.votes);
    chart.attach("svg");
    webSocketInit();

    function castVote(restaurant, user) {
        if(!restaurant || !user ||
           userHasVotedForRestaurant(restaurant, user)) {
           return;
        }
        updateLocalVotes(restaurant, user)
        updateRemoteVotes(restaurant, user)
    }

    function webSocketInit() {
        $socket.connect("ws://" + window.location.host + "/realtime/");
        $socket.on("connect", function() {
            $socket.send("init");
        });
        $socket.on("init", function(allVotes) {
            $scope.votes = allVotes;
            chart.update($scope.votes);
        });
        $socket.on("vote", function(newVote) {
            updateLocalVotes(newVote.restaurant, newVote.user);
        });
    }
    function updateLocalVotes(restaurant, user) {
        if(!$scope.votes[restaurant])
            $scope.votes[restaurant] = [];
        $scope.votes[restaurant].push(user);
        chart.update($scope.votes);
    }
    function updateRemoteVotes(restaurant, user) {
        $socket.send('vote', {restaurant:restaurant, user: user});
    }
    function userHasVotedForRestaurant(restaurant, user) {
        return $scope.votes[restaurant] && 
            $scope.votes[restaurant].indexOf($scope.user) !== -1;
    }
});
