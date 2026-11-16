import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";
import { CONTROLLER, GEMINI_PAID_TIER, PRIVACY_LAST_UPDATED, PRODUCT_NAME, VINTED_DOMAINS } from "@/config/site";

const GUMROAD_PRIVACY_URL = "https://gumroad.com/privacy";
const GEMINI_TERMS_URL = "https://ai.google.dev/gemini-api/terms";
const AP_URL = "https://www.autoriteitpersoonsgegevens.nl";
const CWS_LIMITED_USE_URL = "https://developer.chrome.com/docs/webstore/program-policies/limited-use";

const vintedList = VINTED_DOMAINS.join(", ");

const Privacy = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `Privacyverklaring / Privacy Policy – ${PRODUCT_NAME}`;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl w-full mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar home
        </Link>

        <PolicyNl />

        <hr className="my-16 border-border" />

        <PolicyEn />
      </main>
      <SiteFooter />
    </div>
  );
};

/* ---------- Nederlands ---------- */

const PolicyNl = () => (
  <article lang="nl" id="nederlands">
    <h1 className="text-3xl font-bold text-foreground mb-2">Privacyverklaring {PRODUCT_NAME}</h1>
    <p className="text-muted-foreground mb-2">Laatst bijgewerkt: {PRIVACY_LAST_UPDATED.nl}</p>
    <p className="text-muted-foreground mb-8">
      <a href="#english" className={linkClass} lang="en">
        English version below
      </a>
    </p>

    <div className="space-y-8">
      <Section title="Waar gaat dit over">
        <P>
          {PRODUCT_NAME} is een Chrome-extensie die je helpt sneller advertenties op Vinted te maken. Hier lees je
          welke gegevens de extensie gebruikt, waar ze naartoe gaan en hoe lang ze bewaard blijven.
        </P>
      </Section>

      <Section title="Wie is verantwoordelijk">
        <P>Verantwoordelijk voor je gegevens is {CONTROLLER.nameNl}.</P>
        <ControllerDetails lang="nl" />
      </Section>

      <Section title="Wat in je eigen browser blijft">
        <P>De extensie bewaart deze gegevens alleen op je eigen computer, in de opslag van Chrome (chrome.storage):</P>
        <List
          items={[
            "wat je in het formulier invult, zoals titel, beschrijving en prijs",
            "verkleinde versies van je foto's",
            "je eigen sjablonen",
            "je instellingen, taal en thema",
            "je licentiesleutel",
          ]}
        />
        <P>Verwijder je de extensie, dan verdwijnen deze gegevens ook.</P>
      </Section>

      <Section title="Wat naar onze server gaat">
        <H3>Voor de AI-voorstellen</H3>
        <P>
          Vraag je een AI-analyse of een tekstvoorstel aan, dan stuurt de extensie maximaal 6 foto's en de tekst die je
          in het formulier hebt getypt naar onze server. Die draait bij Supabase (Edge Functions) in de EU-regio
          Ierland. Onze server stuurt de foto's en tekst door naar de Google Gemini API, die een voorstel maakt voor
          titel, beschrijving, categorie, merk, maat, staat, kleur en materiaal.
        </P>
        <P>
          Bij een analyse stuurt de extensie ook de categorielijst van Vinted mee, zoals Vinted die aan jou laat zien
          (de namen en nummers van de categorieën, in jouw taal). Zo kiest de AI uit precies dezelfde lijst. Die
          lijst haalt de extensie op als je een Vinted-pagina opent en bewaart hij in je browser. Er zitten geen
          persoonsgegevens in.
        </P>
        <P>
          Onze server bewaart je foto's en advertentietekst niet: ze worden verwerkt en daarna weggegooid. Korte
          technische serverlogs kunnen de gemaakte titel en categorie bevatten.
        </P>

        <H3>Je licentiesleutel</H3>
        <P>
          Om te zien welk abonnement je hebt, stuurt de extensie je licentiesleutel naar onze server. Die controleert
          de sleutel bij Gumroad. Per licentie bewaren we:
        </P>
        <List
          items={[
            "de licentiesleutel",
            "het abonnement (Gratis, Starter of Pro) en de status",
            "een verwijzing naar het product en de verkoop bij Gumroad",
            "wanneer de sleutel voor het laatst is gecontroleerd",
            "tellers voor het gebruik per maand: het aantal analyses en tekstvoorstellen",
          ]}
        />
        <P>We bewaren geen e-mailadres. Dat heeft alleen Gumroad, het platform waar je de licentie koopt.</P>

        <H3>Gebruiksgegevens</H3>
        <P>
          De extensie stuurt korte meldingen over het gebruik, zoals: extensie geopend, analyse gelukt of mislukt,
          foutcodes, reactietijd, de gekozen categorie, je abonnement en de versie van de extensie. We koppelen die
          niet aan je naam of e-mailadres, alleen aan een verkorte hash van je licentiesleutel. We gebruiken deze
          gegevens alleen om de extensie te verbeteren.
        </P>
      </Section>

      <Section title="Google Gemini">
        {GEMINI_PAID_TIER ? (
          <P>
            We gebruiken de betaalde Gemini API van Google. Volgens de{" "}
            <ExtLink href={GEMINI_TERMS_URL}>voorwaarden van Google voor betaalde diensten</ExtLink> gebruikt Google je
            foto's en tekst niet om zijn modellen te trainen of zijn producten te verbeteren. Google bewaart ze een
            beperkte tijd, alleen om misbruik op te sporen, en kan ze daarbij tijdelijk buiten de EU opslaan.
          </P>
        ) : (
          <P>
            We gebruiken op dit moment de gratis versie van de Gemini API van Google. Volgens de{" "}
            <ExtLink href={GEMINI_TERMS_URL}>voorwaarden van Google</ExtLink> mag Google foto's en tekst die via de
            gratis versie binnenkomen gebruiken om zijn producten te verbeteren, en kunnen medewerkers van Google ze
            daarbij inzien. Zet daarom geen persoonlijke gegevens op je foto's (zoals een adreslabel of je gezicht).
            Google kan de gegevens buiten de EU opslaan. Stappen we over op de betaalde versie, dan passen we deze
            tekst aan.
          </P>
        )}
      </Section>

      <Section title="Betalen en e-mail">
        <P>
          Betalen gaat via Gumroad. Gumroad is de verkoper (merchant of record): Gumroad regelt de betaling en de btw,
          mailt je licentiesleutel en beheert je e-mailadres en betaalgegevens. Daarvoor geldt het{" "}
          <ExtLink href={GUMROAD_PRIVACY_URL}>privacybeleid van Gumroad</ExtLink>.
        </P>
        <P>Gumroad en Google zijn Amerikaanse bedrijven. Je gegevens kunnen daardoor ook in de Verenigde Staten worden verwerkt.</P>
      </Section>

      <Section title="Waarom we dit mogen">
        <List
          items={[
            "AI-voorstellen en de controle van je licentie: nodig om de dienst te leveren die je gebruikt (uitvoering van de overeenkomst).",
            "Gebruiksgegevens: ons gerechtvaardigd belang om fouten op te sporen en de extensie te verbeteren. Je kunt hiertegen bezwaar maken.",
          ]}
        />
      </Section>

      <Section title="Hoe lang we gegevens bewaren">
        <List
          items={[
            "Foto's en advertentietekst: niet, alleen zolang de verwerking duurt.",
            "Technische serverlogs: kort.",
            "Gebruiksgegevens: 12 maanden.",
            "Gebruikstellers per maand: 24 maanden.",
            "Licentiegegevens: zolang je de licentie gebruikt, of tot je ons vraagt ze te verwijderen.",
          ]}
        />
      </Section>

      <Section title="Wat we niet doen">
        <List
          items={[
            "We verkopen je gegevens niet.",
            "We tonen geen advertenties en gebruiken je gegevens niet voor reclame.",
            "We volgen je niet op andere websites. De extensie werkt alleen op de Vinted-sites hieronder.",
          ]}
        />
        <P>
          Het gebruik van gegevens door {PRODUCT_NAME} voldoet aan de Chrome Web Store User Data Policy, inclusief de{" "}
          <ExtLink href={CWS_LIMITED_USE_URL}>eisen voor beperkt gebruik (Limited Use)</ExtLink>.
        </P>
      </Section>

      <Section title="Toestemmingen van de extensie">
        <List
          items={[
            <>
              <strong>storage</strong>: om je formulier, foto's, sjablonen en instellingen in je eigen browser te
              bewaren.
            </>,
            <>
              <strong>Toegang tot Vinted</strong> ({vintedList}): om de knop Plakken te tonen en het verkoopformulier
              in te vullen.
            </>,
          ]}
        />
        <P>De extensie vraagt geen andere toestemmingen.</P>
      </Section>

      <Section title="Je rechten">
        <P>
          Je mag je gegevens inzien, laten verbeteren of laten verwijderen, en je kunt bezwaar maken tegen het gebruik
          ervan. Stuur je verzoek via het{" "}
          <ExtLink href={CONTROLLER.contactFormUrl}>contactformulier</ExtLink> en vermeld je licentiesleutel, zodat we
          je gegevens kunnen vinden. We reageren binnen een maand.
        </P>
        <P>
          Ben je het niet eens met hoe we met je gegevens omgaan? Dan kun je een klacht indienen bij de{" "}
          <ExtLink href={AP_URL}>Autoriteit Persoonsgegevens</ExtLink>.
        </P>
      </Section>

      <Section title="Wijzigingen">
        <P>
          Passen we deze verklaring aan, dan zetten we de nieuwe versie op deze pagina en veranderen we de datum
          bovenaan.
        </P>
      </Section>
    </div>
  </article>
);

/* ---------- English ---------- */

const PolicyEn = () => (
  <article lang="en" id="english" className="scroll-mt-8">
    <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy {PRODUCT_NAME}</h1>
    <p className="text-muted-foreground mb-8">Last updated: {PRIVACY_LAST_UPDATED.en}</p>

    <div className="space-y-8">
      <Section title="What this is about">
        <P>
          {PRODUCT_NAME} is a Chrome extension that helps you create Vinted listings faster. This policy explains
          which data the extension uses, where it goes and how long it is kept.
        </P>
      </Section>

      <Section title="Who is responsible">
        <P>The controller of your data is {CONTROLLER.nameEn}.</P>
        <ControllerDetails lang="en" />
      </Section>

      <Section title="What stays in your browser">
        <P>The extension keeps the following data only on your own computer, in Chrome's storage (chrome.storage):</P>
        <List
          items={[
            "what you enter in the form, such as title, description and price",
            "compressed copies of your photos",
            "your own templates",
            "your settings, language and theme",
            "your license key",
          ]}
        />
        <P>If you remove the extension, this data is removed as well.</P>
      </Section>

      <Section title="What is sent to our server">
        <H3>For AI suggestions</H3>
        <P>
          When you request an AI analysis or a text suggestion, the extension sends up to 6 photos and the listing
          text you typed in the form to our server. It runs on Supabase (Edge Functions) in the EU region Ireland. Our
          server passes the photos and text on to the Google Gemini API, which creates a suggestion for title,
          description, category, brand, size, condition, colour and material.
        </P>
        <P>
          With an analysis the extension also sends Vinted's category list as Vinted shows it to you (the names and
          numbers of the categories, in your language), so the AI picks from exactly the same list. The extension
          fetches that list when you open a Vinted page and keeps it in your browser. It contains no personal data.
        </P>
        <P>
          Our server does not store your photos or listing text: they are processed and then discarded. Short-lived
          technical server logs may contain the generated title and category.
        </P>

        <H3>Your license key</H3>
        <P>
          To check which plan you have, the extension sends your license key to our server, which verifies it with
          Gumroad. For each license we store:
        </P>
        <List
          items={[
            "the license key",
            "the plan (Free, Starter or Pro) and its status",
            "a reference to the Gumroad product and sale",
            "when the key was last checked",
            "monthly usage counters: the number of analyses and text suggestions",
          ]}
        />
        <P>We do not store an email address. Only Gumroad has it, as the platform where you buy the license.</P>

        <H3>Usage data</H3>
        <P>
          The extension sends short usage events, such as: extension opened, analysis completed or failed, error
          codes, response time, the chosen category, your plan and the extension version. These are not linked to your
          name or email address, only to a shortened hash of your license key. We use this data only to improve the
          extension.
        </P>
      </Section>

      <Section title="Google Gemini">
        {GEMINI_PAID_TIER ? (
          <P>
            We use Google's paid Gemini API. Under{" "}
            <ExtLink href={GEMINI_TERMS_URL}>Google's terms for paid services</ExtLink>, Google does not use your photos
            or text to train its models or improve its products. Google keeps them for a limited period, only to detect
            abuse, and may store them temporarily outside the EU while doing so.
          </P>
        ) : (
          <P>
            We currently use the free version of Google's Gemini API. Under{" "}
            <ExtLink href={GEMINI_TERMS_URL}>Google's terms</ExtLink>, Google may use photos and text sent through the
            free version to improve its products, and Google staff may review them for that purpose. Please do not
            show personal data in your photos (such as an address label or your face). Google may store the data
            outside the EU. If we move to the paid version, we will update this text.
          </P>
        )}
      </Section>

      <Section title="Payment and email">
        <P>
          Payment is handled by Gumroad. Gumroad is the merchant of record: it processes the payment and VAT, emails
          your license key, and manages your email address and payment details under the{" "}
          <ExtLink href={GUMROAD_PRIVACY_URL}>Gumroad privacy policy</ExtLink>.
        </P>
        <P>Gumroad and Google are US companies, so your data may also be processed in the United States.</P>
      </Section>

      <Section title="Legal basis">
        <List
          items={[
            "AI suggestions and license checks: necessary to provide the service you use (performance of a contract).",
            "Usage data: our legitimate interest in finding errors and improving the extension. You can object to this.",
          ]}
        />
      </Section>

      <Section title="How long we keep data">
        <List
          items={[
            "Photos and listing text: not kept, only for as long as processing takes.",
            "Technical server logs: short-lived.",
            "Usage events: 12 months.",
            "Monthly usage counters: 24 months.",
            "License data: as long as you use the license, or until you ask us to delete it.",
          ]}
        />
      </Section>

      <Section title="What we do not do">
        <List
          items={[
            "We do not sell your data.",
            "We do not show ads or use your data for advertising.",
            "We do not track you on other websites. The extension only works on the Vinted sites listed below.",
          ]}
        />
        <P>
          The use of information received by {PRODUCT_NAME} adheres to the Chrome Web Store User Data Policy,
          including the <ExtLink href={CWS_LIMITED_USE_URL}>Limited Use requirements</ExtLink>.
        </P>
      </Section>

      <Section title="Extension permissions">
        <List
          items={[
            <>
              <strong>storage</strong>: to keep your form, photos, templates and settings in your own browser.
            </>,
            <>
              <strong>Access to Vinted</strong> ({vintedList}): to show the paste button and fill in the listing form.
            </>,
          ]}
        />
        <P>The extension does not request any other permissions.</P>
      </Section>

      <Section title="Your rights">
        <P>
          You have the right to access, correct or delete your data, and to object to its use. Send your request via
          the <ExtLink href={CONTROLLER.contactFormUrl}>contact form</ExtLink> and include your license key so we can
          find your data. We reply within one month.
        </P>
        <P>
          If you are unhappy with how we handle your data, you can file a complaint with the Dutch Data Protection
          Authority, the <ExtLink href={AP_URL}>Autoriteit Persoonsgegevens</ExtLink>.
        </P>
      </Section>

      <Section title="Changes">
        <P>If we change this policy, we publish the new version on this page and update the date at the top.</P>
      </Section>
    </div>
  </article>
);

/* ---------- Shared building blocks ---------- */

const linkClass = "text-foreground underline underline-offset-4 hover:text-primary";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-semibold text-foreground pt-2">{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground leading-relaxed">{children}</p>
);

const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc pl-5 text-muted-foreground leading-relaxed space-y-2">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
    {children}
  </a>
);

const ControllerDetails = ({ lang }: { lang: "nl" | "en" }) => {
  const nl = lang === "nl";
  const rows: React.ReactNode[] = [];
  if (CONTROLLER.fullName) rows.push(CONTROLLER.fullName);
  if (CONTROLLER.address) rows.push(CONTROLLER.address);
  if (CONTROLLER.kvk) rows.push(`${nl ? "KvK-nummer" : "Dutch Chamber of Commerce (KvK) number"}: ${CONTROLLER.kvk}`);
  if (CONTROLLER.email)
    rows.push(
      <>
        {nl ? "E-mail" : "Email"}: <a href={`mailto:${CONTROLLER.email}`} className={linkClass}>{CONTROLLER.email}</a>
      </>,
    );

  return (
    <>
      {rows.length > 0 && <List items={rows} />}
      <P>
        {nl ? "Contact: via het " : "Contact: use the "}
        <ExtLink href={CONTROLLER.contactFormUrl}>{nl ? "contactformulier" : "contact form"}</ExtLink>
        {nl
          ? ", of beantwoord de e-mail met je Gumroad-aankoopbewijs."
          : ", or reply to your Gumroad purchase receipt email."}
      </P>
    </>
  );
};

export default Privacy;
