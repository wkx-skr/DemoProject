package com.datablau.archy.server.controller;

import com.datablau.archy.server.dto.graph.GraphObjectDto;
import com.datablau.archy.server.enums.GraphType;
import com.datablau.archy.server.service.ArchyGraphService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/graph")
@Tag(name = "Archy血缘图谱相关API", description = "Archy血缘图谱相关API")
public class ArchyGraphController extends BaseController {

    @Autowired
    private ArchyGraphService archyGraphService;

    @PostMapping("/relation")
    @Operation(summary = "查询节点及关系")
    @Parameters({@Parameter(name = "id", description = "对象id", in = ParameterIn.QUERY),
            @Parameter(name = "type", description = "对象类型", in = ParameterIn.QUERY),
            @Parameter(name = "layers", description = "展开层级", in = ParameterIn.QUERY),
            @Parameter(name = "scope", description = "方向，有三种情况，(left,right,all)", in = ParameterIn.QUERY)})
    public Map<String, List<GraphObjectDto>> getGraph(@RequestParam(value = "id") String id,
                                                      @RequestParam(value = "type") GraphType type,
                                                      @RequestParam(value = "layers") Integer layers,
                                                      @RequestParam(value = "scope") String scope) {
        return archyGraphService.getGraph(id, type, layers, scope);
    }

}
