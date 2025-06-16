import { useNavigate } from 'react-router-dom';
import { Users, Building2, UserCheck, MapPin, Calendar } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';

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
    <div
      onClick={() => navigate(to)}
      className={`group relative bg-white rounded-2xl shadow-lg border-l-[8px] ${color} cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl min-h-[200px] flex flex-col justify-center`}
    >
      <div className="px-8 py-8 flex items-center h-full">
        <div className="flex items-start space-x-4 w-full">
          <div className="flex-shrink-0">{icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-opacity-75 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 group-hover:text-opacity-75 transition-colors leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  useAuthTokenSync();

  const menuItems: MenuItemProps[] = [
    {
      icon: <Users className="text-blue-500 h-8 w-8" />,
      title: 'Manage Employees',
      description: 'Add, edit, or remove employee records',
      to: '/add-employee',
      color: 'border-blue-500'
    },
    {
      icon: <Building2 className="text-green-500 h-8 w-8" />,
      title: 'Manage Vendors',
      description: 'Configure vendor information',
      to: '/add-vendor',
      color: 'border-green-500'
    },
    {
      icon: <UserCheck className="text-purple-500 h-8 w-8" />,
      title: 'Manage Approvers',
      description: 'Set up approval hierarchies',
      to: '/add-approver',
      color: 'border-purple-500'
    },
    {
      icon: <MapPin className="text-red-500 h-8 w-8" />,
      title: 'Manage Locations',
      description: 'Define business locations',
      to: '/add-location',
      color: 'border-red-500'
    },
    {
      icon: <Calendar className="text-teal-500 h-8 w-8" />,
      title: 'Billing Cycle Rules',
      description: 'Configure billing cycles',
      to: '/add-billing-cycle-rule',
      color: 'border-teal-500'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Manage your organization's attendance and billing configuration from this central dashboard.
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {menuItems.map((item) => (
              <MenuItem key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}