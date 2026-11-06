// Experimental Icecast directory adapter. Metadata only; never proxy audio.
module.exports = async (req,res) => {
  res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=3600');
  try {
    const upstream = await fetch('https://dir.xiph.org/yp.xml',{signal:AbortSignal.timeout(9000)});
    if(!upstream.ok) throw new Error('Icecast HTTP '+upstream.status);
    const xml = await upstream.text();
    if(xml.length>12000000) throw new Error('Directory too large');
    const decode=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    const tag=(s,n)=>decode((s.match(new RegExp('<'+n+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+n+'>','i'))||[])[1]||'').trim();
    const stations=[]; const seen=new Set();
    for(const m of xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)){
      const e=m[1],name=tag(e,'server_name'),genre=tag(e,'genre'),url=tag(e,'listen_url'),desc=tag(e,'server_description');
      if(!name||!/^https:\/\//i.test(url)||!/mexic|méxic|latino|latin|espa[nñ]ol|regional|banda|norte[nñ]|corrid|cumbia|sonider|salsa|bachata|reggaet|reguet|urbano|gruper|rancher|duranguen|merengue/i.test([name,genre,desc].join(' ')))continue;
      if(/christian|cristian|religio|gospel|worship|iglesia|church|evangelic|jes[uú]s|biblia/i.test([name,genre,desc].join(' ')))continue;
      const key=url.toLowerCase().replace(/\/$/,'');if(seen.has(key))continue;seen.add(key);
      stations.push({id:'icecast:'+key,name:name.slice(0,110),desc:'Icecast · '+genre.slice(0,90),url});
      if(stations.length>=120)break;
    }
    res.status(200).json({source:'Icecast YP',stations});
  }catch(e){res.status(502).json({error:'Directorio Icecast temporalmente no disponible',stations:[]});}
};