package com.datablau.reverse.engineering.worker.kanban;

import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.datasource.api.Datasource;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.report.bi.ResResultDto;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.covermm.SheetData;
import com.datablau.reverse.engineering.covermm.Sheets;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.dto.ReportItemMM;
import com.datablau.reverse.engineering.dto.ReportMM;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * @author: hxs
 * @date: 2025/7/29 10:13
 */
public class KanbanWorker extends ProgressJob implements ReverseForwardStrategy {
    private static final Logger LOGGER = LoggerFactory.getLogger(KanbanWorker.class);

    protected Datasource datasource;

    private ModelX currentModelX;

    private IdGetter idGetter;

    private String reportMMSheet1;
    private String reportMMSheet2;
    private String reportMMSheet3;

    private MetaModelDataService metaModelDataService;
    private ModelRepository dataModelRepo;

    @Override
    public ModelX reverseEngineer(ModelX modelX, Datasource datasource, ReverseForwardOptions reverseForwardOptions) throws ReverseEngineeringFailedException {
        this.datasource = datasource;
        this.currentModelX = modelX;
        try {
            this.execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    protected void execute() throws Exception {
        String requestUrl = datasource.getProperties().getParameter("requestUrl");
        reportMMSheet1 = datasource.getProperties().getParameter("reportMMSheet1");
        reportMMSheet2 = datasource.getProperties().getParameter("reportMMSheet2");
        reportMMSheet3 = datasource.getProperties().getParameter("reportMMSheet3");
        Long modelId = this.currentModelX.getId();

        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        this.dataModelRepo = BeanHelper.getBean(ModelRepository.class);

        LOGGER.info("requestUrl:  " + requestUrl);
        LOGGER.info("reportMMSheet1:  " + reportMMSheet1);
        LOGGER.info("reportMMSheet2:  " + reportMMSheet2);
        LOGGER.info("reportMMSheet3:  " + reportMMSheet3);
        LOGGER.info("modelId:  " + modelId);

        //1、接口调用获取数据
        ArrayList<ReportMM> reportMMS = new ArrayList<>();

        //2、保存元模型数据
        reportItem(modelId, reportMMS);
    }

    private void reportItem(Long modelId, List<ReportMM> reportMMS) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        LOGGER.info("报表元模型对接数据：{}", mapper.writeValueAsString(reportMMS));

        if(CollectionUtils.isEmpty(reportMMS)){
            return;
        }

        Optional<Model> modelOpt = dataModelRepo.findById(modelId);
        Model model = modelOpt.get();

        SheetData sheetData1 = new SheetData(reportMMSheet1);
        sheetData1.addHeader(reportMMSheet1 + ".Id");
        sheetData1.addHeader(reportMMSheet1 + ".Name");
        sheetData1.addHeader(reportMMSheet1 + ".Definition");
        sheetData1.addHeader(reportMMSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, model.getDefinition(), "", ""));

        /****************************************************************************/
        SheetData sheetData2 = new SheetData(reportMMSheet2);
        sheetData2.addHeader(reportMMSheet1 + ".Id");
        sheetData2.addHeader(reportMMSheet1 + ".Name");
        sheetData2.addHeader(reportMMSheet2 + ".dl1BusinessDomain");
        sheetData2.addHeader(reportMMSheet2 + ".Id");
        sheetData2.addHeader(reportMMSheet2 + ".Name");
        sheetData2.addHeader(reportMMSheet2 + ".dl2ThemeDomain");
        sheetData2.addHeader(reportMMSheet2 + ".Definition");
        sheetData2.addHeader(reportMMSheet2 + ".LogicalName");
        sheetData2.addHeader(reportMMSheet2 + ".updateCycle");
        sheetData2.addHeader(reportMMSheet2 + ".technicaler");
        sheetData2.addHeader(reportMMSheet2 + ".securityLevel");
        sheetData2.addHeader(reportMMSheet2 + ".dataMaster");
        sheetData2.addHeader(reportMMSheet2 + ".dataSteward");
        sheetData2.addHeader(reportMMSheet2 + ".reportDispay");
        sheetData2.addHeader(reportMMSheet2 + ".publishLink");
        sheetData2.addHeader(reportMMSheet2 + ".reportId");
        sheetData2.addHeader(reportMMSheet2 + ".reportType");
        sheetData2.addHeader(reportMMSheet2 + ".systemName");
        sheetData2.addHeader(reportMMSheet2 + ".index");
        sheetData2.addHeader(reportMMSheet2 + ".reportLabel");
        sheetData2.addHeader("report.index|rp");
        sheetData2.addHeader("report.index");

        for (ReportMM mm : reportMMS) {
            List data = Arrays.asList(modelId, model.getDefinition(), mm.getDl1BusinessDomain(), "", mm.getReportId(), mm.getDl2ThemeDomain(), mm.getReportRemark(),
                    mm.getReportName(), mm.getUpdateCycle(), mm.getTechnicaler(), mm.getSecurityLevel(), mm.getDataMaster(), mm.getDataSteward(), mm.getReportDispay(),
                    mm.getPublishLink(), mm.getReportId(), mm.getReportType(), mm.getSystemName(), "", mm.getReportLabel(), "", "");
            sheetData2.addData(data);
        }

        /****************************************************************************/
        SheetData sheetData3 = new SheetData(reportMMSheet3);
        sheetData3.addHeader(reportMMSheet2 + ".Id");
        sheetData3.addHeader(reportMMSheet2 + ".Name");
        sheetData3.addHeader(reportMMSheet3 + ".Id");
        sheetData3.addHeader(reportMMSheet3 + ".reportItemPath");
        sheetData3.addHeader(reportMMSheet3 + ".Name");
        sheetData3.addHeader(reportMMSheet3 + ".Definition");
        sheetData3.addHeader(reportMMSheet3 + ".dataSource");
        sheetData3.addHeader(reportMMSheet3 + ".LogicalName");
        sheetData3.addHeader(reportMMSheet3 + ".reportItemSQL");
        sheetData3.addHeader(reportMMSheet3 + ".technicaler");
        sheetData3.addHeader(reportMMSheet3 + ".reportTable");
        sheetData3.addHeader(reportMMSheet3 + ".index");
        sheetData3.addHeader("reportItem.reportTable|rp");
        sheetData3.addHeader("reportItem.reportTable");
        sheetData3.addHeader("reportItem.index|rp");
        sheetData3.addHeader("reportItem.index");
        for (ReportMM mm : reportMMS) {
            String reportName = mm.getReportName();
            List<ReportItemMM> reportItem = mm.getReportItem();
            for (ReportItemMM itemMM : reportItem) {
                String firstName = model.getDefinition() + "." + reportName;

                List<Object> data = Arrays.asList("", firstName, "", itemMM.getReportItemPath(), itemMM.getReportItem(),
                        "", itemMM.getDataSource(), "", itemMM.getReportItemSQL(), itemMM.getTechnicaler(), mapper.writeValueAsString(itemMM.getReportTable()),
                        mapper.writeValueAsString(itemMM.getIndex()), "", "", "", "");
                sheetData3.addData(data);
            }
        }

        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        sheetDatas.add(sheetData3);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);

        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
    }

    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "KanBan";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }
}
