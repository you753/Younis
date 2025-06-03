import { RecentActivity } from '@/lib/types';
import { 
  UserPlus, ShoppingCart, Package, 
  Users, AlertCircle, CheckCircle 
} from 'lucide-react';

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const iconMap = {
  user: UserPlus,
  sale: ShoppingCart,
  purchase: Package,
  product: Package,
  client: Users,
  supplier: Users
};

const colorMap = {
  user: 'bg-blue-100 text-blue-600',
  sale: 'bg-green-100 text-green-600',
  purchase: 'bg-orange-100 text-orange-600',
  product: 'bg-purple-100 text-purple-600',
  client: 'bg-indigo-100 text-indigo-600',
  supplier: 'bg-teal-100 text-teal-600'
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أنشطة حديثة</h3>
        <p className="text-gray-500">سيتم عرض آخر الأنشطة هنا عند حدوثها</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = iconMap[activity.type] || CheckCircle;
        const colorClass = colorMap[activity.type] || 'bg-gray-100 text-gray-600';

        return (
          <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-full ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="mr-4 flex-1">
              <p className="font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
            </div>
            <span className="text-sm text-gray-400">{activity.time}</span>
          </div>
        );
      })}
    </div>
  );
}
