import blessed from 'blessed'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import 'dotenv/config'
import { google } from 'googleapis';
const sheets = google.sheets('v4');
import * as fs from 'fs';
import figlet from 'figlet';

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

// #region Sheets App stuff
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
// #endregion

// #region Sheets
let healthSheet = sheetFactory(`Vesper!C13:E13`);
let armorSheet = sheetFactory(`Vesper!C14:D15`);
// #endregion

// #region util functions
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

const animate = async (message, ms) => {
  await delay(ms);
  loadingBox.setContent(loadingBox.content + message);
  screen.render();
}

const tablize = (pairs) => {
  const data = []
  for (let i = 0; i < 6; i++) {
    const line = []
    line.push(pairs[i][0])
    line.push(pairs[i][1])
    if (i+6 < pairs.length) {
      line.push(pairs[i + 6][0])
      line.push(pairs[i + 6][1])
    }
    data.push(line)
  }
  return data;
}
// #endregion

// #region Boxes
var screen = blessed.screen({
  title: `Valkyrie@Vesper`,
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
  width: 53,
  top: 0,
  right: 0,
  label: 'skillz',
  border: {
    type: 'line',
    top: true
  }
})

const rightBar = blessed.box({
  height: 12,
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

const criticalInjuriesBox = blessed.listtable({
  height: 3,
  // width: 50,
  top: 'center',
  left: 'center',
  keys: true,
  width: '100%-6',
  // width: 'shrink',
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
  height: '100%-7',
  top: 0,
  left: 0,
  orientation: 'vertical',
  filled: 100,
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
  bottom: 3,
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
// #endregion

// #region Constants
const criticalInjuriesMaster = [
  ['2','Dismembered Arm','Arm is gone, drop anything held. +1 to Death Save','---', 'S17'],
  ['3','Dismembered Hand','Hand is gone, drop anything help. +1 to Death Save','---', 'S17'],
  ['4','Collapsed Lung','-2 MOVE','P15','S15'],
  ['5','Broken Ribs','If you move more than 4m suffer 5 direct damage','P13','P15,S13'],
  ['6','Broken Arm','Arm cannot be used, drop held items','P13','P15,S13'],
  ['7','Foreign Object','If you move more than 4m suffer 5 direct damage','F13,P13','<--'],
  ['8','Broken Leg','-4 MOVE','P13','P15,S13'],
  ['9','Torn Muscle','-2 to Melee Attacks','F13,P13','<--'],
  ['10','Spinal Injury','Next turn you have no action. +1 to Death Save','P15','S15'],
  ['11','Crushed Fingers','-4 to any action invokving the hand','P13','S15'],
  ['12','Dismembered Leg','Leg is gone. -6 to MOVE. Cant dodge attacks. +1 to Death Save','---','S17'],
  ['2','Lost Eye','Eye is gone. -4 to Ranged Attacks and vision based Perception','---','S17'],
  ['3','Brain Injury','-2 to all actions. +1 to Death Save','---','S17'],
  ['4','Damaged Eye','-2 to Ranged Attacks and vision based Perception','P15','S13'],
  ['5','Concussion','-2 to all actions','F13,P13','<--'],
  ['6','Broken Jaw','-4 to all actions involving speech','P13','P13,S13'],
  ['7','Foreign Object','If you move more than 4m suffer 5 direct damage','F13,P13','<--'],
  ['8','Whiplash','+1 to Death Save','P13','P13,S13'],
  ['9','Cracked Skull','Aimed shots against the head to their damage x3. +1 to Death Save','P15','P15,S15'],
  ['10','Damaged Ear','If you move more than 4m you cant move next turn. -2 to hearing based Perception','P13','S13'],
  ['11','Crushed Windpipe','You cannot speak. +1 to Death Save','---','S15'],
  ['12','Lost Ear','If you move > 4m you cant move next turn. -4 to Perception. +1 to Death Save','---','S17'],
]

var skills = [
  ['Athletics', 'F2'],
  ['Brawling', 'F3'],
  ['Combat', 'F4'],
  ['Endurance', 'F5'],
  ['Evasion', 'F6'],
  ['Human Perception', 'F7'],
  ['Perception', 'F8'],
  ['Stealth', 'F9'],
  ['Tactics', 'F10'],
  ['Tracking', 'F11'],
  ['Wilderness Survival', 'F12'],
]

const inputPrompt = '$Valkyrie@Vesper>'
// #endregion

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

// #region Handlers
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
  const head = parseInt(armorSheet.data.values[1][0])
  const body = parseInt(armorSheet.data.values[0][0])

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
  await healthSheet.fetch();
  updateHealth();
  if(full) {
    await sheet1.loadCells('E2:F12');
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
  if (!params) { return; }
  let incoming = undefined
  let headShot = false
  let melee = false
  let brain = false
  let ap = false
  params.forEach((p) => {
    if (!isNaN(p)){ incoming = parseInt(p) }
    else { 
      switch(p.toLowerCase()){
        case 'melee':
          melee = true
          break;
        case 'head':
          headShot = true
          break;
        case 'brain':
          brain = true
          break;
        case 'ap':
          ap = true
          break;
      }
    }
  })
  if(!incoming) { return; }
  let armor = parseInt(armorSheet.data.values[0][0])
  if (headShot) {
    armor = parseInt(armorSheet.data.values[1][0])
  }
  if (melee) { armor = Math.floor(armor/2) }
  if (brain) { armor = 0 }
  if (armor < incoming) {
    let damage = incoming - armor
    if(headShot) { damage = damage * 2 }
    healthSheet.data.values[0][0] = `${Math.max(0,current-damage)}`
    if (!brain) {
      let ablasion = 1
      if (ap) { ablasion = 2 }
      if (headShot) { 
        armorSheet.data.values[1][0] = Math.max(0,armorSheet.data.values[1][0]-ablasion)
      } else {
        armorSheet.data.values[0][0] = Math.max(0,armorSheet.data.values[0][0]-ablasion)
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

async function repair(params) {
  if ( params && params[0] === 'all') {
    armorSheet.data.values[0][0] = armorSheet.data.values[0][1]
    armorSheet.data.values[1][0] = armorSheet.data.values[1][1]
  } else if (params && params[1] === 'head') {
    armorSheet.data.values[1][0] = armorSheet.data.values[1][1]
  } else {
    armorSheet.data.values[0][0] = armorSheet.data.values[0][1]
  }
  fs.writeFileSync('debug',JSON.stringify(armorSheet.data))
  armorSheet.update()
  updateArmor()
  screen.render()
}

async function help() {
  let helpText = ''
  helpText += `exit - powers down cyberdeck\n`
  helpText += `refresh [full] - re-syncs with google sheet\n`
  helpText += `hit <#> [head | brain] - applies a hit to the body or given\n`
  helpText += `      area, considering and modifying armor as required\n`
  helpText += `      aliases: damage; dmg\n`
  helpText += `crit add | rm | list | all - CRUD for critical injuries\n`
  helpText += `heal [<#> | full] - heals the given amount\n`
  helpText += `repair [head | all] - fully repairs the body or given armor\n`
  helpText += `fire [<#> | auto] - lowers ammo by RoF or given number\n`
  helpText += `      aliases: shoot\n`
  helpText += `equip - select a gun to be equipped\n`
  helpText += `reload - reloads the equipped gun with the selected ammo\n`
  helpText += `gear [add | rm] - CRUD for non-combat physical inventory\n`
  helpText += `programs - iterates contents of cyberdeck\n`
  helpText += `      aliases: prog; progs; grams\n`
  helpText += `ammo - iterates all ammo including currently loaded in guns\n`
  helpText += `cash [<#>] - display or change current money\n`
  helpText += `      aliases: money; eb`
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

async function critical(params){
  if (params && params[0]) {
    let currentInjuryNames = []
    if (healthSheet.data.values[0][2]) { currentInjuryNames = healthSheet.data.values[0][2].split('\n') }
    let result
    let currentInjuries = []
    switch (params[0]) {
      case 'add':
        const availableInjuries = criticalInjuriesMaster.filter((row) => !currentInjuryNames.includes(row[1]))
        criticalInjuriesBox.setData([['#','Name','Effect','Fix','Treat'],...availableInjuries])
        criticalInjuriesBox.height = 3 + availableInjuries.length
        result = await new Promise((resolve,reject) =>{
          criticalInjuriesBox.toggle()
          criticalInjuriesBox.focus()
          screen.render();
          const selectHandler = (item, index) => { 
            criticalInjuriesBox.removeListener('select', selectHandler)
            criticalInjuriesBox.removeListener('q', exitHandler)
            resolve({ item, index }) 
          }
          const exitHandler = () => { 
            criticalInjuriesBox.removeListener('select', selectHandler)
            criticalInjuriesBox.removeListener('q', exitHandler)
            resolve(null) 
          }
          criticalInjuriesBox.once('select', selectHandler);
          criticalInjuriesBox.key('q', exitHandler);
        })
        criticalInjuriesBox.toggle()
        screen.render()
        if (result) {
          const newInjury = availableInjuries[result.index-1]
          currentInjuryNames.push(newInjury[1])
          healthSheet.data.values[0][2] = currentInjuryNames.join('\n')
          notify(`added ${newInjury[1]}`,2500)
          healthSheet.update()
        }
        break;
      case 'rm':
      case 'remove':
        currentInjuries = criticalInjuriesMaster.filter((row) => currentInjuryNames.includes(row[1]))
        criticalInjuriesBox.setData([['#','Name','Effect','Fix','Treat'],...currentInjuries])
        criticalInjuriesBox.height = 3 + currentInjuries.length
        result = await new Promise((resolve,reject) =>{
          criticalInjuriesBox.toggle()
          criticalInjuriesBox.focus()
          screen.render();
          const selectHandler = (item, index) => { 
            criticalInjuriesBox.removeListener('select', selectHandler)
            criticalInjuriesBox.removeListener('q', exitHandler)
            resolve({ item, index }) 
          }
          const exitHandler = () => { 
            criticalInjuriesBox.removeListener('select', selectHandler)
            criticalInjuriesBox.removeListener('q', exitHandler)
            resolve(null) 
          }
          criticalInjuriesBox.once('select', selectHandler);
          criticalInjuriesBox.key('q', exitHandler);
        })
        criticalInjuriesBox.toggle()
        screen.render()
        if(result && result.index > 0) {
          const toBeRemoved = currentInjuryNames[result.index-1].toString()
          currentInjuryNames.splice([result.index-1],1);
          healthSheet.data.values[0][2] = currentInjuryNames.join('\n')
          notify(`removed ${toBeRemoved}`,2500)
          healthSheet.update();
        }
        break;
      case 'list':
      case 'show':
        currentInjuries = criticalInjuriesMaster.filter((row) => currentInjuryNames.includes(row[1]))
        criticalInjuriesBox.setData([['#','Name','Effect','Fix','Treat'],...currentInjuries])
        criticalInjuriesBox.height = 3 + currentInjuries.length
        await new Promise((resolve,reject) =>{
          criticalInjuriesBox.toggle()
          criticalInjuriesBox.focus()
          screen.render();
          criticalInjuriesBox.once('select', (item, index) => {
            // Resolve the promise with the selected item and index
            resolve({ item, index });
          });
        })
        criticalInjuriesBox.toggle()
        screen.render()
        break;
      case 'all':
        criticalInjuriesBox.setData([['#','Name','Effect','Fix','Treat'],...criticalInjuriesMaster])
        criticalInjuriesBox.height = 3 + criticalInjuriesMaster.length
        await new Promise((resolve,reject) =>{
          criticalInjuriesBox.toggle()
          criticalInjuriesBox.focus()
          screen.render();
          criticalInjuriesBox.once('select', (item, index) => {
            // Resolve the promise with the selected item and index
            resolve({ item, index });
          });
        })
        criticalInjuriesBox.toggle()
        screen.render()
        break;
    }
  }
}
// #endregion

async function HandleCommand(fullMessage) {
  const command = fullMessage.trim().split(' ')[0];
  const params = fullMessage.trim().split(' ').slice(1).filter((a) => a !== '');
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
    case 'help':
      await help(params);
      break;
    case 'crit':
      await critical(params);
      break;
  }
}

// #region Initial Animation
screen.append(loadingBox);
screen.render();

await animate(`\nInitializing Virtuality Goggles... `, 0)
await auth.authorize();
await animate(`{green-fg}OK{/green-fg}\nConnecting to biometrics... `, 20)
await healthSheet.fetch();
await animate(`Done\nInitializing Interface Plugs... `, 20)
await armorSheet.fetch();
await animate(`{green-fg}OK{/green-fg}\nConnecting To Neural Interface... `, 20)
// await weaponsSheet.fetch();
await animate(`Connected\nReading Skills Assessment from Database... `, 20)
const doc = new GoogleSpreadsheet('1b0-tFXS_uABC7HGnLPXoRtf4Cl7JXz1lCWFRWrAZOEo', { apiKey: process.env.APIKEY })
await doc.loadInfo();
const sheet1 = doc.sheetsByTitle['Vesper'];
await sheet1.loadCells('A1:F12');
await animate(`Done\nObtaining Inventory Data... `, 10)
// await ammoSheet.fetch();
// await gearSheet.fetch();
// await moneySheet.fetch();
await animate(`Done\nReading Cyberdeck Drive 0 into RAM... `, 10)
// await programsSheet.fetch();
await animate(`Done\n`, 40)

await (async (animations) => {
  await animate(`Initializing Programs to RAM...\n`, 80)
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
// console.log(sheet1.getCellByA1(`F7`).value)
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
updateArmor();
fs.writeFileSync('debug', JSON.stringify(armorSheet.data))
screen.append(armorBox);
screen.append(criticalInjuriesBox);
criticalInjuriesBox.toggle();
screen.render();

await delay(200);
screen.append(inputBox)
inputBox.focus();
screen.render();
// #endregion