import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { r as processImage } from "./utils-BpoeGnFo.mjs";
//#region lib/routes/zhihu/timeline.ts
const route = {
	path: "/timeline",
	categories: ["social-media"],
	example: "/zhihu/timeline",
	parameters: {},
	features: {
		requireConfig: [{
			name: "ZHIHU_COOKIES",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "用户关注时间线",
	maintainers: ["SeanChao"],
	handler,
	description: `::: warning
用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`
};
async function handler(ctx) {
	const cookie = config.zhihu.cookies;
	if (cookie === void 0) throw new ConfigNotFoundError("缺少知乎用户登录后的 Cookie 值");
	const feeds = (await got_default({
		method: "get",
		url: "https://www.zhihu.com/api/v3/moments",
		headers: { Cookie: cookie },
		searchParams: {
			desktop: true,
			limit: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 15
		}
	})).data.data;
	const urlBase = "https://zhihu.com";
	const buildLink = (e) => {
		if (!e || !e.target || !e.target.type) return "";
		const id = e.target.id;
		switch (e.target.type) {
			case "answer": {
				const questionId = e.target.question.id;
				return `${urlBase}/question/${questionId}/answer/${id}`;
			}
			case "pin":
			case "article": return e.target.url;
			case "question": return `${urlBase}/question/${id}`;
			default: return;
		}
	};
	/**
	* Returns one non-undefined/null element from a list of items
	* make sure there exists at least one element that is non-undefined
	*
	* @param {Array} list a list of items to be filtered
	*/
	const getOne = (list) => list.find((e) => e !== void 0 && e !== null);
	const buildActors = (e) => {
		const actors = e.actors;
		if (!actors) return "";
		return actors.map((e) => e.name).join(", ");
	};
	const getContent = (content) => {
		if (!content || !Array.isArray(content)) return content;
		return content.map((e) => e.content).filter((e) => !!e && typeof e === "string").map((e) => `<div>${e}</div>`).join("");
	};
	const buildItem = (e) => {
		if (!e || !e.target) return {};
		const link = buildLink(e);
		return {
			title: `${e.action_text_tpl.replace("{}", () => buildActors(e))}: ${getOne([e.target.title, e.target.question ? e.target.question.title : ""])}`,
			description: processImage(`<div>${getOne([
				e.target.content_html,
				getContent(e.target.content),
				e.target.detail,
				e.target.excerpt,
				""
			])}</div>`),
			pubDate: parseDate(e.updated_time * 1e3),
			link,
			author: e.target.author ? e.target.author.name : "",
			guid: link,
			category: [e.verb]
		};
	};
	return {
		title: "知乎关注动态",
		link: "https://www.zhihu.com/follow",
		item: feeds.filter((e) => e.verb).map((e) => {
			if (e && e.type && e.type === "feed_group") return {
				title: e.group_text.replace("{LIST_COUNT}", () => e.list.length),
				description: e.list && Array.isArray(e.list) ? e.list.map((e) => buildItem(e)).map((e) => `<a href="${e.link}"><b>${e.title}</b></a><br><p>${e.description}</p><br>`).join("") : "",
				pubDate: e.list && Array.isArray(e.list) && e.list.length > 0 ? parseDate(e.list[0].updated_time * 1e3) : /* @__PURE__ */ new Date(),
				guid: e.link,
				category: [e.verb]
			};
			return buildItem(e);
		})
	};
}
//#endregion
export { route };
