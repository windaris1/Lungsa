// 1. DATA SPORT + MATCH
const SPORTS = [
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'motogp', name: 'MotoGP', icon: '🏍️' },
  { id: 'f1', name: 'Formula 1', icon: '🏎️' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' }
];

const MATCHES = [
  {
    "id": "ManCity-Arsenal",
    "sport": "football",
    "league": "LIGA PRIMER",
    "team1": { "name": "Manchester City", "logo": "https://static.flashscore.com/res/image/data/UXcqj7HG-lQuhqN8N.png" },
    "team2": { "name": "Arsenal", "logo": "https://static.flashscore.com/res/image/data/pfchdCg5-vcNAdtF9.png" },
    "kickoff_date": "2026-04-19", "kickoff_time": "22:30",
    "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    "id": "Persik-Persita",
    "sport": "football",
    "league": "SUPER LEAGUE",
    "team1": { "name": "Persik Kediri", "logo": "https://static.flashscore.com/res/image/data/IgemUgg5-fudV7NWp.png" },
    "team2": { "name": "Persita", "logo": "https://static.flashscore.com/res/image/data/IefKuzwS-Mw6HAN8i.png" },
    "kickoff_date": "2026-04-19", "kickoff_time": "15:30",
    "stream_url": "https://test-streams.mux.dev/test_001/stream.m3u8"
  }
];

// 2. ELEMENT
const video = document.getElementById('video');
const leagueBar = document.getElementById('leagueBar');
const scoreboard = document.getElementById('scoreboard');
const popupOverlay = document.getElementById('popupOverlay');
const matchPopup = document.getElementById('matchPopup');
const popupTitle = document.getElementById('popupTitle');
const popupList = document.getElementById('popupList');
const popupClose = document.getElementById('popupClose');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
let hls = null, activeLeague = 'LIVE';

// 3. RENDER BAR SPORT
function renderLeagueBar() {
  leagueBar.innerHTML = '';
  const liveCount = MATCHES.filter(m => m.stream_url).length;
  
  const liveBtn = document.createElement('div');
  liveBtn.className = 'league-item';
  liveBtn.dataset.league = 'LIVE';
  liveBtn.innerHTML = `<span class="dot"></span>LIVE<span class="badge">${liveCount}</span>`;
  liveBtn.onclick = () => openPopup('LIVE');
  leagueBar.appendChild(liveBtn);

  SPORTS.forEach(sport => {
    const count = MATCHES.filter(m => m.sport === sport.id).length;
    const btn = document.createElement('div');
    btn.className = 'league-item';
    btn.dataset.sport = sport.id;
    btn.innerHTML = `
      <span class="sport-icon">${sport.icon}</span>
      ${sport.name}
      ${count > 0 ? `<span class="badge">${count}</span>` : ''}
    `;
    btn.onclick = () => openPopup(sport.id, sport.name);
    leagueBar.appendChild(btn);
  });
  setTimeout(updateScrollButtons, 100);
}

// 4. SCROLL BAR
function updateScrollButtons() {
  scrollLeftBtn.disabled = leagueBar.scrollLeft <= 0;
  scrollRightBtn.disabled = leagueBar.scrollLeft >= leagueBar.scrollWidth - leagueBar.clientWidth - 1;
}
scrollLeftBtn.onclick = () => leagueBar.scrollBy({ left: -200, behavior: 'smooth' });
scrollRightBtn.onclick = () => leagueBar.scrollBy({ left: 200, behavior: 'smooth' });
leagueBar.addEventListener('scroll', updateScrollButtons);

// 5. POPUP
function openPopup(type, title = '') {
  activeLeague = type;
  popupTitle.innerText = title || (type === 'LIVE' ? 'Pertandingan LIVE' : type);
  renderPopupList();
  popupOverlay.classList.add('show');
  matchPopup.classList.add('show');
}
function closePopup() {
  popupOverlay.classList.remove('show');
  matchPopup.classList.remove('show');
}
popupOverlay.onclick = closePopup;
popupClose.onclick = closePopup;

function renderPopupList() {
  popupList.innerHTML = '';
  let filtered = activeLeague === 'LIVE' 
    ? MATCHES.filter(m => m.stream_url) 
    : MATCHES.filter(m => m.sport === activeLeague);
    
  if (filtered.length === 0) {
    popupList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Ga ada jadwal</div>';
    return;
  }
  filtered.forEach(match => {
    const isLive = !!match.stream_url;
    const item = document.createElement('div');
    item.className = 'popup-match-item';
    item.innerHTML = `
      <div class="popup-match-teams">
        <img src="${match.team1.logo}">
        <div>${match.team1.name} vs ${match.team2.name}</div>
      </div>
      <div class="popup-match-info">
        ${isLive ? '<div class="popup-match-live">● LIVE</div>' : ''}
        <div class="popup-match-time">${match.kickoff_time}</div>
      </div>
    `;
    item.onclick = () => selectMatch(match);
    popupList.appendChild(item);
  });
}

function selectMatch(match) {
  closePopup();
  scoreboard.innerText = `${match.team1.name} vs ${match.team2.name} | ${match.kickoff_time}`;
  loadStream(match.stream_url);
}

function loadStream(url) {
  if (!url) {
    video.src = '';
    video.poster = 'https://placehold.co/1280x720/0a0a0f/e5e5e5?text=Belum+Live';
    return;
  }
  video.poster = '';
  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  }
}

// 6. CHAT
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');
function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `<span class="chat-lv lv1">Lv1</span><div><span class="chat-name">Guest:</span> <span class="chat-text">${text}</span></div>`;
  chatBox.appendChild(msg);
  chatInput.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;
}
sendBtn.onclick = sendChat;
chatInput.onkeydown = (e) => { if (e.key === 'Enter') sendChat(); };

// 7. INIT
renderLeagueBar();
const firstLive = MATCHES.find(m => m.stream_url);
if (firstLive) selectMatch(firstLive);