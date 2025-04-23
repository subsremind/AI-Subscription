"use client"

import { useState } from "react";
import { SubscriptionSidebar } from "./components/SubscriptionSidebar";
import { SubscriptionTable } from "./components/SubscriptionTable";

export function SubscriptionPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  return (
    <div className="flex h-full w-full">
      <div className="w-1/4 border-r p-4">  
        <SubscriptionSidebar onCategorySelect={setSelectedCategoryId} />
      </div>
      <div className="w-3/4 overflow-auto">
        <SubscriptionTable categoryId={selectedCategoryId} />
      </div>
    </div>
  );
}