// AutoPoster - Complete Vinted Category Engine
// Full category structure with Dutch translations matching Vinted NL

// ============================================
// VINTED CATEGORY TREE - COMPLETE (using English keys)
// Order: Dames, Heren, Kinderen, Home, Elektronica, Entertainment, Hobby's & Verzamelen, Sport
// ============================================

// Main category keys for ordering (used by UI) - English keys
const VINTED_CATEGORY_ORDER = [
  "Women",
  "Men",
  "Kids",
  "Home",
  "Electronics",
  "Entertainment",
  "Hobbies & Collectables",
  "Sports"
];

const VINTED_CATEGORIES = {
  "Women": {
    "Clothing": {
      "Outerwear": {
        "Capes & ponchos": [],
        "Coats": ["Duffle coats", "Faux fur coats", "Overcoats & long coats", "Parkas", "Peacoats", "Raincoats", "Trench coats"],
        "Gilets & bodywarmers": [],
        "Jackets": ["Biker & racer jackets", "Bomber jackets", "Denim jackets", "Field & utility jackets", "Fleece jackets", "Puffer jackets", "Quilted jackets", "Shackets", "Ski & snowboard jackets", "Varsity jackets", "Windbreakers"]
      },
      "Jumpers & sweaters": {
        "Hoodies & sweatshirts": [],
        "Jumpers": ["V-neck jumpers", "Turtleneck jumpers", "Long jumpers", "Knitted jumpers", "3/4-sleeve jumpers", "Other jumpers"],
        "Kimonos": [],
        "Cardigans": [],
        "Boleros": [],
        "Waistcoats": [],
        "Other jumpers & sweaters": []
      },
      "Suits & blazers": ["Blazers", "Trouser suits", "Skirt suits", "Suit separates", "Other suits & blazers"],
      "Dresses": {
        "Mini dresses": [],
        "Midi dresses": [],
        "Long dresses": [],
        "Special occasion dresses": ["Party & cocktail dresses", "Wedding dresses", "Prom dresses", "Evening dresses", "Backless dresses"],
        "Summer dresses": [],
        "Winter dresses": [],
        "Formal & work dresses": [],
        "Casual dresses": [],
        "Strapless dresses": [],
        "Little black dresses": [],
        "Denim dresses": [],
        "Other dresses": []
      },
      "Skirts": ["Miniskirts", "Knee-length skirts", "Midi skirts", "Maxi skirts", "Asymmetric skirts", "Skorts"],
      "Tops & t-shirts": ["Shirts", "Blouses", "Camis", "T-shirts", "Vest tops & tank tops", "Tunics", "Crop tops", "Short sleeved tops", "¾-sleeve tops", "Long sleeved tops", "Bodysuits", "Off-the-shoulder tops", "Turtlenecks", "Peplum tops", "Halter neck tops", "Other tops & t-shirts"],
      "Jeans": ["Boyfriend jeans", "Cropped jeans", "Flared jeans", "High waisted jeans", "Ripped jeans", "Skinny jeans", "Straight jeans", "Other"],
      "Trousers & leggings": ["Cropped trousers & chinos", "Wide-leg trousers", "Skinny trousers", "Tailored trousers", "Straight-leg trousers", "Leather trousers", "Leggings", "Harem pants", "Other trousers"],
      "Shorts & cropped trousers": ["Low-waisted shorts", "High-waisted shorts", "Knee-length shorts", "Denim shorts", "Lace shorts", "Leather shorts", "Cargo shorts", "Cropped trousers", "Other shorts & cropped trousers"],
      "Jumpsuits & playsuits": ["Jumpsuits", "Playsuits", "Other jumpsuits & playsuits"],
      "Swimwear": ["One-pieces", "Bikinis & tankinis", "Cover-ups & sarongs", "Other swimwear & beachwear"],
      "Lingerie & nightwear": ["Bras", "Panties", "Sets", "Shapewear", "Nightwear", "Dressing gowns", "Tights & stockings", "Socks", "Lingerie accessories", "Other"],
      "Maternity clothes": {
        "Maternity tops": [],
        "Maternity dresses": [],
        "Maternity skirts": [],
        "Maternity trousers": [],
        "Maternity shorts": [],
        "Maternity jumpsuits & playsuits": [],
        "Maternity jumpers & sweaters": [],
        "Maternity coats & jackets": [],
        "Maternity swimwear & beachwear": [],
        "Maternity underwear": ["Maternity panties", "Maternity sleepwear", "Pregnancy & breastfeeding bras"],
        "Maternity activewear": []
      },
      "Activewear": {
        "Outerwear": [],
        "Tracksuits": [],
        "Trousers": [],
        "Shorts": [],
        "Dresses": [],
        "Skirts": [],
        "Tops & t-shirts": [],
        "Team shirts & jerseys": [],
        "Hoodies & sweatshirts": [],
        "Sports accessories": ["Glasses", "Gloves", "Hats", "Scarves", "Wristbands"],
        "Sports bras": [],
        "Other activewear": []
      },
      "Costumes & special outfits": [],
      "Other clothing": []
    },
    "Shoes": {
      "Ballerinas": [],
      "Boat shoes, loafers & moccasins": [],
      "Boots": ["Ankle boots", "Mid-calf boots", "Knee-high boots", "Over-the-knee boots", "Snow boots", "Wellington boots", "Work boots"],
      "Clogs & mules": [],
      "Espadrilles": [],
      "Flip-flops & slides": [],
      "Heels": [],
      "Lace-up shoes": [],
      "Mary Janes & T-bar shoes": [],
      "Sandals": [],
      "Slippers": [],
      "Sports shoes": ["Basketball shoes", "Climbing & bouldering shoes", "Cycling shoes", "Dance shoes", "Football boots", "Golf shoes", "Hiking boots & shoes", "Ice skates", "Indoor football shoes", "Indoor training shoes", "Motorcycle boots", "Roller skates & inline skates", "Running shoes", "Ski boots", "Snowboard boots", "Swimming & water shoes", "Tennis shoes"],
      "Trainers": []
    },
   "Bags": {
      "Backpacks": [],
      "Beach bags": [],
      "Briefcases": [],
      "Bucket bags": [],
      "Bum bags": [],
      "Clutches": [],
      "Garment bags": [],
      "Gym bags": [],
      "Handbags": [],
      "Hobo bags": [],
      "Holdalls & duffel bags": [],
      "Luggage & suitcases": [],
      "Makeup bags": [],
      "Satchels & messenger bags": [],
      "Shoulder bags": [],
      "Tote bags": [],
      "Wallets & purses": [],
      "Wristlets": []
    },
    "Accessories": {
      "Bandanas & headscarves": [],
      "Belts": [],
      "Gloves": [],
      "Hair accessories": [],
      "Handkerchiefs": [],
      "Hats & caps": {
        "Balaclavas": [],
        "Beanies": [],
        "Caps": [],
        "Earmuffs": [],
        "Fascinators": [],
        "Hats": [],
        "Headbands": []
      },
      "Jewellery": {
        "Anklets": [],
        "Body jewellery": [],
        "Bracelets": [],
        "Brooches": [],
        "Charms & pendants": [],
        "Earrings": [],
        "Jewellery sets": [],
        "Necklaces": [],
        "Rings": [],
        "Other jewellery": []
      },
      "Keyrings": [],
      "Scarves & shawls": [],
      "Sunglasses": [],
      "Umbrellas": [],
      "Watches": [],
      "Other accessories": []
    },
    "Beauty": {
      "Make-up": [],
      "Perfume": [],
      "Facial care": [],
      "Beauty tools": {
        "Hair styling tools": [],
        "Facial care tools": [],
        "Body care tools": [],
        "Nail care tools": [],
        "Make-up tools": []
      },
      "Hand care": [],
      "Nail care": [],
      "Body care": [],
      "Hair care": [],
      "Other beauty items": []
    }
  },
  "Men": {
    "Clothing": {
      "Jeans": ["Ripped jeans", "Skinny jeans", "Slim fit jeans", "Straight fit jeans"],
      "Outerwear": {
        "Coats": ["Duffle coats", "Overcoats & long coats", "Parkas", "Peacoats", "Raincoats", "Trench coats"],
        "Gilets & bodywarmers": [],
        "Jackets": ["Biker & racer jackets", "Bomber jackets", "Denim jackets", "Field & utility jackets", "Fleece jackets", "Harrington jackets", "Puffer jackets", "Quilted jackets", "Shackets", "Ski & snowboard jackets", "Varsity jackets", "Windbreakers"],
        "Ponchos": []
      },
      "Tops & t-shirts": {
        "Shirts": ["Checked shirts", "Denim shirts", "Plain shirts", "Print shirts", "Striped shirts", "Other shirts"],
        "T-shirts": ["Plain t-shirts", "Print t-shirts", "Striped t-shirts", "Polo shirts", "Long-sleeved t-shirts", "Other t-shirts"],
        "Vests & sleeveless t-shirts": []
      },
      "Suits & blazers": ["Suit jackets & blazers", "Suit trousers", "Waistcoats", "Suit sets", "Wedding suits", "Other suits & blazers"],
      "Jumpers & sweaters": ["Jumpers", "Hoodies & sweaters", "Zip-through hoodies & sweaters", "Cardigans", "Crew neck jumpers", "V-neck jumpers", "Turtleneck jumpers", "Long jumpers", "Chunky-knit jumpers", "Sleeveless jumpers", "Other jumpers & sweaters"],
      "Trousers": ["Chinos", "Joggers & sweatpants", "Skinny trousers", "Cropped trousers", "Tailored trousers", "Wide-legged trousers", "Other trousers"],
      "Shorts": ["Cargo shorts", "Chino shorts", "Denim shorts", "Other shorts"],
      "Socks & underwear": ["Underwear", "Socks", "Dressing gowns", "Other socks & underwear"],
      "Sleepwear": ["One-piece pajamas", "Pyjama bottoms", "Pyjama sets", "Pyjama tops"],
      "Swimwear": [],
      "Activewear": {
        "Outerwear": [],
        "Tracksuits": [],
        "Trousers": [],
        "Shorts": [],
        "Tops & t-shirts": [],
        "Team shirts & jerseys": [],
        "Pullovers & sweaters": [],
        "Sports accessories": ["Glasses", "Gloves", "Hats", "Scarves", "Wristbands"],
        "Other activewear": []
      },
      "Costumes & special outfits": [],
      "Other men's clothing": []
    },
    "Shoes": {
      "Boat shoes, loafers & mocassins": [],
      "Boots": ["Chelsea & slip-on boots", "Desert & lace-up boots", "Snow boots", "Wellington boots", "Work boots"],
      "Clogs & mules": [],
      "Espadrilles": [],
      "Flip-flops & slides": [],
      "Formal shoes": [],
      "Sandals": [],
      "Slippers": [],
      "Sports shoes": ["Basketball shoes", "Climbing & bouldering shoes", "Cycling shoes", "Dance shoes", "Football boots", "Golf shoes", "Hiking boots & shoes", "Ice skates", "Indoor football shoes", "Indoor training shoes", "Motorcycle boots", "Rollerskates & inline skates", "Running shoes", "Ski boots", "Snowboard boots", "Swimming & water shoes", "Tennis shoes"],
      "Trainers": []
    },
    "Accessories": {
      "Bags & backpacks": ["Backpacks", "Briefcases", "Bum bags", "Garment bags", "Gym bags", "Holdalls & duffle bags", "Luggage & suitcases", "Satchels & messenger bags", "Shoulder bags", "Wallets"],
      "Bandanas & headscarves": [],
      "Belts": [],
      "Braces & suspenders": [],
      "Gloves": [],
      "Handkerchiefs": [],
      "Hats & caps": ["Balaclavas", "Beanies", "Caps", "Hats"],
      "Jewellery": ["Bracelets", "Charms & pendants", "Cufflinks", "Earrings", "Necklaces", "Rings", "Other jewellery"],
      "Pocket squares": [],
      "Scarves & shawls": [],
      "Sunglasses": [],
      "Ties & bowties": [],
      "Watches": [],
      "Other accessories": []
    },
    "Grooming": {
      "Facial care": [],
      "Tools & accessories": ["Shaving tools", "Grooming tools", "Other tools"],
      "Hair care": [],
      "Body care": [],
      "Hand & nail care": [],
      "Aftershave & cologne": [],
      "Make-up": [],
      "Grooming kits": [],
      "Other grooming items": []
    }
  },
  "Kids": {
    "Girls clothing": {
      "Baby girls' clothing": [],
      "Shoes": [],
      "Outerwear": [],
      "Jumpers & hoodies": [],
      "Tops & t-shirts": [],
      "Dresses": [],
      "Skirts": [],
      "Trousers, shorts & dungarees": [],
      "Bags & backpacks": [],
      "Accessories": [],
      "Swimwear": [],
      "Underwear & socks": [],
      "Sleepwear & nightwear": [],
      "Activewear": [],
      "Clothing bundles": [],
      "Clothing for twins": [],
      "Fancy dress & costumes": [],
      "Formal wear & special occasion clothing": [],
      "Other girls' clothing": []
    },
    "Boys clothing": {
      "Baby boys' clothing": [],
      "Shoes": [],
      "Outerwear": [],
      "Jumpers & hoodies": [],
      "Tops & t-shirts": [],
      "Trousers, shorts & dungarees": [],
      "Bags & backpacks": [],
      "Accessories": [],
      "Swimwear": [],
      "Underwear & socks": [],
      "Sleepwear": [],
      "Activewear": [],
      "Clothing bundles": [],
      "Clothing for twins": [],
      "Fancy dress & costumes": [],
      "Formal wear & special occasion clothing": [],
      "Other boys' clothing": []
    },
    "Toys": {
      "Toy figures & accessories": [],
      "Arts & crafts": [],
      "Baby activities & toys": [],
      "Blocks & building toys": [],
      "Dolls & accessories": [],
      "Dress up & pretend play": [],
      "Educational toys": [],
      "Electronic toys": [],
      "Musical toys & toy instruments": [],
      "Novelty & fidget toys": [],
      "Outdoor & sports toys": [],
      "Soft toys & stuffed animals": [],
      "Toy cars, trains & other vehicles": []
    },
    "Pushchairs, carriers & car seats": {
      "Baby carriers & wraps": [],
      "Buggies & pushchairs": [],
      "Buggy accessories": [],
      "Car seats": [],
      "Booster seats": [],
      "Car seat accessories": []
    },
    "Furniture & decor": {
      "Kids' mattresses": [],
      "Playmats & padded flooring": [],
      "Playpens": [],
      "Loungers & nests": [],
      "Decor & keepsakes": [],
      "Nursery furniture": [],
      "Rugs & mats": [],
      "Chairs": [],
      "Play furniture": [],
      "Shelves": [],
      "Table & desks": [],
      "Wardrobes": []
    },
    "Bathing & changing": {
      "Baby changing bags": [],
      "Bathing": [],
      "Changing mats & covers": [],
      "Nappies": [],
      "Nappy storage & disposal": [],
      "Potties": [],
      "Skincare & hygiene": [],
      "Step stools": []
    },
    "Childproofing & safety equipment": {
      "Baby gates & guards": [],
      "Childproofing accessories": [],
      "Hearing protection": [],
      "Safety harnesses & reins": []
    },
    "Health & pregnancy": {
      "Humidifiers": [],
      "Nasal aspirators": [],
      "Postpartum care": [],
      "Pregnancy pillows": [],
      "Pregnancy support belts": [],
      "Scales": [],
      "Thermometers": []
    },
    "Nursing & feeding": {
      "Baby food blenders & makers": [],
      "Bibs": [],
      "Bottle feeding": [],
      "Breastfeeding": [],
      "Cups, dishes & utensils": [],
      "Feeding pillows & covers": [],
      "Dummies & soothers": [],
      "Dummy accessories": [],
      "High chairs": [],
      "High chair accessories": [],
      "Muslins & burp cloths": [],
      "Sterilisers": []
    },
    "Sleep & bedding": {
      "Baby monitors": [],
      "Bed rails & guards": [],
      "Bedding, blankets & throws": [],
      "Blackout shades": [],
      "Heating pads & hot water bottles": [],
      "Nightlights & wake-up lights": [],
      "Sleep sacks & wearable blankets": [],
      "Sleeping bags": [],
      "Swaddles": [],
      "White noise machines": []
    },
    "School supplies": {
      "Lunch boxes & bags": [],
      "School bags": [],
      "School supplies": []
    },
    "Other kids' items": []
  },
  "Home": {
    "Furniture": ["Chairs", "Tables", "Storage", "Beds", "Sofas"],
    "Decor": ["Wall art", "Mirrors", "Candles", "Vases", "Rugs"],
    "Kitchen & dining": ["Cookware", "Tableware", "Kitchen appliances"],
    "Bedding": ["Bed linen", "Pillows", "Blankets"],
    "Garden": ["Garden furniture", "Plants", "Garden tools"]
  },
  "Electronics": {
    "Video games & consoles": {
      "Consoles": [],
      "Games": [],
      "Controllers": [],
      "Gaming headsets": [],
      "Simulators": [],
      "Virtual reality": ["VR headsets", "VR accessories", "VR device parts"],
      "Accessories": ["Cases", "Gaming holders & stands", "Gaming chargers & charging docks", "Game strategy guides", "Other accessories"]
    },
    "Computers & accessories": {
      "Laptops": [],
      "Desktop computers": [],
      "Computer parts & components": ["Computer cases", "CPUs & processors", "Motherboards", "Motherboard & CPU combos", "Graphics cards", "RAM units", "Computer cooling & fans", "Internal sound cards", "Video capture & TV tuner cards", "Internal storage devices", "Computer power supplies", "Computer repair tools", "Laptop replacement parts", "Other components & parts"],
      "Blank media": ["USB flash drives", "External hard drives", "CD, DVD & Blu-ray discs", "Floppy discs", "Zip & jaz drives", "Media cases & sleeves", "Other blank media"],
      "Computer accessories": ["Hard drive duplicators", "Memory card adaptors", "Memory card readers", "Other computer accessories"],
      "Laptop accessories": ["Laptop bags & cases", "Laptop stands", "Laptop chargers", "Laptop privacy filters", "Laptop cooling pads & fans", "Laptop security locks", "Laptop camera covers"],
      "Docking stations & USB hubs": [],
      "Keyboards & accessories": ["Keyboards", "Keyboard switches", "Keyboard keycaps", "Keyboard stickers", "Keyboard covers"],
      "Mice": [],
      "Mouse pads": [],
      "Monitors & accessories": ["Monitors", "Monitor stands", "Monitor arms", "Monitor privacy filters", "Monitor covers"],
      "Computer speakers": [],
      "Computer microphones": [],
      "Webcams": [],
      "Networking devices": ["Routers", "Mesh systems", "Network repeaters", "Modems", "Mobile hotspots", "Network adaptors", "Satellite internet receivers"],
      "Printers & accessories": ["Inkjet printers", "Laser printers", "Photo printers", "Label printers", "Thermal printers", "Commercial multifunction printers", "Printer ink cartridges", "Printer toner", "Ink ribbons", "Printer parts"],
      "Scanners & accessories": ["Scanners", "Scanner accessories"],
      "Touch & stylus pads": []
    },
    "Mobile phones & communication": {
      "Mobile phones": [],
      "Mobile phone parts & accessories": ["Mobile phone cases", "Mobile phone screen protectors", "Mobile phone grips", "Selfie sticks", "Mounts, stands & tripods", "Mobile phone flashes & lights", "Mobile phone charms", "Mobile phone parts", "Other mobile phone accessories"],
      "Landline phones": [],
      "Fax machines": [],
      "Radio communication": ["Shortwave radios", "Walkie talkies"],
      "Dummy mobile phones": []
    },
    "Audio, headphones & Hi-Fi": {
      "Headphones & earbuds": [],
      "Handheld music players": ["MP3 players", "Handheld CD players", "Handheld cassette players", "Handheld MiniDisc players"],
      "Portable radios": [],
      "Portable speakers": [],
      "Smart speakers": [],
      "Home audio systems": ["Hi-Fi & shelf stereo systems", "Speakers", "Subwoofers", "Soundbars", "Equalisers", "Amplifiers & pre-amplifiers", "Receivers", "Turntables", "CD players & recorders", "Cassette & tape players", "Radio tuners", "MiniDisc players & recorders", "Other home audio devices"],
      "Audio device accessories": ["Headphone stands", "Headphone earpads", "Earbud tips", "Turntable needles", "Turntable slipmats", "Speaker & subwoofer isolation pads", "Other audio accessories"],
      "Home audio & Hi-Fi parts": []
    },
    "Cameras & accessories": {
      "Cameras": ["Action cameras", "Digital cameras", "Film cameras", "Instant cameras", "Video cameras", "Other cameras"],
      "Lenses": [],
      "Flashes": [],
      "Memory cards": [],
      "Tripods": [],
      "Stabilisers & mounts": [],
      "Darkroom equipment": ["Darkroom processing equipment", "Darkroom safelights", "Enlargement lenses & equipment", "Photographic paper", "Other darkroom equipment"],
      "Studio equipment": ["Studio & photobooth props", "Studio backdrops", "Studio lighting"],
      "Camera drones & accessories": ["Camera drones", "Drone bags", "Drone parts"],
      "Accessories": ["Camera cases & bags", "Camera straps", "Film", "Lens accessories", "Flash accessories", "Camera repair kits", "Other camera accessories"],
      "Camera replacement parts": [],
      "Other photography equipment": []
    },
    "Tablets, e-readers & accessories": {
      "Tablets": [],
      "e-Readers": [],
      "Digital notepads": [],
      "PDAs": [],
      "Accessories": ["Tablet cases & folios", "e-Reader cases & screen protectors", "Tablet keyboards", "Tablet stands & mounts", "Styluses", "Tablet & e-reader parts"]
    },
    "TV & home cinema": {
      "Televisions": [],
      "Projectors": [],
      "Streaming devices": [],
      "Television antennas": [],
      "Satellite dishes": [],
      "Video decoders": [],
      "Television receivers": [],
      "Home cinema systems": [],
      "Blu-ray players": [],
      "DVD players": [],
      "VCRs": [],
      "Other video playback devices": ["HD DVD players", "LaserDisc players", "Video 2000 players", "Betamax players"],
      "TV & home cinema accessories": ["Projector mounts & stands", "Projector screens", "Remote controls"]
    },
    "Beauty & personal care electronics": {
      "Hair styling tools": ["Hair dryers", "Hair straighteners", "Curling irons", "Other hair styling tools"],
      "Beauty tools": ["LED masks", "Electric facial cleansers & scrubs", "Beauty pens"],
      "Shaving & hair removal": ["IPL epilators", "Rotary epilators", "Trimmers", "Nose hair trimmers", "Electric shavers"],
      "Massage tools": ["Facial massagers", "Massage guns", "Massage belts", "Infrared massagers"],
      "Electric dental & oral care": ["Electric toothbrushes", "Water flossers", "Electric toothbrush & water flosser parts"],
      "Nail care tools": ["Manicure & pedicure spas", "Nail dryers", "UV nail lamps"],
      "Scales": []
    },
    "Wearables": {
      "Smartwatches": [],
      "Fitness trackers": [],
      "Smart glasses": [],
      "Smart rings": [],
      "Replacement bands": [],
      "Smartwatch cases": []
    },
    "Other devices & accessories": {
      "3D printing & scanning": ["3D printers", "3D scanners", "3D pens", "3D printer filament", "3D printer parts"],
      "GPS & satellite navigation devices": [],
      "Item finders": [],
      "Luggage scales": [],
      "Adaptors": [],
      "Cables": [],
      "Chargers": [],
      "Power banks": [],
      "Surge protectors & power strips": [],
      "Batteries & power supplies": ["Single-use batteries", "Rechargeable batteries", "Battery chargers", "Power distribution units", "Power inverters"],
      "Other accessories": []
    }
  },
  "Entertainment": {
    "Books": ["Fiction", "Non-fiction", "Children's books", "Comics & graphic novels", "Textbooks"],
    "Music": ["Vinyl records", "CDs", "Cassettes"],
    "Films & TV": ["DVDs", "Blu-rays", "Box sets"],
    "Magazines": []
  },
  "Hobbies & Collectables": {
    "Trading cards": {
      "Single trading cards": [],
      "Booster packs": [],
      "Booster boxes": [],
      "Card decks": [],
      "Trading card sets": [],
      "Uncut card sheets": []
    },
    "Board games": [],
    "Puzzles": [],
    "Tabletop & miniature gaming": [],
    "Memorabilia": {
      "Sports memorabilia": [],
      "Music memorabilia": [],
      "Film & TV memorabilia": [],
      "Other memorabilia": []
    },
    "Coins & banknotes": {
      "Banknotes": [],
      "Coins": [],
      "Sets": [],
      "Medals & tokens": [],
      "Share certificates": []
    },
    "Stamps": {
      "Individual stamps": [],
      "Stamp sets & lots": [],
      "First day covers": [],
      "Stamp catalogues & guides": [],
      "Stamp tools": []
    },
    "Postcards": [],
    "Musical instruments & gear": {
      "Guitars & bass guitars": {
        "Acoustic guitars": [],
        "Classical guitars": [],
        "Electric guitars": [],
        "Electro-acoustic guitars": [],
        "Bass guitars": [],
        "Other guitars": [],
        "Guitar accessories & parts": ["Bass guitar bags & cases", "Bass guitar cases", "Bass guitar strings", "Capos", "Guitar & bass guitar stands & hangers", "Guitar & bass guitar straps", "Guitar bags & cases", "Guitar cases", "Guitar maintenance & cleaning", "Guitar mutes", "Guitar parts", "Guitar picks", "Guitar slides", "Guitar strings", "Other guitar accessories"]
      },
      "Amps & pedals": {
        "Bass amps": [],
        "Guitar amps": [],
        "Drum amps": [],
        "Keyboard amps": [],
        "Amp modelers & effects processors": [],
        "Amp accessories & parts": ["Amp covers & bags", "Amp cases", "Amp footswitches", "Amp replacement parts", "Amp stands", "Instrument cables", "Other amp accessories"],
        "Pedals": [],
        "Pedal accessories & parts": ["Pedal bags & cases", "Pedal power supplies", "Pedalboards", "Other pedal accessories & parts"]
      },
      "Drums & percussion": [],
      "Pianos, keyboards & synthesizers": [],
      "String instruments": [],
      "Wind instruments": [],
      "Studio & live sound gear": [],
      "DJ gear": [],
      "Karaoke gear": [],
      "Music accessories": []
    },
    "Arts & crafts": {
      "Sewing, knitting & needlecraft": [],
      "Painting": [],
      "Drawing & sketching": [],
      "Calligraphy": [],
      "Jewellery making": [],
      "Papercraft": [],
      "Die cutting": [],
      "Candle making": [],
      "Pottery & sculpting": [],
      "Crafting supplies": [],
      "Crafting tools": []
    },
    "Collectables storage": {
      "Albums & binders": [],
      "Storage boxes": [],
      "Card sleeves": [],
      "Screwdown card holders": [],
      "Deck boxes": [],
      "Album & binder dividers": [],
      "Album & binder refills": [],
      "Puzzle mats": [],
      "Other collectables storage": []
    },
    "Gaming accessories": {
      "Dice": [],
      "Gaming stones & tokens": [],
      "Gaming playmats": [],
      "Other gaming accessories": []
    }
  },
  "Sports": {
    "Cycling": {
      "Bikes": {
        "City bikes": [],
        "Road bikes": [],
        "Aero & triathlon bikes": [],
        "Gravel bikes": [],
        "Touring bikes": [],
        "Mountain bikes": [],
        "Hybrid bikes": [],
        "Folding bikes": [],
        "BMX": [],
        "Cargo bikes": [],
        "Other bikes": []
      },
      "Electric bikes": {
        "Electric road bikes": [],
        "Electric mountain bikes": [],
        "Electric city bikes": [],
        "Electric cargo bikes": [],
        "Other electric bikes": []
      },
      "Kids' bikes": {
        "Balance bikes": [],
        "Kids' bikes": [],
        "Tricycles": []
      },
      "Bike helmets": [],
      "Cycling accessories & tools": {
        "Bike baskets": [],
        "Bike bells & horns": [],
        "Bike fenders & mudguards": [],
        "Bike lights": [],
        "Bike locks": [],
        "Bike water bottles": [],
        "Bottle cages": [],
        "Bike pumps": [],
        "Kickstands": [],
        "Panniers & bike bags": [],
        "Bike tools": [],
        "Bike stands & wall-mounts": [],
        "Bike pannier racks": [],
        "Car bike racks": [],
        "Bike boxes & travel bags": [],
        "Other bike accessories": []
      },
      "Indoor cycling trainers": [],       // CORRECTED: Was "Turbo trainers"
      "Bike trailers": [],
      "Kids' bike seats": [],              // CORRECTED: Was "Bike child seats"
      "Bike parts": {
        "Bottom brackets": [],
        "Brakes": [],
        "Cassettes": [],
        "Chainrings": [],
        "Chains": [],
        "Cranksets": [],
        "Forks": [],
        "Derailleurs": [],
        "Grips": [],
        "Handlebars": [],
        "Headsets": [],
        "Pedals": [],
        "Saddles": [],
        "Seatposts": [],
        "Shifters": [],
        "Shock absorbers": [],
        "Tyres": [],
        "Inner tubes": [],
        "Wheels": [],
        "Other bike parts": []
      }
    },
    "Fitness, running & yoga": {
      "Fitness equipment": [],
      "Strength training": [],
      "Running": [],
      "Yoga & pilates": [],
      "Fitness accessories": [],
      "Water bottles": []
    },
    "Outdoor sports": [],
    "Water sports": [],
    "Team sports": [],
    "Racket sports": [],
    "Golf": [],
    "Horse riding": [],
    "Skateboards & scooters": [],
    "Boxing & martial arts": [],
    "Recreational sports & games": [],
    "Winter sports": []
  }
};

// ============================================
// CATEGORY TRANSLATIONS - NL/EN
// Maps English keys to translations per language
// Complete translations based on Vinted NL
// ============================================

const CATEGORY_TRANSLATIONS = {
  en: {
    // Main categories
    "Women": "Women",
    "Men": "Men",
    "Kids": "Kids",
    "Home": "Home",
    "Electronics": "Electronics",
    "Entertainment": "Entertainment",
    "Hobbies & Collectables": "Hobbies & Collectables",
    "Sports": "Sports",
    // All other English keys just return themselves
  },
  nl: {
    // ===== MAIN CATEGORIES =====
    "Women": "Dames",
    "Men": "Heren",
    "Kids": "Kinderen",
    "Home": "Home",
    "Electronics": "Elektronica",
    "Entertainment": "Entertainment",
    "Hobbies & Collectables": "Hobby's & verzamelen",
    "Sports": "Sport",
    
    // ===== HEREN (Men) =====
    "Clothing": "Kleding",
    "Jeans": "Spijkerbroeken",
    "Ripped jeans": "Gescheurde spijkerbroeken",
    "Skinny jeans": "Skinny jeans",
    "Slim-fit jeans": "Spijkerbroek met strakke pasvorm",
    "Straight-fit jeans": "Spijkerbroek met rechte pijpen",
    "Outerwear": "Buitenkleding",
    "Coats": "Jassen",
    "Duffle coats": "Duffeljassen",
    "Overcoats & long coats": "Overjassen & Lange jassen",
    "Parkas": "Parka jassen",
    "Peacoats": "Peacoat jassen",
    "Raincoats": "Regenjassen",
    "Trench coats": "Trenchcoats",
    "Gilets & bodywarmers": "Bodywarmers",
    "Jackets": "Jacks",
    "Biker & racer jackets": "Motor- & racejassen",
    "Bomber jackets": "Bomberjacks",
    "Denim jackets": "Spijkerjassen",
    "Field & utility jackets": "Leger- & utility jacks",
    "Fleece jackets": "Fleecejacks",
    "Harrington jackets": "Harrington jassen",
    "Puffer jackets": "Gewatteerde jassen",
    "Quilted jackets": "Quilted jassen",
    "Shackets": "Shackets & overshirts",
    "Ski & snowboard jackets": "Ski- & snowboardjassen",
    "Varsity jackets": "Baseball jacks",
    "Windbreakers": "Windjacks",
    "Ponchos": "Poncho's",
    "Tops & t-shirts": "Tops & shirts",
    "Shirts": "Overhemden",
    "Checked shirts": "Geruite overhemden",
    "Denim shirts": "Spijkeroverhemden",
    "Plain shirts": "Effen overhemden",
    "Print shirts": "Overhemden met print",
    "Striped shirts": "Gestreepte overhemden",
    "Other shirts": "Overige",
    "T-shirts": "T-shirts",
    "Plain t-shirts": "Effen shirts",
    "Print t-shirts": "Print shirts",
    "Striped t-shirts": "Gestreepte shirts",
    "Polo shirts": "Poloshirts",
    "Long-sleeved t-shirts": "Shirts met lange mouwen",
    "Other t-shirts": "Overige",
    "Vests & sleeveless t-shirts": "Mouwloos shirt",
    "Suits & blazers": "Pakken & Blazers",
    "Blazers": "Blazers",
    "Suit trousers": "Pantalons",
    "Waistcoats": "Gilets",
    "Suit sets": "Pakken & kostuums",
    "Wedding suits": "Trouwpakken",
    "Other suits & blazers": "Overige",
    "Jumpers & sweaters": "Truien & capuchontruien",
    "Jumpers": "Sweaters",
    "Hoodies & sweaters": "Pullovers & hoodies",
    "Zip-through hoodies & sweaters": "Hoodies met ritssluiting",
    "Cardigans": "Vesten",
    "Crew neck jumpers": "Truien met ronde hals",
    "V-neck jumpers": "V-hals truien",
    "Turtleneck jumpers": "Coltruien",
    "Long jumpers": "Lange truien",
    "Chunky knit jumpers": "Gebreide truien",
    "Sleeveless jumpers": "Bodywarmers",
    "Other jumpers & sweaters": "Overige",
    "Trousers": "Broeken",
    "Chinos": "Chino's",
    "Joggers & sweatpants": "Joggingbroeken",
    "Skinny trousers": "Skinny broeken",
    "Cropped trousers": "Capri broeken",
    "Tailored trousers": "Getailleerde broeken",
    "Wide-legged trousers": "Broeken met wijde pijpen",
    "Other trousers": "Overige",
    "Shorts": "Korte broeken",
    "Cargo shorts": "Cargo shorts",
    "Chino shorts": "Chino shorts",
    "Denim shorts": "Korte spijkerbroeken",
    "Other shorts": "Overige korte broeken",
    "Socks & underwear": "Ondergoed & Sokken",
    "Underwear": "Ondergoed",
    "Socks": "Sokken",
    "Dressing gowns": "Badjassen",
    "Other socks & underwear": "Overige",
    "Sleepwear": "Slaapkleding",
    "One-piece pajamas": "One-piece pyjama's",
    "Pyjama bottoms": "Pyjamabroeken",
    "Pyjama sets": "Pyjamasets",
    "Pyjama tops": "Pyjamashirts",
    "Swimwear": "Zwemkleding",
    "Activewear": "Sportkleding & accessoires",
    "Tracksuits": "Trainingspakken",
    "Team shirts & jerseys": "Teamshirts",
    "Pullovers & sweaters": "Pullovers & truien",
    "Sports accessories": "Accessoires",
    "Glasses": "Brillen",
    "Gloves": "Handschoenen",
    "Hats": "Hoeden",
    "Scarves": "Sjaals",
    "Wristbands": "Zweetbandjes",
    "Other activewear": "Overige",
    "Costumes & special outfits": "Kostuums & Speciale outfits",
    "Other clothing": "Overige",
    
    // ===== HEREN SCHOENEN =====
    "Shoes": "Schoenen",
    "Boat shoes, loafers & mocassins": "Bootschoenen, loafers & mocassins",
    "Boots": "Boots",
    "Chelsea & slip-on boots": "Chelsea boots & veterloze laarzen",
    "Desert & lace-up boots": "Desert boots & veterlaarzen",
    "Snow boots": "Snowboots",
    "Wellington boots": "Regenlaarzen",
    "Work boots": "Werkschoenen",
    "Clogs & mules": "Klompen & Muiltjes",
    "Espadrilles": "Espadrilles",
    "Flip-flops & slides": "Slippers",
    "Formal shoes": "Nette schoenen",
    "Sandals": "Sandalen",
    "Slippers": "Sloffen",
    "Sports shoes": "Sportschoenen",
    "Basketball shoes": "Basketbalschoenen",
    "Climbing & bouldering shoes": "Klim- & boulderschoenen",
    "Cycling shoes": "Fietsschoenen",
    "Dance shoes": "Dansschoenen",
    "Football boots": "Voetbalschoenen",
    "Golf shoes": "Golfschoenen",
    "Hiking boots & shoes": "Wandelschoenen",
    "Ice skates": "Schaatsen",
    "Indoor football shoes": "Zaalvoetbalschoenen",
    "Indoor training shoes": "Gymschoenen",
    "Motorcycle boots": "Motorlaarzen",
    "Rollerskates & inline skates": "Rolschaatsen & skates",
    "Running shoes": "Hardloopschoenen",
    "Ski boots": "Skischoenen",
    "Snowboard boots": "Snowboardschoenen",
    "Swimming & water shoes": "Zwem- & waterschoenen",
    "Tennis shoes": "Tennisschoenen",
    "Trainers": "Sneakers",
    
    // ===== HEREN ACCESSOIRES =====
    "Accessories": "Accessoires",
    "Bags & backpacks": "Tassen & rugzakken",
    "Backpacks": "Rugzakken",
    "Briefcases": "Aktetassen",
    "Bum bags": "Heuptassen",
    "Garment bags": "Kledingzakken",
    "Gym bags": "Sporttassen",
    "Holdalls & duffle bags": "Reis- & Duffeltassen",
    "Luggage & suitcases": "Koffers",
    "Satchels & messenger bags": "Satchels- & Messengertassen",
    "Shoulder bags": "Schoudertassen",
    "Wallets": "Portemonnees",
    "Bandanas & headscarves": "Bandana's & hoofddoeken",
    "Belts": "Riemen",
    "Braces & suspenders": "Bretels",
    "Handkerchiefs": "Zakdoeken",
    "Hats & caps": "Hoofddeksels",
    "Balaclavas": "Bivakmutsen",
    "Beanies": "Beanies",
    "Caps": "Petten",
    "Jewellery": "Sieraden",
    "Bracelets": "Armbanden",
    "Charms & pendants": "Bedels & hangers",
    "Cufflinks": "Manchetknopen",
    "Earrings": "Oorbellen",
    "Necklaces": "Halskettingen",
    "Rings": "Ringen",
    "Other jewellery": "Overige",
    "Pocket squares": "Pochetten",
    "Scarves & shawls": "Halsdoeken & Sjaals",
    "Sunglasses": "Zonnebrillen",
    "Ties & bowties": "Stropdassen & Strikken",
    "Watches": "Horloges",
    "Other accessories": "Overige",
    
    // ===== HEREN VERZORGING =====
    "Grooming": "Verzorging",
    "Facial care": "Gezichtsverzorging",
    "Tools & accessories": "Verzorgingsapparaten",
    "Shaving tools": "Scheeraccessoires",
    "Grooming tools": "Verzorgingsapparaten",
    "Other tools": "Andere verzorgingsapparaten",
    "Hair care": "Haarverzorging",
    "Body care": "Lichaamsverzorging",
    "Hand & nail care": "Hand- & nagelverzorging",
    "Aftershave & cologne": "Parfums",
    "Make-up": "Make-up",
    "Grooming kits": "Verzorgingssetjes",
    "Other grooming items": "Overige verzorgingsproducten",
    
    // ===== ELEKTRONICA =====
    "Video games & consoles": "Videogames & consoles",
    "Consoles": "Consoles",
    "Games": "Games",
    "Controllers": "Controllers",
    "Gaming headsets": "Gaming headsets",
    "Simulators": "Simulators",
    "Virtual reality": "Virtual reality",
    "VR headsets": "VR-headsets",
    "VR accessories": "VR-accessoires",
    "VR device parts": "Onderdelen van VR-apparaten",
    "Cases": "Hoesjes",
    "Gaming holders & stands": "Gaming houders & standaards",
    "Gaming chargers & charging docks": "Gaming opladers & oplaadstations",
    "Game strategy guides": "Game strategie guides",
    "Other accessories": "Overige accessoires",
    
    "Computers & accessories": "Computers & accessoires",
    "Laptops": "Laptops",
    "Desktop computers": "Desktop computers",
    "Computer parts & components": "Computeronderdelen & componenten",
    "Computer cases": "Computerbehuizingen",
    "CPUs & processors": "CPU's & processors",
    "Motherboards": "Moederborden",
    "Motherboard & CPU combos": "Moederbord- & CPU-combinaties",
    "Graphics cards": "Grafische kaarten",
    "RAM units": "RAM-eenheden",
    "Computer cooling & fans": "Computerkoeling & ventilatoren",
    "Internal sound cards": "Interne geluidskaarten",
    "Video capture & TV tuner cards": "Video-opname- & TV-tunerkaarten",
    "Internal storage devices": "Interne opslagapparaten",
    "Computer power supplies": "Computervoedingen",
    "Computer repair tools": "Computer reparatietools",
    "Laptop replacement parts": "Vervangende laptoponderdelen",
    "Other components & parts": "Overige componenten & onderdelen",
    "Blank media": "Opslagmedia",
    "USB flash drives": "USB-sticks",
    "External hard drives": "Externe harde schijven",
    "CD, DVD & Blu-ray discs": "CD, DVD & Blu-ray discs",
    "Floppy discs": "Floppy disk",
    "Zip & jaz drives": "Zip & jaz drives",
    "Media cases & sleeves": "Opberging voor media",
    "Other blank media": "Overige blanco media",
    "Computer accessories": "Computeraccessoires",
    "Hard drive duplicators": "Harde schijf duplicators",
    "Memory card adaptors": "Geheugenkaartadapters",
    "Memory card readers": "Geheugenkaartlezers",
    "Other computer accessories": "Overige computeraccessoires",
    "Laptop accessories": "Accessoires voor laptops",
    "Laptop bags & cases": "Laptoptassen & hoesjes",
    "Laptop stands": "Laptopsteun",
    "Laptop chargers": "Laptop opladers",
    "Laptop privacy filters": "Privacyfilters voor laptops",
    "Laptop cooling pads & fans": "Laptop cool pads & ventilatoren",
    "Laptop security locks": "Sloten voor laptopbeveiliging",
    "Laptop camera covers": "Webcambedekking voor laptops",
    "Docking stations & USB hubs": "Docking stations & USB-hubs",
    "Keyboards & accessories": "Toetsenborden & accessoires",
    "Keyboards": "Toetsenborden",
    "Keyboard switches": "Toetsenbordschakelaars",
    "Keyboard keycaps": "Toetsenbordtoetsen",
    "Keyboard stickers": "Stickers voor toetsenbord",
    "Keyboard covers": "Toetsenbordhoezen",
    "Mice": "Muizen",
    "Mouse pads": "Muismatten",
    "Monitors & accessories": "Monitoren & accessoires",
    "Monitors": "Monitors",
    "Monitor stands": "Schermstandaards",
    "Monitor arms": "Schermbeugel",
    "Monitor privacy filters": "Privacyfilters scherm",
    "Monitor covers": "Scherm cover",
    "Computer speakers": "Computer luidsprekers",
    "Computer microphones": "Computer microfoons",
    "Webcams": "Webcams",
    "Networking devices": "Netwerkapparaten",
    "Routers": "Routers",
    "Mesh systems": "Mesh systemen",
    "Network repeaters": "Netwerk repeaters",
    "Modems": "Modems",
    "Mobile hotspots": "Mobiele hotspots",
    "Network adaptors": "Netwerkadapters",
    "Satellite internet receivers": "Satelliet internet ontvangers",
    "Printers & accessories": "Printers & accessoires",
    "Inkjet printers": "Inkjetprinters",
    "Laser printers": "Laserprinters",
    "Photo printers": "Fotoprinters",
    "Label printers": "Labelprinters",
    "Thermal printers": "Thermische printers",
    "Commercial multifunction printers": "Commerciële multifunctionele printers",
    "Printer ink cartridges": "Printerinktcartridges",
    "Printer toner": "Toner",
    "Ink ribbons": "Inktlinten",
    "Printer parts": "Printeronderdelen",
    "Scanners & accessories": "Scanners & accessoires",
    "Scanners": "Scanners",
    "Scanner accessories": "Scanneraccessoires",
    "Touch & stylus pads": "Touch & stylus pads",
    
    "Mobile phones & communication": "Mobiele telefoons & communicatie",
    "Mobile phones": "Mobiele telefoons",
    "Mobile phone parts & accessories": "Onderdelen & accessoires voor mobiele telefoons",
    "Mobile phone cases": "Mobiele telefoonhoesjes",
    "Mobile phone screen protectors": "Schermbeschermers mobiele telefoons",
    "Mobile phone grips": "Mobiele telefoon grips",
    "Selfie sticks": "Selfiesticks",
    "Mounts, stands & tripods": "Mobiele telefoon houders & standaards",
    "Mobile phone flashes & lights": "Mobiele telefoon flitsers & lichten",
    "Mobile phone charms": "Mobiele telefoon hangers",
    "Mobile phone parts": "Mobiele telefoononderdelen",
    "Other mobile phone accessories": "Overige mobiele telefoonaccessoires",
    "Landline phones": "Vaste telefoons",
    "Fax machines": "Faxmachines",
    "Radio communication": "Radiocommunicatie",
    "Shortwave radios": "Kortegolf radio's",
    "Walkie talkies": "Walkietalkies",
    "Dummy mobile phones": "Dummy mobiele telefoons",
    
    "Audio, headphones & Hi-Fi": "Audio, hoofdtelefoons & hi-fi",
    "Headphones & earbuds": "Koptelefoons & oordopjes",
    "Handheld music players": "Handheld muziekspelers",
    "MP3 players": "MP3-spelers",
    "Handheld CD players": "Handheld CD-spelers",
    "Handheld cassette players": "Handheld cassettespelers",
    "Handheld MiniDisc players": "Handheld MiniDisc spelers",
    "Portable radios": "Draagbare radio's",
    "Portable speakers": "Draagbare luidsprekers",
    "Smart speakers": "Slimme speakers",
    "Home audio systems": "Home audio systemen",
    "Hi-Fi & shelf stereo systems": "Hi-fi & plank stereo systemen",
    "Speakers": "Luidsprekers",
    "Subwoofers": "Subwoofers",
    "Soundbars": "Soundbars",
    "Equalisers": "Equalizers",
    "Amplifiers & pre-amplifiers": "Versterkers & voorversterkers",
    "Receivers": "Ontvangers",
    "Turntables": "Draaitafels",
    "CD players & recorders": "CD-spelers & recorders",
    "Cassette & tape players": "Cassette- & tape spelers",
    "Radio tuners": "Radio tuners",
    "MiniDisc players & recorders": "MiniDisc-spelers & recorders",
    "Other home audio devices": "Overige home audio-apparaten",
    "Audio device accessories": "Accessoires voor audioapparaten",
    "Headphone stands": "Hoofdtelefoonstandaards",
    "Headphone earpads": "Hoofdtelefoon kussentje",
    "Earbud tips": "Eartips",
    "Turntable needles": "Draaitafelnaalden",
    "Turntable slipmats": "Draaitafel slipmats",
    "Speaker & subwoofer isolation pads": "Speaker- & subwooferisolatiepads",
    "Other audio accessories": "Overige audioaccessoires",
    "Home audio & Hi-Fi parts": "Home audio- & hi-fi-onderdelen",
    
    "Cameras & accessories": "Camera's & accessoires",
    "Cameras": "Camera's",
    "Action cameras": "Actiecamera's",
    "Digital cameras": "Digitale camera's",
    "Film cameras": "Filmcamera's",
    "Instant cameras": "Instant camera's",
    "Video cameras": "Videocamera's",
    "Other cameras": "Overige camera's",
    "Lenses": "Lenzen",
    "Flashes": "Flitsers",
    "Memory cards": "Geheugenkaarten",
    "Tripods": "Statieven",
    "Stabilisers & mounts": "Stabilisatoren & steunen",
    "Darkroom equipment": "Apparatuur voor donkere kamers",
    "Darkroom processing equipment": "Donkere kamer verwerkingsapparatuur",
    "Darkroom safelights": "Donkere kamer safelights",
    "Enlargement lenses & equipment": "Vergrotingslenzen & apparatuur",
    "Photographic paper": "Fotopapier",
    "Other darkroom equipment": "Overige donkere kamer apparatuur",
    "Studio equipment": "Studio-apparatuur",
    "Studio & photobooth props": "Studio- & fotobooth props",
    "Studio backdrops": "Studio backdrops",
    "Studio lighting": "Studioverlichting",
    "Camera drones & accessories": "Camera drones & accessoires",
    "Camera drones": "Camera drones",
    "Drone bags": "Drone tassen",
    "Drone parts": "Drone onderdelen",
    "Camera cases & bags": "Camerahoesjes & tassen",
    "Camera straps": "Camera riemen",
    "Film": "Film",
    "Lens accessories": "Lens accessoires",
    "Flash accessories": "Flitsaccessoires",
    "Camera repair kits": "Reparatiekits camera",
    "Other camera accessories": "Overige camera-accessoires",
    "Camera replacement parts": "Vervangende cameraonderdelen",
    "Other photography equipment": "Overige fotoapparatuur",
    
    "Tablets, e-readers & accessories": "Tablets, e-readers & accessoires",
    "Tablets": "Tablets",
    "e-Readers": "e-Readers",
    "Digital notepads": "Digitale notitieblokken",
    "PDAs": "PDAs",
    "Tablet cases & folios": "Tablet hoesjes & folies",
    "e-Reader cases & screen protectors": "e-Reader hoesjes & schermbeschermers",
    "Tablet keyboards": "Tablet toetsenborden",
    "Tablet stands & mounts": "Tablethouders",
    "Styluses": "Stylussen",
    "Tablet & e-reader parts": "Tablet & e-reader onderdelen",
    
    "TV & home cinema": "TV & home cinema",
    "Televisions": "Televisies",
    "Projectors": "Projectors",
    "Streaming devices": "Streaming apparaten",
    "Television antennas": "Televisie antennes",
    "Satellite dishes": "Satellietschotels",
    "Video decoders": "Video decoders",
    "Television receivers": "Televisie ontvangers",
    "Home cinema systems": "Home cinema systemen",
    "Blu-ray players": "Blu-ray spelers",
    "DVD players": "DVD spelers",
    "VCRs": "VCRs",
    "Other video playback devices": "Overige apparaten om video's af te spelen",
    "HD DVD players": "HD DVD spelers",
    "LaserDisc players": "LaserDisc spelers",
    "Video 2000 players": "Video 2000 spelers",
    "Betamax players": "Betamax spelers",
    "TV & home cinema accessories": "TV & home cinema accessoires",
    "Projector mounts & stands": "Projectorsteunen & -standaards",
    "Projector screens": "Projectorschermen",
    "Remote controls": "Afstandsbedieningen",
    
    "Beauty & personal care electronics": "Beauty & persoonlijke verzorging elektronica",
    "Hair styling tools": "Haarstylingstools",
    "Hair dryers": "Föhns",
    "Hair straighteners": "Stijltangen",
    "Curling irons": "Krultangen",
    "Other hair styling tools": "Overige haarstylingstools",
    "Beauty tools": "Beautytools",
    "LED masks": "LED-maskers",
    "Electric facial cleansers & scrubs": "Elektrische gezichtsreinigers en -scrubs",
    "Beauty pens": "Beautypennen",
    "Shaving & hair removal": "Scheren & haarverwijdering",
    "IPL epilators": "IPL-epilators",
    "Rotary epilators": "Epilators met een draaischrijf",
    "Trimmers": "Trimmers",
    "Nose hair trimmers": "Neushaartrimmers",
    "Electric shavers": "Elektrische scheerapparaten",
    "Massage tools": "Massagetools",
    "Facial massagers": "Gezichtsmassagers",
    "Massage guns": "Massagepistolen",
    "Massage belts": "Massageriemen",
    "Infrared massagers": "Infraroodmassagers",
    "Electric dental & oral care": "Elektrische tand- & mondverzorging",
    "Electric toothbrushes": "Elektrische tandenborstels",
    "Water flossers": "Waterflosapparaten",
    "Electric toothbrush & water flosser parts": "Onderdelen voor elektrische tandenborstel & waterflosapparaten",
    "Nail care tools": "Nagelverzorgingstools",
    "Manicure & pedicure spas": "Manicure & pedicure spa's",
    "Nail dryers": "Nageldrogers",
    "UV nail lamps": "UV-lampen voor nagellak",
    "Scales": "Weegschalen",
    
    "Wearables": "Wearables",
    "Smartwatches": "Smartwatches",
    "Fitness trackers": "Fitnesstrackers",
    "Smart glasses": "Smart glasses",
    "Smart rings": "Smart rings",
    "Replacement bands": "Bandjes",
    "Smartwatch cases": "Smartwatch hoesjes",
    
    "Other devices & accessories": "Overige apparaten & accessoires",
    "3D printing & scanning": "3D printen & scannen",
    "3D printers": "3D-printers",
    "3D scanners": "3D scanners",
    "3D pens": "3D pennen",
    "3D printer filament": "3D printer filament",
    "3D printer parts": "3D-printeronderdelen",
    "GPS & satellite navigation devices": "GPS- & satellietnavigatieapparaten",
    "Item finders": "Tracking-apparatuur",
    "Luggage scales": "Reisweegschaal",
    "Adaptors": "Adapters",
    "Cables": "Kabels",
    "Chargers": "Opladers",
    "Power banks": "Powerbanks",
    "Surge protectors & power strips": "Overspanningsbeveiligers & stekkerdozen",
    "Batteries & power supplies": "Batterijen & voedingen",
    "Single-use batteries": "Batterijen voor eenmalig gebruik",
    "Rechargeable batteries": "Oplaadbare batterijen",
    "Battery chargers": "Batterijladers",
    "Power distribution units": "Stroomverdelers",
    "Power inverters": "Omvormers",
    
    // ===== HOBBY'S & VERZAMELEN =====
    "Trading cards": "Ruilkaarten",
    "Single trading cards": "Losse ruilkaarten",
    "Booster packs": "Boosterpacks",
    "Booster boxes": "Boosterboxes",
    "Card decks": "Kaartendecks",
    "Trading card sets": "Ruilkaartensets",
    "Uncut card sheets": "Ongesneden vellen ruilkaarten",
    "Board games": "Bordspellen",
    "Puzzles": "Puzzels",
    "Tabletop & miniature gaming": "Tafel- & miniatuurspellen",
    "Memorabilia": "Memorabilia",
    "Sports memorabilia": "Sportmemorabilia",
    "Music memorabilia": "Muziekmemorabilia",
    "Film & TV memorabilia": "Film- & tv-memorabilia",
    "Other memorabilia": "Overige memorabilia",
    "Coins & banknotes": "Munten & bankbiljetten",
    "Banknotes": "Bankbiljetten",
    "Coins": "Munten",
    "Sets": "Sets",
    "Medals & tokens": "Medailles & penningen",
    "Share certificates": "Aandeelbewijzen",
    "Stamps": "Postzegels",
    "Individual stamps": "Losse postzegels",
    "Stamp sets & lots": "Postzegelsets & -partijen",
    "First day covers": "Eerstedagenveloppen",
    "Stamp catalogues & guides": "Postzegelcatalogi & -gidsen",
    "Stamp tools": "Postzegelgereedschap",
    "Postcards": "Ansichtkaarten",
    
    "Musical instruments & gear": "Muziekinstrumenten & -apparatuur",
    "Guitars & bass guitars": "Gitaren & basgitaren",
    "Acoustic guitars": "Akoestische gitaren",
    "Classical guitars": "Klassieke gitaren",
    "Electric guitars": "Elektrische gitaren",
    "Electro-acoustic guitars": "Electro-akoestische gitaren",
    "Bass guitars": "Basgitaren",
    "Other guitars": "Overige gitaren",
    "Guitar accessories & parts": "Gitaartoebehoren & -onderdelen",
    "Bass guitar bags & cases": "Basgitaartassen & -koffers",
    "Bass guitar cases": "Basgitaarkoffers",
    "Bass guitar strings": "Basgitaarsnaren",
    "Capos": "Capo's",
    "Guitar & bass guitar stands & hangers": "(Bas)gitaarstandaarden & -hangers",
    "Guitar & bass guitar straps": "Gitaar- & basgitaarriemen",
    "Guitar bags & cases": "Gitaartassen & -koffers",
    "Guitar cases": "Gitaarkoffers",
    "Guitar maintenance & cleaning": "Gitaaronderhoud & -reiniging",
    "Guitar mutes": "Gitaardempers",
    "Guitar parts": "Gitaaronderdelen",
    "Guitar picks": "Gitaarplectrums",
    "Guitar slides": "Gitaarslides",
    "Guitar strings": "Gitaarsnaren",
    "Other guitar accessories": "Overige gitaartoebehoren",
    "Amps & pedals": "Versterkers & pedalen",
    "Bass amps": "Basversterkers",
    "Guitar amps": "Gitaarversterkers",
    "Drum amps": "Drumversterkers",
    "Keyboard amps": "Keyboardversterkers",
    "Amp modelers & effects processors": "Modelers & effectenprocessors voor versterkers",
    "Amp accessories & parts": "Versterkertoebehoren & -onderdelen",
    "Amp covers & bags": "Versterkerhoezen & -tassen",
    "Amp cases": "Versterkerhoezen",
    "Amp footswitches": "Voetschakelaars voor versterkers",
    "Amp replacement parts": "Reserveonderdelen voor versterkers",
    "Amp stands": "Versterkerstandaards",
    "Instrument cables": "Instrumentkabels",
    "Other amp accessories": "Overige versterkertoebehoren",
    "Pedals": "Pedalen",
    "Pedal accessories & parts": "Pedaaltoebehoren & -onderdelen",
    "Pedal bags & cases": "Pedaaltassen & -hoezen",
    "Pedal power supplies": "Pedaalvoedingen",
    "Pedalboards": "Pedalboards",
    "Other pedal accessories & parts": "Overige pedaaltoebehoren & -onderdelen",
    "Drums & percussion": "Drums & percussie",
    "Pianos, keyboards & synthesizers": "Piano's, keyboards & synthesizers",
    "String instruments": "Snaarinstrumenten",
    "Wind instruments": "Blaasinstrumenten",
    "Studio & live sound gear": "Studio- & live-geluidsapparatuur",
    "DJ gear": "DJ-apparatuur",
    "Karaoke gear": "Karaoke-apparatuur",
    "Music accessories": "Muziektoebehoren",
    
    "Arts & crafts": "Knutselen",
    "Sewing, knitting & needlecraft": "Naaien, breien en handwerken",
    "Painting": "Schilderen",
    "Drawing & sketching": "Tekenen & schetsen",
    "Calligraphy": "Kalligrafie",
    "Jewellery making": "Sieraden maken",
    "Papercraft": "Papierkunst",
    "Die cutting": "Stansen",
    "Candle making": "Kaarsen maken",
    "Pottery & sculpting": "Boetseren & keramiek",
    "Crafting supplies": "Knutselspullen",
    "Crafting tools": "Knutselgereedschap",
    
    "Collectables storage": "Opberging voor verzamelobjecten",
    "Albums & binders": "Albums & ordners",
    "Storage boxes": "Opbergdozen voor verzamelobjecten",
    "Card sleeves": "Kaarthoezen",
    "Screwdown card holders": "Kaarthoezen met schroef",
    "Deck boxes": "Deckboxes",
    "Album & binder dividers": "Album- & ordnerverdelers",
    "Album & binder refills": "Insteekhoezen voor albums & ordners",
    "Puzzle mats": "Puzzelmatten",
    "Other collectables storage": "Overige opberging voor verzamelobjecten",
    
    "Gaming accessories": "Gameaccessoires",
    "Dice": "Dobbelstenen",
    "Gaming stones & tokens": "Spelstenen & tokens",
    "Gaming playmats": "Gamespeelmatten",
    "Other gaming accessories": "Overige gamingaccessoires",
    
    // ===== SPORT =====
    "Cycling": "Fietsen",
    "Bikes": "Fietsen",
    "City bikes": "Stadsfietsen",
    "Road bikes": "Racefietsen",
    "Aero & triathlon bikes": "Aero- & triatlonfietsen",
    "Gravel bikes": "Gravelbikes",
    "Touring bikes": "Toerfietsen",
    "Mountain bikes": "Mountainbikes",
    "Hybrid bikes": "Hybridefietsen",
    "Folding bikes": "Vouwfietsen",
    "BMX": "BMX",
    "Cargo bikes": "Bakfietsen",
    "Other bikes": "Overige fietsen",
    "Electric bikes": "Elektrische fietsen",
    "Electric road bikes": "Elektrische racefietsen",
    "Electric mountain bikes": "Elektrische mountainbikes",
    "Electric city bikes": "Elektrische stadsfietsen",
    "Electric cargo bikes": "Elektrische bakfietsen",
    "Other electric bikes": "Overige elektrische fietsen",
    "Kids' bikes": "Kinderfietsen",
    "Balance bikes": "Loopfietsen",
    "Tricycles": "Driewielers",
    "Bike helmets": "Fietshelmen",
    "Bike accessories & tools": "Fietsaccessoires & -gereedschap",
    "Bike baskets": "Fietsmanden",
    "Bike bells & horns": "Fietsbellen & -toeters",
    "Bike mudguards": "Fietsspatborden",
    "Bike lights": "Fietsverlichting",
    "Bike locks": "Fietssloten",
    "Bike water bottles": "Fietsbidons",
    "Water bottle holders": "Bidonhouders",
    "Bike pumps": "Fietspompen",
    "Bike kickstands": "Fietsstandaarden",
    "Bike bags": "Fietstassen",
    "Bike tools": "Fietsgereedschap",
    "Bike racks & wall mounts": "Fietsenrekken & ophangbeugels",
    "Bike rear racks": "Bagagedragers",
    "Bike carriers for cars": "Fietsendragers auto",
    "Bike cases & travel bags": "Fietskoffers & -transporttassen",
    "Other bike accessories": "Overige fietsaccessoires",
    "Turbo trainers": "Hometrainers",
    "Bike trailers": "Fietskarren",
    "Bike child seats": "Fietsstoeltjes",
    "Bike parts": "Fietsonderdelen",
    "Bottom brackets": "Trapas",
    "Brakes": "Remmen",
    "Cassettes": "Cassettes",
    "Chainrings": "Kettingbladen",
    "Chains": "Kettingen",
    "Cranksets": "Crankstellen",
    "Forks": "Voorvorken",
    "Derailleurs": "Derailleurs",
    "Grips": "Handvatten",
    "Handlebars": "Sturen",
    "Headsets": "Balhoofdstellen",
    "Pedals": "Pedalen",
    "Saddles": "Zadels",
    "Seatposts": "Zadelpennen",
    "Shifters": "Shifters",
    "Shock absorbers": "Schokdempers",
    "Tyres": "Banden",
    "Inner tubes": "Binnenbanden",
    "Wheels": "Wielen",
    "Other bike parts": "Overige fietsonderdelen",
    
    "Fitness, running & yoga": "Fitness, hardlopen & yoga",
    "Fitness equipment": "Fitnessapparaten",
    "Strength training": "Krachttraining",
    "Running": "Hardlopen",
    "Yoga & pilates": "Yoga- & pilatesmateriaal",
    "Fitness accessories": "Fitnesspullen",
    "Water bottles": "Drinkflessen",
    
    "Outdoor sports": "Buitensporten",
    "Water sports": "Watersporten",
    "Team sports": "Teamsporten",
    "Racket sports": "Racketsporten",
    "Golf": "Golf",
    "Horse riding": "Paardensport",
    "Skateboards & scooters": "Skateboards & steps",
    "Boxing & martial arts": "Boksen & vechtsporten",
    "Recreational sports & games": "Recreatieve sporten & spelen",
    "Winter sports": "Wintersporten",

    // ===== DAMES (Women) - aanvullend =====
    "Capes & ponchos": "Capes & poncho's",
    "Faux fur coats": "Bontjassen",
    "Hoodies & sweatshirts": "Hoodies & sweaters",
    "Kimonos": "Kimono's",
    "Boleros": "Bolero's",
    "Other jumpers & sweaters": "Overige truien & sweaters",
    "Trouser suits": "Broekpakken",
    "Skirt suits": "Rokpakken",
    "Suit separates": "Losse pakdelen",
    "Mini dresses": "Mini-jurken",
    "Midi dresses": "Midi-jurken",
    "Long dresses": "Lange jurken",
    "Special occasion dresses": "Speciale gelegenheidsjurken",
    "Party & cocktail dresses": "Party- & cocktailjurken",
    "Wedding dresses": "Trouwjurken",
    "Prom dresses": "Gala jurken",
    "Evening dresses": "Avondjurken",
    "Backless dresses": "Open rug jurken",
    "Summer dresses": "Zomerjurken",
    "Winter dresses": "Winterjurken",
    "Formal & work dresses": "Zakelijke jurken",
    "Casual dresses": "Casual jurken",
    "Strapless dresses": "Strapless jurken",
    "Little black dresses": "Kleine zwarte jurkjes",
    "Denim dresses": "Spijkerjurken",
    "Other dresses": "Overige jurken",
    "Skirts": "Rokken",
    "Miniskirts": "Minirokken",
    "Knee-length skirts": "Knielengte rokken",
    "Midi skirts": "Midirokken",
    "Maxi skirts": "Maxi rokken",
    "Asymmetric skirts": "Asymmetrische rokken",
    "Skorts": "Skorts",
    "Blouses": "Blouses",
    "Camis": "Hemden met spaghettibandjes",
    "Vest tops & tank tops": "Topjes",
    "Tunics": "Tunieken",
    "Crop tops": "Crop tops",
    "Short sleeved tops": "Korte mouwen tops",
    "3/4-sleeved tops": "3/4 mouwen tops",
    "Long sleeved tops": "Lange mouwen tops",
    "Bodysuits": "Bodysuits",
    "Off-the-shoulder tops": "Off-shoulder tops",
    "Turtlenecks": "Coltruien",
    "Peplum tops": "Peplum tops",
    "Halter neck tops": "Halter tops",
    "Other tops & t-shirts": "Overige tops & t-shirts",
    "Boyfriend jeans": "Boyfriend jeans",
    "Cropped jeans": "Cropped jeans",
    "Flared jeans": "Flared jeans",
    "High waisted jeans": "High waisted jeans",
    "Straight jeans": "Straight jeans",
    "Other jeans": "Overige jeans",
    "Trousers & leggings": "Broeken & leggings",
    "Cropped trousers & chinos": "Cropped broeken & chino's",
    "Wide-leg trousers": "Wide leg broeken",
    "Straight-leg trousers": "Rechte broeken",
    "Leather trousers": "Leren broeken",
    "Leggings": "Leggings",
    "Harem pants": "Harembroeken",
    "Shorts & cropped trousers": "Shorts & cropped broeken",
    "Low-waisted shorts": "Low waist shorts",
    "High-waisted shorts": "High waist shorts",
    "Knee-length shorts": "Knielengte shorts",
    "Lace shorts": "Kanten shorts",
    "Leather shorts": "Leren shorts",
    "Other shorts & cropped trousers": "Overige shorts",
    "Jumpsuits & playsuits": "Jumpsuits & playsuits",
    "Jumpsuits": "Jumpsuits",
    "Playsuits": "Playsuits",
    "Other jumpsuits & playsuits": "Overige jumpsuits & playsuits",
    "One-pieces": "Badpakken",
    "Bikinis & tankinis": "Bikini's & tankini's",
    "Cover-ups & sarongs": "Strandkleding",
    "Other swimwear & beachwear": "Overige zwemkleding",
    "Lingerie & nightwear": "Lingerie & nachtkleding",
    "Bras": "BH's",
    "Panties": "Slipjes",
    "Shapewear": "Shapewear",
    "Nightwear": "Nachtkleding",
    "Tights & stockings": "Panty's & kousen",
    "Lingerie accessories": "Lingerie accessoires",
    "Other lingerie & nightwear": "Overige lingerie & nachtkleding",
    "Maternity clothes": "Zwangerschapskleding",
    "Maternity tops": "Zwangerschapstops",
    "Maternity dresses": "Zwangerschapsjurken",
    "Maternity skirts": "Zwangerschapsrokken",
    "Maternity trousers": "Zwangerschapsbroeken",
    "Maternity shorts": "Zwangerschapsshorts",
    "Maternity jumpsuits & playsuits": "Zwangerschaps jumpsuits",
    "Maternity jumpers & sweaters": "Zwangerschapstruien",
    "Maternity coats & jackets": "Zwangerschapsjassen",
    "Maternity swimwear & beachwear": "Zwangerschapszwemkleding",
    "Maternity underwear": "Zwangerschapsondergoed",
    "Maternity panties": "Zwangerschapsslipjes",
    "Maternity sleepwear": "Zwangerschapsnachtkleding",
    "Pregnancy & breastfeeding bras": "Zwangerschaps- & voedingsbh's",
    "Maternity activewear": "Zwangerschapssportkleding",
    "Sports bras": "Sport-BH's",
    "Sneakers": "Sneakers",
    "Heels": "Hakken",
    "Flats": "Platte schoenen",
    "Fragrance": "Parfum",
    
    // ===== KINDEREN (Kids) =====
    "Baby clothes": "Babykleding",
    "Girls' clothes": "Meisjeskleding",
    "Boys' clothes": "Jongenskleding",
    "Dresses": "Jurken",
    "Tops": "Tops",
    "School shoes": "Schoolschoenen",
    "Bags": "Tassen",
    "Toys": "Speelgoed",
    "Soft toys": "Knuffels",
    "Dolls": "Poppen",
    "Action figures": "Actiefiguren",
    "Building toys": "Bouwspeelgoed",
    "Outdoor toys": "Buitenspeelgoed",
    "Educational toys": "Educatief speelgoed",
    
    // ===== HOME =====
    "Furniture": "Meubels",
    "Chairs": "Stoelen",
    "Tables": "Tafels",
    "Storage": "Opbergen",
    "Beds": "Bedden",
    "Sofas": "Banken",
    "Decor": "Decoratie",
    "Wall art": "Wanddecoratie",
    "Mirrors": "Spiegels",
    "Candles": "Kaarsen",
    "Vases": "Vazen",
    "Rugs": "Vloerkleden",
    "Kitchen & dining": "Keuken & eten",
    "Cookware": "Kookgerei",
    "Tableware": "Servies",
    "Kitchen appliances": "Keukenapparaten",
    "Bedding": "Beddengoed",
    "Bed linen": "Beddengoed",
    "Pillows": "Kussens",
    "Blankets": "Dekens",
    "Garden": "Tuin",
    "Garden furniture": "Tuinmeubels",
    "Plants": "Planten",
    "Garden tools": "Tuingereedschap",
    
    // ===== ENTERTAINMENT =====
    "Books": "Boeken",
    "Fiction": "Fictie",
    "Non-fiction": "Non-fictie",
    "Children's books": "Kinderboeken",
    "Comics & graphic novels": "Strips & graphic novels",
    "Textbooks": "Studieboeken",
    "Music": "Muziek",
    "Vinyl records": "Vinylplaten",
    "CDs": "CD's",
    "Cassettes": "Cassettes",
    "Films & TV": "Films & TV",
    "DVDs": "DVD's",
    "Blu-rays": "Blu-rays",
    "Box sets": "Box sets",
    "Magazines": "Tijdschriften"
  }
};

// Helper function to translate category labels
function translateCategory(key, lang) {
  if (!lang) lang = window.i18n?.getCurrentLanguage?.() || 'nl';
  // Try exact match first
  if (CATEGORY_TRANSLATIONS[lang]?.[key]) {
    return CATEGORY_TRANSLATIONS[lang][key];
  }
  // Fallback to English
  if (CATEGORY_TRANSLATIONS['en']?.[key]) {
    return CATEGORY_TRANSLATIONS['en'][key];
  }
  // Return key as-is if no translation found
  return key;
}

// ============================================
// MULTI-LANGUAGE SYNONYM MAP - EXTENDED
// ============================================

const CATEGORY_SYNONYMS = {
  // Main categories
  "hobbies & collectables": ["hobby's & verzamelen", "hobbies", "collectables", "verzamelobjecten", "hobby"],
  "electronics": ["elektronica", "electronics", "tech"],
  "women": ["dames", "vrouwen", "women"],
  "men": ["heren", "mannen", "men"],
  "kids": ["kinderen", "kids", "children"],
  "home": ["huis", "wonen", "home", "living"],
  "entertainment": ["entertainment", "media"],
  "sports": ["sport", "sports", "fietsen", "cycling"],
  
  // Electronics subcategories
  "video games & consoles": ["videogames & consoles", "gaming", "games", "consoles"],
  "mobile phones & communication": ["mobiele telefoons", "telefoons", "phones", "mobile"],
  "tablets, e-readers & accessories": ["tablets", "e-readers", "e-book"],
  "tv & home cinema": ["tv", "televisie", "home cinema"],
  "audio, headphones & hi-fi": ["audio", "headphones", "koptelefoons", "hi-fi", "hifi"],
  "wearables": ["smartwatches", "fitness trackers", "wearables"],
  "cameras & accessories": ["camera's", "cameras", "fotografie"],
  "computers & accessories": ["computers", "laptops", "pc"],
  
  // Hobbies subcategories
  "trading cards": ["ruilkaarten", "trading cards", "tcg", "kaarten", "pokémon", "pokemon", "magic"],
  "musical instruments & gear": ["muziekinstrumenten", "musical instruments", "instruments", "gitaar", "guitar"],
  "arts & crafts": ["knutselen", "kunst & handwerk", "crafts"],
  "board games": ["bordspellen", "board games", "spellen"],
  "puzzles": ["puzzels", "puzzles"],
  "memorabilia": ["memorabilia", "verzamelobjecten"],
  "coins & banknotes": ["munten & bankbiljetten", "coins", "banknotes", "munten"],
  "stamps": ["postzegels", "stamps"],
  "postcards": ["ansichtkaarten", "postcards"],
  
  // Sports subcategories - EXPANDED for better matching
  "outdoor sports": ["buitensport", "outdoor sports", "outdoor", "buitensporten", "outdoor activiteiten"],
  "cycling": ["fietsen", "cycling", "bikes", "fiets", "wielrennen", "fietssport", "mountainbike", "racefiets", "e-bike", "bakfiets", "cargo bike"],
  
  // CRITICAL: Bikes / Bicycles mapping - AI often says "Bicycles" but Vinted uses "Bikes"
  "bikes": ["bicycles", "bicycle", "bike", "fietsen", "fiets", "gewone fietsen"],
  "cargo bikes": ["bakfietsen", "cargo bikes", "bakfiets", "cargo bike", "transportfiets"],
  "mountain bikes": ["mountainbikes", "mountain bikes", "mtb", "mountainbike"],
  "road bikes": ["racefietsen", "road bikes", "racefiets", "wielrenfiets"],
  "city bikes": ["stadsfietsen", "city bikes", "stadsfiets", "omafiets", "opafiets"],
  "electric bikes": ["e-bikes", "elektrische fietsen", "e-bike", "elektrische fiets", "e-fietsen"],
  "kids' bikes": ["kinderfietsen", "kinderfiets", "children's bikes", "child bike", "kinder fiets"],
  
  // Cycling subcategories - CORRECTED labels to match Vinted UI exactly
  "cycling accessories & tools": ["bike accessories", "fietsaccessoires", "cycling accessories", "fiets accessoires", "bike tools", "bike accessories & tools"],
  "indoor cycling trainers": ["turbo trainers", "home trainers", "fietstrainers", "rollers", "turbo trainer", "hometrainer"],
  "kids' bike seats": ["kinderzitjes", "fietszitjes", "bike child seats", "child seats", "kinderzitje", "bike child seat"],
  "bike helmets": ["fietshelmen", "fietshelm", "cycling helmets", "helmet", "fiets helm"],
  "bike trailers": ["fietskarren", "fietsaanhanger", "bike trailer", "kinderkar", "fietskar"],
  "bike parts": ["fietsonderdelen", "fiets onderdelen", "bicycle parts", "bike part"],
  
  "water sports": ["watersport", "water sports", "zwemmen", "duiken", "surfen", "zeilen", "kajak", "kano"],
  "winter sports": ["wintersport", "winter sports", "skiën", "snowboarden", "ski", "snowboard", "schaatsen"],
  "golf": ["golf", "golfen", "golfspullen"],
  "horse riding": ["paardrijden", "horse riding", "paardensport", "rijkleding"],
  "martial arts": ["vechtsporten", "martial arts", "vechtsport", "judo", "karate", "taekwondo", "boksen"],
  "team sports": ["teamsporten", "team sports", "voetbal", "hockey", "basketbal", "volleybal"],
  "fitness, running & yoga": ["fitness", "hardlopen", "yoga", "running", "gym", "sport"],
  "tennis & racket sports": ["tennis", "racket sports", "badminton", "squash", "padel"],
  
  // Clothing - Main
  "clothing": ["kleding", "clothes", "apparel", "womenswear", "women's clothing", "women\u2019s clothing"],
  
  // Dresses - CRITICAL for Vinted NL matching
  "dresses": ["jurken", "dress", "jurk", "dresses"],
  "long dresses": ["lange jurken", "maxi jurken", "maxi dresses", "maxi dress", "lange jurk"],
  "mini dresses": ["korte jurken", "mini jurken", "mini dress", "korte jurk"],
  "midi dresses": ["midi jurken", "midi dress", "midi jurk"],
  "casual dresses": ["casual jurken", "casual dress", "casual jurk"],
  "party dresses": ["feestjurken", "party dress", "feestjurk", "avondjurken"],
  "work dresses": ["werkjurken", "work dress", "zakelijke jurken"],
  
  // Other clothing
  "jeans": ["spijkerbroeken", "jeans", "denim"],
  "outerwear": ["buitenkleding", "jassen", "coats", "jackets", "jas", "coat", "jacket"],
  "tops & t-shirts": ["tops", "t-shirts", "shirts", "overhemden", "blouses", "blouse"],
  "tops": ["tops", "topjes", "hemden"],
  "blouses": ["blouses", "blouse", "bloesjes"],
  "t-shirts": ["t-shirts", "t-shirt", "tshirts", "tees"],
  "suits & blazers": ["pakken & blazers", "suits", "blazers", "pak", "blazer", "colbert"],
  "jumpers & sweaters": ["truien", "sweaters", "hoodies", "capuchontruien", "trui", "sweater", "hoodie"],
  "cardigans": ["vesten", "cardigans", "cardigan", "vest"],
  "trousers": ["broeken", "pants", "broek", "pantalon"],
  "shorts": ["korte broeken", "shorts", "korte broek"],
  "skirts": ["rokken", "skirts", "rok", "skirt"],
  "socks & underwear": ["ondergoed & sokken", "underwear", "sokken", "lingerie"],
  "sleepwear": ["slaapkleding", "pyjamas", "nachtkleding", "pyjama"],
  "swimwear": ["zwemkleding", "swimwear", "bikini", "badpak"],
  "activewear": ["sportkleding", "activewear", "gymkleding"],
  "jumpsuits": ["jumpsuits", "jumpsuit", "playsuits", "playsuit", "overall"],
  "bodysuits": ["bodysuits", "body", "bodies"],
  "co-ords": ["co-ords", "sets", "matching sets", "setjes"],
  
  // Shoes
  "shoes": ["schoenen", "shoes"],
  "trainers": ["sneakers", "trainers", "sportschoenen"],
  "boots": ["boots", "laarzen"],
  "formal shoes": ["nette schoenen", "dress shoes"],
  "sandals": ["sandalen", "sandals"],
  "slippers": ["sloffen", "pantoffels", "slippers"],
  
  // Accessories
  "accessories": ["accessoires", "accessories"],
  "bags & backpacks": ["tassen & rugzakken", "bags", "backpacks", "rugzakken"],
  "belts": ["riemen", "belts"],
  "hats & caps": ["hoofddeksels", "hoeden & petten", "hats", "caps"],
  "jewellery": ["sieraden", "jewelry"],
  "watches": ["horloges", "watches"],
  "sunglasses": ["zonnebrillen", "sunglasses"],
  
  // Grooming
  "grooming": ["verzorging", "grooming"],
  "facial care": ["gezichtsverzorging", "facial care"],
  "hair care": ["haarverzorging", "hair care"],
  "body care": ["lichaamsverzorging", "body care"]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1, str2) {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  const words1 = s1.split(' ').filter(w => w.length > 2);
  const words2 = s2.split(' ').filter(w => w.length > 2);
  const common = words1.filter(w => words2.some(w2 => w.includes(w2) || w2.includes(w)));
  
  return common.length / Math.max(words1.length, words2.length, 1);
}

function expandSynonyms(term) {
  const normalized = normalizeText(term);
  const synonyms = new Set([term, normalized]);
  
  for (const [key, values] of Object.entries(CATEGORY_SYNONYMS)) {
    const allVariants = [key, ...values].map(normalizeText);
    if (allVariants.some(v => v.includes(normalized) || normalized.includes(v))) {
      synonyms.add(key);
      values.forEach(v => synonyms.add(v));
    }
  }
  
  return Array.from(synonyms);
}

// ============================================
// CATEGORY MATCHING
// ============================================

function matchAICategoryToVinted(aiCategory) {
  if (!aiCategory) return aiCategory;
  const levels = aiCategory.split(/[>\/]/).map(s => s.trim()).filter(s => s.length > 0);
  return levels.join(' > ');
}

function flattenCategories(obj, path = [], results = []) {
  for (const [key, value] of Object.entries(obj)) {
    const newPath = [...path, key];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        results.push(newPath.join(' > '));
      } else {
        value.forEach(item => results.push([...newPath, item].join(' > ')));
      }
    } else if (typeof value === 'object') {
      flattenCategories(value, newPath, results);
    }
  }
  return results;
}

const VINTED_CATEGORY_PATHS = flattenCategories(VINTED_CATEGORIES);

// ============================================
// CATEGORY CORRECTION STORAGE
// ============================================

async function saveCategoryCorrection(aiPath, userSelectedPath) {
  if (!aiPath || !userSelectedPath) return;
  try {
    const result = await chrome.storage.local.get(['categoryCorrections']);
    const corrections = result.categoryCorrections || {};
    corrections[normalizeText(aiPath)] = userSelectedPath;
    await chrome.storage.local.set({ categoryCorrections: corrections });
  } catch (e) {
    console.error('Failed to save category correction:', e);
  }
}

async function getCategoryCorrection(aiPath) {
  if (!aiPath) return null;
  try {
    const result = await chrome.storage.local.get(['categoryCorrections']);
    const corrections = result.categoryCorrections || {};
    return corrections[normalizeText(aiPath)] || null;
  } catch (e) {
    console.error('Failed to get category correction:', e);
    return null;
  }
}

// ============================================
// EXPORTS
// ============================================

// Export to window for use in popup.js
if (typeof window !== 'undefined') {
  window.VINTED_CATEGORIES = VINTED_CATEGORIES;
  window.VINTED_CATEGORY_ORDER = VINTED_CATEGORY_ORDER;
  window.VINTED_CATEGORY_PATHS = VINTED_CATEGORY_PATHS;
  window.CATEGORY_TRANSLATIONS = CATEGORY_TRANSLATIONS;
  window.CATEGORY_SYNONYMS = CATEGORY_SYNONYMS;
  window.translateCategory = translateCategory;
  window.normalizeText = normalizeText;
  window.calculateSimilarity = calculateSimilarity;
  window.expandSynonyms = expandSynonyms;
  window.matchAICategoryToVinted = matchAICategoryToVinted;
  window.flattenCategories = flattenCategories;
  window.saveCategoryCorrection = saveCategoryCorrection;
  window.getCategoryCorrection = getCategoryCorrection;
}
