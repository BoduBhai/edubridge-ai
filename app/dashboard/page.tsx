import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard page!</p>
      <Button variant="default" asChild>
        <SignOutButton />
      </Button>
    </div>
  );
}
