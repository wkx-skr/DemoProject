package com.datablau.security.management.rest.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.api.OrganizationService70;
import com.datablau.security.management.api.OrganizationVirtualService70;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.OrganizationParamDto;
import com.datablau.security.management.dto.OrganizationQueryDto;
import com.datablau.security.management.dto.OrganizationTreeDto;
import com.datablau.security.management.dto.OrganizationTreeParamDto;
import com.datablau.security.management.dto.OrganizationVirtualDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.dto.UserQueryDto;
import com.datablau.security.management.ext.impl.UserServiceImplExt;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author zhangKun - 数语科技有限公司
 * date 2022/10/10 10:32
 */
@RestController
@RequestMapping("/org")
@Description("机构和用户组的rest api")
@Tag(name = "机构管理", description = "机构管理")
public class OrganizationController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(OrganizationController.class);


    @Autowired
    private UserService userService;
    @Autowired
    private OrganizationService70 organizationService;
    @Autowired
    private OrganizationVirtualService70 organizationVirtualService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private OperationLogService operationLogService;


    /**
     * 创建机构
     *
     * @param organizationDto 机构
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_ADD,
    //        operateTable = "db_auth_organization",
    //        systemModule = OperationModuleType.SYSTEM_ORGANIZATION,
    //        description = "新增机构名为: {param}",
    //        descriptionParamClass = OrganizationDto.class,
    //        descriptionParamMethod = "getFullName"
    //)
    @Description("创建机构")
    @RequestMapping(value = "/organization", method = RequestMethod.POST)
    @Operation(summary = "新增机构")
    public void createOrganization(@RequestBody OrganizationDto organizationDto) {
        organizationDto.setCreator(AuthTools.currentUsername());
        organizationDto.setUpdater(AuthTools.currentUsername());
        organizationService.createOrganization(organizationDto);
    }

    /**
     * 删除机构
     *
     * @param id 机构id
     * @throws InvalidArgumentException 如果机构被引用则抛出异常
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_DELETE,
    //        operateTable = "db_auth_organization",
    //        systemModule = OperationModuleType.SYSTEM_ORGANIZATION,
    //        description = "删除机构，id为: {param}",
    //        descriptionParamClass = Long.class,
    //        descriptionParamMethod = "toString"
    //)
    @Description("删除机构")
    @RequestMapping(value = "/organization/{id}", method = RequestMethod.DELETE)
    public void deleteOrganization(@PathVariable @Description("机构的id") Long id) {
        OrganizationDto org = organizationService.findOrganizationById(id);
        organizationService.deleteOrganization(id);
    }

    /**
     * 修改机构
     *
     * @param organizationDto 机构
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "db_auth_organization",
    //        systemModule = OperationModuleType.SYSTEM_ORGANIZATION,
    //        description = "修改机构，名为: {param}",
    //        descriptionParamClass = OrganizationDto.class,
    //        descriptionParamMethod = "getFullName"
    //)
    @Description("修改机构")
    @RequestMapping(value = "/organization", method = RequestMethod.PUT)
    public void modifyOrganization(@RequestBody OrganizationDto organizationDto) {
        organizationDto.setUpdater(AuthTools.currentUsername());
        organizationService.modifyOrganization(organizationDto);
    }

    /**
     * 查询指定id的机构
     *
     * @param id 机构
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_QUERY,
    //        operateTable = "db_auth_organization",
    //        systemModule = OperationModuleType.SYSTEM_ORGANIZATION,
    //        description = "查询机构"
    //)
    @Description("根据机构id查询指定机构信息")
    @RequestMapping(value = "/organization/{id}", method = RequestMethod.GET)
    //@PreAuthorize(UserRights.ORGANIZATIONAL_VIEW)
    public OrganizationDto findOrganizationById(
            @PathVariable("id") @Description("机构id") Long id) {
        return organizationService.findOrganizationById(id);
    }

    /**
     * 查询机构
     *
     * @param queryDto 机构
     */
    @Description("分页查询机构")
    @RequestMapping(value = "/organization/page", method = RequestMethod.POST)
    public PageResult<OrganizationDto> queryOrganization(
            @RequestBody OrganizationQueryDto queryDto) {
        return organizationService.queryOrganization(queryDto);
    }

    /**
     * 查询所有的机构
     */
    @RequestMapping(value = "/organization/all", method = RequestMethod.GET)
    public List<OrganizationDto> queryAllOrganization() {
        return organizationService.getOrganizationsByBms(new ArrayList<>());
    }

    /**
     * 把用户添加到指定机构
     *
     * @param userIds 用户id集合
     * @param id 机构id
     */
    @Description("把用户添加到指定机构")
    @EndpointDoc(bodyExample = "[2,1]")
    @Parameters({
            @Parameter(name = "userIds", description = "用户集合", required = true),
            @Parameter(name = "id", description = "机构id", in = ParameterIn.PATH, required = true)
    })
    @RequestMapping(value = "/organization/{id}/users/add", method = RequestMethod.POST)
    public void addUserToOrganization(@RequestBody List<Long> userIds, @PathVariable Long id) {
        organizationService.addUserToOrganization(userIds, id);

//        try {
//            String table = "db_auth_users";
//            String username = AuthTools.currentUsername();
//            String logMessage = String.format(msgService.getMessage("organization.user.add.log"), userIds.toString(), id);
//
//            operationLogService.generateOperationLog(OperationModuleType.SYSTEM_ORGANIZATION, table,
//                    OperationLogType.TABLE_ADD, logMessage, username, 0);
//        } catch (Exception e) {
//            LOGGER.error(e.getMessage());
//        }
    }

    /**
     * 把用户从指定机构删除
     *
     * @param userIds 用户id集合
     * @param id 机构id
     */
    @Description("把用户从指定机构删除")
    @EndpointDoc(bodyExample = "[2,1]")
    @Parameters({
            @Parameter(name = "userIds", description = "用户集合", required = true),
            @Parameter(name = "id", description = "机构id", in = ParameterIn.PATH, required = true)
    })
    @RequestMapping(value = "/organization/{id}/users/delete", method = RequestMethod.POST)
    public void deleteUserFromOrganization(@RequestBody List<Long> userIds, @PathVariable Long id) {
        organizationService.deleteUserFromOrganization(userIds, id);
    }

    /**
     * 将某个机构设置为另一个机构的上级机构
     *
     * @param pId 上级机构id
     * @param oId 本级机构id
     */
    @Description("将某个机构设置为另一个机构的上级机构")
    @RequestMapping(value = "/organization/{pId}/{oId}", method = RequestMethod.GET)
    public void addOrganizationToParentOrg(@PathVariable @Description("上级机构id") Long pId,
                                           @PathVariable @Description("本级机构id") Long oId) {
        organizationService.addOrganizationToParentOrg(pId, oId);
    }

    /**
     * 删除某个机构的上级机构
     *
     * @param oId 本级机构id
     */
    @Description("删除某个机构的上级机构")
    @RequestMapping(value = "/organization/{oId}/parent/remove", method = RequestMethod.DELETE)
    public void deleteOrganizationFromParentOrg(@PathVariable @Description("本级机构id") Long oId) {
        organizationService.deleteOrganizationFromParentOrg(oId);
    }

    /**
     * 获得机构树
     *
     * @return 返回机构树的dto
     */
    @Description("获得机构树")
    @Operation(summary = "获取机构树")
    @Parameters({
            @Parameter(name = "withUserNumber", description = "是否查询用户")})
    @RequestMapping(value = "/organization/tree", method = RequestMethod.GET)
    @PreAuthorize(UserRights.HAS_BASE_ORGANIZATION_MANAGE_ROLE)
    public OrganizationTreeDto getOrganizationTree(
            @RequestParam(value = "withUserNumber", required = false, defaultValue = "false") Boolean withUserNumber) {
        if (withUserNumber) {
            return organizationService.getOrganizationTreeWithUserNumber();
        } else {
            return organizationService.getOrganizationTree();
        }
    }

    /**
     * 获得机构树
     *
     * @return 返回机构树的dto
     */
    @Description("获得机构树")
    @Operation(summary = "获取机构树")
    @RequestMapping(value = "/organization/getTree", method = RequestMethod.POST)
    public OrganizationTreeDto getOrganizationTree(@RequestBody OrganizationTreeParamDto paramDto) {
        return organizationService.getOrganizationTree(paramDto);
    }

    /**
     * 获得某个机构的一级子机构
     */
    @Description("获得某个机构的一级子机构")
    @Operation(summary = "获得某个机构的一级子机构")
    @RequestMapping(value = "/organization/getFirstLevelChildren", method = RequestMethod.POST)
    public List<OrganizationTreeDto> getFirstLevelChildren(@RequestParam(value = "bm", required = false) String bm,
                                                       @RequestParam(value = "withUserNumber", required = false, defaultValue = "false") boolean withUserNumber) {
        OrganizationParamDto paramDto = new OrganizationParamDto();
        paramDto.setBm(bm);
        paramDto.setWithUserNumber(withUserNumber);
        return organizationService.findFirstLevelChildrenByBm(paramDto);
    }

    @RequestMapping(value = "/organization/byBms", method = RequestMethod.POST)
    public List<OrganizationDto> queryOrganizationByBms(@RequestBody List<String> bms) {
        return organizationService.getOrganizationsByBms(bms);
    }

    @RequestMapping(value = "/organization/byBm", method = RequestMethod.POST)
    public OrganizationDto queryOrganizationByBm(@RequestParam("bm") String bm) {
        return organizationService.getOrganizationsByBm(bm);
    }

    /**
     * 添加用户到指定用户组
     *
     * @param groupId 用户组id
     * @param userIds 用户id集合
     */
    @Description("添加用户到指定用户组")
    @EndpointDoc(bodyExample = "[2]")
    @RequestMapping(value = "/groups/{groupId}/add", method = RequestMethod.POST)
    public void addUserToGroup(@PathVariable @Description("用户组id") Long groupId,
                               @RequestBody @Description("用户id集合") List<Long> userIds) {
        organizationVirtualService.addUserToGroup(groupId, userIds);

//        try {
//            String table = "db_auth_org_virtual";
//            String logMessage = String.format(msgService.getMessage("organization.user.groupAdd.log"), userIds.toString(), groupId);
//
//            operationLogService.generateOperationLog(OperationModuleType.SYSTEM_GROUP, table,
//                    OperationLogType.TABLE_ADD, logMessage, AuthTools.currentUsername(), 0);
//        } catch (Exception e) {
//            LOGGER.error(e.getMessage());
//        }
    }

    /**
     * 把用户从指定用户组移除
     *
     * @param groupId 用户组id
     * @param userId 用户id
     */
    @Description("把用户从指定用户组移除")
    @RequestMapping(value = "/groups/{groupId}/remove/{userId}", method = RequestMethod.DELETE)
    public void removeFromGroup(@PathVariable @Description("用户组id") Long groupId,
                                @PathVariable @Description("用户id") Long userId) {
        organizationVirtualService.removeFromGroup(groupId, userId);

//        try {
//            String table = "db_auth_org_virtual";
//            String logMessage = String.format(msgService.getMessage("organization.user.groupRemove.log"), userId, groupId);
//
//            operationLogService.generateOperationLog(OperationModuleType.SYSTEM_GROUP, table,
//                    OperationLogType.TABLE_DELETE, logMessage, AuthTools.currentUsername(), 0);
//        } catch (Exception e) {
//            LOGGER.error(e.getMessage());
//        }
    }

    /**
     * 查询指定用户组信息
     *
     * @param groupId 用户组id
     */
    @Description("查询指定用户组信息")
    @RequestMapping(value = "/groups/{groupId}", method = RequestMethod.GET)
    //@PreAuthorize(UserRights.USER_GROUP_VIEW)
    public OrganizationVirtualDto findById(@PathVariable @Description("用户组id") Long groupId) {
        return organizationVirtualService.findById(groupId);
    }

    /**
     * 查找所有用户组集合
     *
     * @return 所有用户组
     */
    @Description("查找所有用户组集合")
    @Operation(summary = "获取所有用户组")
    @RequestMapping(value = "/groups", method = RequestMethod.GET)
    @PreAuthorize(UserRights.HAS_BASE_USER_GROUP_MANAGE_ROLE)
    public List<OrganizationVirtualDto> allGroupsList() {
        return organizationVirtualService.findAll();
    }

    /**
     * 新增用户组
     *
     * @param orgDto 用户组
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_ADD,
    //        operateTable = "db_auth_org_virtual",
    //        systemModule = OperationModuleType.SYSTEM_GROUP,
    //        description = "新增用户组: {param}",
    //        descriptionParamClass = OrganizationVirtualDto.class,
    //        descriptionParamMethod = "getGroupName"
    //)
    @Description("新增用户组")
    @RequestMapping(value = "/groups", method = RequestMethod.POST)
    public void addGroup(@RequestBody OrganizationVirtualDto orgDto) {
        orgDto.setCreator(AuthTools.currentUsername());
        orgDto.setCreateTime(new Date());
        organizationVirtualService.saveGroup(orgDto);
    }

    /**
     * 更新用户组
     *
     * @param orgDto 用户组
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "db_auth_org_virtual",
    //        systemModule = OperationModuleType.SYSTEM_GROUP,
    //        description = "修改用户组: {param}",
    //        descriptionParamClass = OrganizationVirtualDto.class,
    //        descriptionParamMethod = "getGroupName"
    //)
    @Description("更新用户组")
    @RequestMapping(value = "/groups", method = RequestMethod.PUT)
    public void updateGroup(@RequestBody OrganizationVirtualDto orgDto) {
        orgDto.setUpdater(AuthTools.currentUsername());
        orgDto.setUpdateTime(new Date());
        organizationVirtualService.updateGroup(orgDto);
    }

    /**
     * 删除用户组
     *
     * @param groupId 用户组id
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_DELETE,
    //        operateTable = "db_auth_org_virtual",
    //        systemModule = OperationModuleType.SYSTEM_GROUP,
    //        description = "删除用户组ID为: {param}",
    //        descriptionParamClass = Long.class,
    //        descriptionParamMethod = "toString"
    //)
    @Description("删除用户组")
    @RequestMapping(value = "/groups/{groupId}", method = RequestMethod.DELETE)
    public void delete(@PathVariable @Description("用户组id") Long groupId) {
        organizationVirtualService.deleteById(groupId);
    }


    /**
     * 分页查询用户组的用户
     *
     * @return 查询的用户分页结果
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_QUERY,
    //        operateTable = "db_auth_users",
    //        systemModule = OperationModuleType.SYSTEM_STAFF,
    //        description = "查询用户"
    //)
    @Description("分页查询用户组的用户")
    @Operation(summary = "分页查询用户信息")
    @RequestMapping(value = "/groups/page", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_BASE_USER_MANAGE_ROLE)
    public PageResult<UserDto> pageByNameLikeAndStateIs(@RequestParam(name = "appName", required = false, defaultValue = "") String appName,
                                                        @RequestBody UserQueryDto userQueryDto) {
        return organizationVirtualService.pageByNameLikeAndStateIs(appName, userQueryDto);
    }

    /**
     * @Author XiaoQian Xu
     * @Description 根据机构获取用户
     * @Date 2022/7/1
     * @Param [bm]
     **/
    @Operation(summary = "根据机构获取用户")
    @Parameters({
            @Parameter(name = "bm", description = "机构编码", in = ParameterIn.PATH, required = true),
    })
    @GetMapping("/{bm}/users")
    public List<UserDto> getUserByOrg(@PathVariable String bm) {
        return userService.getUsersByBm(bm);
    }

    @Autowired
    private UserServiceImplExt userServiceImplExt;

    @GetMapping("/abc")
    public List<String> abc(){
        return userServiceImplExt.a();
    }

    @GetMapping("/b")
    public Integer b(){
        return userServiceImplExt.b();
    }

    @GetMapping("/c")
    public Integer c(){
        return userServiceImplExt.c();
    }
}
