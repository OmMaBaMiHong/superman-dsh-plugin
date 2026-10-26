import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { load } from "cheerio";
//#region lib/routes/dut/defaults.ts
var defaults_default = {
	news: "ttgz",
	teach: "xwkd/xwkd",
	perdep: "tzgg/tzgg",
	gs: "zytz",
	ssdut: "ywgg/xueyuanxinwen/jdxw",
	eda: "tzgg/tzgg",
	panjin: "index/gg",
	xsgzb: "index/zytz",
	pjteach: "index/xwkd",
	pjxqzwb: "index/tzgg",
	tjpj: "index/zxgg",
	dutdice: "xwsd/xxxw",
	tycgzx: "tzgg/tzgg",
	fldpj: "index/zytz"
};
//#endregion
//#region lib/routes/dut/shortcuts.ts
var shortcuts_default = {
	news: {
		xwjj: "xwjj01",
		rcpy: "xwjj01/rcpy",
		kxyj: "xwjj01/kxyj",
		jlhz: "xwjj01-kxyj",
		yxfc: "yxfc1",
		dgrw: "dgrw/dgrw1",
		yxdg: "yxdg1",
		mtdg: "mtdg/mtdg"
	},
	teach: {
		xwkd: "xwkd/xwkd",
		zytg: "zytg/zytg",
		bhgs: "zytg/bhgs"
	},
	perdep: {
		tzgg: "tzgg/tzgg",
		gzdt: "gzdt/gzdt1",
		zcfg: "zcfg/zcfg"
	},
	gs: {
		gzdt: "gzdt1",
		zcfg: "zcfg/zcfg"
	},
	ssdut: {
		jdxw: "ywgg/xueyuanxinwen/jdxw",
		zhxw: "ywgg/xueyuanxinwen",
		xytz: "index/xytz",
		xsdt: "index/xsdt",
		bkstz: "index/bkstz",
		yjstz: "yjspy/yjspy/yjstz"
	},
	eda: {
		tzgg: "tzgg/tzgg",
		xqxw: "xqxw/xqxw"
	},
	panjin: {
		xqxw: "index/xqxw",
		xywh: "index/xywh",
		xyfc: "index/xyfc",
		xsdt: "index/xsdt",
		mtbd: "index/mtbd",
		gg: "index/gg"
	},
	xsgzb: {
		zytz: "index/zytz",
		xgdt: "index/xgdt",
		gsgonggao: "index/gsgonggao"
	},
	pjteach: {
		xwkd: "index/xwkd",
		zytz: "index/zytz",
		xkyks: "index/xkyks",
		jxwj: "index/jxwj",
		cjwt: "index/cjwt"
	},
	pjxqzwb: {
		tzgg: "index/tzgg",
		zwkx: "index/zwkx"
	},
	tjpj: {
		xyxw: "index/xyxw",
		zxgg: "index/zxgg"
	},
	dutdice: {
		jstz: "tzgg/jstz",
		xstong_zhi: "tzgg/xstong_zhi",
		xwsd: "xwsd/xxxw"
	},
	tycgzx: {
		tzgg: "tzgg/tzgg",
		hdrc: "hdrc/hdrc",
		xwdt: "xwdt/xwdt",
		jkzs: "jkzs/jkzs1"
	},
	fldpj: {
		xsdt: "kxyj/xsdt",
		zytz: "index/zytz",
		ywgk: "index/ywgk"
	}
};
//#endregion
//#region lib/routes/dut/index.ts
const route = {
	path: ["/*/*", "/:0?"],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const site = ctx.params[0] ?? "news";
	if (!isValidHost(site)) throw new InvalidParameterError("Invalid site");
	let items;
	let category = ctx.params[1] ?? (Object.hasOwn(defaults_default, site) ? defaults_default[site] : "");
	category = Object.hasOwn(shortcuts_default, site) && Object.hasOwn(shortcuts_default[site], category) ? shortcuts_default[site][category] : category;
	const rootUrl = `https://${site}.dlut.edu.cn`;
	const currentUrl = `${rootUrl}/${category}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	if (site === "panjin") items = $("a.news").slice(0, -4);
	else if (site === "fldpj") items = $("li[id^=\"line_u9\"]").find("a");
	else {
		$(".Next, .rjxw_left, .pb_sys_common").remove();
		items = $(".txt, .itemlist, .wall, .list, .list01, .ny_list, .rjxw_right, .rj_yjs_con, .c_hzjl_list1, .winstyle67894, .winstyle80936, .winstyle50738, #lili").find("a");
	}
	items = items.slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((item) => {
		item = $(item);
		const result = { link: item.attr("href").startsWith("http") ? item.attr("href") : `${rootUrl}/${item.attr("href").replace(/^[./]+/, "")}` };
		if (site === "fldpj") {
			result.title = item.find("em").text();
			result.pubDate = parseDate(item.find("span").text());
		} else {
			const dateRegex = /(\d{4}[/年-]\d{2}[/月-]\d{2})/;
			let dateMatch = item.parent().text().match(dateRegex);
			if (!dateMatch) dateMatch = item.parent().parent().text().match(dateRegex);
			result.title = item.text().trim() === "" ? item.next().text() : item.text();
			if (dateMatch) result.pubDate = parseDate(dateMatch[1].replaceAll(/年|月/g, "-"));
		}
		return result;
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			item.description = load((await got_default({
				method: "get",
				url: item.link
			})).data)(".v_news_content, .conbox").html();
		} catch {}
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
