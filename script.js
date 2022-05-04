const sheet_url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpI0AG3qWS4sFnfKNUktGYqN5QY_BPqthQVwndcJbuuZSlTY5rpJBO3fEoZ93EIlK5PHADC9_znbir/pub?output=csv";

const labels = document.querySelectorAll('.gallery .labels > div');
const rowWidth = document.querySelector('.gallery .row div').offsetWidth;
const colWidth = document.querySelector('.gallery .row div').offsetHeight;

let beats;
let beatsIndex = 0;
let timer;

async function setup() {
  {
    const elt = document.getElementById('spreadsheet-url');
    elt.innerText = elt.href = sheet_url.replace(/\?output=csv$/, '')
    elt.target = '_blank';
  }
  fetch(sheet_url)
    .then((res) => res.text())
    .then((text) => {
      const rows = decodeCsv(text);
      rows.forEach((row) => (row.length = Math.min(row.length, 9)));
      beats = rows.map((row) => row.map(Number));
      document.body.className = '';
      start();
    });
}

function decodeCsv(text) {
  const lines = text.split("\r\n");
  return lines.map((s) => s.split(","));
}

setup();

function draw() {
  if (!beats) return;
  document.getElementById('beat-number').innerText = 'Beat #' + (beatsIndex + 1);
  setPositions(beats[beatsIndex])
}

function setPositions(beat) {
  beat.forEach((v, i) => {
    const label = labels[i];
    const row = Math.floor((v - 1) / 3);
    const col = (v - 1) % 3;
    label.style.left = `${col * colWidth + colWidth / 2}px`;
    label.style.top = `${row * rowWidth + rowWidth / 2}px`;
  });
}

function start() {
  draw();
  timer = timer || setInterval(() => {
    draw();
    beatsIndex = (beatsIndex + 1) % beats.length;
  }, 1000);
}

function stop() {
  clearInterval(timer);
  timer = null;
}

function nextBeat() {
  beatsIndex = (beatsIndex + 1) % beats.length;
  draw();
  stop();
}

function previousBeat() {
  beatsIndex = (beatsIndex - 1 + beats.length) % beats.length;
  draw();
  stop();
}

function rewind() {
  beatsIndex = 0;
  draw();
}
