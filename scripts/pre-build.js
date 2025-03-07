import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appVuePath = join(__dirname, '../src/App.vue')
const randomNumber = Math.floor(100 + Math.random() * 900)
console.log(`randomNumber: ${randomNumber}`)

let content = readFileSync(appVuePath, 'utf8')
content = content.replace(/const randomNumber = \d+ \/\/ This will be replaced during build/, `const randomNumber = ${randomNumber}`)
writeFileSync(appVuePath, content)
