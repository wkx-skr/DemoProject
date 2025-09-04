package com.datablau.metadata.main.dto;

import com.datablau.metadata.main.entity.metadata.DataObject;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObjectTenderQueryTableResult implements Serializable {
    @Schema(title = "表名称", description = "表名称")
    private String tableName;
    @Schema(title = "表ID", description = "表ID")
    private Long tableId;
    @Schema(title = "数据源ID", description = "数据源ID")
    private Long modelId;
    @Schema(title = "Schema", description = "Schema")
    private String schema;
    @Schema(title = "业务域", description = "业务域")
    private String businessDomain;
    @Schema(title = "来源系统", description = "来源系统")
    private String sourceSystem;
    @Schema(title = "字段集合", description = "字段集合")
    private List<ObjectTenderQueryTableColumnResult> columns;

    public ObjectTenderQueryTableResult(DataObject table, String businessDomain) {
        this.tableName = table.getPhysicalName();
        this.tableId = table.getObjectId();
        this.modelId = table.getModelId();
        this.schema = table.getSchema();
        this.businessDomain = businessDomain;
        this.sourceSystem = table.getModelCategoryId().toString();
    }

    public synchronized void addColumn(DataObject column, Boolean isNull, String columnSecurityLevel) {
        if(columns == null) {
            columns = new ArrayList<>();
        }
        if(!this.getColumns().stream().filter(v -> Objects.equals(v.getColumnId(), column.getObjectId())).findFirst().isPresent()) {
            columns.add(new ObjectTenderQueryTableColumnResult(column, isNull, columnSecurityLevel));
        }
    }
}
