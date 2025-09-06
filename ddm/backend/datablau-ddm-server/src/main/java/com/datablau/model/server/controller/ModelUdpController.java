package com.datablau.model.server.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.ModelUdpService;
import com.datablau.model.data.api.impl.ModelUdpServiceImpl;
import com.datablau.model.data.jpa.entity.ModelUdpObject;
import com.datablau.model.data.jpa.entity.ModelUdpObjectCategory;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.local.utility.DatablauUtility;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.utils.UploadFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
/**
 * @author Nicky - 数语科技有限公司
 * date 2020/5/15 13:29
 */
@RestController("modelUdpController")
@ConditionalOnMissingBean(name = "modelUdpControllerExt")
@RequestMapping("/udps")
@Tag(name = "模型库UDP操作相关REST API", description = "模型库UDP操作相关REST API")
public class ModelUdpController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(ModelUdpController.class);

    @Autowired
    protected ModelUdpService udpService;

    @Autowired
    protected MessageService msgService;

    @GetMapping("/")
    @Operation(summary = "获取所有UDP", description = "获取所有UDP")
    public List<ModelUdpObject> getAllUdps() {
        return udpService.getAllUdps();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建UDP", description = "创建UDP, valueType的可选值为STRING, INTEGER, DOUBLE, DATETIME, LONGTEXT, 需要有自定义属性的管理权限")
    public ModelUdpObject createUdp(@Parameter(description = "模型UDP对象", required = true) @RequestBody ModelUdpObject udp) {
        return udpService.createUdpObject(udp);
    }

    @RequestMapping(value = "/{udpId}", method = RequestMethod.PUT)
    @Operation(summary = "修改UDP", description = "修改UDP, 需要有自定义属性的管理权限")
    @Parameters({@Parameter(name = "udpId", description = "UDP ID", in = ParameterIn.PATH, required = true)})
    public ModelUdpObject updateUdp(@PathVariable("udpId") Long udpId, @Parameter(description = "模型UDP对象", required = true) @RequestBody ModelUdpObject udp) {
        udp.setUdpId(udpId);
        return udpService.updateUdpObject(udp);
    }

    @GetMapping(value = "/{udpId}/history")
    @Operation(summary = "获取UDP的历史版本", description = "获取UDP的历史版本")
    @Parameters({@Parameter(name = "udpId", description = "UDP ID", in = ParameterIn.PATH, required = true)})
    public List<ModelUdpObject> getUdpHistory(@PathVariable("udpId") Long udpId) {
        return udpService.getUdpHistory(udpId);
    }

    @GetMapping("/categories")
    @Operation(summary = "获取所有UDP业务条线", description = "获取所有UDP业务条线")
    public List<ModelUdpObjectCategory> getAllUdpCategories() {
        return udpService.getAllUdpCategories();
    }

    @RequestMapping(value = "/categories", method = RequestMethod.POST)
    @Operation(summary = "创建UDP业务条线", description = "创建UDP业务条线, 需要有自定义属性的管理权限")
    public ModelUdpObjectCategory createUdpCategory(@Parameter(description = "模型UDP业务线对象", required = true) @RequestBody ModelUdpObjectCategory category) {
        return udpService.createUdpObjectCategory(category);
    }

    @RequestMapping(value = "/categories/{categoryId}", method = RequestMethod.PUT)
    @Operation(summary = "修改业务条线", description = "修改业务条线, 需要有自定义属性的管理权限")
    @Parameters({@Parameter(name = "categoryId", description = "业务线ID", in = ParameterIn.PATH, required = true)})
    public ModelUdpObjectCategory updateUdpCategory(@PathVariable("categoryId") Long categoryId, @Parameter(description = "模型UDP业务线对象", required = true) @RequestBody ModelUdpObjectCategory category) {
        category.setId(categoryId);
        return udpService.updateUdpObjectCategory(category);
    }

    @RequestMapping(value = "/{udpId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除一个UDP", description = "删除一个UDP, 需要有自定义属性的管理权限")
    @Parameters({@Parameter(name = "udpId", description = "UDP ID", in = ParameterIn.PATH, required = true)})
    public void deleteUdpById(@PathVariable("udpId") Long udpId) {
        udpService.deleteUdpObject(udpId);
    }

    @RequestMapping(value = "/categories/{categoryId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除业务条线", description = "删除业务条线, 需要有自定义属性的管理权限")
    @Parameters({@Parameter(name = "categoryId", description = "业务线ID", in = ParameterIn.PATH, required = true)})
    public void deleteUdpCategory(@PathVariable("categoryId") Long categoryId) {
        udpService.deleteModelUdpObjectCategory(categoryId);
    }

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    @Operation(summary = "导入UDP, 会返回最终导入了多少个UDP", description = "导入UDP, 会返回最终导入了多少个UDP")
    public Integer uploadUdp(@Parameter(description = "文件", required = true) @RequestParam("file") MultipartFile file) {

        logger.info(AuthTools.currentUsernameFailFast() + " is importing udp file " + file.getOriginalFilename());

        File uploadedFile = null;
        try {
            uploadedFile = UploadFile.uploadFile(file);
            return udpService.loadUdpFromFile(uploadedFile);
        } catch (Exception ex) {
            throw new UnexpectedStateException(ex.getMessage(), ex);
        } finally {
            if (uploadedFile != null) {
                try {
                    uploadedFile.delete();
                } catch (Throwable tw) {

                }
            }
        }
    }

    @GetMapping("/template")
    @PreAuthorize(UserRights.HAS_UDP_MANAGE_ROLE)
    @Operation(summary = "下载UDP模板", description = "下载UDP模板")
    public ResponseEntity<Resource> downloadUdpTemplate() throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            String loc = DatablauUtility.getResourcePath("/udp/" + msgService.getMessage("udpTemplateFile"));

            Workbook wb = new XSSFWorkbook(loc);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder
                    .encode(msgService.getMessage("udpTemplate") + ".xlsx", "utf-8") + "\"");

            Resource resource = new InputStreamResource(
                    new ByteArrayInputStream(bos.toByteArray()));

            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);

        } finally {
            if (null != bos) {
                bos.close();
            }
        }
    }

    @GetMapping("/export")
    @Operation(summary = "导出UDP", description = "导出UDP")
    public ResponseEntity<Resource> exportUdp() throws Exception {
        ByteArrayOutputStream bos = null;
        File exportFile = udpService.exportUdpToExcel();
        try {
            Workbook wb = new XSSFWorkbook(exportFile);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder
                    .encode("UDP.xlsx", "utf-8") + "\"");

            Resource resource = new InputStreamResource(
                    new ByteArrayInputStream(bos.toByteArray()));

            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);

        } finally {
            if (null != bos) {
                try {
                    bos.close();
                } catch (Throwable tw) {

                }
            }

            if (exportFile != null) {
                try {
                    exportFile.delete();
                } catch (Throwable tw) {

                }
            }
        }
    }

    @PostMapping("/order")
    public boolean updateUdpOrder(@RequestBody HashMap<String, Long> orderMap) {
        return udpService.updateUdpOrder(orderMap);
    }

}
