package com.datablau.data.quality.controller;

import com.andorj.common.core.annotation.Feature;
import com.andorj.common.data.PageResult;
import com.andorj.license.utility.lic.LicenseInfo;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.operation.annotation.OperatorLog;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.quality.data.KnowledgeDocSearchCriteriaDto;
import com.datablau.data.quality.data.SimpleKnowledgeDoc;
import com.datablau.data.quality.jpa.entity.KnowledgeDoc;
import com.datablau.data.quality.jpa.entity.KnowledgeDocEditHistory;
import com.datablau.data.quality.metadata.service.KnowledgeDocService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "知识库相关API")
@RestController
@RequestMapping("/knowledge")
@Feature(LicenseInfo.FE_QUALITY)
public class KnowledgeDocController extends BaseController {

    @Autowired
    private KnowledgeDocService kdService;
    @Autowired
    private MessageService msgService;


    @Operation(summary = "分页获取知识库")
    @RequestMapping(value = "/kds", method = RequestMethod.POST)
    public PageResult<SimpleKnowledgeDoc> getAllSourceObjects(@RequestBody KnowledgeDocSearchCriteriaDto searchCriteria) {
        if(searchCriteria.getCurrentPage() < 1 || searchCriteria.getPageSize() < 1)
            throw new IllegalArgumentException(msgService.getMessage("pageNumberAndPageSizeMustGreaterThanZero"));

        return kdService.loadSimpleKnowledgeDocPages(searchCriteria);
    }

    @Operation(summary = "知识库详情")
    @Parameters({@Parameter(name = "kdId", description = "知识库id" ,in = ParameterIn.PATH)})
    @RequestMapping(value = "/kd/{kdId}")
    public KnowledgeDoc getKnowledgeDocDetail(@PathVariable("kdId")Long kdId) throws Exception {
        return kdService.getKnowledgeDocDetail(kdId);
    }

    @Operation(summary = "新增/修改知识库")
    @OperatorLog(
            operation = OperationLogType.TABLE_ADD,
            operateTable = "db_knowledge_doc",
            systemModule = OperationModuleType.QUALITY_KD,
            description = "新增/修改知识库名为: {param}",
            descriptionParamClass = KnowledgeDoc.class,
            descriptionParamMethod = "getTitle"
    )
    @RequestMapping(value = "/kd", method = RequestMethod.POST)
    public void createOrUpdateKnowledgeDoc(@RequestBody KnowledgeDoc kd) throws Exception {
        kdService.createOrUpdateKnowledgeDoc(kd);
    }

    @Operation(summary = "删除知识库ID")
    @OperatorLog(
            operation = OperationLogType.TABLE_DELETE,
            operateTable = "db_knowledge_doc",
            systemModule = OperationModuleType.QUALITY_KD,
            description = "删除知识库ID为: {params}",
            descriptionParamClass = Long.class,
            descriptionParamMethod = "toString"
    )
    @RequestMapping(value = "/kd/delete", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.QUALITY_KBM_DELETE)
    public void deleteKnowledgeDocs(@RequestBody List<Long> docs) throws Exception {
        kdService.removeKnowledgeDocs(docs);
    }

    @Operation(summary = "历史编辑")
    @Parameters({@Parameter(name = "kdId", description = "知识库id" ,in = ParameterIn.PATH),
            @Parameter(name = "currentPage", description = "当前页" ,in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "页大小" ,in = ParameterIn.QUERY)})
    @RequestMapping(value = "/kd/{kdId}/history")
    public PageResult<KnowledgeDocEditHistory> getKnowledgeDocHistory(@PathVariable("kdId")Long kdId,
                                                                     @RequestParam(name = "currentPage", defaultValue = "0")Integer currentPage,
                                                                     @RequestParam(name = "pageSize", defaultValue = "50")Integer pageSize) throws Exception {
        if(kdId == null) {
            throw new IllegalArgumentException(msgService.getMessage("idOfKnowledgeBaseIsEmpty"));
        }

        return kdService.loadKnowledgeDocHistoryPages(kdId, currentPage, pageSize);
    }
}
