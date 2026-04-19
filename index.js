const video = document.getElementById('video');
const matchBar = document.getElementById('matchBar');
const leagueFilter = document.getElementById('leagueFilter');
const scoreboard = document.getElementById('scoreboard');
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const sendBtn = document.getElementById('sendBtn');
let hls = null;
let currentMatch = null;
let activeLeague = 'ALL';

// 1. Generate Tombol Filter Liga dari JSON
function renderLeagueFilters() {
  const leagues = [...new Set(MATCHES.map(m => m.league))];
  leagues.forEach(league => {
    const btn = document.createElement('div');
    btn.className = 'league-btn';
    btn.dataset.league = league;
    btn.innerText = league.toUpperCase();
    btn.onclick = () => filterByLeague(league, btn);
    leagueFilter.appendChild(btn);
  });

  // Event buat tombol SEMUA & LIVE
  document.querySelectorAll('.league-btn[data-league="ALL"],.league-btn[data-league="LIVE"]').forEach(btn => {
    btn.onclick = () => filterByLeague(btn.dataset.league, btn);
  });
}

// 2. Filter + Render Match Bar
function filterByLeague(league, btnElement) {
  activeLeague = league;
  document.querySelector('.league-btn.active').classList.remove('active');
  btnElement.classList.add('active');
  renderMatches();
}

function renderMatches() {
  matchBar.innerHTML = '';
  let filteredMatches = MATCHES;

  if (activeLeague === 'LIVE') {
    filteredMatches = MATCHES.filter(m => m.stream_url); // Yang ada stream_url = live
  } else if (activeLeague!== 'ALL') {
    filteredMatches = MATCHES.filter(m => m.league === activeLeague);
  }

  if (filteredMatches.length === 0) {
    matchBar.innerHTML = '<div style="padding: 10px; font-size: 13px; color: #6b7280;">Ga ada match</div>';
    video.src = '';
    scoreboard.innerText = 'Pilih match dulu';
    return;
  }

  filteredMatches.forEach((match, index) => {
    const isLive = match.stream_url? true : false;
    const item = document.createElement('div');
    item.className = 'match-item';
    if (index === 0) item.classList.add('active');

    item.innerHTML = `
      ${isLive? '<span class="live">●</span>' : ''}
      <img src="${match.team1.logo}" title="${match.team1.name}">
      <span>${match.team1.name.split(' ')[0]}</span>
    `;
    item.onclick = () => selectMatch(match, item);
    matchBar.appendChild(item);
  });

  // Auto load match pertama dari hasil filter
  selectMatch(filteredMatches[0], matchBar.querySelector('.match-item'));
}

// 3. Pilih Match + Load Stream
function selectMatch(match, element) {
  currentMatch = match;
  document.querySelector('.match-item.active')?.classList.remove('active');
  element.classList.add('active');

  scoreboard.innerText = `${match.team1.name} vs ${match.team2.name} | ${match.kickoff_time}`;
  loadStream(match.stream_url);
}

function loadStream(url) {
  if (!url) {
    video.src = '';
    scoreboard.innerText = currentMatch.team1.name + ' vs ' + currentMatch.team2.name + ' - Belum Live';
    return;
  }

  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  }
}

// 4. Chat Function
function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;

  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `
    <span class="chat-lv lv1">Lv1</span>
    <div><span class="chat-name">Guest:</span> <span class="chat-text">${text}</span></div>
  `;
  chatBox.appendChild(msg);
  chatInput.value = '';
  window.scrollTo(0, document.body.scrollHeight);
}

sendBtn.onclick = sendChat;
chatInput.onkeydown = (e) => {
  if (e.key === 'Enter') sendChat();
};

// Init
renderLeagueFilters();
renderMatches();