import '../css/index.css'

import sub from './mods/sub'

console.log('app init 11233')

console.log(`sub: ${sub(2, 55)}`)

if (module.hot) {
  module.hot.accept()
}