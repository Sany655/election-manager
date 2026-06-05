const { Division, District, Upazilla, Union } = require('../models');

exports.getDivisions = async (req, res) => {
  try {
    const divisions = await Division.findAll();
    res.json(divisions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching divisions' });
  }
};

exports.getDistrictsByDivision = async (req, res) => {
  try {
    const { divisionId } = req.params;
    const districts = await District.findAll({
      where: { division_id: divisionId }
    });
    res.json(districts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching districts' });
  }
};

exports.getUpazillasByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const upazillas = await Upazilla.findAll({
      where: { district_id: districtId }
    });
    res.json(upazillas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching upazillas' });
  }
};

exports.getUnionsByUpazilla = async (req, res) => {
  try {
    const { upazillaId } = req.params;
    const unions = await Union.findAll({
      where: { upazilla_id: upazillaId }
    });
    res.json(unions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching unions' });
  }
};
