package com.datablau.reverse.engineering.worker.unstructuredir;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.datasource.api.Datasource;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseEngineeringKnownParameterType;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.dto.UnstructuredDirectoryDto;
import com.datablau.reverse.engineering.dto.UnstructuredFileDto;
import com.datablau.reverse.engineering.dto.covermm.SheetData;
import com.datablau.reverse.engineering.dto.covermm.Sheets;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.apache.curator.shaded.com.google.common.base.Strings;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class UnstructureDirWorker extends ProgressJob implements ReverseForwardStrategy {

    private Logger logger = LoggerFactory.getLogger(UnstructureDirWorker.class);

    private static final ObjectMapper mapper = new ObjectMapper();

    protected Datasource datasource;
    private ModelX currentModelX;

    private IdGetter idGetter;
    private Long modelId;

    private String definition;
    private String loginName;
    private String ipAddress;
    private String integrationKey;
    private String clientTypeStr;
    private String tokenUrl;
    private String folderId;
    private String directoryToken;

    private String unstructuredDirectorySheet1;
    private String unstructuredDirectorySheet2;
    private String unstructuredDirectorySheet3;
    private MetaModelDataService metaModelDataService;

    private String folderDetailUrl;
    private String subFolderUrl;
    private String subFileUrl;

    private static final int PAGE_SIZE = 1000;


    @Override
    public ModelX reverseEngineer(ModelX modelX, Datasource datasource, ReverseForwardOptions reverseForwardOptions) throws ReverseEngineeringFailedException {
        this.datasource = datasource;
        this.currentModelX = modelX;
        try {
            this.prepare();
            this.execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public void prepare() {

        this.definition =  this.currentModelX.getName();
        logger.info("definition:{}", definition);
        this.modelId= this.currentModelX.getId();
        logger.info("modelId:{}", modelId);

        this.loginName = datasource.getProperties().getParameter("loginName");
        logger.info("loginName:{}", loginName);

        this.ipAddress = datasource.getProperties().getParameter("ipAddress");
        logger.info("ipAddress:{}", ipAddress);

        this.integrationKey = datasource.getProperties().getParameter("integrationKey");
        logger.info("integrationKey:{}", integrationKey);

        this.clientTypeStr = datasource.getProperties().getParameter("clientTypeStr");
        logger.info("clientTypeStr:{}", clientTypeStr);

        this.tokenUrl = datasource.getProperties().getParameter("tokenUrl");
        logger.info("tokenUrl:{}", tokenUrl);

        this.folderId = datasource.getProperties().getParameter("folderId");
        logger.info("folderId:{}", folderId);

        this.subFolderUrl = datasource.getProperties().getParameter("subFolderUrl");
        logger.info("subFolderUrl:{}", subFolderUrl);

        this.subFileUrl = datasource.getProperties().getParameter("subFileUrl");
        logger.info("subFileUrl:{}", subFileUrl);

        this.folderDetailUrl = datasource.getProperties().getParameter("folderDetailUrl");
        logger.info("folderDetailUrl:{}", folderDetailUrl);

        this.unstructuredDirectorySheet1 = datasource.getProperties().getParameter("unstructuredDirectorySheet1");
        logger.info("unstructuredDirectorySheet1:{}", unstructuredDirectorySheet1);

        this.unstructuredDirectorySheet2 = datasource.getProperties().getParameter("unstructuredDirectorySheet2");
        logger.info("unstructuredDirectorySheet2:{}", unstructuredDirectorySheet2);

        this.unstructuredDirectorySheet3 = datasource.getProperties().getParameter("unstructuredDirectorySheet3");
        logger.info("unstructuredDirectorySheet3:{}", unstructuredDirectorySheet3);


        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        if (this.metaModelDataService == null) {
            throw new RuntimeException("cannot find MetaModelDataService");
        }

    }

    public void execute() throws Exception {

        this.checkStopSign();

        this.checkStopSign();
        logger.info("获取token开始");
        String token = getToken();
        directoryToken = token;
        logger.info("获取token结束");

        this.checkStopSign();

        logger.info("开始获取目录和文件信息");
        //获取根目录信息
        UnstructuredDirectoryDto rootDirectory = getRootDirectory(folderId);
        if (rootDirectory == null) {
            throw new RuntimeException("获取根目录信息失败");
        }
        //获取所有子目录
        List<UnstructuredDirectoryDto> allDirectories = getSubDirectory(Long.parseLong(folderId));
        logger.info("获取目录信息结束");
        allDirectories.add(rootDirectory);
        logger.info("共获取到目录:{}个", allDirectories.size());
        //获取所有子文件
        List<UnstructuredFileDto> allFiles = getSubFiles(Long.parseLong(folderId));
        logger.info("文件信息结束, 共获取到文件:{}个", allFiles.size());

        this.checkStopSign();
        Map<Long, String> directoryDtoMap = allDirectories.stream().collect(Collectors.toMap(UnstructuredDirectoryDto::getDirectoryId, UnstructuredDirectoryDto::getDirectoryName, (x1, x2) -> x1));

        //sheet1数据
        SheetData sheetData1 = new SheetData(unstructuredDirectorySheet1);
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".Id");
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".Name");
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".Definition");
        sheetData1.addHeader(unstructuredDirectorySheet1 + ".LogicalName");
        sheetData1.addData(Arrays.asList(modelId, definition, "", ""));

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
            List data = Arrays.asList(modelId, definition, "", allDirectory.getDirectoryName(), "",allDirectory.getDirectoryName(), allDirectory.getDirectoryName(), allDirectory.getDirectoryId(), allDirectory.getDirectorySummary(),
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
            String name = definition +"."+directoryName;
            List data = Arrays.asList("", name, "", allFile.getResourceName(), "", allFile.getResourceName(), allFile.getDl1BusinessDomain(), allFile.getDl2ThemeDomain(),
                    allFile.getSourceSystem(), allFile.getDataMaster(), allFile.getDataSteward(), allFile.getResourceSummary(),
                    allFile.getResourceFormat(), allFile.getCreator(), allFile.getOwnCompany(), allFile.getUploader(), allFile.getUploadTime(),
                    allFile.getModifieder(), allFile.getModifyTime(), allFile.getFileSize(), allFile.getDataTag(), allFile.getUpdateCycle(), allFile.getVersion(), allFile.getSecurityLevel(),
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

    /**
     * 获取根目录文件信息
     * @param folderId
     */

    public UnstructuredDirectoryDto getRootDirectory(String folderId) throws Exception {

        UnstructuredDirectoryDto directoryDto = new UnstructuredDirectoryDto();

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("token", directoryToken);
        jsonObject.put("folderId", folderId);

        String resp = "";

        try (HttpResponse response = HttpUtil.createPost(folderDetailUrl)
                .addHeaders(headers)
                .body(jsonObject.toString())
                .execute()) {
            // 获取响应体的内容
            resp = response.body();
        } catch (Exception e) {
            logger.error("请求fileMeteTypeRecordUrl接口失败：", e);
            throw e;
        }
        if (!Strings.isNullOrEmpty(resp)) {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(resp);
            JsonNode dataNode = rootNode.get("data");
            //根目录名称
            String name = dataNode.get("name").asText();
            //根目录创建人
            String creatorName = dataNode.get("creatorName").asText();
            //根目录创建时间
            String createTime = dataNode.get("createTime").asText();
            //根目录修改人
            String editorName = dataNode.get("editorName").asText();
            //根目录父id
            Long parentFolderId = dataNode.get("parentFolderId").asLong();
            //根目录路径
            String path = dataNode.get("path").asText();
            //根目录描述
            String remark = dataNode.get("remark").asText();

            directoryDto.setDirectoryId(Long.valueOf(folderId));
            directoryDto.setDirectoryName(name);
            directoryDto.setCreator(creatorName);
            directoryDto.setCreateTime(createTime);
            directoryDto.setModifieder(editorName);
            directoryDto.setParentId(parentFolderId);
            directoryDto.setDirectoryPath(path);
            directoryDto.setDirectorySummary(remark);
            return directoryDto;
        }
        return null;
    }

    /**
     * 获取指定目录下的所有子目录
     * @param folderId
     * @return
     * @throws Exception
     */
    public List<UnstructuredDirectoryDto> getSubDirectory(Long folderId) throws Exception {

        List<UnstructuredDirectoryDto> directoryDtos = Lists.newArrayList();

        // 分页参数
        int pageIndex = 1;
        int totalCount = -1;

        boolean hasMoreData = true;

        while (hasMoreData) {
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("token", directoryToken);
            jsonObject.put("folderId", folderId);
            jsonObject.put("pageIndex", pageIndex);
            jsonObject.put("pageSize", PAGE_SIZE);

            String resp = "";
            try (HttpResponse response = HttpUtil.createPost(subFolderUrl)
                    .addHeaders(headers)
                    .body(jsonObject.toString())
                    .execute()) {
                // 获取响应体的内容
                resp = response.body();
            } catch (Exception e) {
                logger.error("请求fileMeteTypeRecordUrl接口失败：", e);
                throw e;
            }
            if (!Strings.isNullOrEmpty(resp)) {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(resp);

                if (rootNode.get("result").asInt() != 0) {
                    logger.error("请求失败: {}", rootNode.get("msg").asText());
                    break;
                }

                JsonNode dataNode = rootNode.get("data");
                if (dataNode.isArray()) {
                    for (JsonNode item : dataNode) {
                        UnstructuredDirectoryDto directoryDto = new UnstructuredDirectoryDto();
                        directoryDto.setDirectoryName(item.get("foldername").asText());
                        directoryDto.setDirectoryId(item.get("folderid").asLong());
                        directoryDto.setDirectorySummary(item.get("remark").asText());
                        directoryDto.setDirectoryPath(item.get("folderPath").asText());
                        directoryDto.setCreator(item.get("creatorName").asText());
                        directoryDto.setCreateTime(item.get("createTime").asText());
                        directoryDto.setModifieder(item.get("editorName").asText());
                        directoryDto.setParentId(item.get("parentFolderId").asLong());
                        directoryDtos.add(directoryDto);
                    }
                }

                // 获取总数量
                if (totalCount == -1) {
                    totalCount = rootNode.get("totalCount").asInt();
                    logger.info("catalog totalCount:{}", totalCount);
                }

                // 判断是否还有更多数据
                if (directoryDtos.size() >= totalCount) {
                    hasMoreData = false;
                }
                pageIndex++;
            }
        }
        return directoryDtos;
    }

    /**
     * 获取指定目录下的所有文件
     * @return
     */
    public List<UnstructuredFileDto> getSubFiles(Long folderId) throws Exception {

        List<UnstructuredFileDto> fileDtos = Lists.newArrayList();

        // 分页参数
        int pageIndex = 1;
        int totalCount = -1;

        boolean hasMoreData = true;
        while(hasMoreData) {
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("token", directoryToken);
            jsonObject.put("folderId", folderId);
            jsonObject.put("pageIndex", pageIndex);
            jsonObject.put("pageSize", PAGE_SIZE);

            String resp = "";
            try (HttpResponse response = HttpUtil.createPost(subFileUrl)
                    .addHeaders(headers)
                    .body(jsonObject.toString())
                    .execute()) {
                // 获取响应体的内容
                resp = response.body();
            } catch (Exception e) {
                logger.error("请求fileMeteTypeRecordUrl接口失败：", e);
                throw e;
            }

            if (!Strings.isNullOrEmpty(resp)) {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(resp);

                if (rootNode.get("result").asInt() != 0) {
                    logger.error("请求失败: {}", rootNode.get("msg").asText());
                    break;
                }

                JsonNode dataNode = rootNode.get("data");
                if (dataNode.isArray()) {
                    for (JsonNode item : dataNode) {
                        UnstructuredFileDto unstructuredFileDto = new UnstructuredFileDto();
                        unstructuredFileDto.setFileId(item.get("fileId").asLong());
                        unstructuredFileDto.setDirectoryId(item.get("parentFolderId").asLong());
                        unstructuredFileDto.setResourceName(item.get("filename").asText());
                        unstructuredFileDto.setCreator(item.get("creatorName").asText());
                        unstructuredFileDto.setModifyTime(item.get("modifyTime").asText());
                        unstructuredFileDto.setFileSize(item.get("size").asText());

                        if (item.get("metadata").isArray()){
                            JsonNode metadata = item.get("metadata");
                            if (metadata != null && metadata.isArray()) {
                                JsonNode jsonNode = metadata.get(0);
                                JsonNode datasNode = jsonNode.get("datas");
                                for (JsonNode node : datasNode) {

                                    String fieldenname = node.get("fieldenname").asText();
                                    String attrValue = node.get("value").asText();

                                    switch (fieldenname) {
                                        case "dl1BusinessDomain_h":
                                            unstructuredFileDto.setDl1BusinessDomain(attrValue);
                                            break;
                                        case "dl2ThemeDomain":
                                            unstructuredFileDto.setDl2ThemeDomain(attrValue);
                                            break;
                                        case "sourceSystem":
                                            unstructuredFileDto.setSourceSystem(attrValue);
                                            break;
                                        case "dataMaster":
                                            unstructuredFileDto.setDataMaster(attrValue);
                                            break;
                                        case "dataSteward":
                                            unstructuredFileDto.setDataSteward(attrValue);
                                            break;
                                        case "resourceSummary":
                                            unstructuredFileDto.setResourceSummary(attrValue);
                                        case "ownCompany":
                                            unstructuredFileDto.setOwnCompany(attrValue);
                                            break;
                                        case "uploader":
                                            unstructuredFileDto.setUploader(attrValue);
                                            break;
                                        case "uploadTime":
                                            unstructuredFileDto.setUploadTime(attrValue);
                                            break;
                                        case "modifieder":
                                            unstructuredFileDto.setModifieder(attrValue);
                                            break;
                                        case "dataTag":
                                            unstructuredFileDto.setDataTag(attrValue);
                                            break;
                                        case "updateCycle":
                                            unstructuredFileDto.setUpdateCycle(attrValue);
                                            break;
                                        case "version":
                                            unstructuredFileDto.setVersion(attrValue);
                                            break;
                                        case "securityLevel_h":
                                            unstructuredFileDto.setSecurityLevel(attrValue);
                                            break;
                                        case "filePath":
                                            unstructuredFileDto.setFilePath(attrValue);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }

                        }

                        fileDtos.add(unstructuredFileDto);

                    }
                }
                // 获取总数量
                if (totalCount == -1) {
                    totalCount = rootNode.get("totalCount").asInt();
                    logger.info("file totalCount:{}", totalCount);
                }

                // 判断是否还有更多数据
                if (fileDtos.size() >= totalCount) {
                    hasMoreData = false;
                }
                pageIndex++;
            }
        }
        return fileDtos;
    }



    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "UNSTRUCTUREDIRECTORY";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }
}
