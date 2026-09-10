import { getSession } from '@/lib/auth/getSession';
import { redirect } from 'next/navigation';
import SuperAdminDashboard from './superAdmin/page';
import GroupAdminDashboard from './groupAdmin/page';
import UserDashboard from './user/page';

export default async function DashboardRouter() {
  const session = await getSession();
console.log('🔍 Session:', session); // ✅ LOG
  if (!session) {
    console.log('❌ Pas de session, redirection...');
    redirect('/auth/signin');
  }
   console.log('✅ Role:', session.role);

  // Router selon le rôle
  if (session.role === 'superAdmin') {
    return <SuperAdminDashboard />;
  }
  if (session.role === 'groupAdmin') {
    return <GroupAdminDashboard />;
  }
  return <UserDashboard />;
}