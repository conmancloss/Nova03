const P_CONNECT=0x01,P_DATA=0x02,P_CLOSE=0x04;
let ws=null,wsProm=null,nextId=1;
const streams=new Map();
function connect(url){
  if(ws&&ws.readyState===WebSocket.OPEN)return Promise.resolve(ws);
  if(wsProm)return wsProm;
  wsProm=new Promise((res,rej)=>{
    const s=new WebSocket(url);s.binaryType='arraybuffer';
    s.onopen=()=>{ws=s;res(s);};
    s.onerror=()=>{wsProm=null;rej(new Error('wisp connect failed'));};
    s.onclose=()=>{ws=null;wsProm=null;for(const st of streams.values())st.err?.(new Error('disconnected'));streams.clear();};
    s.onmessage=({data})=>{const v=new DataView(data),t=v.getUint8(0),id=v.getUint32(1,true),st=streams.get(id);if(!st)return;if(t===P_DATA)st.data(new Uint8Array(data,5));else if(t===P_CLOSE){st.close(v.getUint8(5));streams.delete(id);}};
  });return wsProm;
}
function sendConn(id,host,port){const hb=new TextEncoder().encode(host),f=new ArrayBuffer(8+hb.length),v=new DataView(f);v.setUint8(0,P_CONNECT);v.setUint32(1,id,true);v.setUint8(5,0x01);v.setUint16(6,port,true);new Uint8Array(f,8).set(hb);ws.send(f);}
function sendData(id,d){const b=d instanceof Uint8Array?d:d instanceof ArrayBuffer?new Uint8Array(d):new TextEncoder().encode(d),f=new ArrayBuffer(5+b.length),v=new DataView(f);v.setUint8(0,P_DATA);v.setUint32(1,id,true);new Uint8Array(f,5).set(b);ws.send(f);}
function sendClose(id){const f=new ArrayBuffer(6),v=new DataView(f);v.setUint8(0,P_CLOSE);v.setUint32(1,id,true);v.setUint8(5,1);ws.send(f);}
class WispTransport{
  constructor(u){this._u=u;this.ready=false;}
  async init(){try{await connect(this._u);this.ready=true;}catch(e){}}
  async request(url,method,body,headers){
    await connect(this._u);
    const u=url instanceof URL?url:new URL(url),isS=u.protocol==='https:',port=u.port?+u.port:(isS?443:80),id=nextId++;
    sendConn(id,u.hostname,port);
    const hLines=Object.entries(headers||{}).filter(([k])=>!['host','connection','transfer-encoding','content-length'].includes(k.toLowerCase())).map(([k,v])=>`${k}: ${v}`).join('\r\n');
    const bodyB=body?(body instanceof Uint8Array?body:body instanceof ArrayBuffer?new Uint8Array(body):new TextEncoder().encode(body)):null;
    const path=(u.pathname||'/')+(u.search||'');
    const req=[`${method||'GET'} ${path} HTTP/1.1`,`Host: ${u.hostname}`,'Connection: close',hLines,bodyB?`Content-Length: ${bodyB.length}`:''].filter(Boolean).join('\r\n')+'\r\n\r\n';
    sendData(id,req);
    if(bodyB&&bodyB.length)sendData(id,bodyB);
    return new Promise((res,rej)=>{
      let parsed=false,buf=new Uint8Array(0),ctrl;
      const bodyStream=new ReadableStream({start(c){ctrl=c;}});
      streams.set(id,{
        data(chunk){
          if(!parsed){
            const n=new Uint8Array(buf.length+chunk.length);n.set(buf);n.set(chunk,buf.length);buf=n;
            const txt=new TextDecoder('latin1').decode(buf),sep=txt.indexOf('\r\n\r\n');
            if(sep===-1)return;
            parsed=true;
            const lines=txt.slice(0,sep).split('\r\n'),[,s,...sm]=lines[0].split(' '),status=+s,statusText=sm.join(' ');
            const respH=new Headers();for(let i=1;i<lines.length;i++){const c=lines[i].indexOf(':');if(c>0)respH.append(lines[i].slice(0,c).trim(),lines[i].slice(c+1).trim());}
            const rest=buf.slice(sep+4);if(rest.length)ctrl.enqueue(rest);buf=null;
            res({body:bodyStream,headers:respH,status,statusText});
          }else ctrl?.enqueue(chunk);
        },
        close(){ctrl?.close();if(!parsed)rej(new Error('closed'));},
        err(e){ctrl?.error(e);if(!parsed)rej(e);},
      });
    });
  }
  connect(url,protocols,reqH,onopen,onmsg,onclose,onerr){
    (async()=>{
      try{
        await connect(this._u);
        const u=url instanceof URL?url:new URL(url),isS=u.protocol==='wss:',port=u.port?+u.port:(isS?443:80),id=nextId++;
        sendConn(id,u.hostname,port);
        const key=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
        const ug=[`GET ${u.pathname}${u.search} HTTP/1.1`,`Host: ${u.hostname}`,'Upgrade: websocket','Connection: Upgrade',`Sec-WebSocket-Key: ${key}`,'Sec-WebSocket-Version: 13',...(protocols?.length?[`Sec-WebSocket-Protocol: ${protocols.join(', ')}`]:[]),...Object.entries(reqH||{}).map(([k,v])=>`${k}: ${v}`),'',''].join('\r\n');
        sendData(id,ug);
        let upgraded=false;
        streams.set(id,{data(c){if(!upgraded){upgraded=true;onopen({protocols:[]});return;}onmsg(c.buffer);},close(code){onclose(code,'');},err(e){onerr(e?.message||'error');}});
        const send=(d)=>sendData(id,d),close=()=>{sendClose(id);streams.delete(id);};
        return[send,close];
      }catch(e){onerr(e.message);}
    })();
  }
}
export default WispTransport;
