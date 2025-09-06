package com.datablau.model.server.controller;


import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.MultiConditionQueryUtils;

import com.datablau.base.api.FileService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.model.data.api.ModelDriverService;
import com.datablau.model.data.dto.ModelDriverDto;
import com.datablau.model.data.dto.ModelDriverGroupDto;
import com.datablau.model.data.jpa.entity.ModelDriver;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.rex.re.DataSourceType;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author zhangKun - 数语科技有限公司
 * date 2021/09/26 17:27
 */
@RestController("modelDriverController")
@ConditionalOnMissingBean(name = "modelDriverControllerExt")
@RequestMapping("/driver")
@Tag(name = "自定义数据库驱动相关REST API", description = "自定义数据库驱动相关REST API")
public class ModelDriverController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(ModelDriverController.class);

    @Autowired
    protected ModelDriverService driverService;


    @Autowired
    @Qualifier("fileService")
    protected FileService fileService;

    @Autowired
    protected MultiConditionQueryUtils queryUtils;


    @Autowired
    protected MessageService messageService;

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_DRIVER_MANAGE_ROLE)
    @Operation(summary = "添加自定义驱动", description = "添加自定义驱动")
    public ModelDriverDto createDriver(@Parameter(description = "jdbc驱动对象", required = true) @RequestBody ModelDriverDto modelDriver) {
        // 需要等文件上传完成后在进行
        return driverService.createDriver(modelDriver);
    }

    @RequestMapping(value = "/{driverId}/update", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_DRIVER_MANAGE_ROLE)
    @Operation(summary = "更新驱动，只能更新驱动名", description = "更新驱动，只能更新驱动名")
    @Parameters({@Parameter(name = "driverId", description = "驱动ID", in = ParameterIn.PATH, required = true)})
    public ModelDriverDto updateDriver(@PathVariable("driverId") Long driverId,
                                       @Parameter(description = "jdbc驱动对象", required = true) @RequestBody ModelDriverDto modelDriver) {
        return driverService.updateDriver(driverId, modelDriver);
    }

    @RequestMapping(value = "/{driverId}", method = RequestMethod.DELETE)
    @PreAuthorize(UserRights.HAS_DRIVER_MANAGE_ROLE)
    @Operation(summary = "删除驱动", description = "删除驱动")
    @Parameters({@Parameter(name = "driverId", description = "驱动ID", in = ParameterIn.PATH, required = true)})
    public void deleteDriver(@PathVariable("driverId") Long driverId) {
        /*  判断driver是否有模型在使用
        List<Model> modelByDriverId = dataModelService.getModelByDriverId(driverId);
        if (!CollectionUtils.isEmpty(modelByDriverId)) {
            throw new IllegalOperationException(messageService.getMessage("driveIsUsed"));
        }
         */
        driverService.deleteDriver(driverId);
    }


    @RequestMapping(value = "/search", method = RequestMethod.GET)
    @Operation(summary = "分页查询驱动", description = "分页查询驱动")
    @Parameters({@Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "pageSize", description = "页面大小", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "keyword", description = "驱动名关键字", in = ParameterIn.QUERY),
            @Parameter(name = "type", description = "驱动类型", in = ParameterIn.QUERY)})
    public PageResult<ModelDriverDto> queryDrivers(@RequestParam("currentPage") Integer currentPage,
                                                   @RequestParam("pageSize") Integer pageSize,
                                                   @RequestParam(value = "keyword", required = false) String keyword,
                                                   @RequestParam(value = "type", required = false) DataSourceType type) {

        MultiConditionQueryUtils.MultiConditionQuery<ModelDriver> query = queryUtils.createQuery(ModelDriver.class);
        query.addOrder("creationTime", false);
        if (!Strings.isNullOrEmpty(keyword)) {
            query.andLike("driverName", "%" + keyword + "%");
        }

        if (type != null) {
            query.andEqual("type", type);
        }

        query.setPageInfo(currentPage, pageSize);
        PageResult<ModelDriver> page = query.page();
        ArrayList<ModelDriverDto> modelDriverDtos = new ArrayList<>();
        List<ModelDriver> modelDrivers = page.getContent();
        List<String> fileIds = modelDrivers
                .stream()
                .map(ModelDriver::getStoredFileId)
                .collect(Collectors.toList());
        List<FileDescriptor> files = fileService.getFileByIds(fileIds);
        Map<String, FileDescriptor> fileMap = files
                .stream()
                .collect(Collectors.toMap(FileDescriptor::getFileId, storedFile -> storedFile));
        for (ModelDriver modelDriver : modelDrivers) {

            //todo clickhouse ddm与dam内置的driverClassName有区别,下个版本再优化
            if (modelDriver.getType() == DataSourceType.CLICKHOUSE) {
                modelDriver.setDriverClassName("com.clickhouse.jdbc.ClickHouseDriver");
            }

            String storedFileId = modelDriver.getStoredFileId();
            if (storedFileId != null && fileMap.containsKey(storedFileId)) {
                modelDriverDtos.add(convertToModelDriverDto(modelDriver, fileMap.get(storedFileId).getFileName()));
            } else {
                modelDriverDtos.add(convertToModelDriverDto(modelDriver, null));
            }
        }
        PageResult<ModelDriverDto> modelDriverDtoPageResult = new PageResult<>();
        modelDriverDtoPageResult.setContentDirectly(modelDriverDtos);
        modelDriverDtoPageResult.setCurrentPage(page.getCurrentPage());
        modelDriverDtoPageResult.setPageSize(page.getPageSize());
        modelDriverDtoPageResult.setTotalItems(page.getTotalItems());
        return modelDriverDtoPageResult;
    }

    @RequestMapping(value = "/{driverId}", method = RequestMethod.GET)
    @Operation(summary = "根据id查询驱动", description = "根据id查询驱动")
    @Parameters({@Parameter(name = "driverId", description = "驱动ID", in = ParameterIn.PATH, required = true)})
    public ModelDriverDto getDriver(@PathVariable("driverId") Long driverId) {
        return driverService.getDriver(driverId);
    }

    @RequestMapping(value = "/type", method = RequestMethod.GET)
    @Operation(summary = "根据类型查询驱动", description = "根据类型查询驱动")
    @Parameters({@Parameter(name = "type", description = "数据源类型", in = ParameterIn.QUERY, required = true)})
    public List<ModelDriverDto> getDriversByType(@RequestParam("type") DataSourceType type) {
        return driverService.getDriverByType(type);
    }

    @RequestMapping(value = "/isJdbc", method = RequestMethod.GET)
    @Operation(summary = "根据类型查询驱动", description = "根据类型查询驱动")
    @Parameters({@Parameter(name = "type", description = "数据源类型", in = ParameterIn.QUERY, required = true)})
    public boolean isJdbcDriverType(@RequestParam("type") DataSourceType type) {
        return true;
    }

    @RequestMapping(value = "/default", method = RequestMethod.GET)
    @Operation(summary = "根据类型查询驱动", description = "根据类型查询驱动")
    @Parameters({@Parameter(name = "type", description = "数据源类型", in = ParameterIn.QUERY, required = true)})
    public ModelDriverDto getDefaultDriver(@RequestParam("type") DataSourceType type) {
        return driverService.getDefaultDriver(type);
    }

    @RequestMapping(value = "/type/search", method = RequestMethod.GET)
    @Operation(summary = "根据驱动类型查询该类型举动的信息", description = "根据驱动类型查询该类型举动的信息")
    public List<ModelDriverGroupDto> queryDriverGroupByType() {
        List<ModelDriverGroupDto> modelDriverGroupDtos = driverService.queryDriverGroupByType();
        modelDriverGroupDtos.removeIf(nextName -> "Customized".equalsIgnoreCase(nextName.getType().getDisplayName()));
        return modelDriverGroupDtos;
    }

    @RequestMapping(value = "/default/{driverId}", method = RequestMethod.PUT)
    @Operation(summary = "查询数据源类型的默认驱动", description = "查询数据源类型的默认驱动")
    @Parameters({@Parameter(name = "type", description = "数据源类型", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "driverId", description = "驱动ID", in = ParameterIn.PATH, required = true)})
    public void setDefaultDriver(@RequestParam("type") DataSourceType type,
                                 @PathVariable("driverId") Long driverId) {
        driverService.setDefaultDriver(type, driverId);
    }

    protected ModelDriverDto convertToModelDriverDto(ModelDriver modelDriver, String fileName) {
        ModelDriverDto modelDriverDto = new ModelDriverDto();
        modelDriverDto.setId(modelDriver.getId());
        modelDriverDto.setDefaultDriver(modelDriver.getDefaultDriver());
        modelDriverDto.setDriverName(modelDriver.getDriverName());
        modelDriverDto.setDriverClassName(modelDriver.getDriverClassName());
        modelDriverDto.setBuiltIn(modelDriver.getBuiltIn());
        modelDriverDto.setType(modelDriver.getType());
        modelDriverDto.setStoredFileId(modelDriver.getStoredFileId());
        modelDriverDto.setCreationTime(modelDriver.getCreationTime());
        modelDriverDto.setStoredFileName(fileName);
        return modelDriverDto;
    }
}
