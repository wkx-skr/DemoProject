import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/main";
class GatewayMainController extends BaseController {
    public static getUserLists({http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/user/getUserLists`);
    }
    public static updateUserPassword({http, requestBody}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/update/password`, requestBody);
    }
    public static getAbout({http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/about`);
    }
    public static wordz({http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/wordz`);
    }
}
export default GatewayMainController