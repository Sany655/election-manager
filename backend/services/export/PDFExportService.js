const PDFDocument = require('pdfkit');
const { DateUtils } = require('../../utils/DateUtils');

class PDFExportService {
  static async generatePDF(data, options = {}) {
    const doc = new PDFDocument({ margin: 50 });
    
    doc.fontSize(20).text('Attendance Report', { align: 'center' });
    doc.moveDown();
    
    if (options.startDate && options.endDate) {
      doc.fontSize(12).text(
        `Period: ${DateUtils?.formatDate(options.startDate, 'DD/MM/YYYY')} - ${DateUtils?.formatDate(options.endDate, 'DD/MM/YYYY')}`,
        { align: 'center' }
      );
    }
    
    doc.moveDown();

    if (data.length > 0) {
      const totalEmployees = data.length;
      const avgAttendance = (data.reduce((sum, emp) => sum + parseFloat(emp.present_percent), 0) / totalEmployees).toFixed(1);
      
      doc.fontSize(12).text(`Total Employees: ${totalEmployees}`);
      doc.text(`Average Attendance: ${avgAttendance}%`);
      doc.moveDown();
    }

    // Table implementation (simplified for space)
    const tableTop = doc.y;
    const headers = ['Name', 'ID', 'Working', 'Present', 'Absent', 'Attendance %'];
    
    let yPosition = tableTop + 20;
    data.forEach((employee) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.fontSize(9).text(`${employee.user_name || 'N/A'} | ${employee.employee_id || 'N/A'} | ${employee.working_days} | ${employee.present_days} | ${employee.absent_days} | ${employee.present_percent}%`, 50, yPosition);
      yPosition += 15;
    });

    return doc;
  }
}

module.exports = PDFExportService;