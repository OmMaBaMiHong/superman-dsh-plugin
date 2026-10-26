import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/swjtu/utils.tsx
const renderDetail = (jobs) => renderToString(/* @__PURE__ */ jsxs("div", {
	id: "job_list",
	children: [/* @__PURE__ */ jsx("p", { children: "招聘职位：" }), /* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "职位名称" }),
		/* @__PURE__ */ jsx("th", { children: "职位月薪" }),
		/* @__PURE__ */ jsx("th", { children: "工作地点" }),
		/* @__PURE__ */ jsx("th", { children: "专业需求" }),
		/* @__PURE__ */ jsx("th", { children: "应聘条件" })
	] }), jobs.map((job) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", {
			width: "50",
			children: job.zwmc
		}),
		/* @__PURE__ */ jsx("td", {
			width: "50",
			children: `${job.yxmc}/月`
		}),
		/* @__PURE__ */ jsx("td", {
			width: "50",
			children: job.gzdz
		}),
		/* @__PURE__ */ jsx("td", {
			width: "70",
			children: job.zyyqmc
		}),
		/* @__PURE__ */ jsx("td", {
			width: "125",
			children: job.zwms
		})
	] }))] })]
}));
const renderDesc = (intro) => renderToString(/* @__PURE__ */ jsxs("div", {
	id: "description_box",
	children: [
		/* @__PURE__ */ jsxs("div", {
			id: "brief_description",
			children: [
				/* @__PURE__ */ jsx("p", { children: `招聘主题：${intro.zpzt}` }),
				/* @__PURE__ */ jsx("p", { children: `单位名称：${intro.dwmc}` }),
				/* @__PURE__ */ jsx("p", { children: `单位性质：${intro.xzyjmc}` }),
				/* @__PURE__ */ jsx("p", { children: `行业名称：${intro.hyyjmc}（${intro.hyejmc}）` }),
				/* @__PURE__ */ jsx("p", { children: `公司规模：${intro.rsgmmc}` }),
				/* @__PURE__ */ jsx("p", { children: `工作地点：${intro.szxmc} ${intro.xxdz}` }),
				/* @__PURE__ */ jsx("p", { children: `招聘截止日期：${intro.zpjzrq}` }),
				/* @__PURE__ */ jsx("p", { children: `简历投递邮箱：${intro.jltdyx}` }),
				/* @__PURE__ */ jsx("p", { children: `单位网站：${intro.dwwz}` })
			]
		}),
		raw(renderDetail(intro.zwxxList)),
		/* @__PURE__ */ jsx("div", {
			id: "company_introduction",
			children: raw(intro.zpxxEditor)
		})
	]
}));
const descpPage = (link, cache) => cache.tryGet(link, async () => {
	const intro = (await got_default({
		method: "post",
		url: link
	})).data.data;
	return {
		title: `${intro.dwmc}（${intro.xzyjmc}）`,
		pubDate: parseDate(String(intro.fbrq)),
		description: renderDesc(intro),
		link: String(link.replace("data", "view"))
	};
});
var utils_default = {
	descpPage,
	renderDetail,
	renderDesc
};
//#endregion
//#region lib/routes/swjtu/jyzpxx.ts
const rootURL = "https://jiuye.swjtu.edu.cn/career";
const route = {
	path: "/jyzpxx",
	categories: ["university"],
	example: "/swjtu/jyzpxx",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jiuye.swjtu.edu.cn/career", "jiuye.swjtu.edu.cn/"] }],
	name: "就业招聘信息",
	maintainers: ["qizidog"],
	handler,
	url: "jiuye.swjtu.edu.cn/career"
};
async function handler(ctx) {
	const limit = Math.min(ctx.req.query("limit") ?? 10, 50);
	const list = (await got_default({
		method: "post",
		url: `${rootURL}/zpxx/search/zpxx/1/${limit}`
	})).data.data.list;
	const items = await Promise.all(list.map((item) => {
		const key = `${rootURL}/zpxx/data/zpxx/${item.zpxxid}`;
		return utils_default.descpPage(key, cache_default);
	}));
	return {
		title: "西南交大-就业招聘信息",
		link: `${rootURL}/zpxx/zpxx`,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
