package com.datablau.domain.management.controller;

import com.andorj.common.data.PageResult;
import com.datablau.domain.management.utility.RemoteServiceGetter;
import com.datablau.security.management.data.UserGroupDetails;
import com.datablau.security.management.dto.OrganizationTreeDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.dto.UserQueryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

/**
 * @Author huajun.li
 */
@RestController
@RequestMapping("/org")
@Tag( name = "机构和用户组的REST API")
public class OrganizationController extends BaseController {

    /**
     * 获得机构树
     * @return 返回机构树的dto
     */
    @PostMapping(value = "/organization/getTree")
    @Operation(summary = "获得机构树")
    public OrganizationTreeDto getOrganizationTree() {
        return RemoteServiceGetter.getOrganizationService().getOrganizationTree();
    }

    /**
     * 分页查询用户组的用户
     * @return 查询的用户分页结果
     */
    @PostMapping("/user/getPage")
    @Operation(summary = "分页查询用户组的用户")
    public PageResult<UserDto> pageByNameLikeAndStateIs(@RequestBody UserQueryDto userQueryDto) {
        return RemoteServiceGetter.getOrganizationVirtualService().pageByNameLikeAndStateIs(userQueryDto);
    }

    /**
     * 获取所有角色
     */
    @PostMapping("/group/getGroups")
    @Operation(summary = "获取所有角色")
    public Collection<UserGroupDetails> getAllGroups() {
        return RemoteServiceGetter.getUserService().getUsersGroups("DAM");
    }

}
