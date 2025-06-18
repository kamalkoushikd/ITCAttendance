import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, UserCheck, MapPin, Calendar, UserLock, ListChecks } from 'lucide-react';
import { useAuthTokenSync, useAuth } from '../api/auth';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color: string;
}

const MenuItem = ({ icon, title, description, to, color }: MenuItemProps) => {
  const navigate = useNavigate();
  return (
    <motion.div
      onClick={() => navigate(to)}
      className={`group relative bg-white rounded-2xl shadow-lg border-l-[8px] ${color} cursor-pointer transition-all min-h-[220px] flex flex-col justify-center hover:shadow-xl`}
      // The entrance animations (initial, animate) have been removed from here
      // to prevent conflict with the parent list animation.

      // These interaction animations remain.
      whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}

      // A specific, faster transition is defined for the hover and tap states.
      // This makes the UI feel much more responsive.
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
    >
      <div className="px-10 py-10 flex items-center h-full">
        <div className="flex items-start space-x-6 w-full">
          <div className="flex-shrink-0">{icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-opacity-75 transition-colors">
              {title}
            </h3>
            <p className="text-base text-gray-600 group-hover:text-opacity-75 transition-colors leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  useAuthTokenSync();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems: MenuItemProps[] = [
    {
      icon: <Users className="text-blue-500 h-10 w-10" />,
      title: 'Manage Employees',
      description: 'Add, edit, or remove employee records and manage their attendance settings',
      to: '/add-employee',
      color: 'border-blue-500'
    },
    {
      icon: <Building2 className="text-green-500 h-10 w-10" />,
      title: 'Manage Vendors',
      description: 'Configure vendor information and maintain supplier relationships',
      to: '/add-vendor',
      color: 'border-green-500'
    },
    {
      icon: <UserCheck className="text-purple-500 h-10 w-10" />,
      title: 'Manage Approvers',
      description: 'Set up approval hierarchies and workflow permissions',
      to: '/add-approver',
      color: 'border-purple-500'
    },
    {
      icon: <MapPin className="text-red-500 h-10 w-10" />,
      title: 'Manage Locations',
      description: 'Define business locations and their operational settings',
      to: '/add-location',
      color: 'border-red-500'
    },
    {
      icon: <Calendar className="text-teal-500 h-10 w-10" />,
      title: 'Billing Cycle Rules',
      description: 'Configure billing cycles and automated payment schedules',
      to: '/add-billing-cycle-rule',
      color: 'border-teal-500'
    },
    {
      icon: <UserLock className="text-slate-500 h-10 w-10" />,
      title: 'Designation Management',
      description: 'Configure designations and their associated permissions',
      to: '/add-designation',
      color: 'border-slate-500'
    },
    {
      icon: <ListChecks className="text-orange-500 h-10 w-10" />,
      title: 'Attendance Transactions',
      description: 'View and filter all attendance records for all employees',
      to: '/attendance-transactions',
      color: 'border-orange-500'
    }
  ];

  return (
    <motion.div
      className="min-h-[calc(100vh-4rem)] bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              localStorage.removeItem('jwtToken');
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
          >
            Logout
          </button>
        </div>
        <div className="text-center mb-10">
          <motion.h1
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <motion.p
            className="text-xl text-gray-500 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Manage your organization's attendance and billing configuration from this central dashboard.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <MenuItem {...item} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}