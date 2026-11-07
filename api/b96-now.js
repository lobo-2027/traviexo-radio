// Experimental B96 metadata adapter. Never guesses when parsing is uncertain.
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const upstream=await fetch('https://www.audacy.com/b96/song-history',{headers:{'User-Agent':'Mozilla/5.0 (compatible; TraviexoRadioPreview/1.0)','Accept':'text/html'},signal:AbortSignal.timeout(7000)});
  if(!upstream.ok)throw Error('source unavailable');
  const html=await upstream.text();
  const decoded=html.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  const plain=decoded.replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script>/gi,' ').replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim();
  // Do not display unverified song/artist pair: provider markup may change.
  res.status(200).json({available:false,reason:'metadata format pending validation',source:'Audacy B96',checkedAt:new Date().toISOString(),sourceReachable:true});
 }catch(e){res.status(200).json({available:false,reason:'source unavailable',source:'Audacy B96',checkedAt:new Date().toISOString(),sourceReachable:false})}
};