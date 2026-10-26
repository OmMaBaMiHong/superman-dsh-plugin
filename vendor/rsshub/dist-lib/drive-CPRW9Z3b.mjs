import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/lenovo/drive.tsx
const route = {
	path: "/drive/:selName",
	categories: ["program-update"],
	example: "/lenovo/drive/PF3WRD2G",
	parameters: { selName: "产品序列号" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["lenovo.com.cn"],
		target: "/drive/:selName"
	}],
	name: "驱动",
	maintainers: ["cscnk52"],
	handler
};
async function handler(ctx) {
	const response = await rofetch(`https://newsupport.lenovo.com.cn/api/drive/drive_listnew?searchKey=${ctx.req.param("selName")}`);
	if (response.statusCode !== 200) throw new InvalidParameterError("无效序列号, 请检查你的序列号是否正确.");
	const items = response.data.partList.flatMap((part) => part.drivelist).map((item) => ({
		title: `${item.DriverName} ${item.Version}`,
		link: `https://newsupport.lenovo.com.cn/driveDownloads_detail.html?driveId=${item.DriverEdtionId}`,
		description: renderToString(/* @__PURE__ */ jsx(DriveDescription, {
			driveName: item.DriverName,
			driveCode: item.DriverCode,
			driveVersion: item.Version,
			downloadFileName: item.FileName,
			downloadFilePath: item.FilePath
		})),
		pubDate: parseDate(item.CreateTime, 8)
	}));
	return {
		title: `${response.data.driverSerious[0].NodeCode} 驱动`,
		item: items,
		language: "zh-CN"
	};
}
const DriveDescription = ({ driveName, driveCode, driveVersion, downloadFileName, downloadFilePath }) => /* @__PURE__ */ jsxs("div", {
	class: "driver-info",
	children: [/* @__PURE__ */ jsx("h2", { children: "驱动信息" }), /* @__PURE__ */ jsxs("ul", { children: [
		/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("strong", { children: "驱动名称：" }), driveName] }),
		/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("strong", { children: "驱动编码：" }), driveCode] }),
		/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("strong", { children: "驱动版本：" }), driveVersion] }),
		/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("strong", { children: "下载地址：" }), /* @__PURE__ */ jsx("a", {
			href: downloadFilePath,
			download: true,
			children: downloadFileName
		})] })
	] })]
});
//#endregion
export { handler, route };
