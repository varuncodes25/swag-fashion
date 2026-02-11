import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/provider/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      {theme === "dark" ? (
        <Moon size={22} className="text-yellow-400" />
      ) : (
        <Sun size={22} className="text-orange-500" />
      )}
      <span className="sr-only">
        Switch to {theme === "dark" ? "light" : "dark"} mode
      </span>
    </Button>
  );
}