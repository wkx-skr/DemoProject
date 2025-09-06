package com.datablau.ddd.server.controller;

import static com.datablau.ddd.common.constant.DolphinSchedulerConstants.*;

import org.apache.commons.lang.StringUtils;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.PageResult;
import com.datablau.ddd.common.dto.ProcedureDto;
import com.datablau.ddd.common.dto.ResultWrapper;
import com.datablau.ddd.data.dto.Column;
import com.datablau.ddd.data.dto.Profiling;
import com.datablau.ddd.data.dto.Result;
import com.datablau.ddd.data.dto.SqlGeneration;
import com.datablau.model.common.dto.ColumnDetailDto;
import com.datablau.server.DatasourceBaseService;
import com.datablau.service.driver.Driver;
import io.swagger.v3.oas.annotations.Operation;

@RestController()
@RequestMapping("/datatype")
public class DataTypeController {

    @Autowired
    DatasourceBaseService datasourceBaseService;

    /**
     * 获取 SqlGeneration
     */
    @GetMapping("/getSqlGeneration")
    public ResultWrapper<Object> getSqlGeneration(@RequestParam Long datasourceId, @RequestParam String schemaName,
                                                  @RequestParam String tableName) throws IOException {
        SqlGeneration sqlGeneration = datasourceBaseService.getSqlGeneration(datasourceId, schemaName,
                tableName, "");

        return ResultWrapper.getSuccessResultWrapper(sqlGeneration);
    }

    @RequestMapping("/{datasourceId}/schemas")
    public List<String> getSchemasOfDamModel(@PathVariable("datasourceId") Long datasourceId) {
        return datasourceBaseService.getSchemas(datasourceId);
    }
    @Operation(summary = "根据datasourceId获取所有的Database")
    @GetMapping("/{datasourceId}/raw-schemas")
    public List<String> getRawSchemasOfModel(@PathVariable("datasourceId") Long datasourceId,
                                             @RequestParam String search) {
        return datasourceBaseService.getRawSchemasOfModel(datasourceId, search);
    }

    @Operation(summary = "刷新Database")
    @GetMapping("/{datasourceId}/{schemaName}/refush-raw-table")
    public boolean refushTableOfModel(@PathVariable("datasourceId") Long datasourceId,
                                      @PathVariable("schemaName") String schemaName) {
        return datasourceBaseService.refushRawSchemasOfModel(datasourceId, schemaName);
    }

    @Operation(summary = "根据datasourceId，以及数据库的名字获取所有的table的名字")
    @GetMapping("/{datasourceId}/{schemaName}/raw-tables")
    public PageResult<String> getRawTablesByModelAndSchema(@PathVariable("datasourceId") Long datasourceId,
                                                           @PathVariable("schemaName") String schemaName,
                                                           @RequestParam("currentPage") Integer currentPage,
                                                           @RequestParam("pageSize") Integer pageSize,
                                                           @RequestParam("search") String search) throws Exception {
        return datasourceBaseService.getRawTablesByModelAndSchema(datasourceId, schemaName, currentPage, pageSize,
                search);
    }
    @Operation(summary = "根据datasourceId，数据库的名字，以及表的名字，获取所有的column的名字以及详情")
    @GetMapping("/{datasourceId}/{schemaName}/{tableName}/raw-columns-detail")
    public List<Column> getRawColumnDetailsByModelSchemaAndTable(
                                                                 @PathVariable("datasourceId") Long datasourceId,
                                                                 @PathVariable("schemaName") String schemaName,
                                                                 @PathVariable("tableName") String tableName) throws IOException {
        return datasourceBaseService.getRawColumnDetailsByModelSchemaAndTableInfo(datasourceId, schemaName,
                tableName);
    }
    @Operation(summary = "根据datasourceId，数据库的名字，以及表的名字，获取选择的表所有的column的名字以及详情")
    @PostMapping("/selected/raw-columns-detail")
    public Map<String, List<ColumnDetailDto>> getSelectedTableRawColumnDetailsByModelSchemaAndTable(
                                                                                                    @RequestParam("datasourceId") Long datasourceId,
                                                                                                    @RequestParam("schemaName") String schemaName,
                                                                                                    @RequestBody List<String> tableName) {
        Map<String, List<ColumnDetailDto>> resultMap = new HashMap<>();
        tableName.forEach(item -> {
            try {
                List<Column> columnList =
                        datasourceBaseService.getRawColumnDetailsByModelSchemaAndTableInfo(datasourceId, schemaName,
                                item);
                List<ColumnDetailDto> columnDetailDtos = new ArrayList<>();
                columnList.forEach(column -> {
                    ColumnDetailDto columnDetailDto = new ColumnDetailDto();
                    columnDetailDto.setType(column.getColumnType());
                    columnDetailDto.setColumnName(column.getName());
                    columnDetailDto.setColumnSize(String.valueOf(column.getLength()));
                    columnDetailDtos.add(columnDetailDto);
                });
                resultMap.put(item, columnDetailDtos);
            } catch (Exception e) {
                throw new InvalidArgumentException("获取选择表的字段信息时失败");
            }
        });
        return resultMap;
    }
    @Operation(summary = "根据datasourceId，以及数据库的名字获取所有的存储过程名字")
    @GetMapping("/{datasourceId}/{schemaName}/raw/{type}")
    public PageResult<String> getRawProceduresByModelAndSchema(@PathVariable("datasourceId") Long datasourceId,
                                                               @PathVariable("type") String type,
                                                               @PathVariable("schemaName") String schemaName,
                                                               @RequestParam("currentPage") Integer currentPage,
                                                               @RequestParam("pageSize") Integer pageSize,
                                                               @RequestParam("search") String search) throws Exception {
        return datasourceBaseService.getRawProceduresByModelAndSchema(datasourceId, schemaName, currentPage, pageSize,
                search, type);
    }

    @Operation(summary = "修改存储过程")
    @PutMapping("/sql/{type}/update")
    public Result<List<List<Map<String, Object>>>> updateProcedure(@RequestBody ProcedureDto procedureDto,
                                                                   @PathVariable("type") String type) {
        Driver driver1 = Driver.build(procedureDto.getDbType());
        String procedure;
        List<String> sqlList = new ArrayList<>();
        String useDatabase = driver1.getDBQuery().useDatabase(procedureDto.getSchemaName());
        if (StringUtils.isNotEmpty(useDatabase)
                && procedureDto.getDbType().equalsIgnoreCase(SQLSERVER)) {
            sqlList.add(useDatabase);
        }
        String CREATE_REPLACE = "CREATE OR REPLACE";
        switch (type) {
            case "procedure":
                procedure = driver1.getDBQuery()
                        .dropProcedure(procedureDto.getSchemaName(), procedureDto.getProcedureName());
                if (!procedureDto.getProcedureContent().toUpperCase().contains(CREATE_REPLACE)
                        && procedureDto.getDbType().equalsIgnoreCase(SQLSERVER)) {
                    sqlList.add(procedure);
                }
                sqlList.add(driver1.getDBQuery().updateProcddure(procedureDto.getProcedureContent()));
                break;
            case "view":
                procedure = driver1.getDBQuery()
                        .dropView(procedureDto.getSchemaName(), procedureDto.getProcedureName());
                if (!procedureDto.getProcedureContent().toUpperCase().contains(CREATE_REPLACE)
                        && procedureDto.getDbType().equalsIgnoreCase(SQLSERVER)) {
                    sqlList.add(procedure);
                }
                sqlList.add(driver1.getDBQuery().updateProcddure(procedureDto.getProcedureContent()));
                break;
            default:
                procedure = driver1.getDBQuery()
                        .dropFunc(procedureDto.getSchemaName(), procedureDto.getProcedureName());
                if (!procedureDto.getProcedureContent().toUpperCase().contains(CREATE_REPLACE)
                        && procedureDto.getDbType().equalsIgnoreCase(SQLSERVER)) {
                    sqlList.add(procedure);
                }
                sqlList.add(driver1.getDBQuery().updateProcddure(procedureDto.getProcedureContent()));
        }
        return datasourceBaseService.execBath(sqlList, procedureDto.getDatasourceId(), procedureDto.getSchemaName());
    }

    @Operation(summary = "查询存储过程内容")
    @GetMapping("/{datasourceId}/{schemaName}/{procedureName}/getContent/{type}")
    public Result<String> getProcedure(@PathVariable("datasourceId") Long datasourceId,
                                       @PathVariable("type") String type,
                                       @PathVariable("schemaName") String schemaName,
                                       @PathVariable("procedureName") String procedureName) {
        return datasourceBaseService.getProcedure(datasourceId, schemaName, procedureName, type);
    }

    @Operation(summary = "数据探查")
    @GetMapping("/{datasourceId}/{schemaName}/{tableName}/profile")
    public Result<List<Profiling>> profiling(@PathVariable("datasourceId") Long datasourceId,
                                             @PathVariable("schemaName") String schemaName,
                                             @PathVariable("tableName") String tableName) throws SQLException {
        return datasourceBaseService.profiling(datasourceId, schemaName, tableName);
    }
}
