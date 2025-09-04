package com.datablau.reverse.engineering.worker.teradata;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.andorj.model.common.exception.AndorjJobStoppedException;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

/**
 * @program: datablau-datasource-plugins
 * @description: TeradataWorker
 * @author: wang tong
 * @create: 2023-08-25 18:14
 **/
public class TeradataWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {


    private static final int FetchSize = 10000;
    private static final String dbc_tables = "DBC.TablesV";
    private static final String dbc_indices = "DBC.IndicesV";
    private static final String dbc_indexStats = "DBC.IndexStatsV";

    private static final Logger logger = LoggerFactory.getLogger(TeradataWorker.class);


    @Override
    public String getType() {
        return "TERADATA";
    }

    @Override
    public ResultSet getTableCommentOfSchema(String catalog, String schema) {
        try {
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            String sql = this.getSQL(schema);
            if (sql == null) {
                return null;
            }
            return stmt.executeQuery(sql);
        } catch (SQLException ex) {
            throw new UnexpectedStateException(
                    "Unable to get database table comment:" + ex.getMessage());
        }
    }

    public String getSQL(String schema) {
        return "Select TableName, CommentString from dbc.TablesV where DatabaseName = '" + schema + "' ";
    }


    @Override
    public ResultSet getColumnCommentsOfSchema(String catalog, String schema) {
        // read comment
        try {
            logger.debug("loading columns comment of schema [" + schema + "]");
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            Map<String, Map<String, String>> columnCommentMap = new HashMap<>();

            ResultSet rsColumnsComment = null;

            String sql = "select DatabaseName as TABLE_SCHEM, TableName as TABLE_NAME, ColumnName as COLUMN_NAME, ColumnTitle as REMARKS from DBC.ColumnsV "
                    + "where DatabaseName = '" + schema + "'";
            return stmt.executeQuery(sql);

        } catch (Exception e) {
            logger.error("Failed to get column comment", e);
        }
        return null;
    }

    @Override
    public ResultSet getColumnsOfSchema(String catalog, String s_schema) {

        logger.info("read columns which schema is:" + s_schema + " catalog is:" + catalog);
//        JDK6_SQL_Connection conn = (JDK6_SQL_Connection) dbmd.getConnection();
        String sql = "select\n" +
                "\tcast (null as varchar(30)) as TABLE_CAT,\n" +
                "\tt.DatabaseName as TABLE_SCHEM,\n" +
                "\tt.TableName as TABLE_NAME,\n" +
                "\tc.ColumnName as COLUMN_NAME,\n" +
                "\tCAST (\n" +
                "\t(CASE c.ColumnType WHEN 'A1' THEN 2003\n" +
                "\tWHEN 'AN' THEN 2003\n" +
                "\tWHEN 'AT' THEN 92\n" +
                "\tWHEN 'BF' THEN -2\n" +
                "\tWHEN 'BO' THEN 2004\n" +
                "\tWHEN 'BV' THEN -3\n" +
                "\tWHEN 'CF' THEN 1\n" +
                "\tWHEN 'CO' THEN 2005\n" +
                "\tWHEN 'CV' THEN 12\n" +
                "\tWHEN 'D' THEN 3\n" +
                "\tWHEN 'DA' THEN 91\n" +
                "\tWHEN 'F' THEN 6\n" +
                "\tWHEN 'GF' THEN 1\n" +
                "\tWHEN 'GV' THEN 12\n" +
                "\tWHEN 'I1' THEN -6\n" +
                "\tWHEN 'I2' THEN 5\n" +
                "\tWHEN 'I' THEN 4\n" +
                "\tWHEN 'I8' THEN -5\n" +
                "\tWHEN 'JN' THEN 1111\n" +
                "\tWHEN 'N' THEN 2\n" +
                "\tWHEN 'SZ' THEN 93\n" +
                "\tWHEN 'TS' THEN 93\n" +
                "\tWHEN 'TZ' THEN 92\n" +
                "\tWHEN 'UT' THEN\n" +
                "\t(CASE\n" +
                "\t\tu.TypeKind WHEN 'D' THEN 2001\n" +
                "\t\tWHEN 'S' THEN 2002\n" +
                "\t\tELSE 1111\n" +
                "\tEND)\n" +
                "\tWHEN 'XM' THEN 2009\n" +
                "\tELSE 1111\n" +
                "END) AS INTEGER) as DATA_TYPE,\n" +
                "\tCAST (\n" +
                "\t(CASE c.ColumnType WHEN '++' THEN 'TD_ANYTYPE'\n" +
                "\tWHEN 'A1' THEN 'SYSUDTLIB.' || TRIM(TRAILING FROM c.ColumnUDTName)\n" +
                "\tWHEN 'AN' THEN 'SYSUDTLIB.' || TRIM(TRAILING FROM c.ColumnUDTName)\n" +
                "\tWHEN 'AT' THEN 'TIME'\n" +
                "\tWHEN 'BF' THEN 'BYTE'\n" +
                "\tWHEN 'BO' THEN 'BLOB'\n" +
                "\tWHEN 'BV' THEN 'VARBYTE'\n" +
                "\tWHEN 'CF' THEN 'CHAR'\n" +
                "\tWHEN 'CO' THEN 'CLOB'\n" +
                "\tWHEN 'CV' THEN 'VARCHAR'\n" +
                "\tWHEN 'D' THEN 'DECIMAL'\n" +
                "\tWHEN 'DA' THEN 'DATE'\n" +
                "\tWHEN 'DH' THEN 'INTERVAL DAY TO HOUR'\n" +
                "\tWHEN 'DM' THEN 'INTERVAL DAY TO MINUTE'\n" +
                "\tWHEN 'DS' THEN 'INTERVAL DAY TO SECOND'\n" +
                "\tWHEN 'DY' THEN 'INTERVAL DAY'\n" +
                "\tWHEN 'F' THEN 'FLOAT'\n" +
                "\tWHEN 'GF' THEN 'GRAPHIC'\n" +
                "\tWHEN 'GV' THEN 'VARGRAPHIC'\n" +
                "\tWHEN 'HM' THEN 'INTERVAL HOUR TO MINUTE'\n" +
                "\tWHEN 'HR' THEN 'INTERVAL HOUR'\n" +
                "\tWHEN 'HS' THEN 'INTERVAL HOUR TO SECOND'\n" +
                "\tWHEN 'I1' THEN 'BYTEINT'\n" +
                "\tWHEN 'I2' THEN 'SMALLINT'\n" +
                "\tWHEN 'I' THEN 'INTEGER'\n" +
                "\tWHEN 'I8' THEN 'BIGINT'\n" +
                "\tWHEN 'JN' THEN 'JSON'\n" +
                "\tWHEN 'MI' THEN 'INTERVAL MINUTE'\n" +
                "\tWHEN 'MO' THEN 'INTERVAL MONTH'\n" +
                "\tWHEN 'MS' THEN 'INTERVAL MINUTE TO SECOND'\n" +
                "\tWHEN 'N' THEN 'NUMBER'\n" +
                "\tWHEN 'PD' THEN 'PERIOD(DATE)'\n" +
                "\tWHEN 'PM' THEN 'PERIOD(TIMESTAMP WITH TIME ZONE)'\n" +
                "\tWHEN 'PS' THEN 'PERIOD(TIMESTAMP)'\n" +
                "\tWHEN 'PT' THEN 'PERIOD(TIME)'\n" +
                "\tWHEN 'PZ' THEN 'PERIOD(TIME WITH TIME ZONE)'\n" +
                "\tWHEN 'SC' THEN 'INTERVAL SECOND'\n" +
                "\tWHEN 'SZ' THEN 'TIMESTAMP WITH TIME ZONE'\n" +
                "\tWHEN 'TS' THEN 'TIMESTAMP'\n" +
                "\tWHEN 'TZ' THEN 'TIME WITH TIME ZONE'\n" +
                "\tWHEN 'XM' THEN 'XML'\n" +
                "\tWHEN 'YM' THEN 'INTERVAL YEAR TO MONTH'\n" +
                "\tWHEN 'YR' THEN 'INTERVAL YEAR'\n" +
                "\tWHEN 'UT' THEN 'SYSUDTLIB.' || TRIM(TRAILING FROM c.ColumnUDTName)\n" +
                "\tELSE TRIM (c.ColumnType)\n" +
                "END) AS VARCHAR(500)) as TYPE_NAME,\n" +
                "\t(CASE\n" +
                "\t\tWHEN c.COLUMNTYPE = 'UT'\n" +
                "\t\tAND u.TypeKind = 'D' THEN CAST (\n" +
                "\t\t(CASE WHEN BaseTypes.COLUMNTYPE = 'AT' THEN 15\n" +
                "\t\tWHEN (BaseTypes.COLUMNTYPE = 'CF'\n" +
                "\t\tOR BaseTypes.COLUMNTYPE = 'CO'\n" +
                "\t\tOR BaseTypes.COLUMNTYPE = 'CV'\n" +
                "\t\tOR BaseTypes.COLUMNTYPE = 'GF'\n" +
                "\t\tOR BaseTypes.COLUMNTYPE = 'GV'\n" +
                "\t\tOR BaseTypes.COLUMNTYPE = 'JN'\n" +
                "\t\tOR BaseTypes.COLUMNTYPE = 'XM')\n" +
                "\t\tAND (c.CHARTYPE = 2\n" +
                "\t\tOR c.CHARTYPE = 4) THEN c.ColumnLength / 2\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'D' THEN c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'DA' THEN 10\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'DH' THEN 4 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'DM' THEN 7 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'DS' THEN 17 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'DY' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'F' THEN 15\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'HM' THEN 4 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'HR' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'HS' THEN 14 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'I1' THEN 3\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'I2' THEN 5\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'I' THEN 10\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'I8' THEN 19\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'MI' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'MO' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'MS' THEN 11 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'N' THEN\n" +
                "\t\t(CASE\n" +
                "\t\t\tWHEN c.DECIMALTOTALDIGITS = -128 THEN 40\n" +
                "\t\t\tELSE c.DECIMALTOTALDIGITS\n" +
                "\t\tEND)\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'PD' THEN 28\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'PM' THEN 72\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'PS' THEN 60\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'PT' THEN 38\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'PZ' THEN 50\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'SC' THEN 8 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'SZ' THEN 32\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'TS' THEN 26\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'TZ' THEN 21\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'YM' THEN 4 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN BaseTypes.COLUMNTYPE = 'YR' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tELSE c.ColumnLength\n" +
                "\tEND) AS INTEGER)\n" +
                "\t\tELSE CAST (\n" +
                "\t\t(CASE WHEN c.COLUMNTYPE = 'AT' THEN 15\n" +
                "\t\tWHEN (c.COLUMNTYPE = 'CF'\n" +
                "\t\tOR c.COLUMNTYPE = 'CO'\n" +
                "\t\tOR c.COLUMNTYPE = 'CV'\n" +
                "\t\tOR c.COLUMNTYPE = 'GF'\n" +
                "\t\tOR c.COLUMNTYPE = 'GV'\n" +
                "\t\tOR c.COLUMNTYPE = 'JN'\n" +
                "\t\tOR c.COLUMNTYPE = 'XM')\n" +
                "\t\tAND (c.CHARTYPE = 2\n" +
                "\t\tOR c.CHARTYPE = 4) THEN c.COLUMNLENGTH / 2\n" +
                "\t\tWHEN c.COLUMNTYPE = 'D' THEN c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'DA' THEN 10\n" +
                "\t\tWHEN c.COLUMNTYPE = 'DH' THEN 4 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'DM' THEN 7 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'DS' THEN 17 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'DY' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'F' THEN 15\n" +
                "\t\tWHEN c.COLUMNTYPE = 'HM' THEN 4 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'HR' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'HS' THEN 14 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'I1' THEN 3\n" +
                "\t\tWHEN c.COLUMNTYPE = 'I2' THEN 5\n" +
                "\t\tWHEN c.COLUMNTYPE = 'I' THEN 10\n" +
                "\t\tWHEN c.COLUMNTYPE = 'I8' THEN 19\n" +
                "\t\tWHEN c.COLUMNTYPE = 'MI' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'MO' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'MS' THEN 11 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'N' THEN\n" +
                "\t\t(CASE\n" +
                "\t\t\tWHEN c.DECIMALTOTALDIGITS = -128 THEN 40\n" +
                "\t\t\tELSE c.DECIMALTOTALDIGITS\n" +
                "\t\tEND)\n" +
                "\t\tWHEN c.COLUMNTYPE = 'PD' THEN 28\n" +
                "\t\tWHEN c.COLUMNTYPE = 'PM' THEN 72\n" +
                "\t\tWHEN c.COLUMNTYPE = 'PS' THEN 60\n" +
                "\t\tWHEN c.COLUMNTYPE = 'PT' THEN 38\n" +
                "\t\tWHEN c.COLUMNTYPE = 'PZ' THEN 50\n" +
                "\t\tWHEN c.COLUMNTYPE = 'SC' THEN 8 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'SZ' THEN 32\n" +
                "\t\tWHEN c.COLUMNTYPE = 'TS' THEN 26\n" +
                "\t\tWHEN c.COLUMNTYPE = 'TZ' THEN 21\n" +
                "\t\tWHEN c.COLUMNTYPE = 'YM' THEN 4 + c.DECIMALTOTALDIGITS\n" +
                "\t\tWHEN c.COLUMNTYPE = 'YR' THEN 1 + c.DECIMALTOTALDIGITS\n" +
                "\t\tELSE c.COLUMNLENGTH\n" +
                "\tEND) AS INTEGER)\n" +
                "\tEND) AS COLUMN_SIZE,\n" +
                "\tcast (null as integer) as BUFFER_LENGTH,\n" +
                "\tcast (\n" +
                "\t(CASE WHEN (c.COLUMNTYPE = 'N'\n" +
                "\tOR c.COLUMNTYPE = 'UT'\n" +
                "\tAND BaseTypes.COLUMNTYPE = 'N')\n" +
                "\tAND c.DECIMALFRACTIONALDIGITS = -128 THEN 0\n" +
                "\tELSE c.DECIMALFRACTIONALDIGITS\n" +
                "END) as integer) as DECIMAL_DIGITS,\n" +
                "\tcast (10 as integer) as NUM_PREC_RADIX,\n" +
                "\tCAST(\n" +
                "\t(CASE c.Nullable WHEN 'Y' THEN 1\n" +
                "\tWHEN 'N' THEN 0\n" +
                "\tELSE 2\n" +
                "END) AS INTEGER) as NULLABLE,\n" +
                "\tc.CommentString as REMARKS,\n" +
                "\tc.DefaultValue as COLUMN_DEF,\n" +
                "\tcast (null as integer) as SQL_DATA_TYPE,\n" +
                "\tcast (null as integer) as SQL_DATETIME_SUB,\n" +
                "\tcast (c.ColumnLength as integer) as CHAR_OCTET_LENGTH,\n" +
                "\tcast ((row_number () over (partition by TABLE_SCHEM,\n" +
                "\tTABLE_NAME\n" +
                "order by\n" +
                "\tc.ColumnID)) as integer) as ORDINAL_POSITION,\n" +
                "\tTRIM((CASE c.Nullable WHEN 'Y' THEN 'YES' WHEN 'N' THEN 'NO' ELSE '' END)) as IS_NULLABLE,\n"
                +
                "\tcast (null as varchar(30)) as SCOPE_CATLOG,\n" +
                "\tcast (null as varchar(30)) as SCOPE_SCHEMA,\n" +
                "\tcast (null as varchar(30)) as SCOPE_TABLE,\n" +
                "\tCAST(\n" +
                "\t(CASE c.ColumnType WHEN 'UT' THEN\n" +
                "\t(CASE\n" +
                "\t\tu.TypeKind WHEN 'D' THEN CAST (\n" +
                "\t\t(CASE BaseTypes.ColumnType WHEN 'A1' THEN 2003\n" +
                "\t\tWHEN 'AN' THEN 2003\n" +
                "\t\tWHEN 'AT' THEN 92\n" +
                "\t\tWHEN 'BF' THEN -2\n" +
                "\t\tWHEN 'BO' THEN 2004\n" +
                "\t\tWHEN 'BV' THEN -3\n" +
                "\t\tWHEN 'CF' THEN 1\n" +
                "\t\tWHEN 'CO' THEN 2005\n" +
                "\t\tWHEN 'CV' THEN 12\n" +
                "\t\tWHEN 'D' THEN 3\n" +
                "\t\tWHEN 'DA' THEN 91\n" +
                "\t\tWHEN 'F' THEN 6\n" +
                "\t\tWHEN 'GF' THEN 1\n" +
                "\t\tWHEN 'GV' THEN 12\n" +
                "\t\tWHEN 'I1' THEN -6\n" +
                "\t\tWHEN 'I2' THEN 5\n" +
                "\t\tWHEN 'I' THEN 4\n" +
                "\t\tWHEN 'I8' THEN -5\n" +
                "\t\tWHEN 'JN' THEN 1111\n" +
                "\t\tWHEN 'N' THEN 2\n" +
                "\t\tWHEN 'SZ' THEN 93\n" +
                "\t\tWHEN 'TS' THEN 93\n" +
                "\t\tWHEN 'TZ' THEN 92\n" +
                "\t\tWHEN 'UT' THEN\n" +
                "\t\t(CASE null\n" +
                "\t\tWHEN 'D' THEN 2001\n" +
                "\t\tWHEN 'S' THEN 2002\n" +
                "\t\tELSE 1111\n" +
                "\tEND)\n" +
                "\t\tWHEN 'XM' THEN 2009\n" +
                "\t\tELSE 1111\n" +
                "\tEND) AS INTEGER)\n" +
                "\t\tELSE NULL\n" +
                "\tEND)\n" +
                "\tELSE NULL\n" +
                "END) AS SMALLINT) as SOURCE_DATA_TYPE\n" +
                "from\n" +
                "\tDBC.TablesV t\n" +
                "join DBC.ColumnsV c on\n" +
                "\tt.DatabaseName = c.DatabaseName\n" +
                "\tand t.TableName = c.TableName\n" +
                "left outer join DBC.UDTInfo u on\n" +
                "\tc.ColumnUDTName = u.TypeName\n" +
                "left outer join DBC.ColumnsV BaseTypes on\n" +
                "\tu.TypeKind = 'D'\n" +
                "\tand 'SYSUDTLIB' = BaseTypes.DatabaseName (not casespecific)\n" +
                "\tand u.TypeName (not casespecific) = BaseTypes.TableName (not casespecific)\n" +
                "where\n" +
                "\tt.TableKind IN ('O', 'T', 'V')\n" +
                "\tand c.DatabaseName (not casespecific) = '" + s_schema + "' (not casespecific)\n" +
//                "\tand c.TableName (not casespecific) like '" + quotedTableNamePattern + "' (not casespecific) escape '\\'\n" +
                "\tand c.ColumnName (not casespecific) like '%' (not casespecific) escape '\\'\n" +
                "order by\n" +
                "\tTABLE_SCHEM,\n" +
                "\tTABLE_NAME,\n" +
                "\tORDINAL_POSITION";

        logger.info("read column's sql:" + sql);
        logger.info("current schema:[" + s_schema + "] ");
        try {
            Connection conn = jdbcDatasource.getConnection();

            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setFetchSize(FetchSize);
            ResultSet rs = stmt.executeQuery();
//            ((TDResultSet) rs).setMetadataRS(true);
            return rs;
        } catch (Exception e) {
            logger.error("failed to read columns ", e);
        }
        return null;
    }


    @Override
    public String generateFullDataType(ResultSet columnResultSet, String datatype, Integer precision, Integer scale) {
        String colDataType = datatype;

        if (datatype.compareToIgnoreCase("DATE") == 0
                || datatype.startsWith("INTERVAL")
                || datatype.startsWith("PERIOD")
                || datatype.compareToIgnoreCase("INTEGER") == 0
                || datatype.compareToIgnoreCase("BYTEINT") == 0
                || datatype.compareToIgnoreCase("SMALLINT") == 0
                || datatype.compareToIgnoreCase("BIGINT") == 0
                || datatype.compareToIgnoreCase("XML") == 0) {
            // no scale & precision
        } else if (datatype.compareToIgnoreCase("TIME") == 0
                || datatype.compareToIgnoreCase("TIMESTAMP") == 0) {
            if (precision != 6) {
                colDataType += "(" + precision + ")";
            }
        } else if (datatype.compareToIgnoreCase("TIME WITH TIME ZONE") == 0) {
            if (precision != 6) {
                colDataType += "TIME(" + precision + ") WITH TIME ZONE";
            }
        } else if (datatype.compareToIgnoreCase("TIMESTAMP WITH TIME ZONE") == 0) {
            if (precision != 6) {
                colDataType += "TIMESTAMP(" + precision + ") WITH TIME ZONE";
            }
        } else if (datatype.compareToIgnoreCase("BLOB") == 0
                || datatype.compareToIgnoreCase("CLOB") == 0) {
            if (scale != 2097088000) {
                colDataType += "(" + scale + ")";
            }
        } else if (datatype.compareToIgnoreCase("FLOAT") == 0) {
            if (scale != 15) {
                colDataType += "(" + scale + ")";
            }
        } else if (datatype.compareToIgnoreCase("JSON") == 0) {
            if (scale != 16776192) {
                colDataType += "(" + scale + ")";
            }
        } else if (datatype.compareToIgnoreCase("DECIMAL") == 0) {
            if (!(scale == 5 && precision == 0)) {
                colDataType += "(" + scale;
                if (precision > 0) {
                    colDataType += "," + precision;
                }
                colDataType += ")";
            }
        } else if (datatype.compareToIgnoreCase("NUMBER") == 0) {
            if (!(scale == 40 && precision == 0)) {
                colDataType += "(" + scale;
                if (precision > 0) {
                    colDataType += "," + precision;
                }
                colDataType += ")";
            }
        } else {
            colDataType += "(" + scale;
            colDataType += ")";
        }

        return colDataType;
    }


    @Override
    protected void readEntireViewSQL(String catalog, String schema, ReversedSchema oSchema, ResultSet viewSqlResultSet) throws Exception {
        logger.debug("try to get Teradata view sql");

        try {
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "select TableName, RequestText from dbc.TablesV where TableKind = 'V' and DataBaseName = '%s'";
                query = String.format(query, schema);
                logger.debug(query);

                try (ResultSet result = stmt.executeQuery(query)) {
                    while (result.next()) {
                        String viewname = result.getString("TableName");
                        ReversedTable view = oSchema.lookForTable(viewname);
                        if (view == null)
                            return;

                        ObjectX viewX = view.getTableX();
                        String sql = result.getString("RequestText");
                        if (!Strings.isNullOrEmpty(sql))
                            viewX.setProperty(LDMTypes.pSQL, sql);
                        if (options.needToPersis()) {
                            viewX.setObjectIsFullyCreated();
                            view.clearObjectX();
                        }
                        processSave();
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get td database variables", e);
        }
    }


    @Override
    public String getSpSqlOfSp(String catalog, String schema, String spName) {
        String query = "show procedure %s.%s";
        query = String.format(query, schema, spName);
        String sql = "";
        try (Statement stmt = jdbcDatasource.getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                sql += rs.getString("RequestText");
            }
            return sql;
        } catch (Exception se) {
            logger.error("failed to get MySQL SP SQL", se);
            throw new UnexpectedStateException("Failed to execute SQL command to obtain Sp:" + se.getMessage(), se);
        }
    }


    @Override
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        try {
            return jdbcDatasource.getConnection().getMetaData().getPrimaryKeys(catalog, schema, null);
        } catch (SQLException e) {
            throw new UnexpectedStateException(
                    "Unable to get pk :" + e.getMessage());
        }
    }

    @Override
    public ResultSet getForeignKeysOfSchema(String catalog, String schema) {
        try {
            return jdbcDatasource.getConnection().getMetaData().getImportedKeys(catalog, schema, null);
        } catch (SQLException e) {
            throw new UnexpectedStateException(
                    "Unable to get pk :" + e.getMessage());
        }
    }


    @Override
    public ResultSet getIndexesOfSchema(String catalog, String schema) {
        // coming from td jdbc 16.20
//        JDK6_SQL_Connection conn = (JDK6_SQL_Connection)dbmd.getConnection();
//        int DBCRelease = conn.getTeradataDatabaseVersionNumber();
        int DBCRelease = 1410;

        schema = schema != null ? schema.replaceAll("'", "''") : null;
        String sql =
                "select cast(null as varchar(30)) as TABLE_CAT, i.DatabaseName as TABLE_SCHEM, i.TableName as TABLE_NAME, cast((case i.UniqueFlag when 'N' then 'true' else 'false' end) as varchar(5)) as NON_UNIQUE, "
                        + (DBCRelease >= 1410 ? "i.IndexDatabaseName" : "cast(null as varchar(30))") + " as INDEX_QUALIFIER" + ", i.IndexName as INDEX_NAME"
                        + ", cast((case" + " when i.IndexType in ('A', 'K', 'P', 'Q', 'U') and i.IndexNumber = 1 then 1 /* tableIndexClustered */"
                        + " when i.IndexType in ('H', 'K','O','P', 'S', 'U', 'V') then 2 /* tableIndexHashed */"
                        + " else 3 /* tableIndexOther */ end) as smallint) as \"TYPE\""
                        + ", i.ColumnPosition as ORDINAL_POSITION" + ", i.ColumnName as COLUMN_NAME" + ", cast((case when o.IndexType = 'I' then 'A' else null end) as varchar(1)) as ASC_OR_DESC" + ", cast("
                        + (DBCRelease >= 1400 ? "s.UniqueValueCount" : "null") + " as integer) as \"CARDINALITY\"" + ", cast(null as integer) as \"PAGES\"" + ", cast(null as varchar(30)) as FILTER_CONDITION"
                        + " from " + this.dbc_indices + " i"
                        + " join " + this.dbc_tables + " t" + " on i.DatabaseName = t.DatabaseName" + " and i.TableName = t.TableName" + " and t.TableKind in ('O', 'T')"
                        + " left outer join " + this.dbc_indices + " o" + " on i.DatabaseName = o.DatabaseName" + " and i.TableName = o.TableName" + " and i.IndexNumber + 4 = o.IndexNumber" + " and i.ColumnName = o.ColumnName" + " and o.IndexType = 'I'"
                        + " left outer join " + this.dbc_indexStats + " s" + " on i.DatabaseName = s.DatabaseName" + " and i.TableName = s.TableName" + " and i.IndexNumber = s.IndexNumber" + " and i.ColumnName = s.ColumnName"
                        + " where i.IndexType in (" + " /* Primary: */ 'A', 'P', 'Q'," + " /* Secondary: */ 'S', 'V', 'H', 'O'," + " /* Primary or Secondary: */ 'K', 'U'," + " /* Join: */ 'J'," + " /* Hash: */ 'N')"
                        + (schema != null && schema.equals("") ? " and " + equalToUser("i.DatabaseName") : "")
                        + (schema != null && !schema.equals("") ? " and " + equalToLiteral("i.DatabaseName", schema) : "")
                        //+ " and " + equalToLiteral("i.TableName", table)
                        + (false ? " and i.UniqueFlag = 'Y'" : "")
                        + " order by TABLE_SCHEM, TABLE_NAME, NON_UNIQUE, \"TYPE\", INDEX_NAME, ORDINAL_POSITION, INDEX_QUALIFIER";


        try {
            Connection conn = jdbcDatasource.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql);
//        stmt.setString(1, schema == null ? "%" : schema);
            //stmt.closeOnCompletion();
            stmt.setFetchSize(FetchSize);

            ResultSet rs = stmt.executeQuery();

            //TODO 插件里获取不到TeraData 驱动连接，采用顶层接口 Connection
//            ((TDResultSet)rs).setFetchedRowsPostProcessor(new ConvertIndexInfoBooleanColumnValues());
//            TeraResultSetMetaData var9 = (TeraResultSetMetaData)rs.getMetaData();
//            var9.getColumnProperties(4).setColumnType(16, -1);
//            ((TDResultSet)rs).setMetadataRS(true);

            return rs;
        } catch (SQLException e) {
            logger.error("failed to get index ", e);
        }
        return null;
    }


    private String caseInsensitiveCompare(String var0, boolean var1, boolean var2, String var3) {
        if (var2) {
            var3 = "'" + var3.replaceFirst(" +$", "") + "'";
        }

        return var0 + " (not casespecific) " + (var1 ? "like" : "=") + " " + var3 + " (not casespecific)" + (var1 ? " escape '\\'" : "");
    }

    private String equalToUser(String var0) {
        return caseInsensitiveCompare(var0, false, false, "user");
    }

    private String equalToLiteral(String var0, String var1) {
        return caseInsensitiveCompare(var0, false, true, var1);
    }
}
