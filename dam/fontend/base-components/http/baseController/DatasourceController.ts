import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/datasources";
class DatasourceController extends BaseController {
  /**
   * 查询指定的数据源
   * @param keyWord 模糊搜索关键字
   * @param http
   * Test succeed at 2023-June-26 14:20
   */
  public static findDatasources({requestBody, http}: any = {}): Promise<any> {
    const $http = http ? http : axios;
    return $http.post(BasePrefix + MappingPrefix + '/findDatasources', requestBody);
  }
  /**
   * 列出所有的数据源插件列表
   * @param http
   * Test succeed at 2023-June-26 17:29
   */
  public static getAllPlugins({http}: any = {}): Promise<any> {
    const $http = http ? http : axios;
    return $http.post(BasePrefix + MappingPrefix + '/getAllPlugins');
  }
}
export default DatasourceController
