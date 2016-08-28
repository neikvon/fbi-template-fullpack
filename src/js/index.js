import '../css/index.css'
import ajax from './mods/ajax'
import sub from './mods/sub'

async function getJson() {
  try {
    const ret = await ajax('/lib/test-data.json')
    console.log(ret)
  } catch (e) {
    console.log(e)
  }
}
getJson()
console.log('app init 1111')
console.log(`sub: ${sub(2, 559)}`)

// for hot reload
if (module.hot) {
  module.hot.accept()
}