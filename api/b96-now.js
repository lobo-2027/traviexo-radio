// V71 preview: best-effort public playlist adapter. Never invent track metadata.
const SOURCE='https://onlineradiobox.com/us/wbbmfm/playlist/?lang=en';
function clean(s){return s.replace(/&(?:amp|#38);/g,'&').replace(/&(?:quot|#34);/g,'"').replace(/&(?:apos|#39);/g,"'").replace(/&nbsp;/g,' ').replace(/&#(\\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\\s+/g,' ').trim()}
function parse(html){
 const text=clean(html.replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script>/gi,' ').replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gi,' ').replace(/<[^>]*>/g,' '));
 // OnlineRadioBox identifies the most recent item as "Live | Artist - Title".
 const m=text.match(/(?:^|\\s)Live\\s*\\|\\s*([^|]{3,180}?)\\s+(?=\\d{1,2}:\\d{2}\\s*\\||(?:B96 playlist|TOP songs))/i);
 if(!m)return null;
 const pair=m[1].trim(),sep=pair.indexOf(' - ');
 if(sep<2||sep>95)return null;
 const artist=pair.slice(0,sep).trim(),title=pair.slice(sep+3).trim();
 if(!artist||!title||title.length>110||/playlist|radio|listen live/i.test(artist))return null;
 return {artist,title}
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 try{
  const r=await fetch(SOURCE,{headers:{'Accept':'text/html','User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(8500)});
  if(!r.ok)throw Error('upstream '+r.status);
  const html=await r.text(),track=parse(html);
  if(!track){res.status(200).json({available:false,reason:'No verified live entry in source',source:'Online Radio Box B96',checkedAt:new Date().toISOString()});return}
  res.status(200).json({available:true,...track,source:'Online Radio Box B96',checkedAt:new Date().toISOString(),note:'Reported live playlist; may lag actual broadcast'});
 }catch(e){res.status(200).json({available:false,reason:'Playlist unavailable',source:'Online Radio Box B96',checkedAt:new Date().toISOString()})}
};