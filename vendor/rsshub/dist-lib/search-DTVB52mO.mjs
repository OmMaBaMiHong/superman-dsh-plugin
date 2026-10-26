import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import crypto from "node:crypto";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/duozhuayu/search.tsx
const route = {
	path: "/search/:wd",
	categories: ["shopping"],
	example: "/duozhuayu/search/JavaScript",
	parameters: { wd: "搜索关键词" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["duozhuayu.com/search/book/:wd"] }],
	name: "搜索结果",
	maintainers: ["fengkx"],
	handler
};
const generateDeviceId = () => {
	const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
	let value = 0;
	let bits = 0;
	let id = "b";
	for (const byte of crypto.randomBytes(16)) {
		value = value << 8 | byte;
		bits += 8;
		while (bits >= 5) {
			bits -= 5;
			id += alphabet[value >> bits & 31];
		}
	}
	if (bits > 0) id += alphabet[value << 5 - bits & 31];
	return id;
};
async function handler(ctx) {
	const wd = ctx.req.param("wd");
	const baseUrl = "https://www.duozhuayu.com";
	const type = "book";
	const link = `${baseUrl}/search/${type}/${wd}`;
	const encrypt = (text) => {
		const cipher = crypto.createCipheriv("aes-128-cfb8", "DkOliWvFNR7C4WvR", "GQWKUE2CVGOOBKXU");
		return Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString("hex");
	};
	const getCustomRequestHeaders = () => {
		const timestamp = Date.now();
		const userId = 0;
		const securityKey = Math.floor(1e8 * Math.random());
		const token = encrypt([
			timestamp,
			userId,
			securityKey
		].join(":"));
		const requestId = [
			userId,
			timestamp,
			Math.round(1e5 * Math.random())
		].join("-");
		return {
			"x-api-version": "0.0.85",
			"x-app-platform": "na",
			"x-app-version": "na",
			"x-device-id": generateDeviceId(),
			"x-refer-request-id": requestId,
			"x-request-id": requestId,
			"x-request-misc": "{\"platform\":\"browser\",\"originSource\":\"search\",\"originFrom\":\"normal\",\"webVersion\":\"1.2.525412\"}",
			"x-request-token": token,
			"x-security-key": securityKey,
			"x-timestamp": timestamp,
			"x-user-id": userId
		};
	};
	const item = (await got_default({
		method: "get",
		url: `${baseUrl}/api/search/book`,
		searchParams: {
			type: "normal",
			q: wd
		},
		headers: getCustomRequestHeaders()
	})).data.data.filter((item) => item.type === type).map((entry) => entry[type]).map((item) => ({
		title: item.title,
		link: `${baseUrl}/books/${item.id}`,
		pubDate: parseDate(item.updated),
		description: renderToString(/* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsx("img", { src: item.images.origin }),
			/* @__PURE__ */ jsx("br", {}),
			"书名：",
			item.title,
			" ",
			item.originalTitle,
			/* @__PURE__ */ jsx("br", {}),
			item.subtitle ? /* @__PURE__ */ jsxs(Fragment, { children: [item.subtitle, /* @__PURE__ */ jsx("br", {})] }) : null,
			"作者：",
			item.rawAuthor,
			/* @__PURE__ */ jsx("br", {}),
			item.translators?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"译者：",
				item.translators.map((translator) => translator.name).join(" / "),
				/* @__PURE__ */ jsx("br", {})
			] }) : null,
			"ISBN：",
			item.isbn13,
			/* @__PURE__ */ jsx("br", {}),
			"出版社：",
			item.publisher,
			/* @__PURE__ */ jsx("br", {}),
			"出版时间：",
			item.publishDate,
			/* @__PURE__ */ jsx("br", {}),
			"豆瓣评分：",
			item.doubanRating,
			/* @__PURE__ */ jsx("br", {}),
			"价格：",
			(item.price / 100).toFixed(2),
			"元起 ",
			/* @__PURE__ */ jsxs("del", { children: [(item.originalPrice / 100).toFixed(2), "元"] })
		] }))
	}));
	return {
		title: `多抓鱼搜索-${wd}`,
		link,
		description: `多抓鱼搜索-${wd}`,
		item
	};
}
//#endregion
export { route };
