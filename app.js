const defaults = {
  groom: 'आकाश', bride: 'वैष्णवी', note: 'आपल्या प्रेमळ उपस्थितीची अपेक्षा आहे.',
  welcomeKicker: 'शुभ मंगल सावधान', welcomeTitle: 'हार्दिक आमंत्रण', welcomeCopy: 'तुमच्या उपस्थितीने आमचा आनंद द्विगुणित होईल.',
  monogram: { left:'अ', right:'व', separator:'✦', style:'circle', size:34, border:'solid' },
  whatsappNumber: '',
  venueMapUrl: '',
  venue: { title:'विवाह स्थळ', symbol:'⌂', fields:[['स्थळाचे नाव','आपले विवाह स्थळ'],['पूर्ण पत्ता','येथे पूर्ण पत्ता लिहा']] },
  parents: { title:'आई व वडील', symbol:'♡', fields:[['नावे','श्री. व सौ. आपले नाव']] },
  datetime: { title:'दिनांक व वेळ', symbol:'◷', fields:[['दिनांक','रविवार, १५ डिसेंबर २०२६'],['वेळ','सायंकाळी ६:०० वाजता']] },
  wellwishers: { title:'आपले कृपाभीलाषी', symbol:'✧', fields:[['नावे','आपले प्रियजन व मित्रपरिवार']] },
  welcome: { title:'स्वागतोत्सुक', symbol:'✤', fields:[['नावे','आपले नाव व कुटुंब']] },
  mama: { title:'आमच्या मामाच्या लग्नाला यायचं हं!', symbol:'☻', fields:[['संदेश','तुमची उपस्थिती आमच्यासाठी खूप खास आहे!']] }
};
const folderOrder = ['parents','venue','datetime','wellwishers','welcome','mama'];
let state = JSON.parse(localStorage.getItem('marathiWeddingInvite') || 'null') || structuredClone(defaults);
state.monogram = { ...defaults.monogram, ...(state.monogram || {}) };
state.whatsappNumber = state.whatsappNumber || '';
state.venueMapUrl = state.venueMapUrl || '';
let currentFolder = null;
let isAdmin = false;
const $ = s => document.querySelector(s);
function persist(){ localStorage.setItem('marathiWeddingInvite', JSON.stringify(state)); }
function folderPreview(folder) { return state[folder].fields[0]?.[1] || ''; }
function renderFolders() {
  $('#folderGrid').innerHTML = folderOrder.map(key => {
    const f=state[key];
    return `<button class="folder-card" data-folder="${key}" type="button"><span class="folder-icon">${f.symbol}</span><b>${f.title}</b><small>${folderPreview(key)}</small><span class="chevron">›</span></button>`;
  }).join('');
  document.querySelectorAll('[data-folder]').forEach(el => el.addEventListener('click', () => openModal(el.dataset.folder)));
}
function loadImages(){
  const couple=localStorage.getItem('couplePhoto'); const bg=localStorage.getItem('weddingBackground');
  if(couple) $('#welcomeBackdrop').style.backgroundImage=`linear-gradient(145deg,rgba(60,43,35,.4),rgba(88,31,37,.25)),url(${couple})`;
  if(bg) $('#heroImage').style.backgroundImage=`url(${bg})`; else if(couple) $('#heroImage').style.backgroundImage=`url(${couple})`;
}
function updateText(){
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if(key === 'monogram') return;
    el.textContent = state[key] ?? defaults[key];
  });
  $('#notePreview').textContent=state.note;
  renderMonogram();
  renderVenueMap();
}
function renderMonogram(){
  const m=state.monogram;
  const el=$('#monogram');
  el.innerHTML=`<span>${escapeHtml(m.left)}</span><i>${escapeHtml(m.separator)}</i><span>${escapeHtml(m.right)}</span>`;
  el.className=`monogram monogram-${m.style || 'circle'} monogram-border-${m.border || 'solid'}`;
  el.style.fontSize=`${Math.max(20,Math.min(72,Number(m.size)||34))}px`;
}
function escapeHtml(value){ return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function setAdminMode(enabled) {
  isAdmin = enabled;
  $('#couplePhotoBtn').classList.toggle('hidden', !enabled);
  $('#backgroundBtn').classList.toggle('hidden', !enabled);
  $('#adminLogout').classList.toggle('hidden', !enabled);
  $('#editToggle').classList.toggle('hidden', !enabled);
  $('#adminHomePanel').classList.toggle('hidden', !enabled);
  $('#adminOnlyTools').classList.toggle('hidden', !enabled);
  $('#showAdminLogin').classList.toggle('hidden', enabled);
  $('#adminHomePanel').querySelectorAll('button').forEach(b=>b.disabled=false);
  document.querySelectorAll('[data-key]').forEach(el => { el.contentEditable = enabled && el.dataset.key !== 'monogram' ? 'true' : 'false'; el.title = enabled ? 'संपादित करण्यासाठी टॅप करा' : ''; });
}
function openModal(key){
  currentFolder=key;
  const f=key==='note'?{title:'टीप',symbol:'✦',fields:[['आपली टीप',state.note]]}:state[key];
  $('#modalSymbol').textContent=f.symbol; $('#modalKicker').textContent=key==='note'?'विशेष संदेश':'विवाह सोहळा'; $('#modalTitle').textContent=f.title;
  $('#modalFields').innerHTML = '';
  f.fields.forEach(([label,value]) => addField(label, value, key === 'note'));
  $('#addDetail').classList.toggle('hidden', key === 'note' || !isAdmin);
  $('#saveDetail').classList.toggle('hidden', !isAdmin);
  document.querySelectorAll('#modalFields input, #modalFields textarea').forEach(el => el.disabled = !isAdmin);
  document.querySelectorAll('.remove-detail').forEach(el => el.classList.toggle('hidden', !isAdmin));
  $('#detailModal').classList.remove('hidden');
}
function addField(label = 'माहितीचे शीर्षक', value = '', isNote = false) {
  const field = document.createElement('div'); field.className = 'field';
  field.innerHTML = isNote
    ? `<label>आपली टीप</label><textarea data-value>${escapeHtml(value)}</textarea>`
    : `<input class="field-label-input" data-label value="${escapeHtml(label)}" aria-label="माहितीचे शीर्षक" /><input data-value value="${escapeHtml(value)}" aria-label="तपशील" /><button class="remove-detail" type="button" aria-label="ही माहिती काढा">×</button>`;
  $('#modalFields').append(field);
}
function openMonogramEditor(){
  if(!isAdmin) return;
  const m=state.monogram;
  $('#monogramModalFields').innerHTML=`
    <div class="field"><label>डावीकडील अक्षर / चिन्ह</label><input id="monoLeft" value="${escapeHtml(m.left)}" /></div>
    <div class="field"><label>मधला चिन्ह</label><input id="monoSep" value="${escapeHtml(m.separator)}" /></div>
    <div class="field"><label>उजवीकडील अक्षर / चिन्ह</label><input id="monoRight" value="${escapeHtml(m.right)}" /></div>
    <div class="field"><label>डिझाइन</label><select id="monoStyle"><option value="circle">गोल</option><option value="square">चौकोनी</option><option value="minimal">मिनिमल</option></select></div>
    <div class="field"><label>Border</label><select id="monoBorder"><option value="solid">Solid</option><option value="double">Double</option><option value="none">None</option></select></div>
    <div class="field"><label>अक्षरांचा आकार</label><input id="monoSize" type="range" min="20" max="72" value="${Number(m.size)||34}" /><output id="monoSizeOut">${Number(m.size)||34}px</output></div>`;
  $('#monoStyle').value=m.style||'circle'; $('#monoBorder').value=m.border||'solid';
  $('#monogramModal').classList.remove('hidden');
  $('#monoSize').addEventListener('input',e=>$('#monoSizeOut').textContent=e.target.value+'px');
}
function saveMonogram(){
  if(!isAdmin) return;
  state.monogram={left:$('#monoLeft').value.trim()||defaults.monogram.left,separator:$('#monoSep').value.trim()||defaults.monogram.separator,right:$('#monoRight').value.trim()||defaults.monogram.right,style:$('#monoStyle').value,border:$('#monoBorder').value,size:Number($('#monoSize').value)||34};
  persist(); updateText(); $('#monogramModal').classList.add('hidden');
}
function closeModal(){ $('#detailModal').classList.add('hidden'); currentFolder=null; }
function fileToStore(input,key,after){ const file=input.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try { localStorage.setItem(key,reader.result); after(); } catch { alert('फोटोचा आकार खूप मोठा आहे. कृपया छोटा फोटो निवडा.'); } }; reader.readAsDataURL(file); }
function showInvitation(name, admin = false) { setAdminMode(admin); $('#guestGreeting').textContent = admin ? 'प्रिय आयोजक' : (name ? `प्रिय ${name}` : 'प्रिय पाहुणे'); $('#welcomeScreen').classList.add('hidden'); $('#adminScreen').classList.add('hidden'); $('#invitationScreen').classList.remove('hidden'); }
function normalizeWhatsappNumber(value){ return String(value||'').replace(/\D/g,''); }
function setWhatsappNumber(){
  if(!isAdmin) return;
  const current=state.whatsappNumber || '';
  const value=prompt('WhatsApp नंबर सेट करा (उदा. 919876543210):', current);
  if(value===null) return;
  const number=normalizeWhatsappNumber(value);
  if(number && number.length < 10){ alert('कृपया योग्य WhatsApp नंबर टाका.'); return; }
  state.whatsappNumber=number; persist(); updateWhatsappUI();
}
function updateWhatsappUI(){
  const has=!!state.whatsappNumber;
  $('#whatsappGuestBtn').classList.toggle('hidden',!has);
  $('#whatsappAdminStatus').textContent=has ? `सेट नंबर: +${state.whatsappNumber}` : 'WhatsApp नंबर अजून सेट केलेला नाही.';
}
function shareOnWhatsapp(){
  const number=normalizeWhatsappNumber(state.whatsappNumber);
  if(!number) return;
  const text=`आकाश आणि वैष्णवी यांच्या शुभविवाहाचे हार्दिक आमंत्रण ❤️\n${location.href}`;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`,'_blank','noopener');
}
function saveVenueMap(){
  if(!isAdmin) return;
  const value=$('#venueMapUrlInput').value.trim();
  if(value && !/^https?:\/\//i.test(value)){ alert('Google Maps ची पूर्ण लिंक पेस्ट करा.'); return; }
  state.venueMapUrl=value; persist(); renderVenueMap(); $('#mapSettingsModal').classList.add('hidden');
}
function renderVenueMap(){
  const has=!!state.venueMapUrl;
  $('#guestMapBtn').classList.toggle('hidden',!has);
  $('#adminMapStatusInline').textContent=has ? 'Google Maps pin सेट आहे. Guest ला हाच location दिसेल.' : 'अजून location pin सेट केलेला नाही.'; $('#adminMapStatus').textContent=has ? 'Google Maps pin सेट आहे.' : 'अजून pin सेट केलेला नाही.';
  if($('#venueMapUrlInput')) $('#venueMapUrlInput').value=state.venueMapUrl || '';
}
function openMapSettings(){ if(!isAdmin)return; $('#mapSettingsModal').classList.remove('hidden'); renderVenueMap(); }
function openGuestMap(){ if(state.venueMapUrl) window.open(state.venueMapUrl,'_blank','noopener'); }
$('#guestForm').addEventListener('submit', e=>{e.preventDefault(); showInvitation($('#guestName').value.trim());});
$('#backBtn').addEventListener('click',()=>{ $('#invitationScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#showAdminLogin').addEventListener('click', () => { $('#welcomeScreen').classList.add('hidden'); $('#adminScreen').classList.remove('hidden'); $('#adminPassword').focus(); });
$('#adminBackBtn').addEventListener('click', () => { $('#adminScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#adminForm').addEventListener('submit', e => { e.preventDefault(); const password = $('#adminPassword').value; const savedPassword = localStorage.getItem('weddingAdminPassword') || 'admin123'; if (password !== savedPassword) { $('#loginError').classList.remove('hidden'); return; } $('#loginError').classList.add('hidden'); $('#adminPassword').value = ''; setAdminMode(true); $('#adminScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#adminLogout').addEventListener('click', () => { setAdminMode(false); $('#invitationScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#editCeremonyBtn').addEventListener('click', () => showInvitation('', true));
$('#homeLogoutBtn').addEventListener('click', () => { setAdminMode(false); });
$('#couplePhotoBtn').addEventListener('click',()=>$('#couplePhotoInput').click()); $('#backgroundBtn').addEventListener('click',()=>$('#backgroundInput').click());
$('#couplePhotoInput').addEventListener('change',e=>fileToStore(e.target,'couplePhoto',loadImages)); $('#backgroundInput').addEventListener('change',e=>fileToStore(e.target,'weddingBackground',loadImages));
$('#addDetail').addEventListener('click', () => addField());
$('#modalFields').addEventListener('click', event => { if (event.target.matches('.remove-detail')) event.target.closest('.field').remove(); });
$('#saveDetail').addEventListener('click',()=>{
  if(currentFolder==='note') state.note=$('#modalFields [data-value]').value.trim()||defaults.note;
  else { const fields=[...document.querySelectorAll('#modalFields .field')].map(field=>[field.querySelector('[data-label]').value.trim()||'माहिती',field.querySelector('[data-value]').value.trim()]).filter(([,value])=>value); state[currentFolder].fields=fields.length?fields:[['माहिती','']]; }
  persist(); updateText(); renderFolders(); closeModal();
});
document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',()=>{ closeModal(); $('#monogramModal').classList.add('hidden'); $('#mapSettingsModal').classList.add('hidden'); }));
$('#editToggle').addEventListener('click',()=>openModal('note'));
$('#monogram').addEventListener('click',openMonogramEditor);
$('#saveMonogram').addEventListener('click',saveMonogram);
$('#closeMonogram').addEventListener('click',()=>$('#monogramModal').classList.add('hidden'));
$('#whatsappSettingsBtn').addEventListener('click',setWhatsappNumber);
$('#whatsappGuestBtn').addEventListener('click',shareOnWhatsapp);
$('#mapSettingsBtn').addEventListener('click',openMapSettings);
$('#saveMapSettings').addEventListener('click',saveVenueMap);
$('#closeMapSettings').addEventListener('click',()=>$('#mapSettingsModal').classList.add('hidden'));
$('#guestMapBtn').addEventListener('click',openGuestMap);
document.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('blur',()=>{ if (!isAdmin || el.dataset.key==='monogram') return; state[el.dataset.key]=el.textContent.trim()||defaults[el.dataset.key];persist(); }));
loadImages(); updateText(); renderFolders(); updateWhatsappUI(); renderVenueMap(); setAdminMode(false);
