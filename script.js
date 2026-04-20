const SPORTS = [
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'motogp', name: 'MotoGP', icon: '🏍️' },
  { id: 'f1', name: 'Formula 1', icon: '🏎️' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' }
];

let MATCHES = [];
let ALL_MATCHES = [];
let currentMatch = null;
let currentChannelUrl = null;

const playerFrame = document.getElementById('playerFrame');
const leagueBar = document.getElementById('leagueBar');
const scoreboard = document.getElementById('scoreboard');
const popupOverlay = document.getElementById('popupOverlay');
const matchPopup = document.getElementById('matchPopup');
const popupTitle = document.getElementById('popupTitle');
const popupList = document.getElementById('popupList');
const popupClose = document.getElementById('popupClose');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const channelSelectBar = document.getElementById('channelSelectBar');
const playerPoster = document.getElementById('playerPoster');
let activeLeague = 'LIVE';

function isMatchLive(match) {
  const start = new Date(`${match.kickoff_date}T${match.kickoff_time}:00`);
  const end = new Date(start.getTime() + match.duration * 60000);
  const now = new Date();
  return now >= start && now <= end;
}

function filterActiveMatches() {
  const now = new Date();
  MATCHES = ALL_MATCHES.filter(m => {
    const start = new Date(`${m.kickoff_date}T${m.kickoff_time}:00`);
    const end = new Date(start.getTime() + m.duration * 60000);
    return now <= end;
  });
}

function renderLeagueBar() {
  filterActiveMatches();
  leagueBar.innerHTML = '';
  const liveCount = MATCHES.filter(m => isMatchLive(m)).length;

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

function updateScrollButtons() {
  scrollLeftBtn.disabled = leagueBar.scrollLeft <= 0;
  scrollRightBtn.disabled = leagueBar.scrollLeft >= leagueBar.scrollWidth - leagueBar.clientWidth - 1;
}
scrollLeftBtn.onclick = () => leagueBar.scrollBy({ left: -200, behavior: 'smooth' });
scrollRightBtn.onclick = () => leagueBar.scrollBy({ left: 200, behavior: 'smooth' });
leagueBar.addEventListener('scroll', updateScrollButtons);

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
  filterActiveMatches();
  popupList.innerHTML = '';
  let filtered = activeLeague === 'LIVE' 
    ? MATCHES.filter(m => isMatchLive(m)) 
    : MATCHES.filter(m => m.sport === activeLeague);
    
  if (filtered.length === 0) {
    popupList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Ga ada jadwal</div>';
    return;
  }
  filtered.forEach(match => {
    const isLive = isMatchLive(match);
    const dateObj = new Date(`${match.kickoff_date}T00:00:00`);
    const tgl = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const item = document.createElement('div');
    item.className = 'popup-match-item';
    item.innerHTML = `
      <div class="popup-match-teams">
        <img src="${match.league_logo}" alt="${match.league}">
        <div class="popup-match-detail">
          <div class="popup-match-name">${match.team1.name} vs ${match.team2.name}</div>
          <div class="popup-match-league">${match.league} • ${tgl}</div>
        </div>
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

// PILIH MATCH -> MUNCULIN PILIHAN CH + HIDE POSTER
function selectMatch(match) {
  closePopup();
  currentMatch = match;
  scoreboard.innerText = `${match.team1.name} vs ${match.team2.name} | ${match.kickoff_time}`;
  renderChannelButtons(match.channels);
  playerPoster.classList.add('hide'); // SEMBUNYIIN POSTER
  // AUTO PLAY CH PERTAMA
  if (match.channels.length > 0) {
    loadChannel(match.channels[0].url, match.channels[0].name);
  }
}

const logoBtn = document.getElementById('logoBtn');
const reloadBtn = document.getElementById('reloadBtn');
function reloadPage() {
  location.reload();
}

logoBtn.onclick = reloadPage;
reloadBtn.onclick = reloadPage;

// RENDER TOMBOL CH 1, CH 2, CH 3
function renderChannelButtons(channels) {
  channelSelectBar.innerHTML = '';
  if (!channels || channels.length === 0) {
    channelSelectBar.style.display = 'none';
    playerFrame.src = '';
    return;
  }
  channelSelectBar.style.display = 'flex';
  channels.forEach((ch, i) => {
    const btn = document.createElement('button');
    btn.className = 'channel-btn';
    if (i === 0) btn.classList.add('active');
    btn.innerText = ch.name;
    btn.onclick = () => loadChannel(ch.url, ch.name);
    channelSelectBar.appendChild(btn);
  });
}

function loadChannel(url, name) {
  currentChannelUrl = url;
  playerFrame.src = url;
  // UPDATE TOMBOL ACTIVE
  document.querySelectorAll('.channel-btn').forEach(btn => {
    btn.classList.toggle('active', btn.innerText === name);
  });
}

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

async function init() {
  try {
    const res = await fetch('matches.json');
    ALL_MATCHES = await res.json();
    renderLeagueBar();
    const firstLive = MATCHES.find(m => isMatchLive(m));
    if (firstLive) {
      selectMatch(firstLive);
    } else {
      playerPoster.classList.remove('hide'); // TAMPILIN POSTER KALO GA ADA LIVE
      scoreboard.innerText = 'Pilih match dulu';
    }
    
    setInterval(() => {
      renderLeagueBar();
      if (matchPopup.classList.contains('show')) renderPopupList();
      // KALO MATCH YANG LAGI DIPUTER UDAH EXPIRED, STOP
      if (currentMatch && !isMatchLive(currentMatch)) {
        playerFrame.src = '';
        channelSelectBar.style.display = 'none';
        playerPoster.classList.remove('hide'); // MUNCULIN POSTER LAGI
        scoreboard.innerText = 'Jadwal habis';
        currentMatch = null;
      }
    }, 60000);
    
  } catch (err) {
    console.error('Gagal load matches.json', err);
    leagueBar.innerHTML = '<div style="padding:12px; color:#ef4444;">Gagal load jadwal</div>';
  }
}
init();