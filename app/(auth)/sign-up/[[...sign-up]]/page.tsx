import { SignUp } from "@clerk/nextjs";
import AuthSplitShell from "@/components/auth/AuthSplitShell";
import { clerkAuthAppearance } from "@/components/auth/clerkAuthAppearance";

export default function SignupPage() {
  return (
    <AuthSplitShell
      heading="Create your account"
      subheading="Free to join - no credit card required"
      leftTitle="Your path to a US university starts here"
      leftSubtitle="Join thousands of international students who found their dream university and secured funding they thought was out of reach."
      checklist={[
        "Personalized university matches based on your real profile",
        "Scholarships available specifically for your country and major",
        "Step-by-step guidance from application to visa",
        "AI advisor available 24/7 in plain language",
      ]}
      community={{
        text: "12,000+ students already on their journey",
        avatars: [
          {
            src: "/avatars/student-1.jpg",
            alt: "Student profile one",
            fallback: "A1",
          },
          {
            src: "/avatars/student-2.jpg",
            alt: "Student profile two",
            fallback: "A2",
          },
          {
            src: "/avatars/student-3.jpg",
            alt: "Student profile three",
            fallback: "A3",
          },
          {
            src: "/avatars/student-4.jpg",
            alt: "Student profile four",
            fallback: "A4",
          },
        ],
      }}
    >
      <SignUp appearance={clerkAuthAppearance} />
    </AuthSplitShell>
  );
}
