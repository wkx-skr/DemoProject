package com.datablau.base.server.controller;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.datablau.base.server.jpa.entity.EsSynonym;
import com.datablau.base.server.jpa.repository.EsSynonymRepository;
import com.datablau.base.server.service.EsSynonymService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.Date;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/synonym")
@Tag(name = "es同义词相关")
public class EsSynonymController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(EsSynonymController.class);

    @Autowired
    private EsSynonymService synonymService;

    @Autowired
    private EsSynonymRepository synonymRepository;

    public EsSynonymController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping(value = "/flush/file")
    @Operation(summary = "刷新同义词文件")
    public ResponseEntity<byte[]> flushSynonymTxtFile(HttpServletRequest request, HttpServletResponse response) {
        String modified = request.getHeader("If-Modified-Since");
        Date lastModified = synonymRepository.findLastModify();
        if (lastModified == null) {
            response.setStatus(304);
            return null;
        }
        if (!StringUtils.isEmpty(modified) && lastModified.toString().equals(modified)) {
            response.setStatus(304);
            return null;
        }
        ResponseEntity<byte[]> result = null;
        try {
            File file = synonymService.flushSynonymTxtFile();
            if (file == null) {
                file = new File("synonyms.txt");
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", file.getName());
            headers.set("Last-Modified", lastModified.toString());
            result = new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("刷新es同义词文件失败" + e.getMessage());
        }
        return result;
    }

    @PostMapping(value = "/searchWord")
    @Operation(summary = "获取es同义词列表")
    public Set<String> getEsSearchWordSynonym(@Parameter(name = "word", description = "关键字") @RequestParam("word") String word) {
        if (StringUtils.isEmpty(word)) {
            return null;
        }
        try {
            return synonymService.getEsSearchWordSynonym(word);
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping(value = "/getSynonymPage")
    @Operation(summary = "获取同义词页")
    public List<EsSynonym> getSynonymPage() {
        return synonymService.getSynonymPage();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_es_synonym",
//            systemModule = OperationModuleType.SYSTEM_SETUP,
//            description = "删除同义词组：{param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @PostMapping(value = "/deleteSynonym")
    @Operation(summary = "删除同义词组")
    public void deleteSynonym(@RequestParam("id") Long id) {
        if (id == null) {
            throw new AndorjRuntimeException("参数id为空");
        }
        synonymService.deleteSynonym(id);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_es_synonym",
//            systemModule = OperationModuleType.SYSTEM_SETUP,
//            description = "添加同义词组:{param}",
//            descriptionParamClass = EsSynonym.class,
//            descriptionParamMethod = "getId"
//    )
    @Operation(summary = "添加同义词组")
    @PostMapping(value = "/insertSynonym")
    public void insertSynonym(EsSynonym synonym) {
        if (synonym == null) {
            throw new AndorjRuntimeException("参数为空");
        }
        synonymService.insertSynonym(synonym, true);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_es_synonym",
//            systemModule = OperationModuleType.SYSTEM_SETUP,
//            description = "修改同义词组：{param}",
//            descriptionParamClass = EsSynonym.class,
//            descriptionParamMethod = "getId"
//    )
    @PostMapping(value = "/updateSynonym")
    @Operation(summary = "修改同义词组")
    public void updateSynonym(EsSynonym synonym) {
        if (synonym == null) {
            throw new AndorjRuntimeException("参数为空");
        }
        if (synonym.getId() == null) {
            throw new AndorjRuntimeException("参数id为空");
        }
        synonymService.updateSynonym(synonym);
    }

}
