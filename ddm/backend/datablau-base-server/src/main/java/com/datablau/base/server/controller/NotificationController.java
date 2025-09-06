package com.datablau.base.server.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.search.QueryPage;
import com.datablau.base.api.NotificationService70;
import com.datablau.base.data.BriefNotificationDto;
import com.datablau.base.data.NotificationDto;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2019/1/15 11:04
 */
@RestController
@RequestMapping("/notifications")
@Tag(name = "提醒相关API")
public class NotificationController extends BaseController {

    @Autowired
    private NotificationService70 notificationService;

    public NotificationController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/createNotification")
    @Operation(summary = "创建提醒消息")
    public NotificationDto createNotification(
        @RequestParam(name = "sendOnly", defaultValue = "false") Boolean sendOnly,
        @RequestBody NotificationDto notification) {
        return notificationService.submitNotification(notification, sendOnly);
    }

    @PostMapping("/getUserNotifications")
    @Operation(summary = "获取当前用户的所有消息")
    public List<BriefNotificationDto> getNotifications() {
        return notificationService.getUserNotifications();
    }

    @GetMapping("/getNotificationsByPage")
    @Operation(summary = "获取分页的信息列表")
    public PageResult<BriefNotificationDto> getNotificationsPage(@Parameter(name = "currentPage", description = "当前页码") @Description("当前页码") @RequestParam("currentPage") Integer currentPage,
                                                        @Parameter(name = "pageSize", description = "每页大小") @Description("每页大小") @RequestParam("pageSize") Integer pageSize,
                                                        @Parameter(name = "inbox", description = "发件箱或者收件箱") @Description("发件箱或者收件箱") @RequestParam(value = "inbox", defaultValue = "true") Boolean inbox,
                                                        @Parameter(name = "orderBy", description = "依据哪个字段排序", required = false) @Description("依据哪个字段排序") @RequestParam(name = "orderBy", defaultValue = "source", required = false) String orderBy,
                                                        @Parameter(name = "sort", description = "升序还是降序排列结果", required = false) @Description("升序还是降序排列结果") @RequestParam(name = "sort", defaultValue = "asc", required = false) String sort,
                                                        @Parameter(name = "isRead", description = "已读或未读", required = false) @Description("已读或未读") @RequestParam(name = "isRead", required = false) Boolean isRead) {
        QueryPage page = new QueryPage();
        page.setCurrentPage(currentPage);
        page.setPageSize(pageSize);

        return notificationService.getUserNotifications(inbox, page, orderBy, sort, isRead);
    }

    @PostMapping("/getNotificationById")
    @Operation(summary = "根据ID获取一条消息内容")
    public NotificationDto getNotification(@RequestParam("id") Long nid) {
        return notificationService.getFullNotification(nid);
    }

    @PostMapping("/updateNotification")
    @Operation(summary = "修改一条消息")
    public NotificationDto updateNotification(
        @RequestParam("id") Long nid,
        @RequestBody NotificationDto notification) {
        notification.setId(nid);
        return notificationService.updateNotification(notification);
    }

    @PostMapping("/getUserSentNotifications")
    @Operation(summary = "获取当前用户已经发送的消息")
    public Collection<BriefNotificationDto> getUserSentNotifications() {
        return notificationService.getUserSentNotifications();
    }

    @PostMapping("/deleteNotifications")
    @Operation(summary = "删除一批指定id的消息")
    public void deleteNotifications(
        @RequestParam("ids") String ids) {
        if (Strings.isNullOrEmpty(ids)) {
            return;
        }

        String[] idArr = ids.split(",");
        Set<Long> idSet = new HashSet<>();
        for (String idStr : idArr) {
            try {
                idSet.add(Long.parseLong(idStr));
            } catch (NumberFormatException ne) {
                continue;
            }
        }

        notificationService.deleteNotifications(idSet);
    }

    @PostMapping("/markNotificationIsRead")
    @Operation(summary = "把指定消息标记为已读")
    public void updateNotificationsRead(
        @RequestParam("read") boolean read,
        @RequestParam("ifAll") boolean ifAll,
        @RequestBody(required = false) List<Long> ids) {
        notificationService.updateNotificationsRead(ids, read, ifAll);
    }

}
