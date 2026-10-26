import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/zhiy/utils.ts
const baseUrl = "https://zhiy.cc";
const fetchUserDate = async (author) => {
	const { data: userData } = await got_default(`${baseUrl}/api/app/share/garden/users/${author}`);
	return userData;
};
//#endregion
export { fetchUserDate as n, baseUrl as t };
