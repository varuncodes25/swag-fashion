import React, { Suspense } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/custom/AppSidebar";
import RoutePageFallback from "@/components/RoutePageFallback";
import { useNoIndexPage } from "@/hooks/useNoIndexPage";

const AdminLayout = ({ children }) => {
  useNoIndexPage("Admin | Swag Fashion");

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
