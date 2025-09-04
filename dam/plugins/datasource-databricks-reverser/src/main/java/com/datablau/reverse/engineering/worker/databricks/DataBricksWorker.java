package com.datablau.reverse.engineering.worker.databricks;

import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;

import java.sql.ResultSet;

/**
 * @program: datablau-datasource-plugins
 * @description:
 * @author: wang tong
 * @create: 2024-05-28 13:30
 **/
public class DataBricksWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {
    @Override
    public String getType() {
        return "DATABRICKS";
    }


    @Override
    public String generateFullDataType(ResultSet columnResultSet, String columnDataType, Integer scale, Integer precision) {
        String dataType = columnDataType;
        if (scale != null && scale > 0) {
            dataType = dataType + "(" + scale;
            if (precision != null && precision > 0) {
                dataType = dataType + "," + precision;
            }

            dataType = dataType + ")";
        }

        return dataType;
    }
}
