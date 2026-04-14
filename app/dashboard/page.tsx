import { Button } from "@/components/ui/button";
import { Show, UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <Show when="signed-in">
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-700">
        <UserButton />
      </div>
    </Show>
  );
}
