// Autoposter - Internationalization (i18n)

const translations = {
  nl: {
    // Header
    tagline: 'Sneller verkopen op Vinted',
    
    // Intro
    introText: 'Voeg eerst je foto\'s toe, ook van het merk- en maatlabel. De AI maakt titel, beschrijving, prijsvoorstel, categorie, merk, maat, staat en kleur voor je.',
    
    // Sections
    productInfo: 'Productgegevens',
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
    analyzePhoto: 'Analyseer foto\'s met AI',
    useTemplate: 'Gebruik Template',
    copy: 'Kopieer',
    open: 'Open',
    clearForm: 'Wis Formulier',
    settings: 'Instellingen',
    upgrade: 'Upgrade',
    unlimited: 'onbeperkt',
    usageLimitReached: 'Limiet bereikt! Upgrade voor meer AI analyses.',
    welcomeTitle: 'Welkom bij Autoposter!',
    welcomeText: 'Leer in 3 stappen hoe je in seconden listings maakt.',
    step1Title: 'Upload Foto\'s',
    step1Desc: 'Sleep of klik om productfoto\'s toe te voegen',
    step2Title: 'AI Analyseert',
    step2Desc: 'De AI maakt titel, beschrijving en prijs en kiest categorie, merk, maat, staat en kleur',
    step3Title: 'Plakken op Vinted',
    step3Desc: 'Open Vinted en klik rechtsonder op \'Plakken\'',
    getStarted: 'Aan de slag!',
    skipTutorial: 'Overslaan',
    
    // Upload
    uploadText: 'Klik of sleep foto\'s hier',
    uploadLimit: 'Max 10 foto\'s (tot 15 MB per foto)',
    aiHintNoPhoto: 'Upload een foto om AI analyse te activeren',
    aiHintReady: 'Klik om je foto\'s (tot 6) te laten analyseren en het formulier in te vullen',
    
    // Platform section
    platformDescription: 'Open Vinted vanuit hier en klik daar rechtsonder op \'Plakken\'. Foto\'s, titel, beschrijving, prijs, categorie, merk, maat, staat en kleur worden dan ingevuld.',
    
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
    formCleared: 'Formulier gewist',
    noTemplate: 'Geen template ingesteld. Ga naar instellingen.',
    imageDownloaded: 'Afbeelding gedownload',
    base64Copied: 'Base64 gekopieerd naar klembord',
    autoAnalyzing: 'Foto gedetecteerd, analyse wordt gestart...',
    templateApplied: 'Sjabloon toegepast',
    imageReadFailed: 'kon niet worden gelezen',
    copyFailed: 'Kopiëren mislukt',
    storageFull: 'Opslaan lukt niet: de opslag van de extensie is vol. Verwijder een paar foto\'s of wis het formulier.',
    generationLimit: 'Je maandlimiet voor AI-teksten is bereikt. Upgrade voor meer, of schrijf de beschrijving zelf.',
    generateFailed: 'Het maken van de tekst is mislukt. Probeer het opnieuw.',
    licenseProblem: 'Je sleutel is niet (meer) geldig. We controleren hem opnieuw.',
    serviceUnavailable: 'De server is even niet bereikbaar. Probeer het over een paar minuten opnieuw.',
    aiBusy: 'De AI is even druk. Probeer het over een minuut opnieuw.',
    aiFailed: 'De AI kon de foto niet analyseren. Probeer het opnieuw of kies een andere foto.',
    aiRetrying: 'AI-fout, we proberen het nog één keer...',
    imageRejected: 'Deze foto kan niet worden geanalyseerd. Probeer een andere foto (JPG of PNG).',    
    // Loading states
    analyzing: 'Analyseren...',
    generating: 'Genereren...',
    formatting: 'Formatteren...',
    
    // Content script
    paste: 'Plakken',
    filling: 'Invullen...',
    filled: 'Ingevuld',
    noData: 'Geen data beschikbaar. Kopieer eerst vanuit Autoposter.',
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
    licenseTitle: 'Activeer Autoposter',
    licenseSubtitle: 'Vul je licentiesleutel in om Autoposter te activeren.',
    licenseActivate: 'Activeren',
    licenseKeyHint: 'Je sleutel staat op je Gumroad-bon, in de bevestigingsmail en in je Gumroad-bibliotheek.',
    licenseNoKey: 'Nog geen sleutel?',
    licenseStartFree: 'Start gratis (5 AI-analyses per maand)',
    licenseBuy: 'Starter of Pro kopen',
    licenseLostKey: 'Sleutel kwijt?',
    licenseInLibrary: 'Staat in je Gumroad-bibliotheek',
    licenseActivating: 'Activeren...',
    licenseSuccess: 'Geactiveerd!',
    licenseInvalid: 'Deze sleutel werkt niet. Controleer of je hem goed hebt overgenomen.',
    licenseErrInvalid: 'Deze sleutel kennen we niet. Controleer of je hem helemaal goed hebt overgenomen.',
    licenseErrInactive: 'Deze sleutel is niet meer actief, bijvoorbeeld omdat het abonnement is gestopt of terugbetaald.',
    licenseErrExpired: 'Deze sleutel is verlopen.',
    licenseErrFormat: 'Dit lijkt geen geldige sleutel. Een Gumroad-sleutel ziet er zo uit: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX.',
    licenseErrEmpty: 'Vul eerst je sleutel in.',
    licenseErrUnavailable: 'We kunnen je sleutel nu even niet controleren. Probeer het over een paar minuten opnieuw.',
    licenseNetworkError: 'Geen verbinding met de server. Controleer je internet en probeer het opnieuw.',
    
    // Upgrade page
    upgradeTitle: 'Kies je plan',
    upgradeSubtitle: 'Schaal mee met je verkoopvolume',
    currentPlan: 'Huidig plan',
    perMonth: '/maand',
    upgradeButton: 'Upgrade',
    currentButton: 'Huidig plan',
    popular: 'Populair',
    
    // Tier names
    tierFree: 'Gratis',
    tierStarter: 'Starter',
    tierPro: 'Pro',
    
    // Tier descriptions
    tierFreeDesc: 'Voor wie af en toe iets verkoopt',
    tierStarterDesc: 'Voor regelmatige verkopers',
    tierProDesc: 'Voor wie veel verkoopt',
    
    // Features
    featureAnalyses: 'AI-analyses per maand',
    featureUnlimitedAI: 'Onbeperkt AI-analyses',
    featureTexts: 'AI-teksten per maand',
    featureUnlimitedTexts: 'Onbeperkt AI-teksten',
    upgradeBuyHint: 'Beide knoppen gaan naar dezelfde Gumroad-pagina. Daar kies je Starter of Pro.',
    
    // FAQ
    faqTitle: 'Veelgestelde vragen',
    faqKeyQuestion: 'Hoe krijg ik mijn license key?',
    faqKeyAnswer: 'Na het kopen staat je sleutel op je Gumroad-bon, in de bevestigingsmail en in je Gumroad-bibliotheek. Vul hem hieronder in.',
    faqUpgradeQuestion: 'Kan ik op elk moment upgraden?',
    faqUpgradeAnswer: 'Ja. Wissel van abonnement via je Gumroad-bibliotheek en klik daarna hier op \'Plan vernieuwen\'. Je nieuwe limiet geldt meteen.',
    faqLimitQuestion: 'Wat als ik mijn limiet bereik?',
    faqLimitAnswer: 'Je ziet een upgrade melding. Je kunt alle velden nog handmatig invullen, maar krijgt geen AI hulp meer deze maand.',
    faqCancelQuestion: 'Kan ik mijn abonnement opzeggen?',
    faqCancelAnswer: 'Ja, je kunt op elk moment opzeggen via je Gumroad-bibliotheek. Je houdt toegang tot het einde van je betaalperiode.',
    
    // Analysis
    analysisTimeout: 'Analyse timeout, probeer opnieuw',
    
    // Limit modal
    limitReachedTitle: 'Maandlimiet bereikt',
    limitReachedText: 'Je hebt al je AI analyses voor deze maand gebruikt.',
    textLimitTitle: 'AI-teksten op voor deze maand',
    textLimitText: 'Je hebt alle AI-beschrijvingen van deze maand gebruikt. Met een abonnement krijg je er meer.',
    welcomePageTitle: 'Welkom bij Autoposter',
    welcomePageIntro: 'In drie stappen klaar voor je eerste Vinted-advertentie:',
    welcomeStepKey: 'Haal je gratis sleutel: 5 AI-analyses per maand, zonder betaling. Gumroad laat hem meteen zien en mailt hem ook.',
    welcomeFreeBtn: 'Haal mijn gratis sleutel',
    welcomeStepPaste: 'Plak de sleutel hieronder en klik op Activeren.',
    welcomeStepPin: 'Zet Autoposter vast: klik rechtsboven in Chrome op het puzzelstukje en dan op de punaise naast Autoposter.',
    welcomeDone: 'Klaar! Klik rechtsboven op het Autoposter-icoon en voeg je foto\'s toe. Daarna klik je op Vinted op Plakken.',
    welcomeUpdate: 'Autoposter is vernieuwd. Je oude sleutel werkt niet meer: haal hieronder gratis een nieuwe.',
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
    footerQuestions: 'Vragen of feedback?',
    footerContact: 'Laat het ons weten via het feedbackformulier',
    back: 'Terug',
    
    // License settings
    licenseSettings: 'Licentiesleutel activeren',
    currentLicense: 'Huidig plan:',
    changeLicense: 'Sleutel wijzigen',
    activateLicense: 'Activeren',
    licenseHelp: 'Heb je een sleutel gekocht of een nieuwe gekregen? Vul hem hieronder in.',
    licenseChanged: 'Sleutel geactiveerd!',
    licenseChangeFailed: 'Deze sleutel werkt niet',
    refreshPlan: 'Plan vernieuwen',
    refreshPlanHelp: 'Al geüpgraded op Gumroad? Klik op \'Plan vernieuwen\' om je nieuwe limiet op te halen.',
    planRefreshed: 'Je plan is bijgewerkt',
    
    // Subscription management
    subscription: 'Abonnement',
    subscriptionHelp: 'Upgraden, downgraden of opzeggen doe je in je Gumroad-bibliotheek.',
    manageSubscription: 'Abonnement beheren',
    
    // Offline
    noInternet: 'Geen internetverbinding. Controleer je verbinding en probeer opnieuw.'
  },
  
  en: {
    // Header
    tagline: 'Sell faster on Vinted',
    
    // Intro
    introText: 'Add your photos first, including the brand and size label. The AI creates the title, description, price suggestion, category, brand, size, condition and colour for you.',
    
    // Sections
    productInfo: 'Product details',
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
    analyzePhoto: 'Analyse photos with AI',
    useTemplate: 'Use Template',
    copy: 'Copy',
    open: 'Open',
    clearForm: 'Clear Form',
    settings: 'Settings',
    upgrade: 'Upgrade',
    unlimited: 'unlimited',
    usageLimitReached: 'Limit reached! Upgrade for more AI analyses.',
    welcomeTitle: 'Welcome to Autoposter!',
    welcomeText: 'Learn in 3 steps how to create listings in seconds.',
    step1Title: 'Upload Photos',
    step1Desc: 'Drag or click to add product photos',
    step2Title: 'AI Analyzes',
    step2Desc: 'The AI writes title, description and price and picks category, brand, size, condition and colour',
    step3Title: 'Paste on Vinted',
    step3Desc: 'Open Vinted and click \'Paste\' at the bottom right',
    getStarted: 'Get Started!',
    skipTutorial: 'Skip',
    
    // Upload
    uploadText: 'Click or drag photos here',
    uploadLimit: 'Max 10 photos (up to 15 MB each)',
    aiHintNoPhoto: 'Upload a photo to enable AI analysis',
    aiHintReady: 'Click to analyse your photos (up to 6) and fill in the form',
    
    // Platform section
    platformDescription: 'Open Vinted from here and click \'Paste\' at the bottom right. Photos, title, description, price, category, brand, size, condition and colour are filled in for you.',
    
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
    formCleared: 'Form cleared',
    noTemplate: 'No template set. Go to settings.',
    imageDownloaded: 'Image downloaded',
    base64Copied: 'Base64 copied to clipboard',
    autoAnalyzing: 'Photo detected, starting analysis...',
    templateApplied: 'Template applied',
    imageReadFailed: 'could not be read',
    copyFailed: 'Copy failed',
    storageFull: 'Could not save: the extension storage is full. Remove some photos or clear the form.',
    generationLimit: 'You have reached your monthly limit for AI texts. Upgrade for more, or write the description yourself.',
    generateFailed: 'Could not create the text. Please try again.',
    licenseProblem: 'Your key is not valid (anymore). We are checking it again.',
    serviceUnavailable: 'The server is unavailable right now. Please try again in a few minutes.',
    aiBusy: 'The AI is busy right now. Please try again in a minute.',
    aiFailed: 'The AI could not analyze the photo. Try again or choose another photo.',
    aiRetrying: 'AI error, trying once more...',
    imageRejected: 'This photo cannot be analyzed. Try another photo (JPG or PNG).',    
    // Loading states
    analyzing: 'Analyzing...',
    generating: 'Generating...',
    formatting: 'Formatting...',
    
    // Content script
    paste: 'Paste',
    filling: 'Filling...',
    filled: 'Filled',
    noData: 'No data available. Copy from Autoposter first.',
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
    licenseTitle: 'Activate Autoposter',
    licenseSubtitle: 'Enter your license key to activate Autoposter.',
    licenseActivate: 'Activate',
    licenseKeyHint: 'Your key is on your Gumroad receipt, in the confirmation email and in your Gumroad library.',
    licenseNoKey: 'No key yet?',
    licenseStartFree: 'Start for free (5 AI analyses per month)',
    licenseBuy: 'Buy Starter or Pro',
    licenseLostKey: 'Lost your key?',
    licenseInLibrary: 'It is in your Gumroad library',
    licenseActivating: 'Activating...',
    licenseSuccess: 'Activated!',
    licenseInvalid: 'This key does not work. Check that you copied it correctly.',
    licenseErrInvalid: 'We do not know this key. Check that you copied all of it correctly.',
    licenseErrInactive: 'This key is no longer active, for example because the subscription ended or was refunded.',
    licenseErrExpired: 'This key has expired.',
    licenseErrFormat: 'This does not look like a valid key. A Gumroad key looks like this: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX.',
    licenseErrEmpty: 'Please enter your key first.',
    licenseErrUnavailable: 'We cannot check your key right now. Please try again in a few minutes.',
    licenseNetworkError: 'No connection to the server. Check your internet connection and try again.',
    
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
    featureTexts: 'AI texts per month',
    featureUnlimitedTexts: 'Unlimited AI texts',
    upgradeBuyHint: 'Both buttons go to the same Gumroad page. You choose Starter or Pro there.',
    
    // FAQ
    faqTitle: 'Frequently asked questions',
    faqKeyQuestion: 'How do I get my license key?',
    faqKeyAnswer: 'After buying, your key is on your Gumroad receipt, in the confirmation email and in your Gumroad library. Enter it below.',
    faqUpgradeQuestion: 'Can I upgrade at any time?',
    faqUpgradeAnswer: 'Yes. Change your subscription in your Gumroad library, then click \'Refresh plan\' here. Your new limit applies right away.',
    faqLimitQuestion: 'What if I reach my limit?',
    faqLimitAnswer: 'You will see an upgrade prompt. You can still fill in all fields manually, but won\'t get AI help for the rest of the month.',
    faqCancelQuestion: 'Can I cancel my subscription?',
    faqCancelAnswer: 'Yes, you can cancel at any time in your Gumroad library. You keep access until the end of your billing period.',
    
    // Analysis
    analysisTimeout: 'Analysis timeout, please try again',
    
    // Limit modal
    limitReachedTitle: 'Monthly limit reached',
    limitReachedText: 'You have used all your AI analyses for this month.',
    textLimitTitle: 'No AI texts left this month',
    textLimitText: 'You have used all AI descriptions for this month. A subscription gives you more.',
    welcomePageTitle: 'Welcome to Autoposter',
    welcomePageIntro: 'Three steps to your first Vinted listing:',
    welcomeStepKey: 'Get your free key: 5 AI analyses per month, no payment. Gumroad shows it right away and emails it too.',
    welcomeFreeBtn: 'Get my free key',
    welcomeStepPaste: 'Paste the key below and click Activate.',
    welcomeStepPin: 'Pin Autoposter: click the puzzle piece at the top right of Chrome, then the pin next to Autoposter.',
    welcomeDone: 'Done! Click the Autoposter icon at the top right and add your photos. Then click Paste on Vinted.',
    welcomeUpdate: 'Autoposter has been renewed. Your old key no longer works: get a new free one below.',
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
    footerQuestions: 'Questions or feedback?',
    footerContact: 'Let us know via the feedback form',
    back: 'Back',
    
    // License settings
    licenseSettings: 'Activate license key',
    currentLicense: 'Current plan:',
    changeLicense: 'Change key',
    activateLicense: 'Activate',
    licenseHelp: 'Bought a key or got a new one? Enter it below.',
    licenseChanged: 'Key activated!',
    licenseChangeFailed: 'This key does not work',
    refreshPlan: 'Refresh plan',
    refreshPlanHelp: 'Already upgraded on Gumroad? Click \'Refresh plan\' to load your new limit.',
    planRefreshed: 'Your plan has been updated',
    
    // Subscription management
    subscription: 'Subscription',
    subscriptionHelp: 'Upgrade, downgrade or cancel in your Gumroad library.',
    manageSubscription: 'Manage subscription',
    
    // Offline
    noInternet: 'No internet connection. Check your connection and try again.'
  }
};

// Get current language from storage, or follow the browser
function browserLanguage() {
  const lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
}
let currentLanguage = browserLanguage();

async function loadLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      // No choice yet: follow the browser (Dutch for nl/nl-BE, otherwise English)
      currentLanguage = result.language || browserLanguage();
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
