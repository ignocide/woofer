'use strict'
var app = angular.module('woofer'
    , ['woofer.config', 'mui', 'ngResource', 'woofer.api', 'youtube-embed' ])

var host = null
var socket = null
app.run(function ($rootScope, conf) {
  var initGapi = function () {
    // 2. Initialize the JavaScript client library.
    gapi.client.init(conf.GOOGLEAPI).then(function (resp) {
      return gapi.client.load('youtube', 'v3')
    }, function (reason) {
      console.log('Error: ' + reason.result)
    })
  }

// 1. Load the JavaScript client library.
  gapi.load('client', initGapi)
  socket = io.connect()

  socket.on('connection', function (client) {
    console.log('connected!', client)
  })

  socket.on('news', function (data) {
    console.log(data)
  })
})

app.factory('playSvc', function () {
  var SVC = {
    id: null
  }

  return SVC
})

// https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=YOUR_API_KEY
app.config(function () {
  // $routeProvider
  //
  //       // route for the home page
  //       .when('/', {
  //           // templateUrl : './templates/home.html',
  //           // controller  : 'homeCtrl'
  //         redirectTo: '/'
  //       })
  //
  //       .when('/home', {
  //         templateUrl: './templates/home.html',
  //         controller: 'homeCtrl'
  //       })
  //
  //       .otherwise({
  //         redirectTo: '/home'
  //       })
})

app.controller('youtubeCtrl', function ($rootScope, $scope, playSvc) {
  $scope.youtube_id = null
  $scope.$watch(function () {
    return playSvc.id
  }, function () {
    $scope.youtube_id = playSvc.id
  })
})

app.controller('roomCtrl', function ($rootScope, $scope) {
  $scope.room = ''
  $scope.joinRoom = function () {
    console.log('!!!!')
    if ($scope.room != '') {
      console.log($scope.room)
      socket.join($scope.room)
      socket.on('news', function (data) {
        console.log(data)
      })
      socket.to('room').emit('some event')
      socket.to('room').emit('some event')
      socket.to('room').emit('some event')
      socket.to('room').emit('some event')
    }
  }
})

app.controller('searchCtrl', function ($rootScope, $scope, playSvc) {
  $scope.query = '나윤권'
  $scope.resultList = []

  $scope.search = function () {
    if ($scope.query != '') {
      var request = gapi.client.youtube.search.list({
        q: $scope.query,
        part: 'snippet',
        type: 'video',
        videoEmbeddable: true
      })
      request.execute(function (response) {
        var str = JSON.stringify(response.result.items)
        $scope.resultList = $scope.resultList.concat(response.result.items)
        $scope.$apply()
      })
    }
  }

  $scope.add = function (item) {
    console.log(item)
    playSvc.id = item.id.videoId
  }
})
