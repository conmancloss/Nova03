let transport = null, transportName = null;
self.onconnect = (event) => {
  const port = event.ports[0];
  port.onmessage = async (e) => {
    const { message, port: rp } = e.data;
    if (!message) return;
    try {
      if (message.type === 'ping') {
        rp.postMessage({ type: 'pong' }); rp.close();
      } else if (message.type === 'set') {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const result = await new AsyncFunction(message.client.function)();
        transport = new result[0](...(message.client.args || []));
        transportName = result[1];
        if (transport.init) await transport.init();
        rp.postMessage({ type: 'set' }); rp.close();
      } else if (message.type === 'get') {
        rp.postMessage({ type: 'get', name: transportName }); rp.close();
      } else if (message.type === 'fetch') {
        if (!transport) throw new Error('No transport set');
        const resp = await transport.request(new URL(message.fetch.remote), message.fetch.method, message.fetch.body, message.fetch.headers, null);
        const body = resp.body;
        body instanceof ReadableStream ? rp.postMessage({ type:'fetch', fetch:resp }, [body]) : rp.postMessage({ type:'fetch', fetch:resp });
        rp.close();
      }
    } catch(err) {
      rp.postMessage({ type:'error', error:{ message:err.message } }); rp.close();
    }
  };
  port.start();
};
