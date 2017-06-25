'use strict'

const Promise = require('bluebird')

var TEAM = function () {}

TEAM.prototype.leave = function (socket, io, data) {
  return new Promise(function (resolve, reject) {
    let joinedTeam = socket.room
    if (joinedTeam) {
      socket.leave(socket.room, function (err) {
        if (err) {
          reject(err)
        }else {
          delete socket.room
          resolve()
        }
      })
    }else {
      resolve()
    }
  })
}

TEAM.prototype.join = function (socket, io, data) {
  return new Promise(function (resolve, reject) {
    let room = data.room
    socket.join(room, function (err) {
      if (err) {
        return reject(err)
      }
      socket.room = room
      resolve()
    })
  })
}
module.exports = new TEAM()
