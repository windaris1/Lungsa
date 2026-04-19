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

let hls = null;
let currentMatch = null;
let activeLeague = 'LIVE';

// 1. Generate Tombol Liga
function renderLeagueBar() {
  const leagues = [...new Set(MATCHES.map(m => m.league))];
  leagues.forEach(league => {
    const btn = document.createElement('div');
    btn.className = 'league-item';
    btn.dataset.league = league;
    btn.innerText = league.toUpperCase();
    btn.onclick = () => openPopup(league);
    leagueBar.appendChild(btn);
  });
  // Event buat tombol LIVE
  document.querySelector('.league-item[data-league="LIVE"]').onclick = () => openPopup('LIVE');
}

// 2. Buka Popup + Tampilkan List Match
function openPopup(league) {
  activeLeague = league;
  popupTitle.innerText = league === 'LIVE'? 'Pertandingan LIVE' : league.toUpperCase();
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

function getKickoffTimestamp(match) {
  return new Date(`${match.kickoff_date}T${match.kickoff_time}:00+07:00`).getTime();
}

function renderPopupList() {
  popupList.innerHTML = '';
  let filteredMatches = [...MATCHES];

  if (activeLeague === 'LIVE') {
    filteredMatches = MATCHES.filter(m => m.stream_url);
  } else {
    filteredMatches = MATCHES.filter(m => m.league === activeLeague);
  }

  // Sort by waktu kickoff
  filteredMatches.sort((a, b) => getKickoffTimestamp(a) - getKickoffTimestamp(b));

  if (filteredMatches.length === 0) {
    popupList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Ga ada match</div>';
    return;
  }

  filteredMatches.forEach(match => {
    const isLive = match.stream_url? true : false;
    const item = document.createElement('div');
    item.className = 'popup-match-item';
    item.innerHTML = `
      <div class="popup-match-teams">
        <img src="${match.team1.logo}">
        <span>${match.team1.name} vs ${match.team2.name}</span>
      </div>
      <div class="popup-match-info">
        ${isLive? '<div class="popup-match-live">● LIVE</div>' : ''}
        <div class="popup-match-time">${match.kickoff_time}</div>
      </div>
    `;
    item.onclick = () => selectMatch(match);
    popupList.appendChild(item);
  });
}

// 3. Pilih Match + Play
function selectMatch(match) {
  currentMatch = match;
  closePopup();
  
  // Update active league button
  document.querySelectorAll('.league-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`.league-item[data-league="${activeLeague}"]`)?.classList.add('active');

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

// 4. Chat
function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `<span class="chat-lv lv1">Lv1</span><div><span class="chat-name">Guest:</span> <span class="chat-text">${text}</span></div>`;
  chatBox.appendChild(msg);
  chatInput.value = '';
  window.scrollTo(0, document.body.scrollHeight);
}

sendBtn.onclick = sendChat;
chatInput.onkeydown = (e) => { if (e.key === 'Enter') sendChat(); };

// Init: Langsung buka popup LIVE pertama kali
renderLeagueBar();
openPopup('LIVE');