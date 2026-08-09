import { StoryLieItem, EraGuesserItem, RecipeItem, MotionTarget } from "./types";

export const SPOT_LIE_STORIES: StoryLieItem[] = [
  {
    id: "moon-landing-1969",
    title: "The Apollo 11 Moon Landing",
    topic: "History & Nostalgia",
    decade: "1960s",
    sentences: [
      "On July 20, 1969, Neil Armstrong and Buzz Aldrin landed the Apollo 11 Lunar Module on the Moon.",
      "Over 600 million people watched the broadcast live on high-definition color smart televisions in their living rooms.",
      "Neil Armstrong stepped onto the lunar surface and famously declared: 'That's one small step for man, one giant leap for mankind.'",
      "They spent over two hours outside the spacecraft collecting lunar soil and rocks to bring back to Earth."
    ],
    lieSentenceIndex: 1,
    lieKeyword: "high-definition color smart televisions",
    correctedKeyword: "grainy black-and-white television sets",
    explanation: "In 1969, households watched the grainy moonwalk broadcast on black-and-white CRT tube televisions. Smart color TVs were invented decades later!",
    funFact: "The original camera signal sent back from the moon had to be converted using a special optical converter before being broadcast to world audiences."
  },
  {
    id: "woodstock-1969",
    title: "The Summer of Woodstock",
    topic: "Music & Culture",
    decade: "1960s",
    sentences: [
      "In August 1969, nearly half a million music fans gathered on a dairy farm in Bethel, New York.",
      "Legendary artists like Jimi Hendrix, Janis Joplin, and Joan Baez performed across three peaceful days.",
      "Concertgoers used a mobile smartphone app to buy organic smoothies and scan their digital wristbands.",
      "Despite heavy rain and muddy conditions, the festival became a landmark symbol of peace and music."
    ],
    lieSentenceIndex: 2,
    lieKeyword: "mobile smartphone app",
    correctedKeyword: "paper tickets and cash concessions",
    explanation: "Woodstock took place in 1969, long before mobile smartphones or digital ticketing existed!",
    funFact: "Woodstock was originally planned as a paid event, but when overwhelming crowds arrived, organizers made it a free festival."
  },
  {
    id: "baking-apple-pie",
    title: "Grandma's Sunday Pie Baking",
    topic: "Baking & Family",
    sentences: [
      "Every autumn Sunday, Grandma gathered fresh Granny Smith apples from the backyard orchard.",
      "She rolled out butter pastry dough on the cool marble countertop until thin and flaky.",
      "Before baking, she set the air fryer to 375 degrees and scanned the pie crust with a microwave sensor.",
      "The kitchen filled with the warm, comforting scent of sweet cinnamon, nutmeg, and baked apples."
    ],
    lieSentenceIndex: 2,
    lieKeyword: "set the air fryer to 375 degrees and scanned the pie crust",
    correctedKeyword: "placed the pie in a heavy cast-iron oven",
    explanation: "Traditional Sunday pie baking relied on classic cast-iron or gas ovens, not modern counter countertop air fryers!",
    funFact: "Cinnamon was once prized as a luxury spice in ancient trade routes before becoming a household staple for pie."
  },
  {
    id: "route-66-trip",
    title: "A Classic Road Trip on Route 66",
    topic: "Travel & Nostalgia",
    decade: "1950s",
    sentences: [
      "In 1955, the Miller family packed their Chevy Bel Air for a dream vacation down historic Route 66.",
      "They stopped at retro neon diners for tall chocolate milkshakes and warm cherry pies.",
      "The driver typed the destination into their GPS satellite navigation dashboard to bypass traffic congestion.",
      "Along the way, they took scenic family photos next to giant roadside attractions and towering cacti."
    ],
    lieSentenceIndex: 2,
    lieKeyword: "typed the destination into their GPS satellite navigation dashboard",
    correctedKeyword: "unfolded a giant paper Rand McNally highway map",
    explanation: "Drivers in the 1950s navigated cross-country using printed paper road maps and highway road signs, not satellite GPS navigation!",
    funFact: "Route 66 stretched nearly 2,450 miles from Chicago, Illinois to Santa Monica, California."
  },
  {
    id: "cinema-1939",
    title: "The Golden Age of Hollywood Cinema",
    topic: "Movies & Hollywood",
    decade: "1930s",
    sentences: [
      "In 1939, audiences lined up outside grand movie palaces to watch 'The Wizard of Oz' on the big screen.",
      "As Dorothy stepped from sepia Kansas into Technicolor Oz, moviegoers gasped in awe at the vibrant colors.",
      "Viewers put on 3D virtual reality headsets connected to Wi-Fi to feel like they were flying with the monkeys.",
      "The film's iconic song 'Over the Rainbow' won the Academy Award for Best Original Song."
    ],
    lieSentenceIndex: 2,
    lieKeyword: "put on 3D virtual reality headsets connected to Wi-Fi",
    correctedKeyword: "sat mesmerized in velvet theater seats",
    explanation: "1939 cinema mesmerized audiences on giant theater projection screens without VR headsets or wireless internet!",
    funFact: "Judy Garland was just 16 years old when she played Dorothy in 'The Wizard of Oz'."
  }
];

export const ERA_GUESSER_ITEMS: EraGuesserItem[] = [
  {
    id: "victorian-parlor",
    title: "Victorian Tea Parlor",
    trueDecade: "1890s Victorian Era",
    anachronismItem: "Modern Smartphone",
    correctExplanation: "The sleek glass smartphone resting on the wooden tea table is anachronistic! Telephones were just being invented in the late 19th century.",
    imageType: "victorian_smartphone",
    visualDescription: "An elegant 1890s Victorian parlor with velvet armchairs, ornate wallpaper, a silver tea set, and a modern iPhone sitting on the table.",
    options: [
      { label: "The Smartphone on the Tea Table", isCorrect: true, detail: "Smartphones were created in the 21st century!" },
      { label: "The Silver Tea Set", isCorrect: false, detail: "Silver tea sets were standard in Victorian homes." },
      { label: "The Floral Wallpaper Pattern", isCorrect: false, detail: "Intricate floral wallpaper was popular in the 1890s." }
    ]
  },
  {
    id: "1950s-diner",
    title: "1950s American Diner",
    trueDecade: "1950s Post-War Era",
    anachronismItem: "Bluetooth Wireless Speaker",
    correctExplanation: "The glowing modern Bluetooth speaker on the diner counter doesn't belong! 1950s diners used classic Wurlitzer jukeboxes and chrome radio dials.",
    imageType: "diner_bluetooth",
    visualDescription: "A bustling 1950s diner with red leather booths, checkered tile floor, a chrome counter, and a wireless cylindrical Bluetooth speaker.",
    options: [
      { label: "The Red Vinyl Booth Seats", isCorrect: false, detail: "Red vinyl was the signature look of 1950s diners." },
      { label: "The Bluetooth Wireless Speaker", isCorrect: true, detail: "Wireless Bluetooth audio emerged decades later in the 2000s!" },
      { label: "The Soda Fountain Glass Cup", isCorrect: false, detail: "Soda fountains were iconic fixtures of 1950s America." }
    ]
  },
  {
    id: "1970s-disco",
    title: "1970s Disco Dance Floor",
    trueDecade: "1970s Disco Era",
    anachronismItem: "Digital Smartwatch with Fitness Rings",
    correctExplanation: "The dancer wearing bell-bottom pants is sporting a futuristic Apple-style Smartwatch on her wrist! Wristwatches in 1977 were analogue or early digital LED.",
    imageType: "disco_smartwatch",
    visualDescription: "A glowing 1970s disco floor with a mirror ball, bell-bottom jumpsuits, and a dancer wearing a sleek OLED smartwatch displaying health rings.",
    options: [
      { label: "The Hanging Mirror Disco Ball", isCorrect: false, detail: "Mirror balls lit up dance venues throughout the 1970s." },
      { label: "The Bell-Bottom Jumpsuits", isCorrect: false, detail: "Bell-bottoms were the peak fashion trend of the 1970s." },
      { label: "The Smartwatch with Health Activity Rings", isCorrect: true, detail: "Fitness tracking smartwatches were introduced in the 2010s!" }
    ]
  },
  {
    id: "1980s-arcade",
    title: "1980s Arcade Center",
    trueDecade: "1980s Arcade Era",
    anachronismItem: "Modern Tablet Computer",
    correctExplanation: "The boy leaning on the cabinet is holding an ultra-thin touchscreen tablet displaying a mobile game instead of putting quarters into the cabinet!",
    imageType: "arcade_tablet",
    visualDescription: "A neon-lit 1980s arcade full of classic coin-operated cabinets, carpet with geometric patterns, and a player holding a modern 11-inch touchscreen tablet.",
    options: [
      { label: "The Coin-Operated Arcade Cabinets", isCorrect: false, detail: "Coin-op arcade cabinets dominated the 1980s gaming scene." },
      { label: "The Ultra-Thin Touchscreen Tablet", isCorrect: true, detail: "Capacitive touchscreen tablets were commercialized in 2010!" },
      { label: "The Neon Signboard on the Wall", isCorrect: false, detail: "Neon lights were iconic decorations in 80s arcades." }
    ]
  }
];

export const RECIPE_ITEMS: RecipeItem[] = [
  {
    id: "classic-apple-pie",
    title: "Grandma's Fresh Apple Pie",
    category: "Baking & Dessert",
    estimatedTime: "15 min prep",
    scrambledSteps: [
      { id: "step-1", text: "Peel, core, and slice 6 fresh apples into uniform slices.", correctIndex: 0, tip: "Always prep fruit first!" },
      { id: "step-2", text: "Toss apple slices with cinnamon, sugar, lemon juice, and flour.", correctIndex: 1, tip: "Coats the fruit evenly." },
      { id: "step-3", text: "Roll out pastry dough and gently press into pie dish.", correctIndex: 2, tip: "Creates the bottom crust base." },
      { id: "step-4", text: "Fill crust with spiced apples, cover with top crust, and slit steam vents.", correctIndex: 3, tip: "Vents allow steam to escape." },
      { id: "step-5", text: "Bake at 375°F for 45 minutes until golden brown and bubbly.", correctIndex: 4, tip: "Final baking step!" }
    ]
  },
  {
    id: "fresh-lemonade",
    title: "Refreshing Country Lemonade",
    category: "Beverages",
    estimatedTime: "8 min prep",
    scrambledSteps: [
      { id: "step-1", text: "Dissolve 1 cup of sugar in 1 cup of warm water to make simple syrup.", correctIndex: 0, tip: "Dissolving sugar prevents grit!" },
      { id: "step-2", text: "Roll 6 lemons firmly on countertop to soften juice cells.", correctIndex: 1, tip: "Rolling yields maximum juice." },
      { id: "step-3", text: "Squeeze fresh lemon juice through a fine mesh strainer.", correctIndex: 2, tip: "Catches seeds and pulp." },
      { id: "step-4", text: "Combine simple syrup, lemon juice, and 4 cups cold water in pitcher.", correctIndex: 3, tip: "Blends sweet and tart." },
      { id: "step-5", text: "Garnish with fresh mint sprigs, ice cubes, and lemon wheels.", correctIndex: 4, tip: "Serve icy cold!" }
    ]
  },
  {
    id: "garden-vegetable-soup",
    title: "Hearty Garden Vegetable Soup",
    category: "Soups & Savory",
    estimatedTime: "20 min prep",
    scrambledSteps: [
      { id: "step-1", text: "Dice onions, carrots, celery, and garlic into small uniform cubes.", correctIndex: 0, tip: "Classic mirepoix base!" },
      { id: "step-2", text: "Sauté diced vegetables in olive oil in a large stockpot until fragrant.", correctIndex: 1, tip: "Unlocks rich aromas." },
      { id: "step-3", text: "Pour in vegetable broth, diced tomatoes, and Italian herbs.", correctIndex: 2, tip: "Creates the savory broth base." },
      { id: "step-4", text: "Add chopped zucchini and green beans; simmer for 20 minutes.", correctIndex: 3, tip: "Vegetables soften gently." },
      { id: "step-5", text: "Ladle hot soup into ceramic bowls and top with fresh parsley.", correctIndex: 4, tip: "Garnish and enjoy!" }
    ]
  }
];

export const MOTION_TARGETS: MotionTarget[] = [
  { id: "apple", label: "Red Apple", emoji: "🍎", category: "fruit", requiredAction: "left" },
  { id: "tractor", label: "Farm Tractor", emoji: "🚜", category: "machine", requiredAction: "right" },
  { id: "banana", label: "Ripe Banana", emoji: "🍌", category: "fruit", requiredAction: "left" },
  { id: "gear", label: "Clockwork Gear", emoji: "⚙️", category: "machine", requiredAction: "right" },
  { id: "strawberry", label: "Fresh Strawberry", emoji: "🍓", category: "fruit", requiredAction: "left" },
  { id: "hammer", label: "Steel Hammer", emoji: "🔨", category: "machine", requiredAction: "right" },
  { id: "orange", label: "Juicy Orange", emoji: "🍊", category: "fruit", requiredAction: "left" },
  { id: "car", label: "Vintage Car", emoji: "🚗", category: "machine", requiredAction: "right" }
];
