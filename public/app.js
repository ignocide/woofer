'use strict'
var app = angular.module('woofer'
  , ['woofer.config', 'woofer.api', 'youtube-embed', 'woofer.player', 'ngRoute'])

app.config(function ($routeProvider, $controllerProvider) {
  app.registerCtrl = $controllerProvider.register

  function loadScript (path) {
    var result = $.Deferred(),
      script = document.createElement('script')
    script.async = 'async'
    script.type = 'text/javascript'
    script.src = path
    script.onload = script.onreadystatechange = function (_, isAbort) {
      if (!script.readyState || /loaded|complete/.test(script.readyState)) {
        if (isAbort)
          result.reject()
        else
          result.resolve()
      }
    }
    script.onerror = function () { result.reject(); }
    document.querySelector('head').appendChild(script)
    return result.promise()
  }

  function loader (scripts) {
    return {
      load: function ($q) {
        scripts = scripts instanceof Array ? scripts : [scripts]
        var deferred = $q.defer(),
          map = scripts.map(function (name) {
            return loadScript('controllers/' + name + '.js')
          })

        $q.all(map).then(function (r) {
          deferred.resolve()
        })

        return deferred.promise
      }
    }
  }

  $routeProvider
    .when('/play', {
      templateUrl: 'play'
    })
    .when('/awesome', {
      templateUrl: 'awesome',
      resolve: loader('awesome')
    })
    .when('/recent', {
      templateUrl: 'recent',
      resolve: loader('recent')
    })
    .otherwise({redirectTo: '/play'})
})

var socket = null
app.run(function ($rootScope, conf, menuSvc) {
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

  socket.on('disconnect', function (client) {
    console.log('disconnect!')
    $rootScope.menuSvc.showRoom()
  })

  $rootScope.menuInit = menuSvc.init()
  $rootScope.menuState = function (key) {
    return menuSvc.getState(key)
  }

  $rootScope.menuSvc = menuSvc
})

app.factory('menuSvc', function () {
  var menus = ['room', 'playlist', 'search']
  var SVC = {
    init: function () {
      angular.forEach(menus, function (v, k) {
        SVC.state[v] = true
      })
    },
    state: {
      room: true,
      playlist: true,
      search: true
    },
    getState: function (key) {
      return SVC.state[key]
    },
    hide: function (key) {
      SVC.state[key] = false
    },
    show: function (key) {
      SVC.state[key] = true
    },
    hideRoom: function () {
      var cardList = document.getElementById('card-list')
      var room = document.getElementById('roombox')
      room.style['opacity'] = '0'
      setTimeout(function () {
        SVC.state.room = false
      }, 500)
    },
    showRoom: function () {
      var cardList = document.getElementById('card-list')
      var room = document.getElementById('roombox')
      cardList.style['margin-top'] = '0px'
      setTimeout(function () {
        room.style['opacity'] = '1'
        SVC.state.room = true
      }, 300)
    }

  }

  return SVC
})

app.controller('youtubeCtrl', function ($rootScope, $scope, wooferPlayer, menuSvc) {
  $scope.youtube_id = undefined
  $scope.playingItem = null
  $scope.isView = function () {
    console.log($scope.view)
    return true
  }
  $scope.playerVars = {
    rel: 0,
    autoplay: 1,
    origin: 0
  }
  $scope.playlist = wooferPlayer.list

  $scope.shuffleModeClass = function () {
    switch (wooferPlayer.getPlayMode()) {
      case 'shuffle':
        return 'shuffleMode'
      case 'repeat':
        return 'repeatMode'
      case 'none':
        return 'noShuffleMode'
    }
  }

  $scope.toggleSuffleMode = function () {
    var mode = null
    switch (wooferPlayer.getPlayMode()) {
      case 'shuffle':
        mode = 'repeat'
        break
      case 'repeat':
        mode = 'none'
        break
      case 'none':
        mode = 'shuffle'
        break
    }

    var data = {
      suffleMode: mode
    }
    socket.emit('reqShuffleMode', data)
  }

  socket.on('reqShuffleMode', function (data) {
    console.log(data)
    wooferPlayer.setPlayMode(data.suffleMode)
    $scope.$apply()
  })

  $scope.$on('youtube.player.ended', function ($event, player) {
    let index = wooferPlayer.index

    try {
      var playMode = wooferPlayer.getPlayMode()
      if (playMode == 'shuffle') {
        let nextIndex = wooferPlayer.getShuffledIndex()
        $scope.play(null, nextIndex)
      }
      else if (playMode == 'repeat') {
        player.playVideo()
      }else {
        if (index != null) {
          let nextIndex = null
          if (index == wooferPlayer.list.length - 1) {
            nextIndex = 0
          }else {
            nextIndex = index + 1
          }

          let beforeItemId = wooferPlayer.id
          $scope.play(null, nextIndex)
          if (wooferPlayer.list[nextIndex].id.videoId == beforeItemId) {
            player.playVideo()
          }
        }else {
          $scope.play(null, 0)
        }
      }
    } catch (err) {
      console.log(err)
      return
    }
  })

  $scope.$on('youtube.player.ready', function ($event, player) {
    player.playVideo()
  })

  // wooferPlayer watcher
  $scope.$watch(function () {
    return wooferPlayer.id
  }, function () {
    wooferPlayer.recordHistory(wooferPlayer.id)
    try {
      $scope.playingItem = wooferPlayer.list[wooferPlayer.index].snippet.title
    } catch (err) {}

    $scope.youtube_id = wooferPlayer.id
  })
  $scope.$watch(function () {
    return wooferPlayer.list
  }, function () {
    $scope.playlist = wooferPlayer.list
  })

  $scope.reqPlay = function (item) {
    var index = $scope.playlist.indexOf(item)
    if (!isNaN(index) && index > -1) {
      socket.emit('play', {index: index})
    }
  }

  $scope.reqNext = function () {
    let nextIndex = null
    if (wooferPlayer.getPlayMode()) {
      nextIndex = wooferPlayer.getShuffledIndex()
    }else {
      if (wooferPlayer.index != null) {
        if (wooferPlayer.index == wooferPlayer.list.length - 1) {
          nextIndex = 0
        }else {
          nextIndex = wooferPlayer.index + 1
        }
      }else {
        nextIndex = 0
      }
    }
    socket.emit('play', {index: nextIndex})
  }
  // player control funcs
  $scope.play = function (item, index) {
    if (!item && isNaN(index)) {
      return null
    }
    if (index != undefined) {
      item = wooferPlayer.list[index]
    }else {
      index = null
    }
    wooferPlayer.id = item.id.videoId
    wooferPlayer.index = index
    if ($scope.$$phase != '$apply') {
      $scope.$apply()
    }
  }

  $scope.del = function (item) {
    var index = $scope.playlist.indexOf(item)
    if (!isNaN(index) && index > -1) { socket.emit('delVideo', {index: index}) }
  }

  socket.on('playlistInit', function (data) {
    var list = data.list
    wooferPlayer.list = list
    menuSvc.hideRoom()
    $scope.$apply()
  })

  socket.on('play', function (data) {
    $scope.play(null, data.index)
  })

  socket.on('addVideo', function (data) {
    wooferPlayer.list.push(data.video)
    $scope.$apply()
  })

  socket.on('delVideo', function (data) {
    var index = data.index
    wooferPlayer.list.splice(index, 1)

    if (wooferPlayer.index >= index) {
      wooferPlayer.index--
    }
    $scope.$apply()
  })
})

app.controller('roomCtrl', function ($rootScope, $scope) {
  var RETRY_TIME = 5000

  var tryJoin = function () {
    // setTimeout(function () {
    //   if ($scope.room !== '' && $scope.loginState) {
    $scope.join()
  //   }else {
  //     return false
  //   }
  //   tryJoin()
  // }, RETRY_TIME)
  }

  $scope.room = ''
  $scope.loginState = false
  $scope.join = function () {
    var data = {
      room: $scope.room
    }
    socket.emit('join', data)
  }

  socket.on('joinCallback', function () {
    $scope.loginState = true
  })
  socket.on('disconnect', function () {
    tryJoin()
  })
})

app.controller('searchCtrl', function ($rootScope, $scope, wooferPlayer) {
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
        }else {
          $scope.resultList = response.result.items
        }
        $scope.$apply()
        beforeQuery = $scope.query
        loading = false
      })
    }
  }

  $scope.play = function (item) {
    wooferPlayer.id = item.id.videoId
    wooferPlayer.index = null
  }

  $scope.add = function (item) {
    delete item.kind
    delete item.etag
    delete item.$$hashKey
    var data = {
      video: item
    }
    socket.emit('addVideo', data)
  }
})
