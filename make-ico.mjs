import { chromium } from 'playwright'
import { writeFileSync, readFileSync } from 'fs'

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#352e24"/><stop offset="1" stop-color="#191613"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.34" r="0.62">
      <stop offset="0" stop-color="#e6b265" stop-opacity="0.42"/>
      <stop offset="1" stop-color="#e6b265" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="moon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9bd72"/><stop offset="1" stop-color="#cf9743"/>
    </linearGradient>
    <mask id="crescent">
      <rect width="1024" height="1024" fill="black"/>
      <circle cx="498" cy="470" r="252" fill="white"/>
      <circle cx="606" cy="412" r="226" fill="black"/>
    </mask>
  </defs>
  <rect width="1024" height="1024" rx="232" fill="url(#bg)"/>
  <rect width="1024" height="1024" rx="232" fill="url(#glow)"/>
  <rect width="1024" height="1024" fill="url(#moon)" mask="url(#crescent)"/>
  <circle cx="726" cy="300" r="13" fill="#e9bd72" opacity="0.9"/>
  <circle cx="792" cy="372" r="8" fill="#e9bd72" opacity="0.7"/>
  <rect x="360" y="742" width="304" height="20" rx="10" fill="#e9bd72" opacity="0.85"/>
  <rect x="404" y="788" width="216" height="16" rx="8" fill="#e9bd72" opacity="0.45"/>
</svg>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 256, height: 256 } })
await page.setContent(`<!doctype html><html><body style="margin:0">${svg(256)}</body></html>`)
await page.waitForTimeout(150)
await page.screenshot({ path: 'build/icon-256.png', omitBackground: true, clip: { x: 0, y: 0, width: 256, height: 256 } })
await browser.close()

// Construit un .ico contenant le PNG 256x256 (ICO « PNG-compressed », OK Windows Vista+)
const png = readFileSync('build/icon-256.png')
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type = icon
header.writeUInt16LE(1, 4) // 1 image
const entry = Buffer.alloc(16)
entry.writeUInt8(0, 0) // width 0 = 256
entry.writeUInt8(0, 1) // height 0 = 256
entry.writeUInt8(0, 2) // palette
entry.writeUInt8(0, 3) // reserved
entry.writeUInt16LE(1, 4) // planes
entry.writeUInt16LE(32, 6) // bpp
entry.writeUInt32LE(png.length, 8) // size
entry.writeUInt32LE(22, 12) // offset (6 + 16)
writeFileSync('build/icon.ico', Buffer.concat([header, entry, png]))
console.log('build/icon.ico written (' + png.length + ' bytes png)')
