#!/usr/bin/env node
const fs = require('fs');
const colorizeStream = require('./index');
const { ESCAPE_CODES } = require('./codes');

function usage() {
  console.log('Usage: ascii2color <ascii_art_file> <color_definition_file>');
  console.log('Colors:');
  for (let [code, escSeq] of Object.entries(ESCAPE_CODES)) {
    console.log(`  ${code}: ${escSeq}abcde${ESCAPE_CODES.Z}`);
  }
}

let args = process.argv.slice(2);

if (['-h', '--help', '--codes'].includes(args[0])) {
  usage();
  process.exit(0);
}

if (args.length !== 2) {
  usage();
  process.exit(1);
}

let [asciiFilename, colorFilename] = args;
let asciiStream = fs.createReadStream(asciiFilename, 'utf8');
let colorStream = fs.createReadStream(colorFilename, 'utf8');

colorizeStream(asciiStream, colorStream).pipe(process.stdout);
