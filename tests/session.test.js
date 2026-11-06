import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {useSessionClock,timeExpired,buildTimeline} from '../src/session.js';

function withBrowser(){
  const dom=new JSDOM('<div id="root"></div>');
  globalThis.window=dom.window;
  globalThis.document=dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  return {dom,root:createRoot(document.getElementById('root'))};
}

test('15-second clock expires during continuous typing renders and only expires once',t=>{
  const {dom,root}=withBrowser();
  t.mock.timers.enable({apis:['setInterval','Date'],now:1000});
  let expired=0,lastVersion=0,lastElapsed=0;
  function Harness({keystrokes}){
    useSessionClock({running:true,startTime:1000,limit:15,mode:'time',onTick:seconds=>{lastElapsed=seconds},onExpire:()=>{expired++;lastVersion=keystrokes}});
    return React.createElement('span',null,keystrokes);
  }
  act(()=>root.render(React.createElement(Harness,{keystrokes:0})));
  for(let i=1;i<=150;i++){
    act(()=>root.render(React.createElement(Harness,{keystrokes:i})));
    act(()=>t.mock.timers.tick(100));
    if(i<150)assert.equal(expired,0,'must not end before 15 seconds');
    if(i===50)assert.equal(lastElapsed,5,'clock keeps updating while typing');
  }
  assert.equal(lastElapsed,15);
  assert.equal(expired,1);
  assert.equal(lastVersion,150,'expiry uses the latest typed-value callback');
  act(()=>t.mock.timers.tick(5000));
  assert.equal(expired,1,'no duplicated completion or history entry');
  act(()=>root.unmount());dom.window.close();
});

test('restart cleans up the old clock and grants the new test its full duration',t=>{
  const {dom,root}=withBrowser();
  t.mock.timers.enable({apis:['setInterval','Date'],now:1000});
  let expired=0;
  function Harness({running,startTime}){
    useSessionClock({running,startTime,mode:'time',limit:15,onTick:()=>{},onExpire:()=>expired++});return null;
  }
  act(()=>root.render(React.createElement(Harness,{running:true,startTime:1000})));
  act(()=>t.mock.timers.tick(14000));
  act(()=>root.render(React.createElement(Harness,{running:false,startTime:null})));
  act(()=>t.mock.timers.tick(5000));
  assert.equal(expired,0);
  const nextStart=Date.now();
  act(()=>root.render(React.createElement(Harness,{running:true,startTime:nextStart})));
  act(()=>t.mock.timers.tick(14999));assert.equal(expired,0);
  act(()=>t.mock.timers.tick(1));assert.equal(expired,1);
  act(()=>root.unmount());dom.window.close();
});

test('returning from a throttled background tab reconciles its actual deadline',t=>{
  const {dom,root}=withBrowser();
  t.mock.timers.enable({apis:['setInterval','Date'],now:1000});
  let expired=0;
  function Harness(){useSessionClock({running:true,startTime:1000,limit:15,mode:'time',onTick:()=>{},onExpire:()=>expired++});return null;}
  act(()=>root.render(React.createElement(Harness)));
  t.mock.timers.setTime(18000);
  act(()=>window.dispatchEvent(new dom.window.Event('focus')));
  assert.equal(expired,1);
  act(()=>root.unmount());dom.window.close();
});

test('typing is rejected exactly at the deadline, including an epoch-zero start',()=>{
  assert.equal(timeExpired(null,20000,15),false);
  assert.equal(timeExpired(0,14999,15),false);
  assert.equal(timeExpired(0,15000,15),true);
  assert.equal(timeExpired(1000,16001,15),true);
});

test('timeline retains corrected mistakes, exact second boundaries, and pauses',()=>{
  const rows=buildTimeline([
    {at:0,correct:true,actual:'h',expected:'h'},
    {at:.2,correct:false,actual:'x',expected:'e'},
    {at:.5,correct:true,actual:'e',expected:'e'},
    {at:1,correct:true,actual:'l',expected:'l'},
    {at:3,correct:false,actual:'z',expected:'o'},
  ],3);
  assert.equal(rows.length,3);
  assert.equal(rows[0].wpm,24);
  assert.equal(rows[0].errors,1);
  assert.equal(rows[0].accuracy,67);
  assert.deepEqual(rows[0].mistakes,[{actual:'x',expected:'e'}]);
  assert.equal(rows[1].wpm,12);
  assert.equal(rows[1].errors,0);
  assert.equal(rows[2].wpm,0);
  assert.equal(rows[2].accuracy,null);
  assert.equal(rows.reduce((n,r)=>n+r.errors,0),1,'input at or after expiry is excluded');
});

test('partial final seconds normalize the rate to actual time',()=>{
  const rows=buildTimeline([{at:1.25,correct:true,actual:'a',expected:'a'}],1.5);
  assert.equal(rows[1].duration,.5);
  assert.equal(rows[1].wpm,24);
});
