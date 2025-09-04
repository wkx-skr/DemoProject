package com.datablau.data.asset.controller;


import com.datablau.data.asset.api.DataAssetsCatalogAuthService;
import com.datablau.data.asset.api.DataAssetsCommentService;
import com.datablau.data.asset.dto.DataAssetsCommentDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.jpa.entity.DataAssetsComment;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 目录评价
 */
@Tag(name = "目录评论", description = "对目录的评价")
@RestController
@RequestMapping(value = "/comment")
public class DataAssetsCommentController extends BaseController {

    @Autowired
    private DataAssetsCommentService dataAssetsCommentService;
    @Autowired
    private DataAssetsCatalogAuthService catalogAuthService;

    public DataAssetsCommentController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "目录评论列表")
    @GetMapping(value = "/list/{id}")
    public Map<String, Object> list(@PathVariable(value = "id") Long id) {
        Map<String, Object> resMap = new HashMap<>(2);
        resMap.put("comment", dataAssetsCommentService.list(id));
        resMap.put("manager", catalogAuthService.isManager(id, this.getCurrentUser()));
        return resMap;
    }


    @Operation(summary = "对目录进行评论")
    @PostMapping(value = "/comment")
    public ResResultDto<DataAssetsComment> comment(@Validated  @RequestBody DataAssetsCommentDto dataAssetsCommentDto){
        String currentUser = getCurrentUser();
        DataAssetsComment dataAssetsComment = dataAssetsCommentService.addComment(dataAssetsCommentDto, currentUser);
        return ResResultDto.ok(dataAssetsComment);
    }


    /**
     * 删除评论
     * @param id 评论ID
     * @return
     */
    @Operation(summary = "删除评论")
    @DeleteMapping(value = "/{id}")
    public ResResultDto<?> delete(@PathVariable(value = "id") Long id){
        dataAssetsCommentService.delete(id);

        return ResResultDto.ok();
    }
}
