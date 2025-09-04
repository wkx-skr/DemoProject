package com.datablau.metadata.main.service.lineage.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.enhance.sql.parse.data.DatabaseType;
import com.andorj.enhance.sql.parse.data.Script;
import com.andorj.lineage.data.*;
import com.andorj.lineage.datax.parse.DataXCommonParse;
import com.andorj.lineage.datax.pojo.DataXTemplate;
import com.andorj.lineage.datax.pojo.ReaderWriterPair;
import com.andorj.lineage.datax.pojo.reader.DataXReader;
import com.andorj.lineage.datax.pojo.writer.DataXWriter;
import com.andorj.lineage.parse.Analyzer;
import com.andorj.lineage.service.*;
import com.andorj.lineage.sql.flink.FlinkSqlScriptParser;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.DigestUtils;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.StringPairDto;
import com.datablau.metadata.common.dto.SimpleJobStatusDto;
import com.datablau.metadata.common.dto.lineage.ImportLineageFilesDto;
import com.datablau.metadata.common.dto.lineage.LineageObjectType;
import com.datablau.metadata.common.dto.lineage.LineageType;
import com.datablau.metadata.main.dao.lineage.LineageRepository;
import com.datablau.metadata.main.dto.lineage.*;
import com.datablau.metadata.main.entity.lineage.Lineage;
import com.datablau.metadata.main.entity.lineage.LineageFolder;
import com.datablau.metadata.main.entity.lineage.LineageObjectBind;
import com.datablau.metadata.main.service.SimpleJobService;
import com.datablau.metadata.main.service.lineage.api.*;
import com.datablau.metadata.main.service.report.bi.fineReport.utility.ZipFileUtil;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.metadata.main.util.FileUtility;
import com.datablau.metadata.main.util.LineageUtility;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.graph.Traverser;
import com.google.common.io.Files;
import org.antlr.v4.runtime.misc.ParseCancellationException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

@Service("lineageImportServiceExt")
public class LineageImportServiceExt extends LineageImportServiceImpl {

    private static final Logger logger = LoggerFactory.getLogger(LineageImportServiceExt.class);
    protected ObjectMapper mapper = new ObjectMapper();
    @Autowired
    protected LineageMappingService mappingService;
    @Autowired
    protected LineageStorageService lineageDao;
    @Autowired
    protected FileUtility fileUtility;
    @Autowired
    protected SimpleJobService simpleJobService;
    @Autowired
    protected ExcelLoader excelLoader;
    @Autowired
    protected GeneralSqlLineageService genSqlParser;
    @Autowired
    protected KettleLineageService kettleParser;
    @Autowired
    protected TableauLineageService tableauParser;
    @Autowired
    protected HqlLineageService hqlParser;
    @Autowired
    protected LineageFolderService lineageFolderService;
    @Autowired
    protected DataStageLineageService datastageParser;
    @Autowired
    protected SSISLineageService ssisLineageParser;
    @Autowired
    protected RestCloudLineageService restCloudParser;
    @Autowired
    protected InformaticaLineageService informaticaParser;
    @Autowired
    protected SqlServerTSqlLineageService sqlServerTsqlParser;
    @Autowired
    protected PlSqlLineageService plSqlParser;
    @Autowired
    protected MessageService msgService;
    @Autowired
    protected PostgreSqlLineageService postgreSqlParser;
    @Autowired
    protected GaussDBLineageService gaussDBParser;
    @Autowired
    protected DataXCommonParse dataXCommonParse;
    @Autowired
    protected LineageScriptService scriptService;
    @Autowired
    protected ClickHouseService clickHouseService;
    @Autowired
    protected RedshiftLineageService redshiftLineageService;
    @Autowired
    protected MySqlLineageService mySqlLineageService;
    @Autowired
    protected GBaseLineageService gbaseLineageService;
    @Autowired
    protected FlinkSqlScriptParser flinkParser;
    @Autowired
    protected SparkSqlService sparkSqlService;
    @Autowired
    protected LineageRepository lineageRepository;
    @Autowired
    protected LineageParserFactory lineageParserFactory;

    @Autowired
    private LineageMappingServiceExt lineageMappingServiceExt;
    protected static final String FILE_ID = "codeTreeNodeId";
    protected static final String RECORD_ID = "recordId";

    public Long createLineageImportJob(File file, String jobName, String fileName, LineageService lineageService, String jobPrefix, Long folderId) {
        return this.createLineageImportJob(file, jobName, fileName, lineageService, false, jobPrefix, true, true, folderId);
    }

    public Long createLineageImportJob(File file, String jobName, String fileName, LineageService lineageService, boolean updateLineage, String jobPrefix, boolean moveFile, boolean deleteFile, Long folderId) {
        return this.createLineageImportJob(file, jobName, fileName, lineageService, updateLineage, jobPrefix, moveFile, deleteFile, (LineageImportService.LineageImportCallBack)null, (Long)folderId);
    }

    public Long createLineageImportJob(File file, String jobName, String fileName, LineageService lineageService, Long updateLineageId, String jobPrefix, Long folderId) {
        LineageImportServiceImpl.LineageParser parser = new LineageImportServiceImpl.LineageParser(file, jobName, fileName, lineageService, DigestUtils.getFileMd5(file), updateLineageId, (LineageImportService.LineageImportCallBack)null, folderId);
        return this.simpleJobService.createJob(jobPrefix + ":" + fileName, parser);
    }

    public Long createLineageImportJob(File file, String jobName, String fileName, LineageService lineageService, boolean updateLineage, String jobPrefix, boolean moveFile, boolean deleteFile, LineageImportService.LineageImportCallBack callback, Long folderId) {
        LineageImportServiceImpl.LineageParser parser = new LineageImportServiceImpl.LineageParser(file, jobName, fileName, lineageService, DigestUtils.getFileMd5(file), updateLineage, moveFile, deleteFile, callback, folderId);
        return this.simpleJobService.createJob(jobPrefix + ":" + fileName, parser);
    }

    public Long createSimpleTemplateLoadJob(File file, String jobName, String filename, Long folderId) {
        return this.createSimpleTemplateLoadJob(file, jobName, filename, false, true, true, folderId);
    }

    public Long createSimpleTemplateLoadJob(File file, String jobName, String filename, boolean updateLineage, boolean moveFile, boolean deleteFile, Long folderId) {
        LineageImportServiceImpl.SimpleTemplateParser parser = new LineageImportServiceImpl.SimpleTemplateParser(file, jobName, filename, DigestUtils.getFileMd5(file), updateLineage, moveFile, deleteFile, folderId);
        return this.simpleJobService.createJob("Excel:" + filename, parser);
    }

    public Long createSimpleTemplateLoadJob(File file, String jobName, String filename, Long updateLineageId, Long folderId) {
        SimpleTemplateParser parser = new SimpleTemplateParser(file, jobName, filename, DigestUtils.getFileMd5(file), updateLineageId, folderId);
        return this.simpleJobService.createJob("Excel:" + filename, parser);
    }

    public Long createBatchImportJob(BatchImportLineageRequest request, boolean updateLineage, Long folderId) {
        return null;
    }

    public List<Long> importLineageFiles(List<ImportLineageFilesDto> list) {
        if (list != null && list.size() != 0) {
            List<Long> jobIds = new ArrayList();
            list.forEach((dto) -> {
                try {
                    Long jobId = this.importLineageFile(dto);
                    if (jobId != null) {
                        jobIds.add(jobId);
                    }
                } catch (Exception var4) {
                    logger.error(var4.getMessage());
                }

            });
            return jobIds;
        } else {
            logger.info("ImportLineageFilesDto is null");
            return null;
        }
    }

    public void deleteLineageFiles(List<Long> lineageIds, Boolean isDDD) {
        List<Lineage> lineageByIds = this.lineageDao.getLineageByIds(lineageIds);
        Set<Long> folderIds = (Set)lineageByIds.stream().map(Lineage::getFolderId).collect(Collectors.toSet());
        List<LineageFolder> foldersByIds = this.lineageFolderService.findFoldersByIds(new ArrayList(folderIds));
        Iterator var6 = foldersByIds.iterator();

        LineageFolder foldersById;
        do {
            if (!var6.hasNext()) {
                this.lineageDao.deleteEntities(lineageIds);
                return;
            }

            foldersById = (LineageFolder)var6.next();
        } while(foldersById.getDDD());

        throw new InvalidArgumentException("folder is not ddd");
    }

    protected Long importLineageFile(ImportLineageFilesDto dto) throws IOException {
        Long folderId = dto.getFolderId();
        String fileName = dto.getFileName();
        String description = dto.getDescription();
        LineageType type = dto.getType();
        String fileContent = dto.getFileContent();
        File tempFile = DataUtility.createTempFile(fileName);
        tempFile.deleteOnExit();
        FileWriter fileWriter = new FileWriter(tempFile);
        BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
        bufferedWriter.write(fileContent);
        bufferedWriter.close();
        Long jobId = null;
        String parserType = type.name();
        LineageParserFactory lineageParserFactory = new LineageParserFactory();
        LineageService parser = lineageParserFactory.getLineageParser(type);
        SimpleJobStatusDto jobStatus = new SimpleJobStatusDto();
        jobStatus.setSendResult(true);
        HashMap<String, Object> extra = new HashMap();
        extra.put("codeTreeNodeId", dto.getCodeTreeNodeId());
        extra.put("recordId", dto.getRecordId());
        jobStatus.setExtra(extra);
        if (parser != null) {
            jobId = this.createImportJob(dto.getLineageId(), tempFile, description, fileName, parser, parserType, folderId, jobStatus, type);
        }

        return jobId;
    }

    protected Long createImportJob(Long lineageId, File tempFile, String description, String fileName, LineageService parser, String scriptType, Long folderId, SimpleJobStatusDto statusDto, LineageType type) {
        LineageImportServiceImpl.LineageParser lineageParser;
        if (lineageId == null) {
            lineageParser = new LineageImportServiceImpl.LineageParser(tempFile, description, fileName, parser, DigestUtils.getFileMd5(tempFile), false, true, true, (LineageImportService.LineageImportCallBack)null, folderId);
        } else {
            lineageParser = new LineageImportServiceImpl.LineageParser(tempFile, description, fileName, parser, DigestUtils.getFileMd5(tempFile), lineageId, (LineageImportService.LineageImportCallBack)null, folderId);
        }

        lineageParser.setLineageType(type);
        Long job = this.simpleJobService.createJob(scriptType + ":" + fileName, lineageParser, statusDto);
        return job;
    }

    public Long createLoadGeneralSqlJob(File file, String filename, String jobName, final Long folderId) throws Exception {
        String var10000 = GeneralUtility.getWebRootPath();
        final String tempFilePath = var10000 + "/tmp/" + UUID.randomUUID();
        final List<GeneralSqlImportFileTemplateParent> generalSqlImportResultList = new ArrayList();
        if (filename.endsWith(".zip")) {
            generalSqlImportResultList.addAll(this.getGeneralSqlFromZipFile(folderId, file, tempFilePath));
        } else {
            generalSqlImportResultList.add(this.getGeneralSqlFromExcelFile(folderId, file, filename));
        }

        return this.simpleJobService.createJob("GenSQL:" + jobName, new Callable<Map>() {
            private final String uploader = AuthTools.currentUsernameFailFast();

            private String getStoredFileId(GeneralSqlImportFileTemplateParent templateParent) {
                return commitLineageFile(templateParent.getFile(), templateParent.getOriginalFileName(), this.uploader, true);
            }

            private void handleOneEntry(GeneralSqlImportFileTemplate fileTemplate, GeneralSqlImportFileTemplateParent templateParent) {
                String name = fileTemplate.getOutputTableNameWithSchema();
                String sql = fileTemplate.getSql();
                LineageContainer container = null;
                String wrappedSql = "INSERT INTO " + name + " \r\n " + sql;

                Script entityx;
                try {
                    entityx = DatabaseType.MYSQL.parse(wrappedSql, true, false);
                    Analyzer analyzer = new Analyzer(entityx, fileTemplate.getSchema());
                    analyzer.analyzeLineage();
                    container = analyzer.getContainer();
                } catch (ParseCancellationException var14) {
                    try {
                        Script script = DatabaseType.ORACLE.parse(wrappedSql, true, false);
                        Analyzer analyzerx = new Analyzer(script, fileTemplate.getSchema());
                        analyzerx.analyzeLineage();
                        container = analyzerx.getContainer();
                    } catch (Exception var13) {
                        logger.error("parse lineage file failed, error sql is [" + sql + "], table name [" + name + "]", var13);
                        throw new UnexpectedStateException(msgService.getMessage("bloodLineageFileParseFailed", new Object[]{sql, var13.getMessage()}));
                    }
                } catch (Exception var15) {
                    logger.error("parse lineage file failed, error sql is [" + sql + "], table name [" + name + "]", var15);
                    throw new UnexpectedStateException(msgService.getMessage("bloodLineageFileParseFailed", new Object[]{sql, var15.getMessage()}));
                }

                Iterator var16 = container.getStepsSet().iterator();

                while(var16.hasNext()) {
                    LineageStep step = (LineageStep)var16.next();
                    if (StringUtils.isEmpty(step.getSchema())) {
                        step.setSchema(fileTemplate.getSchema());
                    }
                }

                entityx = null;

                Lineage entity;
                try {
                    entity = new Lineage();
                    entity.setContent(mapper.writeValueAsString(container));
                    entity.setFilename(msgService.getMessage("lineageImport.parse.fileName", new Object[]{name}));
                    entity.setTimeStamp(System.currentTimeMillis());
                    entity.setName(templateParent.getOriginalFileName());
                    entity.setHash(GeneralUtility.md5ByHex(sql + name));
                    entity.setType(LineageType.GENERAL_SQL.name());
                    entity.setUploader(this.uploader);
                    entity.setFileFieldId(this.getStoredFileId(templateParent));
                    entity.setFolderId(folderId == null ? 0L : folderId);
                    entity = lineageDao.createOrUpdateEntity(entity, container);
                    logger.info("saved entity");
                } catch (Exception var12) {
                    logger.error("failed to save lineage entity", var12);
                    throw new UnexpectedStateException(msgService.getMessage("bloodLineageFileSavingFailed", new Object[]{var12.getMessage()}));
                }

                try {
                    discoverAllMappings(container, entity);

                    try {
                        mappingService.autoBindLineageToMateData(container, entity, this.uploader, fileTemplate);
                    } catch (Exception var10) {
                        logger.error("failed to binding to metadata", var10);
                    }
                } catch (Exception var11) {
                    logger.error("failed to extract mappings", var11);
                    logger.info("rollback...");
                    lineageDao.deleteEntity(entity.getId());
                }

            }

            public Map<String, String> call() {
                Map<String, String> errorMap = new HashMap<>();
                try {
                    for (GeneralSqlImportFileTemplateParent templateParent : generalSqlImportResultList) {
                        ExcelLoadJobResult<GeneralSqlImportFileTemplate> result = templateParent.getResult();

                        for (GeneralSqlImportFileTemplate sql : result.getLoaded()) {
                            try {
                                this.handleOneEntry(sql, templateParent);
                            } catch (Exception e) {
                                errorMap.put(sql.getOutputTableName(), e.getMessage());
                            }
                        }

                        if (!CollectionUtils.isEmpty(result.getFailedLoaded())) {
                            for (String errorMessage : result.getFailedLoaded()) {
                                errorMap.put(
                                        msgService.getMessage("lineageImport.parse.importFailed"),
                                        errorMessage
                                );
                            }
                        }
                    }

                    return errorMap.isEmpty() ? null : errorMap;
                } finally {
                    ZipFileUtil.deleteDir(new File(tempFilePath));
                    logger.info("Delete decompressed temporary files");
                }
            }
        });
    }

    private List<GeneralSqlImportFileTemplateParent> getGeneralSqlFromZipFile(Long folderId, File zipFile, String tempFilePath) {
        logger.info("Extract zip file temporary directory: " + tempFilePath);
        List<GeneralSqlImportFileTemplateParent> sqlImportFileTemplateParents = new ArrayList();

        try {
            logger.info("Start extracting files to temporary directory");
            List<File> files = ZipFileUtil.unzip(zipFile, tempFilePath);
            logger.info("Decompression completed, total file size [{}]", files.size());
            Iterator var6 = ((List)Objects.requireNonNull(files)).iterator();

            while(var6.hasNext()) {
                File file = (File)var6.next();
                sqlImportFileTemplateParents.add(this.getGeneralSqlFromExcelFile(folderId, file, file.getName()));
            }

            return sqlImportFileTemplateParents;
        } catch (Exception var8) {
            throw new AndorjRuntimeException(var8.getMessage(), var8);
        }
    }

    protected GeneralSqlImportFileTemplateParent getGeneralSqlFromExcelFile(Long folderId, File file, String originalFileName) throws Exception {
        if (folderId != null) {
            try {
                this.scriptService.runLineageScript(folderId, this.genSqlParser.getType(), file);
            } catch (Exception var5) {
                throw new AndorjRuntimeException("Run lineage script error", var5);
            }
        }

        ExcelLoadJobResult<GeneralSqlImportFileTemplate> result = this.excelLoader.loadFile(file.getAbsolutePath(), 0, GeneralSqlImportFileTemplate.class);
        return new GeneralSqlImportFileTemplateParent(file, originalFileName, result);
    }

    public Long createLoadDataXJob(File file, final String filename, final String jobName, boolean deleteFile, final boolean updateLineage, final Long originalLineageId, final Long folderId) throws Exception {
        String var10000 = GeneralUtility.getWebRootPath();
        String tempFilePath = var10000 + "/tmp/" + UUID.randomUUID();
        final List<DataXTemplateParent> dataXTemplateParentList = new ArrayList();
        if (filename.endsWith(".zip")) {
            dataXTemplateParentList.addAll(this.getDataXTemplateFromZipFile(folderId, file, tempFilePath));
        } else {
            dataXTemplateParentList.add(this.getDataXTemplateFromDataXFile(folderId, file, filename));
        }

        return this.simpleJobService.createJob("DataX:" + jobName, new Callable<Map>() {
            private final String uploader = AuthTools.currentUsernameFailFast();

            private String getStoredFileId(DataXTemplateParent templateParent) {
                return commitLineageFile(templateParent.getFile(), templateParent.getOriginalFileName(), this.uploader, true);
            }

            private void handleOneEntry(DataXReader dataXReader, DataXWriter dataXWriter, DataXTemplateParent templateParent) {
                LineageContainer container = null;
                container = dataXCommonParse.parseDataXToLineage(dataXReader, dataXWriter);
                Lineage entity = null;

                try {
                    entity = new Lineage();
                    entity.setContent(mapper.writeValueAsString(container));
                    entity.setFilename(msgService.getMessage("lineageImport.parse.transformName", new Object[]{dataXReader.getTypes(), dataXWriter.getTypes()}));
                    entity.setTimeStamp(System.currentTimeMillis());
                    entity.setName(jobName);
                    entity.setHash(GeneralUtility.md5ByHex(container.toString()));
                    entity.setType(LineageType.DATA_X.name());
                    entity.setUploader(this.uploader);
                    entity.setFileFieldId(this.getStoredFileId(templateParent));
                    entity.setFolderId(folderId == null ? 0L : folderId);
                    entity = lineageDao.createOrUpdateEntity(entity, container);
                    logger.info("saved entity");
                } catch (Exception var13) {
                    logger.error("failed to save lineage entity", var13);
                    throw new UnexpectedStateException(msgService.getMessage("bloodLineageFileSavingFailed", new Object[]{var13.getMessage()}));
                }

                boolean success = false;

                try {
                    discoverAllMappings(container, entity);
                    success = true;

                    try {
                        mappingService.autoBindLineageToMateData(container, entity, this.uploader, new ArrayList(), new ArrayList(), new ArrayList());
                    } catch (Exception var11) {
                        logger.error("failed to binding to metadata", var11);
                    }
                } catch (Exception var12) {
                    logger.error("failed to extract mappings", var12);
                    logger.info("rollback...");
                    lineageDao.deleteEntity(entity.getId());
                }

                if (success && (updateLineage || originalLineageId != null)) {
                    List<Lineage> lineagesx = null;
                    if (updateLineage) {
                        lineagesx = lineageDao.getLineageByFileNameOfDatax(filename);
                    } else {
                        List<Lineage> lineages = lineageDao.getLineageByIds(Collections.singleton(originalLineageId));
                        lineagesx = new ArrayList(lineages);
                        ((List)lineagesx).add(entity);
                    }

                    if (((List)lineagesx).size() == 2) {
                        try {
                            Long currentLineageId = entity.getId();
                            List<Lineage> oldLineage = lineagesx.stream()
                                    .filter(x -> !Objects.equals(x.getId(), currentLineageId))
                                    .collect(Collectors.toList());
                            logger.info("updated lineage:" + oldLineage.get(0) + " and this lineage is being deleted");
                            lineageDao.deleteEntity(((Lineage)oldLineage.get(0)).getId());
                        } catch (Throwable var10) {
                            throw new UnexpectedStateException(msgService.getMessage("updateBloodLineageFileErrorNoMessage", new Object[]{filename}));
                        }
                    }
                }

            }

            public Map call() throws Exception {
                Map<String, String> error = new HashMap();
                dataXTemplateParentList.forEach((templateParent) -> {
                    DataXTemplate dataXTemplate = templateParent.getDataXTemplate();
                    List<ReaderWriterPair> readerWriterPairs = dataXTemplate.getJob().getContent();
                    Iterator var5 = readerWriterPairs.iterator();

                    while(var5.hasNext()) {
                        ReaderWriterPair o = (ReaderWriterPair)var5.next();

                        try {
                            DataXReader reader = o.getReader();
                            DataXWriter writer = o.getWriter();
                            this.handleOneEntry(reader, writer, templateParent);
                        } catch (Exception var9) {
                            logger.info(var9.getMessage());
                            error.put(o.getReader().getTypes() + " to " + o.getWriter().getTypes(), var9.getMessage());
                        }
                    }

                });
                return error.isEmpty() ? null : error;
            }
        });
    }

    private List<DataXTemplateParent> getDataXTemplateFromZipFile(Long folderId, File zipFile, String tempFilePath) {
        logger.info("Extract zip file temporary directory: " + tempFilePath);
        List<DataXTemplateParent> dataXTemplateParentList = new ArrayList();

        try {
            logger.info("Start extracting files to temporary directory");
            List<File> files = ZipFileUtil.unzip(zipFile, tempFilePath);
            logger.info("Decompression completed, total file size [{}]", files.size());
            Iterator var6 = ((List)Objects.requireNonNull(files)).iterator();

            while(var6.hasNext()) {
                File file = (File)var6.next();
                dataXTemplateParentList.add(this.getDataXTemplateFromDataXFile(folderId, file, file.getName()));
            }

            return dataXTemplateParentList;
        } catch (Exception var8) {
            throw new AndorjRuntimeException(var8.getMessage(), var8);
        }
    }

    protected DataXTemplateParent getDataXTemplateFromDataXFile(Long folderId, File dataXFile, String dataXFileName) throws Exception {
        if (folderId != null) {
            try {
                this.scriptService.runLineageScript(folderId, this.dataXCommonParse.getType(), dataXFile);
            } catch (Exception var6) {
                throw new AndorjRuntimeException("Run lineage script error", var6);
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();
        DataXTemplate dataXTemplate = (DataXTemplate)objectMapper.readValue(dataXFile, DataXTemplate.class);
        return new DataXTemplateParent(dataXFile, dataXFileName, dataXTemplate);
    }

    public Long createBatchImportJob(BatchImportLineageRequest request, Long folderId) {
        if (Strings.isNullOrEmpty(request.getFolder())) {
            throw new InvalidArgumentException(this.msgService.getMessage("importFileNotGiven"));
        } else {
            File dir = new File(request.getFolder());
            if (dir.exists() && dir.isDirectory()) {
                if (!dir.canRead()) {
                    throw new InvalidArgumentException(this.msgService.getMessage("givenPathUnreadable"));
                } else {
                    String lineageType = request.getType();
                    if (Strings.isNullOrEmpty(lineageType)) {
                        throw new InvalidArgumentException(this.msgService.getMessage("noBloodLineageType"));
                    } else {
                        LineageService service = null;
                        switch (lineageType.toLowerCase()) {
                            case "datastage":
                                service = this.datastageParser;
                                break;
                            case "ssis":
                                service = this.ssisLineageParser;
                                break;
                            case "restcloud":
                                service = this.restCloudParser;
                                break;
                            case "tableau":
                                service = this.tableauParser;
                                break;
                            case "kettle":
                                service = this.kettleParser;
                                break;
                            case "excel":
                                service = new LineageImportServiceImpl.LineageSimpleTemplateParser();
                                break;
                            case "informatica":
                                service = this.informaticaParser;
                                break;
                            case "script-tsql":
                                service = this.sqlServerTsqlParser;
                                break;
                            case "script-plsql":
                                service = this.plSqlParser;
                                break;
                            case "script-hql":
                                service = this.hqlParser;
                                break;
                            case "datax":
                                service = this.dataXCommonParse;
                                break;
                            case "script-postgresql":
                                service = this.postgreSqlParser;
                                break;
                            case "script-gaussdb":
                                service = this.gaussDBParser;
                                break;
                            case "script-clickhouse":
                                service = this.clickHouseService;
                                break;
                            case "script-redshift":
                                service = this.redshiftLineageService;
                                break;
                            case "script-mysql":
                                service = this.mySqlLineageService;
                                break;
                            case "script-gbase":
                                service = this.gbaseLineageService;
                                break;
                            case "script-spark":
                                service = this.sparkSqlService;
                                break;
                            default:
                                throw new InvalidArgumentException(this.msgService.getMessage("unsupportedBloodLineage", new Object[]{lineageType}));
                        }

                        LineageImportServiceImpl.BatchLineageParser batchLineageParser = new LineageImportServiceImpl.BatchLineageParser(dir, (LineageService)service, folderId);
                        return this.simpleJobService.createJob("LineageBatchImport", batchLineageParser);
                    }
                }
            } else {
                throw new InvalidArgumentException(this.msgService.getMessage("givenPathNotExistsOrNotCatalog"));
            }
        }
    }

    protected void discoverAllMappings(LineageContainer container, Lineage entity) {
        if (ObjectUtils.equals(Boolean.TRUE, container.getProperty(LineageKnownProperty.USER_DEFINE_LINEAGE.getPropertyName()))) {
            List<LineageObjectBind> objectBindings = new LinkedList();
            Iterator var4 = container.getLines().iterator();

            while(var4.hasNext()) {
                LineageLine line = (LineageLine)var4.next();
                boolean buildBinding = true;
                LineageObjectBind lineageObjectBind = new LineageObjectBind();
                LineageStep srcStep = container.getStep(line.getSourceStepId());
                Long srcModelId;
                long tableId;
                if ("true".equals(srcStep.getProperty(LineageKnownProperty.DAM_OBJECT.getPropertyName()))) {
                    srcModelId = Long.parseLong(srcStep.getProperty(LineageKnownProperty.MODEL_ID.getPropertyName()));
                    tableId = Long.parseLong(line.getSourceStepId());
                    lineageObjectBind.setSrcType(LineageObjectType.METADATA);
                    lineageObjectBind.setSourceModelId(srcModelId);
                    lineageObjectBind.setSourceTableId(tableId);
                    if (ObjectUtils.notEqual("true", srcStep.getProperty(LineageKnownProperty.TABLE_LEVEL_LINEAGE.getPropertyName()))) {
                        lineageObjectBind.setSourceColumnId(Long.parseLong(line.getSource()));
                    } else {
                        lineageObjectBind.setTableLevel(true);
                    }

                    lineageObjectBind.setLineageId(entity.getId());
                } else if ("true".equals(srcStep.getProperty(LineageKnownProperty.DDM_OBJECT.getPropertyName()))) {
                    srcModelId = Long.parseLong(srcStep.getProperty(LineageKnownProperty.MODEL_ID.getPropertyName()));
                    tableId = Long.parseLong(srcStep.getProperty("objectId"));
                    lineageObjectBind.setSrcType(LineageObjectType.DDM);
                    lineageObjectBind.setSourceModelId(srcModelId);
                    lineageObjectBind.setSourceTableId(tableId);
                    if (ObjectUtils.notEqual("true", srcStep.getProperty(LineageKnownProperty.TABLE_LEVEL_LINEAGE.getPropertyName()))) {
                        lineageObjectBind.setSourceColumnId(Long.parseLong(line.getSource()));
                    } else {
                        lineageObjectBind.setTableLevel(true);
                    }

                    lineageObjectBind.setLineageId(entity.getId());
                } else {
                    buildBinding = false;
                }

                LineageStep dstStep = container.getStep(line.getTargetStepId());
                long tableId1;
                Long dstModelId;
                if ("true".equals(dstStep.getProperty(LineageKnownProperty.DAM_OBJECT.getPropertyName()))) {
                    dstModelId = Long.parseLong(dstStep.getProperty(LineageKnownProperty.MODEL_ID.getPropertyName()));
                    tableId1 = Long.parseLong(line.getTargetStepId());
                    lineageObjectBind.setDstType(LineageObjectType.METADATA);
                    lineageObjectBind.setTargetModelId(dstModelId);
                    lineageObjectBind.setTargetTableId(tableId1);
                    if (ObjectUtils.notEqual("true", dstStep.getProperty(LineageKnownProperty.TABLE_LEVEL_LINEAGE.getPropertyName()))) {
                        lineageObjectBind.setTargetColumnId(Long.parseLong(line.getTarget()));
                    } else {
                        lineageObjectBind.setTableLevel(true);
                    }

                    lineageObjectBind.setLineageId(entity.getId());
                } else if ("true".equals(dstStep.getProperty(LineageKnownProperty.DDM_OBJECT.getPropertyName()))) {
                    dstModelId = Long.parseLong(dstStep.getProperty(LineageKnownProperty.MODEL_ID.getPropertyName()));
                    tableId1 = Long.parseLong(dstStep.getProperty("objectId").toString());
                    lineageObjectBind.setDstType(LineageObjectType.DDM);
                    lineageObjectBind.setTargetModelId(dstModelId);
                    lineageObjectBind.setTargetTableId(tableId1);
                    if (ObjectUtils.notEqual("true", dstStep.getProperty(LineageKnownProperty.TABLE_LEVEL_LINEAGE.getPropertyName()))) {
                        lineageObjectBind.setTargetColumnId(Long.parseLong(line.getTarget()));
                    } else {
                        lineageObjectBind.setTableLevel(true);
                    }

                    lineageObjectBind.setLineageId(entity.getId());
                } else {
                    buildBinding = false;
                }

                if (buildBinding) {
                    objectBindings.add(lineageObjectBind);
                }
            }

            var4 = container.getStepsSet().iterator();

            while(true) {
                LineageStep step;
                do {
                    if (!var4.hasNext()) {
                        this.lineageDao.createObjectLineageContent(entity, container);
                        this.mappingService.deleteAllByLineageId(entity.getId());
                        this.mappingService.saveObjectBindings(objectBindings);
                        this.mappingService.resetObjectLineageRelationType(objectBindings);
                        return;
                    }

                    step = (LineageStep)var4.next();
                } while(step.hasProperty("$unbindObject"));

                step.addPropertyIfAbsent(LineageKnownProperty.BIND_OBJECT_ID.getPropertyName(), step.getId());
                Iterator var14 = step.getColumns().iterator();

                while(var14.hasNext()) {
                    LineageColumn column = (LineageColumn)var14.next();
                    column.addProperty(LineageKnownProperty.BIND_OBJECT_ID.getPropertyName(), column.getId());
                }
            }
        }
    }

    public Long parseLineageFile(File uploadFile, LineageParseParamDto lineageParseParamDto) throws Exception {
        LineageType type = lineageParseParamDto.getType();
        Long folderId = lineageParseParamDto.getFolderId();
        String fileName = lineageParseParamDto.getOriginalFileName();
        boolean deleteOnSuccess = true;
        String description = lineageParseParamDto.getDescription();
        Long originalLineageId = lineageParseParamDto.getOriginalLineageId();
        Long jobId;
        if (ObjectUtils.equals(type, LineageType.DATA_X)) {
            jobId = this.createLoadDataXJob(uploadFile, fileName, description, deleteOnSuccess, false, originalLineageId, folderId);
        } else if (ObjectUtils.equals(type, LineageType.GENERAL_SQL)) {
            jobId = this.createLoadGeneralSqlJob(uploadFile, fileName, description, folderId);
        } else if (ObjectUtils.equals(type, LineageType.EXCEL)) {
            jobId = this.createSimpleTemplateLoadJob(uploadFile, description, fileName, originalLineageId, folderId);
        } else {
            LineageService lineageParser = this.lineageParserFactory.getLineageParser(lineageParseParamDto.getType());
            jobId = this.createLineageImportJob(uploadFile, lineageParseParamDto, lineageParser);
        }

        return jobId;
    }

    public Long createLineageImportJob(File targetFile, String originalFileName, String originalFileName1, LineageService lineageService, boolean updateLineage, String sync, boolean moveFile, boolean deleteOnSuccess, Long folderId, LineageType type) {
        LineageImportServiceImpl.LineageParser parser = new LineageImportServiceImpl.LineageParser(targetFile, originalFileName, originalFileName, lineageService, DigestUtils.getFileMd5(targetFile), updateLineage, moveFile, deleteOnSuccess, (LineageImportService.LineageImportCallBack)null, folderId);
        parser.setLineageType(type);
        return this.simpleJobService.createJob("" + type + ":" + originalFileName, parser);
    }

    protected Long createLineageImportJob(File uploadFile, LineageParseParamDto lineageParseParamDto, LineageService lineageService) {
        LineageImportServiceImpl.LineageParser parser = new LineageImportServiceImpl.LineageParser(uploadFile, lineageParseParamDto.getDescription(), lineageParseParamDto.getOriginalFileName(), lineageService, DigestUtils.getFileMd5(uploadFile), lineageParseParamDto.getOriginalLineageId(), (LineageImportService.LineageImportCallBack)null, lineageParseParamDto.getFolderId(), lineageParseParamDto.getType());
        return this.simpleJobService.createJob(lineageParseParamDto.getType() + ":" + uploadFile.getName(), parser);
    }

    protected String commitLineageFile(File file, String originFilename, String uploader, boolean deleteFile) {
        return this.fileUtility.uploadFile(file, originFilename, uploader, deleteFile).getFileId();
    }

    protected void checkFileMD5Existense(String md5) {
    }

    public class LineageParser extends LineageImportServiceImpl.BaseParser {
        public final Logger parserLogger;
        public File file;
        public String originFilename;
        public LineageService lineageService;
        public String uploader;
        public String fileMD5;
        public String jobName;
        public boolean updateSameFileLineage;
        public boolean moveFile;
        public boolean deleteFile;
        public Long updateLineageId;
        public SecurityContext context;
        public LineageImportService.LineageImportCallBack callback;
        public Long folderId;
        public LineageType lineageType;

        public void setLineageType(LineageType lineageType) {
            this.lineageType = lineageType;
        }

        LineageParser(File file, String jobName, String filename, LineageService lineageService, String fileMD5, boolean updateSameFileLineage, boolean moveFile, boolean deleteFile, LineageImportService.LineageImportCallBack callback, Long folderId) {
            super();
            this.parserLogger = LoggerFactory.getLogger(LineageImportServiceImpl.LineageParser.class);
            this.updateSameFileLineage = false;
            this.moveFile = false;
            this.deleteFile = true;
            this.lineageType = LineageType.MYSQL;
            this.file = file;
            this.originFilename = filename;
            this.lineageService = lineageService;
            this.uploader = AuthTools.currentUsernameNullSafe();
            this.fileMD5 = fileMD5;
            this.jobName = jobName;
            this.updateSameFileLineage = updateSameFileLineage;
            this.moveFile = moveFile;
            this.context = SecurityContextHolder.getContext();
            this.callback = callback;
            this.deleteFile = deleteFile;
            this.folderId = folderId;
        }

        LineageParser(File file, String jobName, String filename, LineageService lineageService, String fileMD5, Long updateLineageId, LineageImportService.LineageImportCallBack callback, Long folderId) {
            this(file, jobName, filename, lineageService, fileMD5, false, true, true, callback, folderId);
            this.updateLineageId = updateLineageId;
        }

        LineageParser(File file, String jobName, String filename, LineageService lineageService, String fileMD5, Long folderId) {
            this(file, jobName, filename, lineageService, fileMD5, false, true, true, (LineageImportService.LineageImportCallBack)null, folderId);
        }

        public LineageParser(File file, String jobName, String filename, LineageService lineageService, String fileMD5, Long updateLineageId, LineageImportService.LineageImportCallBack callback, Long folderId, LineageType lineageType) {
            this(file, jobName, filename, lineageService, fileMD5, false, true, true, callback, folderId);
            this.updateLineageId = updateLineageId;
            this.lineageType = lineageType;
        }

        public Object call() {
            SecurityContextHolder.setContext(this.context);
            if (this.file != null && this.file.exists()) {
                String var10000 = GeneralUtility.getWebRootPath();
                String tempFilePath = var10000 + "/tmp/" + UUID.randomUUID();
                logger.info("Extract zip file temporary directory: " + tempFilePath);

                try {
                    if (this.originFilename.endsWith(".zip")) {
                        this.parserZipFile(tempFilePath);
                    } else {
                        this.parserSqlFile(this.file, this.originFilename);
                    }
                } finally {
                    ZipFileUtil.deleteDir(new File(tempFilePath));
                    logger.info("Delete decompressed temporary files");
                }

                return null;
            } else {
                throw new InvalidArgumentException(msgService.getMessage("bloodLineageFileNotFound", new Object[]{this.originFilename}));
            }
        }

        protected void parserZipFile(String tempFilePath) {
            logger.info("Start extracting files to temporary directory");
            List<File> files = ZipFileUtil.unzip(this.file, tempFilePath);
            logger.info("Decompression completed, total file size [{}]", files.size());
            Iterator var3 = ((List)Objects.requireNonNull(files)).iterator();

            while(var3.hasNext()) {
                File sqlFile = (File)var3.next();
                this.parserSqlFile(sqlFile, sqlFile.getName());
            }

        }

        protected void parserSqlFile(File sqlFile, String sqlFileName) {
            this.parser(sqlFile, sqlFileName);
        }

        protected void parser(File toBeParserFile, String toBeParserFileName) {
            File notDealFile = null;

            try {
                notDealFile = DataUtility.createTempFile(toBeParserFile.getName());
                FileUtils.copyFile(toBeParserFile, notDealFile);
            } catch (IOException var28) {
                throw new AndorjRuntimeException("File creation and copying failed:", var28);
            }

            boolean isDeal = false;
            if (this.folderId != null) {
                try {
                    isDeal = scriptService.runLineageScript(this.folderId, this.lineageService.getType(), toBeParserFile);
                } catch (Exception var27) {
                    throw new AndorjRuntimeException("Run lineage script error", var27);
                }
            }

            String preprocessedFileId = null;
            FileDescriptor entity;
            if (isDeal) {
                entity = fileUtility.uploadFile(toBeParserFile, false);
                preprocessedFileId = entity.getFileId();
            }

            entity = null;

            String container;
            Lineage entityx;
            try {
                entityx = new Lineage();
                entityx.setContent(mapper.writeValueAsString(new LineageContainer()));
                entityx.setFilename(toBeParserFileName);
                entityx.setTimeStamp(System.currentTimeMillis());
                entityx.setName(this.jobName);
                entityx.setHash(this.fileMD5);
                entityx.setType(this.lineageType.name());
                entityx.setUploader(this.uploader);
                entityx.setFolderId(this.folderId == null ? 0L : this.folderId);
                container = commitLineageFile(notDealFile, toBeParserFileName, this.uploader, false);
                entityx.setFileFieldId(container);
                entityx.setPreprocessedFileId(preprocessedFileId != null ? preprocessedFileId : container);
                entityx = lineageDao.createOrUpdateEntity(entityx, new LineageContainer());
                this.parserLogger.info("saved entity");
            } catch (Exception var26) {
                this.parserLogger.error("failed to save lineage entity", var26);
                throw new UnexpectedStateException(msgService.getMessage("bloodLineageFileSavingFailed", new Object[]{var26.getMessage()}));
            }

            container = null;

            LineageContainer containerx;
            try {
                containerx = this.lineageService.parse(toBeParserFile, toBeParserFileName);
            } catch (Exception var25) {
                entityx.setStatus(0);
                entityx.setFailedCause(var25.getMessage());
                lineageRepository.save(entityx);
                this.parserLogger.error("parse lineage file failed", var25);
                throw new UnexpectedStateException(msgService.getMessage("failedToParseLineageFile", new Object[]{var25.getMessage()}));
            } finally {
                if (this.deleteFile) {
                    toBeParserFile.delete();
                    notDealFile.delete();
                }

            }

            try {
                entityx.setContent(mapper.writeValueAsString(containerx));
                entityx.setStatus(1);
                lineageDao.createOrUpdateEntity(entityx, containerx);
            } catch (Exception var24) {
                this.parserLogger.error("failed to save lineage entity", var24);
                throw new UnexpectedStateException(msgService.getMessage("bloodLineageFileSavingFailed", new Object[]{var24.getMessage()}));
            }

            boolean success = false;

            try {
                discoverAllMappings(containerx, entityx);
                success = true;

                try {
                    mappingService.autoBindLineageToMateData(containerx, entityx, this.uploader, new ArrayList(), new ArrayList(), new ArrayList());
                } catch (Exception var22) {
                    logger.error("failed to binding to metadata", var22);
                }
            } catch (Exception var23) {
                this.parserLogger.error("failed to extract mappings", var23);
                this.parserLogger.info("rollback...");
                lineageDao.deleteEntity(entityx.getId());
            }

            if (success && (this.updateSameFileLineage || this.updateLineageId != null)) {
                List<Lineage> lineages = null;
                if (this.updateSameFileLineage) {
                    if (this.folderId == null) {
                        lineages = lineageDao.getLineageByFileName(toBeParserFileName);
                    } else {
                        lineages = lineageDao.getLineageByFileName(toBeParserFileName, this.folderId);
                    }
                } else {
                    List<Lineage> lineagesx = lineageDao.getLineageByIds(Collections.singleton(this.updateLineageId));
                    lineages = new ArrayList(lineagesx);
                    ((List)lineages).add(entityx);
                }

                if (((List)lineages).size() == 2) {
                    try {
                        Long currentLineageId = entityx.getId();
                        List<Lineage> oldLineage = lineages.stream()
                                .filter(x -> !Objects.equals(x.getId(), currentLineageId))
                                .collect(Collectors.toList());
                        this.updateLineage((Lineage)oldLineage.get(0), entityx, containerx);
                        logger.info("updated lineage:" + ((List)lineages).get(0) + " and this lineage is being deleted");
                        lineageDao.deleteEntity(((Lineage)((List)lineages).get(0)).getId());
                    } catch (Throwable var21) {
                        throw new UnexpectedStateException(msgService.getMessage("updateBloodLineageFileError", new Object[]{toBeParserFileName, var21.getMessage()}));
                    }
                }
            }

            if (this.callback != null) {
                this.callback.handleImportedLineage(entityx, containerx, (Long)null);
            }

            this.setBoundResourceId(entityx.getId() != null ? entityx.getId().toString() : null);
        }
    }

    public class SimpleTemplateParser extends BaseParser {
        private final Logger parserLogger;
        protected File file;
        protected String originFilename;
        protected LineageService lineageService;
        protected String uploader;
        protected String fileMD5;
        protected String jobName;
        protected boolean updateSameFileLineage;
        protected boolean moveFile;
        protected boolean deleteFile;
        protected Long updateLineageId;
        protected SecurityContext context;
        protected Long folderId;

        SimpleTemplateParser(File file, String jobName, String filename, String fileMD5, Long folderId) {
            this(file, jobName, filename, fileMD5, false, true, true, folderId);
        }

        SimpleTemplateParser(File file, String jobName, String filename, String fileMD5, Long updateLineageId, Long folderId) {
            this(file, jobName, filename, fileMD5, false, true, true, folderId);
            this.updateLineageId = updateLineageId;
        }

        SimpleTemplateParser(File file, String jobName, String filename, String fileMD5, boolean updateSameFileLineage, boolean moveFile, boolean deleteFile, Long folderId) {
            super();
            this.parserLogger = LoggerFactory.getLogger(LineageImportServiceImpl.LineageParser.class);
            this.deleteFile = true;
            this.file = file;
            this.originFilename = filename;
            this.lineageService = new LineageImportServiceImpl.LineageSimpleTemplateParser();
            this.uploader = AuthTools.currentUsernameNullSafe();
            this.fileMD5 = fileMD5;
            this.jobName = jobName;
            this.updateSameFileLineage = updateSameFileLineage;
            this.moveFile = moveFile;
            this.context = SecurityContextHolder.getContext();
            this.deleteFile = deleteFile;
            this.folderId = folderId;
        }

        public Object call() throws Exception {
            SecurityContextHolder.setContext(this.context);
            if (this.file != null && this.file.exists()) {
                List<String> result = new ArrayList();
                if (this.originFilename.endsWith("zip")) {
                    result.addAll(this.parserZipFile());
                } else {
                    result.addAll(this.parserExcelFile(this.file, this.originFilename));
                }

                return result.isEmpty() ? 0 : result;
            } else {
                throw new InvalidArgumentException(msgService.getMessage("bloodLineageFileNotFound", new Object[]{this.originFilename}));
            }
        }

        protected List<String> parserZipFile() {
            List<String> result = new ArrayList();
            String var10000 = GeneralUtility.getWebRootPath();
            String tempFilePath = var10000 + "/tmp/" + UUID.randomUUID();
            logger.info("Extract zip file temporary directory: " + tempFilePath);

            try {
                logger.info("Start extracting files to temporary directory");
                List<File> files = ZipFileUtil.unzip(this.file, tempFilePath);
                logger.info("Decompression completed, total file size [{}]", files.size());
                Iterator var4 = ((List)Objects.requireNonNull(files)).iterator();

                while(var4.hasNext()) {
                    File excelFile = (File)var4.next();
                    result.addAll(this.parserExcelFile(excelFile, excelFile.getName()));
                }
            } catch (Exception var9) {
                throw new AndorjRuntimeException(var9.getMessage(), var9);
            } finally {
                ZipFileUtil.deleteDir(new File(tempFilePath));
                logger.info("Delete decompressed temporary files");
            }

            return result;
        }

        protected List<String> parserExcelFile(File file, String originFilename) {
            if (this.folderId != null) {
                try {
                    scriptService.runLineageScript(this.folderId, this.lineageService.getType(), file);
                } catch (Exception var16) {
                    throw new AndorjRuntimeException("Run lineage script error", var16);
                }
            }

            LineageContainer container = null;

            try {
                if (this.lineageService == null) {
                    this.lineageService = new LineageImportServiceImpl.LineageSimpleTemplateParser();
                }

                container = this.lineageService.parse(file, originFilename);
            } catch (Exception var17) {
                this.parserLogger.error("parse lineage file failed", var17);
                throw new UnexpectedStateException(msgService.getMessage("failedToParseLineageFileNoParam"));
            }

            //TODO 获取来源ETL信息进行保存关系
            try {
                lineageMappingServiceExt.saveEtlSource(file, null, this.folderId == null ? 0L : this.folderId, container);
            } catch (Exception e) {
                this.parserLogger.error("failed to get ETL info by excel, because {}", e.getMessage());
            }

            Integer unbindCount = (Integer)container.getProperty("$unbindObjectCount");
            LinkedList<String> errors = (LinkedList)container.getProperty("$importErrors");
            List<String> result = new ArrayList();
            if (!ObjectUtils.equals(unbindCount, 0)) {
                errors.addFirst(msgService.getMessage("lineageImport.parse.report", new Object[]{unbindCount, errors.size()}));
                result.addAll(errors);
            }

            container.cleanProperty("$unbindObjectCount");
            container.cleanProperty("$importErrors");
            Lineage entity = null;

            try {
                entity = new Lineage();
                entity.setContent(mapper.writeValueAsString(container));
                entity.setFilename(originFilename);
                entity.setTimeStamp(System.currentTimeMillis());
                entity.setName(this.jobName);
                entity.setHash(this.fileMD5);
                entity.setType(LineageType.EXCEL.name());
                entity.setUploader(this.uploader);
                entity.setFolderId(this.folderId == null ? 0L : this.folderId);
                entity.setFileFieldId(commitLineageFile(file, originFilename, this.uploader, this.deleteFile));
                entity = lineageDao.createOrUpdateEntity(entity, container);
                this.parserLogger.info("saved entity");
            } catch (Exception var15) {
                this.parserLogger.error("failed to save lineage entity", var15);
                throw new UnexpectedStateException(msgService.getMessage("bloodLineageFileSavingFailed", new Object[]{var15.getMessage()}));
            }

            boolean success = false;

            try {
                discoverAllMappings(container, entity);
                success = true;

                try {
                    if (!ObjectUtils.equals(Boolean.TRUE, container.getProperty(LineageKnownProperty.USER_DEFINE_LINEAGE.getPropertyName()))) {
                        mappingService.autoBindLineageToMateData(container, entity, this.uploader, new ArrayList(), new ArrayList(), new ArrayList());
                    }
                } catch (Exception var13) {
                    logger.error("failed to binding to metadata", var13);
                }
            } catch (Exception var14) {
                this.parserLogger.error("failed to extract mappings", var14);
                this.parserLogger.info("rollback...");
                lineageDao.deleteEntity(entity.getId());
                throw new UnexpectedStateException(msgService.getMessage("bloodLineageImportFailed", new Object[]{var14.getMessage()}));
            }

            if (success && (this.updateSameFileLineage || this.updateLineageId != null)) {
                List<Lineage> lineagesx = null;
                if (this.updateSameFileLineage) {
                    lineagesx = lineageDao.getLineageByFileName(originFilename);
                } else {
                    List<Lineage> lineages = lineageDao.getLineageByIds(Collections.singleton(this.updateLineageId));
                    lineagesx = new ArrayList(lineages);
                    ((List)lineagesx).add(entity);
                }

                if (((List)lineagesx).size() == 2) {
                    try {
                        Long currentLineageId = entity.getId();
                        List<Lineage> oldLineage = lineagesx.stream()
                                .filter(x -> !Objects.equals(x.getId(), currentLineageId))
                                .collect(Collectors.toList());
                        logger.info("updated lineage:" + oldLineage.get(0) + " and this lineage is being deleted");
                        lineageDao.deleteEntity(((Lineage)oldLineage.get(0)).getId());
                    } catch (Throwable var12) {
                        throw new UnexpectedStateException(msgService.getMessage("updateBloodLineageFileErrorNoMessage", new Object[]{originFilename}));
                    }
                }
            }

            if (file != null && this.deleteFile) {
                this.file.delete();
            }

            this.setBoundResourceId(entity.getId() != null ? entity.getId().toString() : null);
            return result;
        }
    }

    public static class LineageSimpleTemplateParser implements LineageService {
        public LineageSimpleTemplateParser() {
        }

        public void setContentParamterMapping(Map<String, String> mappings) {
        }

        public LineageContainer parse(String content, String postfix) throws Exception {
            return null;
        }

        public LineageContainer parse(File file, String postfix) throws Exception {
            LineageContainer container = ((LineageMappingService) BeanHelper.getBean(LineageMappingService.class)).importSimpleTemplateFile(file);
            return container;
        }

        public String getType() {
            return "Excel";
        }

        public String getSupportFileExtension() {
            return ".xlsx";
        }
    }

    public class BatchLineageParser implements Callable {
        private final Logger parserLogger = LoggerFactory.getLogger(LineageImportServiceImpl.BatchLineageParser.class);
        private File dir;
        private SecurityContext context;
        private LineageService lineageService;
        private List<StringPairDto> failedFiles = new LinkedList();
        private Long folderId;

        BatchLineageParser(File dir, LineageService lineageService, Long folderId) {
            this.dir = dir;
            this.lineageService = lineageService;
            this.context = SecurityContextHolder.getContext();
            this.folderId = folderId;
        }

        public Object call() {
            SecurityContextHolder.setContext(this.context);
            if (this.dir.isDirectory() && this.dir.exists()) {
                Integer totalFileCount = 0;
                Traverser<File> traverser = Files.fileTraverser();
                Iterator var3 = traverser.breadthFirst(this.dir).iterator();

                while(var3.hasNext()) {
                    File file = (File)var3.next();
                    String supportFileExtension = this.lineageService.getSupportFileExtension();
                    if (supportFileExtension != null && supportFileExtension.contains(".sql")) {
                        supportFileExtension = supportFileExtension + "|.sh";
                    }

                    String[] fileTypes = supportFileExtension.split("\\|");
                    boolean supportFile = false;
                    String[] var8 = fileTypes;
                    int var9 = fileTypes.length;

                    for(int var10 = 0; var10 < var9; ++var10) {
                        String fileType = var8[var10];
                        supportFile = supportFile || file.getName().toLowerCase().endsWith(fileType);
                    }

                    if (!file.isDirectory() && supportFile) {
                        if (this.folderId != null) {
                            try {
                                scriptService.runLineageScript(this.folderId, this.lineageService.getType(), file);
                            } catch (Exception var18) {
                                throw new AndorjRuntimeException("Run lineage script error", var18);
                            }
                        }

                        this.parserLogger.debug("parsing file:" + file.getName());
                        totalFileCount = totalFileCount + 1;

                        try {
                            String fileMD5 = DigestUtils.getFileMd5(file);
                            checkFileMD5Existense(fileMD5);
                            LineageParser parser = new LineageParser(file, file.getName(), file.getName(), this.lineageService, fileMD5, this.folderId);
                            parser.call();
                        } catch (Exception var16) {
                            this.parserLogger.error("parsing lineage file [" + file.getAbsolutePath() + "] failed", var16);
                            this.failedFiles.add(new StringPairDto(file.getName(), var16.getMessage()));
                        } finally {
                            file.delete();
                        }
                    }
                }

                if (totalFileCount == 0) {
                    throw new IllegalArgumentException(msgService.getMessage("bloodLineageFileNotFoundNoParam"));
                } else {
                    LoadLineagePackageFileResultDto result = new LoadLineagePackageFileResultDto();
                    result.setFailedFiles(this.failedFiles);
                    result.setTotalFilesCount(totalFileCount);
                    return result;
                }
            } else {
                throw new InvalidArgumentException(msgService.getMessage("tagetPathExistsFile", new Object[]{this.dir.getAbsolutePath()}));
            }
        }
    }

    public abstract class BaseParser implements Callable {
        protected String boundResourceId;

        public BaseParser() {
        }

        protected void updateLineage(Lineage oldLineage, Lineage newLineage, LineageContainer newContainer) throws Exception {
            LineageContainer oldContainer = (LineageContainer)mapper.readValue(oldLineage.getContent(), LineageContainer.class);
            Iterator var5 = oldContainer.getStepsSet().iterator();

            while(true) {
                LineageStep step;
                List foundSteps;
                do {
                    do {
                        do {
                            if (!var5.hasNext()) {
                                lineageDao.createObjectLineageContent(newLineage, newContainer);
                                mappingService.bindLineageObject(newLineage, newContainer);
                                return;
                            }

                            step = (LineageStep)var5.next();
                        } while(!step.hasProperty(LineageKnownProperty.INPUT_TABLE.getPropertyName()) && !step.hasProperty(LineageKnownProperty.OUTPUT_TABLE.getPropertyName()));

                        foundSteps = newContainer.findAllStepsByStepName(step.getName());
                    } while(foundSteps.isEmpty());
                } while(!step.hasProperty(LineageKnownProperty.BIND_OBJECT_ID.getPropertyName()));

                float maxScore = 0.0F;
                LineageStep mappedStep = null;
                Iterator var10 = foundSteps.iterator();

                while(var10.hasNext()) {
                    LineageStep foundStep = (LineageStep)var10.next();
                    float score = this.calculateSimilarity(oldContainer, newContainer, step, foundStep);
                    if (score > maxScore) {
                        maxScore = score;
                        mappedStep = foundStep;
                    }
                }

                List<LineageBindingProperty> lineageBindingProperties = LineageUtility.getLineageBindingProperties(step);
                Iterator var17 = lineageBindingProperties.iterator();

                while(var17.hasNext()) {
                    LineageBindingProperty bindingProperty = (LineageBindingProperty)var17.next();
                    if (bindingProperty.isTableLevel()) {
                        mappingService.bindLineageTerminalToObject(newLineage, newContainer, mappedStep.getId(), (String)null, bindingProperty.getTableObjectId(), bindingProperty.getModelObjectId(), bindingProperty.isDdmObject(), false, true, true);
                    } else {
                        String lineageColumnId = bindingProperty.getLineageColumnId();
                        LineageColumn column = step.findColumn(lineageColumnId);
                        LineageColumn newColumn = mappedStep.findColumnByName(column.getName());
                        if (newColumn != null) {
                            mappingService.bindLineageTerminalToObject(newLineage, newContainer, mappedStep.getId(), newColumn.getId(), bindingProperty.getColumnObjectId(), bindingProperty.getModelObjectId(), bindingProperty.isDdmObject(), false, true, false);
                        }
                    }
                }
            }
        }

        protected float calculateSimilarity(LineageContainer oldContainer, LineageContainer newContainer, LineageStep oldStep, LineageStep newStep) {
            float score = 0.0F;
            Iterator var6 = newStep.getProperties().entrySet().iterator();

            while(var6.hasNext()) {
                Map.Entry<String, String> entry = (Map.Entry)var6.next();
                if (ObjectUtils.equals(newStep.getProperty((String)entry.getKey()), entry.getValue())) {
                    score += 0.5F;
                }
            }

            var6 = newStep.getColumns().iterator();

            while(var6.hasNext()) {
                LineageColumn column = (LineageColumn)var6.next();
                if (oldStep.findColumnByName(column.getName()) != null) {
                    ++score;
                }
            }

            List<String> sourceNames = new LinkedList();
            List<String> targetNames = new LinkedList();
            Iterator var8 = oldContainer.getLines().iterator();

            LineageLine line;
            LineageStep sourceStep;
            while(var8.hasNext()) {
                line = (LineageLine)var8.next();
                if (line.getSourceStepId().equals(oldStep.getId())) {
                    sourceStep = oldContainer.getStep(line.getTargetStepId());
                    if (sourceStep != null) {
                        targetNames.add(sourceStep.getName().toLowerCase());
                    }
                } else if (line.getTargetStepId().equals(oldStep.getId())) {
                    sourceStep = oldContainer.getStep(line.getSourceStepId());
                    if (sourceStep != null) {
                        sourceNames.add(sourceStep.getName().toLowerCase());
                    }
                }
            }

            var8 = newContainer.getLines().iterator();

            while(var8.hasNext()) {
                line = (LineageLine)var8.next();
                if (line.getSourceStepId().equals(newStep.getId())) {
                    sourceStep = newContainer.getStep(line.getTargetStepId());
                    if (sourceStep != null && targetNames.contains(sourceStep.getName().toLowerCase())) {
                        targetNames.remove(sourceStep.getName().toLowerCase());
                        ++score;
                    }
                } else if (line.getTargetStepId().equals(newStep.getId())) {
                    sourceStep = newContainer.getStep(line.getSourceStepId());
                    if (sourceStep != null && sourceNames.contains(sourceStep.getName().toLowerCase())) {
                        sourceNames.remove(sourceStep.getName().toLowerCase());
                        ++score;
                    }
                }
            }

            return score;
        }

        public String getBoundResourceId() {
            return this.boundResourceId;
        }

        public void setBoundResourceId(String boundResourceId) {
            this.boundResourceId = boundResourceId;
        }
    }




}
