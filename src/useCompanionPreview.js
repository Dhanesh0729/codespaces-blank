import {useState} from 'react';

const divineOnly=new Set(['overdrive','charged','ecstatic']);
export function useCompanionPreview(){
  const [divine,setDivine]=useState(false);
  const [ordinaryMood,setOrdinaryMood]=useState('happy');
  const [divineMood,setDivineMood]=useState('overdrive');
  const setMood=mood=>{
    if(divine)setDivineMood(mood);
    else if(!divineOnly.has(mood))setOrdinaryMood(mood);
  };
  return {divine,setDivine,mood:divine?divineMood:ordinaryMood,setMood};
}
