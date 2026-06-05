const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createCompanyValidationRules, deleteCompanyValidationRules } = require('../dtos/companyDto')
const {
  deleteCompanyPermanently,
  editCompany,
  getCompanies,
  createCompany
} = require('../controllers/companyController');


router.route('/').post(protect, authorize('admin', 'super-admin'), createCompanyValidationRules(), validator, createCompany);
router.route('/:id/delete').delete(protect, authorize('admin', 'super-admin'), deleteCompanyValidationRules(), validator, deleteCompanyPermanently);
router.route('/:id').patch(protect, authorize('admin', 'super-admin'), editCompany);
router.route('/').get(protect, getCompanies);

module.exports = router;
