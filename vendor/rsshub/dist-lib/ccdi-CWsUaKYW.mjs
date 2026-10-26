import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import { Cookie, CookieJar } from "tough-cookie";
//#region lib/routes/gov/ccdi/utils.ts
const cookieJar = new CookieJar();
const owner = "中央纪委国家监委网站";
const rootUrl = "https://www.ccdi.gov.cn";
const regex = /(?<key>[A-Z_]+)=(?<value>.*?(?=; max-age)|[\dA-Fa-f]+)/g;
const parseCookie = async (body) => {
	let m;
	const cookies = [];
	while ((m = regex.exec(body)) !== null) {
		if (m.index === regex.lastIndex) regex.lastIndex++;
		const { key, value } = m.groups;
		cookies.push(new Cookie({
			key,
			value
		}));
	}
	await Promise.all(cookies.map((c) => cookieJar.setCookie(c, rootUrl)));
};
const parseNewsList = async (url, selector, ctx) => {
	const data = (await got_default(url, { cookieJar })).data;
	await parseCookie(data);
	const $ = load(data);
	return {
		list: $(selector).slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20).toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").first().text().trim(),
				link: new URL(item.find("a").first().attr("href"), url).href,
				pubDate: parseDate(item.find(".more").text(), "YYYY-MM-DD")
			};
		}),
		title: $(".other_Location").text().replace(/(.+)首页/, () => owner)
	};
};
const changeTrCookie = async () => {
	const c = (await cookieJar.getCookies(rootUrl)).find((c) => c.key === "HOY_TR");
	if (c) {
		const tr_array = c.value.split(",");
		const csr = tr_array[0];
		const cnv = [...tr_array[1]];
		const otr = [...tr_array[2]];
		otr[0] = csr.charAt(Number.parseInt(cnv[0], 16));
		const nc = new Cookie({
			key: "HOY_TR",
			value: csr + "," + cnv.join("") + "," + otr.join("") + ",0"
		});
		await cookieJar.setCookie(nc, rootUrl);
	}
};
const parseArticle = async (item) => {
	await changeTrCookie();
	return cache_default.tryGet(item.link, async () => {
		const data = (await got_default(item.link, { cookieJar })).data;
		await parseCookie(data);
		const $ = load(data);
		const title = $(".daty, .source-box").text().trim();
		item.author = title.match(/来源：(.*)发布时间/s)?.[1].trim() ?? owner;
		item.pubDate = timezone(parseDate(title.match(/发布时间：(.*)分享/s)?.[1].trim() ?? item.pubDate), 8);
		$(".content, .bom-box").find("img").each((_, el) => {
			$(el).attr("src", new URL($(el).attr("src"), item.link).href);
			$(el).removeAttr("oldsrc").removeAttr("alt");
		});
		item.description = $(".content, .bom-box").html();
		return item;
	});
};
//#endregion
//#region lib/routes/gov/ccdi/index.ts
const route = {
	path: "/:path{.+}?",
	name: "要闻",
	example: "/gov/ccdi/yaowenn",
	parameters: { path: "路径，默认为 要闻" },
	radar: [{
		source: ["www.ccdi.gov.cn/*path"],
		target: "/:path"
	}],
	features: { antiCrawler: true },
	maintainers: ["bigfei"],
	handler,
	description: `::: tip

路径处填写对应页面 URL 中 \`http://www.ccdi.gov.cn/\` 后的字段。下面是一个例子。

若订阅 [审查调查 > 中管干部 > 执纪审查](https://www.ccdi.gov.cn/scdcn/zggb/zjsc/) 则将对应页面 URL <https://www.ccdi.gov.cn/scdcn/zggb/zjsc/> 中 \`http://www.ccdi.gov.cn/\` 后的字段 \`scdcn/zggb/zjsc\` 作为路径填入。此时路由为 [\`/gov/ccdi/scdcn/zggb/zjsc\`](https://rsshub.app/gov/ccdi/scdcn/zggb/zjsc)

:::`
};
async function handler(ctx) {
	const { path = "yaowenn" } = ctx.req.param();
	const currentUrl = `${rootUrl}${`/${path}${path.endsWith("/") ? "" : "/"}`}`;
	const { list, title } = await parseNewsList(currentUrl, ".list_news_dl2 li", ctx);
	return {
		title,
		link: currentUrl,
		item: await Promise.all(list.map((item) => parseArticle(item)))
	};
}
//#endregion
export { route };
