const data = window.WORLD_CUP_DATA;
const bracketEl = document.querySelector('#bracket');
const panelEl = document.querySelector('#team-panel');
const cardsEl = document.querySelector('#team-cards');
const groupsEl = document.querySelector('#groups');
const resetBtn = document.querySelector('#reset-view');
const langButtons = document.querySelectorAll('.lang-btn');
let selectedTeam = null;
let currentLang = localStorage.getItem('wc-lang') || 'en';

const copy = {
  en: {
    eyebrow: 'World Cup 2026',
    title: 'World Cup Flag Bracket',
    lead: 'Check the real 2026 World Cup groups, official knockout slots, and final squads in a fast flag-first view.',
    adTitle: 'Ad slot',
    adSub: 'AdSense placeholder',
    statusTitle: 'Real groups + final squads loaded',
    statusDesc: 'Use the language buttons at the top to switch the whole page.',
    reset: 'Reset view',
    groupsTitle: 'Real groups',
    groupsDesc: 'The top two teams in each group plus the eight best third-placed teams advance to the Round of 32.',
    popularTitle: 'Popular teams',
    footerNote: 'Unofficial fan/information page. No FIFA or association official logos are used.',
    selectKicker: 'Select a team',
    tapFlag: 'Tap a flag',
    panelDesc: 'See group slot, final squad, and match path.',
    groupSlot: 'Group slot',
    updated: 'Updated',
    finalSquad: 'Final squad',
    players: 'players',
    caps: 'caps',
    goals: 'goals',
    clubTba: 'Club TBA',
    openTeam: 'Open national team page',
    tbd: 'TBD',
    scrollHint: 'Scroll horizontally for Final →',
  },
  ko: {
    eyebrow: '월드컵 2026',
    title: '월드컵 국기 대진표',
    lead: '2026 월드컵 실제 조편성, 공식 토너먼트 슬롯, 최종 선수명단을 국기 중심으로 빠르게 확인하세요.',
    adTitle: '광고 영역',
    adSub: 'AdSense 자리',
    statusTitle: '실제 조편성 + 최종 선수명단 반영',
    statusDesc: '상단 언어 버튼으로 전체 페이지를 영어/한국어로 전환할 수 있습니다.',
    reset: '전체 보기',
    groupsTitle: '실제 조편성',
    groupsDesc: '각 조 상위 2팀과 성적 좋은 조 3위 8팀이 32강에 진출합니다.',
    popularTitle: '인기 국가',
    footerNote: '비공식 팬/정보 페이지입니다. FIFA/각 협회 공식 로고를 사용하지 않습니다.',
    selectKicker: '국가 선택',
    tapFlag: '국기를 눌러보세요',
    panelDesc: '조 배정, 최종 선수명단, 경기 경로를 확인할 수 있습니다.',
    groupSlot: '조 배정',
    updated: '업데이트',
    finalSquad: '최종 선수명단',
    players: '명',
    caps: '경기',
    goals: '골',
    clubTba: '소속팀 미정',
    openTeam: '국가대표 페이지 열기',
    tbd: '미정',
    scrollHint: '결승까지 보려면 가로로 스크롤 →',
  },
};

function t(key) {
  return copy[currentLang][key] || copy.en[key] || key;
}

function getTeam(code) {
  return data.teams[code];
}

function teamName(team) {
  return currentLang === 'ko' ? team.nameKo : team.name;
}

function teamStatus(team) {
  return currentLang === 'ko' ? (team.statusKo || team.status) : team.status;
}

function slotLabel(slot) {
  if (currentLang === 'ko') {
    return slot
      .replace(/Winner Group ([A-L])/g, '$1조 1위')
      .replace(/Runner-up Group ([A-L])/g, '$1조 2위')
      .replace(/3rd Group ([A-L/]+)/g, '$1조 3위 후보')
      .replace(/Winner Match (\d+)/g, 'M$1 승자')
      .replace(/Loser Match (\d+)/g, 'M$1 패자');
  }
  return slot
    .replace(/Winner Group ([A-L])/g, 'Group $1 winner')
    .replace(/Runner-up Group ([A-L])/g, 'Group $1 runner-up')
    .replace(/3rd Group ([A-L/]+)/g, '3rd-place candidate: Group $1')
    .replace(/Winner Match (\d+)/g, 'Winner M$1')
    .replace(/Loser Match (\d+)/g, 'Loser M$1');
}

function posClass(pos) {
  return `pos-${String(pos || 'na').toLowerCase()}`;
}

function renderTeamButton(code, match) {
  const team = getTeam(code);
  const isSlot = !team;
  const isWinner = match.winner && match.winner === code;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['team-row', isWinner ? 'winner' : '', selectedTeam === code ? 'selected' : '', isSlot ? 'placeholder' : ''].filter(Boolean).join(' ');
  button.disabled = isSlot;
  button.dataset.team = code;
  button.innerHTML = isSlot
    ? `<span class="slot-name">${slotLabel(code)}</span><span class="seed">${t('tbd')}</span>`
    : `<span><span class="flag" aria-hidden="true">${team.flag}</span><strong>${teamName(team)}</strong></span><span class="seed">${teamStatus(team)}</span>`;
  if (!isSlot) {
    button.setAttribute('aria-label', `View ${teamName(team)} squad`);
    button.addEventListener('click', () => selectTeam(code));
  }
  return button;
}

function renderBracket() {
  bracketEl.innerHTML = '';
  data.rounds.forEach((round) => {
    const roundEl = document.createElement('div');
    roundEl.className = 'round';
    const title = currentLang === 'ko' ? (round.titleKo || round.title) : round.title;
    roundEl.innerHTML = `<h2 class="round-title">${title}</h2>`;

    round.matches.forEach((match) => {
      const matchEl = document.createElement('article');
      matchEl.className = ['match', match.winner ? 'winner-set' : ''].filter(Boolean).join(' ');
      matchEl.innerHTML = `<div class="match-label"><span>${match.label}</span><span>${match.time || ''}</span></div>`;
      match.teams.forEach((code) => matchEl.appendChild(renderTeamButton(code, match)));
      roundEl.appendChild(matchEl);
    });

    bracketEl.appendChild(roundEl);
  });
}

function renderGroups() {
  if (!groupsEl) return;
  groupsEl.innerHTML = '';
  Object.entries(data.groups).forEach(([group, codes]) => {
    const card = document.createElement('article');
    card.className = 'group-card';
    card.innerHTML = `<h3>${currentLang === 'ko' ? `${group}조` : `Group ${group}`}</h3>`;
    codes.forEach((code) => {
      const team = getTeam(code);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = ['group-team', selectedTeam === code ? 'selected' : ''].filter(Boolean).join(' ');
      button.innerHTML = `<span class="flag">${team.flag}</span><span><strong>${teamName(team)}</strong><small>${teamStatus(team)}</small></span>`;
      button.addEventListener('click', () => selectTeam(code));
      card.appendChild(button);
    });
    groupsEl.appendChild(card);
  });
}

function renderSquad(team) {
  return team.squad.map((player) => `
    <li class="squad-player ${posClass(player.pos)}">
      <span class="player-pos">${player.pos || '-'}</span>
      <span class="player-main"><strong>${player.name}</strong><small>${player.club || t('clubTba')}</small></span>
      <span class="player-meta">${player.caps || 0} ${t('caps')} · ${player.goals || 0} ${t('goals')}</span>
    </li>
  `).join('');
}

function renderPanelEmpty() {
  panelEl.innerHTML = `
    <p class="panel-kicker">${t('selectKicker')}</p>
    <div class="panel-flag">🏆</div>
    <h2>${t('tapFlag')}</h2>
    <p class="panel-desc">${t('panelDesc')}</p>
  `;
}

function selectTeam(code) {
  const team = getTeam(code);
  if (!team) return;
  selectedTeam = code;
  panelEl.innerHTML = `
    <p class="panel-kicker">${team.confed}</p>
    <div class="panel-flag">${team.flag}</div>
    <h2>${teamName(team)}</h2>
    <div class="meta-list">
      <div><span>${t('groupSlot')}</span><strong>${teamStatus(team)}</strong></div>
      <div><span>${t('updated')}</span><strong>${data.updatedAt}</strong></div>
    </div>
    <div class="squad-header"><strong>${t('finalSquad')}</strong><span>${team.squad.length} ${t('players')}</span></div>
    <ul class="squad-list">${renderSquad(team)}</ul>
    ${team.squadUrl ? `<a class="squad-link" href="${team.squadUrl}" target="_blank" rel="noopener">${t('openTeam')}</a>` : ''}
  `;
  renderBracket();
  renderGroups();
}

function renderCards() {
  const popular = ['KOR', 'MEX', 'CAN', 'USA', 'BRA', 'ARG', 'FRA', 'ENG', 'JPN', 'GER', 'ESP', 'POR'];
  cardsEl.innerHTML = '';
  popular.forEach((code) => {
    const team = getTeam(code);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'team-card';
    button.innerHTML = `<span class="flag">${team.flag}</span><strong>${teamName(team)}</strong><small>${teamStatus(team)}</small>`;
    button.addEventListener('click', () => selectTeam(code));
    cardsEl.appendChild(button);
  });
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('wc-lang', lang);
  document.documentElement.lang = lang;
  document.body.dataset.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  langButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });
  document.documentElement.style.setProperty('--scroll-hint', JSON.stringify(t('scrollHint')));
  if (selectedTeam) {
    selectTeam(selectedTeam);
  } else {
    renderPanelEmpty();
    renderBracket();
    renderGroups();
  }
  renderCards();
}

resetBtn.addEventListener('click', () => {
  selectedTeam = null;
  renderPanelEmpty();
  renderBracket();
  renderGroups();
});

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

applyLanguage(currentLang);
