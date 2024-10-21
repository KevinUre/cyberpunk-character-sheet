import { google } from 'googleapis';
const sheets = google.sheets('v4');
import * as fs from 'fs';

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
let isWindows = process.platform === 'win32';
const theme = {
  listHighlight: isWindows ? 'blue' : 'gray',
  detailColorTag: {
    open: isWindows ? '' : '{gray-fg}',
    close: isWindows ? '' : '{/gray-fg}',
  },
  accentTag: {
    open: '{bold}',
    close:  '{/bold}',
  }
}

await auth.authorize();
let armorSheet = sheetFactory(`'Page 1'!A34:G36`);
await armorSheet.fetch()
const head = parseInt(armorSheet.data.values[1][6])
const body = parseInt(armorSheet.data.values[2][6])
let headString = head.toString().padStart(2)
if (head < 1) { headString = `{red-fg}${headString}{/red-fg}`}
else if (head < 8) { headString = `{yellow-fg}${headString}{/yellow-fg}`}
else { headString = `${theme.detailColorTag.open}${headString}${theme.detailColorTag.close}` }
headString = `${theme.detailColorTag.open}H:${theme.detailColorTag.close}${headString}`

let bodyString = body.toString().padStart(2,' ')
if (body < 1) { bodyString = `{red-fg}${bodyString}{/red-fg}`}
else if (body < 8) { bodyString = `{yellow-fg}${bodyString}{/yellow-fg}`}
bodyString = `B:${theme.accentTag.open}${bodyString}${theme.accentTag.close}`
// armorBox.setContent(`${headString}\n${bodyString}`)
console.log(`'${headString}'`)
console.log(`'${bodyString}'`)
// const loadout = weaponsSheet.data.values[0][0]
// const weaponName = loadout.split(',')[0]
// const weaponRowIndex = weaponsSheet.data.values.findIndex((row) => row[1] === weaponName)
// const weaponRow = weaponsSheet.data.values[weaponRowIndex]
// const currentAmmo = parseInt(weaponRow[6])
// const maxAmmo = weaponRow[0].split(',')[2]
// const gunAmmoTypeCode = weaponRow[0].split(',')[1]
// const ammoTypeName = loadout.split(',')[1]
// const ammoTypeIndex = ammoSheet.data.values[0].findIndex((e) => e === ammoTypeName)
// // unload
// console.log(`Unloading: ${ammoTypeIndex}`)
// console.log(ammoSheet.data.values[2][ammoTypeIndex])
// ammoSheet.data.values[2][ammoTypeIndex] = parseInt(ammoSheet.data.values[2][ammoTypeIndex]) + currentAmmo
// console.log(ammoSheet.data.values[2][ammoTypeIndex])
// // pick a type
// const acceptableAmmos = []
// for(let i = 0; i < ammoSheet.data.values[0].length; i = i + 2) {
//   if (ammoSheet.data.values[3][i+1] === gunAmmoTypeCode) {
//     acceptableAmmos.push([ammoSheet.data.values[0][i]])
//   }
// }
// console.log(acceptableAmmos)
// const pickedAmmoName = 'Armor Piercing Heavy Pistol Ammo'
// const newAmmoTypeIndex = ammoSheet.data.values[0].findIndex((e) => e === pickedAmmoName)
// const amountToLoad = Math.min(parseInt(ammoSheet.data.values[2][newAmmoTypeIndex]),maxAmmo)
// ammoSheet.data.values[2][newAmmoTypeIndex] = parseInt(ammoSheet.data.values[2][newAmmoTypeIndex]) - amountToLoad
// weaponsSheet.data.values[weaponRowIndex][6] = amountToLoad
// weaponsSheet.data.values[0][0] = `${weaponName},${pickedAmmoName}`
// console.log(ammoSheet.data.values)
// console.log(weaponsSheet.data.values)
// weaponsSheet.update()
// ammoSheet.update()