import { t as got_default } from "./got-Dnzt41dd.mjs";
import { CookieJar } from "tough-cookie";
//#region lib/routes/bt0/util.ts
const cookieJar = new CookieJar();
async function doGot(num, host, link) {
	if (num > 4) throw new Error("The number of attempts has exceeded 5 times");
	const data = (await got_default.get(link, { cookieJar })).data;
	if (typeof data === "string") {
		const match = data.match(/document\.cookie\s*=\s*"([^"]*)"/);
		if (!match) throw new Error("api error");
		cookieJar.setCookieSync(match[1], host);
		return doGot(num + 1, host, link);
	}
	return data;
}
const genSize = (sizeStr) => {
	const match = sizeStr.match(/^(\d+(\.\d+)?)\s*(gb|mb)$/i);
	if (!match) return 0;
	const value = Number(match[1]);
	const unit = match[3].toUpperCase();
	let bytes;
	switch (unit) {
		case "GB":
			bytes = Math.floor(value * 1024 * 1024 * 1024);
			break;
		case "MB":
			bytes = Math.floor(value * 1024 * 1024);
			break;
		default: bytes = 0;
	}
	return bytes;
};
//#endregion
export { genSize as n, doGot as t };
