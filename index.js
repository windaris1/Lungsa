const video = document.getElementById('video');
const leagueBar = document.getElementById('leagueBar');
const scoreboard = document.getElementById('scoreboard');
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const sendBtn = document.getElementById('sendBtn');
const popupOverlay = document.getElementById('popupOverlay');
const matchPopup = document.getElementById('matchPopup');
const popupTitle = document.getElementById('popupTitle');
const popupList = document.getElementById('popupList');
const popupClose = document.getElementById('popupClose');

// TARO DATA LANGSUNG DI SINI BIAR GA ERROR
const MATCHES = [
  {
    "id": "Persik-Persita",
    "league": "Super League",
    "team1": { "name": "Persik Kediri", "logo": "https://static.flashscore.com/res/image/data/IgemUgg5-fudV7NWp.png" },
    "team2": { "name": "Persita", "logo": "https://static.flashscore.com/res/image/data/IefKuzwS-Mw6HAN8i.png" },
    "kickoff_date": "2026-04-19", "kickoff_time": "15:30",
    "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    "id": "ManCity-Arsenal",
    "league": "Liga Primer",
    "team1": { "name": "Manchester City", "logo": "https://static.flashscore.com/res/image/data/UXcqj7HG-lQuhqN8N.png" },
    "team2": { "name": "Arsenal", "logo": "https://static.flashscore.com/res/image/data/pfchdCg5-vcNAdtF9.png" },
    "kickoff_date": "2026-04-19", "kickoff_time": "22:30",
    "stream_url": "https://test-streams.mux.dev/test_001/stream.m3u8"
  },
  {
    "id": "Bayern-Stuttgart",
    "league": "Bundesliga",
    "team1": { "name": "Bayern Munich", "logo": "https://static.flashscore.com/res/image/data/tMir8iCr-SvLFaVNH.png" },
    "team2": { "name": "VfB Stuttgart", "logo": "https://static.flashscore.com/res/image/data/tMir8iCr-SvLFaVNH.png" },
    "kickoff_date": "2026-04-19", "kickoff_time": "22:30",
    "stream_url": ""
  },
  {
    "id": "Juventus-Bologna",
    "league": "Serie A",
    "team1": { "name": "Juventus", "logo": "https://static.flashscore.com/res/image/data/GKF3dlf5-0nz5yHcE.png" },
    "team2": { "name": "Bologna", "logo": "https://static.flashscore.com/res/image/data/j3Tyh1GG-McvX4bye.png" },
    "kickoff_date": "2026-04-20", "kickoff_time": "01:45",
    "stream_url": ""
  }
];

let hls = null;
let currentMatch = null;
let activeLeague = 'LIVE';

// 1. Generate Bar Liga + Badge jumlah match
function renderLeagueBar() {
  const leagueCounts = MATCHES.reduce((acc, m) => {
    acc[m.league] = (acc[m.league] || 0) + 1;
    return acc;
  }, {});
  const liveCount = MATCHES.filter(m => m.stream_url).length;

  const liveBtn = document.querySelector('.league-item[data-league="LIVE"]');
  liveBtn.innerHTML = `🔴 LIVE <span class="badge">${liveCount}</span>`;
  liveBtn.onclick = () => openPopup('LIVE');

  Object.keys(leagueCounts).forEach(league => {
    const btn = document.createElement('div');
    btn.className = 'league-item';
    btn.dataset.league = league;
    btn.innerHTML = `${league.toUpperCase()} <span class="badge">${leagueCounts[league]}</span>`;
    btn.onclick = () => openPopup(league);
    leagueBar.appendChild(btn);
  });
}

// 2. Popup Match
function openPopup(league) {
  activeLeague = league;
  popupTitle.innerText = league === 'LIVE'? 'Pertandingan LIVE' : league.toUpperCase();
  renderPopupList();
  popupOverlay.classList.add('show');
  matchPopup.classList.add('show');
  
  document.querySelectorAll('.league-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`.league-item[data-league="${league}"]`)?.classList.add('active');
}

function closePopup() {
  popupOverlay.classList.remove('show');
  matchPopup.classList.remove('show');
}
popupOverlay.onclick = closePopup;
popupClose.onclick = closePopup;

function getKickoffTimestamp(match) {
  return new Date(`${match.kickoff_date}T${match.kickoff_time}:00+07:00`).getTime();
}

function