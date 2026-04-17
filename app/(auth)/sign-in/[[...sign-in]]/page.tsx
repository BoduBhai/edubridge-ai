import { SignIn } from "@clerk/nextjs";
import AuthSplitShell from "@/components/auth/AuthSplitShell";
import { clerkAuthAppearance } from "@/components/auth/clerkAuthAppearance";

export default function SignInPage() {
  return (
    <AuthSplitShell
      heading="Welcome back"
      subheading="Sign in to continue your scholarship journey"
      testimonial={{
        quote:
          '"EduBridge helped me find a full scholarship to study Computer Science in the US - something I never thought was possible."',
        author: "Amara Owasi",
        meta: "Ghana - Cornell University, Class of 2026",
        avatarSrc: "/avatars/student-1.jpg",
        avatarFallback: "AO",
      }}
      metrics={[
        { value: "12,000+", label: "Students matched" },
        { value: "$480M+", label: "Scholarships found" },
        { value: "94%", label: "Match accuracy" },
      ]}
    >
      <SignIn appearance={clerkAuthAppearance} />
    </AuthSplitShell>
  );
}
