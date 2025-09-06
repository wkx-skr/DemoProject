package com.datablau.base.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.server.dto.GetThreadResponseDto;
import com.datablau.base.server.dto.UpdateThreadRequestDto;
import com.datablau.base.server.jpa.entity.thread.DataThread;
import com.datablau.base.server.service.ThreadService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2019/2/14 16:07
 */
@RequestMapping("/thread")
@RestController
@Tag(name = "评论系统对应的REST API")
public class DataThreadController extends BaseController {

    @Autowired
    private ThreadService threadService;
    @Autowired
    private MessageService msgService;

    public DataThreadController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/getThreads")
    @Operation(summary = "通过分页的方式取得指定类型的话题")
    public Page<DataThread> getThreads(@Parameter(name = "page" ,description = "当前页") @RequestParam(name = "page", defaultValue = "0") int page,
                                       @Parameter(name ="pageSize" ,description = "每页大小") @RequestParam(name = "size", defaultValue = "50") int pageSize,
                                       @Parameter(name = "type", description = "类型，0是普通，1是绑定到元数据, 2是绑定到任意对象")
                                           @RequestParam(name = "type", defaultValue = "0") long typeId) {

        if (pageSize <= 0) {
            pageSize = 50;
        }

        if (page < 0) {
            page = 0;
        }

        return threadService.getAllThreads(typeId, page, pageSize);
    }

    @PostMapping("/createThread")
    @Operation(summary = "创建一个话题")
    public GetThreadResponseDto createThread(@RequestBody UpdateThreadRequestDto request) {
        return threadService.createThread(request);
    }


    @PostMapping("/updateThread")
    @Operation(summary = "在指定的话题下创建新的评论")
    public GetThreadResponseDto updateThread(@Parameter(name = "threadId", description = "话题ID") @RequestParam(name = "threadId") Long threadId,
                                             @RequestBody UpdateThreadRequestDto request,
                                             @RequestParam(name = "page", defaultValue = "0") int page,
                                             @RequestParam(name = "size", defaultValue = "50") int pageSize) {

        if (request.getMessage() == null) {
            throw new InvalidArgumentException(msgService.getMessage("messageCanNotbeEmpty"));
        }

        if (pageSize <= 0) {
            pageSize = 50;
        }

        if (page < 0) {
            page = 0;
        }

        return threadService.addMessageToThread(threadId, request.getMessage(), page, pageSize);
    }

    @PostMapping("/getThreadMessage")
    @Operation(summary = "获取一个话题下面所有评论")
    public GetThreadResponseDto getThreadMessage(@Parameter(name = "threadId", description = "话题id")@RequestParam(name = "threadId") Long threadId,
                                                 @RequestParam(name = "page", defaultValue = "0") int page,
                                                 @RequestParam(name = "size", defaultValue = "50") int pageSize) {
        return threadService.getThreadMessages(threadId, pageSize, page);
    }

    @PostMapping("/getThreadMessageByObject")
    @Operation(summary = "获取跟一个指定的对象绑定的话题")
    public GetThreadResponseDto getThreadMessageByObject(@Parameter(name = "typeId", description = "类型") @RequestParam(name = "typeId") Long typeId,
                                                 @Parameter(name = "objectId", description = "对象id") @RequestParam(name = "objectId") Long objectId,
                                                 @Parameter(name = "size", description = "一页的大小") @RequestParam(name = "size", defaultValue = "50") int pageSize) {
        return threadService.getThreadsAttachedToObject(typeId, objectId, pageSize);
    }

    @PostMapping("/getAssetThreadMessage")
    @Operation(summary = "获取跟一个指定的对象绑定的话题")
    public GetThreadResponseDto getAssetThreadMessageByObject(@RequestParam(name = "assetId") String assetId,
                                                 @RequestParam(name = "size", defaultValue = "50") int pageSize) {
        return threadService.getThreadsAttachedToObject(assetId, pageSize);
    }

    @PostMapping("/getItems")
    @Operation(summary = "获取跟一个指定任意对象绑定的话题")
    public GetThreadResponseDto getItemThreadMessage(@Parameter(name="itemId",description = "对象的ID") @RequestParam("itemId") String itemId,
                                                     @Parameter(name = "pageSize",description = "一页的大小") @RequestParam(name = "size", defaultValue = "50") int pageSize) {
        return threadService.getThreadsAttachedToItem(itemId, pageSize);
    }

    @PostMapping("/deleteMessage")
    @Operation(summary = "删除自己发布的一条消息")
    public GetThreadResponseDto deleteMessage(@Parameter(name = "messageId", description = "消息id")@RequestParam(name = "messageId") Long messageId,
                                              @RequestParam(name = "page", defaultValue = "0") int page,
                                              @RequestParam(name = "size", defaultValue = "50") int pageSize) {

        if (pageSize <= 0) {
            pageSize = 50;
        }

        if (page < 0) {
            page = 0;
        }

        return threadService.deleteMessage(messageId, page, pageSize);
    }
}
