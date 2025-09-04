import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/udps";
class UserDefinedPropertyController extends BaseController {
    /**
     * 得到一个类型的所有udp
     * @param typeId 类型ID
     * @param http
     * Test succeed at 2023-June-6 18:06
     */
    public static getTypeUdps({typeId, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getUdpsOfType?typeId=${typeId}`);
    }

    /**
     * 得到一个UDP的所有已经被使用的值的列表
     * @param udpId
     * @param http
     */
    public static getValuesOfUdp({udpId, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getValuesOfUdp?udpId=${udpId}`);
    }

    /**
     * 得到指定的UDP的已经被使用的值
     * @param requestBody: List<Long> udpIds
     * @param http
     */
    public static getValuesOfUdpMap({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getValuesOfGivenUdps`, requestBody);
    }

    /**
     * 对一种类型创建或者更新一条udp
     * @param typeId 类型ID
     * @param requestBody: MetadataUserDefinedProperty
     * @param http
     */
    public static createOrUpdateUdp({typeId, requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/updateUdpOfType?typeId=${typeId}`, requestBody);
    }
    /**
     * 删除一个udp
     * @param udpId
     * @param http
     */
    public static deleteUdp({udpId, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/deleteUdp?udpId=${udpId}`);
    }

    /**
     * 创建一个自定义属性值
     * @param itemId 对象的id
     * @param udpId
     * @param containerType 上层集合对象类型ID， 比如Datasource, Table
     * @param containerId 上层集合对象的id
     * @param requestBody: String value
     * @param http
     */
    public static createUdpValue({itemId, udpId, containerType, containerId, requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/updateItemUdpValue?itemId=${itemId}&udpId=${udpId}&containerType=${containerType}&containerId=${containerId}`, requestBody);
    }

    /**
     * 修改UDP值
     * @param valueId udp值的ID
     * @param requestBody: (required = false) String value
     * @param http
     */
    public static updateUdpValue({valueId, requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/updateItemUdpValue?valueId=${valueId}`, requestBody);
    }

    /**
     * 获取对象的UDP
     * @param itemId 对象id
     * @param typeId 对象类型id
     * @param http
     */
    public static getUdpValuesByItemIdAndTypeId({itemId, typeId, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getItemUdps?itemId=${itemId}&typeId=${typeId}`);
    }
}
export default UserDefinedPropertyController