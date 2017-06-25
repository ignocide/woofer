app.registerCtrl('recentCtrl', function ($rootScope, $scope, extraList, wooferPlayer) {
  $scope.recentList = extraList.recentList

  var loading = false
  $scope.setList = function () {
    $scope.recentList = extraList.recentList
    if ($scope.recentList.length == 0) {
      $scope.loadList()
    }
  }

  $scope.loadList = function () {
    if (loading) {
      return
    }
    if (gapi && gapi.client && gapi.client.youtube) {
    }else {
      setTimeout(function () {
        $scope.loadList()
      }, 1000)
      return
    }
    loading = true

    var reqOpt = {
      playlistId: 'PLFgquLnL59anNXuf1M87FT1O169Qt6-Lp',
      part: 'snippet',
      type: 'video',
      maxResults: 50
    }
    if (extraList.recentListToken) {
      reqOpt.pageToken = extraList.recentListToken
    }
    var request = gapi.client.youtube.playlistItems.list(reqOpt)
    request.execute(function (response) {
      extraList.recentList = extraList.recentList.concat(response.items)
      $scope.recentList = extraList.recentList
      extraList.recentListToken = response.nextPageToken
      $scope.$apply()
      loading = false
    })
  }
  $scope.play = function (item) {
    wooferPlayer.id = item.snippet.resourceId
    wooferPlayer.index = null
  }

  $scope.add = function (item) {
    delete item.kind
    delete item.etag
    delete item.$$hashKey
    item.id = item.snippet.resourceId
    var data = {
      video: item
    }
    socket.emit('addVideo', data)
  }
})
