// Saves options to chrome.storage
const saveOptions = () => {
  let domain = document.getElementById('domain').value
  let browserAction = document.getElementById('browser-action').value
  chrome.storage.sync.set({ domain: domain, browserAction: browserAction })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(['domain', 'browserAction'], function (data) {
    document.getElementById('domain').value = data.domain;
    document.getElementById('browser-action').value = data.browserAction;
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('save').addEventListener('click', saveOptions)
