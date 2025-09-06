package com.datablau.model.server.controller;

import com.andorj.common.core.data.CommonSystem;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.CategoryService;
import com.datablau.model.data.dto.ModelTreeNodeDto;
import com.datablau.model.data.dto.SimpleUserDto;
import com.datablau.model.data.jpa.entity.Category;
import com.datablau.model.local.utility.Configurations;
import com.datablau.model.local.utility.DatablauUtility;
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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
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
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/10/11 0011 上午 10:08
 */
@RestController("categoryController")
@ConditionalOnMissingBean(name = "categoryControllerExt")
@RequestMapping("/categories")
@Tag(name = "模型库目录相关REST API", description = "模型库目录相关REST API")
public class CategoryController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    protected CategoryService categoryService;

    @Autowired
    protected MessageService msgService;

    @Autowired
    @Qualifier("modelCategoryService")
    protected ModelCategoryService modelCategoryService;

    @GetMapping("/")
    @Operation(summary = "获取所有模型库目录，返回的是目录数组", description = "获取所有模型库目录，返回的是目录数组")
    public List<Category> getCategories() {
        return categoryService.getCategories();
    }

    @GetMapping("/{categoryId}")
    @Operation(summary = "得到一个指定目录和它子目录数，返回的是模型树结构体", description = "得到一个指定目录和它子目录数，返回的是模型树结构体")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public ModelTreeNodeDto getNode(@PathVariable("categoryId") Long categoryId) {
        return categoryService.getCategoryChildren(categoryId);
    }

    @GetMapping("/tree")
    @Operation(summary = "获取所有模型库目录，返回的是树型结构", description = "获取所有模型库目录，返回的是树型结构")
    public ModelTreeNodeDto getCategoriesTree() {
        return categoryService.getCategoriesTree();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建一个目录", description = "创建一个目录")
    public Category createCategory(@Parameter(description = "目录", required = true) @RequestBody Category category) {
        if (category.getParentId() == null || category.getParentId() < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }
        //checkEditCategoryPermission();

        return categoryService.createCategory(category);
    }

    @RequestMapping(value = "/{categoryId}", method = RequestMethod.PUT)
    @Operation(summary = "给指定的目录改名", description = "给指定的目录改名")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public Category renameCategory(@PathVariable("categoryId") Long categoryId,
                                   @Parameter(description = "目录", required = true) @RequestBody Category category) {
        if (categoryId == null || categoryId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        //checkEditCategoryPermission();
        return categoryService
                .updateCategory(categoryId, category.getName(), category.getDescription(),
                        category.getAlias(),category.getEntityTemplateId(),category.getForceCheckFlag());
    }

    @RequestMapping(value = "/{categoryId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定的目录", description = "删除指定的目录")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public void deleteCategory(@PathVariable("categoryId") Long categoryId) {
        if (categoryId == null || categoryId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        //checkEditCategoryPermission();

        categoryService.deleteCategory(categoryId);
    }

    @PutMapping("/{categoryId}/dam/{damCategoryId}")
    @Operation(summary = "绑定目录到DAM的一个系统", description = "绑定目录到DAM的一个系统")
    @Parameters({@Parameter(name = "categoryId", description = "模型库目录ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "damCategoryId", description = "DAM系统ID", in = ParameterIn.PATH, required = true)})
    public Category bindCategoryToDamCategory(@PathVariable("categoryId") Long categoryId, @PathVariable("damCategoryId") Long damCategoryId) {
        return categoryService.bindCategoryToDamCategory(categoryId, damCategoryId, null);
    }

    @DeleteMapping("/{categoryId}/dam")
    @Operation(summary = "把指定目录和DAM系统解绑", description = "把指定目录和DAM系统解绑")
    @Parameters({@Parameter(name = "categoryId", description = "模型库目录ID", in = ParameterIn.PATH, required = true)})
    public void unbindCategoryToDamCategory(@PathVariable("categoryId") Long categoryId) {
        categoryService.unbindCategoryFromDamCategory(categoryId);
    }

    @GetMapping("/dam/")
    @Operation(summary = "获取DAM中所有系统信息", description = "获取DAM中所有系统信息")
    public List<CommonSystem> getAllDamSystems() {
        return modelCategoryService.getModelCategories().stream().map(s->convertTo(s)).collect(Collectors.toList());
    }

    @GetMapping("/dam/{damModelCategoryId}")
    @Operation(summary = "通过指定ID获取DAM中对应系统的信息", description = "通过指定ID获取DAM中对应系统的信息")
    @Parameters({@Parameter(name = "damModelCategoryId", description = "DAM系统ID", in = ParameterIn.PATH, required = true)})
    public CommonSystem getDamSystemById(@PathVariable("damModelCategoryId") Long damModelCategoryId) {
        return convertTo(modelCategoryService.getModelCategory(damModelCategoryId));
    }
    protected CommonSystem convertTo(ModelCategoryDto modelCategory) {
        if (modelCategory == null) {
            return null;
        }
        CommonSystem system = new CommonSystem();
        system.setId(modelCategory.getCategoryId());
        system.setName(modelCategory.getCategoryName());
        system.setAlias(modelCategory.getCategoryAbbreviation());
        system.setDescription(modelCategory.getDescription());
        system.setItDepartment(modelCategory.getItDepartment());
        return system;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/searchusers")
    @Operation(summary = "获取绑定到指定DAM系统的用户列表, RequestBody 为DAM系统的ID数组", description = "获取绑定到指定DAM系统的用户列表, RequestBody 为DAM系统的ID数组")
    public List<SimpleUserDto> getUsersByCategoryNames(@Parameter(description = "目录ID", required = true) @RequestBody Set<Long> damModelCategoryIds)
            throws Exception {
        return categoryService.getUsersByDamBindedCategoryIds(damModelCategoryIds);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/upload-sys")
    @Operation(summary = "基于系统名录模板创建目录", description = "基于系统名录模板创建目录")
    public int uploadModelCategories(
            @Parameter(name = "file", description = "上传的文件类型参数") @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "headerRow", description = "第几行是行头，按照模板默认是第3行，默认不用设置", allowEmptyValue = true) @RequestParam(name = "headerRow", defaultValue = "2") int headerRow) throws Exception {

        if (Configurations.INSTANCE.isDamConnectable()) {
            throw new IllegalOperationException(msgService.getMessage("cannotInvokeWhenDamConnected"));
        }

        File file = UploadFile.uploadFile(multipartFile);
        if (!file.exists()) {
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFile"));
        }
        try {
            return categoryService.uploadModelCategories(file.getAbsolutePath(), headerRow);
        } finally {
            try {
                file.delete();
            } catch (Throwable tw) {

            }
        }
    }

    @RequestMapping("/sys-template")
    @Operation(summary = "下载系统模板文件", description = "下载系统模板文件")
    public ResponseEntity<Resource> exportDomainTemplate() throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            String loc = DatablauUtility.getResourcePath("/templates/" + msgService.getMessage("systemTemplateFile"));

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
                    .encode(msgService.getMessage("systemTemplate") + ".xlsx", "utf-8") + "\"");

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

    @RequestMapping(method = RequestMethod.POST, value = "/move")
    @Operation(summary = "移动目录至另一个目录", description = "移动目录至另一个目录")
    public Category moveCategory(
            @Parameter(name = "targetCatId", description = "目标目录ID") @RequestParam(name = "targetCatId") Long targetCatId,
            @Parameter(name = "oriCatId", description = "原目录ID") @RequestParam(name = "oriCatId") Long oriCatId) {
        if (targetCatId == null || targetCatId < 1 || oriCatId == null || oriCatId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }
        return categoryService.moveCategory(targetCatId, oriCatId);
    }

    @GetMapping("/private/check")
    @Operation(summary = "查询私人目录", description = "查询私人目录")
    @Parameters({@Parameter(name = "categoryName", description = "私人目录名", in = ParameterIn.QUERY, required = true)})
    public Boolean checkIfPersonalFolderCreated(@RequestParam(name = "categoryName") String categoryName) {
        return categoryService.hasPersonalFolderCreated(categoryName);
    }

    @GetMapping("/buildIn")
    @Operation(summary = "查询内置目录", description = "查询内置目录")
    public Category getBuildInCategory(@RequestParam String buildInType) {
        return categoryService.getBulidInCategory(buildInType);
    }

}
