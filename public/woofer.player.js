'use strict'
var WooperPlayer = angular.module('woofer.player', [])

WooperPlayer.factory('wooferPlayer', function () {
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
    if (nextIndex == null) {
      nextIndex = samples.shift()
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

WooperPlayer.factory('extraList', function () {
  var SVC = {
    awesomeList: [],
    awesomeListToken: null,
    recentList: [],
    recentListToken: null
  }

  return SVC
})
