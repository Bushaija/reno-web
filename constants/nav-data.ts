import { NavItem } from '@/types/nav-types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
// export const navItems: NavItem[] = [
//   {
//     title: 'Dashboard',
//     url: '/dashboard',
//     icon: 'dashboard',
//     isActive: false,
//     shortcut: ['d', 'd'],
//     items: [] // Empty array as there are no child items for Dashboard
//   },
//   {
//     title: 'Workforce Management',
//     url: '/dashboard/workforce-management',
//     icon: 'clipboardList',
//     shortcut: ['p', 'p'],
//     isActive: false,
//     items: [] // No child items
//   },
//   {
//     title: 'Shift Scheduling',
//     url: '/dashboard/shift-scheduling',
//     icon: 'checkList',
//     shortcut: ['e', 'e'],
//     isActive: false,
//     items: [] // No child items
//   },
//   {
//     title: 'Availability & Requests',
//     url: '/dashboard/availability-requests',
//     icon: 'layers',
//     shortcut: ['e', 'e'],
//     isActive: false,
//     items: [] // No child items
//   },
//   {
//     title: 'Staff Predictor',
//     url: '/dashboard/staff-predictor',
//     icon: 'layers',
//     shortcut: ['e', 'e'],
//     isActive: false,
//     items: [] // No child items
//   },

//   // {
//   //   title: 'Assignments',
//   //   url: '/dashboard/assignments',
//   //   icon: 'layers', 
//   //   shortcut: ['c', 'c'],
//   //   isActive: false,
//   //   items: [] // No child items
//   // },
//   {
//     title: 'Reports',
//     url: '/dashboard/reports',
//     icon: 'notebookTabs',
//     shortcut: ['r', 'r'],
//     isActive: true,
//     items: [
//       {
//         title: 'Analytics',
//         url: '/dashboard/reports/analytics',
//         icon: 'post',
//         shortcut: ['a', 'a']
//       },
//       {
//         title: 'Attendance Tracking',
//         url: '/dashboard/reports/attendance-tracking',
//         icon: 'post',
//         shortcut: ['a', 'a']
//       },
//       {
//         title: "Compliance",
//         url: "/dashboard/reports/compliance",
//         icon: 'post',
//         shortcut: ['c', 'c']

//       }
//       // {
//       //   title: 'Balance Sheet',
//       //   url: '/dashboard/reports/balance-sheet',
//       //   icon: 'media',
//       //   shortcut: ['b', 's']
//       // },
//       // {
//       //   title: 'Cash Flow',
//       //   url: '/dashboard/reports/cash-flow',
//       //   icon: 'dashboard',
//       //   shortcut: ['c', 'f']
//       // },
//       // {
//       //   title: 'Changes in Net Assets',
//       //   url: '/dashboard/reports/changes-in-assets',
//       //   icon: 'page',
//       //   shortcut: ['c', 'a']
//       // },
//       // {
//       //   title: 'Budget vs Actual',
//       //   url: '/dashboard/reports/budget-vs-actual',
//       //   icon: 'kanban',
//       //   shortcut: ['b', 'a']
//       // },
//     ]
//   },
// //   {
// //     title: 'Implementations',
// //     url: '/implementations', // Placeholder as there is no direct link for the parent
// //     icon: 'billing',
// //     isActive: true,

// //     items: [
// //       {
// //         title: 'Profile',
// //         url: '/dashboard/profile',
// //         icon: 'userPen',
// //         shortcut: ['m', 'm']
// //       },
// //       {
// //         title: 'Login',
// //         shortcut: ['l', 'l'],
// //         url: '/',
// //         icon: 'login'
// //       }
// //     ]
// //   },
// //   {
// //     title: 'Kanban',
// //     url: '/dashboard/kanban',
// //     icon: 'kanban',
// //     shortcut: ['k', 'k'],
// //     isActive: false,
// //     items: [] // No child items
// //   }
// ];

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  
  // Core Scheduling Features
  {
    title: 'Scheduling',
    url: '/dashboard/scheduling',
    icon: 'calendar',
    shortcut: ['s', 's'],
    isActive: false,
    items: [
      {
        title: 'Schedule Overview',
        url: '/dashboard/scheduling/overview',
        icon: 'calendar',
        shortcut: ['s', 'o']
      },
      // {
      //   title: 'Auto-Generate Schedule',
      //   url: '/dashboard/scheduling/auto-generate',
      //   icon: 'zap',
      //   shortcut: ['s', 'a']
      // },
      // {
      //   title: 'Manual Assignment',
      //   url: '/dashboard/scheduling/manual',
      //   icon: 'userPlus',
      //   shortcut: ['s', 'm']
      // },
      // {
      //   title: 'Schedule Optimization',
      //   url: '/dashboard/scheduling/optimize',
      //   icon: 'trending-up',
      //   shortcut: ['s', 'p']
      // },
      // {
      //   title: 'Bulk Shift Creation',
      //   url: '/dashboard/scheduling/bulk-create',
      //   icon: 'layers',
      //   shortcut: ['s', 'b']
      // }
    ]
  },

  // Staff Management
  {
    title: 'Staff Management',
    url: '/dashboard/staff',
    icon: 'users',
    shortcut: ['t', 't'],
    isActive: false,
    items: [
      {
        title: 'Nurse Directory',
        url: '/dashboard/staff/directory',
        icon: 'users',
        shortcut: ['t', 'd']
      },
      {
        title: 'Availability Management',
        url: '/dashboard/staff/availability',
        icon: 'clock',
        shortcut: ['t', 'a']
      },
      {
        title: 'Skills & Certifications',
        url: '/dashboard/staff/skills',
        icon: 'award',
        shortcut: ['t', 's']
      },
      {
        title: 'Fatigue Monitoring',
        url: '/dashboard/staff/fatigue',
        icon: 'activity',
        shortcut: ['t', 'f']
      },
      // {
      //   title: 'Workload Balance',
      //   url: '/dashboard/staff/workload',
      //   icon: 'balance-scale',
      //   shortcut: ['t', 'w']
      // }
    ]
  },

  // Requests & Swaps
  {
    title: 'Requests & Swaps',
    url: '/dashboard/requests',
    icon: 'exchange',
    shortcut: ['r', 'r'],
    isActive: false,
    items: [
      {
        title: 'Time Off Requests',
        url: '/dashboard/requests/time-off',
        icon: 'calendar-x',
        shortcut: ['r', 't']
      },
      {
        title: 'Shift Swap Requests',
        url: '/dashboard/requests/swaps',
        icon: 'shuffle',
        shortcut: ['r', 's']
      },
      // {
      //   title: 'Swap Opportunities',
      //   url: '/dashboard/requests/opportunities',
      //   icon: 'search',
      //   shortcut: ['r', 'o']
      // },
      // {
      //   title: 'Request Approvals',
      //   url: '/dashboard/requests/approvals',
      //   icon: 'check-circle',
      //   shortcut: ['r', 'a']
      // }
    ]
  },

  // Attendance & Compliance
  {
    title: 'Attendance & Compliance',
    url: '/dashboard/attendance',
    icon: 'clipboard-check',
    shortcut: ['a', 'a'],
    isActive: false,
    items: [
      {
        title: 'Real-time Attendance',
        url: '/dashboard/attendance/real-time',
        icon: 'clock',
        shortcut: ['a', 'r']
      },
      // {
      //   title: 'Clock In/Out',
      //   url: '/dashboard/attendance/clock',
      //   icon: 'timer',
      //   shortcut: ['a', 'c']
      // },
      {
        title: 'Compliance Violations',
        url: '/dashboard/attendance/violations',
        icon: 'alert-triangle',
        shortcut: ['a', 'v']
      },
      {
        title: 'Overtime Tracking',
        url: '/dashboard/attendance/overtime',
        icon: 'clock',
        shortcut: ['a', 'o']
      }
    ]
  },

  // Predictive Analytics
  {
    title: 'Predictive Analytics',
    url: '/dashboard/analytics',
    icon: 'trending-up',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [
      {
        title: 'Staffing Predictor',
        url: '/dashboard/analytics/staffing-predictor',
        icon: 'brain',
        shortcut: ['p', 's']
      },
      // {
      //   title: 'Demand Forecasting',
      //   url: '/dashboard/analytics/demand-forecast',
      //   icon: 'bar-chart',
      //   shortcut: ['p', 'd']
      // },
      // {
      //   title: 'Cost Analysis',
      //   url: '/dashboard/analytics/cost-analysis',
      //   icon: 'dollar-sign',
      //   shortcut: ['p', 'c']
      // },
      // {
      //   title: 'Performance Insights',
      //   url: '/dashboard/analytics/performance',
      //   icon: 'pie-chart',
      //   shortcut: ['p', 'i']
      // }
    ]
  },

  // Reports & Documentation
  // {
  //   title: 'Reports',
  //   url: '/dashboard/reports',
  //   icon: 'file-text',
  //   shortcut: ['e', 'e'],
  //   isActive: false,
  //   items: [
  //     {
  //       title: 'Dashboard Metrics',
  //       url: '/dashboard/reports/dashboard-metrics',
  //       icon: 'bar-chart-2',
  //       shortcut: ['e', 'd']
  //     },
  //     {
  //       title: 'Overtime Reports',
  //       url: '/dashboard/reports/overtime',
  //       icon: 'clock',
  //       shortcut: ['e', 'o']
  //     },
  //     {
  //       title: 'Staffing Reports',
  //       url: '/dashboard/reports/staffing',
  //       icon: 'users',
  //       shortcut: ['e', 's']
  //     },
  //     {
  //       title: 'Compliance Reports',
  //       url: '/dashboard/reports/compliance',
  //       icon: 'shield-check',
  //       shortcut: ['e', 'c']
  //     },
  //     {
  //       title: 'Financial Reports',
  //       url: '/dashboard/reports/financial',
  //       icon: 'dollar-sign',
  //       shortcut: ['e', 'f']
  //     },
  //     {
  //       title: 'Custom Reports',
  //       url: '/dashboard/reports/custom',
  //       icon: 'settings',
  //       shortcut: ['e', 'x']
  //     }
  //   ]
  // },

  // Notifications & Alerts
  {
    title: 'Notifications',
    url: '/dashboard/notifications',
    icon: 'bell',
    shortcut: ['n', 'n'],
    isActive: false,
    items: [
      // {
      //   title: 'All Notifications',
      //   url: '/dashboard/notifications/all',
      //   icon: 'inbox',
      //   shortcut: ['n', 'a']
      // },
      // {
      //   title: 'Urgent Alerts',
      //   url: '/dashboard/notifications/urgent',
      //   icon: 'alert-circle',
      //   shortcut: ['n', 'u']
      // },
      // {
      //   title: 'Broadcast Messages',
      //   url: '/dashboard/notifications/broadcast',
      //   icon: 'megaphone',
      //   shortcut: ['n', 'b']
      // },
      // {
      //   title: 'Notification Settings',
      //   url: '/dashboard/notifications/settings',
      //   icon: 'settings',
      //   shortcut: ['n', 's']
      // }
    ]
  },

  // System Administration
  // {
  //   title: 'Administration',
  //   url: '/dashboard/admin',
  //   icon: 'settings',
  //   shortcut: ['m', 'm'],
  //   isActive: false,
  //   items: [
  //     {
  //       title: 'Department Management',
  //       url: '/dashboard/admin/departments',
  //       icon: 'building',
  //       shortcut: ['m', 'd']
  //     },
  //     {
  //       title: 'User Management',
  //       url: '/dashboard/admin/users',
  //       icon: 'user-cog',
  //       shortcut: ['m', 'u']
  //     },
      // {
      //   title: 'System Settings',
      //   url: '/dashboard/admin/settings',
      //   icon: 'cog',
      //   shortcut: ['m', 's']
      // },
      // {
      //   title: 'API Management',
      //   url: '/dashboard/admin/api',
      //   icon: 'code',
      //   shortcut: ['m', 'a']
      // },
      // {
      //   title: 'Audit Logs',
      //   url: '/dashboard/admin/audit',
      //   icon: 'file-search',
      //   shortcut: ['m', 'l']
      // }
  //   ]
  // }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];