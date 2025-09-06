package com.datablau.data.asset.controller;

import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.api.DataAssetsApplyRecordService;
import com.datablau.data.asset.api.DataAssetsCatalogProcessService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.dto.CatalogAuthApplyDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.WorkflowChangeDto;
import com.datablau.data.asset.jpa.entity.DataAssetsApplyRecord;
import com.datablau.data.asset.jpa.repository.DataAssetsCatalogRepository;
import com.datablau.data.asset.service.DataAssetsCatalogProcessExt0Service;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.dataasset.dto.AssetsWorkflowApplyDto;
import com.datablau.dataasset.dto.CatalogChangeDto;
import com.datablau.dataasset.dto.CatalogWorkflowApplyDto;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.dto.BatchApplyDetailRemoteDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.security.management.api.RoleService;
import com.google.common.collect.Sets;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping(value = "/workflow")
public class DataAssetsWorkflowController extends BaseController {


    private static final Logger LOGGER = LoggerFactory.getLogger(DataAssetsWorkflowController.class);


    @Autowired
    private DataAssetsCatalogProcessService dataAssetsCatalogProcessService;

    @Autowired
    private DataAssetsApplyRecordService dataAssetsApplyRecordService;

    @Autowired
    private DataAssetsCatalogProcessExt0Service processExtService;

    @Autowired
    private DomainExtService domainExtService;

    @Autowired
    protected DataAssetsCatalogService dataAssetsCatalogService;


    @Autowired
    protected DataAssetsCatalogRepository catalogRepository;

    public DataAssetsWorkflowController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "资产目录上下线")
    @PostMapping(value = "/applyOfCatalog")
    public ResResultDto<?> applyWorkflowOfCatalog(@RequestBody CatalogWorkflowApplyDto catalogWorkflowApplyDto) {

        processExtService.applyCatalog(catalogWorkflowApplyDto, getCurrentUser());
        return ResResultDto.ok();
    }


    @Operation(summary = "资产上下线")
    @PostMapping(value = "/applyOfAssets")
    public ResResultDto<?> applyWorkflowOfAssets(@RequestBody AssetsWorkflowApplyDto assetsWorkflowApplyDto) {
        dataAssetsCatalogProcessService.applyAssets(assetsWorkflowApplyDto, getCurrentUser());
        return ResResultDto.ok();
    }


    @Operation(summary = "目录变更申请")
    @PostMapping(value = "/applyOfChangeCatalog")
    public ResResultDto<?> applyChangeOfCatalog(@RequestBody WorkflowChangeDto workflowChangeDto) {

        // dataAssetsCatalogProcessService.applyCatalogChange(workflowChangeDto, getCurrentUser());
       // workflowChangeDto.getNewCatalogData().getCatalogPath()
        // 由于变更这里只能一层一层去查询 所以先查询到  先查询当前的目录的数据
        CatalogChangeDto neCatalogData = workflowChangeDto.getNewCatalogData();
        Optional<CommonCatalog> byId = catalogRepository.findById(neCatalogData.getCatalogId());
        String buCode = null;
        // 判断层级如果不是level 为1 那就去找上一级 直到找到level 为1
        if (byId.isPresent()) {
            CommonCatalog catalog = byId.get();
            int currentLevel = catalog.getLevel();
            
            // 如果当前层级不是1，需要逐级向上查找直到找到level为1的目录
            while (currentLevel > 1 && catalog.getParentId() != null && catalog.getParentId() != 0) {
                Optional<CommonCatalog> parentCatalog = catalogRepository.findById(catalog.getParentId());
                if (parentCatalog.isPresent()) {
                    catalog = parentCatalog.get();
                    currentLevel = catalog.getLevel();
                } else {
                    // 如果找不到父级目录，跳出循环
                    break;
                }
            }
            if (currentLevel == 1) {
                buCode  = catalog.getCode();
            }
        }

        LOGGER.info("bucode "+ buCode);
        BatchApplyRemoteDto batchApplyRemoteDto = new BatchApplyRemoteDto();
        batchApplyRemoteDto.setApplyOperation("变更");
        batchApplyRemoteDto.setApplyCreator(getCurrentUser());
        batchApplyRemoteDto.setApplyType("资产");
        batchApplyRemoteDto.setApplyCreateTime(new Date());
        batchApplyRemoteDto.setBuCode(buCode);
        String[] split = workflowChangeDto.getNewCatalogData().getCatalogPath().split("/");
        batchApplyRemoteDto.setApplyName(split[0]);

        CatalogChangeDto oldCatalogData = workflowChangeDto.getOldCatalogData();
        List<BatchApplyDetailRemoteDto> detailRemoteDtos = new ArrayList<>();
        BatchApplyDetailRemoteDto detailRemoteDto = new BatchApplyDetailRemoteDto();
        detailRemoteDto.setCode(neCatalogData.getCatalogCode());
        detailRemoteDto.setCnName(neCatalogData.getApproverName());
        detailRemoteDto.setEnName(neCatalogData.getCatalogName());
        detailRemoteDto.setDataType("资产");
        detailRemoteDto.setSubmitUser(getCurrentUser());
        detailRemoteDto.setNeId(String.valueOf(neCatalogData.getCatalogId()));
        detailRemoteDto.setOrderType("变更");
        detailRemoteDto.setNeData(JsonUtils.toJSon(neCatalogData));
        detailRemoteDto.setOldData(JsonUtils.toJSon(oldCatalogData));
        detailRemoteDtos.add(detailRemoteDto);
        batchApplyRemoteDto.setDetails(detailRemoteDtos);
        domainExtService.remoteCreateUpdateApple(batchApplyRemoteDto,"asset_update");
       // dataAssetsCatalogService.updateCatalogStatus(Sets.newHashSet(new Long[]{workflowChangeDto.getOldCatalogData().getCatalogId()}), EnumAssetsCatalogStatus.UNDER_REVIEW);
        dataAssetsCatalogService.updateCatalogStatus(Sets.newHashSet(new Long[]{neCatalogData.getCatalogId()}), EnumAssetsCatalogStatus.UNDER_REVIEW);
        return ResResultDto.ok();
    }


    @Operation(summary = "目录权限申请")
    @PostMapping(value = "/applyAuthOfChangeCatalog")
    public ResResultDto<?> applyAuthOfCatalog(@RequestBody CatalogAuthApplyDto catalogAuthApplyDto) {
        dataAssetsCatalogProcessService.applyAuthOfCatalog(catalogAuthApplyDto, getCurrentUser());
        return ResResultDto.ok();
    }


    @Operation(summary = "资产提交审批列表")
    @GetMapping(value = "/assets/list/{processInstance}/{pageNum}/{pageSize}")
    public ResResultDto<Page<DataAssetsApplyRecord>> assetsApplyDetails(@PathVariable String processInstance,
                                                                        @PathVariable int pageNum,
                                                                        @PathVariable int pageSize) {

        Page<DataAssetsApplyRecord> dataAssetsApplyRecords = dataAssetsApplyRecordService.page(processInstance, pageNum, pageSize);
        return ResResultDto.ok(dataAssetsApplyRecords);
    }

    @Operation(summary = "目录权限申请")
    @PostMapping(value = "/receipt")
    public void receipt(HttpServletResponse response,
                        @RequestParam("processId") String processId) throws Exception {
        dataAssetsApplyRecordService.downloadApplyReceipt(processId, response);
    }
}
