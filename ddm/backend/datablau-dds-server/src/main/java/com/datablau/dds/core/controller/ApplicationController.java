package com.datablau.dds.core.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.util.ShareKit;
import com.datablau.dds.common.api.DatablauRemoteDdsApiCallService;
import com.datablau.dds.common.api.DatablauRemoteDdsAppAuthService;
import com.datablau.dds.common.api.DatablauRemoteDdsApplicationTableService;
import com.datablau.dds.common.api.dto.ApiAppSearchCallDto;
import com.datablau.dds.common.api.dto.ApiEntityDto;
import com.datablau.dds.common.api.dto.ApiEntityResultDto;
import com.datablau.dds.common.api.dto.ApiMonitorDto;
import com.datablau.dds.common.api.dto.ApiSearchQueryCriteria;
import com.datablau.dds.common.api.dto.AppApisDto;
import com.datablau.dds.common.api.dto.AppAuthDto;
import com.datablau.dds.common.api.dto.AppAuthResultDto;
import com.datablau.dds.common.api.dto.AppResultDto;
import com.datablau.dds.common.api.dto.ApplicationTableDto;
import com.datablau.dds.common.api.dto.AuthUserAppDto;
import com.datablau.dds.core.service.AppKeyService;
import com.datablau.dds.core.utility.DatablauUtility;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserGroupDetails;
import com.datablau.security.management.dto.SimpleUserDto;
import com.datablau.security.management.utils.AuthTools;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author: lianyongwei - 数语科技有限公司
 * @Date: 2021/8/13 17:49
 */

@RestController
@RequestMapping("/app")
public class ApplicationController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationController.class);

    @Autowired
    private DatablauRemoteDdsApplicationTableService appTableService;

    @Autowired
    private DatablauRemoteDdsAppAuthService appAuthService;

    @Autowired
    private DatablauRemoteDdsApiCallService apiCallService;

    @Autowired
    private AppKeyService appKeyService;

    @Autowired
    private MessageService msgService;

    @Autowired
    private UserService userService;

    @PostMapping("/appTable")
    @Description("新增应用表")
    public AppResultDto insertAppTable(@RequestBody ApplicationTableDto appTable) {
        String userName = AuthTools.currentUsername();
        appTable.setCreater(userName);
        appTable.setApplicationOwner(userName);
        AppResultDto appResultDto = appTableService.saveAppTable(appTable);
        return appResultDto;
    }


    @PutMapping("/appTable/{id}")
    @Description("编辑应用表")
    public AppResultDto updateAppTable(@Description("应用表ID") @PathVariable("id") Long id,@RequestBody ApplicationTableDto appTable){
        appTable.setId(id);
        return appTableService.updateAppTable(appTable);
    }


    @PutMapping("/appTable/{id}/{status}")
    @Description("启用/禁用应用表")
    public AppResultDto updateAppTable(@Description("应用表ID") @PathVariable("id") Long id, @Description("修改后状态") @PathVariable("status") Integer status){
        return appTableService.updateAppTable(id,status);
    }

    /*@DeleteMapping("/appAuth/{id}")
    @Description("根据id删除应用表(普通用户)")
    public void deleteAppTable(@Description("授权表ID") @PathVariable("id") Long id){
        String authUser = AuthTools.currentUsername() == null ? "lyw-app" : AuthTools.currentUsername();
        appTableService.deleteAppTableAndAppAuthByAuthId(id, authUser);
    }*/

    @DeleteMapping("/appTable/{id}")
    @Description("根据id删除应用表和应用关联关系（管理员用户）")
    public void deleteAppTableAndAppAuthByAppId(@Description("应用表ID") @PathVariable("id") Long id){
        String createUser = AuthTools.currentUsername();
        appTableService.deleteAppTableAndAppAuthByAppId(id, createUser);
    }

    @PostMapping("/appTables")
    @Description("查询应用列表")
    public PageResult<AppResultDto> getAppTablesPage(@RequestBody ApplicationTableDto tableDto) {
        if (tableDto.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        String userName = AuthTools.currentUsername();
        return appTableService.getAppTablesPage(tableDto, userName);
    }

    @PostMapping("/appTable/all")
    @Description("查询应用列表(管理员权限)")
    public PageResult<AppResultDto> getAllAppTablesPage(@RequestBody ApplicationTableDto tableDto){
        if (tableDto.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        return appTableService.getAllAppTablesPage(tableDto);
    }

    @GetMapping("/appOwners")
    @Description("查询所有应用所有者")
    public List<String> getAllAppOwners(){
        return appTableService.getAllAppOwnes();
    }

   /* @GetMapping("/appTables")
    @Description("获取所有以启用的应用表")
    public List<AppResultDto> getAllApplicationTables(){
        Integer status = 1;
        return appTableService.getAllApplicationTables(status);
    }*/

    @PostMapping("/appAuth")
    @Description("申请应用表")
    public AppAuthResultDto applyAppAuth(@RequestBody AppAuthDto appAuthDto){
        String authUser = AuthTools.currentUsername();
        appAuthDto.setAuthCreator(authUser);
        appAuthDto.setAuthUser(authUser);
        return appAuthService.saveAppAuth(appAuthDto);
    }

    @PostMapping("/appAuth/re")
    @Description("在次申请应用表")
    public void applyAgainAppAuth(@RequestBody AppAuthDto appAuthDto){
        String authUser = AuthTools.currentUsername();
        appAuthDto.setAuthUser(authUser);
        appAuthService.applyAgainAppAuth(appAuthDto);
    }

    @PostMapping("/appAuth/{appId}")
    @Description("添加应用授权")
    public AppAuthResultDto addAppAuth(@PathVariable("appId") Long appId, @RequestBody AppAuthDto appAuthDto) {
        String userName = AuthTools.currentUsername();
        appAuthDto.setAuthCreator(userName);
        return appAuthService.addAppAuth(appAuthDto);
    }


    @PutMapping("/appAuth/{id}/audit")
    @Description("审核应用")
    public AppAuthResultDto updateAppAuth(@PathVariable("id") Long id, @RequestBody AppAuthDto appAuthDto) {
        String userName = AuthTools.currentUsername();
        appAuthDto.setAuthCreator(userName);
        appAuthDto.setAuthId(id);
        return appAuthService.updateAppAuth(appAuthDto);
    }

    @GetMapping("/authUser/{appId}")
    @Description("获取所有人列表")
    public List<String> getAllAuthUserByAppId(@PathVariable("appId") Long appId){
        String userName = AuthTools.currentUsername();
        return appAuthService.getAllAuthUserByAppId(appId, userName);
    }

    @DeleteMapping("/appAuth/{id}/remove")
    @Description("移除用户")
    public void removeAppAuth(@PathVariable("id") Long id) {
        String userName = AuthTools.currentUsername();
        appAuthService.removeAppAuth(id, userName);
    }

    @PutMapping("/appAuth/{id}/return")
    @Description("归还应用")
    public AppAuthResultDto returnAppAuth(@PathVariable("id") Long id) {
        String userName = AuthTools.currentUsername();
        return appAuthService.returnAppAuth(id, userName);
    }

    @GetMapping("/appAuth/{id}")
    @Description("查询应用关联详情")
    public AppApisDto findAppAuthByAppId(@PathVariable("id") Long appId) throws IllegalAccessException, InstantiationException {
        String userName = AuthTools.currentUsername();
        boolean flag = AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER);
        return appAuthService.findAppAuthByAppId(appId, userName, flag);
    }

//    @DeleteMapping("/appAuth/{id}")
//    @Description("删除授权的应用")
//    public void deleteAppAuthById(@PathVariable("id") Long id){
//        appAuthService.deleteAppAuthById(id);
//    }

    @PostMapping("/appAuth/search")
    @Description("查询授权列表(我申请的APP)")
    public PageResult<AppAuthResultDto> getApplyAppAuthPage(@RequestBody AppAuthDto appAuthDto) {
        if (appAuthDto.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        String authUser = AuthTools.currentUsername();
        return appAuthService.getApplyAppAuthPage(appAuthDto,authUser);
    }

    @PostMapping("/appTable/creator/search")
    @Description("查询授权列表(我创建的APP)")
    public PageResult<AppResultDto> getCreateAppPage(@RequestBody AppAuthDto appAuthDto){
        if (appAuthDto.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        String authUser = AuthTools.currentUsername();
        return appTableService.getCreateAppPage(appAuthDto, authUser);
    }

    @PostMapping("/appAuth/search/all")
    @Description("查询授权列表(管理员查询)")
    public PageResult<AppAuthResultDto> getAllAppAuths(@RequestBody AppAuthDto appAuthDto){
        if (appAuthDto.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        return appAuthService.getAllAppAuths(appAuthDto);
    }

    @PostMapping("/appAuth/all/search/{userId}")
    @Description("查询审核应用列表")
    public PageResult<AppAuthResultDto> getAllAppAuthPage(@PathVariable("userId") long userId,@RequestBody AppAuthDto appAuthDto) {
        if (appAuthDto.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        String authUser = AuthTools.currentUsername();
//        final Long currentUserId = appAuthDto.getCurrentUserId();
        UserDetails user = userService.getUserDetails(userId);
        if (user == null) {
            throw new InvalidArgumentException(msgService.getMessage("invalidUserId", userId));
        }
        List<String> userRoles = new ArrayList<>();
        for (UserGroupDetails group : userService.getNormalGroupDetailsByUser(user.getUsername(),
            "DAM")) {
            if (group.isSystemBuilt()) {
                continue;
            }
            userRoles.add(group.getName());
        }
        boolean flag1 = AuthTools.hasAnyRole("ROLE_SUPERUSER");
        boolean flag2 = userRoles.contains("数据服务管理员");
        boolean flag = flag1 || flag2;
        return appAuthService.getAllAppAuthPage(appAuthDto.getPageSize(),
            appAuthDto.getCurrentPage(), appAuthDto.getAppName(), authUser, flag);
    }

    @PostMapping("/apiAuth/search")
    @Description("查询用户申请的api(我申请的API)")
    public PageResult<ApiEntityResultDto> getApiAuthPage(@RequestBody AppAuthDto appAuthDto) {
        if (appAuthDto.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        String authUser = AuthTools.currentUsername();
        return appAuthService.getApiAuthPage(appAuthDto, authUser);
    }

    @PostMapping("/apiAuth/creator/search")
    @Description("查询用户开发的api(我开发的api)")
    public PageResult<ApiEntityDto> getApiByCreator(@RequestBody ApiSearchQueryCriteria criteria) throws InstantiationException, IllegalAccessException {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        String authUser = AuthTools.currentUsername();
        criteria.setApplyUser(authUser);
        return appAuthService.getApiByCreator(criteria);
    }

    @PostMapping("/api/search")
    @Description("查询api(管理员查询)")
    public PageResult<ApiEntityDto> getAllApis(@RequestBody ApiSearchQueryCriteria criteria) throws InstantiationException, IllegalAccessException {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        return appAuthService.getAllApis(criteria);
    }

    @PostMapping("/apiAuth/user")
    @Description("查询应用关联的用户信息")
    public PageResult<AuthUserAppDto> getAppAuthUserByAppId(@RequestBody AppAuthDto appAuthDto) {
        PageResult<AuthUserAppDto> authUsers = appAuthService.getAppAuthUserByAppId(appAuthDto);
        for (AuthUserAppDto dto : authUsers.getContent()) {
            try {
                dto.setUserName(
                    userService.getEnabledUserByUsername(dto.getUserName()).getFullUserName());
            } catch (Exception e) {
                continue;
            }
        }
        return authUsers;
    }

    @PostMapping("/apiAuth/user/{appId}")
    @Description("查询某个应用关联的api")
    public PageResult<ApiMonitorDto> getApiByAppId(@PathVariable("appId") Long appId, @RequestBody ApiAppSearchCallDto searchDto) {
        return appAuthService.getApiByAppId(searchDto, appId);
    }


    @GetMapping("/apis/{searchTime}")
    @Description("查询应用关联的api调用数量")
    public Map<String, Long> getApiCountsByApp(@PathVariable("searchTime") Long searchTime){
        return apiCallService.getApiCountsByApp(searchTime);
    }

    @PostMapping("/apiAuth/apis")
    @Description("查询应用关联的api调用详情(首页-服务调用查询)")
    public PageResult<ApiMonitorDto> getApiByAppId(@RequestBody ApiAppSearchCallDto searchDto){
        return apiCallService.getApiCountsByApi(searchDto);
    }

    @DeleteMapping("/appApiAuth/{id}")
    @Description("移除api")
    public void removeAppApiAuthById(@PathVariable("id") Long id){
        appAuthService.removeAppApiAuthById(id);
    }

    @PostMapping("/apiAuth/export")
    @Description("下载客户调用查询信息")
    public void exportSearchCallCount(@RequestBody ApiAppSearchCallDto apiAppDto, HttpServletResponse response) throws IOException {
        Workbook wb = null;
        try {
            List<ApiMonitorDto> result = apiCallService.exportSearchCallCount(apiAppDto);
//            String srcPath = ResourceUtils.getURL("classpath:templates/api_monitor.xlsx").getPath();
            String srcPath = ShareKit.getResourcePath("/templates/api_monitor.xlsx");
            File srcFile = new File(srcPath);
            InputStream is = new FileInputStream(srcFile);
            wb = new XSSFWorkbook(is);
            Sheet sheet = wb.getSheet("服务调用查询");
            CellStyle cellStyle = wb.createCellStyle();
            DataFormat dataFormat = wb.createDataFormat();
            cellStyle.setDataFormat(dataFormat.getFormat("yyyy-MM-dd HH:mm:ss"));
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            int rowIndex = 1;
            int colIndex = 0;
            for(ApiMonitorDto monitorDto : result){
                Row row = sheet.createRow(rowIndex++);
                Cell c = null;
                colIndex = 0;
                if(!StringUtils.isBlank(monitorDto.getName())){
                    c = row.createCell(colIndex);
                    c.setCellValue(monitorDto.getName());
                }
                colIndex++;
                if (!StringUtils.isBlank(monitorDto.getUrl())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(monitorDto.getUrl());
                }
                colIndex++;
                if(!StringUtils.isBlank(monitorDto.getApiCatalog())){
                    c = row.createCell(colIndex);
                    c.setCellValue(monitorDto.getApiCatalog());
                }
                colIndex++;
                if(!StringUtils.isBlank(monitorDto.getCreator())){
                    c = row.createCell(colIndex);
                    c.setCellValue(monitorDto.getCreator());
                }
                colIndex++;
                if(!StringUtils.isBlank(monitorDto.getLatelyTime())){
                    c = row.createCell(colIndex);
                    c.setCellStyle(cellStyle);
                    c.setCellValue(sdf.parse(monitorDto.getLatelyTime()));
                }
                colIndex++;
                if(!StringUtils.isBlank(monitorDto.getAverageTime())){
                    c = row.createCell(colIndex);
                    Double aLong = Double.parseDouble(monitorDto.getAverageTime());
                    String format = String.format("%.2f", aLong);
                    c.setCellValue(format);
                }
                colIndex++;
                if (monitorDto.getAuthCount() != null) {
                    c = row.createCell(colIndex);
                    c.setCellValue(monitorDto.getAuthCount());
                }
                colIndex++;
                if (monitorDto.getCallCount() != null) {
                    c = row.createCell(colIndex);
                    c.setCellValue(monitorDto.getCallCount());
                }
                colIndex++;
                c = row.createCell(colIndex);
                c.setCellValue(monitorDto.getSuccessRate());
            }
            wb.write(response.getOutputStream());
            response.addHeader("cache-Control","no-cache, no-store, must-revalidate");
            response.addHeader("Pragma", "no-cache");
            response.addHeader("Expires","0");
            response.addHeader("charset","utf-8");
            response.addHeader("Content-Disposition","attachment;filename=\""+ URLEncoder.encode("服务调用查询.xlsx","utf-8")+"\"");
        }catch (Exception e){
            throw new InvalidArgumentException(msgService.getMessage("downloadExcelError"));
        }finally {
            if (wb != null) {
                wb.close();
            }
        }
    }

    @PostMapping("/appKey/{appkey}")
    @Description("更新appSecrity")
    public String refreshAppSecret(@PathVariable("appkey") String appkey){
        String appSecret = appTableService.getAppSecret(appkey);
        return appSecret;
    }

    @PostMapping("/appKey/re/{id}")
    @Description("更新appSecrity")
    public void refreshAppSecretById(@PathVariable("id") Long id){
        appTableService.refreshAppSecretById(id);
    }

    @GetMapping("/users/{authUser}")
    @Description("获取已申请和已创建的应用名称")
    public List<AppResultDto> getApplyAndCreateAppUsers(@PathVariable("authUser") String authUser){
        List<AppResultDto> applyAndCreateAppUsers = appAuthService.getApplyAndCreateAppUsers(authUser);
        return applyAndCreateAppUsers;
    }

    @GetMapping("/users")
    @Description("获取所有应用工程师")
    public List<String> getUsersByGroupId(){
        List<String> userList = new ArrayList<>();
        Long groupId = userService.getUserGroupIdByName("应用工程师", "DAM");
        UserGroupDetails group = userService.getGroup(groupId);
        Set<Long> userIds = group.getUserIds();
        List<SimpleUserDto> usersByIds = userService.getUsersByIds(userIds);
        for (SimpleUserDto dto : usersByIds) {
            userList.add(dto.getUsername());
        }
        return userList;
    }

    @DeleteMapping("/appTable/creator/{id}")
    @Description("根据id删除应用表和应用关联关系（普通用户）")
    public void deleteAppTableAndAppAuth(@Description("应用表ID") @PathVariable("id") Long id) {
        String createUser = AuthTools.currentUsername();
        appTableService.deleteAppTableAndAppAuthByAppId(id, createUser);
    }

}
