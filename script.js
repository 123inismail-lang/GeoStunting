// ===== Data per kelurahan (sumber: peta qgis2web / data QGIS) =====
const KEL=[
  {nama:'Babakan Surabaya',balita:650,kasus:144,prev:22.2},
  {nama:'Kebon Kangkung',balita:720,kasus:148,prev:20.6},
  {nama:'Sukapura',balita:600,kasus:100,prev:18.3},
  {nama:'Kebon Jayanti',balita:610,kasus:106,prev:17.4},
  {nama:'Babakan Sari',balita:550,kasus:93,prev:16.9},
  {nama:'Cicaheum',balita:537,kasus:89,prev:16.6}
];
const sorted=[...KEL].sort((a,b)=>b.prev-a.prev);
sorted.forEach((k,i)=>k.rank=i+1);
function fmt(p){return p.toFixed(1).replace('.',',');}
function color(p){return p>=22?'#d73027':p>=20?'#f46d43':p>=18?'#fdae61':p>=17?'#fee08b':'#a6d96a';}
function pill(p){return p>=20?'<span class="gs-pill pill-high">Prioritas Tinggi</span>':p>=17?'<span class="gs-pill pill-mid">Sedang</span>':'<span class="gs-pill pill-low">Rendah</span>';}
function rankBadge(r){const c=r===1?'#d73027':r===2?'#f46d43':r===3?'#fdae61':'#94a3b8';return '<span class="gs-rank" style="background:'+c+'">'+r+'</span>';}

function renderMini(){let h='';sorted.forEach(k=>{const w=(k.prev/sorted[0].prev*100).toFixed(0);h+='<div class="gs-mbar"><span class="name">'+k.nama+'</span><div class="track"><div class="fill" style="width:'+w+'%;background:'+color(k.prev)+'"></div></div><span class="val">'+fmt(k.prev)+'%</span></div>';});document.getElementById('miniBars').innerHTML=h;}

function renderTable(filterNama){let h='';sorted.forEach(k=>{const dim=(filterNama&&filterNama!=='all'&&k.nama!==filterNama)?' style="opacity:.32"':'';h+='<tr'+dim+'><td><b>'+k.nama+'</b></td><td>'+k.balita+'</td><td>'+k.kasus+'</td><td>'+pill(k.prev)+' '+fmt(k.prev)+'%</td><td>'+rankBadge(k.rank)+'</td></tr>';});document.getElementById('tblBody').innerHTML=h;}

function fillFilter(){const s=document.getElementById('filterKel');KEL.forEach(k=>{const o=document.createElement('option');o.value=k.nama;o.textContent=k.nama;s.appendChild(o);});}
function normNama(s){return (s||'').toString().toLowerCase().replace(/[^a-z]/g,'');}
function postFocus(nama){['mapDash','mapPeta'].forEach(function(id){var f=document.getElementById(id);if(f&&f.contentWindow){f.contentWindow.postMessage({type:'gsFocusKel',nama:nama},'*');}});}
function focusKelurahan(v){renderTable(v);renderSearchResult(v);postFocus(v&&v!=='all'?v:'all');var sel=document.getElementById('filterKel');if(sel&&sel.value!==v)sel.value=v;}
function searchKelurahan(){var q=(document.getElementById('searchKel').value||'').trim();var box=document.getElementById('searchResult');if(!q){focusKelurahan('all');return;}var nq=normNama(q);var found=KEL.find(function(k){var n=normNama(k.nama);return n===nq||n.indexOf(nq)>-1||nq.indexOf(n)>-1;});if(found){focusKelurahan(found.nama);}else if(box){box.innerHTML='<div class="gs-noresult">Kelurahan "'+q+'" tidak ditemukan. Coba: Babakan Sari, Babakan Surabaya, Cicaheum, Kebon Kangkung, Kebon Jayanti, Sukapura.</div>';}}
function renderSearchResult(v){var box=document.getElementById('searchResult');if(!box)return;if(!v||v==='all'){box.innerHTML='';return;}var k=KEL.find(function(x){return x.nama===v;});if(!k){box.innerHTML='';return;}box.innerHTML='<div class="gs-sr-card"><div class="gs-sr-h">'+k.nama+' '+pill(k.prev)+'</div><div class="gs-sr-grid"><div><span>Prevalensi</span><b>'+fmt(k.prev)+'%</b></div><div><span>Kasus</span><b>'+k.kasus+'</b></div><div><span>Balita</span><b>'+k.balita+'</b></div><div><span>Ranking</span><b>#'+k.rank+'</b></div></div></div>';}
function printMap(iframeId){var f=document.getElementById(iframeId);if(f&&f.contentWindow){try{f.contentWindow.focus();f.contentWindow.print();}catch(e){window.print();}}}

function downloadCSV(){let c='Kelurahan,Jumlah Balita,Kasus,Prevalensi (%),Ranking\n';sorted.forEach(k=>{c+=k.nama+','+k.balita+','+k.kasus+','+fmt(k.prev)+','+k.rank+'\n';});const b=new Blob([c],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='data-stunting-kiaracondong.csv';a.click();}

// ===== Navigasi antar halaman =====
function nav(el){gotoPage(el.dataset.pg);return false;}
function gotoPage(pg){
  document.querySelectorAll('.gs-page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+pg).classList.add('active');
  document.querySelectorAll('.gs-menu a').forEach(a=>a.classList.toggle('active',a.dataset.pg===pg));
  document.getElementById('gsmenu').classList.remove('open');
  window.scrollTo(0,0);
}
fillFilter();renderMini();renderTable();

// ===== Fullscreen map =====
function toggleFS(iframeId){
  const el = document.getElementById(iframeId);
  const btn = el.nextElementSibling;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;
  if(!isFs){
    if(req) req.call(el);
    btn.classList.add('is-fs');
    btn.querySelector('span').textContent='Keluar';
  } else {
    const ex = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if(ex) ex.call(document);
    btn.classList.remove('is-fs');
    btn.querySelector('span').textContent='Layar Penuh';
  }
}
// Sync button state when user presses Esc to exit fullscreen
document.addEventListener('fullscreenchange', function(){
  if(!document.fullscreenElement){
    document.querySelectorAll('.gs-fs-btn').forEach(btn=>{
      btn.classList.remove('is-fs');
      btn.querySelector('span').textContent='Layar Penuh';
    });
  }
});
