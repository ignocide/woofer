'use strict'
var app = angular.module('woofer'
    , ['woofer.config', 'mui', 'ngResource', 'woofer.api', 'youtube-embed' ])

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

  socket.on('connect', function (client) {
    console.log('connected!')
  })
})

app.factory('playlist', function () {

})
app.factory('playSvc', function () {
  var SVC = {
    id: null,
    index: null
  }

  return SVC
})

// https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=YOUR_API_KEY
app.config(function () {
})

app.controller('youtubeCtrl', function ($rootScope, $scope, playSvc) {
  $scope.youtube_id = null
  $scope.playerVars = {
    rel: 0
  }
  $scope.playlist = []

  $scope.$on('youtube.player.ended', function ($event, player) {
    let index = playSvc.index

    // 재생이 끝났을 경우 예외처리
    try {
      if (index != null) {
        let nextIndex = null
        if (index == $scope.playlist.length - 1) {
          nextIndex = 0
        }
        else {
          nextIndex = index + 1
        }
        let nextItem = $scope.playlist[index]
        let beforeItemId = playSvc.id
        $scope.play(nextItem, nextIndex)
        if (nextItem.id.videoId == beforeItemId) {
          player.playVideo()
        }
      }
      else {
        $scope.play(null, 0)
      }
    }
    catch (err) {

    }
  })

  $scope.$on('youtube.player.ready', function ($event, player) {
    player.playVideo()
  })

  // playSvc watcher
  $scope.$watch(function () {
    return playSvc.id
  }, function () {
    $scope.youtube_id = playSvc.id
  })

  $scope.reqPlay = function (index) {
    socket.emit('play', {index: index})
  }
  // player control funcs
  $scope.play = function (item, index) {
    if (index != undefined) {
      item = $scope.playlist[index]
    }
    else {
      index = null
    }
    playSvc.id = item.id.videoId
    playSvc.index = index
    if ($scope.$$phase != '$apply') {
      $scope.$apply()
    }
  }

  $scope.del = function (index) {
    socket.emit('delVideo', {index: index})
  }

  socket.on('playlistInit', function (data) {
    var list = data.list
    $scope.playlist = list
    $scope.$apply()
  })

  socket.on('play', function (data) {
    $scope.play(null, data.index)
  })
})

app.controller('roomCtrl', function ($rootScope, $scope) {
  $scope.room = ''
})

app.controller('searchCtrl', function ($rootScope, $scope, playSvc) {
  $scope.query = ''
  $scope.resultList = []

  var loading = false
  var beforeQuery = null
  var nextPageToken = null
  var page = 1
  $scope.search = function () {
    if ($scope.query != '' && !loading) {
      loading = true

      var reqOpt = {
        q: $scope.query,
        part: 'snippet',
        type: 'video',
        beforeQuery: true,
        maxResults: 10
      }
      if (beforeQuery == $scope.query) {
        reqOpt.pageToken = nextPageToken
      }
      var request = gapi.client.youtube.search.list(reqOpt)
      request.execute(function (response) {
        nextPageToken = response.nextPageToken
        if (beforeQuery == $scope.query) {
          $scope.resultList = $scope.resultList.concat(response.result.items)
        }
        else {
          $scope.resultList = response.result.items
        }
        $scope.$apply()
        beforeQuery = $scope.query
        loading = false
      })
    }
  }

  $scope.play = function (item) {
    playSvc.id = item.id.videoId
    playSvc.index = null
  }

  $scope.add = function (item) {
    delete item.kind
    delete item.etag
    delete item.$$hashKey
    let data = {
      video: item
    }
    socket.emit('addVideo', data)
  }
})
