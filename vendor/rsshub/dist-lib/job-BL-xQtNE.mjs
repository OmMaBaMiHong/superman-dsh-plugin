import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/xjtu/job.tsx
const baseUrl = "https://job.xjtu.edu.cn";
const arr = {
	zxgg: "中心公告",
	xds: "选调生",
	zddw: "重点单位",
	gjzz: "国际组织",
	cxcy: "创新创业",
	jysx: "就业实习"
};
const route = {
	path: "/job/:subpath?",
	categories: ["university"],
	example: "/xjtu/job/zxgg",
	parameters: { subpath: "栏目类型，默认请求`zxgg`，详见下方表格" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "就业创业中心",
	maintainers: ["DylanXie123"],
	handler,
	description: `栏目类型

| 中心公告 | 选调生 | 重点单位 | 国际组织 | 创新创业 | 就业实习 |
| -------- | ------ | -------- | -------- | -------- | -------- |
| zxgg     | xds    | zddw     | gjzz     | cxcy     | jysx     |`
};
async function handler(ctx) {
	const subpath = ctx.req.param("subpath") ?? "zxgg";
	const menuid = (await got_default.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getTzgg.do`, { form: { requestParamStr: "{\"pageSize\":7,\"pageNumber\":1}" } })).data.data.find((item) => item.menutitle === arr[subpath]).menuid;
	const { data } = await got_default.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getMhcxWzData.do`, { form: { requestParamStr: `{"pageSize":4,"pageNumber":1,"LMDM":${menuid}}` } });
	const list = data.data.map((item) => ({
		title: item.menutitle,
		description: item.NR,
		pubDate: timezone(parseDate(item.SBSJ), 8),
		guid: item.menuid,
		link: `${baseUrl}/xsfw/sys/emaphome/website/template/detail.html?menuid=${item.menuid}&msg=TZGG&msgChild=NRXQ`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await got_default.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getWzone.do`, { form: { requestParamStr: `{"WID":${item.guid}}` } });
		let attachments = "";
		if (response.data.data[0].FJ) {
			const attachmentData = await got_default(`${baseUrl}/xsfw/sys/emapcomponent/file/getUploadedAttachment.do?fileToken=${response.data.data[0].FJ}`);
			attachments = renderToString(/* @__PURE__ */ jsx(XjtuAttachments, { items: attachmentData.data.items }));
		}
		item.author = response.data.data[0].CZZXM;
		item.description = response.data.data[0].NR + attachments;
		return item;
	})));
	return {
		title: `西安交通大学学生就业创业信息网 - ${arr[subpath]}`,
		link: baseUrl,
		item: items
	};
}
const XjtuAttachments = ({ items }) => /* @__PURE__ */ jsx(Fragment, { children: items.map((item) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
	href: item.fileUrl,
	rel: "noreferrer",
	children: item.name
}), /* @__PURE__ */ jsx("br", {})] })) });
//#endregion
export { route };
