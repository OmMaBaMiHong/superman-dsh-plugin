import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/yxdown/utils.ts
const rootUrl = "http://www.yxdown.com";
const getCookie = async () => {
	return (await got_default(rootUrl)).data.match(/(?<=.cookie=").*(?=; path)/g)[0];
};
//#endregion
export { rootUrl as n, getCookie as t };
