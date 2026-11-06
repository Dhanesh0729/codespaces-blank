import React,{useState} from 'react';
import {X,Zap,Target,Clock3,ArrowRight,BarChart3,AlertCircle,CheckCircle2,ChevronLeft,ChevronRight} from 'lucide-react';

const visibleChar=c=>c===' '?'space':c==='\n'?'enter':c||'end';
export function MatchAnalytics({result,onClose,onRetry}){
  const timeline=Array.isArray(result.timeline)?result.timeline:[];
  const peak=timeline.reduce((best,row,i)=>row.wpm>(timeline[best]?.wpm||0)?i:best,0);
  const hardest=timeline.reduce((best,row,i)=>row.errors>(timeline[best]?.errors||0)?i:best,0);
  const [selected,setSelected]=useState(peak);
  const active=timeline[Math.min(selected,timeline.length-1)];
  const maxPace=Math.max(60,...timeline.map(row=>row.wpm));
  const ceiling=Math.ceil(maxPace/30)*30;
  const maxErrors=Math.max(1,...timeline.map(row=>row.errors));
  const x=i=>48+(i+.5)/Math.max(1,timeline.length)*650;
  const y=wpm=>210-wpm/ceiling*162;
  const points=timeline.map((row,i)=>`${x(i)},${y(row.wpm)}`).join(' ');
  const errorSeconds=timeline.filter(row=>row.errors>0).length;
  return <div className="modal-backdrop" onClick={onClose}><section className="modal match-modal" role="dialog" aria-modal="true" aria-label="Match analytics" onClick={e=>e.stopPropagation()}>
    <button className="modal-close icon-button" aria-label="Close match analytics" onClick={onClose}><X size={19}/></button>
    <div className="eyebrow"><BarChart3 size={13}/> YOUR TRAINING ARC, FRAME BY FRAME</div>
    <h2>Your match, second by second<span>.</span></h2>
    <p className="modal-intro">Every burst of speed. Every little stumble. Here’s how that one felt.</p>
    {result.mode==='free'&&<p className="session-end-note">{result.endReason==='idle'?'Untimed · finished after 5 seconds without typing. The idle grace period is excluded from your score.':'Untimed · finished with Escape.'}</p>}
    <div className="match-summary">
      <div><Zap size={16}/><span>Match speed</span><strong>{result.wpm}<small>wpm</small></strong></div>
      <div><Target size={16}/><span>Accuracy</span><strong>{result.accuracy}<small>%</small></strong></div>
      <div><Clock3 size={16}/><span>Duration</span><strong>{Number(Number(result.duration??result.seconds).toFixed(1))}<small>sec</small></strong></div>
      <div><AlertCircle size={16}/><span>Mistakes</span><strong>{result.errors??0}<small>total</small></strong></div>
    </div>
    {timeline.length?<>
      <div className="match-insights">
        <div className="peak-insight"><Zap size={17}/><div><span>YOUR FASTEST SECOND</span><strong>{timeline[peak].wpm} wpm <small>at second {timeline[peak].second}</small></strong></div></div>
        <div className="blunder-insight">{errorSeconds?<AlertCircle size={17}/>:<CheckCircle2 size={17}/>}<div><span>{errorSeconds?'YOUR TOUGHEST SECOND':'A CLEAN RUN'}</span><strong>{errorSeconds?`${timeline[hardest].errors} mistake${timeline[hardest].errors===1?'':'s'}`:'No mistakes'} <small>{errorSeconds?`at second ${timeline[hardest].second}`:'That’s some lovely precision.'}</small></strong></div></div>
      </div>
      <div className="match-chart-heading"><h3>The shape of your flow</h3><div><span className="pace-legend">● Pace</span><span className="error-legend">▥ Mistakes</span></div></div>
      <div className="match-chart-wrap"><svg className="match-chart" viewBox="0 0 760 255" role="img" aria-label={`Per-second pace and errors over ${timeline.length} seconds. Fastest: ${timeline[peak].wpm} WPM at second ${timeline[peak].second}. Use the slider below to inspect each second.`}>
        <defs><linearGradient id="match-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".22"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
        <text x="48" y="18" className="axis-title">PACE · WPM</text><text x="707" y="18" textAnchor="end" className="axis-title error-axis">ERRORS</text>
        {[0,.5,1].map(f=><g key={f}><line x1="48" x2="707" y1={210-f*162} y2={210-f*162} stroke="var(--border)" strokeDasharray="4 5"/><text x="34" y={214-f*162} textAnchor="end" className="axis-label">{Math.round(ceiling*f)}</text><text x="718" y={214-f*162} className="axis-label error-axis">{+(maxErrors*f).toFixed(1)}</text></g>)}
        <rect x={x(selected)-Math.min(650/timeline.length/2,20)} y="35" width={Math.min(650/timeline.length,40)} height="175" rx="5" fill="var(--accent)" opacity=".07"/>
        <polygon points={`${x(0)},210 ${points} ${x(timeline.length-1)},210`} fill="url(#match-area)"/>
        {timeline.map((row,i)=><g key={row.second} onMouseEnter={()=>setSelected(i)} onClick={()=>setSelected(i)}>
          {row.errors>0&&<rect x={x(i)-Math.min(650/timeline.length*.28,9)} y={210-row.errors/maxErrors*162} width={Math.min(650/timeline.length*.56,18)} height={row.errors/maxErrors*162} rx="3" fill="#d98395" opacity={selected===i?.75:.4}/>}
          <rect x={48+i/timeline.length*650} y="32" width={650/timeline.length} height="180" fill="transparent"><title>{`Second ${row.second}: ${row.wpm} WPM, ${row.errors} mistakes`}</title></rect>
        </g>)}
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" pointerEvents="none"/>
        {timeline.length<45&&timeline.map((row,i)=><circle key={i} cx={x(i)} cy={y(row.wpm)} r={selected===i?5:2.5} fill={selected===i?'var(--accent)':'var(--panel)'} stroke="var(--accent)" strokeWidth="1.5" pointerEvents="none"/>)}
        <line x1={x(selected)} x2={x(selected)} y1="35" y2="210" stroke="var(--accent)" strokeDasharray="3 4" opacity=".45" pointerEvents="none"/>
        {[...new Set([0,Math.floor((timeline.length-1)/4),Math.floor((timeline.length-1)/2),Math.floor((timeline.length-1)*.75),timeline.length-1])].map(i=><text key={i} x={x(i)} y="235" textAnchor="middle" className="axis-label">{timeline[i].second}s</text>)}
      </svg></div>
      <div className="second-inspector" aria-live="polite"><div><span className="second-badge">SECOND {active.second}</span><strong>{active.wpm} <small>wpm</small></strong><span>{active.attempts} keystroke{active.attempts===1?'':'s'}</span><span className={active.errors?'has-errors':'no-errors'}>{active.errors?`${active.errors} mistake${active.errors===1?'':'s'}`:'No mistakes'}</span></div><p>{active.mistakes?.length?active.mistakes.map((mistake,i)=><span key={i}><code>{visibleChar(mistake.actual)}</code> instead of <code>{visibleChar(mistake.expected)}</code>{i<active.mistakes.length-1?' · ':''}</span>):active.attempts?'Nice and steady. Every character landed.':'A little pause. There were no keystrokes this second.'}</p></div>
      <div className="second-scrubber"><button className="icon-button" aria-label="Inspect previous second" disabled={selected===0} onClick={()=>setSelected(s=>Math.max(0,s-1))}><ChevronLeft size={17}/></button><input type="range" aria-label="Inspect second" min="1" max={timeline.length} value={selected+1} onChange={e=>setSelected(Number(e.target.value)-1)}/><button className="icon-button" aria-label="Inspect next second" disabled={selected===timeline.length-1} onClick={()=>setSelected(s=>Math.min(timeline.length-1,s+1))}><ChevronRight size={17}/></button></div>
      <p className="match-explainer">Pace is correct keystrokes in each second, converted to WPM. Pauses appear as zero. Corrected mistakes still count. The final partial second is normalized.</p>
    </>:<div className="legacy-report"><BarChart3 size={25}/><p>This test has overall results only. New tests include a full second-by-second breakdown.</p></div>}
    <div className="match-actions"><button className="soft-button" onClick={onClose}>Back to your space</button><button className="primary-button" onClick={onRetry}>Practice again <ArrowRight size={16}/></button></div>
  </section></div>;
}
