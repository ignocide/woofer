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

app.factory('playSvc', function () {
  var shuffleMode = true
  var history = []
  var HISTORYSIZE = 20

  var getSampleIndexs = function (list) {
    var MAXRESULT = history.length + 1
    var indexs = []
    var listLenght = list.length
    var maxResult = MAXRESULT > listLenght ? listLenght : MAXRESULT

    while (indexs.length < maxResult) {
      var index = Math.floor(Math.random() * listLenght)
      if (indexs.indexOf(index) == -1) {
        indexs.push(index)
      }
    }

    return indexs
  }

  // shuffle로직
  // 1.봤던 음악의 아이디를 기록한다.
  // 2.리스트에서 index들의 샘플을 가져온다. @getSampleIndexs
  // 3.index를 토대로 안들은 음악의 인덱스를 리턴한다.
  var getNextIndex = function () {
    // 20개 이하일 경우
    var nextIndex = null

    var samples = getSampleIndexs(SVC.list)
    for (var i = 0; nextIndex == null && i < samples.length; i++) {
      if (history.indexOf(SVC.list[samples[i]].id.videoId) == -1 || i == samples.length) {
        nextIndex = samples[i]
      }
    }

    return nextIndex
  }
  var SVC = {
    list: [],
    id: null,
    index: null,
    getShuffleMode: function () {
      return shuffleMode
    },
    setShuffleMode: function (mode) {
      shuffleMode = mode
    },
    getShuffledIndex: function () {
      return getNextIndex()
    },
    recordHistory: function (beforeId) {
      history.push(beforeId)
      if (history.length > HISTORYSIZE) {
        history.shift()
      }
    }
  }

  return SVC
})

// https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=YOUR_API_KEY
app.config(function () {
})

app.controller('youtubeCtrl', function ($rootScope, $scope, playSvc) {
  $scope.youtube_id = undefined
  $scope.playerVars = {
    rel: 0,
    autoplay: 1,
    origin: 0
  }
  $scope.playlist = playSvc.list

  $scope.shuffleModeClass = function () {
    return playSvc.getShuffleMode() ? 'shuffleMode' : 'noShuffleMode'
  }

  $scope.toggleSuffleMode = function () {
    var data = {
      suffleMode: !playSvc.getShuffleMode()
    }
    socket.emit('reqShuffleMode', data)
  }

  socket.on('reqShuffleMode', function (data) {
    playSvc.setShuffleMode(data.suffleMode)
    $scope.$apply()
  })

  $scope.$on('youtube.player.ended', function ($event, player) {
    let index = playSvc.index

    try {
      if (playSvc.getShuffleMode()) {
        let nextIndex = playSvc.getShuffledIndex()
        $scope.play(null, nextIndex)
      }
      else {
        if (index != null) {
          let nextIndex = null
          if (index == playSvc.list.length - 1) {
            nextIndex = 0
          }
          else {
            nextIndex = index + 1
          }

          let beforeItemId = playSvc.id
          $scope.play(null, nextIndex)
          if (nextItem.id.videoId == beforeItemId) {
            player.playVideo()
          }
        }
        else {
          $scope.play(null, 0)
        }
      }
    }
    catch (err) {
      console.log(err)
      return
    }
  })

  $scope.$on('youtube.player.ready', function ($event, player) {
    player.playVideo()
  })

  // playSvc watcher
  $scope.$watch(function () {
    return playSvc.id
  }, function () {
    playSvc.recordHistory(playSvc.id)
    // if ($scope.bestPlayer) {
    //   return $scope.bestPlayer.loadVideoById(playSvc.id)
    // }
    $scope.youtube_id = playSvc.id
  })
  $scope.$watch(function () {
    return playSvc.list
  }, function () {
    $scope.playlist = playSvc.list
  })

  $scope.reqPlay = function (item) {
    var index = $scope.playlist.indexOf(item)
    if (!isNaN(index) && index > -1) {
      socket.emit('play', {index: index})
    }
  }

  $scope.reqNext = function () {
    let nextIndex = playSvc.getShuffledIndex()
    socket.emit('play', {index: nextIndex})
  }
  // player control funcs
  $scope.play = function (item, index) {
    if (!item && isNaN(index)) {
      return null
    }
    if (index != undefined) {
      item = playSvc.list[index]
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

  $scope.del = function (item) {
    var index = $scope.playlist.indexOf(item)
    if (!isNaN(index) && index > -1)
    { socket.emit('delVideo', {index: index}) }
  }

  socket.on('playlistInit', function (data) {
    var list = data.list
    playSvc.list = list
    $scope.$apply()
  })

  socket.on('play', function (data) {
    $scope.play(null, data.index)
  })

  socket.on('addVideo', function (data) {
    playSvc.list.push(data.video)
    $scope.$apply()
  })

  socket.on('delVideo', function (data) {
    var index = data.index
    playSvc.list.splice(index, 1)

    if (playSvc.index >= index) {
      playSvc.index--
    }
    $scope.$apply()
  })
})

app.controller('roomCtrl', function ($rootScope, $scope) {
  $scope.room = ''
  $scope.join = function () {
    var data = {
      room: $scope.room
    }
    socket.emit('join', data)
  }
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
