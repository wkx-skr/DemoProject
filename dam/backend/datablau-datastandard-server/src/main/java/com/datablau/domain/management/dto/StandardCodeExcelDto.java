package com.datablau.domain.management.dto;

import com.andorj.model.common.annotation.ExcelColumn;
import com.andorj.model.common.api.MessageService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.utils.StandardUtils;
import com.datablau.project.util.CheckNameUtil;
import org.apache.commons.lang.StringUtils;
import org.springframework.util.CollectionUtils;

import javax.print.DocFlavor;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/*
* 参考数据导入实体类
* */
public class StandardCodeExcelDto {

    @ExcelColumn(columnNames = "standardCode.keyword.path")
    private List<String> path;
    @ExcelColumn(columnNames = "standardCode.keyword.code")
    private String code;
    @ExcelColumn(columnNames = "standardCode.keyword.name")
    private String name;
    @ExcelColumn(columnNames = "standardCode.keyword.eName")
    private String eName;
    @ExcelColumn(columnNames = "standardCode.keyword.state")
    private String state;
    @ExcelColumn(columnNames = "standardCode.keyword.remark")
    private String remark;
    @ExcelColumn(columnNames = "standardCode.keyword.order")
    private String order;
    @ExcelColumn(columnNames = "standardCode.keyword.codeV")
    private String codeV;
    @ExcelColumn(columnNames = "standardCode.keyword.codeName")
    private String codeName;
    @ExcelColumn(columnNames = "standardCode.keyword.pCodeV")
    private String pCodeV;
    @ExcelColumn(columnNames = "standardCode.keyword.remarkOne")
    private String remarkOne;
    @ExcelColumn(columnNames = "standardCode.keyword.remarkTwo")
    private String remarkTwo;
    @ExcelColumn(columnNames = "standardCode.keyword.remarkThr")
    private String remarkThr;

    private Long folderId;
    private String errorMsg;

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

    public String getRemarkOne() {
        return remarkOne;
    }

    public void setRemarkOne(String remarkOne) {
        this.remarkOne = remarkOne;
    }

    public String getRemarkTwo() {
        return remarkTwo;
    }

    public void setRemarkTwo(String remarkTwo) {
        this.remarkTwo = remarkTwo;
    }

    public String getRemarkThr() {
        return remarkThr;
    }

    public void setRemarkThr(String remarkThr) {
        this.remarkThr = remarkThr;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public static boolean addDtoToList(MessageService msgService, StandardCodeExcelDto excelDto, List<StandardCodeFolderDto> standardCodeDtos, String username, Long categoryId, boolean published) {
        Optional<StandardCodeFolderDto> standardCodeOpt = standardCodeDtos.stream().filter(v -> Objects.equals(v.getName(), excelDto.getName())).findFirst();
        //这里是获取代码取值的
        if(standardCodeOpt.isPresent()) {
            StandardCodeValueDto value = excelDto.buildStandardCodeValueDto();
            if(value != null) {
                // 如果录入了代码
                StandardCodeDto standardCodeDto = standardCodeOpt.get();
                if(standardCodeDto.getValues() != null) {
                    Optional<StandardCodeValueDto> codeValueDtoOpt = standardCodeDto.getValues().stream().filter(v -> v.getValue().equals(excelDto.getCodeV())).findFirst();
                    if(codeValueDtoOpt.isPresent()) {
                        excelDto.setErrorMsg(StringUtils.isBlank(excelDto.getErrorMsg())?msgService.getMessage("standardCodeNumberExists", excelDto.getName(), codeValueDtoOpt.get().getName()): excelDto.getErrorMsg() + ";" + msgService.getMessage("standardCodeNumberExists", excelDto.getName(), codeValueDtoOpt.get().getName()));
                        return false;
                    }
                }
                standardCodeDto.addValue(value);
                return true;
            } else {
                // 如果没录入代码， 则是名称重复
                excelDto.setErrorMsg(StringUtils.isBlank(excelDto.getErrorMsg())?msgService.getMessage("standardCodeExists", excelDto.getCode()): excelDto.getErrorMsg() + ";" + msgService.getMessage("standardCodeExists", excelDto.getCode()));
                return false;
            }
        } else {
            StandardCodeFolderDto dto = excelDto.buildStandardCodeDto(msgService, username, categoryId, published);
            standardCodeDtos.add(dto);
            StandardCodeValueDto value = excelDto.buildStandardCodeValueDto();
            if(value != null) {
                dto.addValue(value);
            }
            return true;
        }
    }

    public StandardCodeFolderDto buildStandardCodeDto(MessageService msgService, String username, Long categoryId, boolean published) {
        StandardCodeFolderDto standardCodeDto = new StandardCodeFolderDto();
        standardCodeDto.setCategoryId(categoryId);
        standardCodeDto.setFolderId(folderId);
        standardCodeDto.setPaths(path);
        standardCodeDto.setCode(code);
        standardCodeDto.setName(name);
        standardCodeDto.setEnglishName(eName);
        standardCodeDto.setComment(remark);
        /*if(StringUtils.isEmpty(state)) {
            standardCodeDto.setState(published ? DomainState.A : DomainState.D);
        } else {
            standardCodeDto.setState(StandardUtils.convertStateEnum(state, msgService));
        }*/
        standardCodeDto.setState(DomainState.D); // 没用了，已改为用关联标准的状态
        standardCodeDto.setVersion(1);
        standardCodeDto.setSubmitter(username);
        return standardCodeDto;
    }

    public StandardCodeValueDto buildStandardCodeValueDto() {

        //导入的话需要判断代码的值，都是必填的
        if(StringUtils.isEmpty(codeV)) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())?"编码取值不能为空": this.getErrorMsg() + ";" + "编码取值不能为空");
        }
        if(StringUtils.isEmpty(codeName)) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())?"编码中文名称不能为空": this.getErrorMsg() + ";" + "编码中文名称不能为空");
        }
        if(StringUtils.isEmpty(order)) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())?"编码顺序不能为空": this.getErrorMsg() + ";" + "编码顺序不能为空");
        }

        // 如果编码中文名称有值则代表有编码
        if(StringUtils.isEmpty(codeName)) {
            return null;
        }

        StandardCodeValueDto value = new StandardCodeValueDto();
        value.setName(codeName);
        value.setValue(codeV);
        value.setOrder(StringUtils.isBlank(order) ? null : Integer.valueOf(order));
        value.setDefinition(remarkOne);
        value.setDefinition2(remarkTwo);
        value.setDefinition3(remarkThr);
        value.setParentValue(pCodeV);
//            value.setEnglishName(excelDto.eName);
        return value;
    }

    /*
     * path, chineseName, categoryId, domainCode,
     * folderId, errorMsg, domainCode
     * */
    public DomainExtDto buildDomainDto(Long categoryId, MessageService msgService) {
        DomainExtDto domainExtDto = new DomainExtDto();
        domainExtDto.setCategoryId(categoryId);
        List<String> _paths = new ArrayList<>();
        if(categoryId == 1L) {
            _paths.add(msgService.getMessage("domain.name.standard"));
        } else if (categoryId == 2L) {
            _paths.add(msgService.getMessage("domain.name.index"));
        }
        _paths.addAll(path==null?new ArrayList<>():path);
        domainExtDto.setPath(_paths);
        domainExtDto.setChineseName(name);
        domainExtDto.setDomainCode(code);
        return domainExtDto;
    }

    public boolean check(MessageService msgService) {
        if (StringUtils.isNotEmpty(this.getCode()) && this.getCode().contains("+")) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("invalidChar") : this.getErrorMsg() + ";" + msgService.getMessage("invalidChar"));
//            return false;
        }
        if(CollectionUtils.isEmpty(this.getPath())) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardSubjectNotNull") :  this.getErrorMsg() + ";" + msgService.getMessage("standardSubjectNotNull"));
//            return false;
        }
        if(StringUtils.isBlank(this.getName())) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardZhNameNotNull") :  this.getErrorMsg() + ";" + msgService.getMessage("standardZhNameNotNull"));
//            return false;
        }

        //中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (StringUtils.isNotEmpty(this.getName()) && !CheckNameUtil.checkChineseName(this.getName())) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("domainChNameRegexCheck") :  this.getErrorMsg() + ";" + msgService.getMessage("domainChNameRegexCheck"));
//            throw new RuntimeException(msgService.getMessage("domainChNameRegexCheck"));
        }
         //中文名称长度不能超过15位
        if (StringUtils.isNotEmpty(this.getName()) && CheckNameUtil.checkChineseNameLength(this.getName(), 15) ) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("domainChNameLengthCheck") :  this.getErrorMsg() + ";" + msgService.getMessage("domainChNameLengthCheck"));
//            throw new RuntimeException(msgService.getMessage("domainChNameLengthCheck"));
        }

        if(StringUtils.isBlank(this.geteName())) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardEnNameNotNull") :  this.getErrorMsg() + ";" + msgService.getMessage("standardEnNameNotNull"));

//            this.setErrorMsg(msgService.getMessage("standardEnNameNotNull"));
//            return false;
        }

        //英文名称只能是字母和空格，首字母还需要大写
        if (StringUtils.isNotEmpty(this.geteName()) &&
                StringUtils.isNotEmpty(CheckNameUtil.checkEnglishNameStyle(this.geteName()))) {
            this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("domainEnNameRegexCheck") :  this.getErrorMsg() + ";" + msgService.getMessage("domainEnNameRegexCheck"));
//            throw new RuntimeException(msgService.getMessage("domainEnNameRegexCheck"));
        }
        if(StringUtils.isNotEmpty(state)) {
            if(StandardUtils.convertStateEnum(state, msgService) == null) {
                this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardStateNotNull", state) :  this.getErrorMsg() + ";" + msgService.getMessage("standardStateNotNull", state));
//                this.setErrorMsg(msgService.getMessage("standardStateNotNull", state));
//                return false;
            }
        }

        // 如果编码取值有值则代表有编码
        if(StringUtils.isNotEmpty(this.getCodeV())) {
            if(StringUtils.isBlank(this.getCodeName())) {
                this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardCodeNotNull") :  this.getErrorMsg() + ";" + msgService.getMessage("standardCodeNotNull"));
//                this.setErrorMsg(msgService.getMessage("standardCodeNotNull"));
//                return false;
            }
            if(this.getCodeV().equals(this.getpCodeV())) {
                this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("codeCannotSameAsParent") :  this.getErrorMsg() + ";" + msgService.getMessage("codeCannotSameAsParent"));
//                this.setErrorMsg(msgService.getMessage(msgService.getMessage("codeCannotSameAsParent")));
//                return false;
            }
            if(StringUtils.isBlank(this.getOrder())) {
                this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardCodeOrderNotNull") :  this.getErrorMsg() + ";" + msgService.getMessage("standardCodeOrderNotNull"));
//                this.setErrorMsg(msgService.getMessage("standardCodeOrderNotNull"));
//                return false;
            }
            try {
                Integer i = Integer.valueOf(this.getOrder());
                if(i < 1) {
                    this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardCodeOrderLessOne") :  this.getErrorMsg() + ";" + msgService.getMessage("standardCodeOrderLessOne"));
//                    this.setErrorMsg(msgService.getMessage("standardCodeOrderLessOne"));
//                    return false;
                }
            } catch (Exception e) {
                this.setErrorMsg(StringUtils.isBlank(this.getErrorMsg())? msgService.getMessage("standardCodeOrderNotValid") :  this.getErrorMsg() + ";" + msgService.getMessage("standardCodeOrderNotValid"));
//                this.setErrorMsg(msgService.getMessage("standardCodeOrderNotValid"));
//                return false;
            }
        }
        return true;
    }
}
