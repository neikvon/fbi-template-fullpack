import '../css/index.css'

import 'whatwg-fetch'

import sub from './mods/sub'

console.log('app init')

console.log(`sub: ${sub(2, 55)}`)

// https://github.com/github/fetch
fetch('/lib/test-data.json')
  .then(function (response) {
    return response.json()
  }).then(function (json) {
    console.log('parsed json2', json)
  }).catch(function (ex) {
    console.log('parsing failed', ex)
  })

if (module.hot) {
  module.hot.accept()
}
