import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/reset/password";
class ResetPasswordController extends BaseController {
    public static resetPasswordByUserName({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/byUserName`, requestBody);
    }
    public static resetPasswordByUniqueId({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/byUniqueId`, requestBody);
    }
}
export default ResetPasswordController