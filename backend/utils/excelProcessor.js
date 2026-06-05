const ExcelJS = require('exceljs');
const moment = require('moment');

class ExcelProcessor {
  constructor(filePath) {
    this.filePath = filePath;
    this.workbook = new ExcelJS.Workbook();
  }

  async loadWorkbook() {
    try {
      await this.workbook.xlsx.readFile(this.filePath);
      console.log('✓ Excel workbook loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Error loading workbook:', error.message);
      return false;
    }
  }

  getSheetNames() {
    return this.workbook.worksheets.map(ws => ws.name);
  }

  analyzeSheet(sheetName = 'MAIN DATABASE') {
    const worksheet = this.workbook.getWorksheet(sheetName);
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    console.log(`\n📊 Analyzing sheet: ${sheetName}`);
    console.log(`Dimensions: ${worksheet.rowCount} rows x ${worksheet.columnCount} columns`);
    
    return {
      rowCount: worksheet.rowCount,
      columnCount: worksheet.columnCount
    };
  }

  cleanValue(value, type = 'string') {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return null;
    }

    switch (type) {
      case 'string':
        return typeof value === 'string' ? value.trim() : String(value).trim();
      
      case 'number':
        const num = Number(value);
        return isNaN(num) ? null : num;
      
      case 'date':
        if (value instanceof Date) {
          return moment(value).format('YYYY-MM-DD');
        }
        if (typeof value === 'number' && value > 25000) {
          // Excel serial date
          const excelDate = new Date((value - 25569) * 86400 * 1000);
          return moment(excelDate).format('YYYY-MM-DD');
        }
        if (typeof value === 'string') {
          const parsedDate = moment(value, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']);
          return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null;
        }
        return null;
      
      default:
        return value;
    }
  }

  async processMainDatabase() {
    const worksheet = this.workbook.getWorksheet('MAIN DATABASE');
    if (!worksheet) {
      throw new Error('MAIN DATABASE sheet not found');
    }

    const processedData = [];
    const startRow = 4; // Based on your Excel structure

    console.log(`\n🔄 Processing data from row ${startRow}...`);

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < startRow) return;

      // Extract values using column indices
      const rowData = {
        // Basic info
        sl: this.cleanValue(row.getCell(1).value, 'number'),
        team: this.cleanValue(row.getCell(2).value),
        region: this.cleanValue(row.getCell(3).value),
        area: this.cleanValue(row.getCell(4).value),
        territory: this.cleanValue(row.getCell(5).value),
        town: this.cleanValue(row.getCell(6).value),
        sap_code: this.cleanValue(row.getCell(7).value),
        employee_id: this.cleanValue(row.getCell(8).value),
        employee_name: this.cleanValue(row.getCell(9).value),
        designation: this.cleanValue(row.getCell(10).value),
        
        // Personal details
        education: this.cleanValue(row.getCell(11).value),
        date_of_birth: this.cleanValue(row.getCell(12).value, 'date'),
        age: this.cleanValue(row.getCell(13).value?.result, 'number'),
        joining_date_current: this.cleanValue(row.getCell(14).value, 'date'),
        
        // Service times
        service_time_previous_year: this.cleanValue(row.getCell(15).value, 'number'),
        service_time_previous_month: this.cleanValue(row.getCell(16).value, 'number'),
        service_time_current_year:this.cleanValue(row.getCell(17).value?.result,'number'),
        service_time_current_year: this.cleanValue(row.getCell(17).value?.result, 'number'),
        service_time_current_month: this.cleanValue(row.getCell(18).value?.result, 'number'),
        total_exp_year: this.cleanValue(row.getCell(19).value?.result, 'number'),
        total_exp_month: this.cleanValue(row.getCell(20).value?.result, 'number'),
        total_experience_year: this.cleanValue(row.getCell(21).value?.result, 'number'),
        total_experience_month: this.cleanValue(row.getCell(22).value?.result, 'number'),
        tenure: this.cleanValue(row.getCell(23).value?.result),
        
        // Personal info
        gender: this.cleanValue(row.getCell(24).value),
        marital_status: this.cleanValue(row.getCell(25).value),
        blood_group: this.cleanValue(row.getCell(26).value),
        
        // FF details
        ff_identification: this.cleanValue(row.getCell(27).value),
        ff_identification_number: this.cleanValue(row.getCell(28).value),
        ff_contact_number: this.cleanValue(row.getCell(29).value),
        
        // Status changes
        status_change: this.cleanValue(row.getCell(30).value),
        date_status_change: this.cleanValue(row.getCell(31).value, 'date'),
        reason_change: this.cleanValue(row.getCell(32).value),
        ff_disability: this.cleanValue(row.getCell(33).value),
        remarks_exit: this.cleanValue(row.getCell(34).value)
      };

      // Only include rows that have at least employee_name or employee_id
      if (rowData.employee_name || rowData.employee_id) {
        processedData.push(rowData);
      }
    });

    console.log(`✓ Processed ${processedData.length} valid records`);
    return processedData;
  }

  async processMainDatabaseDetails() {
    const worksheet = this.workbook.getWorksheet('Details');
    if (!worksheet) {
      throw new Error('Details sheet not found');
    }

    const processedData = [];
    const startRow = 3; // Based on your Excel structure

    console.log(`\n🔄 Processing data from row ${startRow}...`);

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < startRow) return;

      // Extract values using column indices
      const rowData = {
        // Basic info
        sl: this.cleanValue(row.getCell(1).value, 'number'),
        team: this.cleanValue(row.getCell(2).value),
        region: this.cleanValue(row.getCell(3).value),
        area: this.cleanValue(row.getCell(4).value),
        territory: this.cleanValue(row.getCell(5).value),
        town: this.cleanValue(row.getCell(6).value),
        sap_code: this.cleanValue(row.getCell(7).value),
        employee_id: this.cleanValue(row.getCell(8).value),
        employee_name: this.cleanValue(row.getCell(9).value),
        designation: this.cleanValue(row.getCell(10).value),
        joining_date_current: this.cleanValue(row.getCell(14).value, 'date'),
      };

      // Only include rows that have at least employee_name or employee_id
      if (rowData.employee_name || rowData.employee_id) {
        processedData.push(rowData);
      }
    });

    console.log(`✓ Processed ${processedData.length} valid records`);
    return processedData;
  }
}

module.exports = ExcelProcessor;