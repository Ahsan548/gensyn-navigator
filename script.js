/* ---------- projects (make sure matching files exist in /assets) ---------- */
const projects = [
  { id: 'blockassist', title: 'BlockAssist', cover: 'assets/blockassist.jpg', url: 'https://blog.gensyn.ai/introducing-blockassist/' },
  { id: 'rlswarm',     title: 'RL Swarm',     cover: 'assets/rl-swarm.jpg',     url: 'https://blog.gensyn.ai/codezero-extending-rl-swarm-toward-cooperative-coding-agents/' },
  { id: 'judge',       title: 'Judge',        cover: 'assets/judge.jpg',        url: 'https://blog.gensyn.ai/introducing-judge/' },
  { id: 'codeassist',  title: 'CodeAssist',   cover: 'assets/codeassist.jpg',   url: 'https://blog.gensyn.ai/introducing-codeassist/' }
];

function makeCard(p){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="cover" style="background-image:url('${p.cover}')"></div>
    <div class="body">
      <h3>${p.title}</h3>
      <p>Gensyn project — click to open details</p>
      <a href="${p.url}" target="_blank" rel="noopener">Open project</a>
    </div>
  `;
  return el;
}

const cardsRoot = document.getElementById('cards');
projects.forEach(p => cardsRoot.appendChild(makeCard(p)));

/* ---------------- footprints (Supabase integration + fallback) ---------------- */

/* ---------- Supabase values (inserted as requested) ---------- */
const SUPABASE_URL = "https://ubontnwcxgxwsoqjstkm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVib250bndjeGd4d3NvcWpzdGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMDA0NDksImV4cCI6MjA3ODg3NjQ0OX0.Frf-E3eJUseC291It2CGYJKj3rK53ms10y6MiUARSzs";
/* -------------------------------------------------------------------------------- */

let supabaseClient = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON && !SUPABASE_URL.includes("YOUR_PROJECT_ID")) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  } else {
    console.warn("Supabase not configured. Falling back to localStorage.");
  }
} catch(e){
  console.warn("Supabase client error, using fallback:", e);
  supabaseClient = null;
}

const form = document.getElementById('footprintForm');
const footprintsRoot = document.getElementById('footprints');

async function loadFootprints() {
  footprintsRoot.innerHTML = '';

  if (supabaseClient) {
    // fetch global footprints from Supabase
    const { data, error } = await supabaseClient
      .from('footprints')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error("Supabase fetch error:", error);
      renderFallback();
      return;
    }

    data.forEach(it => {
      const card = document.createElement('div'); card.className='footprint-card';
      const img = document.createElement('img');
      img.src = it.avatar || `https://picsum.photos/seed/${encodeURIComponent(it.twitter)}/80`;
      const meta = document.createElement('div'); meta.className='meta';
      meta.innerHTML = `<strong>${escapeHtml(it.twitter)}</strong><div style="color:var(--muted);font-size:12px">${new Date(it.created_at).toLocaleString()}</div>`;
      card.appendChild(img); card.appendChild(meta); footprintsRoot.appendChild(card);
    });

  } else {
    // local fallback
    renderFallback();
  }
}

function renderFallback(){
  const items = JSON.parse(localStorage.getItem('gensyn_footprints')||'[]').slice().reverse();
  items.forEach(it=>{
    const card = document.createElement('div'); card.className='footprint-card';
    const img = document.createElement('img');
    img.src = it.avatar || 'https://picsum.photos/seed/' + encodeURIComponent(it.twitter) + '/80';
    const meta = document.createElement('div'); meta.className='meta';
    meta.innerHTML = `<strong>${escapeHtml(it.twitter)}</strong><div style="color:var(--muted);font-size:12px">${new Date(it.at).toLocaleString()}</div>`;
    card.appendChild(img); card.appendChild(meta); footprintsRoot.appendChild(card);
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(ch){
    return ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[ch];
  });
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const twitter = document.getElementById('twitter').value.trim();
  const file = document.getElementById('avatar').files[0];

  if(!twitter) return alert('Please enter Twitter handle');

  // prepare avatar as dataURL (small)
  let avatarUrl = '';
  if(file){
    avatarUrl = await new Promise(res=>{
      const r = new FileReader();
      r.onload = ()=> res(r.result);
      r.readAsDataURL(file);
    });
  }

  if (supabaseClient) {
    // insert into Supabase
    const { error } = await supabaseClient.from('footprints').insert([{ twitter, avatar: avatarUrl }]);
    if (error) {
      console.error("Supabase insert error:", error);
      alert("Failed to save to server; saved locally instead.");
      saveLocal(twitter, avatarUrl);
    } else {
      // success: reload list
      await loadFootprints();
    }
  } else {
    // fallback save locally
    saveLocal(twitter, avatarUrl);
    loadFootprints();
  }

  form.reset();
});

function saveLocal(twitter, avatarUrl) {
  const list = JSON.parse(localStorage.getItem('gensyn_footprints')||'[]');
  list.push({ twitter, avatar: avatarUrl, at: Date.now() });
  localStorage.setItem('gensyn_footprints', JSON.stringify(list));
}

/* initial load */
loadFootprints();
