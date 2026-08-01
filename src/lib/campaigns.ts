import assert from "node:assert";

export type CampaignMission = {
  orderIndex: number;
  title: string;
  beat: string;
  isBoss?: boolean;
};

export type Campaign = {
  slug: string;
  title: string;
  synopsis: string;
  badgeId: string;
  missions: CampaignMission[];
};

// Campaign definitions live in code — same pattern as lessons/badges.
// Missions reference puzzles by orderIndex (stable across reseeds by that key).
export const CAMPAIGNS: Campaign[] = [
  {
    slug: "contagion-2022",
    title: "Contagion 2022",
    synopsis:
      "Live through the crypto winter cascade: Terra's collapse seeds the panic, the Merge sells the news, FTX detonates trust, and the first green shoots of 2023 appear.",
    badgeId: "campaign_contagion_2022",
    missions: [
      {
        orderIndex: 10,
        title: "Terra Unwinds",
        beat: "May 2022. Luna and UST are imploding. Contagion hits ETH hard — forced sellers everywhere. Can you read the cascade?",
      },
      {
        orderIndex: 11,
        title: "Sell the Merge",
        beat: "September 2022. Ethereum flips to proof-of-stake. The narrative is huge; the next eight hours are quieter than the hype. What does the tape actually do?",
      },
      {
        orderIndex: 6,
        title: "FTX Breaks",
        beat: "November 2022. The exchange that couldn't fail is failing. BTC reprices trust in real time — this is the contagion's climax.",
      },
      {
        orderIndex: 7,
        title: "First Green Shoots",
        beat: "January 2023. The bear market low is in the rearview — or is it? Final boss: spot whether recovery has actually begun.",
        isBoss: true,
      },
    ],
  },
  {
    slug: "covid-shock",
    title: "COVID Shock",
    synopsis:
      "From Black Thursday panic to DeFi summer and the autumn breakout that restarted the bull — three beats that define crypto's 2020.",
    badgeId: "campaign_covid_shock",
    missions: [
      {
        orderIndex: 1,
        title: "Black Thursday",
        beat: "March 12, 2020. Global markets are melting. BTC is no safe haven today — panic is the only trade on the tape.",
      },
      {
        orderIndex: 14,
        title: "DeFi Summer",
        beat: "July 2020. The crash is months behind. Yield farming and ETH strength are pulling capital back in. Can you ride the recovery?",
      },
      {
        orderIndex: 2,
        title: "ATH Breakout",
        beat: "October 2020. Price is pressing the old high. Final boss: call the breakout that restarts the bull.",
        isBoss: true,
      },
    ],
  },
];

export function getCampaign(slug: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.slug === slug);
}

export function campaignPeriodKey(slug: string, missionIndex: number): string {
  return `${slug}:${missionIndex}`;
}

export function parseCampaignPeriodKey(periodKey: string): { slug: string; missionIndex: number } | null {
  const match = /^([a-z0-9-]+):(\d+)$/.exec(periodKey);
  if (!match) return null;
  return { slug: match[1]!, missionIndex: Number(match[2]) };
}

export function isValidCampaignMission(slug: string, missionIndex: number, puzzleOrderIndex: number): boolean {
  const campaign = getCampaign(slug);
  if (!campaign) return false;
  const mission = campaign.missions[missionIndex];
  return !!mission && mission.orderIndex === puzzleOrderIndex;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  assert.equal(campaignPeriodKey("contagion-2022", 2), "contagion-2022:2");
  assert.deepEqual(parseCampaignPeriodKey("contagion-2022:2"), { slug: "contagion-2022", missionIndex: 2 });
  assert.equal(parseCampaignPeriodKey("weekly"), null);
  assert.ok(isValidCampaignMission("contagion-2022", 0, 10));
  assert.ok(!isValidCampaignMission("contagion-2022", 0, 6));
  assert.ok(getCampaign("covid-shock"));
  console.log("campaigns.ts: all checks passed");
}
