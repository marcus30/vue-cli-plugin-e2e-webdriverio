const uuid = require('uuid')
const os = require('os')
const path = require('path')
const { chalk } = require('@vue/cli-shared-utils')

const isDebug = process.env.VUE_CLI_WDIO_DEBUG === '1'
const isInteractive = process.env.VUE_CLI_WDIO_INTERACTIVE === '1'
const isHeadless = !isInteractive

function isChrome() {
  const desiredCapabilities = browser.desiredCapabilities
  const matcher = /chrome/i

  return matcher.test(desiredCapabilities.browser) ||
    matcher.test(desiredCapabilities.browserName)
}

function calculateToolbarSize(dim = 'height', expectedInnerSize, actualInnerSize) {
  const expected = expectedInnerSize[dim]
  const actual = actualInnerSize[dim]

  return expected - actual
}

function resizeViewport(exact = false) {
  const { viewportSize } = browser.desiredCapabilities

  if (!viewportSize) return

  const { width, height } = viewportSize
  const actualViewportSize = browser.getViewportSize()
  const diff = calculateToolbarSize('height', viewportSize, actualViewportSize)

  if (diff === 0) return

  browser.windowHandleSize({ width, height: height + diff })
}

function screenshotPath() {
  const { screenshotPath } = browser.options

  return path.resolve(screenshotPath || os.tmpdir(), `${uuid.v4()}.png`)
}

function saveScreenshot(test) {
  const path = screenshotPath()
  const report = [`✖ ${test.parent} ${test.title}\n`, ` Screenshot: ${path}\n`]

  try {
    browser.saveScreenshot(path)

    if (test.err) report.splice(1, 0, ` Error: ${chalk.bold(test.err.message)}\n`)

    console.log(chalk.red(...report))
  } catch (err) {
    console.error(err.message)
  }
}

function printBrowserConsole() {
  const log = browser.log('browser')

  if (log.value && log.value.length) {
    log.value.forEach((e) => console.log(`[${e.level}] ${e.message}`))
  }
}

module.exports = {
  isDebug,
  isInteractive,
  isHeadless,
  resizeViewport,
  saveScreenshot,
  printBrowserConsole,
}