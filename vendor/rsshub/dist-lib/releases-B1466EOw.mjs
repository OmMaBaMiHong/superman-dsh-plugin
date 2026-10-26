import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/openwrt/releases.ts
const route = {
	path: "/releases/:brand/:model",
	radar: [{
		source: ["openwrt.org/toh/:band/:model"],
		target: "/releases/:model"
	}],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const url = `https://openwrt.org/toh/${ctx.req.param("brand")}/${ctx.req.param("model")}`;
	const $ = load((await got_default(url)).data);
	const table = $("#installation").next();
	return {
		title: $("h1").text() + " - OpenWrt Releases",
		link: url,
		description: $(".dw-content div.level1").text(),
		language: "en-US",
		item: [{
			title: table.find(".supported_current_rel").text(),
			link: url,
			description: `Firmware OpenWrt Install: ${table.find(".firmware_openwrt_install_url").html()}<br><br>Firmware OpenWrt Upgrade: ${$(".firmware_openwrt_upgrade_url").html()}'`
		}]
	};
}
//#endregion
export { route };
