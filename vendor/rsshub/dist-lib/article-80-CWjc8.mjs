import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/69shu/article.ts
const route = {
	path: "/article/:id",
	name: "章节",
	url: "www.69shuba.cx",
	maintainers: ["eternasuno"],
	example: "/69shu/article/47117",
	parameters: { id: "小说 id, 可在对应小说页 URL 中找到" },
	categories: ["reading"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.69shuba.cx/book/:id.htm"],
		target: "/article/:id"
	}],
	handler: async (ctx) => {
		const { id } = ctx.req.param();
		const link = `https://www.69shuba.cx/book/${id}.htm`;
		const $ = load(await get(link));
		const item = await Promise.all($(".qustime li>a").toArray().map((chapter) => createItem(chapter.attribs.href)));
		return {
			title: $("h1>a").text(),
			description: $(".navtxt>p:first-of-type").text(),
			link,
			item,
			image: $(".bookimg2>img").attr("src"),
			author: $(".booknav2>p:first-of-type>a").text(),
			language: "zh-cn"
		};
	}
};
const createItem = (url) => cache_default.tryGet(url, async () => {
	const $ = load(await get(url));
	const { articleid, chapterid, chaptername } = parseObject(/bookinfo\s?=\s?\{[\s\S]+?\}/, $("head>script:not([src])").text());
	const decryptionMap = parseObject(/_\d+\s?=\s?\{[\s\S]+?\}/, $(".txtnav+script").text());
	return {
		title: chaptername,
		description: decrypt($(".txtnav").html() || "", articleid, chapterid, decryptionMap),
		link: url
	};
});
const get = async (url, encoding = "gbk") => new TextDecoder(encoding).decode(await rofetch(url, { responseType: "arrayBuffer" }));
const parseObject = (reg, str) => {
	const obj = {};
	const match = reg.exec(str);
	if (match) {
		const matchedLines = match[0].matchAll(/(\w+):\s?["']?([\s\S]+?)["']?[\n,}]/g);
		for (const line of matchedLines) obj[line[1]] = line[2];
	}
	return obj;
};
const decrypt = (txt, articleid, chapterid, decryptionMap) => {
	if (!txt || txt.length < 10) return txt;
	const lineMap = {};
	const articleKey = Number(articleid) + 3061711;
	const chapterKey = Number(chapterid) + 3421001;
	for (const [key, value] of Object.entries(decryptionMap)) lineMap[(Number(key) ^ chapterKey) - articleKey] = (Number(value) ^ chapterKey) - articleKey;
	return txt.replaceAll(/\u{2003}|\n/gu, "").split("<br><br>").flatMap((line, index, array) => {
		const mapped = lineMap[index];
		return (mapped ? array[mapped] : line).split("<br>");
	}).slice(1, -2).join("<br><br>");
};
//#endregion
export { route };
