// B96 metadata adapter from the public nowplaying endpoint referenced by Audacy's B96 page.
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const upstream=await fetch('https://api.audacy.com/experience/v2/stations/101-419/nowplaying?count=1',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});
  if(!upstream.ok){res.status(200).json({available:false,reason:'audacy_http_'+upstream.status});return}
  const data=await upstream.json();
  // Shape inspection first. Never guess which entry is currently playing.
  res.status(200).json({available:false,reason:'audacy_response_received_mapping_pending',shape:{type:Array.isArray(data)?'array':typeof data,keys:data&&typeof data==='object'?Object.keys(data).slice(0,16):[],first:data&&typeof data==='object'?JSON.stringify(data).slice(0,1400):''},checkedAt:new Date().toISOString()});
 }catch(e){res.status(200).json({available:false,reason:'audacy_request_failed',error:String(e).slice(0,120),checkedAt:new Date().toISOString()})}
};