// 1. DATA SPORT - GANTI JADI KATEGORI + ICON
const SPORTS = [
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'motogp', name: 'MotoGP', icon: '🏍️' },
  { id: 'f1', name: 'Formula 1', icon: '🏎️' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' }
];

// DATA MATCH TETEP PAKE YANG LAMA, TAMBAHIN FIELD sport
const MATCHES = [
  {
    "id": "ManCity-Arsenal",
    "sport": "football", // TAMBAHIN INI
    "league": "LIGA PRIMER",
    "team1": { "name": "Manchester City", "logo": "https://static.flashscore.com/res/image/data/UXcqj7HG-lQuhqN8N.png" },
    "team2": { "name": "Arsenal", "logo": "https://static.flashscore.com/res/image/data/pfchdCg5-vcNAdtF9.png" },
    "kickoff_date": "2026-04-19", "kickoff_time": "22:30",
    "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  // TAMBAHIN FIELD sport: 'football' ATAU 'tennis' DLL DI SEMUA MATCH
];

// 2. HAPUS INI: const prevBtn, const nextBtn, let currentMatchIndex, updateNavButtons

// 3. FUNGSI LEAGUE BAR BARU - PAKE SPORTS
function renderLeagueBar() {
  leagueBar.innerHTML = '';
  
  // Tombol LIVE tetep ada di paling depan
  const liveCount = MATCHES.filter(m => m.stream_url).length;
  const liveBtn = document.createElement('div');
  liveBtn.className = 'league-item';
  liveBtn.dataset.league = 'LIVE';
  liveBtn.innerHTML = `<span class="dot"></span>LIVE<span class="badge">${liveCount}</span>`;
  liveBtn.onclick = () => openPopup('LIVE');
  leagueBar.appendChild(liveBtn);

  // Loop SPORTS bukan LEAGUE
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

// 4. UPDATE FUNGSI POPUP BIAR BACA sport
function openPopup(type, title = '') {
  activeLeague = type; // type bisa 'LIVE' atau id sport
  popupTitle.innerText = title || (type === 'LIVE' ? 'Pertandingan LIVE' : type);
  renderPopupList();
  popupOverlay.classList.add('show');
  matchPopup.classList.add('show');
}

function renderPopupList() {
  popupList.innerHTML = '';
  let filtered = activeLeague === 'LIVE' 
    ? MATCHES.filter(m => m.stream_url) 
    : MATCHES.filter(m => m.sport === activeLeague); // FILTER PAKE sport
    
  if (filtered.length === 0) {
    popupList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Ga ada jadwal</div>';
    return;
  }
  // ... sisa kode renderPopupList sama kayak sebelumnya
}

// 5. DI selectMatch HAPUS updateNavButtons()
function selectMatch(match) {
  // HAPUS: currentMatchIndex = ... 
  // HAPUS: updateNavButtons();
  closePopup();
  scoreboard.innerText = `${match.team1.name} vs ${match.team2.name} | ${match.kickoff_time}`;
  loadStream(match.stream_url);
}

// 6. HAPUS SEMUA FUNGSI INI: updateNavButtons, prevBtn.onclick, nextBtn.onclick