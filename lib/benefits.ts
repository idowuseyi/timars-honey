// Educational "Honey Benefits A–Z" content (brief R9). Copy is deliberately written
// as general wellness / traditional use — NOT medical claims. Per the design + NAFDAC
// caution: no "cure/treat", no "no side effects", and never instruct applying edible
// honey to wounds or burns (evidence supports medical-grade honey only). Owner signs
// off on final wording before launch. A–H seeded here; I–Z to be added with the owner.

export const BENEFITS_DISCLAIMER =
  "General wellness information, not medical advice. Speak to a health professional " +
  "about medical concerns. Do not apply edible honey to wounds or burns.";

export interface Benefit {
  letter: string;
  title: string;
  /** A short, non-medical description of the everyday benefit. */
  blurb: string;
  /** How to get the benefit — always with honey. */
  howToUse: string;
}

export const BENEFITS: Benefit[] = [
  {
    letter: "A",
    title: "A natural sweetener",
    blurb: "A wholesome alternative to refined sugar in everyday food and drink.",
    howToUse: "Stir a spoonful into tea, coffee, or oats in place of sugar.",
  },
  {
    letter: "B",
    title: "Breakfast lift",
    blurb: "Adds natural sweetness and flavour to a simple morning meal.",
    howToUse: "Drizzle over pancakes, yoghurt, or bread instead of jam.",
  },
  {
    letter: "C",
    title: "Comfort in a warm drink",
    blurb: "A warm honey drink is a long-trusted, soothing everyday ritual.",
    howToUse: "Mix a teaspoon into warm water with a squeeze of lemon.",
  },
  {
    letter: "D",
    title: "Dressings & marinades",
    blurb: "Balances acidity and adds a gentle glaze to home cooking.",
    howToUse: "Whisk into salad dressings or brush over grilled dishes.",
  },
  {
    letter: "E",
    title: "Energy for the day",
    blurb: "A naturally sweet source of carbohydrates to enjoy in moderation.",
    howToUse: "Take a spoonful before a workout or a long day.",
  },
  {
    letter: "F",
    title: "Flavour for baking",
    blurb: "Keeps home bakes moist and adds depth you can taste.",
    howToUse: "Swap some sugar for honey in cakes, granola, and bread.",
  },
  {
    letter: "G",
    title: "Gifting, done well",
    blurb: "A pure, presentable jar makes a thoughtful, welcome gift.",
    howToUse: "Pair a Biggy jar with tea for an easy present.",
  },
  {
    letter: "H",
    title: "Honey in your kitchen",
    blurb: "A versatile pantry staple that keeps well when stored cool and dry.",
    howToUse: "Keep a sealed jar in the cupboard and spoon as needed.",
  },
];
