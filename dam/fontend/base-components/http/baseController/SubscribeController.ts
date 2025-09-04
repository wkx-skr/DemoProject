import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/subscribe";
class SubscribeController extends BaseController {
    /**
     * 添加订阅内容
     * @param requestBody SubscribeDto
     * @param http
     */
    public static addToSubscribe({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/add`, requestBody);
    }

    /**
     * 删除订阅
     * @param subId 订阅id
     * @param http
     * Test succeed at 2023-June-7
     */
    public static deleteSubscribe({subId, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/delete?subId=${subId}`);
    }

    /**
     * 获取当前用户的所有订阅内容
     * @param typeId 资产类型
     * @param http
     * Test succeed at 2023-June-7
     */
    public static loadUserSub({typeId, http}: any = {typeId: ''}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/loadUserSub?typeId=${typeId}`);
    }

    /**
     * 获取分页数据
     * @param requestBody SubscribeDto
     * @param http
     * Test succeed at 2023-June-7
     */
    public static loadUserSubPage({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/page`, requestBody);
    }
}
export default SubscribeController