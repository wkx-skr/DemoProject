package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.EndpointDoc;
import com.datablau.data.common.controller.BaseController;
import com.datablau.metadata.main.entity.metadata.GraphPosition;
import com.datablau.metadata.main.service.metadata.api.GraphPositionService;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author senyan
 */
@Tag(name = "图位置的rest api")
@RestController
@RequestMapping("/graph/position")
public class GraphPositionController extends BaseController {

    @Autowired
    protected GraphPositionService positionService;

    public GraphPositionController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 保存图的位置
     * @param position
     * @return
     */
    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "保存图的位置")
    @EndpointDoc(bodyExample =
            "{\n"
                    + "    \"nodeId\" : \"1\",\n"
                    + "    \"nodePosition\" : \"{x:21, y:22}\",\n"
                    + "    \"itemId\" : \"1\",\n"
                    + "    \"itemType\" : \"LINEAGE\"\n"
                    + "}",
            responseExample =
                    "{\n"
                            + "    \"id\": 1,\n"
                            + "    \"nodeId\": \"1\",\n"
                            + "    \"nodePosition\": \"{x:21, y:22}\",\n"
                            + "    \"itemId\": \"1\",\n"
                            + "    \"itemType\": \"LINEAGE\",\n"
                            + "    \"owner\": \"admin\"\n"
                            + "}")
    public GraphPosition createOrUpdate(@RequestBody GraphPosition position) {
        return positionService.createOrUpdate(position);
    }

    /**
     * 获取指定用户的上次保存的图里面每个节点的位置 返回的是节点的数组
     * @param position
     * @return
     */
    @RequestMapping(value = "/lists/owner", method = RequestMethod.POST)
    @Operation(summary = "获取指定用户的上次保存的图里面每个节点的位置，返回的是节点的数组")
    @EndpointDoc(bodyExample =
            "{\n"
                    + "    \"nodeId\" : \"1\",\n"
                    + "    \"nodePosition\" : \"{x:21, y:22}\",\n"
                    + "    \"itemId\" : \"1\",\n"
                    + "    \"itemType\" : \"LINEAGE\"\n"
            + "}",
            responseExample =
                    "[\n"
                            + "    {\n"
                            + "        \"id\": 1,\n"
                            + "        \"nodeId\": \"1\",\n"
                            + "        \"nodePosition\": \"{x:21, y:22}\",\n"
                            + "        \"itemId\": \"1\",\n"
                            + "        \"itemType\": \"LINEAGE\",\n"
                            + "        \"owner\": \"admin\"\n"
                            + "    }\n"
                    + "]")
    public List<GraphPosition> getGraphPositionsByItemIdAndItemTypeAndOwner(@RequestBody GraphPosition position) {
        return positionService.getGraphPositionsByItemIdAndItemTypeAndOwner(position);
    }

}
