import { Page, Protocol } from "puppeteer";
import fs from "fs";
import { AuthLSModel } from "models/auth-ls.model";

export class AuthService {
    storageAuthData(localState: any) {
        try {
            fs.writeFileSync("auth_data.json", JSON.stringify(localState, null, 2));
            console.log(">> Write as AuthData:", JSON.stringify(localState))
        } catch (error) {
            console.log("ERROR AuthService (storageAuthData):", error)
        }
    }
    storageCookie(cookies: Protocol.Network.Cookie[]) {
        try {
            fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
        }
        catch (error) {
            console.log("ERROR AuthService (storageCookie):", error)
        }
    }

    getAuthData(): AuthLSModel {
        let authData;
        try {
            authData = JSON.parse(fs.readFileSync("auth_data.json", "utf-8"));
        }
        catch (error) {
            console.log("ERROR AuthService (getAuthData):", error)
        }
        return authData
    }
    getCookie(): Protocol.Network.Cookie[] {
        let cookies;
        try {
            cookies = JSON.parse(fs.readFileSync("cookies.json", "utf-8"));
        }
        catch (error) {
            console.log("ERROR AuthService (getAuthData):", error)
        }
        return cookies
    }
    async applayCookieToPage(page: Page) {
        // console.log(">> Устанавливаю куки для страница ", page.url());

        const cookies = new AuthService().getCookie();

        await page.setCookie(...cookies);
    }
}