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

await auth.authorize();
let weaponsSheet = sheetFactory(`'Page 1'!Q32:AG38`);
let ammoSheet = sheetFactory(`'Page 2'!T22:AC25`);
await weaponsSheet.fetch()
await ammoSheet.fetch()
console.log(weaponsSheet.data.values)
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