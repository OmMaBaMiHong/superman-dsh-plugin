import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as getData } from "./utils-Bk2VG0Hs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tencent/news/coronavirus/data.tsx
const route = {
	path: "/news/coronavirus/data/:province?/:city?",
	name: "Unknown",
	maintainers: ["CaoMeiYouRen"],
	handler
};
async function handler(ctx) {
	const province = ctx.req.param("province") || "";
	const city = ctx.req.param("city") || "";
	const link = "https://news.qq.com/zt2020/page/feiyan.htm#/";
	const item = [];
	const { lastUpdateTime, areaTree } = (await getData(["diseaseh5Shelf"]))?.data?.diseaseh5Shelf || {};
	const nationalData = areaTree?.[0];
	const provinceList = nationalData?.children;
	let coronavirusData;
	let placeName;
	if (!province || province === "中国" || province === "全国") {
		coronavirusData = nationalData;
		placeName = "中国";
	} else {
		coronavirusData = provinceList?.find((e) => e.name === province);
		placeName = province;
		if (city) {
			coronavirusData = coronavirusData?.children?.find((e) => e.name === city);
			if (coronavirusData) placeName = `${province}-${city}`;
		}
	}
	if (!coronavirusData) throw new InvalidParameterError(`未找到 ${placeName} 的疫情数据，请检查输入的省市名称是否正确`);
	const todayConfirm = coronavirusData.today?.confirm;
	const totalNowConfirm = coronavirusData.total?.nowConfirm;
	const totalConfirm = coronavirusData.total?.confirm;
	const totalDead = coronavirusData.total?.dead;
	const pubDate = parseDate(coronavirusData.total?.mtime || lastUpdateTime);
	const title = `${placeName} - 腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪`;
	const info = {
		title: `${placeName} - 疫情数据`,
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("p", { children: "新增确诊：" }),
			/* @__PURE__ */ jsx("p", { children: `+${todayConfirm}` }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "现有确诊：" }),
			/* @__PURE__ */ jsx("p", { children: totalNowConfirm }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "累计确诊：" }),
			/* @__PURE__ */ jsx("p", { children: totalConfirm }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "累计死亡：" }),
			/* @__PURE__ */ jsx("p", { children: totalDead }),
			/* @__PURE__ */ jsx("br", {})
		] })),
		pubDate,
		guid: `${link}${placeName}?pubDate=${pubDate.toISOString()}`
	};
	item.push(info);
	return {
		title,
		link,
		item
	};
}
//#endregion
export { route };
