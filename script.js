/* ---------- projects data: replace image file names with your assets ---------- */
const projects = [
  {
    id: 'blockassist',
    title: 'BlockAssist',
    cover: 'assets/BlockAssist.jpg',
    url: 'https://blog.gensyn.ai/introducing-blockassist/'
  },
  {
    id: 'rlswarm',
    title: 'RL Swarm',
    cover: 'assets/R-L Swarm.jpg',
    url: 'https://blog.gensyn.ai/codezero-extending-rl-swarm-toward-cooperative-coding-agents/'
  },
  {
    id: 'judge',
    title: 'Judge',
    cover: 'assets/Judge.jpg',
    url: 'https://blog.gensyn.ai/introducing-judge/'
  },
  {
    id: 'codeassist',
    title: 'CodeAssist',
    cover: 'assets/Code-Assist.jpg',
    url: 'https://blog.gensyn.ai/introducing-codeassist/'
  }
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

/* ---------------- footprints (localStorage) ---------------- */
const form = document.getElementById('footprintForm');
const footprintsRoot = document.getElementById('footprints');

function readStorage(){ 
  try { return JSON.parse(localStorage.getItem('gensyn_footprints')||'[]'); }
  catch(e){ return []; }
}
function writeStorage(arr){ localStorage.setItem('gensyn_footprints', JSON.stringify(arr)); }

function renderFootprints(){
  footprintsRoot.innerHTML = '';
  const items = readStorage().reverse();
  items.forEach(it=>{
    const card = document.createElement('div'); card.className='footprint-card';
    const img = document.createElement('img');
    img.src = it.avatar || 'https://picsum.photos/seed/' + encodeURIComponent(it.twitter) + '/80';
    const meta = document.createElement('div'); meta.className='meta';
    meta.innerHTML = `<strong>${it.twitter}</strong><div style="color:var(--muted);font-size:12px">${new Date(it.at).toLocaleString()}</div>`;
    card.appendChild(img); card.appendChild(meta); footprintsRoot.appendChild(card);
  });
}
renderFootprints();

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const twitter = document.getElementById('twitter').value.trim();
  const file = document.getElementById('avatar').files[0];

  if(!twitter) return alert('Please enter Twitter handle');

  // quick avatar as dataURL (small)
  let avatarUrl = '';
  if(file){
    avatarUrl = await new Promise(res=>{
      const r = new FileReader();
      r.onload = ()=> res(r.result);
      r.readAsDataURL(file);
    });
  }

  const list = readStorage();
  list.push({twitter, avatar: avatarUrl, at: Date.now()});
  writeStorage(list);
  renderFootprints();
  form.reset();
});

/* ---------------- optional: Supabase example
// If you want footprints saved globally (so everyone sees them), use Supabase.
// 1) create a table 'footprints' with columns: id (uuid pk), twitter text, avatar text, created_at timestamptz default now()
// 2) set SUPABASE_URL & SUPABASE_ANON in .env (never expose private keys in public repos!)

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON = 'public-anon-key';
const supabase = supabaseCreateClient(SUPABASE_URL, SUPABASE_ANON);

async function saveToSupabase(twitter, avatarData){
  const { data, error } = await supabase.from('footprints').insert([{ twitter, avatar: avatarData }]);
  if(error) console.error(error);
}
*/
