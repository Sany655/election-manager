'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // RolePermission belongs to Role
      RolePermission.belongsTo(models.Role, {
        foreignKey: 'role_id',
       
      });

      // RolePermission belongs to Permission
      RolePermission.belongsTo(models.Permission, {
        foreignKey: 'permission_id',
        
      });
    }
  }
  RolePermission.init({
    role_id: DataTypes.INTEGER,
    permission_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RolePermission',
    tableName:"role_permissions",
    freezeTableName: true
  });
  return RolePermission;
};