// Loop sim with optional Focus / Static Orb / Mana Strike. Inputs U unless noted.
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function sim(o){
  const R=rng(777), T=3000, dt=0.01, M=53, maxMana=o.maxMana??360, baseInc=o.regen/8-1;
  let mana=maxMana,t=0,nextCast=0,crater=-1,aftEnd=-1,aftRate=0,busyUntil=0,met=0,casts=0,stall=0,zero=0,unsCD=-1;
  let focusCD=-1,focusEnd=-1,focusStartMana=0, soNext=0, aegisEnd=-1, msCD=-1, focusUses=0, msUses=0, focusGain=0, msGain=0, aegisT=0;
  const p=o.crit??0.7, hits=o.hits;
  function onCrit(){ if(mana>0 && R()<0.09){ mana-=M; met++; crater=t+6; if(o.aft){aftRate=0.2*o.aft*M/3; aftEnd=t+3;} } }
  while(t<T){
    let regenInc=baseInc;
    if(t<focusEnd){ const missing=maxMana-focusStartMana+Math.max(0,-focusStartMana); regenInc+=1+1+0.01*missing; } // Focus base +100%, Mana Flooded 4 +100%, Desperate Meditation
    const r=8*(1+regenInc)*dt; mana+=r; if(t<focusEnd) focusGain+=8*(regenInc-baseInc)*dt;
    if(t<aftEnd) mana+=aftRate*dt;
    if(focusEnd>0 && t>=focusEnd && t-dt<focusEnd){ const b=0.1*(maxMana-mana)+40+20; mana+=b; focusGain+=b; }
    if(mana>maxMana) mana=maxMana;
    if(t<aegisEnd) aegisT+=dt;
    if(t>=busyUntil){
      // utility decisions
      if(o.focus && t>=focusCD && mana<=0){ focusStartMana=mana; focusEnd=t+1; busyUntil=t+1; focusCD=t+4; focusUses++; }
      else if(o.ms && t>=msCD && mana<=(o.msThresh??0)){ busyUntil=t+0.6; msCD=t+4; mana+=o.ms; msGain+=o.ms; msUses++; }
      else if(o.so && t>=soNext && (o.fb<1||mana>0)){ busyUntil=t+0.41; soNext=t+8; mana-=3; aegisEnd=t+8; }
      else if(t>=nextCast){
        const can=o.fb<1||mana>0;
        if(can){ const cr=t<crater; const cps=(1+o.cs+(cr?0.15:0)+(o.uns?0.15:0))*0.85*1.1/0.75; nextCast=t+1/cps; casts++; mana-=o.fb;
          if(cr) mana+=6; if(o.fb===0&&o.uns){zero++; if(zero>=3&&t>=unsCD){mana+=15;unsCD=t+3;zero=0;} else if(t<unsCD) zero=0;}
          if(mana>maxMana) mana=maxMana; for(let k=0;k<hits;k++) if(R()<p) onCrit(); }
        else stall+=dt;
      }
    } 
    t+=dt;
  }
  return `met/s ${(met/T).toFixed(2)} | FB casts/s ${(casts/T).toFixed(2)} | FB blocked ${(100*stall/T).toFixed(0)}% | Focus ${(focusUses/T*60).toFixed(1)}/min +${(focusGain/T).toFixed(1)} mana/s | MS ${(msUses/T*60).toFixed(1)}/min +${(msGain/T).toFixed(1)}/s | Aegis ${(100*aegisT/T).toFixed(0)}%`;
}
const b={cs:0.87,regen:16,aft:3,fb:4.64};
const cases=[
 ['A  Now+Aftermath3 (no utility)',{}],
 ['B  + their Mana Strike, data 54/swing',{ms:54}],
 ['B2 + their Mana Strike, reported 120/swing',{ms:120}],
 ['C  REC: Focus + Static Orb',{focus:1,so:1}],
 ['C2 Focus only',{focus:1}],
 ['D  re-treed Mana Strike (140) + Static Orb',{ms:140,so:1}],
 ['E  Focus + re-treed Mana Strike',{focus:1,ms:140}],
 ['F  cost0 (FotM): Now+Aft3',{fb:0}],
 ['G  cost0 + Unsealed + Focus + Static Orb',{fb:0,uns:1,focus:1,so:1}],
 ['H  cost0 + Unsealed + re-treed MS + Static Orb',{fb:0,uns:1,ms:140,so:1}],
];
for(const [n,o] of cases) for(const [env,h] of [['boss',4],['pack',8]]) console.log(n.padEnd(46),env,sim({...b,...o,hits:h}));
