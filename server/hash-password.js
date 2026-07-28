#!/usr/bin/env node
/** Usage: node server/hash-password.js 'your-password' */
const bcrypt = require("bcryptjs");
const pwd = process.argv[2];
if (!pwd) {
  console.error("Usage: node server/hash-password.js 'your-password'");
  process.exit(1);
}
console.log(bcrypt.hashSync(pwd, 12));
