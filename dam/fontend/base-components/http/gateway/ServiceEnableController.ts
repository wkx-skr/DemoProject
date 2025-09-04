import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/server";
class ServiceEnableController extends BaseController {
    public static getEnable({http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getEnable`);
    }
    public static getEnableList({http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getEnableList`);
    }
}
export default ServiceEnableController