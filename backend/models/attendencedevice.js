"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AttendenceDevice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AttendenceDevice.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  AttendenceDevice.init(
    {
      device_name: {
        type: DataTypes.STRING,
      },
      sl_no: {
        type: DataTypes.STRING,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "id",
        },
      },
      mac_address: {
        type: DataTypes.STRING,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
      },
      last_ping: {
        type: DataTypes.DATE,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "AttendenceDevice",
      tableName: "attendance_devices",
    }
  );
  return AttendenceDevice;
};
