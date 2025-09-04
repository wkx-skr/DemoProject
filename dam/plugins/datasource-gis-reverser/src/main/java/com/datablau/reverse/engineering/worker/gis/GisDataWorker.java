package com.datablau.reverse.engineering.worker.gis;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.datasource.api.Datasource;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseEngineeringKnownParameterType;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.dto.GisDataMM;
import com.datablau.reverse.engineering.dto.GisDataResponse;
import com.datablau.reverse.engineering.dto.convermm.SheetData;
import com.datablau.reverse.engineering.dto.convermm.Sheets;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GisDataWorker extends ProgressJob implements ReverseForwardStrategy {

    private Logger logger = LoggerFactory.getLogger(GisDataWorker.class);

    private static final ObjectMapper mapper = new ObjectMapper();

    protected Datasource datasource;
    private ModelX currentModelX;

    private IdGetter idGetter;
    private Long modelId;

    private String definition;

    private static final int PAGE_SIZE = 1000;

    private String gisUrl;
    private String gisDataSheet1;
    private String gisDataSheet2;
    private MetaModelDataService metaModelDataService;

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
        this.gisUrl = datasource.getProperties().getParameter("gisUrl");
        logger.info("gisUrl:{}", gisUrl);

        this.gisDataSheet1 = datasource.getProperties().getParameter("gisDataSheet1");
        logger.info("gisDataSheet1:{}", gisDataSheet1);

        this.gisDataSheet2 = datasource.getProperties().getParameter("gisDataSheet2");
        logger.info("gisDataSheet2:{}", gisDataSheet2);

        this.definition =  this.currentModelX.getName();
        logger.info("definition:{}", definition);
        this.modelId= this.currentModelX.getId();
        logger.info("modelId:{}", modelId);

        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        if (this.metaModelDataService == null) {
            throw new RuntimeException("cannot find MetaModelDataService");
        }
    }

    public void execute() throws Exception{

        this.checkStopSign();
        logger.info("执行gis数据源任务开始");

        //获取gis数据
        List<GisDataMM> gisDataList = getGisDataList();
        logger.info("共获取到gis数据:{}条", gisDataList.size());
        this.checkStopSign();
        //sheet1数据
        SheetData sheetData1 = new SheetData(gisDataSheet1);
        sheetData1.addHeader(gisDataSheet1 + ".Id");
        sheetData1.addHeader(gisDataSheet1 + ".Name");
        sheetData1.addHeader(gisDataSheet1 + ".Definition");
        sheetData1.addHeader(gisDataSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, definition, "", ""));

        //sheet2数据
        SheetData sheetData2 = new SheetData(gisDataSheet2);
        sheetData2.addHeader(gisDataSheet1 + ".Id");
        sheetData2.addHeader(gisDataSheet1 + ".Name");
        sheetData2.addHeader(gisDataSheet2 + ".Id");
        sheetData2.addHeader(gisDataSheet2 + ".Name");
        sheetData2.addHeader(gisDataSheet2 + ".Definition");
        sheetData2.addHeader(gisDataSheet2 + ".LogicalName");
        sheetData2.addHeader(gisDataSheet2 + ".dl1BusinessDomain");
        sheetData2.addHeader(gisDataSheet2 + ".dl2ThemeDomain");
        sheetData2.addHeader(gisDataSheet2 + ".systemName");
        sheetData2.addHeader(gisDataSheet2 + ".dataMaster");
        sheetData2.addHeader(gisDataSheet2 + ".dataSteward");
        sheetData2.addHeader(gisDataSheet2 + ".resourceName");
        sheetData2.addHeader(gisDataSheet2 + ".resourceDescription");
        sheetData2.addHeader(gisDataSheet2 + ".serviceType");
        sheetData2.addHeader(gisDataSheet2 + ".spatialRange");
        sheetData2.addHeader(gisDataSheet2 + ".timeFrame");
        sheetData2.addHeader(gisDataSheet2 + ".resourceType");
        sheetData2.addHeader(gisDataSheet2 + ".resourceFormat");
        sheetData2.addHeader(gisDataSheet2 + ".coordinateSystem");
        sheetData2.addHeader(gisDataSheet2 + ".scale");
        sheetData2.addHeader(gisDataSheet2 + ".storagePath");
        sheetData2.addHeader(gisDataSheet2 + ".updateCycle");
        sheetData2.addHeader(gisDataSheet2 + ".securityLevel");
        sheetData2.addHeader(gisDataSheet2 + ".publishTime");

        for (GisDataMM gisDataMM : gisDataList) {
            // 创建 Date 对象
            Date date = new Date(Long.parseLong(gisDataMM.getCreateTime()));

            // 定义日期时间格式
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            // 转换为字符串
            String formattedDate = dateFormat.format(date);

            List data = Arrays.asList(modelId, definition, "", gisDataMM.getResourceName(), gisDataMM.getResourceDescription(),
                    gisDataMM.getResourceName(), gisDataMM.getDl1BusinessDomain(),
                    gisDataMM.getDl2ThemeDomain(), gisDataMM.getSystemName(), gisDataMM.getDataMaster(), gisDataMM.getDataSteward(),
                    gisDataMM.getResourceName(), gisDataMM.getResourceDescription(), gisDataMM.getServiceType(),
                    gisDataMM.getSpatialRange(), gisDataMM.getTimeFrame(), gisDataMM.getResourceType(), gisDataMM.getDataResourceFormat(),
                    gisDataMM.getCoordinateSystem(), gisDataMM.getScale(), gisDataMM.getStoragePath(),
                    gisDataMM.getDataUpdateCycle(), gisDataMM.getSecurityLevel(), formattedDate);

            sheetData2.addData(data);
        }

        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);
        this.checkStopSign();
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
        logger.info("执行gis数据源任务结束");

    }

    /**
     * 分页获取所有的gis数据
     * @return
     * @throws Exception
     */
    private List<GisDataMM> getGisDataList() throws Exception {
        List<GisDataMM> gisDataMMS = Lists.newArrayList();
        int pageNum = 1; // 初始页码

        // 获取第一页数据并解析总记录数
        GisDataResponse response = fetchPageData(PAGE_SIZE, pageNum);
        logger.info("PAGE_SIZE:{}", PAGE_SIZE);
        addRecordsToList(gisDataMMS, response.getData());
        int total = response.getTotal();
        logger.info("total:{}", total);
        // 循环获取剩余页的数据
        int totalPages = (int) Math.ceil((double) total / PAGE_SIZE);
        logger.info("totalPages:{}", totalPages);
        for (int i = 2; i <= totalPages; i++) {
            response = fetchPageData(PAGE_SIZE, i);
            addRecordsToList(gisDataMMS, response.getData());
        }
        return gisDataMMS;
    }

    private void addRecordsToList(List<GisDataMM> targetList, List<GisDataMM> records) {
        if (!CollectionUtils.isEmpty(records)) {
            targetList.addAll(records);
        }
    }

    private GisDataResponse fetchPageData(int pageSize, int pageNum) throws Exception {
        String result = sendPageRequest(pageSize, pageNum);
        return mapper.readValue(result, GisDataResponse.class);
    }

    private String sendPageRequest(int pageSize, int pageNum) throws Exception {


        // 构造查询参数
        String queryParams = "?pageSize=" + pageSize + "&pageNum=" + pageNum;
        String url = gisUrl + queryParams;
        logger.info("url:{}", url);
        try {
            HttpResponse response = HttpRequest.get(url).execute();
            if (response.isOk()) {
                return response.body();
            } else {
                logger.error("请求失败，状态码：{}", response.getStatus());
                throw new RuntimeException("请求失败，状态码：" + response.getStatus());
            }
        } catch (Exception e) {
            logger.error("发送请求失败", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "GIS";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return false;
    }

    public static void main(String[] args) throws JsonProcessingException {
        String s = "{\n" +
                "  \"msg\": \"\",\n" +
                "  \"total\": 11,\n" +
                "  \"code\": 200,\n" +
                "  \"data\": [{\n" +
                "    \"serviceType\": \"地图服务\",\n" +
                "    \"resourceId\": 84158126,\n" +
                "    \"thumbnail\": \"https://gis-portal.pipechina.com.cn:8443/iportal/resources/thumbnail/map84158126.png\",\n" +
                "    \"dl1BusinessDomain\": \"D06流程与 IT\",\n" +
                "    \"dataOwnership\": \"管网集团\",\n" +
                "    \"authorizeSetting\": \"[{permissionType=DELETE, aliasName=T1034033, entityRoles=[ADMIN, NOPASSWORD], entityType=USER, entityName=T1034033, entityId=null}, {permissionType=READ, aliasName=GUEST, entityRoles=[], entityType=USER, entityName=GUEST, entityId=null}]\",\n" +
                "    \"dl2ThemeDomain\": null,\n" +
                "    \"resourceDescription\": \"全国二维影像地图服务（2024年10月版）\",\n" +
                "    \"scale\": \"1:2257\",\n" +
                "    \"dataSteward\": null,\n" +
                "    \"resourceName\": \"全国二维影像地图服务（墨卡托）\",\n" +
                "    \"storagePath\": null,\n" +
                "    \"title\": \"全国二维影像地图服务（墨卡托）\",\n" +
                "    \"timeFrame\": \"2024年\",\n" +
                "    \"dataResourceFormat\": \"空间类数据\",\n" +
                "    \"securityLevel\": \"外部公开级\",\n" +
                "    \"dataUpdateCycle\": \"年\",\n" +
                "    \"systemName\": \"数据中台二期\",\n" +
                "    \"createTime\": \"1753713227473\",\n" +
                "    \"layers\": [{\n" +
                "      \"wmtsOption\": null,\n" +
                "      \"styleString\": \"null\",\n" +
                "      \"title\": \"img\",\n" +
                "      \"type\": null,\n" +
                "      \"subLayersString\": \"null\",\n" +
                "      \"WMTSOptionString\": \"null\",\n" +
                "      \"features\": null,\n" +
                "      \"boundsString\": \"null\",\n" +
                "      \"prjCoordSys\": null,\n" +
                "      \"id\": null,\n" +
                "      \"cartoCSS\": null,\n" +
                "      \"datasourceName\": null,\n" +
                "      \"prjCoordSysString\": \"null\",\n" +
                "      \"identifier\": null,\n" +
                "      \"layerType\": null,\n" +
                "      \"featuresString\": \"null\",\n" +
                "      \"WMTSOption\": null,\n" +
                "      \"themeSettings\": \"{\\\"layerType\\\":\\\"TILE\\\",\\\"visible\\\":true,\\\"sourceType\\\":\\\"SUPERMAP_REST\\\",\\\"epsgCode\\\":\\\"EPSG:3857\\\",\\\"name\\\":\\\"img\\\",\\\"url\\\":\\\"https://gis-server.pipechina.com.cn:32233/iserver/services/img_w/rest/maps/img\\\",\\\"zIndex\\\":0}\",\n" +
                "      \"isVisible\": true,\n" +
                "      \"subLayers\": null,\n" +
                "      \"url\": \"https://gis-server.pipechina.com.cn:32233/iserver/services/img_w/rest/maps/img\",\n" +
                "      \"zindex\": null,\n" +
                "      \"scalesString\": \"null\",\n" +
                "      \"scales\": null,\n" +
                "      \"name\": \"dv_v5_rest\",\n" +
                "      \"bounds\": null,\n" +
                "      \"mapId\": null,\n" +
                "      \"style\": null,\n" +
                "      \"markersString\": \"null\",\n" +
                "      \"opacity\": 1,\n" +
                "      \"markers\": null\n" +
                "    }],\n" +
                "    \"dataMaster\": null,\n" +
                "    \"coordinateSystem\": \"3857\",\n" +
                "    \"resourceType\": \"MAP\",\n" +
                "    \"spatialRange\": \"全国\"\n" +
                "  }]\n" +
                "}";

        mapper.readValue(s, GisDataResponse.class);
    }
}
