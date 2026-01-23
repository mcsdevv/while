import { SetupWizard } from "@/components/setup";
import { isSetupComplete } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  // Check if setup is already complete
  const setupComplete = await isSetupComplete();

  if (setupComplete) {
    redirect("/");
  }

  return <SetupWizard />;
}
