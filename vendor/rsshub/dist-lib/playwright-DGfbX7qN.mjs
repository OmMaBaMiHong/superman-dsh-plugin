import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as proxyExport } from "./proxy-Dm18LCRO.mjs";
import { chromium } from "patchright";
//#region lib/utils/playwright.ts
const proxyServerFromUrl = (proxyUrl) => {
	return `${proxyUrl.protocol.replace("socks5h:", "socks5:").replace("socks4a:", "socks4:")}//${proxyUrl.host}`;
};
const getProxyOptions = (currentProxy) => {
	if (!currentProxy) return {};
	const username = currentProxy.urlHandler?.username;
	const password = currentProxy.urlHandler?.password;
	if (username || password) {
		if (currentProxy.urlHandler.protocol !== "http:") {
			logger.warn("SOCKS/HTTPS proxy with authentication is not supported by playwright, continue without proxy");
			return {};
		}
		return { proxy: {
			password: decodeURIComponent(password ?? ""),
			server: proxyServerFromUrl(currentProxy.urlHandler),
			username: decodeURIComponent(username ?? "")
		} };
	}
	return { proxy: { server: currentProxy.uri.replace("socks5h://", "socks5://").replace("socks4a://", "socks4://").replace(/\/$/, "") } };
};
const COMMON_LAUNCH_ARGS = [
	"--no-sandbox",
	"--disable-setuid-sandbox",
	"--window-position=0,0",
	"--ignore-certificate-errors",
	"--ignore-certificate-errors-spki-list"
];
const getLaunchOptions = (currentProxy) => ({
	args: COMMON_LAUNCH_ARGS,
	executablePath: config.chromiumExecutablePath || void 0,
	headless: true,
	...getProxyOptions(currentProxy)
});
const toBrowserlessLaunchOptions = (currentProxy) => ({
	args: COMMON_LAUNCH_ARGS,
	headless: true,
	...getProxyOptions(currentProxy)
});
const toBrowserlessCDPLaunchOptions = (currentProxy) => {
	let proxyServerArgs = [];
	if (currentProxy) if (currentProxy.urlHandler?.username || currentProxy.urlHandler?.password) logger.warn("Proxy authentication is not supported over CDP (--proxy-server), continue without proxy");
	else proxyServerArgs = [`--proxy-server=${currentProxy.uri.replace("socks5h://", "socks5://").replace("socks4a://", "socks4://").replace(/\/$/, "")}`];
	return {
		args: [...COMMON_LAUNCH_ARGS, ...proxyServerArgs],
		headless: true,
		stealth: true
	};
};
const getContextOptions = () => ({
	ignoreHTTPSErrors: true,
	userAgent: config.ua
});
const launchBrowser = async (currentProxy) => {
	let browser;
	if (config.playwrightCDPEndpoint) browser = await chromium.connectOverCDP(getBrowserlessEndpoint(config.playwrightCDPEndpoint, toBrowserlessCDPLaunchOptions(currentProxy)));
	else if (config.playwrightWSEndpoint) browser = await chromium.connect(getBrowserlessEndpoint(config.playwrightWSEndpoint, toBrowserlessLaunchOptions(currentProxy)));
	else browser = await chromium.launch(getLaunchOptions(currentProxy));
	const context = await browser.newContext(getContextOptions());
	return {
		browser,
		context
	};
};
const getBrowserlessEndpoint = (endpoint, launchOptions) => {
	const endpointURL = new URL(endpoint);
	endpointURL.searchParams.set("launch", JSON.stringify(launchOptions));
	return endpointURL.href;
};
const scheduleClose = (browser, timeout = 3e4) => {
	setTimeout(() => {
		browser.close();
	}, timeout);
};
/**
* @returns Playwright browser context (native `newPage()` shares state across calls)
*/
async function outPlaywright() {
	const currentProxy = proxyExport.getCurrentProxy();
	const { browser, context } = await launchBrowser(currentProxy && proxyExport.proxyObj.url_regex === ".*" ? currentProxy : null);
	scheduleClose(browser);
	return context;
}
/**
* @returns Playwright page
*/
const getPlaywrightPage = async (url, instanceOptions = {}) => {
	let allowProxy = false;
	const proxyRegex = new RegExp(proxyExport.proxyObj.url_regex);
	let urlHandler;
	try {
		urlHandler = new URL(url);
	} catch {}
	if (proxyRegex.test(url) && url.startsWith("http") && !(urlHandler && urlHandler.host === proxyExport.proxyUrlHandler?.host)) allowProxy = true;
	const currentProxy = proxyExport.getCurrentProxy();
	const currentProxyState = currentProxy && allowProxy ? currentProxy : null;
	const hasProxy = Boolean(getProxyOptions(currentProxyState).proxy);
	const { browser, context } = await launchBrowser(currentProxyState);
	scheduleClose(browser, instanceOptions.closeTimeout);
	const page = await context.newPage();
	if (hasProxy && currentProxyState) logger.debug(`Proxying request in playwright via ${currentProxyState.uri}: ${url}`);
	if (instanceOptions.onBeforeLoad) await instanceOptions.onBeforeLoad(page, context);
	if (!instanceOptions.noGoto) try {
		await page.goto(url, instanceOptions.gotoConfig || { waitUntil: "domcontentloaded" });
	} catch (error) {
		if (hasProxy && currentProxyState && proxyExport.multiProxy) {
			logger.warn(`Playwright navigation failed with proxy ${currentProxyState.uri}, marking as failed: ${error}`);
			proxyExport.markProxyFailed(currentProxyState.uri);
			throw error;
		}
		throw error;
	}
	return {
		context,
		destroy: async () => {
			await context.close();
		},
		page
	};
};
//#endregion
export { outPlaywright as n, getPlaywrightPage as t };
