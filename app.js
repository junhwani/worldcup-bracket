const data = window.WORLD_CUP_DATA;
const bracketEl = document.querySelector('#bracket');
const panelEl = document.querySelector('#team-panel');
const cardsEl = document.querySelector('#team-cards');
const groupsEl = document.querySelector('#groups');
const resetBtn = document.querySelector('#reset-view');
let selectedTeam = null;

function getTeam(code) {
  return data.teams[code];
}

function slotLabel(slot) {
  return slot
    .replace(/Winner Group ([A-L])/g, 'Group $1 winner')
    .replace(/Runner-up Group ([A-L])/g, 'Group $1 runner-up')
    .replace(/3rd Group ([A-L/]+)/g, '3rd-place candidate: Group $1')
    .replace(/Winner Match (\d+)/g, 'Winner M$1')
    .replace(/Loser Match (\d+)/g, 'Loser M$1');
}

function slotLabelKo(slot) {
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
    ? `<span class="slot-name">${slotLabel(code)}<small>${slotLabelKo(code)}</small></span><span class="seed">TBD</span>`
    : `<span><span class="flag" aria-hidden="true">${team.flag}</span><strong>${team.name}</strong><small>${team.nameKo}</small></span><span class="seed">${team.status}</span>`;
  if (!isSlot) {
    button.setAttribute('aria-label', `View ${team.name} squad`);
    button.addEventListener('click', () => selectTeam(code));
  }
  return button;
}

function renderBracket() {
  bracketEl.innerHTML = '';
  data.rounds.forEach((round) => {
    const roundEl = document.createElement('div');
    roundEl.className = 'round';
    roundEl.innerHTML = `<h2 class="round-title">${round.title}<small>${round.titleKo || ''}</small></h2>`;

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
      button.innerHTML = `<span class="flag">${team.flag}</span><span><strong>${team.name}</strong><small>${team.nameKo} · ${team.status}</small></span>`;
      button.addEventListener('click', () => selectTeam(code));
      card.appendChild(button);
    });
    groupsEl.appendChild(card);
  });
}

function renderSquad(team) {
  return team.squad.map((player) => `
    <li class="squad-player">
      <span class="player-pos">${player.pos || '-'}</span>
      <span class="player-main"><strong>${player.name}</strong><small>${player.club || 'Club TBA'}</small></span>
      <span class="player-meta">${player.caps || 0} caps · ${player.goals || 0} goals</span>
    </li>
  `).join('');
}

function selectTeam(code) {
  const team = getTeam(code);
  if (!team) return;
  selectedTeam = code;
  panelEl.innerHTML = `
    <p class="panel-kicker">${team.confed}</p>
    <div class="panel-flag">${team.flag}</div>
    <h2>${team.name}</h2>
    <p class="panel-desc ko">${team.nameKo}</p>
    <div class="meta-list">
      <div><span>Group slot</span><strong>${team.status}</strong></div>
      <div><span>Korean</span><strong>${team.statusKo || team.status}</strong></div>
      <div><span>Updated</span><strong>${data.updatedAt}</strong></div>
    </div>
    <div class="squad-header"><strong>Final squad</strong><span>${team.squad.length} players</span></div>
    <ul class="squad-list">${renderSquad(team)}</ul>
    ${team.squadUrl ? `<a class="squad-link" href="${team.squadUrl}" target="_blank" rel="noopener">Open national team page</a>` : ''}
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
    button.innerHTML = `<span class="flag">${team.flag}</span><strong>${team.name}</strong><small>${team.nameKo}</small>`;
    button.addEventListener('click', () => selectTeam(code));
    cardsEl.appendChild(button);
  });
}

resetBtn.addEventListener('click', () => {
  selectedTeam = null;
  panelEl.innerHTML = `
    <p class="panel-kicker">Select a team</p>
    <div class="panel-flag">🏆</div>
    <h2>Tap a flag</h2>
    <p class="panel-desc">See group slot, Korean label, and final squad details.</p>
  `;
  renderBracket();
  renderGroups();
});

renderBracket();
renderGroups();
renderCards();
