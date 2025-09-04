package com.datablau.reverse.engineering.worker.hana;

import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;

import java.sql.ResultSet;

/**
 * @program: datablau-datasource-plugins
 * @description: HanaWorker
 * @author: wang tong
 * @create: 2023-08-07 17:21
 **/
public class HanaWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    @Override
    public String getType() {
        return "HANA";
    }


    @Override
    public String generateFullDataType(ResultSet columnResultSet, String columnDataType, Integer scale, Integer precision) {
        String dataType = columnDataType.toUpperCase();

        if (dataType.equals("INTEGER")
                || dataType.equals("TINYINT")
                || dataType.equals("SMALLINT")
                || dataType.equals("BIGINT")
                || dataType.equals("REAL")
                || dataType.equals("DOUBLE")
                || dataType.equals("DECFLOAT")
                || dataType.equals("SMALLDECIMAL")
                || dataType.equals("CLOB")
                || dataType.equals("NCLOB")
                || dataType.equals("TEXT")
                || dataType.equals("BINTEXT")
                || dataType.equals("DATE")
                || dataType.equals("TIME")
                || dataType.equals("LONGDATE")
                || dataType.equals("TIMESTAMP")
                || dataType.equals("SECONDDATE")) {
            return dataType;
        }

        if (scale != null && scale > 0) {
            dataType += "(" + scale;

            if (precision != null && precision > 0) {
                dataType += "," + precision;
            }

            dataType += ")";
        }

        return dataType;
    }
}
