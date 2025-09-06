package com.datablau.data.asset.service.impl;

import cn.hutool.poi.excel.ExcelWriter;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.model.common.utility.FileUtility;
import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumCatalogPublicType;
import com.datablau.catalog.enums.EnumCatalogUdpDataType;
import com.datablau.catalog.enums.EnumStructureType;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.entity.CommonCatalogStructure;
import com.datablau.catalog.jpa.entity.CommonCatalogStructureDetail;
import com.datablau.catalog.jpa.entity.CommonCatalogType;
import com.datablau.catalog.jpa.entity.CommonCatalogUdpsVal;
import com.datablau.common.excel.ExcelUtil;
import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.enums.EnumAuthType;
import com.datablau.data.asset.enums.EnumMandateType;
import com.datablau.data.asset.event.CatalogEvent;
import com.datablau.data.asset.impl.DataAssetsCatalogServiceImpl;
import com.datablau.data.asset.jpa.entity.CatalogExt;
import com.datablau.data.asset.jpa.entity.DataAssets;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogAuth;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogStructureAuth;
import com.datablau.data.asset.jpa.repository.CatalogExtRepository;
import com.datablau.data.asset.jpa.repository.CommonCatalogExtRepository;
import com.datablau.data.asset.service.DataAssetsCatalogArchyService;
import com.datablau.data.asset.service.DataCatalogExcelService;
import com.datablau.data.asset.upload.DDCCatalogImportResultDto;
import com.datablau.data.asset.upload.EnumDDCCatalogImportErrorMessage;
import com.datablau.data.asset.upload.FirstCatalogImport;
import com.datablau.data.asset.upload.SecondCatalogImport;
import com.datablau.data.asset.upload.ThirdCatalogImport;
import com.datablau.data.asset.util.DatablauFileUtil;
import com.datablau.data.asset.utils.PageUtils;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.dataasset.dto.CatalogChangeRecordDto;
import com.datablau.dataasset.dto.CatalogVersionRecord;
import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.dto.DataAssetForArchySubjectDto;
import com.datablau.project.util.CheckNameUtil;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.SimpleUserDto;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.elasticsearch.common.Strings;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Future;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.datablau.catalog.dto.SubCountDto;
import org.springframework.web.multipart.MultipartFile;

import static com.datablau.data.asset.constants.CatalogExcelConstants.*;


/**
 * @author: hxs
 * @date: 2025/4/2 13:48
 */
@Service("dataAssetsCatalogServiceExted")
@Primary
public class DataAssetsCatalogArchyServiceImpl extends DataAssetsCatalogServiceImpl implements DataAssetsCatalogArchyService {

    private CommonCatalogExtRepository commonCatalogExtRepository;
    private RemoteArchyExtendService remoteArchyExtendService;
    private DataCatalogExcelService catalogExcelService;
    private CatalogExtRepository catalogExtRepository;
    private DatablauFileUtil datablauFileUtil;

    @Autowired
    public void setCommonCatalogExtRepository(CommonCatalogExtRepository commonCatalogExtRepository) {
        this.commonCatalogExtRepository = commonCatalogExtRepository;
    }

    @Autowired
    public void setRemoteArchyExtendService(RemoteArchyExtendService remoteArchyExtendService) {
        this.remoteArchyExtendService = remoteArchyExtendService;
    }

    @Autowired
    public void setDataCatalogExcelService(DataCatalogExcelService catalogExcelService) {
        this.catalogExcelService = catalogExcelService;
    }

    @Autowired
    public void setCatalogExtRepository(CatalogExtRepository catalogExtRepository) {
        this.catalogExtRepository = catalogExtRepository;
    }

    @Autowired
    public void setDatablauFileUtil(DatablauFileUtil datablauFileUtil) {
        this.datablauFileUtil = datablauFileUtil;
    }
    @Override
    @Transactional
    public synchronized CommonCatalog save(DataAssetsCatalogDto dto, String username) {
        if (dto.getLevel() > 3) {
            throw new RuntimeException("资产目录只允许新建到三级目录");
        }
        CommonCatalog catalog = new CommonCatalog();
        BeanUtils.copyProperties(dto, catalog);
        catalog.setStructureType(EnumStructureType.DATA_ASSETS);
        this.checkCatalog(catalog, true);
        catalog.setCreator(username);
        if (catalog.getStatus() == null) {
            catalog.setStatus(EnumAssetsCatalogStatus.UNPUBLISHED);
        }

        if(dto.getLevel() == 1){
//            catalog.setApprover(dto.getApprover());
            catalog.setApprover(username);
        }else {
            String[] split = dto.getCatalogPath().split("/");
            Long L1Id = Long.valueOf(split[1]);
            Optional<CommonCatalog> L1 = catalogRepository.findById(L1Id);
            catalog.setApprover(L1.get().getApprover());
        }

        catalog.setQualityProblemNum(0L);
        catalog.setPubQualityProblemNum(0L);
        catalog.setPublicType(EnumCatalogPublicType.NONE);
        CommonCatalog top = this.catalogRepository.findTopByStructureIdAndParentIdOrderByOrderDesc(dto.getStructureId(), dto.getParentId());
        catalog.setOrder(top == null ? 1L : top.getOrder() + 1L);
        catalog.setCreateTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
        catalog.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
//        CommonCodeGenerate codeGenerate = this.codeGenerateService.get(EnumCodeType.DATA_ASSETS_CATALOG, dto.getCatalogTypeId());
//        if (codeGenerate != null && codeGenerate.getAutoIncState()) {
//            catalog.setCode(this.codeGenerateService.getCurrentCode(EnumCodeType.DATA_ASSETS_CATALOG, dto.getCatalogTypeId()));
//        } else if (!StringUtils.isAllEmpty(new CharSequence[]{catalog.getCode()}) && this.codeGenerateService.checkCode(EnumCodeType.DATA_ASSETS_CATALOG, catalog.getCode(), catalog.getCatalogTypeId())) {
//            String var10002 = this.msgService.getMessage("repeatCode");
//            throw new IllegalArgumentException(var10002 + catalog.getCode());
//        }
        String code = this.codeGenerate(catalog, dto.getCode());
        catalog.setCode(code);

        this.catalogRepository.save(catalog);
        this.udpService.saveBatchValue(catalog.getId(), dto.getUdpDtos());
        this.authService.save(catalog, EnumMandateType.PERSON, EnumAuthType.MANAGER, username);
        if (catalog.getParentId() != 0L) {
            this.authService.extendParentAuth(catalog, catalog.getParentId());
        }

        this.elasticsearchService.saveCatalog(catalog);
        if (catalog.getStatus().equals(EnumAssetsCatalogStatus.PUBLISHED)) {
            CatalogVersionRecord catalogVersionRecord = new CatalogVersionRecord();
            catalogVersionRecord.setToStatus(EnumAssetsCatalogStatus.PUBLISHED.name());
            this.typeRepository.findById(catalog.getCatalogTypeId()).ifPresent((dataAssetsCatalogType) -> {
                catalogVersionRecord.setCatalogType(dataAssetsCatalogType.getName());
            });
            catalogVersionRecord.setReason(this.msgService.getMessage("createNewAssetCatalog"));
            catalogVersionRecord.setCatalogPath(catalog.getCatalogPath());
            catalogVersionRecord.setCatalogName(catalog.getName());
            this.structureRepository.findById(catalog.getStructureId()).ifPresent((s) -> {
                catalogVersionRecord.setDirectoryStructure(s.getDescription());
            });
            catalogVersionRecord.setDepartment(dto.getCatalogDept());
            catalogVersionRecord.setCatalogKeywords(catalog.getKeyword());
            catalogVersionRecord.setAbbreviation(catalog.getEnglishName());
            catalogVersionRecord.setDescribe(catalog.getComment());
            CatalogChangeRecordDto catalogChangeRecordDto = new CatalogChangeRecordDto(JsonUtils.toJSon(catalogVersionRecord), username, catalog.getId());
            this.changeRecordService.save(catalogChangeRecordDto);
        }

        DataAssetForArchySubjectDto forArchySubjectDto = new DataAssetForArchySubjectDto();
        forArchySubjectDto.setCatalogName(catalog.getName());
        forArchySubjectDto.setCode(catalog.getCode());
        forArchySubjectDto.setEnglishName(catalog.getEnglishName());
        forArchySubjectDto.setDamId(catalog.getId());
        forArchySubjectDto.setDamParentId(catalog.getParentId());
        forArchySubjectDto.setPublishState(catalog.getStatus().toString());

        if (catalog.getLevel() < 3) {
            //L1和L2 创建技术架构目录
            remoteArchyExtendService.createDataAssetForArchySubject(forArchySubjectDto, AuthTools.currentUsername());
        } else {
            //L3 创建技术架构业务对象
            remoteArchyExtendService.createataAssetForArchyObject(forArchySubjectDto, AuthTools.currentUsername());
        }

        return catalog;
    }

    @Override
    protected void checkCatalog(CommonCatalog catalog, boolean add) {
        if (catalog.getId() != null && !catalogRepository.existsById(catalog.getId())) {
            throw new IllegalOperationException(msgService.getMessage("catalogNoExist"));
        }
        if (catalog.getParentId() != 0) {
            if (!catalogRepository.existsById(catalog.getParentId())) {
                throw new IllegalOperationException(msgService.getMessage("parentNotFound"));
            }
            CommonCatalog parent = catalogRepository.findById(catalog.getParentId()).get();
            CommonCatalogType catalogType = typeRepository.findById(parent.getCatalogTypeId()).get();
            if (!catalogType.getAssetsType().contains(EnumSupportType.CATALOG.name())) {
                throw new IllegalOperationException(msgService.getMessage("catalogSpaceNotPermissions"));
            }
        }
        //中文名
        CommonCatalog byName = catalogRepository.findByStructureIdAndName(catalog.getStructureId(), catalog.getName());
        if (add && byName != null) {
            throw new IllegalOperationException("新建失败，当前中文名为【" + catalog.getName() + "】已存在！");
        }

        if (!add && byName != null && byName.getId().longValue() != catalog.getId().longValue()) {
            throw new IllegalOperationException(msgService.getMessage("nameSameWorkspace") + catalog.getName());
        }

        //英文名
        if (!Strings.isNullOrEmpty(catalog.getEnglishName())) {
            CommonCatalog byEnglishName = commonCatalogExtRepository.findByStructureIdAndEnglishName(catalog.getStructureId(), catalog.getEnglishName());
            if (add && byEnglishName != null) {
                throw new IllegalOperationException("新建失败，当前英文名为【" + catalog.getEnglishName() + "】已存在！");
            }
        }

        if (add && !StringUtils.isAllEmpty(catalog.getCode())) {
            CommonCatalog exitsCatalog = commonCatalogExtRepository.findByCode(catalog.getCode());
            if (exitsCatalog != null) {
                throw new RuntimeException("已存在编码为【" + catalog.getCode() + "】的目录");
            }
        }

        if (!add && !StringUtils.isAllEmpty(catalog.getCode())) {
            Optional<CommonCatalog> optional = catalogRepository.findByStructureTypeAndCode(catalog.getStructureType(), catalog.getCode());
            if (optional.isPresent() && catalog.getId().longValue() != optional.get().getId().longValue()) {
                throw new IllegalOperationException(msgService.getMessage("assetCatalogIsEncodedRepeatedly") + catalog.getCode());
            }
        }
    }

    @Override
    @Transactional
    public CommonCatalog update(DataAssetsCatalogDto dto) {
        synchronized (this) {
            CommonCatalog catalog = new CommonCatalog();
            BeanUtils.copyProperties(dto, catalog);
            catalog.setStructureType(EnumStructureType.DATA_ASSETS);
            checkCatalog(catalog, false);
            CommonCatalog origin = catalogRepository.findById(catalog.getId()).orElseThrow(
                    () -> new ItemNotFoundException(msgService.getMessage("catalogNotFound")));
            String oldName = origin.getName();
            dto.setName(oldName);
            BeanUtils.copyProperties(catalog, origin, getNullPropertyNames(catalog));
            origin.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
            origin.setButler(dto.getButler());

            if(origin.getLevel() == 1){
                origin.setApprover(dto.getApprover());
            }else {
                String[] split = origin.getCatalogPath().split("/");
                Long L1Id = Long.valueOf(split[1]);
                Optional<CommonCatalog> L1 = catalogRepository.findById(L1Id);
                origin.setApprover(L1.get().getApprover());
            }

            CommonCatalog save = catalogRepository.save(origin);
            udpService.saveBatchValue(catalog.getId(), dto.getUdpDtos());

            DataAssetForArchySubjectDto forArchySubjectDto = new DataAssetForArchySubjectDto();
            forArchySubjectDto.setCatalogName(save.getName());
            forArchySubjectDto.setCode(save.getCode());
            forArchySubjectDto.setEnglishName(save.getEnglishName());
            forArchySubjectDto.setDamId(save.getId());
            forArchySubjectDto.setDamParentId(save.getParentId());
            forArchySubjectDto.setPublishState(save.getStatus().toString());

            if (save.getLevel() < 3) {
                //L1和L2 创建技术架构目录
                remoteArchyExtendService.updateDataAssetForArchySubject(forArchySubjectDto);
            } else {
                //L3 创建技术架构业务对象
                remoteArchyExtendService.updateDataAssetForArchyObject(forArchySubjectDto);
            }

            //同比es 修改字段
            elasticsearchService.updateCatalog(origin, null, null);

            //同步知识图谱
            if (EnumAssetsCatalogStatus.PUBLISHED.equals(origin.getStatus())) {
                syncChildNode(origin.getId());
            }

            return origin;
        }
    }

    @Override
    @Transactional
    public void deleteByIds(Long id) {
        CommonCatalog catalog = catalogRepository.findById(id).get();
        List<CommonCatalog> subByCatalogs = catalogRepository.findSubExclude(catalog.getStructureId(), catalog.getCatalogPath() + catalog.getId() + "/");
        List<Long> subs = subByCatalogs.stream().map(CommonCatalog::getId).collect(Collectors.toList());
        subs.add(id);
        List<DataAssets> subAssets = new ArrayList<>();
        if (subs.size() > 1000) {
            List<List<Long>> parts = Lists.partition(subs, 1000);
            for (List<Long> part : parts) {
                subAssets = assetsRepository.findByCatalogIdIn(part);
                if (!subAssets.isEmpty()) {
                    break;
                }
            }
        } else {
            subAssets = assetsRepository.findByCatalogIdIn(subs);
        }
        if (!subAssets.isEmpty()) {
            throw new IllegalOperationException(msgService.getMessage("catalogContainsAssets", catalog.getName()));
        }
        subByCatalogs.add(catalog);
        for (CommonCatalog subByCatalog : subByCatalogs) {
            //删除目录
            catalogRepository.delete(subByCatalog);
            //删除本目录所有权限
            authService.deleteCatalogAuth(catalog);
            //删除目录属性值
            udpService.deleteByUdpValByCatalogId(id);
            //删除资产
            assetsRepository.deleteByCatalogId(catalog.getId());
            //删除目录上的访问数据
            visitRepository.deleteAllByCatalogId(subByCatalog.getId());

            Integer level = subByCatalog.getLevel();
            //判断L3下是否有L4，有的话不能删除。
            if (level == 3) {
                List<CommonCatalog> L4s = catalogRepository.findByParentIdAndStructureId(subByCatalog.getId(), catalog.getStructureId());
                if (!CollectionUtils.isEmpty(L4s)) {
                    throw new RuntimeException("L3级别目录【" + subByCatalog.getName() + "】下存在L4，不能被删除");
                }
            }

            //删除ddm侧技术架构
            int type = level == 3 ? 1 : 0;
            remoteArchyExtendService.deleteArchyByDataCatalog(subByCatalog.getId(), type);
        }
        //删除es资产
        publisher.publishEvent(new CatalogEvent(this, subByCatalogs.stream().map(CommonCatalog::getId).collect(Collectors.toList())));
        //删除es 目录
        elasticsearchService.deleteCatalog(id);
    }

    @Override
    @Transactional
    public CommonCatalog delete(Long id) {
        CommonCatalog catalog = catalogRepository.findById(id).orElseThrow(
                () -> new ItemNotFoundException(msgService.getMessage("catalogNotFound")));
        if (catalog.getStatus() == EnumAssetsCatalogStatus.PUBLISHED) {
            throw new IllegalOperationException(msgService.getMessage("catalogPublished"));
        }
        if (catalog.getStatus() == EnumAssetsCatalogStatus.UNDER_REVIEW) {
            throw new IllegalOperationException(msgService.getMessage("catalogAudit"));
        }
        List<CommonCatalog> subByCatalogs = catalogRepository.findSubExclude(catalog.getStructureId(), catalog.getCatalogPath() + catalog.getId() + "/");
        for (CommonCatalog sub : subByCatalogs) {
            if (sub.getStatus() == EnumAssetsCatalogStatus.PUBLISHED) {
                throw new IllegalOperationException(msgService.getMessage("subdirectoryPublished"));
            }
            if (sub.getStatus() == EnumAssetsCatalogStatus.UNDER_REVIEW) {
                throw new IllegalOperationException(msgService.getMessage("subdirectoryAudit"));
            }
        }
        List<Long> subs = subByCatalogs.stream().map(CommonCatalog::getId).collect(Collectors.toList());
        subs.add(id);
        List<DataAssets> subAssets = new ArrayList<>();
        if (subs.size() > 1000) {
            List<List<Long>> parts = Lists.partition(subs, 1000);
            for (List<Long> part : parts) {
                subAssets = assetsRepository.findByCatalogIdIn(part);
                if (!subAssets.isEmpty()) {
                    break;
                }
            }
        } else {
            subAssets = assetsRepository.findByCatalogIdIn(subs);
        }
        if (!subAssets.isEmpty()) {
            throw new IllegalOperationException(msgService.getMessage("catalogContainsAssets", catalog.getName()));
        }
        subByCatalogs.add(catalog);
        for (CommonCatalog subByCatalog : subByCatalogs) {
            //删除目录
            catalogRepository.delete(subByCatalog);
            //删除本目录所有权限
            authService.deleteCatalogAuth(catalog);
            //删除目录属性值
            udpService.deleteByUdpValByCatalogId(id);
            //删除资产
            assetsRepository.deleteByCatalogId(catalog.getId());
            //删除目录上的访问数据
            visitRepository.deleteAllByCatalogId(subByCatalog.getId());

            Integer level = subByCatalog.getLevel();
            //判断L3下是否有L4，有的话不能删除。
            if (level == 3) {
                List<CommonCatalog> L4s = catalogRepository.findByParentIdAndStructureId(subByCatalog.getId(), catalog.getStructureId());
                if (!CollectionUtils.isEmpty(L4s)) {
                    throw new RuntimeException("L3级别目录【" + subByCatalog.getName() + "】下存在L4，不能被删除");
                }
            }

            //删除ddm侧技术架构
            int type = level == 3 ? 1 : 0;
            remoteArchyExtendService.deleteArchyByDataCatalog(subByCatalog.getId(), type);
        }

        //删除es资产
        publisher.publishEvent(new CatalogEvent(this, subByCatalogs.stream().map(CommonCatalog::getId).collect(Collectors.toList())));
        //删除es 目录
        elasticsearchService.deleteCatalog(id);
        return catalog;
    }

    @Override
    public void exportCatalogTemplate(Long structureId, HttpServletResponse response) {
        ExcelWriter writer = catalogExcelService.exportCatalogTemplate();
        try {
            //设置content—type
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset:utf-8");

            //设置标题
            String exportFileName = URLEncoder.encode("数据资产目录模板.xlsx", "UTF-8");

            //Content-disposition是MIME协议的扩展，MIME协议指示MIME用户代理如何显示附加的文件。
            response.setHeader("Content-Disposition", "attachment;filename=" + exportFileName);
            ServletOutputStream outputStream = response.getOutputStream();

            //导出到浏览器
            writer.flush(outputStream, true);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public File exportCatalogNew(String username, EnumAssetsCatalogStatus status, Long structureId) throws Exception {
        Map<String, List<List<Object>>> catalogMap = this.exportCatalog0(username, status, structureId);
        ExcelWriter writer = catalogExcelService.exportCatalog(catalogMap);
//        this.doHandleExport(writer, response, "数据资产目录导出");

        String filename = FileUtility.getTempFolder() + File.separator + UUID.randomUUID().toString().replaceAll("-", "") + ".xlsx";
        FileOutputStream fileOutputStream = new FileOutputStream(filename);
        writer.flush(fileOutputStream);
        writer.close();
        fileOutputStream.close();
        return new File(filename);
    }


    private Map<String, List<List<Object>>> exportCatalog0(String username, EnumAssetsCatalogStatus status, Long structureId) {
        Map<String, List<List<Object>>> catalogMap = new LinkedHashMap<>();

        //业务域
        List<List<Object>> l1Datas = new ArrayList<>();
        List<CommonCatalog> l1Catalogs = catalogRepository.findByStructureIdAndLevel(structureId, 1);
        for (CommonCatalog l1Catalog : l1Catalogs) {
            List<Object> l1Data = new ArrayList<>();
            //业务域编码
            l1Data.add(l1Catalog.getCode());
            //业务域中文名
            l1Data.add(l1Catalog.getName());
            //业务域英文名
            l1Data.add(l1Catalog.getEnglishName());
            //业务域描述
            l1Data.add(l1Catalog.getComment());
//            //审批人
//            l1Data.add(l1Catalog.getApprover());
            //udp里的数据主官
            List<CatalogUdpEntryDto> udps = udpService.getObjectUdpByCatalogId(l1Catalog.getCatalogTypeId(), l1Catalog.getId());
            for (CatalogUdpEntryDto udp : udps) {
                if ("数据主官".equals(udp.getName())) {
                    l1Data.add(udp.getValue());
                }
            }
            l1Datas.add(l1Data);
        }

        //主体域
        Map<Long, CommonCatalog> l1CatalogMap = l1Catalogs.stream().collect(Collectors.toMap(CommonCatalog::getId, a -> a));
        List<List<Object>> l2Datas = new ArrayList<>();
        HashMap<Long, CommonCatalog> l2ExistCatalogMap = new HashMap<>();
        List<CommonCatalog> l2Catalogs = catalogRepository.findByStructureIdAndLevel(structureId, 2);
        for (CommonCatalog l2Catalog : l2Catalogs) {
            CommonCatalog parentL1 = l1CatalogMap.get(l2Catalog.getParentId());
            if (parentL1 == null) {
                continue;
            }
            List<Object> l2Data = new ArrayList<>();
            //业务域编码
            l2Data.add(parentL1.getCode());
            //业务域中文名
            l2Data.add(parentL1.getName());
            //主题域编码
            l2Data.add(l2Catalog.getCode());
            //主体域中文名
            l2Data.add(l2Catalog.getName());
            //主题域英文名
            l2Data.add(l2Catalog.getEnglishName());
            //主体域定义
            l2Data.add(l2Catalog.getComment());
            //udp里的数据主官
            List<CatalogUdpEntryDto> udps = udpService.getObjectUdpByCatalogId(l2Catalog.getCatalogTypeId(), l2Catalog.getId());
            for (CatalogUdpEntryDto udp : udps) {
                if ("数据主官".equals(udp.getName())) {
                    l2Data.add(udp.getValue());
                }
            }
            l2Datas.add(l2Data);
            l2ExistCatalogMap.put(l2Catalog.getId(), l2Catalog);
        }

        //业务对象
        List<List<Object>> l3Datas = new ArrayList<>();
        List<CommonCatalog> l3Catalogs = catalogRepository.findByStructureIdAndLevel(structureId, 3);
        for (CommonCatalog l3Catalog : l3Catalogs) {
            CommonCatalog l2Catalog = l2ExistCatalogMap.get(l3Catalog.getParentId());
            if (l2Catalog == null) {
                continue;
            }
            CommonCatalog l1Catalog = l1CatalogMap.get(l2Catalog.getParentId());
            List<Object> l3Data = new ArrayList<>();
            //业务域编码
            l3Data.add(l1Catalog.getCode());
            //业务域中文名
            l3Data.add(l1Catalog.getName());
            //主体域编码
            l3Data.add(l2Catalog.getCode());
            //主体域中文名
            l3Data.add(l2Catalog.getName());
            //业务对象编码
            l3Data.add(l3Catalog.getCode());
            //业务对象中文名
            l3Data.add(l3Catalog.getName());
            //业务对象英文名
            l3Data.add(l3Catalog.getEnglishName());
            //业务对象定义
            l3Data.add(l3Catalog.getComment());
            //数据管家
            l3Data.add(l3Catalog.getButler());
            //udp里的数据主官
            List<CatalogUdpEntryDto> udps = udpService.getObjectUdpByCatalogId(l3Catalog.getCatalogTypeId(), l3Catalog.getId());
            for (CatalogUdpEntryDto udp : udps) {
                if ("数据主官".equals(udp.getName())) {
                    l3Data.add(udp.getValue());
                }
            }
            l3Datas.add(l3Data);
        }

        catalogMap.put("业务域", l1Datas);
        catalogMap.put("主题域", l2Datas);
        catalogMap.put("业务对象", l3Datas);

        return catalogMap;
    }

    /**
     * 只用作数据迁移，不提供正常功能
     */
    @Override
    public void uploadCatalogTwo(Map<String, List<Object>> sheets, DDCCatalogImportResultDto result, Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception {
        String businessDomain = "业务域", subjectDomain = "主题域", businessObject = "业务对象";
        //业务域sheet页
        List<Object> businessDomainSheet = sheets.get(businessDomain);
        List<Object> subjectDomainSheet = sheets.get(subjectDomain);
        List<Object> businessObjectSheet = sheets.get(businessObject);
        //业务域
        this.uploadBusinessDomainCatalogTwo(businessDomainSheet, result, structureId, username, status);
        //主题域
        this.uploadSubjectDomainCatalogTwo(subjectDomainSheet, result, structureId, username, status);
        //业务对象
        this.uploadBusinessObjectCatalogTwo(businessObjectSheet, result, structureId, username, status);
    }

    private void uploadBusinessDomainCatalogTwo(List<Object> businessDomainSheet, DDCCatalogImportResultDto result,
                                             Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception {
        ArrayList<CatalogExcelDto> catalogExcelDtos = new ArrayList<>();
        for (Object data : businessDomainSheet) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            CatalogExcelDto excelDto = new CatalogExcelDto();
            excelDto.setCode(excelData.get(BusDomain_Code));
            excelDto.setChineseName(excelData.get(BusDomain_ChineseName));
            excelDto.setEnglishName(excelData.get(BusDomain_EnglishName));
            excelDto.setDefinition(excelData.get(BusDomain_Definition));
//            excelDto.setApprover(excelData.get(APPROVER));
            excelDto.setApprover(username);
            excelDto.setDataMaster(excelData.get(DataMaster));
            excelDto.setRowNum(String.valueOf(excelData.get("rowNum")));
            catalogExcelDtos.add(excelDto);
        }

        CommonCatalogStructure structure = structureRepository.findById(structureId).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 1);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        //已经导入的编码记录
//        Set<String> catalogCode = new HashSet<>();
        //保存已经生成的编码
//        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        ArrayList<DataAssetsCatalogDto> dataAssetsCatalogs = new ArrayList<>();
        for (CatalogExcelDto excelDto : catalogExcelDtos) {
//            ArrayList<String> errorMsgs = new ArrayList<>();
            //判断审批人是否存在
            String approver = excelDto.getApprover();
            List<SimpleUserDto> users = userService.getUsersByUsernames(List.of(approver));
            if (CollectionUtils.isEmpty(users)) {
                throw new RuntimeException("导入业务域第：" + excelDto.getRowNum() + "行，审批人【" + approver + "】不存在");
//                errorMsgs.add("导入业务域第：" + excelDto.getRowNum() + "行，审批人【" + approver + "】不存在");
            }

            //设置目录路径
            String catalogPath = "0/";
            List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 1);
            for (DataAssetsCatalogUdpDto udpDto : udpDtoList) {
                if (udpDto.getPropName().equals(DataMaster)) {
                    udpDto.setValue(excelDto.getDataMaster());
                }
            }
//            CommonCatalog byCode = commonCatalogExtRepository.findByCode(excelDto.getCode());
            DataAssetsCatalogDto catalogDto = new DataAssetsCatalogDto();
            //如果编码存在更新
//            if (byCode != null) {
//                BeanUtils.copyProperties(byCode, catalogDto);
//                catalogDto.setName(excelDto.getChineseName());
//                catalogDto.setEnglishName(excelDto.getEnglishName());
//                catalogDto.setComment(excelDto.getDefinition());
//                catalogDto.setApprover(excelDto.getApprover());
//                catalogDto.setUdpDtos(udpDtoList);
//            } else {
                //判断数据库里中文名重复
                CommonCatalog byName = commonCatalogExtRepository.findByName(excelDto.getChineseName());
                if (byName != null) {
                    throw new RuntimeException("导入业务域第：" + excelDto.getRowNum() + "行，业务域中文名【" + byName.getName() + "】系统中已存在");
//                    errorMsgs.add("导入业务域第：" + excelDto.getRowNum() + "行，业务域中文名【" + byName.getName() + "】系统中已存在");
                }
                //判断数据库里英文名重复
                CommonCatalog byEnglishName = commonCatalogExtRepository.findByEnglishName(excelDto.getEnglishName());
                if (byEnglishName != null) {
                    throw new RuntimeException("导入业务域第：" + excelDto.getRowNum() + "行，业务域英文名【" + byEnglishName.getEnglishName() + "】系统中已存在");
//                    errorMsgs.add("导入业务域第：" + excelDto.getRowNum() + "行，业务域英文名【" + byEnglishName.getEnglishName() + "】系统中已存在");
                }

//                if (!CollectionUtils.isEmpty(errorMsgs)) {
//                    result.getErrorMsg().addAll(errorMsgs);
//                    continue;
//                }

                catalogDto.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                catalogDto.setName(excelDto.getChineseName());
                catalogDto.setEnglishName(excelDto.getEnglishName());
                catalogDto.setLevel(1);
                catalogDto.setStructureId(structure.getId());
                catalogDto.setParentId(0L);
                catalogDto.setComment(excelDto.getDefinition());
                catalogDto.setCatalogPath(catalogPath);
                catalogDto.setUdpDtos(udpDtoList);
                catalogDto.setStatus(status);
                catalogDto.setApprover(excelDto.getApprover());
                //设置目录编号
//                catalogDto.setCode(getUploadCatalogCodeByLevel(excelDto.getCode(),
//                        catalogDto, catalogCode, uploaCcodeParentIdMap));
                catalogDto.setCode(excelDto.getCode());
//            }
            if(catalogDto.getStatus() != EnumAssetsCatalogStatus.PUBLISHED){
                result.addSuccess();
                dataAssetsCatalogs.add(catalogDto);
            }
        }
        this.saveCatalogListTwo(dataAssetsCatalogs, username);
    }

    private void uploadSubjectDomainCatalogTwo(List<Object> subjectDomainSheet, DDCCatalogImportResultDto result,
                                            Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception {
        ArrayList<CatalogExcelDto> catalogExcelDtos = new ArrayList<>();
        for (Object data : subjectDomainSheet) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            CatalogExcelDto excelDto = new CatalogExcelDto();
            excelDto.setBusCode(excelData.get(BusDomain_Code));
            excelDto.setBusChineseName(excelData.get(BusDomain_ChineseName));
            excelDto.setCode(excelData.get(SubDomain_Code));
            excelDto.setChineseName(excelData.get(SubDomain_ChineseName));
            excelDto.setEnglishName(excelData.get(SubDomain_EnglishName));
            excelDto.setDefinition(excelData.get(SubDomain_Definition));
            excelDto.setDataMaster(excelData.get(DataMaster));
            excelDto.setRowNum(String.valueOf(excelData.get("rowNum")));
            catalogExcelDtos.add(excelDto);
        }

        CommonCatalogStructure structure = structureRepository.findById(structureId).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 2);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        //已经导入的编码记录
//        Set<String> catalogCode = new HashSet<>();
        //保存已经生成的编码
//        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        ArrayList<DataAssetsCatalogDto> dataAssetsCatalogs = new ArrayList<>();
        for (CatalogExcelDto excelDto : catalogExcelDtos) {
//            ArrayList<String> errorMsgs = new ArrayList<>();

            List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 2);
            for (DataAssetsCatalogUdpDto udpDto : udpDtoList) {
                if (udpDto.getPropName().equals(DataMaster)) {
                    udpDto.setValue(excelDto.getDataMaster());
                }
            }

//            CommonCatalog byCode = commonCatalogExtRepository.findByCode(excelDto.getCode());
            DataAssetsCatalogDto catalogDto = new DataAssetsCatalogDto();
            //如果编码存在更新
//            if (byCode != null) {
//                BeanUtils.copyProperties(byCode, catalogDto);
//                catalogDto.setName(excelDto.getChineseName());
//                catalogDto.setEnglishName(excelDto.getEnglishName());
//                catalogDto.setComment(excelDto.getDefinition());
//                catalogDto.setUdpDtos(udpDtoList);
//
//                String[] split = catalogDto.getCatalogPath().split("/");
//                Long L1Id = Long.valueOf(split[1]);
//                Optional<CommonCatalog> L1 = catalogRepository.findById(L1Id);
//                catalogDto.setApprover(L1.get().getApprover());
//            }else {
                //判断数据库里中文名重复
                CommonCatalog byName = commonCatalogExtRepository.findByName(excelDto.getChineseName());
                if (byName != null) {
                    throw new RuntimeException("导入主题域第：" + excelDto.getRowNum() + "行，主题域中文名【" + byName.getName() + "】系统中已存在");
//                    errorMsgs.add("导入主题域第：" + excelDto.getRowNum() + "行，主题域中文名【" + byName.getName() + "】系统中已存在");
                }
                //判断数据库里英文名重复
                CommonCatalog byEnglishName = commonCatalogExtRepository.findByEnglishName(excelDto.getEnglishName());
                if (byEnglishName != null) {
                    throw new RuntimeException("导入主题域第：" + excelDto.getRowNum() + "行，主题域英文名【" + byEnglishName.getEnglishName() + "】系统中已存在");
//                    errorMsgs.add("导入主题域第：" + excelDto.getRowNum() + "行，主题域英文名【" + byEnglishName.getEnglishName() + "】系统中已存在");
                }

//                if (!CollectionUtils.isEmpty(errorMsgs)) {
//                    result.getErrorMsg().addAll(errorMsgs);
//                    continue;
//                }

                CommonCatalog parentL1Catalog = commonCatalogExtRepository.findByNameAndLevel(excelDto.getBusChineseName(), 1);
                if(parentL1Catalog != null){
                    catalogDto.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                    catalogDto.setName(excelDto.getChineseName());
                    catalogDto.setEnglishName(excelDto.getEnglishName());
                    catalogDto.setLevel(2);
                    catalogDto.setStructureId(structure.getId());
                    catalogDto.setComment(excelDto.getDefinition());
                    catalogDto.setParentId(parentL1Catalog.getId());
                    catalogDto.setUdpDtos(udpDtoList);
                    catalogDto.setStatus(status);
                    catalogDto.setApprover(AuthTools.currentUsername());
                    String catalogPath = parentL1Catalog.getCatalogPath() + parentL1Catalog.getId() + "/";
                    catalogDto.setCatalogPath(catalogPath);
                    //设置目录编号
                    catalogDto.setCode(excelDto.getCode());
//                    catalogDto.setCode(getUploadCatalogCodeByLevel(excelDto.getCode(),
//                            catalogDto, catalogCode, uploaCcodeParentIdMap));

                    //审批人
                    catalogDto.setApprover(parentL1Catalog.getApprover());
                }else {
//                    result.getErrorMsg().add("导入主题域【" + catalogDto.getName() + "】对应父级业务域【" + excelDto.getBusChineseName() + "】不存在");
//                    continue;
                    throw new RuntimeException("导入主题域【" + catalogDto.getName() + "】对应父级业务域【" + excelDto.getBusChineseName() + "】不存在");
                }
//            }
//            result.getErrorMsg().addAll(errorMsgs);
            if(catalogDto.getStatus() != EnumAssetsCatalogStatus.PUBLISHED){
                result.addSuccess();
                dataAssetsCatalogs.add(catalogDto);
            }
        }
        this.saveCatalogListTwo(dataAssetsCatalogs, username);
    }

    private void uploadBusinessObjectCatalogTwo(List<Object> businessObjectSheet, DDCCatalogImportResultDto result,
                                                Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception{
        ArrayList<CatalogExcelDto> catalogExcelDtos = new ArrayList<>();
        for (Object data : businessObjectSheet) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            CatalogExcelDto excelDto = new CatalogExcelDto();
            excelDto.setBusCode(excelData.get(BusDomain_Code));
            excelDto.setBusChineseName(excelData.get(BusDomain_ChineseName));
            excelDto.setSubCode(excelData.get(SubDomain_Code));
            excelDto.setSubChineseName(excelData.get(SubDomain_ChineseName));
            excelDto.setCode(excelData.get(BusObject_Code));
            excelDto.setChineseName(excelData.get(BusObject_ChineseName));
            excelDto.setEnglishName(excelData.get(BusObject_EnglishName));
            excelDto.setDefinition(excelData.get(BusObject_Definition));
            excelDto.setDataMaster(excelData.get(DataMaster));
            excelDto.setDataSteward(excelData.get(DataSteward));
            catalogExcelDtos.add(excelDto);
        }

        CommonCatalogStructure structure = structureRepository.findById(structureId).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 3);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        //已经导入的编码记录
//        Set<String> catalogCode = new HashSet<>();
        //保存已经生成的编码
//        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        ArrayList<DataAssetsCatalogDto> dataAssetsCatalogs = new ArrayList<>();
        for (CatalogExcelDto excelDto : catalogExcelDtos) {
//            ArrayList<String> errorMsgs = new ArrayList<>();
            List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 3);
            for (DataAssetsCatalogUdpDto udpDto : udpDtoList) {
                if (udpDto.getPropName().equals(DataMaster)) {
                    udpDto.setValue(excelDto.getDataMaster());
                }
            }

//            CommonCatalog byCode = commonCatalogExtRepository.findByCode(excelDto.getCode());
            DataAssetsCatalogDto catalogDto = new DataAssetsCatalogDto();
            //如果编码存在更新
//            if (byCode != null) {
//                BeanUtils.copyProperties(byCode, catalogDto);
//                catalogDto.setName(excelDto.getChineseName());
//                catalogDto.setEnglishName(excelDto.getEnglishName());
//                catalogDto.setComment(excelDto.getDefinition());
//                catalogDto.setUdpDtos(udpDtoList);
//
//                String[] split = catalogDto.getCatalogPath().split("/");
//                Long L1Id = Long.valueOf(split[1]);
//                Optional<CommonCatalog> L1 = catalogRepository.findById(L1Id);
//                catalogDto.setApprover(L1.get().getApprover());
//            }else {
                //判断数据库里中文名重复
                CommonCatalog byName = commonCatalogExtRepository.findByName(excelDto.getChineseName());
                if (byName != null) {
//                    errorMsgs.add("导入业务对象第：" + excelDto.getRowNum() + "行，业务对象中文名【" + byName.getName() + "】系统中已存在");
                    throw new RuntimeException("导入业务对象第：" + excelDto.getRowNum() + "行，业务对象中文名【" + byName.getName() + "】系统中已存在");
                }
                //判断数据库里英文名重复
                CommonCatalog byEnglishName = commonCatalogExtRepository.findByEnglishName(excelDto.getEnglishName());
                if (byEnglishName != null) {
//                    errorMsgs.add("导入业务对象第：" + excelDto.getRowNum() + "行，业务对象英文名【" + byEnglishName.getEnglishName() + "】系统中已存在");
                    throw new RuntimeException("导入业务对象第：" + excelDto.getRowNum() + "行，业务对象英文名【" + byEnglishName.getEnglishName() + "】系统中已存在");
                }

//                if (!CollectionUtils.isEmpty(errorMsgs)) {
//                    result.getErrorMsg().addAll(errorMsgs);
//                    continue;
//                }
                CommonCatalog parentL2Catalog = commonCatalogExtRepository.findByNameAndLevel(excelDto.getSubChineseName(), 2);
                if(parentL2Catalog != null){
                    catalogDto.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                    catalogDto.setName(excelDto.getChineseName());
                    catalogDto.setEnglishName(excelDto.getEnglishName());
                    catalogDto.setLevel(3);
                    catalogDto.setStructureId(structure.getId());
                    catalogDto.setComment(excelDto.getDefinition());
                    catalogDto.setParentId(parentL2Catalog.getId());
                    catalogDto.setUdpDtos(udpDtoList);
                    catalogDto.setStatus(status);
                    catalogDto.setApprover(AuthTools.currentUsername());
                    String catalogPath = parentL2Catalog.getCatalogPath() + parentL2Catalog.getId() + "/";
                    catalogDto.setCatalogPath(catalogPath);
                    //设置目录编号
                    catalogDto.setCode(excelDto.getCode());
//                    catalogDto.setCode(getUploadCatalogCodeByLevel(excelDto.getCode(),
//                            catalogDto, catalogCode, uploaCcodeParentIdMap));

                    //审批人
                    catalogDto.setApprover(parentL2Catalog.getApprover());
                }else {
                    throw new RuntimeException("导入业务对象【" + catalogDto.getName() + "】对应父级主题域【" + excelDto.getSubChineseName() + "】不存在");
//                    result.getErrorMsg().add("导入业务对象【" + catalogDto.getName() + "】对应父级主题域【" + excelDto.getSubChineseName() + "】不存在");
                }
//            }
//            result.getErrorMsg().addAll(errorMsgs);
            if(catalogDto.getStatus() != EnumAssetsCatalogStatus.PUBLISHED){
                result.addSuccess();
                dataAssetsCatalogs.add(catalogDto);
            }
        }
        this.saveCatalogListTwo(dataAssetsCatalogs, username);
    }


    @Transactional
    public void saveCatalogListTwo(List<DataAssetsCatalogDto> dtoList, String username) {

        if (CollectionUtils.isEmpty(dtoList)) {
            return;
        }
        long saveTime = System.currentTimeMillis();

        Map<CommonCatalog, DataAssetsCatalogDto> catalogMap = new HashMap<>();
        List<CommonCatalog> catalogList = new ArrayList<>();
        Map<String, Long> orderMap = new HashMap<>();

        for (DataAssetsCatalogDto dto : dtoList) {
            if (null == dto) {
                continue;
            }
            //更新
            if(dto.getId() != null){
//                this.update(dto);
                continue;
            }

            CommonCatalog catalog = new CommonCatalog();
            BeanUtils.copyProperties(dto, catalog);
            String orderKey = catalog.getStructureId() + "-" + catalog.getParentId();
            Long order = orderMap.getOrDefault(orderKey, null);
            if (null == order) {
                CommonCatalog lastCatalog = catalogRepository.findTopByStructureIdAndParentIdOrderByOrderDesc(catalog.getStructureId()
                        , catalog.getParentId());
                order = null == lastCatalog ? 0L : lastCatalog.getOrder();
            }
            catalog.setStructureType(EnumStructureType.DATA_ASSETS);
//            checkCatalog(catalog, true);
            catalog.setCreator(username);
            if (catalog.getStatus() == null) {
                catalog.setStatus(EnumAssetsCatalogStatus.UNPUBLISHED); //默认未发布状态
            }
            catalog.setQualityProblemNum(0L);
            catalog.setPublicType(EnumCatalogPublicType.NONE);
            catalog.setCreateTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
            catalog.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
            if (catalog.getOrder() == null || catalog.getOrder() == 0L) {
                catalog.setOrder(++order);
            }
            orderMap.put(orderKey, order);
            catalogList.add(catalog);
            catalogMap.put(catalog, dto);
        }
        catalogList = catalogRepository.saveAll(catalogList);
        for (CommonCatalog catalog : catalogList) {
            DataAssetForArchySubjectDto forArchySubjectDto = new DataAssetForArchySubjectDto();
            forArchySubjectDto.setCatalogName(catalog.getName());
            forArchySubjectDto.setCode(catalog.getCode());
            forArchySubjectDto.setEnglishName(catalog.getEnglishName());
            forArchySubjectDto.setDamId(catalog.getId());
            forArchySubjectDto.setDamParentId(catalog.getParentId());
            forArchySubjectDto.setPublishState(catalog.getStatus().toString());
            if (catalog.getLevel() < 3) {
                //L1和L2 创建技术架构目录
                remoteArchyExtendService.createDataAssetForArchySubject(forArchySubjectDto, AuthTools.currentUsername());
            } else if (catalog.getLevel() == 3) {
                //L3 创建技术架构业务对象
                remoteArchyExtendService.createataAssetForArchyObject(forArchySubjectDto, AuthTools.currentUsername());
            } else {
                throw new RuntimeException("层数不能大于3层目录");
            }
        }
        long saveBasicTime = System.currentTimeMillis();
        LOGGER.debug("saveBasicTime " + dtoList.size() + " catalog cost time: " + (saveBasicTime - saveTime));
        //保存udp
        saveBatchValueList(catalogList, catalogMap);
        long saveBatchValueTime = System.currentTimeMillis();
        LOGGER.debug("saveBatchValueTime " + dtoList.size() + " catalog cost time: " + (saveBatchValueTime - saveBasicTime));

        authService.saveManagerList(catalogList, username);
        //保存权限
        long saveManagerTime = System.currentTimeMillis();
        LOGGER.debug("saveManagerTime " + dtoList.size() + " catalog cost time: " + (saveManagerTime - saveBatchValueTime));

        //父权限
        for (CommonCatalog catalog : catalogList) {
            if (catalog.getParentId() != 0L) {
                authService.extendParentAuth(catalog, catalog.getParentId());
            }
        }
        long saveExtendParentAuthTime = System.currentTimeMillis();
        LOGGER.debug("saveExtendParentAuthTime " + dtoList.size() + " catalog cost time: " + (saveExtendParentAuthTime - saveManagerTime));
//        saveCatalogtoES(catalogList, username, catalogMap);
    }

    @Override
    public DDCCatalogImportResultExtDto uploadCatalog0(MultipartFile multipartFile, Map<String, List<Object>> sheets, DDCCatalogImportResultExtDto result,
                                                       Long structureId, String username, EnumAssetsCatalogStatus status) {
        String businessDomain = "业务域", subjectDomain = "主题域", businessObject = "业务对象";
        //业务域sheet页
        List<Object> businessDomainSheet = sheets.get(businessDomain);
        List<Object> subjectDomainSheet = sheets.get(subjectDomain);
        List<Object> businessObjectSheet = sheets.get(businessObject);
        //先判断必填
        this.checkNull(businessDomainSheet, businessDomain, result,
                List.of(BusDomain_Code, BusDomain_ChineseName, BusDomain_EnglishName, BusDomain_Definition, /*APPROVER,*/ DataMaster));
        this.checkNull(subjectDomainSheet, subjectDomain, result,
                List.of(BusDomain_ChineseName, SubDomain_ChineseName, SubDomain_EnglishName, SubDomain_Definition, DataMaster));
        this.checkNull(businessObjectSheet, businessObject, result,
                List.of(BusDomain_ChineseName, SubDomain_ChineseName, BusObject_ChineseName, BusObject_EnglishName,
                        BusObject_Definition, DataMaster, DataSteward));

        //判断同一个excel中中文名和英文名唯一、判断数据库里中文名重复、判断数据库里英文名重复
        //业务域判断审批人是否存在、导入主题域名称对应父级业务域名称不存在、导入业务对象名称对应父级主题域名称不存在
        this.checkChineseAndEnglishName(businessDomainSheet, businessDomain, BusDomain_ChineseName, BusDomain_EnglishName, result, BusDomain_Code, username, new HashSet<>());
        Set<String> parentBusChineseNames = businessDomainSheet.stream()
                .map(data -> (HashMap<String, String>) data)
                .map(map -> map.get(BusDomain_ChineseName))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        this.checkChineseAndEnglishName(subjectDomainSheet, subjectDomain, SubDomain_ChineseName, SubDomain_EnglishName, result, SubDomain_Code, "", parentBusChineseNames);
        Set<String> parentSubChineseNames = businessDomainSheet.stream()
                .map(data -> (HashMap<String, String>) data)
                .map(map -> map.get(SubDomain_ChineseName))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        this.checkChineseAndEnglishName(businessObjectSheet, businessObject, BusObject_ChineseName, BusObject_EnglishName, result, BusObject_Code, "", parentSubChineseNames);

        if (result.getDdcCatalogErrorMap() != null && !result.getDdcCatalogErrorMap().isEmpty()) {
            //保存检查出的错误文件
            try {
                result.setSuccess(0L);
                result.setFailed((long) result.getDdcCatalogErrorMap().size());
                result.setFileId(getProblemFile(multipartFile, result.getDdcCatalogErrorMap(), username));
            } catch (Exception e) {
                throw new RuntimeException("保存错误文件失败，", e);
            }
            return result;
        }

        try {
            this.uploadBusinessDomainCatalog(businessDomainSheet, result, structureId, username, status);
            this.uploadSubjectDomainCatalog(subjectDomainSheet, result, structureId, username, status);
            this.uploadBusinessObjectCatalog(businessObjectSheet, result, structureId, username, status);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return result;
    }

    public String getProblemFile(MultipartFile multipartFile, Map<String, DDCCatalogErrorDto> ddcCatalogErrorMap, String userName) throws Exception {
        if (ddcCatalogErrorMap == null || ddcCatalogErrorMap.isEmpty()) {
            return null;
        }

        String res = "";
        // 使用独立的输入流，避免影响原始multipartFile
        try (InputStream inputStream = multipartFile.getInputStream()) {
            File originFile = DatablauFileUtil.uploadFile(inputStream, multipartFile.getOriginalFilename());

            Map<Integer, String> busErrorMap = new HashMap<>();
            Map<Integer, String> subErrorMap = new HashMap<>();
            Map<Integer, String> objErrorMap = new HashMap<>();

            for (String key : ddcCatalogErrorMap.keySet()) {
                if (key.startsWith("业务域")) {
                    busErrorMap.put(Integer.parseInt(key.split("-")[1]), ddcCatalogErrorMap.get(key).getErrorMsg());
                } else if (key.startsWith("主题域")) {
                    subErrorMap.put(Integer.parseInt(key.split("-")[1]), ddcCatalogErrorMap.get(key).getErrorMsg());
                } else if (key.startsWith("业务对象")) {
                    objErrorMap.put(Integer.parseInt(key.split("-")[1]), ddcCatalogErrorMap.get(key).getErrorMsg());
                }
            }

            String filename = "资产目录导入错误数据清单.xlsx";
            File outputFile = new File(filename);

            try (FileInputStream fileInputStream = new FileInputStream(originFile);
                 XSSFWorkbook workbook = new XSSFWorkbook(fileInputStream)) {

                //业务域sheet页
                if (busErrorMap.size() > 0) {
                    Sheet sheet = workbook.getSheetAt(0);
                    if (sheet == null) {
                        throw new InvalidArgumentException("模板不正确: 业务域sheet页不存在");
                    }
                    com.datablau.data.common.util.ExcelUtil.fillingImportError(workbook, 0, busErrorMap, false);
                }
                //主题域sheet页
                if (subErrorMap.size() > 0) {
                    Sheet sheet = workbook.getSheetAt(1);
                    if (sheet == null) {
                        throw new InvalidArgumentException("模板不正确: 主题域sheet页不存在");
                    }
                    com.datablau.data.common.util.ExcelUtil.fillingImportError(workbook, 1, subErrorMap, false);
                }
                //业务对象sheet页
                if (objErrorMap.size() > 0) {
                    Sheet sheet = workbook.getSheetAt(2);
                    if (sheet == null) {
                        throw new InvalidArgumentException("模板不正确: 业务对象sheet页不存在");
                    }
                    com.datablau.data.common.util.ExcelUtil.fillingImportError(workbook, 2, objErrorMap, false);
                }

                try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                    workbook.write(fos);
                } catch (IOException e) {
                    e.printStackTrace();
                }

                FileDescriptor fileDescriptor = datablauFileUtil.uploadFileToRemote(outputFile,
                        filename, userName, false);

                res = fileDescriptor.getFileId();

            } catch (Exception e) {
                throw new InvalidArgumentException(e.getMessage());
            } finally {
                // 清理临时文件
                if (originFile != null && originFile.exists()) {
                    originFile.delete();
                }
                if (outputFile != null && outputFile.exists()) {
                    outputFile.delete();
                }
            }
        }
        return res;
    }

    private void uploadBusinessObjectCatalog(List<Object> businessObjectSheet, DDCCatalogImportResultDto result, Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception{
        ArrayList<CatalogExcelDto> catalogExcelDtos = new ArrayList<>();
        for (Object data : businessObjectSheet) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            CatalogExcelDto excelDto = new CatalogExcelDto();
            excelDto.setBusCode(excelData.get(BusDomain_Code));
            excelDto.setBusChineseName(excelData.get(BusDomain_ChineseName));
            excelDto.setSubCode(excelData.get(SubDomain_Code));
            excelDto.setSubChineseName(excelData.get(SubDomain_ChineseName));
            excelDto.setCode(excelData.get(BusObject_Code));
            excelDto.setChineseName(excelData.get(BusObject_ChineseName));
            excelDto.setEnglishName(excelData.get(BusObject_EnglishName));
            excelDto.setDefinition(excelData.get(BusObject_Definition));
            excelDto.setDataMaster(excelData.get(DataMaster));
            excelDto.setDataSteward(excelData.get(DataSteward));
            catalogExcelDtos.add(excelDto);
        }

        CommonCatalogStructure structure = structureRepository.findById(structureId).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 3);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        //已经导入的编码记录
        Set<String> catalogCode = new HashSet<>();
        //保存已经生成的编码
        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        ArrayList<DataAssetsCatalogDto> dataAssetsCatalogs = new ArrayList<>();
        for (CatalogExcelDto excelDto : catalogExcelDtos) {
            List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 3);
            for (DataAssetsCatalogUdpDto udpDto : udpDtoList) {
                if (udpDto.getPropName().equals(DataMaster)) {
                    udpDto.setValue(excelDto.getDataMaster());
                }
            }

            CommonCatalog byCode = commonCatalogExtRepository.findByCode(excelDto.getCode());
            DataAssetsCatalogDto catalogDto = new DataAssetsCatalogDto();
            //如果编码存在更新
            if (byCode != null) {
                BeanUtils.copyProperties(byCode, catalogDto);
                catalogDto.setName(excelDto.getChineseName());
                catalogDto.setEnglishName(excelDto.getEnglishName());
                catalogDto.setComment(excelDto.getDefinition());
                catalogDto.setUdpDtos(udpDtoList);

                String[] split = catalogDto.getCatalogPath().split("/");
                Long L1Id = Long.valueOf(split[1]);
                Optional<CommonCatalog> L1 = catalogRepository.findById(L1Id);
                catalogDto.setApprover(L1.get().getApprover());
            }else {
                CommonCatalog parentL2Catalog = commonCatalogExtRepository.findByNameAndLevel(excelDto.getSubChineseName(), 2);
                if(parentL2Catalog != null){
                    catalogDto.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                    catalogDto.setName(excelDto.getChineseName());
                    catalogDto.setEnglishName(excelDto.getEnglishName());
                    catalogDto.setLevel(3);
                    catalogDto.setStructureId(structure.getId());
                    catalogDto.setComment(excelDto.getDefinition());
                    catalogDto.setParentId(parentL2Catalog.getId());
                    catalogDto.setUdpDtos(udpDtoList);
                    catalogDto.setStatus(status);
                    catalogDto.setApprover(AuthTools.currentUsername());
                    String catalogPath = parentL2Catalog.getCatalogPath() + parentL2Catalog.getId() + "/";
                    catalogDto.setCatalogPath(catalogPath);
                    //设置目录编号
                    catalogDto.setCode(getUploadCatalogCodeByLevel(excelDto.getCode(),
                            catalogDto, catalogCode, uploaCcodeParentIdMap));

                    //审批人
                    catalogDto.setApprover(parentL2Catalog.getApprover());
                }
            }
//            result.getErrorMsg().addAll(errorMsgs);
            if(catalogDto.getStatus() != EnumAssetsCatalogStatus.PUBLISHED){
                result.addSuccess();
                dataAssetsCatalogs.add(catalogDto);
            }
        }
        this.saveCatalogList(dataAssetsCatalogs, username);
    }

    private void uploadSubjectDomainCatalog(List<Object> subjectDomainSheet, DDCCatalogImportResultDto result,
                                            Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception {
        ArrayList<CatalogExcelDto> catalogExcelDtos = new ArrayList<>();
        for (Object data : subjectDomainSheet) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            CatalogExcelDto excelDto = new CatalogExcelDto();
            excelDto.setBusCode(excelData.get(BusDomain_Code));
            excelDto.setBusChineseName(excelData.get(BusDomain_ChineseName));
            excelDto.setCode(excelData.get(SubDomain_Code));
            excelDto.setChineseName(excelData.get(SubDomain_ChineseName));
            excelDto.setEnglishName(excelData.get(SubDomain_EnglishName));
            excelDto.setDefinition(excelData.get(SubDomain_Definition));
            excelDto.setDataMaster(excelData.get(DataMaster));
            excelDto.setRowNum(String.valueOf(excelData.get("rowNum")));
            catalogExcelDtos.add(excelDto);
        }

        CommonCatalogStructure structure = structureRepository.findById(structureId).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 2);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        //已经导入的编码记录
        Set<String> catalogCode = new HashSet<>();
        //保存已经生成的编码
        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        ArrayList<DataAssetsCatalogDto> dataAssetsCatalogs = new ArrayList<>();
        for (CatalogExcelDto excelDto : catalogExcelDtos) {

            List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 2);
            for (DataAssetsCatalogUdpDto udpDto : udpDtoList) {
                if (udpDto.getPropName().equals(DataMaster)) {
                    udpDto.setValue(excelDto.getDataMaster());
                }
            }

            CommonCatalog byCode = commonCatalogExtRepository.findByCode(excelDto.getCode());
            DataAssetsCatalogDto catalogDto = new DataAssetsCatalogDto();
            //如果编码存在更新
            if (byCode != null) {
                BeanUtils.copyProperties(byCode, catalogDto);
                catalogDto.setName(excelDto.getChineseName());
                catalogDto.setEnglishName(excelDto.getEnglishName());
                catalogDto.setComment(excelDto.getDefinition());
                catalogDto.setUdpDtos(udpDtoList);

                String[] split = catalogDto.getCatalogPath().split("/");
                Long L1Id = Long.valueOf(split[1]);
                Optional<CommonCatalog> L1 = catalogRepository.findById(L1Id);
                catalogDto.setApprover(L1.get().getApprover());
            }else {

                CommonCatalog parentL1Catalog = commonCatalogExtRepository.findByNameAndLevel(excelDto.getBusChineseName(), 1);
                if(parentL1Catalog != null){
                    catalogDto.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                    catalogDto.setName(excelDto.getChineseName());
                    catalogDto.setEnglishName(excelDto.getEnglishName());
                    catalogDto.setLevel(2);
                    catalogDto.setStructureId(structure.getId());
                    catalogDto.setComment(excelDto.getDefinition());
                    catalogDto.setParentId(parentL1Catalog.getId());
                    catalogDto.setUdpDtos(udpDtoList);
                    catalogDto.setStatus(status);
                    catalogDto.setApprover(AuthTools.currentUsername());
                    String catalogPath = parentL1Catalog.getCatalogPath() + parentL1Catalog.getId() + "/";
                    catalogDto.setCatalogPath(catalogPath);
                    //设置目录编号
                    catalogDto.setCode(getUploadCatalogCodeByLevel(excelDto.getCode(),
                            catalogDto, catalogCode, uploaCcodeParentIdMap));

                    //审批人
                    catalogDto.setApprover(parentL1Catalog.getApprover());
                }
            }
//            result.getErrorMsg().addAll(errorMsgs);
            if(catalogDto.getStatus() != EnumAssetsCatalogStatus.PUBLISHED){
                result.addSuccess();
                dataAssetsCatalogs.add(catalogDto);
            }
        }
        this.saveCatalogList(dataAssetsCatalogs, username);
    }

    private void uploadBusinessDomainCatalog(List<Object> businessDomainSheet, DDCCatalogImportResultDto result,
                                             Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception {
        ArrayList<CatalogExcelDto> catalogExcelDtos = new ArrayList<>();
        for (Object data : businessDomainSheet) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            CatalogExcelDto excelDto = new CatalogExcelDto();
            excelDto.setCode(excelData.get(BusDomain_Code));
            excelDto.setChineseName(excelData.get(BusDomain_ChineseName));
            excelDto.setEnglishName(excelData.get(BusDomain_EnglishName));
            excelDto.setDefinition(excelData.get(BusDomain_Definition));
//            excelDto.setApprover(excelData.get(APPROVER));
            excelDto.setApprover(username);
            excelDto.setDataMaster(excelData.get(DataMaster));
            excelDto.setRowNum(String.valueOf(excelData.get("rowNum")));
            catalogExcelDtos.add(excelDto);
        }

        CommonCatalogStructure structure = structureRepository.findById(structureId).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 1);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        //已经导入的编码记录
        Set<String> catalogCode = new HashSet<>();
        //保存已经生成的编码
        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        ArrayList<DataAssetsCatalogDto> dataAssetsCatalogs = new ArrayList<>();
        for (CatalogExcelDto excelDto : catalogExcelDtos) {

            //设置目录路径
            String catalogPath = "0/";
            List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 1);
            for (DataAssetsCatalogUdpDto udpDto : udpDtoList) {
                if (udpDto.getPropName().equals(DataMaster)) {
                    udpDto.setValue(excelDto.getDataMaster());
                }
            }
            CommonCatalog byCode = commonCatalogExtRepository.findByCode(excelDto.getCode());
            DataAssetsCatalogDto catalogDto = new DataAssetsCatalogDto();
            //如果编码存在更新
            if (byCode != null) {
                BeanUtils.copyProperties(byCode, catalogDto);
                catalogDto.setName(excelDto.getChineseName());
                catalogDto.setEnglishName(excelDto.getEnglishName());
                catalogDto.setComment(excelDto.getDefinition());
                catalogDto.setApprover(excelDto.getApprover());
                catalogDto.setUdpDtos(udpDtoList);
            } else {
                catalogDto.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                catalogDto.setName(excelDto.getChineseName());
                catalogDto.setEnglishName(excelDto.getEnglishName());
                catalogDto.setLevel(1);
                catalogDto.setStructureId(structure.getId());
                catalogDto.setParentId(0L);
                catalogDto.setComment(excelDto.getDefinition());
                catalogDto.setCatalogPath(catalogPath);
                catalogDto.setUdpDtos(udpDtoList);
                catalogDto.setStatus(status);
                catalogDto.setApprover(excelDto.getApprover());
                //设置目录编号
                catalogDto.setCode(getUploadCatalogCodeByLevel(excelDto.getCode(),
                        catalogDto, catalogCode, uploaCcodeParentIdMap));
            }
//            result.getErrorMsg().addAll(errorMsgs);
            if(catalogDto.getStatus() != EnumAssetsCatalogStatus.PUBLISHED){
                result.addSuccess();
                dataAssetsCatalogs.add(catalogDto);
            }
        }
        this.saveCatalogList(dataAssetsCatalogs, username);
    }

    private void checkChineseAndEnglishName(List<Object> datas, String sheet,
                                            String chineseNameKey, String englishNameKey, DDCCatalogImportResultExtDto result, String codeKey,
                                            String username, Set<String> parentChineseNames) {
        HashSet<String> chineseNameSet = new HashSet<>();
        HashSet<String> englishNameSet = new HashSet<>();
        //数据库中所有的code
        Set<String> dbCodeSet = new HashSet<>();
        //数据库中所有的中文名称
        Set<String> dbChineseNameSet = new HashSet<>();
        //数据库中所有的英文名称
        Set<String> dbEnglishNameSet = new HashSet<>();
        //数据库中所有的业务域的中文名称
        Set<String> dbBusChineseNameSet = new HashSet<>();
        //数据库中所有的主题域的中文名称
        Set<String> dbSubChineseNameSet = new HashSet<>();

        List<CommonCatalog> commonCatalogList = commonCatalogExtRepository.findAll();
        for (CommonCatalog commonCatalog : commonCatalogList) {
            dbCodeSet.add(commonCatalog.getCode());
            dbChineseNameSet.add(commonCatalog.getName());
            dbEnglishNameSet.add(commonCatalog.getEnglishName());
            if (commonCatalog.getLevel() == 1) {
                dbBusChineseNameSet.add(commonCatalog.getName());
            } else if (commonCatalog.getLevel() == 2) {
                dbSubChineseNameSet.add(commonCatalog.getName());
            }
        }
        boolean isExistApprover = true;
        if ("业务域".equals(sheet) && !Strings.isNullOrEmpty(username)) {
            //判断审批人是否存在
            List<SimpleUserDto> users = userService.getUsersByUsernames(List.of(username));
            if (CollectionUtils.isEmpty(users)) {
                isExistApprover = false;
            }
        }
        for (Object data : datas) {
            HashMap<String, String> d = (HashMap<String, String>) data;
            String rowNum = String.valueOf((Integer.valueOf(String.valueOf(d.get("rowNum")))-1));
            String code = d.get(codeKey);
            if(!Strings.isNullOrEmpty(code)){
                if(dbCodeSet.contains(code)){
                    //传的编码库里存在，走更新逻辑不校验
                    continue;
                } else {
                    //判断数据库里中文名重复
                    if (dbChineseNameSet.contains(d.get(chineseNameKey))) {
                        DDCCatalogErrorDto ddcCatalogErrorDto
                                = new DDCCatalogErrorDto(sheet, rowNum, "中文名【" + d.get(chineseNameKey) + "】系统中已存在", data);
                        result.addDdcCatalogError(ddcCatalogErrorDto);
                    }
                    //判断数据库里英文名重复
                    if (dbEnglishNameSet.contains(d.get(englishNameKey))) {
                        DDCCatalogErrorDto ddcCatalogErrorDto
                                = new DDCCatalogErrorDto(sheet, rowNum, "英文名【" + d.get(englishNameKey) + "】系统中已存在", data);
                        result.addDdcCatalogError(ddcCatalogErrorDto);
                    }
                }
            }

            String chineseName = d.get(chineseNameKey);
            if (chineseNameSet.contains(chineseName)) {
                DDCCatalogErrorDto ddcCatalogErrorDto
                        = new DDCCatalogErrorDto(sheet, rowNum, chineseNameKey + "有重复，重复值为" + chineseName, data);
                result.addDdcCatalogError(ddcCatalogErrorDto);
            } else {
                chineseNameSet.add(chineseName);
            }

            //中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
            if (!CheckNameUtil.checkChineseName(chineseName)) {
                DDCCatalogErrorDto ddcCatalogErrorDto
                        = new DDCCatalogErrorDto(sheet, rowNum,  chineseNameKey + " 格式错误原因：【" + msgService.getMessage("catalogChNameRegexCheck") + "】", data);
                result.addDdcCatalogError(ddcCatalogErrorDto);
            }


            //中文名称长度不能超过15位
            if (CheckNameUtil.checkChineseNameLength(chineseName, 15)) {
                DDCCatalogErrorDto ddcCatalogErrorDto
                        = new DDCCatalogErrorDto(sheet, rowNum,  chineseNameKey + " 格式错误原因：【" + msgService.getMessage("catalogChNameLengthCheck") + "】", data);
                result.addDdcCatalogError(ddcCatalogErrorDto);
            }
            String englishName = d.get(englishNameKey);
            if (englishNameSet.contains(englishName)) {
                DDCCatalogErrorDto ddcCatalogErrorDto
                        = new DDCCatalogErrorDto(sheet, rowNum,  englishNameKey + "有重复，重复值为" + englishName, data);
                result.addDdcCatalogError(ddcCatalogErrorDto);
            } else {
                String englishNameStyle = CheckNameUtil.checkEnglishNameStyle(englishName);
                if(!Strings.isNullOrEmpty(englishNameStyle)){
                    DDCCatalogErrorDto ddcCatalogErrorDto
                            = new DDCCatalogErrorDto(sheet, rowNum,  englishNameKey + " 格式错误原因：【" + englishNameStyle + "】", data);
                    result.addDdcCatalogError(ddcCatalogErrorDto);
                }
                englishNameSet.add(englishName);
            }
            //判断审批人是否存在
            if ("业务域".equals(sheet) && !isExistApprover) {
                DDCCatalogErrorDto ddcCatalogErrorDto
                        = new DDCCatalogErrorDto(sheet, rowNum,  "审批人【" + username + "】不存在", data);
                result.addDdcCatalogError(ddcCatalogErrorDto);
            }

            //导入主题域名称对应父级业务域名称不存在。需添加在本次导入中是否存在的逻辑
            if ("主题域".equals(sheet)) {
                if (!dbBusChineseNameSet.contains(d.get(BusDomain_ChineseName)) && !parentChineseNames.contains(d.get(BusDomain_ChineseName))) {
                    DDCCatalogErrorDto ddcCatalogErrorDto
                            = new DDCCatalogErrorDto(sheet, rowNum,  "导入主题域【" + chineseName + "】对应父级业务域【" + d.get(BusDomain_ChineseName) + "】不存在", data);
                    result.addDdcCatalogError(ddcCatalogErrorDto);
                }
            }

            //导入业务对象名称对应父级主题域名称不存在。需添加在本次导入中是否存在的逻辑
            if ("业务对象".equals(sheet)) {
                if (!dbSubChineseNameSet.contains(d.get(SubDomain_ChineseName)) && !parentChineseNames.contains(d.get(SubDomain_ChineseName))) {
                    DDCCatalogErrorDto ddcCatalogErrorDto
                            = new DDCCatalogErrorDto(sheet, rowNum,  "导入业务对象【" + chineseName + "】对应父级主题域【" + d.get(SubDomain_ChineseName) + "】不存在", data);
                    result.addDdcCatalogError(ddcCatalogErrorDto);
                }
            }
        }
    }

    private void checkNull(List<Object> datas, String sheet, DDCCatalogImportResultExtDto importResult, List<String> headers) {
        for (Object data : datas) {
            HashMap<String, String> d = (HashMap<String, String>) data;
            for (String header : headers) {
                String value = d.get(header);
                if (Strings.isNullOrEmpty(value)) {
                    DDCCatalogErrorDto ddcCatalogErrorDto
                            = new DDCCatalogErrorDto(sheet, String.valueOf((Integer.valueOf(String.valueOf(d.get("rowNum")))-1)), "【" + header + "】为空", data);
                    importResult.addDdcCatalogError(ddcCatalogErrorDto);
                }
            }
        }
    }


    @Override
    public CatalogPropertyDto getCatalogPropery(Long catalogId, String currentUser) {
        CommonCatalog catalog = catalogRepository.findById(catalogId).orElseThrow(
                () -> new ItemNotFoundException(msgService.getMessage("catalogNotFound")));
        CatalogPropertyExtDto result = new CatalogPropertyExtDto();
        result.setCatalogId(catalogId);
        //获取统计信息
        result.setCatalogStatisticsDto(assembleCatalogStatisticsDto(catalog, currentUser));
//        result.setCatalogOrgDto(assembleCatalogOrgDto(catalog));
        result.setAssetCatalogPropertyDto(assembleAssetCatalogPropertyDto(catalog));
        result.setCatalogSysPropertyDto(assembleCatalogSysPropertyDto(catalog));
        result.setExtendsProperties(udpService.getCatalogUdps(catalog.getCatalogTypeId(), catalogId));

        CatalogExt catalogExt = catalogExtRepository.findByCatalogId(catalog.getId());
        if(catalogExt != null){
            result.setDomainId(catalogExt.getDomainId());
            Boolean sNull = catalogExt.getsNull();
            if(sNull != null){
                if(sNull){
                    result.setIsNull("是");
                }else {
                    result.setIsNull("否");
                }
            }
            result.setSourceSystemId(catalogExt.getSourceSystem());
            result.setDomainVer(catalogExt.getDomainVer());
        }
        return result;
    }

    @Override
    public DDCCatalogImportResultDto uploadCatalog(List<Object> imports, String key, DDCCatalogImportResultDto result, EnumAssetsCatalogStatus status, Long structureId, String username) {

        List<Object> firstCatalogImportList = new ArrayList<>();
        List<Object> secondCatalogImportList = new ArrayList<>();
        List<Object> thirdCatalogImportList = new ArrayList<>();
//        List<Object> fourthCatalogImportList = new ArrayList<>();
//        List<Object> fifthCatalogImportList = new ArrayList<>();

        if (msgService.getMessage("firstCatalog").equals(key)) {
            firstCatalogImportList.addAll(imports);
        } else if (msgService.getMessage("secondCatalog").equals(key)) {
            secondCatalogImportList.addAll(imports);
        } else if (msgService.getMessage("thirdCatalog").equals(key)) {
            thirdCatalogImportList.addAll(imports);
        } else if (msgService.getMessage("fourthCatalog").equals(key)) {
//            fourthCatalogImportList.addAll(imports);
        } else if (msgService.getMessage("fifthCatalog").equals(key)) {
//            fifthCatalogImportList.addAll(imports);
        }

        List<Long> cacheId = new ArrayList<>();
        uploadFirstCatalog(firstCatalogImportList, result, status, structureId, username, cacheId);
        uploadSecondCatalog(secondCatalogImportList, result, status, structureId, username, cacheId);
        uploadThirdCatalog(thirdCatalogImportList, result, status, structureId, username, cacheId);
        //只允许新建到L3
//        uploadFourthCatalog(fourthCatalogImportList, result, status, structureId, username, cacheId);
//        uploadFifthCatalog(fifthCatalogImportList, result, status, structureId, username, cacheId);

        return result;
    }

    protected void uploadFirstCatalog(List<Object> imports, DDCCatalogImportResultDto result, EnumAssetsCatalogStatus status, Long structureId, String username, List<Long> cacheId) {
        List<FirstCatalogImport> firstCatalogImports = null;
        long startTime = System.currentTimeMillis();
        LOGGER.info("start upload at: " + startTime);

        if (imports.size() > 0 && !ExcelUtil.checkTemplate(FirstCatalogImport.class, imports)) {
            result.getErrorMsg().add(msgService.getMessage("importFirstCatalogError"));
            return;
        }

        try {
            firstCatalogImports = ExcelUtil.getBeanList(imports, FirstCatalogImport.class);
            if (CollectionUtils.isEmpty(firstCatalogImports)) {
                return;
            }
        } catch (Exception e) {
            result.getErrorMsg().add(msgService.getMessage("importFirstCatalogError"));
            LOGGER.error("upload catalog error!", e);
        }

        //列号与值对应
        Map<Integer, Map<String, Object>> udpMap = new HashMap<>();
        for (int i = 0; i < imports.size(); i++) {
            Map<String, Object> importMap = (Map<String, Object>) imports.get(i);
            udpMap.put((Integer) importMap.get("rowNum"), importMap);
        }

        //初始化数据
        //获取当前导入的所有目录名称
        Set<String> nameSet = firstCatalogImports.stream().map(FirstCatalogImport::getFirstCatalogName).collect(Collectors.toSet());
        //回滚目录名称列表
        Set<String> rollbackNameSet = new HashSet<>();
        //获取导入需要的空间
        Set<String> structureNameSet = firstCatalogImports.stream().map(FirstCatalogImport::getStructureType).collect(Collectors.toSet());
        List<CommonCatalogStructure> structureList = structureRepository.findByNamesAndStructureType(structureNameSet, EnumStructureType.DATA_ASSETS);
        Map<String, CommonCatalogStructure> structureMap = structureList.stream().collect(Collectors.toMap(CommonCatalogStructure::getName, Function.identity()));
        //获取所需的空间管理员
        Set<Long> structureIdSet = structureList.stream().map(CommonCatalogStructure::getId).collect(Collectors.toSet());
        List<DataAssetsCatalogStructureAuth> structureAuthList = structureAuthRepository.findUserByStructureIds(structureIdSet);
        Map<Long, List<DataAssetsCatalogStructureAuth>> structureIdAuthMap = structureAuthList.stream().collect(Collectors.groupingBy(DataAssetsCatalogStructureAuth::getStructureId));
        //获取所需空间的所有一级目录
        List<CommonCatalog> firstCatalogList = catalogRepository.findAllByStructureIdInAndLevel(structureIdSet, 1);
        Map<String, CommonCatalog> catalogNameMap = new HashMap<>();
        firstCatalogList.forEach(catalog -> {
            catalogNameMap.put(catalog.getStructureId() + "-1-" + catalog.getName(), catalog);
        });
        //获取审批人
        Set<String> approverSet = firstCatalogImports.stream().map(FirstCatalogImport::getApprover).collect(Collectors.toSet());
        //获取数据管家
        for (FirstCatalogImport catalogImport : firstCatalogImports) {
            approverSet.add(catalogImport.getButler());
        }
        List<SimpleUserDto> users = userService.getUsersByUsernames(approverSet);
        Map<String, SimpleUserDto> approverMap = users.stream().collect(Collectors.toMap(SimpleUserDto::getUsername, Function.identity()));
        //当前上传用户
        String user = innerCurrentUserName();
        //获取部门
        List<String> orgCodeSet = firstCatalogImports.stream().map(FirstCatalogImport::getCatalogDept).collect(Collectors.toList());
        List<OrganizationDto> organizationsByBms = organizationService.getOrganizationsByBms(orgCodeSet);
        Map<String, OrganizationDto> orgMap = organizationsByBms.stream().collect(Collectors.toMap(OrganizationDto::getBm, Function.identity()));
        //获取目录类型
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(structureIdSet, 1);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        //已经导入的编码记录
        Set<String> catalogCode = new HashSet<>();
        //设置分页批处理
        int pageNum = 1;
        List<FirstCatalogImport> pageList = PageUtils.startPage(firstCatalogImports, pageNum, pageSize);

        while (pageList.size() > 0) {
            List<Future<DataAssetsCatalogDto>> futureList = new ArrayList<>();
            for (FirstCatalogImport catalogImport : pageList) {
                Future<DataAssetsCatalogDto> submit = submit(() -> {
                    DataAssetsCatalogDto dataAssetsCatalog = new DataAssetsCatalogDto();
                    String catalogName = catalogImport.getFirstCatalogName();
                    try {

                        if (catalogImport.isBlank()) {
                            throw new RuntimeException("import item is null, skip.");
                        }
                        result.addSuccess();
                        //校验名称
                        if (StringUtils.isBlank(catalogName)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CATALOG_NAME_IS_NULL));
                        }
                        //校验长度
                        if (catalogName.length() > 30) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CATALOG_NAME_LENGTH_EXCEEDS_LIMIT));
                        }
                        if (isContainsSpecialCharacters(catalogName)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CONTAINS_SPECIAL_CHARACTERS));
                        }
                        //校验空间
                        CommonCatalogStructure structure = structureMap.get(catalogImport.getStructureType());
                        if (structure == null || structure.getId() == null || !structure.getId().equals(structureId)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_NOT_EXIST));
                        }
                        if (!structure.isOpenStatus()) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_NOT_PUBLISH));
                        }
                        //校验管理员权限
                        List<DataAssetsCatalogStructureAuth> dataAssetsCatalogStructureAuths = structureIdAuthMap.get(structure.getId());
                        List<String> managers = dataAssetsCatalogStructureAuths.stream()
                                .map(DataAssetsCatalogStructureAuth::getUser).collect(Collectors.toList());
                        if (!managers.contains(user)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.NO_STRUCTURE_AUTH));
                        }
                        //设置目录路径
                        String catalogPath = "0/";
                        //校验审批人
                        if (StringUtils.isBlank(catalogImport.getApprover())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.APPROVER_NOT_EXIST));
                        }
                        if (approverMap.get(catalogImport.getApprover()) == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.APPROVER_NOT_EXIST));
                        }
                        //校验数据管家
                        if (!approverMap.containsKey(catalogImport.getButler())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DATA_MANAGER_NOT_EXIST));
                        }
                        //校验组织机构
                        if (StringUtils.isBlank(catalogImport.getCatalogDept())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DEPT_NOT_EXIST));
                        }
                        OrganizationDto organization = orgMap.getOrDefault(catalogImport.getCatalogDept(), null);
                        if (organization == null || organization.getId() == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DEPT_NOT_EXIST));
                        }

                        //设置扩展属性
                        List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 1);
                        Map<String, Object> objectMap = udpMap.get(catalogImport.getRowNum());
                        for (String key : objectMap.keySet()) {
                            if (key.contains(msgService.getMessage("fileImport.extendedPropertiesRequired"))
                                    || key.contains(msgService.getMessage("fileImport.extendedPropertiesNotRequired"))) {
                                String value = (String) objectMap.get(key);
                                key = key.substring(key.indexOf(":") + 1);
                                for (DataAssetsCatalogUdpDto dataAssetsCatalogUdpDto : udpDtoList) {
                                    if (dataAssetsCatalogUdpDto.getPropName().equals(key)) {
                                        dataAssetsCatalogUdpDto.setValue(value);
                                    }
                                }
                            }
                        }
                        for (DataAssetsCatalogUdpDto dataAssetsCatalogUdpDto : udpDtoList) {
                            //判断用户必填的拓展属性是否为 空
                            if (dataAssetsCatalogUdpDto.getRequired() && StringUtils.isBlank(dataAssetsCatalogUdpDto.getValue())) {
                                throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.REQUIRED_UDP_NOT_EXIST));
                            }
                            //第一次判断用户所填枚举类型是否正确
                            if (dataAssetsCatalogUdpDto.getType().equals(EnumCatalogUdpDataType.ENUM) &&
                                    !dataAssetsCatalogUdpDto.getTypeDataList().contains(dataAssetsCatalogUdpDto.getValue())) {
                                //第二次判断用户填错的信息是否为 必填 或者 非必填不为空
                                if (dataAssetsCatalogUdpDto.getRequired() ||
                                        (!dataAssetsCatalogUdpDto.getRequired() && StringUtils.isNotBlank(dataAssetsCatalogUdpDto.getValue()))) {
                                    throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.UDP_ERROR));
                                }
                            }
                            //第一次判断用户所填数值类型是否正确
                            if (dataAssetsCatalogUdpDto.getType().equals(EnumCatalogUdpDataType.NUM) &&
                                    !isNumeric(dataAssetsCatalogUdpDto.getValue())) {
                                //第二次判断用户填错的信息是否为 必填 或者 非必填不为空
                                if (dataAssetsCatalogUdpDto.getRequired() ||
                                        (!dataAssetsCatalogUdpDto.getRequired() && StringUtils.isNotBlank(dataAssetsCatalogUdpDto.getValue()))) {
                                    throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.UDP_ERROR));
                                }
                            }
                        }
                        //校验重名
                        String nameKey = structure.getId() + "-1-" + catalogName;
                        CommonCatalog catalog = checkName(catalogName, nameKey, catalogNameMap, nameSet, rollbackNameSet);
                        if (Objects.nonNull(catalog)) {
                            logicWorkflowService.applyCatalogChange(catalog, username, catalogImport, status, catalogName, udpDtoList, cacheId, structureTypeMap.get(structure.getId()), catalogCode);
                        }

                        dataAssetsCatalog.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                        dataAssetsCatalog.setName(catalogName);
                        dataAssetsCatalog.setEnglishName(catalogImport.getCatalogEnglishName());
                        dataAssetsCatalog.setApprover(catalogImport.getApprover());
                        dataAssetsCatalog.setBm(organization.getBm());
                        dataAssetsCatalog.setCatalogDept(organization.getFullName());
                        dataAssetsCatalog.setComment(catalogImport.getComment());
                        dataAssetsCatalog.setKeyword(catalogImport.getKeyword());
                        dataAssetsCatalog.setLevel(1);
                        dataAssetsCatalog.setStructureId(structure.getId());
                        dataAssetsCatalog.setParentId(0L);
                        dataAssetsCatalog.setCatalogPath(catalogPath);
                        dataAssetsCatalog.setUdpDtos(udpDtoList);
                        dataAssetsCatalog.setStatus(status);
                        dataAssetsCatalog.setButler(catalogImport.getButler());
                        //设置目录编号
                        dataAssetsCatalog.setCode(getUploadCatalogCode(catalogImport.getCatalogCode(), structureTypeMap.get(structure.getId()), catalogCode));
                        catalogNameMap.put(nameKey, new CommonCatalog());
                    } catch (Exception e) {
                        if (importDataExceptionHandle(e, result, catalogCode, catalogImport.getCatalogCode())) {
                            boolean isHandledError = handleCatalogErrorMsg(e.getMessage()
                                    , catalogName
                                    , result
                                    , catalogImport.getRowNum()
                                    , msgService.getMessage("firstCatalog"));
                            if (!isHandledError) {
                                result.getErrorMsg().add(e.getMessage());
                                LOGGER.error("upload catalog error!", e);
                            }
                            result.addFailed();
                            nameSet.add(catalogName);
                        }
                        return null;
                    }

                    return dataAssetsCatalog;
                });
                futureList.add(submit);
            }
            handleCatalogSaveFuture(result, nameSet, rollbackNameSet, user, futureList);
            LOGGER.info("upload " + result.getSuccess() + " catalog cost time: " + (System.currentTimeMillis() - startTime));
            pageList = PageUtils.startPage(firstCatalogImports, ++pageNum, pageSize);
        }
    }

    protected void uploadSecondCatalog(List<Object> imports, DDCCatalogImportResultDto result, EnumAssetsCatalogStatus status, Long structureId, String username, List<Long> cacheId) {
        List<SecondCatalogImport> secondCatalogImports = null;
        long startTime = System.currentTimeMillis();
        LOGGER.info("start upload at: " + startTime);

        if (imports.size() > 0 && !ExcelUtil.checkTemplate(SecondCatalogImport.class, imports)) {
            result.getErrorMsg().add(msgService.getMessage("importSecondCatalogError"));
            return;
        }

        try {
            secondCatalogImports = ExcelUtil.getBeanList(imports, SecondCatalogImport.class);
            if (CollectionUtils.isEmpty(secondCatalogImports)) {
                return;
            }
        } catch (Exception e) {
            result.getErrorMsg().add(msgService.getMessage("importSecondCatalogError"));
            LOGGER.error("upload catalog error!", e);
        }

        //列号与值对应
        Map<Integer, Map<String, Object>> udpMap = new HashMap<>();
        for (int i = 0; i < imports.size(); i++) {
            Map<String, Object> importMap = (Map<String, Object>) imports.get(i);
            udpMap.put((Integer) importMap.get("rowNum"), importMap);
        }
        //初始化数据
        //获取当前导入的所有目录名称
        Set<String> nameSet = secondCatalogImports.stream().map(catalog -> catalog.getFirstCatalogName() + "/" + catalog.getSecondCatalogName()).collect(Collectors.toSet());

        HashSet<String> catalogNameSet = new HashSet<>();
        Set<String> englishNameSet = new HashSet<>();
        //回滚目录名称列表
        Set<String> rollbackNameSet = new HashSet<>();
        //获取导入需要的空间
        Set<String> structureNameSet = secondCatalogImports.stream().map(SecondCatalogImport::getStructureType).collect(Collectors.toSet());
        List<CommonCatalogStructure> structureList = structureRepository.findByNamesAndStructureType(structureNameSet, EnumStructureType.DATA_ASSETS);
        Map<String, CommonCatalogStructure> structureMap = structureList.stream().collect(Collectors.toMap(CommonCatalogStructure::getName, Function.identity()));
        //获取所需的空间管理员
        Set<Long> structureIdSet = structureList.stream().map(CommonCatalogStructure::getId).collect(Collectors.toSet());
        List<DataAssetsCatalogStructureAuth> structureAuthList = structureAuthRepository.findUserByStructureIds(structureIdSet);
        Map<Long, List<DataAssetsCatalogStructureAuth>> structureIdAuthMap = structureAuthList.stream().collect(Collectors.groupingBy(DataAssetsCatalogStructureAuth::getStructureId));
        //获取所需空间的所有一级目录
        List<CommonCatalog> firstCatalogList = catalogRepository.findAllByStructureIdInAndLevel(structureIdSet, 1);
        Map<String, CommonCatalog> catalogNameMap = new HashMap<>();
        firstCatalogList.forEach(catalog -> {
            catalogNameMap.put(catalog.getStructureId() + "-1-" + catalog.getName(), catalog);
        });
        //获取所需空间的所有二级目录
        List<CommonCatalog> secondCatalogList = catalogRepository.findAllByStructureIdInAndLevel(structureIdSet, 2);
        secondCatalogList.forEach(catalog -> {
            catalogNameMap.put(catalog.getParentId() + "-2-" + catalog.getName(), catalog);
        });
        //获取审批人
        Set<String> approverSet = secondCatalogImports.stream().map(SecondCatalogImport::getApprover).collect(Collectors.toSet());
        //获取数据管家
        for (FirstCatalogImport catalogImport : secondCatalogImports) {
            approverSet.add(catalogImport.getButler());
        }
        List<SimpleUserDto> users = userService.getUsersByUsernames(approverSet);
        Map<String, SimpleUserDto> approverMap = users.stream().collect(Collectors.toMap(SimpleUserDto::getUsername, Function.identity()));
        //当前上传用户
        String user = innerCurrentUserName();
        //获取部门
        List<String> orgCodeSet = secondCatalogImports.stream().map(SecondCatalogImport::getCatalogDept).collect(Collectors.toList());
        List<OrganizationDto> organizationsByBms = organizationService.getOrganizationsByBms(orgCodeSet);
        Map<String, OrganizationDto> orgMap = organizationsByBms.stream().collect(Collectors.toMap(OrganizationDto::getBm, Function.identity()));
        //获取目录类型
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(structureIdSet, 2);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        Map<Long, CommonCatalogType> catalogTypeMap = new HashMap<>();
        //已经导入的编码记录
        Set<String> catalogCode = new HashSet<>();
        //设置分页批处理
        int pageNum = 1;
        List<SecondCatalogImport> pageList = PageUtils.startPage(secondCatalogImports, pageNum, pageSize);

        //保存已经生成的编码
        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        while (pageList.size() > 0) {
            List<Future<DataAssetsCatalogDto>> futureList = new ArrayList<>();
            for (SecondCatalogImport catalogImport : pageList) {
                Future<DataAssetsCatalogDto> submit = submit(() -> {
                    DataAssetsCatalogDto dataAssetsCatalog = new DataAssetsCatalogDto();
                    try {

                        if (catalogImport.isBlank()) {
                            throw new RuntimeException("import item is null, skip.");
                        }
                        result.addSuccess();
                        //校验名称
                        if (StringUtils.isBlank(catalogImport.getSecondCatalogName())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CATALOG_NAME_IS_NULL));
                        }
                        if (isContainsSpecialCharacters(catalogImport.getSecondCatalogName())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CONTAINS_SPECIAL_CHARACTERS));
                        }
                        if (StringUtils.isBlank(catalogImport.getFirstCatalogName())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_CATALOG_NAME_NOT_EXIST));
                        }

                        //校验英文名必填
                        if (StringUtils.isBlank(catalogImport.getCatalogEnglishName())) {
                            throw new RuntimeException("二级目录" + catalogImport.getSecondCatalogName() + "英文名称为空");
                        }

                        //校验长度
                        if (catalogImport.getSecondCatalogName().length() > 30) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CATALOG_NAME_LENGTH_EXCEEDS_LIMIT));
                        }
                        //校验空间
                        CommonCatalogStructure structure = structureMap.get(catalogImport.getStructureType());
                        if (structure == null || structure.getId() == null || !structure.getId().equals(structureId)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_NOT_EXIST));
                        }
                        if (!structure.isOpenStatus()) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_NOT_PUBLISH));
                        }
                        //校验管理员权限
                        List<DataAssetsCatalogStructureAuth> dataAssetsCatalogStructureAuths = structureIdAuthMap.get(structure.getId());
                        List<String> managers = dataAssetsCatalogStructureAuths.stream().map(DataAssetsCatalogStructureAuth::getUser).collect(Collectors.toList());
                        if (!managers.contains(user)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.NO_STRUCTURE_AUTH));
                        }
                        //校验上级目录是否存在
                        String nameKey = structure.getId() + "-1-" + catalogImport.getFirstCatalogName();
                        CommonCatalog first = catalogNameMap.getOrDefault(nameKey, null);
                        if (first == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_NOT_EXIST));
                        }
                        //校验上级目录类型是否支持存放目录
                        CommonCatalogType catalogType = catalogTypeMap.getOrDefault(first.getCatalogTypeId(), null);
                        if (catalogType == null) {
                            Optional<CommonCatalogType> optional = typeRepository.findById(first.getCatalogTypeId());
                            if (!optional.isPresent()) {
                                throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_CATALOG_TYPE_NOT_EXIST));
                            }
                            catalogType = optional.get();
                            catalogTypeMap.put(catalogType.getId(), catalogType);
                        }
                        if (!catalogType.getAssetsType().contains(EnumSupportType.CATALOG.name())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_CANNOT_CREAT_CATALOG));
                        }
                        String catalogPath = first.getCatalogPath() + first.getId() + "/";

                        //校验审批人
                        if (StringUtils.isBlank(catalogImport.getApprover())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.APPROVER_NOT_EXIST));
                        }
                        if (approverMap.get(catalogImport.getApprover()) == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.APPROVER_NOT_EXIST));
                        }
                        //校验数据管家
                        if (!approverMap.containsKey(catalogImport.getButler())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DATA_MANAGER_NOT_EXIST));
                        }
                        //校验组织机构
                        if (StringUtils.isBlank(catalogImport.getCatalogDept())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DEPT_NOT_EXIST));
                        }
                        OrganizationDto organization = orgMap.getOrDefault(catalogImport.getCatalogDept(), null);
                        if (organization == null || organization.getId() == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DEPT_NOT_EXIST));
                        }

                        //设置扩展属性
                        List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 2);
                        Map<String, Object> objectMap = udpMap.get(catalogImport.getRowNum());
                        for (String key : objectMap.keySet()) {
                            if (key.contains(msgService.getMessage("fileImport.extendedPropertiesRequired"))
                                    || key.contains(msgService.getMessage("fileImport.extendedPropertiesNotRequired"))) {
                                String value = (String) objectMap.get(key);
                                key = key.substring(key.indexOf(":") + 1);
                                for (DataAssetsCatalogUdpDto dataAssetsCatalogUdpDto : udpDtoList) {
                                    if (dataAssetsCatalogUdpDto.getPropName().equals(key)) {
                                        dataAssetsCatalogUdpDto.setValue(value);
                                    }
                                }
                            }
                        }
                        for (DataAssetsCatalogUdpDto dataAssetsCatalogUdpDto : udpDtoList) {
                            //判断用户必填的拓展属性是否为 空
                            if (dataAssetsCatalogUdpDto.getRequired() && StringUtils.isBlank(dataAssetsCatalogUdpDto.getValue())) {
                                throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.REQUIRED_UDP_NOT_EXIST));
                            }
                            //第一次判断用户所填枚举类型是否正确
                            if (dataAssetsCatalogUdpDto.getType().equals(EnumCatalogUdpDataType.ENUM) &&
                                    !dataAssetsCatalogUdpDto.getTypeDataList().contains(dataAssetsCatalogUdpDto.getValue())) {
                                //第二次判断用户填错的信息是否为 必填 或者 非必填不为空
                                if (dataAssetsCatalogUdpDto.getRequired() ||
                                        (!dataAssetsCatalogUdpDto.getRequired() && StringUtils.isNotBlank(dataAssetsCatalogUdpDto.getValue()))) {
                                    throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.UDP_ERROR));
                                }
                            }
                            //第一次判断用户所填数值类型是否正确
                            if (dataAssetsCatalogUdpDto.getType().equals(EnumCatalogUdpDataType.NUM) &&
                                    !isNumeric(dataAssetsCatalogUdpDto.getValue())) {
                                //第二次判断用户填错的信息是否为 必填 或者 非必填不为空
                                if (dataAssetsCatalogUdpDto.getRequired() ||
                                        (!dataAssetsCatalogUdpDto.getRequired() && StringUtils.isNotBlank(dataAssetsCatalogUdpDto.getValue()))) {
                                    throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.UDP_ERROR));
                                }
                            }
                        }

                        //校验目录中文名全局重名
                        if (catalogNameSet.contains(catalogImport.getSecondCatalogName())) {
                            throw new IllegalOperationException("二级目录导入失败，当前中文名为【" + catalogImport.getSecondCatalogName() + "】在导入模板中已存在！");
                        } else {
                            catalogNameSet.add(catalogImport.getSecondCatalogName());
                        }

                        CommonCatalog byName = catalogRepository.findByStructureIdAndName(structure.getId(), catalogImport.getSecondCatalogName());
                        if (byName != null) {
                            throw new IllegalOperationException("二级目录导入失败，当前中文名为【" + catalogImport.getSecondCatalogName() + "】在系统中已存在！");
                        }

                        //校验目录英文名全局重名
                        if (englishNameSet.contains(catalogImport.getCatalogEnglishName())) {
                            throw new IllegalOperationException("二级目录导入失败，当前英文名为【" + catalogImport.getCatalogEnglishName() + "】在导入模板中已存在！");
                        } else {
                            if (!Strings.isNullOrEmpty(catalogImport.getCatalogEnglishName())) {
                                englishNameSet.add(catalogImport.getCatalogEnglishName());
                            }
                        }

                        if (!Strings.isNullOrEmpty(catalogImport.getCatalogEnglishName())) {
                            CommonCatalog byEnglishName = commonCatalogExtRepository.findByStructureIdAndEnglishName(structure.getId(), catalogImport.getCatalogEnglishName());
                            if (byEnglishName != null) {
                                throw new IllegalOperationException("二级目录导入失败，当前英文名为【" + catalogImport.getCatalogEnglishName() + "】在系统中已存在！");
                            }
                        }

                        //校验重名
                        nameKey = first.getId() + "-2-" + catalogImport.getSecondCatalogName();
                        String catalogNamePath = catalogImport.getFirstCatalogName() + "/" + catalogImport.getSecondCatalogName();
                        CommonCatalog catalog = checkName(catalogNamePath, nameKey, catalogNameMap, nameSet, rollbackNameSet);
                        if (Objects.nonNull(catalog)) {
                            logicWorkflowService.applyCatalogChange(catalog, username, catalogImport, status, catalogNamePath, udpDtoList, cacheId, structureTypeMap.get(structure.getId()), catalogCode);
                        }
                        dataAssetsCatalog.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                        dataAssetsCatalog.setName(catalogImport.getSecondCatalogName());
                        dataAssetsCatalog.setEnglishName(catalogImport.getCatalogEnglishName());
                        dataAssetsCatalog.setApprover(catalogImport.getApprover());
                        dataAssetsCatalog.setBm(organization.getBm());
                        dataAssetsCatalog.setCatalogDept(organization.getFullName());
                        dataAssetsCatalog.setComment(catalogImport.getComment());
                        dataAssetsCatalog.setKeyword(catalogImport.getKeyword());
                        dataAssetsCatalog.setStructureId(structure.getId());
                        dataAssetsCatalog.setLevel(2);
                        dataAssetsCatalog.setParentId(first.getId());
                        dataAssetsCatalog.setUdpDtos(udpDtoList);
                        dataAssetsCatalog.setCatalogPath(catalogPath);
                        dataAssetsCatalog.setStatus(status);
                        dataAssetsCatalog.setButler(catalogImport.getButler());
                        //设置目录编号
                        dataAssetsCatalog.setCode(getUploadCatalogCodeByLevel(catalogImport.getCatalogCode(),
                                dataAssetsCatalog, catalogCode, uploaCcodeParentIdMap));

                        catalogNameMap.put(nameKey, new CommonCatalog());
                    } catch (Exception e) {
                        if (importDataExceptionHandle(e, result, catalogCode, catalogImport.getCatalogCode())) {
                            boolean isHandledError = handleCatalogErrorMsg(e.getMessage()
                                    , catalogImport.getSecondCatalogName()
                                    , result, catalogImport.getRowNum()
                                    , msgService.getMessage("secondCatalog"));
                            if (!isHandledError) {
                                result.getErrorMsg().add(e.getMessage());
                                LOGGER.error("upload catalog error!", e);
                            }
                            result.addFailed();
                            nameSet.add(catalogImport.getFirstCatalogName() + "/" + catalogImport.getSecondCatalogName());
                        }
                        return null;
                    }
                    return dataAssetsCatalog;
                });
                futureList.add(submit);
            }
            handleCatalogSaveFuture(result, nameSet, rollbackNameSet, user, futureList);
            LOGGER.info("upload " + result.getSuccess() + " catalog cost time: " + (System.currentTimeMillis() - startTime));
            pageList = PageUtils.startPage(secondCatalogImports, ++pageNum, pageSize);
        }
    }

    protected void uploadThirdCatalog(List<Object> imports, DDCCatalogImportResultDto result, EnumAssetsCatalogStatus status, Long structureId, String username, List<Long> cacheId) {
        List<ThirdCatalogImport> thirdCatalogImports = null;
        long startTime = System.currentTimeMillis();
        LOGGER.info("start upload at: " + startTime);

        if (imports.size() > 0 && !ExcelUtil.checkTemplate(ThirdCatalogImport.class, imports)) {
            result.getErrorMsg().add(msgService.getMessage("importThirdCatalogError"));
            return;
        }

        try {
            thirdCatalogImports = ExcelUtil.getBeanList(imports, ThirdCatalogImport.class);
            if (CollectionUtils.isEmpty(thirdCatalogImports)) {
                return;
            }
        } catch (Exception e) {
            result.getErrorMsg().add(msgService.getMessage("importThirdCatalogError"));
            LOGGER.error("upload catalog error!", e);
        }

        //列号与值对应
        Map<Integer, Map<String, Object>> udpMap = new HashMap<>();
        for (int i = 0; i < imports.size(); i++) {
            Map<String, Object> importMap = (Map<String, Object>) imports.get(i);
            udpMap.put((Integer) importMap.get("rowNum"), importMap);
        }

        //初始化数据
        //获取当前导入的所有目录名称
        Set<String> nameSet = thirdCatalogImports.stream().map(catalog -> catalog.getFirstCatalogName() + "/" + catalog.getSecondCatalogName() + "/" + catalog.getThirdCatalogName()).collect(Collectors.toSet());
        HashSet<String> catalogNameSet = new HashSet<>();
        Set<String> englishNameSet = new HashSet<>();
        //回滚目录名称列表
        Set<String> rollbackNameSet = new HashSet<>();
        //获取导入需要的空间
        Set<String> structureNameSet = thirdCatalogImports.stream().map(ThirdCatalogImport::getStructureType).collect(Collectors.toSet());
        List<CommonCatalogStructure> structureList = structureRepository.findByNamesAndStructureType(structureNameSet, EnumStructureType.DATA_ASSETS);
        Map<String, CommonCatalogStructure> structureMap = structureList.stream().collect(Collectors.toMap(CommonCatalogStructure::getName, Function.identity()));
        //获取所需的空间管理员
        Set<Long> structureIdSet = structureList.stream().map(CommonCatalogStructure::getId).collect(Collectors.toSet());
        List<DataAssetsCatalogStructureAuth> structureAuthList = structureAuthRepository.findUserByStructureIds(structureIdSet);
        Map<Long, List<DataAssetsCatalogStructureAuth>> structureIdAuthMap = structureAuthList.stream().collect(Collectors.groupingBy(DataAssetsCatalogStructureAuth::getStructureId));
        //获取所需空间的所有一级目录
        List<CommonCatalog> firstCatalogList = catalogRepository.findAllByStructureIdInAndLevel(structureIdSet, 1);
        Map<String, CommonCatalog> catalogNameMap = new HashMap<>();
        firstCatalogList.forEach(catalog -> {
            catalogNameMap.put(catalog.getStructureId() + "-1-" + catalog.getName(), catalog);
        });
        //获取所需空间的所有二级目录
        List<CommonCatalog> secondCatalogList = catalogRepository.findAllByStructureIdInAndLevel(structureIdSet, 2);
        secondCatalogList.forEach(catalog -> {
            catalogNameMap.put(catalog.getParentId() + "-2-" + catalog.getName(), catalog);
        });
        //获取所需空间的所有三级目录
        List<CommonCatalog> thirdCatalogList = catalogRepository.findAllByStructureIdInAndLevel(structureIdSet, 3);
        thirdCatalogList.forEach(catalog -> {
            catalogNameMap.put(catalog.getParentId() + "-3-" + catalog.getName(), catalog);
        });
        //获取审批人
        Set<String> approverSet = thirdCatalogImports.stream().map(ThirdCatalogImport::getApprover).collect(Collectors.toSet());
        //获取数据管家
        for (FirstCatalogImport catalogImport : thirdCatalogImports) {
            approverSet.add(catalogImport.getButler());
        }
        List<SimpleUserDto> users = userService.getUsersByUsernames(approverSet);
        Map<String, SimpleUserDto> approverMap = users.stream().collect(Collectors.toMap(SimpleUserDto::getUsername, Function.identity()));
        //当前上传用户
        String user = innerCurrentUserName();
        //获取部门
        List<String> orgCodeSet = thirdCatalogImports.stream().map(ThirdCatalogImport::getCatalogDept).collect(Collectors.toList());
        List<OrganizationDto> organizationsByBms = organizationService.getOrganizationsByBms(orgCodeSet);
        Map<String, OrganizationDto> orgMap = organizationsByBms.stream().collect(Collectors.toMap(OrganizationDto::getBm, Function.identity()));
        //获取目录类型
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(structureIdSet, 3);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));
        //拓展属性
        Map<Long, List<DataAssetsCatalogUdpDto>> udpDtoMap = new HashMap<>();
        Map<Long, CommonCatalogType> catalogTypeMap = new HashMap<>();
        //已经导入的编码记录
        Set<String> catalogCode = new HashSet<>();
        //设置分页批处理
        int pageNum = 1;
        List<ThirdCatalogImport> pageList = PageUtils.startPage(thirdCatalogImports, pageNum, pageSize);

        //保存已经生成的编码
        ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap = new ConcurrentHashMap<>();

        //处理数据
        while (pageList.size() > 0) {
            List<Future<DataAssetsCatalogDto>> futureList = new ArrayList<>();
            for (ThirdCatalogImport catalogImport : pageList) {
                Future<DataAssetsCatalogDto> submit = submit(() -> {
                    DataAssetsCatalogDto dataAssetsCatalog = new DataAssetsCatalogDto();
                    try {

                        if (catalogImport.isBlank()) {
                            throw new RuntimeException("import item is null, skip.");
                        }
                        result.addSuccess();
                        //校验名称
                        if (StringUtils.isBlank(catalogImport.getThirdCatalogName())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CATALOG_NAME_IS_NULL));
                        }
                        if (isContainsSpecialCharacters(catalogImport.getThirdCatalogName())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CONTAINS_SPECIAL_CHARACTERS));
                        }
                        if (StringUtils.isBlank(catalogImport.getSecondCatalogName())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_CATALOG_NAME_NOT_EXIST));
                        }
                        if (StringUtils.isBlank(catalogImport.getFirstCatalogName())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_CATALOG_NAME_NOT_EXIST));
                        }

                        //校验英文名必填
                        if (StringUtils.isBlank(catalogImport.getCatalogEnglishName())) {
                            throw new RuntimeException("三级目录" + catalogImport.getThirdCatalogName() + "英文名称为空");
                        }

                        //校验长度
                        if (catalogImport.getThirdCatalogName().length() > 30) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CATALOG_NAME_LENGTH_EXCEEDS_LIMIT));
                        }

                        //校验空间
                        CommonCatalogStructure structure = structureMap.get(catalogImport.getStructureType());
                        if (structure == null || structure.getId() == null || !structure.getId().equals(structureId)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_NOT_EXIST));
                        }
                        if (!structure.isOpenStatus()) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_NOT_PUBLISH));
                        }
                        //校验管理员权限
                        List<DataAssetsCatalogStructureAuth> dataAssetsCatalogStructureAuths = structureIdAuthMap.get(structure.getId());
                        List<String> managers = dataAssetsCatalogStructureAuths.stream().map(DataAssetsCatalogStructureAuth::getUser).collect(Collectors.toList());
                        if (!managers.contains(user)) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.NO_STRUCTURE_AUTH));
                        }
                        //校验上级目录是否存在
                        String nameKey = structure.getId() + "-1-" + catalogImport.getFirstCatalogName();
                        CommonCatalog first = catalogNameMap.getOrDefault(nameKey, null);
                        if (first == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_NOT_EXIST));
                        }
                        nameKey = first.getId() + "-2-" + catalogImport.getSecondCatalogName();
                        CommonCatalog second = catalogNameMap.getOrDefault(nameKey, null);
                        if (second == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_NOT_EXIST));
                        }
                        //校验上级目录类型是否支持存放目录
                        CommonCatalogType catalogType = catalogTypeMap.getOrDefault(second.getCatalogTypeId(), null);
                        if (catalogType == null) {
                            Optional<CommonCatalogType> optional = typeRepository.findById(second.getCatalogTypeId());
                            if (!optional.isPresent()) {
                                throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.PARENT_CATALOG_TYPE_NOT_EXIST));
                            }
                            catalogType = optional.get();
                            catalogTypeMap.put(catalogType.getId(), catalogType);
                        }
                        if (!catalogType.getAssetsType().contains(EnumSupportType.CATALOG.name())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.STRUCTURE_CANNOT_CREAT_CATALOG));
                        }
                        String catalogPath = second.getCatalogPath() + second.getId() + "/";

                        //校验审批人
                        if (StringUtils.isBlank(catalogImport.getApprover())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.APPROVER_NOT_EXIST));
                        }
                        if (approverMap.get(catalogImport.getApprover()) == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.APPROVER_NOT_EXIST));
                        }
                        //校验数据管家
                        if (!approverMap.containsKey(catalogImport.getButler())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DATA_MANAGER_NOT_EXIST));
                        }
                        //校验组织机构
                        if (StringUtils.isBlank(catalogImport.getCatalogDept())) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DEPT_NOT_EXIST));
                        }
                        OrganizationDto organization = orgMap.getOrDefault(catalogImport.getCatalogDept(), null);
                        if (organization == null || organization.getId() == null) {
                            throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.DEPT_NOT_EXIST));
                        }

                        //设置扩展属性
                        List<DataAssetsCatalogUdpDto> udpDtoList = getDataAssetsCatalogUdpDtoList(udpDtoMap, structure, 3);
                        Map<String, Object> objectMap = udpMap.get(catalogImport.getRowNum());
                        for (String key : objectMap.keySet()) {
                            if (key.contains(msgService.getMessage("fileImport.extendedPropertiesRequired"))
                                    || key.contains(msgService.getMessage("fileImport.extendedPropertiesNotRequired"))) {
                                String value = (String) objectMap.get(key);
                                key = key.substring(key.indexOf(":") + 1);
                                for (DataAssetsCatalogUdpDto dataAssetsCatalogUdpDto : udpDtoList) {
                                    if (dataAssetsCatalogUdpDto.getPropName().equals(key)) {
                                        dataAssetsCatalogUdpDto.setValue(value);
                                    }
                                }
                            }
                        }
                        for (DataAssetsCatalogUdpDto dataAssetsCatalogUdpDto : udpDtoList) {
                            //判断用户必填的拓展属性是否为 空
                            if (dataAssetsCatalogUdpDto.getRequired() && StringUtils.isBlank(dataAssetsCatalogUdpDto.getValue())) {
                                throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.REQUIRED_UDP_NOT_EXIST));
                            }
                            //第一次判断用户所填枚举类型是否正确
                            if (dataAssetsCatalogUdpDto.getType().equals(EnumCatalogUdpDataType.ENUM) &&
                                    !dataAssetsCatalogUdpDto.getTypeDataList().contains(dataAssetsCatalogUdpDto.getValue())) {
                                //第二次判断用户填错的信息是否为 必填 或者 非必填不为空
                                if (dataAssetsCatalogUdpDto.getRequired() ||
                                        (!dataAssetsCatalogUdpDto.getRequired() && StringUtils.isNotBlank(dataAssetsCatalogUdpDto.getValue()))) {
                                    throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.UDP_ERROR));
                                }
                            }
                            //第一次判断用户所填数值类型是否正确
                            if (dataAssetsCatalogUdpDto.getType().equals(EnumCatalogUdpDataType.NUM) &&
                                    !isNumeric(dataAssetsCatalogUdpDto.getValue())) {
                                //第二次判断用户填错的信息是否为 必填 或者 非必填不为空
                                if (dataAssetsCatalogUdpDto.getRequired() ||
                                        (!dataAssetsCatalogUdpDto.getRequired() && StringUtils.isNotBlank(dataAssetsCatalogUdpDto.getValue()))) {
                                    throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.UDP_ERROR));
                                }
                            }
                        }

                        //校验目录中文名全局重名
                        if (catalogNameSet.contains(catalogImport.getThirdCatalogName())) {
                            throw new IllegalOperationException("三级目录导入失败，当前中文名为【" + catalogImport.getThirdCatalogName() + "】在导入模板中已存在！");
                        } else {
                            catalogNameSet.add(catalogImport.getThirdCatalogName());
                        }

                        CommonCatalog byName = catalogRepository.findByStructureIdAndName(structure.getId(), catalogImport.getThirdCatalogName());
                        if (byName != null) {
                            throw new IllegalOperationException("三级目录导入失败，当前中文名为【" + catalogImport.getThirdCatalogName() + "】在系统中已存在！");
                        }

                        //校验目录英文名全局重名
                        if (englishNameSet.contains(catalogImport.getCatalogEnglishName())) {
                            throw new IllegalOperationException("三级目录导入失败，当前英文名为【" + catalogImport.getCatalogEnglishName() + "】在导入模板中已存在！");
                        } else {
                            if (!Strings.isNullOrEmpty(catalogImport.getCatalogEnglishName())) {
                                englishNameSet.add(catalogImport.getCatalogEnglishName());
                            }
                        }

                        if (!Strings.isNullOrEmpty(catalogImport.getCatalogEnglishName())) {
                            CommonCatalog byEnglishName = commonCatalogExtRepository.findByStructureIdAndEnglishName(structure.getId(), catalogImport.getCatalogEnglishName());
                            if (byEnglishName != null) {
                                throw new IllegalOperationException("三级目录导入失败，当前英文名为【" + catalogImport.getCatalogEnglishName() + "】在系统中已存在！");
                            }
                        }

                        //校验重名
                        nameKey = second.getId() + "-3-" + catalogImport.getThirdCatalogName();
                        String catalogNamePath = catalogImport.getFirstCatalogName() + "/" + catalogImport.getSecondCatalogName() + "/" + catalogImport.getThirdCatalogName();
                        CommonCatalog catalog = checkName(catalogNamePath, nameKey, catalogNameMap, nameSet, rollbackNameSet);
                        if (Objects.nonNull(catalog)) {
                            logicWorkflowService.applyCatalogChange(catalog, username, catalogImport, status, catalogNamePath, udpDtoList, cacheId, structureTypeMap.get(structure.getId()), catalogCode);
                        }
                        dataAssetsCatalog.setCatalogTypeId(structureTypeMap.get(structure.getId()));
                        dataAssetsCatalog.setName(catalogImport.getThirdCatalogName());
                        dataAssetsCatalog.setEnglishName(catalogImport.getCatalogEnglishName());
                        dataAssetsCatalog.setApprover(catalogImport.getApprover());
                        dataAssetsCatalog.setBm(organization.getBm());
                        dataAssetsCatalog.setCatalogDept(organization.getFullName());
                        dataAssetsCatalog.setComment(catalogImport.getComment());
                        dataAssetsCatalog.setKeyword(catalogImport.getKeyword());
                        dataAssetsCatalog.setStructureId(structure.getId());
                        dataAssetsCatalog.setLevel(3);
                        dataAssetsCatalog.setParentId(second.getId());
                        dataAssetsCatalog.setUdpDtos(udpDtoList);
                        dataAssetsCatalog.setCatalogPath(catalogPath);
                        dataAssetsCatalog.setStatus(status);
                        dataAssetsCatalog.setButler(catalogImport.getButler());
                        //设置目录编号
                        dataAssetsCatalog.setCode(getUploadCatalogCodeByLevel(catalogImport.getCatalogCode(),
                                dataAssetsCatalog, catalogCode, uploaCcodeParentIdMap));
                        catalogNameMap.put(nameKey, new CommonCatalog());
                    } catch (Exception e) {
                        if (importDataExceptionHandle(e, result, catalogCode, catalogImport.getCatalogCode())) {
                            boolean isHandledError = handleCatalogErrorMsg(e.getMessage()
                                    , catalogImport.getThirdCatalogName()
                                    , result, catalogImport.getRowNum()
                                    , msgService.getMessage("thirdCatalog"));
                            if (!isHandledError) {
                                result.getErrorMsg().add(e.getMessage());
                                LOGGER.error("upload catalog error!", e);
                            }
                            result.addFailed();
                            nameSet.add(catalogImport.getFirstCatalogName() + "/" + catalogImport.getSecondCatalogName() + "/" + catalogImport.getThirdCatalogName());
                        }
                        return null;
                    }
                    return dataAssetsCatalog;
                });
                futureList.add(submit);
            }
            handleCatalogSaveFuture(result, nameSet, rollbackNameSet, user, futureList);
            LOGGER.info("upload " + result.getSuccess() + " catalog cost time: " + (System.currentTimeMillis() - startTime));
            pageList = PageUtils.startPage(thirdCatalogImports, ++pageNum, pageSize);
        }
    }

    /**
     * 保存目录
     *
     * @param result
     * @param nameSet
     * @param rollbackNameSet
     * @param user
     * @param futureList
     */
    @Override
    protected void handleCatalogSaveFuture(DDCCatalogImportResultDto result, Set<String> nameSet, Set<String> rollbackNameSet, String user, List<Future<DataAssetsCatalogDto>> futureList) {
        List<DataAssetsCatalogDto> catalogDtoList = new ArrayList<>();
        long startHandle = System.currentTimeMillis();
        //执行所有的任务
        for (Future<DataAssetsCatalogDto> importResultFuture : futureList) {
            try {
                DataAssetsCatalogDto dataAssetsCatalogDto = importResultFuture.get();
                if (null != dataAssetsCatalogDto) {
                    catalogDtoList.add(dataAssetsCatalogDto);
                }
            } catch (Exception e) {
                result.getErrorMsg().add(e.getMessage());
                LOGGER.error("upload catalog error!", e);
                result.addFailed();
            }
        }
        LOGGER.debug("handle " + futureList.size() + " catalog cost time: " + (System.currentTimeMillis() - startHandle));
        try {
            this.saveCatalogList(catalogDtoList, user);
            LOGGER.debug("save " + futureList.size() + " catalog cost time: " + (System.currentTimeMillis() - startHandle));
        } catch (Exception e) {
            //回滚导入失败的目录名称
            nameSet.addAll(rollbackNameSet);
            result.getErrorMsg().add(e.getMessage());
            LOGGER.error("save catalog error!", e);
            result.addFailedList(catalogDtoList.size());
        } finally {
            //清空回滚列表
            rollbackNameSet.clear();
        }
    }

    @Transactional
    public void saveCatalogList(List<DataAssetsCatalogDto> dtoList, String username) {

        if (CollectionUtils.isEmpty(dtoList)) {
            return;
        }
        long saveTime = System.currentTimeMillis();

        Map<CommonCatalog, DataAssetsCatalogDto> catalogMap = new HashMap<>();
        List<CommonCatalog> catalogList = new ArrayList<>();
        Map<String, Long> orderMap = new HashMap<>();

        for (DataAssetsCatalogDto dto : dtoList) {
            if (null == dto) {
                continue;
            }
            //更新
            if(dto.getId() != null){
                this.update(dto);
                continue;
            }

            CommonCatalog catalog = new CommonCatalog();
            BeanUtils.copyProperties(dto, catalog);
            String orderKey = catalog.getStructureId() + "-" + catalog.getParentId();
            Long order = orderMap.getOrDefault(orderKey, null);
            if (null == order) {
                CommonCatalog lastCatalog = catalogRepository.findTopByStructureIdAndParentIdOrderByOrderDesc(catalog.getStructureId()
                        , catalog.getParentId());
                order = null == lastCatalog ? 0L : lastCatalog.getOrder();
            }
            catalog.setStructureType(EnumStructureType.DATA_ASSETS);
//            checkCatalog(catalog, true);
            catalog.setCreator(username);
            if (catalog.getStatus() == null) {
                catalog.setStatus(EnumAssetsCatalogStatus.UNPUBLISHED); //默认未发布状态
            }
            catalog.setQualityProblemNum(0L);
            catalog.setPublicType(EnumCatalogPublicType.NONE);
            catalog.setCreateTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
            catalog.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
            if (catalog.getOrder() == null || catalog.getOrder() == 0L) {
                catalog.setOrder(++order);
            }
            orderMap.put(orderKey, order);
            catalogList.add(catalog);
            catalogMap.put(catalog, dto);
        }
        catalogList = catalogRepository.saveAll(catalogList);
        for (CommonCatalog catalog : catalogList) {
            DataAssetForArchySubjectDto forArchySubjectDto = new DataAssetForArchySubjectDto();
            forArchySubjectDto.setCatalogName(catalog.getName());
            forArchySubjectDto.setCode(catalog.getCode());
            forArchySubjectDto.setEnglishName(catalog.getEnglishName());
            forArchySubjectDto.setDamId(catalog.getId());
            forArchySubjectDto.setDamParentId(catalog.getParentId());
            forArchySubjectDto.setPublishState(catalog.getStatus().toString());
            if (catalog.getLevel() < 3) {
                //L1和L2 创建技术架构目录
                remoteArchyExtendService.createDataAssetForArchySubject(forArchySubjectDto, AuthTools.currentUsername());
            } else if (catalog.getLevel() == 3) {
                //L3 创建技术架构业务对象
                remoteArchyExtendService.createataAssetForArchyObject(forArchySubjectDto, AuthTools.currentUsername());
            } else {
                throw new RuntimeException("层数不能大于3层目录");
            }
        }
        long saveBasicTime = System.currentTimeMillis();
        LOGGER.debug("saveBasicTime " + dtoList.size() + " catalog cost time: " + (saveBasicTime - saveTime));
        saveBatchValueList(catalogList, catalogMap);
        long saveBatchValueTime = System.currentTimeMillis();
        LOGGER.debug("saveBatchValueTime " + dtoList.size() + " catalog cost time: " + (saveBatchValueTime - saveBasicTime));
        authService.saveManagerList(catalogList, username);
        long saveManagerTime = System.currentTimeMillis();
        LOGGER.debug("saveManagerTime " + dtoList.size() + " catalog cost time: " + (saveManagerTime - saveBatchValueTime));
        for (CommonCatalog catalog : catalogList) {
            if (catalog.getParentId() != 0L) {
                authService.extendParentAuth(catalog, catalog.getParentId());
            }
        }
        long saveExtendParentAuthTime = System.currentTimeMillis();
        LOGGER.debug("saveExtendParentAuthTime " + dtoList.size() + " catalog cost time: " + (saveExtendParentAuthTime - saveManagerTime));
        saveCatalogtoES(catalogList, username, catalogMap);
    }


    public void saveManagerList(List<CommonCatalog> catalogList, String targetId) {
        List<DataAssetsCatalogAuth> catalogAuthList = new ArrayList<>();
        for (CommonCatalog catalog : catalogList) {
            DataAssetsCatalogAuth targetAuth = new DataAssetsCatalogAuth();
            targetAuth.setCatalogId(catalog.getId());
            targetAuth.setMandateType(EnumMandateType.PERSON);
            targetAuth.setTargetId(targetId);
            targetAuth.setStructureId(catalog.getStructureId());
            targetAuth.setParentId(catalog.getParentId());
            targetAuth.setManageLeafCount(0);
            targetAuth.setEditLeafCount(0);
            targetAuth.setReadLeafCount(0);
            targetAuth.setAuthType(EnumAuthType.MANAGER);
            catalogAuthList.add(targetAuth);
            this.addParentLeafCount(targetAuth, catalog.getParentId(), EnumMandateType.PERSON, EnumAuthType.MANAGER, targetId);
        }
        authRepository.saveAll(catalogAuthList);
    }

    protected void addParentLeafCount(DataAssetsCatalogAuth currentAuth, Long parentId, EnumMandateType mandateType, EnumAuthType authType, String targetId) {
        Integer leafCount = switch (authType) {
            case MANAGER -> currentAuth.getManageLeafCount();
            case EDIT -> currentAuth.getEditLeafCount();
            case READ -> currentAuth.getReadLeafCount();
            case NONE -> 0;
        };
        // 递归的结束： 1.没有父级目录了
        //            2.如果下级节点数量>1 说明已经向上增加过父级叶子节点数量
        if (parentId == 0 || leafCount > 1) {
            return;
        }
        DataAssetsCatalogAuth parentAuth = authRepository.findByCatalogIdAndMandateTypeAndTargetId(parentId, mandateType, targetId);
        if (parentAuth == null) {
            CommonCatalog parent = catalogRepository.findById(parentId).orElseThrow(
                    () -> new IllegalOperationException("记录权限失败，父节点不存在！"));
            parentAuth = new DataAssetsCatalogAuth();
            parentAuth.setStructureId(parent.getStructureId());
            parentAuth.setCatalogId(parentId);
            parentAuth.setParentId(parent.getParentId());
            parentAuth.setMandateType(mandateType);
            parentAuth.setAuthType(EnumAuthType.NONE);  //如果不存在父级权限， 设置为NONE， 仅从子级获得了权限
            parentAuth.setTargetId(targetId);
            parentAuth.setManageLeafCount(0);
            parentAuth.setEditLeafCount(0);
            parentAuth.setReadLeafCount(0);
        }
        switch (authType) {
            case MANAGER -> parentAuth.setManageLeafCount(parentAuth.getManageLeafCount() + 1);
            case EDIT -> parentAuth.setEditLeafCount(parentAuth.getEditLeafCount() + 1);
            case READ -> parentAuth.setReadLeafCount(parentAuth.getReadLeafCount() + 1);
        }
        authRepository.save(parentAuth);
        this.addParentLeafCount(parentAuth, parentAuth.getParentId(), mandateType, authType, targetId);
    }


    public void saveBatchValueList0(List<CommonCatalog> catalogList, Map<CommonCatalog, DataAssetsCatalogDto> catalogMap) {
        List<CommonCatalogUdpsVal> valList = new ArrayList<>();
        for (CommonCatalog dataAssetsCatalog : catalogList) {
            Set<CommonCatalog> keys = catalogMap.keySet();
            for (CommonCatalog key : keys) {
                if(key.getName().equals(dataAssetsCatalog.getName())){
                    List<DataAssetsCatalogUdpDto> udpDtos = catalogMap.get(key).getUdpDtos();
                    for (DataAssetsCatalogUdpDto udpDto : udpDtos) {
                        CommonCatalogUdpsVal val = new CommonCatalogUdpsVal();
                        val.setUdpId(udpDto.getId());
                        val.setCatalogId(dataAssetsCatalog.getId());
                        if (udpDto.getValue() == null) {
                            val.setValue("");
                        } else {
                            val.setValue(udpDto.getValue());
                        }
                        valList.add(val);
                    }
                }
            }
//            for (DataAssetsCatalogUdpDto dto : catalogMap.get(dataAssetsCatalog).getUdpDtos()) {
//                CommonCatalogUdpsVal val = new CommonCatalogUdpsVal();
//                val.setUdpId(dto.getId());
//                val.setCatalogId(dataAssetsCatalog.getId());
//                if (dto.getValue() == null) {
//                    val.setValue("");
//                } else {
//                    val.setValue(dto.getValue());
//                }
//                valList.add(val);
//            }
        }
        udpsValRepository.saveAll(valList);
    }

    protected String getUploadCatalogCodeByLevel(String uploadCode, DataAssetsCatalogDto dataAssetsCatalog,
                                                 Set<String> catalogCode, ConcurrentHashMap<Long, List<String>> uploaCcodeParentIdMap) {
        //将已经导入的编码记录，如果后面有重复的则 返回 空
        if (!StringUtils.isEmpty(uploadCode)) {
            if (catalogCode.contains(uploadCode)) {
                throw new RuntimeException(String.valueOf(EnumDDCCatalogImportErrorMessage.CATALOG_CODE_DUPLICATE));
            } else {
                catalogCode.add(uploadCode);
            }
        }

        String code;

        //历史数据不做处理
        if (!Strings.isEmpty(uploadCode)) {
            CommonCatalog exitsCatalog = commonCatalogExtRepository.findByCode(uploadCode);
            if (exitsCatalog != null) {
                throw new RuntimeException("已存在编码为【" + uploadCode + "】的目录");
            }
            code = uploadCode;
        } else {
            //CommonCatalog catalog = new CommonCatalog();
            //BeanUtils.copyProperties(dataAssetsCatalog, catalog);
            //String code = this.codeGenerate(catalog, uploadCode);

            //L1时编码由前端传入
            if (dataAssetsCatalog.getLevel() == 1) {
                this.checkL1Code(uploadCode);
                code = uploadCode;
            } else {
                //其他级别根据父目录编码生成
                CommonCatalog parentCatalog = this.getById(dataAssetsCatalog.getParentId());
                //拿库里的同级中的编号
                List<CommonCatalog> theSameLevelCatalogs = catalogRepository.findByParentIdAndStructureId(dataAssetsCatalog.getParentId(), dataAssetsCatalog.getStructureId());
                List<String> theSameLevelcodes = theSameLevelCatalogs.stream().map(CommonCatalog::getCode).collect(Collectors.toList());

                List<String> uploadSameLevelCodes = uploaCcodeParentIdMap.get(dataAssetsCatalog.getParentId());

                //把上传的code和库里的code合在一起
                List<String> mergeSameLevelCodes = Stream.concat(
                        theSameLevelcodes != null ? theSameLevelcodes.stream() : Stream.empty(),
                        uploadSameLevelCodes != null ? uploadSameLevelCodes.stream() : Stream.empty()
                ).collect(Collectors.toList());

                int maxNumOrder = this.splitLastCode(dataAssetsCatalog.getLevel(), mergeSameLevelCodes);
                long nextNumber = maxNumOrder + 1;
                code = this.generateChildCode(parentCatalog.getCode(), nextNumber, dataAssetsCatalog.getLevel());
            }
        }

//        List<String> exitsCodes = uploaCcodeParentIdMap.get(dataAssetsCatalog.getParentId());
        uploaCcodeParentIdMap.computeIfAbsent(dataAssetsCatalog.getParentId(), k -> new ArrayList<>());

        List<String> exitsCodes = uploaCcodeParentIdMap.get(dataAssetsCatalog.getParentId());
        exitsCodes.add(code);
//        if (exitsCodes != null) {
//            exitsCodes.add(dataAssetsCatalog.getCode());
//        } else {
//            uploaCcodeParentIdMap.put(dataAssetsCatalog.getParentId(), new ArrayList<>());
//        }

        return code;
    }

    /**
     * 给目录创建编码
     * a DL1编码规则：1/2/3/4，举例：1。       录入和导入时人工定义。
     * b DL2编码规则：DL1编码&.&当前DL1下从1开始自增。举例：1.1,1.2。
     * c DL3编码规则：所有上级编码&-&当前层级从1开始3位数自增。举例：1.1-001，1.1-002
     * d DL4编码规则：所有上级编码&-&当前层级从1开始6位数自增。举例：1.1-001-000001，1.1-002-000002。
     * e DL5编码规则：所有上级编码&-&当前层级从1开始6位数自增。举例：1.1-001-000001-000001，1.1-002-000002-000002。
     */
    private String codeGenerate(CommonCatalog catalog, String L1Code) {
        String code;
        //L1时编码由前端传入
        if (catalog.getLevel() == 1) {
            this.checkL1Code(L1Code);
            code = L1Code;
        } else {
            //其他级别根据父目录编码生成
            CommonCatalog parentCatalog = this.getById(catalog.getParentId());
//            DataAssetsCatalogDetailsDto parentCatalog = this.getCatalogAssetsType(this.getCurrentUser(), catalog.getParentId());
            List<CommonCatalog> theSameLevelCatalogs = catalogRepository.findByParentIdAndStructureId(catalog.getParentId(), catalog.getStructureId());
            List<String> theSameLevelcodes = theSameLevelCatalogs.stream().map(CommonCatalog::getCode).collect(Collectors.toList());
            int maxNumOrder = this.splitLastCode(catalog.getLevel(), theSameLevelcodes);
            long nextNumber = maxNumOrder + 1;
            code = this.generateChildCode(parentCatalog.getCode(), nextNumber, catalog.getLevel());
        }
        return code;
    }

    /**
     * 校验L1的编码逻辑
     */
    private void checkL1Code(String l1Code) {
        if (StringUtils.isAllEmpty(l1Code)) {
            throw new RuntimeException("L1级别的目录必须传入编码");
        }
        List<CommonCatalog> l1Catalogs = commonCatalogExtRepository.findByCodeAndLevel(l1Code, 1);
        if (!CollectionUtils.isEmpty(l1Catalogs)) {
            throw new RuntimeException("L1级别目录的编码有重复");
        }
    }

    /**
     * 获取当前层级编码中最大的序号
     */
    private int splitLastCode(Integer level, List<String> theSameLevelcodes) {
        int maxNum = 0;
        for (String code : theSameLevelcodes) {
            String lastNum = null;
            if (level == 2) {
                lastNum = code.substring(code.lastIndexOf('.') + 1);
            } else {
                lastNum = code.substring(code.lastIndexOf('-') + 1);
            }
            try {
                int lastNum0 = Integer.parseInt(lastNum);
                if (lastNum0 > maxNum) {
                    maxNum = lastNum0;
                }
            } catch (Exception e) {
                //由于此处有历史数据，不满足于生成编码的规则，用String转Int会有异常，此处不做处理
                LOGGER.info("由于此处有历史数据{}，不满足于生成编码的规则，用String转Int会有异常，此处不做处理", lastNum);
            }
        }
        return maxNum;
    }

    /**
     * 根据父节点生成子节点编码
     */
    private String generateChildCode(String parentCatalogCode, long nextNumber, int level) {
        return switch (level) {
            case 2 -> String.format("%s.%d", parentCatalogCode, nextNumber);  // DL2规则
            case 3 -> String.format("%s-%03d", parentCatalogCode, nextNumber); // DL3规则
            case 4, 5 -> String.format("%s-%06d", parentCatalogCode, nextNumber); // DL4/DL5规则
            default -> throw new IllegalArgumentException("不支持的层级: " + level);
        };
    }

    @Override
    public Collection<DataAssetsCatalogDto> findManageCatalogs(String username, Long structureId, Long catalogId) {
        CommonCatalogStructure structure = structureRepository.findById(structureId).orElseThrow(() -> new ItemNotFoundException(msgService.getMessage("structureNotFound")));
        List<DataAssetsCatalogDto> vos = this.queryVoList(null, structureId, catalogId, null, null);
        Map<Long, Long> subCountMap = catalogRepository.findSubCountBySidAndParentId(structureId, catalogId).stream().collect(Collectors.toMap(SubCountDto::getId, SubCountDto::getCount));
        return makeAuthTree(username, vos, structure.isPublicShow(), false, subCountMap);
    }

    @Override
    public Collection<DataAssetsCatalogDto> findManageCatalogs0(Long structureId, Long catalogId) {
        CommonCatalogStructure structure = structureRepository.findById(structureId).orElseThrow(() -> new ItemNotFoundException(msgService.getMessage("structureNotFound")));
        List<DataAssetsCatalogDto> vos = this.queryVoList(null, structureId, catalogId, null, null);
        Map<Long, Long> subCountMap = catalogRepository.findSubCountBySidAndParentId(structureId, catalogId).stream().collect(Collectors.toMap(SubCountDto::getId, SubCountDto::getCount));
        return this.makeAuthTree0(vos, structure.isPublicShow(), false, subCountMap);
    }

    @Override
    public Map<String, List<List<Object>>> exportCatalogWithId(List<Long> catalogIds) {
        // 1. 获取选中的目录信息
        List<CommonCatalog> selectedCatalogs = catalogRepository.findAllByIdIn(catalogIds);
        if (CollectionUtils.isEmpty(selectedCatalogs)) {
            throw new RuntimeException("未找到指定的目录信息");
        }
        
        // 2. 通过catalogPath解析出所有需要的目录ID，构建完整的层级结构
        Set<Long> allRequiredCatalogIds = new HashSet<>();
        
        for (CommonCatalog catalog : selectedCatalogs) {
            if (catalog.getCatalogPath() != null && !catalog.getCatalogPath().isEmpty()) {
                String[] pathIds = catalog.getCatalogPath().split("/");
                // 从索引1开始，跳过0（因为0是固定值）
                for (int i = 1; i < pathIds.length; i++) {
                    try {
                        Long pathId = Long.parseLong(pathIds[i]);
                        allRequiredCatalogIds.add(pathId);
                    } catch (NumberFormatException e) {
                        LOGGER.warn("目录路径解析失败: {}", pathIds[i]);
                    }
                }
            }
            // 添加当前目录ID
            allRequiredCatalogIds.add(catalog.getId());
        }
        
        // 3. 查询所有需要的目录信息
        List<CommonCatalog> allCatalogs = catalogRepository.findAllByIdIn(new ArrayList<>(allRequiredCatalogIds));
        Map<Long, CommonCatalog> catalogMap = allCatalogs.stream()
                .collect(Collectors.toMap(CommonCatalog::getId, c -> c));
        
        // 4. 按级别分组
        Map<Integer, List<CommonCatalog>> catalogsByLevel = allCatalogs.stream()
                .collect(Collectors.groupingBy(CommonCatalog::getLevel));
        
        // 构建选中目录的ID和路径的映射，便于快速判断
        Map<Long, String> selectedCatalogMap = selectedCatalogs.stream()
                .collect(Collectors.toMap(
                    CommonCatalog::getId,
                    CommonCatalog::getCatalogPath,
                    (existing, replacement) -> existing // 如果有重复ID，保留第一个
                ));
        
        // 5. 构建业务域数据（L1）- 5列：业务域编码、业务域中文名、业务域英文名、业务域定义、数据主官
        List<List<Object>> l1Datas = new ArrayList<>();
        List<CommonCatalog> l1Catalogs = catalogsByLevel.get(1);
        if (!CollectionUtils.isEmpty(l1Catalogs)) {
            for (CommonCatalog l1Catalog : l1Catalogs) {
                // 只处理在选中目录路径中的L1目录
                if (isCatalogInSelectedPath(l1Catalog, selectedCatalogMap)) {
                    List<Object> l1Data = new ArrayList<>();
                    l1Data.add(l1Catalog.getCode() != null ? l1Catalog.getCode() : "");        // 业务域编码
                    l1Data.add(l1Catalog.getName() != null ? l1Catalog.getName() : "");         // 业务域中文名
                    l1Data.add(l1Catalog.getEnglishName() != null ? l1Catalog.getEnglishName() : "");  // 业务域英文名
                    l1Data.add(l1Catalog.getComment() != null ? l1Catalog.getComment() : "");      // 业务域定义
                    
                    // 获取UDP里的数据主官
                    String dataOwner = getDataOwnerFromUdp(l1Catalog);
                    l1Data.add(dataOwner != null ? dataOwner : "");
                    
                    l1Datas.add(l1Data);
                }
            }
        }
        
        // 6. 构建主题域数据（L2）- 7列：业务域编码、业务域中文名、主题域编码、主题域中文名、主题域英文名、主题域定义、数据主官
        List<List<Object>> l2Datas = new ArrayList<>();
        List<CommonCatalog> l2Catalogs = catalogsByLevel.get(2);
        if (!CollectionUtils.isEmpty(l2Catalogs)) {
            for (CommonCatalog l2Catalog : l2Catalogs) {
                // 只处理在选中目录路径中的L2目录
                if (isCatalogInSelectedPath(l2Catalog, selectedCatalogMap)) {
                    CommonCatalog parentL1 = catalogMap.get(l2Catalog.getParentId());
                    if (parentL1 != null) {
                        List<Object> l2Data = new ArrayList<>();
                        l2Data.add(parentL1.getCode() != null ? parentL1.getCode() : "");      // 业务域编码
                        l2Data.add(parentL1.getName() != null ? parentL1.getName() : "");      // 业务域中文名
                        l2Data.add(l2Catalog.getCode() != null ? l2Catalog.getCode() : "");     // 主题域编码
                        l2Data.add(l2Catalog.getName() != null ? l2Catalog.getName() : "");     // 主题域中文名
                        l2Data.add(l2Catalog.getEnglishName() != null ? l2Catalog.getEnglishName() : ""); // 主题域英文名
                        l2Data.add(l2Catalog.getComment() != null ? l2Catalog.getComment() : "");  // 主题域定义
                        
                        // 获取UDP里的数据主官
                        String dataOwner = getDataOwnerFromUdp(l2Catalog);
                        l2Data.add(dataOwner != null ? dataOwner : "");
                        
                        l2Datas.add(l2Data);
                    }
                }
            }
        }
        
        // 7. 构建业务对象数据（L3）- 10列：业务域编码、业务域中文名、主题域编码、主题域中文名、业务对象编码、业务对象中文名、业务对象英文名、业务对象定义、数据管家、数据主官
        List<List<Object>> l3Datas = new ArrayList<>();
        List<CommonCatalog> l3Catalogs = catalogsByLevel.get(3);
        if (!CollectionUtils.isEmpty(l3Catalogs)) {
            for (CommonCatalog l3Catalog : l3Catalogs) {
                // 只处理在选中目录路径中的L3目录
                if (isCatalogInSelectedPath(l3Catalog, selectedCatalogMap)) {
                    CommonCatalog parentL2 = catalogMap.get(l3Catalog.getParentId());
                    if (parentL2 != null) {
                        CommonCatalog parentL1 = catalogMap.get(parentL2.getParentId());
                        if (parentL1 != null) {
                            List<Object> l3Data = new ArrayList<>();
                            l3Data.add(parentL1.getCode() != null ? parentL1.getCode() : "");      // 业务域编码
                            l3Data.add(parentL1.getName() != null ? parentL1.getName() : "");      // 业务域中文名
                            l3Data.add(parentL2.getCode() != null ? parentL2.getCode() : "");      // 主题域编码
                            l3Data.add(parentL2.getName() != null ? parentL2.getName() : "");      // 主题域中文名
                            l3Data.add(l3Catalog.getCode() != null ? l3Catalog.getCode() : "");     // 业务对象编码
                            l3Data.add(l3Catalog.getName() != null ? l3Catalog.getName() : "");    // 业务对象中文名
                            l3Data.add(l3Catalog.getEnglishName() != null ? l3Catalog.getEnglishName() : ""); // 业务对象英文名
                            l3Data.add(l3Catalog.getComment() != null ? l3Catalog.getComment() : ""); // 业务对象定义
                            l3Data.add(l3Catalog.getButler() != null ? l3Catalog.getButler() : "");  // 数据管家
                            
                            // 获取UDP里的数据主官
                            String dataOwner = getDataOwnerFromUdp(l3Catalog);
                            l3Data.add(dataOwner != null ? dataOwner : "");
                            
                            l3Datas.add(l3Data);
                        }
                    }
                }
            }
        }
        
        // 8. 构建Excel文件数据结构
        Map<String, List<List<Object>>> excelData = new LinkedHashMap<>();
        excelData.put("业务域", l1Datas);
        excelData.put("主题域", l2Datas);
        excelData.put("业务对象", l3Datas);
        
        return excelData;
    }


    /**
     * 判断目录是否在选中的路径中
     */
    private boolean isCatalogInSelectedPath(CommonCatalog catalog, Map<Long, String> selectedCatalogMap) {
        // 直接匹配ID
        if (selectedCatalogMap.containsKey(catalog.getId())) {
            return true;
        }
        
//        // 检查是否是选中目录的上级目录
//        String catalogIdStr = "/" + catalog.getId() + "/";
//        return selectedCatalogMap.values().stream()
//                .filter(path -> path != null)
//                .anyMatch(path -> path.contains(catalogIdStr));
        return false;
    }
    
    /**
     * 从UDP中获取数据主官信息
     */
    private String getDataOwnerFromUdp(CommonCatalog catalog) {
        try {
            List<CatalogUdpEntryDto> udps = udpService.getObjectUdpByCatalogId(catalog.getCatalogTypeId(), catalog.getId());
            for (CatalogUdpEntryDto udp : udps) {
                if ("数据主官".equals(udp.getName())) {
                    return udp.getValue();
                }
            }
        } catch (Exception e) {
            LOGGER.warn("获取UDP数据主官信息失败: {}", e.getMessage());
        }
        return "";
    }

    protected List<DataAssetsCatalogDto> queryVoList(Collection<Long> ids, Long structureId, Long parentId, String catalogName, EnumAssetsCatalogStatus status) {
        StringBuilder hql = new StringBuilder();
        hql.append("select new com.datablau.data.asset.dto.DataAssetsCatalogDto(")
                .append("c.id,")
                .append("c.parentId,")
                .append("c.name,")
                .append("c.order,")
                .append("c.englishName,")
                .append("c.comment,")
                .append("t.name,")
                .append("c.keyword,")
                .append("c.approver,")
                .append("c.status,")
                .append("c.creator,")
                .append("c.createTime,")
                .append("c.publishTime,")
                .append("c.bm,")
                .append("c.catalogPath,")
                .append("t.assetsType,")
                .append("c.level,")
                .append("c.structureId,")
                .append("c.catalogTypeId,")
                .append("c.code,")
                .append("c.publicType,")
                .append("c.visible,")
                .append("c.butler)")
                .append(" from CommonCatalog c, CommonCatalogType t, CommonCatalogStructure s ")
                .append(" where c.catalogTypeId = t.id and c.structureId = s.id and s.structureType = '").append(EnumStructureType.DATA_ASSETS.name()).append("'")
                .append(" and s.openStatus = true");
        if (ids != null && !ids.isEmpty()) {
            hql.append(" and c.id in (");
            for (Long id : ids) {
                hql.append(id).append(",");
            }
            hql.deleteCharAt(hql.length() - 1);
            hql.append(")");
        }
        if (structureId != null) {
            hql.append(" and s.id = ").append(structureId);
        }
        if (parentId != null) {
            hql.append(" and c.parentId = ").append(parentId);
        }
        if (!StringUtils.isAllEmpty(catalogName)) {
            hql.append(" and c.name like concat('%','").append(catalogName).append("','%')");
        }
        if (status != null) {
            hql.append(" and c.status = '").append(status.name()).append("'");
        }
        hql.append(" order by c.order, c.createTime, c.id asc");
        EntityManager em = managerFactory.createEntityManager();
        Query query = em.createQuery(hql.toString());
        List<DataAssetsCatalogDto> resultList = query.getResultList();
        em.close();

        List<String> canAddToAssetConfigM1Type = this.findCanAddAssetsCatalogMetaDataTyeps();

        for (DataAssetsCatalogDto catalogDto : resultList) {
            if (Strings.isNullOrEmpty(catalogDto.getAssetsType())) {
                continue;
            }

            String filterAssetTypes = filterMetaDataType(catalogDto.getAssetsType(), canAddToAssetConfigM1Type);
            catalogDto.setAssetsType(filterAssetTypes);
        }

        return resultList;
    }

    private List<DataAssetsCatalogDto> makeAuthTree0(List<DataAssetsCatalogDto> vos, boolean publicStructure, boolean includeRead, Map<Long, Long> subCountMap) {
        Map<Long, CommonCatalog> cacheMap = new HashMap<>();
        List<DataAssetsCatalogDto> result = new ArrayList<>(vos.size());
//        Map<Long, DataAssetsCatalogAuthDto> authMap = authService.getAuthMap(username, vos.stream().map(DataAssetsCatalogDto::getId).collect(Collectors.toSet()));
        for (DataAssetsCatalogDto v : vos) {
            //公开空间或者是  本身具有权限 或者是拥有下级目录节点权限 必须展示
//            if (publicStructure || (authMap.containsKey(v.getId())
//                    && ((includeRead ? authMap.get(v.getId()).getAuthType() != EnumAuthType.NONE : authMap.get(v.getId()).getAuthType().ordinal() > EnumAuthType.READ.ordinal())
//                    || authMap.get(v.getId()).getManageLeafCount() > 0
//                    || authMap.get(v.getId()).getEditLeafCount() > 0
//                    || (includeRead && authMap.get(v.getId()).getReadLeafCount() > 0)))) {
            if(publicStructure){
                boolean existChild;
                if (subCountMap != null) {
                    existChild = subCountMap.get(v.getId()) > 0;
                } else {
                    existChild = catalogRepository.existsByStructureIdAndParentId(v.getStructureId(), v.getId());
                }
                v.setHasChild(existChild);
//                //非公开空间  并且没有下级节点权限
//                if (!publicStructure && authMap.containsKey(v.getId()) && authMap.get(v.getId()).getManageLeafCount() == 0 && authMap.get(v.getId()).getEditLeafCount() == 0) {
//                    v.setHasChild(false);
//                }
                boolean isPub = this.isPublic(v.getCatalogPath(), v.getPublicType(), cacheMap);
                //设置目录访问权限
                v.setAuthType(EnumAuthType.NONE.name());
//                if (authMap.containsKey(v.getId())) {
//                    v.setAuthType(authMap.get(v.getId()).getAuthType().name());
//                }
                if (v.getAuthType().equals(EnumAuthType.NONE.name()) && (publicStructure || isPub)) {
                    v.setAuthType(EnumAuthType.READ.name());
                }
                result.add(v);
            }
        }
        return result;
    }

    protected List<DataAssetsCatalogDto> makeAuthTree(String username, List<DataAssetsCatalogDto> vos, boolean publicStructure, boolean includeRead, Map<Long, Long> subCountMap) {
        Map<Long, CommonCatalog> cacheMap = new HashMap<>();
        List<DataAssetsCatalogDto> result = new ArrayList<>(vos.size());
        Map<Long, DataAssetsCatalogAuthDto> authMap = authService.getAuthMap(username, vos.stream().map(DataAssetsCatalogDto::getId).collect(Collectors.toSet()));
        for (DataAssetsCatalogDto v : vos) {
            //公开空间或者是  本身具有权限 或者是拥有下级目录节点权限 必须展示
            if (publicStructure || (authMap.containsKey(v.getId())
                    && ((includeRead ? authMap.get(v.getId()).getAuthType() != EnumAuthType.NONE : authMap.get(v.getId()).getAuthType().ordinal() > EnumAuthType.READ.ordinal())
                    || authMap.get(v.getId()).getManageLeafCount() > 0
                    || authMap.get(v.getId()).getEditLeafCount() > 0
                    || (includeRead && authMap.get(v.getId()).getReadLeafCount() > 0)))) {
                boolean existChild;
                if (subCountMap != null) {
                    existChild = subCountMap.get(v.getId()) > 0;
                } else {
                    existChild = catalogRepository.existsByStructureIdAndParentId(v.getStructureId(), v.getId());
                }
                v.setHasChild(existChild);
                //非公开空间  并且没有下级节点权限
                if (!publicStructure && authMap.containsKey(v.getId()) && authMap.get(v.getId()).getManageLeafCount() == 0 && authMap.get(v.getId()).getEditLeafCount() == 0) {
                    v.setHasChild(false);
                }
                boolean isPub = this.isPublic(v.getCatalogPath(), v.getPublicType(), cacheMap);
                //设置目录访问权限
                v.setAuthType(EnumAuthType.NONE.name());
                if (authMap.containsKey(v.getId())) {
                    v.setAuthType(authMap.get(v.getId()).getAuthType().name());
                }
                if (v.getAuthType().equals(EnumAuthType.NONE.name()) && (publicStructure || isPub)) {
                    v.setAuthType(null);
                }
                result.add(v);
            }
        }
        return result;
    }

    @Override
    public CatalogExt getCatalogExt(Long catalogId){
        return catalogExtRepository.findByCatalogId(catalogId);
    }

    @Override
    @Transactional
    public void moveArchyForCatalog(CommonCatalog catalog, Long moveParentId) {
        Integer level = catalog.getLevel();
        LOGGER.info("目录层级。。。。" + level);
        if(level < 3){
            //数据架构目录迁移
            LOGGER.info("数据架构目录迁移");
            remoteArchyExtendService.moveArchySubject(catalog.getId(), moveParentId);
        }
        if(level == 3){
            //数据架构业务对象迁移
            LOGGER.info("数据架构业务对象迁移");
            remoteArchyExtendService.moveArchyObject(catalog.getId(), moveParentId);
        }
    }

    @Override
    public CommonCatalogDopExtDto getCommonCatalogDopExtDtoById(Long id) {
        LOGGER.info("开始查询目录信息，ID: {}", id);
        Optional<CommonCatalog> byId = catalogRepository.findById(id);
        if (byId.isPresent()) {
            LOGGER.info("找到目录信息: {}", byId.get().getName());
            CommonCatalogDopExtDto commonCatalogDopExtDto = new CommonCatalogDopExtDto();
            CommonCatalog commonCatalog = byId.get();
            BeanUtils.copyProperties(commonCatalog, commonCatalogDopExtDto);

            try {
                List<CatalogUdpEntryDto> udps = udpService.getObjectUdpByCatalogId(commonCatalog.getCatalogTypeId(), commonCatalog.getId());
                for (CatalogUdpEntryDto udp : udps) {
                    if ("数据主官".equals(udp.getName())) {
                        commonCatalogDopExtDto.setDataUser(udp.getValue());
                    }
                }
            }catch (Exception e) {
                LOGGER.error(e.getMessage());
            }

            
            // 根据层级设置对应的名称属性
            Integer level = commonCatalog.getLevel();
            if (level != null) {
                switch (level) {
                    case 1:
                        // 一级目录：设置lOneName为自己的名称
                        commonCatalogDopExtDto.setlOneName(commonCatalog.getName());
                        commonCatalogDopExtDto.setBuCode(commonCatalog.getCode());
                        break;
                    case 2:
                        // 二级目录：设置lOneName为自己的名称，lTwoName为上级名称
                        commonCatalogDopExtDto.setlOneName(commonCatalog.getName());
                        if (commonCatalog.getParentId() != null) {
                            Optional<CommonCatalog> l1Catalog = catalogRepository.findById(commonCatalog.getParentId());
                            if (l1Catalog.isPresent()) {
                                commonCatalogDopExtDto.setlTwoName(l1Catalog.get().getName());
                                commonCatalogDopExtDto.setBuCode(l1Catalog.get().getCode());
                                commonCatalogDopExtDto.setSubCode(commonCatalog.getCode());
                            }
                        }
                        break;
                    case 3:
                        // 三级目录：设置lOneName为自己的名称，lTwoName为上级名称，lThreeName为上上级名称
                        commonCatalogDopExtDto.setlOneName(commonCatalog.getName());
                        commonCatalogDopExtDto.setSubObjCode(commonCatalog.getCode());
                        if (commonCatalog.getParentId() != null) {
                            Optional<CommonCatalog> l2Catalog = catalogRepository.findById(commonCatalog.getParentId());
                            if (l2Catalog.isPresent()) {
                                commonCatalogDopExtDto.setlTwoName(l2Catalog.get().getName());
                                commonCatalogDopExtDto.setSubCode(l2Catalog.get().getCode());
                                if (l2Catalog.get().getParentId() != null) {
                                    Optional<CommonCatalog> l1Catalog = catalogRepository.findById(l2Catalog.get().getParentId());
                                    if (l1Catalog.isPresent()) {
                                        commonCatalogDopExtDto.setlThreeName(l1Catalog.get().getName());
                                        commonCatalogDopExtDto.setBuCode(l1Catalog.get().getCode());

                                    }
                                }
                            }
                        }
                        break;
                    default:
                        // 其他层级：使用catalogPath进行解析
                        if (commonCatalog.getCatalogPath() != null) {
                            String[] pathParts = commonCatalog.getCatalogPath().split("/");
                            // 0是固定值，从索引1开始才是实际的目录ID
                            if (pathParts.length > 1) {
                                try {
                                    Long l1Id = Long.parseLong(pathParts[1]);
                                    Optional<CommonCatalog> l1Catalog = catalogRepository.findById(l1Id);
                                    if (l1Catalog.isPresent()) {
                                        commonCatalogDopExtDto.setlOneName(l1Catalog.get().getName());
                                    }
                                } catch (NumberFormatException e) {
                                    // 忽略解析错误
                                }
                            }
                            if (pathParts.length > 2) {
                                try {
                                    Long l2Id = Long.parseLong(pathParts[2]);
                                    Optional<CommonCatalog> l2Catalog = catalogRepository.findById(l2Id);
                                    if (l2Catalog.isPresent()) {
                                        commonCatalogDopExtDto.setlTwoName(l2Catalog.get().getName());
                                    }
                                } catch (NumberFormatException e) {
                                    // 忽略解析错误
                                }
                            }
                            if (pathParts.length > 3) {
                                try {
                                    Long l3Id = Long.parseLong(pathParts[3]);
                                    Optional<CommonCatalog> l3Catalog = catalogRepository.findById(l3Id);
                                    if (l3Catalog.isPresent()) {
                                        commonCatalogDopExtDto.setlThreeName(l3Catalog.get().getName());
                                    }
                                } catch (NumberFormatException e) {
                                    // 忽略解析错误
                                }
                            }
                        }
                        break;
                }
            }
            
            LOGGER.info("返回目录扩展信息: {}", commonCatalogDopExtDto.getName());
            return commonCatalogDopExtDto;
        }
        LOGGER.warn("未找到ID为{}的目录信息", id);
        return null;
    }

    @Override
    public Collection<DataAssetsCatalogDto> manageTree(Long structureId, Long catalogId) throws Exception {
        CommonCatalogStructure structure = structureRepository.findById(structureId).orElseThrow(() -> new ItemNotFoundException(msgService.getMessage("structureNotFound")));
        ObjectMapper mapper = new ObjectMapper();

        List<DataAssetsCatalogDto> l1Catalogs = queryVoListByStructureIdAndLevel(structureId, 1);
        List<DataAssetsCatalogDto> l2Catalogs = queryVoListByStructureIdAndLevel(structureId, 2);
        List<DataAssetsCatalogDto> l3Catalogs = queryVoListByStructureIdAndLevel(structureId, 3);

        LOGGER.info("l1Catalogs::{}", mapper.writeValueAsString(l1Catalogs));
        LOGGER.info("l2Catalogs::{}", mapper.writeValueAsString(l2Catalogs));
        LOGGER.info("l3Catalogs::{}", mapper.writeValueAsString(l3Catalogs));

        // 合并所有节点并创建ID到节点的映射
        Map<Long, DataAssetsCatalogDto> nodeMap = new HashMap<>();
        // 处理l1节点（根节点）
        for (DataAssetsCatalogDto node  : l1Catalogs) {
            node.setChildren(new ArrayList<>());
            nodeMap.put(node.getId(), node);
        }

        // 处理l2节点（第二层）
        for (DataAssetsCatalogDto node  : l2Catalogs) {
            DataAssetsCatalogDto parent = nodeMap.get(node.getParentId());
            if (parent != null) {
                if (parent.getChildren() == null) {
                    parent.setChildren(new ArrayList<>());
                }
                parent.getChildren().add(node);
                node.setChildren(new ArrayList<>()); // 初始化children列表
                nodeMap.put(node.getId(), node);
            }
        }

        // 处理l3节点（第三层）
        for (DataAssetsCatalogDto node : l3Catalogs) {
            DataAssetsCatalogDto parent = nodeMap.get(node.getParentId());
            if (parent != null) {
                if (parent.getChildren() == null) {
                    parent.setChildren(new ArrayList<>());
                }
                parent.getChildren().add(node);
                // L3节点没有子节点，无需初始化children
            }
        }
        return l1Catalogs;
    }

    protected List<DataAssetsCatalogDto> queryVoListByStructureIdAndLevel(Long structureId, Integer level) {
        StringBuilder hql = new StringBuilder();
        hql.append("select new com.datablau.data.asset.dto.DataAssetsCatalogDto(")
                .append("c.id,")
                .append("c.parentId,")
                .append("c.name,")
                .append("c.order,")
                .append("c.englishName,")
                .append("c.comment,")
                .append("t.name,")
                .append("c.keyword,")
                .append("c.approver,")
                .append("c.status,")
                .append("c.creator,")
                .append("c.createTime,")
                .append("c.publishTime,")
                .append("c.bm,")
                .append("c.catalogPath,")
                .append("t.assetsType,")
                .append("c.level,")
                .append("c.structureId,")
                .append("c.catalogTypeId,")
                .append("c.code,")
                .append("c.publicType,")
                .append("c.visible,")
                .append("c.butler)")
                .append(" from CommonCatalog c, CommonCatalogType t, CommonCatalogStructure s ")
                .append(" where c.catalogTypeId = t.id and c.structureId = s.id and s.structureType = '").append(EnumStructureType.DATA_ASSETS.name()).append("'")
                .append(" and s.openStatus = true");

        if (structureId != null) {
            hql.append(" and s.id = ").append(structureId);
        }
        if (level != null) {
            hql.append(" and c.level = ").append(level);
        }

        EntityManager em = managerFactory.createEntityManager();
        Query query = em.createQuery(hql.toString());
        List<DataAssetsCatalogDto> resultList = query.getResultList();
        em.close();

        List<String> canAddToAssetConfigM1Type = this.findCanAddAssetsCatalogMetaDataTyeps();

        for (DataAssetsCatalogDto catalogDto : resultList) {
            if (Strings.isNullOrEmpty(catalogDto.getAssetsType())) {
                continue;
            }

            String filterAssetTypes = filterMetaDataType(catalogDto.getAssetsType(), canAddToAssetConfigM1Type);
            catalogDto.setAssetsType(filterAssetTypes);
        }

        return resultList;
    }

//    public static void main(String[] args) {
//        String regex = "^[A-Z][a-zA-Z\\s]*$";
//        boolean matches = Pattern.matches(regex, "ABC aa");
//        System.out.println(matches);
//    }
}



