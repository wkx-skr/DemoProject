package com.datablau.domain.management.controller;

import com.andorj.common.core.data.CommonPair;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.api.PropertyService;
import com.datablau.data.common.api.impl.KafkaPublishService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.data.DataBlauHttpServletRequest;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.domain.management.api.*;
import com.datablau.domain.management.data.CategoryType;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.dto.base.CompareCodeDto;
import com.datablau.domain.management.impl.DomainExtServiceImpl;
import com.datablau.domain.management.impl.DomainFolderExtService;
import com.datablau.domain.management.impl.StandardServiceExt;
import com.datablau.domain.management.jpa.entity.DataRule;
import com.datablau.domain.management.jpa.entity.DomainFolder;
import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResult;
import com.datablau.domain.management.mq.message.DeleteDataStandardMessage;
import com.datablau.domain.management.service.DomainServiceExt;
import com.datablau.domain.management.type.PermissionLevel;
import com.datablau.domain.management.type.PermissionType;
import com.datablau.domain.management.utility.DataUtility;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.redisson.api.RMap;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * @author huajun.li
 */
@RestController
@RequestMapping("/domains/similarity")
@Tag(name = "数据标准相似度检查相关的REST API")
public class DomainSimilarityCheckController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DomainSimilarityCheckController.class);

    @Autowired
    private DomainSimilarityCheckService domainSimilarityCheckService;

    @PostMapping(value = "/getSimilarityGroup")
    @Operation(summary = "获取相似标准组")
    public List<DomainSimilarityCheckResult> getSimilarityGroup(@RequestBody Map<String, Object> reqBody) throws Exception {
        return domainSimilarityCheckService.getSimilarityGroup(reqBody);
    }

    @PostMapping(value = "/getSimilarityDetail")
    @Operation(summary = "获取相似标准组明细")
    public List<DomainSimilarityCheckResultDetailDto> getSimilarityDetail(@RequestBody Map<String, Object> reqBody) throws Exception {
        return domainSimilarityCheckService.getSimilarityDetail(reqBody, getCurrentUser());
    }
    @PostMapping(value = "/getSimilarityDetailByDomainId")
    @Operation(summary = "获取相似标准组明细(ByDomainId)")
    public List<DomainSimilarityCheckResultDetailDto> getSimilarityDetailByDomainId(@RequestBody Map<String, Object> reqBody) throws Exception {
        return domainSimilarityCheckService.getSimilarityDetailByDomainId(reqBody, getCurrentUser());
    }

    @PostMapping(value = "/skip")
    @Operation(summary = "跳过检查")
    public Boolean skip(@RequestBody List<String> domainIds) throws Exception {
        return domainSimilarityCheckService.skipCheck(domainIds, getCurrentUser());
    }

    @PostMapping(value = "/skipNew")
    @Operation(summary = "跳过检查")
    public Boolean skipNew(@RequestBody List<SkipReasonDto> skipReasonDtos) throws Exception {
        return domainSimilarityCheckService.skipCheckNew(skipReasonDtos, getCurrentUser());
    }

}
