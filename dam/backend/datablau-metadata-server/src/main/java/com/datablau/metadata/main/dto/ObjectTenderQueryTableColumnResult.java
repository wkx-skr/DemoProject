package com.datablau.metadata.main.dto;

import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.project.api.dto.CustomDomainExtDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObjectTenderQueryTableColumnResult implements Serializable {
    @Schema(title = "字段ID", description = "字段ID")
    private Long columnId;
    @Schema(title = "字段名称", description = "字段名称")
    private String columnCode;
    @Schema(title = "字段安全级别", description = "字段安全级别")
    private String columnSecurityLevel;

    @Schema(title = "标准的编码", description = "标准的编码")
    private String standardCode;
    @Schema(title = "标准的名称", description = "标准的名称")
    private String standardName;
    @Schema(title = "标准ID", description = "标准ID")
    private String standardId;
    @Schema(title = "标准版本", description = "标准版本")
    private Integer standardVersion;
    @Schema(title = "规则", description = "规则")
    private List<Map> rules;

    public ObjectTenderQueryTableColumnResult(DataObject column, Boolean isNull, String columnSecurityLevel) {
        this.columnId = column.getObjectId();
        this.columnCode = column.getPhysicalName();
        this.columnSecurityLevel = columnSecurityLevel;
        Map<String, Object> isNullRule = getRule("isNull");
        isNullRule.put("value", isNull);
        this.rules = new ArrayList<>() {{
            add(isNullRule);
        }};
    }

    public void addRule(CustomDomainExtDto customDomainExtDto) {
        this.standardCode = customDomainExtDto.getDomainCode();
        this.standardName = customDomainExtDto.getChineseName();
        this.standardId = customDomainExtDto.getDomainId();
        this.standardVersion = customDomainExtDto.getVersion();
        if(this.rules == null) {
            this.rules = new ArrayList<>();
        }

        if(StringUtils.isNotBlank(customDomainExtDto.getReferenceCode())) {
            Map<String, Object> references = getRule("references");
            references.put("referencesId", customDomainExtDto.getReferenceCode()); // referencesId 取值code
            references.put("referencesCode", customDomainExtDto.getReferenceCode());
            references.put("referencesName", customDomainExtDto.getReferenceCodeName());
            references.put("referencesVersion", customDomainExtDto.getReferenceCodeVersion());
            this.rules.add(references);
        }

        if(customDomainExtDto.getMaxValue() != null || customDomainExtDto.getMinValue() != null) {
            Map<String, Object> range = getRule("range");
            range.put("minValue", customDomainExtDto.getMinValue());
            range.put("maxValue", customDomainExtDto.getMaxValue());
            this.rules.add(range);
        }

        if(StringUtils.isNotBlank(customDomainExtDto.getDataFormat())) {
            Map<String, Object> formatter = getRule("formatter");
            formatter.put("value", customDomainExtDto.getDataFormat());
            this.rules.add(formatter);
        }

        if(StringUtils.isNotBlank(customDomainExtDto.getDataType())) {
            Map<String, Object> dataType = getRule("dataType");
            dataType.put("value", customDomainExtDto.getDataType());
            this.rules.add(dataType);
        }
    }
    private Map<String, Object> getRule(String ruleType) {
        return new HashMap() {{
            put("ruleType", ruleType);
        }};
    }
}
