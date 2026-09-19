// Autoposter - Internationalization (i18n)

const translations = {
  nl: {
    // Header
    tagline: 'Slimme Listing Prep Tool',
    
    // Intro
    introText: 'Upload je foto\'s eerst. Autoposter analyseert automatisch je product en vult alle velden voor je in.',
    
    // Sections
    productInfo: 'Product Info',
    description: 'Beschrijving',
    photos: 'Foto\'s',
    copyPost: 'Kopieer & Post',
    
    // Labels
    title: 'Titel',
    titlePlaceholder: 'Bijv. Nike Air Max 90 - Maat 42',
    price: 'Prijs (€)',
    quantity: 'Aantal',
    category: 'Categorie',
    selectOption: 'Selecteer...',
    condition: 'Conditie',
    tags: 'Tags',
    tagsPlaceholder: 'nike, sneakers, vintage',
    descriptionLabel: 'Beschrijving',
    descriptionPlaceholder: 'Beschrijf je product...',
    extraInfo: 'Extra Info',
    extraInfoPlaceholder: 'Maten, kleuren, defecten, etc.',
    
    // Categories
    catClothing: 'Kleding',
    catShoes: 'Schoenen',
    catBags: 'Tassen & Accessoires',
    catElectronics: 'Elektronica',
    catToys: 'Speelgoed & Spellen',
    catCollectibles: 'Verzamelobjecten',
    catFurniture: 'Meubels & Wonen',
    catSports: 'Sport & Outdoor',
    catBooks: 'Boeken & Media',
    catBeauty: 'Beauty & Gezondheid',
    catAuto: 'Auto & Motor',
    catOther: 'Anders',
    
    // Conditions
    condNew: 'Nieuw met labels',
    condNewNoTags: 'Nieuw zonder labels',
    condVeryGood: 'Zeer goed',
    condGood: 'Goed',
    condFair: 'Redelijk',
    
    // Buttons
    generateAI: 'Genereer AI Beschrijving',
    analyzePhoto: 'Analyseer Foto met AI',
    useTemplate: 'Gebruik Template',
    copy: 'Kopieer',
    open: 'Open',
    clearForm: 'Wis Formulier',
    settings: 'Instellingen',
    upgrade: 'Upgrade',
    unlimited: 'onbeperkt',
    usageLimitReached: 'Limiet bereikt! Upgrade voor meer AI analyses.',
    welcomeTitle: 'Welkom bij AutoPoster!',
    welcomeText: 'Leer in 3 stappen hoe je in seconden listings maakt.',
    step1Title: 'Upload Foto\'s',
    step1Desc: 'Sleep of klik om productfoto\'s toe te voegen',
    step2Title: 'AI Analyseert',
    step2Desc: 'Onze AI vult automatisch alle velden in',
    step3Title: 'Kopieer & Plak',
    step3Desc: 'Klik op Vinted en plak op de marktplaats',
    getStarted: 'Aan de slag!',
    skipTutorial: 'Overslaan',
    
    // Upload
    uploadText: 'Klik of sleep foto\'s hier',
    uploadLimit: 'Max 10 foto\'s (5MB per foto)',
    aiHintNoPhoto: 'Upload een foto om AI analyse te activeren',
    aiHintReady: 'Klik om de eerste foto te analyseren en het formulier automatisch in te vullen',
    
    // Platform section
    platformDescription: 'Klik op een platform om de listing te formatteren en kopiëren. Open daarna de marketplace om te plakken.',
    
    // Toasts
    copied: 'Gekopieerd',
    copiedFor: 'Gekopieerd voor',
    fillTitleFirst: 'Vul eerst een titel in',
    uploadPhotoFirst: 'Upload eerst een foto',
    photoAnalyzed: 'Foto geanalyseerd! Formulier ingevuld',
    photoAnalyzedAndReordered: '📸 Geanalyseerd & foto\'s gerangschikt!',
    descriptionGenerated: 'Beschrijving gegenereerd!',
    onlyImages: 'Alleen afbeeldingen toegestaan',
    fileTooLarge: 'is te groot',
    maxPhotos: 'foto\'s toegestaan',
    comingSoon: 'Binnenkort',
    formCleared: 'Formulier gewist',
    noTemplate: 'Geen template ingesteld. Ga naar instellingen.',
    imageDownloaded: 'Afbeelding gedownload',
    base64Copied: 'Base64 gekopieerd naar klembord',
    autoAnalyzing: 'Foto gedetecteerd, analyse wordt gestart...',
    
    // Loading states
    analyzing: 'Analyseren...',
    generating: 'Genereren...',
    formatting: 'Formatteren...',
    
    // Content script
    paste: 'Plakken',
    filling: 'Invullen...',
    filled: 'Ingevuld',
    noData: 'Geen data beschikbaar. Kopieer eerst vanuit AutoPoster.',
    fieldsNotFound: 'Velden niet gevonden. Tekst gekopieerd - plak met Ctrl+V',
    couldNotFill: 'Kon niet invullen. Probeer handmatig.',
    platformNotRecognized: 'Platform niet herkend',
    
    // Intelligent category engine
    step1Matching: 'Stap 1/4: Categorie matching...',
    step2Opening: 'Stap 2/4: Modal openen...',
    step3Navigating: 'Stap 3/4: Navigeren...',
    step4Done: 'Stap 4/4: Klaar!',
    categoryNotFoundClosest: 'Categorie niet gevonden. Dichtste opties',
    selectManually: 'Selecteer handmatig',
    modalOpenFailed: 'Kon categorie modal niet openen',
    levelNotFound: 'Level niet gevonden',
    
    // Category picker
    categorySelect: 'Selecteer',
    categoryNoSub: 'Geen subcategorieën',
    
    // Main categories (Vinted order)
    catWomen: 'Dames',
    catMen: 'Heren',
    catKids: 'Kinderen',
    catHome: 'Wonen',
    catElectronics: 'Elektronica',
    catEntertainment: 'Entertainment',
    catHobbies: 'Hobby\'s & Verzamelingen',
    catSports: 'Sport',
    
    // License page
    licenseTitle: 'Activeer AutoPoster',
    licenseSubtitle: 'Voer je license key in om de extensie te activeren.',
    licenseActivate: 'Activeren',
    licenseFooter: 'Geen license key?',
    licenseBuyOn: 'Koop er een op Gumroad',
    licenseTryFree: 'Of probeer gratis met code:',
    licenseActivating: 'Activeren...',
    licenseSuccess: 'Geactiveerd!',
    licenseInvalid: 'Ongeldige license key',
    
    // Upgrade page
    upgradeTitle: 'Kies je plan',
    upgradeSubtitle: 'Schaal mee met je verkoopvolume',
    currentPlan: 'Huidig plan',
    perMonth: '/maand',
    upgradeButton: 'Upgrade',
    currentButton: 'Huidig plan',
    popular: 'Populair',
    
    // Tier names
    tierFree: 'Free',
    tierStarter: 'Starter',
    tierPro: 'Pro',
    
    // Tier descriptions
    tierFreeDesc: 'Perfect voor casual sellers',
    tierStarterDesc: 'Voor regelmatige verkopers',
    tierProDesc: 'Voor power resellers',
    
    // Features
    featureAnalyses: 'AI analyses per maand',
    featureUnlimitedAI: 'Onbeperkt AI analyses',
    featureEmailSupport: 'Email support',
    featureEarlyAccess: 'Vroegtijdige toegang tot nieuwe features',
    featureSupport24h: 'Email support (24u)',
    featureSupport48h: 'Email support (48u)',
    
    // FAQ
    faqTitle: 'Veelgestelde vragen',
    faqKeyQuestion: 'Hoe krijg ik mijn license key?',
    faqKeyAnswer: 'Na aankoop ontvang je je license key per email. Voer deze in op de activatiepagina.',
    faqUpgradeQuestion: 'Kan ik op elk moment upgraden?',
    faqUpgradeAnswer: 'Ja! Je kunt op elk moment upgraden en je nieuwe limiet gaat direct in.',
    faqLimitQuestion: 'Wat als ik mijn limiet bereik?',
    faqLimitAnswer: 'Je ziet een upgrade melding. Je kunt alle velden nog handmatig invullen, maar krijgt geen AI hulp meer deze maand.',
    faqCancelQuestion: 'Kan ik mijn abonnement opzeggen?',
    faqCancelAnswer: 'Ja, je kunt op elk moment opzeggen. Je houdt toegang tot het einde van je betaalperiode.',
    
    // Analysis
    analysisTimeout: 'Analyse timeout, probeer opnieuw',
    
    // Limit modal
    limitReachedTitle: 'Maandlimiet bereikt',
    limitReachedText: 'Je hebt al je AI analyses voor deze maand gebruikt.',
    limitReachedUpgrade: 'Upgrade voor meer analyses!',
    laterButton: 'Later',
    upgradeNow: 'Upgrade nu',
    
    // Usage
    analysesUsed: 'analyses gebruikt',
    analysesLeft: 'analyses over',
    
    // Feedback
    sendFeedback: 'Stuur Feedback',
    betaFeedback: 'Beta - Geef Feedback!',
    
    // Footer
    footerQuestions: 'Vragen?',
    footerContact: 'Neem contact op via Discord',
    back: 'Terug',
    
    // License settings
    licenseSettings: 'License Key Activeren',
    currentLicense: 'Huidig plan:',
    changeLicense: 'Wijzig License',
    activateLicense: 'Activeren',
    licenseHelp: 'Heb je een license key gekocht? Voer deze hieronder in om je plan te activeren.',
    licenseChanged: 'License geactiveerd!',
    licenseChangeFailed: 'Ongeldige license key',
    
    // Subscription management
    subscription: 'Abonnement',
    subscriptionHelp: 'Beheer je abonnement op Gumroad om te upgraden, downgraden of opzeggen.',
    manageSubscription: 'Beheer Abonnement',
    
    // Offline
    noInternet: 'Geen internetverbinding. Controleer je verbinding en probeer opnieuw.'
  },
  
  en: {
    // Header
    tagline: 'Smart Listing Prep Tool',
    
    // Intro
    introText: 'Upload your photos first. Autoposter automatically analyzes your product and fills in all fields for you.',
    
    // Sections
    productInfo: 'Product Info',
    description: 'Description',
    photos: 'Photos',
    copyPost: 'Copy & Post',
    
    // Labels
    title: 'Title',
    titlePlaceholder: 'E.g. Nike Air Max 90 - Size 42',
    price: 'Price (€)',
    quantity: 'Quantity',
    category: 'Category',
    selectOption: 'Select...',
    condition: 'Condition',
    tags: 'Tags',
    tagsPlaceholder: 'nike, sneakers, vintage',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe your product...',
    extraInfo: 'Extra Info',
    extraInfoPlaceholder: 'Sizes, colors, defects, etc.',
    
    // Categories
    catClothing: 'Clothing',
    catShoes: 'Shoes',
    catBags: 'Bags & Accessories',
    catElectronics: 'Electronics',
    catToys: 'Toys & Games',
    catCollectibles: 'Collectibles',
    catFurniture: 'Furniture & Home',
    catSports: 'Sports & Outdoor',
    catBooks: 'Books & Media',
    catBeauty: 'Beauty & Health',
    catAuto: 'Auto & Motor',
    catOther: 'Other',
    
    // Conditions
    condNew: 'New with tags',
    condNewNoTags: 'New without tags',
    condVeryGood: 'Very good',
    condGood: 'Good',
    condFair: 'Fair',
    
    // Buttons
    generateAI: 'Generate AI Description',
    analyzePhoto: 'Analyze Photo with AI',
    useTemplate: 'Use Template',
    copy: 'Copy',
    open: 'Open',
    clearForm: 'Clear Form',
    settings: 'Settings',
    upgrade: 'Upgrade',
    unlimited: 'unlimited',
    usageLimitReached: 'Limit reached! Upgrade for more AI analyses.',
    welcomeTitle: 'Welcome to AutoPoster!',
    welcomeText: 'Learn in 3 steps how to create listings in seconds.',
    step1Title: 'Upload Photos',
    step1Desc: 'Drag or click to add product photos',
    step2Title: 'AI Analyzes',
    step2Desc: 'Our AI automatically fills all fields',
    step3Title: 'Copy & Paste',
    step3Desc: 'Click Vinted and paste on the marketplace',
    getStarted: 'Get Started!',
    skipTutorial: 'Skip',
    
    // Upload
    uploadText: 'Click or drag photos here',
    uploadLimit: 'Max 10 photos (5MB per photo)',
    aiHintNoPhoto: 'Upload a photo to enable AI analysis',
    aiHintReady: 'Click to analyze the first photo and auto-fill the form',
    
    // Platform section
    platformDescription: 'Click a platform to format and copy the listing. Then open the marketplace to paste.',
    
    // Toasts
    copied: 'Copied',
    copiedFor: 'Copied for',
    fillTitleFirst: 'Please fill in a title first',
    uploadPhotoFirst: 'Please upload a photo first',
    photoAnalyzed: 'Photo analyzed! Form filled',
    photoAnalyzedAndReordered: '📸 Analyzed & photos arranged!',
    descriptionGenerated: 'Description generated!',
    onlyImages: 'Only images allowed',
    fileTooLarge: 'is too large',
    maxPhotos: 'photos allowed',
    comingSoon: 'Coming Soon',
    formCleared: 'Form cleared',
    noTemplate: 'No template set. Go to settings.',
    imageDownloaded: 'Image downloaded',
    base64Copied: 'Base64 copied to clipboard',
    autoAnalyzing: 'Photo detected, starting analysis...',
    
    // Loading states
    analyzing: 'Analyzing...',
    generating: 'Generating...',
    formatting: 'Formatting...',
    
    // Content script
    paste: 'Paste',
    filling: 'Filling...',
    filled: 'Filled',
    noData: 'No data available. Copy from AutoPoster first.',
    fieldsNotFound: 'Fields not found. Text copied - paste with Ctrl+V',
    couldNotFill: 'Could not fill. Try manually.',
    platformNotRecognized: 'Platform not recognized',
    
    // Intelligent category engine
    step1Matching: 'Step 1/4: Category matching...',
    step2Opening: 'Step 2/4: Opening modal...',
    step3Navigating: 'Step 3/4: Navigating...',
    step4Done: 'Step 4/4: Done!',
    categoryNotFoundClosest: 'Category not found. Closest options',
    selectManually: 'Select manually',
    modalOpenFailed: 'Could not open category modal',
    levelNotFound: 'Level not found',
    
    // Category picker
    categorySelect: 'Select',
    categoryNoSub: 'No subcategories',
    
    // Main categories (Vinted order)
    catWomen: 'Women',
    catMen: 'Men',
    catKids: 'Kids',
    catHome: 'Home',
    catElectronics: 'Electronics',
    catEntertainment: 'Entertainment',
    catHobbies: 'Hobbies & Collectables',
    catSports: 'Sports',
    
    // License page
    licenseTitle: 'Activate AutoPoster',
    licenseSubtitle: 'Enter your license key to activate the extension.',
    licenseActivate: 'Activate',
    licenseFooter: 'No license key?',
    licenseBuyOn: 'Buy one on Gumroad',
    licenseTryFree: 'Or try free with code:',
    licenseActivating: 'Activating...',
    licenseSuccess: 'Activated!',
    licenseInvalid: 'Invalid license key',
    
    // Upgrade page
    upgradeTitle: 'Choose your plan',
    upgradeSubtitle: 'Scale with your sales volume',
    currentPlan: 'Current plan',
    perMonth: '/month',
    upgradeButton: 'Upgrade',
    currentButton: 'Current plan',
    popular: 'Popular',
    
    // Tier names
    tierFree: 'Free',
    tierStarter: 'Starter',
    tierPro: 'Pro',
    
    // Tier descriptions
    tierFreeDesc: 'Perfect for casual sellers',
    tierStarterDesc: 'For regular sellers',
    tierProDesc: 'For power resellers',
    
    // Features
    featureAnalyses: 'AI analyses per month',
    featureUnlimitedAI: 'Unlimited AI analyses',
    featureEmailSupport: 'Email support',
    featureEarlyAccess: 'Early access to new features',
    featureSupport24h: 'Email support (24h)',
    featureSupport48h: 'Email support (48h)',
    
    // FAQ
    faqTitle: 'Frequently asked questions',
    faqKeyQuestion: 'How do I get my license key?',
    faqKeyAnswer: 'After purchase you will receive your license key by email. Enter it on the activation page.',
    faqUpgradeQuestion: 'Can I upgrade at any time?',
    faqUpgradeAnswer: 'Yes! You can upgrade at any time and your new limit takes effect immediately.',
    faqLimitQuestion: 'What if I reach my limit?',
    faqLimitAnswer: 'You will see an upgrade prompt. You can still fill in all fields manually, but won\'t get AI help for the rest of the month.',
    faqCancelQuestion: 'Can I cancel my subscription?',
    faqCancelAnswer: 'Yes, you can cancel at any time. You keep access until the end of your billing period.',
    
    // Analysis
    analysisTimeout: 'Analysis timeout, please try again',
    
    // Limit modal
    limitReachedTitle: 'Monthly limit reached',
    limitReachedText: 'You have used all your AI analyses for this month.',
    limitReachedUpgrade: 'Upgrade for more analyses!',
    laterButton: 'Later',
    upgradeNow: 'Upgrade now',
    
    // Usage
    analysesUsed: 'analyses used',
    analysesLeft: 'analyses left',
    
    // Feedback
    sendFeedback: 'Send Feedback',
    betaFeedback: 'Beta - Give Feedback!',
    
    // Footer
    footerQuestions: 'Questions?',
    footerContact: 'Contact us on Discord',
    back: 'Back',
    
    // License settings
    licenseSettings: 'Activate License Key',
    currentLicense: 'Current plan:',
    changeLicense: 'Change License',
    activateLicense: 'Activate',
    licenseHelp: 'Purchased a license key? Enter it below to activate your plan.',
    licenseChanged: 'License activated!',
    licenseChangeFailed: 'Invalid license key',
    
    // Subscription management
    subscription: 'Subscription',
    subscriptionHelp: 'Manage your subscription on Gumroad to upgrade, downgrade, or cancel.',
    manageSubscription: 'Manage Subscription',
    
    // Offline
    noInternet: 'No internet connection. Check your connection and try again.'
  }
};

// Get current language from storage or default to English
let currentLanguage = 'en';

async function loadLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      currentLanguage = result.language || 'en'; // Default to English
      resolve(currentLanguage);
    });
  });
}

function setLanguage(lang) {
  currentLanguage = lang;
  chrome.storage.local.set({ language: lang });
}

function t(key) {
  return translations[currentLanguage]?.[key] || translations['en'][key] || key;
}

function getCurrentLanguage() {
  return currentLanguage;
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.i18n = {
    t,
    setLanguage,
    loadLanguage,
    getCurrentLanguage,
    translations
  };
}
