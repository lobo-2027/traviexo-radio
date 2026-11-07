// V71 safe diagnostic adapter. Never present unverified music metadata.
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const r=await fetch('https://onlineradiobox.com/us/wbbmfm/playlist/?lang=en',{headers:{'Accept':'text/html','User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(7500)});
  if(!r.ok){res.status(200).json({available:false,reason:'provider_http_'+r.status,checkedAt:new Date().toISOString()});return}
  const html=await r.text();
  const liveIndex=html.toLowerCase().indexOf('live');
  res.status(200).json({available:false,reason:'provider_reachable_parser_not_verified',checkedAt:new Date().toISOString(),diagnostics:{htmlLength:html.length,liveMarkerFound:liveIndex>=0}});
 }catch(e){res.status(200).json({available:false,reason:'provider_request_failed',checkedAt:new Date().toISOString()})}
};