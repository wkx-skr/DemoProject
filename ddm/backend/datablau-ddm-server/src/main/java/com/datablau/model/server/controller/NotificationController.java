package com.datablau.model.server.controller;

import com.andorj.common.data.PageResult;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.NotificationService;
import com.datablau.model.data.dto.BriefNotification;
import com.datablau.model.data.dto.NotificationClientDto;
import com.datablau.model.data.dto.NotificationExtend;
import com.datablau.model.data.jpa.entity.Notification;
import com.datablau.model.server.utils.XSSUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
/**
 * @Author fengpiao - 数语科技有限公司
 * @Date 2022/5/5 11:04
 */
@RestController("notificationController")
@ConditionalOnMissingBean(name = "notificationControllerExt")
@RequestMapping("/message/center")
@Tag(name = "消息相关REST API", description = "消息相关REST API")
public class NotificationController extends BaseController {

    @Autowired
    protected NotificationService notificationService;

    /**
     * 发送消息
     *
     * @param sendOnly
     * @param notification
     * @return
     */
    @PostMapping("/")
    @Operation(summary = "创建消息")
    @Parameters({@Parameter(name = "sendOnly", description = "仅发送", in = ParameterIn.QUERY, required = false)})
    public Notification createNotification(@RequestParam(name = "sendOnly", defaultValue = "false") Boolean sendOnly, @Parameter(description = "消息", required = true) @RequestBody Notification notification) {
        return notificationService.submitNotification(notification, sendOnly);
    }


    /**
     * 发送消息
     *
     * @param sendOnly
     * @param sendAll
     * @param notification
     * @return
     */
    @PostMapping("/to")
    @Operation(summary = "同一条消息发送给多个人")
    @Parameters({@Parameter(name = "sendOnly", description = "仅发送", in = ParameterIn.QUERY, required = false),
            @Parameter(name = "sendAll", description = "发送给全员", in = ParameterIn.QUERY, required = false)})
    public Notification createNotification(@RequestParam(name = "sendOnly", defaultValue = "false", required = false) Boolean sendOnly,
                                           @RequestParam(name = "sendAll", defaultValue = "false", required = false) Boolean sendAll,
                                           @Parameter(description = "消息", required = true) @RequestBody NotificationExtend notification) {
        notification.setTitle(XSSUtil.processInput(notification.getTitle()));
        notification.setContent(XSSUtil.processInput(notification.getContent()));
        return notificationService.submitNotification(notification, sendOnly, sendAll);
    }


    /**
     * @return
     */
    @GetMapping("/")
    @Operation(summary = "获取用户收到的信息的简略信息")
    public Collection<BriefNotification> getNotifications() {
        return notificationService.getUserNotifications();
    }

    /**
     * @param currentPage
     * @param pageSize
     * @param inbox
     * @param orderBy
     * @param sort
     * @param isRead
     * @return
     */
    @GetMapping("/page/")
    @Operation(summary = "获取分页的信息列表")
    public PageResult<BriefNotification> getNotificationsPage(@Parameter(name = "currentPage", description = "当前页码") @RequestParam("currentPage") Integer currentPage,
                                                              @Parameter(name = "pageSize", description = "每页大小") @RequestParam("pageSize") Integer pageSize,
                                                              @Parameter(name = "inbox", description = "发件箱或者收件箱") @RequestParam(value = "inbox", defaultValue = "false") Boolean inbox,
                                                              @Parameter(name = "keyword", description = "查询关键字") @RequestParam(value = "keyword", required = false) String keyword,
                                                              @Parameter(name = "orderBy", description = "依据哪个字段排序") @RequestParam(name = "orderBy", required = false) String orderBy,
                                                              @Parameter(name = "sort", description = "升序还是降序排列结果") @RequestParam(name = "sort", required = false) Boolean sort,
                                                              @Parameter(name = "isRead", description = "已读或未读") @RequestParam(name = "isRead", required = false) Boolean isRead) {
        return notificationService.getUserNotifications(inbox, currentPage, pageSize, keyword, orderBy, sort, isRead);
    }

    /**
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取具体的消息")
    @Parameters({@Parameter(name = "id", description = "消息ID", in = ParameterIn.PATH, required = true)})
    public Notification getNotification(@PathVariable("id") Long id) {
        return notificationService.getFullNotication(id);
    }

    /**
     * @param id
     * @param notification
     * @return
     */
    @PutMapping("/{id}")
    @Operation(summary = "修改消息")
    @Parameters({@Parameter(name = "id", description = "消息ID", in = ParameterIn.PATH, required = true)})
    public Notification updateNotification(@PathVariable("id") Long id,
                                           @Parameter(description = "消息", required = true) @RequestBody Notification notification) {
        notification.setId(id);
        return notificationService.updateNotification(notification);
    }

    /**
     * @return
     */
    @GetMapping("/sent/")
    @Operation(summary = "获取发出的消息的简略信息")
    public Collection<BriefNotification> getUserSentNotifications() {
        return notificationService.getUserSentNotifications();
    }

    /**
     * @param nid
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除消息")
    @Parameters({@Parameter(name = "id", description = "消息ID", in = ParameterIn.PATH, required = true)})
    public void deleteNotification(@PathVariable("id") Long nid) {
        notificationService.deleteNotification(nid);
    }

    /**
     * @param ids
     */
    @DeleteMapping("/")
    @Operation(summary = "删除消息")
    public void deleteNotifications(@Parameter(description = "消息id", required = true) @RequestBody List<Long> ids) {
        if (Objects.isNull(ids)) {
            return;
        }
        notificationService.deleteNotifications(ids);
    }

    /**
     * @param ids
     * @param read
     * @param ifAll
     */
    @PostMapping("/read")
    @Operation(summary = "更新已读状态")
    @Parameters({@Parameter(name = "read", description = "已读状态", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "ifAll", description = "是否全部", in = ParameterIn.QUERY, required = true)})
    public void updateNotificationsRead(@Parameter(description = "消息ID") @RequestBody(required = false) List<Long> ids, @RequestParam Boolean read, @RequestParam Boolean ifAll) {
        notificationService.updateNotificationsRead(ids, read, ifAll);
    }

    /**
     * 获取指定时间后的消息
     *
     * @param id
     * @return
     */
    @GetMapping("/messages")
    @Operation(summary = "获取指定Id后的消息和公告")
    @Parameters({@Parameter(name = "lastId", description = "消息ID", in = ParameterIn.QUERY, required = true)})
    public List<NotificationClientDto> getMessageFromLastId(@RequestParam("lastId") Long id) {
        return notificationService.getMessageFromLastId(id);
    }

    @GetMapping("/announcement")
    @Operation(summary = "获取公告消息")
    @Parameters({@Parameter(name = "size", description = "公告记录数量", in = ParameterIn.QUERY, required = false)})
    public List<Notification> getAnnouncement(@RequestParam(value = "size", defaultValue = "1", required = false) Integer id) {
        return notificationService.getAnnouncement(id);
    }

    @PostMapping("/announcement")
    @Operation(summary = "创建新的公告")
    public Notification createAnnouncement(@Parameter(description = "公告", required = true) @RequestBody Notification notification) {
        return notificationService.createAnnouncement(notification);
    }

    @PostMapping("/announcement/{id}")
    @Operation(summary = "更新公告内容")
    @Parameters({@Parameter(name = "id", description = "公告ID", in = ParameterIn.PATH, required = true)})
    public Notification updateAnnouncement(@PathVariable("id") Long id,
                                           @Parameter(description = "公告", required = true) @RequestBody Notification notification) {
        notification.setId(id);
        return notificationService.updateAnnouncement(notification);
    }
}
