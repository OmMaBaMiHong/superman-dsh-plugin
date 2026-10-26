import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import crypto from "node:crypto";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import cityTimezones from "city-timezones";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
//#region lib/routes/japanpost/utils.ts
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
const utils = {
	even: (collection) => collection.filter((index) => index % 2 === 0),
	odd: (collection) => collection.filter((index) => index % 2 === 1),
	generateGuid: (t) => {
		const hash = crypto.createHash("sha512");
		hash.update(t);
		return hash.digest("hex").toUpperCase();
	},
	parseDatetime: (t, o, r, tz, l) => {
		const formatJaDate = "YYYY/MM/DD";
		const formatJaDateTime = "YYYY/MM/DD HH:mm";
		const formatEnDate = "MM/DD/YYYY";
		const formatEnDateTime = "MM/DD/YYYY HH:mm";
		let customFormat;
		switch (l) {
			case "ja":
				customFormat = dayjs(t, formatJaDate, true).isValid() ? formatJaDate : dayjs(t, formatJaDateTime, true).isValid() ? formatJaDateTime : void 0;
				break;
			case "en":
				customFormat = dayjs(t, formatEnDate, true).isValid() ? formatEnDate : dayjs(t, formatEnDateTime, true).isValid() ? formatEnDateTime : void 0;
				break;
			default:
		}
		if (o) {
			const packageInJPKeywords = [["郵便局"], [
				"都",
				"道",
				"府",
				"県"
			]];
			if (packageInJPKeywords[0].some((i) => o.includes(i)) || packageInJPKeywords[1].some((i) => r.includes(i))) tz = "Asia/Tokyo";
			else {
				const oS = o.replace(" EMS", "").replace(" INT", "");
				try {
					try {
						tz = cityTimezones.lookupViaCity(oS)[0].timezone;
					} catch {
						tz = cityTimezones.lookupViaCity(r)[0].timezone;
					}
				} catch {}
			}
		}
		return customFormat ? [dayjs.tz(t, customFormat, tz).valueOf(), tz] : [new Date(t).getTime(), tz];
	}
};
//#endregion
//#region lib/routes/japanpost/track.tsx
let baseTitle = "日本郵便";
const baseUrl = "https://trackings.post.japanpost.jp/services/srv/search/direct?";
async function track(ctx) {
	const reqCode = ctx.req.param("reqCode");
	const reqReqCode = "reqCodeNo1=" + reqCode;
	let locale = "ja";
	if (ctx.req.param("locale") === "en") {
		locale = "en";
		baseTitle = "Japanpost";
	}
	const reqLocale = "&locale=" + locale;
	const link = baseUrl + reqReqCode + reqLocale;
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $(".tableType01").eq(1).find("tr").slice(2);
	const officeList = $(".tableType03").eq(0).find("tr").slice(1);
	let officeItemList;
	if (officeList.length) officeItemList = officeList.toArray().map((e) => {
		const eTd = $(e).find("td");
		return {
			officeType: eTd.eq(0).text().trim(),
			officeName: eTd.eq(1).html().trim(),
			officeTel: eTd.eq(2).html().trim()
		};
	});
	if (!list.length) {
		const resErrorText = $(".tableType01").eq(0).find("tr").eq(2).find("td").eq(1).text().trim();
		throw new Error(resErrorText);
	}
	const listEven = utils.even(list);
	const listOdd = utils.odd(list);
	const packageType = $(".tableType01").eq(0).find("tr").eq(1).find("td").eq(1).text().trim();
	const packageService = $(".tableType01").eq(0).find("tr").eq(1).find("td").eq(2).text().trim();
	const serviceText = locale === "ja" ? "付加サービス：" : "Additional services: ";
	let lastItemTimestamp;
	let tz;
	return {
		title: `${baseTitle} ${reqCode} ${packageType}`,
		link,
		description: `${baseTitle} ${reqCode} ${packageType}`,
		language: locale,
		icon: "https://www.post.japanpost.jp/favicon.ico",
		logo: "https://www.post.japanpost.jp/favicon.ico",
		item: listEven.toArray().map((item, index) => {
			const itemTd = $(item).find("td");
			const packageStatus = itemTd.eq(1).text().trim();
			const packageRegion = itemTd.eq(4).text().trim();
			const packageOffice = itemTd.eq(3).text().trim();
			const packageOfficeZipCode = listOdd.eq(index).find("td").eq(0).text().trim();
			const itemTitle = `${packageStatus} ${packageOffice} ${packageRegion}`;
			const packageTrackRecord = itemTd.eq(2).text().trim();
			const itemDescription = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				packageStatus,
				/* @__PURE__ */ jsx("br", {}),
				packageTrackRecord ? /* @__PURE__ */ jsxs(Fragment, { children: [packageTrackRecord, /* @__PURE__ */ jsx("br", {})] }) : null,
				packageOfficeZipCode ? `${packageOfficeZipCode} ` : "",
				packageOffice ? `${packageOffice} ` : "",
				packageRegion,
				index === 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [officeItemList?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), officeItemList.map((officeItem) => /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("br", {}),
					officeItem.officeType,
					" ",
					raw(officeItem.officeName),
					" ",
					officeItem.officeTel
				] }))] }) : null, packageService ? /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("br", {}),
					serviceText,
					packageService
				] }) : null] }) : null
			] }));
			const itemPubDateText = itemTd.eq(0).text().trim();
			const itemGuid = utils.generateGuid(reqCode + itemTitle + itemDescription + itemPubDateText);
			let thisItemTimestamp;
			[thisItemTimestamp, tz] = utils.parseDatetime(itemPubDateText, packageOffice, packageRegion, tz, locale);
			if (lastItemTimestamp && thisItemTimestamp <= lastItemTimestamp) thisItemTimestamp = lastItemTimestamp + 1e3;
			lastItemTimestamp = thisItemTimestamp;
			return {
				title: itemTitle,
				description: itemDescription,
				pubDate: new Date(thisItemTimestamp),
				link,
				guid: itemGuid.slice(0, 32)
			};
		})
	};
}
//#endregion
//#region lib/routes/japanpost/router.ts
const route = {
	name: "Track & Trace Service",
	path: "/track/:reqCode/:locale?",
	example: "/japanpost/track/EJ123456789JP/en",
	url: "trackings.post.japanpost.jp/services/srv/search/",
	handler: track,
	categories: ["other"],
	maintainers: ["tuzi3040"],
	parameters: {
		reqCode: "Package Number",
		locale: "Language, default to japanese `ja`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	description: `| Japanese | English |
| -------- | ------- |
| ja       | en      |`,
	zh: {
		name: "邮件追踪查询",
		description: `| 日语 | 英语 |
| ---- | ---- |
| ja   | en   |`
	},
	ja: {
		name: "郵便追跡サービス",
		description: `| 日本語 | 英語 |
| ------ | ---- |
| ja     | en   |`
	}
};
//#endregion
export { route };
