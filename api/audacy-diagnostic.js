// Private-development diagnostic: inspect public Audacy page without exposing raw HTML.
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 const urls=['https://www.audacy.com/stations/b96','https://www.audacy.com/b96/song-history'];
 const checks=[];
 for(const url of urls){
  try{
   const r=await fetch(url,{headers:{'Accept':'text/html','User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1'},signal:AbortSignal.timeout(7000)});
   const html=await r.text();
   const snippets=[];const ids=[...html.matchAll(/(?:a2Id|stationId|station_id|101-419|awId)[^\\n]{0,130}/gi)].slice(0,15).map(m=>m[0]);
   for(const pattern of [/Thrift Shop/ig,/nowPlaying/ig,/recentlyPlayed/ig,/currentTrack/ig,/songHistory/ig,/__NEXT_DATA__/ig,/101-419/g]){
    const m=pattern.exec(html);
    snippets.push({term:pattern.source,found:!!m,context:m?html.slice(Math.max(0,m.index-80),m.index+120).replace(/<[^>]*>/g,' ').slice(0,200):''});
   }
   checks.push({source:url,status:r.status,length:html.length,ids,snippets});
  }catch(e){checks.push({source:url,error:String(e).slice(0,130)})}
 }
 res.status(200).json({checks,checkedAt:new Date().toISOString()});
};