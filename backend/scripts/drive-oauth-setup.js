const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const credentials = require('../config/client_secret.json');
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// dynamic import helper for 'open'
async function openUrl(url) {
  const { default: open } = await import('open');
  await open(url);
}

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('\n👉 Authorize this app by visiting this URL:\n', authUrl);
openUrl(authUrl);

process.stdin.resume();
process.stdout.write('\nEnter the code from that page here: ');

process.stdin.on('data', async (code) => {
  const { tokens } = await oAuth2Client.getToken(code.toString().trim());
  fs.writeFileSync(
    path.join(process.cwd(), 'config', 'oauth_token.json'),
    JSON.stringify(tokens)
  );
  console.log('✅ OAuth token saved to config/oauth_token.json');
  process.exit(0);
});
