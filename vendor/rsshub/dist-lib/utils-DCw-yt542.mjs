import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import tls from "node:tls";
import ipRegex from "ip-regex";
//#region lib/routes/pixiv/constants.ts
const maskHeader = {
	"App-OS": "ios",
	"App-OS-Version": "10.3.1",
	"App-Version": "6.7.1",
	"User-Agent": "PixivIOSApp/6.7.1 (iOS 10.3.1; iPhone8,1)"
};
//#endregion
//#region lib/routes/pixiv/pixiv-got.ts
async function dohResolve(name, jsonDohEndpoint) {
	try {
		const response = await got_default(jsonDohEndpoint, {
			searchParams: {
				name,
				type: "A"
			},
			headers: { accept: "application/dns-json" }
		});
		if (response.data.Status === 0) return response.data.Answer.map((item) => item.data);
		logger.error(`Error ${response.data.Status} when querying DoH endpoint ${jsonDohEndpoint}`);
	} catch (error) {
		logger.error(`Failed to resolve ${name}`);
		logger.debug(error);
	}
	return [];
}
const pixivGot = got_default.extend({ hooks: { beforeRequest: [async (options) => {
	if (!config.pixiv.bypassCdn) return;
	let hostname = null;
	if (ipRegex({ exact: true }).test(config.pixiv.bypassCdnHostname)) hostname = config.pixiv.bypassCdnHostname;
	else {
		const addresses = await dohResolve(config.pixiv.bypassCdnHostname, config.pixiv.bypassCdnDoh);
		if (addresses.length) hostname = addresses[Math.floor(addresses.length * Math.random())];
		else logger.warn(`No IPv4 address resolved from ${config.pixiv.bypassCdnHostname}`);
	}
	if (hostname) {
		const actualHost = options.url.host;
		options.headers = {
			...options.headers,
			host: actualHost
		};
		options.url.hostname = hostname;
		options.checkServerIdentity = function(host, certificate) {
			return tls.checkServerIdentity(actualHost, certificate);
		};
	}
}] } });
//#endregion
//#region lib/routes/pixiv/token.ts
let token = null;
const authorizationInfo = {
	client_id: "MOBrBDS8blbauoSck0ZfDbtuzpyT",
	client_secret: "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj",
	hash_secret: "28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c"
};
const refreshToken = () => cache_default.tryGet("pixiv:accessToken", () => pixivGot.post("https://oauth.secure.pixiv.net/auth/token", {
	form: {
		...authorizationInfo,
		get_secure_url: 1,
		grant_type: "refresh_token",
		refresh_token: config.pixiv.refreshToken
	},
	headers: { ...maskHeader }
}), 3600, false);
async function getToken() {
	const { data } = await refreshToken();
	if (data && data.access_token) {
		logger.debug("Pixiv refresh token success.");
		token = data.access_token;
	}
	return token;
}
//#endregion
//#region lib/routes/pixiv/utils.ts
var utils_default = {
	getImgs(illust) {
		const images = [];
		if (illust.meta_pages?.length) for (const page of illust.meta_pages) {
			const original = page.image_urls.original.replace("https://i.pximg.net", () => config.pixiv.imgProxy);
			images.push(`<p><img src="${original}" width="${page.width}" height="${page.height}" /></p>`);
		}
		else if (illust.meta_single_page.original_image_url) {
			const original = illust.meta_single_page.original_image_url.replace("https://i.pximg.net", () => config.pixiv.imgProxy);
			images.push(`<p><img src="${original}" width="${illust.width}" height="${illust.height}" /></p>`);
		}
		return images;
	},
	getProxiedImageUrl: (originalUrl) => originalUrl.replace("https://i.pximg.net", () => config.pixiv.imgProxy || "")
};
//#endregion
export { maskHeader as i, getToken as n, pixivGot as r, utils_default as t };
