// Example model

module.exports = function (sequelize, DataTypes) {
  var team = sequelize.define('team', {
    team_no: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
      }
    }
  })

  return team
}
