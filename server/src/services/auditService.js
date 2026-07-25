import fetch from 'node-fetch';

const FETCH_TIMEOUT_MS = 8000;

export async function runAudit(url) {
    const startTime= Date.now();

    const controller =new AbortController();
    const timeout=setTimeout(()=>controller.abort(), FETCH_TIMEOUT_MS);

    let response;
    try{
        response=await fetch(url,{
            signal: controller.signal,
            redirect: 'follow',
        });
    }
    catch(err){
        clearTimeout(timeout);
        if(err.name==='AbortError'){
            throw new Error('TIMEOUT');
        }

        throw new Error('FETCH_FAILED');
    }

    clearTimeout(timeout);
    
    const responseTimeMs=Date.now() - startTime;
    const html=await response.text();

    return{
    url,
    statusCode: response.status,
    responseTimeMs,
    contentLengthBytes: Buffer.byteLength(html, 'utf8'),
    title: extractTag(html, /<title>(.*?)<\/title>/i),
    metaDescription: extractMetaContent(html, 'description'),
    viewportPresent: /<meta[^>]+name=["']viewport["']/i.test(html),
    canonicalPresent: /<link[^>]+rel=["']canonical["']/i.test(html),
    headers: {
      contentType: response.headers.get('content-type') || null,
      server: response.headers.get('server') || null,
      xFrameOptions: response.headers.get('x-frame-options') || null,
      strictTransportSecurity: response.headers.get('strict-transport-security') || null,
    },
    auditedAt: new Date().toISOString(),
  };   
  
}

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractMetaContent(html, name) {
  const regex = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`,
    'i'
  );
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}