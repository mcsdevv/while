import { Dashboard } from "@/components/dashboard/dashboard";
import { isSetupComplete } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Check if setup is complete
  const setupComplete = await isSetupComplete();

  if (!setupComplete) {
    redirect("/setup");
  }

  return <Dashboard />;
}
