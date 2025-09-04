package com.datablau.base.server.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.model.LDMTypes;
import com.datablau.base.data.VoteStarDto;
import com.datablau.base.server.service.LocalVoteStarService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2019/6/3
 */

@RestController
@RequestMapping("/vote")
@Tag(name = "vote相关API")
public class VoteStarController extends BaseController {

    @Autowired
    private LocalVoteStarService voteService;

    public VoteStarController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "打星级")
    public void voteStar(@RequestBody VoteStarDto star) throws Exception {
        voteService.voteObject(star.getObjId(), star.getTypeId(), star.getStar());
    }

    @RequestMapping(value = "/asset", method = RequestMethod.POST)
    @Operation(summary = "打星级")
    public void voteStarForAsset(@RequestBody VoteStarDto star) throws Exception {
        voteService.voteAsset(star);
    }

    @RequestMapping("/star")
    @Operation(summary = "获取用户投票星级")
    public Integer getUserVoteStar(@Parameter(name = "objId", description = "对象id") @RequestParam(name = "objId") String objId,
                                   @Parameter(name = "typeId", description = "类型") @RequestParam(name = "typeId") Long typeId) throws Exception {
        return voteService.getUserVoteStar(objId, typeId);
    }

    @RequestMapping("/stars")
    @Operation(summary = "获取打星级别")
    public Double getVoteStars(@Parameter(name = "objId", description = "唯一id") @RequestParam(name = "objId") String objId,
                               @Parameter(name = "typeId", description = "类别") @RequestParam(name = "typeId") Long typeId) throws Exception {
        return voteService.getCurrentVoteStar(objId, typeId);
    }

    @RequestMapping(value = "/domain/stars", method = RequestMethod.GET)
    @Description("通过传入domainId，返回这个数据标准的评分")
    @Parameters({@Parameter(name = "domainId", description = "domainId", in = ParameterIn.QUERY, required = true)})
    public Double getDomainStars(@RequestParam String domainId) {
        Double voteStar = voteService.getCurrentVoteStar(domainId, LDMTypes.oDataStandard);

        return voteStar;
    }
}
