export function letterGeometry(index){
  const seed=((index*41+17)%101)/100;
  return {driftX:(seed-.5)*24,fallX:(seed-.5)*70,driftY:(seed-.5)*9,fallY:35+(index%6)*18,turn:(seed-.5)*20,fallTurn:(index%2?1:-1)*(15+seed*40),breakAt:.43+seed*.22};
}
export function scatterFor(index,power){
  const force=Math.max(0,Math.min(1,power||0));
  if(force===0)return {x:0,y:0,rotation:0,opacity:1};
  const g=letterGeometry(index),loosen=Math.max(0,(force-.12)/.88),detached=Math.max(0,(force-g.breakAt)/.4);
  return {x:g.driftX*loosen+g.fallX*detached,y:g.driftY*loosen+g.fallY*detached,rotation:g.turn*loosen+g.fallTurn*detached,opacity:Math.max(.48,1-detached*.23)};
}
