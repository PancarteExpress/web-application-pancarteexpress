//import { auth } from '@/auth';

import ServiceRequestForm from "./components/ServiceRequestForm";

export default async function ServiceRequestPage() {
  //const session = await auth();
  
  return (
    <div className="container mx-auto py-8">
      <h1>Demande de service</h1>
      <ServiceRequestForm />  {/*isAuthenticated={!!session} userId={session?.id}*/}
    </div>
  );
}