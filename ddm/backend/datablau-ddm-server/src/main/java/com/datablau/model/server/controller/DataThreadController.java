package com.datablau.model.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.model.data.jpa.entity.DataThread;
import com.datablau.model.server.dto.GetThreadResponseDto;
import com.datablau.model.server.dto.UpdateThreadRequestDto;
import com.datablau.model.server.service.api.ThreadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.datablau.data.common.controller.BaseController;
@RequestMapping("/thread")
@RestController("dataThreadController")
@ConditionalOnMissingBean(name = "dataThreadControllerExt")
@Tag(name = "评论系统对应的REST API", description = "评论系统对应的REST API")
public class DataThreadController extends BaseController {

    @Autowired
    protected ThreadService threadService;
    @Autowired
    protected MessageService msgService;

    @GetMapping("/")
    @Operation(summary = "通过分页的方式取得指定类型的话题", description = "通过分页的方式取得指定类型的话题")
    public Page<DataThread> getThreads(
            @Parameter(name = "page", description = "当前页", allowEmptyValue = true) @RequestParam(name = "page", defaultValue = "0") int page,
            @Parameter(name = "size", description = "每页大小", allowEmptyValue = true) @RequestParam(name = "size", defaultValue = "50") int pageSize,
            @Parameter(name = "type", description = "类型，0是普通，1是绑定到对象", allowEmptyValue = true) @RequestParam(name = "type", defaultValue = "0") long typeId) {

        if (pageSize <= 0) {
            pageSize = 50;
        }

        if (page < 0) {
            page = 0;
        }

        return threadService.getAllThreads(typeId, page, pageSize);
    }

    @PostMapping("/")
    @Operation(summary = "创建一个话题", description = "创建一个话题")
    public GetThreadResponseDto createThread(@Parameter(description = "话题对象", required = true) @RequestBody UpdateThreadRequestDto request) {
        return threadService.createThread(request);
    }


    @PutMapping("/{threadId}")
    @Operation(summary = "在指定的话题下创建新的评论", description = "在指定的话题下创建新的评论")
    @Parameters({@Parameter(name = "threadId", description = "话题ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "page", description = "当前页", in = ParameterIn.QUERY),
            @Parameter(name = "size", description = "每页数量", in = ParameterIn.QUERY)})
    public GetThreadResponseDto updateThread(@PathVariable("threadId") Long threadId,
                                             @Parameter(description = "话题对象", required = true) @RequestBody UpdateThreadRequestDto request,
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

    @GetMapping("/{threadId}/messages")
    @Operation(summary = "获取一个话题下面所有评论", description = "获取一个话题下面所有评论")
    @Parameters({@Parameter(name = "threadId", description = "话题ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "page", description = "当前页", in = ParameterIn.QUERY),
            @Parameter(name = "size", description = "每页数量", in = ParameterIn.QUERY)})
    public GetThreadResponseDto getThreadMessage(@PathVariable("threadId") Long threadId,
                                                 @RequestParam(name = "page", defaultValue = "0") int page,
                                                 @RequestParam(name = "size", defaultValue = "50") int pageSize) {
        return threadService.getThreadMessages(threadId, pageSize, page);
    }

    @GetMapping("/types/{typeId}/objects/{objectId}")
    @Operation(summary = "获取跟一个指定的对象绑定的话题", description = "获取跟一个指定的对象绑定的话题")
    @Parameters({@Parameter(name = "typeId", description = "typeId", in = ParameterIn.PATH, required = true),
            @Parameter(name = "objectId", description = "objectId", in = ParameterIn.PATH, required = true)})
    public GetThreadResponseDto getThreadMessage(@PathVariable("typeId") Long typeId,
                                                 @PathVariable("objectId") Long objectId,
                                                 @Parameter(name = "size", description = "每页数量") @RequestParam(name = "size", defaultValue = "50") int pageSize) {
        return threadService.getThreadsAttachedToObject(typeId, objectId, pageSize);
    }

    @DeleteMapping("/messages/{messageId}")
    @Operation(summary = "删除自己发布的一条消息", description = "删除自己发布的一条消息")
    @Parameters({@Parameter(name = "messageId", description = "消息id", in = ParameterIn.PATH, required = true),
            @Parameter(name = "page", description = "当前页", in = ParameterIn.QUERY),
            @Parameter(name = "size", description = "每页数量", in = ParameterIn.QUERY)})
    public GetThreadResponseDto deleteMessage(@PathVariable("messageId") Long messageId,
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
