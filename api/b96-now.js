// V71: B96 public playlist metadata, server-side, fail closed.
function decode(s){return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&#(\\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/\\s+/g,' ').trim()}
function parse(html){
 const text=decode(html.replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script>/gi,' ').replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gi,' ').replace(/<[^>]+>/g,' | ')).replace(/\\s*\\|\\s*/g,' | ');
 const live=text.match(/(?:^|\\|)\\s*(?:Live|On air)\\s*\\|\\s*([^|]{4,170})/i);
 if(!live)return null;
 const value=live[1].trim(),sep=value.indexOf(' - ');
 if(sep<2||sep>90)return null;
 const artist=value.slice(0,sep).trim(),title=value.slice(sep+3).trim();
 if(!artist||!title||title.length>120||/[<>]/.test(artist+title))return null;
 return {artist,title};
}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 try{
  const r=await fetch('https://onlineradiobox.com/us/wbbmfm/playlist/?lang=en',{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},signal:AbortSignal.timeout(9000)});
  if(!r.ok)throw Error('upstream '+r.status);
  const html=await r.text(),track=parse(html);
  res.status(200).json(track?{available:true,...track,source:'Online Radio Box · B96',checkedAt:new Date().toISOString(),warning:'Playlist may lag broadcast'}:{available:false,reason:'No verifiable live track in provider response',sourceReachable:true,checkedAt:new Date().toISOString()});
 }catch(e){res.status(200).json({available:false,reason:'Playlist source unreachable',sourceReachable:false,checkedAt:new Date().toISOString()})}
};