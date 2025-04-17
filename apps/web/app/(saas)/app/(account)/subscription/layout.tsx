import { PageHeader } from "@saas/shared/components/PageHeader";
import { getTranslations } from "next-intl/server";

export default async function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  
  return (
    <>
      <PageHeader
        title={t("subscription.title")}
        subtitle={t("subscription.description")}
      />
      <div className="container mx-auto py-6">  {/* 添加容器和内边距 */}
        {children}
      </div>
    </>
  );
}