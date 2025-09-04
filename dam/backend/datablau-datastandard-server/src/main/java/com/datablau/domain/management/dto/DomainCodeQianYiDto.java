package com.datablau.domain.management.dto;

import com.andorj.model.common.annotation.ExcelColumn;
import com.andorj.model.common.api.MessageService;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/8/20 15:52
 */
public class DomainCodeQianYiDto implements Serializable {
    @ExcelColumn(columnNames = "业务域")
    private List<String> path;

    @ExcelColumn(columnNames = "代码编号")
    private String code;

    @ExcelColumn(columnNames = "中文名称")
    private String name;

    @ExcelColumn(columnNames = "英文名称")
    private String eName;

    @ExcelColumn(columnNames = "代码状态")
    private String state;

    @ExcelColumn(columnNames = "备注")
    private String remark;

    @ExcelColumn(columnNames = "顺序号")
    private String order;

    @ExcelColumn(columnNames = "编码取值")
    private String codeV;

    @ExcelColumn(columnNames = "编码中文名称")
    private String codeName;

    @ExcelColumn(columnNames = "父编码取值")
    private String pCodeV;

    @ExcelColumn(columnNames = "创建人")
    private String creator;

    @ExcelColumn(columnNames = "发布时间")
    private String publishTime;

    @ExcelColumn(columnNames = "最后更新时间")
    private String lastUpdateTime;

    private Long folderId;

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public List<String> getPath() {
        return path;
    }

    public void setPath(List<String> path) {
        this.path = path;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String geteName() {
        return eName;
    }

    public void seteName(String eName) {
        this.eName = eName;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }

    public String getCodeV() {
        return codeV;
    }

    public void setCodeV(String codeV) {
        this.codeV = codeV;
    }

    public String getCodeName() {
        return codeName;
    }

    public void setCodeName(String codeName) {
        this.codeName = codeName;
    }

    public String getpCodeV() {
        return pCodeV;
    }

    public void setpCodeV(String pCodeV) {
        this.pCodeV = pCodeV;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getPublishTime() {
        return publishTime;
    }

    public void setPublishTime(String publishTime) {
        this.publishTime = publishTime;
    }

    public String getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setLastUpdateTime(String lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
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
        _paths.addAll(path);
        domainExtDto.setPath(_paths);
        domainExtDto.setChineseName(name);
        domainExtDto.setDomainCode(code);
        return domainExtDto;
    }
}
