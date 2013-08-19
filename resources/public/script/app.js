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
        });
        $socket.on("vote", function(newVote) {
            updateLocalVotes(newVote.restaurant, newVote.user, newVote.amount);
        });
    }
    function updateLocalVotes(restaurant, user, amount) {
        if(!$scope.votes[restaurant])
            $scope.votes[restaurant] = [];
        if(amount > 0) {
            $scope.votes[restaurant].push(user);
        } else {
            var toDelete = $scope.votes[restaurant].indexOf(user);
            $scope.votes[restaurant].splice(toDelete, 1);
        }
            
        chart.update($scope.votes);
    }
    function updateRemoteVotes(restaurant, user, amount) {
        $socket.send('vote', {restaurant:restaurant, user:user, amount:amount});
    }
    function userHasVotedForRestaurant(restaurant, user) {
        return $scope.votes[restaurant] && 
            $scope.votes[restaurant].indexOf($scope.user) !== -1;
    }
});
