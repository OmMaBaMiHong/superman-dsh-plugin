import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import { CookieJar } from "tough-cookie";
//#region lib/routes/yuque/utils.ts
const card2Html = (elem, link) => {
	const name = elem.attr("name");
	const data = elem.attr("value")?.split("data:", 2)[1]?.replace("undefined", "");
	const value = JSON.parse(decodeURIComponent(data || "[]"));
	let html;
	switch (name) {
		case "board":
		case "emoji":
		case "flowchart2":
		case "image":
		case "math":
		case "mindmap":
		case "puml":
			html = `<img src='${value.src}'>`;
			break;
		case "bookmarkInline":
		case "bookmarklink":
		case "yuqueinline":
			html = `<a href='${value.src}'>${value.detail.title}</a>`;
			break;
		case "checkbox":
			html = `<input type='checkbox' ${value === true ? "checked" : ""}>`;
			break;
		case "codeblock":
			html = `<code>${value.code.replaceAll("\n", "<br>")}</code>`;
			break;
		case "diagram":
			html = `<img src='${value.url}'>`;
			break;
		case "file":
		case "localdoc":
			html = `<a href='${value.src}'>${value.name}</a>`;
			break;
		case "hr":
			html = "<hr>";
			break;
		case "label":
			html = `<b>${value.label}</b>`;
			break;
		case "mention":
			html = `<a href='https://www.yuque.com/${value.login}'>${value.name}</a>`;
			break;
		case "table":
			html = value.html;
			break;
		case "thirdparty":
		case "youku":
			if (elem.attr("alias") === "music163") html = `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" height=66 src="${value.src}"></iframe>`;
			else if (elem.attr("alias") === "bilibili" || elem.attr("alias") === void 0) html = `<iframe src="${value.src}&high_quality=1&autoplay=0" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
			else if (value.type === "codepen") html = `<iframe height="265" style="width: 100%;" scrolling="no" title="codepen" src="${value.url}" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>`;
			else throw new Error(`Unhandled thirdparty on ${link}: ${elem.attr("alias")}`);
			break;
		case "yuque":
			if (value.mode === "card") html = `<a href='${value.src}'>${value.detail.title}</a>`;
			else if (value.mode === "embed") html = `<iframe src="${value.url}" width="100%" height="518"></iframe>`;
			else throw new Error(`Unhandled mode on ${link}: ${value.mode}`);
			break;
		case "video":
			html = `<video src='${value.videoId}'></video>`;
			break;
		default: throw new Error(`Unhandled card on ${link}: ${name}`);
	}
	elem.replaceWith(html);
};
//#endregion
//#region lib/routes/yuque/book.ts
const APP_DATA_REGEX = /window\.appData = JSON\.parse\(decodeURIComponent\("(.+?)"\)\);/;
const baseUrl = "https://www.yuque.com";
const route = {
	path: "/:name/:book",
	categories: ["study"],
	example: "/yuque/ruanyf/weekly",
	parameters: {
		name: "用戶名",
		book: "知识库 ID"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yuque.com/:name/:book"] }],
	name: "知识库",
	maintainers: ["aha2mao", "ltaoo"],
	handler,
	description: `| Node.js 专栏                                             | 阮一峰每周分享                                                 | 语雀使用手册                                             |
| -------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| [/yuque/egg/nodejs](https://rsshub.app/yuque/egg/nodejs) | [/yuque/ruanyf/weekly](https://rsshub.app/yuque/ruanyf/weekly) | [/yuque/yuque/help](https://rsshub.app/yuque/yuque/help) |`
};
async function handler(ctx) {
	const cookieJar = new CookieJar();
	const { name, book } = ctx.req.param();
	const bookUrl = `${baseUrl}/${name}/${book}`;
	const { data: bookHtml } = await got_default(bookUrl, { cookieJar });
	const $ = load(bookHtml);
	const appData = JSON.parse(decodeURIComponent($("script").text().match(APP_DATA_REGEX)[1]));
	const bookId = appData.book.id;
	const { data: { data: docs } } = await got_default(`${baseUrl}/api/docs`, {
		searchParams: { book_id: bookId },
		cookieJar
	});
	const list = docs.map((item) => ({
		title: item.title,
		description: item.description,
		link: `${baseUrl}/${name}/${book}/${item.slug}`,
		pubDate: parseDate(item.published_at),
		slug: item.slug
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: { data } } = await got_default(`${baseUrl}/api/docs/${item.slug}`, { searchParams: {
			book_id: bookId,
			include_contributors: true
		} });
		const $ = load(data.content, null, false);
		$("card").each((_, elem) => {
			card2Html($(elem), item.link);
		});
		$("[data-lake-id]").removeAttr("data-lake-id");
		$("[id]").removeAttr("id");
		$("p").each((_, elem) => {
			elem = $(elem);
			if (elem.children().length === 1 && elem.children().is("br")) elem.remove();
			if (elem.children().length === 2 && elem.children().eq(0).is("span") && elem.children().eq(0).text().length === 1 && elem.children().eq(1).is("br")) elem.remove();
		});
		for await (const v of $("video").toArray()) {
			const $v = $(v);
			const src = $v.attr("src");
			if (src.startsWith("inputs")) {
				const { data } = await got_default(`${baseUrl}/api/video`, { searchParams: { video_id: src } });
				const { info } = data.data;
				$v.replaceWith(`<video controls preload='none' poster='${info.cover}'><source src='${info.url}' type='video/mp4'></video>`);
			}
		}
		item.description = $.html();
		item.author = data.contributors.map((c) => c.name).join(", ");
		return item;
	})));
	return {
		title: appData.book.name,
		description: appData.book.description,
		image: appData.group.avatar,
		link: bookUrl,
		item: items
	};
}
//#endregion
export { route };
