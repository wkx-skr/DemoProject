package com.datablau.domain.management.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.data.Pair;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.domain.management.api.BusinessTermProcessService;
import com.datablau.domain.management.api.BusinessTermService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainFolder;
import com.datablau.domain.management.jpa.entity.EditHistoryEntity;
import com.datablau.domain.management.jpa.repository.*;
import com.datablau.domain.management.jpa.type.DatablauDomainType;
import com.datablau.domain.management.utility.FileUtility;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.workflow.common.entity.type.ProcessResultType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.*;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.util.CollectionUtils;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * @ClassName：BusinessTermServiceImpl
 * @Author: dingzicheng
 * @Date: 2024/9/2 14:13
 * @Description: 必须描述类做什么事情, 实现什么功能
 */
@Service
public class BusinessTermServiceImpl implements BusinessTermService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BusinessTermServiceImpl.class);

    private static ObjectMapper objectMapper = new ObjectMapper();

    private static final String FOLDER_KEY = "级主题目录";

    private static Map<Integer, String> map = new HashMap<>();

    private String folderKey = "一,二,三,四,五,六,七,八,九,十";

    @Autowired
    private RedissonClient redissonClient;


    @Autowired
    private BusinessTermRepository busTermRepo;

    @Autowired
    private DomainServiceExtImpl domainService;

    @Autowired
    private DomainExtServiceImpl domainExtService;

    @Autowired
    private DomainFolderExtService domainFolderExtService;

    @Autowired
    private MessageService msgService;

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private DomainCodeGenerateServiceExt customizeDomainCodeGenerateService;

    @Autowired
    private DomainFolderRepository domainFolderRepo;

    @Autowired
    private EditHistoryRepository editHistoryRepo;

    @Autowired
    public NamingStandardRepository namingStandardRepo;

    @PersistenceContext
    private EntityManager em;

    @Autowired
    public PlatformTransactionManager txManager;

    @Autowired
    public ExcelLoader excelLoader;

    @Autowired
    public FileUtility fileUtility;

//    @Autowired
//    public BusinessTermVersionRepository businessTermVersionRepository;

    @Autowired
    public BusinessTermProcessService businessTermProcessService;


    @Override
    @Transactional
    public BusinessTermDto addBusinessTerm(BusinessTermDto businessTermDto, String user, Boolean published) {
        //数据标准导入时业务规则+中文名称+业务定义任意两个不能相等。--新加功能
        if(Objects.equals(businessTermDto.getChName(), businessTermDto.getExplanationTerms())){
            throw new RuntimeException("中文名称、业务定义不能相等");
        }

        businessTermDto.setCategoryId(DomainService.DOMAIN_CATEGORY_ID);
        //校验必填参数
        checkParams(businessTermDto);

        //获取businessCode
        Long folderId = businessTermDto.getFolderId();
        Long categoryId = businessTermDto.getCategoryId();

        DomainTreeNodeDto root = domainFolderExtService.loadDomainTree(null, categoryId, null, true);
        DomainTreeNodeDto nodeDto = DomainTreeNodeExtDto.findByFolderId(folderId, root);
        String businessCode = DomainTreeNodeExtDto.searchBizCode(root, nodeDto, categoryId);

        //获取domainCode
        String domainCode = customizeDomainCodeGenerateService.getSingleDomainCode(DatablauDomainType.BUSINESS_TERM, businessCode);
        businessTermDto.setDomainCode(domainCode);

        BusinessTerm businessTerm = businessTermDto.build();
        businessTerm.setVersion(1);
        businessTerm.setUpdateTime(new Date().getTime());

        if (!DomainState.A.equals(businessTermDto.getState()) && published) {
            businessTerm.setState(DomainState.A);
        }

        if (null == businessTermDto.getState()) {
            businessTerm.setState(DomainState.D);
        }

        if (DomainState.A.equals(businessTermDto.getState())) {
            businessTerm.setFirstPublish(new Date());
        }


        businessTerm = busTermRepo.save(businessTerm);

        EditHistoryEntity history = this.buildHistory(new BusinessTerm(), businessTerm, user);
        history.setVersion(0);
        history.setChanges("业务术语初始创建完成");
        this.editHistoryRepo.save(history);

        businessTermDto = BusinessTermDto.buildBy(businessTerm);
        fillDepartmentName(businessTermDto);
        return businessTermDto;
    }

    @Override
    @Transactional
    public BusinessTermDto updateBusinessTerm(BusinessTermDto businessTermDto, String user) {
        //数据标准导入时业务规则+中文名称+业务定义任意两个不能相等。--新加功能
        if(Objects.equals(businessTermDto.getChName(), businessTermDto.getExplanationTerms())){
            throw new RuntimeException("中文名称、业务定义不能相等");
        }

        //校验必填参数
        checkParams(businessTermDto);
        BusinessTerm oldBus = busTermRepo.findById(businessTermDto.getId()).orElseThrow(() -> new RuntimeException("业务术语不存在"));
        //保存业务术语
        BusinessTerm businessTerm = businessTermDto.build();
        businessTerm.setId(oldBus.getId());
        businessTerm.setVersion(oldBus.getVersion());
        businessTerm.setState(oldBus.getState());
        EditHistoryEntity history = this.buildHistory(oldBus, businessTerm, user);
        if (history != null) {
            this.editHistoryRepo.save(history);
        }
        busTermRepo.save(businessTerm);
        fillDepartmentName(businessTermDto);
        businessTermDto.setUpdateTime(businessTerm.getUpdateTime());
        return businessTermDto;
    }

    @Override
    @Transactional
    public void deleteBusinessTerm(List<Long> ids, String user) {
        //删除命名词典
        domainService.deleteNamingStandards(ids, user);
        //删除业务术语
        if (!CollectionUtils.isEmpty(ids)) {
            for (List<Long> idList : Lists.partition(ids, 999)) {
                busTermRepo.deleteByIdIn(idList);
            }
        }
    }

    @Override
    public PageResult<BusinessTermDto> getPageOfBusinessTermDto(BusinessTermQueryDto dto) {
        return getPageOfBusinessTermDto(dto, true);
    }
    @Override
    public PageResult<BusinessTermDto> getPageOfBusinessTermDto(BusinessTermQueryDto dto, boolean isPage) {
        String orderBy = dto.getOrderBy();
        String sort = dto.getSort();
        if (Strings.isNullOrEmpty(orderBy)) {
            throw new InvalidArgumentException(msgService.getMessage("nsOrderByMissing"));
        }

        if (Strings.isNullOrEmpty(sort)) {
            throw new InvalidArgumentException(msgService.getMessage("nsSortByMissing"));
        }

        if (!orderBy.equalsIgnoreCase("domainCode") && !orderBy.equalsIgnoreCase("chName")
                && !orderBy.equalsIgnoreCase("enName")
                && !orderBy.equalsIgnoreCase("abbr") && !orderBy.equalsIgnoreCase("managementDepartment")
                && !orderBy.equalsIgnoreCase("affiliation") && !orderBy.equalsIgnoreCase("updateTime")) {
            throw new InvalidArgumentException(
                    msgService.getMessage("nsOrderByColInvalid", orderBy));
        }

        if (!sort.equalsIgnoreCase("asc") && !sort.equalsIgnoreCase("desc")) {
            throw new InvalidArgumentException(msgService.getMessage("nsOrderByInvalid", sort));
        }

        boolean isAsc = true;
        if (!"asc".equalsIgnoreCase(sort)) {
            isAsc = false;
        }
        Pageable page = null;
        if(isPage) {
            page = PageRequest.of(dto.getCurrentPage(), dto.getPageSize());
        }

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<BusinessTerm> query = cb.createQuery(BusinessTerm.class);
        Root<BusinessTerm> namingBusinessTerm = query.from(BusinessTerm.class);

        Path<String> chNamePath = namingBusinessTerm.get("chName");
        Path<String> enNamePath = namingBusinessTerm.get("enName");
        Path<String> domainCodePath = namingBusinessTerm.get("domainCode");
        Path<Long> folderIdPath = namingBusinessTerm.get("folderId");

        List<Predicate> predicates = new ArrayList<>();
        if(StringUtils.isNotEmpty(dto.getKeyword())) {
            Expression<String> keywordLiteral = cb.literal("%" + dto.getKeyword().toLowerCase() + "%");
            predicates.add(cb.or(
                    cb.like(cb.lower(chNamePath), keywordLiteral),
                    cb.like(cb.lower(enNamePath), keywordLiteral)
            ));
        }
        if (StringUtils.isNotEmpty(dto.getChName())) {
            Expression<String> keywordLiteral = cb.literal("%" + dto.getChName().toLowerCase() + "%");
            predicates.add(cb.like(cb.lower(chNamePath), keywordLiteral));
        }
        if (StringUtils.isNotEmpty(dto.getDomainCode())) {
            Expression<String> keywordLiteral = cb.literal("%" + dto.getDomainCode().toLowerCase() + "%");
            predicates.add(cb.like(cb.lower(domainCodePath), keywordLiteral));
        }
        //如果folderId不为空需要查询folderId下所有子集
        Set<Long> folderIdList = new HashSet<>();
        Long folderId = Optional.ofNullable(dto.getFolderId()).orElse(DomainService.DOMAIN_CATEGORY_ID);
        folderIdList.add(folderId);
        List<DomainFolder> folders = new ArrayList<>();
        domainFolderRepo.findAll().forEach(domainFolder -> {
            folders.add(domainFolder);
        });
        getFolderIdList(folderId, folderIdList, folders);
        predicates.add(folderIdPath.in(folderIdList));

        if (dto.getDomainState() != null) {
            predicates.add(cb.equal(namingBusinessTerm.get("state"), dto.getDomainState()));
        }


        Order order = null;
        if (!Strings.isNullOrEmpty(orderBy)) {
            if (orderBy.equals("domainCode")
                    || orderBy.equals("chName")
                    || orderBy.equals("enName")
                    || orderBy.equals("abbr")
                    || orderBy.equals("managementDepartment")
                    || orderBy.equals("updateTime")) {
                if (isAsc) {
                    order = cb.asc(namingBusinessTerm.get(orderBy));
                } else {
                    order = cb.desc(namingBusinessTerm.get(orderBy));
                }
            } else {
                throw new InvalidArgumentException(GeneralUtility
                        .getMessageService().getMessage("cannotOrderBySpecifiedColumn", orderBy));
            }
        }

        CriteriaQuery cb2 = query.select(namingBusinessTerm).where(cb.and(predicates.toArray(new Predicate[predicates.size()])));
        TypedQuery<BusinessTerm> tq = null;
        if (order != null) {
            tq = em.createQuery(cb2.orderBy(order));
        } else {
            tq = em.createQuery(cb2);
        }

        if(isPage) {
            tq.setFirstResult(page.getPageNumber() * page.getPageSize());
            tq.setMaxResults(page.getPageSize());
        }

        List<BusinessTerm> termList = tq.getResultList();
        CriteriaQuery<Long> countQuery = null;
        if(isPage) {
            countQuery = cb.createQuery(Long.class);
            countQuery.select(cb.count(countQuery.from(BusinessTerm.class))).where(cb.and(predicates.toArray(new Predicate[predicates.size()])));
        }
        List<BusinessTermDto> dtoList = new ArrayList<>();
        if (!CollectionUtils.isEmpty(termList)) {
            dtoList = termList.stream().map(BusinessTermDto::buildBy).toList();
            // 完善部门名称 And 业务术语
            fillDepartmentName(dtoList);
        }
        PageResult<BusinessTermDto> pageResult = new PageResult<>();
        pageResult.setContentDirectly(dtoList);
        if(isPage) {
            pageResult.setTotalItems(em.createQuery(countQuery).getSingleResult());
        }
        pageResult.setPageSize(dto.getPageSize());
        pageResult.setCurrentPage(dto.getCurrentPage());
        return pageResult;
    }

    private void getFolderIdList(Long folderId, Set<Long> folderIdList, List<DomainFolder> folders) {
        for (DomainFolder folder : folders) {
            if (folder.getParentId().equals(folderId)) {
                folderIdList.add(folder.getId());
                getFolderIdList(folder.getId(), folderIdList, folders);
            }
        }
    }

    @Override
    public BusinessTermDto queryBusinessTermById(Long nsId) {
        BusinessTerm businessTerm = busTermRepo.findAllByIdEquals(nsId);
        //获取部门名称
        BusinessTermDto businessTermDto = BusinessTermDto.buildBy(businessTerm);
        fillDepartmentName(businessTermDto);
        return businessTermDto;
    }


    @Override
    public List<BusinessTermDto> queryBusinessTermById(List<Long> nsIds) {
        List<BusinessTerm> businessTerms = busTermRepo.findAllByIdIn(nsIds);
        List<BusinessTermDto> businessTermDtos = businessTerms.stream().map(BusinessTermDto::buildBy).toList();
        fillDepartmentName(businessTermDtos);
        return businessTermDtos;
    }

    @Override
    public void fillDepartmentName(BusinessTermDto businessTermDto) {
        fillDepartmentName(Arrays.asList(businessTermDto));
    }
    @Override
    public void fillDepartmentName(List<BusinessTermDto> businessTermDtos) {
        if(CollectionUtils.isEmpty(businessTermDtos)) return;
        List<String> departNames = businessTermDtos.stream().map(BusinessTermDto::getManagementDepartment).toList();
        Map<String, String> orgNameMap = getOrgNameMap(departNames);
        for (BusinessTermDto businessTermDto : businessTermDtos) {
            if (StringUtils.isNotBlank(businessTermDto.getManagementDepartment())) {
                List<String> ownerOrgList = Arrays.stream(businessTermDto.getManagementDepartment().split("[,，]")).toList();
                List<String> orgNames = new ArrayList();
                for (String item : ownerOrgList) {
                    orgNames.add(orgNameMap.getOrDefault(item, item));
                }
                businessTermDto.setManagementDepartmentName(String.join(",", orgNames));
            }
        }

        // 完善关联业务术语
        List<Long> relaTermIdList = new ArrayList<>();
        for (BusinessTermDto term : businessTermDtos) {
            if(term.getRelaId() != null) {
                relaTermIdList.add(term.getRelaId());
            }
        }
        if(!relaTermIdList.isEmpty()) {
            Map<Long, String> relaTermNameMap = busTermRepo.findAllByIdIn(relaTermIdList).stream().collect(Collectors.toMap(BusinessTerm::getId, v -> v.getChName()));
            businessTermDtos.forEach(businessTermDto -> {businessTermDto.setRelaTerm(relaTermNameMap.getOrDefault(businessTermDto.getRelaId(), ""));});
        }

        Long domainCategoryId = DomainService.DOMAIN_CATEGORY_ID;
        // 完善路径信息
        DomainTreeNodeDto root = domainFolderExtService.loadDomainTree(null, domainCategoryId, null, true);
        businessTermDtos.forEach(businessTermDto -> {
            DomainTreeNodeDto domainTreeNodeDto = DomainTreeNodeExtDto.findByFolderId(businessTermDto.getFolderId(), root);
            List<String> paths = DomainTreeNodeExtDto.buildNamePathArr(domainTreeNodeDto, root);
            String bizCode = DomainTreeNodeExtDto.searchBizCode(root, domainTreeNodeDto, domainCategoryId);
            businessTermDto.setPaths(paths);
            businessTermDto.setBizCode(bizCode);
        });

    }

    @Override
    public PageResult<EditHistory> getNamingStandardHistory(NamingStandardQueryDto queryDto) {
        return this.convertToEditHistoryPageResult(this.editHistoryRepo.findByHistoryTypeEqualsAndItemIdEqualsOrderByTimestampDesc(4000, queryDto.getNsId().toString(), PageRequest.of(queryDto.getCurrentPage(), queryDto.getPageSize())));
    }

    @Override
    public ImportInstantJobResult importBusinessTerm(boolean autoGenCode, File uploadFile, boolean published, String username, boolean ignoreError, Long categoryId, boolean publishUpload) {
        LOGGER.info("import start");
        checkDomainExcelTemplate(uploadFile);

        BusinessTermParaDto res = new BusinessTermParaDto();
        ImportInstantJobResult result = new ImportInstantJobResult();

        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus status = txManager.getTransaction(def);
        try {

            ExcelLoadJobResult<BusinessTermExcelDto> loadJobResult = excelLoader
                    .loadFile(uploadFile.getAbsolutePath(), 0, BusinessTermExcelDto.class);
            List<BusinessTermExcelDto> domainExcelDtoList = loadJobResult.getLoaded();

            if (domainExcelDtoList == null || domainExcelDtoList.isEmpty()) {
                return result;
            }

            Set<String> orgCodeSet = new HashSet();

            //获取所有的org信息
            Map<String, OrganizationDto> orgCodeAndOrgInfo = organizationService.getOrganizationsByBms(new ArrayList<>(orgCodeSet)).stream().collect(Collectors.toMap(b -> b.getBm(), b -> b));

            for (BusinessTermExcelDto businessTermDto : domainExcelDtoList) {
                if (Strings.isNullOrEmpty(businessTermDto.getChName())) {
                    businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.notnull.chName"));
                    continue;
                }
                if (Strings.isNullOrEmpty(businessTermDto.getExplanationTerms())) {
                    businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.notnull.explanationTerms"));
                    continue;
                }
                if (Strings.isNullOrEmpty(businessTermDto.getEnName())) {
                    businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.notnull.enName"));
                    continue;
                }

                if (Strings.isNullOrEmpty(businessTermDto.getManagementDepartment())) {
                    businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.notnull.managementDepartment"));
                    continue;
                } else if (!orgCodeAndOrgInfo.containsKey(businessTermDto.getManagementDepartment())) {
                    businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.notexist.managementDepartment"));
                    continue;
                }
                if(!autoGenCode && Strings.isNullOrEmpty(businessTermDto.getDomainCode())) {
                    businessTermDto.setErrorMsg(this.msgService.getMessage("BusinessTerm.notnull.domainCode"));
                    continue;
                }
                // 目录不存在无法导入
                if (businessTermDto.getPaths() == null || businessTermDto.getPaths().isEmpty()) {
                    businessTermDto.setErrorMsg(msgService.getMessage("hasNoExistPathToImport", businessTermDto.getChName()));
                }

                //数据标准导入时业务规则+中文名称+业务定义任意两个不能相等。--新加功能
                if(Objects.equals(businessTermDto.getChName(), businessTermDto.getExplanationTerms())){
                    businessTermDto.setErrorMsg("中文名称、业务定义不能相等");
                }
            }

            Set<String> chineseNameMap = new HashSet<>();
            Set<String> duplicateChineseNames = new HashSet<>();

            Set<String> domainCodeMap = new HashSet<>();
            Set<String> duplicateCodes = new HashSet<>();
//            List<String> allChineseNameList = busTermRepo.findAllChineseName();
            for (BusinessTermExcelDto businessTermDto : domainExcelDtoList) {
                if(StringUtils.isNotEmpty(businessTermDto.getErrorMsg())) continue;
                boolean notExist = chineseNameMap.add(businessTermDto.getChName());
                //如果是发布审批，不能有重复的中文名
                if (!notExist) {
                    businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.exist.chName", businessTermDto.getChName()));
                    duplicateChineseNames.add(businessTermDto.getChName());
                    continue;
                }
                /*if (allChineseNameList.contains(businessTermDto.getChName())) {
                    businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.exist.chName", businessTermDto.getChName()));
                    continue;
                }*/
                if(!Strings.isNullOrEmpty(businessTermDto.getDomainCode())) {
                    notExist = domainCodeMap.add(businessTermDto.getDomainCode());
                    if(!notExist) {
                        businessTermDto.setErrorMsg(msgService.getMessage("BusinessTerm.exist.domainCode", businessTermDto.getDomainCode()));
                        duplicateCodes.add(businessTermDto.getDomainCode());
                    }
                }
            }

            // 此处 将表格中重复的 标准和中文名称 都算作问题数据;
            for (BusinessTermExcelDto o : domainExcelDtoList) {
                if (Strings.isNullOrEmpty(o.getErrorMsg()) && duplicateChineseNames.contains(o.getChName())) {
                    o.setErrorMsg(msgService.getMessage("BusinessTerm.exist.chName", o.getChName()));
                }
            }

            // 此处 将表格中重复的 标准编码 都算作问题数据;
            for (BusinessTermExcelDto o : domainExcelDtoList) {
                if (Strings.isNullOrEmpty(o.getErrorMsg()) && duplicateCodes.contains(o.getDomainCode())) {
                    o.setErrorMsg(msgService.getMessage("BusinessTerm.exist.domainCode", o.getDomainCode()));
                }
            }
            res = generalAddImportDomains(autoGenCode, published, username, new ArrayList<>(domainExcelDtoList), ignoreError, categoryId, publishUpload);

            txManager.commit(status);
        } catch (Exception e) {
            LOGGER.warn("import error:{}", e);
            if (!status.isCompleted()) {
                txManager.rollback(status);
            }
            throw new AndorjRuntimeException(e.getMessage(), e);
        }

        List<BusinessTermExcelDto> errorList = res.getBusinessTermDto()
                .stream().
                filter(
                        o -> !Strings.isNullOrEmpty(o.getErrorMsg())
                ).toList();
        result.setFileId(getProblemFile(
                uploadFile,
                errorList, username));
        if (ignoreError) {
            result.setSuccess(res.getBusinessTermDto().size() - errorList.size());
            result.setFailed(errorList.size());
        } else {
            // 如果不忽略错误，并且存在错误，那么成功条数=入库条数 = 0
            int failedNum = errorList.size();
            if (failedNum > 0) {
                result.setSuccess(0);
                result.setFailed(res.getBusinessTermDto().size());
            } else {
                result.setSuccess(res.getBusinessTermDto().size());
                result.setFailed(0);
            }
        }
        LOGGER.info("import end");
        return result;
    }

    @Override
    @Transactional
    public BusinessTermDto updateDomainState(BusinessTerm toBeUpdate, String message, String currentUsername) {
        DomainState newState = toBeUpdate.getState();
        BusinessTerm saved = busTermRepo.findById(toBeUpdate.getId()).orElseThrow(() -> new InvalidArgumentException(msgService.getMessage("cannotFindBusinessTermByNsId", new Object[]{toBeUpdate.getId()})));
        if (!newState.equals(DomainState.C)) {
            saved.setUpdatingNsId(null);
        }

        saved.setState(newState);
        BusinessTermDto businessTermDto = BusinessTermDto.buildBy(busTermRepo.save(saved));
        fillDepartmentName(businessTermDto);
        return businessTermDto;
    }


    public String getProblemFile(File originFile, List<BusinessTermExcelDto> list, String userName) {
        if (list == null || list.isEmpty()) {
            return null;
        }

        String res = null;
        Map<String, String> codeMap = new HashMap<>();

        Map<String, String> nameMap = list.stream().collect(Collectors.toMap(BusinessTermExcelDto::getChName, BusinessTermExcelDto::getErrorMsg, (errorMsg1, errorMsg2) -> errorMsg1));
        // key row number; value error msg
        Map<Integer, String> errorMap = new HashMap<>();

        String filename = msgService.getMessage("import.errorData") + ".xlsx";
        File outputFile = new File(filename);


        try (FileInputStream inputStream = new FileInputStream(originFile);
             XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {
            //sheet页校验
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new InvalidArgumentException(msgService.getMessage("templateSheetNotExist"));
            }

            String msg = null;
            int codePlace = 0;
            int namePlace = 0;

            // 在指定 sheet 页最前面加两列
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                //表头
                if (i == 0) {
                    for (int j = 0; j <= row.getLastCellNum(); j++) {
                        String headName = row.getCell(j) == null ? null : row.getCell(j).getStringCellValue();
                        if (ObjectUtils.equals(headName, msgService.getMessage("BusinessTermExcelDto.chName"))) {
                            namePlace = j;
                        }
                    }
                    continue;
                }
                //中文名称
                String chineseName = row.getCell(namePlace) == null ? null : row.getCell(namePlace).getStringCellValue().trim();
                msg = nameMap.get(chineseName);
//                // 自动编码，且不写中文名称的时候，需要在此给给定错误信息； 中文名称是 锚定物
//                if (Strings.isNullOrEmpty(chineseName)) {
//                    errorMap.put(i, msgService.getMessage("domainChNameMissing"));
//                    continue;
//                }

                if (!Strings.isNullOrEmpty(msg)) {
                    errorMap.put(i, msg);
                }

            }


            ExcelUtil.fillingImportError(workbook, 0, errorMap, false);

            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                workbook.write(fos);

            } catch (IOException e) {
                e.printStackTrace();
            }

            FileDescriptor fileDescriptor = fileUtility.uploadFile(outputFile,
                    filename, userName, false);

            res = fileDescriptor.getFileId();

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw new InvalidArgumentException(e.getMessage());
        }
        return res;
    }

    public BusinessTermParaDto generalAddImportDomains(boolean autoGenCode, boolean published, String username, ArrayList<BusinessTermExcelDto> domainExcelDtos, boolean ignoreError, Long categoryId, boolean publishUpload) throws Exception {

        List<BusinessTermExcelDto> tempErrorList = domainExcelDtos.stream().filter(o -> !Strings.isNullOrEmpty(o.getErrorMsg())).toList();
        LOGGER.info("2.导入业务术语初步校验完成,总数:{},错误数:{}", domainExcelDtos.size(), tempErrorList.size());

        //查询所有的业务术语
        List<BusinessTerm> busTermRepoAll = busTermRepo.findAll();
        Map<String, List<BusinessTerm>> businessTermDomainCodeMap = busTermRepoAll.stream()
                .collect(Collectors.groupingBy(BusinessTerm::getDomainCode));
        Map<String, List<BusinessTerm>> chNameListMap = busTermRepoAll.stream()
                .collect(Collectors.groupingBy(BusinessTerm::getChName));

        //要保存的数据集合
        List<BusinessTerm> toBeUpdated = new LinkedList<>();
        List<BusinessTerm> toBeAdded = new LinkedList<>();

        DomainTreeNodeDto domainTreeNodeDto = domainFolderExtService.loadDomainTree(null, DomainService.DOMAIN_CATEGORY_ID, null, true);

        Map<Long, String> bizCodeMap = domainFolderExtService.getBizCodeMap();
        List<BusinessTerm[]> updatingBusinessTermMap = new ArrayList<>();
        boolean updatingBusinessTermMapFlag = false;
        //全部校验完成后，再创建目录
        for (BusinessTermExcelDto excelDto : domainExcelDtos) {
            // 校验没有问题的数据才会执行
            if (StringUtils.isNotEmpty(excelDto.getErrorMsg())) {
                continue;
            }
            //设置domain的目录
            if (ignoreError || tempErrorList.isEmpty()) {
                DomainExtDto domainDto = excelDto.buildDomainDto(categoryId, msgService);
                // 设置folderId并完善Code
                domainExtService.setDomainPath(domainDto, categoryId, domainTreeNodeDto, username);
                excelDto.setErrorMsg(domainDto.getErrorMsg());
                excelDto.setFolderId(domainDto.getFolderId());
                if(StringUtils.isNotEmpty(excelDto.getErrorMsg())) {
                    continue;
                }
            }
            // 关联术语
            if(StringUtils.isNotEmpty(excelDto.getRelaTerm())) {
                if (CollectionUtils.isEmpty(businessTermDomainCodeMap.get(excelDto.getRelaTerm()))) {
                    BusinessTerm relaBusinessTerm = businessTermDomainCodeMap.get(excelDto.getRelaTerm())
                            .stream()
                            .filter(v -> v.getState() == DomainState.A).findFirst()
                            .orElse(businessTermDomainCodeMap.get(excelDto.getRelaTerm()).get(0));
                    excelDto.setRelaId(relaBusinessTerm.getId());
                } else {
                    excelDto.setErrorMsg(msgService.getMessage("relaTermNotExist", excelDto.getRelaTerm()));
                    continue;
                }
            }
            BusinessTerm o = excelDto.buildBusinessTerm();
            //对已经存在数据库中的进行处理
            // 状态判断
            List<BusinessTerm> dbBusList = null;
            if (StringUtils.isNotBlank(excelDto.getDomainCode())) {
                dbBusList = businessTermDomainCodeMap.get(excelDto.getDomainCode());
            }
            if (CollectionUtils.isEmpty(dbBusList)) {
                //名称已经存在数据库中的进行处理
                dbBusList = chNameListMap.get(excelDto.getChName());
            }
            if (!CollectionUtils.isEmpty(dbBusList)) {
                BusinessTerm dbBus = null;
                if (dbBusList.size() > 1) {
                    Optional<BusinessTerm> businessTermOptional = dbBusList.stream()
                            .filter(b -> DomainState.A != b.getState())
                            .findFirst();
                    if(businessTermOptional.isPresent()) {
                        dbBus = businessTermOptional.get();
                    } else {
                        // 同一个domainCode不会存在多条已经发布的数据
                        excelDto.setErrorMsg(msgService.getMessage("BusinessTerm.importChName.auditDataIsExist", o.getChName()));
                        continue;
                    }
                } else {
                    // A：已发布  C：审核中  D：待审核   X：已废弃
                    //该名称在数据库中只存在一条数据
                    dbBus = dbBusList.get(0);
                }
                switch (dbBus.getState()) {
                    case D:
                        //状态为待审核的可直接修改
                        BusinessTermExcelDto.overwirte(o, dbBus, published);
                        break;
                    case A:
                        //状态为已发布的，生成一条待审核的记录
                        o.setId(null);
                        o.setState(published ? DomainState.A : DomainState.D);
                        o.setVersion(dbBus.getVersion() + 1);
                        o.setFirstPublish(dbBus.getFirstPublish());
                        o.setUpdateTime(System.currentTimeMillis());
                        o.setDomainCode(dbBus.getDomainCode());
                        updatingBusinessTermMap.add(new BusinessTerm[]{dbBus, o});
                        updatingBusinessTermMapFlag = true;
                        break;
                    case C:
                        //状态为审核中的，不予处理
                        excelDto.setErrorMsg(msgService.getMessage("BusinessTerm.importChName.auditDataIsExist", o.getChName()));
                        break;
                    case X:
                        //状态为已废弃的，不予处理
                        excelDto.setErrorMsg(msgService.getMessage("BusinessTerm.importChName.discarded", o.getChName()));
                        break;
                    default:
                        break;
                }

            } else {
                //名称在数据库中不存在，新增数据
                o.setState(DomainState.D);
                if (published) {
                    o.setState(DomainState.A);
                    o.setFirstPublish(new Date());
                }
                o.setVersion(1);
            }
            if (StringUtils.isNotBlank(excelDto.getErrorMsg())) {
                if(updatingBusinessTermMapFlag) {
                    // 未知失败的情况，需要删除
                    updatingBusinessTermMap.remove(updatingBusinessTermMap.size() - 1);
                }
                continue;
            }

            // 自动生成domainCode
            if (StringUtils.isBlank(excelDto.getDomainCode()) && autoGenCode) {
                String domainCode = customizeDomainCodeGenerateService.getSingleDomainCode(DatablauDomainType.BUSINESS_TERM, bizCodeMap.get(excelDto.getFolderId()));
                excelDto.setDomainCode(domainCode);
                o.setDomainCode(domainCode);
            }
            if(o.getId() == null) {
                toBeAdded.add(o);
            } else {
                toBeUpdated.add(o);
            }
        }

        tempErrorList = domainExcelDtos.stream().filter(o -> !Strings.isNullOrEmpty(o.getErrorMsg())).toList();
        LOGGER.info("2.导入业务术语初步校验完成,总数:{},错误数:{}", domainExcelDtos.size(), tempErrorList.size());

        //开始保存业务术语
        if (ignoreError || tempErrorList.isEmpty()) {
            List<EditHistoryEntity> histories = new LinkedList<>();
            if (!toBeUpdated.isEmpty()) {
                List<List<BusinessTerm>> nsLists = Lists.partition(toBeUpdated, 999);
                for (List<BusinessTerm> nsList : nsLists) {
                    busTermRepo.saveAll(nsList);
                }
            }

            if (!toBeAdded.isEmpty()) {
                List<List<BusinessTerm>> nsLists = Lists.partition(toBeAdded, 999);
                for (List<BusinessTerm> nsList : nsLists) {
                    busTermRepo.saveAll(nsList);
                }
                for (BusinessTerm ns : toBeAdded) {
                    if (buildHistory(new BusinessTerm(), ns, username) != null) {
                        EditHistoryEntity editHistoryEntity = buildHistory(new BusinessTerm(), ns, username);
                        editHistoryEntity.setChanges("业务术语初始创建完成");
                        histories.add(editHistoryEntity);
                    }
                }
            }
            if (!histories.isEmpty()) {
                for (List<EditHistoryEntity> partition : Lists.partition(histories, 999)) {
                    editHistoryRepo.saveAll(partition);
                }
            }
            if(!CollectionUtils.isEmpty(updatingBusinessTermMap)) {
                List<BusinessTerm> updatingList = new ArrayList<>();
                for (BusinessTerm[] businessTerms : updatingBusinessTermMap) {
                    BusinessTerm businessTerm = businessTerms[0];
                    businessTerm.setUpdatingNsId(businessTerms[1].getId());
                    updatingList.add(businessTerm);
                }
                busTermRepo.saveAll(updatingList);
            }
        }

        BusinessTermParaDto businessTermParaDto = new BusinessTermParaDto();
        businessTermParaDto.setBusinessTermDto(domainExcelDtos);
        toBeAdded.addAll(toBeUpdated);
        businessTermParaDto.setInsertBusinessTerm(toBeAdded);
        businessTermParaDto.setErrorBusinessTerm(tempErrorList);
        return businessTermParaDto;
    }

    public void checkDomainExcelTemplate(File uploadFile) {
        InputStream is = null;
        try {
            is = new FileInputStream(uploadFile);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }
        XSSFWorkbook workbook = null;
        try {
            workbook = new XSSFWorkbook(is);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        try {
            XSSFSheet sheet = domainService.getFirstVisbleSheet(workbook);

            int headerRowNumber = sheet.getFirstRowNum();
            Row headerRow = sheet.getRow(headerRowNumber);
            int startCol = headerRow.getFirstCellNum();
            int endCol = headerRow.getLastCellNum();
            if (startCol != 0) {
                throw new InvalidArgumentException(msgService.getMessage("mustStartAtLineOne"));
            }

            if ((endCol + 1) < 6) {
                throw new InvalidArgumentException(
                        msgService.getMessage("onlyOneRequiredLine", (endCol + 1)));
            }

            int index = 0;
            String col1 = getCellStringValue(headerRow.getCell(index++));
            while (msgService.getMessage("BusinessTermExcelDto.paths").contains(col1)) {
                col1 = getCellStringValue(headerRow.getCell(index++));
            }

            String col2 = col1;
            if (!msgService.getMessage("BusinessTermExcelDto.domainCode").equals(col2)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.domainCode"), col2));
            }

            String col3 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.chName").equals(col3)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.chName"), col3));
            }

            String col4 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.enName").equals(col4)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.enName"), col4));
            }

            String col5 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.explanationTerms").equals(col5)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.explanationTerms"), col5));
            }

            String col6 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.managementDepartment").equals(col6)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.managementDepartment"), col6));
            }

            String col7 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.abbr").equals(col7)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.abbr"), col7));
            }

            String col8 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.source").equals(col8)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.source"), col8));
            }

            String col9 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.scene").equals(col9)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.scene"), col9));
            }

            String col10 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.example").equals(col10)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.example"), col10));
            }

            String col11 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.businessTermAliases").equals(col11)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.businessTermAliases"), col11));
            }

            String col12 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("BusinessTermExcelDto.relaTerm").equals(col12)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importBusinessTermExcelHeaderError", index, msgService.getMessage("BusinessTermExcelDto.relaTerm"), col12));
            }
        } catch (Exception ex) {
            throw new AndorjRuntimeException(ex.getMessage(), ex);
        }
    }

    private PageResult<EditHistory> convertToEditHistoryPageResult(Page<EditHistoryEntity> page) {
        PageResult<EditHistory> result = new PageResult();
        result.setCurrentPage(page.getNumber());
        result.setPageSize(page.getSize());
        result.setContentDirectly(this.convertToListEditHistory((Collection) page.get().collect(Collectors.toList())));
        result.setTotalItems(page.getTotalElements());
        return result;
    }

    private List<EditHistory> convertToListEditHistory(Collection<EditHistoryEntity> histories) {
        List<EditHistory> res = new ArrayList<>();
        for (EditHistoryEntity history : histories) {
            res.add(convertToEditHistory(history));
        }
        return res;
    }

    private EditHistory convertToEditHistory(EditHistoryEntity history) {
        EditHistory res = new EditHistory();
        res.setChanges(history.getChanges());
        res.setHistoryType(history.getHistoryType());
        res.setItemId(history.getItemId());
        res.setOperator(history.getOperator());
        res.setTimestamp(history.getTimestamp());
        res.setVersion(history.getVersion());
        return res;
    }

    @Override
    public void checkParams(BusinessTermDto businessTermDto) {
        if (StringUtils.isEmpty(businessTermDto.getChName())) {
            throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.chName"));
        } else {
            if (Objects.isNull(businessTermDto.getId())) {
                if (busTermRepo.existsAllByChName(businessTermDto.getChName())) {
                    throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.exist.chName", businessTermDto.getChName()));
                }
            } else {
                BusinessTerm businessTerm = busTermRepo.findAllByChName(businessTermDto.getChName());
                if (Objects.nonNull(businessTerm) && !businessTerm.getId().equals(businessTermDto.getId())) {
                    throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.exist.chName", businessTermDto.getChName()));
                }
            }
        }
        if (StringUtils.isEmpty(businessTermDto.getEnName())) {
            throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.enName"));
        }
        if (StringUtils.isEmpty(businessTermDto.getExplanationTerms())) {
            throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.explanationTerms"));
        }

        if (Objects.isNull(businessTermDto.getFolderId())) {
            throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.categoryId"));
        } else {
            if (!domainFolderRepo.findById(businessTermDto.getFolderId()).isPresent()) {
                throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.categoryId.exist"));
            }
        }

        if (StringUtils.isEmpty(businessTermDto.getManagementDepartment())) {
            throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.managementDepartment"));
        } else {
            if (Objects.isNull(organizationService.getOrganizationsByBmNull(businessTermDto.getManagementDepartment()))) {
                throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.managementDepartment.exist"));
            }
        }
    }

    public EditHistoryEntity buildHistory(BusinessTerm oldBus, BusinessTerm newBus, String currentUser) {
        Map<String, Pair<String, String>> changes = GeneralUtility.compare(BusinessTerm.class, oldBus, newBus);
        if (changes.isEmpty()) {
            return null;
        } else {
            List<String> changeDetails = new ArrayList(changes.size());
            Iterator var6 = changes.entrySet().iterator();

            while (var6.hasNext()) {
                Map.Entry<String, Pair<String, String>> change = (Map.Entry) var6.next();
                changeDetails.add(this.msgService.getMessage("changeDataFromTo", new Object[]{change.getKey(), ((Pair) change.getValue()).getFirst(), ((Pair) change.getValue()).getSecond()}));
            }

            String details = String.join("\n", changeDetails);
            EditHistoryEntity history = new EditHistoryEntity();
            history.setTimestamp(new Date());
            history.setOperator(currentUser);
            history.setChanges(details);
            history.setHistoryType(4000);
            history.setItemId(newBus.getId().toString());
            return history;
        }
    }

    private Map<Integer, String> folderKeyMap() {
        if (!map.isEmpty()) {
            return map;
        }
        String[] split = folderKey.split(",");
        for (String folderKey : split) {
            String[] folder = folderKey.split(":");
            if (!map.containsKey(Integer.valueOf(folder[0]))) {
                map.put(Integer.valueOf(folder[0]), folder[1]);
            }
        }
        return map;
    }

    @Transactional
    public void publicBusinessTerm(Long nsId, String username, String stateOriginal) {

        //发起申请的那条数据
        BusinessTerm newBusinessTerm = busTermRepo.findAllByIdEquals(nsId);
        //原状态的数据
        BusinessTerm oldBusinessTerm = busTermRepo.findAllByUpdatingNsId(nsId);

        try {
            LOGGER.info("publicBusinessTerm发起申请的那条数据:{}", objectMapper.writeValueAsString(newBusinessTerm));
            LOGGER.info("publicBusinessTerm原状态的数据:{}", objectMapper.writeValueAsString(oldBusinessTerm));

        } catch (JsonProcessingException e) {


        }


        if (oldBusinessTerm == null) {
            if (DomainState.X.toString().equals(stateOriginal)) {
                newBusinessTerm.setVersion(newBusinessTerm.getVersion() + 1);
            } else {
                newBusinessTerm.setVersion(1);
            }

            newBusinessTerm.setFirstPublish(new Date());
            newBusinessTerm.setState(DomainState.A);
            String message;
            if (DomainState.X.toString().equals(stateOriginal)) {
                message = this.msgService.getMessage("businessTermAbandonToPublished");
            } else {
                message = this.msgService.getMessage("businessTermBeanMarkedPublished");
            }

//            createBusinessTermVersion(newBusinessTerm, username, message);
            busTermRepo.save(newBusinessTerm);
        } else {

            EditHistoryEntity history = this.buildHistory(oldBusinessTerm, newBusinessTerm, username);

            if (history != null) {
                history.setItemId(oldBusinessTerm.getId().toString());
                this.editHistoryRepo.save(history);
            }

            //保存业务术语 新的数据复制给旧的数据
            oldBusinessTerm.setDomainCode(newBusinessTerm.getDomainCode());
            oldBusinessTerm.setChName(newBusinessTerm.getChName());
            oldBusinessTerm.setBusinessTermAliases(newBusinessTerm.getBusinessTermAliases());
            oldBusinessTerm.setExplanationTerms(newBusinessTerm.getExplanationTerms());
            oldBusinessTerm.setEnName(newBusinessTerm.getEnName());
            oldBusinessTerm.setAbbr(newBusinessTerm.getAbbr());
            oldBusinessTerm.setManagementDepartment(newBusinessTerm.getManagementDepartment());
            oldBusinessTerm.setReporter(newBusinessTerm.getReporter());
            oldBusinessTerm.setCategoryId(newBusinessTerm.getCategoryId());
            oldBusinessTerm.setUpdateTime(newBusinessTerm.getUpdateTime());
            oldBusinessTerm.setVersion(oldBusinessTerm.getVersion() + 1);
            oldBusinessTerm.setUpdatingNsId(null);
            oldBusinessTerm.setState(DomainState.A);

            //createBusinessTermVersion(oldBusinessTerm, startUser, this.msgService.getMessage("businessTermHappendModify"));

            busTermRepo.save(oldBusinessTerm);


            //   删除新的这条数据
            busTermRepo.deleteByIdIn(Arrays.asList(newBusinessTerm.getId()));

        }

    }


    @Override
    @Transactional
    public void passBusinessTermUpdate(Long nsId, String startUser) {
        //申请变更，审核通过处理

        //原状态的数据
        BusinessTerm oldBusinessTerm = busTermRepo.findAllByIdEquals(nsId);

        //发起申请变更的那条数据
        BusinessTerm newBusinessTerm = busTermRepo.findAllByIdEquals(oldBusinessTerm.getUpdatingNsId());

        try {
            LOGGER.info("passBusinessTermUpdate发起申请变更的那条数据:{}", objectMapper.writeValueAsString(newBusinessTerm));
            LOGGER.info("passBusinessTermUpdate原状态的数据:{}", objectMapper.writeValueAsString(oldBusinessTerm));

        } catch (JsonProcessingException e) {
        }

        EditHistoryEntity history = this.buildHistory(oldBusinessTerm, newBusinessTerm, startUser);

        if (history != null) {
            history.setItemId(oldBusinessTerm.getId().toString());
            this.editHistoryRepo.save(history);
        }

        //保存业务术语 新的数据复制给旧的数据
        oldBusinessTerm.setDomainCode(newBusinessTerm.getDomainCode());
        oldBusinessTerm.setChName(newBusinessTerm.getChName());
        oldBusinessTerm.setBusinessTermAliases(newBusinessTerm.getBusinessTermAliases());
        oldBusinessTerm.setExplanationTerms(newBusinessTerm.getExplanationTerms());
        oldBusinessTerm.setEnName(newBusinessTerm.getEnName());
        oldBusinessTerm.setAbbr(newBusinessTerm.getAbbr());
        oldBusinessTerm.setManagementDepartment(newBusinessTerm.getManagementDepartment());
        oldBusinessTerm.setReporter(newBusinessTerm.getReporter());
        oldBusinessTerm.setCategoryId(newBusinessTerm.getCategoryId());
        oldBusinessTerm.setUpdateTime(newBusinessTerm.getUpdateTime());
        oldBusinessTerm.setVersion(oldBusinessTerm.getVersion() + 1);
        oldBusinessTerm.setUpdatingNsId(null);
        oldBusinessTerm.setSource(newBusinessTerm.getSource());
        oldBusinessTerm.setExample(newBusinessTerm.getExample());
        oldBusinessTerm.setRelaId(newBusinessTerm.getRelaId());
        oldBusinessTerm.setScene(newBusinessTerm.getScene());
        oldBusinessTerm.setState(DomainState.A);

        //createBusinessTermVersion(oldBusinessTerm, startUser, this.msgService.getMessage("businessTermHappendModify"));

        busTermRepo.save(oldBusinessTerm);


        //   删除新的这条数据
        busTermRepo.deleteByIdIn(Arrays.asList(newBusinessTerm.getId()));
    }


    @Override
    @Transactional
    public void rejectBusinessTermUpdate(Long nsId, String startUser) {
        //申请变更，审核拒绝处理 ，删除新的那条数据

        //原状态的数据
        BusinessTerm oldBusinessTerm = busTermRepo.findAllByIdEquals(nsId);

        //发起申请变更的那条数据
//        BusinessTerm newBusinessTerm = busTermRepo.findAllByIdEquals(oldBusinessTerm.getUpdatingNsId());

        try {

            LOGGER.info("rejectBusinessTermUpdate原状态的数据:{}", objectMapper.writeValueAsString(oldBusinessTerm));

        } catch (JsonProcessingException e) {


        }

        //   删除新的这条数据
        busTermRepo.deleteByIdIn(Arrays.asList(oldBusinessTerm.getUpdatingNsId()));

        oldBusinessTerm.setState(DomainState.A);
        oldBusinessTerm.setUpdatingNsId(null);

        busTermRepo.save(oldBusinessTerm);

    }

    @Override
    @Transactional
    public void businessTermAbolish(Long nsId, String startUser, ProcessResultType resultType) {
        //申请废弃处理，无论通过、驳回、还是撤销都要删除副本


        //原状态的数据
        BusinessTerm oldBusinessTerm = busTermRepo.findAllByIdEquals(nsId);

        //发起申请变更的那条数据
//        BusinessTerm newBusinessTerm = busTermRepo.findAllByIdEquals(oldBusinessTerm.getUpdatingNsId());

        try {
            LOGGER.info("businessTermAbolish原状态的数据:{}", objectMapper.writeValueAsString(oldBusinessTerm));

        } catch (JsonProcessingException e) {

        }

        //无论通过、驳回、还是撤销都要删除副本
        busTermRepo.deleteByIdIn(Arrays.asList(oldBusinessTerm.getUpdatingNsId()));


        if (ProcessResultType.PASS == resultType) {
            //废弃标准状态是 X
            oldBusinessTerm.setState(DomainState.X);
        } else if (ProcessResultType.REJECT == resultType
                || ProcessResultType.REVOKE == resultType) {
            //驳回申请或者撤销的逻辑这里是一样的，把状态改回已发布
            oldBusinessTerm.setState(DomainState.A);
        }

        //更新状态
        oldBusinessTerm.setUpdatingNsId(null);
        busTermRepo.save(oldBusinessTerm);
    }

    @Override
    public Boolean checkNsNameConflicts(String nsName) {

        if (StringUtils.isEmpty(nsName)) {
            throw new IllegalArgumentException(msgService.getMessage("BusinessTerm.chName"));
        }
        BusinessTerm businessTerm = busTermRepo.findAllByChName(nsName);
        if (Objects.nonNull(businessTerm)) {
            return false;
        }
        return true;
    }

    @Override
    public BusinessTermChartDto getNsChart() {
        RBucket<BusinessTermChartDto> businessTermChartDtoRBucket = null;

        BusinessTermChartDto result;
        try {
            businessTermChartDtoRBucket = this.redissonClient.getBucket("DATA_BUSINESS_TERM_MAIN_COUNT_EXT");
            result = (BusinessTermChartDto) businessTermChartDtoRBucket.get();
            if (result == null) {
                result = this.nsDashboardCount();
                businessTermChartDtoRBucket.set(result);
            }
        } catch (Exception var7) {
            result = this.nsDashboardCount();
        } finally {
            if (businessTermChartDtoRBucket != null) {
                businessTermChartDtoRBucket.expire(24L, TimeUnit.HOURS);
            }
        }

        return result;
    }

    @Override
    @Transactional
    public Boolean moveTo(Long id, List<BusinessTermDto> businessTermDtos, String currentUser) {
        boolean existFolder = domainFolderRepo.existsById(id);
        if(!existFolder) {
            throw new IllegalArgumentException("要移动的目录不存在！");
        }
        List<BusinessTermDto> list = businessTermDtos.stream().filter(v -> !v.getFolderId().equals(id)).toList();
        if(list.isEmpty()) {
            return true;
        }
        Set<Long> ids = list.stream().map(v -> v.getId()).collect(Collectors.toSet());
        List<BusinessTerm> businessTerms = busTermRepo.findAllByIdIn(ids);
        for (BusinessTerm businessTerm : businessTerms) {
            businessTerm.setFolderId(id);
        }
        busTermRepo.saveAll(businessTerms);
        return true;
    }

    @Override
    public void updateDomainStateBatch(List<BusinessTermDto> businessTermDtos, String message, String username, String applyType, Integer approvalStatus) {
        //
        for (BusinessTermDto dto : businessTermDtos) {
            try {
                if ("发布".equals(applyType)) {
                    if (approvalStatus == 2) {
                        // 审核通过 - 正式发布
                        dto.setState(DomainState.A);
                        dto.setFirstPublish(new Date());
                        this.publicBusinessTerm(dto.getId(), username, dto.getState().toString());
                    } else if (approvalStatus == 3) {
                        // 审核不通过 -
                        this.rejectPubBusinessTrem(dto.getId(), username);
                    }
                } else if ("变更".equals(applyType)) {
                    if (approvalStatus == 2) {
                        // 通过 - 删除影子版本（正式替换）
                        this.passBusinessTermUpdate(dto.getId(),  username);
                    } else if (approvalStatus == 3) {
                        // 拒绝 - 删除影子版本，恢复原状态
                        dto.setState(DomainState.A);
                        this.rejectBusinessTermUpdate(dto.getId(), username);
                    }
                } else if ("废弃".equals(applyType)) {
                    if (approvalStatus == 2) {
                        // 审核通过 - 设置为废弃
                        this.businessTermAbolish(dto.getId(), username,ProcessResultType.PASS);
                    } else if (approvalStatus == 3) {
                        // 审核不通过 - 恢复原状态
                        this.businessTermAbolish(dto.getId(), username,ProcessResultType.REJECT);
                    }
                } else {
                    LOGGER.error("未知申请类型: {}", applyType);
                }
            } catch (Exception e) {
                LOGGER.error("处理术语 [{}] 审核逻辑失败: {}", dto.getId(), e.getMessage(), e);
            }
        }

    }

    @Override
    public List<BusinessTermDto> getByNames(List<String> chNames) {
        List<BusinessTerm> allByChNameIn = busTermRepo.findAllByChNameIn(chNames);
        return Optional.ofNullable(allByChNameIn).orElse(Arrays.asList()).stream().map(v -> BusinessTermDto.buildBy(v)).toList();
    }


    private BusinessTermChartDto nsDashboardCount() {
        Map<Long, Long> foldIdToThemeMap = foldIdToThemeId();
        Map<Long, DomainTreeNodeDto> btThemeMap = getBusinessThemeMap();
        List<BusinessTerm> businessTerms = busTermRepo.findAll();
        BusinessTermChartDto chartDto = new BusinessTermChartDto();
        Map<String, Long> countMap = new HashMap<>((int) (businessTerms.size() / 0.75) + 1);
        for (BusinessTerm bt : businessTerms) {
            Long categoryId = bt.getCategoryId();
            Long themeId = foldIdToThemeMap.get(categoryId);
            if (themeId == null) continue;

            DomainTreeNodeDto themeNode = btThemeMap.get(themeId);
            if (themeNode == null) continue;

            String themeName = themeNode.getName();
            countMap.merge(themeName, 1L, Long::sum);
        }
        for (DomainTreeNodeDto value : btThemeMap.values()) {
            if (!countMap.containsKey(value.getName())) {
                countMap.put(value.getName(), 0L);
            }
        }

        chartDto.setCountMap(countMap);
        return chartDto;
    }

    protected Map<Long, DomainTreeNodeDto> getBusinessThemeMap() {
        DomainTreeNodeDto root = domainService.loadDomainTree((DomainState) null, 0L, "admin", true);
        List<DomainTreeNodeDto> themeNodes = new ArrayList();
        if (root != null && root.getNodes() != null) {
            Iterator var3 = root.getNodes().iterator();

            while (var3.hasNext()) {
                DomainTreeNodeDto domainTreeNodeDto = (DomainTreeNodeDto) var3.next();
                if (domainTreeNodeDto.getNodes() != null) {
                    themeNodes.addAll(domainTreeNodeDto.getNodes());
                }
            }

            return (Map) themeNodes.stream().filter(domainTreeNodeDto -> domainTreeNodeDto.getParentId() == 8L).collect(Collectors.toMap(DomainTreeNodeDto::getFoldId, (i) -> {
                return i;
            }));
        } else {
            return new HashMap();
        }
    }

    protected Map<Long, Long> foldIdToThemeId() {
        Map<Long, Long> map = new HashMap();
        DomainTreeNodeDto root = domainService.loadDomainTree((DomainState) null, 0L, "admin", true);
        if (root != null && root.getNodes() != null) {
            Iterator var3 = root.getNodes().iterator();

            while (true) {
                List themeNodes;
                do {
                    if (!var3.hasNext()) {
                        return map;
                    }

                    DomainTreeNodeDto domainTreeNodeDto = (DomainTreeNodeDto) var3.next();
                    themeNodes = domainTreeNodeDto.getNodes();
                } while (themeNodes == null);

                Iterator var6 = themeNodes.iterator();

                while (var6.hasNext()) {
                    DomainTreeNodeDto themeNode = (DomainTreeNodeDto) var6.next();
                    List<Long> childFoldIdList = new ArrayList();
                    map.put(themeNode.getFoldId(), themeNode.getFoldId());
                    setChild(childFoldIdList, themeNode);
                    Iterator var9 = childFoldIdList.iterator();

                    while (var9.hasNext()) {
                        Long childFoldId = (Long) var9.next();
                        map.put(childFoldId, themeNode.getFoldId());
                    }
                }
            }
        } else {
            return map;
        }
    }

    public static void setChild(List<Long> list, DomainTreeNodeDto themeNode) {
        if (!CollectionUtils.isEmpty(themeNode.getNodes())) {
            Iterator var2 = themeNode.getNodes().iterator();

            while (var2.hasNext()) {
                DomainTreeNodeDto childNode = (DomainTreeNodeDto) var2.next();
                list.add(childNode.getFoldId());
                setChild(list, childNode);
            }
        }

    }

    private Map<String, String> getOrgNameMap(List<String> termList) {

        Set<String> orgCodeSet = new HashSet();

        for (String managementDepartment : termList) {
            if (StringUtils.isNotBlank(managementDepartment)) {
                orgCodeSet.addAll(Arrays.stream(managementDepartment.split("[,，]")).toList());
            }
        }

        return organizationService.getOrganizationsByBms(new ArrayList<>(orgCodeSet)).stream().collect(Collectors.toMap(o -> o.getBm(), o -> o.getFullName()));
    }

    public String getCellStringValue(Cell cell) {
        if (cell == null) {
            return null;
        } else {
            DataFormatter formatter = new DataFormatter(Locale.CHINESE);
            return formatter.formatCellValue(cell);
        }
    }
    //    public void createBusinessTermVersion(BusinessTerm old, String username, String message) {
//
//        BusinessTermVersion newVersion = new BusinessTermVersion(old);
//        newVersion.setState(DomainState.A);
//        businessTermVersionRepository.save(newVersion);
//
//        EditHistoryEntity history = new EditHistoryEntity();
//        history.setOperator(username);
//        history.setHistoryType(4000);
//        history.setTimestamp(new Date());
//        history.setVersion(newVersion.getVersion());
//        history.setItemId(newVersion.getNsId().toString());
//        history.setChanges(message);
//        editHistoryRepo.save(history);
//    }



    private void  rejectPubBusinessTrem(Long id,String username){

        Optional<BusinessTerm> byId = busTermRepo.findById(id);
        byId.ifPresent(o->{
            // 判断可以简单一点 ，那就是如果有发布时间 那么就认为是 废弃发布
            o.setState(DomainState.D);
            if (!org.springframework.util.ObjectUtils.isEmpty(o.getFirstPublish())){
                o.setState(DomainState.X);
            }else {
                o.setState(DomainState.D);
            }
            busTermRepo.save(o);
        });

    }
}
