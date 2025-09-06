package com.datablau.base.server.controller;

import com.datablau.base.server.dto.LicenseDetail;
import com.datablau.base.server.jpa.entity.LicenseInfoEntity;
import com.datablau.base.server.service.LocalLicenseService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/license")
public class LicenseManagementController extends BaseController {

    @Autowired
    private LocalLicenseService localLicenseService;

    /**
     * 上传License文件
     *
     * @return
     */
//    @OperatorLog(
//            operation = OperationLogType.DATA_UPLOAD,
//            operateTable = "db_license_info",
//            systemModule = OperationModuleType.SYSTEM_LICENSE,
//            description = "上传License文件"
//    )
    @Operation(summary = "上传License文件")
    @PostMapping("/uploadLicenseFile")
    public LicenseDetail uploadLicenseFile(@RequestParam("file") MultipartFile file) {
        return localLicenseService.uploadLicenseFile(file);
    }

    /**
     * 删除License文件
     *
     * @return
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_license_info",
//            systemModule = OperationModuleType.SYSTEM_LICENSE,
//            description = "删除License文件"
//    )
    @Operation(summary = "删除License文件")
    @PostMapping("/deleteLicenseFile")
    public LicenseDetail deleteLicenseFile(@RequestParam("id") Long id) {
        return localLicenseService.deleteLicenseFile(id);
    }

    /**
     * 获取License详情
     */
    @Operation(summary = "获取License详情")
    @PostMapping("/getLicenseDetail")
    public LicenseDetail getLicenseDetail() {
        return localLicenseService.getLicenseDetail();
    }


    /**
     * 获取License列表
     */
    @Operation(summary = "获取License列表")
    @PostMapping("/getLicenseList")
    public List<LicenseInfoEntity> getLicenseList() {
        return localLicenseService.getLicenseList();
    }
}
