export const COMPANION_DEFAULTS={buddyName:'Keiko',buddyHair:'#534555',buddyOutfit:'#8f81bf',buddySkin:'#f3d9cc',buddyAccessory:'clips',buddyClothes:'hoodie',buddyPersonality:'gentle',buddyMotion:true,buddyReactions:true,buddyGodStyle:'celestial'};
export const DIVINE_STYLES={celestial:{name:'Celestial guardian',gold:'#ffe29a',energy:'#79f1eb',hair:'#f2cf7b'},storm:{name:'Storm sovereign',gold:'#d9c5ff',energy:'#96baff',hair:'#d6c0ef'},phoenix:{name:'Phoenix spirit',gold:'#ffd091',energy:'#ff85a0',hair:'#efa86d'}};
export const companionName=settings=>(settings.buddyName||'Keiko').trim().slice(0,24)||'Keiko';
export function companionStyle(settings={}){const s={...COMPANION_DEFAULTS,...settings},god=DIVINE_STYLES[s.buddyGodStyle]||DIVINE_STYLES.celestial;return {'--buddy-hair':s.buddyHair,'--buddy-outfit':s.buddyOutfit,'--buddy-skin':s.buddySkin,'--divine-gold':god.gold,'--divine-energy':god.energy,'--divine-hair':god.hair};}
export function getCompanionReaction({running=false,result=null,god=false,power=0,wpm=0,baseline=40,accuracy=100,recentMistake=false,typing=false,settings={}}){
  const persona=settings.buddyPersonality||'gentle',roast=settings.roast||persona==='tsundere';
  if(settings.buddyReactions===false)return {mood:'idle',label:'Here with you',message:'Your space. Your pace. I’m right here.'};
  if(god){
    if(recentMistake)return {mood:'determined',label:'Recovery arc',message:roast?'Even a deity can find the wrong key. Recover your aura.':'One missed key doesn’t erase that power. Breathe. We keep going.'};
    if(power>=.72)return {mood:'overdrive',label:'Reality breaker',message:'THE LETTERS ARE FALLING OFF THE PAGE!! YOU’RE STILL GETTING FASTER?!'};
    if(power>=.36)return {mood:'charged',label:'Power rising',message:'I CAN FEEL IT!! Your pace is climbing. The whole space is coming apart!'};
    return {mood:'ecstatic',label:'Ascended',message:'THAT’S YOUR FINAL FORM!! I’m your divine keyboard guardian now!'};
  }
  if(result){
    if(result.accuracy===100)return {mood:'proud',label:'Flawless finish',message:persona==='hype'?'NOT. A. SINGLE. MISS. That was a main-character performance!':'A perfect little run. I’m so proud of you.'};
    if(result.wpm>baseline)return {mood:'ecstatic',label:'New heights',message:'You beat your usual pace! Look how far you’ve come.'};
    return {mood:result.accuracy<80?'sad':'happy',label:'A little progress',message:roast?'The keyboard survived. Your pride will recover. One more?':'Every attempt counts. Let’s take the next step together.'};
  }
  if(!running)return {mood:'idle',label:'Ready for your next arc',message:persona==='hype'?'Your next training arc starts with one keystroke. LET’S GO!':roast?'I’m ready whenever your fingers decide to clock in.':'One word at a time. You’ve got this!'};
  if(recentMistake)return {mood:roast?'angry':'determined',label:roast?'A little tough love':'Finding your rhythm',message:roast?'That key wasn’t even close. Eyes up, protagonist.':'A little stumble. Slow down for a moment. You’re doing fine.'};
  if(accuracy<80)return {mood:'sad',label:'Precision first',message:'Breathe. Slow is smooth, and smooth is fast.'};
  if(wpm>=baseline*1.3)return {mood:'shocked',label:'Wait… that’s fast',message:'Are you secretly the final boss?! Your fingers are flying!'};
  if(!typing)return {mood:'tired',label:'A tiny breather',message:'Taking a breath? I’ll keep your spot warm.'};
  return {mood:'happy',label:persona==='hype'?'Training arc in progress':'In this together',message:persona==='hype'?'THAT’S THE RHYTHM! Keep building that streak!':roast?'Okay, that was actually pretty good. Don’t let it go to your head.':'Look at you go! I’m typing right along with you.'};
}
