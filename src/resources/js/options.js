const saveOptions = () => {
  let domain = document.getElementById('domain').value
  let browserAction = document.getElementById('browser-action').value
  chrome.storage.sync.set({ domain: domain, browserAction: browserAction })
}

const restoreOptions = () => {
  chrome.storage.sync.get(['domain', 'browserAction'], function (data) {
    document.getElementById('domain').value = data.domain;
    document.getElementById('browser-action').value = data.browserAction;
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('save').addEventListener('click', saveOptions)
