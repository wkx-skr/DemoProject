import {BasePrefix, BaseController} from './BaseController';
const MappingPrefix = "/modelCategory";
// @ts-ignore
import axios from "axios";
class ModelCategoryController extends BaseController {
    /**
     * 获取应用系统
     * @param http 可选参数,你希望使用的http
     * Test succeed before 2023-June-2
     */
    public static getModelCategoriesWithUdp({http}: any = {}):Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + "/getModelCategories");
    }

    /**
     * 新增应用系统
     * @param requestBody 请求体 ModelCategoryParamDto
     * @param http 可选参数,你希望使用的http
     * Test failed at 2023-June-2 16:00
     * Test succeed at 2023-June-2 16:23
     */
    public static createModelCategory({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + "/createModelCategory", requestBody);
    }
    /**
     * 修改应用系统
     * @param requestBody 请求体 ModelCategoryParamDto
     * @param http 可选参数,你希望使用的http
     * Test  succeed at 2023-June-2 16:02
     */
    public static updateModelCategory({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + "/updateModelCategory", requestBody);
    }
    /**
     * 删除应用系统
     * @param requestBody 请求体 ModelCategoryParamDto,后端只关心categoryId和appName
     * @param http 可选参数,你希望使用的http
     * Test failed at 2023-June-2 16:
     * Test succeed at 2023-June-2 16:23
     */
    public static deleteModelCategory({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + "/deleteModelCategory", requestBody);
    }
    /**
     * 根据系统id查询指定系统
     * @param categoryId 应用系统id, required
     * @param http
     */
    public static getModelCategoryById({categoryId, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getModelCategoryById?categoryId=${categoryId}`);
    }
    /**
     * 导入系统
     * 仅提供url，不提供封装方法
     * Test failed at 2023-June-6 16:24
     */
    public static uploadModelCategories(): string {
        return BasePrefix + MappingPrefix + "/uploadModelCategory";
    }
    /**
     * 应用系统列表文件导出
     * 仅提供url，不提供封装方法
     * Test succeed at 2023-June-6 16:20
     */
    public static exportSysList(): string {
        return BasePrefix + MappingPrefix + `/exportModelCategory`;
    }
    /**
     * 下载应用系统模板
     * 仅提供url，不提供封装方法
     * Test failed at 2023-June-6 16:24
     */
    public static exportModelCategoryTemplate(): string {
        return BasePrefix + MappingPrefix + `/exportTemplate`
    }
    /**
     * 获取指定系统的用户
     * @param requestBody: ModelCategoryParamDto,后台会调用其中的param.getCategoryId(), param.getAppName()方法
     * @param http
     */
    public static getModelCategoryUsers({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getModelCategoryUsers`, requestBody);
    }
    /**
     * 更新某个系统的用户
     * @param requestBody: ModelCategoryToUserDto
     *                      @Schema(title = "系统id", required = true)
     *                      private Long modelCategoryId;
     *                      @Schema(title = "用户名", required = true)
 *                          private Set<Long> userIds;
     *                      @Schema(title = "服务名称，例如：DAM、DDM等", required = true)
     *                      private String appName = "DAM";
     * @param http
     */
    public static updateModelCategoryUsers({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/updateModelCategoryUsers`, requestBody);
    }
    /**
     * 将用户添加到系统
     * @param requestBody: UserToModelCategoryDto
     *                      @Schema(title = "用户名", required = true)
     *                      private String username;
     *                      @Schema(title = "系统id", required = true)
     *                      private List<Long> modelCategoryIds;
     *                      @Schema(title = "服务名称，例如：DAM、DDM等", required = true)
     *                      private String appName = "DAM";
     *                      @Schema(title = "是否删除旧的数据")
     *                      boolean cleanOldCategories;
     * @param http
     */
    public static addUserToGroups({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/addModelCategoryUsers`, requestBody);
    }
    /**
     * 把用户从系统移除
     * @param requestBody: UserToModelCategoryDto,同上
     * @param http
     */
    public static removeUserFromGroups({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/removeModelCategoryUsers`, requestBody);
    }
    /**
     * 获取某个用户的系统
     * @param username 用户名
     * @param appName 服务名称
     * @param http
     */
    public static getUserAccessibleModelCategoryIds({username, appName, http}: any = {appName: 'DAM'}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getModelCategoryIdByUsername?username=${username}&appName=${appName}`);
    }
}
export default ModelCategoryController