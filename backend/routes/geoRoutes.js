const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');

router.get('/divisions', geoController.getDivisions);
router.get('/districts/:divisionId', geoController.getDistrictsByDivision);
router.get('/upazillas/:districtId', geoController.getUpazillasByDistrict);
router.get('/unions/:upazillaId', geoController.getUnionsByUpazilla);

module.exports = router;
