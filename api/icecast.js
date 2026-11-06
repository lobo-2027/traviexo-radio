// Experimental Icecast directory adapter. Metadata only; never proxy audio.
module.exports = async (req,res) => {
  res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=3600');
  try {
    const upstream = await fetch('https://dir.xiph.org/yp.xml',{signal:AbortSignal.timeout(9000)});
    if(!upstream.ok) throw new Error('Icecast HTTP '+upstream.status);
    const xml = await upstream.text();
    if(xml.length>35000000) throw new Error('Directory too large');
    const decode=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    const tag=(s,n)=>decode((s.match(new RegExp('<'+n+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+n+'>','i'))||[])[1]||'').trim();
    const stations=[]; const seen=new Set();
    const page=Math.min(10000,Math.max(0,Number.parseInt(req.query?.offset,10)||0));
    const limit=200;
    let matched=0;
    for(const m of xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)){
      const e=m[1],name=tag(e,'server_name'),genre=tag(e,'genre'),url=tag(e,'listen_url'),desc=tag(e,'server_description');
      if(!name||!/^https?:\/\//i.test(url))continue;
      const key=url.toLowerCase().replace(/\/$/,'');if(seen.has(key))continue;seen.add(key);
      if(matched++<page)continue;
      if(stations.length<limit)stations.push({id:'icecast:'+key,name:name.slice(0,110),desc:'Icecast · '+genre.slice(0,90)+(url.startsWith('https://')?'':' · HTTP (puede no reproducirse en iPhone)'),url});
    }
    res.status(200).json({source:'Icecast YP',stations,total:matched,offset:page,hasMore:page+stations.length<matched});
  }catch(e){res.status(502).json({error:'Directorio Icecast temporalmente no disponible',stations:[]});}
};