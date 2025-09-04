import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/widget";
class FrontEndWidgetController extends BaseController {
    /**
     * 保存UI组件的配置
     * @param requestBody
     *          bodyExample = "{\"widgetId\":\"example1\", \"content\":\"configurations\""
     * @param http
     */
    public static saveGraphConfig({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/saveWidgetConfig`, requestBody);
    }
    /**
     * 获取UI组件的配置
     * @param id 组件的ID
     * @param http
     */
    public static getWidgetConfig({id, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getWidgetConfig?id=${id}`);
    }
}
export default FrontEndWidgetController