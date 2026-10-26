import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/daum/potplayer.ts
const handler = async (ctx) => {
	const { lang } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "500");
	const targetUrl = new URL(`potplayer/PotPlayer/v4/Update2/Update${lang ?? ""}.html`, "https://t1.daumcdn.net").href;
	const response = await rofetch(targetUrl);
	const updateRegex = /^-+[^\S\n]*\n(.*)\r?\n-+[^\S\n]*\n([\s\S]*?)(?=\n-{2}|<\/p>)/gm;
	const items = [];
	let match;
	while ((match = updateRegex.exec(response)) !== null && items.length < limit) {
		const headerLine = match[1].trim();
		const description = match[2].trim()?.replaceAll(/(\s[+-])/g, "<br>$1");
		let version = "N/A";
		let pubDateStr = void 0;
		const versionMatch = headerLine.match(/\[([\d.]+)\]/);
		if (versionMatch && versionMatch[1]) version = versionMatch[1];
		const specificDateMatch = headerLine.match(/(\d{4}\/\d{1,2}\/\d{1,2})/);
		const numericDateMatch = headerLine.match(/(\d{6})/);
		if (specificDateMatch && specificDateMatch[1]) pubDateStr = specificDateMatch[1].replaceAll("/", "-");
		else if (numericDateMatch && numericDateMatch[1]) {
			const rawDate = numericDateMatch[1];
			if (rawDate.length === 6 && (version === rawDate || !specificDateMatch)) {
				const year = Number(rawDate.slice(0, 2));
				const month = Number(rawDate.slice(2, 4));
				const day = Number(rawDate.slice(4, 6));
				pubDateStr = `${year < 70 ? 2e3 + year : 1900 + year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
			}
		}
		const guid = `potplayer-${lang}-${version}`;
		const processedItem = {
			title: version,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: targetUrl,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			updated: pubDateStr ? parseDate(pubDateStr) : void 0
		};
		items.push(processedItem);
	}
	return {
		title: "PotPlayer Update History",
		link: targetUrl,
		item: items,
		allowEmpty: true,
		id: targetUrl
	};
};
const route = {
	path: "/potplayer/:lang?",
	name: "Potplayer Update History",
	url: "potplayer.daum.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/daum/potplayer",
	parameters: { lang: {
		description: "Language, Korean by default",
		options: [
			{
				label: "한국어",
				value: "Kor"
			},
			{
				label: "中文(简体)",
				value: "Chs"
			},
			{
				label: "中文(繁体)",
				value: "Cht"
			},
			{
				label: "English",
				value: "Eng"
			},
			{
				label: "Українська",
				value: "Eng"
			},
			{
				label: "Русский",
				value: "Rus"
			},
			{
				label: "Polski",
				value: "Pol"
			}
		]
	} },
	description: `::: tip
To subscribe to [Potplayer Update History](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html), where the source URL is \`https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/daum/potplayer/Eng\`](https://rsshub.app/daum/potplayer/Eng).
:::

| Language                                                                            | Id                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------- |
| [한국어](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html)         |                                              |
| [中文 (简体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html) | [Chs](https://rsshub.app/daum/potplayer/Chs) |
| [中文 (繁体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html) | [Cht](https://rsshub.app/daum/potplayer/Cht) |
| [ENGLISH](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)     | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [Українська](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)  | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [РУССКИЙ](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html)     | [Eng](https://rsshub.app/daum/potplayer/Rus) |
| [Polski](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html)      | [Eng](https://rsshub.app/daum/potplayer/Pol) |`,
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
	radar: [
		{
			source: ["potplayer.daum.net"],
			target: (_, url) => {
				const lang = new URL(url).searchParams.get("lang") ?? void 0;
				return `/daum/potplayer${lang ? `/${lang}` : ""}`;
			}
		},
		{
			title: "한국어",
			source: ["t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html"],
			target: "/potplayer"
		},
		{
			title: "中文(简体)",
			source: ["t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html"],
			target: "/potplayer/Chs"
		},
		{
			title: "中文(繁体)",
			source: ["t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html"],
			target: "/potplayer/Cht"
		},
		{
			title: "English",
			source: ["t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html"],
			target: "/potplayer/Eng"
		},
		{
			title: "Українська",
			source: ["t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html"],
			target: "/potplayer/Eng"
		},
		{
			title: "Русский",
			source: ["t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html"],
			target: "/potplayer/Rus"
		},
		{
			title: "Polski",
			source: ["t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html"],
			target: "/potplayer/Pol"
		}
	],
	view: 0,
	zh: {
		path: "/potplayer/:lang?",
		name: "PotPlayer 版本更新信息",
		url: "potplayer.daum.net",
		maintainers: ["nczitzk"],
		handler,
		example: "/daum/potplayer/zh_CN",
		parameters: { lang: {
			description: "语言，默认为韩语，可在对应页 URL 中找到",
			options: [
				{
					label: "한국어",
					value: "Kor"
				},
				{
					label: "中文(简体)",
					value: "Chs"
				},
				{
					label: "中文(繁体)",
					value: "Cht"
				},
				{
					label: "English",
					value: "Eng"
				},
				{
					label: "Українська",
					value: "Eng"
				},
				{
					label: "Русский",
					value: "Rus"
				},
				{
					label: "Polski",
					value: "Pol"
				}
			]
		} },
		description: `::: tip
若订阅 [Potplayer Update History](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html)，网址为 \`https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html\`，请截取 \`https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update\` 到末尾的部分 \`Chs\` 作为 \`lang\` 参数填入，此时目标路由为 [\`/daum/potplayer/Chs\`](https://rsshub.app/daum/potplayer/Chs)。
:::

| Language                                                                            | Id                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------- |
| [한국어](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html)         |                                              |
| [中文 (简体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html) | [Chs](https://rsshub.app/daum/potplayer/Chs) |
| [中文 (繁体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html) | [Cht](https://rsshub.app/daum/potplayer/Cht) |
| [ENGLISH](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)     | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [Українська](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)  | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [РУССКИЙ](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html)     | [Eng](https://rsshub.app/daum/potplayer/Rus) |
| [Polski](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html)      | [Eng](https://rsshub.app/daum/potplayer/Pol) |`
	}
};
//#endregion
export { handler, route };
