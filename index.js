// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const blessed = require('blessed');
import blessed from 'blessed'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import 'dotenv/config'
import { google } from 'googleapis';
const sheets = google.sheets('v4');
import * as fs from 'fs';

let quickMode = false;
process.argv.forEach(function (val, index, array) {
  if (val === '-q') {
    quickMode = true;
  }
});

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
      // console.log(JSON.stringify(this))
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

let healthSheet = sheetFactory(`'Page 1'!D28:E28`);
let armorSheet = sheetFactory(`'Page 1'!A34:G36`);
let weaponsSheet = sheetFactory(`'Page 1'!Q32:AG38`);
let ammoSheet = sheetFactory(`'Page 2'!T22:AC25`);
let gearSheet = sheetFactory(`'Page 2'!P3:R21`);
let programsSheet = sheetFactory(`'Page 3'!S4:S16`);

function letterToColumn(letter) {
  let column = 0;
  const { length } = letter;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * 26 ** (length - i - 1);
  }
  return column;
}

function delay(ms, always) {
  if (quickMode && !always) { return new Promise(resolve => setTimeout(resolve, 0)) }
  return new Promise(resolve => setTimeout(resolve, ms));
}

var screen = blessed.screen({
  title: `Valkyrie@0.0.0.0`,
  dockBorders: true,
  smartCSR: true,
});

var loadingBox = blessed.box({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  content: 'Initalizing Cyberdeck...',
  style: {
    // transparent: true,
    // bg: 'black',
    border: {
      fg: 'black'
    }
  },
  tags: true
})

var fakeLoadingBar = blessed.progressbar({
  width: '60%',
  height: 3,
  left: '20%',
  top: '50%-1',
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  ch: '█',
  // orientation: 'vertical',
  filled: 0,
  tags: true
})

var notificationBox = blessed.box({
  left: 'center',
  top: 'center',
  height: 3,
  width:'shrink',
  content: '',
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  style: {
    fg: 'yellow',
    border: {
      fg: 'yellow'
    }
  },
  tags: true,
})

var errorBox = blessed.box({
  left: 'center',
  top: 'center',
  height: 3,
  content: '',
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  style: {
    fg: 'red',
    border: {
      fg: 'red'
    }
  },
  tags: true,
})

var helpBox = blessed.box({
  left: 'center',
  top: 'center',
  height: 'shrink',
  width:'shrink',
  content: '',
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  tags: true,
  align: 'left',
  interactive: true,
  vi: true,
})

const animate = async (message, ms) => {
  await delay(ms);
  loadingBox.setContent(loadingBox.content + message);
  screen.render();
}

var skillTable = blessed.table({
  top: 0,
  right: 0,
  // width: '100%',
  height: '100%-3',
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
    fg: 'cyan'
  },
  style: {
    border: {
      fg: 'gray'
    }
  },
  tags: true,
  columnWidths: [10, 4, 10, 4, 10, 4, 10, 4]
})

const topBar = blessed.box({
  height: 1,
  width: 120,
  top: 0,
  right: 0,
  label: 'skillz',
  border: {
    type: 'line',
    top: true
  }
})

const rightBar = blessed.box({
  height: 34,
  width: 1,
  top: 0,
  right: 0,
  border: {
    type: 'line',
    right: true
  }
})

const listBox = blessed.listtable({
  height: 3,
  // width: 50,
  top: 'center',
  left: 'center',
  keys: true,
  width: 'shrink',
  // height: 'shrink',
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  interactive: true,
  vi: true,
  style: {
    cell: {
      selected: {
        bg: theme.listHighlight,
      }
    }
  }
})


var skills = [
  ['Accounting', 'P21'],
  ['Acting', 'X23'],
  ['Air Vehicle Tech', 'AF16'],
  ['Animal Handling', 'P22'],
  ['Archery', 'X28'],
  ['Athletics', 'P9'],
  ['Autofire', 'X29'],
  ['Basic Tech', 'AF17'],
  ['Brawling', 'X18'],
  ['Bribery', 'AF6'],
  ['Bureaucracy', 'P23'],
  ['Business', 'P24'],
  ['Composition', 'P25'],
  ['Conceal/Reveal Object', 'P4'],
  ['Concentration', 'P3'],
  ['Contortionist', 'P10'],
  ['Conversation', 'AF7'],
  ['Criminology', 'P26'],
  ['Cryptography', 'P27'],
  ['Cybertech', 'AF18'],
  ['Dance', 'P11'],
  ['Deduction', 'P28'],
  ['Demolitions', 'AF19'],
  ['Drive Land Vehicle', 'P16'],
  ['Education', 'P29'],
  ['Electronics/Security Tech', 'AF20'],
  ['Endurance', 'P12'],
  ['Evasion', 'X19'],
  ['First Aid', 'AF21'],
  ['Forgery', 'AF22'],
  ['Gamble', 'P30'],
  ['Handgun', 'X30'],
  ['Heavy Weapons', 'AF3'],
  ['Human Perception', 'AF8'],
  ['Interrogation', 'AF9'],
  ['Land Vehicle Tech', 'AF23'],
  ['Language: English', 'X5'],
  ['Language: Streetslang', 'X4'],
  ['Library Search', 'X7'],
  ['Lip Reading', 'P5'],
  ['Local Expert: Home', 'X9'],
  ['Martial Arts', 'X20'],
  ['Melee Weapon', 'X21'],
  ['Paint/Draw/Sculpt', 'AF24'],
  ['Paramedic', 'AF25'],
  ['Perception', 'P6'],
  ['Personal Grooming', 'AF11'],
  ['Persuasion', 'AF10'],
  ['Photography/Film', 'AF26'],
  ['Pick Lock', 'AF27'],
  ['Pick Pocket', 'AF28'],
  ['Pilot Air Vehicle', 'P17'],
  ['Pilot Sea Vehicle', 'P18'],
  ['Resist Torture/Drugs', 'P13'],
  ['Riding', 'P19'],
  ['Sea Vehicle Tech', 'AF29'],
  ['Shoulder Arms', 'AF4'],
  ['Stealth', 'P14'],
  ['Streetwise', 'AF12'],
  ['Tactics', 'X15'],
  ['Tracking', 'P7'],
  ['Trading', 'AF13'],
  ['Wardrobe & Style', 'AF14'],
  ['Weaponstech', 'AF30'],
  ['Wilderness Survival', 'X16'],
]

const tablize = (pairs) => {
  const data = []
  for (let i = 0; i < 17; i++) {
    const line = []
    line.push(pairs[i][0])
    line.push(pairs[i][1])
    line.push(pairs[i + 17][0])
    line.push(pairs[i + 17][1])
    line.push(pairs[i + 34][0])
    line.push(pairs[i + 34][1])
    if (i + 51 < pairs.length) {
      line.push(pairs[i + 51][0])
      line.push(pairs[i + 51][1])
    }
    data.push(line)
  }
  return data;
}

const healthBar = blessed.progressbar({
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  label: 'HP',
  ch: '█',
  width: 5,
  height: '100%-11',
  top: 0,
  left: 0,
  orientation: 'vertical',
  filled: 11 / 35 * 100,
  style: {
    bar: { fg: 'cyan' },
    border: { fg: 'cyan' }
  }
})

const healthAmount = blessed.box({
  width: 2,
  height: 1,
  top: 1,
  left: 2,
  content: 'XX',
  // style: {
  //   fg: 'cyan'
  // }
})

const armorBox = blessed.box({
  label: 'Arm',
  width: 6,
  height: 4,
  left: 0,
  bottom: 7,
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  tags: true,
  content: '11 11',
  align: 'center'
})


const ammoBox = blessed.box({
  label: 'Gun',
  width: 7,
  height: 4,
  left: 0,
  bottom: 3,
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  style: {
    border: { fg: 'bright-white' },
    label: { fg: 'bright-white' }
  },
  tags: true,
  content: 'Basic\n 6/8',
  align: 'center'
})

const inputPrompt = '$Valkyrie@0.0.0.0>'

var inputBox = blessed.textbox({
  label: 'Terminal>',
  width: '100%',
  height: 3,
  left: 0,
  // top: '100%-3',
  bottom: 0,
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  inputOnFocus: true,
  // content: inputPrompt,
})

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

inputBox.on('submit', async (prompt) => {
  await HandleCommand(prompt);
  inputBox.clearValue();
  // input.setValue(inputPrompt);
  screen.render();
  inputBox.focus();
})

inputBox.on('keypress', (ch, key) => {
  setImmediate(() => {
    // const raw = input.getValue();
    // if (raw.length < inputPrompt.length) {
    //   input.setContent(inputPrompt);
    //   screen.render();
    // } else if (raw === input && key.name === 'backspace') {
    // } else {
    // const text = raw.slice(inputPrompt.length)
    const text = inputBox.getValue();
    if (text !== '') {
      const newPairs = pairs.map((pair) => {
        if (pair[0].toLowerCase().includes(text.toLowerCase())) {
          const newPair = [
            `{green-fg}${pair[0]}{/green-fg}`,
            `{green-fg}${pair[1]}{/green-fg}`
          ]
          return newPair
        }
        return pair
      })
      const newData = tablize(newPairs)
      skillTable.setData(newData);
      screen.render();
    } else {
      skillTable.setData(data);
      screen.render();
    }
    // }
  })
})

function notify(message, ms) {
  notificationBox.setContent(message);
  // notificationBox.width = notificationBox.content.length+2;
  notificationBox.toggle();
  screen.render();
  setTimeout(()=>{
    notificationBox.toggle()
    screen.render()
  },ms)
}

function updateArmor() {
  const head = parseInt(armorSheet.data.values[1][6])
  const body = parseInt(armorSheet.data.values[2][6])

  let headString = head.toString().trim().padStart(2,' ') // alt+255
  if (head < 1) { headString = `{red-fg}${headString}{/red-fg}`}
  else if (head < 8) { headString = `{yellow-fg}${headString}{/yellow-fg}`}
  else { headString = `${theme.detailColorTag.open}${headString}${theme.detailColorTag.close}` }
  headString = `${theme.detailColorTag.open}H:${theme.detailColorTag.close}${headString}`

  let bodyString = body.toString().trim().padStart(2,' ') // alt+255
  if (body < 1) { bodyString = `{red-fg}${bodyString}{/red-fg}`}
  else if (body < 8) { bodyString = `{yellow-fg}${bodyString}{/yellow-fg}`}
  bodyString = `B:${theme.accentTag.open}${bodyString}${theme.accentTag.close}`
  armorBox.setContent(`${headString}\n${bodyString}`)
}

function updateHealth() {
  screen.remove(healthAmount)
  const current = parseInt(healthSheet.data.values[0][0])
  const max = parseInt(healthSheet.data.values[0][1])
  healthBar.filled = current / max * 100
  healthAmount.setContent(current.toString())
  healthAmount.top = Math.ceil((1-current/max)*(healthBar.height-2))
  if (current < max / 2) {
    healthBar.style.bar.fg = 'red'
    healthBar.style.border.fg = 'red'
    screen.append(healthAmount)
  } 
  else if (current < max) {
    healthBar.style.bar.fg = 'yellow'
    healthBar.style.border.fg = 'white'
    screen.append(healthAmount)
  } 
  else {
    healthBar.style.bar.fg = 'white'
    healthBar.style.border.fg = 'white'
  }
}

function updateAmmo() {
  const loadout = weaponsSheet.data.values[0][0]
  const weaponName = loadout.split(',')[0]
  const weaponRow = weaponsSheet.data.values.filter((row) => row[1] === weaponName)[0]
  const weaponLabel = weaponRow[0].split(',')[0]
  const currentAmmo = parseInt(weaponRow[6])
  const maxAmmo = weaponRow[0].split(',')[2]
  const ammoTypeName = loadout.split(',')[1]
  const ammoTypeIndex = ammoSheet.data.values[0].findIndex((e)=> e === ammoTypeName)
  const ammoType = ammoSheet.data.values[3][ammoTypeIndex]
  if(currentAmmo == 0) {
    ammoBox.style.border.fg = 'red'
  } else {
    ammoBox.style.border.fg = 'bright-white'
  }
  let ammo = `${theme.accentTag.open}${currentAmmo.toString()}${theme.accentTag.close}`;
  if(currentAmmo == 0) {
    ammo = `{red-fg}${ammo}{/red-fg}`
  } else if (currentAmmo < maxAmmo / 2) {
    ammo = `{yellow-fg}${ammo}{/yellow-fg}`
  }
  ammoBox.setLabel(weaponLabel.padStart(4,'─'))
  const typeString = `${theme.detailColorTag.open}${ammoType}${theme.detailColorTag.close}`
  const maxAmmoString = `${theme.detailColorTag.open}/${maxAmmo}${theme.detailColorTag.close}`
  ammoBox.setContent(`${typeString}\n${ammo}${maxAmmoString}`)
}

async function refresh(params, silent) {
  if (!silent) {
    notificationBox.setContent('Please Wait...');
    notificationBox.width = notificationBox.content.length+2;
    notificationBox.toggle();
    screen.render();
  }
  const full = params && params.length > 0 ? true : false;
  await armorSheet.fetch();
  updateArmor();
  await weaponsSheet.fetch();
  await ammoSheet.fetch();
  updateAmmo();
  await gearSheet.fetch();
  await healthSheet.fetch();
  updateHealth();
  await programsSheet.fetch();
  if(full) {
    await sheet1.loadCells('A1:AG39');
    const pairs = skills.map((skill) => {
      return [skill[0], `${sheet1.getCellByA1(skill[1]).value}`]
    })
    const data = tablize(pairs);
    skillTable.setData(data);
  }
  if (!silent) {
    notificationBox.toggle();
  }
  screen.render();
}

async function heal(params) {
  const current = parseInt(healthSheet.data.values[0][0])
  const max = parseInt(healthSheet.data.values[0][1])
  let amount = 0
  if (params && params[0] === 'full') {
    amount = max - current;
  } else if (params && !isNaN(params[0])) {
    amount = parseInt(params[0])
    if (amount + current > max) {
      amount = max - current
    }
  }
  if (params) {
    healthSheet.data.values[0][0] = `${current+amount}`
    updateHealth()
    healthSheet.update()
    screen.render()
  }
}

async function damage(params) {
  const current = parseInt(healthSheet.data.values[0][0])
  if (!params || isNaN(params[0])) { return; }
  let incoming = parseInt(params[0])
  let headShot = false
  let brain = false
  if (params[1] && params[1] === 'head') { headShot = true }
  if (params[1] && params[1] === 'brain') { brain = true }
  let armor = parseInt(armorSheet.data.values[2][6])
  if (headShot) {
    armor = parseInt(armorSheet.data.values[1][6])
  }
  if (brain) { armor = 0 }
  if (armor <= incoming) {
    let damage = incoming - armor
    healthSheet.data.values[0][0] = `${Math.max(0,current-damage)}`
    if (!brain) {
      if (headShot) { 
        armorSheet.data.values[1][6] = Math.max(0,armor-1)
      } else {
        armorSheet.data.values[2][6] = Math.max(0,armor-1)
      }
    }
    if(!brain) {
      await armorSheet.update()
      updateArmor()
    }
    await healthSheet.update()
    updateHealth()
    screen.render()
  }
}

async function fire(params) {
  const loadout = weaponsSheet.data.values[0][0]
  const weaponName = loadout.split(',')[0]
  const weaponRowIndex = weaponsSheet.data.values.findIndex((row) => row[1] === weaponName)
  const weaponRow = weaponsSheet.data.values[weaponRowIndex]
  const currentAmmo = parseInt(weaponRow[6])
  const rateOfFire =  parseInt(weaponRow[7])
  let amount = rateOfFire
  if(params && !isNaN(params[0])) { amount = Math.min(rateOfFire, parseInt(params[0])) }
  if(params && params[0] == 'auto') { amount = 10 }
  if (amount > currentAmmo) { 
    if(!params[0]) {
      amount = currentAmmo
    }
    else {
      notify('Insufficient Ammunition',2500)
      return
    }
  }
  weaponsSheet.data.values[weaponRowIndex][6] = currentAmmo - amount
  updateAmmo()
  weaponsSheet.update()
}

async function repair(params) {
  if ( params && params[0] === 'all') {
    armorSheet.data.values[1][6] = armorSheet.data.values[1][0]
    armorSheet.data.values[2][6] = armorSheet.data.values[2][0]
  } else if (params && params[1] === 'head') {
    armorSheet.data.values[1][6] = armorSheet.data.values[1][0]
  } else {
    armorSheet.data.values[2][6] = armorSheet.data.values[2][0]
  }
  await armorSheet.update()
  updateArmor()
}

async function gear(params) {
  listBox.setData([["Inventory"],...gearSheet.data.values])
  listBox.height = 3 + gearSheet.data.values.length
  await new Promise((resolve,reject) =>{
    listBox.toggle()
    listBox.focus()
    screen.render();
    listBox.once('select', (item, index) => {
      // Resolve the promise with the selected item and index
      resolve({ item, index });
    });
  })
  listBox.toggle()
  screen.render()
}

async function programs(params) {
  listBox.setData([["Programs"],...programsSheet.data.values])
  listBox.height = 3 + programsSheet.data.values.length
  await new Promise((resolve,reject) =>{
    listBox.toggle()
    listBox.focus()
    screen.render();
    listBox.once('select', (item, index) => {
      // Resolve the promise with the selected item and index
      resolve({ item, index });
    });
  })
  listBox.toggle()
  screen.render()
}

async function reload(params) {
  const loadout = weaponsSheet.data.values[0][0]
  const weaponName = loadout.split(',')[0]
  const weaponRowIndex = weaponsSheet.data.values.findIndex((row) => row[1] === weaponName)
  const weaponRow = weaponsSheet.data.values[weaponRowIndex]
  const currentAmmo = parseInt(weaponRow[6])
  const maxAmmo = parseInt(weaponRow[0].split(',')[2])
  const gunAmmoTypeCode = weaponRow[0].split(',')[1]
  const ammoTypeName = loadout.split(',')[1]
  const ammoTypeIndex = ammoSheet.data.values[0].findIndex((e) => e === ammoTypeName)
  // unload
  ammoSheet.data.values[2][ammoTypeIndex] = parseInt(ammoSheet.data.values[2][ammoTypeIndex])+currentAmmo
  // pick a type
  const acceptableAmmos = []
  for(let i = 0; i < ammoSheet.data.values[0].length; i = i + 2) {
    if (ammoSheet.data.values[3][i+1] === gunAmmoTypeCode) {
      acceptableAmmos.push([ammoSheet.data.values[0][i]])
    }
  }
  listBox.setData([["Ammunition"],...acceptableAmmos])
  listBox.height = 3 + programsSheet.data.values.length
  const selection = await new Promise((resolve,reject) =>{
    listBox.toggle()
    listBox.focus()
    screen.render();
    listBox.once('select', (item, index) => {
      // Resolve the promise with the selected item and index
      resolve({ item, index });
    });
  })
  listBox.toggle()
  screen.render()
  const pickedAmmoName = selection.item.getText().trim(' ')
  // load
  const newAmmoTypeIndex = ammoSheet.data.values[0].findIndex((e) => e === pickedAmmoName)
  const amountToLoad = Math.min(parseInt(ammoSheet.data.values[2][newAmmoTypeIndex]),maxAmmo)
  ammoSheet.data.values[2][newAmmoTypeIndex] = parseInt(ammoSheet.data.values[2][newAmmoTypeIndex]) - amountToLoad
  weaponsSheet.data.values[weaponRowIndex][6] = amountToLoad
  weaponsSheet.data.values[0][0] = `${weaponName},${pickedAmmoName}`
  const choppedLoadout = weaponsSheet.data.values[weaponRowIndex][0].split(',')
  choppedLoadout.pop()
  weaponsSheet.data.values[weaponRowIndex][0] = `${choppedLoadout.join(',')},${newAmmoTypeIndex}`
  // notify(`pickedItem:${JSON.stringify(weaponsSheet.data.values[0][0])}`,5000)
  updateAmmo()
  weaponsSheet.update()
  ammoSheet.update()
}

async function equip(params) {
  const weaponsToList = []
  for(let i = 1; i < weaponsSheet.data.values.length; i++) {
    weaponsToList.push([weaponsSheet.data.values[i][1]])
  }
  listBox.setData([["Guns"],...weaponsToList])
  listBox.height = 3 + programsSheet.data.values.length
  const selection = await new Promise((resolve,reject) =>{
    listBox.toggle()
    listBox.focus()
    screen.render();
    listBox.once('select', (item, index) => {
      // Resolve the promise with the selected item and index
      resolve({ item, index });
    });
  })
  listBox.toggle()
  screen.render()
  const pickedWeaponName = selection.item.getText().trim(' ')
  const weaponRowIndex = weaponsSheet.data.values.findIndex((row) => row[1] === pickedWeaponName)
  const weaponRow = weaponsSheet.data.values[weaponRowIndex]
  const currentAmmoIndex = parseInt(weaponRow[0].split(',')[3])
  const ammoName = ammoSheet.data.values[0][currentAmmoIndex]
  weaponsSheet.data.values[0][0] = `${pickedWeaponName},${ammoName}`
  weaponsSheet.update()
  updateAmmo()
}

async function ammo() {
  const ammoList = []
  for(let i = 0; i < ammoSheet.data.values[0].length; i = i + 2) {
    ammoList.push([ammoSheet.data.values[0][i],parseInt(ammoSheet.data.values[2][i],)])
  }
  for(let i = 1; i < weaponsSheet.data.values.length; i++) {
    const weaponInfos = weaponsSheet.data.values[i][0]
    const weaponAmmoIndex = weaponInfos.split(',')[3]
    const ammoName = ammoSheet.data.values[0][weaponAmmoIndex]
    const index = ammoList.findIndex((row) => row[0] === ammoName)
    ammoList[index][1] += parseInt(weaponsSheet.data.values[i][6])
  }
  for(let i = 0; i < ammoList.length; i++) {
    ammoList[i][1] = ammoList[i][1].toString()
  }
  listBox.setData([["Ammunition","Qty"],...ammoList])
  listBox.height = 3 + programsSheet.data.values.length
  await new Promise((resolve,reject) =>{
    listBox.toggle()
    listBox.focus()
    screen.render();
    listBox.once('select', (item, index) => {
      // Resolve the promise with the selected item and index
      resolve({ item, index });
    });
  })
  listBox.toggle()
  screen.render()
}

async function help() {
  let helpText = ''
  helpText += `exit - powers down cyberdeck\n`
  helpText += `refresh [full] - re-syncs with google sheet\n`
  helpText += `hit <#> [head | brain] - applies a hit to the body or given\n`
  helpText += `      area, considering and modifying armor as required\n`
  helpText += `      aliases: damage; dmg\n`
  helpText += `heal [<#> | full] - heals the given amount\n`
  helpText += `repair [head | all] - fully repairs the body or given armor\n`
  helpText += `fire [<#> | auto] - lowers ammo by RoF or given number\n`
  helpText += `      aliases: shoot\n`
  helpText += `equip - select a gun to be equipped\n`
  helpText += `reload - reloads the equipped gun with the selected ammo\n`
  helpText += `gear - iterates non-combat physical inventory\n`
  helpText += `programs - iterates contents of cyberdeck\n`
  helpText += `      aliases: prog; progs; grams\n`
  helpText += `ammo - iterates all ammo including currently loaded in guns`
  helpBox.setContent(helpText)
  await new Promise((resolve,reject) =>{
    helpBox.toggle()
    helpBox.focus()
    helpBox.render();
    setTimeout(() => {
      screen.once('keypress', () => {
        // Resolve the promise with the selected item and index
        helpBox.toggle()
        screen.render()
        resolve();
    }, 500);
    });
  })
}

// input.focus();

async function HandleCommand(fullMessage) {
  const command = fullMessage.trim().split(' ')[0];
  const params = fullMessage.trim().split(' ').slice(1);
  switch (command.toLowerCase()) {
    case 'exit':
      screen.destroy();
      break;
    case 'refresh':
      await refresh(params);
      break;
    case 'heal':
      heal(params);
      break;
    case 'dmg':
    case 'damage':
    case 'hit':
      damage(params);
      break;
    case 'repair':
      repair(params);
      break;
    case 'gear':
      await gear(params);
      break;
    case 'programs':
    case 'prog':
    case 'progs':
    case 'grams':
      await programs(params);
      break;
    case 'fire':
    case 'shoot':
      fire(params);
      break;
    case 'equip':
      await equip(params);
      break;
    case 'reload':
      await reload(params);
      break;
    case 'ammo':
      await ammo(params);
      break;
    case 'help':
      await help(params);
      break;
  }
}

screen.append(loadingBox);
screen.render();

await animate(`\nInitializing Virtuality Goggles... `, 0)
await auth.authorize();
await animate(`{green-fg}OK{/green-fg}\nConnecting to biometrics... `, 20)
await healthSheet.fetch();
await animate(`Done\nInitializing Interface Plugs... `, 0)
await armorSheet.fetch();
await animate(`{green-fg}OK{/green-fg}\nConnecting To Neural Interface... `, 100)
await weaponsSheet.fetch();
await animate(`Connected\nReading Skills Assessment from Database... `, 120)
const doc = new GoogleSpreadsheet('1b0-tFXS_uABC7HGnLPXoRtf4Cl7JXz1lCWFRWrAZOEo', { apiKey: process.env.APIKEY })
await doc.loadInfo();
const sheet1 = doc.sheetsByIndex[0];
await sheet1.loadCells('A1:AG39');
await animate(`Done\nObtaining Inventory Data... `, 10)
await ammoSheet.fetch();
await gearSheet.fetch();
await animate(`Done\nReading Cyberdeck Drive 0 into RAM... `, 10)
await programsSheet.fetch();
await animate(`Done\n`, 70)

await (async (animations) => {
  await animate(`Initializing Programs to RAM...\n`, 80)
  await animate(`Slot 1... `, 20)
  await animate(`${programsSheet.data.values[0] ? programsSheet.data.values[0][0] : ''}\n`, 70)
  await animate(`Slot 2... `, 20)
  await animate(`${programsSheet.data.values[1] ? programsSheet.data.values[1][0] : ''}\n`, 65)
  await animate(`Slot 3... `, 20)
  await animate(`${programsSheet.data.values[2] ? programsSheet.data.values[2][0] : ''}\n`, 60)
  await animate(`Slot 4... `, 20)
  await animate(`${programsSheet.data.values[3] ? programsSheet.data.values[3][0] : ''}\n`, 55)
  await animate(`Slot 5... `, 20)
  await animate(`${programsSheet.data.values[4] ? programsSheet.data.values[4][0] : ''}\n`, 50)
  await animate(`Slot 6... `, 20)
  await animate(`${programsSheet.data.values[5] ? programsSheet.data.values[5][0] : ''}\n`, 45)
  await animate(`Slot 7... `, 20)
  await animate(`${programsSheet.data.values[6] ? programsSheet.data.values[6][0] : ''}\n`, 40)
  await animate(`Slot 8... `, 20)
  await animate(`${programsSheet.data.values[7] ? programsSheet.data.values[7][0] : '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`, 35)
  await animate(`Slot 9... `, 20)
  await animate(`${programsSheet.data.values[8] ? programsSheet.data.values[8][0] : '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`, 30)
  await animate(`Slot 10... `, 20)
  await animate(`${programsSheet.data.values[9] ? programsSheet.data.values[9][0] : '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`, 30)
  await animate(`Slot 11... `, 20)
  await animate(`${programsSheet.data.values[10] ? programsSheet.data.values[10][0] : '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`, 30)
  await animate(`Slot 12... `, 20)
  await animate(`${programsSheet.data.values[11] ? programsSheet.data.values[11][0] : '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`, 30)
  await animate(`\nLoading Deck GUI`, 10)
  await delay(20);
  screen.append(fakeLoadingBar);
  screen.render();

  let init = false;
  while (fakeLoadingBar.filled < 100) {
    await delay(20);
    fakeLoadingBar.progress(4)
    if (!init && fakeLoadingBar.filled > 60) {
      init = true;
      loadingBox.content = `
                        *                                                                       --
                       ++                                                                       --
                       *++                                                                     =-=
                       ++++                                                                   --==
                       ++++==                                                               .::-==
                       ++=++===                                                            :..:-=+
                        ++=====--                                                        ..::.-==+
                          =====--:::                                                   :::::::-=
                        += +==--:::..                                               .::::::--:  =+
                        ====  =-:::::..                                            ..:::-::- :-===
                         ====-- :::.::..:                                       :...::::-- ==--=+
                          ====-=- -::::::::                                   ....:::-- =---==-=
                           ===----- -:--:::..                               :...:::-= ====--===
                             =-----:--:..:::....                          ::....::: =--===--=
                           =-= ----:::.:::.:.....                       ......... -----==-- ==-
                            --=-=---:::::::-.......                    ...:::..:::--=--= =--=-
                             =------ ::-::::.:..      ::::     --:::     -:--::------ =====--
                               =--:::: ::.:-.:.      ::::::::  :::::::   :.:::::-== ======
                                ---::--: ::-::      ::::::::: -:-:::.:     ::::: =-======
                                   -:-:::::-:.     -:::::::::-::::::::-    -::-++=-=---
                                     -:-::: :::   :::::::::::::::.:::::-   --:=-==-=
                                         :- :.:--- :-::::::::::::::::-- ---===-=-
                                         --::-:--:-------:::::::-:::-==----==---=
                                        -:- :::: ::---------:----:-----=--------=
                                          --:::- -:----===---------= --=  -==-=-
                                          =-:   ----==  ==-=----=---------   ===
                                                ----=-=  =-----:-------=
                                                   -=-==-==--  ---=----
                                                       +==-=  --:--
                                                       :-=-::--::--
                                                        ---::---::
                                                          --:::.:
                                                          : :..-
                                                          - :..
                                                             :`;
    }
    screen.render();
  }
  await delay(20);
  fakeLoadingBar.toggle();
  screen.render();
})()

await delay(100);
loadingBox.toggle();
const pairs = skills.map((skill) => {
  return [skill[0], `${sheet1.getCellByA1(skill[1]).value}`]
})
const data = tablize(pairs);
skillTable.setData(data);
screen.append(skillTable);
screen.append(topBar);
screen.append(rightBar);
screen.render();

screen.append(notificationBox);
notificationBox.toggle();
screen.append(listBox);
listBox.toggle();
screen.append(helpBox);
helpBox.toggle();

await delay(200);
screen.append(healthBar);
updateHealth();
screen.render();

await delay(200);
updateAmmo();
screen.append(ammoBox);
screen.render();

await delay(200);
updateArmor();
screen.append(armorBox);
screen.render();

await delay(200);
screen.append(inputBox)
inputBox.focus();
screen.render();
