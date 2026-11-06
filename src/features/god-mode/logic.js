import {useEffect,useRef,useState} from 'react';

export function godModeBaseline(history=[]){
  const recent=history.filter(h=>Number.isFinite(h.wpm)&&h.wpm>0).slice(0,20);
  return recent.length?Math.round(recent.reduce((sum,h)=>sum+h.wpm,0)/recent.length):40;
}
export function godModeThreshold(baseline){return Math.ceil(Math.max(baseline*1.25,baseline+12));}
export function qualifiesForGodMode({running,errors,correct,elapsed,wpm,threshold}){
  return running&&errors===0&&correct>=25&&elapsed>=5&&wpm>=threshold;
}

// A moving two-second window measures the pedal, not the whole-match average.
// Scanning backwards keeps the work bounded even in long untimed sessions.
export function recentTypingPace(events,elapsed,windowSeconds=2){
  if(elapsed<=0)return 0;
  const from=Math.max(0,elapsed-windowSeconds);let count=0;
  for(let i=events.length-1;i>=0;i--){
    const event=events[i];if(event.at<from)break;
    if(event.at<=elapsed&&event.correct)count++;
  }
  return count*12/Math.min(windowSeconds,elapsed);
}

// Holding the threshold holds full breakup indefinitely. No momentum bonus decays.
// Smoothstep provides a gentle return below the threshold, without a hard cutoff.
export function godModePower(pace,threshold){
  const pedal=Math.max(0,Math.min(1,(pace/Math.max(1,threshold)-.45)/.55));
  return pedal*pedal*(3-2*pedal);
}

export function useGodMode({running,wpm,correct,errors,elapsed,history,events=null}){
  const [awakened,setAwakened]=useState(false);
  const [previewing,setPreviewing]=useState(false);
  const [previewPace,setPreviewPace]=useState(0);
  const armedSince=useRef(null),lastCorrect=useRef(0),lastTyped=useRef(0);
  const baseline=godModeBaseline(history),threshold=godModeThreshold(baseline);
  const pace=running?(events?recentTypingPace(events,elapsed):wpm):0;
  useEffect(()=>{
    if(!running){armedSince.current=null;lastCorrect.current=0;lastTyped.current=0;setAwakened(false);return;}
    if(correct!==lastCorrect.current){lastCorrect.current=correct;lastTyped.current=elapsed;}
    if(awakened)return;
    const qualifies=qualifiesForGodMode({running,wpm,correct,errors,elapsed,threshold})&&elapsed-lastTyped.current<=1.25;
    if(!qualifies){armedSince.current=null;return;}
    if(armedSince.current===null)armedSince.current=elapsed;
    if(elapsed-armedSince.current>=1.5)setAwakened(true);
  },[running,wpm,correct,errors,elapsed,threshold,awakened]);
  useEffect(()=>{if(running)setPreviewing(false);},[running]);
  const stopPreview=()=>setPreviewing(false);
  const preview=()=>{setPreviewPace(Math.ceil(threshold*1.15));setPreviewing(true);};
  const active=previewing||(running&&awakened);
  return {active,previewing,previewPace,setPreviewPace,pace:previewing?previewPace:pace,power:active?godModePower(previewing?previewPace:pace,threshold):0,baseline,threshold,preview,stopPreview};
}
