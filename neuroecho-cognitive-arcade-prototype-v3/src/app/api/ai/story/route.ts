import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { topic = "Gardening & Backyard Nature" } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey });

        const response = await client.messages.create({
          model: "claude-opus-5",
          max_tokens: 1024,
          system: `You are a cognitive game generator for seniors. Create a short, engaging 4-sentence story about the topic provided.
One sentence MUST contain a deliberate, subtle historical or logical inaccuracy (the "AI lie").`,
          messages: [
            { role: "user", content: `Generate story for topic: ${topic}` },
          ],
          output_config: {
            format: {
              type: "json_schema",
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  topic: { type: "string" },
                  sentences: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 4,
                    maxItems: 4,
                  },
                  lieSentenceIndex: { type: "integer" },
                  lieKeyword: { type: "string" },
                  correctedKeyword: { type: "string" },
                  explanation: { type: "string" },
                  funFact: { type: "string" },
                },
                required: [
                  "title",
                  "topic",
                  "sentences",
                  "lieSentenceIndex",
                  "lieKeyword",
                  "correctedKeyword",
                  "explanation",
                  "funFact",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const textBlock = response.content.find((b) => b.type === "text");
        if (textBlock && textBlock.type === "text") {
          const parsed = JSON.parse(textBlock.text);
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.warn("Claude API call failed, using smart fallback story generator", err);
      }
    }

    // Smart generator fallback
    const fallbackStories: Record<string, any> = {
      gardening: {
        title: "Springtime Garden Blossoms",
        topic: "Gardening & Nature",
        sentences: [
          "In early April, Arthur planted heirloom tomato seeds in small peat pots on the warm kitchen windowsill.",
          "He watered them gently each morning using his automated hydroponic solar misting laser.",
          "Within three weeks, green sprouts poked through the dark potting soil, reaching for the sunlight.",
          "By July, his backyard garden yielded sweet red tomatoes perfect for summer salads."
        ],
        lieSentenceIndex: 1,
        lieKeyword: "automated hydroponic solar misting laser",
        correctedKeyword: "classic copper watering can",
        explanation: "Traditional windowsill gardening relies on simple hand watering cans, not industrial hydroponic misting lasers!",
        funFact: "Tomatoes were once believed by Europeans to be poisonous until the 18th century."
      },
      trains: {
        title: "The Golden Era of Steam Locomotives",
        topic: "Railroads & History",
        sentences: [
          "In the 1940s, magnificent steam locomotives pulled passenger cars across North America.",
          "Conductors in crisp uniforms checked paper tickets as steam billowed from the locomotive smokestacks.",
          "Passengers connected their high-speed 5G Wi-Fi routers to stream movies in the dining car.",
          "The dining car served hot roast beef sandwiches, freshly brewed coffee, and apple pie."
        ],
        lieSentenceIndex: 2,
        lieKeyword: "connected their high-speed 5G Wi-Fi routers",
        correctedKeyword: "enjoyed scenic mountain views through wide glass windows",
        explanation: "1940s passenger trains offered peaceful landscape viewing, long before wireless 5G Wi-Fi or streaming existed!",
        funFact: "The famous Orient Express train ran from Paris to Istanbul starting in 1883."
      }
    };

    const key = Object.keys(fallbackStories).find(k => topic.toLowerCase().includes(k)) || "gardening";
    return NextResponse.json(fallbackStories[key]);

  } catch (error) {
    console.error("Error in AI story route:", error);
    return NextResponse.json({
      title: "Memories of the Community Fair",
      topic: "Community & Culture",
      sentences: [
        "In the summer of 1958, townspeople gathered at the county fairgrounds for the annual pie competition.",
        "Marjorie entered her famous double-crust peach pie made from fruit picked that morning.",
        "The judges used a smartphone barcode scanner to taste the pie calories automatically.",
        "She won the blue ribbon trophy and a crisp twenty-dollar bill."
      ],
      lieSentenceIndex: 2,
      lieKeyword: "smartphone barcode scanner to taste the pie calories",
      correctedKeyword: "silver forks to taste each delicious slice",
      explanation: "Fair judges in 1958 tasted pies with silver forks, not modern smartphone barcode scanners!",
      funFact: "County fairs have been held in North America since 1811."
    });
  }
}
