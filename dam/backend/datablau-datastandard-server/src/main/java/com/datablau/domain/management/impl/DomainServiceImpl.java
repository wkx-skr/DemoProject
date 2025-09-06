package com.datablau.domain.management.impl;

import com.andorj.common.core.cache.AndorjLoadingCache;
import com.andorj.common.core.data.CommonPair;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.andorj.model.common.search.QueryBuilderHelper;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.ExcelUpdater;
import com.andorj.model.common.utility.GeneralUtility;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.andorj.model.common.utility.postgres.PostgresUtil;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.api.TagService;
import com.datablau.base.data.BaseModelCategory;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.api.impl.KafkaPublishService;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.restApi.RestApiDescriptorSimple;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.data.common.util.RestApiExporter;
import com.datablau.domain.management.api.*;
import com.datablau.domain.management.api.metric.ModifierTypeService;
import com.datablau.domain.management.config.PublishConfiguration;
import com.datablau.domain.management.data.CategoryType;
import com.datablau.domain.management.data.DataStandardType;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.data.MetricType;
import com.datablau.domain.management.data.StandardCodeType;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.dto.base.CompareCodeDto;
import com.datablau.domain.management.es.utilty.DatablauSearchIndexConfig;
import com.datablau.domain.management.es.utilty.DomainDataSynchronizer;
import com.datablau.domain.management.job.LocalJobRegistryAdapter;
import com.datablau.domain.management.jpa.entity.*;
import com.datablau.domain.management.jpa.entity.dto.DimensionCode;
import com.datablau.domain.management.jpa.entity.metric.Dimension;
import com.datablau.domain.management.jpa.entity.metric.DimensionValue;
import com.datablau.domain.management.jpa.entity.metric.MetricMapping;
import com.datablau.domain.management.jpa.repository.*;
import com.datablau.domain.management.jpa.repository.metric.DimensionRepository;
import com.datablau.domain.management.jpa.repository.metric.DimensionValueRepository;
import com.datablau.domain.management.jpa.repository.metric.MetricMappingRepository;
import com.datablau.domain.management.jpa.type.DatablauDomainType;
import com.datablau.domain.management.jpa.type.ModifierTypeCategory;
import com.datablau.domain.management.mq.message.DeleteStandardCodeMessage;
import com.datablau.domain.management.mq.message.UpdateDataStandardMessage;
import com.datablau.domain.management.mq.message.UpdateStandardCodeMessage;
import com.datablau.domain.management.type.PermissionLevel;
import com.datablau.domain.management.type.PermissionType;
import com.datablau.domain.management.utility.DataUtility;
import com.datablau.domain.management.utility.DatablauUtility;
import com.datablau.domain.management.utility.DomainConvertUtils;
import com.datablau.domain.management.utility.DomainGraphHelper;
import com.datablau.domain.management.utility.DomainSynonymGraphHelper;
import com.datablau.domain.management.utility.FileUtility;
import com.datablau.domain.management.utility.RemoteServiceGetter;
import com.datablau.graph.data.service.api.GraphObjectProcessor;
import com.datablau.graph.data.util.SaveType;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.job.scheduler.data.JobParameterBuilder;
import com.datablau.job.scheduler.data.JobParameterType;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.project.api.RemoteBaseExtendService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.OrganizationTreeDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.utils.AuthTools;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.redisson.api.LocalCachedMapOptions;
import org.redisson.api.RBucket;
import org.redisson.api.RMap;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Pair;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.util.CollectionUtils;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import java.awt.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @author Nicky - 数语科技有限公司
 * date 2021/3/26 15:32
 */
public class DomainServiceImpl implements DomainService, DomainTagService, DomainInternalService,
        DomainStatisticsService {
    private static final Logger logger = LoggerFactory.getLogger(DomainService.class);
    public static final String REDIS_UDP_MAP = "datablau_domain_udp";
    public static final String REDIS_FOLDER_ROOT = "datablau_domain_root";
    public static final Long REDIS_FOLDER_ROOT_LIVE_TIME = 3600L;
    public static final NamingStandard EMPTY_NS = new NamingStandard();

    public static final String QUERY_LAST_YEAR_DOMAIN_ORACLE
            = "select extract(year from dd.last_modify) y, extract(month from dd.last_modify) m, count(domain_id) \n"
            + "from db_domain dd\n"
            + "where dd.last_modify > add_months(sysdate, -12)\n"
            + "group by extract(year from dd.last_modify), extract(month from dd.last_modify)";

    public static final String QUERY_LAST_YEAR_VER_DOMAIN_ORACLE
            = "select extract(year from dd.last_modify) y, extract(month from dd.last_modify) m, count(domain_id) \n"
            + "from db_domain_ver dd \n"
            + "where dd.last_modify > add_months(sysdate, -12)\n"
            + "group by extract(year from dd.last_modify), extract(month from dd.last_modify)";

    public static final String QUERY_LAST_YEAR_DOMAIN_MYSQL
            = "select year(dd.last_modify) y, month(dd.last_modify) m, count(domain_id) \n"
            + "from db_domain dd \n"
            + "where dd.last_modify > date_add(current_timestamp, interval -12 month)\n"
            + "group by year(dd.last_modify), month(dd.last_modify)";

    public static final String QUERY_LAST_YEAR_VER_DOMAIN_MYSQL
            = "select year(dd.last_modify) y, month(dd.last_modify) m, count(domain_id) \n"
            + "from db_domain_ver dd \n"
            + "where dd.last_modify > date_add(current_timestamp, interval -12 month)\n"
            + "group by year(dd.last_modify), month(dd.last_modify)";

    public static final String QUERY_LAST_YEAR_DOMAIN_POSTGRESQL
            = "select year(dd.last_modify) y, month(dd.last_modify) m, count(domain_id) \n"
            + "from db_domain dd \n"
            + "where dd.last_modify > (now()::timestamp + '-1 year')\n"
            + "group by year(dd.last_modify), month(dd.last_modify)";

    public static final String QUERY_LAST_YEAR_VER_DOMAIN_POSTGRESQL
            = "select extract(year from dd.last_modify) y, extract(month from dd.last_modify) m, count(domain_id) \n"
            + "from db_domain_ver dd \n"
            + "where dd.last_modify > (now()::timestamp + '-1 year')\n"
            + "group by extract(year from dd.last_modify), extract(month from dd.last_modify)";

    public static final String DEFAULT_CAT_KEY = "@@cats@@";
    @Autowired
    public DomainRepository domainRepo;
    @Autowired
    public DomainExtRepository domainExtRepo;
    @Autowired
    public StandardCodeRepository standardCodeRepo;
    @Autowired
    private StandardCodeFolderRelaRepository standardCodeFolderRelaRepo;
    @Autowired
    public DomainAssignmentRepository domainAssignmentRepo;
    @Autowired
    public RedissonClient redissonClient;
    @Autowired
    public MessageService msgService;
    @Autowired
    public DomainUdpRepository domainUdpRepo;
    @Autowired
    public DomainFolderRepository domainFolderRepo;
    @Autowired
    public EditHistoryRepository editHistoryRepo;
    @Autowired
    public EntityManagerFactory entityManagerFactory;
    @Autowired
    public DiscardStandardCodeRepository discardStandardCodeRepo;
    @Autowired
    public PrivateDomainFolderRepository privateDomainFolderRepo;
    @Autowired
    public PrivateDomainRepository privateDomainRepo;
    @Autowired
    public PrivateStandardCodeRepository privateStdCodeRepo;
    @Autowired
    public NamingStandardRepository namingStandardRepo;
    @Autowired
    public NamingStandardRepositoryExtend namingStandardExtendRepo;
    @Autowired
    public PrivateNamingStandardRepository privateNamingstandardRepo;
    @Autowired
    public StandardCodeVersionRepository standardCodeVerRepo;
    @Autowired
    public DomainVersionRepository domainVersionRepo;
    @Autowired
    public DomainDataSynchronizer domainDataSynchronizer;
    @Autowired
    public DatablauSearchIndexConfig datablauSearchIndexConfig;
    @Autowired
    public DomainService self;
    @Autowired
    public MultiConditionQueryUtils queryUtils;
    @Autowired
    public PublishConfiguration publishConfiguration;
    @Autowired
    public DomainCategoryPermissionService domainCategoryPermissionService;
    @Autowired
    public ExcelLoader excelLoader;
    @Autowired
    public UserService userService;
    @Autowired
    public DomainFolderAccessListRepository domainFolderAccessListRepo;
    @Autowired
    public JdbcTemplate jdbcTemplate;
    @Autowired
    public DimensionRepository dimensionRepository;
    @Autowired
    public MetricMappingRepository metricMappingRepository;
    @Autowired
    public DimensionValueRepository dimensionValueRepository;
    @Autowired
    public DomainCodeGenerateService generateService;
    @Autowired
    public StandardService standardService;
    @Autowired
    public PlatformTransactionManager txManager;
    @Autowired
    public ModifierTypeService modifierTypeService;
    @Autowired
    public TagService tagService;
    @Autowired
    public DataRuleService dataRuleService;
    @Autowired
    public FileUtility fileUtility;
    @Autowired
    @Qualifier("organizationService")
    private OrganizationService organizationService;
    @Autowired
    @Qualifier("modelCategoryService")
    private ModelCategoryService modelCategoryService;
    @Autowired
    private StandardCodeSourceRepository standardCodeSourceRepo;

    @Autowired
    private RemoteDataAssetExtendService remoteDataAssetExtendService;

    @Value("${datablau.kafka-topic.domain-update:datablau-domain.domain.update}")
    public String updateDomainTopic;
    @Value("${datablau.kafka-topic.standard-update:datablau-domain.standard.update}")
    public String updateStandardTopic;
    @Value("${datablau.kafka-topic.standard-delete:datablau-domain.standard.delete}")
    public String deleteStandardTopic;
    @Value("${datablau.graph.enable:false}")
    public boolean graphEnable;
    @Value("${datablau.db.driver-class-name}")
    public String driverClassName;
    @Value("${datablau.workflow.enable:true}")
    public boolean workflowEnable;
    @Value("${datablau.ddm.server.loadDomainExtraAttributes}")
    private String loadDomainExtraAttributes;
    @Value("${common.dam.connectable:true}")
    public boolean damConnectable;
    @Value("${common.kafka.sync.batch:3000}")
    public int kafkaSyncBatchSize;

    @Autowired
    private ApplyService applyService;

    public GraphObjectProcessor graphObjectProcessor;
    public Map<DomainState, List<DomainState>> expandedStateMap = new HashMap<>();

    public static final String DOMAIN_CODE_KEY = "domain_code";
    public static final String PATH_KEY = "path";
    public static final long METRIC_ROOT_PATH = 2L;
    public LoadingCache<String, Set<String>> domainCodeCache = CacheBuilder.newBuilder()
        .expireAfterWrite(Duration.ofSeconds(10))
        .build(new CacheLoader<>() {
            @Override
            public Set<String> load(String key) throws Exception {
                List<String> domainCodes = domainRepo.findAllDomainCodes();

                return domainCodes.stream().map(c->c.toLowerCase()).collect(Collectors.toSet());
            }
        });

    public LoadingCache<Long, Set<String>> businessNameCache = CacheBuilder.newBuilder()
        .expireAfterWrite(Duration.ofSeconds(10))
        .build(new CacheLoader<>() {
            @Override
            public Set<String> load(Long categoryId) throws Exception {
                return domainRepo.findChineseNameByCategoryId(categoryId)
                    .stream().map(c->c.toLowerCase()).collect(Collectors.toSet());
            }
        });

    public RMap<Long, List<DomainUdpDto>> udpMap;

    @Value("${datablau.ddm.server.loadIndex:false}")
    public boolean loadIndex;

    public QueryBuilderHelper datasourceQueryHelper;

    //Please be careful, this only stores folder structure, no domain/udp in this object
    public RBucket<DomainTreeNodeDto> domainTreeRoot;
    public LoadingCache<String, List<String>> categoryCache = new AndorjLoadingCache(
            DomainService.class,
            "categoryCache",
            CacheBuilder.newBuilder()
                    .expireAfterWrite(10, TimeUnit.SECONDS),
            new CacheLoader<String, List<String>>() {
                @Override
                public List<String> load(String key) throws Exception {
                    if (DEFAULT_CAT_KEY.equals(key)) {
                        return namingStandardRepo.findDistinctCategories();
                    } else {
                        return null;
                    }
                }
            }
    );

    public LoadingCache<Long, StatisticsDto> statisticsCache = new AndorjLoadingCache(
            DomainService.class,
            "statisticCache",
            CacheBuilder.newBuilder().expireAfterWrite(1, TimeUnit.MINUTES),
            new CacheLoader<Long, StatisticsDto>() {
                @Override
                public StatisticsDto load(Long categoryId) throws Exception {
                    List<Object[]> domainValues = domainRepo
                            .getDomainStatistics(DomainService.DOMAIN_CATEGORY_ID);
                    List<Object[]> metricValues = domainRepo
                            .getDomainStatistics(DomainService.INDEX_CATEGORY_ID);
                    List<Object[]> stdCodeValues = standardCodeRepo
                            .getCodeStatistics(DomainService.DOMAIN_CATEGORY_ID);

                    StatisticsDto result = new StatisticsDto();
                    fillUpStatistics(domainValues, result, LDMTypes.oDataStandard);
                    fillUpStatistics(metricValues, result, LDMTypes.oMetrics);
                    fillUpStatistics(stdCodeValues, result, LDMTypes.oDataStandardCode);
                    result.setNamingStandard(namingStandardRepo.count());
                    result.setDomainStandard(domainRepo.getDomainDataStandardCount());

                    return result;
                }
            }
    );
    public LoadingCache<Long, DomainChartDto> chartCache = new AndorjLoadingCache(
            DomainService.class,
            "chartCache",
            CacheBuilder.newBuilder().expireAfterWrite(1, TimeUnit.DAYS),
            new CacheLoader<Long, DomainChartDto>() {
                @Override
                public DomainChartDto load(Long key) throws Exception {
                    String domainSql = QUERY_LAST_YEAR_DOMAIN_ORACLE;
                    String domainVerSql = QUERY_LAST_YEAR_VER_DOMAIN_ORACLE;

                    if (driverClassName.toLowerCase().contains("mysql")) {
                        domainSql = QUERY_LAST_YEAR_DOMAIN_MYSQL;
                        domainVerSql = QUERY_LAST_YEAR_VER_DOMAIN_MYSQL;
                    }
                    if (driverClassName.toLowerCase().contains(PostgresUtil.DRIVER_SIMPLE_POSTGRESQL)) {
                        domainSql = QUERY_LAST_YEAR_DOMAIN_POSTGRESQL;
                        domainVerSql = QUERY_LAST_YEAR_VER_DOMAIN_POSTGRESQL;
                    }
                    //只统计version里面的
                    //List<MonthlyDomainData> data = jdbcTemplate.query(domainSql, new MonthlyResultRowExtractor());
                    List<MonthlyDomainData> verData = jdbcTemplate
                            .query(domainVerSql, new MonthlyResultRowExtractor());

                    DomainChartDto result = new DomainChartDto();
                    //只统计version里面的
                    result.setData(new ArrayList<>());
                    result.mergeData(verData);
                    result.sort();
                    return result;
                }
            }
    );
    public LoadingCache<Long, Map<String, String>> domainChineseNames = CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build(new CacheLoader<Long, Map<String, String>>() {
                @Override
                public Map<String, String> load(Long key) throws Exception {
                    List<Object[]> entries = domainRepo.findAllChineseNameInCategory(key);
                    Map<String, String> lowercaseNames = new HashMap<>();

                    for (Object[] entry : entries) {
                        if (Strings.isNullOrEmpty((String) entry[1])) {
                            continue;
                        }
                        lowercaseNames.put((entry[1]).toString().toLowerCase(), (String) entry[0]);
                    }

                    return lowercaseNames;
                }
            });

    public GraphObjectProcessor getGraphObjectProcessor() {
        if (graphObjectProcessor == null) {
            this.graphObjectProcessor = BeanHelper.getBean(GraphObjectProcessor.class);
        }

        return this.graphObjectProcessor;
    }

    @Override
    public DomainInheritNodeDto getInheritDomains(Long categoryId) {
        Map<String, DomainInheritNodeDto> nodeMap = new HashMap<>();
        DomainInheritNodeDto root = new DomainInheritNodeDto();
        root.setDomainId("_root");
        root.setChineseName("root");
        root.setAbbreviation("root");
        nodeMap.put(root.getDomainId(), root);

        for (DomainInheritNodeDto domain : domainRepo
                .findAllInheritDomainsOfCategory(categoryId)) {
            nodeMap.put(domain.getDomainId(), domain);
            if (domain.getParentDomainId() == null) {
                domain.setParentDomainId(root.getDomainId());
            }
        }

        for (DomainInheritNodeDto node : nodeMap.values()) {
            DomainInheritNodeDto parentNode = nodeMap.get(node.getParentDomainId());
            if (parentNode != null) {
                parentNode.addChild(node);
            }
        }

        return root;
    }

    @Override
    @Transactional
    public void saveUserPrivateNamingStandards(Collection<NamingStandardDto> namingStandards) {
        List<PrivateNamingStandard> privateNamingStandards = convertToListPrivateNamingStandards(
                namingStandards);
        Long timestamp = System.currentTimeMillis();

        String user = null;
        for (PrivateNamingStandard privateNamingStandard : privateNamingStandards) {
            privateNamingStandard.setNsId(null);
            privateNamingStandard.setTimestamp(timestamp);
            checkNamingStandard(privateNamingStandard);
            if (user == null) {
                user = privateNamingStandard.getOwner();
            }
        }

        privateNamingstandardRepo.deleteNamingStandardsOfUser(user);
        privateNamingstandardRepo.saveAll(privateNamingStandards);
    }

    @Override
    public List<DomainDto> loadDomains(DomainState state, Long categoryId, String currentUser) {
        List<DomainDto> domainDtoList = null;
        if (state == null) {
            domainDtoList = convertToListDomainDto(domainRepo.findAllByCategoryIdEquals(categoryId));
        } else if (state.equals(DomainState.A)) {
            domainDtoList = convertToListDomainDto(
                    domainRepo.findAllByStateEqualsAndCategoryIdEquals(state, categoryId));
        } else {
            domainDtoList = convertToListDomainDto(
                    domainAssignmentRepo.findDomains(currentUser, expandedStateMap.get(state)));
        }
        return convertDomainSomePropertiesIdToName(domainDtoList);
    }

    @Override
    public List<DomainDto> loadUserAccessibleDomains(String currentUser) {
        List<Long> categoryIds = new ArrayList<>();
        for (UserAccessibleCategoryDto uac : domainCategoryPermissionService
                .getUserAccessibleCategories(currentUser, loadIndex)) {
            if (!PermissionLevel.NONE.equals(uac.getPermissionLevel())) {
                categoryIds.add(uac.getCategory().getId());
            }
        }

        List<DomainDto> res = new LinkedList<>();
        for (List<Long> partition : Lists.partition(categoryIds, 999)) {
            res.addAll(convertToListDomainDto(
                    domainRepo.findAllPublishedDomainsByCategoryIdIn(partition)));
        }

        return res;
    }

    /**
     * 该方法会返回时间戳之后的"已发布"和“已废弃”的数据标准
     *
     * @param currentUser 用户
     * @param timestamp   时间戳
     * @return
     */
    @Override
    public List<LocalDomainDto> loadUserAccessibleDomainsAfterTimestamp(String currentUser, Long timestamp, Integer apiVersion) {

        // 1.查询当前用户拥有权限的目录列表
        List<Long> categoryIds = new ArrayList<>();
        for (UserAccessibleCategoryDto uac : domainCategoryPermissionService
                .getUserAccessibleCategories(currentUser, loadIndex)) {
            if (!PermissionLevel.NONE.equals(uac.getPermissionLevel())) {
                categoryIds.add(uac.getCategory().getId());
            }
        }

        // 2.组装UdpMap[key=categoryId, value=udpIds], 在DTO转换时需要使用
        Map<Long, List<Long>> udpIdMap = new HashMap<>();
        if (udpMap != null) {
            for (Long id : udpMap.keySet()) {
                udpIdMap.put(id, udpMap.get(id).stream().map(DomainUdpDto::getUdpId).collect(Collectors.toList()));
            }
        }

        // 3.从数据库查询所有公共标准，并转换为LocalDomainDto
        List<Domain> allPublicDomains = new LinkedList<>();
        if (timestamp == null || timestamp.equals(0L)) {
            for (List<Long> partition : Lists.partition(categoryIds, 999)) {
                allPublicDomains.addAll(domainRepo.findAllPublishedDomainsByCategoryIdIn(partition));
            }
        } else {
            List<DomainState> states = new ArrayList<>();
            Collections.addAll(states, DomainState.A, DomainState.X);
            for (List<Long> partition : Lists.partition(categoryIds, 999)) {
                allPublicDomains.addAll(domainRepo.findDomainsByLastReviewAfterAndStateInAndCategoryIdIn(
                        new Date(timestamp), states, partition));
            }
        }

        // 4.查询关联标准、部门、系统为构建数据标准额外属性到UDP做准备
        Set<DomainExtraAttributesUdp> extraAttributes = new HashSet<>();
        if (!Strings.isNullOrEmpty(loadDomainExtraAttributes)) {
            for (String attr : loadDomainExtraAttributes.split(",")) {
                extraAttributes.add(DomainExtraAttributesUdp.valueOf(attr));
            }
        }
        Set<String> relationDomainCodes = new HashSet<>();
        if (extraAttributes.contains(DomainExtraAttributesUdp.relationDomain)) {
            for (Domain domain : allPublicDomains) {
                if (domain.getRelationDomain() != null && !domain.getRelationDomain().isEmpty()) {
                    relationDomainCodes.addAll(domain.getRelationDomain());
                }
            }
        }
        Map<String, Domain> relationDomainMap = new HashMap<>();      // 所有关联标准
        Map<String, OrganizationTreeDto> orgMap = new HashMap<>();    // 所有部门
        Map<Long, BaseModelCategory> systemMap = new HashMap<>();     // 所有系统
        getExtraAttributesRef(extraAttributes, relationDomainCodes, relationDomainMap, orgMap, systemMap);

        // 5.转换返回
        List<LocalDomainDto> list = allPublicDomains.stream()
                .map(domain -> DomainConvertUtils.convertToLocalDomainDto(domain, udpIdMap.get(domain.getCategoryId()),
                        getRoot(), relationDomainMap, orgMap, systemMap, extraAttributes, apiVersion))
                .collect(Collectors.toList());
        return list;
    }

    /**
     * 查询关联标准、部门、系统为构建数据标准额外属性到UDP做准备
     *
     * @param relationDomainCodes 所有关联标准Code
     * @param relationDomainMap   所有关联标准
     * @param orgMap              所有部门
     * @param systemMap           所有系统
     */
    private void getExtraAttributesRef(Set<DomainExtraAttributesUdp> extraAttributes,
                                       Set<String> relationDomainCodes,
                                       Map<String, Domain> relationDomainMap,
                                       Map<String, OrganizationTreeDto> orgMap,
                                       Map<Long, BaseModelCategory> systemMap) {
        if (extraAttributes.contains(DomainExtraAttributesUdp.relationDomain)) {
            relationDomainMap.putAll(domainRepo.findByDomainCodeIn(relationDomainCodes).stream()
                    .filter(d -> d.getState().equals(DomainState.A))
                    .collect(Collectors.toMap(Domain::getDomainCode, Function.identity())));
        }
        if (extraAttributes.contains(DomainExtraAttributesUdp.descriptionDepartment) ||
                extraAttributes.contains(DomainExtraAttributesUdp.ownerOrg)) {
            orgMap.putAll(getOrganizations(Collections.singletonList(organizationService.getOrganizationTree()), new HashMap<>()));
        }
        if (extraAttributes.contains(DomainExtraAttributesUdp.authCategoryId)) {
            systemMap.putAll(modelCategoryService.getAllBaseModelCategories().stream()
                    .collect(Collectors.toMap(BaseModelCategory::getId, Function.identity())));
        }
    }

    private Map<String, OrganizationTreeDto> getOrganizations(List<OrganizationTreeDto> orgs, Map<String, OrganizationTreeDto> map) {
        for (OrganizationTreeDto org : orgs) {
            map.put(org.getBm(), org);
            if (org.getChildren() != null && !org.getChildren().isEmpty()) {
                getOrganizations(org.getChildren(), map);
            }
        }
        return map;
    }

    @Override
    public LoadDomainDto loadUserAccessibleDomainsForDdm(LoadDomianQueryDto loadDto) {

        LoadDomainDto result = new LoadDomainDto();

        // 1.获取公共标准
        if (loadDto.getPubTimestamp() != null && !loadDto.getPubTimestamp().equals(0L)) {
            result.setIncrement(true);
        }
        result.setPublicDomainQueryTime(new Date().getTime());
        List<LocalDomainDto> changedDomains = loadUserAccessibleDomainsAfterTimestamp(loadDto.getCurrentUser(),
                loadDto.getPubTimestamp(), loadDto.getApiVersion());
        Map<Boolean, List<LocalDomainDto>> domainGroup = changedDomains.stream()
                .collect(Collectors.groupingBy(domain -> Objects.equals(domain.getState(), DomainState.A)));
        result.setPublicDomains(Optional.ofNullable(domainGroup.get(true)).orElse(new ArrayList<>()));
        result.setExpiredPublicDomains(Optional.ofNullable(domainGroup.get(false)).orElse(new ArrayList<>()));

        Set<DomainExtraAttributesUdp> extraAttributes = new HashSet<>();
        if (!Strings.isNullOrEmpty(loadDomainExtraAttributes)) {
            for (String attr : loadDomainExtraAttributes.split(",")) {
                extraAttributes.add(DomainExtraAttributesUdp.valueOf(attr));
            }
        }
        // 2.获取UDP
        if (loadDto.getApiVersion() > 1) {
            result.setBuildInUdps(DomainConvertUtils.getDdmIncrementDomainUdp(extraAttributes)); // 内建属性到UDP
        }
        List<UserDefinedDomainPropertyDto> domainUdps = getDomainUdps(null).stream()
                .map(DomainConvertUtils::convertToLocalUdp)
                .sorted(Comparator.comparingLong(UserDefinedDomainPropertyDto::getBindFolderId).thenComparingInt(UserDefinedDomainPropertyDto::getOrder))
                .collect(Collectors.toList());
        result.setUdps(domainUdps); // 自定义UDP

        // 3.获取目录
        List<LoadDomainFolderDto> folders = domainFolderRepo.findByParentIdEqualsOrderByIdDesc(0L).stream()
                .map(DomainConvertUtils::convertToLocalDomainFolderDto)
                .collect(Collectors.toList());
        result.setFolders(folders);

        // 4.获取私有标准
        if (loadDto.isLoadPrivateDomain()) {
            result.setPrivateDomainQueryTime(new Date().getTime());
            CategoryNodeDto categoryNodeDto = getUserPrivateDomainsAfterTimestamp(
                    loadDto.getCurrentUser(), loadDto.getPriTimestamp(), loadDto.getApiVersion());
            result.setPrivateDomainRoot(categoryNodeDto);
            result.setPrivateDomainLastUpdate(getPrivateDomainLastUpdateTime(loadDto.getCurrentUser()));
        } else {
            result.setPrivateDomainQueryTime(loadDto.getPriTimestamp());
            result.setPrivateDomainLastUpdate(0L);
        }

        return result;
    }

    @Override
    public Page<Domain> getPageDomains(PageRequest pageRequest) {
        return domainRepo.findAll(pageRequest);
    }

    @Override
    public Page<NamingStandard> getPageNamingStandards(PageRequest pageRequest) {
        return namingStandardRepo.findAll(pageRequest);
    }

    @Override
    public NamingStandard getNamingStandardById(Long id) {
        Optional<NamingStandard> op = namingStandardRepo.findById(id);
        if (op.isPresent()) {
            return op.get();
        }
        return null;
    }

    @Override
    public Domain getDomainById(String id) {
        Optional<Domain> op = domainRepo.findById(id);
        if (op.isPresent()) {
            return op.get();
        }
        return null;
    }

    @Override
    public List<DomainDto> getDomainsByDomainCode(String domainCode) {
        List<Domain> domains = domainRepo.findByDomainCode(domainCode);
        return convertToListDomainDto(domains);
    }

    @Override
    public List<DomainDto> getDomainsByReferenceCode(String referenceCode) {
        return convertToListDomainDto(
                domainExtRepo.findDomainByReferenceCodeIn(Collections.singletonList(referenceCode)));
    }

    @Override
    public List<DomainVersionDto> getDomainVersions(String domainId) {
        return convertToListDomainVersionDto(domainVersionRepo
                .findDomainVersionByDomainIdEqualsOrderByLastModificationDesc(domainId));
    }

    @Override
    public Map<Long, DomainFolderDto> getDomainFolderMapByIds(List<Long> folderIds) {
        if (CollectionUtils.isEmpty(folderIds)) {
            return Collections.emptyMap();
        }

        Map<Long, DomainFolderDto> res = new HashMap<>();
        for (List<Long> partition : Lists.partition(folderIds, 999)) {
            for (DomainFolder folder : domainFolderRepo.findByIds(partition)) {
                res.put(folder.getId(), convertToDomainFolderDto(folder));
            }
        }

        return res;
    }

    @Override
    public boolean abolishDomain(String domainId, String username) {
        Domain saved = domainRepo.findByDomainIdEquals(domainId);

        if (saved.getState().getStage() != DomainState.X.getStage()) {
            createDomainAssignment(saved, true, saved.getSubmitter());
            saved.setState(DomainState.X);

            EditHistoryEntity history = new EditHistoryEntity();
            history.setOperator(username);
            history.setHistoryType(EditHistoryEntity.TYPE_DOMAIN);
            history.setTimestamp(new Date());
            history.setVersion(-1);
            history.setItemId(domainId);
            String categoryName = msgService.getMessage("category.standard.data");
            if (saved.getCategoryId() != null && isMetrics(saved.getCategoryId())) {
                categoryName = msgService.getMessage("category.index.data");
            }

            history.setChanges(msgService.getMessage("hasBeanMarkedAbandon", categoryName));

            editHistoryRepo.save(history);
            domainRepo.deleteByUpdatingDomainIdEquals(saved.getDomainId());

            return true;
        }

        return false;
    }

    @Override
    public DomainTreeNodeDto loadDomainTree(DomainState domainState, Long categoryId,
                                            String currentUser, boolean onlyFolder, boolean forceLoadRoot) {
        if (forceLoadRoot) {
            getRoot(true);
        }

        return loadDomainTree(domainState, categoryId, currentUser, onlyFolder);
    }

    @Override
    public DomainTreeNodeDto loadDomainTree(DomainState domainState, Long categoryId,
                                            String currentUser, boolean onlyFolder) {
        if (onlyFolder) {
            return buildDomainTree(Collections.emptyList(), categoryId);
        } else {
            List<Domain> domains = fastLoadDomains(domainState, categoryId, currentUser);
            return buildDomainTree(domains, categoryId);
        }
    }

    @Override
    public List<StandardCodeDto> getPrivateCodesOfUser(String username) {
        return convertToPrivateListStandardCodeDto(privateStdCodeRepo.findByOwnerEquals(username));
    }

    @Override
    public PageResult<NamingStandardDto> searchPublicNamingStandards(
            NamingStandardSearchCriteriaDto criteria) {

        PageRequest page = PageRequest.of(criteria.getCurrentPage(), criteria.getPageSize());

        Page<NamingStandard> searchResult = null;

        if (Strings.isNullOrEmpty(criteria.getKeyword())) {
            searchResult = namingStandardRepo.findAllByOrderByAbbreviationAsc(page);
        } else {
            searchResult = namingStandardRepo
                    .findByChineseNameContainingOrEnglishNameContainingOrAbbreviationContainingOrderByAbbreviation(
                            criteria.getKeyword(), criteria.getKeyword(), criteria.getKeyword(), page);
        }

        PageResult<NamingStandardDto> result = new PageResult<>();

        result.setCurrentPage(searchResult.getNumber());
        result.setPageSize(searchResult.getSize());
        result.setContentDirectly(convertToListNamingStandard(searchResult.getContent()));
        result.setTotalItems(searchResult.getTotalElements());

        return result;
    }

    @Override
    public PageResult<NamingStandardDto> searchPrivateNamingStandards(
            NamingStandardSearchCriteriaDto criteria, String username) {

        PageRequest page = PageRequest.of(criteria.getCurrentPage(), criteria.getPageSize());

        Page<PrivateNamingStandard> searchResult = null;

        if (criteria.getSearchAll()) {
            if (Strings.isNullOrEmpty(criteria.getKeyword())) {
                searchResult = privateNamingstandardRepo.findAllByOrderByAbbreviationAsc(page);
            } else {
                searchResult = privateNamingstandardRepo
                        .findByChineseNameContainingOrEnglishNameContainingOrAbbreviationContainingOrderByAbbreviation(
                                criteria.getKeyword(), criteria.getKeyword(), criteria.getKeyword(), page);
            }
        } else {
            if (Strings.isNullOrEmpty(criteria.getKeyword())) {
                searchResult = privateNamingstandardRepo
                        .findByOwnerEqualsOrderByAbbreviationAsc(username, page);
            } else {
                searchResult = privateNamingstandardRepo
                        .findByOwnerAndSearchOrderByAbbreviation(username,
                                criteria.getKeyword(), criteria.getKeyword(), criteria.getKeyword(), page);
            }
        }

        PageResult<NamingStandardDto> result = new PageResult<>();

        result.setTotalItems(searchResult.getTotalElements());
        result.setPageSize(searchResult.getSize());
        result.setCurrentPage(searchResult.getNumber());
        result.setContentDirectly(convertToListNamingStandard(searchResult.getContent()));
        return result;
    }

    @Override
    public List<NamingStandardDto> getUserPrivateNamingStandards(String username) {
        return convertToListNamingStandard(
                privateNamingstandardRepo.findNamingStandardsByUsername(username));
    }

    @Override
    public Long getPrivateNamingStandardLastUpdateTime(String currentUser) {
        return privateNamingstandardRepo.getUserLastUpdateTimestamp(currentUser);
    }

    @Override
    public List<NamingStandardDto> getAllNamingStandards() {
        return convertToListNamingStandard(namingStandardRepo.findAll());
    }

    @Override
    public List<NamingStandardDto> getSimilarNamingStandards(String name, String likeName) {
        if (Strings.isNullOrEmpty(name) || Strings.isNullOrEmpty(likeName)) {
            return Collections.emptyList();
        }

        return convertToListNamingStandard(
                namingStandardRepo.getSimilarNamingStandardsLikeChineseName(name, likeName));
    }

    @Override
    public Set<SimpleDomainDto> findSimpleDomainsByDomainIds(Collection<String> domainIds) {
        if (CollectionUtils.isEmpty(domainIds)) {
            return Collections.emptySet();
        }

        Set<SimpleDomainDto> result = new HashSet<>();
        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            result.addAll(domainRepo.findSimpleDomainsByDomainIdsEquals(partition));
        }

        return result;
    }

    @Override
    public List<DomainDto> loadDomainsModifiedAfterTimestamp(Long timestamp, DomainState state,
                                                             Long domainCategoryId) {
        return convertToListDomainDto(domainRepo
                .findDomainsByLastModificationAfterAndStateInAndCategoryIdEquals(new Date(timestamp),
                        Collections.singleton(state), domainCategoryId));
    }

    @Override
    public DomainDto addDomain(String currentUser, DomainDto domain, Boolean published) {
        String categoryName = msgService.getMessage("category.standard");
        if (isMetrics(domain.getCategoryId())) {
            categoryName = msgService.getMessage("category.index");
        }
        if (Strings.isNullOrEmpty(domain.getDomainId())) {
            domain.setDomainId(getUUID());
        }

        if (domain.isAutoGenCode()) {
            String domainCode = generateService
                    .getSingleDomainCode(DatablauDomainType.formByCategoryId(domain.getCategoryId()));
            domain.setDomainCode(domainCode);
        } else if (Strings.isNullOrEmpty(domain.getDomainCode())) {
            throw new InvalidArgumentException(msgService.getMessage("modifierTypeCodeCannotBeNull"));
        }

        if (Strings.isNullOrEmpty(currentUser)) {
            throw new InvalidArgumentException(msgService.getMessage("userCannotByEmpty"));
        }

        if (!domainRepo.findCountByDomainCode(domain.getDomainCode().trim()).equals(0)) {
            throw new InvalidArgumentException(msgService.getMessage("standardSameCodeExists", categoryName));
        }

        if ((Objects.equals(domain.getMetricType(), MetricType.DERIVE) ||
                Objects.equals(domain.getMetricType(), MetricType.FORK)) &&
                CollectionUtils.isEmpty(domain.getRelationDomain())) {
            throw new InvalidArgumentException(msgService.getMessage("relationAtomsIsNull"));
        }

//        if (!Strings.isNullOrEmpty(domain.getAbbreviation()) && domain.getAbbreviation().length() > 100) {
//            throw new InvalidArgumentException(msgService.getMessage("englishAbbrIsOverLimit"));
//        }

        if (!Strings.isNullOrEmpty(domain.getMeasureUnit()) && domain.getMeasureUnit().length() > 100) {
            throw new InvalidArgumentException(msgService.getMessage("qualityUnitOverLimit"));
        }

        checkDomainNames(domain);
        checkDomainPath(domain.getFolderId(), domain.getCategoryId(), domain.getChineseName());
        if (!isMetrics(domain.getCategoryId())) {
            checkDomainDataType(domain.getDataType(), domain.getChineseName());
        }
        checkRealmTypeDomainParameter(domain);
        checkInheritDomainParameter(domain);

        domain.setSubmitter(currentUser);
        if (!DomainState.A.equals(domain.getState()) && published) {
            domain.setState(DomainState.A);
        }

        if (null == domain.getState()) {
            domain.setState(DomainState.D);
        }

        if (DomainState.A.equals(domain.getState())) {
            domain.setFirstPublish(new Date());
        }

        if (domain.getReferenceCode() == null) {
            domain.setReferenceCode("");
        }

        domain.setVersion(1);
        domain.setCreateTime(new Date());
        domain.setLastModification(new Date());
        Domain convertToDomain = convertToDomain(domain);
        if (published) {
            convertToDomain.setLastReview(new Date());
        }
        // 保存同义词节点到neo4j
        saveSynonymForGraph(Lists.newArrayList(convertToDomain));
        Domain saved = domainRepo.save(convertToDomain);

        // 保存关联指标节点到neo4j
        domainGraphHelperSave(Lists.newArrayList(saved));
        // 保存指标修饰词
        List<Long> modifierRefIds = new ArrayList<>();
        if (!CollectionUtils.isEmpty(domain.getModifierRefIds())) {
            modifierRefIds.addAll(domain.getModifierRefIds());
        }
        if (!CollectionUtils.isEmpty(domain.getTimeModifierRefIds())) {
            modifierRefIds.addAll(domain.getTimeModifierRefIds());
        }
        if (modifierRefIds.size() > 0) {
            modifierTypeService.saveModifierRef(modifierRefIds, domain.getDomainId());
        }

        if (!published) {
            createDomainAssignment(saved, true, currentUser);
        } else {
            createDomainVersion(saved, currentUser, msgService.getMessage("hasBeanMarkedPublished", categoryName), null, null);
        }

        if (domain.getCategoryId() == 1L || domain.getCategoryId() > 6L) {
            if (domainDataSynchronizer.checkDDCEnable()) {
                domainDataSynchronizer.insertSyncDomainUdpToEs(Arrays.asList(saved), getDDCIndexName(LDMTypes.oDataStandard));
            }
        }

        //添加base的应用系统引用
//        if (saved.getAuthCategoryId() != null) {
//            registryRefService.addOrUpdateCategoryRef(RegistryModule.DOMAIN, "Domain", saved.getDomainId(), saved.getAuthCategoryId());
//        }

        //绑定数据规则关系
        if (saved.getCategoryId() == DOMAIN_CATEGORY_ID) {
            dataRuleService.autoBindBuiltInDataRule(Lists.newArrayList(saved.getDomainCode()));
        }

        return convertToDomainDto(saved);
    }

    public void domainGraphHelperSave(Collection<Domain> domains) {
        domainGraphHelperSave(domains, new ArrayList<>());
    }

    public void domainGraphHelperSave(Collection<Domain> domains, Collection<Domain> oldDomains) {
        if (graphEnable && getGraphObjectProcessor() != null) {
            List<DomainGraphHelper> toBeDeleteDomainGraphHelpers = convertToDomainGraphHelpers(oldDomains);
            getGraphObjectProcessor()
                    .objectRemove(toBeDeleteDomainGraphHelpers);

            List<DomainGraphHelper> domainGraphHelpers = convertToDomainGraphHelpers(domains);
            getGraphObjectProcessor()
                    .objectsSave(domainGraphHelpers, SaveType.PERSIST);
        }
    }

    protected List<DomainGraphHelper> convertToDomainGraphHelpers(Collection<Domain> domains) {
        ArrayList<DomainGraphHelper> domainGraphHelpers = new ArrayList<>();
        for (Domain saved : domains) {
            // 只处理指标关系
            if (!isMetrics(saved.getCategoryId())) {
                continue;
            }
            List<Domain> parentDomains = domainRepo
                    .findByDomainCodeAndCategoryId(saved.getParentCode(), 2L);
            List<DomainDto> domainByDomainCodes = findDomainByDomainCodes(saved.getRelationDomain());
            if (!CollectionUtils.isEmpty(parentDomains) || !CollectionUtils.isEmpty(domainByDomainCodes)) {
                DomainGraphHelper domainGraphHelper = new DomainGraphHelper();
                BeanUtils.copyProperties(saved, domainGraphHelper);
                if (!CollectionUtils.isEmpty(parentDomains)) {
                    domainGraphHelper.setParentId(parentDomains.get(0).getDomainId());
                }
                Set<String> domainIds = domainByDomainCodes == null ? null : domainByDomainCodes.stream().map(DomainDto::getDomainId).collect(Collectors.toSet());
                domainGraphHelper.setRelationDomainIds(domainIds);
                domainGraphHelpers.add(domainGraphHelper);
            }
        }
        return domainGraphHelpers;
    }

    @Override
    public List<DomainUdpDto> getDomainUdps(Long domainCategoryId) {
        if (domainCategoryId == null) {
            List<DomainUdpDto> udps = new ArrayList<>();
            for (List<DomainUdpDto> udpList : udpMap.values()) {
                udps.addAll(udpList);
            }
            return udps;
        } else {
            List<DomainUdpDto> udps = udpMap.get(domainCategoryId);
            if (udps == null) {
                loadCategoryUdpIntoRedis(domainCategoryId);
                udps = udpMap.get(domainCategoryId);
            }
            return udps == null ? Collections.emptyList() : udps;
        }
    }

    @Override
    @Transactional
    public List<DomainUdpDto> batchCreateDomainUdps(List<DomainUdpDto> udps, Long domainCategoryId,
                                                    boolean forceClear) {

        if (udps == null) {
            udps = Collections.emptyList();
        }

        DomainTreeNodeDto category = findCategory(domainCategoryId);
        if (category == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("domainSpecCategoryDoesntExist", domainCategoryId));
        }

        List<DomainUdp> toBeSaved = new ArrayList<>(udps.size());
        for (DomainUdpDto udp : udps) {
            checkUdp(udp);
            udp.setBindFolderId(domainCategoryId);
            if (udp.getOrder() == null) {
                udp.setOrder(0);
            }
            toBeSaved.add(convertToDomainUdp(udp));
        }

        if (forceClear) {
            domainUdpRepo.deleteByBindFolderIdEquals(domainCategoryId);
            if (!toBeSaved.isEmpty()) {
                domainUdpRepo.saveAll(toBeSaved);
            }
            loadCategoryUdpIntoRedis(domainCategoryId);
            logger.info("udps of category " + domainCategoryId + " is fully updated");
            return udpMap.get(domainCategoryId);
        } else {
            // 存在名称相同的udp更新
            List<DomainUdpDto> domainUdpDtos = udpMap.get(domainCategoryId);
            if (!CollectionUtils.isEmpty(domainUdpDtos)) {
                Map<String, Long> nameIdMap = domainUdpDtos
                        .stream()
                        .collect(Collectors.toMap(DomainUdpDto::getName, DomainUdpDto::getUdpId));
                for (DomainUdp domainUdp : toBeSaved) {
                    if (nameIdMap.containsKey(domainUdp.getName())) {
                        domainUdp.setPropertyId(nameIdMap.get(domainUdp.getName()));
                    }
                }
            }

            if (!toBeSaved.isEmpty()) {
                domainUdpRepo.saveAll(toBeSaved);
            }
            loadCategoryUdpIntoRedis(domainCategoryId);
            logger.info("udps of category " + domainCategoryId + " is updated");
            return udpMap.get(domainCategoryId);
        }
    }

    @Override
    public List<DomainFolderDto> getAllDomainCategoriesOfUser(String username) {
        List<DomainFolderDto> res = new ArrayList<>();
        List<Long> categoryIds = new ArrayList<>();

        if (Strings.isNullOrEmpty(username)) {
            throw new InvalidArgumentException(msgService.getMessage("usernameCannotBeBlank"));
        }

        for (DomainFolder folder : domainFolderRepo.findByParentIdEqualsAndIdGreaterThanOrderByIdDesc(0L, 6L)) {
            res.add(convertToDomainFolderDto(folder));
            categoryIds.add(folder.getId());
        }

        UserDto user = RemoteServiceGetter.getUserService().getUser(username);
        OrganizationDto orgDto = RemoteServiceGetter.getOrganizationService().getOrganizationsByBm(user.getBm());
        // get this user all parent organization
        String fullPath = orgDto != null ? orgDto.getPath() : null;
        List<String> bmAndParentBm = new ArrayList<>();
        if (!Strings.isNullOrEmpty(fullPath)) {
            String[] r = fullPath.replace("//", "/").split("/");
            bmAndParentBm = Arrays.asList(r);
        }
        Map<Long, Integer> accessMap = new HashMap<>();

        for (DomainFolderAccessList accessList : domainFolderAccessListRepo
                .findByTypeAndAccessorInAndCategoryIdIn(PermissionType.DEPARTMENT, bmAndParentBm,
                        categoryIds)) {
            accessMap.put(accessList.getCategoryId(), accessList.getAccessMask());
        }
        for (DomainFolderAccessList accessList : domainFolderAccessListRepo
                .findByTypeAndAccessorAndCategoryIdIn(PermissionType.USER, username, categoryIds)) {
            int mask = accessMap.getOrDefault(accessList.getCategoryId(), 0);
            if (mask < accessList.getAccessMask()) {
                accessMap.put(accessList.getCategoryId(), accessList.getAccessMask());
            }
        }
        boolean isSuperUser = AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER);
        for (DomainFolderDto folderDto : res) {
            int mask = accessMap.getOrDefault(folderDto.getId(), 0);
            if (isSuperUser) {
                folderDto.setPermissionLevel(PermissionLevel.ADMIN);
            } else {
                folderDto.setPermissionLevel(PermissionLevel.valueOf(mask));
            }
        }
        if (res == null || res.isEmpty()) {
            return res;
        }
        return res.stream().filter(item -> PermissionLevel.NONE != item.getPermissionLevel())
                .collect(Collectors.toList());
    }

    @Override
    public List<DomainFolderDto> getAllDomainCategories() {
        List<DomainFolderDto> res = new ArrayList<>();
        List<Long> categoryIds = new ArrayList<>();

        for (DomainFolder folder : domainFolderRepo.findByParentIdEqualsOrderByIdDesc(0L)) {
            res.add(convertToDomainFolderDto(folder));
            categoryIds.add(folder.getId());
        }

        return res;
    }

    @Override
    public String getDDCIndexName(Long typeId) {
        if (!domainDataSynchronizer.checkDDCEnable()) {
            throw new IllegalOperationException(msgService.getMessage("notConfigDdc"));
        }

        if (ObjectUtils.equals(typeId, LDMTypes.oDataStandard)) {
            return datablauSearchIndexConfig.getDomainIndexName();
        } else if (ObjectUtils.equals(typeId, LDMTypes.oDataStandardCode)) {
            return datablauSearchIndexConfig.getStdCodeIndexName();
        } else {
            throw new InvalidArgumentException(
                    msgService.getMessage("unsupportedIndexTypeId", typeId));
        }
    }

    @Override
    public void resyncDDCBaseData(Long typeId) {
        if (ObjectUtils.equals(LDMTypes.oDataStandard, typeId)) {
            domainDataSynchronizer.syncAllDomains();
        } else if (ObjectUtils.equals(LDMTypes.oDataStandardCode, typeId)) {
            domainDataSynchronizer.syncAllStdCodes();
        }
    }

    @Override
    public boolean updateDomain(DomainDto domain, String currentUser) {
        String categoryName = msgService.getMessage("category.standard");
        if (isMetrics(domain.getCategoryId())) {
            categoryName = msgService.getMessage("category.index");
        }
        if (domain == null) {
            return false;
        }
        Domain res = null;
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus status = txManager.getTransaction(def);
        try {
            Domain savedDomain = domainRepo.findByDomainIdEquals(domain.getDomainId());
            if (!savedDomain.getChineseName().equalsIgnoreCase(domain.getChineseName())
                    || domain.getAbbreviation() == null) {
                checkDomainNames(domain);
            }

            checkDomainPath(domain.getFolderId(), domain.getCategoryId(), domain.getChineseName());
            if (!isMetrics(domain.getCategoryId())) {
                checkDomainDataType(domain.getDataType(), domain.getChineseName());
            }
            checkRealmTypeDomainParameter(domain);
            checkInheritDomainParameter(domain);

            domain.setSubmitter(currentUser);
            domain.setLastModification(new Date());

            Domain toBeUpdated = convertToDomain(domain);
            toBeUpdated.setLastReview(new Date());
            if (ObjectUtils.notEqual(savedDomain.getChineseName(), domain.getChineseName())) {
                //如果修改了中文名称，我们需要检查中文名称是否和已经发布的数据标准冲突
                for (Domain matchDomain : domainRepo
                        .findDomainByChineseName(domain.getChineseName(), savedDomain.getCategoryId())) {
                    if (!matchDomain.getDomainId().equals(savedDomain.getUpdatingDomainId())) {
                        throw new InvalidArgumentException(
                                msgService.getMessage("standardSameChineseNameExists", categoryName));
                    }
                }
            }

            if (ObjectUtils.notEqual(savedDomain.getDomainCode(), domain.getDomainCode())) {
                List<Domain> domains = domainRepo.findByDomainCode(domain.getDomainCode());
                for (Domain sameCodeDomain : domains) {
                    if (ObjectUtils
                            .notEqual(sameCodeDomain.getDomainId(), toBeUpdated.getUpdatingDomainId())
                            && ObjectUtils.notEqual(sameCodeDomain.getUpdatingDomainId(),
                            toBeUpdated.getUpdatingDomainId())) {
                        throw new InvalidArgumentException(
                                msgService.getMessage("standardCodeExistsSimple", domain.getDomainCode()));
                    }
                }
            }
            saveSynonymForGraph(Lists.newArrayList(toBeUpdated));
            // 保存关联指标节点到neo4j
            domainGraphHelperSave(Lists.newArrayList(toBeUpdated), Lists.newArrayList(savedDomain));

            // 保存指标修饰词
            List<Long> modifierRefIds = new ArrayList<>();
            if (!CollectionUtils.isEmpty(domain.getModifierRefIds())) {
                modifierRefIds.addAll(domain.getModifierRefIds());
            }
            if (!CollectionUtils.isEmpty(domain.getTimeModifierRefIds())) {
                modifierRefIds.addAll(domain.getTimeModifierRefIds());
            }
            modifierTypeService.saveModifierRef(modifierRefIds, domain.getDomainId());
            if (DomainState.A.equals(toBeUpdated.getState()) && DomainState.A
                    .equals(savedDomain.getState())) {
                int version = toBeUpdated.getVersion() + 1;
                toBeUpdated.setVersion(version);
                createDomainVersion(toBeUpdated, currentUser, msgService.getMessage("hasBeanUpdated", categoryName), null, null);
            }
            res = domainRepo.save(toBeUpdated);

            //更新时要同步更新base的应用系统引用
//            if (res.getAuthCategoryId() != null) {
//                registryRefService.addOrUpdateCategoryRef(RegistryModule.DOMAIN, "Domain", res.getDomainId(), res.getAuthCategoryId());
//            } else {
//                registryRefService.deleteCategoryRef(RegistryModule.DOMAIN,"Domain",res.getDomainId());
//            }

            txManager.commit(status);

        } catch (Exception e) {
            txManager.rollback(status);
            throw new AndorjRuntimeException(e.getMessage(), e);
        }

        if (domain.getCategoryId() == 1L || domain.getCategoryId() > 6L) {
            if (domainDataSynchronizer.checkDDCEnable()) {
                domainDataSynchronizer.updateSyncDomainUdpToEs(res, getDDCIndexName(LDMTypes.oDataStandard));
            }
        }

        return true;
    }

    @Override
    @Transactional
    public DomainDto createUpdateDomain(String currentUser, String domainId,
                                        boolean allowCreateMultipleClone) {

        Domain savedDomain = domainRepo.findByDomainIdEquals(domainId);
        if (savedDomain == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFindDomainById", domainId));
        }

        if (savedDomain.getState().getStage() <= 0) {
            throw new IllegalOperationException(msgService.getMessage("createNewVersionDisabled"));
        }

        if (!allowCreateMultipleClone) {
            Domain domain = domainRepo.findFirstByUpdatingDomainIdEquals(domainId);
            if (domain != null) {
                throw new IllegalOperationException(
                        msgService.getMessage("standardModifying", domain.getSubmitter()));
            }
        }

        Domain cloned = cloneDomain(savedDomain, false);
        cloned.setState(DomainState.D);
        cloned.setUpdatingDomainId(savedDomain.getDomainId());
        cloned.setVersion(savedDomain.getVersion() == null ? 1 : savedDomain.getVersion() + 1);
        cloned.setLastModification(new Date());
        cloned.setSubmitter(currentUser);
        // 保存同义词节点到neo4j
        saveSynonymForGraph(Lists.newArrayList(cloned));
        cloned = domainRepo.save(cloned);
        // 保存关联指标节点到neo4j
        domainGraphHelperSave(Lists.newArrayList(cloned), Lists.newArrayList(savedDomain));
        createDomainAssignment(cloned, true, currentUser);
        return convertToDomainDto(cloned);
    }

    @Override
    @Transactional
    public DomainDto updateDomainState(String domainId, DomainState newState, String currentUser) {
        Domain saved = domainRepo.findByDomainIdEquals(domainId);
        if (saved == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFindDomainById", domainId));
        }

        if (newState.getStage() > 0) {
            saved.setState(newState);
            return convertToDomainDto(domainRepo.save(saved));
        } else if (newState.getStage() == 0) {
            return convertToDomainDto(saved);
        } else {
            if (saved.getState().getStage() != newState.getStage()) {
                createDomainAssignment(saved, true, currentUser);
                saved.setState(newState);

                if (DomainState.X.equals(newState)) {
                    saveDomainStateChangeHistory(saved.getDomainId(), newState, currentUser,
                            saved.getCategoryId());
                }

                domainRepo.deleteByUpdatingDomainIdEquals(saved.getDomainId());
                return convertToDomainDto(domainRepo.save(saved));
            } else {
                DomainAssignment assignment = domainAssignmentRepo
                        .findAssignmentByDomainId(saved.getDomainId());
                if (currentUser.equals(assignment.getCreator()) || currentUser
                        .equals(assignment.getAssignee())) {
                    saved.setState(newState);

                    if (DomainState.X.equals(newState)) {
                        saveDomainStateChangeHistory(saved.getDomainId(), newState, currentUser,
                                saved.getCategoryId());
                    }

                    return convertToDomainDto(domainRepo.save(saved));
                } else {
                    throw new IllegalOperationException(
                            msgService.getMessage("standardStatusModifyDisabled"));
                }
            }
        }
    }

    @Override
    public List<String> removeDomains(String currentUser, Collection<String> domainCodes) {
        if (domainCodes == null || domainCodes.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> domainIds = null;
        EntityManager em = entityManagerFactory.createEntityManager();
        try {
            em.getTransaction().begin();
            Query q = em.createQuery("SELECT d FROM Domain d WHERE d.domainCode in (?1)");
            q.setParameter(
                    1, domainCodes
            );
            List result = q.getResultList();
            for (Object d : result) {
                em.remove(d);
            }
            //context.publishEvent(new DomainUpdateEvent(this, null, result));
            em.getTransaction().commit();
            domainIds = extractDomainIds(result);
            logger.info(currentUser + " total deleted " + domainIds.size() + " domains");
            logger.info("deleted domain code:" + StringUtils.join(domainCodes, ","));
        } catch (Exception ex) {
            em.getTransaction().setRollbackOnly();
            throw ex;
        }

        return new ArrayList<>(domainIds);
    }

    @Override
    public Map<String, EditHistory> getDomainsLatestEditHistories(Collection<String> domainIds) {
        Map<String, EditHistory> res = new HashMap<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            List<EditHistoryEntity> histories = editHistoryRepo
                    .getLatestHistoryOfItem(EditHistoryEntity.TYPE_DOMAIN, partition);
            for (EditHistoryEntity history : histories) {
                res.put(history.getItemId(), convertToEditHistory(history));
            }
        }

        return res;
    }

    @Override
    @Transactional
    public void removeDomainByIds(String currentUser, Collection<String> domainIds) {
        if (domainIds == null || domainIds.isEmpty()) {
            return;
        }

        //校验域标准是否有派生标准
        if (domainRepo.countByParentDomainIdIn(domainIds) > 0) {
            throw new InvalidArgumentException(msgService.getMessage("delDomainFiledHasChildren"));
        }

        Set<String> deletedDomainCodes = new HashSet<>();
        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            deletedDomainCodes.addAll(domainRepo.findDomainCodeByDomainIds(partition));
            domainRepo.deleteByDomainIdIn(partition);
            domainRepo.setUpdatingDomainIdNull(partition);
            domainRepo.setRefDomainIdNull(partition);

            // 查出所有可能引用了被删除标准的标准
            List<String> deletedCodeList = new ArrayList<>(deletedDomainCodes);
            if (!CollectionUtils.isEmpty(deletedCodeList)) {

                StringBuilder sb = new StringBuilder("SELECT d.domain_id FROM db_domain d where d.relation_domain like ");
                for (int i = 0; i < deletedCodeList.size(); i++) {
                    String code = deletedCodeList.get(i);

                    if (i == 0) {
                        sb.append("'%").append(code).append("%'");
                        continue;
                    }

                    sb.append(" or d.relation_domain like ").append("'%").append(code).append("%'");
                }

                List<String> possibleDomainIds = jdbcTemplate.query(sb.toString(), (rs, rowNum) -> rs.getString("domain_id"));
                List<Domain> results = domainRepo.findAllByDomainIdIn(possibleDomainIds);

                // 保存所有需要更新的domain
                List<Domain> savedDomains = new ArrayList<>();
                for(Domain result : results){
                    List<String> relationDomains = result.getRelationDomain();
                    List<String> newRelationDomains = relationDomains.stream().filter(code -> {
                        for (String deletedCode : deletedDomainCodes) {
                            if (deletedCode.equals(code)) {
                                return false;
                            }
                        }
                        return true;
                    }).collect(Collectors.toList());

                    // 引用元素有变化需要更新
                    if(relationDomains.size() != newRelationDomains.size()){
                        result.setRelationDomain(newRelationDomains);
                        savedDomains.add(result);
                    }
                }

                if(!CollectionUtils.isEmpty(savedDomains)){
                    domainRepo.saveAll(savedDomains);
                }
            }
        }
        // 删除指标关联修饰类型
//        for (String domainId : domainIds) {
//            modifierTypeService.deleteModifierRefs(domainId);
//            //删除base的应用系统引用
//            registryRefService.deleteCategoryRef(RegistryModule.DOMAIN,"Domain",domainId);
//        }

        tagService.deleteByItemIdInAndTypeIdEquals(new ArrayList<>(domainIds), LDMTypes.oDataStandard);
        tagService.deleteByItemIdInAndTypeIdEquals(new ArrayList<>(domainIds), LDMTypes.oMetrics);

        logger.info(currentUser + " deleted " + domainIds.size() + " domains, and their code are:");
        logger.info(StringUtils.join(deletedDomainCodes, ","));
    }

    @Override
    public void publishDomainDirectly(String currentUser, Collection<DomainDto> domains,
                                      boolean published) {
        DomainState publishState = publishConfiguration.getPublishType().equals(DomainState.A) &&published ? DomainState.A:DomainState.D;
        if (domains == null || domains.isEmpty()) {
            return;
        }

        // !!! 私有数据标准没有categoryId

        Map<String, DomainDto> domainCodes = new HashMap<>();
        Map<String, DomainDto> domainChineseNames = new HashMap<>();
        List<String> domainIds = new ArrayList<>();
        // 1.防止Excel中有重复的中文名称和code
        for (DomainDto domain : domains) {
            if (domainCodes.containsKey(domain.getDomainCode())) {
                throw new InvalidArgumentException(msgService.getMessage("importCodeIsRepeat", domain.getDomainId(), domain.getDomainCode()));
            }
            if (domainChineseNames.containsKey(domain.getChineseName())) {
                throw new InvalidArgumentException(msgService.getMessage("importNameIsRepeat", domain.getDomainId(), domain.getChineseName()));
            }
            domainCodes.put(domain.getDomainCode(), domain);
            domainChineseNames.put(domain.getChineseName(), domain);
            domainIds.add(domain.getDomainId());
        }

        // 2.如果code存在，则要判断code是不是本来就是该数据标准的
        //废弃的标准可以被重新发布，所以也不允许与废弃的标准重名
        List<Domain> domainByCode = domainRepo.findDomainByDomainCodes(domainCodes.keySet().stream().toList());
        if (domainByCode != null) {
            for (Domain domain : domainByCode) {
                String categoryName = msgService.getMessage("category.standard");
                if (isMetrics(domain.getCategoryId())) {
                    categoryName = msgService.getMessage("category.index");
                }
                if (!Objects.equals(domain.getDomainId(), domainCodes.get(domain.getDomainCode()).getDomainId())) {
                    throw new InvalidArgumentException(msgService.getMessage("domainCodeAlreadyPublish", domain.getDomainCode(), categoryName));
                }
            }
        }

        // 3.同理，如果name存在，则要判断name是不是本来就是该数据标准的
        List<Domain> domainByChineseName = domainRepo.findDomainByChineseNames(domainChineseNames.keySet());
        if (domainByChineseName != null) {
            for (Domain domain : domainByChineseName) {
                if (!Objects.equals(domain.getDomainId(), domainChineseNames.get(domain.getChineseName()).getDomainId())) {
                    throw new InvalidArgumentException(msgService.getMessage("domainChineseNameAlreadyPublish", domain.getChineseName()));
                }
            }
        }

        List<Domain> existIdDomains = domainRepo.findByDomainIdIn(domainIds);
        Map<String, Domain> idMaps = existIdDomains.stream().collect(Collectors.toMap(Domain::getDomainId, d -> d));

        Map<String, DomainDto> domainMap = new HashMap<>();
        for (DomainDto domain : domains) {
            domain.setState(publishState);
            domain.setSubmitter(currentUser);
            if (domain.getVersion() == null) {
                domain.setVersion(1);
            }
            if (idMaps.containsKey(domain.getDomainId())) {
                Domain ed = idMaps.get(domain.getDomainId());
                if (ed.getVersion() != null) {
                    domain.setVersion(ed.getVersion().intValue() + 1);
                }
                if(DomainState.D==domain.getState()){
                    domain.setUpdatingDomainId(ed.getDomainId());
                    domain.setDomainId(getUUID());
                }
            }else{
                domain.setDomainId(getUUID());
            }
            domainMap.put(domain.getDomainId(), domain);
        }

       /* if (published) {
            List<Domain> approved = new ArrayList<>();
            for (List<String> partition : Lists
                    .partition(new ArrayList<>(domainMap.keySet()), 999)) {
                approved.addAll(domainRepo
                        .findByDomainIdInAndStateEquals(partition, publishState));
            }

            List<Domain> all = new LinkedList<>(approved);

            if (!all.isEmpty()) {
                for (Domain domain : all) {
                    DomainDto newDomain = domainMap.get(domain.getDomainId());
                    newDomain.setUpdatingDomainId(domain.getDomainId());
                    if (domain.getVersion() != null) {
                        newDomain.setVersion(domain.getVersion() + 1);
                    }
                    newDomain.setDomainId(getUUID());
                }
            }
        }*/

        List<Domain> toBeSaved = convertToListDomain(domainMap.values());

        saveSynonymForGraph(toBeSaved);

        domainRepo.saveAll(toBeSaved);
        // 保存关联指标节点到neo4j
        domainGraphHelperSave(toBeSaved);
        createDomainAssignments(toBeSaved, currentUser);
        for (Domain domain : toBeSaved) {
            if (DomainState.A.equals(domain.getState())) {
              /*  String categoryName = msgService.getMessage("category.standard");
                if (isMetrics(domain.getCategoryId())) {
                    categoryName = msgService.getMessage("category.index");
                }*/
                createDomainVersion(domain, currentUser, msgService.getMessage("hasBeanMarkedPublished"), null, null);
            }
        }
        getRoot(true);
    }

    @Override
    @Transactional
    public Long makeSureDomainPathExists(List<String> path, Long categoryId) {
        DomainTreeNodeDto root = loadDomainCategoryTree();

        if (CollectionUtils.isEmpty(path)) {
            return categoryId;
        }

        DomainTreeNodeDto categoryNode = null;
        for (DomainTreeNodeDto category : root.getNodes()) {
            if (category.getFoldId().equals(categoryId)) {
                categoryNode = category;
                break;
            }
        }

        if (categoryNode == null) {
            return null;
        }

        Long id = makeSureSubFolderExists(path, categoryNode);

        if (!bfsDomainTree(id, categoryNode)) {
            getRoot(true);
        }

        return id;
    }

    @Override
    public void publishCodeDirectly(String currentUser, Collection<StandardCodeDto> codes,
                                    Long categoryId) {
        DomainState publishState = publishConfiguration.getCodePublishType().equals(DomainState.A) ? DomainState.A : DomainState.D;
        if (codes == null || codes.isEmpty()) {
            return;
        }
        //Already exists
        // 不可以发布已经存在的标准编码
        List<String> codeId = codes.stream().map(s -> s.getCode()).toList();
        List<StandardCode> alreadyCode = standardCodeRepo.findByCodeIn(codeId);
        if (!alreadyCode.isEmpty()) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeAlreadyPublish", alreadyCode.get(0).getCode()));
        }
        for (StandardCodeDto dto : codes) {
            dto.setState(publishState);
            dto.setCategoryId(1L);
            addCode(dto, currentUser);
        }
    }

    @Override
    public DomainDto getDomainByDomainId(String domainId) {
        Domain domain = domainRepo.findByDomainIdEquals(domainId);
        if (domain == null) {
            return null;
        }

        DomainDto domainDto = convertDomainSomePropertiesIdToName(convertToDomainDto(domain));
        if (isMetrics(domain.getCategoryId())) {
            List<ModifierDto> modifierRefs = modifierTypeService.getModifierRef(domain.getDomainId(), ModifierTypeCategory.BASE);
            domainDto.setModifierRefs(modifierRefs);
            domainDto.setModifierRefIds(modifierRefs.stream().map(ModifierDto::getModifierValueId).collect(Collectors.toList()));
            List<ModifierDto> timeModifierRefs = modifierTypeService.getModifierRef(domain.getDomainId(), ModifierTypeCategory.TIME_PERIOD);
            domainDto.setTimeModifierRefs(timeModifierRefs);
            domainDto.setTimeModifierRefIds(timeModifierRefs.stream().map(ModifierDto::getModifierValueId).collect(Collectors.toList()));
        }

        // 标准代码状态
        if(StringUtils.isNotEmpty(domainDto.getReferenceCode())){
            Optional<StandardCode> code = standardCodeRepo.findById(domainDto.getReferenceCode());
            code.ifPresent(standardCode -> domainDto.setReferenceCodeState(standardCode.getState()));
        }

        // 父级指标状态
        if(StringUtils.isNotEmpty(domainDto.getParentCode())){
            List<Domain> parentDomain = domainRepo.findByDomainCode(domainDto.getParentCode());
            // 只保留废弃状态
            List<Domain> filterDomains = parentDomain.stream().filter(relationDomain -> relationDomain.getState() == DomainState.X).collect(Collectors.toList());
            if(!CollectionUtils.isEmpty(filterDomains)){
                domainDto.setParentCodeState(filterDomains.get(0).getState());
            }
        }

        // 引用指标状态
        if(!CollectionUtils.isEmpty(domainDto.getRelationDomain())){
            List<String> relationDomainCodes = domainDto.getRelationDomain();
            List<Domain> relationDomains = domainRepo.findDomainByDomainCodes(relationDomainCodes);
            // 只保留废弃状态
            List<Domain> filterDomains = relationDomains.stream().filter(relationDomain -> relationDomain.getState() == DomainState.X).collect(Collectors.toList());
            Map<String, DomainState> codeStateMap = filterDomains.stream().collect(Collectors.toMap(Domain::getDomainCode, Domain::getState));
            domainDto.setRelationDomainState(codeStateMap);
        }

        return domainDto;
    }

    @Override
    public List<DomainDto> getDomainsByDomainIds(Collection<String> domainIds) {
        List<DomainDto> result = new ArrayList<>(domainIds.size());
        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            result.addAll(convertToListDomainDto(domainRepo.findByDomainIdIn(partition)));
        }

        return result;
    }

    @Override
    public PageResult<DomainDto> getPageDomains(DomainQueryDto queryDto) {
        PageResult<DomainDto> result = generalDomainQuery(queryDto, true);
        convertDomainSomePropertiesIdToName(result.getContent());
        return result;
    }

    @Override
    public PageResult<DomainDto> getPageDomainsByNameOrCode(DomainQueryDto queryDto) {
        return getPageDomains(queryDto);
    }

    @Override
    public List<DomainDto> getDomainsByFolderId(DomainState state, Long categoryId, Long folderId) {
        return convertToListDomainDto(
                domainRepo.findAllByStateEqualsAndCategoryIdEqualsAndFolderIdEquals(state, categoryId, folderId));
    }

    @Override
    public List<DomainDto> getListDomains(DomainQueryDto queryDto) {
        List<DomainDto> result = null;
        if (CollectionUtils.isEmpty(queryDto.getDomainIds())) {
            PageResult<DomainDto> domainPage = generalDomainQuery(queryDto, false);
            result = domainPage.getContent();
        } else {
            result = convertToListDomainDto(domainRepo.findByDomainIdIn(queryDto.getDomainIds()));
        }

        return result;
    }

    @Override
    @Transactional
    public void discardCode(String currentUser, String codeNumber, Long categoryId) {
        if (!standardCodeRepo.existsById(codeNumber)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeNotFound", codeNumber));
        }

        Optional<StandardCode> codeOp = standardCodeRepo.findById(codeNumber);
        StandardCode code = codeOp.get();

        if (ObjectUtils.notEqual(code.getCategoryId(), categoryId)) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeCategoryWrong"));
        }

        if (ObjectUtils.equals(code.getState(), DomainState.X)) {
            throw new IllegalOperationException(
                    msgService.getMessage("standardCodeDiscarded", codeNumber));
        }

        DiscardStandardCode discardCode = buildDiscardStandardCode(code);
        discardCode.setDicardBy(currentUser);
        discardCode.setDicardTimestamp(new Date());
        discardCode.setState(DomainState.X);

        discardStandardCodeRepo.save(discardCode);

        EditHistoryEntity history = new EditHistoryEntity();
        history.setVersion(-1);
        history.setItemId(code.getCode());
        history.setTimestamp(new Date());
        history.setChanges(msgService.getMessage("codeBeanMarkedAbandon"));
        history.setHistoryType(EditHistoryEntity.TYPE_STD_CODE);
        history.setOperator(currentUser);
        editHistoryRepo.save(history);

        standardCodeRepo.delete(code);

        logger.info("standard code " + code.getCode() + " has been discarded by " + currentUser);
    }

    @Override
    @Transactional
    public void undiscardCode(String currentUser, String codeNumber, Long categoryId) {
        DiscardStandardCode discardStandardCode = discardStandardCodeRepo
                .findTopByCodeEqualsOrderByDicardTimestampDesc(codeNumber);
        if (discardStandardCode == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeNotFound", codeNumber));
        }

        if (ObjectUtils.notEqual(discardStandardCode.getCategoryId(), categoryId)) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeCategoryWrong"));
        }

        Optional<StandardCode> codeOp = standardCodeRepo.findById(codeNumber);
        if (codeOp.isPresent()) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeAlreadyPublish", codeNumber));
        }

        StandardCode code = buildStandardCode(discardStandardCode);
        code.setState(DomainState.A);

        standardCodeRepo.save(code);

        EditHistoryEntity history = new EditHistoryEntity();
        history.setVersion(-1);
        history.setItemId(code.getCode());
        history.setTimestamp(new Date());
        history.setChanges(msgService.getMessage("codeBeanMarkedEnable"));
        history.setHistoryType(EditHistoryEntity.TYPE_STD_CODE);
        history.setOperator(currentUser);
        editHistoryRepo.save(history);

        discardStandardCodeRepo.delete(discardStandardCode);
    }

    @Override
    @Transactional
    public void submitDomainReviewRequest(String currentUser, String assignee, String domainId) {
        self.submitDomainReviewRequest(currentUser, assignee, Collections.singleton(domainId));
    }

    @Override
    @Transactional
    public List<DomainDto> submitDomainReviewRequest(String currentUser, String assignee,
                                                     Collection<String> domainIds) {
        if (domainIds.isEmpty()) {
            return Collections.emptyList();
        }

        String assigner = currentUser;
        Set<Domain> domains = new HashSet<>();
        domains.addAll(domainRepo.findByDomainIdIn(domainIds));

        Iterator<Domain> domainIter = domains.iterator();
        while (domainIter.hasNext()) {
            if (!(domainIter.next().getState().getStage() < 0)) {
                domainIter.remove();
            }
        }

        domainIds = extractDomainIds(domains);
        Set<DomainAssignment> assignments = new HashSet<>();

        for (List<String> ids : Lists.partition(new ArrayList<>(domainIds), 999)) {
            assignments.addAll(domainAssignmentRepo.findAssignmentByDomainIds(ids));
        }

        Map<String, DomainAssignment> assignmentMap = new HashMap<>();
        for (DomainAssignment assignment : assignments) {
            assignmentMap.put(assignment.getDomainId(), assignment);
        }

        List<DomainAssignment> toBeUpdatedAssignments = new ArrayList<>(domains.size());
        List<Domain> toBeUpdatedDomains = new ArrayList<>(domains.size());

        for (Domain domain : domains) {
            if (!(domain.getState().getStage() < 0)) {
                logger.warn(
                        "Can only submit developing domain for approvement, current domain is in state ["
                                + domain.getState().getDescription() + "], name [" + domain
                                .getChineseName() + "]");
                continue;
            }

            DomainAssignment assignment = assignmentMap.get(domain.getDomainId());
            if (assignment == null) {
                assignment = new DomainAssignment();
                assignment.setCreator(assigner);
                assignment.setDomainId(domain.getDomainId());
            }
            assignment.setAssigner(assigner);
            assignment.setAssignee(assignee);
            assignment.setUserComment(null);
            assignment.setLastUpdate(new Date());

            toBeUpdatedAssignments.add(assignment);
            domain.setState(DomainState.C.name());
            toBeUpdatedDomains.add(domain);
        }

        domainAssignmentRepo.saveAll(toBeUpdatedAssignments);
        domainRepo.saveAll(toBeUpdatedDomains);

        return convertToListDomainDto(toBeUpdatedDomains);
    }

    @Override
    @Transactional
    public void rejectDomainReviewRequests(String currentUser, Collection<String> domainIds,
                                           String comment, boolean force) {
        if (domainIds.isEmpty()) {
            return;
        }

        Set<Domain> domains = new HashSet<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            domains.addAll(domainRepo.findByDomainIdIn(partition));
        }

        Iterator<Domain> domainIter = domains.iterator();
        while (domainIter.hasNext()) {
            if (domainIter.next().getState().getStage() != 0) {
                domainIter.remove();
            }
        }

        domainIds = extractDomainIds(domains);
        Set<DomainAssignment> assignments = new HashSet<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            assignments.addAll(domainAssignmentRepo.findAssignmentByDomainIds(partition));
        }

        Map<String, DomainAssignment> assignmentMap = new HashMap<>();
        for (DomainAssignment assignment : assignments) {
            assignmentMap.put(assignment.getDomainId(), assignment);
        }

        List<Domain> toBeUpdatedDomains = new ArrayList<>(domains.size());
        List<DomainAssignment> toBeUpdatedAssignments = new ArrayList<>(domains.size());

        for (Domain domain : domains) {
            if (domain.getState().getStage() != 0) {
                continue;
            }

            DomainAssignment assignment = assignmentMap.get(domain.getDomainId());
            boolean ableToModify = force;
            if (!ableToModify) {
                //if no assignment is created, not able to edit
                if (assignment == null) {
                    continue;
                }

                if (assignment.getAssignee().equals(currentUser)) {
                    ableToModify = true;
                }
            }

            if (ableToModify) {
                domain.setState(DomainState.D);
                toBeUpdatedDomains.add(domain);

                assignment.setAssignee(assignment.getAssigner());
                assignment.setLastUpdate(new Date());
                assignment.setUserComment(Strings.isNullOrEmpty(comment) ? "reject" : comment);
                toBeUpdatedAssignments.add(assignment);
            }
        }

        domainRepo.saveAll(toBeUpdatedDomains);
        domainAssignmentRepo.saveAll(toBeUpdatedAssignments);
    }

    @Override
    public Long totalDomains(Long domainCategoryId) {
        if (domainCategoryId == null) {
            return domainRepo.countDomains();
        } else {
            return domainRepo.countDomainsByCategory(domainCategoryId);
        }
    }

    @Override
    public Long totalCode(Long categoryId) {
        return standardCodeRepo.countCode(categoryId);
    }

    @Override
    @Transactional
    public List<DomainDto> approveDomainReviewRequests(String currentUser, Set<String> domainIds,
                                                       String reviewer,
                                                       String comment, boolean force) {

        if (domainIds.isEmpty()) {
            return Collections.emptyList();
        }

        boolean hasPermission = force;

        Set<Domain> domains = new HashSet<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            domains.addAll(domainRepo.findByDomainIdIn(partition));
        }

        Iterator<Domain> domainIter = domains.iterator();
        Set<String> updatingDomainId = new HashSet<>();
        while (domainIter.hasNext()) {
            Domain domain = domainIter.next();
            if (!domain.getState().equals(DomainState.C)) {
                domainIter.remove();
                continue;
            }

            if (domain.getUpdatingDomainId() != null) {
                if (updatingDomainId.contains(domain.getUpdatingDomainId())) {
                    throw new IllegalOperationException(msgService
                            .getMessage("cannotPassMoreStandardVersion", domain.getChineseName()));
                } else {
                    updatingDomainId.add(domain.getUpdatingDomainId());
                }
            }
        }

        domainIds = extractDomainIds(domains);

        Set<DomainAssignment> assignments = new HashSet<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            assignments.addAll(domainAssignmentRepo.findAssignmentByDomainIds(partition));
        }

        Map<String, DomainAssignment> assignmentMap = new HashMap<>();
        for (DomainAssignment assignment : assignments) {
            assignmentMap.put(assignment.getDomainId(), assignment);
        }

        List<Domain> toBeUpdatedDomains = new ArrayList<>(domains.size());
        List<Domain> toBeDeletedDomains = new LinkedList<>();
        Set<String> toBeDeletedAssignment = new HashSet<>();
        List<EditHistoryEntity> histories = new LinkedList<>();
        List<DomainVersion> versions = new LinkedList<>();
        Map<Long, List<DomainUdpDto>> udpMap = new HashMap<>();

        for (Domain domain : domains) {
            if (!domain.getState().equals(DomainState.C)) {
                continue;
            }

            DomainAssignment assignment = assignmentMap.get(domain.getDomainId());
            boolean ableToModify = hasPermission;
            if (!ableToModify) {
                //if no assignment is created, not able to edit
                if (assignment == null) {
                    continue;
                }

                if (assignment.getAssignee().equals(currentUser)) {
                    ableToModify = true;
                }
            }

            if (ableToModify) {
                domain.setState(DomainState.A.name());
                domain.setLastModification(new Date());
                toBeDeletedAssignment.add(domain.getDomainId());

                if (domain.getUpdatingDomainId() != null) {
                    Domain savedDomain = domainRepo
                            .findByDomainIdEquals(domain.getUpdatingDomainId());
                    if (savedDomain != null) {
                        String changes = compareDomains(savedDomain, domain);

                        DomainVersion version = buildDomainVersion(savedDomain);
                        if (!udpMap.containsKey(domain.getCategoryId())) {
                            udpMap
                                    .put(domain.getCategoryId(), getDomainUdps(domain.getCategoryId()));
                        }
                        version.setUdpDefs(udpMap.get(domain.getCategoryId()));
                        versions.add(version);

                        Domain oldDomain = cloneDomain(savedDomain, true);

                        oldDomain.setDomainId(domain.getDomainId());
                        oldDomain.setUpdatingDomainId(domain.getUpdatingDomainId());
                        if (StringUtils.isEmpty(oldDomain.getSubmitter())) {
                            oldDomain.setSubmitter(currentUser);
                        }

                        domain = cloneDomain(domain, true);
                        domain.setDomainId(savedDomain.getDomainId());
                        domain.setUpdatingDomainId(null);
                        domain.setVersion(oldDomain.getVersion() + 1);
                        if (StringUtils.isEmpty(domain.getSubmitter())) {
                            domain.setSubmitter(currentUser);
                        }

                        toBeDeletedDomains.add(oldDomain);

                        EditHistoryEntity history = new EditHistoryEntity();
                        history.setChanges(changes);
                        history.setHistoryType(EditHistoryEntity.TYPE_DOMAIN);
                        history.setItemId(domain.getDomainId());
                        history.setVersion(oldDomain.getVersion());
                        history.setOperator(currentUser);
                        history.setTimestamp(new Date());
                        histories.add(history);
                    }
                } else {
                    //when the domain state is changed to archived then republish it
                    // we should keep its first publish timestamp
                    if (domain.getFirstPublish() == null) {
                        domain.setFirstPublish(domain.getLastModification());
                    } else {
                        EditHistoryEntity history = new EditHistoryEntity();
                        String categoryName = msgService.getMessage("category.standard.data");
                        if (domain.getCategoryId() != null && isMetrics(domain.getCategoryId())) {
                            categoryName = msgService.getMessage("category.index.data");
                        }
                        history.setChanges(msgService.getMessage("hasBeanRePublished"));
                        history.setItemId(domain.getDomainId());
                        history.setVersion(-1);
                        history.setHistoryType(EditHistoryEntity.TYPE_DOMAIN);
                        history.setOperator(currentUser);
                        history.setTimestamp(new Date());
                        histories.add(history);
                    }
                }

                toBeUpdatedDomains.add(domain);
            }
        }

        domainRepo.saveAll(toBeUpdatedDomains);

        if (!toBeDeletedDomains.isEmpty()) {
            domainRepo.deleteAll(toBeDeletedDomains);
        }
        if (!toBeDeletedAssignment.isEmpty()) {
            domainAssignmentRepo.deleteByDomainIdIn(toBeDeletedAssignment);
        }
        if (!histories.isEmpty()) {
            editHistoryRepo.saveAll(histories);
        }
        if (!versions.isEmpty()) {
            domainVersionRepo.saveAll(versions);
        }

        return convertToListDomainDto(toBeUpdatedDomains);
    }

    @Override
    @Transactional
    public List<DomainDto> withDrawDomains(String currentUser, Collection<String> domainIds,
                                           boolean force) {
        if (domainIds.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Domain> domains = new HashSet<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            domains.addAll(domainRepo.findByDomainIdIn(partition));
        }

        Iterator<Domain> domainIter = domains.iterator();
        while (domainIter.hasNext()) {
            if (!(domainIter.next().getState().getStage() > 0)) {
                domainIter.remove();
            }
        }

        domainIds = extractDomainIds(domains);

        Set<DomainAssignment> assignments = new HashSet<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            assignments.addAll(domainAssignmentRepo.findAssignmentByDomainIds(partition));
        }

        Map<String, DomainAssignment> assignmentMap = new HashMap<>();
        for (DomainAssignment assignment : assignments) {
            assignmentMap.put(assignment.getDomainId(), assignment);
        }

        List<Domain> toBeUpdatedDomains = new ArrayList<>(domains.size());
        List<DomainAssignment> toBeUpdatedAssignments = new ArrayList<>(domains.size());
        List<String> toBeWithDrawDomainIds = new LinkedList<>();

        for (Domain domain : domains) {
            if (!(domain.getState().getStage() > 0)) {
                continue;
            }

            DomainAssignment assignment = assignmentMap.get(domain.getDomainId());

            if (assignment != null) {
                assignment.setLastUpdate(new Date());
                assignment.setAssigner(currentUser);
                assignment.setAssignee(currentUser);
                toBeUpdatedAssignments.add(assignment);
            } else {
                assignment = new DomainAssignment();
                assignment.setDomainId(domain.getDomainId());
                assignment.setAssignee(currentUser);
                assignment.setAssigner(currentUser);
                assignment.setLastUpdate(new Date());
                assignment.setCreator(
                        Strings.isNullOrEmpty(domain.getSubmitter()) ? currentUser
                                : domain.getSubmitter());
                toBeUpdatedAssignments.add(assignment);
            }

            domain.setState(DomainState.D.name());
            toBeUpdatedDomains.add(domain);
            toBeWithDrawDomainIds.add(domain.getDomainId());

            if (toBeUpdatedDomains.size() >= 30000) {
                domainRepo.saveAll(toBeUpdatedDomains);
                domainAssignmentRepo.saveAll(toBeUpdatedAssignments);
                toBeUpdatedDomains.clear();
                toBeUpdatedAssignments.clear();
            }
        }

        domainRepo.saveAll(toBeUpdatedDomains);
        domainAssignmentRepo.saveAll(toBeUpdatedAssignments);

        return convertToListDomainDto(toBeUpdatedDomains);
    }

    @Override
    public DomainTreeNodeDto searchDomains(String currentUser, String keyword, DomainState state,
                                           Long domainCategoryId) {

        Set<Domain> match = null;
        if (DomainState.A.equals(state)) {
            match = domainRepo.searchDomains(keyword.toLowerCase(), domainCategoryId);
        } else {
            match = domainAssignmentRepo
                    .searchDomains(currentUser, expandedStateMap.get(state),
                            keyword, domainCategoryId);
        }

        if (match != null) {
            return buildDomainTree(match, domainCategoryId);
        } else {
            return buildDomainTree(Collections.emptySet(), domainCategoryId);
        }
    }

    @Override
    public Set<SimpleDomainDto> searchDomains(Collection<String> domainIds, String keyword) {
        if (domainIds.isEmpty()) {
            return Collections.emptySet();
        }

        Set<SimpleDomainDto> res = new HashSet<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            if (Strings.isNullOrEmpty(keyword)) {
                res.addAll(domainRepo.findBaseDomainsByDomainIds(partition));
            } else {
                res.addAll(domainRepo
                        .findBaseDomainsByKeywordAndDomainIds(partition, keyword.toLowerCase()));
            }
        }
        return res;
    }

    @Override
    public List<StandardCodeDto> getPublicCodes(DomainState state, Long categoryId) {
        if (state == null) {
            return convertToListStandardCodeDto(standardCodeRepo.findAllCodeOfCategory(categoryId));
        } else {
            return convertToListStandardCodeDto(
                    standardCodeRepo.findByStateEquals(state, categoryId));
        }
    }

    @Override
    public List<StandardCodeDto> getUserAccessiblePublicCodes(String currentUser) {
        Map<Long, DomainFolderDto> categoryMap = new HashMap<>();
        List<Long> accessibleCategoryIds = new ArrayList<>();

        for (UserAccessibleCategoryDto uac : domainCategoryPermissionService
                .getUserAccessibleCategories(currentUser, false)) {
            if (PermissionLevel.isReadable(uac.getPermissionLevel().getMask())) {
                categoryMap.put(uac.getCategory().getId(), uac.getCategory());
                accessibleCategoryIds.add(uac.getCategory().getId());
            }
        }

        List<StandardCodeDto> res = new LinkedList<>();

        for (List<Long> partition : Lists.partition(accessibleCategoryIds, 999)) {
            res.addAll(convertToListStandardCodeDto(
                    standardCodeRepo.findAllCodePublishedAndCategoryIdIn(partition)));
        }

        for (StandardCodeDto code : res) {
            code.setCategoryName(categoryMap.get(code.getCategoryId()).getName());
        }

        return res;
    }

    @Override
    @Transactional
    public void savePrivateDomains(DomainFolderDto root, String currentUser) {
        privateDomainFolderRepo.deleteByOwnerEquals(currentUser);
        privateDomainRepo.deleteByOwnerEquals(currentUser);

        if (root == null) {
            return;
        } else {
            List<PrivateDomainFolder> toBeSavedFolders = new LinkedList<>();
            List<PrivateDomain> toBeSavedDomains = new LinkedList<>();

            traverseTree(root, null, toBeSavedFolders, toBeSavedDomains, currentUser, true);
            if (!toBeSavedFolders.isEmpty()) {
                privateDomainFolderRepo.saveAll(toBeSavedFolders);
            }
            if (!toBeSavedDomains.isEmpty()) {
                privateDomainRepo.saveAll(toBeSavedDomains);
            }

            logger.info(
                    "user " + currentUser + " created " + toBeSavedFolders.size() + " folders and "
                            + toBeSavedDomains.size() + " domains");
        }
    }

    @Override
    @Transactional
    public void savePrivateCodes(Collection<StandardCodeDto> codes, String owner) {
        privateStdCodeRepo.deleteByOwnerEquals(owner);
        if (codes != null) {
            List<PrivateStandardCode> toBeSavedCodes = new LinkedList<>();
            for (StandardCodeDto code : codes) {
                PrivateStandardCode pstdCode = convertToPrivateStandardCode(code);
                pstdCode.setOwner(owner);
                toBeSavedCodes.add(pstdCode);
            }

            if (!toBeSavedCodes.isEmpty()) {
                privateStdCodeRepo.saveAll(toBeSavedCodes);
                logger
                        .info("user " + owner + " uploaded his codes, totally " + toBeSavedCodes.size()
                                + " codes");
            }
        } else {
            logger.warn("user " + owner + " just cleaned public codes");
        }
    }

    @Override
    public Long getPrivateDomainLastUpdateTime(String currentUser) {
        Timestamp timestamp = privateDomainRepo.getPrivateDomainLastUpdateTimestamp(currentUser);
        if (timestamp == null) {
            return 0L;
        } else {
            return timestamp.getTime();
        }
    }

    @Override
    public Long getPrivateCodeLastUpdateTime(String currentUser) {
        Timestamp timestamp = privateStdCodeRepo
                .getPrivateCodeLastUpdateTimestamp(currentUser);
        if (timestamp == null) {
            return 0L;
        } else {
            return timestamp.getTime();
        }
    }

    @Override
    public void addPublicDomainAndPublicCodes(List<DomainDto>
                                                      newDomains,
                                              List<StandardCodeDto> codes,
                                              String currentUser) {
        //TODO
    }

    @Override
    public LoadPrivateDomainDto getAllPrivateDomains(String currentUser) {
        Map<String, List<DomainDto>> userDomainMap = new HashMap<>();
        Map<String, List<StandardCodeDto>> userCodeMap = new HashMap<>();
        Map<String, DomainFolderDto> rootMap = new HashMap<>();
        Set<String> initedUser = new HashSet<>();

        List<PrivateDomain> allDomains = (Strings.isNullOrEmpty(currentUser) ? privateDomainRepo
                .findAllPrivateDomains() : privateDomainRepo.findByOwnerEquals(currentUser));

        for (PrivateDomain domain : allDomains) {
            DomainDto domainDto = convertToDomainDto(domain);
            if (!userDomainMap.containsKey(domain.getOwner())) {
                userDomainMap.put(domain.getOwner(),
                        new ArrayList<>(100));
            }

            if (!initedUser.contains(domain.getOwner())) {
                Map<String, DomainFolderDto> folderMap = new HashMap<>();
                for (PrivateDomainFolder category : privateDomainFolderRepo
                        .findByOwnerEquals(domain.getOwner())) {
                    DomainFolderDto folder = convertToDomainFolder(category);
                    folderMap.put(folder.getStrId(), folder);
                }

                DomainFolderDto root = null;
                for (DomainFolderDto folder : folderMap.values()) {
                    DomainFolderDto parent = folderMap.get(folder.getStrParentId());
                    if (parent == null) {
                        root = folder;
                    } else {
                        parent.addSubFolder(folder);
                    }
                }
                if (root != null) {
                    rootMap.put(domain.getOwner(), root);
                }

                initedUser.add(domain.getOwner());
            }

            userDomainMap.get(domain.getOwner()).add(domainDto);
        }

        for (String username : initedUser) {
            List<StandardCodeDto> codeDtos = convertToPrivateListStandardCodeDto(
                    privateStdCodeRepo.findByOwnerEquals(username));
            userCodeMap.put(username, codeDtos);
        }

        LoadPrivateDomainDto result = new LoadPrivateDomainDto();

        Map<String, DomainWithCodeDto> map = new HashMap<>();
        for (String username : initedUser) {
            DomainWithCodeDto dcd = new DomainWithCodeDto();
            dcd.setDomains(userDomainMap.get(username));
            dcd.setCodes(userCodeMap.get(username));
            dcd.setRoot(rootMap.get(username)
            );
            map.put(username, dcd);
        }
        result.setPrivateDomains(map);

        return result;
    }

    @Override
    public DomainDto getDomainByDomainCode(String domainCode) {
        List<Domain> domains = domainRepo.findByDomainCodeInPublishedState(domainCode);
        if (domains.isEmpty()) {
            return null;
        } else {
            return convertToDomainDto(domains.get(0));
        }
    }

    @Override
    public List<String> getPrivateDomainUserList() {
        return privateDomainRepo.getUniqueUsernamesOfPrivateDomains();
    }

    @Override
    public DomainFolderDto getUserPrivateDomains(String username) {
        List<DomainDto> domains = convertToListPrivateDomainDto(
                privateDomainRepo.findByOwnerEquals(username));
        List<PrivateDomainFolder> categories = privateDomainFolderRepo.findByOwnerEquals(username);

        if (!CollectionUtils.isEmpty(categories)) {
            Map<String, DomainFolderDto> nodeMap = new HashMap<>();
            DomainFolderDto root = null;
            for (PrivateDomainFolder category : categories) {
                DomainFolderDto node = convertToDomainFolder(category);
                nodeMap.put(category.getId(), node);
            }

            for (DomainFolderDto node : nodeMap.values()) {
                if (node.getStrId() != null && node.getStrParentId() != null) {
                    nodeMap.get(node.getStrParentId()).addSubFolder(node);
                }
                if (node.getStrParentId() == null) {
                    root = node;
                }
            }

            for (DomainDto domain : domains) {
                DomainFolderDto category = nodeMap.get(domain.getPrivateFolderId());
                if (category == null) {
                    throw new UnexpectedStateException(
                            msgService
                                    .getMessage("domainCategoryMissing", domain.getPrivateFolderId()));
                }
                category.addDomain(domain);
            }

            return root;
        }

        return null;
    }

    @Override
    public CategoryNodeDto getUserPrivateDomainsAfterTimestamp(String username, Long timestamp, Integer apiVersion) {

        // 1.查询私有标准
        List<PrivateDomain> privateDomains;
        if (timestamp == null || timestamp.equals(0L)) {
            privateDomains = privateDomainRepo.findByOwnerEquals(username);
        } else {
            privateDomains = privateDomainRepo.findByOwnerEqualsAndLastModificationAfter(username, new Date(timestamp));
        }

        // 2.获取用户的目录
        List<PrivateDomainFolder> categories = privateDomainFolderRepo.findByOwnerEquals(username);

        // 3.遍历目录
        if (!CollectionUtils.isEmpty(categories)) {
            Map<String, CategoryNodeDto> nodeMap = new HashMap<>();
            CategoryNodeDto root = null;
            for (PrivateDomainFolder category : categories) {
                CategoryNodeDto node = DomainConvertUtils.convertToLocalCategoryNodeDto(category);
                nodeMap.put(category.getId(), node);
            }

            for (CategoryNodeDto node : nodeMap.values()) {
                if (node.getId() != null && node.getParentId() != null) {
                    nodeMap.get(node.getParentId()).addChild(node);
                }
                if (node.getParentId() == null) {
                    root = node;
                }
            }

            // 4.查询关联标准、部门、系统为构建数据标准额外属性到UDP做准备
            Set<DomainExtraAttributesUdp> extraAttributes = new HashSet<>();
            if (!Strings.isNullOrEmpty(loadDomainExtraAttributes)) {
                for (String attr : loadDomainExtraAttributes.split(",")) {
                    extraAttributes.add(DomainExtraAttributesUdp.valueOf(attr));
                }
            }
            Set<String> relationDomainCodes = new HashSet<>();
            if (extraAttributes.contains(DomainExtraAttributesUdp.relationDomain)) {
                for (PrivateDomain domain : privateDomains) {
                    if (domain.getRelationDomain() != null && !domain.getRelationDomain().isEmpty()) {
                        relationDomainCodes.addAll(domain.getRelationDomain());
                    }
                }
            }
            Map<String, Domain> relationDomainMap = new HashMap<>();      // 所有关联标准
            Map<String, OrganizationTreeDto> orgMap = new HashMap<>();    // 所有部门
            Map<Long, BaseModelCategory> systemMap = new HashMap<>();     // 所有系统
            getExtraAttributesRef(extraAttributes, relationDomainCodes, relationDomainMap, orgMap, systemMap);

            // 基础标准的UDP ID集合
            List<Long> udpIds = new ArrayList<>();
            if (udpMap != null) {
                udpIds = Optional.ofNullable(udpMap.get(1L)).orElse(new ArrayList<>()).stream()
                        .map(DomainUdpDto::getUdpId)
                        .collect(Collectors.toList());
            }
            for (PrivateDomain domain : privateDomains) {
                CategoryNodeDto category = nodeMap.get(domain.getFolderId());
                if (category == null) {
                    throw new UnexpectedStateException(
                            msgService.getMessage("domainCategoryMissing", domain.getFolderId()));
                }
                category.addDomain(DomainConvertUtils.convertToLocalDomainDto(domain, udpIds, relationDomainMap, orgMap, systemMap, extraAttributes, apiVersion));
            }

            return root;
        }

        return null;
    }

    @Override
    public List<DomainDto> getPrivateDomains(Collection<String> domainIds) {
        if (CollectionUtils.isEmpty(domainIds)) {
            return Collections.emptyList();
        }

        List<DomainDto> res = new LinkedList<>();

        for (List<String> partition : Lists.partition(new LinkedList<>(domainIds), 999)) {
            res.addAll(
                    convertToListPrivateDomainDto(privateDomainRepo.findByDomainIdIn(partition)));
        }

        return res;
    }

    @Override
    public List<BaseStandardCodeDto> getBaseCodeList(Long categoryId) {
        return standardCodeRepo.findAllBaseStandardCode(categoryId);
    }

    @Override
    public List<BaseStandardCodeDto> getBaseCodesByCodeNumbers(List<String> codeNumbers,
                                                               Long categoryId) {
        List<BaseStandardCodeDto> result = new ArrayList<>();
        for (List<String> partition : Lists.partition(codeNumbers, 999)) {
            result
                    .addAll(standardCodeRepo.findBaseStandardCodeByCodeNumbers(partition, categoryId));
        }
        return result;
    }

    @Override
    public List<BaseStandardCodeDto> getBaseCodesByNumbersAndName(List<String> codeNumbers,
                                                                  String name, Long categoryId) {
        List<BaseStandardCodeDto> result = new ArrayList<>();
        if (StringUtils.isEmpty(name)) {
            result.addAll(getBaseCodesByCodeNumbers(codeNumbers, categoryId));
        } else {
            for (List<String> partition : Lists.partition(codeNumbers, 999)) {
                result.addAll(standardCodeRepo
                        .findBaseStandardCodeByCodeNumbersAndNameLike(partition, "%" + name + "%",
                                categoryId));
            }
        }
        return result;
    }

    @Override
    @Transactional
    public NamingStandardDto addNamingStandard(NamingStandardDto namingStandardDto,
                                               String currentUser) {
        NamingStandard namingStandard = convertToNamingStandard(namingStandardDto);

        checkNsParameters(namingStandard);
        Long counted = 0L;
        if (Strings.isNullOrEmpty(namingStandard.getCategory())) {
            counted = namingStandardRepo
                    .countAllByChineseNameAndCategoryIsNullOrCategory(namingStandard.getChineseName(),
                            "");
        } else {
            counted = namingStandardRepo
                    .countAllByChineseNameAndCategory(namingStandard.getChineseName(),
                            namingStandard.getCategory());
        }

        if (ObjectUtils.notEqual(0L, counted)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("nsCnNameExists", namingStandard.getChineseName()));
        }

        namingStandard.setNsId(null);
        namingStandard.setSubmitter(currentUser);
        namingStandard.setTimestamp(System.currentTimeMillis());
        namingStandard = namingStandardRepo.save(namingStandard);

//        EditHistoryEntity history = buildHistory(EMPTY_NS, namingStandard, currentUser);
//        history.setVersion(0);
//        editHistoryRepo.save(history);

        return convertToNamingStandardDto(namingStandard);
    }

    @Override
    @Transactional
    public NamingStandardDto updateNamingStandard(NamingStandardDto namingStandardDto,
                                                  String currentUser) {
        NamingStandard namingStandard = convertToNamingStandard(namingStandardDto);

        checkNsParameters(namingStandard);
        if (namingStandard.getNsId() == null) {
            throw new InvalidArgumentException(msgService.getMessage("nsIdMssing"));
        }

        Long counted = 0L;
        if (Strings.isNullOrEmpty(namingStandard.getCategory())) {
            counted = namingStandardRepo
                    .countAllByChineseNameAndNsIdIsNotAndCategoryIsNullOrCategory(
                            namingStandard.getChineseName(), namingStandard.getNsId(), "");
        } else {
            counted = namingStandardRepo
                    .countAllByChineseNameAndNsIdIsNotAndCategory(namingStandard.getChineseName(),
                            namingStandard.getNsId(), namingStandard.getCategory());
        }

        if (ObjectUtils.notEqual(0L, counted)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("nsCnNameExists", namingStandard.getChineseName()));
        }

        namingStandard.setSubmitter(currentUser);
        namingStandard.setTimestamp(System.currentTimeMillis());

        Optional<NamingStandard> oldNamingStandardOptional = namingStandardRepo
                .findById(namingStandard.getNsId());
        NamingStandard oldNamingStandard = oldNamingStandardOptional.get();
        EditHistoryEntity history = buildHistory(oldNamingStandard, namingStandard, currentUser);
        if (history != null) {
            editHistoryRepo.save(history);
        }

        namingStandard = namingStandardRepo.save(namingStandard);
        return convertToNamingStandardDto(namingStandard);
    }

    @Override
    @Transactional
    public void deleteNamingStandards(List<Long> ids, String currentUser) {
        if (CollectionUtils.isEmpty(ids)) {
            return;
        }

        Set<String> nsNames = new HashSet<>();

        for (List<Long> partition : Lists.partition(ids, 999)) {
            List<NamingStandard> namingStandards = namingStandardRepo.findByNsIdIn(partition);
            for (NamingStandard namingStandard : namingStandards) {
                nsNames.add(namingStandard.getChineseName());
            }
            namingStandardRepo.deleteAll(namingStandards);
        }

        logger.info(currentUser + " delete " + nsNames.size() + " namingstandard:" + StringUtils
                .join(nsNames, ","));
    }

    @Override
    public PageResult<NamingStandardDto> getPageOfNamingStandard(NamingStandardQueryDto queryDto) {
        List<String> categoryList = null;
        if (!joptsimple.internal.Strings.isNullOrEmpty(queryDto.getCategories())) {
            categoryList = Lists.newArrayList(queryDto.getCategories().split("\\|"));
        }
        if (!CollectionUtils.isEmpty(queryDto.getCategoryList())) {
            categoryList = queryDto.getCategoryList();
        }
        String orderBy = queryDto.getOrderBy();
        String sort = queryDto.getSort();
        if (Strings.isNullOrEmpty(orderBy)) {
            throw new InvalidArgumentException(msgService.getMessage("nsOrderByMissing"));
        }

        if (Strings.isNullOrEmpty(sort)) {
            throw new InvalidArgumentException(msgService.getMessage("nsSortByMissing"));
        }

        if (!orderBy.equalsIgnoreCase("abbreviation") && !orderBy.equalsIgnoreCase("chineseName")
                && !orderBy.equalsIgnoreCase("englishName")
                && !orderBy.equalsIgnoreCase("timestamp") && !orderBy.equalsIgnoreCase("category")) {
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

        Pageable page = PageRequest.of(queryDto.getCurrentPage(), queryDto.getPageSize());

        Page findPage = namingStandardExtendRepo
                .findByKeywordAndCategoryIn(queryDto.getKeyword(), categoryList, orderBy, isAsc, page);
        PageResult<NamingStandardDto> result = new PageResult<>();

        result.setContentDirectly(convertToListNamingStandard(findPage.getContent()));
        result.setTotalItems(findPage.getTotalElements());
        result.setPageSize(queryDto.getPageSize());
        result.setCurrentPage(queryDto.getCurrentPage());

        return result;
    }

    @Override
    public List<NamingStandardDto> getRecentUpdatedNamingStandards(Long lastFetchTimestamp) {
        return convertToListNamingStandard(
                namingStandardRepo.findNamingStandardByTimestampGreaterThan(lastFetchTimestamp));
    }

    @Override
    public List<String> getAllNamingStandardCategories() {
        return namingStandardRepo.findDistinctCategories();
    }

    public void importNamingStandards(List<NamingStandardDto> namingStandards, String currentUser) {
        if (namingStandards == null || namingStandards.isEmpty()) {
            return;
        }
        Map<String, List<NamingStandardDto>> namingStandardsByCategory = new HashMap<>();
        for (NamingStandardDto namingStandardDto : namingStandards) {
            if (Strings.isNullOrEmpty(namingStandardDto.getCategory()) && !namingStandardsByCategory
                    .containsKey("Default")) {
                namingStandardsByCategory.put("Default", new LinkedList<>());
            } else if (!namingStandardsByCategory.containsKey(namingStandardDto.getCategory())) {
                namingStandardsByCategory
                        .put(namingStandardDto.getCategory(), new LinkedList<NamingStandardDto>());
            }
            if (Strings.isNullOrEmpty(namingStandardDto.getCategory())) {
                namingStandardsByCategory.get("Default").add(namingStandardDto);
            } else {
                namingStandardsByCategory.get(namingStandardDto.getCategory())
                        .add(namingStandardDto);
            }
        }

        for (Map.Entry<String, List<NamingStandardDto>> entry : namingStandardsByCategory
                .entrySet()) {
            logger.debug("Import category:" + entry.getKey());
            importNamingStandsByCategory(entry.getValue(), currentUser, entry.getKey());
        }

    }

    @Override
    @Transactional
    public ImportInstantJobResult importNamingStandards(File file, String currentUser) throws Exception {
        ImportInstantJobResult res = new ImportInstantJobResult();
        ExcelLoadJobResult<NamingStandardExcelDto> result = excelLoader
                .loadFile(file.getAbsolutePath(), 0, NamingStandardExcelDto.class);
        List<NamingStandardExcelDto> namingStandardExcelDtos = result.getLoaded();
        List<NamingStandardDto> namingStandards = convertNamingStandardDtos(
                namingStandardExcelDtos);

        importNamingStandards(namingStandards, currentUser);
        res.setSuccess(namingStandardExcelDtos.size());
        res.setFailed(0);
        return res;
    }

    @Override
    public PageResult<EditHistory> getNamingStandardHistory(Long nsId, int pageSize,
                                                            int currentPage) {
        return convertToEditHistoryPageResult(editHistoryRepo
                .findByHistoryTypeEqualsAndItemIdEqualsOrderByTimestampDesc(EditHistoryEntity.TYPE_NS,
                        nsId.toString(),
                        PageRequest.of(currentPage, pageSize)));
    }

    @Override
    public List<BaseStandardCodeDto> getDiscardCodeList(Long categoryId) {
        return discardStandardCodeRepo.findAllBaseStandardCode(categoryId);
    }

    @Override
    public StandardCodeDto getCodeByCodeNumber(String codeNumber, Long categoryId) {
        if (Strings.isNullOrEmpty(codeNumber)) {
            return null;
        }

        Optional<StandardCode> code = standardCodeRepo.findById(codeNumber);
        if (code.isPresent()) {
            if (categoryId != null) {
                //在某些系统内部调用，我们不需要传递categoryId，否则很多地方需要改
                checkCodeCategory(code.get().getCategoryId(), categoryId);
            }
            StandardCodeDto result = convertToStandCodeDto(code.get());
            changeUpdatingCodeToOldCode(Lists.newArrayList(result));

            // 映射码值状态
            String refStandardCode = result.getRefStandardCode();
            if(StringUtils.isNotEmpty(refStandardCode)){
                Optional<StandardCode> refStandard = standardCodeRepo.findById(refStandardCode);
                refStandard.ifPresent(standard -> result.setRefStandardState(standard.getState()));
            }

            return result;
        } else {
            throw new ItemNotFoundException(
                    msgService.getMessage("standardCodeNotFoundByNumber", codeNumber));
        }
    }

    @Override
    public List<StandardCodeDto> getCodesByCodeNumbers(List<String> codes, Long categoryId) {
        if (CollectionUtils.isEmpty(codes)) {
            return new ArrayList<>();
        }

        if (categoryId == null) {
            return convertToListStandardCodeDto(standardCodeRepo.findByCodeIn(codes));
        } else {
            return convertToListStandardCodeDto(
                    standardCodeRepo.findByCodeInAndCategoryIdEquals(codes, categoryId));
        }
    }

    @Override
    @Transactional
    public StandardCodeDto addCode(StandardCodeDto standardCodeDto, String currentUser) {
        StandardCode code = convertToStandardCode(standardCodeDto);

        if (standardCodeDto.isAutoGenCode()) {
            String domainCode = generateService
                    .getSingleDomainCode(DatablauDomainType.STANDARD_CODE);
            code.setCode(domainCode);
        }

        checkCodeBasicInfo(code);

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
            createStandardVersion(code, currentUser, msgService.getMessage("codeBeanMarkedPublished"));
        }

        return convertToStandCodeDto(standardCodeRepo.save(code));
    }

    @Override
    @Transactional
    public StandardCodeDto updateCode(StandardCodeDto standardCodeDto, String currentUser) {
        StandardCode code = convertToStandardCode(standardCodeDto);

        checkCodeBasicInfo(code);

        if (ObjectUtils.equals(standardCodeRepo.countByCodeEquals(code.getCode()), 0L)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeNotFoundByCode", code.getCode()));
        }

        int maxOrder = -1;
        List<StandardCodeValueDto> noOrderValues = new LinkedList<>();
        for (StandardCodeValueDto value : code.getValues()) {
            if (value.getOrder() != null) {
                maxOrder = Math.max(maxOrder, value.getOrder());
            } else {
                noOrderValues.add(value);
            }
        }

        if (!noOrderValues.isEmpty()) {
            for (StandardCodeValueDto value : noOrderValues) {
                value.setOrder(++maxOrder);
            }
        }

        Optional<StandardCode> oldCodeOp = standardCodeRepo.findById(code.getCode());
        StandardCode oldCode = oldCodeOp.get();

        if (ObjectUtils.notEqual(code.getCategoryId(), oldCode.getCategoryId())) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeCategoryNotEqual"));
        }

        code.setLastModification(new Date());
        code.setSubmitter(currentUser);
        code.setState(oldCode.getState());
        code.setVersion(oldCode.getVersion());

        if (DomainState.A.equals(oldCode.getState()) && DomainState.A.equals(code.getState())) {
            code.setVersion(oldCode.getVersion() == null ? 1 : oldCode.getVersion() + 1);
            createStandardVersion(code, currentUser, msgService.getMessage("codeHappendModify"));
        }

        return convertToStandCodeDto(standardCodeRepo.save(code));
    }

    @Override
    @Transactional
    public void deleteCodeByCodeNumbers(Collection<String> codeNumbers, String currentUser,
                                        Long categoryId) {
        if (codeNumbers == null || codeNumbers.isEmpty()) {
            return;
        }

        List<String> listCode = null;
        if (codeNumbers instanceof List) {
            listCode = (List<String>) codeNumbers;
        } else {
            listCode = new ArrayList<>(codeNumbers);
        }

        for (List<String> partition : Lists.partition(listCode, 999)) {
            standardCodeRepo.deleteByCodeInAndCategoryIdEquals(partition, categoryId);
            try {
                domainDataSynchronizer
                        .deleteItems(partition, getDDCIndexName(LDMTypes.oDataStandardCode));
            } catch (Exception e) {
                logger.error(e.getMessage());
            }
            standardCodeRepo.deleteByCodeIn(partition);
            standardCodeRepo.updateRefCodeByCodeIn(partition);
            standardCodeVerRepo.deleteByCodeIn(partition);

            // 更新代码的映射代码
            standardCodeRepo.deleteRefCode(partition);

            // 更新标准的引用代码
            domainRepo.deleteReferenceCode(partition);

            //检查当前code是否关联的有任务，如果有，就删除
            try{
                List<Long> jobIds = standardCodeSourceRepo.findIdByCodesIn(listCode);
                if (jobIds != null && !jobIds.isEmpty() && damConnectable) {
                    LocalJobRegistryAdapter localJobRegistryAdapter = BeanHelper.getBean(LocalJobRegistryAdapter.class);
                    localJobRegistryAdapter.deleteJobs(jobIds);
                }
            }catch (Exception e){
                logger.warn(e.getMessage(), e);
            }
        }


        // 发送kafka消息 处理元数据中的标准代码
        KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
        DeleteStandardCodeMessage message = new DeleteStandardCodeMessage(new ArrayList<>(codeNumbers));
        message.setMsgId(System.currentTimeMillis());
        message.setSendTime(new Date());
        kafkaPublishService.sendMessage(deleteStandardTopic, message);

        tagService.deleteByItemIdInAndTypeIdEquals(new ArrayList<>(codeNumbers), LDMTypes.oDataStandardCode);
    }

    @Override
    @Transactional
    public void addPublicCodes(List<StandardCodeDto> codes, String currentUser) {
        Map<String, StandardCode> newCodes = new HashMap<>();

        Long categoryId = null;

        for (StandardCodeDto codeDto : codes) {
            StandardCode code = convertToStandardCode(codeDto);
            if (DomainState.A.equals(code.getState())
                    && code.getFirstPublish() == null) {
                code.setFirstPublish(new Date());
            }
            code.setCreateTime(new Date());
            checkCodeBasicInfo(code);
            newCodes.put(code.getCode(), code);

            if (categoryId == null) {
                categoryId = code.getCategoryId();
            }

            if (ObjectUtils.notEqual(categoryId, code.getCategoryId())) {
                throw new InvalidArgumentException(
                        msgService.getMessage("allStandardCodeShouldUnderSameCategory"));
            }
        }

        Map<String, StandardCodeVersion> toBeUpdatedCode = new HashMap<>();
        Set<String> changed = new HashSet<>();

        List<Pair<StandardCode, StandardCode>> updateCodePairs = new LinkedList<>();

        for (List<String> partition : Lists.partition(new ArrayList<>(newCodes.keySet()), 999)) {
            for (StandardCode code : standardCodeRepo.findAllById(partition)) {
                updateCodePairs.add(Pair.of(code, newCodes.get(code.getCode())));
                toBeUpdatedCode.put(code.getCode(), new StandardCodeVersion(code));
            }
        }

        if (!updateCodePairs.isEmpty()) {
            List<EditHistoryEntity> histories = compareCodeAndSaveHistory(updateCodePairs,
                    currentUser);
            if (!histories.isEmpty()) {
                editHistoryRepo.saveAll(histories);

                for (EditHistoryEntity history : histories) {
                    changed.add(history.getItemId());
                    newCodes.get(history.getItemId())
                            .setVersion(toBeUpdatedCode.get(history.getItemId()).getVersion() + 1);
                }
            }
        }

        if (!changed.isEmpty()) {
            List<StandardCodeVersion> realChangedCode = new ArrayList<>(changed.size());
            for (StandardCodeVersion oldCode : toBeUpdatedCode.values()) {
                if (changed.contains(oldCode.getCode())) {
                    realChangedCode.add(oldCode);
                }
            }

            standardCodeVerRepo.saveAll(realChangedCode);
        }

        standardCodeRepo.saveAll(newCodes.values());

        logger.info(currentUser + " added " + newCodes.size() + " codes ");
    }

    public StandardParaDto addPublicCodes(StandardParaDto dto, String currentUser, boolean published, boolean ignoreError) {
        StandardParaDto res = new StandardParaDto();
        Map<String, Object[]> importStandardCodeMap = new HashMap<>();
        Iterator<StandardCodeDto> iterator = dto.getInsertDto().iterator();
        while (iterator.hasNext()) {
            StandardCodeDto codeDto = iterator.next();
            StandardCode code = convertToStandardCode(codeDto);
            code.setCreateTime(new Date());
            code.setVersion(1);
            code.setSubmitter(currentUser);
//            checkCodeBasicInfo(code);
            if (Strings.isNullOrEmpty(code.getCode())) {
                codeDto.setErrorMsg(StringUtils.isBlank(codeDto.getErrorMsg())?msgService.getMessage("standardCodeNotNull") : codeDto.getErrorMsg()+";"+msgService.getMessage("standardCodeNotNull"));
//                dto.getErrorDto().add(codeDto);
//                iterator.remove();
//                continue;
            }

            if (Strings.isNullOrEmpty(code.getName())) {
                codeDto.setErrorMsg(StringUtils.isBlank(codeDto.getErrorMsg())?msgService.getMessage("standardZhNameNotNull") : codeDto.getErrorMsg()+";"+msgService.getMessage("standardZhNameNotNull"));
//                dto.getErrorDto().add(codeDto);
//                iterator.remove();
//                continue;
            }

            if (Strings.isNullOrEmpty(code.getEnName())) {
                codeDto.setErrorMsg(StringUtils.isBlank(codeDto.getErrorMsg())?msgService.getMessage("standardEnNameNotNull") : codeDto.getErrorMsg()+";"+msgService.getMessage("standardEnNameNotNull"));
//                dto.getErrorDto().add(codeDto);
//                iterator.remove();
//                continue;
            }

            if (code.getCategoryId() == null) {
                codeDto.setErrorMsg(StringUtils.isBlank(codeDto.getErrorMsg())?msgService.getMessage("standardCodeCategoryIdNull") : codeDto.getErrorMsg()+";"+msgService.getMessage("standardCodeCategoryIdNull"));
//                dto.getErrorDto().add(codeDto);
//                iterator.remove();
//                continue;
            }
            if (code.getCode().contains("+")) {
                codeDto.setErrorMsg(StringUtils.isBlank(codeDto.getErrorMsg())?msgService.getMessage("invalidChar"):codeDto.getErrorMsg()+";"+msgService.getMessage("invalidChar"));
//                dto.getErrorDto().add(codeDto);
//                iterator.remove();
//                continue;
            }
            //所有错误都添加进错误列表，检查后一起返回，
            if(StringUtils.isNotBlank(codeDto.getErrorMsg())){
                dto.getErrorDto().add(codeDto);
                iterator.remove();
                continue;
            }

            if(codeDto.getValues() != null) {
                Set<String> codeValues = new HashSet<>();
                for (StandardCodeValueDto value : codeDto.getValues()) {
                    if (Strings.isNullOrEmpty(value.getName())) {
                        value.setErrorMsg(StringUtils.isBlank(value.getErrorMsg())?msgService
                                .getMessage("standardCodeChNameNull", code.getName(), value.toString()) : value.getErrorMsg()+";"+msgService.getMessage("standardCodeChNameNull", code.getName(), value.toString()));
//                        dto.getErrorDto().add(codeDto);
//                        iterator.remove();
//                        break;
                    }

                    if (value.getOrder() == null) {
                        value.setErrorMsg(StringUtils.isBlank(value.getErrorMsg())?msgService.getMessage("standardCodeSeqNull", code.getName(), value.getName()): value.getErrorMsg()+";"+msgService.getMessage("standardCodeSeqNull", code.getName(), value.getName()));
//                        dto.getErrorDto().add(codeDto);
//                        iterator.remove();
//                        break;
                    }

                    if (Strings.isNullOrEmpty(value.getValue())) {
                        value.setErrorMsg(StringUtils.isBlank(value.getErrorMsg())?msgService
                                .getMessage("standardCodeNumberNull", code.getName(), value.toString()): value.getErrorMsg()+";"+msgService.getMessage("standardCodeNumberNull", code.getName(), value.toString()));
//                        dto.getErrorDto().add(codeDto);
//                        iterator.remove();
//                        break;
                    }

                    if (codeValues.contains(value.getValue())) {
                        value.setErrorMsg(StringUtils.isBlank(value.getErrorMsg())?msgService
                                .getMessage("standardCodeNumberExists", code.getName(), value.getName()): value.getErrorMsg()+";"+msgService.getMessage("standardCodeNumberExists", code.getName(), value.getName()));
//                        dto.getErrorDto().add(codeDto);
//                        iterator.remove();
//                        break;
                    }
                    if (StringUtils.isNotBlank(value.getErrorMsg())) {
                        dto.getErrorDto().add(codeDto);
                        iterator.remove();
                        break;
                    }

                    codeValues.add(value.getValue());
                }
            }

            StandardCodeFolderRela codeFolderRela = null;
            if(codeDto instanceof StandardCodeFolderDto) {
                codeFolderRela = ((StandardCodeFolderDto) codeDto).toStandardCodeFolderRela();
            }
            importStandardCodeMap.put(code.getCode(), new Object[] {code, codeFolderRela});
        }

        for (StandardCodeDto o : dto.getErrorDto()) {
            importStandardCodeMap.remove(o.getCode());
        }

        if (published) {
           res =  addImportStandardPublish(importStandardCodeMap, currentUser, dto, ignoreError);
        } else {
           res =  addImportStandardNotPublish(importStandardCodeMap, dto, ignoreError);
        }
        return res;
    }

    public StandardParaDto addImportStandardPublish(Map<String, Object[]> importStandardCodeMap, String username, StandardParaDto dto, boolean ignoreError) {
        List<StandardCode> oldAllStandardCodes = standardCodeRepo.findAllCode();
        Map<String, StandardCode> allOldStandardCodeMap = new HashMap<>();
        Map<String, StandardCodeDto> allDto = dto.getAllDto().stream().collect(Collectors.toMap(StandardCodeDto::getCode, o -> o, (a, b) -> b));

        for (StandardCode code : oldAllStandardCodes) {
            if (importStandardCodeMap.containsKey(code.getCode())) {
                if (code.getState().equals(DomainState.C)
                        || (code.getState().equals(DomainState.A) && code.getUpdatingCode() != null)) {

                    importStandardCodeMap.remove(code.getCode());
                    if (allDto.containsKey(code.getCode())) {
                        allDto.get(code.getCode()).setErrorMsg(msgService.getMessage("codeIsInAuditingState", code.getCode()));
                        dto.getErrorDto().add(allDto.get(code.getCode()));
                        dto.getInsertDto().remove(allDto.get(code.getCode()));
                    }
                    continue;
                }
            }
            if (code.getUpdatingCode() == null) {
                allOldStandardCodeMap.put(code.getCode(), code);
            }
        }

        List<Object[]> toBeSaved = new ArrayList<>();
        for (Object[] objects : importStandardCodeMap.values()) {
            StandardCode code = (StandardCode) objects[0];
            StandardCode oldStandardCode = allOldStandardCodeMap.get(code.getCode());
            //1. 如果导入的code在数据库中不存在，那么则直接保存为已发布
            if (oldStandardCode == null) {
                code.setState(DomainState.A);
                code.setVersion(1);
                code.setFirstPublish(new Date());
                if (ignoreError || dto.getErrorDto().isEmpty()) {
                    createStandardVersion(code, username, msgService.getMessage("importCodeIsPublished"));
                }
                toBeSaved.add(objects);
            }
            //2. 如果导入的code在数据库中存在，状态为已发布，则直接替换
            else if (DomainState.A.equals(oldStandardCode.getState())) {
                code.setState(DomainState.A);
                code.setVersion(oldStandardCode.getVersion() + 1);
                code.setCreateTime(oldStandardCode.getCreateTime());
                code.setFirstPublish(oldStandardCode.getFirstPublish());
                if (ignoreError || dto.getErrorDto().isEmpty()) {
                    createStandardVersion(code, username, msgService.getMessage("importCodeIsPublished"));
                }
                toBeSaved.add(objects);
            }
            //3. 如果导入的code在数据库中存在，状态为待审核（updatingDomainId不能有值），则直接替换成已发布
            else if (DomainState.D.equals(oldStandardCode.getState()) && oldStandardCode.getUpdatingCode() == null) {
                code.setState(DomainState.A);
                code.setVersion(1);
                code.setCreateTime(oldStandardCode.getCreateTime());
                code.setFirstPublish(new Date());
                if (ignoreError || dto.getErrorDto().isEmpty()) {
                    createStandardVersion(code, username, msgService.getMessage("importCodeIsPublished"));
                }
                toBeSaved.add(objects);
            }
            //4. 其他状态，比如已废弃，则不进行更改
        }

        if (ignoreError || dto.getErrorDto().isEmpty()) {
            List<StandardCode> codes = toBeSaved.stream().map(o -> (StandardCode) o[0]).toList();
            List<StandardCodeFolderRela> codeFolderRelas = toBeSaved.stream().map(o -> (StandardCodeFolderRela) o[1]).toList();
            standardCodeRepo.saveAll(codes);
            if(!CollectionUtils.isEmpty(codeFolderRelas)) {
                standardCodeFolderRelaRepo.saveAll(codeFolderRelas);
            }

            //同步到数据资产
            try {
                sendStandardUpdateEvent(codes);
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        }

        return dto;
    }

    protected void sendStandardUpdateEvent(List<StandardCode> toBeSaved) {
        if (CollectionUtils.isEmpty(toBeSaved)) {
            return;
        }

        logger.info("send kafka standard sync event...");

        Long categoryId = toBeSaved.get(0).getCategoryId();

        List<StandardCodeDto> codeDtoList = toBeSaved.stream()
                .map(this::convertToStandCodeDto)
                .collect(Collectors.toList());

        int sendNumber = 0;
        for (List<StandardCodeDto> partition : Lists.partition(codeDtoList, kafkaSyncBatchSize)) {
            KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
            UpdateStandardCodeMessage message = new UpdateStandardCodeMessage(
                    partition,
                    new ArrayList<>(),
                    StandardCodeType.getTypeByCategoryId(categoryId));
            message.setMsgId(System.currentTimeMillis());
            message.setSendTime(new Date());
            kafkaPublishService.sendMessage(updateStandardTopic, message);

            sendNumber += partition.size();
            logger.info("send [{}/{}] size standard change to kafka... ", sendNumber, codeDtoList.size());
        }
    }

    public StandardParaDto addImportStandardNotPublish(Map<String, Object[]> importStandardCodeMap, StandardParaDto dto, boolean ignoreError) {
        List<StandardCode> oldAllStandardCodes = standardCodeRepo.findAllCode();

        Map<String, StandardCode> dbCodeMap = oldAllStandardCodes
                .stream()
                .collect(Collectors.toMap(StandardCode::getCode, s -> s));
        Set<String> updateingCodes = new HashSet<>();
        Map<String, StandardCodeDto> allDto = dto.getAllDto().stream().collect(Collectors.toMap(StandardCodeDto::getCode, o -> o, (a, b) -> b));


        for (StandardCode code : oldAllStandardCodes) {
            if (importStandardCodeMap.containsKey(code.getCode())) {
                if (code.getState().equals(DomainState.C)) {
                    importStandardCodeMap.remove(code.getCode());
                    if (allDto.containsKey(code.getCode())) {
                        allDto.get(code.getCode()).setErrorMsg(StringUtils.isBlank(allDto.get(code.getCode()).getErrorMsg())?msgService.getMessage("codeIsInAuditingState", code.getCode()):allDto.get(code.getCode()).getErrorMsg()+";"+msgService.getMessage("codeIsInAuditingState", code.getCode()));
                        dto.getErrorDto().add(allDto.get(code.getCode()));
                        dto.getInsertDto().remove(allDto.get(code.getCode()));
                    }
                    continue;

                }
                if (code.getState().equals(DomainState.A) && code.getUpdatingCode() != null) {
                    StandardCode updateCode = dbCodeMap.get(code.getUpdatingCode());
                    if (updateCode != null && DomainState.C.equals(updateCode.getState())) {
                        importStandardCodeMap.remove(code.getCode());
                        if (allDto.containsKey(code.getCode())) {
                            allDto.get(code.getCode()).setErrorMsg(StringUtils.isBlank(allDto.get(code.getCode()).getErrorMsg())?msgService.getMessage("codeIsInAuditingState", code.getCode()):allDto.get(code.getCode()).getErrorMsg()+";"+msgService.getMessage("codeIsInAuditingState", code.getCode()));
                            dto.getErrorDto().add(allDto.get(code.getCode()));
                            dto.getInsertDto().remove(allDto.get(code.getCode()));
                        }
                        continue;
                    }
                    updateingCodes.add(updateCode.getCode());
                }
            }
        }

        for (StandardCode code : oldAllStandardCodes) {
            if (!importStandardCodeMap.containsKey(code.getCode())
                    || code.getState().equals(DomainState.X)
                    || updateingCodes.contains(code.getCode())) {
                continue;
            }

            StandardCode newStandardCode = (StandardCode) importStandardCodeMap.get(code.getCode())[0];
            newStandardCode.setSubmitter(code.getSubmitter());
            newStandardCode.setFirstPublish(code.getFirstPublish());

            if (code.getState().equals(DomainState.A) && StringUtils.isEmpty(code.getUpdatingCode())) {
                // 第一种情况，标准代码是已发布的，但是没有开发中的复制副本，则复制一个开发中的副本
                newStandardCode.setCode(getUUID());
                newStandardCode.setCopyCode(true);
                code.setUpdatingCode(newStandardCode.getCode());
            } else if (code.getState().equals(DomainState.A) && !StringUtils.isEmpty(code.getUpdatingCode())) {
                // 第二种情况，标准代码是已发布的，并且有一个开发中的复制副本，则更新开发中的副本
                newStandardCode.setCode(code.getUpdatingCode());
            }
            //剩下的情况直接覆盖
        }

        if (ignoreError || dto.getErrorDto().isEmpty()) {
            List<StandardCode> codes = importStandardCodeMap.values().stream()
                    .map(v -> (StandardCode) v[0]).toList();
            List<StandardCodeFolderRela> codeFolderRelas = importStandardCodeMap.values().stream()
                    .map(v -> (StandardCodeFolderRela) v[1]).filter(v -> v != null).toList();
            standardCodeRepo.saveAll(codes);
            if(!CollectionUtils.isEmpty(codeFolderRelas)) {
                standardCodeFolderRelaRepo.saveAll(codeFolderRelas);
            }
        }

        return dto;
    }

    @Override
    public List<StandardCodeDto> getAllOldCodeVersions(String codeNumber, Long categoryId) {
        StandardCode code = standardCodeRepo.findByCodeEquals(codeNumber);
        if (code == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeNotFound", codeNumber));
        }

        if (ObjectUtils.notEqual(code.getCategoryId(), categoryId)) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeCategoryWrong"));
        }

        return this.convertToListStandardCodeDtoFromVersions(
                standardCodeVerRepo.findAllByCodeEqualsOrderByVersionDesc(codeNumber));
    }

    @Override
    public PageResult<EditHistory> getCodeHistory(String codeNumber, Long categoryId, int pageSize,
                                                  int currentPage) {
        StandardCode code = standardCodeRepo.findByCodeEquals(codeNumber);
        if (code == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeNotFound", codeNumber));
        }

        if (ObjectUtils.notEqual(code.getCategoryId(), categoryId)) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeCategoryWrong"));
        }

        return convertToEditHistoryPageResult(
                editHistoryRepo.findByHistoryTypeEqualsAndItemIdEqualsOrderByTimestampDesc(
                        EditHistoryEntity.TYPE_STD_CODE, codeNumber,
                        PageRequest.of(currentPage - 1, pageSize)));
    }

    @Override
    public DomainTreeNodeDto loadDomainTree(DomainState domainState, Long categoryId,
                                            String currentUser) {
        return loadDomainTree(domainState, categoryId, currentUser, false);
    }

    @Override
    public PageResult<EditHistory> getDomainHistory(String domainId, int pageSize,
                                                    int currentPage) {
        return convertToEditHistoryPageResult(editHistoryRepo
                .findByHistoryTypeEqualsAndItemIdEqualsOrderByTimestampDesc(
                        EditHistoryEntity.TYPE_DOMAIN,
                        domainId, PageRequest.of(currentPage - 1, pageSize)));
    }

    @Override
    public Set<String> getDistinctDomainFolderCatalogs() {
        return domainFolderRepo.findAllDistinctCatalogs();
    }

    @Override
    public DomainFolderDto createFolder(DomainFolderDto folderDto) {
        if (folderDto.getParentId() == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("createFolderParentIdRequired"));
        }

        if (Strings.isNullOrEmpty(folderDto.getName())) {
            throw new InvalidArgumentException(msgService.getMessage("createFolderNameRequired"));
        }

        DomainTreeNodeDto root = getRoot();

        DomainTreeNodeDto parent = findNode(folderDto.getParentId(), root);
        if (parent == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFoundFolderById", folderDto.getParentId()));
        }
        List<DomainTreeNodeDto> nodes = parent.getNodes();
        if (nodes != null) {
            for (DomainTreeNodeDto node : nodes) {
                if (node.getName().equals(folderDto.getName())) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("folderNameExists", folderDto.getName()));
                }
            }
        }

        boolean topLevelFolder = false;
        if (ObjectUtils.equals(parent.getFoldId(), 0L)) {
            //当是顶级目录的时候，我们需要限制权限
            topLevelFolder = true;
            for (DomainTreeNodeDto categoryNode : root.getNodes()) {
                if (categoryNode.getName().equals(folderDto.getName())) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("createFolderNameExists"));
                }
            }
        }

        DomainFolder folder = new DomainFolder();
        folder.setName(folderDto.getName());
        folder.setDescription(folderDto.getDescription());
        folder.setParentId(folderDto.getParentId());
        folder.setOrder(folderDto.getOrder());
        if (topLevelFolder) {
            folder.setType(CategoryType.DOMAIN);
            folder.setCatalog(folderDto.getCatalog());
        } else {
            folder.setType(parent.getType());
        }
        folder = domainFolderRepo.save(folder);
        //保存目录路径
        Optional<DomainFolder> parentFolderOption = domainFolderRepo.findById(folder.getParentId());
        if (parentFolderOption.isPresent()) {
            folder.setPath(parentFolderOption.get().getPath() + "/" + folder.getId() + "/");
        } else {
            folder.setPath("/" + folder.getId() + "/");
        }
        domainFolderRepo.save(folder);

        DomainTreeNodeDto newNode = new DomainTreeNodeDto();
        newNode.setParentId(folder.getParentId());
        newNode.setName(folder.getName());
        newNode.setFoldId(folder.getId());
        newNode.setType(folder.getType());
        newNode.setOrder(folder.getOrder());


        if (topLevelFolder) {
            newNode.setCategoryId(newNode.getFoldId());
        } else {
            newNode.setCategoryId(parent.getCategoryId());
        }

        parent.addSubNode(newNode);
        domainTreeRoot.set(getRoot(true), REDIS_FOLDER_ROOT_LIVE_TIME, TimeUnit.SECONDS);
        return convertToDomainFolderDto(folder);
    }

    @Override
    public DomainFolderDto updateFolder(DomainFolderDto folder) {
        if (folder.getId() == null) {
            throw new InvalidArgumentException(msgService.getMessage("updateFolderIdRequired"));
        }

        if (Strings.isNullOrEmpty(folder.getName())) {
            throw new InvalidArgumentException(msgService.getMessage("createFolderNameRequired"));
        }
        if (Strings.isNullOrEmpty(folder.getName())) {
            throw new InvalidArgumentException(msgService.getMessage("folderNameEmpty"));
        }

        DomainTreeNodeDto root = getRoot();

        DomainTreeNodeDto parent = findNode(folder.getParentId(), root);
        if (parent == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFoundFolderById", folder.getParentId()));
        }
        List<DomainTreeNodeDto> nodes = parent.getNodes();
        if (nodes != null) {
            for (DomainTreeNodeDto node : nodes) {
                if (node.getName().equals(folder.getName()) && !node.getFoldId().equals(folder.getId())) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("folderNameExists", folder.getName()));
                }
            }
        }

        DomainTreeNodeDto target = findNode(folder.getId(), root);
        if (target == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFoundFolderById", folder.getId()));
        }
        if (target.getParentId() == 0L) {
            for (DomainTreeNodeDto categoryNode : root.getNodes()) {
                if (!categoryNode.getFoldId().equals(target.getFoldId())
                        && categoryNode.getName().equals(folder.getName())) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("createFolderNameExists"));
                }
            }
        }

        Optional<DomainFolder> folderOp = domainFolderRepo.findById(folder.getId());
        if (!folderOp.isPresent()) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFoundFolderById", folder.getId()));
        } else {
            DomainFolder dbFolder = folderOp.get();

            dbFolder.setName(folder.getName());
            dbFolder.setDescription(folder.getDescription());
            dbFolder.setCatalog(folder.getCatalog());
            dbFolder.setOrder(folder.getOrder());

            dbFolder = domainFolderRepo.save(dbFolder);
            target.setName(folder.getName());
            target.setDescription(folder.getDescription());
            target.setOrder(folder.getOrder());

            domainTreeRoot.set(root, REDIS_FOLDER_ROOT_LIVE_TIME, TimeUnit.SECONDS);
            return convertToDomainFolderDto(dbFolder);
        }
    }

    @Override
    @Transactional
    public void deleteFolder(DomainFolderResDto folderResDto) {
        Long folderId = folderResDto.getFolderId();
        if (folderId == null
                || ObjectUtils.equals(folderId, 0L)) {
            return;
        }

        Optional<DomainFolder> folderOp = domainFolderRepo.findById(folderId);
        if (folderOp.isPresent()) {
            DomainFolder folder = folderOp.get();
            if (Boolean.FALSE.equals(folder.getDeletable())) {
                throw new InvalidArgumentException(msgService.getMessage("unableToDeleteFolder"));
            }

        } else {
            getRoot(true);
            return;
        }

        DomainTreeNodeDto root = getRoot();
        DomainTreeNodeDto targetNode = findNode(folderId, root);

        List<Long> folderIds = new ArrayList<>();
        //get all subfolder ids
        findAllSubFolders(folderIds, targetNode);

        Integer count = 0;

        for (List<Long> partition : Lists.partition(folderIds, 999)) {
            count += domainRepo.countByFolderIdIn(partition);
        }
        //领域数据标准根目录
        if (targetNode.getParentId() == 0L && targetNode.getFoldId() > 3) {
            count += standardCodeRepo.countByCategoryId(targetNode.getFoldId());
        }

        if (count != 0) {
            if (targetNode.getParentId() == 0L && targetNode.getFoldId() > 3) {
                throw new IllegalOperationException(
                        msgService.getMessage("cannotDelByDomainFieldFolder"));
            } else {
                throw new IllegalOperationException(
                        msgService.getMessage("cannotDelByDomainUnderFolder"));
            }
        }

        for (List<Long> partition : Lists.partition(folderIds, 999)) {
            domainFolderRepo.deleteByIdIn(partition);
        }
        logger.info(folderResDto.getUsername() + " deleted the folder " + targetNode.getName());
        //refresh cache
        getRoot(true);
    }

    @Override
    public DomainTreeNodeDto getDomainTreeNode(Long folderId) {
        DomainTreeNodeDto root = getRoot();
        DomainTreeNodeDto targetNode = findNode(folderId, root);
        return targetNode;
    }

    @Override
    public Boolean checkDomainCodeConflicts(String domainCode) {
        if (Strings.isNullOrEmpty(domainCode)) {
            return false;
        }
        domainCode = domainCode.trim();

        Set<String> existCodes = domainCodeCache.getUnchecked(DOMAIN_CODE_KEY);
        return existCodes.contains(domainCode.toLowerCase());
    }

    @Override
    public Boolean checkBusinessNameConflicts(Long categoryId, String businessName) {
        if (Strings.isNullOrEmpty(businessName)) {
            return false;
        }

        businessName = businessName.trim();

        Set<String> names = businessNameCache.getUnchecked(categoryId);
        if (CollectionUtils.isEmpty(names)) {
            return false;
        }

        return names.contains(businessName.toLowerCase());
    }

    @Override
    public List<DomainDto> getListDomainsAndConvertSomePropertiesIdToName(DomainQueryDto queryDto) {
        return convertDomainSomePropertiesIdToName(getListDomains(queryDto));
    }

    @Override
    public Map<Long, List<String>> buildDomainFullPath(Collection<Long> folderIds) {
        DomainTreeNodeDto root = getRoot();
        Map<Long, DomainTreeNodeDto> nodeMap = flattenDomainTree(root);
        Map<Long, List<String>> folderPathMap = new HashMap<>();
        for (Long folderId : folderIds) {
            if (nodeMap.containsKey(folderId)) {
                List<String> path = new ArrayList<>();
                DomainTreeNodeDto currentNode = nodeMap.get(folderId);

                while (ObjectUtils.notEqual(currentNode.getFoldId(), 0L)) {
                    path.add(currentNode.getName());
                    currentNode = nodeMap.get(currentNode.getParentId());
                }

                path = Lists.reverse(path);
                folderPathMap.put(folderId, new ArrayList<>(path));
            }
        }

        return folderPathMap;
    }

    @Override
    public DomainDto updateDomainState(DomainDto toBeUpdate, String message, String currentUser) {
        String domainId = toBeUpdate.getDomainId();
        DomainState newState = toBeUpdate.getState();

        Domain saved = domainRepo.findByDomainIdEquals(domainId);
        if (saved == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFindDomainById", domainId));
        }
        if (!newState.equals(DomainState.C)) {
            if (saved.getState().equals(DomainState.A) && toBeUpdate.getState().equals(DomainState.A)) {
                // 变更被驳回状态
            } else {
                saved.setLastReview(toBeUpdate.getLastReview());
            }
            saved.setUpdatingDomainId(null);
        }
        if (!StringUtils.isEmpty(message)) {
            saveDomainStateChangeHistory(domainId, newState, message, currentUser);
        }
        saved.setState(newState);
        return convertToDomainDto(domainRepo.save(saved));
    }

    @Override
    public StandardCodeDto updateStandardState(StandardCodeDto standardCodeDto, String message,
                                               String currentUser) {
        String realCode = standardCodeDto.getRealCode();
        DomainState newState = standardCodeDto.getState();

        Optional<StandardCode> optional = standardCodeRepo.findById(realCode);
        if (!optional.isPresent()) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeNotFoundByCode", realCode));
        }
        StandardCode saved = optional.get();
        saved.setState(newState);
        if (!newState.equals(DomainState.C)) {
            saved.setUpdatingCode(null);
        }
        return convertToStandCodeDto(standardCodeRepo.save(saved));
    }

    @Override
    public void updateDomainUpdatingId(DomainDto domainDto, String currentUser) {
        String domainId = domainDto.getDomainId();

        Domain saved = domainRepo.findByDomainIdEquals(domainId);
        if (saved == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("cannotFindDomainById", domainId));
        }

        saved.setUpdatingDomainId(domainDto.getUpdatingDomainId());
        domainRepo.save(saved);
    }

    @Override
    public void updateStandardUpdatingCode(StandardCodeDto standardCodeDto, String currentUser) {
        String code = standardCodeDto.getCode();

        Optional<StandardCode> optional = standardCodeRepo.findById(code);
        if (!optional.isPresent()) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeNotFoundByCode", code));
        }
        StandardCode saved = optional.get();
        saved.setUpdatingCode(standardCodeDto.getUpdatingCode());
        standardCodeRepo.save(saved);
    }

    @Override
    public void generateCopyDomain(String domainId, DomainDto toBeUpdate, StandardCodeDto newDto) {
        Domain copyDomain = null;
        DomainExt copyDomainExt = null;
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus status = txManager.getTransaction(def);
        try {
            if(toBeUpdate instanceof DomainExtDto) {
                copyDomainExt = ((DomainExtDto) toBeUpdate).buildDomainExt();
                DomainExt oldDomainExt = domainExtRepo.findByDIdEquals(domainId);
                copyDomainExt.setCheckState(oldDomainExt.getCheckState());
            }
            Domain publicOldDomain = domainRepo.findByDomainIdEquals(domainId);
            //copy的主键
            toBeUpdate.setDomainId(getUUID());
            copyDomain = convertToDomain(toBeUpdate);
            copyDomain.setCopyDomain(true);
            //设置updatingDomainId
            publicOldDomain.setUpdatingDomainId(copyDomain.getDomainId());
            //设置状态
            copyDomain.setState(DomainState.C);
            //保存两个domain
            // 保存同义词节点到neo4j
            saveSynonymForGraph(Lists.newArrayList(copyDomain));
            domainRepo.save(publicOldDomain);
            Domain saved = domainRepo.save(copyDomain);

            // 扩展信息
            if(copyDomainExt != null) {
                copyDomainExt.setdId(saved.getDomainId());
                domainExtRepo.save(copyDomainExt);
            }

            //进行批次生成 // 这里需要增加
            if (publicOldDomain.getState().equals(DomainState.A)) {
                //String currentUsername = AuthTools.currentUsername();
                BatchApplyDto batchApplyDto = generateUpdateApplyDto(publicOldDomain, toBeUpdate,newDto);
                applyService.create(batchApplyDto);
            }

            txManager.commit(status);
            // 保存关联指标节点到neo4j
            domainGraphHelperSave(Lists.newArrayList(saved));
            // 保存指标修饰词
            List<Long> modifierRefIds = new ArrayList<>();
            if (!CollectionUtils.isEmpty(toBeUpdate.getModifierRefIds())) {
                modifierRefIds.addAll(toBeUpdate.getModifierRefIds());
            }
            if (!CollectionUtils.isEmpty(toBeUpdate.getTimeModifierRefIds())) {
                modifierRefIds.addAll(toBeUpdate.getTimeModifierRefIds());
            }
            modifierTypeService.saveModifierRef(modifierRefIds, saved.getDomainId());
        } catch (TransactionException e) {
            txManager.rollback(status);
            throw new AndorjRuntimeException(e.getMessage(), e);
        }

        //将新增udp 更新到es 动态字段属性
        if (copyDomain != null && (copyDomain.getCategoryId() == 1L || copyDomain.getCategoryId() > 6L)) {
            if (domainDataSynchronizer.checkDDCEnable()) {
                domainDataSynchronizer.insertSyncDomainUdpToEsImmediately(
                        copyDomain,
                        getDDCIndexName(LDMTypes.oDataStandard));
            }
        }

    }




    @Override
    public void updateDomainStateBatch(List<DomainDto> toBeUpdate, String message, String currentUser, String type, Integer state, List<BatchApplyDetail> details,BatchApply batchApplyInfo) {
        // 发布    2为通过
        Map<String,String > domainMapData = new HashMap<>();
        if ("发布".equals(type) &&  2 == state){
            // 如果是发布 那么直接修改状态即可
            List<String> refCode = new ArrayList<>();
            List<String> collect = details.stream().map(BatchApplyDetail::getNeId).collect(Collectors.toList());
            List<Domain> allByDomainIdIn = domainRepo.findAllByDomainIdIn(collect);
            allByDomainIdIn.forEach(o -> {
                this.publicDomain(o.getDomainId(), currentUser);
//                o.setState(DomainState.A);
//                o.setFirstPublish(new Date());
                domainMapData.put(o.getDomainId(),o.getEnglishName());
                if (!org.springframework.util.ObjectUtils.isEmpty(o.getRefDomainCode())){
                    refCode.add(o.getRefDomainCode());
                }
            });

//            domainRepo.saveAll(allByDomainIdIn);
            // 将关联的标准同步为发布
            if (!CollectionUtils.isEmpty(refCode)){
                List<StandardCode> byCodeIn = standardCodeRepo.findByCodeIn(refCode);
                byCodeIn.forEach(o->{
                    o.setState(DomainState.A);
                    o.setFirstPublish(new Date());
                });
                standardCodeRepo.saveAll(byCodeIn);
            }

            // 远程调用 获取标准需要通知的人
            Map<String, List<String>> usernameByDomainIds = remoteDataAssetExtendService.getUsernameByDomainIds(collect);
            if (!CollectionUtils.isEmpty(usernameByDomainIds))  {
                usernameByDomainIds.forEach((k,v)->{
                    if (domainMapData.containsKey(k)) {
                        sendToWeact(domainMapData.get(k), "发布通过", batchApplyInfo.getApplyCreateTime(), batchApplyInfo.getApplyCreator(), "", currentUser,usernameByDomainIds.get(k));
                    }
                });

            }
        }else if ("发布".equals(type) && 3 == state){
            //  发布类型 但是未通过 直接修改为带发布状态
            List<String> refCode = new ArrayList<>();
            List<String> collect = details.stream().map(BatchApplyDetail::getNeId).collect(Collectors.toList());
            List<Domain> allByDomainIdIn = domainRepo.findAllByDomainIdIn(collect);
            allByDomainIdIn.forEach(o -> {
                o.setState(DomainState.D);
                domainMapData.put(o.getDomainId(),o.getEnglishName());
                if (!org.springframework.util.ObjectUtils.isEmpty(o.getRefDomainCode())){
                    refCode.add(o.getRefDomainCode());
                }
            });
            if (!CollectionUtils.isEmpty(refCode)){
                List<StandardCode> byCodeIn = standardCodeRepo.findByCodeIn(refCode);
                byCodeIn.forEach(o->{
                    o.setState(DomainState.D);
                    o.setFirstPublish(new Date());
                });
                standardCodeRepo.saveAll(byCodeIn);
            }

            domainRepo.saveAll(allByDomainIdIn);
            // 远程调用 获取标准需要通知的人
            Map<String, List<String>> usernameByDomainIds = remoteDataAssetExtendService.getUsernameByDomainIds(collect);
            if (!CollectionUtils.isEmpty(usernameByDomainIds))  {
                usernameByDomainIds.forEach((k,v)->{
                    if (domainMapData.containsKey(k)) {
                        sendToWeact(domainMapData.get(k),"发布驳回",batchApplyInfo.getApplyCreateTime(),batchApplyInfo.getApplyCreator(),"",currentUser,usernameByDomainIds.get(k));
                    }
                });
            }

        }else if ("变更".equals(type) && 2 == state){
            Map<String, String> domainMap = toBeUpdate.stream().collect(Collectors.toMap(DomainDto::getDomainId, DomainDto::getUpdatingDomainId));
            List<String> domainIds = new ArrayList<>();
            domainIds.addAll(domainMap.keySet());
            Map<String, List<String>> usernameByDomainIds = remoteDataAssetExtendService.getUsernameByDomainIds(domainIds);
            domainIds.addAll(domainMap.values());
            List<Domain> allByDomainIdIn = domainRepo.findAllByDomainIdIn(domainIds);
            Map<String, Domain> domainDataMap = allByDomainIdIn.stream().collect(Collectors.toMap(Domain::getDomainId, Function.identity()));
            toBeUpdate.forEach(o-> {
                self.deleteCopyDomain(o.getDomainId(),true,currentUser);
                domainMapData.put(o.getDomainId(),o.getEnglishName());
            });
            List<StandardCode> needUpdate = new ArrayList<>();
            // 判断是否有需要更新的标准代码
            details.forEach(e->{
                if (!org.springframework.util.ObjectUtils.isEmpty(e.getNeData())){
                    String neData = e.getNeData();
                    //反序列化
                    StandardCodeDto object = JsonUtils.toObject(neData, StandardCodeDto.class);
                    object.setState(DomainState.A);
                    StandardCode standardCode = convertToStandardCode(object);
                    needUpdate.add(standardCode);
                }
            });
            if (!CollectionUtils.isEmpty(needUpdate)){
                standardCodeRepo.saveAll(needUpdate);
            }
            // 远程调用 获取标准需要通知的人
            if (!CollectionUtils.isEmpty(usernameByDomainIds))  {
                usernameByDomainIds.forEach((k,v)->{
                    if (domainMapData.containsKey(k)) {
                        sendToWeact(domainMapData.get(k),"变更通过",batchApplyInfo.getApplyCreateTime(),batchApplyInfo.getApplyCreator(),"",currentUser,usernameByDomainIds.get(k));
                    }
                });
            }

        }else  if ("变更".equals(type) && 3 ==state){
            List<String> domainIds  = new ArrayList<>();
            toBeUpdate.forEach(o->{
                DomainDto domain = self.getDomainByDomainId(o.getDomainId());
                self.deleteCopyDomain(o.getDomainId(),false,currentUser);
                domainMapData.put(o.getDomainId(),o.getEnglishName());
                domainIds.add(o.getDomainId());
                // 处理参考数据
//                if (!org.springframework.util.ObjectUtils.isEmpty(domain.getReferenceCode())) {
//                    handleProcessResult(domain.getReferenceCode(), state, currentUser, domain.getState().toString());
//                }
            });
            Map<String, List<String>> usernameByDomainIds = remoteDataAssetExtendService.getUsernameByDomainIds(domainIds);
            if (!CollectionUtils.isEmpty(usernameByDomainIds))  {
                usernameByDomainIds.forEach((k,v)->{
                    if (domainMapData.containsKey(k)) {
                        sendToWeact(domainMapData.get(k),"变更驳回",batchApplyInfo.getApplyCreateTime(),batchApplyInfo.getApplyCreator(),"",currentUser,usernameByDomainIds.get(k));
                    }
                });
            }
            // 这里应该不需要做什么

        }else if ("废弃".equals(type) && 2 == state){
            // 废弃通过 那么直接修改状态即可
            List<String> refCode = new ArrayList<>();
            List<String> domainIds = new ArrayList<>();
            toBeUpdate.forEach(o->{
                DomainDto byDomainIdEquals = self.getDomainByDomainId(o.getDomainId());
                domainIds.add(o.getDomainId());
                domainMapData.put(o.getDomainId(),o.getEnglishName());
                self.deleteCopyDomain(o.getDomainId(), false, currentUser);
                byDomainIdEquals.setLastReview(new Date());
                byDomainIdEquals.setState(DomainState.X);
                if (!org.springframework.util.ObjectUtils.isEmpty(o.getRefDomainCode())){
                    refCode.add(o.getRefDomainCode());
                }
                self.updateDomainState(byDomainIdEquals, "标准数据元废弃", currentUser);
            });
            Map<String, List<String>> usernameByDomainIds = remoteDataAssetExtendService.getUsernameByDomainIds(domainIds);
            if (!CollectionUtils.isEmpty(usernameByDomainIds))  {
                usernameByDomainIds.forEach((k,v)->{
                    if (domainMapData.containsKey(k)) {
                        sendToWeact(domainMapData.get(k),"废弃通过",batchApplyInfo.getApplyCreateTime(),batchApplyInfo.getApplyCreator(),"",currentUser,usernameByDomainIds.get(k));
                    }

                });
            }

            if (!CollectionUtils.isEmpty(refCode)){
                List<StandardCode> byCodeIn = standardCodeRepo.findByCodeIn(refCode);
                byCodeIn.forEach(o->{
                    o.setState(DomainState.X);
                });
                standardCodeRepo.saveAll(byCodeIn);
            }


        }else if ("废弃".equals(type) && 3 == state){
            List<String> domainIds = new ArrayList<>();
            List<String> refCode = new ArrayList<>();
            toBeUpdate.forEach(o->{
                DomainDto domain = self.getDomainByDomainId(o.getDomainId());
                domainIds.add(o.getDomainId());
                domainMapData.put(o.getDomainId(),o.getEnglishName());
                DomainDto byDomainIdEquals = self.getDomainByDomainId(o.getDomainId());
                self.deleteCopyDomain(o.getDomainId(), false, currentUser);
                byDomainIdEquals.setLastReview(new Date());
                byDomainIdEquals.setState(DomainState.A);
                if (!org.springframework.util.ObjectUtils.isEmpty(o.getRefDomainCode())){
                    refCode.add(o.getRefDomainCode());
                }
                self.updateDomainState(byDomainIdEquals, (String)null, currentUser);
            });
            Map<String, List<String>> usernameByDomainIds = remoteDataAssetExtendService.getUsernameByDomainIds(domainIds);
            if (!CollectionUtils.isEmpty(usernameByDomainIds))  {
                usernameByDomainIds.forEach((k,v)->{
                    if (domainMapData.containsKey(k)) {
                        sendToWeact(domainMapData.get(k),"废弃驳回",batchApplyInfo.getApplyCreateTime(),batchApplyInfo.getApplyCreator(),"",currentUser,usernameByDomainIds.get(k));
                    }
                });
            }

            if (!CollectionUtils.isEmpty(refCode)){
                List<StandardCode> byCodeIn = standardCodeRepo.findByCodeIn(refCode);
                byCodeIn.forEach(o->{
                    o.setState(DomainState.A);
                });
                standardCodeRepo.saveAll(byCodeIn);
            }


        }
        logger.info("方法调用结束...");

    }

    private BatchApplyDto generateUpdateApplyDto(Domain publicOldDomain, DomainDto toBeUpdate, StandardCodeDto dto) {
        String batchName = toBeUpdate.getPath().get(1);
        BatchApplyDto batchApplyDto = new BatchApplyDto();
        batchApplyDto.setApplyName(batchName);
        String currentUsername = AuthTools.currentUsername();
        batchApplyDto.setApplyCreator(currentUsername);
        batchApplyDto.setApplyOperation("变更");
        batchApplyDto.setApplyType("标准数据元");
        batchApplyDto.setApplyCreateTime(new Date());
        List<BatchApplyDetailDto> dtos = new ArrayList<>();
        BatchApplyDetailDto batchApplyDetailDto = new BatchApplyDetailDto();
        batchApplyDetailDto.setCode(toBeUpdate.getDomainCode());
        batchApplyDetailDto.setApplyType("标准数据元");
        batchApplyDetailDto.setCnName(toBeUpdate.getChineseName());
        batchApplyDetailDto.setEnName(toBeUpdate.getEnglishName());
        batchApplyDetailDto.setNeId(toBeUpdate.getDomainId());
        batchApplyDetailDto.setOldId(publicOldDomain.getDomainId());
        batchApplyDetailDto.setSubmitUser(currentUsername);
        batchApplyDetailDto.setOrderType("变更");
        batchApplyDetailDto.setDomainCode(toBeUpdate.getReferenceCode());
        if (!org.springframework.util.ObjectUtils.isEmpty(toBeUpdate.getReferenceCode()) && !org.springframework.util.ObjectUtils.isEmpty(dto)){
            // 由于是变更这里可以不动
            StandardCodeSourceDto codeSource =getCodeSource(dto.getCode());
            if (codeSource != null) {
                if (dto.getJobId() == null) {
                    dto.setJobId(codeSource.getJobId());
                }

                if (!StringUtils.isEmpty(dto.getJobName())) {
                }

                if (StringUtils.isEmpty(dto.getJobName())) {
                    dto.setBusinessId(codeSource.getCategoryId());
                    dto.setBusinessName(codeSource.getCategoryName());
                    dto.setCode(codeSource.getCode());
                    dto.setModelId(codeSource.getModelId());
                    dto.setModelName(codeSource.getModelName());
                    dto.setSchema(codeSource.getSchema());
                    dto.setObjectId(codeSource.getObjectId());
                    dto.setObjectName(codeSource.getObjectName());
                    dto.setCodeFieldId(codeSource.getCodeFieldId());
                    dto.setCodeField(codeSource.getCodeField());
                    dto.setCodeChineseFieldId(codeSource.getCodeChineseFieldId());
                    dto.setCodeChineseField(codeSource.getCodeChineseField());
                    dto.setParentValueId(codeSource.getParentValueId());
                    dto.setParentValue(codeSource.getParentValue());
                    dto.setSql(codeSource.getSql());
                    dto.setJobId(codeSource.getJobId());
                    dto.setSchedule(codeSource.getSchedule());
                    dto.setConditionList(codeSource.getConditionList());
                    dto.setAuthDimensionId(codeSource.getAuthDimensionId());
                    dto.setAuthDimension(codeSource.getAuthDimension());
                    dto.setDbType(codeSource.getDbType());
                    dto.setDatasourceId(codeSource.getDatasourceId());
                    dto.setJobName(codeSource.getJobName());
                    dto.setSchedule(codeSource.getSchedule());
                    dto.setTypeName(codeSource.getTypeName());
                    dto.setColMap(codeSource.getColMap());
                }
            }
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                batchApplyDetailDto.setNeData(objectMapper.writeValueAsString(dto));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }


        dtos.add(batchApplyDetailDto);
        batchApplyDto.setDetails(dtos);

        return batchApplyDto;
    }

    @Override
    public void deleteCopyDomain(String domainId, boolean replace, String username) {
        Domain domain = null;
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus status = txManager.getTransaction(def);
        try {

            Domain oldDomain = domainRepo.findByDomainIdEquals(domainId);
            DomainExt oldDomainExt = domainExtRepo.findByDIdEquals(domainId);
            Domain graphOldDomain = cloneDomain(oldDomain, true);
            String updatingDomainId = oldDomain.getUpdatingDomainId();
            //把审核中的domain属性复制给已发布的
            if (replace && domainRepo.existsById(updatingDomainId)) {
                // 更新修饰词、时间周期
                modifierTypeService.deleteModifierRefs(domainId);
                modifierTypeService.updateModifierRef(updatingDomainId, domainId);
                oldDomain.setLastReview(new Date());
                replaceDomain(oldDomain, oldDomainExt, username);
                oldDomain.setLastModification(new Date());
            }
            //删除审核中的标准
            if (updatingDomainId != null && domainRepo.existsById(updatingDomainId)) {
                domainRepo.deleteById(updatingDomainId);
                domainExtRepo.deleteDomainExtByDIdEquals(updatingDomainId);
            }
            oldDomain.setUpdatingDomainId(null);
            oldDomain.setState(DomainState.A);
            // 保存同义词节点到neo4j
            saveSynonymForGraph(Lists.newArrayList(oldDomain));
            domain = domainRepo.save(oldDomain);
            if(oldDomainExt != null) {
                domainExtRepo.save(oldDomainExt);
            }
            // 保存关联指标节点到neo4j
            domainGraphHelperSave(Lists.newArrayList(oldDomain), Lists.newArrayList(graphOldDomain));
            // 发送邮件
            Map<String, EditHistory> historyMap = getDomainsLatestEditHistories(Lists.newArrayList(domainId));
            List<EditHistory> editHistories = Lists.newArrayList(historyMap.get(domainId));

            KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
            UpdateDataStandardMessage message = new UpdateDataStandardMessage(
                    Lists.newArrayList(convertToDomainDto(oldDomain)),
                    editHistories,
                    DataStandardType.getTypeByCategoryId(oldDomain.getCategoryId()));
            message.setMsgId(System.currentTimeMillis());
            message.setSendTime(new Date());
            kafkaPublishService.sendMessage(updateDomainTopic, message);

            txManager.commit(status);
        } catch (TransactionException e) {
            txManager.rollback(status);
            throw new AndorjRuntimeException(e.getMessage(), e);
        }

        //udp 更新到es 动态字段属性
        if (domain != null && (domain.getCategoryId() == 1L || domain.getCategoryId() > 6L)) {
            if (domainDataSynchronizer.checkDDCEnable()) {
                domainDataSynchronizer.insertSyncDomainUdpToEs(Arrays.asList(domain), getDDCIndexName(LDMTypes.oDataStandard));
            }
        }
    }

    @Override
    public DomainDto getCopyDomainByOriginalDomainId(String domainId) {
        String updatingDomainId = domainRepo.findUpdatingDomainIdByDomainId(domainId);
        if (Strings.isNullOrEmpty(updatingDomainId)) {
            throw new InvalidArgumentException(msgService.getMessage("thisDataHasNoCopy"));
        }
        return convertToDomainDto(domainRepo.findByDomainIdEquals(updatingDomainId));
    }

    @Override
    @Transactional
    public void generateCopyStandard(String code, StandardCodeDto toBeUpdate) {
        StandardCode publicOldStd = standardCodeRepo.findByCodeEquals(code);
        //copy的主键
        toBeUpdate.setCode(publicOldStd.getCode() + "+++");
        StandardCode copyStd = convertToStandardCode(toBeUpdate);
        copyStd.setCreateTime(new Date());
        copyStd.setFirstPublish(publicOldStd.getFirstPublish());
        copyStd.setCopyCode(true);
        //设置updatingDomainId
        publicOldStd.setUpdatingCode(copyStd.getCode());
        //设置状态
        copyStd.setState(DomainState.C);
        //保存两个domain
        standardCodeRepo.save(publicOldStd);
        standardCodeRepo.save(copyStd);
    }

    @Override
    @Transactional
    public void deleteCopyStandard(String code, boolean replace, String username) {
        StandardCode oldStd = standardCodeRepo.findByCodeEquals(code);
        String updatingCode = oldStd.getUpdatingCode();
        //把审核中的standard属性复制给已发布的
        if (replace && standardCodeRepo.existsById(updatingCode)) {
            replaceStandard(oldStd, username);
            oldStd.setLastModification(new Date());
        }
        //删除审核中的标准
        if (updatingCode != null && standardCodeRepo.existsById(updatingCode)) {
            standardCodeRepo.deleteById(updatingCode);
        }
        oldStd.setUpdatingCode(null);
        oldStd.setState(DomainState.A);
        standardCodeRepo.save(oldStd);
        PageResult<EditHistory> codeHistory = getCodeHistory(oldStd.getCode(), oldStd.getCategoryId(), 1, 1);
        if (codeHistory == null || CollectionUtils.isEmpty(codeHistory.getContent())) {
            return;
        }
        try {
            KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
            UpdateStandardCodeMessage message = new UpdateStandardCodeMessage(
                    Lists.newArrayList(convertToStandCodeDto(oldStd)),
                    Lists.newArrayList(codeHistory.getContent()),
                    StandardCodeType.getTypeByCategoryId(oldStd.getCategoryId()));
            message.setMsgId(System.currentTimeMillis());
            message.setSendTime(new Date());
            kafkaPublishService.sendMessage(updateStandardTopic, message);
        } catch (Exception e) {
            logger.error("Sending email failed", e);
        }
    }

    @Override
    @Transactional
    public void publicDomain(String domainId, String username) {
        Domain domain = domainRepo.findByDomainIdEquals(domainId);

        Domain toBeUpdatePublishedDomain = domainRepo.findFirstByUpdatingDomainIdEquals(domainId);

        if (toBeUpdatePublishedDomain == null) {
            domain.setState(DomainState.A);
            domain.setVersion(1);
            domain.setFirstPublish(new Date());
            domain.setLastReview(new Date());
            String categoryName = msgService.getMessage("category.standard.data");
            if (domain.getCategoryId() != null && isMetrics(domain.getCategoryId())) {
                categoryName = msgService.getMessage("category.index.data");
            }
            createDomainVersion(domain, username, msgService.getMessage("hasBeanMarkedPublished", categoryName), null, null);
            domainRepo.save(domain);
        }
        //更新已发布的标准
        else {
            deleteCopyDomain(toBeUpdatePublishedDomain.getDomainId(), true, username);
        }

    }

    @Override
    @Transactional
    public void publicDomain(String domainId, String username, String stateOriginal) {
        Domain domain = domainRepo.findByDomainIdEquals(domainId);

        Domain toBeUpdatePublishedDomain = domainRepo.findFirstByUpdatingDomainIdEquals(domainId);

        if (toBeUpdatePublishedDomain == null) {
            // 判断原始状态,如果是废弃再发布，需要版本加1
            if(DomainState.X.toString().equals(stateOriginal)){
                domain.setVersion(domain.getVersion() + 1);
            } else {
                domain.setVersion(1);
            }

            domain.setState(DomainState.A);
            domain.setFirstPublish(new Date());
            domain.setLastReview(new Date());
            String categoryName = msgService.getMessage("category.standard.data");
            if (domain.getCategoryId() != null && isMetrics(domain.getCategoryId())) {
                categoryName = msgService.getMessage("category.index.data");
            }

            String message;
            if(DomainState.X.toString().equals(stateOriginal)){
                // 记录废弃再发布的变更信息
                message = msgService.getMessage("abandonToPublished", categoryName);
            } else {
                message = msgService.getMessage("hasBeanMarkedPublished", categoryName);
            }
            createDomainVersion(domain, username, message, null, null);
            domainRepo.save(domain);
        }
        //更新已发布的标准
        else {
            deleteCopyDomain(toBeUpdatePublishedDomain.getDomainId(), true, username);
        }

    }

    @Override
    @Transactional
    public void publicStandard(String code, String username) {
        StandardCode standardCode = standardCodeRepo.findByCodeEquals(code);
        StandardCode toBeUpdatePublishedStandardCode = standardCodeRepo.findFirstByUpdatingCode(code);

        if (toBeUpdatePublishedStandardCode == null) {
            standardCode.setFirstPublish(new Date());
            standardCode.setState(DomainState.A);
            standardCode.setVersion(1);

            createStandardVersion(standardCode, username, msgService.getMessage("codeBeanMarkedPublished"));
            standardCodeRepo.save(standardCode);
        } else {
            deleteCopyStandard(toBeUpdatePublishedStandardCode.getCode(), true, username);
        }
    }

    @Override
    @Transactional
    public void publicStandard(String code, String username, String stateOriginal) {
        StandardCode standardCode = standardCodeRepo.findByCodeEquals(code);
        StandardCode toBeUpdatePublishedStandardCode = standardCodeRepo.findFirstByUpdatingCode(code);

        if (toBeUpdatePublishedStandardCode == null) {

            // 记录原始状态，如果是废弃再发布，需要版本加1
            if(DomainState.X.toString().equals(stateOriginal)){
                standardCode.setVersion(standardCode.getVersion() + 1);
            } else {
                standardCode.setVersion(1);
            }

            standardCode.setFirstPublish(new Date());
            standardCode.setState(DomainState.A);

            String message;
            if(DomainState.X.toString().equals(stateOriginal)){
                // 记录废弃再发布的变更信息
                message = msgService.getMessage("codeAbandonToPublished");
            } else {
                message = msgService.getMessage("codeBeanMarkedPublished");
            }

            createStandardVersion(standardCode, username, message);
            standardCodeRepo.save(standardCode);
        } else {
            deleteCopyStandard(toBeUpdatePublishedStandardCode.getCode(), true, username);
        }
    }

    @Override
    public List<String> getAllStandardDatasetName(Long categoryId) {
        Set<String> datasetNames = standardCodeRepo.findDatasetName(categoryId);
        return new ArrayList<>(datasetNames);
    }

    @Override
    public CommonPair<DomainDto, DomainDto> compareHistoryBetweenVersion(String domainId,
                                                                         Integer srcVersion, Integer tagVersion) {
        int little = srcVersion > tagVersion ? tagVersion : srcVersion;
        srcVersion = srcVersion > tagVersion ? srcVersion : tagVersion;
        tagVersion = little;

        DomainDto srcDto = null;
        if (srcVersion == -1) {
            Domain srcDomain = domainRepo.findByDomainIdEquals(domainId);
            if (srcDomain == null) {
                throw new InvalidArgumentException(msgService.getMessage("cannotFindData", domainId));
            }
            srcDto = convertToDomainDto(srcDomain);
        } else {
            DomainVersion srcHistory = domainVersionRepo
                    .findFirstByDomainIdAndVersion(domainId, srcVersion);
            if (srcHistory == null) {
                throw new InvalidArgumentException(msgService.getMessage("cannotFindHistory", srcHistory));
            }
            srcDto = convertToDomainDto(srcHistory);
        }

        DomainVersion tagHistory = domainVersionRepo
                .findFirstByDomainIdAndVersion(domainId, tagVersion);

        if (tagHistory == null) {
            throw new InvalidArgumentException(msgService.getMessage("cannotFindHistory", tagHistory));
        }

        DomainDto domainDto = convertDomainSomePropertiesIdToName(srcDto);

        if (isMetrics(domainDto.getCategoryId())) {
            List<ModifierDto> modifierRefs = modifierTypeService.getModifierRef(domainDto.getDomainId(), ModifierTypeCategory.BASE);
            domainDto.setModifierRefs(modifierRefs);
            domainDto.setModifierRefIds(modifierRefs.stream().map(ModifierDto::getModifierValueId).collect(Collectors.toList()));
            List<ModifierDto> timeModifierRefs = modifierTypeService.getModifierRef(domainDto.getDomainId(), ModifierTypeCategory.TIME_PERIOD);
            domainDto.setTimeModifierRefs(timeModifierRefs);
            domainDto.setTimeModifierRefIds(timeModifierRefs.stream().map(ModifierDto::getModifierValueId).collect(Collectors.toList()));
        }

        return new CommonPair<>(
                domainDto,
                convertDomainSomePropertiesIdToName(convertToDomainDto(tagHistory)));
    }

    @Override
    public StandardCompareResultDto compareCodeHistoryBetweenVersion(String code, Long categoryId,
                                                                     Integer srcVersion, Integer tagVersion) {
        int little = srcVersion > tagVersion ? tagVersion : srcVersion;
        srcVersion = srcVersion > tagVersion ? srcVersion : tagVersion;
        tagVersion = little;

        StandardCodeVersion src = standardCodeVerRepo.findFirstByCodeAndVersion(code, srcVersion);
        if (src == null) {
            throw new InvalidArgumentException(msgService.getMessage("cannotFindHistoryData", srcVersion));
        }
        StandardCodeVersion tag = standardCodeVerRepo.findFirstByCodeAndVersion(code, tagVersion);
        if (tag == null) {
            throw new InvalidArgumentException(msgService.getMessage("cannotFindHistoryData", tagVersion));
        }

        List<StandardCodeValueCompareDto> srcCodes = new ArrayList<>();
        List<StandardCodeValueCompareDto> tagCodes = new ArrayList<>();

        if (src.getValues() == null) {
            src.setValues(new ArrayList<>());
        }
        if (tag.getValues() == null) {
            tag.setValues(new ArrayList<>());
        }

        for (StandardCodeValueDto codeValue : src.getValues()) {
            srcCodes.add(new StandardCodeValueCompareDto(codeValue, src.getCode()));
        }
        for (StandardCodeValueDto codeValue : tag.getValues()) {
            tagCodes.add(new StandardCodeValueCompareDto(codeValue, tag.getCode()));
        }

        StandardCompareResultDto resultDto = new StandardCompareResultDto();
        //比较标准代码属性
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.code"), src.getCode(),
                        tag.getCode()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.name"), src.getName(),
                        tag.getName()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.eName"), src.getEnName(),
                        tag.getEnName()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.topic"), src.getDatasetName(),
                        tag.getDatasetName()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remark"), src.getComment(),
                        tag.getComment()));

        //比较代码值
        Map<String, List<StandardCodeValueCompareDto>> cCompareDto = new HashMap<>();
        List<Pair<StandardCodeValueCompareDto, StandardCodeValueCompareDto>> modifys = new ArrayList<>();
        compareCodeValue(srcCodes, tagCodes, cCompareDto, modifys);

        resultDto.setAddCodes(cCompareDto.get("add"));
        resultDto.setDeleteCodes(cCompareDto.get("delete"));

        for (Pair<StandardCodeValueCompareDto, StandardCodeValueCompareDto> modify : modifys) {
            StandardCodeValueCompareDto srcCode = modify.getFirst();
            StandardCodeValueCompareDto tagCode = modify.getSecond();
//            Integer order = Integer.parseInt(srcCode.getCompareValue().split("-")[1]);
            String order = srcCode.getCompareValue();

            List<StandardCompareDto> codeValueCompares = new ArrayList<>();
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.codeV"), srcCode.getValue(),
                            tagCode.getValue()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.codeName"), srcCode.getName(),
                            tagCode.getName()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.order"), srcCode.getOrder() + "",
                            tagCode.getOrder() + ""));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remark1"), srcCode.getDefinition(),
                            tagCode.getDefinition()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remark2"), srcCode.getDefinition2(),
                            tagCode.getDefinition2()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remark3"), srcCode.getDefinition3(),
                            tagCode.getDefinition3()));

            resultDto.getModifyCodes().put(order, codeValueCompares);
        }

        resultDto.setNoChangeCode(cCompareDto.get("noChange"));

        return resultDto;
    }

    @Override
    @Deprecated
    public void importStandardCode(File file, Long categoryId, boolean autoGenCode) throws Exception {
        StandardParaDto dto = loadCodeFile(file, categoryId, false, autoGenCode, AuthTools.currentUsernameFailFast());
        addPublicCodes(dto.getInsertDto(), AuthTools.currentUsernameFailFast());
    }

    @Override
    @Transactional
    public ImportInstantJobResult importStandardCode(File file, Long categoryId, boolean published, boolean autoGenCode, boolean ignoreError, String user) throws Exception {
        ImportInstantJobResult result = new ImportInstantJobResult();
        //领域标准都是直接发布
//        if (categoryId != 1) {
//            published = true;
//        }
        StandardParaDto dto = loadCodeFile(file, categoryId, true, autoGenCode, user);
        dto = addPublicCodes(dto,user, published, ignoreError);

        result.setFileId(getStandCodeProblemFile(file, dto.getErrorDto(), user,  autoGenCode));

        AtomicInteger success = new AtomicInteger();
        AtomicInteger failed = new AtomicInteger();
        dto.getInsertDto().forEach(o -> success.addAndGet(o.getValues().size()));
        dto.getErrorDto().forEach(o -> failed.addAndGet(o.getValues().size()));

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
            codeMap = errorList.stream().collect(Collectors.toMap(StandardCodeDto::getCode, o -> o.getErrorMsg() == null ? "" : o.getErrorMsg()));
        }
        Map<String, String> nameMap = errorList.stream().collect(Collectors.toMap(StandardCodeDto::getName, o -> o.getErrorMsg() == null ? "" : o.getErrorMsg()));
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
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                String msg = null;
                // 代码编号
                String code = getCellStringValue(row.getCell(1));
                //中文名称
                String chineseName = getCellStringValue(row.getCell(2));
                // 编码取值
                String codeValue =null;
                if(isStand){
                     codeValue = getCellStringValue(row.getCell(6));
                }else {
                     codeValue = getCellStringValue(row.getCell(7));
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

    @Override
    public File exportStandardCode(Long categoryId) throws Exception {
        if (categoryId == 1L) {
            return exportDomainCode();
        } else {
            // New Workbook
            XSSFWorkbook wb = new XSSFWorkbook();

            Cell c = null;

            // Cell style for header row
            Font f = wb.createFont();
            f.setColor(IndexedColors.WHITE.getIndex());
            f.setFontHeightInPoints((short) 11);

            XSSFCellStyle cs = wb.createCellStyle();
            cs.setFillForegroundColor(new XSSFColor(new Color(102, 102, 153), null));
            cs.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            cs.setAlignment(HorizontalAlignment.CENTER);
            cs.setFont(f);

            // New Sheet
            XSSFSheet sheet1 = null;
            sheet1 = wb.createSheet(msgService.getMessage("exportStandardCode.sheet.name"));

            // Row and column indexes
            int idx = 0;

            // Generate column headings
            Row row = sheet1.createRow(idx);

            int colIdx = 0;

            List<String> headers = msgService.getMessageObj("exportStandardCode.headers", false);
//        List<String> headers = new ArrayList<>(header_l);

            //领域标准代码没有代码状态
//            if (categoryId != 1) {
//                headers.remove(5);
//            }
            if (categoryId == 1) {
                //基础标准代码没有映射代码
                headers.remove(6);
                //基础标准代码没有映射编码取值
                headers.remove(9);
            }

            for (String header : headers) {
                c = row.createCell(colIdx);
                c.setCellValue(header);
                c.setCellStyle(cs);
                sheet1.setColumnWidth(colIdx++, 10 * 256);
            }

            Iterable<StandardCodeDto> codes = getPublicCodes(null, categoryId);

            for (StandardCodeDto code : codes) {
                //没有权限的不导出
                if (code.getState().equals(DomainState.D) || code.getState().equals(DomainState.C)) {
                    if (!standardService.viewAllStandard() && !code.getSubmitter().equals(AuthTools.currentUsername())) {
                        continue;
                    }
                }
                for (StandardCodeValueDto value : code.getValues()) {
                    idx++;
                    row = sheet1.createRow(idx);
                    colIdx = 0;
                    // STANDARD  0
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getDatasetName());
                    colIdx++;
                    //1
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getCode());
                    colIdx++;
                    //2
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getName());
                    colIdx++;
                    //3
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getEnglishName());
                    colIdx++;
                    //4
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getComment());
                    colIdx++;
                    //5

                    c = row.createCell(colIdx);
                    String state = "";
                    switch (code.getState()) {
                        case A:
                            state = msgService.getMessage("DomainState.A");
                            break;
                        case D:
                            state = msgService.getMessage("DomainState.D");
                            break;
                        case C:
                            state = msgService.getMessage("DomainState.C");
                            break;
                        case X:
                            state = msgService.getMessage("DomainState.X");
                            break;
                    }
                    c.setCellValue(state);
                    colIdx++;
                    if (categoryId != 1) {
                        //6
                        c = row.createCell(colIdx);
                        c.setCellValue(code.getRefStandardCode());
                        colIdx++;
                    }
                    //7
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getValue());
                    colIdx++;
                    //8
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getName());
                    colIdx++;
                    //9
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getParentValue());
                    colIdx++;
                    if (categoryId != 1) {
                        //10
                        String refValue =
                                value.getRefValue() == null ? "" : value.getRefValue().getValue();
                        c = row.createCell(colIdx);
                        c.setCellValue(refValue);
                        colIdx++;
                    }
                    //11
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getOrder());
                    colIdx++;
                    //12
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getDefinition());
                    colIdx++;
                    //13
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getDefinition2());
                    colIdx++;
                    //14
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getDefinition3());
                }
                if (code.getValues().isEmpty()) {
                    idx++;
                    row = sheet1.createRow(idx);
                    colIdx = 0;
                    //0
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getDatasetName());
                    colIdx++;
                    //1
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getCode());
                    colIdx++;
                    //2
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getName());
                    colIdx++;
                    //3
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getEnglishName());
                    colIdx++;
                    //4
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getComment());
                    colIdx++;
                    //5

                    c = row.createCell(colIdx);
                    String state = "";
                    switch (code.getState()) {
                        case A:
                            state = msgService.getMessage("DomainState.A");
                            break;
                        case D:
                            state = msgService.getMessage("DomainState.D");
                            break;
                        case C:
                            state = msgService.getMessage("DomainState.C");
                            break;
                        case X:
                            state = msgService.getMessage("DomainState.X");
                            break;
                    }
                    c.setCellValue(state);
                    colIdx++;
                    //6
                    if (categoryId != 1) {
                        c = row.createCell(colIdx);
                        c.setCellValue(code.getRefStandardCode());
                    }
                }
            }
            String name = categoryId == 1 ? "标准代码.xlsx" : "领域标准代码.xlsx";
            return DataUtility.generalFileByWorkbook(wb, name);
        }
    }


    public File exportDomainCode() throws Exception {
        // New Workbook
//        File file = new File(DatablauUtility.getResourcePath("/domain/code_template.xlsx"));

        FileInputStream inputStream = new FileInputStream(DatablauUtility.getResourcePath("/domain/code_template.xlsx"));
        try {
            XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
            XSSFSheet sheet = workbook.getSheet(msgService.getMessage("exportDomainCode.sheet.name"));
            sheet.removeRow(sheet.getRow(1));
            sheet.removeRow(sheet.getRow(2));
            sheet.removeRow(sheet.getRow(3));
            sheet.removeRow(sheet.getRow(4));
            sheet.removeRow(sheet.getRow(5));
            sheet.removeRow(sheet.getRow(6));
            sheet.removeRow(sheet.getRow(7));
            sheet.removeRow(sheet.getRow(8));
            sheet.removeRow(sheet.getRow(9));

            int idx = 0;
            int colIdx = 0;

            Iterable<StandardCodeDto> codes = getPublicCodes(null, 1L);
            Row row = null;
            Cell c = null;

            for (StandardCodeDto code : codes) {
                //没有权限的不导出
                if (code.getState().equals(DomainState.D) || code.getState().equals(DomainState.C)) {
                    if (!standardService.viewAllStandard() && !code.getSubmitter().equals(AuthTools.currentUsername())) {
                        continue;
                    }
                }
                for (StandardCodeValueDto value : code.getValues()) {
                    idx++;
                    row = sheet.createRow(idx);
                    colIdx = 0;
                    // STANDARD  0
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getDatasetName());
                    colIdx++;
                    //1
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getCode());
                    colIdx++;
                    //2
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getName());
                    colIdx++;
                    //3
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getEnglishName());
                    colIdx++;
                    //4
                    c = row.createCell(colIdx);
                    String state = "";
                    switch (code.getState()) {
                        case A:
                            state = msgService.getMessage("DomainState.A");
                            break;
                        case D:
                            state = msgService.getMessage("DomainState.D");
                            break;
                        case C:
                            state = msgService.getMessage("DomainState.C");
                            break;
                        case X:
                            state = msgService.getMessage("DomainState.X");
                            break;
                    }
                    c.setCellValue(state);
                    colIdx++;
                    //5
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getComment());
                    colIdx++;
                    //设置序号
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getOrder());
                    colIdx++;
                    //设置编码取值
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getValue());
                    colIdx++;
                    //8
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getName());
                    colIdx++;
                    //9
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getParentValue());
                    colIdx++;

                    c = row.createCell(colIdx);
                    c.setCellValue(value.getDefinition());
                    colIdx++;
                    //13
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getDefinition2());
                    colIdx++;
                    //14
                    c = row.createCell(colIdx);
                    c.setCellValue(value.getDefinition3());
                }
                if (code.getValues().isEmpty()) {
                    idx++;
                    row = sheet.createRow(idx);
                    colIdx = 0;
                    //0
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getDatasetName());
                    colIdx++;
                    //1
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getCode());
                    colIdx++;
                    //2
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getName());
                    colIdx++;
                    //3
                    c = row.createCell(colIdx);
                    c.setCellValue(code.getEnglishName());
                    colIdx++;

                    c = row.createCell(colIdx);
                    String state = "";
                    switch (code.getState()) {
                        case A:
                            state = msgService.getMessage("DomainState.A");
                            break;
                        case D:
                            state = msgService.getMessage("DomainState.D");
                            break;
                        case C:
                            state = msgService.getMessage("DomainState.C");
                            break;
                        case X:
                            state = msgService.getMessage("DomainState.X");
                            break;
                    }
                    c.setCellValue(state);
                    colIdx++;

                    c = row.createCell(colIdx);
                    c.setCellValue(code.getComment());
                    colIdx++;
                }
            }
            String name = "标准代码.xlsx";
            File file1 = new File(name);
            try (FileOutputStream out = new FileOutputStream(file1)) {
                workbook.write(out);
            } catch (FileNotFoundException e) {
                logger.warn(e.getMessage(), e);
            } catch (IOException e) {
                logger.warn(e.getMessage(), e);
            } finally {
                try {
                    workbook.close();
                } catch (IOException e) {
                    logger.warn(e.getMessage(), e);
                }
            }
            return file1;
        } finally {
            if (inputStream != null) {
                inputStream.close();
            }
        }
    }

    @Override
    public File exportDomainTemplate(Long domainCategoryId, Map<Integer, String> udpMap) {
        File templateFile = null;
        if (isBaseDomain(domainCategoryId)) {
            templateFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_template.xlsx"));
        } else if (isMeDomain(domainCategoryId)) {
            templateFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_me_template.xlsx"));
        } else if (isDictDomain(domainCategoryId)) {
            templateFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_dict_template.xlsx"));
        } else if (isFiledDomain(domainCategoryId)) {
            templateFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_filed_template.xlsx"));
        }

        // wangxin temp comment out  export template
        if (!templateFile.exists()) {
            throw new InvalidArgumentException(msgService.getMessage("templateFileNotFound"));
        }
        File udpFile = null;
        if (isBaseDomain(domainCategoryId)) {
            udpFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_template_temp.xlsx"));
        } else if (isMeDomain(domainCategoryId)) {
            udpFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_me_template_temp.xlsx"));
        } else if (isDictDomain(domainCategoryId)) {
            udpFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_dict_template_temp.xlsx"));
        } else if (isFiledDomain(domainCategoryId)) {
            udpFile = new File(
                    DatablauUtility.getResourcePath("/domain/domain_filed_template_temp.xlsx"));
        }

        try {
            FileUtils.copyFile(templateFile, udpFile);
        } catch (Exception e) {
            logger.info(e.getMessage());
        }

        List<DomainUdpDto> udps = getDomainUdps(domainCategoryId);
        if (udps == null || udps.isEmpty()) {
            return udpFile;
        }
        return addUdpAttributeToTemplate(udps, templateFile, udpFile, udpMap);
    }

    @Override
    public File exportDomain(DomainQueryDto queryDto) throws Exception {
        queryDto.setCurrentUser(AuthTools.currentUsername());
        List<DomainDto> toExportDomains = convertDomainSomePropertiesIdToName(
                getListDomains(queryDto));

        if (!CollectionUtils.isEmpty(queryDto.getDomainIds())) {
            for (DomainDto domainDto : toExportDomains) {
                if (domainDto.getCategoryId() != null) {
                    queryDto.setCategoryId(domainDto.getCategoryId());
                    break;
                }
            }
        }

        File descFile = null;
        File srcFile = null;
        //udp在excel中的位置，key是excel列序号，value是udp名称
        Map<Integer, String> udpExcelMap = new HashMap<>();
        try {
            // 复制数据标准模板作为导出模板
            srcFile = exportDomainTemplate(queryDto.getCategoryId(), udpExcelMap);
            String desc = GeneralUtility.getWebRootPath() + "/resources/domain/domain1.xlsx";
            descFile = new File(desc);
            if (!descFile.exists()) {
                descFile.createNewFile();
            }
            FileUtils.copyFile(srcFile, descFile);
            XSSFWorkbook existingWb = new XSSFWorkbook(desc);

            // 删除模板中样例数据
            XSSFSheet oldSheet = existingWb.getSheetAt(0);
            for (int i = 1; i < 11; i++) {
                Row row = oldSheet.getRow(i);
                if (row != null) {
                    oldSheet.removeRow(row);
                }
            }

            SXSSFWorkbook wb = new SXSSFWorkbook(existingWb, 1000);
            SXSSFSheet sheet;
            sheet = wb.getSheetAt(0);

            int rowIndex = 1;
            Row row = sheet.createRow(rowIndex);
            Cell c;

            //udp在excel中的位置，key是excel列序号，value是udp的id
            List<DomainUdpDto> domainUdps = getDomainUdps(queryDto.getCategoryId());
            Map<Integer, Long> udpExcelIdMap = new HashMap<>();
            for (Map.Entry<Integer, String> entry : udpExcelMap.entrySet()) {
                String udpName = entry.getValue();
                for (DomainUdpDto udpDto : domainUdps) {
                    if (udpDto.getName() == null) {
                        continue;
                    }
                    if (udpDto.getName().equals(udpName)) {
                        udpExcelIdMap.put(entry.getKey(), udpDto.getUdpId());
                    }
                }
            }

            // 将domain的属性写入excel
            for (DomainDto domainDto : toExportDomains) {
                int colIndex = 0;
                if (!Strings.isNullOrEmpty(domainDto.getDomainCode())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getDomainCode());
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getChineseName())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getChineseName());
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getEnglishName())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getEnglishName());
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getAbbreviation())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getAbbreviation());
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getDescription())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getDescription());
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getBusinessRule())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getBusinessRule());
                }
                colIndex++;
                if (isBaseDomain(queryDto.getCategoryId())
                        || isFiledDomain(queryDto.getCategoryId())
                        || isDictDomain(queryDto.getCategoryId())) {
                    if (!Strings.isNullOrEmpty(domainDto.getReferenceCode())) {
                        c = row.createCell(colIndex);
                        c.setCellValue(domainDto.getReferenceCode());
                    }
                    colIndex++;
                }
                if (!Strings.isNullOrEmpty(domainDto.getSource())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getSource());
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getSynonym())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getSynonym());
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getRelationDomainStr())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getRelationDomainStr());
                }
                colIndex++;
                if (domainDto.getAuthCategoryName() != null) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getAuthCategoryName());
                }
                if (queryDto.getCategoryId() == 2) {
                    colIndex++;
                    if (domainDto.getParentCode() != null) {
                        c = row.createCell(colIndex);
                        c.setCellValue(domainDto.getParentCode());
                    }
                    colIndex++;
                    if (domainDto.getDimCodes() != null) {
                        c = row.createCell(colIndex);
                        c.setCellValue(StringUtils.join(domainDto.getDimCodes(), ","));
                    }
                    colIndex++;
                    if (domainDto.getFunction() != null) {
                        c = row.createCell(colIndex);
                        c.setCellValue(domainDto.getFunction());
                    }
                    colIndex++;
                    if (domainDto.getMeasureUnit() != null) {
                        c = row.createCell(colIndex);
                        c.setCellValue(domainDto.getMeasureUnit());
                    }
                    colIndex++;
                    if (domainDto.getMonitorObjects() != null) {
                        c = row.createCell(colIndex);
                        c.setCellValue(domainDto.getMonitorObjects());
                    }
                }
                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getRangeType())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getRangeType());
                }

                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getDataType())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getDataType());
                }
                colIndex++;
                if (domainDto.getDataScale() != null) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getDataScale());
                }
                colIndex++;
                if (domainDto.getDataPrecision() != null) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getDataPrecision());
                }

                colIndex++;
                c = row.createCell(colIndex);
                c.setCellValue(domainDto.getNotNull() ? msgService.getMessage("keyword.YES") : msgService.getMessage("keyword.NO"));

                colIndex++;
                if (!Strings.isNullOrEmpty(domainDto.getDataFormat())) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getDataFormat());
                }
                colIndex++;
                if (domainDto.getOwnerOrg() != null) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getOwnerOrg());
                }
                colIndex++;
                if (domainDto.getDescriptionDepartment() != null) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getDescriptionDepartment());
                }
                //是基础标准，不是领域标准
                if (queryDto.getCategoryId() <= 3) {
                    colIndex++;
                    if (domainDto.getFirstPublish() != null) {
                        c = row.createCell(colIndex);
                        c.setCellValue(
                                new SimpleDateFormat("yyyy-MM-dd").format(domainDto.getFirstPublish()));
                    }
                    colIndex++;
                    if (domainDto.getState() != null) {
                        c = row.createCell(colIndex);
                        if (domainDto.getState().equals(DomainState.D)) {
                            c.setCellValue(msgService.getMessage("DomainState.D"));
                        } else if (domainDto.getState().equals(DomainState.C)) {
                            c.setCellValue(msgService.getMessage("DomainState.C"));
                        } else if (domainDto.getState().equals(DomainState.A)) {
                            c.setCellValue(msgService.getMessage("DomainState.A"));
                        } else {
                            c.setCellValue(msgService.getMessage("DomainState.X"));
                        }
                    }
                }
                colIndex++;
                if (domainDto.getPath() != null && !domainDto.getPath().isEmpty()) {
                    c = row.createCell(colIndex);
                    c.setCellValue(domainDto.getPathStr());
                }
                colIndex++;

                // 获得标准的自定义属性的map
                Map<Long, String> map = domainDto.getAdditionalProperties();
                if (map != null && !map.isEmpty()) {
                    int count = 0;
                    // excel中第一个udp属性的名字
                    for (Long item : map.keySet()) {
                        // 如果excel中udp属性名字在所有udp中，并且id相同，则当前map中的属性值属于当前列
                        if (udpExcelIdMap.containsKey(colIndex + count)) {
                            c = row.createCell(colIndex + count);
                            c.setCellValue(map.get(udpExcelIdMap.get(colIndex + count)));
                            count++;
                        }
                    }
                }
                rowIndex++;
                row = sheet.createRow(rowIndex);
            }

            //模板显示所有的列，指标和标准需要删除一些特异化差异的列
            //deleteColByDomainCategoryId(sheet, queryDto.getCategoryId());

            String name = "";
            if (isBaseDomain(queryDto.getCategoryId())) {
                name = "基础标准.xlsx";
            } else if (isMeDomain(queryDto.getCategoryId())) {
                name = "指标体系.xlsx";
            } else if (isDictDomain(queryDto.getCategoryId())) {
                name = "数据字典.xlsx";
            } else if (isFiledDomain(queryDto.getCategoryId())) {
                name = "领域数据标准.xlsx";
            }
            //删除填写说明
            wb.removeSheetAt(1);
            wb.setSheetName(0, wb.getSheetName(0).replace(msgService.getMessage("exportDomain.sheet.name"), ""));
            return DataUtility.generalFileByWorkbook(wb, name);
        } finally {
            // 导出后删除复制的模板
            if (srcFile != null && srcFile.exists()) {
                srcFile.delete();
            }
            if (descFile != null && descFile.exists()) {
                descFile.delete();
            }
        }
    }

    @Override
    public ImportInstantJobResult addImportDomains(File uploadFile, boolean published, Long categoryId,
                                                   String username, boolean autoGenCode, boolean ignoreError) throws Exception {
        checkDomainExcelTemplate(uploadFile, categoryId);

        DomainParaDto res = new DomainParaDto();
        ImportInstantJobResult result = new ImportInstantJobResult();

        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus status = txManager.getTransaction(def);
        try {

            ExcelLoadJobResult<DomainExcelDto> loadJobResult = excelLoader
                    .loadFile(uploadFile.getAbsolutePath(), 1, DomainExcelDto.class);
            List<DomainExcelDto> domainExcelDtoList = loadJobResult.getLoaded();
            if (domainExcelDtoList == null || domainExcelDtoList.isEmpty()) {
                return result;
            }
            ArrayList<DomainDto> domainDtos = new ArrayList<>();

            for (DomainExcelDto domainExcelDto : domainExcelDtoList) {
                if (workflowEnable) {
                    domainExcelDto.setState(msgService.getMessage("DomainState.D"));
                } else {
                    domainExcelDto.setState(msgService.getMessage("DomainState.A"));
                }
                domainExcelDto.setFirstPublish(null);
                try {
                    domainDtos.add(convertToDomainDto(domainExcelDto, categoryId));
                } catch (Exception e) {
                    logger.warn(e.getMessage(), e);
                    throw new InvalidArgumentException(e.getMessage());
                }
            }
            for (DomainDto domainDto : domainDtos) {
                if (Strings.isNullOrEmpty(domainDto.getEnglishName())) {
                    domainDto.setErrorMsg(msgService.getMessage("enNameCannotBeNull"));
                    continue;
                }
                if (Strings.isNullOrEmpty(domainDto.getAbbreviation())) {
                    domainDto.setErrorMsg(msgService.getMessage("enAbbrNameCannotBeNull"));
                    continue;
                }
                if (Strings.isNullOrEmpty(domainDto.getDescription())) {
                    domainDto.setErrorMsg(msgService.getMessage("busDefCannotBeNull"));
                    continue;
                }
                if (Strings.isNullOrEmpty(domainDto.getDataType())) {
                    domainDto.setErrorMsg(msgService.getMessage("domainDataTypeMissing", domainDto.getChineseName()));
                }
            }

            res = generalAddImportDomains(uploadFile, published, categoryId, username, domainDtos, autoGenCode, ignoreError);

            txManager.commit(status);

        } catch (Exception e) {
            if (!status.isCompleted()) {
                txManager.rollback(status);
            }
            throw new AndorjRuntimeException(e.getMessage(), e);
        }

        List<DomainDto> errorList = res.getDomainDto()
                .stream().
                filter(
                        o -> !Strings.isNullOrEmpty(o.getErrorMsg())
                ).toList();

        if (ignoreError || errorList.isEmpty()) {
            //将导入udp 更新到es 动态字段属性
            if (categoryId == 1L || categoryId > 6L) {
                if (domainDataSynchronizer.checkDDCEnable()) {
                    domainDataSynchronizer.insertSyncDomainUdpToEs(res.getInsertDomain(), getDDCIndexName(LDMTypes.oDataStandard));
                }
            }
        }

        result.setFileId(getProblemFile(
                uploadFile,
                errorList, username, autoGenCode));
        if (ignoreError) {
            result.setSuccess(res.getDomainDto().size() - errorList.size());
            result.setFailed(errorList.size());
        } else {
            // 如果不忽略错误，并且存在错误，那么成功条数=入库条数 = 0
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

    /**
     * 通过原生文件、 问题列表生成 问题文件
     * */
    public String getProblemFile(File originFile, List<DomainDto> list, String userName, boolean autoGenCode ){
        if (list == null || list.isEmpty()) {
            return null;
        }

        String res = null;
        Map<String, String> codeMap = new HashMap<>();
        if (!autoGenCode) {
            codeMap = list.stream().collect(Collectors.toMap(DomainDto::getDomainCode, DomainDto::getErrorMsg,(errorMsg1, errorMsg2) -> errorMsg1));
        }
        Map<String, String> nameMap = list.stream().collect(Collectors.toMap(DomainDto::getChineseName, DomainDto::getErrorMsg, (errorMsg1, errorMsg2) -> errorMsg1));
        // key row number; value error msg
        Map<Integer, String> errorMap = new HashMap<>();

        String filename = msgService.getMessage("import.errorData")+".xlsx";
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
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                if (i == 1) {
                    for (int j = 0; j <= row.getLastCellNum(); j++) {
                        String headName = row.getCell(j) == null ? null : row.getCell(j).getStringCellValue();
                        if (ObjectUtils.equals(headName, msgService.getMessage("domianCode"))) {
                            codePlace = j;
                        }
                        if (ObjectUtils.equals(headName, msgService.getMessage("code.cel.indexC"))) {
                            codePlace = j;
                        }
                        if (ObjectUtils.equals(headName, msgService.getMessage("BasicDomain.head.name"))) {
                            namePlace = j;
                        }
                    }
                    continue;
                }
                // 标准编码
                String code = row.getCell(codePlace) == null ? null : row.getCell(codePlace).getStringCellValue().trim();
                //中文名称
                String chineseName = row.getCell(namePlace) == null ? null : row.getCell(namePlace).getStringCellValue().trim();
                if (!autoGenCode && !Strings.isNullOrEmpty(code)) {
                    msg = codeMap.get(code);
                } else {
                    msg = nameMap.get(chineseName);
                    // 自动编码，且不写中文名称的时候，需要在此给给定错误信息； 中文名称是 锚定物
                    if (Strings.isNullOrEmpty(chineseName)) {
                        errorMap.put(i, msgService.getMessage("domainChNameMissing"));
                        continue;
                    }
                }
                if (!Strings.isNullOrEmpty(msg)) {
                    errorMap.put(i, msg);
                }
            }


            ExcelUtil.fillingImportError(workbook, 0, errorMap, false, 2, 1);

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

    public void checkDomainExcelTemplate(File uploadFile, Long categoryId) {
        try (FileInputStream inputStream = new FileInputStream(uploadFile);
             XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {
            //sheet页校验
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new InvalidArgumentException(msgService.getMessage("templateSheetNotExist"));
            }
            //导入文件的表头列
            List<String> uploadHeaders = new ArrayList<>();
            Row row = sheet.getRow(1);
            if (row == null) {
                throw new InvalidArgumentException(msgService.getMessage("templateHeadNotExist"));
            }
            //获取第二行所有表头名称
            for (int i = 0; i <= row.getLastCellNum(); i++) {
                Cell cell = row.getCell(i);
                if (cell == null || Strings.isNullOrEmpty(cell.getStringCellValue().trim())) {
                    continue;
                }
                String cellVal = cell.getStringCellValue().trim();
                if(cellVal.indexOf(msgService.getMessage("DomainExcelTemplate.catalog.level1")) > -1){
                    uploadHeaders.add(msgService.getMessage("DomainExcelTemplate.catalog"));
                }
                uploadHeaders.add(cell.getStringCellValue().trim());
            }
            List<String> templateHeaders;
            //模板里的表头列
            if (categoryId.equals(DomainService.DOMAIN_CATEGORY_ID)) {
                //基础标准模板
                templateHeaders = msgService.getMessageObj("DomainExcelTemplate.basic", false);
            } else if (categoryId.equals(DomainService.INDEX_CATEGORY_ID)) {
                //指标体系模板
                templateHeaders = msgService.getMessageObj("DomainExcelTemplate.index", false);
            } else if (categoryId > DomainService.REALM_CATEGORY_ID) {
                //领域标准模板
                templateHeaders = msgService.getMessageObj("DomainExcelTemplate.domain", false);
            } else {
                throw new InvalidArgumentException(msgService.getMessage("importFailedByInvalidType", categoryId));
            }
            //校验模板是否正确
            for (String tmpHeader : templateHeaders) {
                if (!uploadHeaders.contains(tmpHeader)) {
                    throw new InvalidArgumentException(msgService.getMessage("importColNotExist", tmpHeader));
                }
            }
        } catch (Exception e) {
            logger.error(msgService.getMessage("templateFailed") + e.getMessage(), e);
            throw new InvalidArgumentException(msgService.getMessage("templateFailed") + e.getMessage());
        }
    }

    public DomainParaDto generalAddImportDomains(File uploadFile, boolean published, Long categoryId,
                                                String username, ArrayList<DomainDto> domainDtos, boolean autoGenCode, boolean ignoreError) throws Exception {
        //所有机构编码
        List<String> bms = RemoteServiceGetter
                .getOrganizationService()
                .getOrganizationsByBms(new ArrayList<>())
                .stream()
                .map(OrganizationDto::getBm)
                .collect(Collectors.toList());

        Set<String> chineseNameMap = new HashSet<>();
        Set<String> duplicateChineseNames = new HashSet<>();
        Set<String> domainCodeSet = new HashSet<>();
        Set<String> duplicateDomainCodes = new HashSet<>();
//        if (categoryId > 3) {
//            domainCodeSet.addAll(domainRepo.findAllDomainCodes());
//        }
        //所有已发布的标准代码，
        // 领域标准和域标准校验领域下的和基础的;
        // 基础标准校验基础代码;
        Set<Long> categoryIds = new HashSet<>();
        if (categoryId == 1) {
            categoryIds.add(1L);
        }
        if (categoryId >= 6L) {
            categoryIds.add(1L);
            categoryIds.add(categoryId);
        }
        List<String> standardCodeList = standardCodeRepo.findCodesByCategoryIdsAndState(categoryIds, DomainState.A);

        List<DomainDto> result = new LinkedList<>();

        //获取自动生成code
        List<String> domainCodes = null;
        if (autoGenCode) {
            if (domainDtos != null) {
                long count = domainDtos.size();
                if (count > 0) {
                    domainCodes = generateService.getBatchDomainCodes(DatablauDomainType.formByCategoryId(categoryId), (int) count);
                }
            }
        }

        int codeIndex = 0;
        for (DomainDto domainDto : domainDtos) {
            if (domainCodes != null && !domainCodes.isEmpty() && autoGenCode) {
                domainDto.setDomainCode(domainCodes.get(codeIndex++));
            }

            if (Strings.isNullOrEmpty(domainDto.getDomainCode().trim()) && !autoGenCode) {
                domainDto.setErrorMsg(msgService.getMessage("modifierTypeCodeCannotBeNull"));
                result.add(domainDto);
                continue;
            }

            //校验code是否已存在
            //主要是现在同一个表内部唯一
            //需要判断不同类型下的code是否重复
            if (!StringUtils.isEmpty(domainDto.getDomainCode()) && !autoGenCode) {
                if (domainRepo.existsByDomainCodeAndCategoryIdNot(domainDto.getDomainCode(), categoryId)) {
                    domainDto.setErrorMsg(msgService.getMessage("codeExists", domainDto.getDomainCode()));
                    result.add(domainDto);
                    continue;
                }
            }

            if (!autoGenCode && domainCodeSet.contains(domainDto.getDomainCode().trim())) {
                domainDto.setErrorMsg(msgService.getMessage("domainCodeConflicts", domainDto.getDomainCode()));
                result.add(domainDto);
                duplicateDomainCodes.add(domainDto.getDomainCode().trim());
                continue;
            } else if (!autoGenCode) {
                domainCodeSet.add(domainDto.getDomainCode());
            }

            if (Strings.isNullOrEmpty(domainDto.getChineseName())) {
                domainDto.setErrorMsg(msgService.getMessage("domainChNameMissing"));
                result.add(domainDto);
                continue;
            }
            if (Strings.isNullOrEmpty(domainDto.getEnglishName())) {
                if (!isMetrics(categoryId)) {
                    domainDto.setErrorMsg(msgService.getMessage("enNameCannotBeNull"));
                    result.add(domainDto);
                    continue;
                }
            }
            if (Strings.isNullOrEmpty(domainDto.getAbbreviation())) {
                if (!isMetrics(categoryId)) {
                    domainDto.setErrorMsg(msgService.getMessage("enAbbrNameCannotBeNull"));
                    result.add(domainDto);
                    continue;
                }
            }
            if (Strings.isNullOrEmpty(domainDto.getDescription())) {
                if (!isMetrics(categoryId)) {
                    domainDto.setErrorMsg(msgService.getMessage("busDefCannotBeNull"));
                    result.add(domainDto);
                    continue;
                }
            }
            if (Strings.isNullOrEmpty(domainDto.getDataType())) {
                if (!isMetrics(categoryId)) {
                    domainDto.setErrorMsg(msgService.getMessage("domainDataTypeMissing", domainDto.getChineseName()));
                    result.add(domainDto);
                    continue;
                }
            }
            if (Strings.isNullOrEmpty(domainDto.getDescriptionDepartment())) {
//                if (!isMetrics(categoryId)) {
                    domainDto.setErrorMsg(msgService.getMessage(msgService.getMessage("busDefDepCannotBeNull")));
                    result.add(domainDto);
                    continue;
//                }
            }
            if (!Strings.isNullOrEmpty(domainDto.getDescriptionDepartment()) && !bms.contains(domainDto.getDescriptionDepartment())) {
                domainDto.setErrorMsg(msgService.getMessage("busDefDepWithCodeNotExist", domainDto.getDescriptionDepartment()));
                result.add(domainDto);
                continue;
            }
            if (!StringUtils.isEmpty(domainDto.getOwnerOrg()) && !bms.contains(
                    domainDto.getOwnerOrg())) {
                domainDto.setErrorMsg(msgService.getMessage("techDepWithCodeNotExist", domainDto.getOwnerOrg()));
                result.add(domainDto);
                continue;
            }
            if (chineseNameMap.contains(domainDto.getChineseName())) {
                domainDto.setErrorMsg(msgService.getMessage("domainChineseNameConflicts", domainDto.getChineseName()));
                result.add(domainDto);
                duplicateChineseNames.add(domainDto.getChineseName());
                continue;
            } else {
                chineseNameMap.add(domainDto.getChineseName());
            }
            if (!StringUtils.isEmpty(domainDto.getReferenceCode()) && !standardCodeList.contains(
                    domainDto.getReferenceCode())) {
                domainDto.setErrorMsg(msgService.getMessage("publishedWithCodeNotFind", domainDto.getReferenceCode()));
                result.add(domainDto);
                continue;
            }
            if ((Objects.equals(domainDto.getMetricType(), MetricType.DERIVE) ||
                    Objects.equals(domainDto.getMetricType(), MetricType.FORK)) &&
                    CollectionUtils.isEmpty(domainDto.getRelationDomain())) {
                domainDto.setErrorMsg(msgService.getMessage("refAndGenCodeCannotBeNUll"));
                result.add(domainDto);
                continue;
            }
            if (!CollectionUtils.isEmpty(domainDto.getRelationDomain())) {
                boolean hasError = false;
                String errorMsg = null;
                for (String domainCode : domainDto.getRelationDomain()) {
                    List<Domain> byDomainCode = domainRepo.findByDomainCode(domainCode);
                    if (CollectionUtils.isEmpty(byDomainCode)) {
                        errorMsg = msgService.getMessage("dataWithCodeNotExist", domainCode);
                        hasError = true;
                        break;
                    }
                    if (!DomainState.A.equals(byDomainCode.get(0).getState())) {
                        errorMsg = msgService.getMessage("publishedWithCodeNotExist", domainCode);
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
                domainDto.setErrorMsg(msgService.getMessage("englishAbbrIsOverLimit"));
                result.add(domainDto);
                continue;
            }
            if (!Strings.isNullOrEmpty(domainDto.getMeasureUnit()) && domainDto.getMeasureUnit().length() > 100) {
                domainDto.setErrorMsg(msgService.getMessage("qualityUnitOverLimit"));
                result.add(domainDto);
                continue;
            }

            //导入领域数据标准
//            if (categoryId > 3 && domainCodeSet.contains(domainDto.getDomainCode())) {
//                throw new InvalidArgumentException("标准编码 [" + domainDto.getDomainCode() + "] 已经存在");
//            }

            // 默认标准的大类是数据标准,ID为1L
            domainDto.setCategoryId(categoryId);

            //如果是指标
            if (isMetrics(categoryId)) {
                domainDto.setReferenceCode(null);
            } else {
                domainDto.setParentCode(null);
                domainDto.setDimCodes(null);
                domainDto.setFunction(null);
                domainDto.setMeasureUnit(null);
                domainDto.setMonitorObjects(null);

                domainDto.setRequirementId(null);
                domainDto.setMetricType(MetricType.BASIC);
                domainDto.setExpireDate(null);
                domainDto.setTakeEffectDate(null);
                domainDto.setSafeLevel(null);
                domainDto.setManagementOwner(null);
                domainDto.setTechOwner(null);
                domainDto.setBusinessOwner(null);
            }
            result.add(domainDto);
        }

        // 此处 将表格中重复的 标准和中文名称 都算作问题数据;
        for (DomainDto o : result) {
            if (autoGenCode) {
                if (Strings.isNullOrEmpty(o.getErrorMsg()) && duplicateChineseNames.contains(o.getChineseName())) {
                    o.setErrorMsg(msgService.getMessage("domainChineseNameConflicts", o.getChineseName()));
                }
            } else {
                if (Strings.isNullOrEmpty(o.getErrorMsg()) && duplicateDomainCodes.contains(o.getDomainCode())) {
                    o.setErrorMsg(msgService.getMessage("domainCodeConflicts", o.getDomainCode()));
                }
                if (Strings.isNullOrEmpty(o.getErrorMsg()) && duplicateChineseNames.contains(o.getChineseName())) {
                    o.setErrorMsg(msgService.getMessage("domainChineseNameConflicts", o.getChineseName()));
                }
            }
        }

        if (uploadFile != null) {
            //设置扩展属性
            setDomainUdpForBasicDomain(result, uploadFile, categoryId);
//            if(categoryId == 1|| categoryId == 2){
//            }else {
//                setDomainUdp(result, uploadFile, categoryId);
//            }
        }
        //将需要保存为id的属性，名字 -> id （名字转化成id）
        convertDomainSomePropertiesNameToId(result);

        Map<String, Domain> importDomainCodeKeyMap = new HashMap<>();
        Map<String, DomainDto> importDomainDtoCodeKeyMap = new HashMap<>();
        long start = System.currentTimeMillis();
        long now = System.currentTimeMillis();
        String categoryName = msgService.getMessage("category.standard");
        if (isMetrics(categoryId)) {
            categoryName = msgService.getMessage("category.index");
        }
        for (DomainDto domain : result) {
            if (!Strings.isNullOrEmpty(domain.getErrorMsg())) {
                continue;
            }
            domain.setSubmitter(username);
            domain.setVersion(1);
            if (Strings.isNullOrEmpty(domain.getDomainId())) {
                domain.setDomainId(getUUID());
            }
            Date currentTime = new Date(now++);
            domain.setCreateTime(currentTime);
            domain.setLastModification(currentTime);

            if (ObjectUtils.notEqual(categoryId, domain.getCategoryId())) {
                domain.setErrorMsg(msgService.getMessage("importDataTypeNotAccord"));
                continue;
            }

            // checkChineseNameUniqueness
            try {
                Map<String, String> names = domainChineseNames.get(categoryId);
                if (names.containsKey(domain.getChineseName().toLowerCase()) && !names
                        .get(domain.getChineseName().toLowerCase()).equals(domain.getDomainCode())) {
                    domain.setErrorMsg(msgService.getMessage("domainChineseNameConflicts", domain.getChineseName()));
                }
            } catch (ExecutionException ee) {
                domain.setErrorMsg(msgService.getMessage("domainCheckChNameFailed", ee.getMessage()));
            }

            // 此处将目录的相关校验提前
            // 目录不存在无法导入
            if (domain.getPath() == null || domain.getPath().isEmpty()) {
                domain.setErrorMsg(categoryName + msgService.getMessage("hasNoExistPathToImport", domain.getChineseName()));
            }

            domain.getPathStr();

        }
        getRoot(true);
        DomainTreeNodeDto domainTreeNodeDto = loadDomainTree(null, categoryId,
                AuthTools.currentUsername(), true);
        List<DomainDto> tempErrorList = result
                .stream().
                filter(
                        o -> !Strings.isNullOrEmpty(o.getErrorMsg())
                ).toList();
        //全部校验完成后，再创建目录
        for (DomainDto o : result) {
            // 校验没有问题的数据才会执行
            if (Strings.isNullOrEmpty(o.getErrorMsg())) {
                //设置domain的目录
                if (ignoreError || tempErrorList.isEmpty()) {
                    setDomainPath(o, categoryId, domainTreeNodeDto);
                }
                if (Strings.isNullOrEmpty(o.getErrorMsg())) {
                    importDomainCodeKeyMap.put(o.getDomainCode(), convertToDomain(o));
                }
            }
            importDomainDtoCodeKeyMap.put(o.getDomainCode(), o);
        }

        logger.info("outter step1: " + (System.currentTimeMillis() - start));
        DomainParaDto updateForEs = new DomainParaDto();
        if (published) {
            // 对于直接发布的标准Set最后审批日期
            Date date = new Date();
            importDomainCodeKeyMap.values().forEach(domain -> domain.setLastReview(date));
            updateForEs = addImportDomainPublish(importDomainCodeKeyMap, username, categoryId, importDomainDtoCodeKeyMap, ignoreError,  result);
        } else {
            updateForEs = addImportDomainNotPublish(importDomainCodeKeyMap, categoryId, importDomainDtoCodeKeyMap, ignoreError,  result);
        }
        logger.info("outter step2: " + (System.currentTimeMillis() - start));

        domainChineseNames.invalidate(categoryId);

        logger.info("outter step3: " + (System.currentTimeMillis() - start));

        return updateForEs;

    }

    public void checkCodeExists(String code, boolean autoGenCode, Long categoryId, int i) {
        //校验code是否已存在
        //主要是现在同一个表内部唯一
        //需要判断不同类型下的code是否重复
        if (!StringUtils.isEmpty(code) && !autoGenCode) {
            if (domainRepo.existsByDomainCodeAndCategoryIdNot(code, categoryId)) {
                throw new InvalidArgumentException(i == 0 ?
                        msgService.getMessage("codeExists", code) :
                        msgService.getMessage("codeExistsWithLine", i, code));
            }
        }
    }

    @Override
    public void syncGraphDomain() {
        // 同步数据标准、指标
        if (!graphEnable) {
            return;
        }
        int currentPage = 0;
        while (true) {
            List<Domain> content = domainRepo.findAll(PageRequest.of(currentPage, 1000))
                    .getContent();
            if (content.size() == 0) {
                break;
            }
            currentPage++;
            // 保存同义词节点到 neo4j
            saveSynonymForGraph(content);

            List<Domain> notParentDomains = new ArrayList<>();
            List<DomainGraphHelper> hasParentDomains = new ArrayList<>();

            for (Domain domain : content) {
                if (!Strings.isNullOrEmpty(domain.getParentCode())) {
                    List<Domain> parentDomains = domainRepo.findByDomainCodeAndCategoryId(
                            domain.getParentCode(), 2L);
                    if (!CollectionUtils.isEmpty(parentDomains)) {
                        DomainGraphHelper domainGraphHelper = new DomainGraphHelper();
                        BeanUtils.copyProperties(domain, domainGraphHelper);
                        domainGraphHelper.setParentId(parentDomains.get(0).getDomainId());
                        hasParentDomains.add(domainGraphHelper);
                        continue;
                    }
                }
                notParentDomains.add(domain);
            }
            GraphObjectProcessor graphObjectProcessor = getGraphObjectProcessor();
            graphObjectProcessor.objectsSave(hasParentDomains, SaveType.PERSIST);
            graphObjectProcessor.objectsSave(content, SaveType.PERSIST);
            // 保存关联指标节点到neo4j
            domainGraphHelperSave(content);
        }
        // 同步维度
        syncGraphDimension();
        // 同步指标映射
        syncGraphMetricMapping();
        // 同步修饰类型
        modifierTypeService.syncGraph();
    }

    public void syncGraphMetricMapping() {
        int currentPage = 0;
        while (true) {
            List<MetricMapping> content = metricMappingRepository.findAllPage(
                    PageRequest.of(currentPage, 1000)).getContent();
            if (content.size() == 0) break;
            currentPage++;
            getGraphObjectProcessor().objectsSave(content, SaveType.PERSIST);
        }

    }

    public void syncGraphDimension() {
        int currentPage = 0;
        while (true) {
            List<Dimension> content = dimensionRepository.findAllPage(
                    PageRequest.of(currentPage, 1000)).getContent();
            if (content.size() == 0) break;
            currentPage++;
            // 同步维度层级
            for (Dimension dimension : content) {
                List<DimensionCode> hierarchy = dimension.getHierarchy();
                if (!CollectionUtils.isEmpty(hierarchy)) {
                    getGraphObjectProcessor().objectsSave(hierarchy, SaveType.PERSIST);
                }
            }
            getGraphObjectProcessor().objectsSave(content, SaveType.PERSIST);
        }
    }

    @Override
    public void syncGraphStandardCode() {
        if (!graphEnable) {
            return;
        }
        int currentPage = 0;
        while (true) {
            List<StandardCode> content = standardCodeRepo.findAll(PageRequest.of(currentPage, 1000))
                    .getContent();
            if (content.size() == 0) {
                break;
            }
            currentPage++;
            getGraphObjectProcessor().objectsSave(content, SaveType.PERSIST);
        }
    }

    @Override
    public List<DomainDto> findDomainByDomainCodes(List<String> domainCodes) {
        if (CollectionUtils.isEmpty(domainCodes)) {
            return new ArrayList<>();
        }
        domainCodes = new ArrayList<>(new HashSet<>(domainCodes));
        List<String> updatingDomainIds = domainRepo.findUpdatingDomainId();
        List<Domain> domains = new ArrayList<>();
        if (updatingDomainIds.isEmpty()) {
            for (List<String> partition : Lists.partition(domainCodes, 999)) {
                domains.addAll(domainRepo.findDomainByDomainCodes(partition));
            }
        } else {
            for (List<String> partition : Lists.partition(domainCodes, 999)) {
                domains.addAll(domainRepo.findDomainByDomainCodes(partition, updatingDomainIds));
            }
        }

        return convertDomainSomePropertiesIdToName(convertToListDomainDto(domains));
    }

    @Override
    public List<String> getAllCategories() {
        return categoryCache.getUnchecked(DEFAULT_CAT_KEY);
    }

    @Override
    public void publishNamingStandardsDirectly(List<NamingStandardDto> namingStandardDtos) {
        if (namingStandardDtos == null || namingStandardDtos.isEmpty()) {
            return;
        }

        Set<String> cnNames = new HashSet<>();
        HashSet<NamingStandard> namingStandards = new HashSet<>();
        for (NamingStandardDto ns : namingStandardDtos) {
            cnNames.add(ns.getChineseName());
            namingStandards.add(convertToNamingStandard(ns));
        }
        namingStandardRepo.deleteByChineseNameIn(cnNames);
        namingStandardRepo.saveAll(namingStandards);
    }

    @Override
    public Long totalNamingStandard() {
        return namingStandardRepo.count();
    }

    @Override
    public NsExportResult exportNamingStandards() throws Exception {
        // New Workbook
        XSSFWorkbook wb = new XSSFWorkbook();

        Cell c = null;

        // Cell style for header row
        Font f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 12);

        CellStyle cs = wb.createCellStyle();
        cs.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
        cs.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        cs.setAlignment(HorizontalAlignment.CENTER);
        cs.setFont(f);

        // New Sheet
        XSSFSheet sheet1 = null;
        sheet1 = wb.createSheet(msgService.getMessage("NamingStandards.sheet"));

        //Map<Long, String> modelInfoMap = new HashMap<>();

        // Row and column indexes
        int idx = 0;

        // Generate column headings
        Row row = sheet1.createRow(idx);

        int colIdx = 0;

        List<String> headers = new ArrayList<>();
        //                                0          1          2          3
        List header_l = msgService.getMessageObj("NamingStandards.header", false);
        headers.addAll(header_l);

        for (String header : headers) {
            c = row.createCell(colIdx);
            c.setCellValue(header);
            c.setCellStyle(cs);
            sheet1.setColumnWidth(colIdx++, 20 * 256);
        }

        List<NamingStandardDto> codes = getAllNamingStandards();

        for (NamingStandardDto code : codes) {
            idx++;
            row = sheet1.createRow(idx);

            colIdx = 0;

            // STANDARD  0
            c = row.createCell(colIdx);
            c.setCellValue(code.getChineseName());
            colIdx++;
            //1
            c = row.createCell(colIdx);
            c.setCellValue(code.getAbbreviation());
            colIdx++;
            //2
            c = row.createCell(colIdx);
            c.setCellValue(code.getEnglishName());
            colIdx++;
            //3
            c = row.createCell(colIdx);
            c.setCellValue(code.getCategory());
        }
        return new NsExportResult(DataUtility.generalFileByWorkbook(wb, "命名词典.xlsx"), codes.size());
    }

    @Override
    public List<String> getAllDomainIds() {
        return domainRepo.findAllDomainIds();
    }

    @Override
    public List<String> getAllDomainIdsByCategoryIds(Collection<Long> categoryIds) {
        if(!CollectionUtils.isEmpty(categoryIds)){
            return domainRepo.findAllDomainIdsByCategoryIds(categoryIds);
        }else {
            return domainRepo.findAllDomainIds();
        }
    }

    @Override
    public List<DomainDto> getAllByCategoryIdEqualsAndDomainIdIn(Long categoryId,
                                                                 List<String> domainIds) {
        if (CollectionUtils.isEmpty(domainIds)) {
            return new ArrayList<>();
        }
        ArrayList<DomainDto> domainDtos = new ArrayList<>();
        for (List<String> partition : Lists.partition(new ArrayList<>(domainIds), 999)) {
            domainDtos.addAll(convertToListDomainDto(
                    domainRepo.findAllByCategoryIdEqualsAndDomainIdIn(categoryId, partition)));
        }
        return domainDtos;
    }


    @Override
    public void checkDomainUpdate(DomainDto domain) {
        checkDomainNames(domain);
        checkDomainPath(domain.getFolderId(), domain.getCategoryId(), domain.getChineseName());
        if (!isMetrics(domain.getCategoryId())) {
            checkDomainDataType(domain.getDataType(), domain.getChineseName());
        }
    }

    @Override
    public DomainFolderDto getCategoryByFolderId(Long folderId) {
        Map<Long, DomainFolder> folderMap = new HashMap<>();
        DomainFolder toFind = null;
        for (DomainFolder folder : domainFolderRepo.findAll()) {
            folderMap.put(folder.getId(), folder);
            if (folder.getId().equals(folderId)) {
                toFind = folder;
            }
        }
        if (toFind == null) {
            return null;
        }

        while (toFind != null && toFind.getParentId() != 0) {
            toFind = folderMap.get(toFind.getParentId());
        }

        return convertToDomainFolderDto(toFind);
    }

    @Override
    public StatisticsDto getStatistics() {
        return statisticsCache.getUnchecked(1L);
    }

    @Override
    public DomainChartDto getChartData() {
        return chartCache.getUnchecked(1L);
    }

    @Override
    public void updateCache() {
        statisticsCache.refresh(1L);
        chartCache.refresh(1L);
    }

    @Override
    @Transactional
    public void updateDomainTopic(String oldName, String newName) {
        standardCodeRepo.updateByDatasetName(oldName, newName);
    }

    @Override
    public List<DomainDto> getMetricsByRequirementId(Long requirementId) {
        return convertToListDomainDto(
                domainRepo.findAllByRequirementId(requirementId));
    }

    @Override
    public List<RestApiDescriptorSimple> getAllApi() {
        RestApiExporter restApiExporter = new RestApiExporter();
        return restApiExporter.getAllApi("com.datablau.domain.management.rest.controller");
    }

    public void fillUpStatistics(List<Object[]> value, StatisticsDto result, Long typeId) {
        Long published = 0L;
        Long unpublished = 0L;

        for (Object[] row : value) {
            Object group = row[0];
            Object count = row[1];

            if (group == null) {
                continue;
            }

            if (group.equals("A")) {
                published = ((Number) count).longValue();
            } else if (group.equals("C")) {
                unpublished = ((Number) count).longValue();
            }
        }

        if (ObjectUtils.equals(LDMTypes.oDataStandard, typeId)) {
            result.setDevelopingDomain(unpublished);
            result.setPublishedDomain(published);
        } else if (ObjectUtils.equals(LDMTypes.oMetrics, typeId)) {
            result.setDevelopingMetric(unpublished);
            result.setPublishedMetric(published);
        } else if (ObjectUtils.equals(LDMTypes.oDataStandardCode, typeId)) {
            result.setDevelopingStandardCode(unpublished);
            result.setPublishedStandardCode(published);
        }
    }

    public boolean bfsDomainTree(Long id, DomainTreeNodeDto node) {
        if (node.getFoldId().equals(id)) {
            return true;
        }

        if (node.getNodes() != null) {
            for (DomainTreeNodeDto child : node.getNodes()) {
                boolean res = bfsDomainTree(id, child);
                if (res) {
                    return true;
                }
            }
        }

        return false;
    }

    public void importNamingStandsByCategory(List<NamingStandardDto> namingStandards,
                                              String currentUser, String category) {
        if (namingStandards == null || namingStandards.isEmpty()) {
            return;
        }

        logger.debug("totally " + namingStandards.size() + " to be imported...");
        List<String> chNames = new LinkedList<>();
        Map<String, NamingStandard> namingStandardMap = new HashMap<>();
        Map<String, NamingStandard> savedNamingStandardMap = new HashMap<>();

        for (NamingStandardDto namingStandardDto : namingStandards) {
            NamingStandard namingStandard = convertToNamingStandard(namingStandardDto);

            if (chNames.contains(namingStandard.getChineseName())) {
                continue;
            }
            chNames.add(namingStandard.getChineseName());
            namingStandard.setTimestamp(System.currentTimeMillis());
            namingStandard.setSubmitter(currentUser);
            namingStandardMap.put(namingStandard.getChineseName(), namingStandard);
        }

        List<NamingStandard> existsNs = new LinkedList<>();
        List<List<String>> namesList = Lists.partition(chNames, 999);
        for (List<String> names : namesList) {
            if (StringUtils.equals(category, "Default")) {
                existsNs.addAll(namingStandardRepo
                        .findNamingStandardByChineseNameInAndCategoryIsNullOrCategory(names, ""));
            } else {
                existsNs.addAll(namingStandardRepo
                        .findNamingStandardByChineseNameInAndCategoryEquals(names, category));
            }
        }

        List<NamingStandard> toBeUpdated = new LinkedList<>();
        List<NamingStandard> toBeAdded = new LinkedList<>();

        for (NamingStandard ns : existsNs) {
            NamingStandard updated = namingStandardMap.get(ns.getChineseName());
            if (updated == null) {
                continue;
            }
            updated.setNsId(ns.getNsId());
            toBeUpdated.add(updated);
            namingStandardMap.remove(ns.getChineseName());
            savedNamingStandardMap.put(ns.getChineseName(), ns);
        }

        toBeAdded.addAll(namingStandardMap.values());

        List<EditHistoryEntity> histories = new LinkedList<>();
        if (!toBeUpdated.isEmpty()) {
            for (NamingStandard ns : toBeUpdated) {
                EditHistoryEntity history = buildHistory(
                        savedNamingStandardMap.get(ns.getChineseName()), ns, currentUser);
                if (history != null) {
                    histories.add(history);
                }
            }

            List<List<NamingStandard>> nsLists = Lists.partition(toBeUpdated, 999);
            for (List<NamingStandard> nsList : nsLists) {
                namingStandardRepo.saveAll(nsList);
            }

            logger.info("total updated " + toBeUpdated.size() + " naming standards");
        }

        Map<String, Long> nsIdMap = new HashMap<>();
        if (!toBeAdded.isEmpty()) {
            List<List<NamingStandard>> nsLists = Lists.partition(toBeAdded, 999);
            for (List<NamingStandard> nsList : nsLists) {
                for (NamingStandard ns : namingStandardRepo.saveAll(nsList)) {
                    nsIdMap.put(ns.getChineseName(), ns.getNsId());
                }
            }

            logger.info("total added " + toBeAdded.size() + " naming standards");

//            for (NamingStandard ns : toBeAdded) {
//                ns.setNsId(nsIdMap.get(ns.getChineseName()));
//                if (buildHistory(EMPTY_NS, ns, currentUser) != null) {
//                    histories.add(buildHistory(EMPTY_NS, ns, currentUser));
//                }
//            }
        }

        if (!histories.isEmpty()) {
            for (List<EditHistoryEntity> partition : Lists.partition(histories, 999)) {
                editHistoryRepo.saveAll(partition);
            }
        }
    }

    public void checkCodeCategory(Long codeCategoryId, Long targetCategoryId) {
        if (ObjectUtils.notEqual(codeCategoryId, targetCategoryId)) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeCategoryWrong"));
        }
    }

    public Long makeSureSubFolderExists(List<String> current, DomainTreeNodeDto node) {
        String currentFolder = current.remove(0);

        if (node.getNodes() != null) {
            for (DomainTreeNodeDto childNode : node.getNodes()) {
                if (childNode.getName().equals(currentFolder)) {
                    if (current.isEmpty()) {
                        return childNode.getFoldId();
                    } else {
                        return makeSureSubFolderExists(current, childNode);
                    }
                }
            }
        }

        Optional<DomainFolder> parentOptional = domainFolderRepo.findById(node.getFoldId());
        DomainFolder folder = new DomainFolder();
        folder.setName(currentFolder);

        if (parentOptional.isPresent()) {
            folder.setParentId(parentOptional.get().getId());
            //保存可以生成ID
            folder = domainFolderRepo.save(folder);
            folder.setPath(parentOptional.get().getPath() + "/" + folder.getId() + "/");
            //将 id保存到路径里面
            folder = domainFolderRepo.save(folder);
        }
        if (current.isEmpty()) {
            return folder.getId();
        }
        return createAllSubFolders(current, folder.getId(), folder.getPath());
    }

    public Long createAllSubFolders(List<String> current, Long currentFolderId, String parentPath) {
        String currentFolder = current.remove(0);
        DomainFolder folder = new DomainFolder();
        folder.setName(currentFolder);
        folder.setParentId(currentFolderId);
        folder = domainFolderRepo.save(folder);
        //将 id保存到路径里面
        folder.setPath(parentPath + folder.getId() + "/");
        folder = domainFolderRepo.save(folder);
        if (current.isEmpty()) {
            return folder.getId();
        } else {
            return createAllSubFolders(current, folder.getId(), folder.getPath());
        }
    }

    public void checkBaseNamingStandard(BaseNamingStandard namingStandard) {
        if (Strings.isNullOrEmpty(namingStandard.getAbbreviation())) {
            throw new InvalidArgumentException(
                    msgService.getMessage("abbrOfNamingStandardRequired"));
        }

        if (Strings.isNullOrEmpty(namingStandard.getChineseName())) {
            throw new InvalidArgumentException(
                    msgService.getMessage("chNameOfNamingStandardRequired"));
        }
    }

    public void checkNamingStandard(PrivateNamingStandard namingStandard) {
        if (Strings.isNullOrEmpty(namingStandard.getOwner())) {
            throw new InvalidArgumentException(
                    msgService.getMessage("ownerOfPrivateNamingStandardsRequired"));
        }

        checkBaseNamingStandard(namingStandard);
    }

    public PageResult<DomainDto> generalDomainQuery(DomainQueryDto queryDto, boolean page) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date initDate = null;
        try {
            initDate = sdf.parse("1900-01-01");
        } catch (ParseException e) {
            throw new AndorjRuntimeException(e.getMessage());
        }

        String base_sql = "select d from Domain d ";
        if (page) {
            base_sql = "select new Domain(d.domainId, d.domainCode, d.chineseName, d.englishName, d.abbreviation, d.folderId, d.categoryId, "
                    + " d.state, d.descriptionDepartment, d.firstPublish, d.lastModification, d.measureUnit, d.submitter, d.businessOwner, "
                    + "d.createTime, d.metricType, d.requirementId, d.description, d.rangeType, d.dataType, d.dataScale, d.dataPrecision, "
                    + "d.dataFormat, d.ownerOrg, d.techOwner, d.expireDate, d.takeEffectDate, d.relationDomain, d.additionalProperties, d.referenceCode, d.notNull,d.version) from Domain d left join DomainExt e on d.domainId = e.dId ";
        }
        String data_sql = base_sql + " inner join DomainFolder f on d.folderId = f.id ";
        String count_sql = "select count(*) from Domain d left join DomainExt e on d.domainId = e.dId inner join DomainFolder f on d.folderId = f.id  ";

        int idx = 1;
        Map<Integer, Object> parameters = new HashMap<>();

        String whereStmt = " where 1 = 1 ";

        // 增加标签筛选条件
        Set<String> pkIds = new HashSet<>();
        if (queryDto.getTagIds() != null && queryDto.getTagIds().size() > 0) {
            //CategoryId =2  是指标；  不填或者1 是数据标准
            if (queryDto.getCategoryId().equals(2L)) {
                pkIds = tagService.getItemIdsByTypeIdsAndTagIds(Collections.singletonList(LDMTypes.oMetrics), queryDto.getTagIds());
            } else {
                pkIds = tagService.getItemIdsByTypeIdsAndTagIds(Collections.singletonList(LDMTypes.oDataStandard), queryDto.getTagIds());
            }
            StringBuilder tagSql = new StringBuilder(" and ( ");
            for (List<String> partition : Lists.partition(new ArrayList<>(pkIds), 999)) {
                tagSql.append(" ( d.domainId in ?").append(idx).append(")  or ");
                parameters.put(idx++, partition);
            }
            tagSql.append(" (1=2) )");
            whereStmt += tagSql.toString();
        }

        // 基础标准(1L)和领域标准(>4L)支持通过用户自定义属性查询, 依赖于 ElasticSearch
        if ((queryDto.getCategoryId() == 1L || queryDto.getCategoryId() > 6L)
                && !Strings.isNullOrEmpty(queryDto.getUdpKey())
                && !Strings.isNullOrEmpty(queryDto.getUdpValue())
                && domainDataSynchronizer.checkDDCEnable()) {

            List<String> getIdFromEs = domainDataSynchronizer.getDomainIdByUdpFromEs(
                    getDDCIndexName(LDMTypes.oDataStandard),
                    "udp_" + queryDto.getUdpKey(),
                    queryDto.getUdpValue()
            );
            StringBuilder udpSql = new StringBuilder(" and ( ");
            for (List<String> partition : Lists.partition(getIdFromEs, 999)) {
                udpSql.append(" ( d.domainId in ?").append(idx).append(")  or ");
                parameters.put(idx++, partition);
            }
            udpSql.append(" (1=2) )");
            whereStmt += udpSql.toString();
        }

        // 指标管理界面 搜索框一个关键词命中这两列，要求前台这两个参数满足同时为空或者同时不为空，并且值一样
        if (!StringUtils.isEmpty(queryDto.getChineseName()) && !StringUtils.isEmpty(queryDto.getDomainCode())
                && queryDto.getChineseName().equals(queryDto.getDomainCode())) {
            String name = "%" + queryDto.getChineseName().trim().toLowerCase() + "%";
            whereStmt += " and ( lower(d.chineseName) like ?" + idx;
            parameters.put(idx++, name);

            String code = "%" + queryDto.getDomainCode().trim().toLowerCase() + "%";
            whereStmt += " or lower(d.domainCode) like ?" + idx + " )";
            parameters.put(idx++, code);
        } else {
            //标准数据元搜索，支持（中文名称、英文名称、参考数据、业务定义、业务规则、同义词、关联旧标准、关联术语）支持模糊搜索
            if (!StringUtils.isEmpty(queryDto.getChineseName())) {
                String name = "%" + queryDto.getChineseName().trim().toLowerCase() + "%";
                String keyName = queryDto.getChineseName().trim().toLowerCase();

//                whereStmt += " and lower(d.chineseName) like ?" + idx;
//                parameters.put(idx++, name);
                whereStmt += "and ( lower(d.chineseName) = ?" + idx;
                parameters.put(idx++, keyName);
                whereStmt += " or lower(d.chineseName) like ?" + idx;
                parameters.put(idx++, name);
                whereStmt += " or lower(d.englishName) = ?" + idx;
                parameters.put(idx++, keyName);
                whereStmt += " or lower(d.englishName) like ?" + idx;
                parameters.put(idx++, name);
                whereStmt += " or lower(d.referenceCode) = ?" + idx;
                parameters.put(idx++, keyName);
                whereStmt += " or lower(d.referenceCode) like ?" + idx;
                parameters.put(idx++, name);
                whereStmt += " or lower(d.description) = ?" + idx;
                parameters.put(idx++, keyName);
                whereStmt += " or lower(d.description) like ?" + idx;
                parameters.put(idx++, name);
                whereStmt += " or lower(d.businessRule) = ?" + idx;
                parameters.put(idx++, keyName);
                whereStmt += " or lower(d.businessRule) like ?" + idx;
                parameters.put(idx++, name);
                whereStmt += " or lower(d.synonym) = ?" + idx;
                parameters.put(idx++, keyName);
                whereStmt += " or lower(d.synonym) like ?" + idx;
                parameters.put(idx++, name);
//                whereStmt += " or lower(d.relationDomain) in ?" + idx;
//                parameters.put(idx++, Arrays.asList(keyName));
//                whereStmt += " or lower(d.relationDomain) like ?" + idx;
//                parameters.put(idx++, name);
                whereStmt += " or lower(e.referenceTerm) = ?" + idx;
                parameters.put(idx++, keyName);
                whereStmt += " or lower(e.referenceTerm) like ?" + idx + " )";
                parameters.put(idx++, name);

            }
            if (!StringUtils.isEmpty(queryDto.getDomainCode())) {
                String code = "%" + queryDto.getDomainCode().trim().toLowerCase() + "%";

                whereStmt += " and lower(d.domainCode) like ?" + idx;
                parameters.put(idx++, code);
            }
        }
        //指标筛选
        if (!Strings.isNullOrEmpty(queryDto.getMetricsType())) {
            whereStmt += " and d.metricType = ?" + idx;
            parameters.put(idx++, MetricType.valueOf(queryDto.getMetricsType()));
        }
        if (!Strings.isNullOrEmpty(queryDto.getKeyword())) {
            String keyword = "%" + queryDto.getKeyword().trim().toLowerCase() + "%";

            whereStmt += " and (lower(d.chineseName) like ?" + idx;
            parameters.put(idx++, keyword);

            whereStmt += " or lower(d.domainCode) like ?" + idx;
            parameters.put(idx++, keyword);

            whereStmt += " or lower(d.englishName) like ?" + idx + ")";
            parameters.put(idx++, keyword);
        }

        if (!StringUtils.isEmpty(queryDto.getOwnerOrg())) {
            whereStmt += " and d.ownerOrg = ?" + idx;
            parameters.put(idx++, queryDto.getOwnerOrg());
        }
        if (!StringUtils.isEmpty(queryDto.getDescriptionDepartment())) {
            whereStmt += " and d.descriptionDepartment = ?" + idx;
            parameters.put(idx++, queryDto.getDescriptionDepartment());
        }
        if (queryDto.getFolderId() != null && domainFolderRepo.existsById(queryDto.getFolderId())) {
            DomainFolder domainFolder = domainFolderRepo.findById(queryDto.getFolderId()).get();
            whereStmt += " and f.path like ?" + idx;
            parameters.put(idx++, domainFolder.getPath() + "%");
        }
        if (!StringUtils.isEmpty(queryDto.getSubmitter())) {
            whereStmt += " and d.submitter = ?" + idx;
            parameters.put(idx++, queryDto.getSubmitter());
        }
        if (queryDto.getCategoryId() != null) {
            whereStmt += " and d.categoryId = ?" + idx;
            parameters.put(idx++, queryDto.getCategoryId());
        } else {
            //查询领域标准
            if (queryDto.getOnlyFiledDomain()) {
                //当前登录用户必须对该领域标准有权限才能看见
                List<UserAccessibleCategoryDto> accessibleCategoryDtos =
                        domainCategoryPermissionService
                                .getUserAccessibleCategories(queryDto.getCurrentUser(), false);
                List<Long> categoryIds = accessibleCategoryDtos
                        .stream()
                        .map(UserAccessibleCategoryDto::getCategory)
                        .map(DomainFolderDto::getId)
                        .collect(Collectors.toList());
                whereStmt += " and d.categoryId > 5 and d.categoryId in ?" + idx;
                parameters.put(idx++, categoryIds);
            }
            //不查询领域标准
            if (queryDto.getExceptFiledDomain()) {
                whereStmt += " and d.categoryId in ?" + idx;
                parameters.put(idx++, Lists.newArrayList(DomainService.DOMAIN_CATEGORY_ID,
                        DomainService.INDEX_CATEGORY_ID, 3L, DomainService.REALM_CATEGORY_ID));
            }
        }

        if(queryDto instanceof DomainQueryExtDto && ((DomainQueryExtDto) queryDto).getNotEqState() != null) {
            whereStmt += " and d.state != ?" + idx;
            parameters.put(idx++, ((DomainQueryExtDto) queryDto).getNotEqState());
        }
        //审核中的标准和待审核的只有创建人可以看
        if ((DomainState.C.equals(queryDto.getDomainState())
                || DomainState.D.equals(queryDto.getDomainState()))
                && !viewAllDomain(queryDto.getCategoryId())) {
            whereStmt += " and d.submitter = ?" + idx;
            parameters.put(idx++, queryDto.getCurrentUser());
        }
        if (queryDto.getFirstPublishStart() != null || queryDto.getFirstPublishEnd() != null) {
            whereStmt += " and d.firstPublish between ?" + idx + " and ?" + (idx + 1);
            parameters.put(idx++, queryDto.getFirstPublishStart() == null ? initDate : queryDto.getFirstPublishStart());
            parameters.put(idx++, queryDto.getFirstPublishEnd() == null ? new Date() : queryDto.getFirstPublishEnd());
        }
        //已发布和已废弃的标准所有人都可以看，审核中和待审核的标准只有创建人可以看
        if (queryDto.getDomainState() == null) {
            if (!viewAllDomain(queryDto.getCategoryId())) {
                whereStmt += " and ((d.state = 'A' or d.state = 'X') or ((d.state = 'C' or d.state = 'D') and d.submitter = ?" + idx + ")) ";
                parameters.put(idx++, queryDto.getCurrentUser());
            }
        } else {
            whereStmt += " and d.state = ?" + idx;
            parameters.put(idx++, queryDto.getDomainState());
        }
        //数量sql，不加排序
        String totalSql = count_sql + whereStmt;
        //排序
        whereStmt += " order by ";
        // 保存排序参数起始索引
        int sortParamStartIdx = idx;
        //标准数据元搜索结果排序，精确匹配和模糊匹配体现。
        if (!StringUtils.isEmpty(queryDto.getChineseName())
                && !queryDto.getChineseName().equals(queryDto.getDomainCode())) {
            String name = "%" + queryDto.getChineseName().trim().toLowerCase() + "%";
            String keyName = queryDto.getChineseName().trim().toLowerCase();
            whereStmt += " case when lower(d.chineseName) = '" + keyName + "' then 1";
//            parameters.put(sortParamStartIdx++, keyName);
            whereStmt += " when lower(d.englishName) = '" + keyName + "' then 1";
//            parameters.put(sortParamStartIdx++, keyName);
            whereStmt += " when lower(d.referenceCode) = '" + keyName + "' then 1";
//            parameters.put(sortParamStartIdx++, keyName);
            whereStmt += " when lower(d.description) = '" + keyName + "' then 1";
//            parameters.put(sortParamStartIdx++, keyName);
            whereStmt += " when lower(d.businessRule) = '" + keyName + "' then 1";
//            parameters.put(sortParamStartIdx++, keyName);
            whereStmt += " when lower(d.synonym) = '" + keyName + "' then 1";
//            parameters.put(sortParamStartIdx++, keyName);
//            whereStmt += " when lower(d.relationDomain) in ?" + idx + " then 1";
//            parameters.put(idx++, Arrays.asList(keyName));
            whereStmt += " when lower(e.referenceTerm) = '" + keyName + "' then 1";
//            parameters.put(sortParamStartIdx++, keyName);
            whereStmt += " when lower(d.chineseName) like '" + name + "' then 2";
//            parameters.put(sortParamStartIdx++, name);
            whereStmt += " when lower(d.englishName) like '" + name + "' then 2";
//            parameters.put(sortParamStartIdx++, name);
            whereStmt += " when lower(d.referenceCode) like '" + name + "' then 2";
//            parameters.put(sortParamStartIdx++, name);
            whereStmt += " when lower(d.description) like '" + name + "' then 2";
//            parameters.put(sortParamStartIdx++, name);
            whereStmt += " when lower(d.businessRule) like '" + name + "' then 2";
//            parameters.put(sortParamStartIdx++, name);
            whereStmt += " when lower(d.synonym) like '" + name + "' then 2";
//            parameters.put(sortParamStartIdx++, name);
//            whereStmt += " when lower(d.relationDomain) like ? " + idx + " then 2";
//            parameters.put(idx++, name);
            whereStmt += " when lower(e.referenceTerm) like '" + name + "' then 2";
//            parameters.put(sortParamStartIdx++, name);
            whereStmt += " else 3 end , d.chineseName, d.englishName, d.referenceCode, d.description, d.businessRule, d.synonym, d.relationDomain, e.referenceTerm";

        } else {
            if (!CollectionUtils.isEmpty(queryDto.getOrderColumn())
                    && !CollectionUtils.isEmpty(queryDto.getAscOrder())) {
                List<String> gbkOrderColumn = Lists.newArrayList("chineseName", "domainCode");
                List<String> orderColumns = new ArrayList<>();
                for (int i = 0; i < queryDto.getOrderColumn().size(); i++) {
                    String order = queryDto.getAscOrder().get(i) ? "asc" : "desc";
                    String column = queryDto.getOrderColumn().get(i);
                    if (gbkOrderColumn.contains(column)) {
                        column = "convert_gbk(d." + column + ")";
                    } else {
                        column = "d." + column;
                    }
                    orderColumns.add(column + " " + order);
                }
                whereStmt += String.join(", ", orderColumns);
            } else {
                //根据domainId排序非常影响性能，这里注释掉，默认用最近修改时间，我们需要保证创建时间和最近修改时间都不一样
                whereStmt += " d.lastModification desc";
            }
        }


        Long totalCnt = 0L;
        List<Domain> resultList;

        EntityManager em = entityManagerFactory.createEntityManager();
        try {
            Query q = em.createQuery(data_sql + whereStmt);
            for (int key : parameters.keySet()) {
                q.setParameter(key, parameters.get(key));

            }
            if (page) {
                q.setFirstResult((queryDto.getCurrentPage() - 1) * queryDto.getPageSize());
                q.setMaxResults(queryDto.getPageSize());
                resultList = q.getResultList();
                for (Domain domain : resultList) {
                    em.detach(domain);
                }
                q = em.createQuery(totalSql);
                for (int key : parameters.keySet()) {
                    q.setParameter(key, parameters.get(key));
                }
                totalCnt = (Long) q.getSingleResult();
            } else {
                resultList = q.getResultList();
                for (Domain domain : resultList) {
                    em.detach(domain);
                }
            }

        } catch (Exception e) {
            logger.warn("queryError:{}", e);
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            em.close();
        }

        PageResult<DomainDto> result = new PageResult<>();
        result.setCurrentPage(queryDto.getCurrentPage());
        result.setPageSize(queryDto.getPageSize());
        result.setTotalItems(totalCnt);
        result.setContentDirectly(convertToListDomainDto(resultList));

        return result;
    }

    public boolean viewAllDomain(Long categoryId) {
        //如果是数据标准管理员可以看所有标准
        boolean isDomainAdminRole = RemoteServiceGetter.getUserService()
                .checkIfUserIsGroup(AuthTools.currentUsername(), msgService.getMessage("role.domainAdmin"));
        //经讨论，数据标准管理员不可以看到所有标准
        if (AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER)) {
            return true;
        }
        if (categoryId == null) {
            return false;
        }
        if (categoryId == 1 && AuthTools.hasAnyRole("DATA_STANDARD_VIEW_ALL")) {
            return true;
        }
        if (categoryId == 2 && AuthTools.hasAnyRole("DATA_STANDARD_DIM_VIEW_ALL")) {
            return true;
        }
        return false;
    }

    public String findDomainFolderPath(Long folderId) {
        String path = "";
        if (folderId == null) {
            return path;
        }

        DomainTreeNodeDto root = getRoot();
        Map<Long, DomainTreeNodeDto> treeNodeMap = new HashMap<>();
        convertDomainTreeNodeToMap(treeNodeMap, root);

        DomainTreeNodeDto node = treeNodeMap.get(folderId);
        while (node != null && node.getFoldId() != 0) {
            path = "/" + node.getFoldId() + path;
            node = treeNodeMap.get(node.getParentId());
        }
        return path;
    }

    public void convertDomainTreeNodeToMap(Map<Long, DomainTreeNodeDto> treeNodeDtoMap, DomainTreeNodeDto root) {
        if (root == null) {
            return;
        }
        treeNodeDtoMap.put(root.getFoldId(), root);
        if (root.getNodes() != null) {
            for (DomainTreeNodeDto subNode : root.getNodes()) {
                convertDomainTreeNodeToMap(treeNodeDtoMap, subNode);
            }
        }
    }

    public DomainVersion buildDomainVersion(Domain domain) {
        DomainVersion dv = new DomainVersion();
        dv.initByDomain(domain);
        // 关联数据保存
        if (isMetrics(domain.getCategoryId())) {
            // 修饰词
            List<ModifierDto> modifierRefs = modifierTypeService.getModifierRef(domain.getDomainId(), ModifierTypeCategory.BASE);
            dv.setModifierRefs(modifierRefs);
            // 时间周期
            List<ModifierDto> timeModifierRefs = modifierTypeService.getModifierRef(domain.getDomainId(), ModifierTypeCategory.TIME_PERIOD);
            dv.setTimeModifierRefs(timeModifierRefs);
        }
        return dv;
    }

    public void findAllSubFolders(List<Long> folderIds, DomainTreeNodeDto currentNode) {
        folderIds.add(currentNode.getFoldId());

        if (!CollectionUtils.isEmpty(currentNode.getNodes())) {
            for (DomainTreeNodeDto node : currentNode.getNodes()) {
                findAllSubFolders(folderIds, node);
            }
        }
    }

    /**
     * Only simple type properties will be copied, subNodes and domains won't be copied
     */
    public DomainFolderDto convertToDomainFolderDto(DomainFolder folder) {
        DomainFolderDto res = new DomainFolderDto();

        res.setName(folder.getName());
        res.setDescription(folder.getDescription());
        res.setId(folder.getId());
        res.setParentId(folder.getParentId());
        res.setType(folder.getType());
        res.setDeletable(folder.getDeletable() == null ? true : folder.getDeletable());
        res.setCatalog(folder.getCatalog());
        res.setOrder(folder.getOrder());

        return res;
    }

    public DomainTreeNodeDto findNode(final Long targetNodeId, final DomainTreeNodeDto node) {
        if (node == null) {
            return null;
        }

        if (node.getFoldId().equals(targetNodeId)) {
            return node;
        }

        if (CollectionUtils.isEmpty(node.getNodes())) {
            return null;
        } else {
            for (DomainTreeNodeDto subNode : node.getNodes()) {
                DomainTreeNodeDto foundNode = findNode(targetNodeId, subNode);
                if (foundNode != null) {
                    return foundNode;
                }
            }
            return null;
        }
    }

    /**
     * Please be noticed, this method will not return full body of domains but only a few mandatory fields
     */
    public List<Domain> fastLoadDomains(DomainState state, Long categoryId, String currentUser) {
        if (state == null) {
            return domainRepo.findAllSimpleDomains();
        } else if (state.equals(DomainState.A)) {
            return domainRepo.findSimpleDomainsByStateEquals(state);
        } else {
            Collection<DomainState> states = expandedStateMap.get(state);

            List<String> dsStr = new ArrayList<>(states.size());
            for (DomainState s : states) {
                dsStr.add(s.name());
            }

            List<Domain> res = null;
            if (dsStr.contains("D")) {
                res = domainAssignmentRepo.findAllDomains(dsStr, categoryId);
            } else {
                res = domainAssignmentRepo.findSimpleDomains(currentUser, dsStr, categoryId);
            }

            return res;
        }
    }

    public void saveOldVersionOfStandardCode(StandardCode oldStandardCode) {
        StandardCodeVersion ver = new StandardCodeVersion(oldStandardCode);
        ver.setVersion(ver.getVersion() + 1);
        standardCodeVerRepo.save(ver);
    }

    public List<StandardCodeDto> convertToListStandardCodeDtoFromVersions(
            Collection<StandardCodeVersion> versions) {
        List<StandardCodeDto> res = new ArrayList<>();

        for (StandardCodeVersion version : versions) {
            res.add(convertToStandardCodeDto(version));
        }

        return res;
    }

    public List<StandardCodeDto> convertToPrivateListStandardCodeDto(
            Collection<PrivateStandardCode> codes) {
        List<StandardCodeDto> res = new ArrayList<>();

        for (PrivateStandardCode code : codes) {
            res.add(convertToStandardCodeDto(code));
        }

        return res;
    }

    public StandardCodeDto convertToStandardCodeDto(StandardCodeVersion version) {
        StandardCodeDto res = new StandardCodeDto();

        res.setRealCode(version.getCode());
        res.setVersion(version.getVersion());
        res.setValues(version.getValues());
        res.setState(DomainState.A);
        res.setLastModification(version.getLastModification());
        res.setName(version.getName());
        res.setDatasetName(version.getDatasetName());
        res.setEnglishName(version.getEnName());
        res.setId(version.getId());
        res.setSubmitter(version.getSubmitter());
        res.setCode(version.getCode());
        res.setDatasetName(version.getDatasetName());

        return res;
    }

    public StandardCodeDto convertToStandardCodeDto(PrivateStandardCode code) {
        StandardCodeDto res = new StandardCodeDto();

        res.setRealCode(code.getCode());
        res.setDatasetName(code.getDatasetName());
        res.setCode(code.getCode());
        res.setOwner(code.getOwner());
        res.setEnglishName(code.getEnName());
        res.setName(code.getName());
        res.setLastModification(code.getLastModification());
        res.setValues(code.getValues());

        return res;
    }

    public List<EditHistoryEntity> compareCodeAndSaveHistory(
            Collection<Pair<StandardCode, StandardCode>> codePairs, String currentUser) {
        List<EditHistoryEntity> histories = new ArrayList<>(codePairs.size());

        for (Pair<StandardCode, StandardCode> codePair : codePairs) {
            StandardCode oldCode = codePair.getFirst();
            StandardCode newCode = codePair.getSecond();

            Map<String, com.andorj.model.common.data.Pair<String, String>> resultMap = GeneralUtility
                    .compare(StandardCode.class, oldCode, newCode);
            List<String> result = new LinkedList<>();
            for (Map.Entry<String, com.andorj.model.common.data.Pair<String, String>> entry : resultMap.entrySet()) {
                result.add(msgService.getMessage("changeDataFromTo", entry.getKey(), entry.getValue().getFirst(), entry
                        .getValue().getSecond()));
            }

            result.addAll(compareCodeValue(oldCode, newCode));

            if (result.isEmpty()) {
                continue;
            }

            EditHistoryEntity history = new EditHistoryEntity();
            history.setTimestamp(new Date());
            history.setOperator(currentUser);
            history.setItemId(oldCode.getCode());
            history.setHistoryType(EditHistoryEntity.TYPE_STD_CODE);
            history.setVersion(oldCode.getVersion());
            history.setChanges(String.join("\n", result));
            histories.add(history);
        }

        return histories;
    }

    public List<String> compareCodeValue(StandardCode oldCode, StandardCode newCode) {

        List<String> result = new ArrayList<>(
                Math.max(oldCode.getValues().size(), newCode.getValues().size()));

        List<StandardCodeValueDto> oldValues = oldCode.getValues();
        List<StandardCodeValueDto> newValues = newCode.getValues();

        Map<String, StandardCodeValueDto> oldValueMap = oldValues.stream()
                .collect(Collectors.toMap(StandardCodeValueDto::getValue, Function
                        .identity()));
        Map<String, StandardCodeValueDto> newValueMap = newValues.stream()
                .collect(Collectors.toMap(StandardCodeValueDto::getValue, Function.identity()));

        Set<String> intersectKeys = Sets.intersection(oldValueMap.keySet(), newValueMap.keySet());
        Set<String> newKeys = Sets.difference(newValueMap.keySet(), oldValueMap.keySet());
        Set<String> removeKeys = Sets.difference(oldValueMap.keySet(), newValueMap.keySet());

        for (String key : intersectKeys) {
            StandardCodeValueDto oldValue = oldValueMap.get(key);
            StandardCodeValueDto newValue = newValueMap.get(key);

            List<String> changes = new ArrayList<>();
            for (Map.Entry<String, com.andorj.model.common.data.Pair<String, String>> entry : GeneralUtility
                    .compare(StandardCodeValueDto.class, oldValue, newValue).entrySet()) {
                changes.add(msgService.getMessage("changeDataFromTo", entry.getKey(),
                        (entry.getValue().getFirst() == null ? "null" : entry.getValue().getFirst()),
                        (entry.getValue().getSecond() == null ? "null" : entry.getValue().getSecond())));
            }

            if (!changes.isEmpty()) {
                result.add(msgService.getMessage("codeValueFromTo", key) + String.join("\n", changes));
            }
        }

        for (String key : newKeys) {
            StandardCodeValueDto newValue = newValueMap.get(key);
            result.add(msgService.getMessage("addData", newValue.toString()));
        }

        for (String key : removeKeys) {
            StandardCodeValueDto oldValue = oldValueMap.get(key);
            result.add(msgService.getMessage("delData", oldValue.toString()));
        }

        return result;
    }

    public EditHistoryEntity buildHistory(NamingStandard oldNs, NamingStandard newNs,
                                           String currentUser) {
        Map<String, com.andorj.model.common.data.Pair<String, String>> changes = GeneralUtility
                .compare(NamingStandard.class, oldNs, newNs);

        if (changes.isEmpty()) {
            return null;
        }

        List<String> changeDetails = new ArrayList<>(changes.size());
        for (Map.Entry<String, com.andorj.model.common.data.Pair<String, String>> change : changes.entrySet()) {
            changeDetails.add(
                    msgService.getMessage("changeDataFromTo", change.getKey(),
                            change.getValue().getFirst(), change.getValue().getSecond()));
        }

        String details = String.join("\n", changeDetails);
        EditHistoryEntity history = new EditHistoryEntity();
        history.setTimestamp(new Date());
        history.setOperator(currentUser);
        history.setChanges(details);
        history.setHistoryType(EditHistoryEntity.TYPE_NS);
        history.setItemId(newNs.getNsId().toString());

        return history;
    }

    public List<PrivateNamingStandard> convertToListPrivateNamingStandards(
            Collection<NamingStandardDto> namingStandards) {
        List<PrivateNamingStandard> res = new ArrayList<>();

        if (!CollectionUtils.isEmpty(namingStandards)) {
            for (NamingStandardDto namingStandard : namingStandards) {
                res.add(convertToPrivateNamingStandard(namingStandard));
            }
        }

        return res;
    }

    public PrivateNamingStandard convertToPrivateNamingStandard(NamingStandardDto namingStandard) {
        PrivateNamingStandard res = new PrivateNamingStandard();

        res.setCategory(namingStandard.getCategory());
        res.setOwner(namingStandard.getSubmitter());
        res.setAbbreviation(namingStandard.getAbbreviation());
        res.setChineseName(namingStandard.getChineseName());
        res.setEnglishName(namingStandard.getEnglishName());
        res.setNsId(namingStandard.getNsId());
        res.setTimestamp(namingStandard.getLastModification());

        return res;
    }

    public List<NamingStandardDto> convertToListNamingStandard(
            Collection<? extends BaseNamingStandard> namingStandards) {
        List<NamingStandardDto> res = new ArrayList<>();

        if (CollectionUtils.isEmpty(namingStandards)) {
            return res;
        }

        for (BaseNamingStandard namingStandard : namingStandards) {
            if (namingStandard instanceof PrivateNamingStandard) {
                res.add(convertToNamingStandardDto((PrivateNamingStandard) namingStandard));
            } else {
                res.add(convertToNamingStandardDto((NamingStandard) namingStandard));
            }
        }

        return res;
    }

    public NamingStandard convertToNamingStandard(NamingStandardDto namingStandard) {
        NamingStandard res = new NamingStandard();

        res.setAbbreviation(namingStandard.getAbbreviation());
        res.setCategory(namingStandard.getCategory());
        res.setChineseName(namingStandard.getChineseName());
        res.setSubmitter(namingStandard.getSubmitter());
        res.setNsId(namingStandard.getNsId());
        res.setEnglishName(namingStandard.getEnglishName());
        res.setTimestamp(namingStandard.getLastModification());

        return res;
    }

    public NamingStandardDto convertToNamingStandardDto(PrivateNamingStandard namingStandard) {
        NamingStandardDto res = new NamingStandardDto();

        res.setLastModification(namingStandard.getTimestamp());
        res.setSubmitter(namingStandard.getOwner());
        res.setNsId(namingStandard.getNsId());
        res.setEnglishName(namingStandard.getEnglishName());
        res.setChineseName(namingStandard.getChineseName());
        res.setCategory(namingStandard.getCategory());
        res.setAbbreviation(namingStandard.getAbbreviation());

        return res;
    }

    public NamingStandardDto convertToNamingStandardDto(NamingStandard namingStandard) {
        NamingStandardDto res = new NamingStandardDto();

        res.setAbbreviation(namingStandard.getAbbreviation());
        res.setCategory(namingStandard.getCategory());
        res.setChineseName(namingStandard.getChineseName());
        res.setEnglishName(namingStandard.getEnglishName());
        res.setLastModification(namingStandard.getTimestamp());
        res.setNsId(namingStandard.getNsId());
        res.setSubmitter(namingStandard.getSubmitter());

        return res;
    }

    public void checkNsParameters(NamingStandard namingStandard) {
        if (Strings.isNullOrEmpty(namingStandard.getChineseName())) {
            throw new InvalidArgumentException(msgService.getMessage("nsCnNameMissing"));
        }

        if (Strings.isNullOrEmpty(namingStandard.getAbbreviation())) {
            throw new InvalidArgumentException(msgService.getMessage("nsEnAbbrMissing"));
        }
    }

    public void traverseTree(final DomainFolderDto node, final String parentId,
                              final List<PrivateDomainFolder> toBeSavedCategories,
                              final List<PrivateDomain> toBeSavedDomains, final String currentUser,
                              final boolean isPrivateDomain) {

        PrivateDomainFolder category = new PrivateDomainFolder();
        category.setOwner(currentUser);
        category.setName(node.getName());
        category.setId(getUUID());
        category.setParentId(parentId);

        toBeSavedCategories.add(category);

        if (node.hasDomains()) {
            if (!isPrivateDomain) {
                checkDomainNames(node.getDomains());
            }
            for (DomainDto domain : node.getDomains()) {
                if (!ObjectUtils.equals(domain.getCategoryId(), 2L)) {
                    checkDomainDataType(domain.getDataType(), domain.getChineseName());
                }
                PrivateDomain privateDomain = convertToPrivateDomain(domain);
                privateDomain.setFolderId(category.getId());
                privateDomain.setOwner(currentUser);
                if (Strings.isNullOrEmpty(privateDomain.getDomainId())) {
                    privateDomain.setDomainId(getUUID());
                }
                toBeSavedDomains.add(privateDomain);
            }
        }

        if (node.hasSubNodes()) {
            for (DomainFolderDto child : node.getSubFolders()) {
                traverseTree(child, category.getId(), toBeSavedCategories, toBeSavedDomains,
                        currentUser, isPrivateDomain);
            }
        }
    }

    public DomainTreeNodeDto buildDomainTree(Collection<Domain> domains, Long categoryId) {
        DomainTreeNodeDto root = getRoot();
        if (categoryId == 0) {
            return root;
        }
        DomainTreeNodeDto returnRoot = shallowCloneTreeNode(root);
        Map<Long, DomainTreeNodeDto> map = new HashMap<>();
        map.put(returnRoot.getFoldId(), returnRoot);

        if (root.getNodes() != null) {
            DomainTreeNodeDto categoryNode = findNode(categoryId, root);

            if (categoryNode == null) {
                return null;
            }

            map.put(categoryNode.getFoldId(), deepCloneTreeNode(categoryNode));

            Map<Long, DomainTreeNodeDto> fullNodeMap = flattenDomainTree(
                    map.get(categoryNode.getFoldId()));

            for (Domain domain : domains) {
                Long folderId = domain.getFolderId();
                DomainTreeNodeDto folder = fullNodeMap.get(folderId);
                if (folder == null) {
                    continue;
                }

                if (fullNodeMap.containsKey(folderId)) {
                    fullNodeMap.get(folderId).addDomain(convertToSimpleDomain(domain));
                } else {
                    makeSureFullPathExists(fullNodeMap, fullNodeMap, folder);
                    fullNodeMap.get(folderId).addDomain(convertToSimpleDomain(domain));
                }
            }

            return map.get(categoryNode.getFoldId());
        } else {
            return null;
        }
    }

    public List<String> getDomainPathByFolderId(Long folderId, Long categoryId) {
        DomainTreeNodeDto domainTree = buildDomainTree(Collections.emptyList(), categoryId);
        List<String> result = new ArrayList<>();
        if (!Objects.equals(categoryId, 5L) && !Objects.equals(categoryId, 6L)) {
            result.add(domainTree.getName());
        }
        getDomainPath(domainTree, folderId, new ArrayList<>(), result);
        return result;
    }

    public void getDomainPath(DomainTreeNodeDto domainTree, Long folderId, List<String> path,
                               List<String> result) {
        if (domainTree == null) {
            return;
        }
        if (domainTree.getFoldId().equals(folderId)) {
            result.addAll(new ArrayList<>(path));
        }
        if (domainTree.getNodes() == null) {
            return;
        }
        for (DomainTreeNodeDto children : domainTree.getNodes()) {
            path.add(children.getName());
            getDomainPath(children, folderId, path, result);
            path.remove(path.size() - 1);
        }
    }

    public void makeSureFullPathExists(Map<Long, DomainTreeNodeDto> fullNodeMap,
                                        Map<Long, DomainTreeNodeDto> resNodeMap, DomainTreeNodeDto folderNode) {
        if (resNodeMap.containsKey(folderNode.getFoldId())) {
            return;
        }

        if (fullNodeMap.containsKey(folderNode.getFoldId())) {
            resNodeMap.put(folderNode.getFoldId(), shallowCloneTreeNode(folderNode));
            makeSureFullPathExists(fullNodeMap, resNodeMap,
                    fullNodeMap.get(folderNode.getParentId()));
        } else {
            return;
        }
    }

    public Map<Long, DomainTreeNodeDto> flattenDomainTree(DomainTreeNodeDto categoryNode) {
        Map<Long, DomainTreeNodeDto> res = new HashMap<>();
        res.put(categoryNode.getFoldId(), categoryNode);
        bfsDomainTree(categoryNode, res);

        return res;
    }

    public void bfsDomainTree(DomainTreeNodeDto categoryNode, Map<Long, DomainTreeNodeDto> map) {
        if (categoryNode == null) {
            return;
        }

        if (categoryNode.getNodes() == null || categoryNode.getNodes().isEmpty()) {
            return;
        }

        for (DomainTreeNodeDto node : categoryNode.getNodes()) {
            map.put(node.getFoldId(), node);
            bfsDomainTree(node, map);
        }
    }

    /**
     * Only clone primitive properties
     */
    public DomainTreeNodeDto shallowCloneTreeNode(DomainTreeNodeDto node) {
        DomainTreeNodeDto res = new DomainTreeNodeDto();
        res.setFoldId(node.getFoldId());
        res.setName(node.getName());
        res.setDescription(node.getDescription());
        res.setParentId(node.getParentId());
        res.setOrder(node.getOrder());

        return res;
    }

    /**
     * Deep clone folder node and sub folders, won't copy domains
     */
    public DomainTreeNodeDto deepCloneTreeNode(DomainTreeNodeDto node) {
        DomainTreeNodeDto res = shallowCloneTreeNode(node);

        if (!CollectionUtils.isEmpty(node.getNodes())) {
            for (DomainTreeNodeDto childNode : node.getNodes()) {
                DomainTreeNodeDto clonedChildNode = deepCloneTreeNode(childNode);
                res.addSubNode(clonedChildNode);
            }
        }

        return res;
    }

    private PrivateDomain convertToPrivateDomain(DomainDto domain) {
        PrivateDomain res = new PrivateDomain();
        res.setLastModification(new Date());
        res.setAbbreviation(domain.getAbbreviation());
        res.setAdditionalProperties(domain.getAdditionalProperties());
        res.setChineseName(domain.getChineseName());
        res.setDataPrecision(domain.getDataPrecision());
        res.setDataScale(domain.getDataScale());
        res.setDataType(domain.getDataType());
        res.setDescription(domain.getDescription());
        res.setDomainCode(domain.getDomainCode());
        res.setDomainId(domain.getDomainId());
        res.setEnglishName(domain.getEnglishName());
        res.setNotNull(domain.getNotNull());
        res.setReferenceCode(domain.getReferenceCode());

        // 补充Domain其他属性UDP
//        res.setRangeType(domain.getRangeType());            // 信息类型
//        res.setOwnerOrg(domain.getOwnerOrg());              // 技术部门
//        res.setDescriptionDepartment(domain.getDescriptionDepartment()); // 业务定义部门
//        res.setAuthCategoryId(domain.getAuthCategoryId());  // 权威系统
//        res.setRelationDomain(domain.getRelationDomain());  // 相关标准
//        res.setSynonym(domain.getSynonym());                // 同义词
//        res.setSource(domain.getSource());                  // 标准来源
//        res.setBusinessRule(domain.getBusinessRule());      // 业务规则

        return res;
    }

    public SimpleDomainDto convertToSimpleDomain(Domain domain) {
        SimpleDomainDto res = new SimpleDomainDto();

        res.setCode(domain.getDomainCode());
        res.setDescription(domain.getDescription());
        res.setEnAbbr(domain.getAbbreviation());
        res.setEnFull(domain.getEnglishName());
        res.setId(domain.getDomainId());
        res.setLastMod(domain.getLastModification());
        res.setName(domain.getChineseName());
        res.setState(domain.getState());
        res.setUpdatingId(domain.getUpdatingDomainId());

        return res;
    }

    public void createDomainAssignments(Collection<Domain> domains, String user) {
        List<DomainAssignment> assignments = new ArrayList<>(domains.size());
        for (Domain domain : domains) {
            assignments.add(createDomainAssignment(domain, false, user));
        }
        domainAssignmentRepo.saveAll(assignments);
    }

    public PageResult<EditHistory> convertToEditHistoryPageResult(Page<EditHistoryEntity> page) {
        PageResult<EditHistory> result = new PageResult<>();

        result.setCurrentPage(page.getNumber());
        result.setPageSize(page.getSize());
        result
                .setContentDirectly(convertToListEditHistory(page.get().collect(Collectors.toList())));
        result.setTotalItems(page.getTotalElements());

        return result;
    }

    public List<EditHistory> convertToListEditHistory(Collection<EditHistoryEntity> histories) {
        List<EditHistory> res = new ArrayList<>();

        for (EditHistoryEntity history : histories) {
            res.add(convertToEditHistory(history));
        }

        return res;
    }

    public EditHistory convertToEditHistory(EditHistoryEntity history) {
        EditHistory res = new EditHistory();

        res.setChanges(history.getChanges());
        res.setHistoryType(history.getHistoryType());
        res.setItemId(history.getItemId());
        res.setOperator(history.getOperator());
        res.setTimestamp(history.getTimestamp());
        res.setVersion(history.getVersion());
        return res;
    }

    public String compareDomains(Domain oldDomain, Domain newDomain) {
        Map<Long, String> oldUdps = oldDomain.getAdditionalProperties();
        Map<Long, String> newUdps = newDomain.getAdditionalProperties();
        List<DomainUdpDto> udps = udpMap.get(newDomain.getCategoryId());
        Map<Long, DomainUdpDto> udpMap = new HashMap<>();

        for (DomainUdpDto udp : udps) {
            udpMap.put(udp.getUdpId(), udp);
        }

        List<String> details = new ArrayList<>();
        Set<Long> bothHave = Sets.intersection(oldUdps.keySet(), newUdps.keySet());
        Set<Long> addProp = Sets.difference(newUdps.keySet(), oldUdps.keySet());
        Set<Long> removeProp = Sets.difference(oldUdps.keySet(), newUdps.keySet());

        for (Long propId : bothHave) {
            if (udpMap.containsKey(propId)) {
                if (ObjectUtils.notEqual(oldUdps.get(propId), newUdps.get(propId))) {
                    details.add(msgService.getMessage("changeDataFromTo",
                            udpMap.get(propId).getName(),
                            Strings.isNullOrEmpty(oldUdps.get(propId)) ? "null" : oldUdps.get(propId),
                            (Strings.isNullOrEmpty(newUdps.get(propId)) ? "null" : newUdps.get(propId))));
                }
            }
        }

        for (Long propId : addProp) {
            if (udpMap.containsKey(propId)) {
                details.add(msgService.getMessage("valueHasBeanSetTo", udpMap.get(propId).getName(),
                        Strings.isNullOrEmpty(newUdps.get(propId)) ? "null" : newUdps.get(propId)));
            }
        }

        for (Long propId : removeProp) {
            if (udpMap.containsKey(propId)) {
                details.add(msgService.getMessage("valueHasBeanSetToNull", udpMap.get(propId).getName(),
                        Strings.isNullOrEmpty(oldUdps.get(propId)) ? "null" : oldUdps.get(propId)));
            }
        }

        Map<String, com.andorj.model.common.data.Pair<String, String>> result = GeneralUtility
                .compare(Domain.class, oldDomain, newDomain);

        if (result.isEmpty()) {
            if (details.isEmpty()) {
                return msgService.getMessage("valueHasNoChange");
            } else {
                return String.join("\n", details);
            }
        } else {
            for (Map.Entry<String, com.andorj.model.common.data.Pair<String, String>> entry : result.entrySet()) {
                details.add(msgService.getMessage("changeDataFromTo", entry.getKey(),
                        entry.getValue().getFirst(), entry.getValue().getSecond()));
            }

            return String.join("\n", details);
        }
    }

    public DiscardStandardCode buildDiscardStandardCode(StandardCode code) {
        DiscardStandardCode res = new DiscardStandardCode();
        res.setCode(code.getCode());
        res.setDatasetName(code.getDatasetName());
        res.setEnName(code.getEnName());
        res.setLastModification(new Date());
        res.setName(code.getName());
        res.setState(code.getState());
        res.setSubmitter(code.getSubmitter());
        res.setValues(code.getValues());
        res.setVersion(code.getVersion());
        res.setComment(code.getComment());
        res.setCategoryId(code.getCategoryId());

        return res;
    }

    public StandardCode buildStandardCode(DiscardStandardCode code) {
        StandardCode res = new StandardCode();
        res.setCode(code.getCode());
        res.setVersion(code.getVersion());
        res.setValues(code.getValues());
        res.setSubmitter(code.getSubmitter());
        res.setState(code.getState());
        res.setName(code.getName());
        res.setLastModification(new Date());
        res.setEnName(code.getEnName());
        res.setDatasetName(code.getDatasetName());
        res.setComment(code.getComment());
        res.setCategoryId(code.getCategoryId());

        return res;
    }

    public void checkCodeBasicInfo(StandardCode code) {
        if (Strings.isNullOrEmpty(code.getCode())) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeNotNull"));
        }

        if (Strings.isNullOrEmpty(code.getName())) {
            throw new InvalidArgumentException(msgService.getMessage("standardZhNameNotNull"));
        }

        if (code.getCategoryId() == null) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeCategoryIdNull"));
        }
        if (code.getCode().contains("+")) {
            throw new InvalidArgumentException(msgService.getMessage("invalidChar"));
        }

        Set<String> codeValues = new HashSet<>();
        for (StandardCodeValueDto value : code.getValues()) {
            if (Strings.isNullOrEmpty(value.getName())) {
                throw new InvalidArgumentException(msgService
                        .getMessage("standardCodeChNameNull", code.getName(), value.toString()));
            }

            if (value.getOrder() == null) {
                throw new InvalidArgumentException(
                        msgService.getMessage("standardCodeSeqNull", code.getName(), value.getName()));
            }

            if (Strings.isNullOrEmpty(value.getValue())) {
                throw new InvalidArgumentException(msgService
                        .getMessage("standardCodeNumberNull", code.getName(), value.toString()));
            }

            if (codeValues.contains(value.getValue())) {
                throw new InvalidArgumentException(msgService
                        .getMessage("standardCodeNumberExists", code.getName(), value.getName()));
            }

            codeValues.add(value.getValue());
        }

    }

    public void saveDomainStateChangeHistory(String domainId, DomainState state,
                                              String currentUser, Long categoryId) {
        EditHistoryEntity history = new EditHistoryEntity();
        history.setOperator(currentUser);
        history.setHistoryType(EditHistoryEntity.TYPE_DOMAIN);
        history.setTimestamp(new Date());
        history.setVersion(-1);
        history.setItemId(domainId);
        String categoryName = msgService.getMessage("category.standard.data");
        if (categoryId != null && isMetrics(categoryId)) {
            categoryName = msgService.getMessage("category.index.data");
        }

        if (state.equals(DomainState.A)) {
            history.setChanges(msgService.getMessage("hasBeanMarkPublished", categoryName));
        } else if (state.equals(DomainState.X)) {
            history.setChanges(msgService.getMessage("hasBeanMarkAbandon", categoryName));
        } else {
            return;
        }

        editHistoryRepo.save(history);
    }

    public void saveDomainStateChangeHistory(String domainId, DomainState state, String message,
                                              String currentUser) {
        EditHistoryEntity history = new EditHistoryEntity();
        history.setOperator(currentUser);
        history.setHistoryType(EditHistoryEntity.TYPE_DOMAIN);
        history.setTimestamp(new Date());
        history.setVersion(-1);
        history.setItemId(domainId);
        history.setChanges(message);

        editHistoryRepo.save(history);
    }

    public Set<String> extractDomainIds(Collection<Domain> domains) {
        Set<String> result = new HashSet<>();
        for (Domain domain : domains) {
            result.add(domain.getDomainId());
        }

        return result;
    }

    public StandardCode convertToStandardCode(StandardCodeDto stdCode) {
        StandardCode res = new StandardCode();

        res.setCode(stdCode.getCode());
        res.setDatasetName(stdCode.getDatasetName());
        res.setEnName(stdCode.getEnglishName());
        res.setLastModification(new Date());
        res.setName(stdCode.getName());
        res.setState(stdCode.getState());
        res.setSubmitter(stdCode.getSubmitter());
        res.setValues(stdCode.getValues());
        res.setVersion(stdCode.getVersion());
        res.setComment(stdCode.getComment());
        res.setCategoryId(stdCode.getCategoryId());
        res.setRefStandardCode(stdCode.getRefStandardCode());
        res.setAdditionalProperties(stdCode.getAdditionalProperties());

        return res;
    }

    public PrivateStandardCode convertToPrivateStandardCode(StandardCodeDto stdCode) {
        PrivateStandardCode res = new PrivateStandardCode();

        res.setCode(stdCode.getCode());
        res.setDatasetName(stdCode.getDatasetName());
        res.setEnName(stdCode.getEnglishName());
        res.setLastModification(stdCode.getLastModification());
        res.setName(stdCode.getName());
        res.setValues(stdCode.getValues());
        res.setOwner(stdCode.getOwner());

        return res;
    }

    public StandardCodeDto convertToStandCodeDto(StandardCode stdCode) {
        StandardCodeDto res = new StandardCodeDto();

        res.setRealCode(stdCode.getCode());
        res.setCode(stdCode.getCode());
        res.setSubmitter(stdCode.getSubmitter());
        res.setDatasetName(stdCode.getDatasetName());
        res.setEnglishName(stdCode.getEnName());
        res.setName(stdCode.getName());
        res.setLastModification(stdCode.getLastModification());
        res.setState(stdCode.getState());
        res.setValues(stdCode.getValues());
        res.setVersion(stdCode.getVersion());
        res.setComment(stdCode.getComment());
        res.setCreateTime(stdCode.getCreateTime());
        res.setPublishTime(stdCode.getFirstPublish());
        res.setCategoryId(stdCode.getCategoryId());
        res.setUpdatingCode(stdCode.getUpdatingCode());
        res.setRefStandardCode(stdCode.getRefStandardCode());
        res.setRealCode(stdCode.getCode());
        res.setAdditionalProperties(stdCode.getAdditionalProperties());

        return res;
    }

    public List<StandardCodeDto> convertToListStandardCodeDto(Collection<StandardCode> stdCodes) {
        List<StandardCodeDto> res = new ArrayList<>();

        if (stdCodes == null || stdCodes.isEmpty()) {
            return res;
        }

        for (StandardCode stdCode : stdCodes) {
            res.add(convertToStandCodeDto(stdCode));
        }

        changeUpdatingCodeToOldCode(res);
        return res;
    }

    public void changeUpdatingCodeToOldCode(List<StandardCodeDto> res) {
        List<String> cods = new ArrayList<>();
        for (StandardCodeDto std : res) {
            std.setRealCode(std.getCode());
            cods.add(std.getCode());
        }

        List<StandardCode> stds = new ArrayList<>();
        if (!cods.isEmpty()) {
            for (List<String> codeList : Lists.partition(cods, 999)) {
                stds.addAll(standardCodeRepo.findByUpdatingCodeIn(codeList));
            }
        }
        Map<String, String> updatingCodeMap = new HashMap<>();
        for (StandardCode std : stds) {
            updatingCodeMap.put(std.getUpdatingCode(), std.getCode());
        }
        for (StandardCodeDto std : res) {
            std.setCode(updatingCodeMap.getOrDefault(std.getCode(), std.getCode()));
        }
    }

    public Domain cloneDomain(Domain domain, boolean copyId) {
        Domain newDomain = new Domain();
        newDomain.setState(domain.getState());
        newDomain.setChineseName(domain.getChineseName());
        newDomain.setAbbreviation(domain.getAbbreviation());
        newDomain.setVersion(domain.getVersion() == null ? 1 : domain.getVersion());
        if (copyId) {
            newDomain.setDomainId(domain.getDomainId());
        } else {
            newDomain.setDomainId(getUUID());
        }
        newDomain.setLastModification(domain.getLastModification());
        newDomain.setAdditionalProperties(domain.getAdditionalProperties());
        newDomain.setEnglishName(domain.getEnglishName());
        newDomain.setNotNull(domain.getNotNull());
        newDomain.setCategoryId(domain.getCategoryId());
        newDomain.setDataPrecision(domain.getDataPrecision());
        newDomain.setDataScale(domain.getDataScale());
        newDomain.setDataType(domain.getDataType());
        newDomain.setDescription(domain.getDescription());
        newDomain.setDomainCode(domain.getDomainCode());
        newDomain.setReferenceCode(domain.getReferenceCode());
        newDomain.setFolderId(domain.getFolderId());
        newDomain.setComment(domain.getComment());
        newDomain.setSubmitter(domain.getSubmitter());
        newDomain.setFirstPublish(domain.getFirstPublish());
        newDomain.setRefDomainId(domain.getRefDomainId());
        newDomain.setRefDomainVer(domain.getRefDomainVer());
        newDomain.setRefDomainCode(domain.getRefDomainCode());
        newDomain.setParentDomainId(domain.getParentDomainId());
        newDomain.setRelationDimensionValues(domain.getRelationDimensionValues());
        newDomain.setRelationDomain(domain.getRelationDomain());

        return newDomain;
    }

    public boolean hasPermissionToEditDomain(Domain domain, String currentUser) {
        if (domain.getState().getStage() > 0) {
            return false;
        }

        DomainAssignment assignment = domainAssignmentRepo
                .findAssignmentByDomainId(domain.getDomainId());
        return (currentUser.equals(assignment.getCreator()) || currentUser
                .equals(assignment.getAssignee()));
    }

    public DomainAssignment createDomainAssignment(Domain domain, boolean save, String user) {
        DomainAssignment assignment = new DomainAssignment();
        if (Strings.isNullOrEmpty(user)) {
            user = "@SYSTEM@";
        }
        assignment.setCreator(user);
        assignment.setDomainId(domain.getDomainId());
        assignment.setAssigner(user);
        assignment.setAssignee(user);
        assignment.setLastUpdate(new Date());

        if (save) {
            return domainAssignmentRepo.save(assignment);
        } else {
            return assignment;
        }
    }

    public void checkUdp(DomainUdpDto udp) {
        if (Strings.isNullOrEmpty(udp.getName())) {
            throw new InvalidArgumentException("udpNameCannotBeNull");
        }
    }

    public void checkDomainDataType(String dataType, String domainChName) {
        if (Strings.isNullOrEmpty(dataType)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("domainDataTypeMissing", domainChName));
        }
    }

    public void checkRealmTypeDomainParameter(DomainDto domain) {
        if (domain.getRefDomainId() != null) {
            if (Strings.isNullOrEmpty(domain.getRefDomainCode())
                    || domain.getRefDomainVer() == null) {
                throw new InvalidArgumentException(
                        msgService.getMessage("domainRefDomainInfoMiss"));
            }

            Domain savedDomain = domainRepo.findByDomainIdEquals(domain.getRefDomainId());
            if (savedDomain == null || !DomainState.A.equals(savedDomain.getState())) {
                throw new InvalidArgumentException(msgService.getMessage("cannotFindDomainById"));
            }

            if (!ObjectUtils.equals(DomainService.REALM_CATEGORY_ID, savedDomain.getCategoryId())) {
                throw new InvalidArgumentException(
                        msgService.getMessage("onlyRealMDomainCanBeRef"));
            }
        }
    }

    public void checkInheritDomainParameter(DomainDto domain) {
        if (domain.getParentDomainId() != null) {
            Domain savedDomain = domainRepo.findByDomainIdEquals(domain.getParentDomainId());
            if (savedDomain == null || !DomainState.A.equals(savedDomain.getState())) {
                throw new InvalidArgumentException(msgService.getMessage("cannotFindDomainById"));
            }
        }
    }

    public void checkDomainPath(Long folderId, Long categoryId, String domainChName) {
        if (categoryId == null || folderId == null) {
            throw new InvalidArgumentException(
                    msgService.getMessage("domainCategoryNotGiven", domainChName));
        }

        if (folderId == 1 || folderId == 2 || folderId.equals(categoryId)) {
            throw new InvalidArgumentException(msgService.getMessage("domainRootFolderCannotAdd"));
        }

        DomainTreeNodeDto root = getRoot();

        if (root.getNodes() == null) {
            throw new InvalidArgumentException(msgService.getMessage("domainCategoryDoesntExist"));
        }

        DomainTreeNodeDto node = findCategory(categoryId);

        if (node == null) {
            throw new InvalidArgumentException(msgService.getMessage("domainCategoryDoesntExist"));
        }

        if (!findFolder(node, folderId)) {
            throw new InvalidArgumentException(msgService.getMessage("domainFolderDoesntExist"));
        }
    }

    public DomainTreeNodeDto findCategory(Long categoryId) {
        DomainTreeNodeDto root = getRoot();

        if (root.getNodes() == null) {
            throw new InvalidArgumentException(msgService.getMessage("domainCategoryDoesntExist"));
        }

        for (DomainTreeNodeDto category : root.getNodes()) {
            if (ObjectUtils.equals(category.getFoldId(), categoryId)) {
                return category;
            }
        }

        return null;
    }

    public boolean findFolder(DomainTreeNodeDto folder, final Long targetFolderId) {
        if (folder == null) {
            return false;
        }

        if (ObjectUtils.equals(targetFolderId, folder.getFoldId())) {
            return true;
        }

        if (folder.getNodes() != null) {
            for (DomainTreeNodeDto subFolder : folder.getNodes()) {
                boolean find = findFolder(subFolder, targetFolderId);
                if (find) {
                    return true;
                }
            }
        }

        return false;
    }

    public DomainTreeNodeDto getRoot() {
        return getRoot(false);
    }

    public synchronized DomainTreeNodeDto getRoot(boolean forceReload) {
        DomainTreeNodeDto root = domainTreeRoot.get();
        if (forceReload || root == null || CollectionUtils.isEmpty(root.getNodes())) {
            root = loadDomainCategoryTree();
            domainTreeRoot.set(root, REDIS_FOLDER_ROOT_LIVE_TIME, TimeUnit.SECONDS);
        }

        return root;
    }

    public void checkDomainNames(List<DomainDto> domainList) {
        for (DomainDto domain : domainList) {
            if (Strings.isNullOrEmpty(domain.getChineseName())) {
                throw new InvalidArgumentException(
                        msgService.getMessage("domainChNameMissing"));
            }

            /*if (Strings.isNullOrEmpty(domain.getAbbreviation())) {
                if (!isMetrics(domain.getCategoryId())) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("domainEnNameMissing"));
                }
            }*/
            checkChineseNameUniqueness(domain.getChineseName(), domain.getDomainCode(),
                    domain.getCategoryId());
        }
    }

    public void checkDomainNames(DomainDto domain) {
        String categoryName = msgService.getMessage("category.standard");
        if (isMetrics(domain.getCategoryId())) {
            categoryName = msgService.getMessage("category.index");
        }
        if (Strings.isNullOrEmpty(domain.getChineseName())) {
            throw new InvalidArgumentException(
                    msgService.getMessage("domainChNameMissing"));
        }

        /*if (Strings.isNullOrEmpty(domain.getAbbreviation())) {
            if (!isMetrics(domain.getCategoryId())) {
                throw new InvalidArgumentException(
                        msgService.getMessage("domainEnNameMissing"));
            }
        }*/

        if (!domainRepo
                .findCountByChineseNameAndCategoryId(domain.getChineseName().trim().toLowerCase(),
                        domain.getCategoryId(), domain.getDomainCode()).equals(0)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardSameChineseNameExists", categoryName));
        }
    }

    public void checkChineseNameUniqueness(String chineseName, String domainCode,
                                            final Long categoryId) {
        try {
            Map<String, String> names = domainChineseNames.get(categoryId);
            if (names.containsKey(chineseName.toLowerCase()) && !names
                    .get(chineseName.toLowerCase()).equals(domainCode)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("domainChineseNameConflicts", chineseName));
            }

        } catch (ExecutionException ee) {
            throw new UnexpectedStateException(
                    msgService.getMessage("domainCheckChNameFailed", ee.getMessage()));
        }
    }

    public String getUUID() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }

    @PostConstruct
    public void init() {
        try {
            datasourceQueryHelper = new QueryBuilderHelper();
            datasourceQueryHelper.setIdFieldName("domainId");
            datasourceQueryHelper.setNameFieldName("chineseName");

            List<DomainState> availableStates = Lists.newArrayList(DomainState.A);
            List<DomainState> candidateStates = Lists.newArrayList(DomainState.C);
            List<DomainState> notAvailableStates = Lists.newArrayList(DomainState.X, DomainState.D);
            expandedStateMap.put(DomainState.A, availableStates);
            expandedStateMap.put(DomainState.C, candidateStates);
            expandedStateMap.put(DomainState.X, notAvailableStates);
            expandedStateMap.put(DomainState.D, notAvailableStates);

            //allow accepted domain to archive state
            expandedStateMap.get(DomainState.A).add(DomainState.X);

            //init udp map in redis
            LocalCachedMapOptions options = LocalCachedMapOptions.defaults();
            options.timeToLive(2, TimeUnit.MINUTES);
            udpMap = redissonClient.getLocalCachedMap(REDIS_UDP_MAP, options);
            loadAllUdpIntoRedis();

            //make sure built-in domain folders exist
            makeSureDataStandardAndIndexExist();

            //init domain tree, always reload
            domainTreeRoot = redissonClient.getBucket(REDIS_FOLDER_ROOT);
            getRoot(true);

            makeSureDomainFolderPathExist();

            //初始化副本状态
            initCopyState();
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        }
    }

    protected void initCopyState() {
        List<String> updatingDomainIdList = domainRepo.findUpdatingDomainId();
        for (List<String> partition : Lists.partition(updatingDomainIdList, 999)) {
            domainRepo.updateInitCopyState(partition);
        }

        List<String> updatingCodeList = standardCodeRepo.findAllUpdatingCodes();
        for (List<String> partition : Lists.partition(updatingCodeList, 999)) {
            standardCodeRepo.updateInitCopyState(partition);
        }
    }

    /**
     * 初始化目录为空的路径数据，如果不存在路径为空的数据，则跳过执行
     * 数据标准目录路径在6.5.1新加，所以考虑升级问题，这里初始化所有路径为空的目录数据
     */
    public void makeSureDomainFolderPathExist() {
        List<DomainFolder> pathNullFolders = domainFolderRepo.findByPathIsNull();
        if (!pathNullFolders.isEmpty()) {
            for (DomainFolder domainFolder : pathNullFolders) {
                String path = findDomainFolderPath(domainFolder.getId());
                domainFolder.setPath(path + "/");
            }
            domainFolderRepo.saveAll(pathNullFolders);
        }
        List<DomainFolder> notCorrectEndFolders = domainFolderRepo.findByPathNotLike("%/");
        if (!notCorrectEndFolders.isEmpty()) {
            notCorrectEndFolders.forEach(folder -> folder.setPath(folder.getPath() + "/"));
            domainFolderRepo.saveAll(notCorrectEndFolders);
        }
    }

    public void makeSureDataStandardAndIndexExist() {
        if (ObjectUtils.equals(0L, domainFolderRepo.count())) {
            DomainFolder dataStdFolder = new DomainFolder();
            dataStdFolder.setId(1L);
            dataStdFolder.setName(msgService.getMessage("domain.name.standard"));
            dataStdFolder.setParentId(0L);
            dataStdFolder.setType(CategoryType.ENTERPRISE);
            dataStdFolder.setDeletable(false);
            dataStdFolder.setDescription(msgService.getMessage("domain.name.enterStandard"));

            DomainFolder indexFolder = new DomainFolder();
            indexFolder.setId(2L);
            indexFolder.setName(msgService.getMessage("domain.name.index"));
            indexFolder.setParentId(0L);
            indexFolder.setDescription(msgService.getMessage("domain.name.enterIndex"));
            indexFolder.setDeletable(false);
            indexFolder.setType(CategoryType.ENTERPRISE);

            DomainFolder dictFolder = new DomainFolder();
            dictFolder.setId(3L);
            dictFolder.setName(msgService.getMessage("domain.name.allDataDict"));
            dictFolder.setParentId(0L);
            dictFolder.setDescription(msgService.getMessage("domain.name.allEnterDict"));
            dictFolder.setDeletable(false);
            dictFolder.setType(CategoryType.ENTERPRISE);

            List<DomainFolder> folders = Lists.newArrayList(dataStdFolder, indexFolder, dictFolder);
            domainFolderRepo.saveAll(folders);
        }

        Optional<DomainFolder> domainFolderOption = domainFolderRepo
                .findById(DomainService.REALM_CATEGORY_ID);

        if (domainFolderOption.isPresent()) {
            if (!CategoryType.ENTERPRISE.equals(domainFolderOption.get().getType())) {
                //如果DomainService.REALM_CATEGORY_ID 已经存在了，如果不是企业级标准而是领域级标准，那么需要从库里面修改
                throw new UnexpectedStateException(
                        "ID=4L folder should be left for DOMAIN, fix this problem in DB and try again");
            }
        } else {
            DomainFolder domainFolder = new DomainFolder();
            domainFolder.setId(DomainService.REALM_CATEGORY_ID);
            domainFolder.setParentId(0L);
            domainFolder.setName(msgService.getMessage("domain.name.domain"));
            domainFolder.setDescription(msgService.getMessage("domain.name.domain"));
            domainFolder.setDeletable(false);
            domainFolder.setType(CategoryType.ENTERPRISE);

            domainFolderRepo.save(domainFolder);
        }
        // 原子、衍生指标目录
        Optional<DomainFolder> baseMetricsOptional = domainFolderRepo
                .findById(5L);
        if (baseMetricsOptional.isPresent()) {
            if (!MetricType.BASIC.name().equals(baseMetricsOptional.get().getCatalog())) {
                DomainFolder domainFolder = baseMetricsOptional.get();
                processingHistoryData(domainFolder, 5L, msgService.getMessage("category.atom.index"), MetricType.BASIC);
                //如果已经存在那么需要从库里面修改
                throw new UnexpectedStateException(
                        "ID=5L folder should be left for base metrics, fix this problem in DB and try again");
            }
        } else {
            saveMetricCatalog(msgService.getMessage("category.atom.index"), MetricType.BASIC, 5L);
        }
        // 派生指标目录
        Optional<DomainFolder> forkMetricsOptional = domainFolderRepo
                .findById(6L);
        if (forkMetricsOptional.isPresent()) {
            if (!MetricType.FORK.name().equals(forkMetricsOptional.get().getCatalog())) {
                DomainFolder domainFolder = forkMetricsOptional.get();
                processingHistoryData(domainFolder, 6L, msgService.getMessage("category.gen.index"), MetricType.FORK);
                //如果已经存在那么需要从库里面修改
                throw new UnexpectedStateException(
                        "ID=6L folder should be left for FORK metrics, fix this problem in DB and try again");
            }
        } else {
            saveMetricCatalog(msgService.getMessage("category.gen.index"), MetricType.FORK, 6L);
        }
    }

    public void saveMetricCatalog(String name, MetricType fork, long id) {
        DomainFolder domainFolder = new DomainFolder();
        domainFolder.setParentId(0L);
        domainFolder.setName(name);
        domainFolder.setDescription(name);
        domainFolder.setDeletable(false);
        domainFolder.setType(CategoryType.ENTERPRISE);
        domainFolder.setCatalog(fork.name());
        domainFolder.setId(id);
        domainFolderRepo.save(domainFolder);
    }

    @Transactional
    public void processingHistoryData(DomainFolder domainFolder, Long categoryId, String name, MetricType metricType) {
        domainFolder.setId(null);
        DomainFolder save = domainFolderRepo.save(domainFolder);
        // 添加固定值数据
        saveMetricCatalog(name, metricType, categoryId);

        domainRepo.updateAuthCategoryId(save.getId(), categoryId);
        domainRepo.updateCategoryId(save.getId(), categoryId);
        domainRepo.updateFolderId(save.getId(), categoryId);
        domainVersionRepo.updateAuthCategoryId(save.getId(), categoryId);
        domainVersionRepo.updateCategoryId(save.getId(), categoryId);
        domainVersionRepo.updateFolderId(save.getId(), categoryId);
        domainUdpRepo.updatePropFolder(save.getId(), categoryId);
        domainFolderAccessListRepo.updateCategoryId(save.getId(), categoryId);
        domainFolderRepo.updateParentId(save.getId(), categoryId);
    }

    public synchronized DomainTreeNodeDto loadDomainCategoryTree() {
        return loadDomainCategoryTreeMap().get(0L);
    }

    public synchronized Map<Long, DomainTreeNodeDto> loadDomainCategoryTreeMap() {
        DomainTreeNodeDto root = new DomainTreeNodeDto();
        root.setFoldId(0L);
        root.setName("v_root");

        Map<Long, DomainTreeNodeDto> map = new HashMap<>();
        map.put(root.getFoldId(), root);

        List<DomainTreeNodeDto> firstLevelNodes = new ArrayList<>();
        for (DomainFolder folder : domainFolderRepo.findAll()) {
            map.put(folder.getId(), convertToTreeNode(folder));

            if (ObjectUtils.equals(folder.getParentId(), 0L)) {
                DomainTreeNodeDto node = map.get(folder.getId());
                node.setCategoryId(folder.getId());
                firstLevelNodes.add(node);
            }
        }

        for (DomainTreeNodeDto node : map.values()) {
            if (ObjectUtils.equals(node.getFoldId(), 0L)) {
                continue;
            }

            map.get(node.getParentId()).addSubNode(node);
        }

        for (DomainTreeNodeDto node : firstLevelNodes) {
            passdownCategoryProperties(node, node.getNodes());
        }

        return map;
    }

    public void passdownCategoryProperties(DomainTreeNodeDto currentNode,
                                            Collection<DomainTreeNodeDto> nodes) {
        if (CollectionUtils.isEmpty(nodes)) {
            return;
        }

        for (DomainTreeNodeDto node : nodes) {
            node.setCategoryId(currentNode.getCategoryId());
            node.setType(currentNode.getType());

            passdownCategoryProperties(node, node.getNodes());
        }
    }

    public List<Domain> convertToListDomain(Collection<DomainDto> domains) {
        List<Domain> res = new ArrayList<>(domains.size());

        for (DomainDto domain : domains) {
            res.add(convertToDomain(domain));
        }

        return res;
    }

    public DomainUdp convertToDomainUdp(DomainUdpDto udp) {
        DomainUdp res = new DomainUdp();
        res.setBindFolderId(udp.getBindFolderId());
        res.setCandidates(udp.getCandidates());
        res.setCatalog(udp.getCatalog());
        res.setDataType(udp.getDataType());
        res.setName(udp.getName());
        res.setOrder(udp.getOrder());
        res.setPropertyId(udp.getUdpId());
        res.setRequired(udp.isRequired());

        return res;
    }

    public Domain convertToDomain(DomainDto domain) {
        Domain res = new Domain();
        res.setCategoryId(domain.getCategoryId());
        res.setComment(domain.getComment());
        res.setFirstPublish(domain.getFirstPublish());
        res.setFolderId(domain.getFolderId());
        res.setState(domain.getState());
        res.setSubmitter(domain.getSubmitter());
        res.setLastModification(domain.getLastModification());
        res.setUpdatingDomainId(domain.getUpdatingDomainId());
        res.setVersion(domain.getVersion());
//        res.setAbbreviation(domain.getAbbreviation());
        res.setAbbreviation(domain.getEnglishName());
        res.setAdditionalProperties(domain.getAdditionalProperties());
        res.setChineseName(domain.getChineseName());
        res.setDataPrecision(domain.getDataPrecision());
        res.setDataScale(domain.getDataScale());
        res.setDescription(domain.getDescription());
        res.setDomainCode(domain.getDomainCode());
        res.setDomainId(domain.getDomainId());
        res.setEnglishName(domain.getEnglishName());
        res.setDataType(domain.getDataType());
        res.setNotNull(domain.getNotNull());
        res.setReferenceCode(domain.getReferenceCode());
        res.setCreateTime(domain.getCreateTime());

        res.setBusinessRule(domain.getBusinessRule());
        res.setDescriptionDepartment(domain.getDescriptionDepartment());
        res.setSource(domain.getSource());
        res.setSynonym(domain.getSynonym());
        res.setRelationDomain(domain.getRelationDomain());
        res.setAuthCategoryId(domain.getAuthCategoryId());
        res.setRangeType(domain.getRangeType());
        res.setDataFormat(domain.getDataFormat());
        res.setOwnerOrg(domain.getOwnerOrg());

        res.setParentCode(domain.getParentCode());
        res.setDimCodes(domain.getDimCodes());
        res.setDocumentIds(domain.getDocumentIds());
        res.setFunction(domain.getFunction());
        res.setMeasureUnit(domain.getMeasureUnit());
        res.setMonitorObjects(domain.getMonitorObjects());

        res.setRequirementId(domain.getRequirementId());
        res.setMetricType(domain.getMetricType());
        res.setExpireDate(domain.getExpireDate());
        res.setTakeEffectDate(domain.getTakeEffectDate());
        res.setSafeLevel(domain.getSafeLevel());
        res.setManagementOwner(domain.getManagementOwner());
        res.setTechOwner(domain.getTechOwner());
        res.setBusinessOwner(domain.getBusinessOwner());

        res.setParentDomainId(domain.getParentDomainId());
        res.setRefDomainId(domain.getRefDomainId());
        res.setRefDomainCode(domain.getRefDomainCode());
        res.setRefDomainVer(domain.getRefDomainVer());

        res.setRelationDimensionValues(domain.getRelationDimensionValues());

        return res;
    }

    public DomainFolderDto convertToDomainFolder(PrivateDomainFolder folder) {
        DomainFolderDto res = new DomainFolderDto();

        res.setStrId(folder.getId());
        res.setName(folder.getName());
        res.setStrParentId(folder.getParentId());

        return res;
    }

    public DomainTreeNodeDto convertToTreeNode(DomainFolder folder) {
        DomainTreeNodeDto res = new DomainTreeNodeDto();
        res.setName(folder.getName());
        res.setFoldId(folder.getId());
        res.setParentId(folder.getParentId());
        res.setDescription(folder.getDescription());
        res.setType(folder.getType());
        res.setOrder(folder.getOrder());

        return res;
    }

    public synchronized void loadCategoryUdpIntoRedis(Long categoryId) {
        List<DomainUdpDto> udps = new ArrayList<>();
        for (DomainUdp udp : domainUdpRepo.findDomainUdpsByBindFolderIdEquals(categoryId)) {
            udps.add(convertToDomainUdpDto(udp));
        }

        udpMap.put(categoryId, udps);
    }

    public synchronized void loadAllUdpIntoRedis() {
        Map<Long, List<DomainUdpDto>> map = new HashMap<>();

        for (DomainUdp udp : domainUdpRepo.findAll()) {
            DomainUdpDto udpDto = convertToDomainUdpDto(udp);
            if (!map.containsKey(udpDto.getBindFolderId())) {
                map.put(udpDto.getBindFolderId(), new ArrayList<>());
            }

            map.get(udpDto.getBindFolderId()).add(udpDto);
        }

        for (Map.Entry<Long, List<DomainUdpDto>> entry : map.entrySet()) {
            udpMap.put(entry.getKey(), entry.getValue());
        }
    }

    public DomainUdpDto convertToDomainUdpDto(DomainUdp udp) {
        DomainUdpDto res = new DomainUdpDto();
        res.setCandidates(udp.getCandidates());
        res.setCatalog(udp.getCatalog());
        res.setDataType(udp.getDataType());
        res.setName(udp.getName());
        res.setOrder(udp.getOrder());
        res.setRequired(udp.isRequired());
        res.setBindFolderId(udp.getBindFolderId());
        res.setUdpId(udp.getPropertyId());

        return res;
    }

    public List<DomainDto> convertToListDomainDto(Collection<Domain> domains) {
        List<DomainDto> res = new ArrayList<>();
        for (Domain domain : domains) {
            res.add(convertToDomainDto(domain));
        }

        return res;
    }

    public List<DomainDto> convertToListPrivateDomainDto(Collection<PrivateDomain> domains) {
        List<DomainDto> res = new ArrayList<>(domains.size());
        for (PrivateDomain domain : domains) {
            res.add(convertToDomainDto(domain));
        }

        return res;
    }

    public DomainDto convertToDomainDto(DomainExcelDto domainExcelDto, Long categoryId) {
        DomainDto result = new DomainDto();
        result.setDomainId(domainExcelDto.getDomainId());
        result.setDomainCode(domainExcelDto.getDomainCode());
        result.setChineseName(domainExcelDto.getChineseName());
        result.setEnglishName(domainExcelDto.getEnglishName());
        result.setAbbreviation(domainExcelDto.getAbbreviation());
        result.setDescription(domainExcelDto.getDescription());
        result.setReferenceCode(domainExcelDto.getReferenceCode());
        result.setDataType(domainExcelDto.getDataType());
        result.setDataScale(domainExcelDto.getDataScale());
        result.setDataPrecision(domainExcelDto.getDataPrecision());
        if (msgService.getMessage("keyword.YES").equals(domainExcelDto.getNotNullStr())) {
            result.setNotNull(true);
        } else if (msgService.getMessage("keyword.NO").equals(domainExcelDto.getNotNullStr())) {
            result.setNotNull(false);
        } else {
            result.setErrorMsg(msgService.getMessage("propYesOrNoValueMustBeThis"));
//            throw new IllegalArgumentException(msgService.getMessage("propYesOrNoValueMustBeThis"));
        }
        result.setFirstPublish(domainExcelDto.getFirstPublish());
        if (!Strings.isNullOrEmpty(domainExcelDto.getState())) {
            if(msgService.getMessage("DomainState.A").equals(domainExcelDto.getState())){
                result.setState(DomainState.A);
            } else if (msgService.getMessage("DomainState.X").equals(domainExcelDto.getState())) {
                result.setState(DomainState.X);
            } else if (msgService.getMessage("DomainState.C").equals(domainExcelDto.getState())) {
                result.setState(DomainState.C);
            } else if (msgService.getMessage("DomainState.D").equals(domainExcelDto.getState())) {
                result.setState(DomainState.D);
            }
        }
        result.setFolderId(domainExcelDto.getFolderId());
        result.setComment(domainExcelDto.getComment());
        result.setOwner(domainExcelDto.getOwner());
        result.setUsageCount(domainExcelDto.getUsageCount());
        if (!Strings.isNullOrEmpty(domainExcelDto.getPath())) {
            List<String> path = new LinkedList<>();
            String[] domainPathStr = domainExcelDto.getPath().split("/");
            for (String domainPath : domainPathStr) {
                path.add(domainPath);
            }
            result.setPath(path);
        }else if(!CollectionUtils.isEmpty(domainExcelDto.getPaths())) {
            List<String> paths = new ArrayList<>();
            if(categoryId == 1L){
                paths.add(msgService.getMessage("domain.name.standard"));
            } else if (categoryId == 2L) {
                paths.add(msgService.getMessage("domain.name.index"));
            }
            paths.addAll(domainExcelDto.getPaths());
            result.setPath(paths);
        }

        result.setBusinessRule(domainExcelDto.getBusinessRule());
        result.setDescriptionDepartment(domainExcelDto.getDescriptionDepartment());
        result.setSource(domainExcelDto.getSource());
        result.setSynonym(domainExcelDto.getSynonym());
        result.setRelationDomainStr(domainExcelDto.getRelationDomain());
        result.setAuthCategoryName(domainExcelDto.getAuthCategoryName());
        result.setRangeType(domainExcelDto.getRangeType());
        result.setDataFormat(domainExcelDto.getDataFormat());
        result.setOwnerOrg(domainExcelDto.getOwnerOrg());

        result.setParentCode(domainExcelDto.getParentCode());
        if (!Strings.isNullOrEmpty(domainExcelDto.getDimCodes())) {
            result.setDimCodes(
                    new ArrayList<>((Arrays.asList(domainExcelDto.getDimCodes().split(",")))));
        }
        result.setFunction(domainExcelDto.getFunction());
        result.setMeasureUnit(domainExcelDto.getMeasureUnit());
        result.setMonitorObjects(domainExcelDto.getMonitorObjects());

        result.setMetricType(MetricType.BASIC);
        return result;
    }

    public DomainDto convertToDomainDto(Domain domain) {
        DomainDto res = new DomainDto();
        res.setAbbreviation(domain.getAbbreviation());
        res.setAdditionalProperties(domain.getAdditionalProperties());
        res.setCategoryId(domain.getCategoryId());
        res.setChineseName(domain.getChineseName());
        res.setEnglishName(domain.getEnglishName());
        res.setComment(domain.getComment());
        res.setDataPrecision(domain.getDataPrecision());
        res.setDataScale(domain.getDataScale());
        res.setDataType(domain.getDataType());
        res.setDescription(domain.getDescription());
        res.setDomainCode(domain.getDomainCode());
        res.setDomainId(domain.getDomainId());
        res.setFirstPublish(domain.getFirstPublish());
        res.setFolderId(domain.getFolderId());
        res.setLastModification(domain.getLastModification());
        res.setReferenceCode(domain.getReferenceCode());
        res.setState(domain.getState());
        res.setSubmitter(domain.getSubmitter());
        res.setUpdatingDomainId(domain.getUpdatingDomainId());
        res.setVersion(domain.getVersion());
        res.setNotNull(domain.getNotNull());
        res.setCreateTime(domain.getCreateTime());
        res.setFirstPublish(domain.getFirstPublish());

        res.setPath(getDomainPathByFolderId(res.getFolderId(), domain.getCategoryId()));

        res.setBusinessRule(domain.getBusinessRule());
        res.setDescriptionDepartment(domain.getDescriptionDepartment());
        res.setSource(domain.getSource());
        res.setSynonym(domain.getSynonym());
        res.setRelationDomain(domain.getRelationDomain());
        res.setAuthCategoryId(domain.getAuthCategoryId());
        res.setRangeType(domain.getRangeType());
        res.setDataFormat(domain.getDataFormat());
        res.setOwnerOrg(domain.getOwnerOrg());

        res.setParentCode(domain.getParentCode());
        res.setDimCodes(domain.getDimCodes());
        res.setDocumentIds(domain.getDocumentIds());
        res.setFunction(domain.getFunction());
        res.setMeasureUnit(domain.getMeasureUnit());
        res.setMonitorObjects(domain.getMonitorObjects());

        res.setRequirementId(domain.getRequirementId());
        res.setMetricType(domain.getMetricType());
        res.setExpireDate(domain.getExpireDate());
        res.setTakeEffectDate(domain.getTakeEffectDate());
        res.setSafeLevel(domain.getSafeLevel());
        res.setManagementOwner(domain.getManagementOwner());
        res.setTechOwner(domain.getTechOwner());
        res.setBusinessOwner(domain.getBusinessOwner());

        res.setRefDomainCode(domain.getRefDomainCode());
        res.setRefDomainId(domain.getRefDomainId());
        res.setRefDomainVer(domain.getRefDomainVer());

        res.setParentDomainId(domain.getParentDomainId());

        res.setRelationDimensionValues(domain.getRelationDimensionValues());
        return res;
    }

    public DomainDto convertToDomainDto(DomainVersion domain) {
        DomainDto res = new DomainDto();
        res.setAbbreviation(domain.getAbbreviation());
        res.setAdditionalProperties(domain.getAdditionalProperties());
        res.setCategoryId(domain.getCategoryId());
        res.setChineseName(domain.getChineseName());
        res.setEnglishName(domain.getEnglishName());
        res.setComment(domain.getComment());
        res.setDataPrecision(domain.getDataPrecision());
        res.setDataScale(domain.getDataScale());
        res.setDataType(domain.getDataType());
        res.setDescription(domain.getDescription());
        res.setDomainCode(domain.getDomainCode());
        res.setDomainId(domain.getDomainId());
        res.setFirstPublish(domain.getFirstPublish());
        res.setFolderId(domain.getFolderId());
        res.setLastModification(domain.getLastModification());
        res.setReferenceCode(domain.getReferenceCode());
        res.setState(domain.getState());
        res.setSubmitter(domain.getSubmitter());
        res.setUpdatingDomainId(domain.getUpdatingDomainId());
        res.setVersion(domain.getVersion());
        res.setNotNull(domain.getNotNull());

        res.setPath(getDomainPathByFolderId(res.getFolderId(), domain.getCategoryId()));

        res.setBusinessRule(domain.getBusinessRule());
        res.setDescriptionDepartment(domain.getDescriptionDepartment());
        res.setSource(domain.getSource());
        res.setSynonym(domain.getSynonym());
        res.setRelationDomain(domain.getRelationDomain());
        res.setAuthCategoryId(domain.getAuthCategoryId());
        res.setRangeType(domain.getRangeType());
        res.setDataFormat(domain.getDataFormat());
        res.setOwnerOrg(domain.getOwnerOrg());

        res.setParentCode(domain.getParentCode());
        res.setDimCodes(domain.getDimCodes());
        res.setDocumentIds(domain.getDocumentIds());
        res.setFunction(domain.getFunction());
        res.setMeasureUnit(domain.getMeasureUnit());
        res.setMonitorObjects(domain.getMonitorObjects());

        res.setRequirementId(domain.getRequirementId());
        res.setMetricType(domain.getMetricType());
        res.setExpireDate(domain.getExpireDate());
        res.setTakeEffectDate(domain.getTakeEffectDate());
        res.setSafeLevel(domain.getSafeLevel());
        res.setManagementOwner(domain.getManagementOwner());
        res.setTechOwner(domain.getTechOwner());
        res.setBusinessOwner(domain.getBusinessOwner());

        res.setRefDomainVer(domain.getRefDomainVer());
        res.setRefDomainId(domain.getRefDomainId());
        res.setRefDomainCode(domain.getRefDomainCode());

        res.setParentDomainId(domain.getParentDomainId());
        res.setRelationDimensionValues(domain.getRelationDimensionValues());
        res.setTimeModifierRefs(domain.getTimeModifierRefs());
        res.setModifierRefs(domain.getModifierRefs());
        return res;
    }

    public DomainDto convertToDomainDto(PrivateDomain domain) {
        DomainDto res = new DomainDto();
        res.setAbbreviation(domain.getAbbreviation());
        res.setAdditionalProperties(domain.getAdditionalProperties());
        res.setChineseName(domain.getChineseName());
        res.setEnglishName(domain.getEnglishName());
        res.setDataPrecision(domain.getDataPrecision());
        res.setDataScale(domain.getDataScale());
        res.setDataType(domain.getDataType());
        res.setDescription(domain.getDescription());
        res.setDomainCode(domain.getDomainCode());
        res.setDomainId(domain.getDomainId());
        res.setPrivateFolderId(domain.getFolderId());
        res.setLastModification(domain.getLastModification());
        res.setReferenceCode(domain.getReferenceCode());
        res.setSubmitter(domain.getOwner());

        res.setBusinessRule(domain.getBusinessRule());
        res.setDescriptionDepartment(domain.getDescriptionDepartment());
        res.setSource(domain.getSource());
        res.setSynonym(domain.getSynonym());
        res.setRelationDomain(domain.getRelationDomain());
        res.setAuthCategoryId(domain.getAuthCategoryId());
        res.setRangeType(domain.getRangeType());
        res.setDataFormat(domain.getDataFormat());
        res.setOwnerOrg(domain.getOwnerOrg());

        res.setParentCode(domain.getParentCode());
        res.setDimCodes(domain.getDimCodes());
        res.setDocumentIds(domain.getDocumentIds());
        res.setFunction(domain.getFunction());
        res.setMeasureUnit(domain.getMeasureUnit());
        res.setMonitorObjects(domain.getMonitorObjects());

        res.setRequirementId(domain.getRequirementId());
        res.setMetricType(domain.getMetricType());
        res.setExpireDate(domain.getExpireDate());
        res.setTakeEffectDate(domain.getTakeEffectDate());
        res.setSafeLevel(domain.getSafeLevel());
        res.setManagementOwner(domain.getManagementOwner());
        res.setTechOwner(domain.getTechOwner());
        res.setBusinessOwner(domain.getBusinessOwner());
        return res;
    }

    public List<DomainVersionDto> convertToListDomainVersionDto(
            Collection<DomainVersion> versions) {
        if (CollectionUtils.isEmpty(versions)) {
            return Collections.emptyList();
        }

        List<Long> folderIds = new ArrayList<>();
        List<DomainVersionDto> res = new ArrayList<>();
        for (DomainVersion version : versions) {
            folderIds.add(version.getFolderId());
            res.add(convertToDomainVersionDto(version, false));
        }

        Map<Long, List<String>> folderPathMap = buildDomainFullPath(folderIds);
        for (DomainVersionDto version : res) {
            version.setFullPath(folderPathMap.get(version.getFolderId()));
        }

        return res;
    }

    public DomainVersionDto convertToDomainVersionDto(DomainVersion domainVersion,
                                                       boolean handlePath) {
        DomainVersionDto res = new DomainVersionDto();

        res.setAbbreviation(domainVersion.getAbbreviation());
        res.setAdditionalProperties(domainVersion.getAdditionalProperties());
        res.setCategoryId(domainVersion.getCategoryId());
        res.setChineseName(domainVersion.getChineseName());
        res.setComment(domainVersion.getComment());
        res.setDataPrecision(domainVersion.getDataPrecision());
        res.setDataScale(domainVersion.getDataScale());
        res.setDataType(domainVersion.getDataType());
        res.setDescription(domainVersion.getDescription());
        res.setDomainCode(domainVersion.getDomainCode());
        res.setDomainId(domainVersion.getDomainId());
        res.setEnglishName(domainVersion.getEnglishName());
        res.setFirstPublish(domainVersion.getFirstPublish());
        res.setFolderId(domainVersion.getFolderId());
        res.setLastModification(domainVersion.getLastModification());
        res.setNotNull(domainVersion.getNotNull());
        res.setReferenceCode(domainVersion.getReferenceCode());
        res.setSubmitter(domainVersion.getSubmitter());
        res.setUdps(domainVersion.getUdpDefs());
        res.setVersion(domainVersion.getVersion());
        res.setCreateTime(domainVersion.getCreateTime());

        res.setBusinessRule(domainVersion.getBusinessRule());
        res.setDescriptionDepartment(domainVersion.getDescriptionDepartment());
        res.setSource(domainVersion.getSource());
        res.setSynonym(domainVersion.getSynonym());
        res.setRelationDomain(domainVersion.getRelationDomain());
        res.setAuthCategoryId(domainVersion.getAuthCategoryId());
        res.setRangeType(domainVersion.getRangeType());
        res.setDataFormat(domainVersion.getDataFormat());
        res.setOwnerOrg(domainVersion.getOwnerOrg());

        res.setParentCode(domainVersion.getParentCode());
        res.setDimCodes(domainVersion.getDimCodes());
        res.setDocumentIds(domainVersion.getDocumentIds());
        res.setFunction(domainVersion.getFunction());
        res.setMeasureUnit(domainVersion.getMeasureUnit());
        res.setMonitorObjects(domainVersion.getMonitorObjects());

        res.setRequirementId(domainVersion.getRequirementId());
        res.setMetricType(domainVersion.getMetricType());
        res.setExpireDate(domainVersion.getExpireDate());
        res.setTakeEffectDate(domainVersion.getTakeEffectDate());
        res.setSafeLevel(domainVersion.getSafeLevel());
        res.setManagementOwner(domainVersion.getManagementOwner());
        res.setTechOwner(domainVersion.getTechOwner());
        res.setBusinessOwner(domainVersion.getBusinessOwner());

        if (handlePath) {
            Map<Long, List<String>> folderPathMap = buildDomainFullPath(
                    Collections.singleton(domainVersion.getFolderId()));
            List<String> path = folderPathMap.get(domainVersion.getFolderId());
            res.setFullPath(path);
        }

        res.setRefDomainCode(domainVersion.getRefDomainCode());
        res.setRefDomainId(domainVersion.getRefDomainId());
        res.setRefDomainVer(domainVersion.getRefDomainVer());

        res.setParentDomainId(domainVersion.getParentDomainId());

        return res;
    }

    public void replaceDomain(Domain oldDomain, DomainExt oldDomainExt, String username) {
        //更新新的标准属性值
        String domainId = oldDomain.getDomainId();
        String updatingDomainId = oldDomain.getUpdatingDomainId();
        Domain toBeReplaceDomain = domainRepo.findByDomainIdEquals(updatingDomainId);
        int oldVersin = oldDomain.getVersion();
        BeanUtils.copyProperties(toBeReplaceDomain, oldDomain, "lastReview");
        oldDomain.setCopyDomain(false);
        oldDomain.setDomainId(domainId);
        oldDomain.setVersion(oldVersin + 1);

        if(oldDomainExt != null) {
            DomainExt toBeReplaceDomainExt = domainExtRepo.findByDIdEquals(updatingDomainId);
            BeanUtils.copyProperties(toBeReplaceDomainExt, oldDomainExt, "dId");
        }
        //版本号加1
        //把标准保存到历史表
        String categoryName = msgService.getMessage("category.standard.data");
        if (oldDomain.getCategoryId() != null && isMetrics(oldDomain.getCategoryId())) {
            categoryName = msgService.getMessage("category.index.data");
        }
        createDomainVersion(oldDomain, username, msgService.getMessage("hasBeanUpdated", categoryName), null, null);
    }

    public void replaceStandard(StandardCode oldStd, String username) {
        //更新新的标准代码属性值
        String code = oldStd.getCode();
        String updatingCode = oldStd.getUpdatingCode();
        Date createTime = oldStd.getCreateTime();
        StandardCode toBeReplaceStd = standardCodeRepo.findByCodeEquals(updatingCode);
        BeanUtils.copyProperties(toBeReplaceStd, oldStd);
        oldStd.setCopyCode(false);
        oldStd.setCode(code);
        oldStd.setCreateTime(createTime);
        //版本号加1
        oldStd.setVersion(oldStd.getVersion() + 1);
        //把标准保存到历史表
        createStandardVersion(oldStd, username, msgService.getMessage("codeHappendModify"));
    }

    public void createDomainVersion(Domain oldDomain, String username, String message,
                                     List<DomainVersion> domainVersions, List<EditHistoryEntity> histories) {
        DomainVersion version = buildDomainVersion(oldDomain);
        initDomainVersion(version);
        version.setState(DomainState.A);
        if (domainVersions == null) {
            domainVersionRepo.save(version);
        } else {
            domainVersions.add(version);
        }

        EditHistoryEntity history = new EditHistoryEntity();
        history.setOperator(username);
        history.setHistoryType(EditHistoryEntity.TYPE_DOMAIN);
        history.setTimestamp(new Date());
        history.setVersion(version.getVersion());
        history.setItemId(version.getDomainId());
        history.setChanges(message);
        if (histories == null) {
            editHistoryRepo.save(history);
        } else {
            histories.add(history);
        }
    }

    public void createStandardVersion(StandardCode oldStd, String username, String message) {
        StandardCodeVersion version = new StandardCodeVersion(oldStd);
        version.setState(DomainState.A);
        standardCodeVerRepo.save(version);

        EditHistoryEntity history = new EditHistoryEntity();
        history.setOperator(username);
        history.setHistoryType(EditHistoryEntity.TYPE_STD_CODE);
        history.setTimestamp(new Date());
        history.setVersion(version.getVersion());
        history.setItemId(version.getCode());
        history.setChanges(message);
        editHistoryRepo.save(history);
    }

    public void initDomainVersion(DomainVersion version) {
        Map<Long, List<DomainUdpDto>> udpMap = new HashMap<>();

        if (!udpMap.containsKey(version.getCategoryId())) {
            udpMap
                    .put(version.getCategoryId(), getDomainUdps(version.getCategoryId()));
        }
        version.setUdpDefs(udpMap.get(version.getCategoryId()));
    }

    public void compareCodeValue(List<StandardCodeValueCompareDto> srcCodes,
                                  List<StandardCodeValueCompareDto> tagCodes,
                                  Map<String, List<StandardCodeValueCompareDto>> result,
                                  List<Pair<StandardCodeValueCompareDto, StandardCodeValueCompareDto>> modify) {
        result.put("add", new ArrayList<>());
        result.put("delete", new ArrayList<>());
        result.put("noChange", new ArrayList<>());

        Map<String, StandardCodeValueCompareDto> srcMap = new HashMap<>();
        for (StandardCodeValueCompareDto dto : srcCodes) {
            srcMap.put(dto.getCompareValue(), dto);
        }
        Map<String, StandardCodeValueCompareDto> tagMap = new HashMap<>();
        for (StandardCodeValueCompareDto dto : tagCodes) {
            tagMap.put(dto.getCompareValue(), dto);
        }

        for (StandardCodeValueCompareDto src : srcCodes) {
            if (!tagMap.containsKey(src.getCompareValue())) {
                result.get("add").add(src);
                continue;
            }
            StandardCodeValueCompareDto tag = tagMap.get(src.getCompareValue());
            if (!src.equals(tag)) {
                modify.add(Pair.of(src, tag));
            } else {
                result.get("noChange").add(src);
            }

        }

        for (StandardCodeValueCompareDto tag : tagCodes) {
            if (!srcMap.containsKey(tag.getCompareValue())) {
                result.get("delete").add(tag);
            }
        }
    }

    public boolean isBaseDomain(Long categoryId) {
        return categoryId == 1;
    }

    public boolean isFiledDomain(Long categoryId) {
        return categoryId > 3;
    }

    public boolean isMeDomain(Long categoryId) {
        return categoryId == 2;
    }

    public boolean isDictDomain(Long categoryId) {
        return categoryId == 3;
    }

    public DomainParaDto addImportDomainPublish(Map<String, Domain> importDomainCodeKeyMap, String username,
                                                Long categoryId, Map<String, DomainDto> importDomainDtoCodeKeyMap, boolean ignoreError, List<DomainDto> allResult) {
        boolean hasError = false;
        if (importDomainDtoCodeKeyMap.size() > importDomainCodeKeyMap.size()) {
            hasError = true;
        }
        List<Domain> oldAllDomains = domainRepo.findAllByCategoryIdEquals(categoryId);
        Map<String, Domain> allOldDomainMap = new HashMap<>();
        Set<String> dbChineseNames = new HashSet<>();
        Set<String> needToRemove = new HashSet<>();
        DomainParaDto res = new DomainParaDto();

        long start = System.currentTimeMillis();

        for (Domain domain : oldAllDomains) {
            if (importDomainCodeKeyMap.containsKey(domain.getDomainCode())) {
                if (domain.getState().equals(DomainState.C) ||
                        (domain.getState().equals(DomainState.A)
                                && domain.getUpdatingDomainId() != null)) {
                    String categoryName = msgService.getMessage("category.standard");
                    if (isMetrics(categoryId)) {
                        categoryName = msgService.getMessage("category.index");
                    }
                    for(DomainDto o: allResult){
                        if(ObjectUtils.equals(o.getDomainCode(),domain.getDomainCode())){
                            o.setErrorMsg(msgService.getMessage("codeOfCataIsInAuditingState", categoryName, domain.getDomainCode(), categoryName));
                            needToRemove.add(o.getDomainCode());
                            break;
                        }
                    }
                }
            }
            if (domain.getUpdatingDomainId() == null) {
                allOldDomainMap.put(domain.getDomainCode(), domain);
            }

//            if (DomainState.A.equals(domain.getState())) {
            dbChineseNames.add(domain.getChineseName());
//            }
        }

        logger.info("step1 cost:" + (System.currentTimeMillis() - start));

        List<Domain> toBeSaved = new ArrayList<>();
        List<Domain> graphOldDomain = new ArrayList<>();
        List<DomainVersion> toBeSavedDomainVersions = new LinkedList<>();
        List<EditHistoryEntity> toBeSavedEditorHistories = new LinkedList<>();

        long now = System.currentTimeMillis();

        if (!needToRemove.isEmpty()) {
            hasError = true;
            importDomainCodeKeyMap.keySet().removeAll(needToRemove);
        }

        List<String> firstCreatedDomainCodes = new ArrayList<>();

        for (Domain domain : importDomainCodeKeyMap.values()) {
            Date currentDate = new Date(now++);

            Domain oldDomain = allOldDomainMap.get(domain.getDomainCode());
            String categoryName = msgService.getMessage("category.standard.data");
            if (domain.getCategoryId() != null && isMetrics(domain.getCategoryId())) {
                categoryName = msgService.getMessage("category.index.data");
            }
            if (oldDomain == null) { //1. 如果导入的code在数据库中不存在，那么则直接保存为已发布
                if (dbChineseNames.contains(domain.getChineseName())) {
                    hasError = true;
                    for (DomainDto o : allResult) {
                        if (ObjectUtils.equals(o.getChineseName(), domain.getChineseName())) {
                            o.setErrorMsg(msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName));
                            needToRemove.add(o.getDomainCode());
                            break;
                        }
                    }

                    continue;

                }

                domain.setState(DomainState.A);
                domain.setVersion(1);
                domain.setFirstPublish(currentDate);
                if (ignoreError || !hasError) {
                    createDomainVersion(domain, username, msgService.getMessage("importXIsPublished", categoryName),
                            toBeSavedDomainVersions, toBeSavedEditorHistories);
                }
                toBeSaved.add(domain);

                firstCreatedDomainCodes.add(domain.getDomainCode());
            } else if (DomainState.A
                    .equals(oldDomain.getState())) { //2. 如果导入的code在数据库中存在，状态为已发布，则直接替换
//                if (publishedChineseNames.contains(domain.getChineseName())
//                        && ObjectUtils.notEqual(oldDomain.getChineseName(), domain.getChineseName())) {
//                    hasError = true;
//
//                    for (DomainDto o : allResult) {
//                        if (ObjectUtils.equals(o.getChineseName(), domain.getChineseName())) {
//                            o.setErrorMsg(msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName));
//                            needToRemove.add(o.getDomainCode());
//                            break;
//                        }
//                    }
//
//                    continue;
//                }

                domain.setState(DomainState.A);
                domain.setVersion(oldDomain.getVersion() + 1);
                domain.setDomainId(oldDomain.getDomainId());
                domain.setCreateTime(oldDomain.getCreateTime());
                domain.setFirstPublish(oldDomain.getFirstPublish());
                //处理历史文档
                domain.setDocumentIds(oldDomain.getDocumentIds());

                if (ignoreError || !hasError) {
                    createDomainVersion(domain, username, msgService.getMessage("importXIsPublished", categoryName),
                            toBeSavedDomainVersions, toBeSavedEditorHistories);
                }
                toBeSaved.add(domain);
                graphOldDomain.add(cloneDomain(oldDomain, true));
            } else if (DomainState.D.equals(oldDomain.getState())
                    && oldDomain.getUpdatingDomainId()
                    == null) {  //3. 如果导入的code在数据库中存在，状态为待审核（updatingDomainId不能有值），则直接替换成已发布
//                if (publishedChineseNames.contains(domain.getChineseName())) {
//                    hasError = true;
//
//                    for (DomainDto o : allResult) {
//                        if (ObjectUtils.equals(o.getChineseName(), domain.getChineseName())) {
//                            o.setErrorMsg(msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName));
//                            needToRemove.add(o.getDomainCode());
//                            break;
//                        }
//                    }
//
//                    continue;
//                }

                domain.setState(DomainState.A);
                domain.setVersion(1);
                domain.setDomainId(oldDomain.getDomainId());
                domain.setCreateTime(oldDomain.getCreateTime());
                domain.setFirstPublish(currentDate);
                //处理历史文档
                domain.setDocumentIds(oldDomain.getDocumentIds());

                if (ignoreError || !hasError) {
                    createDomainVersion(domain, username, msgService.getMessage("importXIsPublished", categoryName),
                            toBeSavedDomainVersions, toBeSavedEditorHistories);
                }
                toBeSaved.add(domain);
                graphOldDomain.add(cloneDomain(oldDomain, true));
            }
            //4. 其他状态，比如已废弃，则不进行更改
        }

        res.setDomainDto(allResult);
        res.setInsertDomain(toBeSaved);

        if (ignoreError || !hasError) {
            if (!CollectionUtils.isEmpty(toBeSavedDomainVersions)) {
                domainVersionRepo.saveAll(toBeSavedDomainVersions);
            }
            if (!CollectionUtils.isEmpty(toBeSavedEditorHistories)) {
                editHistoryRepo.saveAll(toBeSavedEditorHistories);
            }

            logger.info("step2 cost:" + (System.currentTimeMillis() - start));
            saveSynonymForGraph(toBeSaved);
            logger.info("step3 cost:" + (System.currentTimeMillis() - start));
            domainRepo.saveAll(toBeSaved);
            // 保存关联指标节点到neo4j
            domainGraphHelperSave(toBeSaved, graphOldDomain);
            logger.info("step4 cost:" + (System.currentTimeMillis() - start));
            //初始化内置关系
            if (categoryId == DOMAIN_CATEGORY_ID) {
                dataRuleService.autoBindBuiltInDataRule(firstCreatedDomainCodes);
            }

            //sendEventToKafka
            try {
                sendDomainUpdateEvent(toBeSaved, categoryId);
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        }

        return res;
    }

    protected void sendDomainUpdateEvent(List<Domain> toBeSaved, Long categoryId) {
        if (CollectionUtils.isEmpty(toBeSaved)) {
            return;
        }
        logger.info("send domain update kafka event...");

        List<DomainDto> domainDtoList = convertToListDomainDto(toBeSaved);

        int sendNumber = 0;
        for (List<DomainDto> partition : Lists.partition(domainDtoList, kafkaSyncBatchSize)) {
            KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
            UpdateDataStandardMessage message = new UpdateDataStandardMessage(
                    partition,
                    new ArrayList<>(),
                    DataStandardType.getTypeByCategoryId(categoryId));
            message.setMsgId(System.currentTimeMillis());
            message.setSendTime(new Date());
            kafkaPublishService.sendMessage(updateDomainTopic, message);
            sendNumber += partition.size();
            logger.info("send [{}/{}] size domain change to kafka... ", sendNumber, domainDtoList.size());
        }
    }

    public DomainParaDto addImportDomainNotPublish(Map<String, Domain> importDomainCodeKeyMap,
                                                   Long categoryId, Map<String, DomainDto> importDomainDtoCodeKeyMap, boolean ignoreError, List<DomainDto> result) {
        boolean hasError = false;
        if (importDomainDtoCodeKeyMap.size() > importDomainCodeKeyMap.size()) {
            hasError = true;
        }
        List<Domain> oldAllDomains = domainRepo.findAllByCategoryIdEquals(categoryId);
        List<Domain> toBeUpdatedDomains = new LinkedList<>();
        List<DomainExt> toBeUpdatedDomainExts = new LinkedList<>();
        List<Domain> graphOldDomain = new ArrayList<>();
        Map<String, Domain> oldUpdatingIdDomainMap = new HashMap<>();
        Set<String> toUpdateDomainCodes = new HashSet<>();
        Set<String> allOldDomainCodes = new HashSet<>();
        Set<String> newChineseName = new HashSet<>();
        Set<String> dbChineseNames = new HashSet<>();
        DomainParaDto res = new DomainParaDto();
        Set<String> needToRemove = new HashSet<>();

        for (Domain domain : importDomainCodeKeyMap.values()) {
            newChineseName.add(domain.getChineseName());
        }

        for (Domain domain : oldAllDomains) {
            if (importDomainCodeKeyMap.containsKey(domain.getDomainCode()) && domain.getState()
                    .equals(DomainState.C)) {
                String categoryName = msgService.getMessage("category.standard");
                if (isMetrics(categoryId)) {
                    categoryName = msgService.getMessage("category.index");
                }
                needToRemove.add(domain.getDomainCode());
                hasError = true;
                for(DomainDto o: result){
                    if(ObjectUtils.equals(o.getDomainCode(),domain.getDomainCode())){
                        o.setErrorMsg(StringUtils.isBlank(o.getErrorMsg())? msgService.getMessage("codeOfCataIsInAuditingState", categoryName, domain.getDomainCode(), categoryName) : o.getErrorMsg() + ";" + msgService.getMessage("codeOfCataIsInAuditingState", categoryName, domain.getDomainCode(), categoryName));
                        break;
                    }
                }
                continue;
            }
            if (!StringUtils.isEmpty(domain.getUpdatingDomainId())) {
                oldUpdatingIdDomainMap.put(domain.getUpdatingDomainId(), domain);
            }
            allOldDomainCodes.add(domain.getDomainCode());

//            if (DomainState.A.equals(domain.getState())) {
            dbChineseNames.add(domain.getChineseName());
//            }
        }

        for (Domain domain : oldAllDomains) {
            String categoryName = msgService.getMessage("category.standard");
            if (isMetrics(categoryId)) {
                categoryName = msgService.getMessage("category.index");
            }
            //如果已经存在已经发布的相同中文名称的数据标准，并且当前标准中文名称和新导入的标准同标准代码的中文名称不同，那么我们认为是有冲突的
            if ( newChineseName.contains(domain.getChineseName())
                    && (!importDomainCodeKeyMap.containsKey(domain.getDomainCode())
                    || ObjectUtils.notEqual(domain.getChineseName(),
                    importDomainCodeKeyMap.get(domain.getDomainCode()).getChineseName()))) {

                hasError = true;

                if(importDomainCodeKeyMap.containsKey(domain.getDomainCode())) {
                    for(DomainDto o: result){
                        if(ObjectUtils.equals(o.getDomainCode(),domain.getDomainCode())){
                            o.setErrorMsg(StringUtils.isBlank(o.getErrorMsg())? msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName) : o.getErrorMsg() + ";"+ msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName));
                            needToRemove.add(o.getDomainCode());
                            break;
                        }
                    }
                } else {
                    for (DomainDto o : result) {
                        if (ObjectUtils.equals(o.getChineseName(), domain.getChineseName())) {
                            o.setErrorMsg(StringUtils.isBlank(o.getErrorMsg())? msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName) : o.getErrorMsg() + ";"+ msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName));
                            needToRemove.add(o.getDomainCode());
                            break;
                        }
                    }
                }
                continue;
            }
            if (!importDomainCodeKeyMap.containsKey(domain.getDomainCode())
                    || domain.getState().equals(DomainState.X)
                    || toUpdateDomainCodes.contains(domain.getDomainCode())
                    || oldUpdatingIdDomainMap.containsKey(domain.getDomainId())) {
                continue;
            }

            Domain newDomain = importDomainCodeKeyMap.get(domain.getDomainCode());
            newDomain.setDomainId(domain.getDomainId());
            newDomain.setSubmitter(domain.getSubmitter());
            newDomain.setFirstPublish(domain.getFirstPublish());
            newDomain.setDocumentIds(domain.getDocumentIds());
            newDomain.setDescriptionDepartment(domain.getDescriptionDepartment());

            if (domain.getState().equals(DomainState.D)) { // 第一种情况，domain是开发中的，没有处于已发布的，则直接更新原开发中的标准
//                if (publishedChineseNames.contains(newDomain.getChineseName())) {
//                    hasError = true;
//                    for(DomainDto o: result){
//                        if(ObjectUtils.equals(o.getDomainCode(),domain.getDomainCode())){
//                            o.setErrorMsg(msgService.getMessage("nameAlreadyExistByThis", domain.getChineseName(), categoryName));
//                            needToRemove.add(o.getDomainCode());
//
//                            break;
//                        }
//                    }
//                    continue;
//                }
                graphOldDomain.add(cloneDomain(domain, true));
            } else if (domain.getState().equals(DomainState.A)
                    && StringUtils.isEmpty(
                    domain.getUpdatingDomainId())) { // 第二种情况，domain是已发布的，但是没有开发中的复制副本，则复制一个开发中的副本
                newDomain.setDomainId(getUUID());
                newDomain.setCopyDomain(true);
                domain.setUpdatingDomainId(newDomain.getDomainId());
            } else if (domain.getState().equals(DomainState.A)
                    && !StringUtils.isEmpty(
                    domain.getUpdatingDomainId())) { // 第三种情况，domain是已发布的，并且有一个开发中的复制副本，则更新开发中的副本
                newDomain.setDomainId(domain.getUpdatingDomainId());
            } else {
                continue;
            }

            toUpdateDomainCodes.add(domain.getDomainCode());
            toBeUpdatedDomains.add(newDomain);
            DomainDto domainDto = importDomainDtoCodeKeyMap.get(domain.getDomainCode());
            if(domainDto instanceof DomainExtDto) {
                DomainExt domainExt = ((DomainExtDto) domainDto).buildDomainExt();
                domainExt.setdId(newDomain.getDomainId());
                toBeUpdatedDomainExts.add(domainExt);
            }
        }

        if (!needToRemove.isEmpty()) {
            hasError = true;
            importDomainCodeKeyMap.keySet().removeAll(needToRemove);
        }

        List<String> firstCreatedDomainCodes = new ArrayList<>();
        List<Domain> toBeSaveDomainDirectory = new ArrayList<>();
        List<DomainExt> toBeSaveDomainExt = new ArrayList<>();
        for (Map.Entry<String, Domain> newDomainEntry : importDomainCodeKeyMap.entrySet()) {
            Domain newDomain = newDomainEntry.getValue();
            String domainCode = newDomainEntry.getKey();
            DomainDto domainDto = importDomainDtoCodeKeyMap.get(domainCode);
            if(domainDto instanceof DomainExtDto) {
                toBeSaveDomainExt.add(((DomainExtDto) domainDto).buildDomainExt());
            }
            if (!allOldDomainCodes.contains(newDomain.getDomainCode())) {
                newDomain.setState(DomainState.D);
                toBeSaveDomainDirectory.add(newDomain);
                firstCreatedDomainCodes.add(newDomain.getDomainCode());
            }
        }

        toBeSaveDomainDirectory.addAll(toBeUpdatedDomains);
        toBeSaveDomainExt.addAll(toBeUpdatedDomainExts);
        res.setInsertDomain(toBeSaveDomainDirectory);
        res.setDomainDto(result);

        if (ignoreError || !hasError) {
            saveSynonymForGraph(toBeSaveDomainDirectory);

            for (Domain domain : toBeSaveDomainDirectory) {
                DomainDto domainDto = importDomainDtoCodeKeyMap.get(domain.getDomainCode());
                // 保存指标修饰词
                List<Long> modifierRefIds = new ArrayList<>();
                if (!CollectionUtils.isEmpty(domainDto.getModifierRefIds())) {
                    modifierRefIds.addAll(domainDto.getModifierRefIds());
                }
                if (!CollectionUtils.isEmpty(domainDto.getTimeModifierRefIds())) {
                    modifierRefIds.addAll(domainDto.getTimeModifierRefIds());
                }
                if (modifierRefIds.size() > 0) {
                    modifierTypeService.saveModifierRef(modifierRefIds, domain.getDomainId());
                }
            }

            domainRepo.saveAll(toBeSaveDomainDirectory);
            domainExtRepo.saveAll(toBeSaveDomainExt);
            // 保存关联指标节点到neo4j
            domainGraphHelperSave(toBeSaveDomainDirectory, graphOldDomain);
            // 初始化内置数据规则
            if (Objects.equals(categoryId, DOMAIN_CATEGORY_ID)) {
                dataRuleService.autoBindBuiltInDataRule(firstCreatedDomainCodes);
            }
        }
        return res;
    }

    public boolean compareDomainAttributeMap(Map<Long, String> a, Map<Long, String> b) {
        if (CollectionUtils.isEmpty(a) && CollectionUtils.isEmpty(b)) {
            return true;
        }

        return ObjectUtils.equals(a, b);
    }

    public boolean compareDomainAttributeList(List<String> a, List<String> b) {
        if (CollectionUtils.isEmpty(a) && CollectionUtils.isEmpty(b)) {
            return true;
        }

        return ObjectUtils.equals(a, b);
    }

    public boolean compareDomainAttributeStr(String a, String b) {
        if (StringUtils.isEmpty(a) && StringUtils.isEmpty(b)) {
            return true;
        }

        return StringUtils.equals(a, b);
    }

    /**
     * 保存同义词节点到 neo4j
     */
    public void saveSynonymForGraph(List<Domain> toBeUpdatedDomains) {
        if (!graphEnable) {
            return;
        }
        if (getGraphObjectProcessor() != null && !CollectionUtils.isEmpty(toBeUpdatedDomains)) {
            ArrayList<DomainSynonymGraphHelper> domainSynonymGraphHelpers = new ArrayList<>();
            for (Domain toBeUpdatedDomain : toBeUpdatedDomains) {
                if (Strings.isNullOrEmpty(toBeUpdatedDomain.getSynonym())) {
                    continue;
                }
                DomainSynonymGraphHelper domainSynonymGraphHelper = new DomainSynonymGraphHelper();
                domainSynonymGraphHelper.setSynonym(toBeUpdatedDomain.getSynonym());
                domainSynonymGraphHelpers.add(domainSynonymGraphHelper);
            }
            getGraphObjectProcessor().objectsSave(domainSynonymGraphHelpers, SaveType.PERSIST);
        }
    }

    public DomainDto convertDomainSomePropertiesIdToName(DomainDto domainDto) {
        if (domainDto == null) {
            return null;
        }

        return convertDomainSomePropertiesIdToName(Collections.singletonList(domainDto)).get(0);
    }

    @Override
    public List<DomainDto> convertDomainSomePropertiesIdToName(List<DomainDto> domainDtos) {
        if (CollectionUtils.isEmpty(domainDtos)) {
            return domainDtos;
        }

        Set<String> orgBms = new HashSet<>();
        Set<Long> categoryIds = new HashSet<>();
        Set<Long> dimensionIds = new HashSet<>();
        Set<Long> dimensionValueIds = new HashSet<>();

        for (DomainDto domainDto : domainDtos) {
            if (domainDto.getOwnerOrg() != null) {
                orgBms.add(domainDto.getOwnerOrg());
            }
            if (domainDto.getDescriptionDepartment() != null) {
                orgBms.add(domainDto.getDescriptionDepartment());
            }
            if (domainDto.getAuthCategoryId() != null) {
                categoryIds.add(domainDto.getAuthCategoryId());
            }
            // 关联维度值
            if (!CollectionUtils.isEmpty(domainDto.getRelationDimensionValues())) {
                for (MetricRelationDimensionValueDto relationDimensionValue : domainDto.getRelationDimensionValues()) {
                    Set<SimpleDimensionValueDto> dimensionValues = relationDimensionValue.getDimensionValues();
                    if (!CollectionUtils.isEmpty(dimensionValues)) {
                        for (SimpleDimensionValueDto dimensionValue : dimensionValues) {
                            dimensionIds.add(dimensionValue.getDimensionId());
                            dimensionValueIds.add(dimensionValue.getCodeId());
                        }
                    }
                }
            }
        }

        Map<String, String> orgMap = new HashMap<>();
        Map<Long, String> categoryMap = new HashMap<>();
        HashMap<Long, Dimension> dimensionHashMap = new HashMap<>();
        HashMap<Long, DimensionValue> dimensionValueHashMap = new HashMap<>();
        if (!orgBms.isEmpty()) {
            OrganizationService organizationService = RemoteServiceGetter.getOrganizationService();
            List<OrganizationDto> orgDtos = organizationService
                    .getOrganizationsByBms(new ArrayList<>(orgBms));
            for (OrganizationDto orgDto : orgDtos) {
                orgMap.put(orgDto.getBm(), orgDto.getFullName());
            }
        }

        if (!categoryIds.isEmpty()) {
            List<ModelCategoryDto> categories = RemoteServiceGetter
                    .getModelCategoryService()
                    .getModelCategoriesByIds(categoryIds);
            if (!CollectionUtils.isEmpty(categories)) {
                for (ModelCategoryDto category : categories) {
                    categoryMap.put(category.getCategoryId(), category.getCategoryName());
                }
            }
        }

        if (!dimensionIds.isEmpty()) {
            for (List<Long> ids : Lists.partition(Lists.newArrayList(dimensionIds), 999)) {
                List<Dimension> dimensions = dimensionRepository.findAllByIds(ids);
                if (!CollectionUtils.isEmpty(dimensions)) {
                    for (Dimension dimension : dimensions) {
                        dimensionHashMap.put(dimension.getDimensionId(), dimension);
                    }
                }
            }
        }
        if (!dimensionValueIds.isEmpty()) {
            for (List<Long> ids : Lists.partition(Lists.newArrayList(dimensionValueIds), 999)) {
                List<DimensionValue> dimensionValues = dimensionValueRepository.findAllByIds(ids);
                if (!CollectionUtils.isEmpty(dimensionValues)) {
                    for (DimensionValue dimensionValue : dimensionValues) {
                        dimensionValueHashMap.put(dimensionValue.getCodeId(), dimensionValue);
                    }
                }
            }
        }

        for (DomainDto domainDto : domainDtos) {
            if (domainDto.getDescriptionDepartment() != null) {
                domainDto.setDescriptionDepartmentName(
                        orgMap.getOrDefault(domainDto.getDescriptionDepartment(),
                                domainDto.getDescriptionDepartment()));
            }
            if (domainDto.getOwnerOrg() != null) {
                domainDto.setOwnerOrgName(
                        orgMap.getOrDefault(domainDto.getOwnerOrg(), domainDto.getOwnerOrg()));
            }
            if (domainDto.getAuthCategoryId() != null) {
                domainDto.setAuthCategoryName(categoryMap.get(domainDto.getAuthCategoryId()));
            }
            if (!CollectionUtils.isEmpty(domainDto.getRelationDimensionValues())) {
                for (MetricRelationDimensionValueDto relationDimensionValue : domainDto.getRelationDimensionValues()) {
                    Set<SimpleDimensionValueDto> dimensionValues = relationDimensionValue.getDimensionValues();
                    if (!CollectionUtils.isEmpty(dimensionValues)) {
                        for (SimpleDimensionValueDto simpleDimensionValueDto : dimensionValues) {
                            if (simpleDimensionValueDto.getCodeId() == null
                                    && simpleDimensionValueDto.getDimensionId() == null) {
                                continue;
                            }
                            DimensionValue dimensionValue = dimensionValueHashMap.get(
                                    simpleDimensionValueDto.getCodeId());
                            Dimension dimension = dimensionHashMap.get(
                                    simpleDimensionValueDto.getDimensionId());
                            if (dimensionValue == null || dimension == null) {
                                continue;
                            }
                            simpleDimensionValueDto.setChineseName(dimensionValue.getChineseName());
                            simpleDimensionValueDto.setDimensionName(dimension.getDimensionName());
                            Map<Long, String> levelMap = dimension.getHierarchy().stream().collect(
                                    Collectors.toMap(DimensionCode::getOrder,
                                            DimensionCode::getChName));
                            simpleDimensionValueDto.setLevelName(
                                    levelMap.get(simpleDimensionValueDto.getLvlId()));
                        }
                    }
                }
            }
        }

        return domainDtos;
    }

    public void setDomainPath(DomainDto domainDto, Long categoryId, DomainTreeNodeDto domainTreeNodeDto) {
        String categoryName = msgService.getMessage("category.standard");
        if (isMetrics(categoryId)) {
            categoryName = msgService.getMessage("category.index");
        }
        // 目录不存在无法导入
        if (domainDto.getPath() == null || domainDto.getPath().isEmpty()) {
            domainDto.setErrorMsg(categoryName + msgService.getMessage("hasNoExistPathToImport", domainDto.getChineseName()));
        }

        /* 检验标准目录是否存在,不存在直接退出 */
        // 获得标准目录root节点, 每次循环重新获取


        // 当前标准对应的目录的folderId
        LinkedList<String> currentPath = new LinkedList<>();
        currentPath.add(domainTreeNodeDto.getName());
        getFolderIdByPath(domainTreeNodeDto, currentPath, domainDto.getPathStr(), domainDto);
        if (!Strings.isNullOrEmpty(domainDto.getErrorMsg())) {
            domainDto.setErrorMsg(domainDto.getErrorMsg());
            return;
        }
        List<String> targetPaths = new ArrayList<>(domainDto.getPath());

        // 领域数据标准创建路径时，增加根目录
        if (domainDto.getCategoryId() > 4) {
            targetPaths.add(0, domainTreeNodeDto.getName());
        }

        List<Long> folderIds = new ArrayList<>();
        getFolderIdByPath(Lists.newArrayList(domainTreeNodeDto), targetPaths, folderIds);
        if (targetPaths.size() > 0) {
            //创建目录
            if (folderIds.size() <= 0) {
                throw new InvalidArgumentException(
                        msgService.getMessage("domainRootFolderCannotAdd"));
            }
            DomainFolderDto domainFolderDto = new DomainFolderDto();
            Long parentId = folderIds.get(folderIds.size() - 1);
            for (String pathName : targetPaths) {
                domainFolderDto.setParentId(parentId);
                domainFolderDto.setName(pathName);
                domainFolderDto = createFolder(domainFolderDto);
                parentId = domainFolderDto.getId();
            }
            getRoot(true);
            DomainTreeNodeDto domainTreeNode = loadDomainTree(null, categoryId,
                    AuthTools.currentUsername(), true);
            BeanUtils.copyProperties(domainTreeNode, domainTreeNodeDto);
            domainDto.setFolderId(parentId);
        } else {
            domainDto.setFolderId(folderIds.get(folderIds.size() - 1));
        }
        if (domainDto.getFolderId() == 1 || domainDto.getFolderId() == 2) {
            domainDto.setErrorMsg(msgService.getMessage("domainRootFolderCannotAdd"));
        }

    }

    public void getFolderIdByPath(DomainTreeNodeDto domainTreeNodeDto,
                                   LinkedList<String> currentPath, String targetPath, DomainDto domainDto) {
        String curPathStr = StringUtils.join(currentPath, "/");
        if (curPathStr.equals(targetPath)) {
            domainDto.setFolderId(domainTreeNodeDto.getFoldId());
            return;
        }

        if (domainTreeNodeDto.getNodes() == null) {
            return;
        }

        for (DomainTreeNodeDto children : domainTreeNodeDto.getNodes()) {
            currentPath.add(children.getName());
            getFolderIdByPath(children, currentPath, targetPath, domainDto);
            currentPath.removeLast();
        }
    }

    public void getFolderIdByPath(List<DomainTreeNodeDto> nodeDtos, List<String> targetPaths,
                                   List<Long> folderIds) {
        if (nodeDtos != null && nodeDtos.size() > 0) {
            for (DomainTreeNodeDto nodeDto : nodeDtos) {
                if (nodeDto.getName().equals(targetPaths.get(0))) {
                    folderIds.add(nodeDto.getFoldId());
                    targetPaths.remove(0);
                    if (targetPaths.size() > 0) {
                        getFolderIdByPath(nodeDto.getNodes(), targetPaths, folderIds);
                    }
                    break;
                }
            }
        }
    }

    public void setDomainUdpForBasicDomain(List<DomainDto> domainDtos, File uploadFile, Long categoryId)
            throws Exception {
        Sheet sheet = new XSSFWorkbook(uploadFile).getSheetAt(0);
        List<DomainUdpDto> list = getDomainUdps(categoryId);
        //设置初始udp的值，即便没有也要设置空值
        Map<Long, String> udpMap = new HashMap<>();
        List<String> udpNameList = new ArrayList<>();
        Set<String> mustUdpSet = new HashSet<>();
        for (DomainUdpDto domainUdpDto : list) {
            if (domainUdpDto.isRequired()) {
                mustUdpSet.add(domainUdpDto.getName());
            }
            udpMap.put(domainUdpDto.getUdpId(), "");
            udpNameList.add(domainUdpDto.getName());
        }
        Map<String, DomainDto> domainMap = new HashMap<>();
        for (DomainDto domainDto : domainDtos) {
            domainDto.setAdditionalProperties(new HashMap<>(udpMap));
             domainMap.put(domainDto.getChineseName(), domainDto);
        }
        // 必填项判断，这个列表存放缺失的必填udp
        ArrayList<String> missingUdpList = new ArrayList<>(mustUdpSet);
        //标准编码的下标
        int domainNameIndex = 0;
        //udp属性的下标
        List<Integer> updIndexList = new ArrayList<>();
        Row rowTitle = sheet.getRow(1);
        for (int i = 0; i <= rowTitle.getLastCellNum(); i++) {
            String headName = getCellStringValue(rowTitle.getCell(i));
            if (udpNameList.contains(headName)) {
                updIndexList.add(i);
                missingUdpList.remove(headName);
            }
            if ((categoryId == 1 || categoryId > 3) && msgService.getMessage("BasicDomain.head.name").equals(headName)) {
                domainNameIndex = i;
            }
            if (categoryId == 2 && msgService.getMessage("BasicDomain.head.name").equals(headName)) {
                domainNameIndex = i;
            }
        }
        if (!missingUdpList.isEmpty()) {
            throw new InvalidArgumentException(msgService.getMessage("updPropCannotBeNull", missingUdpList));
        }
        if (updIndexList.isEmpty()) {
            return;
        }

        //给每个标准设置udp
        for (int rowIndex = 2; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row currentRow = sheet.getRow(rowIndex);
            if (currentRow == null) {
                continue;
            }
            String domainName = (String) DataUtility
                    .getCellFormatValue(currentRow.getCell(domainNameIndex));
            // 部分错误数据我们不处理
            if(Strings.isNullOrEmpty(domainName)){
                continue;
            }
            if (!domainMap.containsKey(domainName.trim())) {
                if(mustUdpSet.isEmpty()){
                    continue;
                }else {
                    throw new RuntimeException(msgService.getMessage("updPropValueCannotBeNull"));
                }
            }
            DomainDto domainDto = domainMap.get(domainName.trim());
            // 只有前面校验没问题的数据，我们才会处理udp
            if (!Strings.isNullOrEmpty(domainDto.getErrorMsg())) {
                continue;
            }
            for (int cellIndex : updIndexList) {
                String udpName = (String) DataUtility
                        .getCellFormatValue(rowTitle.getCell(cellIndex));
                DomainUdpDto domainUdpDto = checkUdpNameIsExit(udpName, list);
                if (domainUdpDto == null) {
                    continue;
                }
                String stringValue = (String) DataUtility
                        .getCellFormatValue(currentRow.getCell(cellIndex));
                if(StringUtils.isBlank(stringValue) && mustUdpSet.contains(udpName)){
                    domainDto.setErrorMsg(msgService.getMessage("updPropCannotBeNull", udpName));
                    continue;
                }
                if ("List".equals(domainUdpDto.getDataType())
                        && domainUdpDto.getCandidates() != null
                        && !domainUdpDto.getCandidates().contains(stringValue)
                        && !Strings.isNullOrEmpty(stringValue)) {
                    domainDto.setErrorMsg(msgService.getMessage("updPropNoFindEnumVals", domainUdpDto.getName(), stringValue));
                    continue;
                }

                domainDto.getAdditionalProperties().put(domainUdpDto.getUdpId(), stringValue);
            }
        }
    }

    public DomainUdpDto checkUdpNameIsExit(String stringCellValue, List<DomainUdpDto> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        for (DomainUdpDto domainUdpDto : list) {
            if (domainUdpDto.getName().equals(stringCellValue)) {
                return domainUdpDto;
            }
        }
        return null;
    }

    public String getCellStringValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        DataFormatter formatter = new DataFormatter(Locale.CHINESE);
        return formatter.formatCellValue(cell);
    }

    public void convertDomainSomePropertiesNameToId(List<DomainDto> domainDtos) {
        if (CollectionUtils.isEmpty(domainDtos)) {
            return;
        }

        Set<String> categoryNames = new HashSet<>();

        for (DomainDto domainDto : domainDtos) {
            if (domainDto.getAuthCategoryName() != null) {
                categoryNames.add(domainDto.getAuthCategoryName());
            }
        }

        Map<String, Long> categoryMap = new HashMap<>();
        if (!categoryNames.isEmpty()) {
            List<ModelCategoryDto> categories = RemoteServiceGetter
                    .getModelCategoryService()
                    .getModelCategoriesByNames(categoryNames);

            if (!CollectionUtils.isEmpty(categories)) {
                for (ModelCategoryDto category : categories) {
                    categoryMap.put(category.getCategoryName(), category.getCategoryId());
                }
            }
        }

        for (DomainDto domainDto : domainDtos) {
            if (domainDto.getAuthCategoryName() != null) {
                domainDto.setAuthCategoryId(categoryMap.get(domainDto.getAuthCategoryName()));
            }
        }
    }

    public File addUdpAttributeToTemplate(List<DomainUdpDto> udps, File templateFile,
                                           File udpFile, Map<Integer, String> udpMap) {
        try (ExcelUpdater updater = new ExcelUpdater(templateFile.getAbsolutePath(),
                udpFile.getAbsolutePath())) {
            updater.open();

            XSSFWorkbook wb = new XSSFWorkbook(templateFile);
            XSSFSheet sheet = wb.getSheetAt(0);
            Row header = sheet.getRow(0);

            int standardPlus = 0;
            for (; standardPlus < header.getLastCellNum(); standardPlus++) {
                Cell cell = header.getCell(standardPlus);
                if (msgService.getMessage("domain.catalog.theme").equals(cell.getStringCellValue())) {
                    break;
                }
            }

            int tempCount = 0;
            udps.sort(Comparator.comparing(DomainUdpDto::getOrder));
            int indexCount;
            int lastCount = udps.get(0).getOrder();
            for (DomainUdpDto udp : udps) {
                indexCount = udp.getOrder();
                if (indexCount == lastCount) {
                    updater.insertNewColumnAfter(0, standardPlus, udp.getName());
                    udpMap.put(standardPlus + 1, udp.getName());
                    tempCount++;
                } else {
                    lastCount = udp.getOrder();
                    standardPlus = standardPlus + tempCount;
                    updater.insertNewColumnAfter(0, standardPlus, udp.getName());
                    udpMap.put(standardPlus + 1, udp.getName());
                }
            }
        } catch (Exception ex) {
            throw new UnexpectedStateException(
                    msgService.getMessage("templateFileCreateExists", ex.getMessage()), ex);
        }
        return udpFile;
    }

    public StandardParaDto loadCodeFile(File codeFile, Long categoryId, boolean newImport, boolean autoGenCode, String user) throws Exception {
        InputStream is = new FileInputStream(codeFile);
        XSSFWorkbook workbook = new XSSFWorkbook(is);
        StandardParaDto paraDto = new StandardParaDto();

        List<StandardCodeDto> codes = new ArrayList<>(500);
        HashMap<String, String> codeMap = new HashMap<>();
        try {
            XSSFSheet sheet = getFirstVisbleSheet(workbook);
            codes.addAll(parseCodeContent(sheet, user, categoryId, autoGenCode, codeMap));
        } catch (Exception ex) {
            throw new AndorjRuntimeException(ex.getMessage(), ex);
        }

        List<StandardCodeDto> dbStandCodeList = convertToListStandardCodeDto(standardCodeRepo.findAllCode());
        Map<String, StandardCodeDto> dbStandCodeMap = new HashMap<>();
        for (StandardCodeDto codeDto : dbStandCodeList) {
            dbStandCodeMap.put(codeDto.getCode(), codeDto);
        }
        for (StandardCodeDto standardCodeDto : codes) {
            standardCodeDto.setCategoryId(categoryId);

            if (standardCodeDto.getState() == null) {
                if (workflowEnable) {
                    standardCodeDto.setState(DomainState.D);
                } else {
                    standardCodeDto.setState(DomainState.A);
                }
            }
            //领域标准代码状态都是A
//            if (categoryId != 1) {
//                standardCodeDto.setState(DomainState.A);
//            }
            if (!newImport && dbStandCodeMap.containsKey(standardCodeDto.getCode())) {
                standardCodeDto.setErrorMsg(msgService.getMessage(msgService.getMessage("codeExists", standardCodeDto.getCode())));
                continue;
            }
            String refCode = standardCodeDto.getRefStandardCode();
            if (!StringUtils.isEmpty(refCode) && !dbStandCodeMap.containsKey(refCode)) {
                standardCodeDto.setErrorMsg(msgService.getMessage("mappingCodeNotExist", refCode));
                continue;
            }
            if (!StringUtils.isEmpty(refCode)&& !ObjectUtils.equals(dbStandCodeMap.get(refCode).getState(), DomainState.A)) {
                standardCodeDto.setErrorMsg(msgService.getMessage("mappingCodeNotPublish", refCode));
                continue;
            }
            if (standardCodeDto.getValues() == null) {
                continue;
            }
            StandardCodeDto refCodeDto = dbStandCodeMap.get(refCode);
            Map<String, StandardCodeValueDto> dbCodeValueMap = new HashMap<>();
            if (refCodeDto != null && refCodeDto.getValues() != null) {
                for (StandardCodeValueDto valueDto : refCodeDto.getValues()) {
                    dbCodeValueMap.put(valueDto.getValue(), valueDto);
                }
            }
            for (StandardCodeValueDto valueDto : standardCodeDto.getValues()) {
                if (valueDto.getRefValue() == null || Strings.isNullOrEmpty(
                        valueDto.getRefValue().getValue())) {
                    continue;
                }
                String refValue = valueDto.getRefValue().getValue();
                if (!dbCodeValueMap.containsKey(refValue)) {
                    valueDto.setErrorMsg(msgService.getMessage("mappingCodeValueNotExist", refValue));
                    continue;
                }
                valueDto.setRefValue(dbCodeValueMap.get(refValue));
            }
        }

        List<StandardCodeDto> errorDto = new ArrayList<>();
        List<StandardCodeDto> insertDto = new ArrayList<>();


        for (StandardCodeDto o : codes) {
            boolean isError = false;
            if (!Strings.isNullOrEmpty(o.getErrorMsg())) {
                errorDto.add(o);
                continue;
            }
            for (StandardCodeValueDto t : o.getValues()) {
                if (!Strings.isNullOrEmpty(t.getErrorMsg())) {
                    isError = true;
                    break;
                }
            }
            if (!isError) {
                insertDto.add(o);
            } else {
                errorDto.add(o);
            }
        }


        if (!insertDto.isEmpty()) {
            standardService.setStandardUdp(insertDto, codeFile, categoryId, codeMap);
        }

        for (StandardCodeDto o : insertDto) {
            if (!Strings.isNullOrEmpty(o.getErrorMsg())) {
                errorDto.add(o);
            }
        }
        insertDto.removeIf(o -> !Strings.isNullOrEmpty(o.getErrorMsg()));

        paraDto.setErrorDto(errorDto);
        paraDto.setInsertDto(insertDto);
        paraDto.setAllDto(codes);

        return paraDto;
    }

    public XSSFSheet getFirstVisbleSheet(XSSFWorkbook workbook) {
        XSSFSheet sheet = null;
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            if (workbook.isSheetVeryHidden(i) || workbook.isSheetHidden(i)) {
                continue;
            }
            sheet = workbook.getSheetAt(i);
            break;
        }
        return sheet;
    }

    public List<StandardCodeDto> parseCodeContent(Sheet sheet, final String username,
                                                   Long categoryId, boolean autoGenCode, HashMap<String, String> codeMap) {
        String categoryName = msgService.getMessage("category.standard");
        if (isMetrics(categoryId)) {
            categoryName = msgService.getMessage("category.index");
        }
        List<StandardCodeDto> result = new ArrayList<>(500);
        int firstRow = sheet.getFirstRowNum() + 1;
        int lastRow = sheet.getLastRowNum();

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
        if (categoryId == 1) {
            checkBasicCode(headerRow);
        } else {
            if (!msgService.getMessage("standardCode.keyword.theme").equals(col1)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.theme"), col1));
            }

            String col2 = getCellStringValue(headerRow.getCell(index++));
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
            if (!msgService.getMessage("standardCode.keyword.remark").equals(col5)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.remark"), col5));
            }

            if (categoryId > 1) {
                String colRefCode = getCellStringValue(headerRow.getCell(index++));
                if (!msgService.getMessage("standardCode.keyword.mappingCode").equals(colRefCode)) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.mappingCode"), colRefCode));
                }
            }

            String col7 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.codeV").equals(col7)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.codeV"), col7));
            }

            String col8 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.codeName").equals(col8)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.codeName"), col8));
            }

            String col9 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.pCodeV").equals(col9)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.pCodeV"), col9));
            }
            if (categoryId > 1) {
                String colRefCodeValue = getCellStringValue(headerRow.getCell(index++));
                if (!msgService.getMessage("standardCode.keyword.mCodeV").equals(colRefCodeValue)) {
                    throw new InvalidArgumentException(msgService
                            .getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.mCodeV"), colRefCodeValue));
                }
                String colRefCodeName = getCellStringValue(headerRow.getCell(index++));
                if (!msgService.getMessage("standardCode.keyword.mCodeVName").equals(colRefCodeName)) {
                    throw new InvalidArgumentException(msgService
                            .getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.mCodeVName"), colRefCodeName));
                }

            }

            String col10 = getCellStringValue(headerRow.getCell(index++));
            if (!msgService.getMessage("standardCode.keyword.order").equals(col10)) {
                throw new InvalidArgumentException(
                        msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.order"), col10));
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
        }

        List<StandardCodeValueDto> list = new ArrayList<>();
        String codeValue = "";
        List<String> domainCodes = null;
        String codeName = null;
        if (autoGenCode) {
            String colName = null;
            String colCode = null;
            int genCodeCounts = 0;
            //计算有效行数
            for (int i = firstRow; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (GeneralUtility.isRowEmpty(row, 11)) {
                    continue;
                }

                int curIndex = 2;
                colName = getCellStringValue(row.getCell(curIndex));
                if (Strings.isNullOrEmpty(colName)) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("zhNameNotNullLine", i));
                }

                if (!StringUtils.equals(codeName, colName)) {
                    colCode = getCellStringValue(row.getCell(--curIndex));
                    //只有code为空才会更新code
                    codeName = colName;
                    genCodeCounts++;
//                    if(StringUtils.isEmpty(colCode)){
//                        genCodeCounts ++;
//                    }
                }
            }
            if (genCodeCounts > 0) {
                domainCodes = generateService.getBatchDomainCodes(DatablauDomainType.STANDARD_CODE, genCodeCounts);
            } else {
                domainCodes = new ArrayList<>();
            }
        }


        int codeIndex = -1;
        codeName = null;
        Set<String> codes = new HashSet<>();
        for (int i = firstRow; i <= lastRow; i++) {
            try {
                Row row = sheet.getRow(i);
                if (GeneralUtility.isRowEmpty(row, 11)) {
                    continue;
                }

                int curIndex = 0;


                StandardCodeDto code = new StandardCodeDto();
                code.setDatasetName(getCellStringValue(row.getCell(curIndex++)));
                if (Strings.isNullOrEmpty(code.getDatasetName())) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("standardSubjectNotNullLine", i));
                }
                String colCode = getCellStringValue(row.getCell(curIndex++));

                code.setCode(colCode);

                code.setName(getCellStringValue(row.getCell(curIndex++)));
                if (Strings.isNullOrEmpty(code.getName())) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("zhNameNotNullLine", i));
                }


                if (!StringUtils.equals(code.getName(), codeName) && autoGenCode) {
                    codeName = code.getName();
                    codeIndex++;
                }

                if (autoGenCode && domainCodes != null && !domainCodes.isEmpty()) {
                    String autoCode = domainCodes.get(codeIndex);
                    codeMap.put(colCode, autoCode);
                    code.setCode(autoCode);
                }

                if (Strings.isNullOrEmpty(code.getCode()) && !autoGenCode) {
                    throw new InvalidArgumentException(
                            msgService.getMessage("standardCodeNotNullLine", i));
                }

//                checkCodeExists(code.getCode(), autoGenCode, categoryId, i);

                code.setEnglishName(getCellStringValue(row.getCell(curIndex++)));
                if (categoryId == 1) {
                    curIndex++;
                    code.setComment(getCellStringValue(row.getCell(curIndex++)));
                } else {
                    code.setComment(getCellStringValue(row.getCell(curIndex++)));
                }
                code.setSubmitter(username);
                code.setVersion(1);

                if (categoryId > 1) {
                    code.setRefStandardCode(getCellStringValue(row.getCell(curIndex++)));
                }

                StandardCodeValueDto standardCodeValueDto = new StandardCodeValueDto();
                if (categoryId == 1) {
                    Cell orderCell = row.getCell(curIndex++);
                    if (orderCell != null) {
                        String orderStr = getCellStringValue(orderCell);

                        if (!Strings.isNullOrEmpty(orderStr)) {
                            try {
                                int order = Integer.parseInt(orderStr);
                                if (order < 1) throw new InvalidArgumentException("");
                                standardCodeValueDto.setOrder(order);
                            } catch (InvalidArgumentException e) {
                                standardCodeValueDto.setErrorMsg(msgService.getMessage("seqLineLessOneError", i, orderStr));
                            } catch (Exception ex) {
                                standardCodeValueDto.setErrorMsg(msgService.getMessage("seqLineReadError", i, orderStr));
                            }
                        } else {
                            standardCodeValueDto.setErrorMsg(msgService.getMessage("seqLineReadError", i, orderStr));
                        }
                    } else {
                        standardCodeValueDto.setErrorMsg(msgService.getMessage("seqLineReadError", i, ""));
                    }

                    standardCodeValueDto.setValue(getCellStringValue(row.getCell(curIndex++)));
                    if (Strings.isNullOrEmpty(standardCodeValueDto.getValue())) {
//                        for (StandardCodeDto standardCodeDto : result) {
//                            if (standardCodeDto.getCode().equals(code.getCode())) {
//                                throw new IllegalArgumentException(msgService.getMessage("codeCannotBeRepeated", categoryName));
//                            }
//                        }
//                        code.setValues(new ArrayList<>());
//                        result.add(code);
//                        continue;
                        standardCodeValueDto.setErrorMsg(msgService.getMessage("codeValueCannotBeNull"));
                    }

                    standardCodeValueDto.setName(getCellStringValue(row.getCell(curIndex++)));
                    if (Strings.isNullOrEmpty(standardCodeValueDto.getName())) {
                        standardCodeValueDto.setErrorMsg(msgService.getMessage("codeDescrptionNotNull"));
                    }

                    standardCodeValueDto.setParentValue(getCellStringValue(row.getCell(curIndex++)));

                } else {
                    standardCodeValueDto.setValue(getCellStringValue(row.getCell(curIndex++)));
                    if (Strings.isNullOrEmpty(standardCodeValueDto.getValue())) {
//                        for (StandardCodeDto standardCodeDto : result) {
//                            if (standardCodeDto.getCode().equals(code.getCode())) {
//                                throw new IllegalArgumentException(msgService.getMessage("codeCannotBeRepeated", categoryName));
//                            }
//                        }
//                        code.setValues(new ArrayList<>());
//                        result.add(code);
//                        continue;
                        standardCodeValueDto.setErrorMsg(msgService.getMessage("codeValueCannotBeNull"));

                    }

                    standardCodeValueDto.setName(getCellStringValue(row.getCell(curIndex++)));
                    if (Strings.isNullOrEmpty(standardCodeValueDto.getName())) {
                        standardCodeValueDto.setErrorMsg(msgService.getMessage("codeDescrptionNotNull", i));
                    }

                    standardCodeValueDto.setParentValue(getCellStringValue(row.getCell(curIndex++)));
                    if (categoryId > 1) {
                        StandardCodeValueDto refCodeValueDto = new StandardCodeValueDto();
                        refCodeValueDto.setValue(getCellStringValue(row.getCell(curIndex++)));
                        refCodeValueDto.setName(getCellStringValue(row.getCell(curIndex++)));
                        standardCodeValueDto.setRefValue(refCodeValueDto);
                    }

                    Cell orderCell = row.getCell(curIndex++);
                    if (orderCell != null) {
                        String orderStr = getCellStringValue(orderCell);

                        if (!Strings.isNullOrEmpty(orderStr)) {
                            try {
                                int order = Integer.parseInt(orderStr);
                                standardCodeValueDto.setOrder(order);
                            } catch (Exception ex) {
                                standardCodeValueDto.setErrorMsg(msgService.getMessage("seqLineLessOneError", i, orderStr));
                            }
                        } else {
                            standardCodeValueDto.setErrorMsg(msgService.getMessage("seqLineReadError", i, orderStr));
                        }
                    } else {
                        standardCodeValueDto.setErrorMsg(msgService.getMessage("seqLineReadError", i, ""));
                    }
                }

                standardCodeValueDto.setDefinition(getCellStringValue(row.getCell(curIndex++)));
                standardCodeValueDto.setDefinition2(getCellStringValue(row.getCell(curIndex++)));
                standardCodeValueDto.setDefinition3(getCellStringValue(row.getCell(curIndex++)));
                // 编码取值不能和父编码取值相同
                if (!Strings.isNullOrEmpty(standardCodeValueDto.getParentValue())
                        &&Objects.equals(standardCodeValueDto.getParentValue(), standardCodeValueDto.getValue())) {
                    standardCodeValueDto.setErrorMsg(msgService.getMessage(msgService.getMessage("codeCannotSameAsParent")));
                }
                if (!codeValue.equals(code.getCode())) {
                    list = new ArrayList<>();
                    codeValue = code.getCode();
                    list.add(standardCodeValueDto);
                    code.setValues(list);
                    if (codes.contains(code.getCode())) {
                        // 当同一个标准编码被间隔之后，我们用后面的覆盖前面的，保证唯一
                        result.removeIf(o -> ObjectUtils.equals(o.getCode(), code.getCode()));
                        result.add(code);
                    } else {
                        result.add(code);
                        codes.add(code.getCode());
                    }
                } else {
                    if (!list.isEmpty()) {
                        for (StandardCodeValueDto item : list) {
                            if (item.getValue().equals(standardCodeValueDto.getValue())) {
                                standardCodeValueDto.setErrorMsg(msgService.getMessage("standardCodeExists", item.getValue()));
                            }
                        }
                    }
                    list.add(standardCodeValueDto);
                    code.setValues(list);
                }
            } catch (Exception ex) {
                logger.error(msgService.getMessage("importErrorMessage", i, ex.getMessage()), ex);
                throw new InvalidArgumentException(
                        msgService.getMessage("importErrorMessage", i, ex.getMessage()));
            }
        }

        return result;
    }

    public void checkBasicCode(Row headerRow) {
        int index = 0;
        String col1 = getCellStringValue(headerRow.getCell(index++));
        if (!msgService.getMessage("standardCode.keyword.theme").equals(col1)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("importStandCodeHeaderError", index, msgService.getMessage("standardCode.keyword.theme"), col1));
        }

        String col2 = getCellStringValue(headerRow.getCell(index++));
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
    }

    public List<NamingStandardDto> convertNamingStandardDtos(
            List<NamingStandardExcelDto> namingStandards) {
        List<NamingStandardDto> namingStandardDtos = new ArrayList<>();
        if (namingStandards == null) {
            return null;
        }
        for (NamingStandardExcelDto namingStandard : namingStandards) {
            NamingStandardDto namingStandardDto = new NamingStandardDto();
            namingStandardDto.setAbbreviation(namingStandard.getAbbreviation());
            namingStandardDto.setEnglishName(namingStandard.getEnglishName());
            namingStandardDto.setCategory(namingStandard.getCategory());
            namingStandardDto.setChineseName(namingStandard.getChineseName());
            namingStandardDtos.add(namingStandardDto);
        }
        return namingStandardDtos;
    }

    public class MonthlyResultRowExtractor implements RowMapper<MonthlyDomainData> {

        @Override
        public MonthlyDomainData mapRow(ResultSet rs, int rowNum) throws SQLException {
            Object year = rs.getObject(1);
            Object month = rs.getObject(2);
            Object count = rs.getObject(3);

            MonthlyDomainData res = new MonthlyDomainData();

            if (year instanceof String) {
                res.setYear(Integer.parseInt(year.toString()));
            } else if (year instanceof Number) {
                res.setYear(((Number) year).intValue());
            }

            if (month instanceof String) {
                res.setMonth(Integer.parseInt(month.toString()));
            } else if (month instanceof Number) {
                res.setMonth(((Number) month).intValue());
            }

            if (count instanceof Number) {
                res.setCount(((Number) count).intValue());
            }

            return res;
        }
    }


    @Override
    public List<String> getDomains(String name) {
        return domainRepo.findByNameLike(name);
    }

    @Override
    public Long getCodeCount(DomainState state) {
        return standardCodeRepo.countAllByState(state);
    }

    @Override
    public Long getCodeCountByDate(DomainState domainState, Date date) {
        return standardCodeRepo.countAllByStateAndCreateTimeLessThan(domainState, date);
    }

    @Override
    public Long getDomainOrIndexCount(DomainState state, Long categoryId) {
        return domainRepo.countAllByStateAndCategoryId(state, categoryId);
    }

    @Override
    public Long getDomainOrIndexCountByDate(DomainState domainState, Long categoryId, Date date) {
        return domainRepo.countAllByStateAndCategoryIdAndCreateTimeLessThan(domainState, categoryId, date);
    }

    @Override
    public DomainTreeNodeDto getDomainRootFolder(Long folderId) {
        Map<Long, DomainTreeNodeDto> treeMap = loadDomainCategoryTreeMap();
        DomainTreeNodeDto folder = treeMap.get(folderId);
        while (folder.getParentId() != 0L) {
            folder = treeMap.get(folder.getParentId());
        }
        return folder;
    }

    @Override
    public List<DomainFolder> getDomainFoldersByParentIdAndCatalog(Long parentId, String catalog) {
        return domainFolderRepo.findByParentIdAndCatalog(parentId, catalog);
    }

    @Override
    public Integer loadCodesIn(List<CodeDto> codes) {
        Map<String, Integer> orders = new HashMap<>();

        for (CodeDto code : codes) {
            code.setTimestamp(new Date());
            code.setSubmitter(AuthTools.currentUsernameFailFast());
            Integer order = orders.get(code.getCodeNumber());

            if (order == null) {
                order = 0;
            }

            if (code.getOrder() == null) {
                code.setOrder(order++);
            } else {
                order = Math.max(order, code.getOrder());
            }
            orders.put(code.getCodeNumber(), order);
        }

        List<StandardCodeDto> stdCodes = convertToCodeDto(codes);
        addPublicCodes(stdCodes, AuthTools.currentUsernameFailFast());
        return stdCodes.size();
    }

    public List<StandardCodeDto> convertToCodeDto(Iterable<CodeDto> codes) {
        List<StandardCodeDto> result = new ArrayList<>(500);
        if (codes != null) {
            Map<String, StandardCodeDto> map = new HashMap<>();

            for (CodeDto code : codes) {
                if (!map.containsKey(code.getCodeNumber())) {
                    StandardCodeDto newCode = new StandardCodeDto();
                    newCode.setCode(code.getCodeNumber());
                    newCode.setName(code.getCodeCategory());
                    newCode.setEnglishName(code.getCodeEnCategory());
                    newCode.setSubmitter(code.getSubmitter());
                    newCode.setLastModification(code.getTimestamp());
                    newCode.setDatasetName(code.getDatasetName());
                    newCode.setCategoryId(1L);
                    newCode.setState(DomainState.A);
                    newCode.setSubmitter(AuthTools.currentUsernameNullSafe());
                    newCode.setPublishTime(new Date());
                    newCode.setVersion(1);
                    result.add(newCode);
                    map.put(code.getCodeNumber(), newCode);
                }

                StandardCodeValueDto value = new StandardCodeValueDto();
                value.setName(code.getCodeName());
                value.setEnglishName(code.getCodeEnName());
                value.setOrder(code.getOrder());
                value.setValue(code.getCodeValue());
                value.setParentValue(code.getParentCodeValue());
                value.setDefinition(code.getCodeDefinition());
                value.setDefinition2(code.getCodeDefinition2());
                value.setDefinition3(code.getCodeDefinition3());

                StandardCodeDto stdCode = map.get(code.getCodeNumber());
                stdCode.addValue(value);
                stdCode.setSubmitter(code.getSubmitter());
                if (code.getTimestamp() == null) {
                    stdCode.setLastModification(new Date());
                } else {
                    stdCode.setLastModification(code.getTimestamp());
                }
            }
        }

        return result;
    }

    public List<StandardCodeDto> convertToCodeDto(Iterable<CodeDto> codes, Long jobId) {
        List<StandardCodeDto> result = new ArrayList<>(500);
        StandardCodeDto dbCode = null;
        if (codes != null) {
            Map<String, StandardCodeDto> map = new HashMap<>();

            for (CodeDto code : codes) {
                if (!map.containsKey(code.getCodeNumber())) {
                    StandardCodeDto newCode = new StandardCodeDto();
                    newCode.setCode(code.getCodeNumber());
                    newCode.setName(code.getCodeCategory());
                    newCode.setEnglishName(code.getCodeEnCategory());
                    newCode.setSubmitter(code.getSubmitter());
                    newCode.setLastModification(code.getTimestamp());
                    newCode.setDatasetName(code.getDatasetName());
                    newCode.setCategoryId(1L);
                    newCode.setState(DomainState.A);
                    newCode.setSubmitter(AuthTools.currentUsernameNullSafe());
                    newCode.setPublishTime(new Date());
                    newCode.setVersion(1);
                    //修复任务执行完 就会将备注和是否授权维度清空的bug
                    dbCode = getCodeByJobIdWithSource(jobId);
                    if(Objects.nonNull(dbCode)){
                        newCode.setCode(dbCode.getCode());
                        //newCode.setWhetherBusinessDimension(dbCode.getWhetherBusinessDimension());
                        newCode.setComment(dbCode.getComment());
                        newCode.setState(dbCode.getState());
                        newCode.setVersion(dbCode.getVersion());
                        newCode.setCategoryId(dbCode.getCategoryId());
                        newCode.setRefStandardCode(dbCode.getRefStandardCode());
                        newCode.setName(dbCode.getName());
                        newCode.setAdditionalProperties(dbCode.getAdditionalProperties());
                        newCode.setSubmitter(dbCode.getSubmitter());
                        newCode.setLastModification(dbCode.getLastModification());
                        newCode.setPublishTime(dbCode.getPublishTime());
                        newCode.setDatasetName(dbCode.getDatasetName());
                        newCode.setCreateTime(dbCode.getCreateTime());
                        newCode.setEnglishName(dbCode.getEnglishName());
                    }
                    result.add(newCode);
                    map.put(code.getCodeNumber(), newCode);
                }

                StandardCodeValueDto value = new StandardCodeValueDto();
                value.setName(code.getCodeName());
                value.setEnglishName(code.getCodeEnName());
                value.setOrder(code.getOrder());
                value.setValue(code.getCodeValue());
                value.setParentValue(code.getParentCodeValue());
                value.setDefinition(code.getCodeDefinition());
                value.setDefinition2(code.getCodeDefinition2());
                value.setDefinition3(code.getCodeDefinition3());

                StandardCodeDto stdCode = map.get(code.getCodeNumber());
                stdCode.addValue(value);
                stdCode.setSubmitter(code.getSubmitter());
                if (code.getTimestamp() == null) {
                    stdCode.setLastModification(new Date());
                } else {
                    stdCode.setLastModification(code.getTimestamp());
                }
            }
        }
        return result;
    }

    @Override
    public Map<String, List<DomainVersionDto>> getAllDomainsVersions() {
        Map<String, List<DomainVersionDto>> result = new HashMap<>();

        for (DomainVersion version : domainVersionRepo.findAll()) {
            DomainVersionDto versionDto = convertToDomainVersionDto(version, false);
            if (!result.containsKey(versionDto.getDomainId())) {
                result.put(versionDto.getDomainId(), new LinkedList<>());
            }

            result.get(versionDto.getDomainId()).add(versionDto);
        }

        Set<String> toBeRemoved = new HashSet<>();
        for (Map.Entry<String, List<DomainVersionDto>> entry : result.entrySet()) {
            if (entry.getValue().size() == 1) {
                toBeRemoved.add(entry.getKey());
                continue;
            }

            entry.getValue().sort(Comparator.comparing(DomainVersionDto::getLastModification, Comparator.reverseOrder()));

            Iterator it = entry.getValue().iterator();
            if (it.hasNext()) {
                it.next();
                it.remove();
            }
        }

        for (String key : toBeRemoved) {
            result.remove(key);
        }

        return result;
    }

    @Override
    public Map<String, List<LocalDomainDto>> getAllDomainsVersionsAfterTimestamp(Long timestamp, Integer apiVersion) {

        // 1.查询所有历史标准
        Map<String, List<LocalDomainDto>> result = new HashMap<>();
        List<DomainVersion> domainVersions;
        if (timestamp == null || timestamp.equals(0L)) {
            domainVersions = Lists.newArrayList(domainVersionRepo.findAll());
        } else {
            domainVersions = domainVersionRepo.findDomainVersionByLastReviewAfter(new Date(timestamp));
        }

        // 2.组装UdpMap[key=categoryId, value=udpIds], 在DTO转换时需要使用
        Map<Long, List<Long>> udpIdMap = new HashMap<>();
        for (Long id : udpMap.keySet()) {
            udpIdMap.put(id, udpMap.get(id).stream().map(DomainUdpDto::getUdpId).collect(Collectors.toList()));
        }

        // 3.查询关联标准、部门、系统为构建数据标准额外属性到UDP做准备
        Set<DomainExtraAttributesUdp> extraAttributes = new HashSet<>();
        if (!Strings.isNullOrEmpty(loadDomainExtraAttributes)) {
            for (String attr : loadDomainExtraAttributes.split(",")) {
                extraAttributes.add(DomainExtraAttributesUdp.valueOf(attr));
            }
        }
        Set<String> relationDomainCodes = new HashSet<>();
        if (extraAttributes.contains(DomainExtraAttributesUdp.relationDomain)) {
            for (DomainVersion domain : domainVersions) {
                if (domain.getRelationDomain() != null && !domain.getRelationDomain().isEmpty()) {
                    relationDomainCodes.addAll(domain.getRelationDomain());
                }
            }
        }
        Map<String, Domain> relationDomainMap = new HashMap<>();      // 所有关联标准
        Map<String, OrganizationTreeDto> orgMap = new HashMap<>();    // 所有部门
        Map<Long, BaseModelCategory> systemMap = new HashMap<>();     // 所有系统
        getExtraAttributesRef(extraAttributes, relationDomainCodes, relationDomainMap, orgMap, systemMap);

        // 4.遍历版本，转换DTO
        for (DomainVersion version : domainVersions) {
            LocalDomainDto versionDto = DomainConvertUtils.convertToLocalDomainVersionDto(version,
                    udpIdMap.get(version.getCategoryId()), relationDomainMap, orgMap, systemMap, extraAttributes, apiVersion);
            if (!result.containsKey(versionDto.getId())) {
                result.put(versionDto.getId(), new LinkedList<>());
            }
            result.get(versionDto.getId()).add(versionDto);
        }

        // 5.去掉最新版本
        Set<String> toBeRemoved = new HashSet<>();
        for (Map.Entry<String, List<LocalDomainDto>> entry : result.entrySet()) {

            if (entry.getValue().size() == 1
                    && entry.getValue().get(0) != null
                    && entry.getValue().get(0).getVersion() == 1) {
                toBeRemoved.add(entry.getKey());
                continue;
            }

            entry.getValue().sort(Comparator.comparing(LocalDomainDto::getVersion, Comparator.reverseOrder()));

            Iterator it = entry.getValue().iterator();
            if (it.hasNext()) {
                it.next();
                it.remove();
            }
        }

        for (String key : toBeRemoved) {
            result.remove(key);
        }

        return result;
    }


    @Override
    public List<DomainDto> getDomainsByIds(Collection<String> collection) {
        List<Domain> domains = domainRepo.findAllByDomainIdIn(collection);
        return convertToListDomainDto(domains);
    }

    @Override
    public Long countDomainOrgReference(String orgBm) {
        return domainRepo.countByOwnerOrg(orgBm)
                + domainRepo.countByDescriptionDepartment(orgBm);
    }

    @Override
    @Transactional
    public void saveUserPrivateNamingStandards(Collection<NamingStandardDto> namingStandards, String username) {
        List<PrivateNamingStandard> privateNamingStandards = convertToListPrivateNamingStandards(
                namingStandards);
        Long timestamp = System.currentTimeMillis();

        String user = username;
        for (PrivateNamingStandard privateNamingStandard : privateNamingStandards) {
            privateNamingStandard.setNsId(null);
            privateNamingStandard.setTimestamp(timestamp);
            checkNamingStandard(privateNamingStandard);
            if (user == null) {
                user = privateNamingStandard.getOwner();
            }
        }

        privateNamingstandardRepo.deleteNamingStandardsOfUser(user);
        privateNamingstandardRepo.saveAll(privateNamingStandards);
    }

    @Override
    public void syncAllDomains() {
        domainDataSynchronizer.syncAllDomains();
    }

    public boolean isMetrics(Long categoryId) {
        return categoryId != null && (categoryId == 2L);
    }

    @Override
    public List<DomainDto> getDomainByDomainCodes(Collection<String> domainCodes) {
        return convertToListDomainDto(domainRepo.findPublishedByDomainCodeIn(domainCodes, 1L));
    }

    @Override
    public List<DomainDto> domainGeneralQuery(QueryParameterCriteria criteria) {
        MultiConditionQueryUtils.MultiConditionQuery<Domain> query =  queryUtils.createQuery(Domain.class);
        boolean pageQuery = datasourceQueryHelper.buildCriteria(criteria, query);

        //查询结果
        List<Domain> objectList;
        if (pageQuery) {
            objectList = query.page().getContent();
        } else {
            objectList = query.list();
        }
        return objectList
                .stream()
                .map(domain -> convertToDomainDto(domain))
                .collect(Collectors.toList());
    }

    @Override
    public DomainFolderDto createDomainFolderFromMetric(DomainFolderDto dto) {
        Map<String, Object> extra = dto.getExtra();
        if(extra.get(PATH_KEY) == null){
            throw new InvalidArgumentException("Path is empty");
        }
        List<String> path = (List<String>)extra.get(PATH_KEY);

        // 目录路径至少包含两层
        if(path.size() < 2){
            throw new InvalidArgumentException("Path format error,The path length must be at least 2");
        }

        // 此处的根目录id来源于代码中初始化写死的
        Long parentId = getFolderIdByPath(path, METRIC_ROOT_PATH);
        dto.setParentId(parentId);

        // 切换用户
        String username = extra.get("username").toString();
        switchToGivenUser(username);

        DomainFolderDto createdFolder = createFolder(dto);
        try {
            domainCategoryPermissionService.updateUserPermissionOfCategory(createdFolder.getId(),
                    PermissionType.USER,
                    AuthTools.currentUsernameFailFast(),
                    PermissionLevel.ADMIN);

            return createdFolder;
        } catch (Throwable tw) {
            DomainFolderResDto resDto = new DomainFolderResDto();
            resDto.setFolderId(createdFolder.getId());
            resDto.setUsername(AuthTools.currentUsernameFailFast());
            resDto.setWithNoValid(true);
            deleteFolder(resDto);

            throw new UnexpectedStateException("failed to create folder", tw);
        }
    }

    @Override
    public DomainFolderDto updateDomainFolderFromMetric(DomainFolderDto dto) {

        String username = dto.getExtra().get("username").toString();
        switchToGivenUser(username);

        Optional<DomainFolder> folder = domainFolderRepo.findById(dto.getId());
        if(folder.isEmpty()){
            throw new InvalidArgumentException(msgService.getMessage("cannotFoundFolderById", dto.getId()));
        }
        dto.setParentId(folder.get().getId());

        return updateFolder(dto);
    }

    @Override
    @Transactional
    public void deleteDomainFolderFromMetric(DomainFolderResDto dto) {

        switchToGivenUser(dto.getUsername());

        deleteFolder(dto);
    }

    @Override
    public Integer loadCodesIn(List<CodeDto> codes, Long jobId) {
        Map<String, Integer> orders = new HashMap<>();

        for (CodeDto code : codes) {
            code.setTimestamp(new Date());
            code.setSubmitter(AuthTools.currentUsernameFailFast());
            Integer order = orders.get(code.getCodeNumber());

            if (order == null) {
                order = 0;
            }

            if (code.getOrder() == null) {
                code.setOrder(order++);
            } else {
                order = Math.max(order, code.getOrder());
            }
            orders.put(code.getCodeNumber(), order);
        }

        List<StandardCodeDto> stdCodes = convertToCodeDto(codes, jobId);
        addPublicCodes(stdCodes, AuthTools.currentUsernameFailFast());
        return stdCodes.stream().map(StandardCodeDto::getValues).mapToInt(List::size).sum();
    }

    @Override
    @Transactional
    public StandardCodeSourceDto addCodeFromDB(StandardCodeSourceDto standardCodeSourceDto, String currentUser) {
        StandardCode code = convertToStandardCode(standardCodeSourceDto);
        checkCodeBasicInfo(code);
        if (ObjectUtils.notEqual(standardCodeRepo.countByCodeEquals(code.getCode()), 0L)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeExists", code.getCode()));
        }
        StandardCode dbCode = standardCodeRepo.findFirstByName(code.getName());
        if (dbCode != null) {
            throw new InvalidArgumentException(msgService.getMessage("standardCodeNumberExists", code.getCode(), code.getName()));
        }

        code.setSubmitter(currentUser);
        code.setLastModification(new Date());
        code.setCreateTime(new Date());
        code.setVersion(1);
        //code.setCreatedBy(currentUser);

        //抽取的代码默认为待审核状态
        if (standardCodeSourceDto.getState() != null) {
            code.setState(standardCodeSourceDto.getState());
        } else {
            code.setState(DomainState.D);
        }
        if (DomainState.A.equals(code.getState())) {
            code.setFirstPublish(new Date());
            createStandardVersion(code, currentUser, msgService.getMessage("codeBeanMarkedPublished"));
        }

        if(StringUtils.isEmpty(standardCodeSourceDto.getCode())){
            standardCodeSourceDto.setCode(code.getCode());
        }

        //保存任务
        Long jobId = saveJob(standardCodeSourceDto, currentUser, 0L);
        //保存至来源系统表
        saveStandardCodeSource(standardCodeSourceDto, code.getCode(), jobId);

        return convertToStandCodeSourceDto(standardCodeRepo.save(code), jobId);
    }

    @Override
    public StandardCodeDto getCodeByJobIdWithSource(Long jobId) {
        // 通过jobId查找关联的标准代码
        if (Objects.isNull(jobId)) {
            return null;
        }

        StandardCodeSource standardCodeSource = standardCodeSourceRepo.findByJobIdEquals(jobId);
        if (Objects.isNull(standardCodeSource) || StringUtils.isEmpty(standardCodeSource.getCode())) {
            return null;
        }
        // 获取标准代码
        StandardCode code = standardCodeRepo.findById(standardCodeSource.getCode()).orElseThrow(() -> new ItemNotFoundException(
                msgService.getMessage("standardCodeNotFoundByNumber", standardCodeSource.getCode())));
        return convertToStandCodeDto(code);
    }

    @Override
    public void updateCodeSource(StandardCodeSourceDto standardCodeSourceDto, String user, Boolean updateCodeSource) {
        if (updateCodeSource) {
            //1、修改标准代码
            this.updateCode(convertToStandardCodeDto(standardCodeSourceDto), user);
        }
        if (Boolean.TRUE.equals(standardCodeSourceDto.getCleanSource())) {
            deleteCodeSource(standardCodeSourceDto.getCode(), standardCodeSourceDto.getJobId());
            //清空来源系统保存页面码值
            this.updateCode(convertToStandardCodeDto(standardCodeSourceDto), user);

        } else {
            //2、新增或修改定时任务
            saveJob(standardCodeSourceDto, user, standardCodeSourceDto.getJobId());
            //3、修改来源系统
            if(standardCodeSourceDto.getCode() != null && standardCodeSourceDto.getCode().endsWith("+++")){
                saveStandardCodeSource(standardCodeSourceDto, standardCodeSourceDto.getCode().substring(0, standardCodeSourceDto.getCode().length() -3), standardCodeSourceDto.getJobId());
            }else {
                saveStandardCodeSource(standardCodeSourceDto, standardCodeSourceDto.getCode(), standardCodeSourceDto.getJobId());
            }
            //删除变更的临时数据
            if(standardCodeSourceDto.getCode() != null && standardCodeSourceDto.getCode().endsWith("+++")){
                standardCodeSourceRepo.deleteByCode(standardCodeSourceDto.getCode());
            }
        }
    }

    @Override
    public StandardCompareResultDto compareByCode(CompareCodeDto compareCodeDto) {
        String code = compareCodeDto.getCode();
        String modifyCode = compareCodeDto.getModifyCode();
        int srcVersion = 2;
        int tagVersion = 1;

        StandardCode tag = standardCodeRepo.findByCodeEquals(code);
        if (tag == null) {
            throw new InvalidArgumentException(msgService.getMessage("dataWithCodeNotExist", code));
        }
        StandardCode src = standardCodeRepo.findByCodeEquals(modifyCode);
        if (src == null) {
            throw new InvalidArgumentException(msgService.getMessage("dataWithCodeNotExist", modifyCode));
        }

        List<StandardCodeValueCompareDto> srcCodes = new ArrayList<>();
        List<StandardCodeValueCompareDto> tagCodes = new ArrayList<>();

        if (src.getValues() == null) {
            src.setValues(new ArrayList<>());
        }
        if (tag.getValues() == null) {
            tag.setValues(new ArrayList<>());
        }

        for (StandardCodeValueDto codeValue : src.getValues()) {
            srcCodes.add(new StandardCodeValueCompareDto(codeValue, src.getCode()));
        }
        for (StandardCodeValueDto codeValue : tag.getValues()) {
            tagCodes.add(new StandardCodeValueCompareDto(codeValue, src.getCode()));
        }

        StandardCompareResultDto resultDto = new StandardCompareResultDto();
        //比较标准代码属性
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.code"), tag.getCode(),
                        tag.getCode()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.name"), src.getName(),
                        tag.getName()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.eName"), src.getEnName(),
                        tag.getEnName()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.topic"), src.getDatasetName(),
                        tag.getDatasetName()));
        resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remark"), src.getComment(),
                        tag.getComment()));
        /*resultDto.getStandardCompareResult()
                .add(new StandardCompareDto(srcVersion, tagVersion, "是否授权维度", "1".equals(src.getWhetherBusinessDimension()) ? "是" : "否",
                        "1".equals(tag.getWhetherBusinessDimension()) ? "是" : "否"));*/

        //比较代码值
        Map<String, List<StandardCodeValueCompareDto>> cCompareDto = new HashMap<>();
        List<Pair<StandardCodeValueCompareDto, StandardCodeValueCompareDto>> modifys = new ArrayList<>();
        compareCodeValue(srcCodes, tagCodes, cCompareDto, modifys);

        resultDto.setAddCodes(cCompareDto.get("add"));
        resultDto.setDeleteCodes(cCompareDto.get("delete"));

        for (Pair<StandardCodeValueCompareDto, StandardCodeValueCompareDto> modify : modifys) {
            StandardCodeValueCompareDto srcCode = modify.getFirst();
            StandardCodeValueCompareDto tagCode = modify.getSecond();
            //Integer order = Integer.parseInt(srcCode.getCompareValue().split("-")[1]);

            List<StandardCompareDto> codeValueCompares = new ArrayList<>();
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.codeV"), srcCode.getValue(),
                            tagCode.getValue()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.codeName"), srcCode.getName(),
                            tagCode.getName()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.code"), srcCode.getOrder() + "",
                            tagCode.getOrder() + ""));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remarkOne"), srcCode.getDefinition(),
                            tagCode.getDefinition()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.pCodeV"), srcCode.getParentValue(),
                            tagCode.getParentValue()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remarkTwo"), srcCode.getDefinition2(),
                            tagCode.getDefinition2()));
            codeValueCompares.add(
                    new StandardCompareDto(srcVersion, tagVersion, msgService.getMessage("standardCode.keyword.remarkThr"), srcCode.getDefinition3(),
                            tagCode.getDefinition3()));

            resultDto.getModifyCodes().put(String.valueOf(srcCode.getOrder()), codeValueCompares);
        }

        resultDto.setNoChangeCode(cCompareDto.get("noChange"));

        return resultDto;
    }

    @Override
    public StandardCodeSourceDto getCodeSource(String code) {
        return convertCodeSource(standardCodeSourceRepo.findById(code));
    }

    @Override
    public void deleteCodeSource(String code, Long jobId) {
        standardCodeSourceRepo.deleteByCode(code);
        if (damConnectable) {
            LocalJobRegistryAdapter localJobRegistryAdapter = BeanHelper.getBean(LocalJobRegistryAdapter.class);
            //删除任务
            localJobRegistryAdapter.deleteJob(jobId);
        }

    }

    @Override
    public void generateCopyStandardWithSource(String code, String user, StandardCodeDto toBeUpdate) {
//        StandardCodeSource codeSource = standardCodeSourceRepo.findByCodeEquals(code);
        StandardCodeDto standardCodeDto = new StandardCodeDto();
        BeanUtils.copyProperties(toBeUpdate, standardCodeDto);
//        BeanUtils.copyProperties(codeSource, standardCodeDto);
        generateCopyStandard(code, standardCodeDto);
        StandardCodeSourceDto standardCodeSourceDto = new StandardCodeSourceDto();
        BeanUtils.copyProperties(toBeUpdate, standardCodeSourceDto);
        saveStandardCodeSource(standardCodeSourceDto, standardCodeDto.getCode(), toBeUpdate.getJobId());
    }

    @Override
    public void releaseCodeSource(StandardCodeSourceDto standardCodeSourceDto, String user) {
        // 查找原标准代码
        StandardCode dbCode = standardCodeRepo.findByCodeEquals(standardCodeSourceDto.getCode());

        // 获取标准代码源系统
        StandardCodeSource standardCodeSource = standardCodeSourceRepo.findByCodeEquals(dbCode.getUpdatingCode());
        if (Objects.isNull(standardCodeSource)) {
            return;
        }
        StandardCodeSource standardCodeSourceNew = new StandardCodeSource();
        BeanUtils.copyProperties(standardCodeSource, standardCodeSourceNew);
        // 保存新的
        standardCodeSourceNew.setCode(standardCodeSourceDto.getCode());
        standardCodeSourceRepo.save(standardCodeSourceNew);
        // 删除旧的
        standardCodeSourceRepo.deleteByCode(dbCode.getUpdatingCode());
    }

    protected Long getFolderIdByPath(List<String> path, Long rootPathId){

        // 目录只有两层，则当前创建的目录就在根目录下
        if(path.size() == 2){
            return rootPathId;
        }

        long parentPathId = rootPathId;
        long currPathId = 0;

        // 找出最后一层目录的parent_id, 即倒数第二个目录的id
        for (int i = 1; i < path.size() - 1; i++){

            DomainFolder folder = domainFolderRepo.findByParentIdAndName(parentPathId, path.get(i));
            if(folder == null){
                throw new UnexpectedStateException("folder does not exists in dataStandard:" + path.get(i));
            }
            currPathId = folder.getId();
            parentPathId = currPathId;
        }

        return currPathId;
    }

    protected void switchToGivenUser(String username){
        Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
        UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
        SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
        SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);
    }

    private StandardCode convertToStandardCode(StandardCodeSourceDto stdCode) {
        StandardCode res = new StandardCode();
        if (stdCode.isAutoGenCode() && StringUtils.isEmpty(stdCode.getCode())) {
            String domainCode = generateService
                    .getSingleDomainCode(DatablauDomainType.STANDARD_CODE);
            res.setCode(domainCode);
            //替换sql
            String sql = stdCode.getSql();
            stdCode.setSql(sql.replaceAll("\\{\\}", domainCode));
            //替换colMap
            stdCode.getColMap().put("CODE", domainCode);
        } else {
            res.setCode(stdCode.getCode());
            stdCode.getColMap().put("CODE", stdCode.getCode());
        }
        res.setDatasetName(stdCode.getDatasetName());
        res.setEnName(stdCode.getEnName());
        res.setLastModification(new Date());
        res.setName(stdCode.getName());
        res.setState(stdCode.getState());
        res.setSubmitter(stdCode.getSubmitter());
        res.setValues(stdCode.getValues());
        res.setVersion(stdCode.getVersion());
        res.setComment(stdCode.getComment());
        res.setCategoryId(stdCode.getCategoryId());
        //res.setFolderId(stdCode.getFolderId());
        res.setRefStandardCode(stdCode.getRefStandardCode());
        res.setAdditionalProperties(stdCode.getAdditionalProperties());
        //res.setWhetherBusinessDimension(stdCode.getWhetherBusinessDimension());

        return res;
    }

    private StandardCodeDto convertToStandardCodeDto(StandardCodeSourceDto dto) {
        StandardCodeDto standardCodeDto = new StandardCodeDto();
        standardCodeDto.setCode(dto.getCode());
        standardCodeDto.setCategoryId(dto.getCategoryId());
        standardCodeDto.setComment(dto.getComment());
        standardCodeDto.setDatasetName(dto.getDatasetName());
        standardCodeDto.setEnglishName(dto.getEnName());
        standardCodeDto.setName(dto.getName());
        standardCodeDto.setState(dto.getState());
        standardCodeDto.setValues(dto.getValues());
//        standardCodeDto.setWhetherBusinessDimension(dto.getWhetherBusinessDimension());
//        standardCodeDto.setFolderId(dto.getFolderId());
        standardCodeDto.setVersion(dto.getVersion());
        return standardCodeDto;
    }

    private StandardCodeSourceDto convertCodeSource(Optional<StandardCodeSource> standardCodeSource) {
        StandardCodeSourceDto dto = new StandardCodeSourceDto();
        if (standardCodeSource.isPresent()) {
            StandardCodeSource codeSource = standardCodeSource.get();
            dto.setBusinessId(codeSource.getCategoryId());
            dto.setBusinessName(codeSource.getCategoryName());
            dto.setCode(codeSource.getCode());
            dto.setModelId(codeSource.getModelId());
            dto.setModelName(codeSource.getModelName());
            dto.setSchema(codeSource.getSchema());
            dto.setObjectId(codeSource.getObjectId());
            dto.setObjectName(codeSource.getObjectName());
            dto.setCodeFieldId(codeSource.getCodeFieldId());
            dto.setCodeField(codeSource.getCodeField());
            dto.setCodeChineseFieldId(codeSource.getCodeChineseFieldId());
            dto.setCodeChineseField(codeSource.getCodeChineseField());
            dto.setParentValueId(codeSource.getParentValueId());
            dto.setParentValue(codeSource.getParentValue());
            dto.setSql(codeSource.getSqlContext());
            dto.setJobId(codeSource.getJobId());
            dto.setSchedule(codeSource.getSchedule());
            dto.setConditionList(JsonUtils.toObjectList(codeSource.getConditionList(), SqlConditionDto.class));
            dto.setAuthDimensionId(codeSource.getAuthDimensionId());
            dto.setAuthDimension(codeSource.getAuthDimension());
            dto.setDbType(codeSource.getDbType());
            dto.setDatasourceId(codeSource.getDatasourceId());
            dto.setJobName(codeSource.getJobName());
            dto.setSchedule(codeSource.getSchedule());
            dto.setTypeName(codeSource.getTypeName());
            dto.setColMap(JsonUtils.toObject(codeSource.getColMap(), new TypeReference<Map>() {}));
        }
        return dto;

    }

    private void saveStandardCodeSource(StandardCodeSourceDto standardCodeDto, String code, Long jobId) {
        StandardCodeSource standardCodeSource = new StandardCodeSource();
        standardCodeSource.setCode(code);
        standardCodeSource.setJobId(jobId);
        standardCodeSource.setCode(code);
        standardCodeSource.setCategoryId(standardCodeDto.getBusinessId());
        standardCodeSource.setCategoryName(standardCodeDto.getBusinessName());
        standardCodeSource.setModelId(standardCodeDto.getModelId());
        standardCodeSource.setModelName(standardCodeDto.getModelName());
        standardCodeSource.setSchema(standardCodeDto.getSchema());
        standardCodeSource.setObjectId(standardCodeDto.getObjectId());
        standardCodeSource.setObjectName(standardCodeDto.getObjectName());
        standardCodeSource.setCodeFieldId(standardCodeDto.getCodeFieldId());
        standardCodeSource.setCodeField(standardCodeDto.getCodeField());
        standardCodeSource.setCodeChineseFieldId(standardCodeDto.getCodeChineseFieldId());
        standardCodeSource.setCodeChineseField(standardCodeDto.getCodeChineseField());
        standardCodeSource.setParentValueId(standardCodeDto.getParentValueId());
        standardCodeSource.setParentValue(standardCodeDto.getParentValue());
        standardCodeSource.setSqlContext(standardCodeDto.getSql());
        standardCodeSource.setSchedule(standardCodeDto.getSchedule());
        standardCodeSource.setConditionList(JsonUtils.toJSon(standardCodeDto.getConditionList()));
        standardCodeSource.setAuthDimensionId(standardCodeDto.getAuthDimensionId());
        standardCodeSource.setAuthDimension(standardCodeDto.getAuthDimension());
        standardCodeSource.setJobId(jobId);
        standardCodeSource.setDatasourceId(standardCodeDto.getDatasourceId());
        standardCodeSource.setDbType(standardCodeDto.getDbType());
        standardCodeSource.setJobName(standardCodeDto.getJobName());
        standardCodeSource.setTypeName(standardCodeDto.getTypeName());
        standardCodeSource.setColMap(JsonUtils.toJSon(standardCodeDto.getColMap()));
        //standardCodeSource.setCategoryLog(standardCodeDto.getCategoryId());
        standardCodeSourceRepo.save(standardCodeSource);
    }

    private Long saveJob(StandardCodeSourceDto code, String currentUser, Long jobId) {
        logger.info("开始保存job");
        String name = null;
        if(code.getCode().endsWith("+++")){
            name = code.getTypeName() + "-" + code.getCode().substring(0, code.getCode().lastIndexOf("+++"));
        }else {
            name = code.getTypeName() + "-" + code.getCode();
        }

        String schedule = code.getSchedule();
        Long retId = null;
        if (MapUtils.isEmpty(code.getColMap())) code.setColMap(new HashMap());
        if (code.getColMap().get("VALUE_PARENT_CODE") == null) {
            code.getColMap().put("VALUE_PARENT_CODE", "");
        }

        if (code.getColMap().get("AUTH_DIMENSION") == null) {
            code.getColMap().put("AUTH_DIMENSION", "");
        }

        if (code.getColMap().get("DOMAIN_ID") == null) {
            code.getColMap().put("DOMAIN_ID", "");
        }

        try {
            JobDto jobDto = null;
            DatablauJobDescriptor descriptor = null;
            LocalJobRegistryAdapter localJobRegistryAdapter = null;
            if (Objects.nonNull(jobId) && jobId > 0L && damConnectable) {
                 localJobRegistryAdapter = BeanHelper.getBean(LocalJobRegistryAdapter.class);
                jobDto = localJobRegistryAdapter.queryJobById(jobId);
            }
            if (Objects.nonNull(jobDto)) {
                String jobContent = jobDto.getJobContent();
                ObjectMapper mapper = new ObjectMapper();
                descriptor = mapper
                        .readValue(jobContent, DatablauJobDescriptor.class);
            }
            if (Objects.isNull(descriptor)) {
                descriptor = new DatablauJobDescriptor();
            }
            descriptor.setCreator(currentUser);
            descriptor.setName(name);
            descriptor.setSchedule(schedule);

            List<JobParameter> jobParameters = new ArrayList<>();

            JobParameterBuilder jobParameterBuilder = new JobParameterBuilder();
            JobParameter sqlParameter = jobParameterBuilder.clear()
                    .setName("sql")
                    .setType(JobParameterType.STRING)
                    .setDescription(GeneralUtility.getMessageService().getMessage("domainJob.sql"))
                    .setDefaultValue(code.getSql())
                    .setMandatory(true)
                    .build();
            JobParameter colMapParameter = jobParameterBuilder.clear()
                    .setName("colMap")
                    .setType(JobParameterType.MAP)
                    .setDefaultValue(JsonUtils.toJSon(code.getColMap()))
                    .setDescription(GeneralUtility.getMessageService().getMessage("domainJob.colMap"))
                    .setMandatory(false)
                    .build();
            if (!org.springframework.util.ObjectUtils.isEmpty(code.getModelId())) {
                JobParameter datasourceIdParameter = jobParameterBuilder.clear()
                        .setName("datasourceId")
                        .setType(JobParameterType.MAP)
                        .setDefaultValue(JsonUtils.toJSon(code.getDatasourceId()))
                        .setDescription(GeneralUtility.getMessageService().getMessage("domainJob.datasourceId"))
                        .setMandatory(false)
                        .build();
                jobParameters.add(datasourceIdParameter);
            }
//            jobParameters.add(modelParameter);
            jobParameters.add(sqlParameter);
            jobParameters.add(colMapParameter);
            descriptor.setParameters(jobParameters);
            descriptor.setTypeName(code.getTypeName());
            if (jobId != null && jobId > 0L) {
                descriptor.setId(jobId);
            }
            //jobId为空新增
            if (Objects.isNull(jobId) || jobId <= 0L) {
                List<JobDto> jobDtos = localJobRegistryAdapter.registerJobInfo(Lists.newArrayList(descriptor));
                if (!CollectionUtils.isEmpty(jobDtos)) {
                    if (code.getJobId() == null) {
                        retId = jobDtos.get(0).getJobId();
                    }
                }
            } else {
                localJobRegistryAdapter.updateJob(descriptor, jobId);
                retId = jobId;
            }
            code.setJobId(retId);
            logger.info("retId:" + retId);
        } catch (Exception e) {
            logger.error("保存任务失败：{}", e.getMessage());
            throw new InvalidArgumentException(
                    msgService.getMessage("standardCodeJob save faild", code.getCode()));
        }
        logger.info("保存job结束");
        return retId;
    }

    private StandardCodeSourceDto convertToStandCodeSourceDto(StandardCode stdCode, Long jobId) {
        StandardCodeSourceDto res = new StandardCodeSourceDto();

        res.setRealCode(stdCode.getCode());
        res.setCode(stdCode.getCode());
        res.setSubmitter(stdCode.getSubmitter());
        res.setDatasetName(stdCode.getDatasetName());
        res.setEnName(stdCode.getEnName());
        res.setName(stdCode.getName());
        res.setLastModification(stdCode.getLastModification());
        res.setState(stdCode.getState());
        res.setValues(stdCode.getValues());
        res.setVersion(stdCode.getVersion());
        res.setComment(stdCode.getComment());
        res.setCreateTime(stdCode.getCreateTime());
        res.setPublishTime(stdCode.getFirstPublish());
        res.setCategoryId(stdCode.getCategoryId());
        res.setUpdatingCode(stdCode.getUpdatingCode());
        res.setRefStandardCode(stdCode.getRefStandardCode());
        res.setRealCode(stdCode.getCode());
        res.setAdditionalProperties(stdCode.getAdditionalProperties());
        res.setJobId(jobId);

        return res;
    }

    private StandardCodeSourceDto convertCodeSource(StandardCodeSource codeSource) {
        StandardCodeSourceDto dto = new StandardCodeSourceDto();
        dto.setBusinessId(codeSource.getCategoryId());
        dto.setBusinessName(codeSource.getCategoryName());
        dto.setCode(codeSource.getCode());
        dto.setModelId(codeSource.getModelId());
        dto.setModelName(codeSource.getModelName());
        dto.setSchema(codeSource.getSchema());
        dto.setObjectId(codeSource.getObjectId());
        dto.setObjectName(codeSource.getObjectName());
        dto.setCodeFieldId(codeSource.getCodeFieldId());
        dto.setCodeField(codeSource.getCodeField());
        dto.setCodeChineseFieldId(codeSource.getCodeChineseFieldId());
        dto.setCodeChineseField(codeSource.getCodeChineseField());
        dto.setParentValueId(codeSource.getParentValueId());
        dto.setParentValue(codeSource.getParentValue());
        dto.setSql(codeSource.getSqlContext());
        dto.setJobId(codeSource.getJobId());
        dto.setSchedule(codeSource.getSchedule());
        dto.setConditionList(JsonUtils.toObjectList(codeSource.getConditionList(), SqlConditionDto.class));
        dto.setAuthDimensionId(codeSource.getAuthDimensionId());
        dto.setAuthDimension(codeSource.getAuthDimension());
        return dto;

    }

    @Override
    public List<DataRuleDto> getDataRuleByDomainIds(Collection<String> domainIds) {
        try {
            return dataRuleService.getDataRuleByDomainIds(domainIds);
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        }
    }

    @Override
    public List<DataRuleDto> getDataRuleByIds(Collection<Long> ruleIds) {
        return dataRuleService.getDataRuleByIds(ruleIds);
    }

    @Override
    public Map<String, Integer> getStandardUsedCount(Collection<String> stdCodes) {
        if (CollectionUtils.isEmpty(stdCodes)) {
            return new HashMap<>();
        }
        return domainRepo.findForStandardUsedCount(stdCodes).stream()
                .collect(Collectors.toMap(
                        s -> s,
                        s -> 1,
                        Integer::sum
                ));
    }

    @Override
    public List<DomainDto> getDomainForGlobalSearch() {
        List<Domain> domains = domainRepo.findAllByCategoryIdIn(Lists.newArrayList(DOMAIN_CATEGORY_ID, INDEX_CATEGORY_ID));
        return convertToListDomainDto(domains);
    }

    @Override
    public String getStandardDataRuleDescription() {
        return msgService.getMessage("DataRule.STANDARD_CODE.description");
    }

    @Override
    public List<Long> getDataRuleIdsByTechRuleType(String techRuleType) {
        return dataRuleService.getDataRuleIdsByTechRuleType(techRuleType);
    }

    @Override
    public LoadingCache<Long, Map<String, String>> getDomainChineseNames() {
        return this.domainChineseNames;
    }



    /**
     * 处理流程引擎回调事件，根据流程结果（通过、驳回、撤回）对参考标准数据进行状态变更。
     *
     * @param startUser 发起人用户标识
     * @param stateOriginal 原始状态，用于判断是否保持为 X 状态
     */
    private void handleProcessResult(String code,Integer state, String startUser, String stateOriginal) {
        // 获取参考数据唯一标识
        // 流程通过，发布参考数据
        if (2 == state) {
            self.publicStandard(code, startUser, stateOriginal);
        }
        // 流程驳回或撤回，回退参考数据状态
        else if (3 == state) {
            StandardCodeDto dto = self.getCodeByCodeNumber(code, null);
            if (DomainState.X.toString().equals(stateOriginal)) {
                dto.setState(DomainState.X); // 保持为X状态
            } else {
                dto.setState(DomainState.D); // 否则设为草稿状态
            }
            self.updateStandardState(dto, null, startUser);
        }
    }


    private static void sendToWeact(String title,String result,Date time,String  applyCreater,String msg ,String applySub,List<String> needNoticeUser) {
        //
       //  boolean weact = Arrays.asList("DOMAIN_ABOLISH", "DOMAIN_UPDATE", "STANDARD_ABOLISH", "STANDARD_UPDATE").contains(eventResult.getProcessType());
    //    if(weact) {
//            TaskService taskService = (TaskService)BeanHelper.getBeanByName("taskService");
//            List<TaskDto> taskDtos = taskService.hisTaskList(eventResult.getProcessInstanceId());
            String opinion = msg;
//            if(!CollectionUtils.isEmpty(taskDtos) && taskDtos.get(taskDtos.size() - 1).getParam() != null && taskDtos.get(taskDtos.size() - 1).getParam().get("opinion") != null) {
//                opinion = taskDtos.get(taskDtos.size() - 1).getParam().get("opinion").toString();
//            }
         //   String title =
            Map[][] content = new HashMap[][]{
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("审批结果：%s", result)
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("申请时间：%s", time != null ? DateFormatUtils.format(time, "yyyy-MM-dd HH:mm:ss") : "")
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("申请人：%s",applyCreater)
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("审批意见：%s", opinion)
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("提交人：%s",applySub)
                            ))
                    },

            };
            Map<Object, Object> contentWrapper = Map.of(
                    "title", title +" 系统:数据架构",
                    "content", content
            );
            RemoteBaseExtendService remoteBaseExtendService = (RemoteBaseExtendService)BeanHelper.getBeanByName("remoteBaseExtendService");
            needNoticeUser.forEach(e->{
                remoteBaseExtendService.sendToWeact(e, title, Map.of(
                        "zh_cn", contentWrapper
                ));
                    }

            );

//        }
    }

}
