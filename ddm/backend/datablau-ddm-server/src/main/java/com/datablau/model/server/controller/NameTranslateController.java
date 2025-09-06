package com.datablau.model.server.controller;

import com.datablau.model.data.api.NameTranslateService;
import com.datablau.model.data.dto.NameTranslateDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
@RestController("nameTranslateController")
@ConditionalOnMissingBean(name = "nameTranslateControllerExt")
@RequestMapping("/nametranslate")
@Tag(name = "翻译相关REST API", description = "翻译相关REST API")
public class NameTranslateController {
    @Autowired
    NameTranslateService nameTranslateService;

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "名字翻译", description = "名字翻译")
    public List<String> translate(
            @Parameter(description = "翻译对象", required = true) @RequestBody NameTranslateDto nameTranslateDto){
        return nameTranslateService.translate(nameTranslateDto);
    }

    @RequestMapping(value = "/category")
    @Operation(summary = "获取所有公共标准分类", description = "获取所有公共标准分类")
    public Set<String> getCategory(){
        return nameTranslateService.getCategory();
    }
}
