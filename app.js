const data = window.WORLD_CUP_DATA;
const bracketEl = document.querySelector('#bracket');
const panelEl = document.querySelector('#team-panel');
const cardsEl = document.querySelector('#team-cards');
const resetBtn = document.querySelector('#reset-view');
let selectedTeam = null;

function getTeam(code) {
  return data.teams[code];
}

function renderTeamButton(code, match) {
  const team = getTeam(code);
  const isPlaceholder = !team;
  const isWinner = match.winner && match.winner === code;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['team-row', isWinner ? 'winner' : '', selectedTeam === code ? 'selected' : '', isPlaceholder ? 'placeholder' : ''].filter(Boolean).join(' ');
  button.disabled = isPlaceholder;
  button.dataset.team = code;
  button.innerHTML = isPlaceholder
    ? `<span class="flag">▫️</span><span class="seed">${code}</span>`
    : `<span class="flag" aria-hidden="true">${team.flag}</span><span class="seed">${isWinner ? '진출' : team.confed}</span>`;
  if (!isPlaceholder) {
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
    <a class="squad-link" href="${team.squadUrl}">선수명단 페이지 보기</a>
  `;
  renderBracket();
}

function renderCards() {
  const popular = ['KOR', 'BRA', 'ARG', 'FRA', 'ENG', 'JPN', 'USA', 'MEX'];
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
    <p class="panel-desc">국가명, 진출 상태, 선수명단 링크가 여기에 표시됩니다.</p>
  `;
  renderBracket();
});

renderBracket();
renderCards();
