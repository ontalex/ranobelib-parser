import { KnownDevices, Protocol, type Browser, type Page, type PuppeteerNode } from "puppeteer";
import type { BrowserServiceModel } from "../../models/browser-service.model";
import { ErrorMsgModel } from "../../models/error-handler-service.model";
import { $errorService } from "../index";
import { json } from "stream/consumers";
import { AuthLSModel } from "models/auth-ls.model";
import { AuthService } from "../AuthService/index";
import { log } from "console";

export class BrowserService implements BrowserServiceModel {
    private $puppeteer: PuppeteerNode;

    constructor($puppeteer: PuppeteerNode) {
        this.$puppeteer = $puppeteer;
    }

    private checkPageStatus(status: number, url?: string): void {
        if (status === 429) {
            // Специальная обработка для ошибки 429 (Too Many Requests)
            const error = new Error(`Ошибка загрузки страницы. Код ошибки: 429`);
            (error as any).statusCode = 429;
            throw error;
        }
        if (status !== 200) {
            $errorService.throwError(ErrorMsgModel.PAGE_LOADING_ERROR, `${status}`);
        }
    }

    public async gotoPage(page: Page, url: string): Promise<void> {
        const response = await page.goto(url, { timeout: 0 });
        const status = response?.status() ?? 404;
        this.checkPageStatus(status, url);
    }

    public async startAuthServices(): Promise<{ pageAuth: Page; browserAuth: Browser, authData: AuthLSModel, cookies: Protocol.Network.Cookie[] }> {
        // 1. Запускаем браузер с видимым окном
        const browserAuth = await this.$puppeteer.launch({
            headless: false,          // обязательно — пользователь должен видеть окно
            defaultViewport: null,    // используем реальный размер окна
            args: ['--start-maximized']
        });

        const pageAuth = await browserAuth.newPage();

        // 2. Открываем страницу авторизации
        await pageAuth.goto('https://auth.lib.social/auth/login?iframe=0', {
            waitUntil: 'networkidle2'
        });

        console.log('Пожалуйста, авторизуйтесь в открывшемся окне...');

        let cookies: Protocol.Network.Cookie[] | null;
        let localState: {
            tokenData: any;
            // allLS: any | null;
        };

        console.log('Ожидае переход на страницу https://auth.lib.social/auth/accounts ...');
        await new Promise((resolve, reject) => {
            let lastUrl = pageAuth.url();
            const interval = setInterval(async () => {
                const current = pageAuth.url();

                if (current !== lastUrl) {
                    lastUrl = current;

                    if (current.includes("https://auth.lib.social/auth/accounts")) {
                        clearInterval(interval); // ← сначала останавливаем опрос

                        try {
                            await pageAuth.goto("https://ranobelib.me/ru", {
                                waitUntil: "networkidle2",
                            });
                            resolve(null); // ← завершаем промис ПОСЛЕ перехода
                        } catch (e) {
                            reject(e);
                        }
                    }
                }
            }, 500);
        });

        console.log('Обрабатываю авторизацию ...');

        await new Promise((resolve) => {
            const interval = setInterval(async () => {
                if (pageAuth.url().includes("https://ranobelib.me/ru")) {
                    clearInterval(interval); // ← не забываем чистить

                    await new Promise((res, rej) => setTimeout(() => res(null), 500));

                    await pageAuth.click('div.s2_q.s2_c5 button.btn:has(span)');
                    resolve(null);
                }
            }, 500);
        });

        console.log('подтвердайм что хотим использовать этот аккаунт ...');

        // подтвердайм что хотим использовать этот аккаунт
        await pageAuth.waitForNavigation({waitUntil: 'networkidle0',});
        await new Promise((res, rej) => setTimeout(() => res(null), 500));
        await new Promise((res, rej) => res(pageAuth.click('div.auth-form form button.btn')));
        await new Promise((res, rej) => setTimeout(() => res(null), 500));
        await pageAuth.waitForNavigation({waitUntil: 'networkidle0',});

        // 4. Забираем cookies
        cookies = await pageAuth.cookies();          // для текущего домена

        // 4.1 Проверяем куки данные
        // cookies.some((value, i, arr) => {

        // })

        new AuthService().storageCookie(cookies)

        // 6. Забираем token из localstore
        localState = await pageAuth.evaluate(() => {
            return {
                tokenData: JSON.parse(localStorage.getItem("auth") || ""),
            }
        })

        new AuthService().storageAuthData(localState.tokenData)

        return { pageAuth: pageAuth, browserAuth: browserAuth, authData: localState.tokenData, cookies: cookies };
    }

    public async startBrowser(): Promise<{ page: Page; browser: Browser }> {
        const browser = await this.$puppeteer.launch(
            {
                headless: false,
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--ignore-certificate-errors',
                    '--no-sandbox'
                ]
            }
        );

        const page = await browser.newPage();

        return { browser, page };
    }

    public async closeBrowser(browser: Browser): Promise<void> {
        await browser.close();
    }
}