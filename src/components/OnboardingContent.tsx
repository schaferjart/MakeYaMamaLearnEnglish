import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const OnboardingContent = () => {
  return (
    <div className="max-w-4xl w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Welcome to Your Reading Companion!</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Here's a quick tour of the application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. The Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src="/placeholder.svg" alt="Dashboard Screenshot" className="w-full h-48 object-cover rounded-md" />
            <p className="text-muted-foreground">
              Your dashboard gives you a quick overview of your reading progress, recent activity, and vocabulary strength.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. The Reader</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src="/placeholder.svg" alt="Reader Screenshot" className="w-full h-48 object-cover rounded-md" />
            <p className="text-muted-foreground">
              Open any book and start reading. Use the read-along feature, and click on any word to get its definition.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Vocabulary Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src="/placeholder.svg" alt="Vocabulary Screenshot" className="w-full h-48 object-cover rounded-md" />
            <p className="text-muted-foreground">
              All the words you look up are saved in your vocabulary list. You can review them anytime and even take quizzes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
