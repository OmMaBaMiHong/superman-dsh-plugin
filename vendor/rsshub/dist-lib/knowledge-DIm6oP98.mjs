import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/dedao/knowledge.tsx
const mentionPattern = /<\u{2267}\u{2746}>\{"name":"(.*?)","uid":"\d+","at":"1"\}<\/\u{2266}\u{2746}>/gu;
const formatNoteText = (text = "") => text.replaceAll("\n\n", "</p><p>").replaceAll(mentionPattern, " @$1");
const extractImageUrl = (value) => value?.match(/"url":"(.*?)"/)?.[1];
const route = {
	path: "/knowledge/:topic?/:type?",
	categories: ["new-media"],
	example: "/dedao/knowledge",
	parameters: {
		topic: "话题 id，可在对应话题页 URL 中找到",
		type: "分享类型，`true` 指精选，`false` 指最新，默认为精选"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"dedao.cn/knowledge/topic/:topic",
		"dedao.cn/knowledge",
		"dedao.cn/"
	] }],
	name: "知识城邦",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const topic = ctx.req.param("topic") ?? "";
	const type = /t|y/i.test(ctx.req.param("type") ?? "true");
	const count = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100;
	const rootUrl = "https://www.dedao.cn";
	const currentUrl = `${rootUrl}/knowledge${topic === "" ? "" : "/topic/" + topic}`;
	const apiUrl = `${rootUrl}/pc/ledgers/${topic === "" ? "notes/friends_timeline" : "topic/notes/list"}`;
	const detailUrl = `${rootUrl}/pc/ledgers/topic/detail`;
	let title = "", description = "";
	if (topic !== "") {
		const detailResponse = await got_default({
			method: "post",
			url: detailUrl,
			json: {
				incr_view_count: false,
				topic_id_hazy: topic
			}
		});
		title = detailResponse.data.c.name;
		description = detailResponse.data.c.intro;
	}
	const response = await got_default({
		method: "post",
		url: apiUrl,
		json: {
			count,
			load_chain: true,
			is_elected: type,
			page_id: 0,
			topic_id_hazy: topic,
			version: 2
		}
	});
	const items = (topic === "" ? response.data.c.notes : response.data.c.note_detail_list).map((item) => ({
		title: item.f_part.note,
		author: item.f_part.nick_name,
		link: `${rootUrl}/knowledge/note/${item.f_part.note_id_hazy}`,
		pubDate: parseDate(item.f_part.time_desc, "MM-DD"),
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			item.f_part.note ? /* @__PURE__ */ jsx("p", { children: raw(formatNoteText(item.f_part.note)) }) : null,
			item.f_part.images ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), item.f_part.images.map((image) => {
				const imageUrl = extractImageUrl(image);
				return imageUrl ? /* @__PURE__ */ jsx("img", { src: imageUrl }) : null;
			})] }) : null,
			item.s_part ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsxs("p", { children: [
					"引用 ",
					item.s_part.nick_name,
					item.s_part.v_info ? ` (${item.s_part.v_info})` : "",
					":"
				] }),
				/* @__PURE__ */ jsx("p", { children: raw(formatNoteText(item.s_part.note)) }),
				/* @__PURE__ */ jsx("a", {
					href: `${rootUrl}/knowledge/note/${item.s_part.note_id_hazy}`,
					children: "[查看原文]"
				}),
				item.s_part.images ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), item.s_part.images.map((image) => {
					const imageUrl = extractImageUrl(image);
					return imageUrl ? /* @__PURE__ */ jsx("img", { src: imageUrl }) : null;
				})] }) : null
			] }) : null
		] }))
	}));
	return {
		title: `得到 - 知识城邦${title === "" ? "" : " - " + title}`,
		link: currentUrl,
		item: items,
		description
	};
}
//#endregion
export { route };
