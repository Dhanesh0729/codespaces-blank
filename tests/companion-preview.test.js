import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {useCompanionPreview} from '../src/useCompanionPreview.js';

function mount(){
 const dom=new JSDOM('<div id="root"></div>');globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const root=createRoot(document.getElementById('root'));let preview;
 function Harness(){preview=useCompanionPreview();return React.createElement('span',null,preview.mood);}
 act(()=>root.render(React.createElement(Harness)));
 return {get preview(){return preview},close(){act(()=>root.unmount());dom.window.close()}};
}

test('unchecking divine preview restores the ordinary eyes and expression',()=>{
 const app=mount();assert.equal(app.preview.mood,'happy');
 act(()=>app.preview.setDivine(true));assert.equal(app.preview.divine,true);assert.equal(app.preview.mood,'overdrive');
 act(()=>app.preview.setDivine(false));assert.equal(app.preview.divine,false);assert.equal(app.preview.mood,'happy');
 act(()=>app.preview.setMood('overdrive'));assert.equal(app.preview.mood,'happy','God-only expressions cannot leak into ordinary form');
 app.close();
});

test('ordinary and divine reaction choices remain independent across repeated toggles',()=>{
 const app=mount();act(()=>app.preview.setMood('determined'));
 act(()=>app.preview.setDivine(true));act(()=>app.preview.setMood('shocked'));
 act(()=>app.preview.setDivine(false));assert.equal(app.preview.mood,'determined');
 act(()=>app.preview.setDivine(true));assert.equal(app.preview.mood,'shocked');
 act(()=>app.preview.setDivine(false));assert.equal(app.preview.mood,'determined');
 app.close();
});
