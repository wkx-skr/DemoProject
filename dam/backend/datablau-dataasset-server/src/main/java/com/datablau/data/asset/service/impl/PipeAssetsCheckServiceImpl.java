package com.datablau.data.asset.service.impl;

import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.enums.AssetsCheckResultType;
import com.datablau.data.asset.jpa.entity.*;
import com.datablau.data.asset.jpa.repository.*;
import com.datablau.data.asset.service.PipeAssetsCheckService;
import com.datablau.data.asset.util.TendencyCheckUserDetailSpecificationUtil;
import com.datablau.data.common.udp.MetadataUdpEntry;
import com.datablau.data.common.udp.MetadataUserDefinedPropertyDto;
import com.datablau.metadata.common.api.DatablauRemoteMetadataService;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.project.api.RemoteMetaDataExtendService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import javax.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-20 15:44
 * @description
 */
@Service
public class PipeAssetsCheckServiceImpl  implements PipeAssetsCheckService {

    private static final Logger logger = LoggerFactory.getLogger(PipeAssetsCheckServiceImpl.class);


    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "username", "cnUsername", "cnCommentRate", "securityLevelRate",
            "bizDescRate", "usageDescRate", "typeMatchRate",
            "tableDescComplianceRate", "batchDate"
    );


    @Autowired
    private ExtDataAssetsRepository extDataAssetsRepository;


    @Autowired
    protected DatablauRemoteMetadataService remoteMetadataService;

    @Autowired
    private CatalogExtRepository catalogExtRepository;

    @Autowired
    private ExtCommonCatalogRepository extCommonCatalogRepository;

    @Autowired
    private TendencyCheckResultRepository tendencyCheckResultRepository;

    @Autowired
    private TendencyCheckUserDetailRepository tendencyCheckUserDetailRepository;

    @Autowired
    private CheckBuNameRepository checkBuNameRepository;

    @Autowired
    private CheckUserNameRepository checkUserNameRepository;


    @Autowired
    private CheckResultHandlerResultRepository checkResultHandlerResultRepository;

    @Autowired
    private CheckBatchRepository checkBatchRepository;

    @Autowired
    private RemoteMetaDataExtendService remoteMetaDataExtendService;




    /**
     *
     *
     //完整性=（中文注释填充率 + 中文注释填充率 + 业务描述填充率 + 使用描述填充率）/ 4
     //准确性= 类型与实际存储类型匹配率；
     //有效性= 表中文名与描述合规率；
     */
    @Override
    public void checkAssetsElement() {
        Set<String> toSaveUsernames = new HashSet<>();
        Set<String> toSaveBuNames = new HashSet<>();
        String batchDate = generateBatchDate();
        // todo 这里存储这个id
        String uuBatchId = generateUniqueId();
        // 获取到存在的资产数据 表和字段类型
        List<DataAssets> dataAssets = extDataAssetsRepository.findByItemTypeIdIn(Arrays.asList(80000005L, 80000004L));
        if (CollectionUtils.isEmpty(dataAssets)){
            logger.info("查询到的资产为空.方法结束");
            return;
        }
        Map<Long,CheckResultHandlerResult> needSaveResultHandlerData = new HashMap<>();
        // 首先 过滤掉表的负责人和业务域是空的数据 并且这部分存在是空的数据数据是需要存储，需要操作人员进行查漏补缺
        // 其中 业务负责人来自于 element 的owner  业务域 挂在资产下其实 业务域就是存在的，所以说可以不考虑进去
        Map<Long, DataAssets> itemIdMap = dataAssets.stream()
                .collect(Collectors.toMap(
                        data -> Long.parseLong(data.getItemId()), // key
                        data -> data,                             // value
                        (existing, replacement) -> replacement
                ));
        List<CatalogExt> allCatalog = catalogExtRepository.findAll();
        Map<Long, CatalogExt> catalogExtMap = new HashMap<>();
        if (!CollectionUtils.isEmpty(allCatalog)){
            catalogExtMap = allCatalog.stream().collect(Collectors.toMap(
                    c -> c.getCatalogId(),
                    c -> c,
                    (c1, c2) -> c1)
            );
        }
        // 获取业务属性
        List<Long> five = dataAssets.stream().filter(o -> !ObjectUtils.isEmpty(o.getCatalogId())).map(DataAssets::getCatalogId).toList();
        List<CommonCatalog> fiveCatalogs =(List<CommonCatalog>) extCommonCatalogRepository.findAllById(five);
        // 映射对象 所属五级目录对应到那个一级目录路径下
        Map<Long,String> buNameMap = new HashMap<>();
        List<Long> tmpOneCatalogs= new ArrayList<>();
        for (CommonCatalog fiveCatalog : fiveCatalogs) {
            String[] split = fiveCatalog.getCatalogPath().split("/");
            // 获取一级目录
            tmpOneCatalogs.add(Long.valueOf(split[1]));

        }
        List<CommonCatalog> oneCatalog = (List<CommonCatalog>) extCommonCatalogRepository.findAllById(tmpOneCatalogs);
        Map<Long, CommonCatalog> catalogMap = oneCatalog.stream()
                .collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (a, b) -> a));

        for (CommonCatalog fiveCatalog : fiveCatalogs) {
            String[] split = fiveCatalog.getCatalogPath().split("/");
            // 获取一级目录
            buNameMap.put(fiveCatalog.getId(),catalogMap.get(Long.valueOf(split[1])).getName());

        }

        // 获取扩展属性

        List<MetadataUserDefinedPropertyDto> tableUdp = remoteMetadataService.getTypeBindUdps(80000004L);
        List<MetadataUserDefinedPropertyDto> columnUdp = remoteMetadataService.getTypeBindUdps(80000005L);
        Map<Long, MetadataUserDefinedPropertyDto> tableUdpMap = new HashMap<>();
        Map<Long, MetadataUserDefinedPropertyDto> columnUdpMap = new HashMap<>();
        if (!CollectionUtils.isEmpty(tableUdp)){
            tableUdpMap = tableUdp.stream().collect(Collectors.toMap(
                    c -> c.getId(),
                    c -> c,
                    (c1, c2) -> c1)
            );
        }
        if (!CollectionUtils.isEmpty(columnUdp)){
            columnUdpMap = columnUdp.stream().collect(Collectors.toMap(
                    c -> c.getId(),
                    c -> c,
                    (c1, c2) -> c1)
            );
        }

        logger.info("开始查询元数据信息");
        // 获取到元数据信息  并开始解析
        // 先分组
        // 中文注释率
        // 安全等级
        // 准确性计算 获取资产的类型 然后在获取祥森那边存储的类型进行比较
        // 有效性较长 计算方式
        Integer sum = dataAssets.size();
        //字段总数
        Integer columnSize = 0;
        // 表总数
        Integer tableSize = 0;

        // 有中文名称的字段
        Integer hasLogicalNameColumnsSize = 0;
        // 有安全等级的字段数量
        Integer hasSafeColumnsSize = 0;

        // 有中文名称的字段
        Integer hasLogicalNameTableSize = 0;
        // 有安全等级的表数量
        Integer hasSafeTableSize = 0;

        // 字段和资产L5类型匹配数量
        Integer hasTypeMatchSize = 0;
        // 业务描述填充率 （只有表有）
        Integer hasBusTableSize = 0;
        // 使用填充率 （只有表有）
        Integer hasUseTableSize = 0;
        // 合规率
        Integer hasComplianceRateSize = 0;
        // 该用户下的统计率
        Map<String, AssetsCheckUserDto>   userRateMap = new HashMap<>();
        // 业务域视角下的统计
        Map<String, AssetsCheckBuDto>   buRateMap = new HashMap<>();

        List<Long> tmpIds = new ArrayList<>(itemIdMap.keySet());

        List<DataObjectDto> objects = remoteMetaDataExtendService.findTableAndFiledByObjectIds(tmpIds);


        // todo 这里还有一个数据源的查询，后面通过objectId 进行去重  但是数据源还没定 所以这里先todo

        // 分组 分出来字段和表。过滤掉
        Map<Long, List<DataObjectDto>> objectMap = objects.stream().collect(Collectors.groupingBy(DataObjectDto::getTypeId));

        for (Map.Entry<Long, List<DataObjectDto>> obm : objectMap.entrySet()) {
            if (obm.getKey().equals(80000005L)) {
                columnSize = obm.getValue().size();
                for (DataObjectDto dataObjectDto : obm.getValue()) {
                    Boolean sign = false;
                    // 当前负责人 以及业务域
                    String tmpCurrentUser = null ;
                    String tmpCurrentBu = null ;
                    // 解析业务率
                    Long currentItemCatalogId = itemIdMap.get(dataObjectDto.getObjectId()).getCatalogId();
                    tmpCurrentBu = buNameMap.get(currentItemCatalogId);
                    // hahahha。妈的不想增加额外的代码了

                    List<MetadataUdpEntry> hasUdps = remoteMetadataService.getUdpsByItemIdAndTypeId(String.valueOf(dataObjectDto.getObjectId()), 80000005L);
                    // 首先需要二者不为空，不然不进行保存
                    if (!CollectionUtils.isEmpty(hasUdps)) {
                        // 优先进行udp 负责人的判断  因为负责人是存储在扩展属性中的
                        for (MetadataUdpEntry udp : hasUdps) {
                            Long id = udp.getId();
                            if (columnUdpMap.containsKey(id)) {
                                MetadataUserDefinedPropertyDto metadataUserDefinedPropertyDto = columnUdpMap.get(id);
                                if ("负责人".equals(metadataUserDefinedPropertyDto.getName())) {
                                    if (!ObjectUtils.isEmpty(udp.getValue())) {
                                            // 当前负责人
                                            tmpCurrentUser = udp.getValue();

                                    }
                                }
                                // 同理 业务也进行判断
                                if ("业务域".equals(metadataUserDefinedPropertyDto.getName())){
                                    if (!ObjectUtils.isEmpty(udp.getValue()) ) {
                                     //   if (!buRateMap.containsKey(udp.getValue())){
                                            // 当前负责人
                                            tmpCurrentBu = udp.getValue();
                                    //    }
                                    }
                                }

                            }

                        }
                    }
                    if (!ObjectUtils.isEmpty(tmpCurrentUser)) {
                        toSaveUsernames.add(tmpCurrentUser);
                        userRateMap.compute(tmpCurrentUser, (k, v) -> {
                            if (v == null) v = new AssetsCheckUserDto();
                            v.incrementColumnSize();
                            return v;
                        });
                    }
                    if (!ObjectUtils.isEmpty(tmpCurrentBu)){
                        toSaveBuNames.add(tmpCurrentBu);
                        buRateMap.compute(tmpCurrentBu, (k, v) -> {
                            if (v == null) v = new AssetsCheckBuDto();
                            v.incrementColumnSize();
                            return v;
                        });
                    }

                    // 如果没有负责人 直接跳过
                    if (ObjectUtils.isEmpty(tmpCurrentUser) || ObjectUtils.isEmpty(tmpCurrentBu)){
                        addCheckResult(needSaveResultHandlerData, dataObjectDto, tmpCurrentBu, tmpCurrentUser, uuBatchId);

                        continue;
                    }


                    // 解析安全
                    if (!CollectionUtils.isEmpty(hasUdps)) {
                        // 优先进行udp 负责人的判断  因为负责人是存储在扩展属性中的
                        for (MetadataUdpEntry udp : hasUdps) {
                            Long id = udp.getId();
                            if (columnUdpMap.containsKey(id)) {
                                MetadataUserDefinedPropertyDto metadataUserDefinedPropertyDto = columnUdpMap.get(id);
                                if ("安全等级".equals(metadataUserDefinedPropertyDto.getName())) {
                                    if (!ObjectUtils.isEmpty(udp.getValue())) {
                                        userRateMap.get(tmpCurrentUser).incrementHasSafeColumnsSize();
                                        buRateMap.get(tmpCurrentBu).incrementHasSafeColumnsSize();
                                        hasSafeColumnsSize ++;
                                    }
                                }
                            }
                        }
                    }
                    //判断是否有 中文名称
                    if (null != dataObjectDto.getLogicalName()){
                        userRateMap.get(tmpCurrentUser).incrementHasLogicalNameColumnsSize();
                        buRateMap.get(tmpCurrentBu).incrementHasLogicalNameColumnsSize();
                        hasLogicalNameColumnsSize++;
                    }

                    Map<String, Object> properties = dataObjectDto.getProperties();
                    String objectDataType = (String) properties.get("DataType");
                    // 元数据的数据类型
                    String odt = cutType(objectDataType.toUpperCase());
                    // 与 祥森存储的字段类型进行比较
                    if (!CollectionUtils.isEmpty(catalogExtMap)){
                        DataAssets tmpDA = itemIdMap.get(dataObjectDto.getObjectId());
                        //不实用cont 直接判空
                        if (!ObjectUtils.isEmpty(tmpDA)){
                            Long catalogId = tmpDA.getCatalogId();
                            CatalogExt catalogExt = catalogExtMap.get(catalogId);
                            if (!ObjectUtils.isEmpty(catalogExt)){
                                // 先判空 因为类型可能有空的可能
                                if (!ObjectUtils.isEmpty(catalogExt.getDataType()) && catalogExt.getDataType().equalsIgnoreCase(odt)){
                                    userRateMap.get(tmpCurrentUser).incrementHasTypeMatchSize();
                                    buRateMap.get(tmpCurrentBu).incrementHasTypeMatchSize();
                                    hasTypeMatchSize ++;
                                }
                            }
                        }
                    }
                }
            }
            // 表的判断
            if (obm.getKey().equals(80000004L)){
                tableSize += obm.getValue().size();
                for (DataObjectDto dataObjectDto : obm.getValue()) {
                    // 当前负责人 以及业务域
                    String tmpCurrentUser  = null;;
                    String tmpCurrentBu  = null;
                    // 解析业务率
                    Long currentItemCatalogId = itemIdMap.get(dataObjectDto.getObjectId()).getCatalogId();
                    tmpCurrentBu = buNameMap.get(currentItemCatalogId);
                    // 解析业务率
                    List<MetadataUdpEntry> hasUdps = remoteMetadataService.getUdpsByItemIdAndTypeId(String.valueOf(dataObjectDto.getObjectId()), 80000004L);
                    if (!CollectionUtils.isEmpty(hasUdps)) {
                        // 优先进行udp 负责人的判断  因为负责人是存储在扩展属性中的
                        for (MetadataUdpEntry udp : hasUdps) {
                            Long id = udp.getId();
                            if (tableUdpMap.containsKey(id)) {
                                MetadataUserDefinedPropertyDto metadataUserDefinedPropertyDto = tableUdpMap.get(id);
                                if ("负责人".equals(metadataUserDefinedPropertyDto.getName())) {
                                    if (!ObjectUtils.isEmpty(udp.getValue())) {
                                        tmpCurrentUser = udp.getValue();
                                    }
                                }
                                // 同理 业务也进行判断 业务域的优先级高于资产 目录一级的数据
                                if ("业务域".equals(metadataUserDefinedPropertyDto.getName())){
                                    if (!ObjectUtils.isEmpty(udp.getValue()) ) {
                                       // if (!buRateMap.containsKey(udp.getValue())){
                                            // 当前负责人
                                            tmpCurrentBu = udp.getValue();
                                      //  }
                                    }
                                }

                            }
                        }
                    }
                    if (!ObjectUtils.isEmpty(tmpCurrentUser)) {
                        toSaveUsernames.add(tmpCurrentUser);
                        userRateMap.compute(tmpCurrentUser, (k, v) -> {
                            if (v == null) v = new AssetsCheckUserDto();
                            v.incrementTableSize();
                            return v;
                        });
                    }
                    if (!ObjectUtils.isEmpty(tmpCurrentBu)){
                        toSaveBuNames.add(tmpCurrentBu);
                        buRateMap.compute(tmpCurrentBu, (k, v) -> {
                            if (v == null) v = new AssetsCheckBuDto();
                            v.incrementTableSize();
                            return v;
                        });
                    }

                    // 如果没有负责人 直接跳过
                    if (ObjectUtils.isEmpty(tmpCurrentUser) || ObjectUtils.isEmpty(tmpCurrentBu)){
                        addCheckResult(needSaveResultHandlerData, dataObjectDto, tmpCurrentBu, tmpCurrentUser, uuBatchId);
                        continue;
                    }


                    //   临时变量
                    String tableCnName = null;;           // 表中文名
                    String busDesc = null;;              // 业务描述
                    String useDesc = null;;             //  使用

                    for (MetadataUdpEntry udp : hasUdps) {
                        Long id = udp.getId();
                        if (tableUdpMap.containsKey(id)) {
                            MetadataUserDefinedPropertyDto metadataUserDefinedPropertyDto = tableUdpMap.get(id);
                            if ("业务描述".equals(metadataUserDefinedPropertyDto.getName())) {
                                if (!ObjectUtils.isEmpty(udp.getValue())){
                                    userRateMap.get(tmpCurrentUser).incrementHasBusTableSize();
                                    buRateMap.get(tmpCurrentBu).incrementHasBusTableSize();
                                    busDesc = udp.getValue();
                                    hasBusTableSize++;
                                }
                            }

                            if ("使用描述".equals(metadataUserDefinedPropertyDto.getName())){
                                if (!ObjectUtils.isEmpty(udp.getValue())){
                                    useDesc = udp.getValue();
                                    userRateMap.get(tmpCurrentUser).incrementHasUseTableSize();
                                    buRateMap.get(tmpCurrentBu).incrementHasUseTableSize();
                                    hasUseTableSize ++;
                                }
                            }

                            if ("安全等级".equals(metadataUserDefinedPropertyDto.getName())){
                                if (!ObjectUtils.isEmpty(udp.getValue())){
                                    userRateMap.get(tmpCurrentUser).incrementHasSafeTableSize();
                                    buRateMap.get(tmpCurrentBu).incrementHasSafeTableSize();
                                    hasSafeTableSize ++;
                                }
                            }


                        }
                    }
                    //判断是否有 中文名称
                    if (null != dataObjectDto.getLogicalName()){
                        tableCnName = dataObjectDto.getLogicalName();
                        userRateMap.get(tmpCurrentUser).incrementHasLogicalNameTableSize();
                        buRateMap.get(tmpCurrentBu).incrementHasLogicalNameTableSize();
                        hasLogicalNameColumnsSize++;
                    }
                    if (isComplianceQualified(tableCnName,busDesc,useDesc)){
                        userRateMap.get(tmpCurrentUser).incrementHasComplianceRateSize();
                        buRateMap.get(tmpCurrentBu).incrementHasComplianceRateSize();
                        hasComplianceRateSize++;
                    }
                }
            }
        }

        // 开始计算 先计算 none 类型的
        // 计算逻辑命名注释率
        BigDecimal logicalCommentRate = BigDecimal.ZERO;
        if (tableSize > 0 && columnSize > 0) {
            BigDecimal tableRate = BigDecimal.valueOf(hasLogicalNameTableSize)
                    .divide(BigDecimal.valueOf(tableSize), 4, RoundingMode.HALF_UP);
            BigDecimal columnRate = BigDecimal.valueOf(hasLogicalNameColumnsSize)
                    .divide(BigDecimal.valueOf(columnSize), 4, RoundingMode.HALF_UP);
            logicalCommentRate = tableRate.add(columnRate)
                    .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else if (tableSize > 0) {
            logicalCommentRate = BigDecimal.valueOf(hasLogicalNameTableSize)
                    .divide(BigDecimal.valueOf(tableSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else if (columnSize > 0) {
            logicalCommentRate = BigDecimal.valueOf(hasLogicalNameColumnsSize)
                    .divide(BigDecimal.valueOf(columnSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

// 计算安全等级填充率
        BigDecimal safeRate = BigDecimal.ZERO;
        if (tableSize > 0 && columnSize > 0) {
            BigDecimal tableRate = BigDecimal.valueOf(hasSafeTableSize)
                    .divide(BigDecimal.valueOf(tableSize), 4, RoundingMode.HALF_UP);
            BigDecimal columnRate = BigDecimal.valueOf(hasSafeColumnsSize)
                    .divide(BigDecimal.valueOf(columnSize), 4, RoundingMode.HALF_UP);
            safeRate = tableRate.add(columnRate)
                    .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else if (tableSize > 0) {
            safeRate = BigDecimal.valueOf(hasSafeTableSize)
                    .divide(BigDecimal.valueOf(tableSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else if (columnSize > 0) {
            safeRate = BigDecimal.valueOf(hasSafeColumnsSize)
                    .divide(BigDecimal.valueOf(columnSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }


        BigDecimal busRate = BigDecimal.ZERO;
        if (tableSize > 0) {
            busRate = BigDecimal.valueOf(hasBusTableSize)
                    .divide(BigDecimal.valueOf(tableSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        BigDecimal useRate = BigDecimal.ZERO;
        if (tableSize > 0) {
            useRate = BigDecimal.valueOf(hasUseTableSize)
                    .divide(BigDecimal.valueOf(tableSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        BigDecimal typeMatchRate = BigDecimal.ZERO;
        if (columnSize > 0) {
            typeMatchRate = BigDecimal.valueOf(hasTypeMatchSize)
                    .divide(BigDecimal.valueOf(columnSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        BigDecimal complianceRate = BigDecimal.ZERO;
        if (tableSize > 0) {
            complianceRate = BigDecimal.valueOf(hasComplianceRateSize)
                    .divide(BigDecimal.valueOf(tableSize), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        BigDecimal integrityRate = logicalCommentRate
                .add(safeRate)
                .add(busRate)
                .add(useRate)
                .divide(BigDecimal.valueOf(4), 4, RoundingMode.HALF_UP);

        // 数据库查询
        //如果存在了数据则进行更新 如果没存在数据直接保存 需要获取到对应id
        List<TendencyCheckResult> exitData = tendencyCheckResultRepository.findByBatchDate(batchDate);
        Map<AssetsCheckResultType, List<TendencyCheckResult>> typeListMap = new HashMap<>();
        if (!CollectionUtils.isEmpty(exitData)){
            // 先基于类型分组 看一下后面是便利 然后封装成三个数据快 还是单纯的 分组快
             typeListMap = exitData.stream()
                     .filter(o -> !ObjectUtils.isEmpty(o.getResultType()))
                     .collect(Collectors.groupingBy(TendencyCheckResult::getResultType));

        }

        List<TendencyCheckResult> toSave = new ArrayList<>();
        // todo 这里只考虑了 增量增的情况 没有考虑到减少的情况。比如 今天上午 这个人还在 但是下午人不存在了  不过这种看业务情况 也不一定算是bug

        TendencyCheckResult tendencyCheckResultNone = new TendencyCheckResult();
        tendencyCheckResultNone.setBatchDate(batchDate);
        tendencyCheckResultNone.setResultType(AssetsCheckResultType.NONE_TYPE);
        tendencyCheckResultNone.setDataIntegrityRate(integrityRate.setScale(2, RoundingMode.HALF_UP));
        tendencyCheckResultNone.setAccuracyRate(typeMatchRate.setScale(2, RoundingMode.HALF_UP));
        tendencyCheckResultNone.setValidityRate(complianceRate.setScale(2, RoundingMode.HALF_UP));
        if (!CollectionUtils.isEmpty(typeListMap) && typeListMap.containsKey(AssetsCheckResultType.NONE_TYPE)){
            List<TendencyCheckResult> tendencyCheckResults = typeListMap.get(AssetsCheckResultType.NONE_TYPE);
            for (TendencyCheckResult tm: tendencyCheckResults) {
                tendencyCheckResultNone.setId(tm.getId());
            }
        }
        toSave.add(tendencyCheckResultNone);
        List<TendencyCheckResult> userTendencyCheckResults = buildUserTendencyResults(userRateMap, batchDate);
        // 处理新增的情况
        mergeExistingUserResults(userTendencyCheckResults,typeListMap);
        toSave.addAll(userTendencyCheckResults);


        List<TendencyCheckUserDetail> tendencyCheckUserDetails = buildUserDetailResults(userRateMap, batchDate);
        List<TendencyCheckUserDetail> exitUserDetailData = tendencyCheckUserDetailRepository.findByBatchDate(batchDate);
        Map<AssetsCheckResultType, List<TendencyCheckUserDetail>> exitMap = new HashMap<>();
        if (!CollectionUtils.isEmpty(exitUserDetailData)) {
            exitMap = exitUserDetailData.stream().filter(o -> !ObjectUtils.isEmpty(o.getResultType()))
                    .collect(Collectors.groupingBy(TendencyCheckUserDetail::getResultType));
        }
        mergeExistingUserDetailResults(tendencyCheckUserDetails, exitMap.get(AssetsCheckResultType.USER_TYPE));


        //todo 业务类型的也要处理和userDetail一样处理
        List<TendencyCheckUserDetail> tendencyCheckBuDetails = new ArrayList<>();
        List<TendencyCheckResult> buTendencyCheckResults = buildBuTendencyResults(buRateMap, batchDate,tendencyCheckBuDetails,exitMap.get(AssetsCheckResultType.BU_TYPE));
        mergeExistingBuResults(buTendencyCheckResults,typeListMap);
        toSave.addAll(buTendencyCheckResults);
        tendencyCheckResultRepository.saveAll(toSave);

        tendencyCheckUserDetails.addAll(tendencyCheckBuDetails);
        tendencyCheckUserDetailRepository.saveAll(tendencyCheckUserDetails);



        // 存储下bu 和 username 即可
        List<CheckResultHandlerResult> handlerResultSave = new ArrayList<>();
        saveNewUsersAndBus(userRateMap, buRateMap,toSaveUsernames,toSaveBuNames);
        if (!CollectionUtils.isEmpty(needSaveResultHandlerData)){
            Set<Long> objIds = needSaveResultHandlerData.keySet();
            List<CheckResultHandlerResult> exitHandlerResult = checkResultHandlerResultRepository.findByObjectIdIn(objIds);

            if (!CollectionUtils.isEmpty(exitHandlerResult)){
                Map<Long, CheckResultHandlerResult> exitHandlerResultMap = exitHandlerResult.stream().collect(Collectors.toMap(CheckResultHandlerResult::getObjectId,
                        c -> c,
                        (c1, c2) -> c1));

                needSaveResultHandlerData.forEach((k,v)->{
                    CheckResultHandlerResult checkResultHandlerResult = exitHandlerResultMap.get(k);
                    if (!ObjectUtils.isEmpty(checkResultHandlerResult)){
                        v.setId(checkResultHandlerResult.getId());
                        handlerResultSave.add(v);
                    }
                    handlerResultSave.add(v);
                });

            }else {
                needSaveResultHandlerData.forEach((k,v)->{
                    handlerResultSave.add(v);
                });
            }
        }
        checkResultHandlerResultRepository.saveAll(handlerResultSave);
        CheckBatch checkBatch = new CheckBatch();
        checkBatch.setBatchNum(uuBatchId);
        checkBatch.setId(1L);
        checkBatchRepository.save(checkBatch);


    }

    @Override
    public List<BuAcRateDto> getBuAcRateWithQuery(CheckQueryDto queryDto) {
        List<TendencyCheckResult> needTranceData = new ArrayList<>();
        if (ObjectUtils.isEmpty(queryDto.getStartTime()) &&  ObjectUtils.isEmpty(queryDto.getEndTime())
        && CollectionUtils.isEmpty(queryDto.getBuName())){
            logger.info("查询全部类型");
            needTranceData= tendencyCheckResultRepository.findByResultType(AssetsCheckResultType.BU_TYPE);
        }else  if(!ObjectUtils.isEmpty(queryDto.getStartTime()) &&  !ObjectUtils.isEmpty(queryDto.getEndTime())
                && !CollectionUtils.isEmpty(queryDto.getBuName())){
            logger.info("查询携带全部条件类型");
            List<String> dateRange = generateDateRange(queryDto.getStartTime(), queryDto.getEndTime());
            needTranceData = tendencyCheckResultRepository.findByBatchDateInAndBuNameInAndResultType(
                    dateRange, queryDto.getBuName(), AssetsCheckResultType.BU_TYPE);

        }else if (ObjectUtils.isEmpty(queryDto.getStartTime()) &&  ObjectUtils.isEmpty(queryDto.getEndTime())
                && !CollectionUtils.isEmpty(queryDto.getBuName())){
            logger.info("查询只有业务名称类型");
            needTranceData = tendencyCheckResultRepository.findByBuNameInAndResultType(queryDto.getBuName(), AssetsCheckResultType.BU_TYPE);
        } else if (!ObjectUtils.isEmpty(queryDto.getStartTime()) &&  !ObjectUtils.isEmpty(queryDto.getEndTime())
                && CollectionUtils.isEmpty(queryDto.getBuName())) {
            logger.info("查询只有时间类型");
            List<String> dateRange = generateDateRange(queryDto.getStartTime(), queryDto.getEndTime());
            needTranceData = tendencyCheckResultRepository.findByBatchDateInAndResultType(
                    dateRange, AssetsCheckResultType.BU_TYPE);

        }else {
            logger.info("查询类型未判断出来");
            needTranceData = tendencyCheckResultRepository.findByResultType(AssetsCheckResultType.BU_TYPE);
        }

        if (CollectionUtils.isEmpty(needTranceData)){
            return Collections.emptyList();
        }


        // 分组并计算平均值
        Map<String, List<TendencyCheckResult>> grouped = needTranceData.stream()
                .collect(Collectors.groupingBy(TendencyCheckResult::getBuName));

        List<BuAcRateDto> result = new ArrayList<>();
        for (Map.Entry<String, List<TendencyCheckResult>> entry : grouped.entrySet()) {
            String bu = entry.getKey();
            List<TendencyCheckResult> list = entry.getValue();

            int size = list.size();
            BigDecimal integrity = list.stream()
                    .map(TendencyCheckResult::getDataIntegrityRate)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);

            BigDecimal accuracy = list.stream()
                    .map(TendencyCheckResult::getAccuracyRate)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);

            BigDecimal validity = list.stream()
                    .map(TendencyCheckResult::getValidityRate)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);

            BuAcRateDto dto = new BuAcRateDto();
            dto.setBuName(bu);
            dto.setDataIntegrityRate(integrity);
            dto.setAccuracyRate(accuracy);
            dto.setValidityRate(validity);
            result.add(dto);
        }

        return result;
    }

    @Override
    public Page<BuAcRateDetailDto> getBuAcUserRateWithQuery(CheckQueryDetailDto param) {
        List<Sort.Order> orders = new ArrayList<>();

        if (param.getSortParams() != null) {
            for (SortParam sortParam : param.getSortParams()) {
                if (ALLOWED_SORT_FIELDS.contains(sortParam.getField())) {
                    Sort.Direction dir = "desc".equalsIgnoreCase(sortParam.getDirection()) ?
                            Sort.Direction.DESC : Sort.Direction.ASC;
                    orders.add(new Sort.Order(dir, sortParam.getField()));
                }
            }
        }

        if (orders.isEmpty()) {
            orders.add(Sort.Order.asc("username"));
        }

        int pageIndex = Math.max(param.getPage() - 1, 0);
        Pageable pageable = PageRequest.of(pageIndex, param.getSize(), Sort.by(orders));
        Specification<TendencyCheckUserDetail> spec = TendencyCheckUserDetailSpecificationUtil.build(param,AssetsCheckResultType.USER_TYPE);
        Page<TendencyCheckUserDetail> all = tendencyCheckUserDetailRepository.findAll(spec, pageable);

        return all.map(TendencyCheckUserDetailSpecificationUtil::toDto);
    }

    @Override
    public Page<BuAcRateDetailDto> getBuAcUBuRateWithQuery(CheckQueryDetailDto param) {
        List<Sort.Order> orders = new ArrayList<>();

        if (param.getSortParams() != null) {
            for (SortParam sortParam : param.getSortParams()) {
                if (ALLOWED_SORT_FIELDS.contains(sortParam.getField())) {
                    Sort.Direction dir = "desc".equalsIgnoreCase(sortParam.getDirection()) ?
                            Sort.Direction.DESC : Sort.Direction.ASC;
                    orders.add(new Sort.Order(dir, sortParam.getField()));
                }
            }
        }

        if (orders.isEmpty()) {
            orders.add(Sort.Order.asc("username"));
        }

        int pageIndex = Math.max(param.getPage() - 1, 0);
        Pageable pageable = PageRequest.of(pageIndex, param.getSize(), Sort.by(orders));
        Specification<TendencyCheckUserDetail> spec = TendencyCheckUserDetailSpecificationUtil.buildBu(param,AssetsCheckResultType.BU_TYPE);
        Page<TendencyCheckUserDetail> all = tendencyCheckUserDetailRepository.findAll(spec, pageable);

        return all.map(TendencyCheckUserDetailSpecificationUtil::toDto);
    }

    @Override
    public List<AssetsDetailResultDto> monthChange(CheckQueryDto dto) {
        List<AssetsDetailResultDto>  result = new ArrayList<>();
        boolean isUserEmpty = CollectionUtils.isEmpty(dto.getUsername());
        boolean isBuEmpty = CollectionUtils.isEmpty(dto.getBuName());

        String start = dto.getStartTime();
        String end = dto.getEndTime();
        if (start == null || end == null) {
            LocalDate now = LocalDate.now();
            end = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            start = now.minusYears(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        }

        if (isUserEmpty && isBuEmpty) {
            List<TendencyCheckResult> rawList = tendencyCheckResultRepository
                    .findByResultTypeAndBatchDateBetween(AssetsCheckResultType.NONE_TYPE, start, end);

            // 按月分组、求平均
             result = rawList.stream()
                    .collect(Collectors.groupingBy(
                            r -> r.getBatchDate().substring(0, 6), // 按年月分组
                            Collectors.collectingAndThen(Collectors.toList(), group -> {
                                BigDecimal dataSum = group.stream()
                                        .map(r -> Optional.ofNullable(r.getDataIntegrityRate()).orElse(BigDecimal.ZERO))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                BigDecimal accSum = group.stream()
                                        .map(r -> Optional.ofNullable(r.getAccuracyRate()).orElse(BigDecimal.ZERO))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                BigDecimal valSum = group.stream()
                                        .map(r -> Optional.ofNullable(r.getValidityRate()).orElse(BigDecimal.ZERO))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                int count = group.size();
                                return new AssetsDetailResultDto(
                                        group.get(0).getBatchDate().substring(0, 6),
                                        dataSum.divide(BigDecimal.valueOf(count), 4, RoundingMode.HALF_UP).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP),
                                        accSum.divide(BigDecimal.valueOf(count), 4, RoundingMode.HALF_UP).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP),
                                        valSum.divide(BigDecimal.valueOf(count), 4, RoundingMode.HALF_UP).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
                                );
                            })
                    ))
                    .values()
                    .stream()
                    .sorted(Comparator.comparing(AssetsDetailResultDto::getMonth))
                    .collect(Collectors.toList());

        }

        if (!isBuEmpty) {
            result = tendencyCheckResultRepository.avgByMonthForBuType(dto.getBuName(), start, end);
        }
        if (!isUserEmpty){
            result = tendencyCheckResultRepository.avgByMonthForUserType(dto.getUsername(), start, end);
        }

        if (!CollectionUtils.isEmpty(result)) {
            result.forEach(dtoItem -> {
                String m = dtoItem.getMonth();
                if (m != null && m.length() == 6) {
                    dtoItem.setMonth(m.substring(0, 4) + "-" + m.substring(4, 6));
                }
                // 修正百分比为小数比率
                dtoItem.setDataIntegrityRate(dtoItem.getDataIntegrityRate().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                dtoItem.setAccuracyRate(dtoItem.getAccuracyRate().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                dtoItem.setValidityRate(dtoItem.getValidityRate().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            });
        }
        return result;

    }

    @Override
    public Page<CheckResultHandlerResult> needHandle(CheckQueryDto queryDto) {
        // 默认分页，如果你以后需要传 pageNum/pageSize，也可以从 queryDto 拆出来
        int page = queryDto.getPageNum();
        int size = queryDto.getPageSize();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Optional<CheckBatch> byId = checkBatchRepository.findById(1L);
        String batchNum = byId.get().getBatchNum();


        Specification<CheckResultHandlerResult> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 批次号相等
            predicates.add(cb.equal(root.get("batchNu"), batchNum));
            // buName 条件
            if (queryDto.getBuName() != null && !queryDto.getBuName().isEmpty()) {
                predicates.add(root.get("buName").in(queryDto.getBuName()));
            }
            // username 条件
            if (queryDto.getUsername() != null && !queryDto.getUsername().isEmpty()) {
                predicates.add(root.get("userName").in(queryDto.getUsername()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return checkResultHandlerResultRepository.findAll(spec, pageable);
    }

    @Override
    public List<CheckResultHandlerResult> exportData(CheckQueryDto queryDto) {
        Optional<CheckBatch> byId = checkBatchRepository.findById(1L);
        String batchNum = byId.get().getBatchNum();

        Specification<CheckResultHandlerResult> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 批次号相等
            predicates.add(cb.equal(root.get("batchNu"), batchNum));
            // buName 条件
            if (queryDto.getBuName() != null && !queryDto.getBuName().isEmpty()) {
                predicates.add(root.get("buName").in(queryDto.getBuName()));
            }
            // username 条件
            if (queryDto.getUsername() != null && !queryDto.getUsername().isEmpty()) {
                predicates.add(root.get("userName").in(queryDto.getUsername()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return checkResultHandlerResultRepository.findAll(spec);
    }

    private List<String> generateDateRange(String start, String end) {
        List<String> dates = new ArrayList<>();
        LocalDate startDate = LocalDate.parse(start, DateTimeFormatter.ofPattern("yyyyMMdd"));
        LocalDate endDate = LocalDate.parse(end, DateTimeFormatter.ofPattern("yyyyMMdd"));

        while (!startDate.isAfter(endDate)) {
            dates.add(startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
            startDate = startDate.plusDays(1);
        }
        return dates;
    }



    private String cutType(String s) {
        if (s.contains("(")) {
            String[] split = s.split("\\(");
            return split[0].trim().toUpperCase();
        } else {
            return s.trim().toUpperCase();
        }
    }


    public static boolean isComplianceQualified(String tableCnName, String busDesc, String useDesc) {
        if (tableCnName == null || tableCnName.length() > 30) {
            return false;
        }
        if (busDesc == null || busDesc.length() < 10) {
            return false;
        }
        // 三者两两不相同
        if (isEqualSafe(tableCnName, busDesc) ||
                isEqualSafe(tableCnName, useDesc) ||
                isEqualSafe(busDesc, useDesc)) {
            return false;
        }

        return true;
    }

    // null 安全的相等判断
    private static boolean isEqualSafe(String a, String b) {
        return a != null && a.equals(b);
    }


    public static String generateBatchDate() {
        return LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
    }




    public List<TendencyCheckResult> buildUserTendencyResults(Map<String, AssetsCheckUserDto> userRateMap, String batchDate) {
        List<TendencyCheckResult> results = new ArrayList<>();


        for (Map.Entry<String, AssetsCheckUserDto> entry : userRateMap.entrySet()) {
            String username = entry.getKey();
            AssetsCheckUserDto dto = entry.getValue();

            BigDecimal tableSize = BigDecimal.valueOf(dto.getTableSize());
            BigDecimal columnSize = BigDecimal.valueOf(dto.getColumnSize());

            // 中文注释率
            BigDecimal logicalRate = BigDecimal.ZERO;
            if (tableSize.compareTo(BigDecimal.ZERO) > 0 && columnSize.compareTo(BigDecimal.ZERO) > 0) {
                // 两者都有值，取平均
                BigDecimal tableRate = BigDecimal.valueOf(dto.getHasLogicalNameTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP);
                BigDecimal columnRate = BigDecimal.valueOf(dto.getHasLogicalNameColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP);
                logicalRate = tableRate.add(columnRate)
                        .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (tableSize.compareTo(BigDecimal.ZERO) > 0) {
                // 只有表有数据
                logicalRate = BigDecimal.valueOf(dto.getHasLogicalNameTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (columnSize.compareTo(BigDecimal.ZERO) > 0) {
                // 只有字段有数据
                logicalRate = BigDecimal.valueOf(dto.getHasLogicalNameColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else {
                // 两者都为0，无法计算
                logicalRate = BigDecimal.ZERO;
            }
            // 安全等级填充率
            BigDecimal safeRate = BigDecimal.ZERO;
            if (tableSize.compareTo(BigDecimal.ZERO) > 0 && columnSize.compareTo(BigDecimal.ZERO) > 0) {
                // 表和字段都有数据，计算平均安全占比
                BigDecimal tableRate = BigDecimal.valueOf(dto.getHasSafeTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP);
                BigDecimal columnRate = BigDecimal.valueOf(dto.getHasSafeColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP);
                safeRate = tableRate.add(columnRate)
                        .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (tableSize.compareTo(BigDecimal.ZERO) > 0) {
                // 只有表有数据
                safeRate = BigDecimal.valueOf(dto.getHasSafeTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (columnSize.compareTo(BigDecimal.ZERO) > 0) {
                // 只有字段有数据
                safeRate = BigDecimal.valueOf(dto.getHasSafeColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else {
                // 表和字段都没有数据
                safeRate = BigDecimal.ZERO;
            }


            // 业务描述填充率
            BigDecimal busRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasBusTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 使用描述填充率
            BigDecimal useRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasUseTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 类型匹配率
            BigDecimal typeMatchRate = columnSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasTypeMatchSize()).divide(columnSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 合规率
            BigDecimal complianceRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasComplianceRateSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 综合完整性
            BigDecimal integrityRate = logicalRate.add(safeRate).add(busRate).add(useRate)
                    .divide(BigDecimal.valueOf(4), 4, RoundingMode.HALF_UP);

            // 准确性 = 类型匹配率
            BigDecimal accuracyRate = typeMatchRate;

            // 有效性 = 合规率
            BigDecimal validityRate = complianceRate;

            // 构造实体
            TendencyCheckResult result = new TendencyCheckResult();
            result.setBatchDate(batchDate);
            result.setUsername(username);
            result.setDataIntegrityRate(integrityRate.setScale(2, RoundingMode.HALF_UP));
            result.setAccuracyRate(accuracyRate.setScale(2, RoundingMode.HALF_UP));
            result.setValidityRate(validityRate.setScale(2, RoundingMode.HALF_UP));
            result.setResultType(AssetsCheckResultType.USER_TYPE);

            // 可选：设置中文用户名、其他字段
            results.add(result);
        }

        return results;
    }



    public List<TendencyCheckResult> buildBuTendencyResults(Map<String, AssetsCheckBuDto> buRateMap, String batchDate) {
        List<TendencyCheckResult> results = new ArrayList<>();

        for (Map.Entry<String, AssetsCheckBuDto> entry : buRateMap.entrySet()) {
            String buName = entry.getKey();
            AssetsCheckBuDto dto = entry.getValue();

            BigDecimal tableSize = BigDecimal.valueOf(dto.getTableSize());
            BigDecimal columnSize = BigDecimal.valueOf(dto.getColumnSize());

            // 中文注释填充率
            BigDecimal logicalRate = BigDecimal.ZERO;
            if (tableSize.compareTo(BigDecimal.ZERO) > 0 && columnSize.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal tableRate = BigDecimal.valueOf(dto.getHasLogicalNameTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP);
                BigDecimal columnRate = BigDecimal.valueOf(dto.getHasLogicalNameColumnsSize()).divide(columnSize, 4, RoundingMode.HALF_UP);
                logicalRate = tableRate.add(columnRate).divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            }

            // 安全等级填充率
            BigDecimal safeRate = BigDecimal.ZERO;
            if (tableSize.compareTo(BigDecimal.ZERO) > 0 && columnSize.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal tableRate = BigDecimal.valueOf(dto.getHasSafeTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP);
                BigDecimal columnRate = BigDecimal.valueOf(dto.getHasSafeColumnsSize()).divide(columnSize, 4, RoundingMode.HALF_UP);
                safeRate = tableRate.add(columnRate).divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            }

            // 业务描述填充率
            BigDecimal busRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasBusTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 使用描述填充率
            BigDecimal useRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasUseTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 类型匹配率
            BigDecimal typeMatchRate = columnSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasTypeMatchSize()).divide(columnSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 合规率
            BigDecimal complianceRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasComplianceRateSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 数据完整性
            BigDecimal integrityRate = logicalRate.add(safeRate).add(busRate).add(useRate)
                    .divide(BigDecimal.valueOf(4), 4, RoundingMode.HALF_UP);

            // 构造结果
            TendencyCheckResult result = new TendencyCheckResult();
            result.setBatchDate(batchDate);
            result.setBuName(buName);
            result.setDataIntegrityRate(integrityRate.setScale(2, RoundingMode.HALF_UP));
            result.setAccuracyRate(typeMatchRate.setScale(2, RoundingMode.HALF_UP));
            result.setValidityRate(complianceRate.setScale(2, RoundingMode.HALF_UP));
            result.setResultType(AssetsCheckResultType.BU_TYPE);

            // 你可以通过 buNameMap 或 extCommonCatalogRepository 查 buId（可选）
            // result.setBuId(...);

            results.add(result);
        }

        return results;
    }




    public List<TendencyCheckResult> buildBuTendencyResults(
            Map<String, AssetsCheckBuDto> buRateMap,
            String batchDate,
            List<TendencyCheckUserDetail> tendencyCheckBuDetails,
            List<TendencyCheckUserDetail> existingBuDetails // 新增参数，用于合并历史
    ) {
        List<TendencyCheckResult> results = new ArrayList<>();
        Map<String, TendencyCheckUserDetail> buDetailMap = existingBuDetails == null
                ? new HashMap<>()
                : existingBuDetails.stream()
                .filter(d -> d.getUsername() != null)
                .collect(Collectors.toMap(TendencyCheckUserDetail::getUsername, d -> d, (a, b) -> b));

        for (Map.Entry<String, AssetsCheckBuDto> entry : buRateMap.entrySet()) {
            String buName = entry.getKey();
            AssetsCheckBuDto dto = entry.getValue();

            BigDecimal tableSize = BigDecimal.valueOf(dto.getTableSize());
            BigDecimal columnSize = BigDecimal.valueOf(dto.getColumnSize());

            // ========== 填充率计算同原有逻辑 ==========
            BigDecimal logicalRate = calculateRate(dto.getHasLogicalNameTableSize(), tableSize, dto.getHasLogicalNameColumnsSize(), columnSize);
            BigDecimal safeRate = calculateRate(dto.getHasSafeTableSize(), tableSize, dto.getHasSafeColumnsSize(), columnSize);
            BigDecimal busRate = divideOrZero(dto.getHasBusTableSize(), tableSize);
            BigDecimal useRate = divideOrZero(dto.getHasUseTableSize(), tableSize);
            BigDecimal typeMatchRate = divideOrZero(dto.getHasTypeMatchSize(), columnSize);
            BigDecimal complianceRate = divideOrZero(dto.getHasComplianceRateSize(), tableSize);
            BigDecimal integrityRate = logicalRate.add(safeRate).add(busRate).add(useRate).divide(BigDecimal.valueOf(4), 4, RoundingMode.HALF_UP);

            // ========== 构建趋势图实体 ==========
            TendencyCheckResult result = new TendencyCheckResult();
            result.setBatchDate(batchDate);
            result.setBuName(buName);
            result.setDataIntegrityRate(integrityRate.setScale(2, RoundingMode.HALF_UP));
            result.setAccuracyRate(typeMatchRate.setScale(2, RoundingMode.HALF_UP));
            result.setValidityRate(complianceRate.setScale(2, RoundingMode.HALF_UP));
            result.setResultType(AssetsCheckResultType.BU_TYPE);
            results.add(result);

            // ========== 构建趋势图明细实体 ==========
            TendencyCheckUserDetail detail = new TendencyCheckUserDetail();
            detail.setUsername(buName);
            detail.setCnUsername(null); // 可补充业务域中文名
            detail.setCnCommentRate(logicalRate.setScale(2, RoundingMode.HALF_UP));
            detail.setSecurityLevelRate(safeRate.setScale(2, RoundingMode.HALF_UP));
            detail.setBizDescRate(busRate.setScale(2, RoundingMode.HALF_UP));
            detail.setUsageDescRate(useRate.setScale(2, RoundingMode.HALF_UP));
            detail.setTypeMatchRate(typeMatchRate.setScale(2, RoundingMode.HALF_UP));
            detail.setTableDescComplianceRate(complianceRate.setScale(2, RoundingMode.HALF_UP));
            detail.setBatchDate(batchDate);
            detail.setResultType(AssetsCheckResultType.BU_TYPE);

            // 合并历史 ID
            if (buDetailMap.containsKey(buName)) {
                detail.setId(buDetailMap.get(buName).getId());
            }

            tendencyCheckBuDetails.add(detail);
        }

        return results;
    }





    public List<TendencyCheckUserDetail> buildUserDetailResults(Map<String, AssetsCheckUserDto> userRateMap, String batchDate) {
        List<TendencyCheckUserDetail> results = new ArrayList<>();

        for (Map.Entry<String, AssetsCheckUserDto> entry : userRateMap.entrySet()) {
            String username = entry.getKey();
            AssetsCheckUserDto dto = entry.getValue();

            BigDecimal tableSize = BigDecimal.valueOf(dto.getTableSize());
            BigDecimal columnSize = BigDecimal.valueOf(dto.getColumnSize());

            // 中文注释填充率
            BigDecimal cnCommentRate = BigDecimal.ZERO;
            if (tableSize.compareTo(BigDecimal.ZERO) > 0 && columnSize.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal tableRate = BigDecimal.valueOf(dto.getHasLogicalNameTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP);
                BigDecimal columnRate = BigDecimal.valueOf(dto.getHasLogicalNameColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP);
                cnCommentRate = tableRate.add(columnRate)
                        .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (tableSize.compareTo(BigDecimal.ZERO) > 0) {
                cnCommentRate = BigDecimal.valueOf(dto.getHasLogicalNameTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (columnSize.compareTo(BigDecimal.ZERO) > 0) {
                cnCommentRate = BigDecimal.valueOf(dto.getHasLogicalNameColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }


            BigDecimal securityLevelRate = BigDecimal.ZERO;
            if (tableSize.compareTo(BigDecimal.ZERO) > 0 && columnSize.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal tableRate = BigDecimal.valueOf(dto.getHasSafeTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP);
                BigDecimal columnRate = BigDecimal.valueOf(dto.getHasSafeColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP);
                securityLevelRate = tableRate.add(columnRate)
                        .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (tableSize.compareTo(BigDecimal.ZERO) > 0) {
                securityLevelRate = BigDecimal.valueOf(dto.getHasSafeTableSize())
                        .divide(tableSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else if (columnSize.compareTo(BigDecimal.ZERO) > 0) {
                securityLevelRate = BigDecimal.valueOf(dto.getHasSafeColumnsSize())
                        .divide(columnSize, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }


            // 业务描述填充率
            BigDecimal bizDescRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasBusTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 使用描述填充率
            BigDecimal usageDescRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasUseTableSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 类型匹配率
            BigDecimal typeMatchRate = columnSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasTypeMatchSize()).divide(columnSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 合规率
            BigDecimal tableDescComplianceRate = tableSize.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.valueOf(dto.getHasComplianceRateSize()).divide(tableSize, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            // 构建详情实体
            TendencyCheckUserDetail detail = new TendencyCheckUserDetail();
            detail.setUsername(username);
            detail.setCnCommentRate(cnCommentRate.setScale(2, RoundingMode.HALF_UP));
            detail.setSecurityLevelRate(securityLevelRate.setScale(2, RoundingMode.HALF_UP));
            detail.setBizDescRate(bizDescRate.setScale(2, RoundingMode.HALF_UP));
            detail.setUsageDescRate(usageDescRate.setScale(2, RoundingMode.HALF_UP));
            detail.setTypeMatchRate(typeMatchRate.setScale(2, RoundingMode.HALF_UP));
            detail.setTableDescComplianceRate(tableDescComplianceRate.setScale(2, RoundingMode.HALF_UP));
            detail.setBatchDate(batchDate);
            detail.setResultType(AssetsCheckResultType.USER_TYPE);

            results.add(detail);
        }

        return results;
    }



    private void mergeExistingUserResults(List<TendencyCheckResult> userTendencyCheckResults, Map<AssetsCheckResultType, List<TendencyCheckResult>> typeListMap) {
        if (CollectionUtils.isEmpty(typeListMap)
                || CollectionUtils.isEmpty(userTendencyCheckResults)
                || !typeListMap.containsKey(AssetsCheckResultType.USER_TYPE)) {
            return;
        }

        Map<String, TendencyCheckResult> userTmMap = typeListMap.get(AssetsCheckResultType.USER_TYPE).stream()
                .filter(o -> !ObjectUtils.isEmpty(o.getCnUsername()))
                .collect(Collectors.toMap(
                        TendencyCheckResult::getUsername,
                        o -> o,
                        (existing, replacement) -> replacement // 如果 key 重复，保留后者
                ));

        for (TendencyCheckResult u : userTendencyCheckResults) {
            TendencyCheckResult tendencyCheckResult = userTmMap.get(u.getUsername());
            if (!ObjectUtils.isEmpty(tendencyCheckResult)) {
                u.setId(tendencyCheckResult.getId());
            }
        }
    }

    private void mergeExistingBuResults(List<TendencyCheckResult> userTendencyCheckResults, Map<AssetsCheckResultType, List<TendencyCheckResult>> typeListMap) {
        if (CollectionUtils.isEmpty(typeListMap)
                || CollectionUtils.isEmpty(userTendencyCheckResults)
                || !typeListMap.containsKey(AssetsCheckResultType.BU_TYPE)) {
            return;
        }

        Map<String, TendencyCheckResult> userTmMap = typeListMap.get(AssetsCheckResultType.BU_TYPE).stream()
                .filter(o -> !ObjectUtils.isEmpty(o.getCnUsername()))
                .collect(Collectors.toMap(
                        TendencyCheckResult::getBuName,
                        o -> o,
                        (existing, replacement) -> replacement // 如果 key 重复，保留后者
                ));

        for (TendencyCheckResult u : userTendencyCheckResults) {
            TendencyCheckResult tendencyCheckResult = userTmMap.get(u.getBuName());
            if (!ObjectUtils.isEmpty(tendencyCheckResult)) {
                u.setId(tendencyCheckResult.getId());
            }
        }
    }



    private void mergeExistingUserDetailResults(List<TendencyCheckUserDetail> newDetails, List<TendencyCheckUserDetail> existingDetails) {
        if (CollectionUtils.isEmpty(existingDetails)) return;

        Map<String, TendencyCheckUserDetail> userDetailMap = existingDetails.stream()
                .filter(o -> !ObjectUtils.isEmpty(o.getUsername()))
                .collect(Collectors.toMap(
                        TendencyCheckUserDetail::getUsername,
                        o -> o,
                        (existing, replacement) -> replacement // 冲突保留后者
                ));

        for (TendencyCheckUserDetail detail : newDetails) {
            TendencyCheckUserDetail existing = userDetailMap.get(detail.getUsername());
            if (existing != null) {
                detail.setId(existing.getId());
            }
        }
    }



    private void saveNewUsersAndBus(Map<String, ?> userRateMap, Map<String, ?> buRateMap ,Set<String> allUserData,Set<String> allBuNameData) {
        // 安全获取已有用户名集合
        Set<String> existingUsernames = StreamSupport.stream(
                        Optional.ofNullable(checkUserNameRepository.findAll())
                                .orElseGet(Collections::emptyList)
                                .spliterator(), false)
                .map(CheckUserName::getUsername)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 安全获取已有业务域集合
        Set<String> existingBuNames = StreamSupport.stream(
                        Optional.ofNullable(checkBuNameRepository.findAll())
                                .orElseGet(Collections::emptyList)
                                .spliterator(), false)
                .map(CheckBuName::getBuName)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 新增用户名
        List<CheckUserName> newUsers = allUserData.stream()
                .filter(Objects::nonNull)
                .filter(username -> !existingUsernames.contains(username))
                .map(username -> {
                    CheckUserName cu = new CheckUserName();
                    cu.setUsername(username);
                    return cu;
                })
                .collect(Collectors.toList());

        // 新增业务域名
        List<CheckBuName> newBus = allBuNameData.stream()
                .filter(Objects::nonNull)
                .filter(buName -> !existingBuNames.contains(buName))
                .map(buName -> {
                    CheckBuName bu = new CheckBuName();
                    bu.setBuName(buName);
                    return bu;
                })
                .collect(Collectors.toList());

        // 批量保存
        if (!newUsers.isEmpty()) {
            checkUserNameRepository.saveAll(newUsers);
        }
        if (!newBus.isEmpty()) {
            checkBuNameRepository.saveAll(newBus);
        }
    }



    private BigDecimal calculateRate(int tableMatched, BigDecimal tableSize, int columnMatched, BigDecimal columnSize) {
        boolean hasTable = tableSize.compareTo(BigDecimal.ZERO) > 0;
        boolean hasColumn = columnSize.compareTo(BigDecimal.ZERO) > 0;

        if (hasTable && hasColumn) {
            BigDecimal tableRate = BigDecimal.valueOf(tableMatched)
                    .divide(tableSize, 4, RoundingMode.HALF_UP);
            BigDecimal columnRate = BigDecimal.valueOf(columnMatched)
                    .divide(columnSize, 4, RoundingMode.HALF_UP);
            return tableRate.add(columnRate)
                    .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else if (hasTable) {
            return BigDecimal.valueOf(tableMatched)
                    .divide(tableSize, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else if (hasColumn) {
            return BigDecimal.valueOf(columnMatched)
                    .divide(columnSize, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else {
            return BigDecimal.ZERO;
        }
    }


    private BigDecimal divideOrZero(int matched, BigDecimal total) {
        return total.compareTo(BigDecimal.ZERO) > 0
                ? BigDecimal.valueOf(matched).divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
    }




    public  String generateUniqueId() {
        return System.currentTimeMillis() + "-" + UUID.randomUUID();
    }



    public void addCheckResult(
            Map<Long, CheckResultHandlerResult> resultMap,
            DataObjectDto dataObjectDto,
            String tmpCurrentBu,
            String tmpCurrentUser,
            String uuBatchId
    ) {
        CheckResultHandlerResult result = new CheckResultHandlerResult();
        result.setId(dataObjectDto.getObjectId()+uuBatchId);
        result.setBuName(tmpCurrentBu);
        result.setUserName(tmpCurrentUser);
        result.setBatchNu(uuBatchId);
        result.setObjectId(dataObjectDto.getObjectId());
        result.setTypeId(dataObjectDto.getTypeId());
        result.setEnName(dataObjectDto.getLogicalName());
        result.setCnName(dataObjectDto.getPhysicalName());

        resultMap.put(dataObjectDto.getObjectId(), result);
    }


}
