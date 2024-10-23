import { google } from 'googleapis';
const sheets = google.sheets('v4');
import * as fs from 'fs';
import figlet from 'figlet';

// Load the service account key file
const serviceAccountKeyFile = `./cp-red-valkyrie-b811a5215322.json`;
const key = JSON.parse(fs.readFileSync(serviceAccountKeyFile));

// Authenticate the client
const auth = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets'] // Scope for read/write access
);

const spreadsheetId = '1b0-tFXS_uABC7HGnLPXoRtf4Cl7JXz1lCWFRWrAZOEo';

function sheetFactory (range) {
  return {
    data: undefined,
    fetch: async function() {
      const result = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range
      })
      this.data = result.data
      console.log(JSON.stringify(this))
    },
    update: async function() {
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: this.data
      })
    },
  }
}

// await auth.authorize();
// let gearSheet = sheetFactory(`'Page 2'!P3:R21`);
// await gearSheet.fetch();
// // gearSheet.data.values.splice([6],1);
// // gearSheet.data.values.push([''])
// // gearSheet.update()
// console.log(gearSheet.data.values)
let text = figlet.textSync('45', {
  font: "Ghost",
})
text = text.split('\n').slice(2).join('\n')
fs.writeFileSync('./ascii.txt',text)
// console.log(trimmed)
// console.log(figlet.fontsSync());