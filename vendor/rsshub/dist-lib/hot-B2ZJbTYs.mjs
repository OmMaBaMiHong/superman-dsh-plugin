import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as weiboUtils } from "./utils-L2Usa7U4.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/weibo/search/hot.tsx
let wpic = "false";
let fullpic = "false";
const route = {
	path: "/search/hot/:fulltext?",
	categories: ["social-media"],
	view: 1,
	example: "/weibo/search/hot",
	parameters: { fulltext: { description: `
-   使用\`/weibo/search/hot\`可以获取热搜条目列表；
-   使用\`/weibo/search/hot/fulltext\`可以进一步获取热搜条目下的摘要信息（不含图片视频）；
-   使用\`/weibo/search/hot/fulltext?pic=true\`可以获取图片缩略（但需要配合额外的手段，例如浏览器上的 Header Editor 等来修改 referer 参数为\`https://weibo.com\`，以规避微博的外链限制，否则图片无法显示。）
-   使用\`/weibo/search/hot/fulltext?pic=true&fullpic=true\`可以获取 Original 图片（但需要配合额外的手段，例如浏览器上的 Header Editor 等来修改 referer 参数为\`https://weibo.com\`，以规避微博的外链限制，否则图片无法显示。）` } },
	features: {
		requireConfig: [{
			name: "WEIBO_COOKIES",
			optional: true,
			description: ""
		}],
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["s.weibo.com/top/summary"] }],
	name: "热搜榜",
	maintainers: ["xyqfer", "shinemoon"],
	handler,
	url: "s.weibo.com/top/summary"
};
async function handler(ctx) {
	wpic = ctx.req.query("pic") ?? "false";
	fullpic = ctx.req.query("fullpic") ?? "false";
	const { data: { data } } = await weiboUtils.tryWithCookies(async (cookies, verifier) => {
		const _r = await got_default({
			method: "get",
			url: "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot&title=%E5%BE%AE%E5%8D%9A%E7%83%AD%E6%90%9C&extparam=filter_type%3Drealtimehot%26mi_cid%3D100103%26pos%3D0_0%26c_type%3D30%26display_time%3D1540538388&luicode=10000011&lfid=231583",
			headers: {
				Referer: "https://s.weibo.com/top/summary?cate=realtimehot",
				Cookie: cookies,
				...weiboUtils.apiHeaders
			}
		});
		verifier(_r);
		return _r;
	});
	let resultItems;
	if (ctx.req.param("fulltext") === "fulltext") {
		const tlist = data.cards[0].card_group.map((item) => {
			return {
				title: item.desc,
				link: `https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`,
				plink: `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`
			};
		});
		resultItems = await Promise.all(tlist.map((i) => cache_default.tryGet(i.plink, async () => {
			i.description = (await fetchContent(i.plink)).content;
			return i;
		})));
	} else resultItems = data.cards[0].card_group.map((item) => {
		const title = item.desc;
		const link = `https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D${encodeURIComponent(item.desc)}`;
		return {
			title,
			description: item.desc,
			link
		};
	});
	return {
		title: "微博热搜榜",
		link: "https://s.weibo.com/top/summary?cate=realtimehot",
		description: "实时热点，每分钟更新一次",
		item: resultItems
	};
}
async function fetchContent(url) {
	const subres = await got_default(url, { headers: { Cookie: config.weibo.cookies ?? "" } });
	let demostr = "";
	try {
		const cards = subres.data.data.cards;
		demostr = seekContent(cards);
	} catch {}
	return { content: demostr };
}
function seekContent(clist) {
	const stub = load("<div id=\"wbcontent\"></div>")("#wbcontent");
	const renderDigest = ({ author, msg, link, postinfo, pics }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("div", {
			class: "quoted",
			children: [/* @__PURE__ */ jsx("a", {
				style: "text-decoration: none;",
				href: author.link,
				children: author.name
			}), /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("a", {
				href: link,
				children: ` | ${postinfo} `
			}) })]
		}),
		/* @__PURE__ */ jsx("div", {
			class: "content",
			children: msg ? raw(msg) : null
		}),
		pics.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("div", {
			class: "pic-row",
			children: pics.map((pic) => /* @__PURE__ */ jsx("a", {
				href: pic.rurl,
				children: /* @__PURE__ */ jsx("img", { src: pic.url })
			}))
		})] }) : null,
		/* @__PURE__ */ jsx("hr", {})
	] }));
	for (const curitem of clist) if (curitem.card_type === 9) {
		const tbpic = curitem.mblog.thumbnail_pic ?? "";
		const index = tbpic.lastIndexOf("/");
		const thumbfolder = tbpic.slice(0, index + 1);
		const curcontent = load(curitem.mblog.text);
		if (wpic === "true") curcontent("img").attr("width", "1em").attr("height", "1em");
		else curcontent("img").remove();
		const section = renderDigest({
			author: {
				link: curitem.mblog.user.profile_url,
				name: curitem.mblog.user.screen_name
			},
			msg: curcontent.html(),
			link: curitem.scheme,
			postinfo: curitem.mblog.created_at,
			pics: wpic === "true" && curitem.mblog.pic_num > 0 ? curitem.mblog.pics.map((item) => {
				const pid = item.pid;
				return fullpic === "false" ? {
					url: thumbfolder + pid + ".jpg",
					rurl: item.url
				} : {
					url: item.url,
					rurl: item.url
				};
			}) : []
		});
		stub.append(section);
	} else if (curitem.card_type === 11) stub.append(seekContent(curitem.card_group));
	return stub.html();
}
//#endregion
export { route };
