import { SubscriptionSidebar } from "./components/SubscriptionSidebar";
import { SubscriptionTable } from "./components/SubscriptionTable";

export function SubscriptionPage() {
  return (
    <div className="flex h-full w-full">
      <div className="w-1/4 border-r">  {/* 修改为1/4宽度 */}
        <SubscriptionSidebar />
      </div>
      <div className="w-3/4 overflow-auto">  {/* 修改为3/4宽度 */}
        <SubscriptionTable />
      </div>
    </div>
  );
}