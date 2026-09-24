// ---------- storage ----------
const STORE_KEY = 'nexoraweb_projects';
function loadProjects(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }catch{ return []; } }
function saveProjects(list){ localStorage.setItem(STORE_KEY, JSON.stringify(list)); }

// ---------- generation engine ----------
// Swap this function's internals for a real AI API call later; the
// (prompt) -> {name,type,industry,palette,tagline} contract stays the same.
function parsePrompt(prompt){
  const p = prompt.toLowerCase();
  const typeMap = [
    [/restaurant|cafe|caf\u00e9|menu|bistro/, 'restaurant'],
    [/store|shop|clothing|jewelry|electronics|e-?commerce|products?/, 'ecommerce'],
    [/portfolio|photographer|designer|artist|freelanc/, 'portfolio'],
    [/saas|app|platform|software/, 'saas']
  ];
  let type = 'service';
  for (const [re,t] of typeMap) if (re.test(p)) { type = t; break; }

  let name = null;
  const nm = prompt.match(/called\s+["']?([A-Za-z][\w &'-]{1,40}?)["']?(?=[.,]|\s+(?:use|with|and|in)\b|$)/i) ||
             prompt.match(/named\s+["']?([A-Za-z][\w &'-]{1,40}?)["']?(?=[.,]|\s+(?:use|with|and|in)\b|$)/i);
  if (nm) name = nm[1].trim();

  let industry = null;
  const im = prompt.match(/for\s+(?:a|an|my)\s+([a-z0-9 ,'-]{3,60}?)(?:\s+called|\s+named|\.|,|$)/i);
  if (im) industry = im[1].trim();

  const colorWords = ['dark blue','navy','gold','black','white','green','teal','red','orange','purple','pink','beige','brown','grey','gray'];
  const found = colorWords.filter(c => p.includes(c));
  const palette = pickPalette(found);
  const tagline = industry ? `Professional ${industry}, done right.` : 'Built to help your business grow.';
  return { name: name || autoName(type), type, industry, palette, tagline };
}

const PALETTES = {
  default:{primary:'#2A6F6F',dark:'#1B1F23',accent:'#C9A24B',bg:'#FAF7F2'},
  navy:{primary:'#1D2B4F',dark:'#0F1626',accent:'#C9A24B',bg:'#F5F6FA'},
  black_gold:{primary:'#1B1B1B',dark:'#000000',accent:'#C9A24B',bg:'#F7F6F3'},
  green:{primary:'#1F5F4A',dark:'#12332A',accent:'#D8C08A',bg:'#F6F8F5'}
};
function pickPalette(words){
  if(words.includes('navy')||words.includes('dark blue')) return PALETTES.navy;
  if(words.includes('gold')&&words.includes('black')) return PALETTES.black_gold;
  if(words.includes('green')) return PALETTES.green;
  return PALETTES.default;
}

const NAME_PARTS = {
  service:{n1:['Summit','Harbor','Anchor','North','Stonegate','Keystone'],n2:['Works','Group','Partners','& Co.','Collective']},
  ecommerce:{n1:['Bright','Field','Woven','Coastal','Maple','Nordic'],n2:['Goods','Market','Supply Co.','Trading Co.']},
  restaurant:{n1:['Olive','Ember','Copper','Harborline','Thyme'],n2:['Table','Kitchen','& Co.','House']},
  portfolio:{n1:['Studio','Atelier','Field','North','Quiet'],n2:['Studio','Works','& Co.']},
  saas:{n1:['Nimbus','Vector','Basecamp','Northline','Clearpath'],n2:['io','Labs','Cloud','App']}
};
function autoName(type){
  const p = NAME_PARTS[type]||NAME_PARTS.service;
  return `${p.n1[Math.floor(Math.random()*p.n1.length)]} ${p.n2[Math.floor(Math.random()*p.n2.length)]}`;
}

const SECTIONS = {
  service:{heading:'Services',items:['Consultation & Planning','Full Project Delivery','Ongoing Support']},
  ecommerce:{heading:'Featured Products',items:['Bestseller Bundle','New Arrival','Customer Favorite']},
  restaurant:{heading:'From the Menu',items:['Signature Dish','Seasonal Special','House Favorite']},
  portfolio:{heading:'Selected Work',items:['Project One','Project Two','Project Three']},
  saas:{heading:'Features',items:['Fast Setup','Built-in Analytics','Team Collaboration']}
};
const ICON = {service:'🛠️',ecommerce:'🛍️',restaurant:'🍽️',portfolio:'🎨',saas:'⚡'};

function generateSiteHTML({name,type,industry,palette,tagline}){
  const sec = SECTIONS[type]||SECTIONS.service;
  const icon = ICON[type]||'⭐';
  const items = sec.items.map(i=>`<div class="icard"><h3>${i}</h3><p>${industry?'Part of our work in '+industry+'.':'Quality you can count on.'}</p></div>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${tagline}">
<style>
*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;color:${palette.dark};background:${palette.bg}}
nav{position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;padding:16px 32px;background:${palette.bg}ee;border-bottom:1px solid #0001}
.logo{font-weight:700}
nav a{background:${palette.primary};color:#fff;padding:9px 18px;border-radius:6px;text-decoration:none;font-weight:600}
.hero{background:linear-gradient(135deg,${palette.primary},${palette.dark});color:#fff;text-align:center;padding:100px 24px}
.hero h1{font-size:clamp(30px,6vw,50px);margin:0 0 14px}
.hero a{display:inline-block;margin-top:20px;background:#fff;color:${palette.dark};padding:14px 26px;border-radius:6px;text-decoration:none;font-weight:700}
section{max-width:920px;margin:0 auto;padding:56px 24px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}
.icard{background:#fff;border:1px solid #0001;border-radius:10px;padding:20px}
footer{text-align:center;padding:32px;color:#666;font-size:14px;border-top:1px solid #0001}
</style></head><body>
<nav><div class="logo">${icon} ${name}</div><a href="#contact">Get in touch</a></nav>
<div class="hero"><h1>${tagline}</h1><p>${industry?'Serving '+industry+'.':''}</p><a href="#contact">Get started</a></div>
<section><h2>${sec.heading}</h2><div class="grid">${items}</div></section>
<section id="contact"><h2>Contact</h2><p>Reach out to get started.</p></section>
<footer>© ${new Date().getFullYear()} ${name}. Built with NexoraWeb.</footer>
</body></html>`;
}

// ---------- UI ----------
let activeId = null;

function handleGenerate(){
  const prompt = document.getElementById('prompt').value.trim();
  if(!prompt) return;
  const parsed = parsePrompt(prompt);
  const html = generateSiteHTML(parsed);
  const project = { id:'p_'+Date.now(), prompt, ...parsed, html, createdAt:new Date().toISOString() };
  const list = loadProjects();
  list.unshift(project);
  saveProjects(list);
  document.getElementById('prompt').value = '';
  renderDashboard();
  openBuilder(project.id);
}

function renderDashboard(){
  const list = loadProjects();
  const el = document.getElementById('list');
  if(!list.length){ el.innerHTML = '<p class="empty">No websites yet — describe one above.</p>'; return; }
  el.innerHTML = list.map(p=>`
    <div class="proj">
      <div><b>${p.name}</b><div class="meta">${p.type}${p.industry?' · '+p.industry:''}</div></div>
      <div class="actions">
        <button class="ghost" onclick="openBuilder('${p.id}')">Open</button>
        <button class="ghost" onclick="exportById('${p.id}')">Export</button>
        <button class="ghost" onclick="deleteProject('${p.id}')">Delete</button>
      </div>
    </div>`).join('');
}

function openBuilder(id){
  const proj = loadProjects().find(p=>p.id===id);
  if(!proj) return;
  activeId = id;
  document.getElementById('builderTitle').textContent = proj.name;
  document.getElementById('preview').srcdoc = proj.html;
  document.getElementById('hero').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('builder').classList.remove('hidden');
}

function showDashboard(){
  activeId = null;
  document.getElementById('hero').classList.remove('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('builder').classList.add('hidden');
  renderDashboard();
}

function downloadHTML(proj){
  const blob = new Blob([proj.html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = proj.name.replace(/\s+/g,'-').toLowerCase()+'.html';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function exportSite(){ const proj = loadProjects().find(p=>p.id===activeId); if(proj) downloadHTML(proj); }
function exportById(id){ const proj = loadProjects().find(p=>p.id===id); if(proj) downloadHTML(proj); }
function deleteProject(id){
  saveProjects(loadProjects().filter(p=>p.id!==id));
  renderDashboard();
}

renderDashboard();
