package com.datablau.base.server.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.data.PageResult;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.base.api.FileService70;
import com.datablau.base.data.DatasourceDriverDto;
import com.datablau.base.server.dto.DriverFileDto;
import com.datablau.base.server.dto.ModelDriverGroupDto;
import com.datablau.base.server.jpa.entity.DatasourceDriver;
import com.datablau.base.server.jpa.entity.DatasourceEntity;
import com.datablau.base.server.service.LocalDatasourceService;
import com.datablau.base.server.service.ModelDriverService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.util.ShareKit;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author zhangKun - 数语科技有限公司
 * date 2021/09/26 17:27
 */
@RestController
@RequestMapping("/drivers")
@Description("自定义数据库驱动相关的Controller")
@Tag(name = "自定义数据库驱动Api", description = "自定义数据库驱动Api")
public class ModelDriverController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ModelDriverController.class);
    @Autowired
    private ModelDriverService driverService;
    @Autowired
    private LocalDatasourceService datasourceService;
    @Autowired
    private MessageService messageService;
    @Autowired
    private MultiConditionQueryUtils queryUtils;
    @Autowired
    private FileService70 storedFileService;
    @Autowired
    private RemoteFileLoader remoteFileLoader;

    public ModelDriverController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_model_driver",
//            systemModule = OperationModuleType.SYSTEM_DRIVER,
//            description = "添加驱动: {param}",
//            descriptionParamClass = DatasourceDriverDto.class,
//            descriptionParamMethod = "getDriverName"
//    )
    @Operation(summary = "添加自定义驱动")
    @PostMapping(value = "/addDriver")
    public DatasourceDriverDto createDriver(@RequestBody DatasourceDriverDto modelDriver) {
        return driverService.createDriver(modelDriver);
    }

    @Operation(summary = "上传驱动文件")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY, required = true)})
    @PostMapping(value = "/uploadDriver")
    public DriverFileDto uploadFileForDriver(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);

        FileDescriptor newFile = storedFileService.createFile(multipartFile.getOriginalFilename(), AuthTools
            .currentUsernameNullSafe(), null);

        remoteFileLoader.uploadFileToRemote(newFile.getFileId(), uploadedFile);
        storedFileService.commitFiles(Collections.singleton(newFile.getFileId()));

        DriverFileDto driverFileDto = new DriverFileDto();
        driverFileDto.setZipFileNameList(ShareKit.getZipFileNames(uploadedFile));
        driverFileDto.setFileId(newFile.getFileId());
        driverFileDto.setFileName(newFile.getFileName());
        return driverFileDto;
    }

    @Operation(summary = "更新驱动，只能更新驱动名")
    @PostMapping(value = "/updateDriverName")
    public DatasourceDriverDto updateDriver(@Parameter(name = "driverId", description = "驱动ID", required = true)
                                       @RequestParam(name = "driverId") Long driverId,
                                       @RequestBody DatasourceDriverDto modelDriver) {
        return driverService.updateDriver(driverId, modelDriver);
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_model_driver",
//            systemModule = OperationModuleType.SYSTEM_DRIVER,
//            description = "删除驱动，id为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @Operation(summary = "删除驱动")
    @PostMapping(value = "/deleteDriver")
    public void deleteDriver(@Parameter(name = "driverId", description = "驱动ID", required = true)
                             @RequestParam(name = "driverId") Long driverId) {
        List<DatasourceEntity> modelByDriverId = datasourceService.getDatasourcesByDriverId(driverId);
        if (!CollectionUtils.isEmpty(modelByDriverId)) {
            throw new IllegalOperationException(messageService.getMessage("driveIsUsed"));
        }
        driverService.deleteDriver(driverId);
    }


    @Operation(summary = "分页查询驱动")
    @PostMapping(value = "/search")
    public PageResult<DatasourceDriverDto> queryDrivers(
            @Parameter(name = "currentPage", description = "当前页码", required = true)
            @RequestParam("currentPage") int currentPage,

            @Parameter(name = "pageSize", description = "页面大小", required = true)
            @RequestParam("pageSize") int pageSize,

            @Parameter(name = "keyword", description = "驱动名关键字")
            @RequestParam(value = "keyword", required = false) String keyword,

            @Parameter(name = "type", description = "驱动类型")
            @RequestParam(value = "type", required = false) String type) {

        MultiConditionQueryUtils.MultiConditionQuery<DatasourceDriver> query = queryUtils.createQuery(
            DatasourceDriver.class);
        query.addOrder("creationTime", false);
        if (!Strings.isNullOrEmpty(keyword)) {
            query.andLike("driverName", "%" + keyword + "%");
        }

        if (type != null) {
            query.andEqual("type", type);
        }

        query.setPageInfo(currentPage, pageSize);
        PageResult<DatasourceDriver> page = query.page();
        ArrayList<DatasourceDriverDto> datasourceDriverDtos = new ArrayList<>();
        List<DatasourceDriver> datasourceDrivers = page.getContent();
        List<String> fileIds = datasourceDrivers
                .stream()
                .map(DatasourceDriver::getStoredFileId)
                .collect(Collectors.toList());
        List<FileDescriptor> files =
            CollectionUtils.isEmpty(fileIds) ? Collections.emptyList():
            storedFileService.getFileByIds(fileIds);
        Map<String, FileDescriptor> fileMap = files
                .stream()
                .collect(Collectors.toMap(FileDescriptor::getFileId, storedFile -> storedFile));
        for (DatasourceDriver datasourceDriver : datasourceDrivers) {
            String storedFileId = datasourceDriver.getStoredFileId();
            if (storedFileId != null && fileMap.containsKey(storedFileId)) {
                datasourceDriverDtos.add(convertToModelDriverDto(
                    datasourceDriver, fileMap.get(storedFileId).getFileName()));
            } else {
                datasourceDriverDtos.add(convertToModelDriverDto(datasourceDriver, null));
            }
        }
        PageResult<DatasourceDriverDto> modelDriverDtoPageResult = new PageResult<>();
        modelDriverDtoPageResult.setContentDirectly(datasourceDriverDtos);
        modelDriverDtoPageResult.setCurrentPage(page.getCurrentPage());
        modelDriverDtoPageResult.setPageSize(page.getPageSize());
        modelDriverDtoPageResult.setTotalItems(page.getTotalItems());
        return modelDriverDtoPageResult;
    }

    @Operation(summary = "根据id查询驱动")
    @PostMapping(value = "/getDriverById")
    public DatasourceDriverDto getDriver(@Parameter(name = "driverId", description = "驱动ID", required = true)
                                    @RequestParam(name = "driverId") Long driverId) {
        return driverService.getDriver(driverId);
    }

    @Operation(summary = "根据类型查询驱动")
    @PostMapping(value = "/getDriverByType")
    public List<DatasourceDriverDto> getDriversByType(@Parameter(name = "type", description = "数据源类型", required = true)
                                                 @RequestParam(name = "type") String type) {
        return driverService.getDriverByType(type);
    }

    @Operation(summary = "判断是否是某个类型的驱动")
    @PostMapping(value = "/isJdbc")
    public boolean isJdbcDriverType(@Parameter(name = "type", description = "数据源类型", required = true)
                                    @RequestParam("type") String type) {
        //return type.isJdbcDatasource();
        //TODO:
        return false;
    }

    @Operation(summary = "查询数据源类型的默认驱动")
    @PostMapping(value = "/getDefaultDriverOfType")
    public DatasourceDriverDto getDefaultDriver(@Parameter(name = "type", description = "数据源类型", required = true)
                                           @RequestParam("type") String type) {
        return driverService.getDefaultDriver(type);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_model_driver",
//            systemModule = OperationModuleType.SYSTEM_DRIVER,
//            description = "查询驱动"
//    )
    @Operation(summary = "查询驱动分组信息")
    @PostMapping(value = "/getDriverGroups")
    @PreAuthorize(UserRights.HAS_BASE_DRIVER_MANAGE_ROLE)
    public List<ModelDriverGroupDto> queryDriverGroupByType() {
        return driverService.queryDriverGroupByType();
    }

    @Operation(summary = "设置数据源类型的默认驱动")
    @PostMapping(value = "/setTypeDefaultDriver")
    public void setDefaultDriver(@Parameter(name = "type", description = "数据源类型", required = true)
                                 @RequestParam("type") String type,
                                 @Parameter(name = "driverId", description = "驱动ID", required = true)
                                 @RequestParam("driverId") Long driverId) {
        driverService.setDefaultDriver(type, driverId);
    }

    private DatasourceDriverDto convertToModelDriverDto(DatasourceDriver datasourceDriver, String fileName) {
        DatasourceDriverDto datasourceDriverDto = new DatasourceDriverDto();
        datasourceDriverDto.setId(datasourceDriver.getId());
        datasourceDriverDto.setDefaultDriver(datasourceDriver.getDefaultDriver());
        datasourceDriverDto.setDriverName(datasourceDriver.getDriverName());
        datasourceDriverDto.setDriverClassName(datasourceDriver.getDriverClassName());
        datasourceDriverDto.setBuiltIn(datasourceDriver.getBuiltIn());
        datasourceDriverDto.setType(datasourceDriver.getType());
        datasourceDriverDto.setStoredFileId(datasourceDriver.getStoredFileId());
        datasourceDriverDto.setCreationTime(datasourceDriver.getCreationTime());
        datasourceDriverDto.setStoredFileName(fileName);
        return datasourceDriverDto;
    }
}
