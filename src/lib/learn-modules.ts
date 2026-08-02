import assert from "node:assert";

export type QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type LearnModule = {
  id: string;
  title: string;
  summary: string;
  lesson: { heading: string; paragraphs: string[] };
  questions: QuizQuestion[];
};

export const QUIZ_PASS_RATIO = 0.75;
// 25 × 4 modules = 100 XP → Level 2, which unlocks daily Replay.
export const QUIZ_PASS_XP = 25;

export const LEARN_MODULES: LearnModule[] = [
  {
    id: "support-resistance",
    title: "Support & Resistance",
    summary: "Where price has repeatedly bounced or stalled — floors and ceilings on the chart.",
    lesson: {
      heading: "What support and resistance are",
      paragraphs: [
        "Support is a price area where buying interest has repeatedly stepped in and stopped a decline — a floor. Resistance is where selling has repeatedly capped rallies — a ceiling.",
        "These levels are zones, not single ticks. The more times price respects a zone without breaking it cleanly, the more traders watch it. A break through support or resistance often matters more than another bounce off it.",
        "This is chart literacy, not a prediction system. Levels fail. What you're learning is how to name what you see so you can read setups more clearly.",
      ],
    },
    questions: [
      {
        prompt: "Support is best described as:",
        options: [
          "A guaranteed place price will bounce forever",
          "A zone where buying has repeatedly slowed or stopped declines",
          "Any green candle on the chart",
          "The all-time high only",
        ],
        correctIndex: 1,
      },
      {
        prompt: "Resistance is best described as:",
        options: [
          "A zone where selling has repeatedly capped rallies",
          "The lowest price of the day",
          "A signal to always buy",
          "Volume alone",
        ],
        correctIndex: 0,
      },
      {
        prompt: "Why are support/resistance often treated as zones rather than exact prices?",
        options: [
          "Because charts only show daily candles",
          "Because price often reacts in a band, not one precise tick",
          "Because brokers invent the levels",
          "Because crypto never revisits old prices",
        ],
        correctIndex: 1,
      },
      {
        prompt: "A clean break through a long-watched resistance often means:",
        options: [
          "Nothing — levels never matter once touched",
          "Traders are paying attention to that area; the break can shift the structure",
          "You must immediately reverse your last call",
          "The market will always reverse back inside",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "trends",
    title: "Trends",
    summary: "Higher highs / higher lows (or the mirror) — reading direction as a base rate.",
    lesson: {
      heading: "Reading trend structure",
      paragraphs: [
        "An uptrend typically prints higher highs and higher lows. A downtrend prints lower highs and lower lows. That structure is the 'base rate': trends continue more often than they reverse, until the structure breaks.",
        "Pullbacks in a healthy trend tend to stay shallow relative to the prior move. When a pullback erases most of the recent advance (or decline) and breaks the prior swing, trend continuation becomes less likely.",
        "You're not forecasting the future — you're recognizing whether the recent rhythm still looks like a trend or whether that rhythm has already broken.",
      ],
    },
    questions: [
      {
        prompt: "An uptrend is most often visible as:",
        options: ["Higher highs and higher lows", "Only red candles", "A single spike candle", "Flat highs and lows"],
        correctIndex: 0,
      },
      {
        prompt: "In a healthy uptrend, pullbacks usually:",
        options: [
          "Erase the entire prior advance before continuing",
          "Stay relatively shallow and respect prior structure",
          "Never happen",
          "Only occur on weekly charts",
        ],
        correctIndex: 1,
      },
      {
        prompt: "A break of the prior swing structure often suggests:",
        options: [
          "The trend rhythm may be failing",
          "Volume has stopped existing",
          "Support and resistance no longer exist as concepts",
          "You should ignore the chart",
        ],
        correctIndex: 0,
      },
      {
        prompt: "Treating trend as a 'base rate' means:",
        options: [
          "Trends reverse every candle",
          "Continuation is common until structure clearly breaks",
          "You should never wait",
          "Only short timeframes matter",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "breakouts",
    title: "Breakouts",
    summary: "Quiet ranges that coil, then a decisive move that clears the band.",
    lesson: {
      heading: "What a breakout looks like",
      paragraphs: [
        "A breakout setup often starts with a tight, quiet range — highs and lows barely expanding. That compression is coiling energy, not a signal by itself.",
        "The tell is when price finally clears the top or bottom of that band with a larger candle that does not immediately snap back inside the range.",
        "False breaks happen: price pokes out and fails. Literacy means noticing compression → expansion, not assuming every poke is a lasting breakout.",
      ],
    },
    questions: [
      {
        prompt: "Before many breakouts, price often:",
        options: [
          "Moves in a tight, quiet range",
          "Prints only doji candles forever",
          "Gaps every hour",
          "Trades only on weekends",
        ],
        correctIndex: 0,
      },
      {
        prompt: "A more convincing breakout candle typically:",
        options: [
          "Is smaller than the range candles before it",
          "Is larger and holds outside the prior range",
          "Always closes exactly at the open",
          "Has zero volume",
        ],
        correctIndex: 1,
      },
      {
        prompt: "A poke outside a range that snaps straight back inside is often:",
        options: ["A failed / false break", "Proof trends never reverse", "A guaranteed continuation", "Irrelevant to structure"],
        correctIndex: 0,
      },
      {
        prompt: "Compression before a breakout is best thought of as:",
        options: [
          "A finished signal on its own",
          "Coiling conditions — the break is the event to watch",
          "Evidence the market is closed",
          "A reason to ignore the chart",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "ranges",
    title: "Ranges & Waiting",
    summary: "When price oscillates with no clean edge — sitting out can be the correct read.",
    lesson: {
      heading: "Recognizing a range",
      paragraphs: [
        "Not every window is trying to trend or break out. Sometimes price oscillates between a ceiling and a floor with no expanding momentum either way.",
        "In TradeQuest's Buy / Sell / Wait framing, a genuine range often means Wait is the correct call — there is no clean directional edge in the outcome window.",
        "Forcing a Buy or Sell in a choppy band is a common mistake. Learning to recognize 'nowhere' is as important as spotting a trend.",
      ],
    },
    questions: [
      {
        prompt: "A range is characterized by:",
        options: [
          "Price oscillating between similar highs and lows without a lasting directional push",
          "Only higher highs forever",
          "A single candle",
          "Mandatory breakouts every hour",
        ],
        correctIndex: 0,
      },
      {
        prompt: "In a clear range with no expanding momentum, the most accurate TradeQuest-style call is often:",
        options: ["Wait", "Always Buy", "Always Sell", "Ignore the puzzle"],
        correctIndex: 0,
      },
      {
        prompt: "Forcing a directional call in choppy two-sided action often:",
        options: [
          "Improves accuracy for free",
          "Treats noise as a trend",
          "Deletes support and resistance from history",
          "Guarantees a perfect week",
        ],
        correctIndex: 1,
      },
      {
        prompt: "Why is recognizing 'nowhere' useful?",
        options: [
          "Because every chart must be bought",
          "Because sitting out when there is no edge is a valid read",
          "Because Wait is never graded",
          "Because ranges only exist on stocks",
        ],
        correctIndex: 1,
      },
    ],
  },
];

export function getLearnModule(id: string): LearnModule | undefined {
  return LEARN_MODULES.find((m) => m.id === id);
}

export function gradeQuiz(module: LearnModule, answers: number[]): { score: number; total: number; passed: boolean; correctIndexes: number[] } {
  const total = module.questions.length;
  let score = 0;
  const correctIndexes: number[] = [];
  for (let i = 0; i < total; i++) {
    const correct = module.questions[i]!.correctIndex;
    correctIndexes.push(correct);
    if (answers[i] === correct) score += 1;
  }
  const passed = total > 0 && score / total >= QUIZ_PASS_RATIO;
  return { score, total, passed, correctIndexes };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mod = getLearnModule("support-resistance")!;
  const perfect = gradeQuiz(
    mod,
    mod.questions.map((q) => q.correctIndex)
  );
  assert.equal(perfect.passed, true);
  assert.equal(perfect.score, 4);
  const fail = gradeQuiz(mod, [0, 0, 0, 0]);
  assert.equal(fail.passed, false);
  assert.ok(LEARN_MODULES.length === 4);
  console.log("learn-modules.ts: all checks passed");
}
