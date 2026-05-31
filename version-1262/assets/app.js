
(function(){
function qs(s,c){return(c||document).querySelector(s)}
function qsa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
function applyFilter(value){var v=(value||'').toLowerCase().trim();qsa('.filter-card').forEach(function(el){var hay=(el.getAttribute('data-search')||'').toLowerCase();el.classList.toggle('hidden',v&&hay.indexOf(v)===-1)})}
function setQueryFromUrl(){var input=qs('[data-filter-input]');if(!input)return;var q=new URLSearchParams(location.search).get('q')||'';if(q){input.value=q;applyFilter(q)}}
qsa('[data-search-form]').forEach(function(form){form.addEventListener('submit',function(e){e.preventDefault();var input=qs('input',form);var q=input?input.value.trim():'';location.href='library.html'+(q?'?q='+encodeURIComponent(q):'')})});
qsa('[data-filter-input]').forEach(function(input){input.addEventListener('input',function(){applyFilter(input.value)})});
qsa('[data-filter-pill]').forEach(function(btn){btn.addEventListener('click',function(){var input=qs('[data-filter-input]');var v=btn.getAttribute('data-filter-pill')||'';if(input){input.value=v;applyFilter(v)}})});
var menuBtn=qs('[data-menu-button]'),menu=qs('[data-menu]');if(menuBtn&&menu){menuBtn.addEventListener('click',function(){menu.classList.toggle('hidden')})}
var slides=qsa('.hero-slide'),dots=qsa('.hero-dot'),heroIndex=0;if(slides.length){function show(i){heroIndex=(i+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle('active',k===heroIndex);s.classList.toggle('opacity-100',k===heroIndex);s.classList.toggle('opacity-0',k!==heroIndex)});dots.forEach(function(d,k){d.classList.toggle('active',k===heroIndex)})}dots.forEach(function(d,k){d.addEventListener('click',function(){show(k)})});show(0);setInterval(function(){show(heroIndex+1)},5000)}
window.initVideoPlayer=function(videoId,overlayId,url){var video=document.getElementById(videoId),overlay=document.getElementById(overlayId),loaded=false,hls=null;if(!video)return;function bind(){if(loaded)return;loaded=true;if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url}else if(window.Hls&&window.Hls.isSupported()){hls=new Hls({enableWorker:true});hls.loadSource(url);hls.attachMedia(video)}else{video.src=url}}function start(){bind();if(overlay)overlay.classList.add('hidden');var p=video.play();if(p&&p.catch)p.catch(function(){})}if(overlay)overlay.addEventListener('click',start);video.addEventListener('click',function(){if(video.paused)start()});video.addEventListener('play',function(){if(overlay)overlay.classList.add('hidden')});window.addEventListener('pagehide',function(){if(hls&&hls.destroy)hls.destroy()})};
setQueryFromUrl();
})();
