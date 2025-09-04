package com.datablau.graph.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.datablau.data.common.api.ExcelExporter;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ShareKit;
import com.datablau.graph.data.data.NodeDto;
import com.datablau.graph.data.data.PageRequestDto;
import com.datablau.graph.data.data.PageResponseDto;
import com.datablau.graph.data.data.RelationDto;
import com.datablau.graph.data.service.api.GraphService;
import com.datablau.graph.jpa.entity.CustomizedGraphRelation;
import com.datablau.graph.service.CustomizedGraphRelationService;
import com.datablau.graph.utility.GraphRelationshipTemplate;
import com.google.common.collect.ImmutableMap;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author Nicky - 数语科技有限公司
 * date 2019/6/4 13:45
 */
@Tag(name = "图 api")
@RestController
@RequestMapping("/graph")
public class GraphController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(GraphController.class);

    @Autowired
    private GraphService graphService;
    @Autowired
    private CustomizedGraphRelationService customizedGraphRelationService;
    @Autowired
    private ExcelExporter excelExporter;

    private static final Map<String, String> typeMap = ImmutableMap.<String, String>builder()
        .put("80010000", "标签")
        .put("82800002", "报表")
        .put("82800010", "用户")
        .put("82800009", "元数据")
        .put("82800017", "业务规则")
        .put("82800012", "应用系统")
        .put("82800016", "技术规则")
        .put("80010001", "数据源")
        .put("80010066", "数据标准")
        .put("80010098", "标准代码")
        .put("80000004", "表")
        .put("80000005", "字段")
        .put("80010118", "存储过程")
        .put("80010119", "函数")
        .put("82800003", "指标")
        .put("80500008", "视图")
        .put("82800018", "权属部门")
        .put("82800015", "血缘")
        .put("82800019", "API")
        .put("80010076", "目录")
        .put("82800020", "同义词")
        .put("82800024", "程序包")
        .put("82800023", "维度")
        .put("82800031", "维度层级")
        .build();

    /**
     * 查询节点及关系
     */
    @Operation(summary = "查询节点及关系")
    @Parameters({@Parameter(name = "id", description = "对象id", in = ParameterIn.QUERY),
        @Parameter(name = "type", description = "对象类型", in = ParameterIn.QUERY),
        @Parameter(name = "layers", description = "展开层级", in = ParameterIn.QUERY),
        @Parameter(name = "scope", description = "方向，有三种情况，(left,right,all)", in = ParameterIn.QUERY)})
    @PostMapping(value = "/searchNodeRelation")
    public Map searchNodeRelation(@RequestParam(value = "id") String id,
        @RequestParam(value = "type") String type,
        @RequestParam(value = "layers") Integer layers,
        @RequestParam(value = "scope") String scope) {
        return graphService.searchNodeRelation(id, type, layers, scope);
    }

    /**
     * 查询节点及关系
     */
    @Operation(summary = "查询节点及关系")
    @Parameters({@Parameter(name = "id", description = "对象id", in = ParameterIn.QUERY),
        @Parameter(name = "type", description = "对象类型", in = ParameterIn.QUERY),
        @Parameter(name = "layers", description = "展开层级", in = ParameterIn.QUERY),
        @Parameter(name = "page", description = "页数", in = ParameterIn.QUERY),
        @Parameter(name = "pageSize", description = "每页数量", in = ParameterIn.QUERY),
        @Parameter(name = "scope", description = "方向，有三种情况，(left,right,all)", in = ParameterIn.QUERY)})
    @PostMapping(value = "/pageList")
    public Map getRelationList(@RequestParam(value = "id") String id,
        @RequestParam(value = "type") String type,
        @RequestParam(value = "page") Long page,
        @RequestParam(value = "pageSize") Long pageSize,
        @RequestParam(value = "layers") Integer layers,
        @RequestParam(value = "scope") String scope) {
        return graphService.getRelationListPage(id, type, layers, scope, page, pageSize);
    }

    /**
     * 查询节点路径
     */
    @Operation(summary = "查询节点路径")
    @Parameters({@Parameter(name = "id", description = "对象id", in = ParameterIn.QUERY),
        @Parameter(name = "type", description = "对象类型", in = ParameterIn.QUERY),
        @Parameter(name = "layers", description = "展开层级", in = ParameterIn.QUERY)})
    @PostMapping(value = "/getNodePath")
    public List<String> getNodePath(@RequestParam(value = "id") String id,
        @RequestParam(value = "type") String type) {
        return graphService.getNodePath(id, type);
    }

    @Operation(summary = "创建自定义关系")
    @PostMapping(value = "/addCustomizedRelation")
    public void addCustomizedRelation(
        @RequestBody CustomizedGraphRelation customizedGraphRelation) {
        customizedGraphRelationService.addRelationship(customizedGraphRelation);
    }

    @Operation(summary = "删除自定义关系")
    @RequestMapping(value = "/removeCustomizedRelation", method = RequestMethod.POST)
    public void removeCustomizedRelation(@RequestBody RelationDto relationDto) {
        customizedGraphRelationService.deleteRelationship(relationDto);
    }

    @Operation(summary = "导出关系")
    @PostMapping(value = "/exportRelationship")
    public ResponseEntity<byte[]> export(@RequestParam(value = "id") String id,
        @RequestParam(value = "type") String type,
        @RequestParam(value = "layers") Integer layers,
        @RequestParam(value = "scope") String scope) {
        Map map = graphService.searchNodeRelation(id, type, layers, scope);
        List data = (List)map.get("data");
        ArrayList<GraphRelationshipTemplate> graphRelationshipTemplates = new ArrayList<>();
        for (Object datum : data) {
            Map nodeAndRelation = (Map) datum;
            NodeDto endNode = (NodeDto) nodeAndRelation.get("endNode");
            NodeDto startNode = (NodeDto) nodeAndRelation.get("startNode");
            RelationDto relation = (RelationDto) nodeAndRelation.get("relation");
            GraphRelationshipTemplate graphRelationshipTemplate = new GraphRelationshipTemplate();
            graphRelationshipTemplate.setRelationshipType(relation.getRelationName());
            graphRelationshipTemplate.setRelationshipDescription(relation.getDescription());
            graphRelationshipTemplate.setSourceName(startNode.getName());
            graphRelationshipTemplate.setSourceType(typeMap.get(startNode.getTypeId()));
            if (startNode.getPath() != null) {
                graphRelationshipTemplate.setSourcePath(String.join("，", startNode.getPath()));
            }
            graphRelationshipTemplate.setTargetName(endNode.getName());
            if (endNode.getPath() != null) {
                graphRelationshipTemplate.setTargetPath(String.join("，", endNode.getPath()));
            }
            graphRelationshipTemplate.setTargetType(typeMap.get(endNode.getTypeId()));
            graphRelationshipTemplates.add(graphRelationshipTemplate);
        }
        try {
            File resultFile = excelExporter.exportExcelUseTemplate(
                ShareKit.getResourcePath("/templates/graph_template.xlsx"),
                GraphRelationshipTemplate.class, graphRelationshipTemplates
                , "关系列表", 0, "知识图谱");
            return ShareKit.generalResponseEntityByFile(resultFile);
        } catch (Exception e) {
            logger.error("导出知识图谱失败", e);
            throw new UnexpectedStateException("导出知识图谱失败:" + e.getMessage());
        }
    }

    @Operation(summary = "根据类型和名称查询图谱节点")
    @PostMapping("/searchNode")
    public PageResponseDto<NodeDto> getNodePageByTypeAndLikeName(
            @RequestBody PageRequestDto pageRequestDto) {
        return graphService.getNodePageByTypeAndLikeName(pageRequestDto);
    }
}
