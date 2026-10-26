import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nintendo/templates/eshop-hk.tsx
const renderEshopHkDescription = ({ host, attributes, description, gallery, jsonData, priceData }) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: host === "store.nintendo.com.hk" ? /* @__PURE__ */ jsxs(Fragment, { children: [
	gallery ? gallery.map((item, index) => item.type === "image" && item.isMain ? /* @__PURE__ */ jsx("img", { src: item.full || item.img || item.thumb }, `${item.full ?? item.img ?? item.thumb}-${index}`) : null) : null,
	/* @__PURE__ */ jsxs("table", { children: [
		/* @__PURE__ */ jsxs("tr", { children: [attributes?.platform ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "支援平台：" }), /* @__PURE__ */ jsx("td", { children: attributes.platform })] }) : null, attributes?.supported_languages ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "對應語言：" }), /* @__PURE__ */ jsx("td", { children: attributes.supported_languages })] }) : null] }),
		/* @__PURE__ */ jsxs("tr", { children: [attributes?.game_category ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "遊戲類型：" }), /* @__PURE__ */ jsx("td", { children: attributes.game_category })] }) : null, attributes?.required_space ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "所需容量（約）：" }), /* @__PURE__ */ jsx("td", { children: attributes.required_space })] }) : null] }),
		/* @__PURE__ */ jsxs("tr", { children: [attributes?.release_date ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "發售日：" }), /* @__PURE__ */ jsx("td", { children: attributes.release_date })] }) : null, attributes?.supported_controllers ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "支援的控制器：" }), /* @__PURE__ */ jsx("td", { children: attributes.supported_controllers })] }) : null] }),
		/* @__PURE__ */ jsxs("tr", { children: [attributes?.publisher ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "發行商：" }), /* @__PURE__ */ jsx("td", { children: attributes.publisher })] }) : null, attributes?.supported_play_modes ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "遊玩模式：" }), /* @__PURE__ */ jsx("td", { children: attributes.supported_play_modes })] }) : null] }),
		/* @__PURE__ */ jsxs("tr", { children: [attributes?.no_of_players ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "遊玩人數：" }), /* @__PURE__ */ jsx("td", { children: attributes.no_of_players })] }) : null, attributes?.price ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "售價：" }), /* @__PURE__ */ jsxs("td", { children: [
			attributes.currency,
			" ",
			attributes.price
		] })] }) : null] })
	] }),
	attributes?.disclaimer ? /* @__PURE__ */ jsx(Fragment, { children: attributes.disclaimer }) : null,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null,
	/* @__PURE__ */ jsx("br", {}),
	gallery ? gallery.map((item, index) => item.type === "image" && !item.isMain ? /* @__PURE__ */ jsx("img", { src: item.full || item.img || item.thumb }, `${item.full ?? item.img ?? item.thumb}-${index}`) : null) : null
] }) : host === "ec.nintendo.com" ? /* @__PURE__ */ jsxs(Fragment, { children: [
	jsonData?.hero_banner_url ? /* @__PURE__ */ jsx("img", { src: jsonData.hero_banner_url }) : null,
	/* @__PURE__ */ jsx("h2", { children: jsonData?.catch_copy }),
	/* @__PURE__ */ jsx("div", { children: jsonData?.description ? raw(jsonData.description.replaceAll("\n", "<br>")) : null }),
	jsonData?.notices ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("span", { children: "廠商通知" }),
		/* @__PURE__ */ jsx("div", { children: jsonData.notices[0].text }),
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	/* @__PURE__ */ jsxs("table", { children: [
		priceData ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "售價" }), /* @__PURE__ */ jsx("td", { children: priceData.price?.regular_price?.formatted_value })] }) : null,
		jsonData?.total_rom_size ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "需要空間" }), /* @__PURE__ */ jsxs("td", { children: [(jsonData.total_rom_size / 1024 / 1024 / 1024).toFixed(1), " GB"] })] }) : null,
		jsonData?.play_styles ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "遊玩模式" }), /* @__PURE__ */ jsx("td", { children: jsonData.play_styles.map((style) => style.name).join(", ") })] }) : null,
		jsonData?.player_number ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "遊玩人數" }), /* @__PURE__ */ jsx("td", { children: jsonData.player_number.offline_max })] }) : null,
		jsonData?.player_number ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "鄰近主機通訊遊玩人數" }), /* @__PURE__ */ jsx("td", { children: jsonData.player_number.local_max })] }) : null,
		jsonData?.player_number ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "網路通訊遊玩人數" }), /* @__PURE__ */ jsx("td", { children: jsonData.player_number.online_max })] }) : null,
		jsonData?.controllers ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "對應控制器" }), /* @__PURE__ */ jsx("td", { children: jsonData.controllers.map((controller) => controller.name).join(", ") })] }) : null,
		jsonData?.cloud_backup_type ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "保管儲存資料" }), /* @__PURE__ */ jsx("td", { children: jsonData.cloud_backup_type === "supported" ? "對應" : "不對應" })] }) : null,
		jsonData?.platform ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "平台" }), /* @__PURE__ */ jsx("td", { children: jsonData.platform.name })] }) : null,
		jsonData?.publisher ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "廠商" }), /* @__PURE__ */ jsx("td", { children: jsonData.publisher.name })] }) : null,
		jsonData?.genre ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "類型" }), /* @__PURE__ */ jsx("td", { children: jsonData.genre })] }) : null,
		jsonData?.release_date_on_eshop ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "發布日" }), /* @__PURE__ */ jsx("td", { children: jsonData.release_date_on_eshop })] }) : null,
		jsonData?.languages ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "對應語言" }), /* @__PURE__ */ jsx("td", { children: jsonData.languages.map((language) => language.name).join(", ") })] }) : null
	] }),
	jsonData?.network_feature_description ? /* @__PURE__ */ jsxs(Fragment, { children: [jsonData.network_feature_description, /* @__PURE__ */ jsx("br", {})] }) : null,
	jsonData?.copyright_text ? /* @__PURE__ */ jsx(Fragment, { children: jsonData.copyright_text }) : null,
	jsonData?.screenshots ? jsonData.screenshots.map((screen, screenIndex) => screen.images?.map((image, imageIndex) => /* @__PURE__ */ jsx("img", { src: image.url }, String(image.url ?? `${screenIndex}-${imageIndex}`)))) : null
] }) : null }));
//#endregion
//#region lib/routes/nintendo/eshop-hk.ts
const route = {
	path: "/eshop/hk",
	radar: [{ source: ["nintendo.com.hk/software/switch", "nintendo.com.hk/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "nintendo.com.hk/software/switch"
};
async function handler(ctx) {
	const data = (await got_default("https://www.nintendo.com.hk/data/json/switch_software.json")).data.filter(({ link }) => link.startsWith("https://")).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30);
	return {
		title: "Nintendo eShop（港服）新游戏",
		link: "https://www.nintendo.com.hk/software/switch/",
		description: "Nintendo eShop（港服）新上架的游戏",
		item: await Promise.all(data.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			let description;
			if (item.link.startsWith("https://store.nintendo.com.hk/")) {
				const attributes = {
					platform: $(".platform .product-attribute-val").text(),
					game_category: $(".game_category .product-attribute-val").text(),
					release_date: $(".release_date .product-attribute-val").text(),
					publisher: $(".publisher .product-attribute-val").text(),
					no_of_players: $(".no_of_players .product-attribute-val").text(),
					supported_languages: $(".supported_languages .product-attribute-val").text(),
					required_space: $(".required_space .product-attribute-val").text(),
					supported_controllers: $(".supported_controllers .product-attribute-val").text(),
					supported_play_modes: $(".supported_play_modes .product-attribute-val").text(),
					disclaimer: $(".disclaimer .product-attribute-val p").text(),
					price: $("meta[property=\"product:price:amount\"]").attr("content"),
					currency: $("meta[property=\"product:price:currency\"]").attr("content")
				};
				const gallery = JSON.parse($("[type=text/x-magento-init]").text().match(/\{\n\s+"\[data-gal{2}ery-role=gal{2}ery-placeholder\]": \{\n\s+"mage(?:\/gal{2}ery){2}".*?\}{4}(?:\s+\}\n){3}/s));
				description = renderEshopHkDescription({
					attributes,
					description: $(".description").html(),
					gallery: gallery["[data-gallery-role=gallery-placeholder]"]["mage/gallery/gallery"].data,
					host: "store.nintendo.com.hk"
				});
			} else if (item.link.startsWith("https://ec.nintendo.com/")) {
				const jsonData = JSON.parse(response.match(/NXSTORE\.titleDetail\.jsonData = (\{.*?\});/)[1]);
				const { data: priceData } = await got_default("https://ec.nintendo.com/api/HK/zh/guest_prices", { searchParams: { ns_uids: jsonData.id } });
				description = renderEshopHkDescription({
					host: "ec.nintendo.com",
					jsonData,
					priceData: priceData[0]
				});
			}
			return {
				title: item.title,
				description,
				link: item.link,
				pubDate: parseDate(item.release_date, "YYYY.M.D")
			};
		})))
	};
}
//#endregion
export { route };
