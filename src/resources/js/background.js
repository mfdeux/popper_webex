const DEFAULT_SCIHUB_DOMAIN = 'sci-hub.tw'
const DEFAULT_BROWSER_ACTION = 'newTab'

// Setup context menu actions
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({ domain: DEFAULT_SCIHUB_DOMAIN, browserAction: DEFAULT_BROWSER_ACTION })
  chrome.contextMenus.create({
    title: 'Open in new tab',
    id: 'newTab',
    contexts: ['page', 'link'],
  })
  chrome.contextMenus.create({
    title: 'Open in current tab',
    id: 'currentTab',
    contexts: ['page', 'link'],
  })
  chrome.contextMenus.create({
    title: 'Download PDF',
    id: 'downloadPDF',
    contexts: ['page', 'link'],
  })
})

// Setup browser button click action
chrome.browserAction.onClicked.addListener(async (tab) => {
  let browserActionPreference = await retrieveBrowserActionPreference()
  switch (browserActionPreference) {
    case 'currentTab':
      sciHubUrlToCurrentTab(tab, tab.url)
      break;
    case 'downloadPDF':
      await downloadSciHubPDF(tab.url)
      break;
    default:
      sciHubUrlToNewTab(tab.url)
  }
})

// Context menu listener
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (typeof info.linkUrl === 'undefined') {
    switch (info.menuItemId) {
      case 'currentTab':
        sciHubUrlToCurrentTab(tab, info.pageUrl)
        break;
      case 'downloadPDF':
        await downloadSciHubPDF(info.pageUrl)
        break;
      default:
        sciHubUrlToNewTab(info.pageUrl)
    }
  } else {
    switch (info.menuItemId) {
      case 'currentTab':
        sciHubUrlToCurrentTab(tab, info.linkUrl)
        break;
      case 'downloadPDF':
        await downloadSciHubPDF(info.linkUrl)
        break;
      default:
        sciHubUrlToNewTab(info.linkUrl)
    }
  }
})

/**
 * Retrieve SciHub domain from storage
 */
const retrieveSciHubDomain = async () => {
  let data = await chrome.storage.sync.get('domain')
  return data.domain
}

/**
 * Retrieve browser action from storage
 */
const retrieveBrowserActionPreference = async () => {
  let data = await chrome.storage.sync.get('browserAction')
  return data.browserAction
}

/**
 * Convert article/abstract URL into SciHub equivalent URL
 * @param {string} articleUrl
 * @param {string} sciHubDomain
 */
const makeSciHubUrl = async (articleUrl, sciHubDomain = null) => {
  if (sciHubDomain == null) {
    sciHubDomain = await retrieveSciHubDomain()
  }
  return `https://${sciHubDomain}/${articleUrl}`
}

/**
 * Open SciHub URL in new tab
 * @param {string} articleUrl
 */
const sciHubUrlToNewTab = async (articleUrl) => {
  let sciHubUrl = await makeSciHubUrl(articleUrl)
  chrome.tabs.create({ url: sciHubUrl })
}

/**
 * Open SciHub URL in current tab
 * @param {*} tab
 * @param {string} articleUrl
 */
const sciHubUrlToCurrentTab = async (tab, articleUrl) => {
  let sciHubUrl = await makeSciHubUrl(articleUrl)
  chrome.tabs.update(tab.id, { url: sciHubUrl })
}

/**
 * Test whether article URL is a valid SciHub article
 * @param {string} articleUrl
 */
const testSciHubUrl = async (articleUrl) => {
  let sciHubUrl = await makeSciHubUrl(articleUrl)
  try {
    let resp = await fetch(sciHubUrl)
    return resp.status < 300
  } catch (error) {
    return false
  }
}

/**
 * Parse html text into a DOM
 * @param {string} textResp
 */
const textToDOM = (textResp) => {
  const parser = new DOMParser()
  return parser.parseFromString(textResp, "text/html")
}

/**
 * Extract article PDF URL from SciHub
 * @param {string} articleUrl
 */
const extractSciHubPDFUrl = async (articleUrl) => {
  let sciHubUrl = await makeSciHubUrl(articleUrl)
  try {
    let resp = await fetch(sciHubUrl)
    let respText = await resp.text()
    let respDOM = textToDOM(respText)
    let pdfElem = respDOM.querySelector('#pdf')
    return pdfElem ? pdfElem.src : null
  } catch (error) {
    return null
  }
}

/**
 * Download article PDF from SciHub using browser downloads
 * @param {string} articleUrl
 */
const downloadSciHubPDF = async (articleUrl) => {
  let pdfUrl = await extractSciHubPDFUrl(articleUrl)
  chrome.downloads.download({
    url: pdfUrl
  })
}



