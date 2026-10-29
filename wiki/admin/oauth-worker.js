// Вход в Decap CMS через GitHub для сайта на GitHub Pages — бесплатный Cloudflare Worker.
// Переменные Worker'а (Settings → Variables):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET — из GitHub OAuth App (callback URL: https://<ваш-worker>/callback)
//   ALLOWED_ORIGIN — адрес сайта без пути, например https://tr1ton4ikus.github.io
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo',
        state,
        redirect_uri: `${url.origin}/callback`,
      });
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://github.com/login/oauth/authorize?${params}`,
          'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax`,
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const cookie = (request.headers.get('Cookie') || '').match(/oauth_state=([^;]+)/);
      if (!code || !cookie || cookie[1] !== url.searchParams.get('state')) return page('error', { message: 'Ошибка входа, попробуйте ещё раз' }, env);

      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'astrum-decap-oauth' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const data = await res.json();
      if (!data.access_token) return page('error', { message: data.error_description || 'GitHub не выдал токен' }, env);
      return page('success', { token: data.access_token, provider: 'github' }, env);
    }

    return new Response('ASTRUM Decap OAuth: работает', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};

// окно входа передаёт результат редактору (протокол Decap CMS)
function page(status, content, env) {
  const msg = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><meta charset="utf-8"><body><script>
(function(){
  var allowed=${JSON.stringify(env.ALLOWED_ORIGIN || '')};
  function receive(e){
    if(allowed&&e.origin!==allowed)return;
    window.opener.postMessage(${JSON.stringify(msg)},e.origin);
    window.removeEventListener('message',receive,false);
    window.close();
  }
  window.addEventListener('message',receive,false);
  window.opener.postMessage('authorizing:github','*');
})();
</script></body>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'Set-Cookie': 'oauth_state=; Max-Age=0; Path=/' } });
}
