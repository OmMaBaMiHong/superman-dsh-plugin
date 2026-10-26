import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#endregion
//#region lib/routes/cebbank/history.tsx
const { TYPE } = { TYPE: {
	usd: {
		name: "美元(USD)",
		id: 14
	},
	gbp: {
		name: "英镑(GBP)",
		id: 12
	},
	hkd: {
		name: "港币(HKD)",
		id: 13
	},
	chf: {
		name: "瑞士法郎(CHF)",
		id: 15
	},
	sek: {
		name: "瑞典克郎(SEK)",
		id: 21
	},
	dkk: {
		name: "丹麦克郎(DKK)",
		id: 22
	},
	nok: {
		name: "挪威克郎(NOK)",
		id: 23
	},
	jpy: {
		name: "日元(JPY)",
		id: 27
	},
	cad: {
		name: "加拿大元(CAD)",
		id: 28
	},
	aud: {
		name: "澳大利亚元(AUD)",
		id: 29
	},
	sgd: {
		name: "新加坡元(SGD)",
		id: 32
	},
	eur: {
		name: "欧元(EUR)",
		id: 38
	},
	mop: {
		name: "澳门元(MOP)",
		id: 81
	},
	thb: {
		name: "泰国铢(THB)",
		id: 84
	},
	nzd: {
		name: "新西兰元(NZD)",
		id: 87
	},
	krw: {
		name: "韩圆(KRW)",
		id: 88
	}
} };
const route = {
	path: "/quotation/history/:type",
	categories: ["other"],
	example: "/cebbank/quotation/history/usd",
	parameters: { type: "货币的缩写，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "外汇牌价",
	maintainers: ["linbuxiao"],
	handler,
	description: `#### 总览 {#zhong-guo-guang-da-yin-hang-wai-hui-pai-jia-zong-lan}

#### 历史牌价 {#zhong-guo-guang-da-yin-hang-wai-hui-pai-jia-li-shi-pai-jia}

| 美元 | 英镑 | 港币 | 瑞士法郎 | 瑞典克郎 | 丹麦克郎 | 挪威克郎 | 日元 | 加拿大元 | 澳大利亚元 | 新加坡元 | 欧元 | 澳门元 | 泰国铢 | 新西兰元 | 韩圆 |
| ---- | ---- | ---- | -------- | -------- | -------- | -------- | ---- | -------- | ---------- | -------- | ---- | ------ | ------ | -------- | ---- |
| usd  | gbp  | hkd  | chf      | sek      | dkk      | nok      | jpy  | cad      | aud        | sgd      | eur  | mop    | thb    | nzd      | krw  |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const items = load((await got_default({
		method: "get",
		url: `https://www.cebbank.com/eportal/ui?struts.portlet.action=/portlet/whpjFront!toView.action&moduleId=12094&pageId=477260&currcode=${TYPE[type].id}&currentPagebak=1&currentPage=1`
	})).data)(".lczj_box tbody tr").toArray().map((e, i) => {
		if (i < 2) return null;
		const c = load(e, { decodeEntities: false });
		return {
			title: c("td:nth-child(1)").text(),
			description: renderToString(/* @__PURE__ */ jsx(CebbankHistoryDescription, {
				fcer: c("td:nth-child(2)").text(),
				pmc: c("td:nth-child(3)").text(),
				exrt: c("td:nth-child(4)").text(),
				mc: c("td:nth-child(5)").text(),
				time: c("td:nth-child(6)").text()
			}))
		};
	});
	items.pop();
	const ret = {
		title: "中国光大银行",
		description: `中国光大银行 外汇牌价 ${TYPE[type].name}`,
		link: `https://www.cebbank.com/site/ygzx/whpj/rmbwhpjlspj/index.html?currcode=${TYPE[type].id}`,
		item: items
	};
	ctx.set("json", ret);
	return ret;
}
const CebbankHistoryDescription = ({ time, fcer, pmc, exrt, mc }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: ["更新时间: ", time] }),
	/* @__PURE__ */ jsxs("p", { children: [
		"购汇：",
		fcer,
		"，购钞：",
		pmc
	] }),
	/* @__PURE__ */ jsxs("p", { children: [
		"结汇: ",
		exrt,
		"，结钞：",
		mc
	] })
] });
//#endregion
export { route };
