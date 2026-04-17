import { AppSidebar } from "@/components/app-sidebar";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { MyProfileSection } from "@/components/dashboard/MyProfileSection";
import { ScholarshipsSection } from "@/components/dashboard/ScholarshipsSection";
import { UniversitiesSection } from "@/components/dashboard/UniversitiesSection";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type DashboardSectionKey =
  | "dashboard"
  | "profile"
  | "universities"
  | "scholarships";

type DashboardPageProps = {
  searchParams: Promise<{
    section?: string | string[];
  }>;
};

function resolveSection(
  sectionValue: string | string[] | undefined,
): DashboardSectionKey {
  const value = Array.isArray(sectionValue) ? sectionValue[0] : sectionValue;

  switch (value) {
    case "profile":
    case "universities":
    case "scholarships":
    case "dashboard":
      return value;
    default:
      return "dashboard";
  }
}

export default async function Page({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const section = resolveSection(params.section);

  const sectionTitle: Record<DashboardSectionKey, string> = {
    dashboard: "Dashboard",
    profile: "My Profile",
    universities: "Universities",
    scholarships: "Scholarships",
  };

  const sectionContent: Record<DashboardSectionKey, React.ReactNode> = {
    dashboard: <DashboardSection />,
    profile: <MyProfileSection />,
    universities: <UniversitiesSection />,
    scholarships: <ScholarshipsSection />,
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <h1 className="text-base font-semibold tracking-tight">
              {sectionTitle[section]}
            </h1>
          </div>
        </header>
        {sectionContent[section]}
      </SidebarInset>
    </SidebarProvider>
  );
}
