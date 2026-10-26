import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ipsw/index.ts
const host = "https://ipsw.me/";
const route = {
	path: "/index/:ptype/:pname",
	categories: ["program-update"],
	example: "/ipsw/index/ipsws/iPad8,11",
	parameters: {
		ptype: "Fill in ipsws or otas to get different versions of firmware",
		pname: "Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model"
	},
	name: "Apple Firmware Update-IPSWs/OTAs version",
	maintainers: ["Jeason0228"],
	handler
};
function replaceurl(e) {
	e = e.replace("';", "");
	e = e.replace("window.location = '/", () => host);
	return e;
}
async function handler(ctx) {
	const { pname, ptype } = ctx.req.param();
	let link = `https://ipsw.me/product/${pname}`;
	if (pname.includes(",")) {
		if (ptype === "otas") link = `https://ipsw.me/${ptype}/${pname}`;
		else if (ptype === "ipsws") link = `https://ipsw.me/${pname}`;
	} else link = `https://ipsw.me/product/${pname}`;
	const $ = load((await got_default({
		method: "get",
		url: link,
		headers: { Referer: host }
	})).data);
	const list = pname.includes(",") ? $(".firmware").toArray().map((item) => {
		return {
			title: $(item).find("td").eq(1).text(),
			link: replaceurl($(item).attr("onclick"))
		};
	}) : $(".products a").toArray().map((item) => {
		return {
			title: $(item).find("img").attr("alt"),
			link: $(item).attr("href")
		};
	});
	const out = await Promise.all(list.map((info) => {
		const title = info.title;
		const itemUrl = new URL(info.link, host).href;
		return cache_default.tryGet(itemUrl, async () => {
			const $ = load((await got_default({
				method: "get",
				url: itemUrl,
				headers: { Referer: host }
			})).data);
			const description = $("div.selector__wizard").html();
			let removeString;
			removeString = pname.includes(",") ? $("div.table-responsive table tr").first().find("td").text().trim() : $("tr.firmware").first().find("td").eq(2).text().trim();
			removeString = removeString.replace("th", "").replace("nd", "").replace("st", "").replace("rd", "");
			const rdate = removeString.replaceAll(" ", ",");
			return {
				title,
				link: itemUrl,
				description,
				pubDate: new Date(rdate).toLocaleDateString(),
				guid: title
			};
		});
	}));
	return {
		title: `${pname} - ${ptype} Released`,
		link,
		description: `查看Apple-${pname}- ${ptype} 固件-是否关闭验证`,
		item: out
	};
}
//#endregion
export { route };
