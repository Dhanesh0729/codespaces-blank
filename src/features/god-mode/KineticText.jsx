import React from 'react';
import {letterGeometry} from './motion';
import './kinetic.css';

// Glyph geometry is static. A single inherited, browser-interpolated property
// drives every frame; changing pace never rebuilds hundreds of React letters.
export const KineticText=React.memo(function KineticText({text,active=false,className=''}){
  let index=0;
  return <span className={`kinetic-text ${active?'kinetic-active':''} ${className}`} data-motion="continuous"><span className="sr-only">{text}</span><span aria-hidden="true">{String(text).split(' ').map((word,wi)=><React.Fragment key={wi}>{wi>0?' ':null}<span className="kinetic-word" style={{'--float-delay':`${-(wi%7)*.23}s`}}>{[...word].map(char=>{const i=index++,g=letterGeometry(i);return <span className="kinetic-glyph" key={i} style={{'--drift-x':`${g.driftX}px`,'--fall-x':`${g.fallX}px`,'--drift-y':`${g.driftY}px`,'--fall-y':`${g.fallY}px`,'--turn':`${g.turn}deg`,'--fall-turn':`${g.fallTurn}deg`,'--break-at':g.breakAt}}><span className="kinetic-ink">{char}</span></span>})}</span></React.Fragment>)}</span></span>;
},(a,b)=>a.text===b.text&&a.active===b.active&&a.className===b.className);
