package com.datablau.domain.management.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.impl.upload.standard.StandardExportFile;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainFolder;
import com.datablau.domain.management.jpa.entity.StandardCode;
import com.datablau.domain.management.jpa.entity.StandardCodeFolderRela;
import com.datablau.domain.management.jpa.repository.DomainFolderRepository;
import com.datablau.domain.management.jpa.repository.StandardCodeFolderRelaRepository;
import com.datablau.domain.management.jpa.type.DatablauDomainType;
import com.datablau.domain.management.jpa.type.DomainStateExt;
import com.datablau.domain.management.service.StandardServiceNew;
import com.datablau.domain.management.type.PermissionLevel;
import com.datablau.domain.management.utility.FileUtility;
import com.datablau.project.util.CheckNameUtil;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service("standardServiceExt")
public class StandardServiceExt extends StandardServiceImpl implements StandardServiceNew {
    private static final Logger logger = LoggerFactory.getLogger(StandardServiceExt.class);

    @Autowired
    private DomainServiceImpl domainService;
    @Autowired
    private DomainCodeGenerateServiceExt generateService;
    @Autowired
    private DomainExtServiceImpl domainExtService;
    @Autowired
    private DomainFolderExtService domainFolderExtService;
    @Autowired
    private ExcelLoader excelLoader;
    @Value("${datablau.workflow.enable:true}")
    private boolean workflowEnable;
    @Autowired
    private DomainFolderRepository domainFolderRepo;
    @Autowired
    private StandardCodeFolderRelaRepository standardCodeFolderRelaRepo;
    @Autowired
    public FileUtility fileUtility;
    public StandardExportResult exportStandardCode(StandardCodeQueryDto reqDto) throws Exception {
        StandardExportFile exportFile = (new StandardExportFile(reqDto)).addUdpAttributeToTemplate(true).exportStandardCode(true);
        return new StandardExportResult(exportFile.getCopyFile(), exportFile.getExportNumbers());
    }

    public PageResult<StandardCodeDto> generateStandardQuery(StandardCodeQueryDto reqDto, boolean isPage) {
        DomainState scrap = null;
        if (!AuthTools.hasAnyRole("STANDARD_CODE_SCRAP_VIEW", "ROLE_SUPERUSER")) {
            scrap = DomainState.X;
        }

        String baseSelect = " select c ";
        if (isPage) {
            baseSelect = "select new StandardCode(c.code, c.name, c.enName, c.datasetName, c.state, c.firstPublish, c.lastModification, c.comment, c.categoryId, c.submitter) ";

        }
        String rela_sql = " from StandardCode c " +
                "inner join StandardCodeFolderRela rela on c.code = rela.code " +
                "inner join DomainFolder f on rela.fId = f.id " +
                "left join Domain d on c.code = d.referenceCode and d.copyDomain = false"
                ;

        String data_sql = baseSelect + rela_sql;
        String count_sql = "select count(*)" + rela_sql;

        int idx = 1;
        Map<Integer, Object> parameters = new HashMap<>();

        String whereStmt = " where 1 = 1 ";
        //参考数据搜索，支持（中文名称、英文名称、描述）支持模糊搜索
        if (!Strings.isNullOrEmpty(reqDto.getName())) {
            String like = "%" + reqDto.getName() + "%";
            String key = reqDto.getName();
//            whereStmt += " and (c.code like ?" + idx + " or c.name like ?" + idx + " or c.enName like ?" + idx + ")";
            whereStmt += " and (c.code like ?" + idx;
            parameters.put(idx++, like);
            whereStmt += " or c.name = ?" + idx;
            parameters.put(idx++, key);
            whereStmt += " or c.name like ?" + idx;
            parameters.put(idx++, like);
            whereStmt += " or c.enName = ?" + idx;
            parameters.put(idx++, key);
            whereStmt += " or c.enName like ?" + idx;
            parameters.put(idx++, like);
            whereStmt += " or c.comment = ?" + idx;
            parameters.put(idx++, key);
            whereStmt += " or c.comment like ?" + idx + ")";
            parameters.put(idx++, like);
        }
        if (!Strings.isNullOrEmpty(reqDto.getDatasetName())) {
            whereStmt += " and c.datasetName = ?" + idx;
            parameters.put(idx++, reqDto.getDatasetName());
        }
        //审核中的标准和待审核的只有创建人可以看
        if ((DomainState.C.equals(reqDto.getState())
                || DomainState.D.equals(reqDto.getState()))
                && !viewAllStandard()) {
            whereStmt += " and c.submitter = ?" + idx;
            parameters.put(idx++, reqDto.getSubmitter());
        }
        //已发布和已废弃的标准所有人都可以看，审核中和待审核的标准只有创建人可以看
        if (reqDto.getState() == null) {
            if (!viewAllStandard()) {
                whereStmt += " and ((d.state = 'A' or d.state = 'X') or ((d.state = 'C' or d.state = 'D' or d.state is null) and c.submitter = ?" + idx + ")) ";
                parameters.put(idx++, reqDto.getSubmitter());
            }
        } else {
            whereStmt += " and d.state = ?" + idx;
            parameters.put(idx++, reqDto.getState());
        }
        if (scrap != null) {
            whereStmt += " and d.state != ?" + idx;
            parameters.put(idx++, scrap);
        }
        if(reqDto.getRelaDomain() == null) {
            // donothing
        } else if (reqDto.getRelaDomain()) {
            whereStmt += " and d.domainId is not null ";
        } else {
            whereStmt += " and d.domainId is null ";
        }

        if (CollectionUtils.isEmpty(reqDto.getCategoryIds())) {
            whereStmt += " and c.categoryId = ?" + idx;
            parameters.put(idx++, reqDto.getCategoryId());
        } else {
            whereStmt += " and c.categoryId in ?" + idx;
            parameters.put(idx++, reqDto.getCategoryIds());
        }
        if (reqDto.getFolderId() != null && domainFolderRepo.existsById(reqDto.getFolderId())) {
            DomainFolder domainFolder = domainFolderRepo.findById(reqDto.getFolderId()).get();
            whereStmt += " and f.path like ?" + idx;
            parameters.put(idx++, domainFolder.getPath() + "%");
        }
        // 增加标签筛选条件,标签功能依赖于DAM
        Set<String> pkIds = null;
        if (reqDto.getTagIds() != null && reqDto.getTagIds().size() > 0) {
            pkIds = tagService.getItemIdsByTypeIdsAndTagIds(Collections.singletonList(LDMTypes.oDataStandardCode), reqDto.getTagIds());
            if (pkIds.size() == 0) {
                pkIds.add("  ");
            }
            whereStmt += " and c.code in ?" + idx;
            parameters.put(idx++, pkIds);
        }
        //参考数据搜索结果排序，精确匹配和模糊匹配体现。
        String order = " order by c.createTime desc ";
        if (!Strings.isNullOrEmpty(reqDto.getName())) {
            String name = "%" + reqDto.getName().trim() + "%";
            String keyName = reqDto.getName().trim();
            order = " order by";
            order += " case when c.name = '" + keyName + "' then 1";
            order += " when c.enName = '" + keyName + "' then 1";
            order += " when c.comment = '" + keyName + "' then 1";
            order += " when c.name like '" + name + "' then 2";
            order += " when c.enName like '" + name + "' then 2";
            order += " when c.comment like '" + name + "' then 2";
            order += " else 3 end, c.name, c.enName, c.comment";
        }
        //数量sql，不加排序
        String totalSql = count_sql + whereStmt;
        String querySql = data_sql + whereStmt + order;

        Long totalCnt = 0L;
        List<StandardCode> resultList;
        EntityManager em = entityManagerFactory.createEntityManager();
        try {
            Query q = em.createQuery(querySql);
            for (int key : parameters.keySet()) {
                q.setParameter(key, parameters.get(key));
            }
            if (isPage) {
                q.setFirstResult((reqDto.getCurrentPage() - 1) * reqDto.getPageSize());
                q.setMaxResults(reqDto.getPageSize());
                resultList = q.getResultList();
                q = em.createQuery(totalSql);
                for (int key : parameters.keySet()) {
                    q.setParameter(key, parameters.get(key));
                }
                totalCnt = (Long) q.getSingleResult();
            } else {
                resultList = q.getResultList();
            }
            for (StandardCode standardCode : resultList) {
                em.detach(standardCode);
            }
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            em.close();
        }

        PageResult<StandardCodeDto> result = new PageResult<>();
        result.setCurrentPage(reqDto.getCurrentPage());
        result.setPageSize(reqDto.getPageSize());
        result.setTotalItems(totalCnt);
        List<StandardCodeDto> standardCodeDtos = convertToListStandardCodeDto(resultList);

        // 添加Domain属性
        if(!CollectionUtils.isEmpty(standardCodeDtos)) {
            result.setContentDirectly((List) this.convertStandardCodeFolderDto(standardCodeDtos, true));
        }
        return result;
    }

    public List<StandardCodeFolderDto> findCodesListWithPath(StandardCodeQueryDto queryDto) {
        List<StandardCodeDto> codesList = this.findCodesList(queryDto);
        if(CollectionUtils.isEmpty(codesList)) {
            return Arrays.asList();
        }
        return convertStandardCodeFolderDto(codesList, true);
    }

    public List<StandardCodeFolderDto> findCodesByIdsWithPath(Collection<String> ids) {
        List<StandardCodeDto> codesList = this.findCodesByIds(ids);
        if(CollectionUtils.isEmpty(codesList)) {
            return Arrays.asList();
        }
        return convertStandardCodeFolderDto(codesList, true);
    }
    private List<StandardCodeFolderDto> convertStandardCodeFolderDto(List<StandardCodeDto> codesList, boolean relaDomain) {
        Long categoryId = codesList.get(0).getCategoryId();
        Map<String, StandardCodeDto> codeMap = codesList.stream().collect(Collectors.toMap(k -> k.getCode(), v -> v));
        List<StandardCodeFolderRela> codeFolders = standardCodeFolderRelaRepo.findByCodeIn(codeMap.keySet());

        // 关联的数据标准
        List<Domain> domainsByCodes = relaDomain ? domainExtService.findDomainsByCodes(codesList.stream().map(v -> v.getCode()).collect(Collectors.toSet())) : Arrays.asList();
        Map<String, Domain> codeMapDomain = domainsByCodes.stream().filter(v -> !v.getCopyDomain()).collect(Collectors.toMap(k -> k.getReferenceCode(), Function.identity()));
        // 标准目录树
        DomainTreeNodeDto root = domainFolderExtService.loadDomainTree(null, categoryId, null, true);
        List<StandardCodeFolderDto> result = new ArrayList<>();
        for (StandardCodeDto codeDto : codesList) {
            StandardCodeFolderDto standardCodeFolderDto = StandardCodeFolderDto.buildBy(codeDto);
            Long folderId = codeFolders.stream().filter(v -> v.getCode().equals(codeDto.getCode())).findFirst()
                    .orElseThrow(() -> new AndorjRuntimeException(String.format("未找到code[%s]对应的目录", codeDto.getCode()))).getfId();
            DomainTreeNodeDto domainTreeNodeDto = DomainTreeNodeExtDto.findByFolderId(folderId, root);
            standardCodeFolderDto.setPaths(DomainTreeNodeExtDto.buildNamePathArr(domainTreeNodeDto, root));
            standardCodeFolderDto.setFolderId(folderId);
            if(relaDomain && codeMapDomain.containsKey(codeDto.getCode())) {
                String code = codeDto.getCode();
                Domain domain = codeMapDomain.get(code);
                standardCodeFolderDto.setParentDomain(domainService.convertToDomainDto(domain));
            }
            result.add(standardCodeFolderDto);
        }
        return result;
    }
    public ImportInstantJobResult importStandardCode(File uploadedFile, boolean published, boolean autoGenCode, boolean ignoreError, String user) {
        ExcelLoadJobResult<StandardCodeExcelDto> excelResult = null;
        Long categoryId = DomainService.DOMAIN_CATEGORY_ID;
        try {
            this.checkTemplate(uploadedFile);
            excelResult = this.excelLoader.loadFile(uploadedFile.getAbsolutePath(), 0, StandardCodeExcelDto.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        List<StandardCodeExcelDto> excelDatas = excelResult.getLoaded();

        // 校验
        for (StandardCodeExcelDto excelData : excelDatas) {
            excelData.check(msgService);
        }
        DomainTreeNodeDto domainTreeNodeDto = domainFolderExtService.loadDomainTree((DomainState)null, categoryId, null, true);
        for (int i = 0; i < excelDatas.size(); i++) {
            StandardCodeExcelDto standardCodeExcelDto = excelDatas.get(i);
//            if(StringUtils.isBlank(standardCodeExcelDto.getErrorMsg())) {
                DomainExtDto domainDto = standardCodeExcelDto.buildDomainDto(categoryId, msgService);
                // 设置folderId并完善Code
                domainExtService.setDomainPath(domainDto, categoryId, domainTreeNodeDto, user);
                if(StringUtils.isEmpty(domainDto.getErrorMsg())){
                    standardCodeExcelDto.setErrorMsg(StringUtils.isBlank(standardCodeExcelDto.getErrorMsg()) ? domainDto.getErrorMsg() : standardCodeExcelDto.getErrorMsg());
                }else {
                    standardCodeExcelDto.setErrorMsg(StringUtils.isBlank(standardCodeExcelDto.getErrorMsg()) ? domainDto.getErrorMsg() : standardCodeExcelDto.getErrorMsg() + ";" + domainDto.getErrorMsg());
                }
                standardCodeExcelDto.setFolderId(domainDto.getFolderId());
//            }
        }

        List<StandardCodeDto> codeDtos = new ArrayList<>();
        Map<String, String> errorMaps = new HashMap<>();
        for (StandardCodeExcelDto standardCodeExcelDto : excelDatas) {
//            if(StringUtils.isEmpty(standardCodeExcelDto.getErrorMsg())) {
                boolean res = StandardCodeExcelDto.addDtoToList(msgService, standardCodeExcelDto, (List) codeDtos, user, categoryId, published);
                //因为错误是累加的，所以res可能返回true，但是错误信息不为空，所以要判断错误信息
                if(!res || !StringUtils.isEmpty(standardCodeExcelDto.getErrorMsg())) {
                    errorMaps.put(standardCodeExcelDto.getName(), standardCodeExcelDto.getErrorMsg());
                }

//            }
        }
        // 处理名字重复错误
        if(!errorMaps.isEmpty()) {
            for (StandardCodeExcelDto excelData : excelDatas) {
                if(StringUtils.isEmpty(excelData.getErrorMsg()) && errorMaps.containsKey(excelData.getName())) {
                    excelData.setErrorMsg(StringUtils.isBlank(excelData.getErrorMsg())? errorMaps.get(excelData.getName()) : excelData.getErrorMsg() + ";" +errorMaps.get(excelData.getName()));
                }
            }
            codeDtos.removeIf(v -> errorMaps.containsKey(v.getName()));
        }

        List<StandardCodeDto> errorDto = excelDatas.stream().filter(v -> StringUtils.isNotBlank(v.getErrorMsg())).map(v -> {
            StandardCodeFolderDto standardCodeFolderDto = v.buildStandardCodeDto(msgService, user, categoryId, published);
            standardCodeFolderDto.setErrorMsg(v.getErrorMsg());
            return (StandardCodeDto) standardCodeFolderDto;
        }).collect(Collectors.toList());
        List<StandardCodeDto> insertDto = codeDtos;
        if (!insertDto.isEmpty()) {
            try {
                setStandardUdp(insertDto, uploadedFile, categoryId, null);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            for (StandardCodeDto o : insertDto) {
                if (!Strings.isNullOrEmpty(o.getErrorMsg())) {
                    errorDto.add(o);
                }
            }
            insertDto.removeIf(o -> !Strings.isNullOrEmpty(o.getErrorMsg()));
        }
        List<String> newNames = insertDto.stream()
                .filter(v -> StringUtils.isBlank(v.getCode()))
                .map(v -> v.getName())
                .distinct().collect(Collectors.toList());
        List<String> domainCodes = generateService.getBatchDomainCodes(DatablauDomainType.STANDARD_CODE, "$$$", newNames.size());
        Map<Long, String> bizCodeMap = domainFolderExtService.getBizCodeMap();
        for (int i = 0; i < insertDto.size(); i++) {
            StandardCodeDto standardCodeDto = insertDto.get(i);
            if(StringUtils.isBlank(standardCodeDto.getCode())) {
                String domainCode = domainCodes.get(newNames.indexOf(standardCodeDto.getName()));
                standardCodeDto.setCode(StringUtils.replace(domainCode, "$$$", bizCodeMap.get(standardCodeDto.getFolderId())));
            }
        }

        StandardParaDto paraDto = new StandardParaDto();
        paraDto.setErrorDto(errorDto);
        paraDto.setInsertDto(insertDto);
        paraDto.setAllDto(codeDtos);

        paraDto = domainService.addPublicCodes(paraDto, user, published, ignoreError);
        ImportInstantJobResult result = new ImportInstantJobResult();

        result.setFileId(getStandCodeProblemFile(uploadedFile, paraDto.getErrorDto(), user,  autoGenCode));

        AtomicInteger success = new AtomicInteger();
        AtomicInteger failed = new AtomicInteger();
        paraDto.getInsertDto().forEach(o -> success.addAndGet(o.getValues() == null ? 1 : o.getValues().size()));
        paraDto.getErrorDto().forEach(o -> failed.addAndGet(o.getValues() == null ? 1 : o.getValues().size()));

        if (ignoreError) {
            result.setSuccess(success.get());
            result.setFailed(failed.get());
        } else {
            int errorNum = failed.get();
            if (errorNum > 0) {
                result.setSuccess(0);
                result.setFailed(failed.get() + success.get());
            } else {
                result.setSuccess(success.get());
                result.setFailed(0);
            }
        }
        return result;
    }

    @Transactional
    public void uploadCodeTwo(File uploadedFile, boolean published, boolean autoGenCode, boolean ignoreError, String user) throws Exception {
        Long categoryId = DomainService.DOMAIN_CATEGORY_ID;
        ExcelLoadJobResult<DomainCodeQianYiDto> excelResult = this.excelLoader.loadFile(uploadedFile.getAbsolutePath(), 0, DomainCodeQianYiDto.class);
        List<DomainCodeQianYiDto> excelDatas = excelResult.getLoaded();
        DomainTreeNodeDto domainTreeNodeDto = domainFolderExtService.loadDomainTree((DomainState)null, categoryId, null, true);
        for (DomainCodeQianYiDto excelData : excelDatas) {
            DomainExtDto domainDto = excelData.buildDomainDto(categoryId, msgService);
            // 设置folderId并完善Code
            domainExtService.setDomainPath(domainDto, categoryId, domainTreeNodeDto, user);
            excelData.setFolderId(domainDto.getFolderId());
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        //先获取编码取值
        HashMap<String, List<StandardCodeValueDto>> codeValueMap = new HashMap<>();
        for (DomainCodeQianYiDto excelData : excelDatas) {
            if(CollectionUtils.isEmpty(codeValueMap.get(excelData.getCode()))){
                codeValueMap.put(excelData.getCode(), new ArrayList<>());
            }

            StandardCodeValueDto value = new StandardCodeValueDto();
            value.setName(excelData.getCodeName());
            value.setValue(excelData.getCodeV());
            value.setOrder(StringUtils.isBlank(excelData.getOrder()) ? null : Integer.valueOf(excelData.getOrder()));
            value.setParentValue(excelData.getpCodeV());
            codeValueMap.get(excelData.getCode()).add(value);
        }

        List<StandardCodeFolderRela> codeFolderDtos = new ArrayList<>();
        ArrayList<StandardCode> standardCodes = new ArrayList<>();

        for (DomainCodeQianYiDto excelData : excelDatas) {
            StandardCode code = new StandardCode();
            //目录
            StandardCodeFolderRela codeFolderRela = new StandardCodeFolderRela();
            codeFolderRela.setCode(excelData.getCode());
            codeFolderRela.setfId(excelData.getFolderId());
            codeFolderDtos.add(codeFolderRela);
            //代码编号
            code.setCode(excelData.getCode());
            //中文名称
            code.setName(excelData.getName());
            //英文名称
            code.setEnName(excelData.geteName());
            //代码状态
            code.setState(DomainState.D);
            //备注
            code.setComment(excelData.getRemark());

            //取值
            List<StandardCodeValueDto> values = codeValueMap.get(code.getCode());
            code.setValues(values);

            //创建人
            code.setSubmitter(excelData.getCreator());
            //发布时间
            Date date = sdf.parse(excelData.getPublishTime());
            code.setFirstPublish(date);
            //最后更新时间
            Date updateTume = sdf.parse(excelData.getLastUpdateTime());
            code.setLastModification(updateTume);
            standardCodes.add(code);
        }
        standardCodeFolderRelaRepo.saveAll(codeFolderDtos);
        standardCodeRepo.saveAll(standardCodes);
    }

    private void checkTemplate(File codeFile) throws Exception {
        InputStream is = new FileInputStream(codeFile);
        XSSFWorkbook workbook = new XSSFWorkbook(is);
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
            if(!"业务域".equals(col1)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, "业务域", col1));
            }
            col1 = getCellStringValue(headerRow.getCell(index++));
            while (col1.endsWith(msgService.getMessage("domain.catalog.theme"))) {
                col1 = getCellStringValue(headerRow.getCell(index++));
            }

            String col2 = col1;
            if (!msgService.getMessage("standardCode.keyword.code").equals(col2)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.code"), col2));
            }

            String col3 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.name").equals(col3)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.name"), col3));
            }

            String col4 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.eName").equals(col4)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.eName"), col4));
            }

            String col5 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.state").equals(col5)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.state"), col5));
            }

            String col6 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.remark").equals(col6)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.remark"), col6));
            }

            String col7 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.order").equals(col7)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.order"), col7));
            }

            String col8 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.codeV").equals(col8)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.codeV"), col8));
            }

            String col9 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.codeName").equals(col9)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.codeName"), col9));
            }

            String col10 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.pCodeV").equals(col10)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.pCodeV"), col10));
            }

            String col11 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.remarkOne").equals(col11)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.remarkOne"), col11));
            }

            String col12 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.remarkTwo").equals(col12)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.remarkTwo"), col12));
            }

            String col13 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.remarkThr").equals(col13)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.remarkThr"), col13));
            }
        } catch (Exception ex) {
            throw new AndorjRuntimeException(ex.getMessage(), ex);
        }
    }

    /**
     * 标准代码
     * 通过原生文件、 问题列表生成 问题文件
     * */

    public String getStandCodeProblemFile(File originFile,  List<StandardCodeDto> errorList, String userName, boolean autoGenCode ) {
        if (errorList == null || errorList.isEmpty()) {
            return null;
        }
        //是否是领域标准代码
        boolean isStand = false;
        for(StandardCodeDto o : errorList){
            if(o.getCategoryId()>1){
                isStand = true;
                break;
            }
        }
        String res = null;

        // key row number; value error msg
        Map<Integer, String> errorMap = new HashMap<>();

        Map<String, String> codeMap = new HashMap<>();
        if (!autoGenCode) {
            codeMap = errorList.stream().collect(Collectors.toMap(StandardCodeDto::getCode, o -> o.getErrorMsg() == null ? "" : o.getErrorMsg(), (errorMsg1, errorMsg2) -> errorMsg2));
        }
        Map<String, String> nameMap = errorList.stream().collect(Collectors.toMap(StandardCodeDto::getName, o -> o.getErrorMsg() == null ? "" : o.getErrorMsg(), (errorMsg1, errorMsg2) -> errorMsg2));
        Map<String, Map<String, String>> code_Map = new HashMap<>();
        Map<String, Map<String, String>> name_Map = new HashMap<>();
        for (StandardCodeDto o : errorList) {
            if (!Strings.isNullOrEmpty(o.getErrorMsg())) {
                continue;
            }
            List<StandardCodeValueDto> values = o.getValues();
            Map<String, String> valueDtoMap = values.stream().collect(Collectors.toMap(StandardCodeValueDto::getValue, t -> t.getErrorMsg() == null ? "" : t.getErrorMsg(),
                    (errorMsg1, errorMsg2) -> errorMsg2));
            if (!autoGenCode && !Strings.isNullOrEmpty(o.getCode())) {
                code_Map.put(o.getCode(), valueDtoMap);
            } else {
                name_Map.put(o.getName(), valueDtoMap);
            }
        }


        String filename = msgService.getMessage("import.errorData")+".xlsx";
        File outputFile = new File(filename);


        try (FileInputStream inputStream = new FileInputStream(originFile);
             XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {
            //sheet页校验
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new InvalidArgumentException(msgService.getMessage("templateSheetNotExist"));
            }

            // 在指定 sheet 页最前面加两列
            int codeRowIndex = 0;
            Row headerRow = sheet.getRow(0);
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                String title = getCellStringValue(headerRow.getCell(i));
                String message = msgService.getMessage("standardCode.keyword.code");
                if(message.equals(title)) {
                    codeRowIndex = i;
                }
            }
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                String msg = null;
                // 代码编号
                String code = getCellStringValue(row.getCell(codeRowIndex));
                //中文名称
                String chineseName = getCellStringValue(row.getCell(codeRowIndex + 1));
                // 编码取值
                String codeValue =null;
                if(isStand){
                    codeValue = getCellStringValue(row.getCell(codeRowIndex + 5));
                }else {
                    codeValue = getCellStringValue(row.getCell(codeRowIndex + 6));
                }

                // 正确数据跳过
                if (!codeMap.containsKey(code) && !nameMap.containsKey(chineseName)) {
                    continue;
                }
                if (!autoGenCode) {
                    msg = codeMap.get(code);
                }
                if (Strings.isNullOrEmpty(msg)) {
                    msg = nameMap.get(chineseName);
                }

                if (!Strings.isNullOrEmpty(msg)) {
                    //标准代码本身有错误，所有集合均展示该错误信息
                    errorMap.put(i, msg);
                } else {
                    // 如果标准代码本身没错误，则需要展示集合只里面的错误
                    if (!autoGenCode && code_Map.containsKey(code)) {
                        if (!Strings.isNullOrEmpty(code_Map.get(code).get(codeValue))) {
                            errorMap.put(i, code_Map.get(code).get(codeValue));
                        } else {
                            errorMap.put(i, msgService.getMessage("import.standard.otherError"));
                        }
                    } else if (name_Map.containsKey(chineseName)) {
                        if (!Strings.isNullOrEmpty(name_Map.get(chineseName).get(codeValue))) {
                            errorMap.put(i, name_Map.get(chineseName).get(codeValue));
                        } else {
                            errorMap.put(i, msgService.getMessage("import.standard.otherError"));
                        }
                    }
                }
            }

            ExcelUtil.fillingImportError(workbook,0, errorMap, false);


            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                workbook.write(fos);

            } catch (IOException e) {
                e.printStackTrace();
            }

            FileDescriptor fileDescriptor = fileUtility.uploadFile(outputFile,
                    filename, userName, false);

            res = fileDescriptor.getFileId();

        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            throw new InvalidArgumentException(e.getMessage());
        }
        return res;
    }

    public StandardCodeFolderDto getCodeByCodeNumber(String codeNumber, Long categoryId) {
        if (Strings.isNullOrEmpty(codeNumber)) {
            return null;
        }

        Optional<StandardCode> code = standardCodeRepo.findById(codeNumber);
        if (code.isPresent()) {
            if (categoryId != null) {
                //在某些系统内部调用，我们不需要传递categoryId，否则很多地方需要改
                domainService.checkCodeCategory(code.get().getCategoryId(), categoryId);
            }
            StandardCodeDto result = convertToStandCodeDto(code.get());
            changeUpdatingCodeToOldCode(Lists.newArrayList(result));

            // 映射码值状态
            String refStandardCode = result.getRefStandardCode();
            if(StringUtils.isNotEmpty(refStandardCode)){
                Optional<StandardCode> refStandard = standardCodeRepo.findById(refStandardCode);
                refStandard.ifPresent(standard -> result.setRefStandardState(standard.getState()));
            }


            StandardCodeFolderDto standardCodeFolderDto = StandardCodeFolderDto.buildBy(result);
            StandardCodeFolderRela standardCodeFolderRela = standardCodeFolderRelaRepo.findByCodeEquals(codeNumber);
            Long folderId = standardCodeFolderRela.getfId();
            DomainTreeNodeDto root = domainFolderExtService.loadDomainTree(null, categoryId, null, true);
            DomainTreeNodeDto nodeDto = DomainTreeNodeExtDto.findByFolderId(folderId, root);
            standardCodeFolderDto.setFolderId(folderId);
            standardCodeFolderDto.setPaths(DomainTreeNodeExtDto.buildNamePathArr(nodeDto, root));

            return standardCodeFolderDto;
        } else {
            throw new ItemNotFoundException(
                    msgService.getMessage("standardCodeNotFoundByNumber", codeNumber));
        }
    }

    @Transactional
    public StandardCodeDto updateCode(StandardCodeFolderDto code, String currentUser) {
        String codeId = code.getCode();
        if (Strings.isNullOrEmpty(codeId)) {
            throw new InvalidArgumentException(msgService.getMessage("standardCode.keyword.code"));
        }
        if(code.getFolderId() == null || !domainFolderRepo.existsById(code.getFolderId())) {
            throw new InvalidArgumentException(msgService.getMessage("standardCode.keyword.folderId"));
        }

        //校验1、英文名称只能是字母和空格，首字母还需要大写
        if (StringUtils.isNotEmpty(code.getEnglishName()) &&
                StringUtils.isNotEmpty(CheckNameUtil.checkEnglishNameStyle(code.getEnglishName()))) {
            throw new RuntimeException(msgService.getMessage("domainEnNameRegexCheck"));
        }
        //校验2、中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (StringUtils.isNotEmpty(code.getName()) &&
                !CheckNameUtil.checkChineseName(code.getName())) {
            throw new RuntimeException(msgService.getMessage("domainChNameRegexCheck"));
        }
        //校验4、中文名称长度不能超过15位
        if (StringUtils.isNotEmpty(code.getName()) &&
                CheckNameUtil.checkChineseNameLength(code.getName(), 15) ) {
            throw new RuntimeException(msgService.getMessage("domainChNameLengthCheck"));
        }
        StandardCodeFolderRela standardCodeFolderRela = new StandardCodeFolderRela(codeId, code.getFolderId());
        standardCodeFolderRelaRepo.save(standardCodeFolderRela);
        StandardCodeDto result = domainService.updateCode(code, currentUser);
        return result;
    }

    @Transactional
    public StandardCodeDto addCode(StandardCodeFolderDto standardCodeDto, String currentUser) {
        Long folderId = standardCodeDto.getFolderId();
        if (folderId == null || domainFolderRepo.findById(folderId).orElse(null) == null) {
            throw new InvalidArgumentException("所属目录不能为空");
        }

        //校验1、英文名称只能是字母和空格，首字母还需要大写
        if (StringUtils.isNotEmpty(standardCodeDto.getEnglishName()) &&
                StringUtils.isNotEmpty(CheckNameUtil.checkEnglishNameStyle(standardCodeDto.getEnglishName()))) {
            throw new RuntimeException(msgService.getMessage("domainEnNameRegexCheck"));
        }
        //校验2、中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (StringUtils.isNotEmpty(standardCodeDto.getName()) &&
                !CheckNameUtil.checkChineseName(standardCodeDto.getName())) {
            throw new RuntimeException(msgService.getMessage("domainChNameRegexCheck"));
        }
        //校验4、中文名称长度不能超过15位
        if (StringUtils.isNotEmpty(standardCodeDto.getName()) &&
                CheckNameUtil.checkChineseNameLength(standardCodeDto.getName(), 15) ) {
            throw new RuntimeException(msgService.getMessage("domainChNameLengthCheck"));
        }

        // 获取目录对应的bizCode，用于生成标准代码
        Long categoryId = standardCodeDto.getCategoryId();
        DomainTreeNodeDto domainTreeNodeDto = domainFolderExtService.loadDomainTree(null, categoryId, currentUser, true);
        String bizCode = DomainTreeNodeExtDto.searchBizCode(domainTreeNodeDto, folderId, categoryId);
        StandardCode code = domainService.convertToStandardCode(standardCodeDto);

        if (standardCodeDto.isAutoGenCode()) {
            String domainCode = generateService
                    .getSingleDomainCode(DatablauDomainType.STANDARD_CODE, bizCode);
            code.setCode(domainCode);
        }

        domainService.checkCodeBasicInfo(code);

        if (ObjectUtils.notEqual(standardCodeRepo.countByCodeEquals(code.getCode()), 0L)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeExists", code.getCode()));
        }

        code.setSubmitter(currentUser);
        code.setLastModification(new Date());
        code.setCreateTime(new Date());
        code.setVersion(1);

        if (standardCodeDto.getState() != null) {
            code.setState(standardCodeDto.getState());
        } else {
            code.setState(DomainState.D);
        }
        if (DomainState.A.equals(code.getState())) {
            code.setFirstPublish(new Date());
            domainService.createStandardVersion(code, currentUser, msgService.getMessage("codeBeanMarkedPublished"));
        }

        StandardCode standardCode = standardCodeRepo.save(code);
        // 保存目录与标准代码的关系
        StandardCodeFolderRela standardCodeFolderRela = new StandardCodeFolderRela();
        standardCodeFolderRela.setCode(standardCode.getCode());
        standardCodeFolderRela.setfId(folderId);
        standardCodeFolderRelaRepo.save(standardCodeFolderRela);
        return domainService.convertToStandCodeDto(standardCode);
    }

    @Override
    public StandardCodePageDto findCodesPage(StandardCodeQueryNewDto reqDto) {
        if (!Strings.isNullOrEmpty(reqDto.getSubmitter()) && reqDto.getCategoryId() != null && !this.domainCategoryPermissionService.hasPermissionToFolder(reqDto.getSubmitter(), reqDto.getCategoryId(), PermissionLevel.READ)) {
            throw new IllegalOperationException(this.msgService.getMessage("noPermissionToThisOperation"));
        } else {
            PageResult<StandardCodeDto> result = this.generateStandardQueryNew(reqDto, true);
            StandardCodePageDto standardCodePageDto = new StandardCodePageDto();
            standardCodePageDto.setPageSize(reqDto.getPageSize());
            standardCodePageDto.setCurrentPage(reqDto.getCurrentPage());
            standardCodePageDto.setData(result.getContent());
            standardCodePageDto.setTotal(result.getTotalItems());
            return standardCodePageDto;
        }
    }

    private PageResult<StandardCodeDto> generateStandardQueryNew(StandardCodeQueryNewDto reqDto, boolean isPage) {
        DomainStateExt scrap = null;
        if (!AuthTools.hasAnyRole("STANDARD_CODE_SCRAP_VIEW", "ROLE_SUPERUSER")) {
            scrap = DomainStateExt.X;
        }

        String baseSelect = " select c ";
        if (isPage) {
            baseSelect = "select new StandardCode(c.code, c.name, c.enName, c.datasetName, c.state, c.firstPublish, c.lastModification, c.comment, c.categoryId, c.submitter) ";

        }
        String rela_sql = " from StandardCode c " +
                "inner join StandardCodeFolderRela rela on c.code = rela.code " +
                "inner join DomainFolder f on rela.fId = f.id " +
                "left join Domain d on c.code = d.referenceCode and d.copyDomain = false"
                ;

        String data_sql = baseSelect + rela_sql;
        String count_sql = "select count(*)" + rela_sql;

        int idx = 1;
        Map<Integer, Object> parameters = new HashMap<>();

        String whereStmt = " where 1 = 1 ";
        //参考数据搜索，支持（中文名称、英文名称、描述）支持模糊搜索
        if (!Strings.isNullOrEmpty(reqDto.getName())) {
            String like = "%" + reqDto.getName() + "%";
            String key = reqDto.getName();
//            whereStmt += " and (c.code like ?" + idx + " or c.name like ?" + idx + " or c.enName like ?" + idx + ")";
            whereStmt += " and (c.code like ?" + idx;
            parameters.put(idx++, like);
            whereStmt += " or c.name = ?" + idx;
            parameters.put(idx++, key);
            whereStmt += " or c.name like ?" + idx;
            parameters.put(idx++, like);
            whereStmt += " or c.enName = ?" + idx;
            parameters.put(idx++, key);
            whereStmt += " or c.enName like ?" + idx;
            parameters.put(idx++, like);
            whereStmt += " or c.comment = ?" + idx;
            parameters.put(idx++, key);
            whereStmt += " or c.comment like ?" + idx + ")";
            parameters.put(idx++, like);
        }
        if (!Strings.isNullOrEmpty(reqDto.getDatasetName())) {
            whereStmt += " and c.datasetName = ?" + idx;
            parameters.put(idx++, reqDto.getDatasetName());
        }
        //审核中的标准和待审核的只有创建人可以看
        if ((DomainStateExt.C.equals(reqDto.getState())
                || DomainStateExt.D.equals(reqDto.getState()))
                && !viewAllStandard()) {
            whereStmt += " and c.submitter = ?" + idx;
            parameters.put(idx++, reqDto.getSubmitter());
        }
        //已发布和已废弃的标准所有人都可以看，审核中和待审核的标准只有创建人可以看
        if (reqDto.getState() == null) {
            if (!viewAllStandard()) {
                whereStmt += " and ((d.state = 'A' or d.state = 'X') or ((d.state = 'C' or d.state = 'D' or d.state is null) and c.submitter = ?" + idx + ")) ";
                parameters.put(idx++, reqDto.getSubmitter());
            }
        } else if (Objects.equals("N", reqDto.getState().name())) {
            //没有关联数据标准的就是无状态
            whereStmt += " and d.domainId is null ";
        }else {
            whereStmt += " and d.state = ?" + idx;
            parameters.put(idx++, reqDto.getState());
        }
        if (scrap != null) {
            whereStmt += " and d.state != ?" + idx;
            parameters.put(idx++, scrap);
        }
        if(reqDto.getRelaDomain() == null) {
            // donothing
        } else if (reqDto.getRelaDomain()) {
            whereStmt += " and d.domainId is not null ";
        } else {
            whereStmt += " and d.domainId is null ";
        }

        if (CollectionUtils.isEmpty(reqDto.getCategoryIds())) {
            whereStmt += " and c.categoryId = ?" + idx;
            parameters.put(idx++, reqDto.getCategoryId());
        } else {
            whereStmt += " and c.categoryId in ?" + idx;
            parameters.put(idx++, reqDto.getCategoryIds());
        }
        if (reqDto.getFolderId() != null && domainFolderRepo.existsById(reqDto.getFolderId())) {
            DomainFolder domainFolder = domainFolderRepo.findById(reqDto.getFolderId()).get();
            whereStmt += " and f.path like ?" + idx;
            parameters.put(idx++, domainFolder.getPath() + "%");
        }
        // 增加标签筛选条件,标签功能依赖于DAM
        Set<String> pkIds = null;
        if (reqDto.getTagIds() != null && reqDto.getTagIds().size() > 0) {
            pkIds = tagService.getItemIdsByTypeIdsAndTagIds(Collections.singletonList(LDMTypes.oDataStandardCode), reqDto.getTagIds());
            if (pkIds.size() == 0) {
                pkIds.add("  ");
            }
            whereStmt += " and c.code in ?" + idx;
            parameters.put(idx++, pkIds);
        }
        //参考数据搜索结果排序，精确匹配和模糊匹配体现。
        String order = " order by c.createTime desc ";
        if (!Strings.isNullOrEmpty(reqDto.getName())) {
            String name = "%" + reqDto.getName().trim() + "%";
            String keyName = reqDto.getName().trim();
            order = " order by";
            order += " case when c.name = '" + keyName + "' then 1";
            order += " when c.enName = '" + keyName + "' then 1";
            order += " when c.comment = '" + keyName + "' then 1";
            order += " when c.name like '" + name + "' then 2";
            order += " when c.enName like '" + name + "' then 2";
            order += " when c.comment like '" + name + "' then 2";
            order += " else 3 end, c.name, c.enName, c.comment";
        }
        //数量sql，不加排序
        String totalSql = count_sql + whereStmt;
        String querySql = data_sql + whereStmt + order;

        Long totalCnt = 0L;
        List<StandardCode> resultList;
        EntityManager em = entityManagerFactory.createEntityManager();
        try {
            Query q = em.createQuery(querySql);
            for (int key : parameters.keySet()) {
                q.setParameter(key, parameters.get(key));
            }
            if (isPage) {
                q.setFirstResult((reqDto.getCurrentPage() - 1) * reqDto.getPageSize());
                q.setMaxResults(reqDto.getPageSize());
                resultList = q.getResultList();
                q = em.createQuery(totalSql);
                for (int key : parameters.keySet()) {
                    q.setParameter(key, parameters.get(key));
                }
                totalCnt = (Long) q.getSingleResult();
            } else {
                resultList = q.getResultList();
            }
            for (StandardCode standardCode : resultList) {
                em.detach(standardCode);
            }
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            em.close();
        }

        PageResult<StandardCodeDto> result = new PageResult<>();
        result.setCurrentPage(reqDto.getCurrentPage());
        result.setPageSize(reqDto.getPageSize());
        result.setTotalItems(totalCnt);
        List<StandardCodeDto> standardCodeDtos = convertToListStandardCodeDto(resultList);

        // 添加Domain属性
        if(!CollectionUtils.isEmpty(standardCodeDtos)) {
            result.setContentDirectly((List) this.convertStandardCodeFolderDto(standardCodeDtos, true));
        }
        return result;
    }
}
