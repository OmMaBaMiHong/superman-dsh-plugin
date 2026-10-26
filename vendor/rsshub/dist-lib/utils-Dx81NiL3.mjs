import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/infoq/utils.ts
const ProcessFeed = async (list, cache) => {
	const detailUrl = "https://www.infoq.cn/public/v1/article/getDetail";
	return await Promise.all(list.map(async (e) => {
		const uuid = e.uuid;
		return await cache.tryGet(uuid, async () => {
			const link = `https://www.infoq.cn/article/${uuid}`;
			const data = (await got_default.post(detailUrl, {
				headers: { Referer: link },
				json: { uuid }
			})).data.data;
			const author = data.author ? data.author.map((p) => p.nickname).join(",") : data.no_author;
			const category = [...e.topic.map((t) => t.name), ...e.label.map((l) => l.name)];
			const description = addCoverToDescription(parseContent(data.content_url ? (await got_default(data.content_url)).body : data.content), data.article_cover);
			return {
				title: data.article_title,
				description,
				pubDate: parseDate(e.publish_time, "x"),
				category,
				author,
				link
			};
		});
	}));
};
const parseToSimpleText = (content) => parseToSimpleTexts(content).join("");
const parseToSimpleTexts = (content) => content.map((i) => {
	const funcMaps = {
		doc: () => parseToSimpleTexts(i.content).map((v) => `<p>${v}</p>`).join(""),
		text: () => i.text,
		heading: () => {
			if (i.content) {
				const level = i.attrs.level;
				return `<h${level}>${parseToSimpleText(i.content)}</h${level}>`;
			}
			return "";
		},
		blockquote: () => {
			if (i.content) return `<blockquote>${parseToSimpleText(i.content)}</blockquote>`;
			return "";
		},
		image: () => {
			return `<img src="${i.attrs.src}"></img>`;
		},
		codeblock: () => {
			if (i.content) return `<code lang="${i.attrs.lang}">${parseToSimpleText(i.content)}</code>`;
			return "";
		},
		link: () => {
			return `<a href="${i.attrs.href}">${i.content ? parseToSimpleText(i.content) : ""}</a>"`;
		}
	};
	if (Object.hasOwn(funcMaps, i.type)) return funcMaps[i.type]();
	if (!i.content) return "";
	return parseToSimpleText(i.content);
});
function addCoverToDescription(content, cover) {
	return `<p><img src="${cover}"></p>${content}`;
}
function parseContent(content) {
	if (!content.startsWith("{\"")) return content;
	return parseToSimpleText([JSON.parse(content)]);
}
var utils_default = { ProcessFeed };
//#endregion
export { utils_default as t };
