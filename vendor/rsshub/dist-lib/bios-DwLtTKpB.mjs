import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/asus/bios.tsx
const endPoints = {
	zh: {
		url: "https://odinapi.asus.com.cn/",
		lang: "cn",
		websiteCode: "cn"
	},
	en: {
		url: "https://odinapi.asus.com/",
		lang: "en",
		websiteCode: "global"
	}
};
const getProductInfo = (model, language) => {
	const { url, lang, websiteCode } = endPoints[language] ?? endPoints.zh;
	const searchAPI = `${url}recent-data/apiv2/SearchSuggestion?SystemCode=asus&WebsiteCode=${websiteCode}&SearchKey=${model}&SearchType=ProductsAll&RowLimit=4&sitelang=${lang}`;
	return cache_default.tryGet(`asus:bios:${model}:${language}`, async () => {
		const product = (await rofetch(searchAPI)).Result[0].Content[0];
		return {
			productID: product.DataId,
			hashId: product.HashId,
			url: product.Url,
			title: product.Title,
			image: product.ImageURL,
			m1Id: product.M1Id,
			productLine: product.ProductLine
		};
	});
};
const route = {
	path: "/bios/:model/:lang?",
	categories: ["program-update"],
	example: "/asus/bios/RT-AX88U/zh",
	parameters: {
		model: "Model, can be found in product page",
		lang: {
			description: "Language, provide access routes for other parts of the world",
			options: [{
				label: "Chinese",
				value: "zh"
			}, {
				label: "Global",
				value: "en"
			}],
			default: "en"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [
			"www.asus.com/displays-desktops/:productLine/:series/:model",
			"www.asus.com/laptops/:productLine/:series/:model",
			"www.asus.com/motherboards-components/:productLine/:series/:model",
			"www.asus.com/networking-iot-servers/:productLine/:series/:model",
			"www.asus.com/:region/displays-desktops/:productLine/:series/:model",
			"www.asus.com/:region/laptops/:productLine/:series/:model",
			"www.asus.com/:region/motherboards-components/:productLine/:series/:model",
			"www.asus.com/:region/networking-iot-servers/:productLine/:series/:model"
		],
		target: "/bios/:model"
	}],
	name: "BIOS",
	maintainers: ["Fatpandac"],
	handler,
	url: "www.asus.com"
};
async function handler(ctx) {
	const model = ctx.req.param("model");
	const language = ctx.req.param("lang") ?? "en";
	const productInfo = await getProductInfo(model, language);
	const items = (await rofetch(language === "zh" ? `https://www.asus.com.cn/support/webapi/ProductV2/GetPDBIOS?website=cn&pdid=${productInfo.productID}` : `https://www.asus.com/support/webapi/ProductV2/GetPDBIOS?website=global&pdid=${productInfo.productID}`)).Result.Obj[0].Files.map((item) => ({
		title: item.Title || `${productInfo.title} BIOS ${item.Version}`,
		description: renderToString(language === "zh" ? /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("p", { children: "更新信息：" }),
			raw(item.Description),
			/* @__PURE__ */ jsxs("p", { children: ["版本: ", item.Version] }),
			/* @__PURE__ */ jsxs("p", { children: ["大小: ", item.FileSize] }),
			/* @__PURE__ */ jsxs("p", { children: [
				"下载链接: ",
				/* @__PURE__ */ jsx("a", {
					href: `https://dlcdnets.asus.com.cn${item.DownloadUrl.China}`,
					children: "中国下载"
				}),
				" | ",
				/* @__PURE__ */ jsx("a", {
					href: `https://dlcdnets.asus.com${item.DownloadUrl.Global}`,
					children: "全球下载"
				})
			] })
		] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Changes:" }) }),
			raw(item.Description),
			/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("b", { children: "Version:" }),
				" ",
				item.Version
			] }),
			/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("b", { children: "Size:" }),
				" ",
				item.FileSize
			] }),
			/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("b", { children: "Download:" }),
				" ",
				/* @__PURE__ */ jsx("a", {
					href: `https://dlcdnets.asus.com${item.DownloadUrl.Global}`,
					children: item.DownloadUrl.Global.split("/").pop().split("?", 1)[0]
				})
			] })
		] })),
		guid: productInfo.url + item.Version,
		pubDate: parseDate(item.ReleaseDate, "YYYY/MM/DD"),
		link: productInfo.url
	}));
	return {
		title: `${productInfo.title} BIOS`,
		link: productInfo.url,
		image: productInfo.image,
		item: items
	};
}
//#endregion
export { route };
