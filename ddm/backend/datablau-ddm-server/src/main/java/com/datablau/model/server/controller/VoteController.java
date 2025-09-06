package com.datablau.model.server.controller;

import com.datablau.model.data.jpa.entity.VoteStar;
import com.datablau.model.data.jpa.entity.VoteStarOverall;
import com.datablau.model.server.service.api.VoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import com.datablau.data.common.controller.BaseController;
/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2019/6/3
 */

@RestController("voteController")
@ConditionalOnMissingBean(name = "voteControllerExt")
@RequestMapping("/vote")
@Tag(name = "用户评价相关REST API", description = "用户评价相关REST API")
public class VoteController extends BaseController {

    @Autowired
    protected VoteService voteService;


    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "提交一个评分", description = "提交一个评分, objId是模型id， typeId目前固定是80010001")
    public void voteStar(@RequestBody VoteStar star) {
        voteService.voteObject(star.getObjId(), star.getTypeId(), star.getStar());
    }


    @RequestMapping("/star")
    @Operation(summary = "获取当前用户对指定对象的评分", description = "获取当前用户对指定对象的评分, 目前类型ID固定是80010001")
    @Parameters({
            @Parameter(name = "objId", description = "对象ID", in = ParameterIn.QUERY),
            @Parameter(name = "typeId", description = "类型ID", in = ParameterIn.QUERY)
    })
    public Integer getUserVoteStar(@RequestParam("objId") String objId,
                                   @RequestParam("typeId") Long typeId) {
        return voteService.getCurrentUserVoteStar(objId, typeId);
    }


    @RequestMapping("/stars/types/{typeId}/objects/{objectId}")
    @Operation(summary = "获取当前用户对指定对象的评分", description = "获取当前用户对指定对象的评分, 目前类型ID固定是80010001")
    @Parameters({
            @Parameter(name = "objectId", description = "对象ID", in = ParameterIn.PATH),
            @Parameter(name = "typeId", description = "类型ID", in = ParameterIn.PATH)
    })
    public Double getObjectVoteStar(@PathVariable("objectId") String objId,
                                    @PathVariable("typeId") Long typeId) {
        return voteService.getObjectVoteStar(objId, typeId);
    }


    @RequestMapping(value = "/stars/types/{typeId}/objects", method = RequestMethod.POST)
    @Operation(summary = "获取指定一系列对象的评分", description = "获取指定一系列对象的评分， 类型ID目前固定是80010001, 对象ID需要转化为String, requestBody是请求的对象的ID的json数组")
    @Parameters({
            @Parameter(name = "typeId", description = "类型ID", in = ParameterIn.PATH)
    })
    public Map<String, Double> getObjectVoteStars(@PathVariable("typeId") Long typeId,
                                                  @RequestBody List<String> objectIds) {
        return voteService.getBatchOfObjectsVoteStar(typeId, objectIds);
    }


    @RequestMapping("/stars/types/{typeId}")
    @Operation(summary = "获取一种类型对象的所有排序过的评分", description = "获取一种类型对象的所有排序过的评分")
    @Parameters({
            @Parameter(name = "desc", description = "是否按照分数降序排列，默认是true", in = ParameterIn.QUERY),
            @Parameter(name = "typeId", description = "类型ID", in = ParameterIn.PATH)
    })
    public List<VoteStarOverall> getObjectScores(@PathVariable("typeId") Long typeId,
                                                 @RequestParam(name = "desc", defaultValue = "true") Boolean desc) {
        return voteService.getSortedVoteResult(typeId, desc);
    }
}

