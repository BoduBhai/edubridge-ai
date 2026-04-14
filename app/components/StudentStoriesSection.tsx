import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Story = {
  quote: string;
  name: string;
  school: string;
  image: string;
  initials: string;
};

const STORIES: Story[] = [
  {
    quote:
      "I thought I needed a perfect SAT score to study in the US. EduBridge showed me test-optional liberal arts colleges that actually gave me a full ride.",
    name: "Amara O. from Ghana",
    school: "Berea College '27",
    image: "/avatars/student-1.jpg",
    initials: "AO",
  },
  {
    quote:
      "The AI helped me understand how to frame my extracurriculars in a way that US admissions officers understand. It was like having a counselor in my pocket.",
    name: "Diego M. from Colombia",
    school: "Macalester College '26",
    image: "/avatars/student-2.jpg",
    initials: "DM",
  },
  {
    quote:
      "My family couldn't afford application fees, let alone tuition. EduBridge guided me to schools with fee waivers and generous international aid policies.",
    name: "Aisha K. from Pakistan",
    school: "Smith College '28",
    image: "/avatars/student-3.jpg",
    initials: "AK",
  },
];

export default function StudentStoriesSection() {
  return (
    <section
      id="student-stories"
      className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-5 py-14 sm:py-20"
    >
      <h2 className="mx-auto max-w-xl text-center font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
        Students who navigated the journey with us
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {STORIES.map((story) => (
          <Card
            key={story.name}
            className="bg-card h-full rounded-3xl border py-6 shadow-sm"
          >
            <CardContent className="flex h-full flex-col px-6">
              <Quote
                className="size-8 fill-amber-600 text-amber-600"
                aria-hidden="true"
              />
              <p className="text-foreground mt-4 text-2xl leading-relaxed">
                &quot;{story.quote}&quot;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t pt-4">
                <Avatar className="size-11">
                  <AvatarImage src={story.image} alt={story.name} />
                  <AvatarFallback>{story.initials}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-foreground text-lg font-semibold">
                    {story.name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {story.school}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
