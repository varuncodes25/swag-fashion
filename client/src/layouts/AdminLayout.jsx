import React, { Suspense } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/custom/AppSidebar";
import RoutePageFallback from "@/components/RoutePageFallback";

const AdminLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <div className="sm:m-10 ">
          <Suspense fallback={<RoutePageFallback />}>{children}</Suspense>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
