import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/bandisoft/history.ts
const idOptions = [
	{
		label: "Bandizip",
		value: "bandizip"
	},
	{
		label: "Bandizip for Mac",
		value: "bandizip.mac"
	},
	{
		label: "BandiView",
		value: "bandiview"
	},
	{
		label: "Honeycam",
		value: "honeycam"
	}
];
const languageOptions = [
	{
		label: "English",
		value: "en"
	},
	{
		label: "中文(简体)",
		value: "cn"
	},
	{
		label: "中文(繁體)",
		value: "tw"
	},
	{
		label: "日本語",
		value: "jp"
	},
	{
		label: "Русский",
		value: "ru"
	},
	{
		label: "Español",
		value: "es"
	},
	{
		label: "Français",
		value: "fr"
	},
	{
		label: "Deutsch",
		value: "de"
	},
	{
		label: "Italiano",
		value: "it"
	},
	{
		label: "Slovenčina",
		value: "sk"
	},
	{
		label: "Українська",
		value: "uk"
	},
	{
		label: "Беларуская",
		value: "be"
	},
	{
		label: "Dansk",
		value: "da"
	},
	{
		label: "Polski",
		value: "pl"
	},
	{
		label: "Português Brasileiro",
		value: "br"
	},
	{
		label: "Čeština",
		value: "cs"
	},
	{
		label: "Nederlands",
		value: "nl"
	},
	{
		label: "Slovenščina",
		value: "sl"
	},
	{
		label: "Türkçe",
		value: "tr"
	},
	{
		label: "ภาษาไทย",
		value: "th"
	},
	{
		label: "Ελληνικά",
		value: "gr"
	},
	{
		label: "O'zbek",
		value: "uz"
	},
	{
		label: "Romanian",
		value: "ro"
	},
	{
		label: "한국어",
		value: "kr"
	}
];
const handler = async (ctx) => {
	const { id = "bandizip", language = "en" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "500");
	const validIds = new Set(idOptions.map((option) => option.value));
	if (!validIds.has(id)) throw new Error(`Invalid id: ${id}. Allowed values are: ${[...validIds].join(", ")}`);
	const validLanguages = new Set(languageOptions.map((option) => option.value));
	if (!validLanguages.has(language)) throw new Error(`Invalid language: ${language}. Allowed values are: ${[...validLanguages].join(", ")}`);
	const baseUrl = `https://${language}.bandisoft.com`;
	const targetUrl = new URL(`${id}/history/`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const lang = $("html").attr("lang") ?? "en";
	const author = $("meta[name=\"author\"]").attr("content");
	const items = $("div.row").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const version = $el.find("div.cell1").text();
		const pubDateStr = $el.find("div.cell2").text();
		const title = version;
		const description = $el.find("ul.cell3").html() ?? void 0;
		const linkUrl = targetUrl;
		const guid = `bandisoft-${id}-${language}-${version}`;
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			author,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language: lang
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img#logo_light").attr("src"),
		author,
		language: lang,
		id: targetUrl
	};
};
const route = {
	path: "/history/:id?/:language?",
	name: "History",
	url: "www.bandisoft.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/bandisoft/history/bandizip",
	parameters: {
		id: {
			description: "ID, `bandizip` by default",
			options: idOptions
		},
		language: {
			description: "Language, `en` by default",
			options: languageOptions
		}
	},
	description: `::: tip
To subscribe to [Bandizip Version History](https://www.bandisoft.com/bandizip/history/), where the source URL is \`https://www.bandisoft.com/bandizip/history/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/bandisoft/history/bandizip\`](https://rsshub.app/bandisoft/history/bandizip).
:::

<details>
  <summary>More languages</summary>

| Language             | ID |
| -------------------- | -- |
| English              | en |
| 中文 (简体)          | cn |
| 中文 (繁體)          | tw |
| 日本語               | jp |
| Русский              | ru |
| Español              | es |
| Français             | fr |
| Deutsch              | de |
| Italiano             | it |
| Slovenčina           | sk |
| Українська           | uk |
| Беларуская           | be |
| Dansk                | da |
| Polski               | pl |
| Português Brasileiro | br |
| Čeština              | cs |
| Nederlands           | nl |
| Slovenščina          | sl |
| Türkçe               | tr |
| ภาษาไทย              | th |
| Ελληνικά             | gr |
| Oʻzbek               | uz |
| Romanian             | ro |
| 한국어               | kr |

</details>`,
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.bandisoft.com/:id/history"],
		target: (params) => {
			const id = params.id;
			return `/bandisoft/history${id ? `/${id}` : ""}`;
		}
	}],
	view: 0,
	zh: {
		path: "/history/:id?/:language?",
		name: "更新记录",
		url: "www.bandisoft.com",
		maintainers: ["nczitzk"],
		handler,
		example: "/bandisoft/history/bandizip",
		parameters: {
			id: {
				description: "ID, 默认为 `bandizip`，可在对应产品页 URL 中找到",
				options: idOptions
			},
			language: {
				description: "地区, 默认为 `en`",
				options: languageOptions
			}
		},
		description: `::: tip
若订阅 [Bandizip 更新记录](https://cn.bandisoft.com/bandizip/history/)，网址为 \`https://cn.bandisoft.com/bandizip/history/\`，请截取 \`cn\` 作为 \`category\` 参数填入，此时目标路由为 [\`/bandisoft/:language?/:id?\`](https://rsshub.app/bandisoft/:language?/:id?)。
:::

<details>
  <summary>更多语言</summary>

| Language             | ID |
| -------------------- | -- |
| English              | en |
| 中文 (简体)          | cn |
| 中文 (繁體)          | tw |
| 日本語               | jp |
| Русский              | ru |
| Español              | es |
| Français             | fr |
| Deutsch              | de |
| Italiano             | it |
| Slovenčina           | sk |
| Українська           | uk |
| Беларуская           | be |
| Dansk                | da |
| Polski               | pl |
| Português Brasileiro | br |
| Čeština              | cs |
| Nederlands           | nl |
| Slovenščina          | sl |
| Türkçe               | tr |
| ภาษาไทย              | th |
| Ελληνικά             | gr |
| Oʻzbek               | uz |
| Romanian             | ro |
| 한국어               | kr |

</details>`
	}
};
//#endregion
export { handler, route };
