const params = new URLSearchParams(location.search);
const requested = params.get('user') || 'redeyesdarknessmetaldrago';
const jsonBase = 'versus/json/';

const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

function wdlCounts(s) {
  return `<span class="w">${s.wins}W</span>
    <span class="d">${s.draws}D</span>
    <span class="l">${s.losses}L</span>`;
}

function statBox(label, s, sub) {
  const t = s.games || 1;
  return `<div class="stat-box">
  <div class="label">${esc(label)}</div>
  <div class="big">${(s.score * 100).toFixed(1)}<small>%</small></div>
  <div class="wdl" style="margin-top:6px">${wdlCounts(s)}</div>
  <div class="bar"><div>
    <div class="bw" style="width:${(s.wins / t) * 100}%"></div>
    <div class="bd" style="width:${(s.draws / t) * 100}%"></div>
    <div class="bl" style="width:${(s.losses / t) * 100}%"></div>
  </div></div>
  <div class="sub" style="margin-top:6px">${s.games} games${
    sub ? ' · ' + esc(sub) : ''
  }</div>
</div>`;
}

function sortedRows(rows, sort, valFn) {
  if (!sort.key) return rows;
  const f = valFn[sort.key];
  return [...rows].sort((a, b) => {
    const x = f(a);
    const y = f(b);
    const c = typeof x === 'string' ? x.localeCompare(y) : x - y;
    return c * sort.dir;
  });
}

function thSort(id, key, sort, label) {
  const arrow = sort.key === key ? (sort.dir > 0 ? ' ▲' : ' ▼') : '';
  return `<th class="sortable" onclick="${id}('${key}')">${esc(
    label
  )}${arrow}</th>`;
}

function render(d) {
  const p = d.player || {};
  document.getElementById('pname').innerHTML =
    `${esc(p.name || d.username)} <span class="sub">vs titled players</span>`;
  const bits = [];
  if (p.country) bits.push(p.country.split('/').pop());
  if (p.joined) bits.push('joined ' + new Date(p.joined * 1000).getFullYear());
  if (p.status) bits.push(p.status);
  bits.push(`generated ${d.generated_at}`);
  document.getElementById('psub').textContent = bits.join(' · ');
  if (p.avatar) {
    const a = document.getElementById('avatar');
    a.src = p.avatar;
    a.hidden = false;
  }
  if (p.url)
    document.getElementById('psub').innerHTML +=
      ` · <a href="${esc(p.url)}" target="_blank">chess.com ↗</a>`;

  const t = d.totals;
  const speeds = ['bullet', 'blitz', 'rapid', '-']
    .map((k) => [k === '-' ? 'other' : k, d.by_speed[k]])
    .filter(([, s]) => s && s.games > 0);
  const boxes = [
    statBox('Overall', t, `${d.opponents.length} opponents`),
    ...speeds.map(([k, s]) => statBox(k, s)),
  ];
  const eco = d.by_eco.slice(0, 20);
  const allOpps = d.opponents;
  const allGames = d.games.slice().reverse();

  const formWindow = (n) => {
    const rows = allGames.slice(0, n);
    const s = {
      games: rows.length,
      wins: rows.filter((g) => g.outcome === 'win').length,
      draws: rows.filter((g) => g.outcome === 'draw').length,
      losses: rows.filter((g) => g.outcome === 'loss').length,
    };
    s.score = s.games ? (s.wins + 0.5 * s.draws) / s.games : 0;
    return s;
  };
  const formRows = Array.from({ length: 10 }, (_, i) => {
    const n = (i + 1) * 10;
    return [n, formWindow(n)];
  });

  const oppVal = {
    opponent: (o) => o.opponent.toLowerCase(),
    title: (o) => o.title.toLowerCase(),
    games: (o) => o.games,
    wins: (o) => o.wins,
    draws: (o) => o.draws,
    losses: (o) => o.losses,
    score: (o) => o.score,
    first: (o) => o.first_date,
    last: (o) => o.last_date,
  };
  const gameVal = {
    date: (g) => g.date,
    opponent: (g) => g.opponent.toLowerCase(),
    title: (g) => g.title.toLowerCase(),
    result: (g) => g.result,
    outcome: (g) => ({ win: 0, draw: 1, loss: 2 })[g.outcome],
    eco: (g) => g.eco,
    time_control: (g) => parseInt(g.time_control, 10) || 0,
    speed: (g) => g.speed,
  };
  const oppSort = { key: 'games', dir: -1 };
  const gameSort = { key: 'date', dir: -1 };
  const oppHeads = [
    ['opponent', 'Opponent'],
    ['title', 'Title'],
    ['games', 'Games'],
    ['wins', 'W'],
    ['draws', 'D'],
    ['losses', 'L'],
    ['score', 'Score'],
    ['first', 'First'],
    ['last', 'Last'],
  ];
  const gameHeads = [
    ['date', 'Date'],
    ['opponent', 'Opponent'],
    ['title', 'Title'],
    ['result', 'Result'],
    ['outcome', 'Outcome'],
    ['eco', 'ECO'],
    ['time_control', 'Time control'],
    ['speed', 'Speed'],
  ];
  const headRow = (fn, sort, heads) =>
    heads.map(([k, l]) => thSort(fn, k, sort, l)).join('');

  const memberUrl = (u) =>
    `https://www.chess.com/member/${encodeURIComponent(u)}`;
  const oppLink = (u) =>
    `<a href="${memberUrl(u)}" target="_blank" rel="noopener">${esc(u)}</a>`;

  const oppRow = (o) => `<tr><td>${oppLink(o.opponent)}</td>
    <td>${esc(o.title)}</td><td>${o.games}</td>
    <td class="w">${o.wins}</td><td class="d">${o.draws}</td>
    <td class="l">${o.losses}</td>
    <td class="score">${(o.score * 100).toFixed(0)}%</td>
    <td>${esc(o.first_date)}</td><td>${esc(o.last_date)}</td></tr>`;
  const gameRow = (g) => `<tr><td>${esc(g.date)}</td>
    <td>${oppLink(g.opponent)}</td><td>${esc(g.title)}</td>
    <td>${esc(g.result)}</td>
    <td class="${g.outcome === 'win' ? 'w' : g.outcome === 'draw' ? 'd' : 'l'}">
      ${g.outcome}</td>
    <td>${esc(g.eco)}</td><td>${esc(g.time_control)}</td>
    <td><span class="pill">${esc(g.speed)}</span></td></tr>`;

  const doSort = (sort, valFn, key, tbodyId, headFn, heads, sample) => {
    if (sort.key === key) sort.dir *= -1;
    else {
      sort.key = key;
      sort.dir = typeof valFn[key](sample) === 'string' ? 1 : -1;
    }
    const rows = tbodyId === 'oppBody' ? allOpps : allGames;
    const rowFn = tbodyId === 'oppBody' ? oppRow : gameRow;
    document.getElementById(tbodyId).innerHTML = sortedRows(rows, sort, valFn)
      .map(rowFn)
      .join('');
    document.querySelector(
      tbodyId === 'oppBody' ? '#oppTable thead tr' : '#gameTable thead tr'
    ).innerHTML = headRow(headFn, sort, heads);
  };
  window.sortOpps = (key) =>
    doSort(oppSort, oppVal, key, 'oppBody', 'sortOpps', oppHeads, allOpps[0]);
  window.sortGames = (key) =>
    doSort(
      gameSort,
      gameVal,
      key,
      'gameBody',
      'sortGames',
      gameHeads,
      allGames[0]
    );

  document.getElementById('main').innerHTML = `
<div class="stats-row">${boxes.join('')}</div>
<div class="grid">
  <div class="card"><h2>By title (score vs holders)</h2>
    <div class="scroll-sm"><table>
    <tr><th>Title</th><th>Players</th><th class="w">W</th><th class="d">D</th>
        <th class="l">L</th><th>Score</th></tr>
    ${d.by_title
      .map(
        (x) => `<tr><td><b>${x.title}</b></td><td>${x.players}</td>
      <td class="w">${x.wins}</td><td class="d">${x.draws}</td>
      <td class="l">${x.losses}</td>
      <td class="score">${(x.score * 100).toFixed(1)}%</td></tr>`
      )
      .join('')}
    </table></div></div>
  <div class="card"><h2>Top ECO openings</h2>
    <div class="scroll-sm"><table>
    <tr><th>ECO</th><th class="w">W</th><th class="d">D</th><th class="l">L</th>
        <th>Score</th></tr>
    ${eco
      .map(
        (e) => `<tr><td>${esc(e.eco)}</td>
      <td class="w">${e.wins}</td><td class="d">${e.draws}</td>
      <td class="l">${e.losses}</td>
      <td class="score">${(e.score * 100).toFixed(1)}%</td></tr>`
      )
      .join('')}
    </table></div></div>
  <div class="card"><h2>Recent form</h2>
    <div class="scroll-sm"><table class="form">
    <tr><th>Last</th><th>Games</th><th class="w">W</th><th class="d">D</th>
        <th class="l">L</th><th>Score</th><th class="form-delta">Career</th></tr>
    ${formRows
      .map(
        ([n, s]) => `<tr><td>${n}</td><td>${s.games}</td>
      <td class="w">${s.wins}</td><td class="d">${s.draws}</td>
      <td class="l">${s.losses}</td>
      <td class="score">${(s.score * 100).toFixed(1)}%</td>
      <td class="${s.score >= t.score ? 'w' : 'l'}">${
        s.score - t.score >= 0 ? '+' : ''
      }${((s.score - t.score) * 100).toFixed(1)}%</td></tr>`
      )
      .join('')}
    </table></div></div>
  <div class="card full"><h2>Opponents (${allOpps.length})</h2>
    <div class="scroll"><table id="oppTable">
    <thead><tr>${headRow('sortOpps', oppSort, oppHeads)}</tr></thead>
    <tbody id="oppBody">${sortedRows(allOpps, oppSort, oppVal)
      .map(oppRow)
      .join('')}</tbody>
    </table></div></div>
  <div class="card full"><h2>Games (${allGames.length})</h2>
    <div class="scroll"><table id="gameTable">
    <thead><tr>${headRow('sortGames', gameSort, gameHeads)}</tr></thead>
    <tbody id="gameBody">${sortedRows(allGames, gameSort, gameVal)
      .map(gameRow)
      .join('')}</tbody>
    </table></div></div>
</div>`;
}

async function discoverUsers() {
  try {
    const r = await fetch(jsonBase);
    if (!r.ok) return;
    const html = await r.text();
    const users = [...html.matchAll(/href="([a-z0-9_]+)_stats\.json"/gi)].map(
      (m) => m[1].toLowerCase()
    );
    const sel = document.getElementById('usersel');
    if (users.length > 1) {
      sel.innerHTML = users
        .map(
          (u) => `<option ${u === requested ? 'selected' : ''}>${u}</option>`
        )
        .join('');
      sel.hidden = false;
      sel.onchange = () => {
        location.search = '?user=' + sel.value;
      };
    }
  } catch (_) {}
}

(async () => {
  discoverUsers();
  try {
    const r = await fetch(jsonBase + requested + '_stats.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    render(await r.json());
  } catch (e) {
    document.getElementById('main').innerHTML =
      `<div class="err">Could not load <code>${jsonBase}${requested}_stats.json</code><br>
     ${esc(e.message)} — serve this folder over HTTP, e.g.<br>
     <code>cd data/masters && python3 -m http.server 8000</code></div>`;
  }
})();
