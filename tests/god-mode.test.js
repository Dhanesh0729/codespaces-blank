import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';
import {scatterFor} from '../src/features/god-mode/motion.js';
import {godModeBaseline,godModeThreshold,qualifiesForGodMode,useGodMode,godModePower,recentTypingPace} from '../src/features/god-mode/logic.js';

// Initialize a DOM before React DOM detects browser input-event support.
const boot=new JSDOM('<div></div>');globalThis.window=boot.window;globalThis.document=boot.window.document;
const {createRoot}=await import('react-dom/client');boot.window.close();
const history=[{wpm:40}];
function mountMode(){
  const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/'});
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const root=createRoot(document.getElementById('root'));let current;
  const defaults={running:false,correct:0,errors:0,wpm:0,elapsed:0,history};
  function Harness(props){current=useGodMode(props);return React.createElement('input',{defaultValue:'keep typing', 'data-active':current.active});}
  function render(props={}){act(()=>root.render(React.createElement(Harness,{...defaults,...props})));return current;}
  render();
  return {dom,render,get current(){return current},unmount(){act(()=>root.unmount());dom.window.close()}};
}

test('God Mode targets a meaningful improvement over the recent average',()=>{
  assert.equal(godModeBaseline([]),40);
  assert.equal(godModeBaseline([{wpm:0},{wpm:40},{wpm:60},{wpm:NaN}]),50);
  assert.equal(godModeThreshold(40),52);
  assert.equal(godModeThreshold(100),125);
  assert.equal(godModeBaseline(Array.from({length:21},(_,i)=>({wpm:i===20?999:50}))),50);
  const candidate={running:true,correct:30,elapsed:6,errors:0,wpm:60,threshold:52};
  assert.equal(qualifiesForGodMode(candidate),true);
  for(const change of [{running:false},{correct:24},{elapsed:4.9},{errors:1},{wpm:51}])assert.equal(qualifiesForGodMode({...candidate,...change}),false);
});

test('a sustained flawless peak transforms without replacing the input or changing saved settings',()=>{
  const app=mountMode();const input=document.querySelector('input');input.focus();input.setSelectionRange(2,5);
  const saved=JSON.stringify({theme:'ghibli',sound:'Bubble pop',volume:28,dark:false});window.localStorage.setItem('keiko-settings',saved);
  assert.equal(app.render({running:true,correct:30,wpm:72,elapsed:5}).active,false);
  assert.equal(app.render({running:true,correct:35,wpm:72,elapsed:5.8}).active,false);
  assert.equal(app.render({running:true,correct:40,wpm:72,elapsed:6.6}).active,true);
  assert.equal(document.querySelector('input'),input);
  assert.equal(document.activeElement,input);
  assert.equal(input.selectionStart,2);assert.equal(input.selectionEnd,5);
  assert.equal(window.localStorage.getItem('keiko-settings'),saved);
  assert.equal(app.render({running:true,correct:45,wpm:50,errors:1,elapsed:8}).active,true,'earned transformation lasts through the match');
  assert.equal(app.render().active,false,'match completion immediately restores ordinary mode');
  assert.equal(window.localStorage.getItem('keiko-settings'),saved);
  assert.equal(app.render({running:true,correct:1,wpm:12,elapsed:1}).active,false,'new test starts clean');
  app.unmount();
});

test('a pause cannot awaken God Mode from a single burst',()=>{
  const app=mountMode();
  app.render({running:true,correct:30,wpm:72,elapsed:5});
  assert.equal(app.render({running:true,correct:30,wpm:72,elapsed:6.6}).active,false);
  app.render({running:true,correct:40,wpm:72,elapsed:7});
  app.render({running:true,correct:45,wpm:72,elapsed:7.8});
  assert.equal(app.render({running:true,correct:50,wpm:72,elapsed:8.6}).active,true);
  app.unmount();
});

test('correcting a mistake does not falsely create a flawless run',()=>{
  const app=mountMode();
  app.render({running:true,correct:30,wpm:72,errors:1,elapsed:5});
  assert.equal(app.render({running:true,correct:60,wpm:90,errors:1,elapsed:8}).active,false);
  app.unmount();
});

test('preview holds until ended, cancels on a real test, and preserves input focus',t=>{
  const app=mountMode();t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});
  const input=document.querySelector('input');input.focus();
  act(()=>app.current.preview());assert.equal(app.current.active,true);assert.equal(app.current.power,1);assert.equal(document.activeElement,input);
  act(()=>t.mock.timers.tick(60000));assert.equal(app.current.active,true);assert.equal(app.current.power,1,'a high pedal must not expire on a demo timer');
  act(()=>app.current.stopPreview());assert.equal(app.current.active,false);assert.equal(app.current.power,0);
  act(()=>app.current.preview());assert.equal(app.current.previewing,true);
  assert.equal(app.render({running:true,correct:1,wpm:12,elapsed:1}).active,false);
  assert.equal(app.current.previewing,false);app.unmount();
});

test('God Mode can be selectively removed while preserving all pre-feature code byte for byte',()=>{
  const manifest=JSON.parse(fs.readFileSync('.feature-backups/god-mode/patches.json','utf8'));
  let source=fs.readFileSync(manifest.target,'utf8');
  for(const patch of [...manifest.patches].reverse()){
    assert.ok(source.includes(patch.after),'rollback anchor exists');
    source=source.replace(patch.after,patch.before);
  }
  assert.equal(source,fs.readFileSync('.feature-backups/god-mode/main.jsx.before','utf8'));
  assert.ok(source.includes('useSessionClock'));
  assert.ok(source.includes('MatchAnalytics'));
  assert.ok(source.includes('buddy-left-arm'));
  assert.ok(source.includes('CompanionStudio'));
  assert.ok(source.includes("['free',Sparkles,'untimed']"));
});

test('the accelerator holds full breakup at the God Mode threshold and returns progressively below it',()=>{
 assert.equal(godModePower(52,52),1);assert.equal(godModePower(65,52),1);assert.equal(godModePower(999,52),1);
 assert.ok(godModePower(40,52)>godModePower(30,52));assert.ok(godModePower(40,52)<1);assert.equal(godModePower(0,52),0);
 for(let i=0;i<30;i++){
   const original=scatterFor(i,0),fallen=scatterFor(i,1);
   assert.equal(original.x,0);assert.equal(original.y,0);assert.equal(Math.abs(original.rotation),0);assert.equal(original.opacity,1);assert.ok(fallen.y>20);
   for(let step=1;step<=100;step++){
     const a=scatterFor(i,(step-1)/100),b=scatterFor(i,step/100);
     assert.ok(Math.abs(b.y-a.y)<4,'letter trajectories must be continuous without position buckets');
   }
 }
});

test('preview pedal can hold, release, and accelerate again without resetting the mode',()=>{
 const app=mountMode();act(()=>app.current.preview());assert.equal(app.current.power,1);
 act(()=>app.current.setPreviewPace(0));assert.equal(app.current.power,0);assert.equal(app.current.active,true);
 act(()=>app.current.setPreviewPace(40));assert.ok(app.current.power>0&&app.current.power<1);
 act(()=>app.current.setPreviewPace(65));assert.equal(app.current.power,1);assert.equal(app.current.active,true);
 act(()=>app.current.stopPreview());assert.equal(app.current.active,false);assert.equal(app.current.power,0);app.unmount();
});

test('recent typing pace ignores old bursts and counts correct attempts inside a moving window',()=>{
 const attempts=[{at:0,correct:true},{at:1,correct:true},{at:8.2,correct:true},{at:8.6,correct:false},{at:9,correct:true},{at:9.6,correct:true}];
 assert.equal(recentTypingPace(attempts,10),18);
 assert.equal(recentTypingPace(attempts,12),0);
 assert.equal(recentTypingPace([],0),0);
});

test('sustained fast typing stays fallen, slowing reassembles it, and renewed pace breaks it apart again',()=>{
 const app=mountMode();const input=document.querySelector('input');input.focus();
 const fast=Array.from({length:101},(_,i)=>({at:i*.2,correct:true}));
 const drive=(elapsed,events)=>app.render({running:true,correct:events.filter(e=>e.at<=elapsed).length,errors:0,wpm:65,elapsed,events});
 drive(5,fast.filter(e=>e.at<=5));drive(5.8,fast.filter(e=>e.at<=5.8));drive(6.6,fast.filter(e=>e.at<=6.6));
 assert.equal(app.current.active,true);assert.equal(app.current.power,1);
 for(let t=8;t<=20;t+=2){drive(t,fast.filter(e=>e.at<=t));assert.equal(app.current.power,1,'steady high speed must never fade after a few seconds');}
 const slow=[...fast,...[21,22,23,24].map(at=>({at,correct:true}))];drive(24,slow);
 assert.equal(app.current.power,0,'recent slow pace must override the still-high whole-match average');assert.equal(app.current.active,true);
 const renewed=[...slow,...Array.from({length:21},(_,i)=>({at:25+i*.2,correct:true}))];drive(29,renewed);
 assert.equal(app.current.power,1);assert.equal(document.activeElement,input);assert.equal(document.querySelector('input'),input);
 app.render();assert.equal(app.current.active,false);assert.equal(app.current.power,0);app.unmount();
});
