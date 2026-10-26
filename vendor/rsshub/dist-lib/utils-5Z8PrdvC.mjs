import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { load } from "cheerio";
//#region lib/routes/pianyuan/utils.ts
const security_key = "pianyuan-security_session_verify";
const PHPSESSID_key = "pianyuan-PHPSESSID";
const loginauth_key = "pianyuan-py_loginauth";
const ProcessFeed = async (list, cache) => {
	const link_base = "https://pianyuan.org";
	return await Promise.all(list.map(async (e) => {
		const link = new URL(e, link_base).href;
		return await cache.tryGet(link, async () => {
			const content = load((await request(link, cache)).data);
			const magnet = content(".btn-primary").attr("href");
			const torrent_name = content("body > div.jumbotron.masthead > div > div > div.col-sm-10.col-md-10.col-lg-10.text-left > h1").text();
			const name = content("body > div.jumbotron.masthead > div > div > div.col-sm-10.col-md-10.col-lg-10.text-left > h2 > a").text();
			const size = content("#main-container > div > div.col-sm-10.col-md-8.col-lg-8 > div > ul > li:nth-child(2)").text();
			let length;
			if (size.includes("MB")) length = size.replace("MB", "") * 1024;
			else if (size.includes("GB")) length = size.replace("GB", "") * 1024 * 1024;
			return {
				title: `${torrent_name} [${name}] [${size}]`,
				size: length,
				enclosure_url: magnet,
				enclosure_type: "application/x-bittorrent",
				enclosure_length: length
			};
		});
	}));
};
async function getCookie(cache) {
	const security_session_verify = await cache.get(security_key);
	const PHPSESSID = await cache.get(PHPSESSID_key);
	let py_loginauth = await cache.get(loginauth_key);
	if (!py_loginauth) {
		if (!config.pianyuan || !config.pianyuan.cookie) throw new ConfigNotFoundError("pianyuan is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
		py_loginauth = config.pianyuan.cookie;
	}
	return `${py_loginauth};${security_session_verify};${PHPSESSID};`;
}
async function request(link, cache) {
	const response = await got_default({
		method: "get",
		url: link,
		headers: { Cookie: await getCookie(cache) }
	});
	const set_cookie = response.headers["set-cookie"];
	if (set_cookie) {
		for (const e of set_cookie) if (e.includes("security_session_verify")) cache.set(security_key, e.split(";", 1)[0]);
		else if (e.includes("PHPSESSID")) cache.set(PHPSESSID_key, e.split(";", 1)[0]);
		else if (e.includes("py_loginauth")) cache.set(loginauth_key, e.split(";", 1)[0]);
	}
	if (response.data.includes("会员登录后才能访问")) throw new ConfigNotFoundError("pianyuan Cookie已失效");
	return response;
}
var utils_default = {
	ProcessFeed,
	request
};
//#endregion
export { utils_default as t };
