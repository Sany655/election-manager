'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPersonalDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association with User model
      UserPersonalDetails.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }

  UserPersonalDetails.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },

    // Personal information
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of Birth'
    },
    blood_group: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: true
    },
    marital_status: {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
      allowNull: true
    },

    // Identification
    identification_type: {
      type: DataTypes.ENUM('nid', 'passport', 'driving_license', 'birth_certificate'),
      allowNull: true
    },
    identification_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    disability: {
      type: DataTypes.ENUM('none', 'physical', 'visual', 'hearing', 'intellectual', 'other'),
      defaultValue: 'none',
      allowNull: true
    },

    // Work experience
    total_experience: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Total work experience (e.g., "3 years", "6 months")'
    },

    // Banking information
    account_type: {
      type: DataTypes.ENUM('savings', 'current', 'salary'),
      allowNull: true
    },
    account_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    // Work codes
    rff_point: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'RFF Point code'
    },
    rff_sub_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'RFF Sub code'
    },

    emergency_contact_phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },


    // Address information
    present_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    permanent_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    home_geo_location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UserPersonalDetails',
    tableName: 'user_personal_details',
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['identification_type', 'identification_no']
      },
      {
        fields: ['blood_group']
      },
      {
        fields: ['marital_status']
      }
    ]
  });

  // Instance methods
  UserPersonalDetails.prototype.getAge = function () {
    if (!this.dob) return null;

    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  UserPersonalDetails.prototype.getExperienceInYears = function () {
    if (!this.total_experience) return null;

    // Parse experience string to extract years
    const experienceStr = this.total_experience.toLowerCase();
    const yearMatch = experienceStr.match(/(\d+)\s*year/);
    const monthMatch = experienceStr.match(/(\d+)\s*month/);

    let totalYears = 0;
    if (yearMatch) totalYears += parseInt(yearMatch[1]);
    if (monthMatch) totalYears += parseInt(monthMatch[1]) / 12;

    return totalYears;
  };

  // UserPersonalDetails.prototype.hasEmergencyContact = function() {
  //   return !!(this.emergency_contact_name && this.emergency_contact_phone);
  // };

  UserPersonalDetails.prototype.isProfileComplete = function () {
    const requiredFields = [
      'dob', 'blood_group', 'marital_status', 'identification_type',
      'identification_no', 'present_address'
    ];

    return requiredFields.every(field => this[field]);
  };

  UserPersonalDetails.prototype.getFormattedAddress = function (type = 'present') {
    const field = type === 'present' ? 'present_address' : 'permanent_address';
    return this[field] || 'Not provided';
  };

  UserPersonalDetails.prototype.isSameAddress = function () {
    return this.present_address === this.permanent_address;
  };

  // Static methods
  UserPersonalDetails.getByBloodGroup = function (bloodGroup) {
    return this.findAll({
      where: { blood_group: bloodGroup },
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name', 'mobile_no']
      }]
    });
  };

  UserPersonalDetails.getByMaritalStatus = function (status) {
    return this.findAll({
      where: { marital_status: status },
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name']
      }]
    });
  };

  UserPersonalDetails.getIncompleteProfiles = function () {
    return this.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { dob: null },
          { blood_group: null },
          { marital_status: null },
          { identification_type: null },
          { identification_no: null },
          { present_address: null }
        ]
      },
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name', 'email']
      }]
    });
  };

  UserPersonalDetails.getByAgeRange = function (minAge, maxAge) {
    const currentYear = new Date().getFullYear();
    const maxBirthYear = currentYear - minAge;
    const minBirthYear = currentYear - maxAge;

    return this.findAll({
      where: {
        dob: {
          [sequelize.Sequelize.Op.between]: [
            `${minBirthYear}-01-01`,
            `${maxBirthYear}-12-31`
          ]
        }
      },
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name']
      }]
    });
  };

  UserPersonalDetails.getBirthdaysThisMonth = function () {
    const currentMonth = new Date().getMonth() + 1;

    return this.findAll({
      where: sequelize.Sequelize.where(
        sequelize.Sequelize.fn('MONTH', sequelize.Sequelize.col('dob')),
        currentMonth
      ),
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name', 'email']
      }],
      order: [
        [sequelize.Sequelize.fn('DAY', sequelize.Sequelize.col('dob')), 'ASC']
      ]
    });
  };

  UserPersonalDetails.getUpcomingBirthdays = function (days = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.findAll({
      where: {
        dob: {
          [sequelize.Sequelize.Op.ne]: null
        }
      },
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name', 'email']
      }]
    }).then(results => {
      // Filter upcoming birthdays in JavaScript since it's complex to do in SQL
      return results.filter(person => {
        if (!person.dob) return false;

        const birthday = new Date(person.dob);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

        // If birthday already passed this year, check next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        return thisYearBirthday <= futureDate;
      });
    });
  };

  return UserPersonalDetails;
};