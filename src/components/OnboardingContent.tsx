import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export const OnboardingContent = () => {
  return (
    <div className="max-w-4xl w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">{t("onboarding.welcome")}</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          {t("onboarding.tour")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("onboarding.dashboard.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src="/placeholder.svg" alt="Dashboard Screenshot" className="w-full h-48 object-cover rounded-md" />
            <p className="text-muted-foreground">
              {t("onboarding.dashboard.description")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("onboarding.reader.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src="/placeholder.svg" alt="Reader Screenshot" className="w-full h-48 object-cover rounded-md" />
            <p className="text-muted-foreground">
              {t("onboarding.reader.description")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("onboarding.vocabulary.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src="/placeholder.svg" alt="Vocabulary Screenshot" className="w-full h-48 object-cover rounded-md" />
            <p className="text-muted-foreground">
              {t("onboarding.vocabulary.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
