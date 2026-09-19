import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-6 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 17, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Autoposter for Vinted ("the Extension") is a browser extension that helps users create Vinted listings faster by automatically filling listing fields based on uploaded product photos. This privacy policy explains how we handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Extension collects and processes the following data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Product photos</strong> – Temporarily processed for AI analysis to extract product information</li>
              <li><strong>Form data</strong> – Title, description, price, category, and other listing details you enter</li>
              <li><strong>User preferences</strong> – Language setting and custom templates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Your Data</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Photos are sent to our AI service to analyze product details (category, brand, condition, etc.)</li>
              <li>Form data is stored locally in your browser to restore your work between sessions</li>
              <li>Preferences are stored locally to personalize your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Data Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              All user data is stored locally on your device using Chrome's storage API. We do not maintain user accounts or store your data on external servers beyond temporary processing for AI analysis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or transfer your data to third parties. Photos are temporarily processed by our AI service provider solely to generate listing suggestions and are not retained after processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Permissions Explained</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>activeTab</strong> – Required to interact with the Vinted listing page when you click the extension</li>
              <li><strong>scripting</strong> – Required to auto-fill listing fields on Vinted pages</li>
              <li><strong>storage</strong> – Used to save your preferences and form data locally</li>
              <li><strong>contextMenus</strong> – Provides a right-click shortcut to trigger the extension</li>
              <li><strong>alarms</strong> – Used for internal timing to ensure reliable field filling</li>
              <li><strong>Host permissions (vinted.*)</strong> – Required to operate on Vinted listing pages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can clear all locally stored data at any time by uninstalling the extension or clearing your browser data. Since we don't maintain external accounts or databases of user data, there is no additional data to request or delete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy, please leave a review or use the support options in the Chrome Web Store.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
