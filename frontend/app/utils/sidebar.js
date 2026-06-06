import {
  FaTachometerAlt,
  FaUserCog,
  FaMapMarkerAlt,
  FaUsers,
  FaFileAlt,
  FaCalendarDay,
  FaCalendarAlt,
  FaCalendar,
  FaGlobe,
  FaAllergies,
  FaMaxcdn,
  FaVoteYea,
  FaUserCheck,
  FaChartPie,
  FaWhatsapp,
  FaUserTie,
  FaPhone
} from "react-icons/fa";
import { FaLandMineOn } from "react-icons/fa6";
import {
  MdOutlineLocalPolice,
  MdOutlineAlignHorizontalLeft,
  MdOutlineAddModerator,
  MdLocationCity,
  MdPlace,
  MdHowToVote,
  MdOutlineMessage,
  MdSms,
  MdEmail,
  MdOutlinedFlag
} from "react-icons/md";
import { AiOutlineAntDesign } from "react-icons/ai";
import { TbCheckbox, TbDeviceAirtag } from "react-icons/tb";
import { RiRoadMapLine } from "react-icons/ri";
import { HiOfficeBuilding } from "react-icons/hi";


const menu = [
  {
    title: "Overview",
    icon: <FaTachometerAlt />,
    path: "/",
    permission: 'view-dashboard',
  },
  {
    title: "9th Election",
    icon: <TbCheckbox />,
    path: "/9th-election",
    permission: 'view-election-9th',
  },
  {
    title: "News",
    icon: <FaFileAlt />,
    path: "/news",
    permission: 'view-news',
  },
  {
    title: "Election Info",
    icon: <FaCalendarDay />,
    path: "/election-info",
    permission: 'view-election-info',
  },
  {
    title: "Pooling Day Command Center",
    icon: <MdOutlinedFlag />,
    permission: 'view-command-center',
    childrens: [
      {
        title: "War Room",
        icon: <MdOutlineLocalPolice />,
        path: "/command-center/overview",
        permission: 'view-command-center',
      },
      {
        title: "Agent Setup",
        icon: <FaUserCog />,
        path: "/command-center/agent-setup",
        permission: 'view-command-center',
      },
      {
        title: "Incident & Issue Monitoring",
        icon: <FaLandMineOn />,
        path: "/command-center/incident-monitoring",
        permission: 'view-command-center',
      },
    ],
  },
  {
    title: "Ai & Analytics",
    icon: <FaMaxcdn />,
    childrens: [
      {
        title: "Social Analytics",
        icon: <FaAllergies />,
        path: "/ai/social-analytics",
        permission: 'view-social-analytics',
      },
      {
        title: "Surveys",
        icon: <FaCalendarAlt />,
        path: "/ai/surveys",
        permission: 'view-surveys',
      },
      {
        title: "Questionaire",
        icon: <FaFileAlt />,
        path: "/ai/questionaire",
        permission: 'view-questionaire',
      },
    ],
  },
  {
    title: "Campaign",
    icon: <TbDeviceAirtag />,
    childrens: [
      {
        title: "Overview",
        icon: <FaTachometerAlt />,
        path: "/campaign/overview",
        permission: 'view-campaign-overview',
      },
      {
        title: "Roadmap",
        icon: <RiRoadMapLine />,
        path: "/campaign/roadmap",
        permission: 'view-campaign-roadmap',
      },
    ],
  },
  {
    title: "Task Management",
    icon: <MdOutlineLocalPolice />,
    childrens: [
      {
        title: "Tasks",
        path: "/tasks/view",
        icon: <MdOutlineAlignHorizontalLeft />,
        permission: 'view-tasks',
      },
      // {
      //   title: "Reports",
      //   path: "/tasks/reports",
      //   icon: <MdOutlineAddModerator />,
      // },
    ],
  },
  {
    title: "Voter Management",
    icon: <MdHowToVote />,
    childrens: [
      {
        title: "Overview",
        path: "/voter-management/overview",
        icon: <FaChartPie />,
        permission: 'view-voter-overview',
      },
      {
        title: "Voters",
        path: "/voter-management/voters",
        icon: <FaUserCheck />,
        permission: 'view-voters',
      },
      {
        title: "Voter Centers",
        path: "/voter-management/vote-centres",
        icon: <HiOfficeBuilding />,
        permission: 'view-vote-centres',
      },
    ],
  },
  {
    title: "Candidate Management",
    icon: <FaUserTie />,
    childrens: [
      {
        title: "Candidates",
        icon: <FaUsers />,
        path: "/candidates/view",
        permission: 'view-candidates',
      }
    ],
  },
  {
    title: "Volunteer Management",
    icon: <FaUserCog />,
    childrens: [
      {
        title: "Overview",
        icon: <FaUsers />,
        path: "/volunteer/overview",
        permission: 'view-volunteer-overview',
      },
      {
        title: "Volunteer Setup",
        icon: <FaUsers />,
        path: "/volunteer/view",
        permission: 'view-volunteers',
      },
      {
        title: "Roles Setup",
        icon: <AiOutlineAntDesign />,
        path: "/volunteer/designation",
        permission: 'view-designations',
      },
      {
        title: "Team Setup",
        icon: <AiOutlineAntDesign />,
        path: "/volunteer/team",
        permission: 'view-teams',
      },
      {
        title: "Location Setup",
        icon: <AiOutlineAntDesign />,
        childrens: [
          {
            title: "Division",
            icon: <FaUsers />,
            path: "/location/division/view",
            permission: 'view-divisions',
          },
          {
            title: "District",
            icon: <FaGlobe />,
            path: "/location/district/view",
            permission: 'view-districts',
          },
          {
            title: "Upazilla",
            icon: <MdLocationCity />,
            path: "/location/upazilla/view",
            permission: 'view-upazillas',
          },
          // {
          //   title: "Ward",
          //   icon: <FaMapMarkerAlt />,
          //   path: "/location/ward/view",
          //   permission: 'view-wards',
          // },
          {
            title: "Union",
            icon: <MdPlace />,
            path: "/location/union/view",
            permission: 'view-unions',
          },
        ]
      },
    ],
  },
  {
    title: "Activities",
    icon: <MdOutlineLocalPolice />,
    childrens: [
      {
        title: "Overview",
        path: "/event/overview",
        icon: <MdOutlineAlignHorizontalLeft />,
        permission: 'view-event-overview',
      },
      {
        title: "Activities List",
        path: "/event/view",
        icon: <MdOutlineAlignHorizontalLeft />,
        permission: 'view-events',
      },
      {
        title: "Event Types",
        path: "/event-types/view",
        icon: <MdOutlineAddModerator />,
        permission: 'view-event-types',
      },
      {
        title: "Event Target Group",
        path: "/event-target-groups/view",
        icon: <MdOutlineAddModerator />,
        permission: 'view-target-groups',
      },
      {
        title: "Organizer",
        path: "/organizers/view",
        icon: <MdOutlineAddModerator />,
        permission: 'view-organizers',
      },
      // {
      //   title: "Assign Volunteer",
      //   path: "/event/assign-volunteer",
      //   icon: <MdOutlineAddModerator />,
      // },
      {
        title: "Resource Management",
        path: "/resources/view",
        icon: <MdOutlineAddModerator />,
        permission: 'view-resources',
      },

    ],
  },
  {
    title: "Communication",
    icon: <MdOutlineMessage />,
    childrens: [
      {
        title: "SMS",
        icon: <MdSms />,
        path: "/communication/sms",
        permission: 'view-sms',
      },
      {
        title: "WhatsApp",
        icon: <FaWhatsapp />,
        path: "/communication/wa",
        permission: 'view-whatsapp',
      },
      {
        title: "Email",
        icon: <MdEmail />,
        path: "/communication/email",
        permission: 'view-email',
      },
      {
        title: "Push Notifications",
        icon: <MdOutlineMessage />,
        path: "/communication/push",
        permission: 'view-push-notifications',
      },
    ],
  },
  {
    title: "Admin",
    icon: <FaLandMineOn />,
    childrens: [
      {
        title: "All",
        icon: <FaUsers />,
        path: "/users/view",
        permission: 'view-users',
      },
      {
        title: "Permissions",
        icon: <FaUsers />,
        path: "/volunteer/permissions",
        permission: 'view-permissions',
      },
      {
        title: "Roles",
        icon: <FaUsers />,
        path: "/volunteer/roles",
        permission: 'view-roles',
      },
    ],
  },
  {
    title: "Contact QP",
    icon: <FaPhone />,
    path: "/contact",
    permission: 'view-dashboard', // Everyone can view contact
  },
];

export default menu;
