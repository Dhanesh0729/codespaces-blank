import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {useSessionClock,idleRemaining} from '../src/session.js';
import {companionName,companionStyle,getCompanionReaction,COMPANION_DEFAULTS} from '../src/companion.js';

function setup(){const dom=new JSDOM('<div id="root"></div>');globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;return {dom,root:createRoot(document.getElementById('root'))};}

test('untimed mode runs past timed limits while typing, then ends exactly five seconds after the last edit',t=>{
 const {dom,root}=setup();t.mock.timers.enable({apis:['setInterval','Date'],now:1000});let expires=[];
 function Harness({lastActivity}){useSessionClock({running:true,startTime:1000,limit:15,mode:'free',lastActivity,idleSeconds:5,onTick:()=>{},onExpire:reason=>expires.push(reason)});return null;}
 act(()=>root.render(React.createElement(Harness,{lastActivity:1000})));
 for(let i=0;i<15;i++){act(()=>t.mock.timers.tick(4000));act(()=>root.render(React.createElement(Harness,{lastActivity:Date.now()})));assert.equal(expires.length,0);}
 assert.equal(Date.now(),61000,'a 15-second setting must not cap untimed mode');
 act(()=>t.mock.timers.tick(4999));assert.equal(expires.length,0);
 act(()=>t.mock.timers.tick(1));assert.deepEqual(expires,['idle']);
 act(()=>t.mock.timers.tick(10000));assert.equal(expires.length,1);
 act(()=>root.unmount());dom.window.close();
});

test('idle deadline follows the latest keystroke without restarting the clock',t=>{
 const {dom,root}=setup();t.mock.timers.enable({apis:['setInterval','Date'],now:1000});let ended=0;
 function Harness({lastActivity}){useSessionClock({running:true,startTime:1000,mode:'free',limit:15,lastActivity,onTick:()=>{},onExpire:()=>ended++});return null;}
 act(()=>root.render(React.createElement(Harness,{lastActivity:1000})));
 act(()=>t.mock.timers.tick(4500));act(()=>root.render(React.createElement(Harness,{lastActivity:5500})));
 act(()=>t.mock.timers.tick(1000));assert.equal(ended,0,'the original idle deadline must no longer end this test');
 act(()=>t.mock.timers.tick(4000));assert.equal(ended,1);
 act(()=>root.unmount());dom.window.close();
});

test('inactivity applies to untimed sessions only and does not start before typing',t=>{
 assert.equal(idleRemaining(null,999999),5);
 assert.ok(Math.abs(idleRemaining(0,4999)-.001)<1e-10);
 assert.equal(idleRemaining(0,5000),0);
 const {dom,root}=setup();t.mock.timers.enable({apis:['setInterval','Date'],now:1000});let ended=0;
 function Harness(){useSessionClock({running:true,startTime:1000,mode:'words',limit:15,lastActivity:1000,onTick:()=>{},onExpire:()=>ended++});return null;}
 act(()=>root.render(React.createElement(Harness)));act(()=>t.mock.timers.tick(60000));assert.equal(ended,0);
 act(()=>root.unmount());dom.window.close();
});

test('companion customization retains fallbacks, styles and reaction preferences',()=>{
 assert.equal(companionName({buddyName:'   '}),'Keiko');assert.equal(companionName({buddyName:'  Sora  '}),'Sora');
 const styles=companionStyle({...COMPANION_DEFAULTS,buddyHair:'#123456',buddyOutfit:'#abcdef',buddyGodStyle:'storm'});
 assert.equal(styles['--buddy-hair'],'#123456');assert.equal(styles['--buddy-outfit'],'#abcdef');assert.equal(styles['--divine-hair'],'#d6c0ef');
 assert.equal(getCompanionReaction({god:true,power:1,settings:{buddyReactions:false}}).mood,'idle');
 assert.equal(getCompanionReaction({god:true,power:.9}).mood,'overdrive');
 assert.equal(getCompanionReaction({god:true,power:.5}).mood,'charged');
 assert.equal(getCompanionReaction({god:true,power:.9,recentMistake:true}).mood,'determined');
 assert.equal(getCompanionReaction({result:{accuracy:100,wpm:40}}).mood,'proud');
 assert.equal(getCompanionReaction({running:true,recentMistake:true,settings:{buddyPersonality:'tsundere'}}).mood,'angry');
});
