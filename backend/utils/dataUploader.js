const db = require('../models/index');

const {
  User, Role, UserRole, sequelize, UserPersonalDetails, Team, Location, Area, Territory, RffPoint, Designation
} = db;

class DataUploader {
  constructor() {
    this.teamCache = new Map();
    this.locationCache = new Map();
    this.areaCache = new Map();
    this.territoryCache = new Map();
    this.rffCache = new Map();
    this.sapCache = new Map();
    this.designationCache = new Map();
  }

  async findOrCreateTeam(teamName) {
    if (!teamName) return null;

    const cacheKey = teamName.toLowerCase(); //upercase
    if (this.teamCache.has(cacheKey)) {
      return this.teamCache.get(cacheKey);
    }

    const [team] = await Team.findOrCreate({
      where: { name: teamName },
      defaults: {
        name: teamName,
        company_id: 1,
        department_id: 1
      }
    });

    this.teamCache.set(cacheKey, team.id);
    return team.id;
  }

  async findOrCreateLocation(locName, teamId) {
    if (!locName) return null;

    const cacheKey = locName.toLowerCase(); //upercase
    if (this.locationCache.has(cacheKey)) {
      return this.locationCache.get(cacheKey);
    }

    const [loc] = await Location.findOrCreate({
      where: { location_name: locName },
      defaults: {
        location_name: locName,
        company_id: 1,
        department_id: 1,
        team_id: teamId
      }
    });

    this.locationCache.set(cacheKey, loc.id);
    return loc.id;
  }

  async findOrCreateArea(locName, teamId) {
    if (!locName) return null;

    const cacheKey = locName.toLowerCase(); //upercase
    if (this.areaCache.has(cacheKey)) {
      return this.areaCache.get(cacheKey);
    }

    const [loc] = await Area.findOrCreate({
      where: { area_name: locName },
      defaults: {
        area_name: locName,
        company_id: 1,
        department_id: 1,
        location_id: teamId
      }
    });

    this.areaCache.set(cacheKey, loc.id);
    return loc.id;
  }

  async findOrCreateTerritory(locName, teamId, locId) {
    if (!locName) return null;

    const cacheKey = locName.toLowerCase(); //upercase
    if (this.territoryCache.has(cacheKey)) {
      return this.territoryCache.get(cacheKey);
    }

    const [loc] = await Territory.findOrCreate({
      where: { name: locName },
      defaults: {
        name: locName,
        company_id: 1,
        department_id: 1,
        area_id: teamId,
        location_id: locId,
      }
    });

    this.territoryCache.set(cacheKey, loc.id);
    return loc.id;
  }

  async findOrCreateRff(locName, teamId, sap) {
    if (!locName) return null;

    const cacheKey = locName.toLowerCase(); //upercase
    if (this.rffCache.has(cacheKey)) {
      return this.rffCache.get(cacheKey);
    }

    const [loc] = await RffPoint.findOrCreate({
      where: { name: locName },
      defaults: {
        name: locName,
        company_id: 1,
        department_id: 1,
        territory_id: teamId,
        rff_sub_code: sap,
      }
    });

    this.rffCache.set(cacheKey, loc.id);
    return loc.id;
  }

  async findOrCreateDesignation(designationName, locId, areaId, rffId) {
    if (!designationName) return null;

    const cacheKey = designationName.toUpperCase(); //upercase
    if (this.designationCache.has(cacheKey)) {
      return this.designationCache.get(cacheKey);
    }

    const [designation] = await Designation.findOrCreate({
      where: { name: designationName },
      defaults: {
        name: designationName,
        company_id: 1,
        department_id: 1,
        location_id: locId,
        area_id: areaId,
        rff_id: rffId
      }
      //more fields...
    });

    this.designationCache.set(cacheKey, designation.id);
    return designation.id;
  }


  async uploadData(processedData) {
    const transaction = await sequelize.transaction();

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
console.log(processedData)
      console.log('\n🚀 Starting database upload...');

      for (let i = 2; i < processedData.length; i++) {
        try {
          const rowData = processedData[i];

          // Get foreign key IDs
          const teamId = await this.findOrCreateTeam(rowData.team);
          const locationId = await this.findOrCreateLocation(rowData.region, teamId);
          const areaId = await this.findOrCreateArea(rowData.area, locationId);
          const territoryId = await this.findOrCreateTerritory(rowData.territory, areaId, locationId);
          const rffId = await this.findOrCreateRff(rowData.town, territoryId, rowData.town.sap_code);
          const designationId = await this.findOrCreateDesignation(rowData.designation, locationId, areaId, rffId);

          
          // Create or update user
          const [user, created] = await User.findOrCreate({
            where: {
              employee_id: rowData.employee_id || `temp_${i}_${Date.now()}`
            },
            defaults: {
              employee_id: rowData.employee_id || `temp_${i}_${Date.now()}`,
              name: rowData.employee_name,
              company_id: 1,
              department_id: 1,
              designation_id: designationId,
              team_id: teamId,
              location_id: locationId,
              area_id: areaId,
              territory_id: territoryId,
              rff_point_id: rffId,
              joining_date: rowData.joining_date_current,
              isActive: 1,
              gender: this.normalizeGender(rowData.gender),
              msisdn: rowData.ff_contact_number,
              password: process.env.DEFAULT_USER_PASSWORD || '123456'
            },
            transaction
          });

          if (!created) {
            // Update existing user
            await user.update({
              employee_id: rowData.employee_id || `temp_${i}_${Date.now()}`,
              name: rowData.employee_name,
              company_id: 1,
              department_id: 1,
              designation_id: designationId,
              team_id: teamId,
              location_id: locationId,
              area_id: areaId,
              territory_id: territoryId,
              rff_point_id: rffId,
              joining_date: rowData.joining_date_current,
              isActive: 1,
              gender: this.normalizeGender(rowData.gender),
              msisdn: rowData.ff_contact_number,
              password: process.env.DEFAULT_USER_PASSWORD || '123456'
            }, { transaction });
          }

          //assing user_role as user (3)
          await UserRole.findOrCreate({
            where:{ user_id:user.id , role_id:3},
            defaults:{
              user_id:user.id,
              role_id:3
            }
          })

          // Create or update personal details
          if (this.hasPersonalDetails(rowData)) {
            await UserPersonalDetails.findOrCreate({
              where: { user_id: user.id },
              defaults: {
                user_id: user.id,
                dob: rowData.date_of_birth,
                marital_status: this.normalizeMaritalStatus(rowData.marital_status),
                blood_group: rowData.blood_group,
                education: rowData.education,
                contact_number: rowData.ff_contact_number,
                disability: rowData.ff_disability,
                identification_type: rowData.ff_identification,
                identification_no: rowData.ff_identification_number,
                // service_time_previous_year: rowData.service_time_previous_year,
                // service_time_previous_month: rowData.service_time_previous_month,
                // service_time_current_year: rowData.service_time_current_year,
                // service_time_current_month: rowData.service_time_current_month,
                total_experience_year: rowData.total_experience_year,
                // total_experience_month: rowData.total_experience_month,
                // tenure: rowData.tenure,
                // remarks: rowData.remarks_exit
              },
              transaction
            });
          }

          successCount++;

          if (successCount % 10 === 0) {
            console.log(`✓ Processed ${successCount} records...`);
          }

        } catch (error) {
          errorCount++;
          errors.push({
            row: i + 1,
            employee_id: processedData[i].employee_id,
            error: error.message
          });

          console.error(`❌ Error processing row ${i + 1}:`, error.message);
        }
      }

      await transaction.commit();

      console.log('\n=== UPLOAD SUMMARY ===');
      console.log(`✓ Successfully processed: ${successCount} records`);
      console.log(`❌ Failed records: ${errorCount}`);

      if (errors.length > 0 && errors.length < 10) {
        console.log('\nErrors:');
        errors.forEach(err => {
          console.log(`Row ${err.row} (${err.employee_id}): ${err.error}`);
        });
      }

      return { successCount, errorCount, errors };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  determineStatus(rowData) {
    if (rowData.status_change &&
      (rowData.status_change.toLowerCase().includes('resignation') ||
        rowData.status_change.toLowerCase().includes('termination'))) {
      return 'terminated';
    }
    return 'active';
  }

  normalizeGender(gender) {
    if (!gender) return null;
    const g = gender.toLowerCase();
    if (g.includes('male') && !g.includes('female')) return 'Male';
    if (g.includes('female')) return 'Female';
    return 'Others';
  }

  normalizeMaritalStatus(status) {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s.includes('single')) return 'Single';
    if (s.includes('married')) return 'Married';
    if (s.includes('divorced')) return 'Divorced';
    if (s.includes('widow')) return 'Widowed';
    return null;
  }

  hasPersonalDetails(rowData) {
    return rowData.date_of_birth || rowData.age || rowData.gender ||
      rowData.marital_status || rowData.blood_group || rowData.education ||
      rowData.ff_contact_number || rowData.ff_disability;
  }

  hasRffData(rowData) {
    return rowData.ff_identification || rowData.ff_identification_number ||
      rowData.service_time_previous_year || rowData.service_time_current_year ||
      rowData.total_experience_year || rowData.tenure;
  }
}

module.exports = DataUploader;