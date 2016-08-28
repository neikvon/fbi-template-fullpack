export default (url, method, headers, body) => {
  return fetch(url, {
    method: method || 'GET',
    headers: headers || {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: method === 'GET' ? null : body
  }).then(res => res.json())
}