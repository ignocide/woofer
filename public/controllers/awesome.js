app.registerCtrl('awesomeCtrl', function ($rootScope, $scope, extraList, wooferPlayer) {
  $scope.awesomeList = extraList.awesomeList

  var loading = false
  $scope.setList = function () {
    $scope.awesomeList = extraList.awesomeList
    if ($scope.awesomeList.length == 0) {
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
      playlistId: 'PLFgquLnL59alGJcdc0BEZJb2p7IgkL0Oe',
      part: 'snippet',
      type: 'video',
      maxResults: 50
    }
    if (extraList.awesomeListToken) {
      reqOpt.pageToken = extraList.awesomeListToken
    }
    var request = gapi.client.youtube.playlistItems.list(reqOpt)
    request.execute(function (response) {
      extraList.awesomeList = extraList.awesomeList.concat(response.items)
      $scope.awesomeList = extraList.awesomeList
      extraList.awesomeListToken = response.nextPageToken
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
