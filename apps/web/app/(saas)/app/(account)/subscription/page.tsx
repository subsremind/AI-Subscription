import { SubscriptionPage } from "@saas/subscription/page";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations();
  
  return (
    <>
      <PageHeader
        title={t("subscription.title")}
        subtitle={t("subscription.descriptionLabel")}
      />
      <div className="container mx-auto py-6">
        <SubscriptionPage />
      </div>
    </>
  );
}
