import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { ProxyAgent } from "undici";
import { HttpsProxyAgent } from "https-proxy-agent";
import { PacProxyAgent } from "pac-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
//#region lib/utils/proxy/unify-proxy.ts
const defaultProtocol = "http";
const possibleProtocol$1 = [
	"http",
	"https",
	"socks",
	"socks4",
	"socks4a",
	"socks5",
	"socks5h"
];
const unifyProxy = (proxyUri, proxyObj) => {
	proxyObj ||= {};
	const [oriProxyUri, oriProxyObj] = [proxyUri, proxyObj];
	proxyObj = { ...proxyObj };
	let proxyUrlHandler = null;
	if (proxyUri && typeof proxyUri === "string") {
		if (!proxyUri.includes("://")) {
			logger.warn(`PROXY_URI contains no protocol, assuming ${defaultProtocol}`);
			proxyUri = `${defaultProtocol}://${proxyUri}`;
		}
		try {
			proxyUrlHandler = new URL(proxyUri);
		} catch (error) {
			logger.error(`Parse PROXY_URI error: ${error.stack}`);
		}
	}
	if (proxyObj.protocol || proxyObj.host || proxyObj.port) if (proxyUrlHandler) logger.warn("PROXY_URI is set, ignoring PROXY_{PROTOCOL,HOST,PORT}");
	else if (proxyObj.host) {
		let tempProxyStr = proxyObj.host;
		if (tempProxyStr.includes("://")) logger.warn("PROXY_HOST contains protocol, ignoring PROXY_PROTOCOL");
		else if (proxyObj.protocol) tempProxyStr = `${proxyObj.protocol}://${tempProxyStr}`;
		else {
			logger.warn(`PROXY_PROTOCOL is not set, assuming '${defaultProtocol}'`);
			tempProxyStr = `${defaultProtocol}://${tempProxyStr}`;
		}
		try {
			proxyUrlHandler = new URL(tempProxyStr);
			if (proxyUrlHandler.port && proxyObj.port) logger.warn("PROXY_HOST contains port, ignoring PROXY_PORT");
			else if (proxyObj.port) if (Number.parseInt(proxyObj.port)) proxyUrlHandler.port = proxyObj.port;
			else logger.warn("PROXY_PORT is not a number, ignoring");
			else logger.warn("PROXY_PORT is not set, leaving proxy agent to determine");
		} catch (error) {
			logger.error(`Parse PROXY_HOST error: ${error.stack}`);
		}
	} else logger.warn("Either PROXY_{PROTOCOL,PORT} is set, but PROXY_HOST is missing, ignoring");
	if (proxyObj.auth && proxyUrlHandler) {
		let promptProxyUri = false;
		if (proxyUrlHandler.username || proxyUrlHandler.password) {
			logger.warn("PROXY_URI contains username and/or password, ignoring PROXY_AUTH");
			proxyObj.auth = void 0;
		} else if (["http:", "https:"].includes(proxyUrlHandler.protocol)) {
			logger.info("PROXY_AUTH is set and will be used for requests from Node.js. However, requests from Playwright will not use it");
			promptProxyUri = true;
		} else {
			logger.warn(`PROXY_AUTH is only supported by HTTP(S) proxies, but got ${proxyUrlHandler.protocol}, ignoring`);
			proxyObj.auth = void 0;
			promptProxyUri = true;
		}
		if (promptProxyUri) logger.info("To get rid of this, set PROXY_URI like protocol://username:password@host:port and clear PROXY_{AUTH,PROTOCOL,HOST,PORT}");
	}
	let isProxyValid = false;
	if (proxyUrlHandler) {
		const protocol = proxyUrlHandler.protocol.replace(":", "");
		if (possibleProtocol$1.includes(protocol)) {
			if (protocol !== "http" && (proxyUrlHandler.username || proxyUrlHandler.password)) {
				logger.warn("PROXY_URI is an HTTPS/SOCKS proxy with authentication, which is not supported by Playwright (ignore if you don't need it)");
				logger.info("To get rid of this, consider using an HTTP proxy instead");
			}
			proxyObj.protocol = protocol;
			proxyObj.host = proxyUrlHandler.hostname;
			proxyObj.port = proxyUrlHandler.port || void 0;
			proxyUri = proxyUrlHandler.href.endsWith("/") ? proxyUrlHandler.href.slice(0, -1) : proxyUrlHandler.href;
			isProxyValid = true;
		} else logger.error(`Unsupported proxy protocol: ${protocol}, expect one of ${possibleProtocol$1.join(", ")}`);
	}
	if (!isProxyValid) {
		if (oriProxyUri && typeof oriProxyUri === "string" || oriProxyObj.protocol || oriProxyObj.host || oriProxyObj.port || oriProxyObj.auth) logger.error("Proxy is disabled due to misconfiguration");
		proxyObj.protocol = proxyObj.host = proxyObj.port = proxyObj.auth = void 0;
		proxyUri = void 0;
		proxyUrlHandler = null;
	}
	return {
		proxyUri,
		proxyObj,
		proxyUrlHandler
	};
};
//#endregion
//#region lib/utils/proxy/multi-proxy.ts
const createMultiProxy = (proxyUris, proxyObj) => {
	const proxies = [];
	let currentProxyIndex = 0;
	for (const uri of proxyUris) {
		const unifiedProxy = unifyProxy(uri, proxyObj);
		if (unifiedProxy.proxyUri) proxies.push({
			uri: unifiedProxy.proxyUri,
			isActive: true,
			failureCount: 0,
			urlHandler: unifiedProxy.proxyUrlHandler
		});
	}
	if (proxies.length === 0) {
		logger.warn("No valid proxies found in the provided list");
		return {
			allProxies: [],
			proxyObj: proxyObj || {},
			getNextProxy: () => null,
			markProxyFailed: () => {},
			resetProxy: () => {}
		};
	}
	const healthCheckInterval = proxyObj?.healthCheckInterval || 6e4;
	const maxFailures = 3;
	const healthCheck = () => {
		const now = Date.now();
		for (const proxy of proxies) {
			if (!(!proxy.isActive && proxy.lastFailureTime && now - proxy.lastFailureTime > healthCheckInterval)) continue;
			proxy.isActive = true;
			proxy.failureCount = 0;
			delete proxy.lastFailureTime;
			logger.info(`Proxy ${proxy.uri} marked as active again after health check`);
		}
	};
	setInterval(healthCheck, healthCheckInterval);
	const getNextProxy = () => {
		const activeProxies = proxies.filter((p) => p.isActive);
		if (activeProxies.length === 0) {
			logger.warn("No active proxies available");
			return null;
		}
		let nextProxy = activeProxies[currentProxyIndex % activeProxies.length];
		let attempts = 0;
		while (!nextProxy.isActive && attempts < activeProxies.length) {
			currentProxyIndex = (currentProxyIndex + 1) % activeProxies.length;
			nextProxy = activeProxies[currentProxyIndex];
			attempts++;
		}
		if (!nextProxy.isActive) return null;
		return nextProxy;
	};
	const markProxyFailed = (proxyUri) => {
		const proxy = proxies.find((p) => p.uri === proxyUri);
		if (proxy) {
			proxy.failureCount++;
			proxy.lastFailureTime = Date.now();
			if (proxy.failureCount >= maxFailures) {
				proxy.isActive = false;
				logger.warn(`Proxy ${proxyUri} marked as inactive after ${maxFailures} failures`);
			} else logger.warn(`Proxy ${proxyUri} failed (${proxy.failureCount}/${maxFailures})`);
			const activeProxies = proxies.filter((p) => p.isActive);
			if (activeProxies.length > 0) {
				currentProxyIndex = (currentProxyIndex + 1) % activeProxies.length;
				const nextProxy = getNextProxy();
				if (nextProxy) logger.info(`Switching to proxy: ${nextProxy.uri}`);
			}
		}
	};
	const resetProxy = (proxyUri) => {
		const proxy = proxies.find((p) => p.uri === proxyUri);
		if (proxy) {
			proxy.isActive = true;
			proxy.failureCount = 0;
			delete proxy.lastFailureTime;
			logger.info(`Proxy ${proxyUri} manually reset`);
		}
	};
	const currentProxy = getNextProxy();
	if (currentProxy) logger.info(`Initial proxy selected: ${currentProxy.uri}`);
	return {
		currentProxy,
		allProxies: proxies,
		proxyObj: proxyObj || {},
		getNextProxy,
		markProxyFailed,
		resetProxy
	};
};
//#endregion
//#region lib/utils/proxy/pac-proxy.ts
const possibleProtocol = [
	"http",
	"https",
	"ftp",
	"file",
	"data"
];
const pacProxy = (pacUri, pacScript, proxyObj) => {
	let pacUrlHandler = null;
	if (pacScript) if (typeof pacScript === "string") pacUri = "data:text/javascript;charset=utf-8," + encodeURIComponent(pacScript);
	else logger.error("Invalid PAC_SCRIPT, use PAC_URI instead");
	if (pacUri && typeof pacUri === "string") try {
		pacUrlHandler = new URL(pacUri);
	} catch (error) {
		pacUri = void 0;
		pacUrlHandler = null;
		logger.error(`Parse PAC_URI error: ${error.stack}`);
	}
	else pacUri = void 0;
	if (pacUri && (!pacUrlHandler?.protocol || !possibleProtocol.includes(pacUrlHandler.protocol.replace(":", "")))) {
		logger.error(`Unsupported PAC protocol: ${pacUrlHandler?.protocol?.replace(":", "")}, expect one of ${possibleProtocol.join(", ")}`);
		pacUri = void 0;
		pacUrlHandler = null;
	}
	if (pacUrlHandler) {
		proxyObj.host = pacUrlHandler.hostname;
		proxyObj.port = pacUrlHandler.port;
		proxyObj.protocol = pacUrlHandler.protocol.replace(":", "");
	} else proxyObj.protocol = proxyObj.host = proxyObj.port = proxyObj.auth = void 0;
	if (proxyObj.auth && pacUrlHandler) {
		let promptProxyUri = false;
		if (pacUrlHandler.username || pacUrlHandler.password) {
			logger.warn("PAC_URI contains username and/or password, ignoring PROXY_AUTH");
			proxyObj.auth = void 0;
		} else if (["http:", "https:"].includes(pacUrlHandler.protocol)) {
			logger.info("PROXY_AUTH is set and will be used for requests from Node.js. However, requests from Playwright will not use it");
			promptProxyUri = true;
		} else {
			logger.warn(`PROXY_AUTH is only supported by HTTP(S) proxies, but got ${pacUrlHandler.protocol}, ignoring`);
			proxyObj.auth = void 0;
			promptProxyUri = true;
		}
		if (promptProxyUri) logger.info("To get rid of this, set PAC_URI like protocol://username:password@host:port and clear PROXY_{AUTH,PROTOCOL,HOST,PORT}");
	}
	return {
		proxyUri: pacUri,
		proxyObj,
		proxyUrlHandler: pacUrlHandler
	};
};
//#endregion
//#region lib/utils/proxy/index.ts
const proxyIsPAC = config.pacUri || config.pacScript;
let proxyUri;
let proxyObj = {};
let proxyUrlHandler = null;
let multiProxy;
const createAgentForProxy = (uri, proxyObj) => {
	if (uri.startsWith("http")) return new HttpsProxyAgent(uri, { headers: { "proxy-authorization": proxyObj?.auth ? `Basic ${proxyObj.auth}` : void 0 } });
	if (uri.startsWith("socks")) return new SocksProxyAgent(uri);
	return null;
};
const createDispatcherForProxy = (uri, proxyObj) => {
	if (uri.startsWith("http")) return new ProxyAgent({
		uri,
		token: proxyObj?.auth ? `Basic ${proxyObj.auth}` : void 0,
		requestTls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0" }
	});
	return null;
};
if (proxyIsPAC) {
	const proxy = pacProxy(config.pacUri, config.pacScript, config.proxy);
	proxyUri = proxy.proxyUri;
	proxyObj = proxy.proxyObj;
	proxyUrlHandler = proxy.proxyUrlHandler;
} else if (config.proxyUris && config.proxyUris.length > 0) {
	multiProxy = createMultiProxy(config.proxyUris, config.proxy);
	proxyObj = multiProxy.proxyObj;
	const currentProxy = multiProxy.getNextProxy();
	if (currentProxy) {
		proxyUri = currentProxy.uri;
		proxyUrlHandler = currentProxy.urlHandler;
	}
	logger.info(`Multi-proxy initialized with ${config.proxyUris.length} proxies`);
} else {
	const proxy = unifyProxy(config.proxyUri, config.proxy);
	proxyUri = proxy.proxyUri;
	proxyObj = proxy.proxyObj;
	proxyUrlHandler = proxy.proxyUrlHandler;
}
let agent = null;
let dispatcher = null;
if (proxyIsPAC && proxyUri) agent = new PacProxyAgent(`pac+${proxyUri}`);
else if (proxyUri) {
	agent = createAgentForProxy(proxyUri, proxyObj);
	dispatcher = createDispatcherForProxy(proxyUri, proxyObj);
}
const getCurrentProxy = () => {
	if (multiProxy) return multiProxy.getNextProxy();
	if (proxyUri) return {
		uri: proxyUri,
		isActive: true,
		failureCount: 0,
		urlHandler: proxyUrlHandler
	};
	return null;
};
const markProxyFailed = (failedProxyUri) => {
	if (!multiProxy) return;
	multiProxy.markProxyFailed(failedProxyUri);
	const nextProxy = multiProxy.getNextProxy();
	if (nextProxy) {
		proxyUri = nextProxy.uri;
		proxyUrlHandler = nextProxy.urlHandler || null;
		agent = createAgentForProxy(nextProxy.uri, proxyObj);
		dispatcher = createDispatcherForProxy(nextProxy.uri, proxyObj);
		logger.info(`Switched to proxy: ${nextProxy.uri}`);
	} else {
		logger.warn("No available proxies remaining");
		agent = null;
		dispatcher = null;
		proxyUri = void 0;
	}
};
const getAgentForProxy = (proxyState) => createAgentForProxy(proxyState.uri, proxyObj);
const getDispatcherForProxy = (proxyState) => createDispatcherForProxy(proxyState.uri, proxyObj);
const proxyExport = {
	agent,
	dispatcher,
	proxyUri,
	proxyObj,
	proxyUrlHandler,
	multiProxy,
	getCurrentProxy,
	markProxyFailed,
	getAgentForProxy,
	getDispatcherForProxy
};
//#endregion
export { proxyExport as t };
