import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Camera, CheckCircle, ClipboardPaste, FileText, Globe, LayoutTemplate, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import InstallButton from "@/components/InstallButton";
import SiteFooter from "@/components/SiteFooter";
import {
  CHROME_WEB_STORE_URL,
  GUMROAD_FREE_URL,
  GUMROAD_LIBRARY_URL,
  PLANS,
  PRODUCT_NAME,
  publicAsset,
  type Plan,
} from "@/config/site";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={publicAsset("favicon.png")} alt="" className="w-10 h-10" />
            <span className="text-lg sm:text-xl font-bold text-foreground">{PRODUCT_NAME}</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
            <a href="#prijzen" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              Prijzen
            </a>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <InstallButton className="hidden md:inline-flex" />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            Chrome-extensie voor Vinted
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Vinted-advertenties<br />
            <span className="text-primary">sneller klaar</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Voeg je foto's toe en de AI maakt je advertentie. Eén klik op Plakken en je foto's, titel,
            beschrijving, prijs, categorie, merk, maat, staat en kleur staan in je Vinted-advertentie.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <InstallButton size="lg" />
            <Button size="lg" variant="ghost" asChild>
              <a href="#prijzen">Bekijk de prijzen</a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Gratis te proberen: 3 AI-analyses per maand.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Zo werkt het
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Camera className="w-6 h-6" />}
              title="Foto's toevoegen"
              description="Zet tot 10 foto's in de extensie. De AI bekijkt er maximaal 6, ook merk- en maatlabels."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Voorstel van de AI"
              description="Je krijgt een titel, een beschrijving, de categorie uit Vinted's eigen lijst en het merk, de maat, de staat en de kleur."
            />
            <FeatureCard
              icon={<LayoutTemplate className="w-6 h-6" />}
              title="Prijs en sjablonen"
              description="De AI stelt een prijs voor die je zelf aanpast. Met je eigen sjablonen voor de beschrijving werk je elke keer op dezelfde manier."
            />
            <FeatureCard
              icon={<ClipboardPaste className="w-6 h-6" />}
              title="Plakken op Vinted"
              description="Klik op de verkooppagina van Vinted op Plakken. Foto's, titel, beschrijving, prijs, categorie, merk, maat, staat en kleur worden ingevuld."
            />
          </div>
        </div>
      </section>

      {/* Good to know */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Goed om te weten
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <BenefitItem
              icon={<Shield className="w-5 h-5 text-primary" />}
              title="Jij houdt de controle"
              description="Je ziet het voorstel eerst en past aan wat je wilt. Na het plakken controleer je alles en plaats je de advertentie zelf."
            />
            <BenefitItem
              icon={<CheckCircle className="w-5 h-5 text-primary" />}
              title="Merk, maat, staat en kleur gaan mee"
              description="De extensie kiest ze in Vinted's eigen keuzelijsten. Staat een merk of maat niet op de foto of het label, dan laat de AI dat vakje leeg in plaats van te gokken."
            />
            <BenefitItem
              icon={<Globe className="w-5 h-5 text-primary" />}
              title="Tien Vinted-landen"
              description="Werkt op vinted.nl, .be, .de, .fr, .es, .it, .pl, .pt, .com en .co.uk."
            />
            <BenefitItem
              icon={<Lock className="w-5 h-5 text-primary" />}
              title="Geen foto's op onze server"
              description={
                <>
                  Voor een analyse gaan maximaal 6 foto's en je tekst via onze server naar Google Gemini. Onze server
                  bewaart ze niet, en we verkopen geen gegevens.{" "}
                  <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
                    Lees de privacyverklaring
                  </Link>
                  .
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prijzen" className="py-16 px-6 bg-muted/30 scroll-mt-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">Prijzen</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
            Je betaalt via Gumroad. Gumroad regelt de betaling en de btw en mailt je licentiesleutel. Je vindt de
            sleutel ook in je{" "}
            <a
              href={GUMROAD_LIBRARY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Gumroad-bibliotheek
            </a>
            .{!CHROME_WEB_STORE_URL && " De extensie zelf komt binnenkort in de Chrome Web Store."}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Probeer het gratis
          </h2>
          <p className="text-muted-foreground mb-8">
            Met de gratis versie krijg je 3 AI-analyses per maand. Je sleutel haal je op via Gumroad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <InstallButton size="lg" />
            <Button size="lg" variant="outline" asChild>
              <a href={GUMROAD_FREE_URL} target="_blank" rel="noopener noreferrer">
                Gratis sleutel ophalen
              </a>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
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

const PlanCard = ({ plan }: { plan: Plan }) => (
  <div className="bg-background border border-border rounded-2xl p-6 text-center flex flex-col">
    <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
    <p className="mb-2">
      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
      {plan.period && <span className="text-sm text-muted-foreground"> {plan.period}</span>}
    </p>
    <p className="text-muted-foreground text-sm mb-6">{plan.analyses}</p>
    <Button variant={plan.price === "€0" ? "outline" : "default"} className="mt-auto" asChild>
      <a href={plan.href} target="_blank" rel="noopener noreferrer">
        {plan.cta}
      </a>
    </Button>
  </div>
);

const BenefitItem = forwardRef<HTMLDivElement, { icon: React.ReactNode; title: string; description: React.ReactNode }>(
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
