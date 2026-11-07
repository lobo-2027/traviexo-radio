// B96 metadata from Audacy public nowplaying service; read-only and fail-closed.
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const r=await fetch('https://api.audacy.com/experience/v2/stations/101-419/nowplaying?count=1',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error('audacy_http_'+r.status);
  const data=await r.json(),item=Array.isArray(data.performances)?data.performances[0]:null;
  if(!item||typeof item.artist!=='string'||typeof item.title!=='string'||!item.artist.trim()||!item.title.trim()){res.status(200).json({available:false,reason:'no_valid_song',checkedAt:new Date().toISOString()});return}
  const timestamp=Date.parse(item.time),age=Number.isFinite(timestamp)?Date.now()-timestamp:NaN;
  if(!Number.isFinite(age)||age< -120000||age>15*60*1000){res.status(200).json({available:false,reason:'song_data_stale',lastReportedAt:item.time,checkedAt:new Date().toISOString()});return}
  res.status(200).json({available:true,title:item.title.trim(),artist:item.artist.trim(),reportedAt:item.time,reportedAgeSeconds:Math.max(0,Math.round(age/1000)),source:'Audacy B96',checkedAt:new Date().toISOString(),mayLag:true});
 }catch(e){res.status(200).json({available:false,reason:'audacy_unavailable',checkedAt:new Date().toISOString()})}
};