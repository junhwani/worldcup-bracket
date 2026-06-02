const data = window.WORLD_CUP_DATA;
const bracketEl = document.querySelector('#bracket');
const panelEl = document.querySelector('#team-panel');
const cardsEl = document.querySelector('#team-cards');
const groupsEl = document.querySelector('#groups');
const resetBtn = document.querySelector('#reset-view');
let selectedTeam = null;

const slotKo = {
  'Winner Group': '조 1위',
  'Runner-up Group': '조 2위',
  '3rd Group': '조 3위 후보',
  'Winner Match': '승자',
  'Loser Match': '패자',
};

function getTeam(code) {
  return data.teams[code];
}

function slotLabel(slot) {
  return slot
    .replace(/Winner Group ([A-L])/g, '$1조 1위')
    .replace(/Runner-up Group ([A-L])/g, '$1조 2위')
    .replace(/3rd Group ([A-L/]+)/g, '$1조 3위 후보')
    .replace(/Winner Match (\d+)/g, 'M$1 승자')
    .replace(/Loser Match (\d+)/g, 'M$1 패자');
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
    ? `<span class="slot-name">${slotLabel(code)}</span><span class="seed">예정</span>`
    : `<span><span class="flag" aria-hidden="true">${team.flag}</span><strong>${team.nameKo}</strong></span><span class="seed">${team.status}</span>`;
  if (!isSlot) {
    button.setAttribute('aria-label', `${team.nameKo} 정보 보기`);
    button.addEventListener('click', () => selectTeam(code));
  }
  return button;
}

function renderBracket() {
  bracketEl.innerHTML = '';
  data.rounds.forEach((round) => {
    const roundEl = document.createElement('div');
    roundEl.className = 'round';
    roundEl.innerHTML = `<h2 class="round-title">${round.title}</h2>`;

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
    card.innerHTML = `<h3>Group ${group}</h3>`;
    codes.forEach((code) => {
      const team = getTeam(code);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = ['group-team', selectedTeam === code ? 'selected' : ''].filter(Boolean).join(' ');
      button.innerHTML = `<span class="flag">${team.flag}</span><span><strong>${team.nameKo}</strong><small>${team.status}</small></span>`;
      button.addEventListener('click', () => selectTeam(code));
      card.appendChild(button);
    });
    groupsEl.appendChild(card);
  });
}

function selectTeam(code) {
  const team = getTeam(code);
  if (!team) return;
  selectedTeam = code;
  panelEl.innerHTML = `
    <p class="panel-kicker">${team.confed}</p>
    <div class="panel-flag">${team.flag}</div>
    <h2>${team.nameKo}</h2>
    <p class="panel-desc">${team.nameEn}</p>
    <div class="meta-list">
      <div><span>상태</span><strong>${team.status}</strong></div>
      <div><span>업데이트</span><strong>${data.updatedAt}</strong></div>
      <div><span>코드</span><strong>${code}</strong></div>
    </div>
    <p class="panel-desc">대표 선수/후보</p>
    <div class="squad-list">${team.squad.map((player) => `<b>${player}</b>`).join('')}</div>
    ${team.squadUrl ? `<a class="squad-link" href="${team.squadUrl}" target="_blank" rel="noopener">국가대표 페이지 보기</a>` : ''}
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
    button.innerHTML = `<span class="flag">${team.flag}</span><strong>${team.nameKo}</strong><small>${team.nameEn}</small>`;
    button.addEventListener('click', () => selectTeam(code));
    cardsEl.appendChild(button);
  });
}

resetBtn.addEventListener('click', () => {
  selectedTeam = null;
  panelEl.innerHTML = `
    <p class="panel-kicker">국가 선택</p>
    <div class="panel-flag">🏆</div>
    <h2>국기를 눌러보세요</h2>
    <p class="panel-desc">실제 조편성, 진출 슬롯, 국가대표 페이지 링크가 여기에 표시됩니다.</p>
  `;
  renderBracket();
  renderGroups();
});

renderBracket();
renderGroups();
renderCards();
