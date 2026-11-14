import { Link } from "react-router-dom";
import { CONTROLLER, PRODUCT_NAME, publicAsset } from "@/config/site";

const SiteFooter = () => (
  <footer className="border-t border-border/40 py-8 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <img src={publicAsset("favicon.png")} alt="" className="w-8 h-8" />
        <span className="font-semibold text-foreground">{PRODUCT_NAME}</span>
      </div>
      <nav className="flex items-center gap-6">
        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Privacy
        </Link>
        <a
          href={CONTROLLER.contactFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Contact
        </a>
      </nav>
      <div className="text-sm text-muted-foreground text-center md:text-right">
        <p>© 2026 {PRODUCT_NAME}</p>
        <p className="text-xs">Niet verbonden aan Vinted.</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
