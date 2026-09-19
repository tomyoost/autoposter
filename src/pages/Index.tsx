import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Clock, CheckCircle, ArrowRight, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/icons/icon48.png" 
              alt="Autoposter logo" 
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-xl font-bold text-foreground">Autoposter</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Button asChild>
              <a 
                href="https://chromewebstore.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Install Extension
              </a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            Currently available for Vinted · More platforms coming soon
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Create Vinted listings<br />
            <span className="text-primary">in seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Auto-fill photos, title, description, and category with AI-powered analysis. 
            Save 5-10 minutes per listing.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a 
              href="https://chromewebstore.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Add to Chrome
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Camera className="w-6 h-6" />}
              title="Upload photos"
              description="Drop your product photos into the extension. Our AI analyzes them instantly."
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6" />}
              title="AI auto-generates"
              description="Title, description, category, and condition are automatically filled in based on your photos."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Custom templates"
              description="Create your own description templates. Optimize once, use for every future listing."
            />
            <FeatureCard 
              icon={<CheckCircle className="w-6 h-6" />}
              title="One-click paste"
              description="Click paste on Vinted and watch all fields fill automatically."
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Why use Autoposter?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <BenefitItem 
              icon={<Clock className="w-5 h-5 text-primary" />}
              title="Save 5-10 minutes per listing"
              description="No more typing the same information over and over."
            />
            <BenefitItem 
              icon={<CheckCircle className="w-5 h-5 text-primary" />}
              title="Reduce manual errors"
              description="AI-generated descriptions are consistent and accurate."
            />
            <BenefitItem 
              icon={<FileText className="w-5 h-5 text-primary" />}
              title="Faster posting flow"
              description="List more items in less time with streamlined workflows."
            />
            <BenefitItem 
              icon={<Shield className="w-5 h-5 text-primary" />}
              title="Your data stays private"
              description="All data stored locally. We don't sell or share your information."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to list faster?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join sellers who are saving hours every week with Autoposter.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a 
              href="https://chromewebstore.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Install for free
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/icons/icon32.png" 
              alt="Autoposter logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-semibold text-foreground">Autoposter for Vinted</span>
          </div>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2025 Autoposter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-background border border-border rounded-2xl p-6 text-center">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const BenefitItem = forwardRef<HTMLDivElement, { icon: React.ReactNode; title: string; description: string }>(
  ({ icon, title, description }, ref) => (
    <div ref={ref} className="flex gap-4 p-4 rounded-xl bg-muted/30">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
);
BenefitItem.displayName = "BenefitItem";

export default Index;
