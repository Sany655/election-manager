const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/db');
const { errHandler, notFound } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const teamRoutes = require('./routes/teamRoutes');
const locationRoutes = require('./routes/locationRoutes');
const areaRoutes = require('./routes/areaRoutes');
const territoryRoutes = require('./routes/territoryRoutes');
const rffRoutes = require('./routes/rffRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const policyRoutes = require('./routes/policyRoutes');
const designationRoutes = require('./routes/designationRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const attendanceDeviceRoutes = require('./routes/attendanceDeviceRoutes');
const volunteerTeamRoutes = require('./routes/volunteerTeamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const eventRoutes = require('./routes/event/eventRoutes');
const eventTypeRoutes = require('./routes/event/eventTypeRoutes');
const eventTargetGroupRoutes = require('./routes/event/eventTargetGroupRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const eventResourceRoutes = require('./routes/eventResourceRoutes');
const eventCostRoutes = require('./routes/eventCostRoutes');
const voterRoutes = require('./routes/voterRoutes');
const voteCentreRoutes = require('./routes/voteCentreRoutes')
const messageRoutes = require('./routes/message/messagingRoutes');
const geoRoutes = require('./routes/geoRoutes');

const divisionRoutes = require('./routes/divisionRoutes');
const districtRoutes = require('./routes/districtRoutes');
const upazillaRoutes = require('./routes/upazillaRoutes');
const unionRoutes = require('./routes/unionRoutes');
const wardRoutes = require('./routes/wardRoutes');

const path = require('path');
const bodyParser = require('body-parser');
const { getAppMetadata } = require('./controllers/metadataController');
const { manageZktecoDevice } = require('./utils/connectZKTecho');
const eventGrandTotalRoutes = require('./routes/eventGrandTotalRoutes');
const organizerRoutes = require("./routes/organizerRoutes");
const surveyRoutes = require("./routes/surveyRoutes");

const PORT = process.env.PORT || 8001;
const app = express();

// manageZktecoDevice();
//db connection
sequelize.authenticate()
  .then(async () => {
    console.log('Mysql Connected...');
    await sequelize.sync({ alter: true }); //x dont make force:true , it will recreate table 
    console.log('All models synced to DB...');
  })
  .catch(error => {
    console.error('DB Connection Error!', error);
  });

//middleware
app.use(cors({
  credentials: true,
  // origin: [process.env.DEV_DOMAIN, process.env.LIVE_DOMAIN],
  origin: true, // Reflects the request origin, allowing credentials
  // origin: ["*"],
  // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  // allowedHeaders: ['Content-Type', '*'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']

}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//apis

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/territories', territoryRoutes);
app.use('/api/rff-points', rffRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/devices', attendanceDeviceRoutes);
app.use('/api/volunteer-teams', volunteerTeamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/events/target-groups', eventTargetGroupRoutes);

app.use('/api/campaigns', campaignRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/vote-centres', voteCentreRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/event-resources', eventResourceRoutes);
app.use("/api/organizers", organizerRoutes);

app.use('/api/event-cost', eventCostRoutes);
app.use('/api/event-grand-total', eventGrandTotalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/whatsapp', require('./routes/message/whatsappRoutes'));
app.use('/api/geo', geoRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/upazillas', upazillaRoutes);
app.use('/api/unions', unionRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/social-analytics', require('./routes/socialAnalyticsRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/command-center', require('./routes/commandCenterRoutes'));


//use for integrated application
// if (process.env.NODE_ENV === 'prod') {
//   app.use(express.static(path.join(__dirname, '../frontend/build'))); // Adjust path here
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html')); // Adjust path here
//   });
// }

app.get('/api/app/metadata', getAppMetadata);

//health check
app.get('/health-check', (req, res, next) => {
  const healthStatus = {
    uptime: process.uptime(),
    msg: 'OK',
    timestamp: Date.now()
  }

  try {
    res.send(healthStatus);
  } catch (error) {
    healthStatus.msg = error;
    res.status(503).send();
  }

});

app.get('/', (req, res) => {
  res.status(200).json({ msg: 'Welcome to Nirbaconhub API' });
});

// if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
//   const frontendPath = path.resolve(__dirname, process.env.STATIC_DIR);
//   app.use(express.static(frontendPath));
//   app.get('*', (req, res) => {
//     if (!req.path.startsWith('/api')) {
//       res.sendFile(path.join(frontendPath, 'index.html'));
//     } else {
//       res.status(404).json({ msg: 'API route not found' });
//     }
//   });
// }

app.use(notFound);
app.use(errHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));