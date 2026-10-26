import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as queryToBoolean } from "./readable-social-DP5kGwF5.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/bangumi.tv/subject/comments.ts
const getComments = async (subjectID, minLength) => {
	const link = `https://bgm.tv/subject/${subjectID}/comments`;
	const $ = load(await rofetch(link));
	const title = $(".nameSingle").find("a").text();
	const comments = $(".item").toArray().map((el) => {
		const $el = $(el);
		const $rateEl = $el.find(".starlight");
		let rate = null;
		if ($rateEl.length > 0) rate = $rateEl.attr("class").match(/stars(\d)/)[1];
		const dateString = $el.find("small.grey").text().slice(2);
		const date = dateString.includes("ago") ? parseRelativeDate(dateString) : parseDate(dateString);
		return {
			user: $el.find(".l").text(),
			rate: rate || "无",
			content: $el.find("p").text(),
			date
		};
	}).filter((obj) => obj.content.length >= minLength);
	return {
		title: `${title}的 Bangumi 吐槽箱`,
		link,
		item: comments.map((c) => ({
			title: `${c.user}的吐槽`,
			description: `【评分：${c.rate}】  ${c.content}`,
			guid: `${link}#${c.user}`,
			pubDate: c.date,
			link
		}))
	};
};
//#endregion
//#region lib/routes/bangumi.tv/subject/utils.ts
const getLocalName = (obj, showOriginalName) => showOriginalName ? obj.name || obj.name_cn : obj.name_cn || obj.name;
//#endregion
//#region lib/routes/bangumi.tv/subject/ep.tsx
const getEps = async (subjectID, showOriginalName) => {
	const epsInfo = await rofetch(`https://api.bgm.tv/subject/${subjectID}?responseGroup=large`);
	const activeEps = epsInfo.eps.filter((e) => e.status === "Air");
	return {
		title: getLocalName(epsInfo, showOriginalName),
		link: `https://bgm.tv/subject/${subjectID}`,
		description: epsInfo.summary,
		item: activeEps.map((e) => ({
			title: `ep.${e.sort} ${getLocalName(e, showOriginalName)}`,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
				src: epsInfo.images.large || epsInfo.images.common,
				alt: `ep.${e.sort} ${e.name_cn || e.name}`
			}), /* @__PURE__ */ jsx("p", { children: raw(e.desc.replaceAll("\r\n", "<br>")) })] })),
			pubDate: parseDate(e.airdate),
			link: e.url.replace("http:", "https:")
		}))
	};
};
//#endregion
//#region lib/routes/bangumi.tv/subject/offcial-subject-api.ts
const getFromAPI = (type) => {
	const mapping = {
		blog: {
			en: "reviews",
			cn: "评论"
		},
		topic: {
			en: "board",
			cn: "讨论"
		}
	};
	return async (subjectID, showOriginalName) => {
		const subjectInfo = await rofetch(`https://api.bgm.tv/subject/${subjectID}?responseGroup=large`);
		return {
			title: `${getLocalName(subjectInfo, showOriginalName)}的 Bangumi ${mapping[type].cn}`,
			link: `https://bgm.tv/subject/${subjectInfo.id}/${mapping[type].en}`,
			item: subjectInfo[type].map((article) => ({
				title: `${article.user.nickname}：${article.title}`,
				description: article.summary || "",
				link: article.url.replace("http:", "https:"),
				pubDate: parseDate(article.timestamp, "X"),
				author: article.user.nickname
			}))
		};
	};
};
//#endregion
//#region lib/routes/bangumi.tv/subject/index.ts
const route = {
	path: "/subject/:id/:type?/:showOriginalName?",
	categories: ["anime"],
	example: "/bangumi.tv/subject/328609/ep/true",
	parameters: {
		id: "条目 id, 在条目页面的地址栏查看",
		type: "条目类型，可选值为 `ep`, `comments`, `blogs`, `topics`，默认为 `ep`",
		showOriginalName: "显示番剧标题原名，可选值 0/1/false/true，默认为 false"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["bgm.tv/subject/:id"],
		target: "/tv/subject/:id"
	}],
	name: "条目的通用路由格式",
	maintainers: ["JimenezLi"],
	handler,
	description: `::: warning
此通用路由仅用于对路由参数的描述，具体信息请查看下方与条目相关的路由
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const type = ctx.req.param("type") || "ep";
	const showOriginalName = queryToBoolean(ctx.req.param("showOriginalName"));
	let response;
	switch (type) {
		case "ep":
			response = await getEps(id, showOriginalName);
			break;
		case "comments":
			response = await getComments(id, Number(ctx.req.query("minLength")) || 0);
			break;
		case "blogs":
			response = await getFromAPI("blog")(id, showOriginalName);
			break;
		case "topics":
			response = await getFromAPI("topic")(id, showOriginalName);
			break;
		default: throw new InvalidParameterError(`暂不支持对${type}的订阅`);
	}
	return response;
}
//#endregion
export { route };
