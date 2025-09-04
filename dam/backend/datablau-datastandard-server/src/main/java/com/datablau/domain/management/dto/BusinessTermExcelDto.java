package com.datablau.domain.management.dto;

import com.andorj.model.common.annotation.ExcelColumn;
import com.andorj.model.common.api.MessageService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.datablau.domain.management.utils.JsonUtils;
import com.datablau.domain.management.utils.StandardUtils;
import io.swagger.v3.oas.annotations.media.Schema;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.apache.commons.lang3.time.DateUtils;

import java.io.Serializable;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Schema(
        title = "业务术语Excel传输层",
        description = "业务术语Excel传输层"
)
public class BusinessTermExcelDto implements Serializable {
    private static final long serialVersionUID = 5891608406630445767L;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.paths")
    @Schema(title = "标准目录")
    private List<String> paths;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.domainCode")
    @Schema(title = "术语编码")
    private String domainCode;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.chName")
    @Schema(title = "业务术语名称")
    private String chName;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.enName")
    @Schema(title = "业务术语英文名称")
    private String enName;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.abbr")
    @Schema(title = "业务数语英文缩写")
    private String abbr;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.explanationTerms")
    @Schema(title = "术语解释")
    private String explanationTerms;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.scene")
    @Schema(title = "应用场景")
    private String scene;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.example")
    @Schema(title = "示例")
    private String example;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.businessTermAliases")
    @Schema(title = "业务术语别名")
    private String businessTermAliases;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.relaTerm")
    @Schema(title = "相关术语")
    private String relaTerm;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.managementDepartment")
    @Schema(title = "责任主体")
    private String managementDepartment;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.source")
    @Schema(title = "参考来源")
    private String source;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.stateStr")
    @Schema(title = "发布状态")
    private String stateStr;

    @ExcelColumn(columnNames = "BusinessTermExcelDto.firstPublishDate")
    @Schema(title = "首次发布时间")
    private String firstPublishDate;

    private String errorMsg;

    private Long folderId;
    private Long relaId;

    public List<String> getPaths() {
        return paths;
    }

    public void setPaths(List<String> paths) {
        this.paths = paths;
    }

    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }

    public String getChName() {
        return chName;
    }

    public void setChName(String chName) {
        this.chName = chName;
    }

    public String getEnName() {
        return enName;
    }

    public void setEnName(String enName) {
        this.enName = enName;
    }

    public String getAbbr() {
        return abbr;
    }

    public void setAbbr(String abbr) {
        this.abbr = abbr;
    }

    public String getExplanationTerms() {
        return explanationTerms;
    }

    public void setExplanationTerms(String explanationTerms) {
        this.explanationTerms = explanationTerms;
    }

    public String getScene() {
        return scene;
    }

    public void setScene(String scene) {
        this.scene = scene;
    }

    public String getExample() {
        return example;
    }

    public void setExample(String example) {
        this.example = example;
    }

    public String getBusinessTermAliases() {
        return businessTermAliases;
    }

    public void setBusinessTermAliases(String businessTermAliases) {
        this.businessTermAliases = businessTermAliases;
    }

    public String getManagementDepartment() {
        return managementDepartment;
    }

    public void setManagementDepartment(String managementDepartment) {
        this.managementDepartment = managementDepartment;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getStateStr() {
        return stateStr;
    }

    public void setStateStr(String stateStr) {
        this.stateStr = stateStr;
    }

    public String getRelaTerm() {
        return relaTerm;
    }

    public void setRelaTerm(String relaTerm) {
        this.relaTerm = relaTerm;
    }

    public String getFirstPublishDate() {
        return firstPublishDate;
    }

    public void setFirstPublishDate(String firstPublishDate) {
        this.firstPublishDate = firstPublishDate;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public Long getRelaId() {
        return relaId;
    }

    public void setRelaId(Long relaId) {
        this.relaId = relaId;
    }

    public DomainExtDto buildDomainDto(Long categoryId, MessageService msgService) {
        DomainExtDto domainExtDto = new DomainExtDto();
        domainExtDto.setCategoryId(categoryId);
        List<String> _paths = new ArrayList<>();
        if(categoryId == 1L) {
            _paths.add(msgService.getMessage("domain.name.standard"));
        } else if (categoryId == 2L) {
            _paths.add(msgService.getMessage("domain.name.index"));
        }
        _paths.addAll(paths);
        domainExtDto.setPath(_paths);
        domainExtDto.setChineseName(chName);
        domainExtDto.setDomainCode(domainCode);
        return domainExtDto;
    }

    /*
    *
    * 已经完善folerId,relaId,
    * 未完善domainCode,state,firstPublish
    * */
    public BusinessTerm buildBusinessTerm() {
        BusinessTerm businessTerm = JsonUtils.toObject(JsonUtils.toJSon(this), BusinessTerm.class);
        businessTerm.setCategoryId(DomainService.DOMAIN_CATEGORY_ID);
        businessTerm.setUpdateTime(new Date().getTime());
        /*Date firstPublish = null;
        try {
            firstPublish = DateUtils.parseDate(firstPublishDate, "yyyy-MM-dd");
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        businessTerm.setFirstPublish(firstPublish);
        businessTerm.setState(StandardUtils.convertStateEnum(stateStr, msgService));*/
        return businessTerm;
    }
    public static void overwirte(BusinessTerm o, BusinessTerm dbBus, boolean published) {
        o.setId(dbBus.getId());
        o.setDomainCode(dbBus.getDomainCode());
        o.setState(dbBus.getState());
        if (published) {
            o.setState(DomainState.A);
            o.setFirstPublish(new Date());
        }
        o.setVersion(dbBus.getVersion());
        o.setUpdateTime(System.currentTimeMillis());
    }

    public static BusinessTermExcelDto buildBy(BusinessTermDto businessTermDto, MessageService msgService) {
        BusinessTermExcelDto object = JsonUtils.toObject(JsonUtils.toJSon(businessTermDto), BusinessTermExcelDto.class);
        object.setStateStr(StandardUtils.convertStateStr(businessTermDto.getState(), msgService));
        if(businessTermDto.getFirstPublish() != null) {
            object.setFirstPublishDate(DateFormatUtils.format(businessTermDto.getFirstPublish(), "yyyy-MM-dd HH:mm:ss"));
        }
        object.setManagementDepartment(businessTermDto.getManagementDepartmentName()); // 导出时，设置部门名称
        return object;
    }
}
