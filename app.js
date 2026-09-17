(() => {
  "use strict";
  const audio=document.getElementById("audio");
  const playBtn=document.getElementById("playBtn");
  const playIcon=playBtn.querySelector(".play-icon");
  const volume=document.getElementById("volume");
  const bg=document.getElementById("bg");
  const cover=document.getElementById("cover");
  const title=document.getElementById("title");
  const artist=document.getElementById("artist");
  const tapeTitle=document.getElementById("tapeTitle");
  const tapeArtist=document.getElementById("tapeArtist");
  const RECENT_LIMIT=5;
  let tracks=[],current=null,recent=[],started=false;

  const fallback=[
    {id:"demo-01",title:"夏夜片段",artist:"Demo Tape",audio:"",image:"",theme:{accent:"#d8a85b",label:"#d8cfb6",ink:"#24201a",shell:"#56535d"}},
    {id:"demo-02",title:"雨后街道",artist:"Demo Tape",audio:"",image:"",theme:{accent:"#8fb4c9",label:"#c8d4d8",ink:"#172027",shell:"#46535d"}},
    {id:"demo-03",title:"旧校服",artist:"Demo Tape",audio:"",image:"",theme:{accent:"#b57672",label:"#d7b9a9",ink:"#2d1a18",shell:"#5b4b4c"}}
  ];

  function hashColor(text,shift=0){let h=shift;for(const ch of text)h=(h*31+ch.charCodeAt(0))>>>0;return `hsl(${h%360} 28% ${36+(h%14)}%)`}
  function svgData(track){
    const c1=track.theme?.accent||hashColor(track.title,7),c2=hashColor(track.artist||track.title,93);
    const t=(track.title||"青春流逝电台").replace(/[<>&]/g,""),a=(track.artist||"").replace(/[<>&]/g,"");
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="1200" height="675" fill="url(#g)"/><rect width="1200" height="675" fill="#090912" opacity=".28"/><circle cx="930" cy="120" r="190" fill="#fff" opacity=".07"/><circle cx="160" cy="590" r="240" fill="#000" opacity=".16"/><text x="72" y="520" fill="#fff" opacity=".92" font-size="64" font-family="serif">${t}</text><text x="76" y="575" fill="#fff" opacity=".55" font-size="24" font-family="sans-serif">${a}</text></svg>`;
    return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg)
  }
  function choose(){let pool=tracks.filter(t=>!recent.includes(t.id));if(!pool.length){recent=[];pool=[...tracks]}const n=pool[Math.floor(Math.random()*pool.length)];recent.push(n.id);if(recent.length>RECENT_LIMIT)recent.shift();return n}
  function theme(track){const x=track.theme||{};document.documentElement.style.setProperty("--accent",x.accent||"#d8a85b");document.documentElement.style.setProperty("--label",x.label||"#d6c8aa");document.documentElement.style.setProperty("--ink",x.ink||"#24201a");document.documentElement.style.setProperty("--shell",x.shell||"#5b5760")}
  function render(track){
    current=track;const image=track.image||svgData(track);theme(track);
    cover.src=image;cover.alt=`${track.title} · ${track.artist||""}`;bg.style.backgroundImage=`linear-gradient(rgba(7,7,15,.28),rgba(7,7,15,.28)),url("${image}")`;
    title.textContent=track.title;artist.textContent=track.artist||"未知";tapeTitle.textContent=track.title;tapeArtist.textContent=track.artist||"未知";
    if(track.audio){audio.src=track.audio;audio.load()}else{audio.removeAttribute("src");audio.load()}
  }
  function setPlaying(on){document.body.classList.toggle("playing",on);playIcon.textContent=on?"Ⅱ":"▶";playBtn.setAttribute("aria-label",on?"暂停":"播放")}
  async function next(auto=false){render(choose());if(auto&&current.audio){try{await audio.play()}catch(_){setPlaying(false)}}}
  playBtn.addEventListener("click",async()=>{if(!current)await next(false);if(!current.audio){setPlaying(true);setTimeout(()=>setPlaying(false),700);return}if(audio.paused){try{await audio.play();started=true}catch(_){setPlaying(false)}}else audio.pause()});
  volume.addEventListener("input",()=>audio.volume=Number(volume.value));
  audio.addEventListener("playing",()=>setPlaying(true));audio.addEventListener("pause",()=>setPlaying(false));
  audio.addEventListener("ended",async()=>{setPlaying(false);await new Promise(r=>setTimeout(r,850));await next(started)});
  audio.addEventListener("error",async()=>{setPlaying(false);await new Promise(r=>setTimeout(r,500));await next(started)});
  (async()=>{audio.volume=Number(volume.value);try{const r=await fetch("tracks.json",{cache:"no-store"});const d=await r.json();tracks=Array.isArray(d.tracks)&&d.tracks.length?d.tracks:fallback}catch(_){tracks=fallback}await next(false)})();
})();
