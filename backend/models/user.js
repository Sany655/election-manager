'use strict';
const { Model } = require('sequelize');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles'
      });

      User.hasMany(models.Attendence, {
        foreignKey: 'user_id',
        as: 'attendances'
      });

      User.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });

      User.belongsTo(models.Division, {
        foreignKey: 'division_id',
        as: 'division'
      });

      User.belongsTo(models.District, {
        foreignKey: 'district_id',
        as: 'district'
      });

      User.belongsTo(models.Designation, {
        foreignKey: 'designation_id',
        as: 'designation'
      });

      User.hasOne(models.UserPersonalDetails, {
        foreignKey: 'user_id',
        as: 'personalDetails'
      });

      User.hasOne(models.UserDocument, {
        foreignKey: 'user_id',
        as: 'documents'
      });

      User.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department'
      });

      User.belongsTo(models.Upazilla, {
        foreignKey: 'upazilla_id',
        as: 'upazilla'
      });

      User.belongsTo(models.Union, {
        foreignKey: 'union_id',
        as: 'union'
      });

      User.hasMany(models.AttendenceDevice, {
        foreignKey: 'user_id',
        as: 'devices'
      });

      User.hasMany(models.AgentAssignment, {
        foreignKey: 'agent_id',
        as: 'assignments'
      });

      User.hasMany(models.IncidentReport, {
        foreignKey: 'agent_id',
        as: 'reported_incidents'
      });

    }

    // Compare password
    matchPassword = async function (plainPass) {
      return await bcrypt.compare(plainPass, this.password);
    };

    // Sign JWT
    getSignedJwtToken = function () {
      return jwt.sign(
        { id: this.id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRED_IN }
      );
    }
  }

  User.init({
    name: {
      type: DataTypes.STRING(50),
    },
    employee_id: {
      type: DataTypes.STRING(50),
    },
    fingerprint_template: {
      type: DataTypes.BLOB('long'),
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    msisdn: {
      type: DataTypes.STRING(15),
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    division_id: {
      type: DataTypes.INTEGER,
    },
    district_id: {
      type: DataTypes.INTEGER,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
    },
    avatar: {
      type: DataTypes.STRING(255),
    },
    department_id: {
      type: DataTypes.INTEGER,
    },
    upazilla_id: {
      type: DataTypes.INTEGER,
    },
    union_id: {
      type: DataTypes.INTEGER,
    },
    ward: {
      type: DataTypes.INTEGER,
    },
    designation_id: {
      type: DataTypes.INTEGER,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};
