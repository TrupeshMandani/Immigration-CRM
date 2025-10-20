const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const readline = require("readline");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_PATH = path.join(__dirname, "../config/oauth_token.json");
const CREDENTIALS_PATH = path.join(__dirname, "../config/client_secret.json");

async function authorize() {
  try {
    // Check if credentials file exists
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error(
        "❌ Error: client_secret.json not found at",
        CREDENTIALS_PATH
      );
      console.log("\nPlease ensure you have:");
      console.log("1. Created a Google Cloud Project");
      console.log("2. Enabled the Google Drive API");
      console.log("3. Created OAuth 2.0 credentials");
      console.log("4. Downloaded the credentials as client_secret.json");
      console.log("5. Placed it in backend/config/");
      return;
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("\n🔐 Google Drive OAuth Setup");
    console.log("━".repeat(50));
    console.log("\n📋 Step 1: Authorize this app by visiting this URL:");
    console.log("\n" + authUrl + "\n");
    console.log("📋 Step 2: After authorization, copy the code from the URL");
    console.log("📋 Step 3: Paste the code below when prompted\n");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter the authorization code here: ", async (code) => {
      rl.close();

      try {
        const { tokens } = await oAuth2Client.getToken(code.trim());
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

        console.log("\n✅ Success! OAuth token saved to:", TOKEN_PATH);
        console.log("\n🎉 Google Drive is now configured!");
        console.log("\nYou can now:");
        console.log("  - Upload documents through the CRM");
        console.log("  - Files will be stored in Google Drive");
        console.log("  - Students can view and download their documents");
        console.log(
          "\n💡 Tip: Keep oauth_token.json secure and do NOT commit it to git"
        );
      } catch (error) {
        console.error("\n❌ Error getting access token:", error.message);
        console.log("\nPlease try again or check your authorization code.");
      }
    });
  } catch (error) {
    console.error("❌ Error during setup:", error.message);
  }
}

console.log("\n🚀 Immigration CRM - Google Drive OAuth Setup\n");
authorize().catch(console.error);
