import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gettr/user.tsx
const actionMap = {
	pub_pst: "Published a post: ",
	shares_cm: "Shared a comment: ",
	shares_pst: "Shared a post: "
};
const route = {
	path: "/user/:id",
	categories: ["social-media"],
	view: 1,
	example: "/gettr/user/jasonmillerindc",
	parameters: { id: "User id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gettr.com/user/:id"] }],
	name: "User timeline",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://gettr.com";
	const apiHost = "https://api.gettr.com";
	const mediaHost = "https://media.gettr.com";
	const id = ctx.req.param("id");
	const { data: posts } = await got_default(`${apiHost}/u/user/${id}/posts`, { searchParams: {
		offset: 0,
		max: 20,
		dir: "fwd",
		incl: "posts|stats|userinfo|shared|liked|pvotes",
		fp: "f_uo"
	} });
	const userInfo = posts.result.aux.uinf[id];
	const items = posts.result.data.list.map((post) => {
		const title = posts.result.aux.post[post.activity.pstid].txt;
		const description = renderToString(/* @__PURE__ */ jsx(GettrPostDescription, {
			post: posts.result.aux.post[post.activity.pstid],
			mediaHost
		}));
		return {
			title: `${actionMap[post.action]} ${title}`,
			description,
			pubDate: parseDate(post.cdate),
			updated: parseDate(post.udate),
			link: `${baseUrl}/post/${post.activity.pstid}`
		};
	});
	return {
		title: `${userInfo.nickname} on Gettr`,
		description: userInfo.dsc,
		link: `${baseUrl}/user/${id}`,
		image: `${mediaHost}/${userInfo.ico}`,
		language: "en",
		item: items
	};
}
const GettrPostDescription = ({ post, mediaHost }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	post.txt ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(post.txt.replaceAll("\n", "<br>")), /* @__PURE__ */ jsx("br", {})] }) : null,
	post.previmg ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: post.previmg }), /* @__PURE__ */ jsx("br", {})] }) : null,
	post.ttl && post.prevsrc ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx("a", {
		href: post.prevsrc,
		children: post.ttl
	}) }), /* @__PURE__ */ jsx("br", {})] }) : null,
	post.dsc && post.prevsrc ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
		href: post.prevsrc,
		children: post.dsc
	}), /* @__PURE__ */ jsx("br", {})] }) : null,
	post.imgs ? /* @__PURE__ */ jsx(Fragment, { children: post.imgs.map((img) => /* @__PURE__ */ jsx("img", { src: `${mediaHost}/${img}` })) }) : null
] });
//#endregion
export { route };
