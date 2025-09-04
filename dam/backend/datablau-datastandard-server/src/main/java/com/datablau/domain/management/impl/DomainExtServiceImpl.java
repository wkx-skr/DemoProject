package com.datablau.domain.management.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.BaseModelCategory;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.api.OperationLogService;
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
import com.datablau.domain.management.api.ApplyService;
import com.datablau.domain.management.api.BusinessTermService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.data.MetricType;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.es.utilty.DomainDataSynchronizer;
import com.datablau.domain.management.jpa.entity.*;
import com.datablau.domain.management.jpa.repository.*;
import com.datablau.domain.management.jpa.type.DatablauDomainType;
import com.datablau.domain.management.utility.DataUtility;
import com.datablau.domain.management.utility.RemoteServiceGetter;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.dto.BatchApplyDetailRemoteDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.project.api.dto.CustomDomainExtDto;
import com.datablau.project.util.CheckNameUtil;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DomainExtServiceImpl implements DomainExtService {

    private static final Logger logger = LoggerFactory.getLogger(DomainExtServiceImpl.class);
    private static final String CHECK_REFERENCE_CODE_RELA_LOCK = "check-referenceCode-isRelated-lk";
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private UserService userService;

    @Autowired
    private DomainServiceImpl domainService;
    @Autowired
    private PlatformTransactionManager txManager;
    @Autowired
    private ExcelLoader excelLoader;
    @Value("${datablau.workflow.enable:true}")
    private boolean workflowEnable;
    @Autowired
    private MessageService msgService;
    @Autowired
    private DomainDataSynchronizer domainDataSynchronizer;
    @Autowired
    private BusinessTermService businessTermService;
    @Autowired
    private DomainCodeGenerateServiceExt generateService;
    @Autowired
    private DomainRepository domainRepo;
    @Autowired
    private StandardCodeRepository standardCodeRepo;
    @Autowired
    private DomainFolderExtService domainFolderExtService;
    @Autowired
    private StandardCodeFolderRelaRepository standardCodeFolderRelaRepo;
    @Autowired
    private DomainExtRepository domainExtRepository;
    @Autowired
    private BusinessTermRepository busTermRepo;

    @Autowired
    private ApplyService applyService;

    @Autowired
    private RedissonClient redissonClient;
    private String dataTypes = "字符型,数值型,年,年月,日期型,日期时间型,时间型（time）,时间间隔型,布尔型,二进制型";
    private LoadingCache<String, String> referenceCodeCache = CacheBuilder.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(10))
            .build(new CacheLoader<>() {
                @Override
                public String load(String key) throws Exception {
                    List<Domain> domainByReferenceCode = domainExtRepository.findDomainByReferenceCode(key);
                    return CollectionUtils.isEmpty(domainByReferenceCode) ? "" : domainByReferenceCode.get(0).getDomainCode();
                }
            });


    public PageResult<DomainDto> getPageDomains(DomainQueryDto domainQueryDto) {
        PageResult<DomainDto> reuslt = domainService.getPageDomains(domainQueryDto);
        if(reuslt.getContent() != null) {
            List<DomainExtDto> domainExtDtos = reuslt.getContent().stream().map(v -> DomainExtDto.buildBy(v)).toList();
            fillDomainExtDto(domainExtDtos);
            reuslt.setContentDirectly((List) domainExtDtos);
        }
        return reuslt;
    }

    public DomainExtDto getDomainById(String domainId) {
        DomainDto domain = domainService.getDomainByDomainId(domainId);
        DomainExt domainExt = Optional.ofNullable(domainExtRepository.findByDIdEquals(domainId)).orElse(new DomainExt());
        DomainExtDto domainExtDto = DomainExtDto.buildBy(domain, domainExt);
        Optional<StandardCode> codeOpt = standardCodeRepo.findById(domain.getReferenceCode());
        if(codeOpt.isPresent()){
            StandardCode standardCode = codeOpt.get();
            domainExtDto.setReferenceName(standardCode.getName());
        }

        BusinessTerm busterm = busTermRepo.findByDomainCode(domainExtDto.getReferenceTerm());
        if(busterm != null){
            domainExtDto.setReferenceTermName(busterm.getChName());
        }
        return domainExtDto;
    }

    @Transactional
    public DomainDto addDomain(String currentUser, DomainExtDto domainExtDto, Boolean published) {
        Long folderId = domainExtDto.getFolderId();
        Long categoryId = domainExtDto.getCategoryId();

        this.checkAnyTwoCannotEqual(domainExtDto);
        if(!Strings.isNullOrEmpty(domainExtDto.getErrorMsg())){
            throw new RuntimeException(domainExtDto.getErrorMsg());
        }

        String bm = userService.getUserDetails(currentUser).getBm();
        // 保存扩展信息
        String uuid = domainService.getUUID();
        domainExtDto.setDomainId(uuid);
        domainExtDto.setCheckState(null);
        domainExtDto.setDescriptionDepartment(bm);
        DomainExt domainExt = domainExtDto.buildDomainExt();
        domainExtRepository.save(domainExt);

        // 生成domainCode
        DomainTreeNodeDto domainTreeNodeDto = domainFolderExtService.loadDomainTree(null, categoryId, currentUser, true);
        String bizCode = DomainTreeNodeExtDto.searchBizCode(domainTreeNodeDto, folderId, categoryId);
        String domainCode = this.generateService.getSingleDomainCode(DatablauDomainType.formByCategoryId(domainExtDto.getCategoryId()), bizCode);
        domainExtDto.setAutoGenCode(false); // 默认只能自动生成
        domainExtDto.setDomainCode(domainCode);

        // 保存
        Domain domain = new Domain();
        domain.setDomainCode(domainExtDto.getDomainCode());
        domain.setReferenceCode(domainExtDto.getReferenceCode());
        return (DomainDto) checkReferenceCodeIsRelated(Arrays.asList(domain), (Map<String, String> map) -> {
            if(map.isEmpty()) {
                return domainService.addDomain(currentUser, domainExtDto, published);
            }
            throw new AndorjRuntimeException(map.get(domainExtDto.getDomainCode()));
        });
    }

    @Transactional
    public void updateDomain(DomainExtDto domainDto, String currentUser) {
        this.checkAnyTwoCannotEqual(domainDto);
        if(!Strings.isNullOrEmpty(domainDto.getErrorMsg())){
            throw new RuntimeException(domainDto.getErrorMsg());
        }

        // 保存扩展信息
        Domain oldDomain = domainRepo.findById(domainDto.getDomainId()).orElseThrow(() -> new InvalidArgumentException("domainId"));

        String domainId = oldDomain.getDomainId();
        Optional<DomainExt> oldDomainExtOpt = Optional.ofNullable(domainExtRepository.findByDIdEquals(domainId));
        if(oldDomainExtOpt.isPresent()) {
            domainDto.setCheckState(oldDomainExtOpt.get().getCheckState());
        } else {
            domainDto.setCheckState(null);
        }
        domainDto.setDescriptionDepartment(oldDomain.getDescriptionDepartment());
        DomainExt domainExt = domainDto.buildDomainExt();
        domainExtRepository.save(domainExt);

        Domain tmpParam = new Domain();
        tmpParam.setDomainCode(domainDto.getDomainCode());
        tmpParam.setReferenceCode(domainDto.getReferenceCode());
        checkReferenceCodeIsRelated(Arrays.asList(tmpParam), (Map<String, String> map) -> {
            if(map.isEmpty()) {
                String oldReferenceCode = oldDomain.getReferenceCode();
                if(StringUtils.isNotEmpty(oldReferenceCode) && !oldReferenceCode.equals(domainDto.getReferenceCode())) {
                    referenceCodeCacheInvalidate(Arrays.asList(oldReferenceCode));
                }
                return domainService.updateDomain(domainDto, currentUser);
            }
            throw new AndorjRuntimeException(map.get(domainDto.getDomainCode()));
        });
    }

    public String uploadDomain(DataBlauHttpServletRequest dataBlauRequest, String user, MultipartFile multipartFile, boolean published, Long categoryId, boolean autoGenCode, boolean ignoreError) {
        File uploadFile;
        try {
            uploadFile = DataUtility.uploadFile(multipartFile);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(user);
        UserDetails userDetails = userService.getUserDetails(user);
        String bm = userDetails.getBm();

        return instantJobService.submitJob(
                new InstantJob<>() {
                    @Override
                    public void setProgressMonitor(InstantJobProgressMonitor monitor) {
                    }
                    @Override
                    public InstantJobResult call() {
                        try {
                            UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(user, "ignore it", grantedAuthorities);
                            SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                            SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

                            ImportInstantJobResult result = new ImportInstantJobResult();

                            try {
                                result = addImportDomains(uploadFile, published, categoryId, user, bm, autoGenCode, ignoreError);

                                //增加日志
                                addDomainUploadLog(categoryId, result.getSuccess(), result.getFailed(), dataBlauRequest);
                            } catch (Exception e) {
                                result.setJobStatus(InstantJobStage.FAILED);
                                result.setErrorMessage(e.getMessage());
                                logger.error(e.getMessage(), e);
                            } finally {
                                uploadFile.delete();
                            }

                            result.setJobStatus(InstantJobStage.FINISHED);
                            return result;
                        } finally {
                            SecurityContextHolder.clearContext();
                        }
                    }
                }, msgService.getMessage("import.domain") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.IMPORT.toString());

    }

    private void addDomainUploadLog(Long categoryId, int success, int failed, DataBlauHttpServletRequest request) {
        try {
            if (categoryId != DomainService.DOMAIN_CATEGORY_ID) {
                return;
            }

            String logMessage = msgService.getMessage("domain.log.upload.base", success, failed);
            operationLogService.generateOperationLog(OperationModuleType.DOMAIN_GENERATE, "db_domain",
                    OperationLogType.DATA_IMPORT, logMessage, AuthTools.currentUsername(), 0, request);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
    }

    public ImportInstantJobResult addImportDomains(File uploadFile, boolean published, Long categoryId, String username, String bm, boolean autoGenCode, boolean ignoreError) throws Exception {
        this.domainService.checkDomainExcelTemplate(uploadFile, categoryId);
        new DomainParaDto();
        ImportInstantJobResult result = new ImportInstantJobResult();
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(3);
        TransactionStatus status = this.txManager.getTransaction(def);

        DomainParaDto res;
        try {
            ExcelLoadJobResult<DomainExcelDto> loadJobResult = this.excelLoader.loadFile(uploadFile.getAbsolutePath(), 1, DomainExcelDto.class);
            List<DomainExcelDto> domainExcelList = loadJobResult.getLoaded();
            if (domainExcelList == null || domainExcelList.isEmpty()) {
                return result;
            }
            ArrayList<DomainExtDto> domainDtos = new ArrayList();
            Iterator var14 = domainExcelList.iterator();

            while(var14.hasNext()) {
                DomainExcelDto domainExcelDto = (DomainExcelDto)var14.next();

                // 转换引用业务术语名称
                String referenceTermStr = domainExcelDto.getReferenceTerm();
                if(StringUtils.isNotBlank(referenceTermStr)) {
                    List<BusinessTermDto> byNames = businessTermService.getByNames(
                            Arrays.stream(referenceTermStr.split(",")).filter(StringUtils::isNotEmpty).distinct().collect(Collectors.toList())
                    );
                    if(byNames != null && !byNames.isEmpty()) {
                        List<String> termCodes = byNames.stream().map(term -> term.getDomainCode()).distinct().collect(Collectors.toList());
                        domainExcelDto.setReferenceTerm(String.join(",", termCodes));
                    } else {
                        domainExcelDto.setReferenceTerm("");
                    }
                }
                // 转换引用参考数据名称
                String referenceCodeStr = domainExcelDto.getReferenceCode();
                if(StringUtils.isNotBlank(referenceCodeStr)) {
                    StandardCode firstByName = standardCodeRepo.findFirstByName(referenceCodeStr);
                    domainExcelDto.setReferenceCode(Optional.ofNullable(firstByName).map(StandardCode::getCode).orElse(""));
                }

                // 转换引用废弃标准名称
                String relationDomainStr = domainExcelDto.getRelationDomain();
                if(StringUtils.isNotBlank(relationDomainStr)) {
                    List<Domain> domains = domainExtRepository.findDomainByChineseNameInAndStateEquals(
                            Arrays.stream(relationDomainStr.split(",")).filter(StringUtils::isNotEmpty).distinct().collect(Collectors.toList()),
                            DomainState.X
                    );
                    if(domains != null && !domains.isEmpty()) {
                        List<String> domainCodes = domains.stream().map(term -> term.getDomainCode()).distinct().collect(Collectors.toList());
                        domainExcelDto.setRelationDomain(String.join(",", domainCodes));
                    } else {
                        domainExcelDto.setRelationDomain("");
                    }
                }


                if (this.workflowEnable) {
                    domainExcelDto.setState(this.msgService.getMessage("DomainState.D"));
                } else {
                    domainExcelDto.setState(this.msgService.getMessage("DomainState.A"));
                }

                domainExcelDto.setFirstPublish((Date)null);
                domainExcelDto.setDescriptionDepartment(bm);

                try {
                    // 模板修改后，是否非空列已经删除，默认为否
                    domainExcelDto.setNotNullStr(msgService.getMessage("keyword.NO"));
                    DomainDto domainDto = domainService.convertToDomainDto(domainExcelDto, categoryId);
                    domainDtos.add(DomainExtDto.buildBy(domainDto, domainExcelDto.getReferenceTerm(), domainExcelDto.getMaxValue(), domainExcelDto.getMinValue(), null));
                } catch (Exception var17) {
                    logger.warn(var17.getMessage(), var17);
                    throw new InvalidArgumentException(var17.getMessage());
                }
            }

            var14 = domainDtos.iterator();

            while(var14.hasNext()) {
                DomainDto domainDto = (DomainDto)var14.next();
                if (Strings.isNullOrEmpty(domainDto.getEnglishName())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("enNameCannotBeNull"));
                } /*else if (Strings.isNullOrEmpty(domainDto.getAbbreviation())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("enAbbrNameCannotBeNull"));
                } */else if (Strings.isNullOrEmpty(domainDto.getDescription())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("busDefCannotBeNull"));
                } else if (Strings.isNullOrEmpty(domainDto.getDataType())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("domainDataTypeMissing", new Object[]{domainDto.getChineseName()}));
                }
            }

            res = this.generalAddImportDomains(uploadFile, published, categoryId, username, domainDtos, autoGenCode, ignoreError);
            this.txManager.commit(status);
        } catch (Exception var18) {
            if (!status.isCompleted()) {
                this.txManager.rollback(status);
            }

            throw new AndorjRuntimeException(var18.getMessage(), var18);
        }

        List<DomainDto> errorList = res.getDomainDto().stream().filter((o) -> {
            return !Strings.isNullOrEmpty(o.getErrorMsg());
        }).toList();
        if ((ignoreError || errorList.isEmpty()) && (categoryId == 1L || categoryId > 6L) && this.domainDataSynchronizer.checkDDCEnable()) {
            this.domainDataSynchronizer.insertSyncDomainUdpToEs(res.getInsertDomain(), this.domainService.getDDCIndexName(80010066L));
        }

        result.setFileId(this.domainService.getProblemFile(uploadFile, errorList, username, autoGenCode));
        if (ignoreError) {
            result.setSuccess(res.getDomainDto().size() - errorList.size());
            result.setFailed(errorList.size());
        } else {
            int failedNum = errorList.size();
            if (failedNum > 0) {
                result.setSuccess(0);
                result.setFailed(res.getDomainDto().size());
            } else {
                result.setSuccess(res.getDomainDto().size());
                result.setFailed(0);
            }
        }

        return result;
    }
    public DomainParaDto generalAddImportDomains(File uploadFile, boolean published, Long categoryId, String username, ArrayList<DomainExtDto> domainDtos, boolean autoGenCode, boolean ignoreError) throws Exception {
        List<OrganizationDto> organizationsByBms = RemoteServiceGetter.getOrganizationService().getOrganizationsByBms(new ArrayList());
        Map<String, String> orgMapByBms = organizationsByBms.stream().collect(Collectors.toMap(k -> k.getBm(), v -> v.getBm()));
//        List<String> bms = (List) organizationsByBms.stream().map(OrganizationDto::getBm).collect(Collectors.toList());

        Set<Long> categoryIds = new HashSet();
        if (categoryId == 1L) {
            categoryIds.add(1L);
        }

        if (categoryId >= 6L) {
            categoryIds.add(1L);
            categoryIds.add(categoryId);
        }

        List<DomainDto> result = new LinkedList();

        List<String> standardCodeList = this.standardCodeFolderRelaRepo.findCodesByCategoryIdIn(categoryIds);
        Set<String> referenceCodeSet = new HashSet();
        Set<String> duplicateReferenceCodeSet = new HashSet();
        Set<String> chineseNameMap = new HashSet();
        Set<String> duplicateChineseNames = new HashSet();
        Set<String> domainCodeSet = new HashSet();
        Set<String> duplicateDomainCodes = new HashSet();
        Iterator var18 = domainDtos.iterator();

        DomainDto domainDto;
        while(var18.hasNext()) {
            domainDto = (DomainDto)var18.next();

            if (!autoGenCode && Strings.isNullOrEmpty(domainDto.getDomainCode().trim())) {
                domainDto.setErrorMsg(this.msgService.getMessage("modifierTypeCodeCannotBeNull"));
                result.add(domainDto);
            } else if (!StringUtils.isEmpty(domainDto.getDomainCode()) && this.domainRepo.existsByDomainCodeAndCategoryIdNot(domainDto.getDomainCode(), categoryId)) {
                domainDto.setErrorMsg(this.msgService.getMessage("codeExists", new Object[]{domainDto.getDomainCode()}));
                result.add(domainDto);
            } else if (StringUtils.isNotEmpty(domainDto.getDomainCode()) && domainCodeSet.contains(domainDto.getDomainCode().trim())) {
                domainDto.setErrorMsg(this.msgService.getMessage("domainCodeConflicts", new Object[]{domainDto.getDomainCode()}));
                result.add(domainDto);
                duplicateDomainCodes.add(domainDto.getDomainCode().trim());
            } else if (StringUtils.isNotEmpty(domainDto.getReferenceCode()) && referenceCodeSet.contains(domainDto.getReferenceCode().trim())) {
                domainDto.setErrorMsg(this.msgService.getMessage("referenceCodeConflicts", new Object[]{domainDto.getReferenceCode()}));
                result.add(domainDto);
                duplicateReferenceCodeSet.add(domainDto.getReferenceCode().trim());
            } else {
                domainCodeSet.add(domainDto.getDomainCode());
                referenceCodeSet.add(domainDto.getReferenceCode());

                if (Strings.isNullOrEmpty(domainDto.getChineseName())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("domainChNameMissing"));
                    result.add(domainDto);
                } else if (Strings.isNullOrEmpty(domainDto.getEnglishName()) && !this.isMetrics(categoryId)) {
                    domainDto.setErrorMsg(this.msgService.getMessage("enNameCannotBeNull"));
                    result.add(domainDto);
                } /*else if (Strings.isNullOrEmpty(domainDto.getAbbreviation()) && !this.isMetrics(categoryId)) {
                    domainDto.setErrorMsg(this.msgService.getMessage("enAbbrNameCannotBeNull"));
                    result.add(domainDto);
                } */else if (Strings.isNullOrEmpty(domainDto.getDescription()) && !this.isMetrics(categoryId)) {
                    domainDto.setErrorMsg(this.msgService.getMessage("busDefCannotBeNull"));
                    result.add(domainDto);
                } else if (Strings.isNullOrEmpty(domainDto.getDataType()) && !this.isMetrics(categoryId)) {
                    domainDto.setErrorMsg(this.msgService.getMessage("domainDataTypeMissing", new Object[]{domainDto.getChineseName()}));
                    result.add(domainDto);
                } else if (Strings.isNullOrEmpty(domainDto.getDescriptionDepartment())) {
                    domainDto.setErrorMsg(this.msgService.getMessage(this.msgService.getMessage("busDefDepCannotBeNull")));
                    result.add(domainDto);
                } else if (!Strings.isNullOrEmpty(domainDto.getDescriptionDepartment()) && !orgMapByBms.keySet().contains(domainDto.getDescriptionDepartment())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("busDefDepWithCodeNotExist", new Object[]{domainDto.getDescriptionDepartment()}));
                    result.add(domainDto);
                } else if (!StringUtils.isEmpty(domainDto.getOwnerOrg()) && !orgMapByBms.keySet().contains(domainDto.getOwnerOrg())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("techDepWithCodeNotExist", new Object[]{domainDto.getOwnerOrg()}));
                    result.add(domainDto);
                } else if (chineseNameMap.contains(domainDto.getChineseName())) {
                    domainDto.setErrorMsg(this.msgService.getMessage("domainChineseNameConflicts", new Object[]{domainDto.getChineseName()}));
                    result.add(domainDto);
                    duplicateChineseNames.add(domainDto.getChineseName());
                } else {
                    chineseNameMap.add(domainDto.getChineseName());
                    if (!StringUtils.isEmpty(domainDto.getReferenceCode()) && !standardCodeList.contains(domainDto.getReferenceCode())) {
                        domainDto.setErrorMsg(this.msgService.getMessage("publishedWithCodeNotFind", new Object[]{domainDto.getReferenceCode()}));
                        result.add(domainDto);
                    } else if ((Objects.equals(domainDto.getMetricType(), MetricType.DERIVE) || Objects.equals(domainDto.getMetricType(), MetricType.FORK)) && CollectionUtils.isEmpty(domainDto.getRelationDomain())) {
                        domainDto.setErrorMsg(this.msgService.getMessage("refAndGenCodeCannotBeNUll"));
                        result.add(domainDto);
                    } else {
                        if (!CollectionUtils.isEmpty(domainDto.getRelationDomain())) {
                            boolean hasError = false;
                            String errorMsg = null;
                            Iterator var22 = domainDto.getRelationDomain().iterator();

                            while(var22.hasNext()) {
                                String domainCode = (String)var22.next();
                                List<Domain> byDomainCode = this.domainRepo.findByDomainCode(domainCode);
                                if (CollectionUtils.isEmpty(byDomainCode)) {
                                    errorMsg = this.msgService.getMessage("dataWithCodeNotExist", new Object[]{domainCode});
                                    hasError = true;
                                    break;
                                }

                                if (!DomainState.A.equals(((Domain)byDomainCode.get(0)).getState())) {
                                    errorMsg = this.msgService.getMessage("publishedWithCodeNotExist", new Object[]{domainCode});
                                    hasError = true;
                                    break;
                                }
                            }

                            if (hasError) {
                                domainDto.setErrorMsg(errorMsg);
                                result.add(domainDto);
                                continue;
                            }
                        }

                        if (!Strings.isNullOrEmpty(domainDto.getAbbreviation()) && domainDto.getAbbreviation().length() > 100) {
                            domainDto.setErrorMsg(this.msgService.getMessage("englishAbbrIsOverLimit"));
                            result.add(domainDto);
                        } else if (!Strings.isNullOrEmpty(domainDto.getMeasureUnit()) && domainDto.getMeasureUnit().length() > 100) {
                            domainDto.setErrorMsg(this.msgService.getMessage("qualityUnitOverLimit"));
                            result.add(domainDto);
                        } else {
                            domainDto.setCategoryId(categoryId);
                            if (this.isMetrics(categoryId)) {
                                domainDto.setReferenceCode((String)null);
                            } else {
                                domainDto.setParentCode((String)null);
                                domainDto.setDimCodes((List)null);
                                domainDto.setFunction((String)null);
                                domainDto.setMeasureUnit((String)null);
                                domainDto.setMonitorObjects((String)null);
                                domainDto.setRequirementId((Long)null);
                                domainDto.setMetricType(MetricType.BASIC);
                                domainDto.setExpireDate((Date)null);
                                domainDto.setTakeEffectDate((Date)null);
                                domainDto.setSafeLevel((Integer)null);
                                domainDto.setManagementOwner((String)null);
                                domainDto.setTechOwner((String)null);
                                domainDto.setBusinessOwner((String)null);
                            }
                            domainDto.setDescriptionDepartment(orgMapByBms.get(domainDto.getDescriptionDepartment()));
                            result.add(domainDto);
                        }
                    }
                }
            }
        }

        var18 = result.iterator();

        while(var18.hasNext()) {
            domainDto = (DomainDto)var18.next();
            if (Strings.isNullOrEmpty(domainDto.getErrorMsg()) && duplicateDomainCodes.contains(domainDto.getDomainCode())) {
                domainDto.setErrorMsg(this.msgService.getMessage("domainCodeConflicts", new Object[]{domainDto.getDomainCode()}));
            }
            if (Strings.isNullOrEmpty(domainDto.getErrorMsg()) && duplicateChineseNames.contains(domainDto.getChineseName())) {
                domainDto.setErrorMsg(this.msgService.getMessage("domainChineseNameConflicts", new Object[]{domainDto.getChineseName()}));
            }
            if (Strings.isNullOrEmpty(domainDto.getErrorMsg()) && StringUtils.isNotEmpty(domainDto.getReferenceCode()) && duplicateReferenceCodeSet.contains(domainDto.getReferenceCode().trim())) {
                domainDto.setErrorMsg(this.msgService.getMessage("referenceCodeConflicts", new Object[]{domainDto.getReferenceCode()}));
            }
            if (Strings.isNullOrEmpty(domainDto.getErrorMsg()) && StringUtils.isNotEmpty(domainDto.getReferenceCode())) {
                domainDto.setErrorMsg(checkReferenceCodeIsRelatedFromCache(domainDto, result));
            }
            //英文名称只能是字母和空格，首字母还需要大写
            if (StringUtils.isNotEmpty(domainDto.getEnglishName()) &&
                    StringUtils.isNotEmpty(CheckNameUtil.checkEnglishNameStyle(domainDto.getEnglishName()))) {
                domainDto.setErrorMsg(msgService.getMessage("domainEnNameRegexCheck"));
            }
            //中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
            if (StringUtils.isNotEmpty(domainDto.getChineseName()) &&
            !CheckNameUtil.checkChineseName(domainDto.getChineseName())) {
                domainDto.setErrorMsg(msgService.getMessage("domainChNameRegexCheck"));
            }

            //数据标准导入时业务规则+中文名称+业务定义任意两个不能相等。--新加功能
            this.checkAnyTwoCannotEqual(domainDto);

//            //业务规则+中文名称+业务定义不能相同
//            if (StringUtils.isNotEmpty(domainDto.getBusinessRule()) &&
//                    StringUtils.isNotEmpty(domainDto.getChineseName()) &&
//            StringUtils.isNotEmpty(domainDto.getDescription())) {
//                if (areNotAllSame(domainDto.getBusinessRule(), domainDto.getChineseName(), domainDto.getDescription())) {
//                    domainDto.setErrorMsg(msgService.getMessage("domainChNameAndBusinessRuleAndDescriptionSame"));
//                }
//            }
            //中文名称长度不能超过15位
            if (StringUtils.isNotEmpty(domainDto.getChineseName()) &&
            CheckNameUtil.checkChineseNameLength(domainDto.getChineseName(), 15) ) {
                domainDto.setErrorMsg(msgService.getMessage("domainChNameLengthCheck"));
            }
            //检查数据类型是否为字符型、数值型、年、年月、日期型、日期时间型、时间型（time）、时间间隔型、布尔型、二进制型
            if (StringUtils.isNotEmpty(domainDto.getDataType())) {
                if (!Arrays.asList(dataTypes.split(",")).contains(domainDto.getDataType())) {
                    domainDto.setErrorMsg(msgService.getMessage("domainDataTypeCheck"));
                }
                //数值型的长度和计量单位为必填
                if ("数值型".equals(domainDto.getDataType())) {
                    if (Objects.isNull(domainDto.getDataScale())) {
                        domainDto.setErrorMsg(msgService.getMessage("domainDataScaleNotNull"));
                    }
                    //TODO 计量单位为必填
                }
                //字符型长度为必填
                if ("字符型".equals(domainDto.getDataType()) && Objects.isNull(domainDto.getDataScale())) {
                    domainDto.setErrorMsg(msgService.getMessage("domainDataScaleNotNull"));
                }
            }
        }

        // 自动生成domainCode
        if (autoGenCode && domainDtos != null) {
            long count = (long)domainDtos.stream().filter(v -> StringUtils.isBlank(v.getErrorMsg()) && StringUtils.isBlank(v.getDomainCode())).count();
            if (count > 0L) {
                List<String> domainCodes = this.generateService.getBatchDomainCodes(DatablauDomainType.formByCategoryId(categoryId), "$$$", (int)count);
                int codeIndex = 0;
                for (DomainExtDto dto : domainDtos) {
                    if(StringUtils.isBlank(dto.getErrorMsg()) && StringUtils.isBlank(dto.getDomainCode())) {
                        dto.setDomainCode(domainCodes.get(codeIndex++));
                    }
                }
            }
        }
        if (uploadFile != null) {
            this.domainService.setDomainUdpForBasicDomain(result, uploadFile, categoryId);
        }

        this.domainService.convertDomainSomePropertiesNameToId(result);
        Map<String, Domain> importDomainCodeKeyMap = new HashMap();
        Map<String, DomainDto> importDomainDtoCodeKeyMap = new HashMap();
        long start = System.currentTimeMillis();
        long now = System.currentTimeMillis();
        String categoryName = this.msgService.getMessage("category.standard");
        if (this.isMetrics(categoryId)) {
            categoryName = this.msgService.getMessage("category.index");
        }

        Iterator var25 = result.iterator();

        this.domainService.getRoot(true);
        DomainTreeNodeDto domainTreeNodeDto = domainFolderExtService.loadDomainTree((DomainState)null, categoryId, null, true);
        while(true) {
            while(true) {
                DomainDto domain;
                do {
                    if (!var25.hasNext()) {
                        List<DomainDto> tempErrorList = result.stream().filter((ox) -> {
                            return !Strings.isNullOrEmpty(ox.getErrorMsg());
                        }).toList();

                        Map<Long, String> bizCodeMap = domainFolderExtService.getBizCodeMap();
                        for (DomainDto dto : result) {
                            if(Strings.isNullOrEmpty(dto.getErrorMsg())) {
                                if (ignoreError || tempErrorList.isEmpty()) {
                                    this.setDomainPath((DomainExtDto) dto, categoryId, domainTreeNodeDto, username);
                                    if (Strings.isNullOrEmpty(dto.getErrorMsg())) {
                                        dto.setDomainCode(StringUtils.replace(dto.getDomainCode(), "$$$", bizCodeMap.get(dto.getFolderId())));
                                        importDomainCodeKeyMap.put(dto.getDomainCode(), domainService.convertToDomain(dto));
                                    }
                                }
                            }
                            importDomainDtoCodeKeyMap.put(dto.getDomainCode(), dto);
                        }
//                        DomainDto o;
//                        for(Iterator var39 = result.iterator(); var39.hasNext(); importDomainDtoCodeKeyMap.put(o.getDomainCode(), o)) {
//                            o = (DomainDto)var39.next();
//                            if (Strings.isNullOrEmpty(o.getErrorMsg())) {
//                                if (ignoreError || tempErrorList.isEmpty()) {
//                                    setDomainPath((DomainExtDto) o, categoryId, domainTreeNodeDto);
//                                }
//
//                                if (Strings.isNullOrEmpty(o.getErrorMsg())) {
//                                    importDomainCodeKeyMap.put(o.getDomainCode(), domainService.convertToDomain(o));
//                                }
//                            }
//                        }

                        logger.info("outter step1: " + (System.currentTimeMillis() - start));
                        new DomainParaDto();
                        DomainParaDto updateForEs;
                        if (published) {
                            Date date = new Date();
                            importDomainCodeKeyMap.values().forEach((domainx) -> {
                                domainx.setLastReview(date);
                            });
                            updateForEs = this.domainService.addImportDomainPublish(importDomainCodeKeyMap, username, categoryId, importDomainDtoCodeKeyMap, ignoreError, result);
                        } else {
                            updateForEs = this.domainService.addImportDomainNotPublish(importDomainCodeKeyMap, categoryId, importDomainDtoCodeKeyMap, ignoreError, result);
                        }
                        List<Domain> insertDomain = updateForEs.getInsertDomain();
                        if(!CollectionUtils.isEmpty(insertDomain)) {
                            List<String> referenceCodes = insertDomain.stream().map(Domain::getReferenceCode).filter(v -> !Strings.isNullOrEmpty(v)).toList();
                            referenceCodeCacheInvalidate(referenceCodes);
                        }

                        logger.info("outter step2: " + (System.currentTimeMillis() - start));
                        this.domainService.getDomainChineseNames().invalidate(categoryId);
                        logger.info("outter step3: " + (System.currentTimeMillis() - start));
                        return updateForEs;
                    }

                    domain = (DomainDto)var25.next();
                } while(!Strings.isNullOrEmpty(domain.getErrorMsg()));

                domain.setSubmitter(username);
                domain.setVersion(1);
                if (Strings.isNullOrEmpty(domain.getDomainId())) {
                    domain.setDomainId(this.getUUID());
                }

                Date currentTime = new Date(now++);
                domain.setCreateTime(currentTime);
                domain.setLastModification(currentTime);
                if (ObjectUtils.notEqual(categoryId, domain.getCategoryId())) {
                    domain.setErrorMsg(this.msgService.getMessage("importDataTypeNotAccord"));
                } else {
                    try {
                        Map<String, String> names = (Map)this.domainService.getDomainChineseNames().get(categoryId);
                        if (names.containsKey(domain.getChineseName().toLowerCase()) && !((String)names.get(domain.getChineseName().toLowerCase())).equals(domain.getDomainCode())) {
                            domain.setErrorMsg(this.msgService.getMessage("domainChineseNameConflicts", new Object[]{domain.getChineseName()}));
                        }
                    } catch (ExecutionException var29) {
                        domain.setErrorMsg(this.msgService.getMessage("domainCheckChNameFailed", new Object[]{var29.getMessage()}));
                    }

                    if (domain.getPath() == null || domain.getPath().isEmpty()) {
                        domain.setErrorMsg(categoryName + this.msgService.getMessage("hasNoExistPathToImport", new Object[]{domain.getChineseName()}));
                    }

                    domain.getPathStr();
                }
            }
        }
    }

    //数据标准导入时业务规则+中文名称+业务定义任意两个不能相等。--新加功能
    private void checkAnyTwoCannotEqual(DomainDto domainDto) {
        String businessRule = domainDto.getBusinessRule();//业务规则
        String chineseName = domainDto.getChineseName();//中文名称
        String description = domainDto.getDescription();//业务定义

        if(Objects.equals(businessRule, chineseName)){
            domainDto.setErrorMsg("业务规则、中文名称不能相等");
        }

        if(Objects.equals(businessRule, description)){
            domainDto.setErrorMsg("业务规则、业务定义不能相等");
        }

        if(Objects.equals(chineseName, description)){
            domainDto.setErrorMsg("中文名称、业务定义不能相等");
        }
    }

    public  boolean areNotAllSame(Object... objects) {
        if (objects.length < 2) {
            throw new IllegalArgumentException("至少需要2个参数");
        }

        // 检查是否所有对象都相同
        Object first = objects[0];
        return Arrays.stream(objects)
                .allMatch(obj -> Objects.equals(first, obj));
    }
    private String checkReferenceCodeIsRelatedFromCache(DomainDto _domain, List<DomainDto> _domainDtos) {
        String referenceCode = _domain.getReferenceCode();
        if(StringUtils.isEmpty(referenceCode)) return null;
        String domainCode;
        try {
            domainCode = referenceCodeCache.get(referenceCode);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
        if(StringUtils.isEmpty(domainCode) || Objects.equals(domainCode, _domain.getDomainCode())) {
            return null;
        }
        if(StringUtils.isEmpty(_domain.getDomainCode())) {
            return msgService.getMessage("domainReferenceCodeConflicts", new Object[]{referenceCode, domainCode});
        }
        Optional<DomainDto> optionalDomainDto = _domainDtos.stream()
                .filter(v -> Strings.isNullOrEmpty(v.getErrorMsg()) && StringUtils.isNotEmpty(v.getDomainCode()) && v.getDomainCode().equals(domainCode))
                .findFirst();
        if(!optionalDomainDto.isPresent()) {
            return msgService.getMessage("domainReferenceCodeConflicts", new Object[]{referenceCode, domainCode});
        }
        return checkReferenceCodeIsRelatedFromCache(optionalDomainDto.get(), _domainDtos);
    }

    public void setDomainPath(DomainExtDto domainDto, Long categoryId, DomainTreeNodeDto domainTreeNodeDto, String user) {
        String categoryName = this.msgService.getMessage("category.standard");
        if (this.isMetrics(categoryId)) {
            categoryName = this.msgService.getMessage("category.index");
        }

        if (domainDto.getPath() == null || domainDto.getPath().isEmpty()) {
            domainDto.setErrorMsg(categoryName + this.msgService.getMessage("hasNoExistPathToImport", new Object[]{domainDto.getChineseName()}));
        }

        LinkedList<String> currentPath = new LinkedList();
        currentPath.add(domainTreeNodeDto.getName());
        this.domainService.getFolderIdByPath(domainTreeNodeDto, currentPath, domainDto.getPathStr(), domainDto);
        if (!Strings.isNullOrEmpty(domainDto.getErrorMsg())) {
            domainDto.setErrorMsg(domainDto.getErrorMsg());
        } else {
            List<String> targetPaths = new ArrayList(domainDto.getPath());
            if (domainDto.getCategoryId() > 4L) {
                targetPaths.add(0, domainTreeNodeDto.getName());
            }

            List<Long> folderIds = new ArrayList();
            this.domainService.getFolderIdByPath(Lists.newArrayList(new DomainTreeNodeDto[]{domainTreeNodeDto}), targetPaths, folderIds);
            if (targetPaths.size() > 0) {
                domainDto.setErrorMsg("当前目录不存在");
            } else {
                domainDto.setFolderId((Long)folderIds.get(folderIds.size() - 1));
                if (domainDto.getFolderId() == 1L || domainDto.getFolderId() == 2L) {
                    domainDto.setErrorMsg(this.msgService.getMessage("domainRootFolderCannotAdd"));
                }
            }

        }
    }

    private String getUUID() {
        return domainService.getUUID();
    }

    private boolean isMetrics(Long categoryId) {
        return domainService.isMetrics(categoryId);
    }

    public void fillDomainExtDto(List<DomainExtDto> listDomains) {
        List<String> domainIds = listDomains.stream().map(v -> v.getDomainId()).toList();
        List<DomainExt> domainExts = domainExtRepository.findByDIdIn(domainIds);
        Map<String, DomainExt> domainExtMap = domainExts.stream().collect(Collectors.toMap(k -> k.getdId(), v -> v));
        for (DomainExtDto domainExtDto : listDomains) {
            Optional.ofNullable(domainExtMap.get(domainExtDto.getDomainId())).ifPresent(domainExt -> {
                domainExtDto.setMaxValue(domainExt.getMaxValue());
                domainExtDto.setMinValue(domainExt.getMinValue());
                domainExtDto.setReferenceTerm(domainExt.getReferenceTerm());
                domainExtDto.setCheckState(domainExt.getCheckState());
            });
        }
    }

    @Override
    public List<CustomDomainExtDto> getDomainsById(List<String> ids) {
        List<DomainDto> domainDtos = domainService.getDomainsByIds(ids);
        List<CustomDomainExtDto> customDomainExtDtos = new ArrayList<>();
        if(!CollectionUtils.isEmpty(domainDtos)) {
            // 查看扩展信息
            HashMap<String, DomainExt> domainExtMap = new HashMap<>();
            List<DomainExt> domainExts = domainExtRepository.findByDIdIn(ids);
            if(!CollectionUtils.isEmpty(domainExts)) {
                for (DomainExt domainExt : domainExts) {
                    domainExtMap.put(domainExt.getdId(), domainExt);
                }
            }
            // 查询关联参考数据
            Set<String> referenceCodes = domainDtos.stream().map(v -> v.getReferenceCode()).collect(Collectors.toSet());
            HashMap<String, StandardCode> standardCodeMap = new HashMap<>();
            List<StandardCode> standardCodes = standardCodeRepo.findByCodeIn(referenceCodes);
            if(!CollectionUtils.isEmpty(standardCodes)) {
                for (StandardCode code : standardCodes) {
                    standardCodeMap.put(code.getCode(), code);
                }
            }
            customDomainExtDtos = domainDtos.stream().map(v -> buildCustomDomainExtDto(v, domainExtMap.get(v.getDomainId()), standardCodeMap.get(v.getReferenceCode()))).toList();
        }
        return customDomainExtDtos;
    }

    @Override
    public void remoteCreateUpdateApple(BatchApplyRemoteDto batchApplyRemoteDto,String type) {
        // 如果是资产变更那么 进行资产变更的处理
        switch (type){
            case "asset_pub":
                handlerAssetsApplyPub(batchApplyRemoteDto);
                break;
            case "asset_update":
                handlerAssetsApply(batchApplyRemoteDto);
                break;
            case "bu_pub":
                handlerBuModelApply(batchApplyRemoteDto);
                break;
            default:
                logger.info("未知信息");
        }


    }

    @Override
    public List<DomainDto> getDomainsByReferenceCodes(Collection<String> ReferenceCodes) {
        List<Domain> domains = domainExtRepository.findDomainByReferenceCodeIn(ReferenceCodes);
        List<DomainDto> domainDtos = domains.stream().map(domainService::convertToDomainDto).toList();
        return domainDtos;
    }

    private void handlerBuModelApply(BatchApplyRemoteDto batchApplyRemoteDto) {
        BatchApplyDto batchApplyDto = new BatchApplyDto();
        // 基础字段复制
        batchApplyDto.setId(batchApplyRemoteDto.getId());
        batchApplyDto.setApplyType(batchApplyRemoteDto.getApplyType());
        batchApplyDto.setApplyName(batchApplyRemoteDto.getApplyName());
        batchApplyDto.setApplyCreator(batchApplyRemoteDto.getApplyCreator());
        batchApplyDto.setApplyCreateTime(batchApplyRemoteDto.getApplyCreateTime());
        batchApplyDto.setApplyOperation(batchApplyRemoteDto.getApplyOperation());
        // 明细字段转换
        List<BatchApplyDetailDto> detailDtoList = new ArrayList<>();
        if (batchApplyRemoteDto.getDetails() != null) {
            for (BatchApplyDetailRemoteDto remoteDetail : batchApplyRemoteDto.getDetails()) {
                BatchApplyDetailDto detailDto = new BatchApplyDetailDto();
                detailDto.setId(remoteDetail.getId());
                detailDto.setSubmitUser(remoteDetail.getSubmitUser());
                detailDto.setDataType(remoteDetail.getDataType());
                detailDto.setCode(remoteDetail.getCode());
                detailDto.setCnName(remoteDetail.getCnName());
                detailDto.setEnName(remoteDetail.getEnName());
                detailDto.setOrderState(remoteDetail.getOrderState());
                detailDto.setOrderType(remoteDetail.getOrderType());
                detailDto.setBatchId(remoteDetail.getBatchId());
                detailDto.setOldId(remoteDetail.getOldId());
                detailDto.setNeId(remoteDetail.getNeId());
                detailDto.setNeData(remoteDetail.getNeData());
                detailDto.setOldData(remoteDetail.getOldData());

                detailDtoList.add(detailDto);
            }
        }

        batchApplyDto.setDetails(detailDtoList);

        // 调用 create 方法
        applyService.create(batchApplyDto);
    }


    private void handlerAssetsApplyPub(BatchApplyRemoteDto batchApplyRemoteDto) {
        // 创建本地 DTO
        BatchApplyDto batchApplyDto = new BatchApplyDto();
        // 基础字段复制
        batchApplyDto.setId(batchApplyRemoteDto.getId());
        batchApplyDto.setApplyType(batchApplyRemoteDto.getApplyType());
        batchApplyDto.setApplyName(batchApplyRemoteDto.getApplyName());
        batchApplyDto.setApplyCreator(batchApplyRemoteDto.getApplyCreator());
        batchApplyDto.setApplyCreateTime(batchApplyRemoteDto.getApplyCreateTime());
        batchApplyDto.setApplyOperation(batchApplyRemoteDto.getApplyOperation());
        // 明细字段转换
        List<BatchApplyDetailDto> detailDtoList = new ArrayList<>();
        if (batchApplyRemoteDto.getDetails() != null) {
            for (BatchApplyDetailRemoteDto remoteDetail : batchApplyRemoteDto.getDetails()) {
                BatchApplyDetailDto detailDto = new BatchApplyDetailDto();
                detailDto.setId(remoteDetail.getId());
                detailDto.setSubmitUser(remoteDetail.getSubmitUser());
                detailDto.setDataType(remoteDetail.getDataType());
                detailDto.setCode(remoteDetail.getCode());
                detailDto.setCnName(remoteDetail.getCnName());
                detailDto.setEnName(remoteDetail.getEnName());
                detailDto.setOrderState(remoteDetail.getOrderState());
                detailDto.setOrderType(remoteDetail.getOrderType());
                detailDto.setBatchId(remoteDetail.getBatchId());
                detailDto.setOldId(remoteDetail.getOldId());
                detailDto.setNeId(remoteDetail.getNeId());
                detailDto.setNeData(remoteDetail.getNeData());
                detailDto.setOldData(remoteDetail.getOldData());

                detailDtoList.add(detailDto);
            }
        }

        batchApplyDto.setDetails(detailDtoList);

        // 调用 create 方法
        applyService.create(batchApplyDto);

    }

    private void handlerAssetsApply(BatchApplyRemoteDto batchApplyRemoteDto) {
        BatchApplyDto batchApplyDto = new BatchApplyDto();
        BeanUtils.copyProperties(batchApplyRemoteDto,batchApplyDto);
//        if (!org.springframework.util.ObjectUtils.isEmpty(batchApplyDto.getDetails())
//        && !CollectionUtils.isEmpty(batchApplyDto.getDetails())){
//            batchApplyDto.setDetails(new ArrayList<>());
//        }
        List<BatchApplyDetailDto> toAdd = new ArrayList<>();
        for (BatchApplyDetailRemoteDto detail : batchApplyRemoteDto.getDetails()) {
            BatchApplyDetailDto batchApplyDetailDto = new BatchApplyDetailDto();
            BeanUtils.copyProperties(detail,batchApplyDetailDto);
            toAdd.add(batchApplyDetailDto);
        }
        batchApplyDto.setDetails(toAdd);
        //创建批次即可
        applyService.create(batchApplyDto);


    }

    /*
    *
    * 根据domainDto和domainExt构建CustomDomainExtDto对象
    * */
    private CustomDomainExtDto buildCustomDomainExtDto(DomainDto domainDto, DomainExt domainExt, StandardCode standardCode) {
        CustomDomainExtDto customDomainExtDto = new CustomDomainExtDto();
        customDomainExtDto.setDomainId(domainDto.getDomainId());
        customDomainExtDto.setDomainCode(domainDto.getDomainCode());
        customDomainExtDto.setChineseName(domainDto.getChineseName());
        customDomainExtDto.setEnglishName(domainDto.getEnglishName());
        customDomainExtDto.setDataType(domainDto.getDataType());
        customDomainExtDto.setDataFormat(domainDto.getDataFormat());
        customDomainExtDto.setReferenceCode(domainDto.getReferenceCode());
        customDomainExtDto.setVersion(domainDto.getVersion());
        customDomainExtDto.setDataScale(domainDto.getDataScale());
        customDomainExtDto.setDataPrecision(domainDto.getDataPrecision());
        if(standardCode != null) {
            customDomainExtDto.setReferenceCodeName(standardCode.getName());
            customDomainExtDto.setReferenceCodeVersion(standardCode.getVersion());
        }
        if(domainExt != null) {
            customDomainExtDto.setMaxValue(domainExt.getMaxValue());
            customDomainExtDto.setMinValue(domainExt.getMinValue());
            customDomainExtDto.setReferenceTerm(domainExt.getReferenceTerm());
        }
        return customDomainExtDto;
    }

    @Transactional
    public void deleteCodeByCodeNumbers(List<String> codes, String currentUser, Long categoryId) {
        domainService.deleteCodeByCodeNumbers(codes, currentUser, categoryId);
        // 删除标准代码-标准目录关系
        for (List<String> strings : Lists.partition(codes, 500)) {
            standardCodeFolderRelaRepo.deleteByCodeIn(strings);
        }
    }

    @Transactional
    public void removeDomainByIds(String currentUser, List<DomainDto> domainDtos) {
        List<String> domainIds = domainDtos.stream().map(v -> v.getDomainId()).toList();
        List<String> referenceCodes = domainDtos.stream().map(v -> v.getReferenceCode()).filter(v -> !StringUtils.isEmpty(v)).toList();
        referenceCodeCacheInvalidate(referenceCodes);
        domainExtRepository.deleteDomainExtByDIdIn(domainIds);
        domainService.removeDomainByIds(currentUser, domainIds);
    }

    private Object checkReferenceCodeIsRelated(Collection<Domain> domains, Function<Map<String, String>, Object> func) {
        RLock lock = this.redissonClient.getLock(CHECK_REFERENCE_CODE_RELA_LOCK);
        boolean isLocked;
        try {
            isLocked = lock.tryLock(10, 10, TimeUnit.SECONDS);
            if(isLocked) {
                try {
                    Map<String, String> res = new HashMap<>();
                    for (Domain domain : domains) {
                        if(StringUtils.isBlank(domain.getReferenceCode())) {
                            continue;
                        }
                        String domainCode = referenceCodeCache.get(domain.getReferenceCode());
                        if (StringUtils.isNotEmpty(domainCode) && !domainCode.equals(domain.getDomainCode())) {
                            res.put(domain.getDomainCode(), msgService.getMessage("domainReferenceCodeConflicts", new Object[]{domain.getReferenceCode(), domainCode}));
                        }
                    }
                    return func.apply(res);
                } catch (ExecutionException e) {
                    logger.error(e.getMessage());
                    throw new RuntimeException(e.getMessage());
                }
            } else {
                logger.error("check-referenceCode-isRelated-lk get RLock failed.");
                throw new RuntimeException("check-referenceCode-isRelated-lk get RLock failed.");
            }
        } catch (InterruptedException e) {
            logger.error("check-referenceCode-isRelated-lk get RLock failed, {}", e.getMessage());
            throw new RuntimeException("check-referenceCode-isRelated-lk get RLock failed, "+e.getMessage());
        } finally {
            lock.forceUnlock();
        }
    }

    private void referenceCodeCacheInvalidate(Collection<String> referenceCodes) {
        referenceCodeCache.invalidateAll(referenceCodes);
    }

    public List<Domain> findDomainsByCodes(Set<String> codeSet) {
        return domainExtRepository.findDomainByReferenceCodeIn(codeSet);
    }
    public List<DomainExtDto> findDomainExtDtosByCodes(Set<String> codeSet) {
        List<Domain> domains = domainExtRepository.findDomainByReferenceCodeIn(codeSet);
        List<DomainDto> domainDtos = domains.stream().map(domainService::convertToDomainDto).toList();
        List<DomainExtDto> domainExtDtos = domainDtos.stream().map(v -> DomainExtDto.buildBy(v)).toList();
        fillDomainExtDto(domainExtDtos);
        return domainExtDtos;
    }

    @Autowired
    public DomainFolderRepository domainFolderRepo;
    @Autowired
    @Qualifier("modelCategoryService")
    private ModelCategoryService modelCategoryService;

    @Transactional
    public void uploadDomainTwo(String user, MultipartFile multipartFile) throws Exception {
        File uploadFile = DataUtility.uploadFile(multipartFile);
        ExcelLoadJobResult<DomainQianYiDto> loadJobResult = this.excelLoader.loadFile(uploadFile.getAbsolutePath(), 1, DomainQianYiDto.class);
        List<DomainQianYiDto> domainExcelList = loadJobResult.getLoaded();

        HashMap<String, DomainFolder> folderMap = new HashMap<>();
        for (DomainFolder domainFolder : domainFolderRepo.findAll()) {
            if(domainFolder.getParentId() == 1L){
                folderMap.put(domainFolder.getName(), domainFolder);
            }
        }

        HashMap<String, StandardCode> standardCodeMap = new HashMap<>();
        for (StandardCode standardCode : standardCodeRepo.findAll()) {
            standardCodeMap.put(standardCode.getName(), standardCode);
        }

        HashMap<String, BaseModelCategory> modelCategoryMap = new HashMap<>();
        for (BaseModelCategory modelCategory : modelCategoryService.getAllBaseModelCategories()) {
            modelCategoryMap.put(modelCategory.getName(), modelCategory);
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        ArrayList<Domain> res = new ArrayList<>();
        for (DomainQianYiDto domainQianYiDto : domainExcelList) {
            Domain domain = new Domain();
            //主键
            if(Strings.isNullOrEmpty(domainQianYiDto.getId())){
                domain.setDomainId(getUUID());
            }else {
                domain.setDomainId(domainQianYiDto.getId());
            }
            //业务域
            String businessDomain = domainQianYiDto.getBusinessDomain();
            DomainFolder domainFolder = folderMap.get(businessDomain);
            if(domainFolder != null){
                Long folderId = domainFolder.getId();
                domain.setFolderId(folderId);
            }else {
                throw new RuntimeException("找不到业务域" + businessDomain);
            }
            //编码
            domain.setDomainCode(domainQianYiDto.getCode());
            //中文名
            domain.setChineseName(domainQianYiDto.getChineseName());
            //英文名
            domain.setEnglishName(domainQianYiDto.getEnglishName());
            //英文简写
            domain.setAbbreviation(domainQianYiDto.getEnglishAbbr());
            //参考数据
            StandardCode standardCode = standardCodeMap.get(domainQianYiDto.getReferenceDataName());
            if(standardCode != null){
                domain.setReferenceCode(standardCode.getCode());
            }
            //业务定义
            domain.setDescription(domainQianYiDto.getBusinessDefinition());
            //业务规则
            domain.setBusinessRule(domainQianYiDto.getBusinessRules());
            //标准来源
            domain.setSource(domainQianYiDto.getStandardSource());
            //同义词
            //关联旧标准

            //权威系统
            BaseModelCategory modelCategory = modelCategoryMap.get(domainQianYiDto.getAuthoritativeSystem());
            if(modelCategory != null){
                domain.setAuthCategoryId(modelCategory.getId());
            }
            //创建人
            domain.setSubmitter(domainQianYiDto.getCreator());
            //创建时间
            if(!Strings.isNullOrEmpty(domainQianYiDto.getCreateTime())){
                Date date = sdf.parse(domainQianYiDto.getCreateTime());
                domain.setCreateTime(date);
            }
            //最后变更时间
            if(!Strings.isNullOrEmpty(domainQianYiDto.getLastUpdateTime())){
                Date date = sdf.parse(domainQianYiDto.getLastUpdateTime());
                domain.setLastModification(date);
            }
            //发布时间
            if(!Strings.isNullOrEmpty(domainQianYiDto.getCreateTime())){
                Date date = sdf.parse(domainQianYiDto.getCreateTime());
                domain.setFirstPublish(date);
            }
            //数据类型
            domain.setDataType(domainQianYiDto.getDataType());
            //数据精度
            domain.setDataScale(Integer.valueOf(domainQianYiDto.getDataLength()));
            //数据格式
            domain.setDataFormat(domainQianYiDto.getDataFormat());


            DomainExt byDIdEquals = domainExtRepository.findByDIdEquals(domain.getDomainId());
            if(byDIdEquals == null){
                DomainExt domainExt = new DomainExt();
                domainExt.setdId(domain.getDomainId());
                //取值范围最小值
                domainExt.setMinValue(Integer.valueOf(domainQianYiDto.getMinValue()));
                //取值范围最大值
                domainExt.setMaxValue(Integer.valueOf(domainQianYiDto.getMaxValue()));
                //关联术语
                domainExt.setReferenceTerm(domainQianYiDto.getRelatedTermCode());
                domainExtRepository.save(domainExt);
            }else {
                //取值范围最小值
                byDIdEquals.setMinValue(Integer.valueOf(domainQianYiDto.getMinValue()));
                //取值范围最大值
                byDIdEquals.setMaxValue(Integer.valueOf(domainQianYiDto.getMaxValue()));
                //关联术语
                byDIdEquals.setReferenceTerm(domainQianYiDto.getRelatedTermCode());
                domainExtRepository.save(byDIdEquals);
            }
            res.add(domain);
        }
        domainRepo.saveAll(res);
    }
}
