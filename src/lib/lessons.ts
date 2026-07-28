import type { PatternType } from "@/db/schema";

export const LESSONS: Record<PatternType, { title: string; body: string }> = {
  breakout: {
    title: "Reading a breakout",
    body: "Price sits in a tight, quiet range for a while — each candle's high and low barely moves. That quiet is coiling energy, not a signal on its own. The tell is what happens when price finally clears the top or bottom of that range: a breakout candle is usually bigger than the ones before it, and it doesn't immediately snap back inside the range.",
  },
  trend_continuation: {
    title: "Reading a trend continuation",
    body: "When price is already making higher highs and higher lows (or the mirror, lower highs and lower lows), the trend is the base rate — it keeps going more often than it reverses. Look for pullbacks that stay shallow and don't break the prior structure; a trend that's still healthy rarely gives back most of its recent move before continuing.",
  },
  reversal: {
    title: "Reading a reversal",
    body: "A reversal shows up as the trend's rhythm breaking: higher highs stop happening, or a pullback goes deeper than every pullback before it. The clearest tell is momentum fading into the move's final leg — smaller candles, more overlap between them — right before price turns and erases the recent trend.",
  },
  range: {
    title: "Reading a range",
    body: "Not every setup is trying to break out or reverse — sometimes price just oscillates between a ceiling and a floor with no real edge either way. If highs and lows keep landing in roughly the same band candle after candle, with no expanding range or momentum building in one direction, sitting out is usually the correct read, not a guess.",
  },
};
