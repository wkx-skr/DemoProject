import {BasePrefix, BaseController} from "./BaseController";
import axios from "axios";

const MappingPrefix = "/main";
class GatewayMainController extends BaseController {
    public static getUserLists({http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/user/getUserLists`);
    }
}
export default GatewayMainController