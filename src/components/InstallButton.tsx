import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/config/site";
import { cn } from "@/lib/utils";

type InstallButtonProps = {
  size?: "default" | "lg";
  label?: string;
  className?: string;
};

// Links to the Chrome Web Store listing once CHROME_WEB_STORE_URL is set.
// Until then it shows a plain, non-clickable "coming soon" note instead of a dead link.
const InstallButton = ({ size = "default", label = "Toevoegen aan Chrome", className }: InstallButtonProps) => {
  if (!CHROME_WEB_STORE_URL) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md border border-dashed border-border font-medium text-muted-foreground",
          size === "lg" ? "h-11 px-8 text-sm" : "h-10 px-4 text-sm",
          className,
        )}
      >
        Binnenkort in de Chrome Web Store
      </span>
    );
  }

  return (
    <Button size={size} className={cn("gap-2", className)} asChild>
      <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noopener noreferrer">
        {label}
        {size === "lg" && <ArrowRight className="w-4 h-4" />}
      </a>
    </Button>
  );
};

export default InstallButton;
