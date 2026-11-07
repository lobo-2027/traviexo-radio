// B96 preview: server-side metadata from the station's published music page.
module.exports = async (req,res) => {
 res.setHeader('Cache-Control','no-store');
 try {
  const response=await fetch('https://www.audacy.com/b96/shows/b96-music',{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error('upstream');
  const html=await response.text();
  // Search for a bounded recent-played block; avoid inventing results.
  const strip=x=>x.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\\s+/g,' ').trim();
  const section=html.match(/Recently Played([\\s\\S]{0,20000})/i);
  const text=section?strip(section[1]):'';
  res.status(200).json({available:false,source:'Audacy B96',reason:section?'Official history found, mapping not verified':'Official history not found',checkedAt:new Date().toISOString(),sourceReachable:true});
 } catch(e) {
  res.status(200).json({available:false,source:'Audacy B96',reason:'Provider unavailable',checkedAt:new Date().toISOString(),sourceReachable:false});
 }
};