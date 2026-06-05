'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association with User model
      UserDocument.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // Association with verifier (User who verified the documents)
      UserDocument.belongsTo(models.User, {
        foreignKey: 'verified_by',
        as: 'verifier',
      });
    }
  }

  UserDocument.init({
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
    
    // Profile and basic documents
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Profile image file path'
    },
    cv: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'CV/Resume file path'
    },
    
    // Official documents
    nid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'National ID document file path'
    },
    passport: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Passport document file path'
    },
    driving_license: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Driving license file path'
    },
    birth_certificate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Birth certificate file path'
    },
    
    // Work-related documents
    job_clearance: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Job clearance certificate file path'
    },
    experience_certificate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Experience certificate file path'
    },
    salary_certificate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Previous salary certificate file path'
    },
    
    // Educational documents
    educational_docs: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Educational certificates file path'
    },
    degree_certificate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Degree certificate file path'
    },
    transcript: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Academic transcript file path'
    },
    
    // Guarantor and family documents
    guarantor_docs: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Guarantor documents file path'
    },
    guarantor_nid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Guarantor NID file path'
    },
    parents_nid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Parents NID documents file path'
    },
    spouse_nid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Spouse NID file path'
    },
    
    // Medical documents
    medical_certificate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Medical fitness certificate file path'
    },
    vaccination_certificate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Vaccination certificate file path'
    },
    
    // Banking documents
    bank_statement: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Bank statement file path'
    },
    cheque_leaf: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Bank cheque leaf file path'
    },
    
    // Document verification fields
    verification_status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected', 'incomplete'),
      defaultValue: 'pending',
      allowNull: false
    },
    verified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes from document verification'
    }
  }, {
    sequelize,
    modelName: 'UserDocument',
    tableName: 'user_documents', // Updated to match migration
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['verification_status']
      },
      {
        fields: ['verified_by']
      },
      {
        fields: ['verified_at']
      }
    ]
  });

  // Instance methods
  UserDocument.prototype.getDocumentUrl = function(documentType) {
    if (this[documentType]) {
      return `${process.env.BASE_URL}/${this[documentType]}`;
    }
    return null;
  };

  UserDocument.prototype.hasDocument = function(documentType) {
    return !!this[documentType];
  };

  UserDocument.prototype.getUploadedDocuments = function() {
    const documentFields = [
      'image', 'cv', 'nid', 'passport', 'driving_license', 'birth_certificate',
      'job_clearance', 'experience_certificate', 'salary_certificate',
      'educational_docs', 'degree_certificate', 'transcript',
      'guarantor_docs', 'guarantor_nid', 'parents_nid', 'spouse_nid',
      'medical_certificate', 'vaccination_certificate',
      'bank_statement', 'cheque_leaf'
    ];

    return documentFields.filter(field => this[field]).map(field => ({
      type: field,
      path: this[field],
      url: this.getDocumentUrl(field)
    }));
  };

  UserDocument.prototype.markAsVerified = function(verifierId, notes = null) {
    this.verification_status = 'verified';
    this.verified_by = verifierId;
    this.verified_at = new Date();
    if (notes) {
      this.verification_notes = notes;
    }
    return this.save();
  };

  UserDocument.prototype.markAsRejected = function(verifierId, notes) {
    this.verification_status = 'rejected';
    this.verified_by = verifierId;
    this.verified_at = new Date();
    this.verification_notes = notes;
    return this.save();
  };

  // Static methods
  UserDocument.getPendingVerifications = function() {
    return this.findAll({
      where: {
        verification_status: 'pending'
      },
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name', 'email']
      }]
    });
  };

  UserDocument.getByVerificationStatus = function(status) {
    return this.findAll({
      where: {
        verification_status: status
      },
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'employee_id', 'name', 'email']
      }]
    });
  };

  return UserDocument;
};