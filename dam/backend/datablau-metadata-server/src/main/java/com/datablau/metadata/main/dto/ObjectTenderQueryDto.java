package com.datablau.metadata.main.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;

@Data
public class ObjectTenderQueryDto implements Serializable {

    @Schema(title = "数据源ID", description = "数据源ID")
    private Long modelId;
    @Schema(title = "Schema", description = "Schema")
    private String schema;
    @Schema(title = "表名称", description = "表名称")
    private String tableName;
}
