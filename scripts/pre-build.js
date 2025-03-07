const fs = require('fs')
const path = require('path')

const appVuePath = path.join(__dirname, '../src/App.vue')
const randomNumber = Math.floor(100 + Math.random() * 900)

let content = fs.readFileSync(appVuePath, 'utf8')
content = content.replace(/dev_0\.1\.3-\d{3}/, `dev_0.1.3-${randomNumber}`)
fs.writeFileSync(appVuePath, content)
