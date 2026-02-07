import { spawn, execSync } from 'child_process';
import * as fs from 'fs';

let windowId = undefined;
function spawnPet() {
  const pet = spawn(
    'osascript',
    ['-e', `tell application "Terminal" to do script "cd ${process.cwd()}; echo $$ > pid; node index.js"`]
  );
  pet.stdout.on('data', d => {
    if(!windowId) {
      console.log(d.toString())
      const temp = d.toString().match(/(?<=window\sid\s)\d+/)
      if (temp) { windowId = temp[0]; }
    }
  });
}

const petProcess = spawnPet();

function cleanup() {
  if (fs.existsSync(`${process.cwd()}/pid`)) {
    const pid = fs.readFileSync(`${process.cwd()}/pid`).toString().trim()
    console.log(`\n${pid}`)
    execSync(`kill -9 ${pid}`);
    execSync(`osascript -e 'tell application "Terminal" to close window id ${windowId}'`);
    fs.rmSync(`${process.cwd()}/pid`)
  }
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});
process.on('SIGTERM', cleanup);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
(async () => {
  while (true) {
    await wait(1000);
    process.stdout.write('.')
  }
})()