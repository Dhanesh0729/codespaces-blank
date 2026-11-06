import {useEffect,useRef} from 'react';

// Callback identity and typing renders must never restart the session clock.
export function useSessionClock({running,startTime,limit,mode,onTick,onExpire,lastActivity=null,idleSeconds=5}) {
  const callbacks=useRef({onTick,onExpire,lastActivity,idleSeconds});
  callbacks.current={onTick,onExpire,lastActivity,idleSeconds};
  useEffect(()=>{
    if(!running)return;
    let expired=false;
    const tick=()=>{
      if(expired)return;
      const seconds=Math.max(0,(Date.now()-startTime)/1000);
      callbacks.current.onTick(seconds);
      if(mode==='time'&&seconds>=limit){expired=true;callbacks.current.onExpire('timer');}
      else if(mode==='free'&&idleRemaining(callbacks.current.lastActivity,Date.now(),callbacks.current.idleSeconds)===0){expired=true;callbacks.current.onExpire('idle');}
    };
    const timer=setInterval(tick,50);
    // Reconcile immediately when returning from a throttled background tab.
    window.addEventListener('focus',tick);
    document.addEventListener('visibilitychange',tick);
    tick();
    return()=>{clearInterval(timer);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick);};
  },[running,startTime,limit,mode]);
}

export function idleRemaining(lastActivity,now,idleSeconds=5){return lastActivity===null?idleSeconds:Math.max(0,idleSeconds-(now-lastActivity)/1000);}

export function timeExpired(start,now,limit){return start!==null&&now-start>=limit*1000;}

export function buildTimeline(events,duration){
  const seconds=Math.max(.001,duration);
  const timeline=Array.from({length:Math.ceil(seconds)},(_,i)=>({second:i+1,attempts:0,correct:0,errors:0,mistakes:[],duration:Math.min(1,seconds-i)}));
  for(const event of events){
    if(event.at<0||event.at>=seconds)continue;
    const bin=timeline[Math.floor(event.at)];
    bin.attempts++;
    if(event.correct)bin.correct++;
    else{bin.errors++;bin.mistakes.push({actual:event.actual,expected:event.expected});}
  }
  return timeline.map(bin=>({...bin,wpm:Math.round(bin.correct*12/bin.duration),raw:Math.round(bin.attempts*12/bin.duration),accuracy:bin.attempts?Math.round(bin.correct/bin.attempts*100):null}));
}
