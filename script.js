const sheet_url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpI0AG3qWS4sFnfKNUktGYqN5QY_BPqthQVwndcJbuuZSlTY5rpJBO3fEoZ93EIlK5PHADC9_znbir/pub?output=csv";

const rowWidth = document.querySelector('.gallery .row div').offsetWidth;
const colWidth = document.querySelector('.gallery .row div').offsetHeight;

let beats;
let curBeatIndex = 0;
let performers;

let intervalTimer;

async function setup() {
  // display the URL of the spreadsheet
  {
    const elt = document.getElementById('spreadsheet-url');
    elt.innerText = elt.href = sheet_url.replace(/\?output=csv$/, '')
    elt.target = '_blank';
  }

  // fetch the spreadsheet data
  const text = await fetch(sheet_url).then((res) => res.text())
  const rows = decodeCsv(text);
  // if the first column header is 'Beat#', delete the column
  if (rows[0][0] === 'Beat#') {
    rows.forEach(row => row.shift());
  }
  // if the first row is not numeric, assume it is the header
  const header = rows[0].some((s) => !isNaN(s))
    ? rows.shift()
    : null;
  rows.forEach((row) => (row.length = Math.min(row.length, 9)));
  beats = rows.map((row) => row.map(Number));

  document.body.className = '';
  // Create a div for each string in header, and append it to the labels container
  let performerNames = header || rows[0].map((_, i) => `${i + 1}`);
  performers = header.map((s) => {
    const elt = document.createElement('div');
    elt.className = 'label';
    elt.innerText = s;
    return elt;
  });
  performers.forEach((elt) => document.querySelector('.performers').appendChild(elt));

  startPlaying();
}

setup();

function draw() {
  document.getElementById('beat-number').innerText = 'Beat #' + (curBeatIndex + 1);
  setPositions(beats[curBeatIndex])
}

function setPositions(beat) {
  beat.forEach((v, i) => {
    const label = performers[i];
    const row = Math.floor((v - 1) / 3);
    const col = (v - 1) % 3;
    label.style.left = `${col * colWidth}px`;
    label.style.top = `${row * rowWidth + rowWidth / 2}px`;
  });
}

/*
 * Controls
 */

function startPlaying() {
  draw();
  intervalTimer = intervalTimer || setInterval(() => {
    draw();
    curBeatIndex = (curBeatIndex + 1) % beats.length;
  }, 1000);
}

function stopPlaying() {
  clearInterval(intervalTimer);
  intervalTimer = null;
}

function nextBeat() {
  curBeatIndex = (curBeatIndex + 1) % beats.length;
  draw();
  stopPlaying();
}

function previousBeat() {
  curBeatIndex = (curBeatIndex - 1 + beats.length) % beats.length;
  draw();
  stopPlaying();
}

function rewind() {
  curBeatIndex = 0;
  draw();
}

/*
 * Utilities
*/

// Decode a CSV. This does not handle quoted fields.
function decodeCsv(text) {
  const lines = text.split(/\r?\n/);
  return lines.map((s) => s.split(","));
}
