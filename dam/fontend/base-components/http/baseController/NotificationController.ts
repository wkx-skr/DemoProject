import {BasePrefix, BaseController} from './BaseController';
// @ts-ignore
import axios from "axios";
const MappingPrefix = "/notifications";
class NotificationController extends BaseController {
    /**
     * 创建提醒消息
     * @param requestBody NotificationDto notification
     * @param sendOnly name = "sendOnly", defaultValue = "false"
     * @param http
     */
    public static createNotification({requestBody,sendOnly, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/createNotification?sendOnly=${sendOnly}`, requestBody);
    }
    /**
     * 获取当前用户的所有消息
     * @param requestBody
     * @param http
     */
    public static getNotifications({requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getUserNotifications`, requestBody);
    }

    /**
     * 获取分页的信息列表
     * @param currentPage 当前页码
     * @param pageSize 每页大小
     * @param inbox 发件箱或者收件箱
     * @param orderBy 依据哪个字段排序
     * @param sort 升序还是降序排列结果
     * @param isRead 已读或未读
     * @param http
     */
    public static getNotificationsPage({currentPage,pageSize, inbox, orderBy, sort, isRead, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.get(BasePrefix + MappingPrefix + `/getNotificationsByPage?currentPage=${currentPage}&pageSize=${pageSize}&inbox=${inbox}&orderBy=${orderBy}&sort=${sort}&isRead=${isRead}`);
    }

    /**
     * 根据ID获取一条消息内容
     * @param id
     * @param http
     */
    public static getNotification({id, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getNotificationById?id=${id}`);
    }

    /**
     * 修改一条消息
     * @param id
     * @param requestBody NotificationDto notification
     * @param http
     */
    public static updateNotification({id, requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/updateNotification?id=${id}`, requestBody);
    }

    /**
     * 获取当前用户已经发送的消息
     * @param http
     */
    public static getUserSentNotifications({http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/getUserSentNotifications`);
    }

    /**
     *
     * @param ids
     * @param http
     */
    public static deleteNotifications({ids, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/deleteNotifications?ids=${ids}`);
    }

    /**
     * 把指定消息标记为已读
     * @param read
     * @param ifAll
     * @param requestBody List<Long> ids
     * @param http
     */
    public static updateNotificationsRead({read, ifAll, requestBody, http}: any = {}): Promise<any> {
        const $http = http ? http : axios;
        return $http.post(BasePrefix + MappingPrefix + `/markNotificationIsRead?read=${read}&ifAll=${ifAll}`, requestBody);
    }
}
export default NotificationController