import { 
  Competition, 
  Fixture, 
  LeagueStandings, 
  NewsArticle, 
  HighlightItem,
  Team,
  MatchEvent,
  MatchStatistics,
  Lineup,
  TopScorer
} from '../../src/types/football.js';

export const VERIFIED_COMPETITIONS: Competition[] = [
  {
    id: "epl",
    name: "English Premier League",
    shortName: "Premier League",
    code: "PL",
    country: "England",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
    colorGradient: "from-purple-900 to-fuchsia-950",
    season: "2024/25",
    isPopular: true
  },
  {
    id: "ucl",
    name: "UEFA Champions League",
    shortName: "Champions League",
    code: "UCL",
    country: "Europe",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg",
    colorGradient: "from-blue-900 to-indigo-950",
    season: "2024/25",
    isPopular: true
  },
  {
    id: "laliga",
    name: "La Liga EA Sports",
    shortName: "La Liga",
    code: "ESP",
    country: "Spain",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg",
    colorGradient: "from-orange-800 to-red-950",
    season: "2024/25",
    isPopular: true
  },
  {
    id: "seriea",
    name: "Serie A Enilive",
    shortName: "Serie A",
    code: "ITA",
    country: "Italy",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg",
    colorGradient: "from-blue-800 to-cyan-950",
    season: "2024/25",
    isPopular: true
  },
  {
    id: "bundesliga",
    name: "Bundesliga",
    shortName: "Bundesliga",
    code: "GER",
    country: "Germany",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg",
    colorGradient: "from-red-900 to-stone-950",
    season: "2024/25",
    isPopular: true
  },
  {
    id: "ligue1",
    name: "Ligue 1 McDonald's",
    shortName: "Ligue 1",
    code: "FRA",
    country: "France",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Ligue1_McDonald%27s_logo.svg",
    colorGradient: "from-lime-900 to-emerald-950",
    season: "2024/25",
    isPopular: true
  },
  {
    id: "worldcup",
    name: "FIFA World Cup 2026",
    shortName: "World Cup",
    code: "WC",
    country: "International",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_World_Cup_2026_logo.svg",
    colorGradient: "from-amber-600 via-yellow-700 to-stone-950",
    season: "2026",
    isPopular: true
  },
  {
    id: "uel",
    name: "UEFA Europa League",
    shortName: "Europa League",
    code: "UEL",
    country: "Europe",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/03/UEFA_Europa_League_logo_%282024%29.svg",
    colorGradient: "from-amber-700 to-orange-950",
    season: "2024/25",
    isPopular: true
  }
];

export const TEAMS: Record<string, Team> = {
  mci: {
    id: "mci",
    name: "Manchester City",
    shortName: "Man City",
    code: "MCI",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    country: "England",
    stadium: "Etihad Stadium",
    manager: "Pep Guardiola"
  },
  ars: {
    id: "ars",
    name: "Arsenal",
    shortName: "Arsenal",
    code: "ARS",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    country: "England",
    stadium: "Emirates Stadium",
    manager: "Mikel Arteta"
  },
  liv: {
    id: "liv",
    name: "Liverpool",
    shortName: "Liverpool",
    code: "LIV",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    country: "England",
    stadium: "Anfield",
    manager: "Arne Slot"
  },
  rma: {
    id: "rma",
    name: "Real Madrid",
    shortName: "Real Madrid",
    code: "RMA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    country: "Spain",
    stadium: "Santiago Bernabéu",
    manager: "Carlo Ancelotti"
  },
  bar: {
    id: "bar",
    name: "FC Barcelona",
    shortName: "Barcelona",
    code: "FCB",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    country: "Spain",
    stadium: "Estadi Olímpic Lluís Companys",
    manager: "Hansi Flick"
  },
  bay: {
    id: "bay",
    name: "Bayern Munich",
    shortName: "Bayern",
    code: "BAY",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    country: "Germany",
    stadium: "Allianz Arena",
    manager: "Vincent Kompany"
  },
  int: {
    id: "int",
    name: "Inter Milan",
    shortName: "Inter",
    code: "INT",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
    country: "Italy",
    stadium: "San Siro",
    manager: "Simone Inzaghi"
  },
  psg: {
    id: "psg",
    name: "Paris Saint-Germain",
    shortName: "PSG",
    code: "PSG",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    country: "France",
    stadium: "Parc des Princes",
    manager: "Luis Enrique"
  },
  che: {
    id: "che",
    name: "Chelsea",
    shortName: "Chelsea",
    code: "CHE",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    country: "England",
    stadium: "Stamford Bridge",
    manager: "Enzo Maresca"
  },
  ata: {
    id: "ata",
    name: "Atlético Madrid",
    shortName: "Atlético",
    code: "ATM",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
    country: "Spain",
    stadium: "Metropolitano",
    manager: "Diego Simeone"
  },
  juv: {
    id: "juv",
    name: "Juventus",
    shortName: "Juventus",
    code: "JUV",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg",
    country: "Italy",
    stadium: "Allianz Stadium",
    manager: "Thiago Motta"
  },
  nap: {
    id: "nap",
    name: "SSC Napoli",
    shortName: "Napoli",
    code: "NAP",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/00/SSC_Napoli_2024_%28deep_blue_silhouette%29.svg",
    country: "Italy",
    stadium: "Stadio Diego Armando Maradona",
    manager: "Antonio Conte"
  },
  mil: {
    id: "mil",
    name: "AC Milan",
    shortName: "Milan",
    code: "MIL",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
    country: "Italy",
    stadium: "San Siro",
    manager: "Paulo Fonseca"
  },
  ata_it: {
    id: "ata_it",
    name: "Atalanta BC",
    shortName: "Atalanta",
    code: "ATA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg",
    country: "Italy",
    stadium: "Gewiss Stadium",
    manager: "Gian Piero Gasperini"
  },
  bvb: {
    id: "bvb",
    name: "Borussia Dortmund",
    shortName: "Dortmund",
    code: "BVB",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
    country: "Germany",
    stadium: "Signal Iduna Park",
    manager: "Nuri Şahin"
  },
  lev: {
    id: "lev",
    name: "Bayer 04 Leverkusen",
    shortName: "Leverkusen",
    code: "B04",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
    country: "Germany",
    stadium: "BayArena",
    manager: "Xabi Alonso"
  },
  sge: {
    id: "sge",
    name: "Eintracht Frankfurt",
    shortName: "Frankfurt",
    code: "SGE",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg",
    country: "Germany",
    stadium: "Deutsche Bank Park",
    manager: "Dino Toppmöller"
  },
  rbl: {
    id: "rbl",
    name: "RB Leipzig",
    shortName: "RB Leipzig",
    code: "RBL",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2020_logo.svg",
    country: "Germany",
    stadium: "Red Bull Arena",
    manager: "Marco Rose"
  },
  mar: {
    id: "mar",
    name: "Olympique de Marseille",
    shortName: "Marseille",
    code: "OM",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
    country: "France",
    stadium: "Stade Vélodrome",
    manager: "Roberto De Zerbi"
  },
  mon: {
    id: "mon",
    name: "AS Monaco",
    shortName: "Monaco",
    code: "ASM",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg",
    country: "France",
    stadium: "Stade Louis II",
    manager: "Adi Hütter"
  },
  lil: {
    id: "lil",
    name: "LOSC Lille",
    shortName: "Lille",
    code: "LOSC",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/6/6f/LOSC_Lille_Logo.svg",
    country: "France",
    stadium: "Decathlon Arena",
    manager: "Bruno Génésio"
  },
  arg: {
    id: "arg",
    name: "Argentina",
    shortName: "Argentina",
    code: "ARG",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d1/Argentina_national_football_team_crest_2023.svg",
    country: "Argentina",
    stadium: "Estadio Monumental",
    manager: "Lionel Scaloni"
  },
  bra: {
    id: "bra",
    name: "Brazil",
    shortName: "Brazil",
    code: "BRA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Brazilian_Football_Confederation_logo.svg",
    country: "Brazil",
    stadium: "Maracanã",
    manager: "Dorival Júnior"
  },
  fra: {
    id: "fra",
    name: "France",
    shortName: "France",
    code: "FRA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/e3/French_Football_Federation_logo.svg",
    country: "France",
    stadium: "Stade de France",
    manager: "Didier Deschamps"
  },
  esp: {
    id: "esp",
    name: "Spain",
    shortName: "Spain",
    code: "ESP",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/3/31/Spain_National_Football_Team_badge.png",
    country: "Spain",
    stadium: "Santiago Bernabéu",
    manager: "Luis de la Fuente"
  },
  new: {
    id: "new",
    name: "Newcastle United",
    shortName: "Newcastle",
    code: "NEW",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
    country: "England",
    stadium: "St James' Park",
    manager: "Eddie Howe"
  },
  tot: {
    id: "tot",
    name: "Tottenham Hotspur",
    shortName: "Tottenham",
    code: "TOT",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
    country: "England",
    stadium: "Tottenham Hotspur Stadium",
    manager: "Ange Postecoglou"
  },
  mun: {
    id: "mun",
    name: "Manchester United",
    shortName: "Man Utd",
    code: "MUN",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    country: "England",
    stadium: "Old Trafford",
    manager: "Ruben Amorim"
  },
  avl: {
    id: "avl",
    name: "Aston Villa",
    shortName: "Aston Villa",
    code: "AVL",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg",
    country: "England",
    stadium: "Villa Park",
    manager: "Unai Emery"
  }
};

export const SAMPLE_MATCHES: Fixture[] = [
  {
    id: "fix-live-01",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 28",
    homeTeam: TEAMS.mci,
    awayTeam: TEAMS.ars,
    status: "LIVE",
    minute: 68,
    startingAt: new Date(Date.now() - 68 * 60000).toISOString(),
    venue: "Etihad Stadium, Manchester",
    referee: "Michael Oliver",
    score: {
      home: 2,
      away: 1,
      halfTime: { home: 1, away: 1 }
    },
    isLive: true,
    momentum: [
      { minute: 15, value: 40 },
      { minute: 25, value: 70 },
      { minute: 35, value: 20 },
      { minute: 45, value: -30 },
      { minute: 55, value: 65 },
      { minute: 68, value: 80 }
    ],
    events: [
      {
        id: "ev-1",
        fixtureId: "fix-live-01",
        minute: 22,
        type: "goal",
        teamId: "mci",
        player: { id: "p-haaland", name: "Erling Haaland" },
        assistPlayer: { id: "p-kdb", name: "Kevin De Bruyne" },
        detail: "Clinical finish into bottom right corner (0.78 xG)"
      },
      {
        id: "ev-2",
        fixtureId: "fix-live-01",
        minute: 41,
        type: "goal",
        teamId: "ars",
        player: { id: "p-saka", name: "Bukayo Saka" },
        assistPlayer: { id: "p-odegaard", name: "Martin Ødegaard" },
        detail: "Curling left-footed strike from edge of box"
      },
      {
        id: "ev-3",
        fixtureId: "fix-live-01",
        minute: 54,
        type: "yellow_card",
        teamId: "ars",
        player: { id: "p-saliba", name: "William Saliba" },
        detail: "Tactical foul on counter attack"
      },
      {
        id: "ev-4",
        fixtureId: "fix-live-01",
        minute: 63,
        type: "goal",
        teamId: "mci",
        player: { id: "p-foden", name: "Phil Foden" },
        assistPlayer: { id: "p-rodri", name: "Rodri" },
        detail: "Deflected strike off inside of the post"
      },
      {
        id: "ev-5",
        fixtureId: "fix-live-01",
        minute: 65,
        type: "substitution",
        teamId: "ars",
        player: { id: "ars-fw3", name: "Gabriel Martinelli" },
        subPlayerIn: { id: "ars-sub4", name: "Leandro Trossard" },
        detail: "Tactical change: Trossard ON, Martinelli OFF"
      }
    ],
    statistics: {
      fixtureId: "fix-live-01",
      possession: { home: 58, away: 42 },
      xG: { home: 2.14, away: 1.08 },
      shotsTotal: { home: 14, away: 7 },
      shotsOnTarget: { home: 6, away: 3 },
      shotsOffTarget: { home: 5, away: 3 },
      blockedShots: { home: 3, away: 1 },
      corners: { home: 7, away: 3 },
      fouls: { home: 8, away: 11 },
      yellowCards: { home: 1, away: 2 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 2, away: 1 },
      bigChancesCreated: { home: 3, away: 1 },
      passesTotal: { home: 492, away: 356 },
      passAccuracy: { home: 90, away: 82 },
      attacks: { home: 104, away: 71 },
      dangerousAttacks: { home: 58, away: 32 },
      saves: { home: 2, away: 4 }
    },
    lineups: {
      home: {
        teamId: "mci",
        formation: "4-1-4-1",
        coach: { name: "Pep Guardiola" },
        startingXI: [
          { id: "mci-gk", name: "Ederson", shortName: "Ederson", position: "GK", number: 31, rating: 7.2 },
          { id: "mci-df1", name: "Kyle Walker", shortName: "Walker", position: "DF", number: 2, rating: 7.0 },
          { id: "mci-df2", name: "Rúben Dias", shortName: "Dias", position: "DF", number: 3, rating: 7.4 },
          { id: "mci-df3", name: "Manuel Akanji", shortName: "Akanji", position: "DF", number: 25, rating: 7.1 },
          { id: "mci-df4", name: "Joško Gvardiol", shortName: "Gvardiol", position: "DF", number: 24, rating: 7.5 },
          { id: "mci-mf1", name: "Rodri", shortName: "Rodri", position: "MF", number: 16, rating: 8.4 },
          { id: "mci-mf2", name: "Bernardo Silva", shortName: "B. Silva", position: "MF", number: 20, rating: 7.8 },
          { id: "mci-mf3", name: "Kevin De Bruyne", shortName: "De Bruyne", position: "MF", number: 17, rating: 8.7, captain: true },
          { id: "mci-mf4", name: "Phil Foden", shortName: "Foden", position: "MF", number: 47, rating: 8.5 },
          { id: "mci-mf5", name: "Jérémy Doku", shortName: "Doku", position: "MF", number: 11, rating: 7.3 },
          { id: "mci-fw1", name: "Erling Haaland", shortName: "Haaland", position: "FW", number: 9, rating: 8.6 }
        ],
        substitutes: [
          { id: "mci-sub1", name: "Stefan Ortega", shortName: "Ortega", position: "GK", number: 18 },
          { id: "mci-sub2", name: "John Stones", shortName: "Stones", position: "DF", number: 5 },
          { id: "mci-sub3", name: "Mateo Kovačić", shortName: "Kovačić", position: "MF", number: 8 },
          { id: "mci-sub4", name: "Jack Grealish", shortName: "Grealish", position: "MF", number: 10 }
        ]
      },
      away: {
        teamId: "ars",
        formation: "4-3-3",
        coach: { name: "Mikel Arteta" },
        startingXI: [
          { id: "ars-gk", name: "David Raya", shortName: "Raya", position: "GK", number: 22, rating: 6.8 },
          { id: "ars-df1", name: "Ben White", shortName: "White", position: "DF", number: 4, rating: 6.9 },
          { id: "ars-df2", name: "William Saliba", shortName: "Saliba", position: "DF", number: 2, rating: 7.0 },
          { id: "ars-df3", name: "Gabriel Magalhães", shortName: "Gabriel", position: "DF", number: 6, rating: 7.2 },
          { id: "ars-df4", name: "Jurriën Timber", shortName: "Timber", position: "DF", number: 12, rating: 6.7 },
          { id: "ars-mf1", name: "Thomas Partey", shortName: "Partey", position: "MF", number: 5, rating: 6.9 },
          { id: "ars-mf2", name: "Declan Rice", shortName: "Rice", position: "MF", number: 41, rating: 7.6 },
          { id: "ars-mf3", name: "Martin Ødegaard", shortName: "Ødegaard", position: "MF", number: 8, rating: 7.9, captain: true },
          { id: "ars-fw1", name: "Bukayo Saka", shortName: "Saka", position: "FW", number: 7, rating: 8.1 },
          { id: "ars-fw2", name: "Kai Havertz", shortName: "Havertz", position: "FW", number: 29, rating: 6.8 },
          { id: "ars-fw3", name: "Gabriel Martinelli", shortName: "Martinelli", position: "FW", number: 11, rating: 7.1 }
        ],
        substitutes: [
          { id: "ars-sub1", name: "Neto", shortName: "Neto", position: "GK", number: 32 },
          { id: "ars-sub2", name: "Riccardo Calafiori", shortName: "Calafiori", position: "DF", number: 33 },
          { id: "ars-sub3", name: "Mikel Merino", shortName: "Merino", position: "MF", number: 23 },
          { id: "ars-sub4", name: "Leandro Trossard", shortName: "Trossard", position: "FW", number: 19 }
        ]
      }
    },
    playerStats: [
      { playerId: "mci-fw1", name: "Erling Haaland", teamId: "mci", position: "FW", number: 9, rating: 8.6, goals: 1, assists: 0, shots: 4, shotsOnTarget: 3, passes: 18, passAccuracy: 83, tackles: 1, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "mci-mf3", name: "Kevin De Bruyne", teamId: "mci", position: "MF", number: 17, rating: 8.7, goals: 0, assists: 1, shots: 2, shotsOnTarget: 1, passes: 54, passAccuracy: 89, tackles: 2, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "mci-mf4", name: "Phil Foden", teamId: "mci", position: "MF", number: 47, rating: 8.5, goals: 1, assists: 0, shots: 3, shotsOnTarget: 2, passes: 46, passAccuracy: 91, tackles: 1, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "mci-mf1", name: "Rodri", teamId: "mci", position: "MF", number: 16, rating: 8.4, goals: 0, assists: 1, shots: 1, shotsOnTarget: 0, passes: 76, passAccuracy: 96, tackles: 4, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "mci-mf2", name: "Bernardo Silva", teamId: "mci", position: "MF", number: 20, rating: 7.8, goals: 0, assists: 0, shots: 1, shotsOnTarget: 0, passes: 49, passAccuracy: 92, tackles: 3, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "mci-df4", name: "Joško Gvardiol", teamId: "mci", position: "DF", number: 24, rating: 7.5, goals: 0, assists: 0, shots: 1, shotsOnTarget: 0, passes: 62, passAccuracy: 90, tackles: 3, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "mci-gk", name: "Ederson", teamId: "mci", position: "GK", number: 31, rating: 7.2, goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, passes: 38, passAccuracy: 87, tackles: 0, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "ars-fw1", name: "Bukayo Saka", teamId: "ars", position: "FW", number: 7, rating: 8.1, goals: 1, assists: 0, shots: 3, shotsOnTarget: 2, passes: 29, passAccuracy: 83, tackles: 2, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "ars-mf3", name: "Martin Ødegaard", teamId: "ars", position: "MF", number: 8, rating: 7.9, goals: 0, assists: 1, shots: 2, shotsOnTarget: 1, passes: 48, passAccuracy: 88, tackles: 2, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "ars-mf2", name: "Declan Rice", teamId: "ars", position: "MF", number: 41, rating: 7.6, goals: 0, assists: 0, shots: 1, shotsOnTarget: 0, passes: 52, passAccuracy: 90, tackles: 5, yellowCards: 0, redCards: 0, minutesPlayed: 68 },
      { playerId: "ars-df2", name: "William Saliba", teamId: "ars", position: "DF", number: 2, rating: 7.0, goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, passes: 41, passAccuracy: 93, tackles: 3, yellowCards: 1, redCards: 0, minutesPlayed: 68 },
      { playerId: "ars-gk", name: "David Raya", teamId: "ars", position: "GK", number: 22, rating: 6.8, goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, passes: 32, passAccuracy: 75, tackles: 0, yellowCards: 0, redCards: 0, minutesPlayed: 68 }
    ]
  },
  {
    id: "fix-live-02",
    competition: VERIFIED_COMPETITIONS[1], // UCL
    round: "Quarter-Finals Leg 1",
    homeTeam: TEAMS.rma,
    awayTeam: TEAMS.bay,
    status: "LIVE",
    minute: 45,
    extraMinute: 2,
    startingAt: new Date(Date.now() - 47 * 60000).toISOString(),
    venue: "Santiago Bernabéu, Madrid",
    referee: "Szymon Marciniak",
    score: {
      home: 1,
      away: 1,
      halfTime: { home: 1, away: 1 }
    },
    isLive: true,
    momentum: [
      { minute: 10, value: -40 },
      { minute: 20, value: 50 },
      { minute: 30, value: 75 },
      { minute: 42, value: -60 }
    ],
    events: [
      {
        id: "ev-rma-1",
        fixtureId: "fix-live-02",
        minute: 28,
        type: "goal",
        teamId: "rma",
        player: { id: "p-vinicius", name: "Vinícius Júnior" },
        assistPlayer: { id: "p-bellingham", name: "Jude Bellingham" },
        detail: "Lightning solo counter-attack into the roof of the net"
      },
      {
        id: "ev-bay-1",
        fixtureId: "fix-live-02",
        minute: 43,
        type: "penalty_goal",
        teamId: "bay",
        player: { id: "p-kane", name: "Harry Kane" },
        detail: "Converted penalty sent goalkeeper opposite way"
      }
    ],
    statistics: {
      fixtureId: "fix-live-02",
      possession: { home: 49, away: 51 },
      xG: { home: 1.15, away: 1.42 },
      shotsTotal: { home: 8, away: 9 },
      shotsOnTarget: { home: 4, away: 4 },
      shotsOffTarget: { home: 3, away: 4 },
      blockedShots: { home: 1, away: 1 },
      corners: { home: 4, away: 5 },
      fouls: { home: 6, away: 7 },
      yellowCards: { home: 1, away: 1 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 1, away: 2 },
      bigChancesCreated: { home: 2, away: 2 },
      passesTotal: { home: 260, away: 275 },
      passAccuracy: { home: 88, away: 89 },
      attacks: { home: 54, away: 58 },
      dangerousAttacks: { home: 29, away: 31 },
      saves: { home: 3, away: 3 }
    }
  },
  {
    id: "fix-live-03",
    competition: VERIFIED_COMPETITIONS[2], // La Liga
    round: "Matchday 26",
    homeTeam: TEAMS.bar,
    awayTeam: TEAMS.ata,
    status: "HT",
    minute: 45,
    startingAt: new Date(Date.now() - 55 * 60000).toISOString(),
    venue: "Estadi Olímpic Lluís Companys, Barcelona",
    referee: "Jesús Gil Manzano",
    score: {
      home: 2,
      away: 0,
      halfTime: { home: 2, away: 0 }
    },
    isLive: true,
    events: [
      {
        id: "ev-bar-1",
        fixtureId: "fix-live-03",
        minute: 14,
        type: "goal",
        teamId: "bar",
        player: { id: "p-yamal", name: "Lamine Yamal" },
        assistPlayer: { id: "p-pedri", name: "Pedri" },
        detail: "Wonder strike from 22 yards curl into upper 90"
      },
      {
        id: "ev-bar-2",
        fixtureId: "fix-live-03",
        minute: 37,
        type: "goal",
        teamId: "bar",
        player: { id: "p-lewandowski", name: "Robert Lewandowski" },
        assistPlayer: { id: "p-raphinha", name: "Raphinha" },
        detail: "Header off set-piece delivery"
      }
    ],
    statistics: {
      fixtureId: "fix-live-03",
      possession: { home: 65, away: 35 },
      xG: { home: 1.88, away: 0.32 },
      shotsTotal: { home: 11, away: 3 },
      shotsOnTarget: { home: 5, away: 1 },
      shotsOffTarget: { home: 4, away: 1 },
      blockedShots: { home: 2, away: 1 },
      corners: { home: 6, away: 1 },
      fouls: { home: 5, away: 9 },
      yellowCards: { home: 0, away: 2 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 3, away: 0 },
      bigChancesCreated: { home: 3, away: 0 },
      passesTotal: { home: 340, away: 180 },
      passAccuracy: { home: 92, away: 78 },
      attacks: { home: 68, away: 24 },
      dangerousAttacks: { home: 42, away: 11 },
      saves: { home: 1, away: 3 }
    }
  },
  {
    id: "fix-sched-01",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 28",
    homeTeam: TEAMS.liv,
    awayTeam: TEAMS.che,
    status: "NS",
    startingAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    venue: "Anfield, Liverpool",
    referee: "Anthony Taylor",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-sched-02",
    competition: VERIFIED_COMPETITIONS[3], // Serie A
    round: "Matchday 27",
    homeTeam: TEAMS.int,
    awayTeam: TEAMS.psg,
    status: "NS",
    startingAt: new Date(Date.now() + 5 * 3600000).toISOString(),
    venue: "San Siro, Milan",
    referee: "Daniele Orsato",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-past-01",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 27",
    homeTeam: TEAMS.ars,
    awayTeam: TEAMS.liv,
    status: "FT",
    startingAt: new Date(Date.now() - 86400000).toISOString(),
    venue: "Emirates Stadium, London",
    referee: "Paul Tierney",
    score: {
      home: 2,
      away: 2,
      halfTime: { home: 1, away: 1 },
      fullTime: { home: 2, away: 2 }
    },
    isLive: false,
    events: [
      {
        id: "ev-past-1",
        fixtureId: "fix-past-01",
        minute: 9,
        type: "goal",
        teamId: "ars",
        player: { id: "p-saka", name: "Bukayo Saka" },
        detail: "Powerful near-post drive"
      },
      {
        id: "ev-past-2",
        fixtureId: "fix-past-01",
        minute: 18,
        type: "goal",
        teamId: "liv",
        player: { id: "p-van-dijk", name: "Virgil van Dijk" },
        detail: "Towering header from corner"
      },
      {
        id: "ev-past-3",
        fixtureId: "fix-past-01",
        minute: 43,
        type: "goal",
        teamId: "ars",
        player: { id: "p-merino", name: "Mikel Merino" },
        detail: "Set-piece header"
      },
      {
        id: "ev-past-4",
        fixtureId: "fix-past-01",
        minute: 81,
        type: "goal",
        teamId: "liv",
        player: { id: "p-salah", name: "Mohamed Salah" },
        detail: "First-time low finish into left corner"
      }
    ],
    statistics: {
      fixtureId: "fix-past-01",
      possession: { home: 54, away: 46 },
      xG: { home: 1.72, away: 1.58 },
      shotsTotal: { home: 13, away: 11 },
      shotsOnTarget: { home: 5, away: 4 },
      shotsOffTarget: { home: 5, away: 4 },
      blockedShots: { home: 3, away: 3 },
      corners: { home: 6, away: 5 },
      fouls: { home: 12, away: 13 },
      yellowCards: { home: 2, away: 3 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 2, away: 3 },
      bigChancesCreated: { home: 3, away: 2 },
      passesTotal: { home: 470, away: 405 },
      passAccuracy: { home: 86, away: 83 },
      attacks: { home: 98, away: 88 },
      dangerousAttacks: { home: 51, away: 44 },
      saves: { home: 2, away: 3 }
    },
    playerStats: [
      { playerId: "ars-p-1", name: "Bukayo Saka", teamId: "ars", position: "FW", number: 7, rating: 8.2, goals: 1, assists: 0, shots: 3, shotsOnTarget: 2, passes: 34, passAccuracy: 85, tackles: 2, yellowCards: 0, redCards: 0, minutesPlayed: 90 },
      { playerId: "ars-p-2", name: "Mikel Merino", teamId: "ars", position: "MF", number: 23, rating: 7.7, goals: 1, assists: 0, shots: 2, shotsOnTarget: 1, passes: 44, passAccuracy: 88, tackles: 3, yellowCards: 1, redCards: 0, minutesPlayed: 90 },
      { playerId: "liv-p-1", name: "Virgil van Dijk", teamId: "liv", position: "DF", number: 4, rating: 8.0, goals: 1, assists: 0, shots: 2, shotsOnTarget: 1, passes: 68, passAccuracy: 93, tackles: 4, yellowCards: 0, redCards: 0, minutesPlayed: 90 },
      { playerId: "liv-p-2", name: "Mohamed Salah", teamId: "liv", position: "FW", number: 11, rating: 8.3, goals: 1, assists: 1, shots: 4, shotsOnTarget: 2, passes: 28, passAccuracy: 82, tackles: 1, yellowCards: 0, redCards: 0, minutesPlayed: 90 }
    ]
  },
  {
    id: "fix-pst-01",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 28",
    homeTeam: TEAMS.che,
    awayTeam: TEAMS.new,
    status: "PST",
    startingAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    venue: "Stamford Bridge, London",
    referee: "Stuart Attwell",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-canc-01",
    competition: VERIFIED_COMPETITIONS[4], // Bundesliga
    round: "Matchday 24",
    homeTeam: TEAMS.bay,
    awayTeam: TEAMS.bvb,
    status: "CANC",
    startingAt: new Date(Date.now() - 3600000).toISOString(),
    venue: "Allianz Arena, Munich",
    referee: "Felix Zwayer",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // La Liga: past & upcoming
  {
    id: "fix-laliga-past",
    competition: VERIFIED_COMPETITIONS[2],
    round: "Matchday 26",
    homeTeam: TEAMS.rma,
    awayTeam: TEAMS.bar,
    status: "FT",
    startingAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    venue: "Santiago Bernabéu, Madrid",
    referee: "José María Sánchez Martínez",
    score: { home: 3, away: 2, halfTime: { home: 1, away: 1 }, fullTime: { home: 3, away: 2 } },
    isLive: false,
    events: [
      { id: "ev-ll-1", fixtureId: "fix-laliga-past", minute: 18, type: "goal", teamId: "rma", player: { id: "p-vini", name: "Vinicius Jr" } },
      { id: "ev-ll-2", fixtureId: "fix-laliga-past", minute: 32, type: "goal", teamId: "bar", player: { id: "p-lewa", name: "Robert Lewandowski" } },
      { id: "ev-ll-3", fixtureId: "fix-laliga-past", minute: 69, type: "goal", teamId: "bar", player: { id: "p-raphinha", name: "Raphinha" } },
      { id: "ev-ll-4", fixtureId: "fix-laliga-past", minute: 73, type: "goal", teamId: "rma", player: { id: "p-mbappe", name: "Kylian Mbappé" } },
      { id: "ev-ll-5", fixtureId: "fix-laliga-past", minute: 90, type: "goal", teamId: "rma", player: { id: "p-bellingham", name: "Jude Bellingham" } }
    ]
  },
  {
    id: "fix-laliga-next",
    competition: VERIFIED_COMPETITIONS[2],
    round: "Matchday 28",
    homeTeam: TEAMS.ata,
    awayTeam: TEAMS.rma,
    status: "NS",
    startingAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    venue: "Cívitas Metropolitano, Madrid",
    referee: "Jesús Gil Manzano",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // Serie A: past, live, upcoming
  {
    id: "fix-seriea-live",
    competition: VERIFIED_COMPETITIONS[3],
    round: "Matchday 27",
    homeTeam: TEAMS.nap,
    awayTeam: TEAMS.int,
    status: "LIVE",
    minute: 54,
    startingAt: new Date(Date.now() - 54 * 60000).toISOString(),
    venue: "Stadio Diego Armando Maradona, Naples",
    referee: "Daniele Doveri",
    score: { home: 1, away: 1, halfTime: { home: 1, away: 0 } },
    isLive: true,
    events: [
      { id: "ev-sa-1", fixtureId: "fix-seriea-live", minute: 23, type: "goal", teamId: "nap", player: { id: "p-kvara", name: "Khvicha Kvaratskhelia" } },
      { id: "ev-sa-2", fixtureId: "fix-seriea-live", minute: 51, type: "goal", teamId: "int", player: { id: "p-lautaro", name: "Lautaro Martínez" } }
    ],
    statistics: {
      fixtureId: "fix-seriea-live",
      possession: { home: 48, away: 52 },
      xG: { home: 1.15, away: 1.42 },
      shotsTotal: { home: 8, away: 10 },
      shotsOnTarget: { home: 4, away: 5 },
      shotsOffTarget: { home: 3, away: 3 },
      blockedShots: { home: 1, away: 2 },
      corners: { home: 4, away: 6 },
      fouls: { home: 9, away: 8 },
      yellowCards: { home: 1, away: 2 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 1, away: 2 },
      bigChancesCreated: { home: 2, away: 2 },
      passesTotal: { home: 320, away: 350 },
      passAccuracy: { home: 84, away: 86 },
      attacks: { home: 54, away: 62 },
      dangerousAttacks: { home: 28, away: 34 },
      saves: { home: 4, away: 3 }
    }
  },
  {
    id: "fix-seriea-past",
    competition: VERIFIED_COMPETITIONS[3],
    round: "Matchday 26",
    homeTeam: TEAMS.juv,
    awayTeam: TEAMS.mil,
    status: "FT",
    startingAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    venue: "Allianz Stadium, Turin",
    referee: "Maurizio Mariani",
    score: { home: 2, away: 0, halfTime: { home: 1, away: 0 }, fullTime: { home: 2, away: 0 } },
    isLive: false,
    events: [
      { id: "ev-sa-p1", fixtureId: "fix-seriea-past", minute: 34, type: "goal", teamId: "juv", player: { id: "p-vlahovic", name: "Dušan Vlahović" } },
      { id: "ev-sa-p2", fixtureId: "fix-seriea-past", minute: 78, type: "goal", teamId: "juv", player: { id: "p-koop", name: "Teun Koopmeiners" } }
    ]
  },
  // Bundesliga: past & upcoming
  {
    id: "fix-bunda-past",
    competition: VERIFIED_COMPETITIONS[4],
    round: "Matchday 23",
    homeTeam: TEAMS.lev,
    awayTeam: TEAMS.bay,
    status: "FT",
    startingAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    venue: "BayArena, Leverkusen",
    referee: "Daniel Siebert",
    score: { home: 2, away: 2, halfTime: { home: 1, away: 1 }, fullTime: { home: 2, away: 2 } },
    isLive: false,
    events: [
      { id: "ev-bl-1", fixtureId: "fix-bunda-past", minute: 15, type: "goal", teamId: "bay", player: { id: "p-kane", name: "Harry Kane" } },
      { id: "ev-bl-2", fixtureId: "fix-bunda-past", minute: 42, type: "goal", teamId: "lev", player: { id: "p-wirtz", name: "Florian Wirtz" } },
      { id: "ev-bl-3", fixtureId: "fix-bunda-past", minute: 61, type: "goal", teamId: "bay", player: { id: "p-musiala", name: "Jamal Musiala" } },
      { id: "ev-bl-4", fixtureId: "fix-bunda-past", minute: 88, type: "goal", teamId: "lev", player: { id: "p-boniface", name: "Victor Boniface" } }
    ]
  },
  {
    id: "fix-bunda-next",
    competition: VERIFIED_COMPETITIONS[4],
    round: "Matchday 25",
    homeTeam: TEAMS.bvb,
    awayTeam: TEAMS.rbl,
    status: "NS",
    startingAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    venue: "Signal Iduna Park, Dortmund",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // Ligue 1: past, today, upcoming
  {
    id: "fix-ligue1-past",
    competition: VERIFIED_COMPETITIONS[5],
    round: "Matchday 22",
    homeTeam: TEAMS.mar,
    awayTeam: TEAMS.psg,
    status: "FT",
    startingAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    venue: "Stade Vélodrome, Marseille",
    referee: "François Letexier",
    score: { home: 0, away: 3, halfTime: { home: 0, away: 2 }, fullTime: { home: 0, away: 3 } },
    isLive: false,
    events: [
      { id: "ev-l1-1", fixtureId: "fix-ligue1-past", minute: 7, type: "goal", teamId: "psg", player: { id: "p-neves", name: "João Neves" } },
      { id: "ev-l1-2", fixtureId: "fix-ligue1-past", minute: 29, type: "own_goal", teamId: "psg", player: { id: "p-balerdi", name: "Leonardo Balerdi" } },
      { id: "ev-l1-3", fixtureId: "fix-ligue1-past", minute: 40, type: "goal", teamId: "psg", player: { id: "p-barcola", name: "Bradley Barcola" } }
    ]
  },
  {
    id: "fix-ligue1-next",
    competition: VERIFIED_COMPETITIONS[5],
    round: "Matchday 24",
    homeTeam: TEAMS.psg,
    awayTeam: TEAMS.mon,
    status: "NS",
    startingAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    venue: "Parc des Princes, Paris",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // World Cup: past, today, upcoming
  {
    id: "fix-wc-past",
    competition: VERIFIED_COMPETITIONS[6],
    round: "Qualifiers Matchday 12",
    homeTeam: TEAMS.arg,
    awayTeam: TEAMS.bra,
    status: "FT",
    startingAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    venue: "Estadio Monumental, Buenos Aires",
    referee: "Piero Maza",
    score: { home: 1, away: 0, halfTime: { home: 0, away: 0 }, fullTime: { home: 1, away: 0 } },
    isLive: false,
    events: [
      { id: "ev-wc-1", fixtureId: "fix-wc-past", minute: 63, type: "goal", teamId: "arg", player: { id: "p-otamendi", name: "Nicolás Otamendi" } }
    ]
  },
  {
    id: "fix-wc-next",
    competition: VERIFIED_COMPETITIONS[6],
    round: "Qualifiers Matchday 13",
    homeTeam: TEAMS.bra,
    awayTeam: TEAMS.col,
    status: "NS",
    startingAt: new Date(Date.now() + 6 * 86400000).toISOString(),
    venue: "Maracanã, Rio de Janeiro",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // Europa League: past & upcoming
  {
    id: "fix-uel-past",
    competition: VERIFIED_COMPETITIONS[7],
    round: "Matchday 8",
    homeTeam: TEAMS.che,
    awayTeam: TEAMS.sge,
    status: "FT",
    startingAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    venue: "Stamford Bridge, London",
    score: { home: 3, away: 1, halfTime: { home: 2, away: 0 }, fullTime: { home: 3, away: 1 } },
    isLive: false,
    events: [
      { id: "ev-uel-1", fixtureId: "fix-uel-past", minute: 14, type: "goal", teamId: "che", player: { id: "p-palmer", name: "Cole Palmer" } },
      { id: "ev-uel-2", fixtureId: "fix-uel-past", minute: 38, type: "goal", teamId: "che", player: { id: "p-nkunku", name: "Christopher Nkunku" } },
      { id: "ev-uel-3", fixtureId: "fix-uel-past", minute: 67, type: "goal", teamId: "sge", player: { id: "p-marmoush", name: "Omar Marmoush" } },
      { id: "ev-uel-4", fixtureId: "fix-uel-past", minute: 82, type: "goal", teamId: "che", player: { id: "p-jackson", name: "Nicolas Jackson" } }
    ]
  },
  {
    id: "fix-uel-next",
    competition: VERIFIED_COMPETITIONS[7],
    round: "Round of 16",
    homeTeam: TEAMS.sge,
    awayTeam: TEAMS.che,
    status: "NS",
    startingAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    venue: "Deutsche Bank Park, Frankfurt",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // --- TOMORROW FIXTURES (+24 to +36 hrs) ---
  {
    id: "fix-tmrw-01",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 29",
    homeTeam: TEAMS.che,
    awayTeam: TEAMS.ars,
    status: "NS",
    startingAt: new Date(Date.now() + 26 * 3600000).toISOString(),
    venue: "Stamford Bridge, London",
    referee: "Michael Oliver",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-tmrw-02",
    competition: VERIFIED_COMPETITIONS[1], // UCL
    round: "Quarter-Finals Leg 2",
    homeTeam: TEAMS.bar,
    awayTeam: TEAMS.bay,
    status: "NS",
    startingAt: new Date(Date.now() + 29 * 3600000).toISOString(),
    venue: "Estadi Olímpic Lluís Companys, Barcelona",
    referee: "Clément Turpin",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-tmrw-03",
    competition: VERIFIED_COMPETITIONS[3], // Serie A
    round: "Matchday 28",
    homeTeam: TEAMS.juv,
    awayTeam: TEAMS.mil,
    status: "NS",
    startingAt: new Date(Date.now() + 25 * 3600000).toISOString(),
    venue: "Allianz Stadium, Turin",
    referee: "Daniele Orsato",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // --- THIS WEEK FIXTURES (+2 to +6 days) ---
  {
    id: "fix-thisweek-01",
    competition: VERIFIED_COMPETITIONS[1], // UCL
    round: "Quarter-Finals Leg 2",
    homeTeam: TEAMS.mci,
    awayTeam: TEAMS.rma,
    status: "NS",
    startingAt: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(),
    venue: "Etihad Stadium, Manchester",
    referee: "Szymon Marciniak",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-thisweek-02",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 29",
    homeTeam: TEAMS.liv,
    awayTeam: TEAMS.new,
    status: "NS",
    startingAt: new Date(Date.now() + 3 * 86400000 + 2 * 3600000).toISOString(),
    venue: "Anfield, Liverpool",
    referee: "Anthony Taylor",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-thisweek-03",
    competition: VERIFIED_COMPETITIONS[4], // Bundesliga
    round: "Matchday 25",
    homeTeam: TEAMS.lev,
    awayTeam: TEAMS.bvb,
    status: "NS",
    startingAt: new Date(Date.now() + 4 * 86400000 + 3 * 3600000).toISOString(),
    venue: "BayArena, Leverkusen",
    referee: "Daniel Siebert",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-thisweek-04",
    competition: VERIFIED_COMPETITIONS[3], // Serie A
    round: "Matchday 28",
    homeTeam: TEAMS.int,
    awayTeam: TEAMS.nap,
    status: "NS",
    startingAt: new Date(Date.now() + 5 * 86400000 + 5 * 3600000).toISOString(),
    venue: "San Siro, Milan",
    referee: "Maurizio Mariani",
    score: { home: 0, away: 0 },
    isLive: false
  },
  // --- NEXT WEEK FIXTURES (+7 to +14 days) ---
  {
    id: "fix-nextweek-01",
    competition: VERIFIED_COMPETITIONS[1], // UCL
    round: "Semi-Finals Leg 1",
    homeTeam: TEAMS.bay,
    awayTeam: TEAMS.psg,
    status: "NS",
    startingAt: new Date(Date.now() + 7 * 86400000 + 4 * 3600000).toISOString(),
    venue: "Allianz Arena, Munich",
    referee: "Felix Zwayer",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-nextweek-02",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 30",
    homeTeam: TEAMS.ars,
    awayTeam: TEAMS.mci,
    status: "NS",
    startingAt: new Date(Date.now() + 8 * 86400000 + 2 * 3600000).toISOString(),
    venue: "Emirates Stadium, London",
    referee: "Michael Oliver",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-nextweek-03",
    competition: VERIFIED_COMPETITIONS[2], // La Liga
    round: "Matchday 29",
    homeTeam: TEAMS.ata,
    awayTeam: TEAMS.bar,
    status: "NS",
    startingAt: new Date(Date.now() + 9 * 86400000 + 3 * 3600000).toISOString(),
    venue: "Cívitas Metropolitano, Madrid",
    referee: "Jesús Gil Manzano",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-nextweek-04",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    round: "Matchday 30",
    homeTeam: TEAMS.liv,
    awayTeam: TEAMS.che,
    status: "NS",
    startingAt: new Date(Date.now() + 10 * 86400000 + 1 * 3600000).toISOString(),
    venue: "Anfield, Liverpool",
    referee: "Paul Tierney",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-nextweek-05",
    competition: VERIFIED_COMPETITIONS[3], // Serie A
    round: "Matchday 29",
    homeTeam: TEAMS.mil,
    awayTeam: TEAMS.int,
    status: "NS",
    startingAt: new Date(Date.now() + 11 * 86400000 + 5 * 3600000).toISOString(),
    venue: "San Siro, Milan (Derby della Madonnina)",
    referee: "Daniele Doveri",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-nextweek-06",
    competition: VERIFIED_COMPETITIONS[4], // Bundesliga
    round: "Matchday 26",
    homeTeam: TEAMS.bvb,
    awayTeam: TEAMS.bay,
    status: "NS",
    startingAt: new Date(Date.now() + 12 * 86400000 + 3 * 3600000).toISOString(),
    venue: "Signal Iduna Park, Dortmund (Der Klassiker)",
    referee: "Daniel Siebert",
    score: { home: 0, away: 0 },
    isLive: false
  },
  {
    id: "fix-nextweek-07",
    competition: VERIFIED_COMPETITIONS[6], // World Cup
    round: "Super Showdown Friendly",
    homeTeam: TEAMS.arg,
    awayTeam: TEAMS.fra,
    status: "NS",
    startingAt: new Date(Date.now() + 13 * 86400000 + 4 * 3600000).toISOString(),
    venue: "Estadio Monumental, Buenos Aires",
    referee: "Wilton Sampaio",
    score: { home: 0, away: 0 },
    isLive: false
  }
];

export const STANDINGS_DATA: Record<string, LeagueStandings> = {
  epl: {
    competition: VERIFIED_COMPETITIONS[0],
    season: "2024/25",
    table: [
      { position: 1, team: TEAMS.liv, played: 28, won: 20, drawn: 6, lost: 2, goalsFor: 64, goalsAgainst: 22, goalDifference: 42, points: 66, form: ['W', 'W', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 2, team: TEAMS.ars, played: 28, won: 18, drawn: 7, lost: 3, goalsFor: 57, goalsAgainst: 21, goalDifference: 36, points: 61, form: ['W', 'D', 'W', 'W', 'L'], zone: 'ucl' },
      { position: 3, team: TEAMS.mci, played: 28, won: 17, drawn: 6, lost: 5, goalsFor: 61, goalsAgainst: 28, goalDifference: 33, points: 57, form: ['W', 'W', 'L', 'W', 'W'], zone: 'ucl' },
      { position: 4, team: TEAMS.che, played: 28, won: 15, drawn: 6, lost: 7, goalsFor: 52, goalsAgainst: 34, goalDifference: 18, points: 51, form: ['L', 'W', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 5, team: { id: "not", name: "Nottingham Forest", shortName: "Nottm Forest", code: "NFO", logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg" }, played: 28, won: 14, drawn: 6, lost: 8, goalsFor: 41, goalsAgainst: 33, goalDifference: 8, points: 48, form: ['W', 'L', 'W', 'L', 'W'], zone: 'uel' },
      { position: 6, team: { id: "ast", name: "Aston Villa", shortName: "Aston Villa", code: "AVL", logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg" }, played: 28, won: 13, drawn: 7, lost: 8, goalsFor: 44, goalsAgainst: 40, goalDifference: 4, points: 46, form: ['D', 'W', 'L', 'W', 'D'], zone: 'uecl' },
      { position: 7, team: { id: "new", name: "Newcastle United", shortName: "Newcastle", code: "NEW", logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg" }, played: 28, won: 13, drawn: 5, lost: 10, goalsFor: 46, goalsAgainst: 36, goalDifference: 10, points: 44, form: ['W', 'L', 'W', 'W', 'L'] },
      { position: 8, team: { id: "ful", name: "Fulham", shortName: "Fulham", code: "FUL", logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg" }, played: 28, won: 11, drawn: 9, lost: 8, goalsFor: 39, goalsAgainst: 35, goalDifference: 4, points: 42, form: ['W', 'W', 'D', 'L', 'D'] },
      { position: 9, team: { id: "tot", name: "Tottenham Hotspur", shortName: "Tottenham", code: "TOT", logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg" }, played: 28, won: 12, drawn: 4, lost: 12, goalsFor: 56, goalsAgainst: 42, goalDifference: 14, points: 40, form: ['L', 'L', 'W', 'L', 'W'] },
      { position: 10, team: { id: "mun", name: "Manchester United", shortName: "Man Utd", code: "MUN", logoUrl: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" }, played: 28, won: 10, drawn: 6, lost: 12, goalsFor: 35, goalsAgainst: 39, goalDifference: -4, points: 36, form: ['L', 'D', 'L', 'W', 'L'] },
      { position: 18, team: { id: "ips", name: "Ipswich Town", shortName: "Ipswich", code: "IPS", logoUrl: "https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg" }, played: 28, won: 3, drawn: 8, lost: 17, goalsFor: 27, goalsAgainst: 55, goalDifference: -28, points: 17, form: ['L', 'L', 'D', 'L', 'L'], zone: 'relegation' },
      { position: 19, team: { id: "lei", name: "Leicester City", shortName: "Leicester", code: "LEI", logoUrl: "https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg" }, played: 28, won: 4, drawn: 5, lost: 19, goalsFor: 29, goalsAgainst: 61, goalDifference: -32, points: 17, form: ['L', 'L', 'L', 'L', 'L'], zone: 'relegation' },
      { position: 20, team: { id: "sou", name: "Southampton", shortName: "Southampton", code: "SOU", logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg" }, played: 28, won: 2, drawn: 3, lost: 23, goalsFor: 19, goalsAgainst: 66, goalDifference: -47, points: 9, form: ['L', 'L', 'L', 'L', 'L'], zone: 'relegation' }
    ]
  },
  laliga: {
    competition: VERIFIED_COMPETITIONS[2],
    season: "2024/25",
    table: [
      { position: 1, team: TEAMS.bar, played: 27, won: 20, drawn: 3, lost: 4, goalsFor: 72, goalsAgainst: 26, goalDifference: 46, points: 63, form: ['W', 'W', 'W', 'W', 'D'], zone: 'ucl' },
      { position: 2, team: TEAMS.rma, played: 27, won: 18, drawn: 6, lost: 3, goalsFor: 58, goalsAgainst: 23, goalDifference: 35, points: 60, form: ['W', 'D', 'W', 'W', 'W'], zone: 'ucl' },
      { position: 3, team: TEAMS.ata, played: 27, won: 17, drawn: 6, lost: 4, goalsFor: 44, goalsAgainst: 18, goalDifference: 26, points: 57, form: ['W', 'W', 'D', 'L', 'W'], zone: 'ucl' },
      { position: 4, team: { id: "ath", name: "Athletic Club", shortName: "Athletic", code: "ATH", logoUrl: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg" }, played: 27, won: 14, drawn: 7, lost: 6, goalsFor: 43, goalsAgainst: 25, goalDifference: 18, points: 49, form: ['W', 'D', 'W', 'W', 'D'], zone: 'ucl' }
    ]
  },
  ucl: {
    competition: VERIFIED_COMPETITIONS[1],
    season: "2024/25",
    table: [
      { position: 1, team: TEAMS.liv, played: 8, won: 7, drawn: 0, lost: 1, goalsFor: 17, goalsAgainst: 4, goalDifference: 13, points: 21, form: ['W', 'W', 'W', 'L', 'W'], zone: 'ucl' },
      { position: 2, team: TEAMS.bar, played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 28, goalsAgainst: 13, goalDifference: 15, points: 19, form: ['W', 'W', 'W', 'W', 'D'], zone: 'ucl' },
      { position: 3, team: TEAMS.ars, played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 16, goalsAgainst: 3, goalDifference: 13, points: 19, form: ['W', 'W', 'W', 'W', 'W'], zone: 'ucl' },
      { position: 4, team: TEAMS.int, played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 11, goalsAgainst: 1, goalDifference: 10, points: 19, form: ['W', 'W', 'D', 'W', 'W'], zone: 'ucl' },
      { position: 5, team: TEAMS.ata, played: 8, won: 6, drawn: 0, lost: 2, goalsFor: 20, goalsAgainst: 12, goalDifference: 8, points: 18, form: ['W', 'W', 'W', 'W', 'W'], zone: 'ucl' },
      { position: 6, team: TEAMS.bay, played: 8, won: 5, drawn: 0, lost: 3, goalsFor: 20, goalsAgainst: 11, goalDifference: 9, points: 15, form: ['W', 'W', 'L', 'W', 'W'], zone: 'ucl' }
    ]
  },
  seriea: {
    competition: VERIFIED_COMPETITIONS[3],
    season: "2024/25",
    table: [
      { position: 1, team: TEAMS.int, played: 26, won: 18, drawn: 3, lost: 5, goalsFor: 59, goalsAgainst: 24, goalDifference: 35, points: 57, form: ['W', 'W', 'D', 'W', 'W'], zone: 'ucl' },
      { position: 2, team: TEAMS.nap, played: 26, won: 17, drawn: 5, lost: 4, goalsFor: 44, goalsAgainst: 20, goalDifference: 24, points: 56, form: ['W', 'D', 'W', 'W', 'D'], zone: 'ucl' },
      { position: 3, team: TEAMS.ata_it, played: 26, won: 17, drawn: 3, lost: 6, goalsFor: 61, goalsAgainst: 25, goalDifference: 36, points: 54, form: ['W', 'W', 'W', 'L', 'W'], zone: 'ucl' },
      { position: 4, team: TEAMS.juv, played: 26, won: 13, drawn: 13, lost: 0, goalsFor: 45, goalsAgainst: 21, goalDifference: 24, points: 52, form: ['D', 'W', 'D', 'W', 'D'], zone: 'ucl' },
      { position: 5, team: { id: "laz", name: "SS Lazio", shortName: "Lazio", code: "LAZ", logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg" }, played: 26, won: 15, drawn: 3, lost: 8, goalsFor: 47, goalsAgainst: 33, goalDifference: 14, points: 48, form: ['L', 'W', 'W', 'D', 'W'], zone: 'uel' },
      { position: 6, team: TEAMS.mil, played: 26, won: 12, drawn: 6, lost: 8, goalsFor: 41, goalsAgainst: 29, goalDifference: 12, points: 42, form: ['W', 'L', 'W', 'D', 'L'], zone: 'uecl' }
    ]
  },
  bundesliga: {
    competition: VERIFIED_COMPETITIONS[4],
    season: "2024/25",
    table: [
      { position: 1, team: TEAMS.bay, played: 23, won: 18, drawn: 4, lost: 1, goalsFor: 68, goalsAgainst: 19, goalDifference: 49, points: 58, form: ['W', 'W', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 2, team: TEAMS.lev, played: 23, won: 15, drawn: 6, lost: 2, goalsFor: 54, goalsAgainst: 26, goalDifference: 28, points: 51, form: ['W', 'D', 'W', 'W', 'D'], zone: 'ucl' },
      { position: 3, team: TEAMS.sge, played: 23, won: 13, drawn: 4, lost: 6, goalsFor: 49, goalsAgainst: 34, goalDifference: 15, points: 43, form: ['W', 'W', 'L', 'W', 'L'], zone: 'ucl' },
      { position: 4, team: TEAMS.rbl, played: 23, won: 12, drawn: 6, lost: 5, goalsFor: 41, goalsAgainst: 27, goalDifference: 14, points: 42, form: ['D', 'W', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 5, team: TEAMS.bvb, played: 23, won: 10, drawn: 4, lost: 9, goalsFor: 42, goalsAgainst: 36, goalDifference: 6, points: 34, form: ['L', 'W', 'L', 'L', 'W'], zone: 'uel' }
    ]
  },
  ligue1: {
    competition: VERIFIED_COMPETITIONS[5],
    season: "2024/25",
    table: [
      { position: 1, team: TEAMS.psg, played: 23, won: 18, drawn: 5, lost: 0, goalsFor: 62, goalsAgainst: 20, goalDifference: 42, points: 59, form: ['W', 'W', 'W', 'W', 'W'], zone: 'ucl' },
      { position: 2, team: TEAMS.mon, played: 23, won: 13, drawn: 4, lost: 6, goalsFor: 43, goalsAgainst: 26, goalDifference: 17, points: 43, form: ['W', 'L', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 3, team: TEAMS.mar, played: 23, won: 13, drawn: 4, lost: 6, goalsFor: 48, goalsAgainst: 29, goalDifference: 19, points: 43, form: ['L', 'W', 'W', 'W', 'L'], zone: 'ucl' },
      { position: 4, team: TEAMS.lil, played: 23, won: 11, drawn: 8, lost: 4, goalsFor: 38, goalsAgainst: 23, goalDifference: 15, points: 41, form: ['D', 'W', 'D', 'W', 'D'], zone: 'uel' }
    ]
  },
  worldcup: {
    competition: VERIFIED_COMPETITIONS[6],
    season: "2026",
    table: [
      { position: 1, team: TEAMS.arg, played: 12, won: 8, drawn: 1, lost: 3, goalsFor: 21, goalsAgainst: 7, goalDifference: 14, points: 25, form: ['W', 'L', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 2, team: { id: "uru", name: "Uruguay", shortName: "Uruguay", code: "URU", logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/ee/Uruguay_national_football_team_crest.svg" }, played: 12, won: 5, drawn: 5, lost: 2, goalsFor: 16, goalsAgainst: 9, goalDifference: 7, points: 20, form: ['D', 'D', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 3, team: { id: "col", name: "Colombia", shortName: "Colombia", code: "COL", logoUrl: "https://upload.wikimedia.org/wikipedia/en/6/67/Colombian_Football_Federation_logo.svg" }, played: 12, won: 5, drawn: 4, lost: 3, goalsFor: 15, goalsAgainst: 10, goalDifference: 5, points: 19, form: ['L', 'L', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 4, team: TEAMS.bra, played: 12, won: 5, drawn: 3, lost: 4, goalsFor: 17, goalsAgainst: 11, goalDifference: 6, points: 18, form: ['D', 'D', 'W', 'W', 'L'], zone: 'ucl' }
    ]
  },
  uel: {
    competition: VERIFIED_COMPETITIONS[7],
    season: "2024/25",
    table: [
      { position: 1, team: { id: "laz", name: "SS Lazio", shortName: "Lazio", code: "LAZ", logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg" }, played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 17, goalsAgainst: 5, goalDifference: 12, points: 19, form: ['W', 'W', 'D', 'W', 'W'], zone: 'ucl' },
      { position: 2, team: { id: "ath", name: "Athletic Club", shortName: "Athletic", code: "ATH", logoUrl: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg" }, played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 15, goalsAgainst: 6, goalDifference: 9, points: 19, form: ['W', 'W', 'W', 'D', 'W'], zone: 'ucl' },
      { position: 3, team: TEAMS.sge, played: 8, won: 5, drawn: 2, lost: 1, goalsFor: 16, goalsAgainst: 10, goalDifference: 6, points: 17, form: ['W', 'D', 'W', 'W', 'L'], zone: 'ucl' },
      { position: 4, team: TEAMS.che, played: 8, won: 5, drawn: 1, lost: 2, goalsFor: 19, goalsAgainst: 8, goalDifference: 11, points: 16, form: ['W', 'W', 'L', 'W', 'W'], zone: 'ucl' }
    ]
  }
};

export const TOP_SCORERS_DATA: Record<string, TopScorer[]> = {
  epl: [
    { position: 1, player: { id: "p-haaland", name: "Erling Haaland", shortName: "Haaland", position: "FW", number: 9, photoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&auto=format&fit=crop" }, team: TEAMS.mci, appearances: 24, goals: 21, assists: 3, penalties: 2 },
    { position: 2, player: { id: "p-salah", name: "Mohamed Salah", shortName: "Salah", position: "FW", number: 11 }, team: TEAMS.liv, appearances: 28, goals: 19, assists: 13, penalties: 4 },
    { position: 3, player: { id: "p-palmer", name: "Cole Palmer", shortName: "Palmer", position: "MF", number: 20 }, team: TEAMS.che, appearances: 27, goals: 14, assists: 8, penalties: 5 },
    { position: 4, player: { id: "p-isak", name: "Alexander Isak", shortName: "Isak", position: "FW", number: 14 }, team: { id: "new", name: "Newcastle United", shortName: "Newcastle", code: "NEW", logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg" }, appearances: 23, goals: 13, assists: 2, penalties: 2 },
    { position: 5, player: { id: "p-saka", name: "Bukayo Saka", shortName: "Saka", position: "FW", number: 7 }, team: TEAMS.ars, appearances: 26, goals: 12, assists: 10, penalties: 1 }
  ],
  laliga: [
    { position: 1, player: { id: "p-lewa", name: "Robert Lewandowski", shortName: "Lewandowski", position: "FW", number: 9 }, team: TEAMS.bar, appearances: 26, goals: 20, assists: 4, penalties: 3 },
    { position: 2, player: { id: "p-mbappe", name: "Kylian Mbappé", shortName: "Mbappé", position: "FW", number: 9 }, team: TEAMS.rma, appearances: 25, goals: 17, assists: 5, penalties: 4 },
    { position: 3, player: { id: "p-raphinha", name: "Raphinha", shortName: "Raphinha", position: "FW", number: 11 }, team: TEAMS.bar, appearances: 25, goals: 14, assists: 8, penalties: 1 },
    { position: 4, player: { id: "p-vini", name: "Vinícius Júnior", shortName: "Vinicius Jr", position: "FW", number: 7 }, team: TEAMS.rma, appearances: 24, goals: 13, assists: 7, penalties: 2 },
    { position: 5, player: { id: "p-budimir", name: "Ante Budimir", shortName: "Budimir", position: "FW", number: 17 }, team: { id: "osa", name: "CA Osasuna", shortName: "Osasuna", code: "OSA", logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/db/Osasuna_logo.svg" }, appearances: 26, goals: 12, assists: 2, penalties: 3 }
  ],
  seriea: [
    { position: 1, player: { id: "p-retegui", name: "Mateo Retegui", shortName: "Retegui", position: "FW", number: 32 }, team: TEAMS.ata_it, appearances: 25, goals: 18, assists: 4, penalties: 2 },
    { position: 2, player: { id: "p-thuram", name: "Marcus Thuram", shortName: "Thuram", position: "FW", number: 9 }, team: TEAMS.int, appearances: 24, goals: 13, assists: 5, penalties: 0 },
    { position: 3, player: { id: "p-vlahovic", name: "Dušan Vlahović", shortName: "Vlahovic", position: "FW", number: 9 }, team: TEAMS.juv, appearances: 24, goals: 11, assists: 2, penalties: 3 },
    { position: 4, player: { id: "p-lautaro", name: "Lautaro Martínez", shortName: "Lautaro", position: "FW", number: 10 }, team: TEAMS.int, appearances: 23, goals: 10, assists: 3, penalties: 1 },
    { position: 5, player: { id: "p-lookman", name: "Ademola Lookman", shortName: "Lookman", position: "FW", number: 11 }, team: TEAMS.ata_it, appearances: 22, goals: 9, assists: 6, penalties: 1 }
  ],
  bundesliga: [
    { position: 1, player: { id: "p-kane", name: "Harry Kane", shortName: "Kane", position: "FW", number: 9 }, team: TEAMS.bay, appearances: 23, goals: 22, assists: 8, penalties: 5 },
    { position: 2, player: { id: "p-marmoush", name: "Omar Marmoush", shortName: "Marmoush", position: "FW", number: 7 }, team: TEAMS.sge, appearances: 22, goals: 15, assists: 9, penalties: 2 },
    { position: 3, player: { id: "p-guirassy", name: "Serhou Guirassy", shortName: "Guirassy", position: "FW", number: 9 }, team: TEAMS.bvb, appearances: 20, goals: 13, assists: 2, penalties: 1 },
    { position: 4, player: { id: "p-openda", name: "Loïs Openda", shortName: "Openda", position: "FW", number: 11 }, team: TEAMS.rbl, appearances: 22, goals: 11, assists: 4, penalties: 0 },
    { position: 5, player: { id: "p-wirtz", name: "Florian Wirtz", shortName: "Wirtz", position: "MF", number: 10 }, team: TEAMS.lev, appearances: 22, goals: 9, assists: 10, penalties: 1 }
  ],
  ligue1: [
    { position: 1, player: { id: "p-barcola", name: "Bradley Barcola", shortName: "Barcola", position: "FW", number: 29 }, team: TEAMS.psg, appearances: 24, goals: 14, assists: 6, penalties: 0 },
    { position: 2, player: { id: "p-david", name: "Jonathan David", shortName: "David", position: "FW", number: 9 }, team: TEAMS.lil, appearances: 23, goals: 12, assists: 2, penalties: 2 },
    { position: 3, player: { id: "p-greenwood", name: "Mason Greenwood", shortName: "Greenwood", position: "FW", number: 10 }, team: TEAMS.mar, appearances: 23, goals: 11, assists: 4, penalties: 2 },
    { position: 4, player: { id: "p-dembele", name: "Ousmane Dembélé", shortName: "Dembélé", position: "FW", number: 10 }, team: TEAMS.psg, appearances: 22, goals: 8, assists: 7, penalties: 1 },
    { position: 5, player: { id: "p-lacazette", name: "Alexandre Lacazette", shortName: "Lacazette", position: "FW", number: 10 }, team: { id: "ol", name: "Olympique Lyonnais", shortName: "Lyon", code: "OL", logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg" }, appearances: 22, goals: 8, assists: 3, penalties: 2 }
  ],
  ucl: [
    { position: 1, player: { id: "p-lewa", name: "Robert Lewandowski", shortName: "Lewandowski", position: "FW", number: 9 }, team: TEAMS.bar, appearances: 8, goals: 9, assists: 1, penalties: 1 },
    { position: 2, player: { id: "p-raphinha", name: "Raphinha", shortName: "Raphinha", position: "FW", number: 11 }, team: TEAMS.bar, appearances: 8, goals: 8, assists: 4, penalties: 0 },
    { position: 3, player: { id: "p-kane", name: "Harry Kane", shortName: "Kane", position: "FW", number: 9 }, team: TEAMS.bay, appearances: 8, goals: 7, assists: 2, penalties: 3 },
    { position: 4, player: { id: "p-haaland", name: "Erling Haaland", shortName: "Haaland", position: "FW", number: 9 }, team: TEAMS.mci, appearances: 7, goals: 6, assists: 1, penalties: 1 },
    { position: 5, player: { id: "p-vini", name: "Vinícius Júnior", shortName: "Vinicius Jr", position: "FW", number: 7 }, team: TEAMS.rma, appearances: 8, goals: 6, assists: 3, penalties: 1 }
  ],
  worldcup: [
    { position: 1, player: { id: "p-messi", name: "Lionel Messi", shortName: "Messi", position: "FW", number: 10 }, team: TEAMS.arg, appearances: 11, goals: 8, assists: 4, penalties: 1 },
    { position: 2, player: { id: "p-nunez", name: "Darwin Núñez", shortName: "Núñez", position: "FW", number: 9 }, team: { id: "uru", name: "Uruguay", shortName: "Uruguay", code: "URU", logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/ee/Uruguay_national_football_team_crest.svg" }, appearances: 10, goals: 6, assists: 2, penalties: 0 },
    { position: 3, player: { id: "p-diaz", name: "Luis Díaz", shortName: "Díaz", position: "FW", number: 7 }, team: { id: "col", name: "Colombia", shortName: "Colombia", code: "COL", logoUrl: "https://upload.wikimedia.org/wikipedia/en/6/67/Colombian_Football_Federation_logo.svg" }, appearances: 11, goals: 5, assists: 1, penalties: 0 },
    { position: 4, player: { id: "p-rodrygo", name: "Rodrygo Goes", shortName: "Rodrygo", position: "FW", number: 10 }, team: TEAMS.bra, appearances: 10, goals: 4, assists: 2, penalties: 0 },
    { position: 5, player: { id: "p-alvarez", name: "Julián Álvarez", shortName: "Álvarez", position: "FW", number: 9 }, team: TEAMS.arg, appearances: 11, goals: 4, assists: 3, penalties: 0 }
  ],
  uel: [
    { position: 1, player: { id: "p-kaabi", name: "Ayoub El Kaabi", shortName: "El Kaabi", position: "FW", number: 9 }, team: { id: "oly", name: "Olympiacos FC", shortName: "Olympiacos", code: "OLY", logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f1/Olympiacos_FC_logo.svg" }, appearances: 8, goals: 7, assists: 1, penalties: 2 },
    { position: 2, player: { id: "p-hojlund", name: "Rasmus Højlund", shortName: "Højlund", position: "FW", number: 9 }, team: { id: "mun", name: "Manchester United", shortName: "Man Utd", code: "MUN", logoUrl: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" }, appearances: 7, goals: 5, assists: 1, penalties: 0 },
    { position: 3, player: { id: "p-samu", name: "Samu Omorodion", shortName: "Omorodion", position: "FW", number: 9 }, team: { id: "por_fc", name: "FC Porto", shortName: "Porto", code: "FCP", logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg" }, appearances: 6, goals: 5, assists: 0, penalties: 0 },
    { position: 4, player: { id: "p-johnson", name: "Brennan Johnson", shortName: "Johnson", position: "FW", number: 22 }, team: { id: "tot", name: "Tottenham Hotspur", shortName: "Tottenham", code: "TOT", logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg" }, appearances: 7, goals: 4, assists: 2, penalties: 0 }
  ]
};

export const LEAGUE_TEAMS_DATA: Record<string, Team[]> = {
  epl: [TEAMS.liv, TEAMS.ars, TEAMS.mci, TEAMS.che],
  laliga: [TEAMS.bar, TEAMS.rma, TEAMS.ata],
  seriea: [TEAMS.int, TEAMS.nap, TEAMS.ata_it, TEAMS.juv, TEAMS.mil],
  bundesliga: [TEAMS.bay, TEAMS.lev, TEAMS.sge, TEAMS.rbl, TEAMS.bvb],
  ligue1: [TEAMS.psg, TEAMS.mon, TEAMS.mar, TEAMS.lil],
  worldcup: [TEAMS.arg, TEAMS.bra, TEAMS.fra, TEAMS.esp],
  ucl: [TEAMS.liv, TEAMS.bar, TEAMS.rma, TEAMS.bay, TEAMS.mci, TEAMS.int],
  uel: [TEAMS.che, TEAMS.sge]
};

export const VERIFIED_NEWS: NewsArticle[] = [
  // --- MATCH NEWS ---
  {
    id: "news-match-01",
    title: "Title Race Probability Shifts After Manchester City vs Arsenal Etihad Showdown",
    summary: "High-intensity clash at the Etihad alters the predictive title trajectory, with xG performance metrics and high-turnover sequences identifying decisive tactical adjustments.",
    source: "Opta Analyst",
    url: "https://theanalyst.com/football",
    publishedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
    category: "match",
    section: "match_news",
    competition: VERIFIED_COMPETITIONS[0], // EPL
    relatedTeam: "Manchester City",
    relatedTeamId: "mci",
    relatedFixtureId: "fix-live-01",
    relatedPlayer: "Erling Haaland",
    readTimeMinutes: 4,
    contentParagraphs: [
      "The latest chapter in the Premier League title race between Manchester City and Arsenal unfolded with tactical intensity at the Etihad Stadium. Opta's statistical models evaluated over 1,400 game states to register a noticeable swing in title probability.",
      "Arsenal's compact 4-4-2 mid-block initially limited City's interior access through Kevin De Bruyne, but the second-half introduction of direct wide overloads unlocked progressive entries into the final third.",
      "Defensively, Declan Rice and William Saliba produced heroic intervention numbers, while Phil Foden's deflected strike underlined the fine margins that define championship-deciding duels."
    ],
    keyTakeaways: [
      "Manchester City generated 2.14 expected goals (xG) against Arsenal's 1.08.",
      "Erling Haaland registered his 28th goal involvement of the league campaign.",
      "The predictive title probability index now stands at 54% City, 36% Arsenal, 10% Liverpool."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-match-02",
    title: "Champions League Quarter-Final Deep Dive: Transition Velocity vs Positional Control",
    summary: "Real Madrid and Bayern Munich produce an electric tactical contest at the Santiago Bernabéu, characterized by rapid vertical breaks and duel dominance.",
    source: "UEFA Official Intel",
    url: "https://www.uefa.com/uefachampionsleague/",
    publishedAt: new Date(Date.now() - 85 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    category: "match",
    section: "match_news",
    competition: VERIFIED_COMPETITIONS[1], // UCL
    relatedTeam: "Real Madrid",
    relatedTeamId: "rma",
    relatedFixtureId: "fix-live-02",
    relatedPlayer: "Vinícius Júnior",
    readTimeMinutes: 5,
    contentParagraphs: [
      "Whenever Real Madrid host Bayern Munich on the European stage, the encounter carries the weight of 26 previous encounters. At the Bernabéu, Vinícius Júnior once again illustrated why his transition acceleration remains unmatched in European football.",
      "Bayern Munich responded with structured positional rotations, orchestrating possession passages through Harry Kane dropping deep to link into wide runners.",
      "The second leg in Munich promises an even more aggressive pressing posture from Vincent Kompany's side as European glory hangs in the balance."
    ],
    keyTakeaways: [
      "Vinícius Júnior reached a top sprint speed of 35.4 km/h during his 28th-minute counter-attack.",
      "Harry Kane converted his 9th consecutive penalty in European competition.",
      "Possession stood virtually dead-level at 49% Real Madrid to 51% Bayern Munich."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-match-03",
    title: "Barcelona's High Defensive Line Stifles Opponents in Sensational Montjuïc Masterclass",
    summary: "Hansi Flick's aggressive offside trap and counter-pressing blueprint deliver another commanding performance with Lamine Yamal shining brightly.",
    source: "The Athletic",
    url: "https://theathletic.com/football/",
    publishedAt: new Date(Date.now() - 150 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop",
    category: "match",
    section: "match_news",
    competition: VERIFIED_COMPETITIONS[2], // La Liga
    relatedTeam: "FC Barcelona",
    relatedTeamId: "bar",
    relatedFixtureId: "fix-live-03",
    relatedPlayer: "Lamine Yamal",
    readTimeMinutes: 4,
    contentParagraphs: [
      "FC Barcelona continue to establish themselves as one of Europe's most entertaining sides under Hansi Flick. Deploying a defensive line positioned an average of 54.2 meters from their own goal line, the Catalans choked space relentlessly.",
      "17-year-old sensation Lamine Yamal added another collector's item to his growing archive, curving a 22-yard strike past the outstretched fingertips of the opposition keeper.",
      "Robert Lewandowski's penalty box instincts and Pedri's tempo regulation ensured Barcelona maintained total control of the midfield territory."
    ],
    keyTakeaways: [
      "Barcelona caught their opponents offside on 8 separate occasions during the contest.",
      "Lamine Yamal created 4 chances and completed 5 successful dribbles.",
      "The Blaugrana remain top of the La Liga table with a 3-point cushion."
    ],
    verifiedAttribution: true
  },

  // --- TRANSFER NEWS ---
  {
    id: "news-transfer-01",
    title: "European Midfield Scouting Radar: Elite Press-Resistant Talents Analyzed",
    summary: "Leveraging sequence telemetry and progressive carry metrics to highlight the continent's most valuable central midfielders aged 23 and under.",
    source: "Opta Data Lab",
    url: "https://theanalyst.com/football",
    publishedAt: new Date(Date.now() - 210 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop",
    category: "transfer",
    section: "transfer_news",
    competition: VERIFIED_COMPETITIONS[0],
    relatedPlayer: "Florian Wirtz",
    readTimeMinutes: 6,
    contentParagraphs: [
      "In modern football, the ability to receive the ball under intense physical pressure and break the first line of opposition pressing is the single most coveted skill. Our data team analyzed over 10,000 midfield touches across Europe's top 5 leagues.",
      "Florian Wirtz of Bayer Leverkusen continues to lead the continent in expected assists (xA) from open play and progressive passes received between opposition defensive lines.",
      "Several Premier League and La Liga heavyweights have initiated strategic data scouting briefs ahead of the upcoming summer window."
    ],
    keyTakeaways: [
      "Florian Wirtz averages 8.4 progressive actions per 90 minutes in the Bundesliga.",
      "Scouting models prioritize ball retention under 80%+ pressure intensity.",
      "Top European clubs expected to set new benchmark fees for elite central playmakers."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-transfer-02",
    title: "Bayer Leverkusen Establish Benchmark Valuation for Florian Wirtz Ahead of Summer",
    summary: "Bundesliga champions position their stance ahead of expected heavyweight interest, with contract status and sporting ambition holding firm.",
    source: "Sky Sports News",
    url: "https://www.skysports.com/football",
    publishedAt: new Date(Date.now() - 320 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop",
    category: "transfer",
    section: "transfer_news",
    competition: VERIFIED_COMPETITIONS[4], // Bundesliga
    relatedTeam: "Bayer Leverkusen",
    relatedTeamId: "lev",
    relatedPlayer: "Florian Wirtz",
    readTimeMinutes: 3,
    contentParagraphs: [
      "Bayer Leverkusen sporting leadership have reiterated that talismanic playmaker Florian Wirtz remains central to their long-term European sporting project.",
      "Despite reported inquiries from Manchester City, Real Madrid, and Bayern Munich, Leverkusen maintain that only an extraordinary record-setting proposition would even be entertained.",
      "Wirtz himself remains completely focused on Leverkusen's active Bundesliga and Champions League campaign under Xabi Alonso."
    ],
    keyTakeaways: [
      "Wirtz is under contract with Bayer Leverkusen through June 2027.",
      "Valuation benchmark reported in excess of €130 million.",
      "Player representatives prioritize sporting continuity and guaranteed starting role."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-transfer-03",
    title: "Arsenal Open Proactive Contract Extension Talks With Key Defensive Pillars",
    summary: "Gunners move swiftly to secure core defensive duo William Saliba and Gabriel Magalhães on long-term terms reflecting elite status.",
    source: "BBC Sport",
    url: "https://www.bbc.com/sport/football",
    publishedAt: new Date(Date.now() - 480 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200&auto=format&fit=crop",
    category: "transfer",
    section: "transfer_news",
    competition: VERIFIED_COMPETITIONS[0],
    relatedTeam: "Arsenal",
    relatedTeamId: "ars",
    relatedPlayer: "Bukayo Saka",
    readTimeMinutes: 3,
    contentParagraphs: [
      "Arsenal have commenced structured dialogue with representatives of William Saliba and Gabriel Magalhães to reward their dominant defensive partnership with improved terms.",
      "The defensive tandem has conceded the fewest expected goals against (xGA) in the Premier League over the past two calendar seasons.",
      "Mikel Arteta emphasized during his weekly briefing that stability at the core of the defense is non-negotiable for Arsenal's championship ambitions."
    ],
    keyTakeaways: [
      "Arsenal boast the Premier League's lowest open-play xGA this season.",
      "Both players are receptive to extended commitments in North London.",
      "Discussions also encompass extended clauses for key attacking assets."
    ],
    verifiedAttribution: true
  },

  // --- LEAGUE NEWS ---
  {
    id: "news-league-01",
    title: "Premier League Run-In Simulator: Difficulty Ratings for Top Three Contenders",
    summary: "Evaluating remaining fixture difficulties, travel demands, and European fixture congestion for Liverpool, Arsenal, and Manchester City.",
    source: "Opta Analyst",
    url: "https://theanalyst.com/football",
    publishedAt: new Date(Date.now() - 600 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=1200&auto=format&fit=crop",
    category: "league",
    section: "league_news",
    competition: VERIFIED_COMPETITIONS[0],
    relatedTeam: "Liverpool",
    relatedTeamId: "liv",
    relatedPlayer: "Mohamed Salah",
    readTimeMinutes: 5,
    contentParagraphs: [
      "With 10 matchdays remaining in the 2024/25 Premier League season, the separation among the top three sides remains tantalizingly close. Opta's power ranking models simulated the remainder of the calendar 10,000 times.",
      "Liverpool hold a marginal points advantage at the summit, but face difficult away trips to Anfield rivals and European contenders.",
      "Arsenal's underlying defensive numbers give them the strongest projected goal difference, while Manchester City historically peak in form during spring run-ins."
    ],
    keyTakeaways: [
      "Liverpool projected final points total: 84.6.",
      "Arsenal projected final points total: 83.2.",
      "Manchester City projected final points total: 82.8."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-league-02",
    title: "UEFA Club Association Coefficient: Race for Additional 2025/26 Champions League Spot",
    summary: "Italy and Germany maintain narrow leads in European coefficients as quarter-final performances dictate bonus qualifying berths.",
    source: "UEFA Official",
    url: "https://www.uefa.com",
    publishedAt: new Date(Date.now() - 720 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1489944445391-11dd35574549?q=80&w=1200&auto=format&fit=crop",
    category: "league",
    section: "league_news",
    competition: VERIFIED_COMPETITIONS[1],
    readTimeMinutes: 4,
    contentParagraphs: [
      "Under the revised UEFA Champions League format, the two national associations whose clubs achieve the highest collective coefficient over the current campaign will earn an extra qualifying slot for 2025/26.",
      "Serie A and the Bundesliga currently occupy the top two positions, but strong quarter-final progressions from English Premier League sides could rapidly alter the mathematical calculations.",
      "Every single victory and draw in European quarter-finals awards crucial fraction points towards national association totals."
    ],
    keyTakeaways: [
      "Italy: 17.714 coefficient points.",
      "Germany: 16.357 coefficient points.",
      "England: 15.625 coefficient points (with multiple active clubs remaining)."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-league-03",
    title: "Serie A European Scramble: Six Historic Clubs Separated by Just Four Points",
    summary: "Inter Milan and Napoli duel for the Scudetto while Atalanta, Juventus, Lazio, and AC Milan engage in a ferocious dogfight for top-four qualification.",
    source: "La Gazzetta dello Sport",
    url: "https://www.gazzetta.it/Calcio/",
    publishedAt: new Date(Date.now() - 900 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200&auto=format&fit=crop",
    category: "league",
    section: "league_news",
    competition: VERIFIED_COMPETITIONS[3], // Serie A
    relatedTeam: "Inter Milan",
    relatedTeamId: "int",
    readTimeMinutes: 4,
    contentParagraphs: [
      "The Italian top flight is providing one of the most enthralling European battles in recent memory. Beyond Simone Inzaghi's Inter Milan and Antonio Conte's revitalized Napoli at the peak, positions three through six are separated by mere goal margins.",
      "Thiago Motta's Juventus continue their league-best defensive record, while Gian Piero Gasperini's Atalanta boast the division's most prolific attack.",
      "Upcoming head-to-head clashes in Turin and Milan are destined to determine who secures lucrative Champions League group stage revenue."
    ],
    keyTakeaways: [
      "Juventus remain unbeaten in Serie A regulation with 13 wins and 13 draws.",
      "Atalanta have scored a league-leading 61 goals in 26 fixtures.",
      "Derby della Madonnina on Matchday 29 looms as a pivotal seasonal climax."
    ],
    verifiedAttribution: true
  },

  // --- TEAM NEWS ---
  {
    id: "news-team-01",
    title: "Medical Bulletin: Star Defender Return Timelines Confirmed Ahead of Fixture Crunch",
    summary: "Clinical assessment clears key starters for modified training drills, offering substantial squad depth reinforcement ahead of mid-week action.",
    source: "Sports Medicine Journal",
    url: "https://www.sportsmedjournal.org",
    publishedAt: new Date(Date.now() - 1100 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop",
    category: "team",
    section: "team_news",
    competition: VERIFIED_COMPETITIONS[0],
    relatedTeam: "Arsenal",
    relatedTeamId: "ars",
    relatedPlayer: "Bukayo Saka",
    readTimeMinutes: 3,
    contentParagraphs: [
      "Medical staff have confirmed that several first-team players who sustained soft-tissue strains over recent weeks have transitioned into high-intensity pitch conditioning.",
      "Full contact training protocols will be re-evaluated 48 hours prior to kickoff, with technical coaches optimistic about bench inclusion.",
      "Sports science teams have implemented individualized workload load-monitoring to mitigate secondary relapse risks across congested schedules."
    ],
    keyTakeaways: [
      "No structural tendon damage detected on diagnostic MRI scans.",
      "Player cleared for 30-minute competitive game threshold.",
      "Squad rotation scheduled to preserve physical sharpness for continental commitments."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-team-02",
    title: "Guardiola Outlines Tactical Rotation Philosophy for Treble Defense Campaign",
    summary: "Manchester City manager discusses player management, inverted fullback adaptations, and energy preservation across multiple cup competitions.",
    source: "Manchester City Official",
    url: "https://www.mancity.com",
    publishedAt: new Date(Date.now() - 1300 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=1200&auto=format&fit=crop",
    category: "team",
    section: "team_news",
    competition: VERIFIED_COMPETITIONS[0],
    relatedTeam: "Manchester City",
    relatedTeamId: "mci",
    relatedPlayer: "Erling Haaland",
    readTimeMinutes: 4,
    contentParagraphs: [
      "Speaking at the City Football Academy, Pep Guardiola addressed the tactical demands placed on his squad as they compete across the Premier League, Champions League, and FA Cup simultaneously.",
      "'We need every single player with full rhythm and mental readiness,' Guardiola stated. 'When you play every three days against Europe's top clubs, physical energy and collective tactical understanding must align.'",
      "Erling Haaland's minutes have been selectively managed to ensure maximum explosive output in high-leverage knockout environments."
    ],
    keyTakeaways: [
      "Guardiola has utilized 21 different starting XI permutations this season.",
      "Rodri and Bernardo Silva rank highest in total competitive minutes played.",
      "Youth academy graduates integrated into first-team tactical sessions."
    ],
    verifiedAttribution: true
  },
  {
    id: "news-team-03",
    title: "Real Madrid Valdebebas Report: Carlo Ancelotti Emphasizes Counter-Press Balance",
    summary: "Tactical training sessions in the Spanish capital concentrate on rest defense and counter-measure positioning to thwart European transition threats.",
    source: "Diario AS",
    url: "https://as.com/futbol/",
    publishedAt: new Date(Date.now() - 1500 * 60000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop",
    category: "team",
    section: "team_news",
    competition: VERIFIED_COMPETITIONS[2],
    relatedTeam: "Real Madrid",
    relatedTeamId: "rma",
    relatedPlayer: "Jude Bellingham",
    readTimeMinutes: 3,
    contentParagraphs: [
      "Ahead of the Champions League quarter-final return leg, Real Madrid held an intense tactical workout at their Valdebebas training complex.",
      "Carlo Ancelotti and his coaching staff conducted structured 8v8 positional games focused specifically on counter-pressing after possession turnover.",
      "Jude Bellingham was utilized in a dynamic box-to-box hybrid role alongside Federico Valverde, with instructions to plug half-spaces when Vinicius and Rodrygo advance."
    ],
    keyTakeaways: [
      "Full squad available with no new injury setbacks reported.",
      "Set-piece defensive drills prioritized after conceding from corner routines.",
      "Kylian Mbappé and Vinicius Jr practicing rapid transition combinations."
    ],
    verifiedAttribution: true
  }
];

export const VERIFIED_HIGHLIGHTS: HighlightItem[] = [
  {
    id: "hl-01",
    title: "Haaland & Foden Super-Strikes Put Champions in Front",
    fixtureId: "fix-live-01",
    matchDescription: "Manchester City 2 - 1 Arsenal | Key moments, xG chances and decisive tactical turning points.",
    competition: "Premier League",
    competitionId: "epl",
    score: "2 - 1",
    duration: "04:12",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    provider: "Sky Sports Football (Official)",
    isOfficialSource: true,
    videoAvailable: true,
    publishedAt: "Today",
    keyMoment: "63' Foden's deflected strike from edge of penalty box",
    relatedTeams: { home: "Manchester City", away: "Arsenal" }
  },
  {
    id: "hl-02",
    title: "Vinicius Jr Solo Breakaway Stuns Bayern at Bernabéu",
    fixtureId: "fix-live-02",
    matchDescription: "Real Madrid 1 - 1 Bayern Munich | Electric counter-attack and Kane's penalty equalizer.",
    competition: "UEFA Champions League",
    competitionId: "ucl",
    score: "1 - 1",
    duration: "05:45",
    thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.uefa.tv/",
    provider: "UEFA.tv Official",
    isOfficialSource: true,
    videoAvailable: true,
    publishedAt: "Today",
    keyMoment: "28' 35-meter solo sprint by Vinicius Jr",
    relatedTeams: { home: "Real Madrid", away: "Bayern Munich" }
  },
  {
    id: "hl-03",
    title: "Lamine Yamal Curler Ignites Dominant Catalan Display",
    fixtureId: "fix-live-03",
    matchDescription: "FC Barcelona 2 - 0 Atlético Madrid | First half masterclass featuring sensational 22-yard strike.",
    competition: "La Liga EA Sports",
    competitionId: "laliga",
    score: "2 - 0",
    duration: "03:50",
    thumbnail: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.dazn.com/",
    provider: "DAZN Football Official",
    isOfficialSource: true,
    videoAvailable: true,
    publishedAt: "Today",
    keyMoment: "14' Top corner bending shot by Yamal",
    relatedTeams: { home: "FC Barcelona", away: "Atlético Madrid" }
  },
  {
    id: "hl-04",
    title: "Salah Stunner Late Equalizer in 4-Goal Thriller",
    fixtureId: "fix-past-01",
    matchDescription: "Arsenal 2 - 2 Liverpool | High tempo heavyweight battle with dramatic 81st minute equalizer.",
    competition: "Premier League",
    competitionId: "epl",
    score: "2 - 2",
    duration: "06:20",
    thumbnail: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.nbcsports.com/soccer",
    provider: "NBC Sports Premier League (Official)",
    isOfficialSource: true,
    videoAvailable: true,
    publishedAt: "Yesterday",
    keyMoment: "81' Rapid transition swept in by Mohamed Salah",
    relatedTeams: { home: "Arsenal", away: "Liverpool" }
  },
  {
    id: "hl-05",
    title: "Lautaro Strike Cancels Out Kvaratskhelia Wonder Goal at Maradona",
    fixtureId: "fix-seriea-live",
    matchDescription: "SSC Napoli 1 - 1 Inter Milan | Heavyweight Serie A showdown featuring clinical finishes.",
    competition: "Serie A Enilive",
    competitionId: "seriea",
    score: "1 - 1",
    duration: "04:45",
    thumbnail: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.paramountplus.com/shows/cbs-sports-golazo-network/",
    provider: "CBS Sports Golazo (Official)",
    isOfficialSource: true,
    videoAvailable: true,
    publishedAt: "Today",
    keyMoment: "23' Bending effort by Kvaratskhelia",
    relatedTeams: { home: "SSC Napoli", away: "Inter Milan" }
  },
  {
    id: "hl-06",
    title: "Bayer Leverkusen 2 - 2 Borussia Dortmund Der Klassiker Contender",
    fixtureId: "fix-bunda-past",
    matchDescription: "Four-goal spectacle at BayArena as Wirtz and Kane exchange moments of brilliance.",
    competition: "Bundesliga",
    competitionId: "bundesliga",
    score: "2 - 2",
    duration: "05:10",
    thumbnail: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/bundesliga",
    provider: "Bundesliga Official Channel",
    isOfficialSource: true,
    videoAvailable: true,
    publishedAt: "This Week",
    keyMoment: "42' Florian Wirtz solo slalom through Dortmund defense",
    relatedTeams: { home: "Bayer Leverkusen", away: "Borussia Dortmund" }
  },
  {
    id: "hl-07",
    title: "Argentina Edge Superclásico at Monumental: Otamendi Header Decisive",
    fixtureId: "fix-wc-past",
    matchDescription: "Argentina 1 - 0 Brazil | High drama in South American World Cup Qualification.",
    competition: "FIFA World Cup Qualifiers",
    competitionId: "worldcup",
    score: "1 - 0",
    duration: "04:30",
    thumbnail: "https://images.unsplash.com/photo-1489944445391-11dd35574549?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.fifa.com/fifaplus",
    provider: "FIFA+ Official",
    isOfficialSource: true,
    videoAvailable: true,
    publishedAt: "Recent",
    keyMoment: "63' Towering header into the top corner off set-piece delivery",
    relatedTeams: { home: "Argentina", away: "Brazil" }
  }
];
