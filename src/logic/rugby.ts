/**
 * Rugby union pure statistics and calculation logic for Ovalie
 */

export interface RugbyMatch {
  id: number;
  user_id: number;
  season_id: number;
  date: string; // YYYY-MM-DD
  opponent: string;
  home: 0 | 1;
  competition: string;
  score_for: number | null;
  score_against: number | null;
  started: 0 | 1;
  minutes: number;
  tries: number;
  conversions: number;
  penalties: number;
  drops: number;
  card: 'none' | 'yellow' | 'red';
  tackles_made?: number | null;
  tackles_missed?: number | null;
  carries?: number | null;
  penalties_conceded?: number | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SeasonSummary {
  matchCount: number;
  victories: number;
  draws: number;
  defeats: number;
  unscored: number;
  totalPoints: number;
  totalMinutes: number;
  totalTries: number;
  totalConversions: number;
  totalPenalties: number;
  totalDrops: number;
  totalYellowCards: number;
  totalRedCards: number;
  startedCount: number;
  starterPercentage: number;
  triesPer80: number;
  pointsPer80: number;
  kickingPoints: number;
  fullMatchesEquivalent: number;
  // Advanced stats
  totalTacklesMade: number;
  totalTacklesMissed: number;
  tackleSuccessRate: number;
  totalCarries: number;
  totalPenaltiesConceded: number;
}

export function calculatePoints(tries = 0, conversions = 0, penalties = 0, drops = 0): number {
  return (tries || 0) * 5 + (conversions || 0) * 2 + (penalties || 0) * 3 + (drops || 0) * 3;
}

export function calculateTriesPer80(tries: number, totalMinutes: number): number {
  if (!totalMinutes || totalMinutes <= 0) return 0;
  return Number(((tries * 80) / totalMinutes).toFixed(2));
}

export function calculatePointsPer80(points: number, totalMinutes: number): number {
  if (!totalMinutes || totalMinutes <= 0) return 0;
  return Number(((points * 80) / totalMinutes).toFixed(2));
}

export type HeroStatType = 'tries' | 'tackles' | 'points' | 'minutes';

export interface HeroStat {
  type: HeroStatType;
  eyebrow: string;
  value: number;
  label: string;
  subtext: string;
  latestValue: number;
}

export function determineHeroStat(
  summary: SeasonSummary,
  advancedStatsEnabled: boolean,
  latestMatch?: RugbyMatch
): HeroStat {
  if (summary.totalTries > 0) {
    const latestTries = latestMatch ? latestMatch.tries : 0;
    return {
      type: 'tries',
      eyebrow: 'ESSAIS MARQUÉS',
      value: summary.totalTries,
      label: summary.totalTries > 1 ? 'essais' : 'essai',
      subtext: latestTries > 0 ? `dont ${latestTries} le dernier` : `en ${summary.matchCount} matchs`,
      latestValue: latestTries,
    };
  }

  if (advancedStatsEnabled && summary.totalTacklesMade > 0) {
    const latestTackles = latestMatch && latestMatch.tackles_made != null ? latestMatch.tackles_made : 0;
    return {
      type: 'tackles',
      eyebrow: 'PLAQUAGES RÉUSSIS',
      value: summary.totalTacklesMade,
      label: 'plaquages',
      subtext: `${summary.tackleSuccessRate}% de réussite`,
      latestValue: latestTackles,
    };
  }

  if (summary.totalPoints > 0) {
    const latestPoints = latestMatch
      ? calculatePoints(latestMatch.tries, latestMatch.conversions, latestMatch.penalties, latestMatch.drops)
      : 0;
    return {
      type: 'points',
      eyebrow: 'POINTS MARQUÉS',
      value: summary.totalPoints,
      label: 'points',
      subtext: latestPoints > 0 ? `dont ${latestPoints} le dernier` : `en ${summary.matchCount} matchs`,
      latestValue: latestPoints,
    };
  }

  if (summary.totalMinutes > 0) {
    const latestMin = latestMatch ? latestMatch.minutes : 0;
    return {
      type: 'minutes',
      eyebrow: 'MINUTES JOUÉES',
      value: summary.totalMinutes,
      label: 'minutes',
      subtext: `soit ${summary.fullMatchesEquivalent} matchs pleins`,
      latestValue: latestMin,
    };
  }

  return {
    type: 'tries',
    eyebrow: 'ESSAIS MARQUÉS',
    value: 0,
    label: 'essai',
    subtext: 'aucun essai',
    latestValue: 0,
  };
}

export function calculateSummary(matches: RugbyMatch[]): SeasonSummary {
  const matchCount = matches.length;
  let victories = 0;
  let draws = 0;
  let defeats = 0;
  let unscored = 0;
  let totalTries = 0;
  let totalConversions = 0;
  let totalPenalties = 0;
  let totalDrops = 0;
  let totalMinutes = 0;
  let totalYellowCards = 0;
  let totalRedCards = 0;
  let startedCount = 0;
  let totalTacklesMade = 0;
  let totalTacklesMissed = 0;
  let totalCarries = 0;
  let totalPenaltiesConceded = 0;

  for (const m of matches) {
    if (m.score_for != null && m.score_against != null) {
      if (m.score_for > m.score_against) victories++;
      else if (m.score_for === m.score_against) draws++;
      else defeats++;
    } else {
      unscored++;
    }

    totalTries += m.tries || 0;
    totalConversions += m.conversions || 0;
    totalPenalties += m.penalties || 0;
    totalDrops += m.drops || 0;
    totalMinutes += m.minutes || 0;

    if (m.card === 'yellow') totalYellowCards++;
    if (m.card === 'red') totalRedCards++;
    if (m.started === 1) startedCount++;

    if (m.tackles_made != null) totalTacklesMade += m.tackles_made;
    if (m.tackles_missed != null) totalTacklesMissed += m.tackles_missed;
    if (m.carries != null) totalCarries += m.carries;
    if (m.penalties_conceded != null) totalPenaltiesConceded += m.penalties_conceded;
  }

  const totalPoints = calculatePoints(totalTries, totalConversions, totalPenalties, totalDrops);
  const triesPer80 = calculateTriesPer80(totalTries, totalMinutes);
  const pointsPer80 = calculatePointsPer80(totalPoints, totalMinutes);
  const starterPercentage = matchCount > 0 ? Math.round((startedCount / matchCount) * 100) : 0;
  const kickingPoints = totalConversions * 2 + totalPenalties * 3 + totalDrops * 3;
  const fullMatchesEquivalent = Number((totalMinutes / 80).toFixed(1));

  const totalAttempted = totalTacklesMade + totalTacklesMissed;
  const tackleSuccessRate = totalAttempted > 0 ? Math.round((totalTacklesMade / totalAttempted) * 100) : 0;

  return {
    matchCount,
    victories,
    draws,
    defeats,
    unscored,
    totalPoints,
    totalMinutes,
    totalTries,
    totalConversions,
    totalPenalties,
    totalDrops,
    totalYellowCards,
    totalRedCards,
    startedCount,
    starterPercentage,
    triesPer80,
    pointsPer80,
    kickingPoints,
    fullMatchesEquivalent,
    totalTacklesMade,
    totalTacklesMissed,
    tackleSuccessRate,
    totalCarries,
    totalPenaltiesConceded,
  };
}

export function computeSeasonLabel(referenceDate: Date = new Date()): { label: string; start_date: string; end_date: string } {
  const month = referenceDate.getMonth(); // 0 is January, 6 is July
  const year = referenceDate.getFullYear();

  if (month >= 6) {
    // July or later: Season year-(year+1)
    return {
      label: `Saison ${year}-${year + 1}`,
      start_date: `${year}-08-01`,
      end_date: `${year + 1}-06-30`,
    };
  } else {
    // Before July: Season (year-1)-year
    return {
      label: `Saison ${year - 1}-${year}`,
      start_date: `${year - 1}-08-01`,
      end_date: `${year}-06-30`,
    };
  }
}
