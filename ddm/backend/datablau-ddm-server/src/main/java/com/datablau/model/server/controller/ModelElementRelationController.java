package com.datablau.model.server.controller;

import com.datablau.model.data.jpa.entity.ModelElementRelation;
import com.datablau.model.data.jpa.repository.ModelElementRelationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/5/17 16:25
 */

@RestController("modelElementRelationController")
@ConditionalOnMissingBean(name = "modelElementRelationControllerExt")
@RequestMapping("/model/relation")
@Tag(name = "元素关系相关REST API", description = "元素关系相关REST API")
public class ModelElementRelationController {

    @Autowired
    ModelElementRelationRepository elementRelationDao;

    @Operation(description = "查询所有关系")
    @GetMapping("/relations")
    public List<ModelElementRelation> getAllRelation() {
        return elementRelationDao.findAllRelation();
    }

}
