'use strict'

const Promise = require('bluebird')

var TEAM = function () {
}

TEAM.prototype.leave = function (socket, io, data) {
  return new Promise(function (resolve, reject) {
    let joinedTeam = socket.team
    if (joinedTeam) {
      socket.leave(socket.team, function () {
        if (err) {
          reject(err)
        }
        else {
          delete socket.team
          resolve()
        }
      })
    }
    else {
      resolve()
    }
  })
}

TEAM.prototype.join = function (socket, io, data) {
  return new Promise(function (resolve, reject) {
    let team = data.team
    socket.join(team, function (err) {
      if (err) {
        return reject(err)
      }
      socket.team = team
      resolve()
    })
  })
}
module.exports = new TEAM()
