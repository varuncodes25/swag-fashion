import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/custom/Sidebar";
import RoutePageFallback from "../components/RoutePageFallback";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNoIndexPage } from "@/hooks/useNoIndexPage";

export default function AccountLayout() {
  useNoIndexPage("My Account | Swag Fashion");

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <h2 className="text-base font-semibold tracking-tight">My Account</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100vw-2rem,320px)] p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:min-h-[calc(100vh-4rem)] lg:max-w-7xl lg:gap-8">
        <aside className="hidden w-[260px] shrink-0 md:block lg:w-[280px]">
          <div className="sticky top-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <Sidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-6">
          <Suspense fallback={<RoutePageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
