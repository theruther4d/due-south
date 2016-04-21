/**
 * @Class BrowserWindow - exposes cross-browser window, document, and body nodes and measurements. Largely stolen from http://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window.
 */
class BrowserWindow {
    constructor() {
        const BWBody = document.getElementsByTagName( 'body' )[0];

        this.window = window,
        this.document = document || document.documentElement,
        this.width = window.innerWidth || document.documentElement.clientWidth || BWBody.clientWidth,
        this.height = window.innerHeight || document.documentElement.clientHeight || BWBody.clientHeight
    }
};

export default new BrowserWindow();
