package com.datablau.metadata.main.job;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.covermm.SheetData;
import com.datablau.metadata.main.dto.covermm.Sheets;
import com.datablau.metadata.main.dto.mm.UnstructuredDirectoryDto;
import com.datablau.metadata.main.dto.mm.UnstructuredFileDto;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.job.descriptor.SyncUnstructuredDirectoryJobDescriptor;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class SyncUnstructuredDirectoryJob extends DatablauJobAdapter {

    private Logger logger = LoggerFactory.getLogger(SyncUnstructuredDirectoryJob.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private Long modelId;
    private String directoryUrl;
    private String directoryToken;
    private String directoryFid;
    private String fileMeteTypeToken;
    private String fileMeteTypeUrl;
    private String fileMeteTypeRecordToken;
    private String fileMeteTypeRecordUrl;
    private String metaTypeId;
    private String unstructuredDirectorySheet1;
    private String unstructuredDirectorySheet2;
    private String unstructuredDirectorySheet3;
    private String tokenUrl;
    private String loginName;
    private String ipAddress;
    private String integrationKey;
    private String clientTypeStr;


    private ModelRepository dataModelRepo;

    private MetaModelDataService metaModelDataService;
    private SyncUnstructuredDirectoryJobDescriptor jobDescriptor;

    private static final int PAGE_SIZE = 1000;

    private Environment environment;

    public SyncUnstructuredDirectoryJob() {

    }

    public SyncUnstructuredDirectoryJob(DatablauJobDescriptor descriptor) {
        this.jobDescriptor = new SyncUnstructuredDirectoryJobDescriptor(descriptor);
    }

    public void prepare() throws Exception {
        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        this.dataModelRepo = BeanHelper.getBean(ModelRepository.class);
        this.environment = BeanHelper.getBean(Environment.class);
        if (this.metaModelDataService == null) {
            throw new DatablauJobExecutionException("Cannot find metaModelDataService");
        }
        if (this.dataModelRepo == null) {
            throw new DatablauJobExecutionException("Cannot find dataModelRepo");
        }
        String modelIdStr = environment.getProperty("sync.directory.modelId");
        if (Strings.isNullOrEmpty(modelIdStr)) {
            throw new DatablauJobExecutionException("Cannot find modelId");
        } else {
            modelId = Long.parseLong(modelIdStr);
            logger.info("modelId:{}", modelId);
        }
        directoryFid = environment.getProperty("sync.directoryFid");
        if (Strings.isNullOrEmpty(directoryFid)) {
            throw new DatablauJobExecutionException("Cannot find directoryFid");
        }
        logger.info("directoryFid:{}", directoryFid);

        directoryUrl = environment.getProperty("sync.directoryUrl");
        if (Strings.isNullOrEmpty(directoryUrl)) {
            throw new DatablauJobExecutionException("Cannot find directoryUrl");
        }
        logger.info("directoryUrl:{}", directoryUrl);

        fileMeteTypeUrl = environment.getProperty("sync.fileMeteTypeUrl");
        if (Strings.isNullOrEmpty(fileMeteTypeUrl)) {
            throw new DatablauJobExecutionException("Cannot find fileMeteTypeUrl");
        }
        logger.info("fileMeteTypeUrl:{}", fileMeteTypeUrl);

        fileMeteTypeRecordUrl = environment.getProperty("sync.fileMeteTypeRecordUrl");
        if (Strings.isNullOrEmpty(fileMeteTypeRecordUrl)) {
            throw new DatablauJobExecutionException("Cannot find fileMeteTypeRecordUrl");
        }
        logger.info("fileMeteTypeRecordUrl:{}", fileMeteTypeRecordUrl);

        metaTypeId = environment.getProperty("sync.metaTypeId");
        if (Strings.isNullOrEmpty(metaTypeId)) {
            throw new DatablauJobExecutionException("Cannot find metaTypeId");
        }
        logger.info("metaTypeId:{}", metaTypeId);

        unstructuredDirectorySheet1 = environment.getProperty("sync.unstructuredDirectorySheet1");
        if (Strings.isNullOrEmpty(unstructuredDirectorySheet1)) {
            throw new DatablauJobExecutionException("Cannot find unstructuredDirectorySheet1");
        }
        logger.info("unstructuredDirectorySheet1:{}", unstructuredDirectorySheet1);

        unstructuredDirectorySheet2 = environment.getProperty("sync.unstructuredDirectorySheet2");
        if (Strings.isNullOrEmpty(unstructuredDirectorySheet2)) {
            throw new DatablauJobExecutionException("Cannot find unstructuredDirectorySheet2");
        }
        logger.info("unstructuredDirectorySheet2:{}", unstructuredDirectorySheet2);

        unstructuredDirectorySheet3 = environment.getProperty("sync.unstructuredDirectorySheet3");
        if (Strings.isNullOrEmpty(unstructuredDirectorySheet3)) {
            throw new DatablauJobExecutionException("Cannot find unstructuredDirectorySheet3");
        }
        logger.info("unstructuredDirectorySheet3:{}", unstructuredDirectorySheet3);

        loginName = environment.getProperty("sync.loginName");
        if (Strings.isNullOrEmpty(loginName)) {
            throw new DatablauJobExecutionException("Cannot find loginName");
        }
        logger.info("loginName:{}", loginName);

        ipAddress = environment.getProperty("sync.ipAddress");
        if (Strings.isNullOrEmpty(ipAddress)) {
            throw new DatablauJobExecutionException("Cannot find ipAddress");
        }
        logger.info("ipAddress:{}", ipAddress);

        integrationKey = environment.getProperty("sync.integrationKey");
        if (Strings.isNullOrEmpty(integrationKey)) {
            throw new DatablauJobExecutionException("Cannot find integrationKey");
        }
        logger.info("integrationKey:{}", integrationKey);

        clientTypeStr = environment.getProperty("sync.clientType");
        if (Strings.isNullOrEmpty(clientTypeStr)) {
            throw new DatablauJobExecutionException("Cannot find clientType");
        }
        logger.info("clientTypeStr:{}", clientTypeStr);

        tokenUrl = environment.getProperty("sync.tokenUrl");
        if (Strings.isNullOrEmpty(tokenUrl)) {
            throw new DatablauJobExecutionException("Cannot find tokenUrl");
        }
        logger.info("tokenUrl:{}", tokenUrl);
    }

    public void execute() throws Exception {
        this.checkStopSign();
        logger.info("获取token开始");
        String token = getToken();
        logger.info("获取token结束");
        directoryToken = token;
        fileMeteTypeToken = token;
        fileMeteTypeRecordToken = token;
        logger.info("开始执行非结构化目录同步任务");
        UnstructuredDirectoryDto rootFolder = fetchAllFolders(directoryFid, PAGE_SIZE);
        this.checkStopSign();
        logger.info("获取目录及目录下的所有子目录和文件完成");

        List<UnstructuredDirectoryDto> allDirectories = Lists.newArrayList();
        List<UnstructuredFileDto> allFiles = Lists.newArrayList();

        logger.info("组装数据 begin");
        collectAllDirectoriesAndFiles(rootFolder, allDirectories, allFiles);
        logger.info("共获取到目录:{}个", allDirectories.size());
        logger.info("共获取到文件:{}个", allFiles.size());
        // 分别处理目录和文件
//        processDirectories(allDirectories);
        processFiles(allFiles);
        logger.info("组装数据 end");
        this.checkStopSign();
        Map<Long, String> directoryDtoMap = allDirectories.stream().collect(Collectors.toMap(UnstructuredDirectoryDto::getDirectoryId, UnstructuredDirectoryDto::getDirectoryName, (x1, x2) -> x1));

        //存入元模型
        Optional<Model> modelOpt = dataModelRepo.findById(modelId);
        Model model = modelOpt.get();

        //sheet1数据
        SheetData sheetData1 = new SheetData(unstructuredDirectorySheet1);
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".Id");
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".Name");
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".Definition");
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, model.getDefinition(), "", ""));

        //sheet2数据
        SheetData sheetData2 = new SheetData(unstructuredDirectorySheet2);
        sheetData2.addHeader(unstructuredDirectorySheet1 + ".Id");
        sheetData2.addHeader(unstructuredDirectorySheet1 + ".Name");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".Id");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".Name");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".Definition");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".LogicalName");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".directoryName");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".directoryId");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".directorySummary");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".directoryPath");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".creator");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".createTime");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".modifieder");
        sheetData2.addHeader(unstructuredDirectorySheet2 + ".parentId");

        for (UnstructuredDirectoryDto allDirectory : allDirectories) {
            List data = Arrays.asList(modelId, model.getDefinition(), "", allDirectory.getDirectoryName(), "",allDirectory.getDirectoryName(), allDirectory.getDirectoryName(), allDirectory.getDirectoryId(), allDirectory.getDirectorySummary(),
                    allDirectory.getDirectoryPath(), allDirectory.getCreator(), allDirectory.getCreateTime(), allDirectory.getModifieder(), allDirectory.getParentId());
            sheetData2.addData(data);
        }

        //sheetData3数据
        SheetData sheetData3 = new SheetData(unstructuredDirectorySheet3);
        sheetData3.addHeader(unstructuredDirectorySheet2 + ".Id");
        sheetData3.addHeader(unstructuredDirectorySheet2 + ".Name");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".Id");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".Name");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".Definition");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".LogicalName");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".dl1BusinessDomain");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".dl2ThemeDomain");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".sourceSystem");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".dataMaster");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".dataSteward");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".resourceName");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".resourceSummary");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".resourceFormat");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".creator");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".ownCompany");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".uploader");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".uploadTime");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".modifieder");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".modifyTime");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".fileSize");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".dataTag");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".updateCycle");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".version");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".securityLevel");
        sheetData3.addHeader(unstructuredDirectorySheet3 + ".filePath");

        for (UnstructuredFileDto allFile : allFiles) {
            Long directoryId = allFile.getDirectoryId();
            String directoryName = directoryDtoMap.get(directoryId);
            String name = model.getDefinition()+"."+directoryName;
            List data = Arrays.asList("", name, "", allFile.getResourceName(), "", allFile.getResourceName(), allFile.getDl1BusinessDomain(), allFile.getDl2ThemeDomain(),
                    allFile.getSourceSystem(), allFile.getDataMaster(), allFile.getDataSteward(), allFile.getResourceName(), allFile.getResourceSummary(),
                    allFile.getResourceFormat(), allFile.getCreator(), allFile.getOwnCompany(), allFile.getUploader(), allFile.getUploadTime(),
                    allFile.getModifieder(), allFile.getFileSize(), allFile.getDataTag(), allFile.getUpdateCycle(), allFile.getVersion(), allFile.getSecurityLevel(),
                    allFile.getFilePath());
            sheetData3.addData(data);
        }
        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        sheetDatas.add(sheetData3);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);
        this.checkStopSign();
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
        logger.info("执行非结构化目录同步任务结束");
    }

    private String getToken() throws Exception {

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("loginName", loginName);
        jsonObject.put("ipAddress", ipAddress);
        jsonObject.put("integrationKey", integrationKey);
        jsonObject.put("clientType", Integer.parseInt(clientTypeStr));

        try (HttpResponse response = HttpRequest.post(tokenUrl)
                .header("Content-Type", "application/json")
                .body(jsonObject.toString())
                .execute()) {

            int statusCode = response.getStatus();
            logger.info("Response Code:{}", statusCode);
            if (statusCode == 200) {
                String responseContent = response.body();
                logger.info("Response Content:{}", responseContent);
                JSONObject jsonResponse = new JSONObject(responseContent);
                String data = jsonResponse.getString("data");
                logger.info("data:{}", data);
                return data;
            } else {
                throw new Exception("获取token失败");
            }
        } catch (Exception e) {
            logger.error("获取token失败:{}", e.getMessage());
            throw e;
        }
    }



    private void collectAllDirectoriesAndFiles(UnstructuredDirectoryDto folder, List<UnstructuredDirectoryDto> allDirectories, List<UnstructuredFileDto> allFiles) {
        // 添加当前目录
        allDirectories.add(folder);

        // 添加当前目录下的文件
        allFiles.addAll(folder.getFileDtos());

        // 递归处理子目录
        for (UnstructuredDirectoryDto subFolder : folder.getSubDirectoryList()) {
            collectAllDirectoriesAndFiles(subFolder, allDirectories, allFiles);
        }
    }

    private void processDirectories(List<UnstructuredDirectoryDto> directories) throws Exception {
        for (UnstructuredDirectoryDto directory : directories) {
            Long directoryId = directory.getDirectoryId();
            String resp = sendFileMetaTypeRequest(directoryId, 1);
            //元数据记录id
            String metaRecordId = getMetaMapValue(resp);
            //获取指定元数据记录
            String recordData = sendFileMetaTypeRecordRequest(metaRecordId);
            // 解析元数据记录并提取所需属性
            JsonNode recordNode = mapper.readTree(recordData);
            JsonNode dataNode = recordNode.get("data");
            if (dataNode != null && dataNode.isArray()) {
                for (JsonNode item : dataNode) {
                    String attrId = item.get("attrId").asText();
                    String attrValue = item.get("attrValue").asText();
                    // 根据需要提取特定的属性
                    switch (attrId) {
                        case "directorySummary":
                            directory.setDirectorySummary(attrValue);
                            break;
                        case "modifieder":
                            directory.setModifieder(attrValue);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    private void processFiles(List<UnstructuredFileDto> files) throws Exception {

//        if (!CollectionUtils.isEmpty(files)) {
//            UnstructuredFileDto unstructuredFileDto = files.get(0);
//            logger.info("unstructuredFileDto:{}", unstructuredFileDto.toString());
//        }
        for (UnstructuredFileDto file : files) {
//            logger.info("file:{}", file);
            Long directoryId = file.getFileId();
            String resp = sendFileMetaTypeRequest(directoryId, 2);
            //元数据记录id
            String metaRecordId = getMetaMapValue(resp);
            //获取指定元数据记录
            String recordData = sendFileMetaTypeRecordRequest(metaRecordId);
            // 解析元数据记录并提取所需属性
            JsonNode recordNode = mapper.readTree(recordData);
            JsonNode dataNode = recordNode.get("data");
            if (dataNode != null && dataNode.isArray()) {
                for (JsonNode item : dataNode) {
                    String attrId = item.get("attrId").asText();
                    String attrValue = item.get("attrValue").asText();
                    // 根据需要提取特定的属性
                    switch (attrId) {
                        case "dl1BusinessDomain":
                            file.setDl1BusinessDomain(attrValue);
                            break;
                        case "dl2ThemeDomain":
                            file.setDl2ThemeDomain(attrValue);
                            break;
                        case "sourceSystem":
                            file.setSourceSystem(attrValue);
                            break;
                        case "dataMaster":
                            file.setDataMaster(attrValue);
                            break;
                        case "dataSteward":
                            file.setDataSteward(attrValue);
                            break;
                        case "resourceName":
                            file.setResourceName(attrValue);
                            break;
                        case "resourceSummary":
                            file.setResourceSummary(attrValue);
                        case "creator":
                            file.setCreator(attrValue);
                        case "ownCompany":
                            file.setOwnCompany(attrValue);
                            break;
                        case "uploader":
                            file.setUploader(attrValue);
                            break;
                        case "uploadTime":
                            file.setUploadTime(attrValue);
                            break;
                        case "modifieder":
                            file.setModifieder(attrValue);
                            break;
                        case "fileSize":
                            file.setFileSize(attrValue);
                            break;
                        case "dataTag":
                            file.setDataTag(attrValue);
                            break;
                        case "updateCycle":
                            file.setUpdateCycle(attrValue);
                            break;
                        case "version":
                            file.setVersion(attrValue);
                            break;
                        case "securityLevel":
                            file.setSecurityLevel(attrValue);
                            break;
                        case "filePath":
                            file.setFilePath(attrValue);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    private String sendRequestPage(String folderId, int pageNum, int pageSize) throws Exception {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("token", directoryToken);
        jsonObject.put("code", "");
        jsonObject.put("fid", folderId);
        String pageXml = "<GetListArgs><PageNum>" + pageNum + "</PageNum><PageSize>" + pageSize + "</PageSize><SortInfoName>basic:name</SortInfoName><SortDesc>false</SortDesc></GetListArgs>";
        jsonObject.put("argsXml", pageXml);
        jsonObject.put("noCalcPerm", false);

        try (HttpResponse response = HttpUtil.createPost(directoryUrl)
                .addHeaders(headers)
                .body(jsonObject.toString())
                .execute()) {
            // 获取响应体的内容
            String responseBody = response.body();
            return responseBody;
        } catch (Exception e) {
            logger.error("分页请求directoryUrl接口失败：", e);
            throw e;
        }
    }
    public UnstructuredDirectoryDto fetchAllFolders(String folderId, int pageSize) throws Exception {
        // 获取根目录下
        UnstructuredDirectoryDto rootFolder = getInitialRootFolder(folderId, 1, 1);

        // 分页获取根目录下的所有子目录和文件
        fetchAllSubFolders(folderId, 1, pageSize, rootFolder);

        // 递归获取每个子目录的所有子目录和文件
        fetchSubFoldersRecursively(rootFolder, pageSize);

        return rootFolder;
    }
    private UnstructuredDirectoryDto parseFolder(JsonNode dataNode) {
        //获取当前目录的基本信息
        JsonNode folderNode = dataNode.get("data").get("thisFolder");
        //目录id
        Long folderId = folderNode.get("id").asLong();
        //目录名称
        String folderName = folderNode.get("name").asText();
        //创建人
        String creatorName = folderNode.get("creatorName").asText();
        //创建时间
        String createTime = folderNode.get("createTime").asText();
        //目录全路径
        String path = folderNode.get("path").asText();
        //目录对应的上级目录ID
        Long parentFolderId = folderNode.get("parentFolderId").asLong();

        UnstructuredDirectoryDto directoryDto = new UnstructuredDirectoryDto(folderName, folderId, path, creatorName, createTime, parentFolderId);
        return directoryDto;
    }


    /**
     * 获取根目录信息
     * @param folderId
     * @param pageNum
     * @param pageSize
     * @return
     * @throws Exception
     */
    private UnstructuredDirectoryDto getInitialRootFolder(String folderId, int pageNum, int pageSize) throws Exception {
        String jsonResponse = sendRequestPage(folderId, pageNum, pageSize);
        logger.info("Fetching initial root folder for folderId: {}, pageNum: {}", folderId, pageNum);
        try {
            JsonNode rootNode = mapper.readTree(jsonResponse);
            if (rootNode == null) {
                throw new IllegalArgumentException("JSON response does not contain 'data' node");
            }
            return parseFolder(rootNode);
        } catch (Exception e) {
            logger.error("Failed to fetch initial root folder: ", e);
            throw e;
        }
    }
    private void fetchSubFoldersRecursively(UnstructuredDirectoryDto currentFolder, int pageSize) throws Exception {
        if (currentFolder == null) {
            throw new IllegalArgumentException("Current folder cannot be null");
        }

        for (UnstructuredDirectoryDto subFolder : currentFolder.getSubDirectoryList()) {
            fetchAllSubFolders(subFolder.getDirectoryId().toString(), 1, pageSize, subFolder);
            fetchSubFoldersRecursively(subFolder, pageSize);
        }
    }
    private void fetchAllSubFolders(String folderId, int pageNum, int pageSize, UnstructuredDirectoryDto currentFolder) throws Exception {
        if (currentFolder == null) {
            throw new IllegalArgumentException("Current folder cannot be null");
        }
        String jsonResponse = sendRequestPage(folderId, pageNum, pageSize);
        try {
            JsonNode rootNode = mapper.readTree(jsonResponse);
            JsonNode dataNode = rootNode.get("data");
            if (dataNode == null) {
                throw new IllegalArgumentException("JSON response does not contain 'data' node");
            }

            JsonNode docListInfo = dataNode.get("docListInfo");
            if (docListInfo == null) {
                throw new IllegalArgumentException("JSON response does not contain 'docListInfo' node");
            }

            int totalCount = docListInfo.get("settings").get("totalCount").asInt();
            int totalFolders = docListInfo.get("settings").get("folderCount").asInt();
            int totalFiles = docListInfo.get("settings").get("fileCount").asInt();

            logger.info("totalCount: {}, totalFolders: {}, totalFiles: {}", totalCount, totalFolders, totalFiles);

            // 更新当前目录的文件和子目录
            updateFolderData(currentFolder, dataNode);

            // 如果还有更多分页数据，递归获取
            if ((pageNum * pageSize) < totalCount) {
                fetchAllSubFolders(folderId, pageNum + 1, pageSize, currentFolder);
            }
        } catch (Exception e) {
            logger.error("Failed to fetch subfolders: ", e);
            throw e;
        }
    }
    private void updateFolderData(UnstructuredDirectoryDto currentFolder, JsonNode dataNode) {
        if (currentFolder == null || dataNode == null) {
            throw new IllegalArgumentException("Current folder or data node cannot be null");
        }

        JsonNode filesNode = dataNode.get("docListInfo").get("filesInfo");
        if (filesNode != null) {
            for (JsonNode fileNode : filesNode) {
                //文件ID
                Long fileId = fileNode.get("id").asLong();
                //文件所属目录ID
                Long parentFolderIdForFile = fileNode.get("parentFolderId").asLong();
                UnstructuredFileDto file = new UnstructuredFileDto(fileId, parentFolderIdForFile);
                currentFolder.addFile(file);

            }
        }

        JsonNode childFoldersNode = dataNode.get("docListInfo").get("foldersInfo");
        if (childFoldersNode != null) {
            for (JsonNode childFolderNode : childFoldersNode) {
                UnstructuredDirectoryDto firstChild = buildFirstChild(childFolderNode);
                currentFolder.addSubDirectory(firstChild);
            }
        }
    }


    private  UnstructuredDirectoryDto buildFirstChild(JsonNode childFoldersNode) {
        //目录id
        Long folderId = childFoldersNode.get("id").asLong();
        //目录名称
        String folderName = childFoldersNode.get("name").asText();
        //创建人
        String creatorName = childFoldersNode.get("creatorName").asText();
        //创建时间
        String createTime = childFoldersNode.get("createTime").asText();
        //目录全路径
        String path = childFoldersNode.get("path").asText();
        //目录对应的上级目录ID
        Long parentFolderId = childFoldersNode.get("parentFolderId").asLong();
        UnstructuredDirectoryDto subDirectoryDto = new UnstructuredDirectoryDto(folderName, folderId, path, creatorName, createTime, parentFolderId);
        return subDirectoryDto;
    }




    /**
     * 获取文档自身绑定元数据，只返回元数据记录id值，具体字段值需要通过GetFileMetaTypeRecord接口获取
     * @param fileId
     * @param type
     * @return
     * @throws Exception
     */
    private String sendFileMetaTypeRequest(Long fileId, Integer type) throws Exception {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("token", fileMeteTypeToken);
        jsonObject.put("fileId", fileId); //文件id
        jsonObject.put("fileType", type);//文档类型，1：文件夹，2：文件
        jsonObject.put("fileVerId", 0);//固定给0

//        logger.info("jsonObject.toString():{}", jsonObject.toString());
        try (HttpResponse response = HttpUtil.createPost(fileMeteTypeUrl)
                .addHeaders(headers)
                .body(jsonObject.toString())
                .execute()) {
            // 获取响应体的内容
            String responseBody = response.body();
            return responseBody;
        } catch (Exception e) {
            logger.error("分页请求directoryUrl接口失败：", e);
            throw e;
        }
    }

    /**
     * 获取指定typeId对应的metaRecordId
     * @param jsonResponse
     * @return
     * @throws Exception
     */
    public String getMetaMapValue(String jsonResponse) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(jsonResponse);

        JsonNode dataNode = rootNode.get("data");
        if (dataNode == null) {
            logger.error("getMetaMapValue JSON response does not contain 'data' node: {}", jsonResponse);
            throw new IllegalArgumentException("JSON response does not contain 'data' node");
        }

        // 获取 metaMaps
        JsonNode metaMapsNode = dataNode.get("metaMaps");
        if (metaMapsNode == null) {
            throw new IllegalArgumentException("JSON response does not contain 'metaMaps'");
        }
        // 检查给定的 typeId 是否存在于 metaMaps 中
        if (metaMapsNode.has(metaTypeId)) {
            return metaMapsNode.get(metaTypeId).asText();
        } else {
            logger.info("jsonResponse:{}", jsonResponse );
            throw new IllegalArgumentException("Type ID not found in metaMaps: " + metaTypeId);
        }
    }

    private String sendFileMetaTypeRecordRequest(String metaRecordId) throws Exception {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("token", fileMeteTypeRecordToken);
        jsonObject.put("metaTypeId", metaTypeId);
        jsonObject.put("metaRecordId", metaRecordId);
        jsonObject.put("lang", "zh-cn");

        try (HttpResponse response = HttpUtil.createPost(fileMeteTypeRecordUrl)
                .addHeaders(headers)
                .body(jsonObject.toString())
                .execute()) {
            // 获取响应体的内容
            String responseBody = response.body();
            return responseBody;
        } catch (Exception e) {
            logger.error("请求fileMeteTypeRecordUrl接口失败：", e);
            throw e;
        }
    }

//    private static UnstructuredDirectoryDto parseResponseTest(String jsonResponse) throws Exception {
//        JsonNode rootNode = mapper.readTree(jsonResponse);
//        JsonNode dataNode = rootNode.get("data");
//        if (dataNode == null) {
//            throw new IllegalArgumentException("JSON response does not contain 'data' node");
//        }
//        return parseFolderTest(rootNode);
//    }
//
//    private static UnstructuredDirectoryDto parseFolderTest(JsonNode dataNode) {
//        //获取当前目录的基本信息
//        JsonNode folderNode = dataNode.get("data").get("thisFolder");
//        //目录id
//        Long folderId = folderNode.get("id").asLong();
//        //目录名称
//        String folderName = folderNode.get("name").asText();
//        //创建人
//        String creatorName = folderNode.get("creatorName").asText();
//        //创建时间
//        String createTime = folderNode.get("createTime").asText();
//        //目录全路径
//        String path = folderNode.get("path").asText();
//        //目录对应的上级目录ID
//        Long parentFolderId = folderNode.get("parentFolderId").asLong();
//
//        UnstructuredDirectoryDto directoryDto = new UnstructuredDirectoryDto(folderName, folderId, path, creatorName, createTime, parentFolderId);
//        //目录下的文件
//        JsonNode filesNode = dataNode.get("data").get("docListInfo").get("filesInfo");
//        if (filesNode != null) {
//            for (JsonNode fileNode : filesNode) {
//                //文件ID
//                Long fileId = fileNode.get("id").asLong();
//                //文件所属目录ID
//                Long parentFolderIdForFile = fileNode.get("parentFolderId").asLong();
//                UnstructuredFileDto file = new UnstructuredFileDto(fileId, parentFolderIdForFile);
//                directoryDto.addFile(file);
//            }
//        }
//        //目录下的一级子目录
//        JsonNode childFoldersNode = dataNode.get("data").get("docListInfo").get("foldersInfo");
//        if (childFoldersNode != null) {
//            for (JsonNode childFolderNode : childFoldersNode) {
//                UnstructuredDirectoryDto firstChild = buildFirstChild(childFolderNode);
//                directoryDto.addSubDirectory(firstChild);
//            }
//        }
//        return directoryDto;
//    }
//
//    private static UnstructuredDirectoryDto fetchAllSubFoldersTest(String result) throws Exception {
//        try {
//
//            UnstructuredDirectoryDto rootFolder = parseResponseTest(result);
//            JsonNode rootNode = mapper.readTree(result);
//            int totalCount = rootNode.get("data").get("docListInfo").get("settings").get("totalCount").asInt();
//
//
//            int totalFolders = rootNode.get("data").get("docListInfo").get("settings").get("folderCount").asInt();
//            int totalFiles = rootNode.get("data").get("docListInfo").get("settings").get("fileCount").asInt();
//
//            // 如果还有更多分页数据，递归获取
////            if ((1 * 100) < totalCount || (1 * 100) < totalFolders || (1 * 100) < totalFiles) {
////                UnstructuredDirectoryDto nextFolder = fetchAllSubFolders(folderId, pageNum + 1, pageSize);
////                rootFolder.getSubDirectoryList().addAll(nextFolder.getSubDirectoryList());
////                rootFolder.getFileDtos().addAll(nextFolder.getFileDtos());
////            }
////
////            // 递归获取每个子目录的所有子目录和文件
////            for (UnstructuredDirectoryDto subFolder : rootFolder.getSubDirectoryList()) {
////                UnstructuredDirectoryDto subFolderWithAllSubFolders = fetchAllSubFolders(subFolder.getDirectoryId().toString(), 1, pageSize);
////                subFolder.getSubDirectoryList().addAll(subFolderWithAllSubFolders.getSubDirectoryList());
////                subFolder.getFileDtos().addAll(subFolderWithAllSubFolders.getFileDtos());
////            }
//            return rootFolder;
//        } catch (Exception e) {
//            throw e;
//        }
//    }
//
//    public static void main(String[] args) throws Exception {
//        String res = "{\"result\":0,\"msg\":\"\",\"data\":{\"folderId\":30,\"folderName\":\"02中台加工库\",\"thisFolder\":{\"type\":1,\"id\":30,\"name\":\"02中台加工库\",\"size\":0,\"folderGuid\":\"e40c2bcd-30e3-4815-8497-162592edbdc0\",\"maxFolderSize\":0,\"maxFileSize\":0,\"createTime\":\"2025-02-12T09:54:27.172884\",\"creatorId\":31,\"creatorName\":\"于海松\",\"editorId\":31,\"editorName\":\"于海松\",\"code\":\"\",\"state\":0,\"modifyTime\":\"2025-02-12T09:56:56.241562\",\"securityLevel\":0,\"childFolderCount\":2,\"childFileCount\":0,\"path\":\"1\\\\30\",\"folderType\":1,\"parentFolderId\":1,\"remark\":\"\",\"permission\":8552897,\"isDeleted\":false,\"isfavorite\":false,\"namePath\":\"PublicRoot\\\\02中台加工库\",\"parentFolderName\":\"PublicRoot\",\"iconType\":0,\"iconValue\":null},\"docListInfo\":{\"infoItems\":[{\"name\":\"basic:name\",\"width\":\"913\"},{\"name\":\"basic:modifyTime\",\"width\":\"170\"},{\"name\":\"basic:editor\",\"width\":\"150\"},{\"name\":\"basic:size\",\"width\":\"150\"},{\"name\":\"basic:version\",\"width\":\"100\"},{\"name\":\"meta:250324180525-edoc2Selectbox\\\\dropdown20250515142934383\\\\安全等级\",\"width\":\"200\"},{\"name\":\"meta:250324180525-edoc2Selectbox\\\\dropdown20250515143433842\\\\DL1业务域\",\"width\":\"200\"}],\"foldersInfo\":[{\"id\":32,\"folderGuid\":\"f804b941-0688-4ac1-a99c-beaf4d169b9a\",\"name\":\"01管网内部知识\",\"code\":\"\",\"path\":\"1\\\\30\\\\32\",\"parentFolderId\":30,\"childFolderCount\":19,\"childFileCount\":0,\"size\":0,\"createTime\":\"2025-02-12T09:56:43.992933\",\"modifyTime\":\"2025-03-03T10:13:42.502905\",\"creatorId\":31,\"creatorName\":\"于海松\",\"editorId\":31,\"editorName\":\"于海松\",\"state\":0,\"securityLevelId\":0,\"folderType\":1,\"remark\":\"\",\"250324180525-edoc2Selectbox\\\\dropdown20250515142934383\\\\安全等级\":\"\",\"250324180525-edoc2Selectbox\\\\dropdown20250515143433842\\\\DL1业务域\":\"\",\"foldermaxfoldersize\":0,\"maxFolderSize\":0,\"favoriteId\":\"\",\"favoriteType\":\"\",\"isfavorite\":false,\"isSecFolder\":false,\"permission\":8552897,\"securityLevelName\":\"\",\"iconType\":0,\"iconValue\":null},{\"id\":33,\"folderGuid\":\"b1838892-003b-475f-9c15-6637eb435bb7\",\"name\":\"02管网外部知识\",\"code\":\"\",\"path\":\"1\\\\30\\\\33\",\"parentFolderId\":30,\"childFolderCount\":5,\"childFileCount\":0,\"size\":0,\"createTime\":\"2025-02-12T09:56:56.209262\",\"modifyTime\":\"2025-05-27T11:03:53.438839\",\"creatorId\":31,\"creatorName\":\"于海松\",\"editorId\":31,\"editorName\":\"于海松\",\"state\":0,\"securityLevelId\":0,\"folderType\":1,\"remark\":\"\",\"250324180525-edoc2Selectbox\\\\dropdown20250515142934383\\\\安全等级\":\"\",\"250324180525-edoc2Selectbox\\\\dropdown20250515143433842\\\\DL1业务域\":\"\",\"foldermaxfoldersize\":0,\"maxFolderSize\":0,\"favoriteId\":\"\",\"favoriteType\":\"\",\"isfavorite\":false,\"isSecFolder\":false,\"permission\":8552897,\"securityLevelName\":\"\",\"iconType\":0,\"iconValue\":null}],\"filesInfo\":[],\"settings\":{\"pageNum\":1,\"pageSize\":100,\"totalCount\":2,\"viewMode\":\"List\",\"sortKey\":\"basic:name\",\"sortDesc\":false,\"fileCount\":0,\"folderCount\":2,\"NeedDisableSort\":false},\"thisFolder\":{}},\"verifyCode\":null,\"teamInfo\":null}}";
//
//        UnstructuredDirectoryDto rootFolder = fetchAllSubFoldersTest(res);
//
//        List<UnstructuredDirectoryDto> allDirectories = Lists.newArrayList();
//        List<UnstructuredFileDto> allFiles = Lists.newArrayList();
//
//    }
}