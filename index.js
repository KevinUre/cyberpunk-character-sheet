// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const blessed = require('blessed');
import blessed from 'blessed'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import 'dotenv/config'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var screen = blessed.screen({
  title: `fuck me`,
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

const animate = async (message, ms) => {
  await delay(ms);
  loadingBox.setContent(loadingBox.content + message);
  screen.render();
}

screen.append(loadingBox);
screen.render();

await animate(`\nInitializing Virtuality Goggles... `,0)

await animate(`{green-fg}OK{/green-fg}\nConnecting to biometrics... `,20)
const doc = new GoogleSpreadsheet('1b0-tFXS_uABC7HGnLPXoRtf4Cl7JXz1lCWFRWrAZOEo',{ apiKey: process.env.APIKEY })
await doc.loadInfo();

await animate(`Done\nInitializing Interface Plugs... `,0)
await animate(`{green-fg}OK{/green-fg}\nConnecting To Neural Interface... `,100)
await animate(`Connected\nReading Skills Assessment from Database... `,120)
const sheet1 = doc.sheetsByIndex[0];
await sheet1.loadCells('A1:AG39');
await animate(`Done\nObtaining Inventory Data... `,10)
const sheet2 = doc.sheetsByIndex[1];
await sheet2.loadCells('A1:AD39');
await animate(`Done\nReading Cyberdeck Drive 0 into RAM... `,10)
const sheet3 = doc.sheetsByIndex[2];
await sheet3.loadCells('A1:AG39');
await animate(`Done\n`,70)

var table = blessed.table({
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
  style:{
    border: {
      fg: 'gray'
    }
  },
  tags: true,
  columnWidths: [10, 4, 10, 4, 10, 4, 10, 4]
})

var skills = [
  [ 'Accounting', 'P21'],
  [ 'Acting', 'X23'],
  [ 'Air Vehicle Tech', 'AF16'],
  [ 'Animal Handling', 'P22'],
  [ 'Archery', 'X28'],
  [ 'Athletics', 'P9'],
  [ 'Autofire', 'X29'],
  [ 'Basic Tech', 'AF17'],
  [ 'Brawling', 'X18'],
  [ 'Bribery', 'AF6'],
  [ 'Bureaucracy', 'P23'],
  [ 'Business', 'P24'],
  [ 'Composition', 'P25'],
  [ 'Conceal/Reveal Object', 'P4'],
  [ 'Concentration', 'P3'],
  [ 'Contortionist', 'P10'],
  [ 'Conversation', 'AF7'],
  [ 'Criminology', 'P26'],
  [ 'Cryptography', 'P27'],
  [ 'Cybertech', 'AF18'],
  [ 'Dance', 'P11'],
  [ 'Deduction', 'P28'],
  [ 'Demolitions', 'AF19'],
  [ 'Drive Land Vehicle', 'P16'],
  [ 'Education', 'P29'],
  [ 'Electronics/Security Tech', 'AF20'],
  [ 'Endurance', 'P12'],
  [ 'Evasion', 'X19'],
  [ 'First Aid', 'AF21'],
  [ 'Forgery', 'AF22'],
  [ 'Gamble', 'P30'],
  [ 'Handgun', 'X30'],
  [ 'Heavy Weapons', 'AF3'],
  [ 'Human Perception', 'AF8'],
  [ 'Interrogation', 'AF9'],
  [ 'Land Vehicle Tech', 'AF23'],
  [ 'Language: English', 'X5'],
  [ 'Language: Streetslang', 'X4'],
  [ 'Library Search', 'X7'],
  [ 'Lip Reading', 'P5'],
  [ 'Local Expert: Home', 'X9'],
  [ 'Martial Arts', 'X20'],
  [ 'Melee Weapon', 'X21'],
  [ 'Paint/Draw/Sculpt', 'AF24'],
  [ 'Paramedic', 'AF25'],
  [ 'Perception', 'P6'],
  [ 'Personal Grooming', 'AF11'],
  [ 'Persuasion', 'AF10'],
  [ 'Photography/Film', 'AF26'],
  [ 'Pick Lock', 'AF27'],
  [ 'Pick Pocket', 'AF28'],
  [ 'Pilot Air Vehicle', 'P17'],
  [ 'Pilot Sea Vehicle', 'P18'],
  [ 'Resist Torture/Drugs', 'P13'],
  [ 'Riding', 'P19'],
  [ 'Sea Vehicle Tech', 'AF29'],
  [ 'Shoulder Arms', 'AF4'],
  [ 'Stealth', 'P14'],
  [ 'Streetwise', 'AF12'],
  [ 'Tactics', 'X15'],
  [ 'Tracking', 'P7'],
  [ 'Trading', 'AF13'],
  [ 'Wardrobe & Style', 'AF14'],
  [ 'Weaponstech', 'AF30'],
  [ 'Wilderness Survival', 'X16'],
]

const pairs = skills.map((skill) => {
  return [skill[0], `${sheet1.getCellByA1(skill[1]).value}`]
})

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

const data = tablize(pairs);
table.setData(data);



// screen.append(outline)

const bar = blessed.progressbar({
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
  height: '100%-6',
  top: 0,
  left: 0,
  orientation: 'vertical',
  filled: 11/35*100
})


const ammo = blessed.box({
  label: 'Ammo',
  width: 7,
  height: 3,
  left: 0,
  bottom: 3,
  border: {
    type: 'line',
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
  content:'6/8',
  align: 'center'
})

const inputPrompt = '$Valkyrie@0.0.0.0>'

var input = blessed.textbox({
  label: 'input',
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
  content: inputPrompt,
})

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

// input.focus();

input.on('submit', (prompt) => {
  
  if (prompt === 'exit') {
    screen.destroy();
  } else if (prompt === 'red') {
    bar.style.bar.fg = 'red'
  }
  input.clearValue();
  // input.setValue(inputPrompt);
  screen.render();
  input.focus();
})

input.on('keypress', (ch, key) => {
  setImmediate(() => {
    // const raw = input.getValue();
    // if (raw.length < inputPrompt.length) {
    //   input.setContent(inputPrompt);
    //   screen.render();
    // } else if (raw === input && key.name === 'backspace') {
    // } else {
      // const text = raw.slice(inputPrompt.length)
      const text = input.getValue();
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
        table.setData(newData);
        screen.render();
      } else {
        table.setData(data);
        screen.render();
      }
    // }
  })
})

await animate(`Initializing Programs to RAM...\n`,80)
await animate(`Slot 1... `,20)
await animate(`${sheet3.getCellByA1('S4').value ?? 'empty'}\n`,70)
await animate(`Slot 2... `,20)
await animate(`${sheet3.getCellByA1('S5').value ?? 'empty'}\n`,65)
await animate(`Slot 3... `,20)
await animate(`${sheet3.getCellByA1('S6').value ?? 'empty'}\n`,60)
await animate(`Slot 4... `,20)
await animate(`${sheet3.getCellByA1('S7').value ?? 'empty'}\n`,55)
await animate(`Slot 5... `,20)
await animate(`${sheet3.getCellByA1('S8').value ?? 'empty'}\n`,50)
await animate(`Slot 6... `,20)
await animate(`${sheet3.getCellByA1('S9').value ?? ''}\n`,45)
await animate(`Slot 7... `,20)
await animate(`${sheet3.getCellByA1('S10').value ?? ''}\n`,40)
await animate(`Slot 8... `,20)
await animate(`${sheet3.getCellByA1('S11').value ?? '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`,35)
await animate(`Slot 9... `,20)
await animate(`${sheet3.getCellByA1('S12').value ?? '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`,30)
await animate(`Slot 10... `,20)
await animate(`${sheet3.getCellByA1('S13').value ?? '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`,30)
await animate(`Slot 11... `,20)
await animate(`${sheet3.getCellByA1('S14').value ?? '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`,30)
await animate(`Slot 12... `,20)
await animate(`${sheet3.getCellByA1('S15').value ?? '{yellow-fg}Buffer Overflow{/yellow-fg}'}\n`,30)
await animate(`\nLoading Deck GUI`,10)

await delay(20);
screen.append(fakeLoadingBar);
screen.render();

let init = false;
while(fakeLoadingBar.filled < 100) {
  await delay(20);
  fakeLoadingBar.progress(4)
  if(!init && fakeLoadingBar.filled > 60) {
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

// const outline = blessed.box({
//   border: {
//     type: 'line',
//     top: true,
//     bottom: true,
//     left: true,
//     right: true,
//   },
//   label: 'Skills',
//   right: 0,
//   top: 0,
//   width: 120,
//   height: 35,
//   style: {
//     transparent: true,
//     bg: 'white'
//   }
// })

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
  height: 35,
  width: 1,
  top: 0,
  right: 0,
  border: {
    type: 'line',
    right: true
  }
})

const bottomBar = blessed.box({
  height: 1,
  width: 120,
  bottom: 3,
  right: 0,
  border: {
    type: 'line',
    bottom: true
  }
})

await delay(100);
loadingBox.toggle();
screen.append(table);
screen.append(topBar);
screen.append(rightBar);
// screen.append(bottomBar);
screen.render();

await delay(200);
screen.append(bar);
screen.render();

await delay(200);
screen.append(ammo);
screen.render();

await delay(200);
screen.append(input)
input.focus();
screen.render();
