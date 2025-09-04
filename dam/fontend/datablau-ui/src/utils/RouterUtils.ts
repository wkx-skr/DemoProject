// @ts-ignore
import $directory from "../../public/conf/directory";
export default class RouterUtils {
    public static getUrlQuery(query: object): string {
        if (query) {
            // @ts-ignore
            return '?' + Object.keys(query).map(i => `${i}=${query[i]}`).join('&')
        }
        return ''
    }

    public static getFullUrl(index: string, query: object): string {
        const appsMap = new Map()
        // @ts-ignore
        $directory.apps.forEach(app => {
            appsMap.set(app.name, app)
        })
        let env = window.sessionStorage.getItem('env')
        if (!env) {
            env = 'production'
        }
        const NewPage = $directory.pagesMap[index]
        if (env.toLowerCase().startsWith('dev')) {
            return `${location.protocol}//${location.hostname}:${appsMap.get(NewPage.appName).devPort}/#${NewPage.vueRouter}` + this.getUrlQuery(query)
        } else if (env.toLowerCase().startsWith('prod')) {
            return `${location.origin}/${appsMap.get(NewPage.appName).productionPath}/#${NewPage.vueRouter}` + this.getUrlQuery(query)
        }
        return ''
    }
}