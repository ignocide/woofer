// Example model

module.exports = function (sequelize, DataTypes) {
  var playlist = sequelize.define('playlist', {
    name: DataTypes.STRING,
    team_no: DataTypes.INTEGER(10),
    url: DataTypes.STRING,
    thumbnail: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {}
    }
  })

  return playlist
}
