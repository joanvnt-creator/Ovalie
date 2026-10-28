import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePoints,
  calculateTriesPer80,
  calculatePointsPer80,
  calculateSummary,
  determineHeroStat,
  computeSeasonLabel,
  RugbyMatch,
} from './rugby';

test('calculatePoints conforms to official rugby rules', () => {
  // 6 tries (30) + 3 conversions (6) + 3 penalties (9) = 45
  assert.equal(calculatePoints(6, 3, 3, 0), 45);
  // Drops count 3 points
  assert.equal(calculatePoints(1, 0, 0, 1), 8);
  assert.equal(calculatePoints(0, 0, 0, 0), 0);
});

test('calculateTriesPer80 & calculatePointsPer80 handle normal and zero minutes', () => {
  // 6 tries in 582 minutes = (6 * 80) / 582 = 480 / 582 = 0.8247... -> 0.82
  assert.equal(calculateTriesPer80(6, 582), 0.82);
  assert.equal(calculatePointsPer80(45, 582), 6.19);
  // zero minutes returns 0 without crashing
  assert.equal(calculateTriesPer80(5, 0), 0);
  assert.equal(calculatePointsPer80(20, 0), 0);
});

test('calculateSummary computes demo statistics accurately', () => {
  const matches: RugbyMatch[] = [
    {
      id: 1, user_id: 1, season_id: 1, date: '2026-09-12', opponent: 'Stade Bordelais',
      home: 1, competition: 'Fédérale 3', score_for: 27, score_against: 20, started: 1,
      minutes: 80, tries: 1, conversions: 0, penalties: 0, drops: 0, card: 'none',
      tackles_made: 8, tackles_missed: 1, carries: 4, penalties_conceded: 1
    },
    {
      id: 2, user_id: 1, season_id: 1, date: '2026-09-19', opponent: 'RC Bassin Arcachon',
      home: 0, competition: 'Fédérale 3', score_for: 24, score_against: 17, started: 1,
      minutes: 80, tries: 1, conversions: 2, penalties: 2, drops: 0, card: 'none',
      tackles_made: 7, tackles_missed: 0, carries: 6, penalties_conceded: 0
    },
    {
      id: 3, user_id: 1, season_id: 1, date: '2026-09-26', opponent: 'US Salles',
      home: 1, competition: 'Fédérale 3', score_for: 19, score_against: 14, started: 1,
      minutes: 80, tries: 1, conversions: 1, penalties: 1, drops: 0, card: 'none',
      tackles_made: 6, tackles_missed: 2, carries: 3, penalties_conceded: 0
    },
    {
      id: 4, user_id: 1, season_id: 1, date: '2026-10-03', opponent: 'CA Lormont',
      home: 0, competition: 'Fédérale 3', score_for: 15, score_against: 22, started: 0,
      minutes: 16, tries: 0, conversions: 0, penalties: 0, drops: 0, card: 'yellow',
      tackles_made: 4, tackles_missed: 1, carries: 1, penalties_conceded: 1
    },
    {
      id: 5, user_id: 1, season_id: 1, date: '2026-10-10', opponent: 'Floirac Rugby',
      home: 1, competition: 'Fédérale 3', score_for: 31, score_against: 10, started: 1,
      minutes: 80, tries: 1, conversions: 0, penalties: 0, drops: 0, card: 'none',
      tackles_made: 5, tackles_missed: 1, carries: 5, penalties_conceded: 0
    },
    {
      id: 6, user_id: 1, season_id: 1, date: '2026-10-17', opponent: 'Saint-Médard RC',
      home: 0, competition: 'Fédérale 3', score_for: 18, score_against: 18, started: 1,
      minutes: 80, tries: 0, conversions: 0, penalties: 0, drops: 0, card: 'none',
      tackles_made: 10, tackles_missed: 1, carries: 2, penalties_conceded: 0
    },
    {
      id: 7, user_id: 1, season_id: 1, date: '2026-10-24', opponent: 'AS Mérignac',
      home: 1, competition: 'Fédérale 3', score_for: 22, score_against: 13, started: 0,
      minutes: 6, tries: 0, conversions: 0, penalties: 0, drops: 0, card: 'none',
      tackles_made: 2, tackles_missed: 0, carries: 0, penalties_conceded: 0
    },
    {
      id: 8, user_id: 1, season_id: 1, date: '2026-10-31', opponent: 'UA Gujan-Mestras',
      home: 0, competition: 'Fédérale 3', score_for: 12, score_against: 16, started: 1,
      minutes: 80, tries: 0, conversions: 0, penalties: 0, drops: 0, card: 'none',
      tackles_made: 7, tackles_missed: 1, carries: 2, penalties_conceded: 1
    },
    {
      id: 9, user_id: 1, season_id: 1, date: '2026-11-07', opponent: 'RC Libourne',
      home: 1, competition: 'Fédérale 3', score_for: 28, score_against: 15, started: 1,
      minutes: 80, tries: 2, conversions: 0, penalties: 0, drops: 0, card: 'none',
      tackles_made: 8, tackles_missed: 0, carries: 7, penalties_conceded: 0
    },
  ];

  const summary = calculateSummary(matches);
  assert.equal(summary.matchCount, 9);
  assert.equal(summary.totalTries, 6);
  assert.equal(summary.totalConversions, 3);
  assert.equal(summary.totalPenalties, 3);
  assert.equal(summary.totalPoints, 45);
  assert.equal(summary.totalMinutes, 582);
  assert.equal(summary.startedCount, 7);
  assert.equal(summary.starterPercentage, 78); // 7/9 = 77.78% -> 78%
  assert.equal(summary.totalYellowCards, 1);
  assert.equal(summary.victories, 6);
  assert.equal(summary.draws, 1);
  assert.equal(summary.defeats, 2);

  const hero = determineHeroStat(summary, true, matches[8]);
  assert.equal(hero.type, 'tries');
  assert.equal(hero.value, 6);
  assert.equal(hero.eyebrow, 'ESSAIS MARQUÉS');
  assert.equal(hero.subtext, 'dont 2 le dernier');
});

test('computeSeasonLabel calculates correct rugby season', () => {
  const october2026 = new Date('2026-10-28');
  assert.equal(computeSeasonLabel(october2026).label, 'Saison 2026-2027');

  const march2027 = new Date('2027-03-15');
  assert.equal(computeSeasonLabel(march2027).label, 'Saison 2026-2027');
});
