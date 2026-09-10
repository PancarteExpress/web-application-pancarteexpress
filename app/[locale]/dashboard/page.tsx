import { getSession } from '@/lib/auth/getSession';
import { redirect } from 'next/navigation';
import SuperAdminDashboard from './superAdmin/page';
import UserDashboard from './user/page';

export default async function DashboardRouter() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Router selon le rôle
  if (session.role === 'superAdmin') {
    return <SuperAdminDashboard />;
  }

  return <UserDashboard />;
}