package com.datablau.reverse.engineering.worker.db2i;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.ResultSet;
import java.sql.Statement;

/**
 * @program: datablau-datasource-plugins
 * @description: DB2iWorker
 * @author: wang tong
 * @create: 2023-08-24 15:00
 **/
public class DB2iWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(DB2iWorker.class);

    @Override
    public String getType() {
        return "DB2I";
    }

    @Override
    public String generateFullDataType(ResultSet columnResultSet, String datatype, Integer precision, Integer scale) {
        String colDataType = datatype;

        if (datatype.equals("INTEGER")
                || datatype.equals("SMALLINT")
                || datatype.equals("BIGINT")
                || datatype.equals("REAL")
                || datatype.equals("DOUBLE")
                || datatype.equals("DECFLOAT")
                || datatype.equals("CLOB")
                || datatype.equals("NCLOB")
                || datatype.equals("XML")
                || datatype.equals("LONG VARCHAR")
                || datatype.equals("LONG VARGRAPHIC")
                || datatype.equals("DATE")
                || datatype.equals("TIME")
                || datatype.equals("TIMESTAMP")
        ) {
            // no scale & precision
        } else if (scale > 0) {
            colDataType += "(" + scale;

            if (precision > 0) {
                colDataType += "," + precision;
            }

            colDataType += ")";
        }

        return colDataType;
    }

    protected String getSQLforReadViewSQL() {
        return "select TABLE_NAME as VIEWNAME, t.VIEW_DEFINITION as TEXT\n" +
                "from QSYS2.SYSVIEWS t\n" +
                "where t.TABLE_SCHEMA = '%s'";
    }

    @Override
    protected void readEntireViewSQL(String catalog, String schema, ReversedSchema reversedSchema, ResultSet viewSqlResultSet) throws Exception {
        try {
            logger.debug("try to get DB2i view sql");

            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = getSQLforReadViewSQL();
                query = String.format(query, schema);
                logger.debug(query);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String viewname = results.getString("VIEWNAME");
                        ReversedTable view = reversedSchema.lookForTable(viewname);
                        if (view == null)
                            return;

                        String viewsql = results.getString("TEXT");
                        if (!Strings.isNullOrEmpty(viewsql)) {
                            view.getTableX().setProperty(LDMTypes.pSQL, viewsql);
                        }
                        if (options.needToPersis()) {
                            view.getTableX().setObjectIsFullyCreated();
                            view.clearObjectX();
                        }
                        processSave();
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Failed to get DB2i view sql", e);
        }
    }

    protected String getSQLforReadProcedures(String schema) {
        return "select ROUTINE_SCHEMA as PROCSCHEMA, ROUTINE_NAME as PROCNAME, ROUTINE_DEFINITION as TEXT, LONG_COMMENT as REMARKS " +
                "from QSYS2.SYSPROCS "
                + (schema.equals("%") ? "" : "where ROUTINE_SCHEMA = '" + schema + "'")
                + " order by ROUTINE_SCHEMA, ROUTINE_NAME";
    }


    @Override
    protected void readProcedures(ModelX model, String catalog, String s_schema, ResultSet procedureResultSet) throws Exception {
        try {
            logger.trace("try to get db2i Procedures");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

                String query = getSQLforReadProcedures(s_schema);

                stmt.setFetchSize(10000);

                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String schema = results.getString("PROCSCHEMA").trim();
                        String name = results.getString("PROCNAME").trim();
                        if (options.isInBlackList(name, LDMTypes.oStoredProcedure)) {
                            logger.debug("SP '" + name + "' is in the black list");
                            continue;
                        }
                        String text = results.getString("TEXT");

                        // create new sp
                        ObjectX newSp = createStoredProcedure(model);
                        ReversedSchema reversedSchema = getOrCreateSchema(model, schema);
                        setSchemaInfoToObject(reversedSchema, newSp);
                        newSp.setName(name);
                        if (!Strings.isNullOrEmpty(text)) {
                            newSp.setProperty(LDMTypes.pSQL, text);
                        }

                        String def = results.getString("REMARKS");
                        if (!Strings.isNullOrEmpty(def)) {
                            setCommentToObject(newSp, def);
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get db2i sp SQL", e);
        }
    }

    protected String getSQLforReadFunctions(String schema) {
        return "select ROUTINE_SCHEMA as FUNCSCHEMA, ROUTINE_NAME as FUNCNAME, ROUTINE_DEFINITION as BODY, LONG_COMMENT as REMARKS " +
                "from QSYS2.SYSFUNCS "
                + (schema.equals("%") ? "" : "where ROUTINE_SCHEMA = '" + schema + "'")
                + " order by FUNCSCHEMA, FUNCNAME";
    }

    @Override
    protected void readFunctions(ModelX model, String catalog, String s_schema, ResultSet functionResultSet) throws Exception {
        try {
            logger.trace("try to get db2i Functions");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

                String query = getSQLforReadFunctions(s_schema);
                stmt.setFetchSize(10000);

                try (ResultSet rs = stmt.executeQuery(query)) {
                    while (rs.next()) {
                        String schema = rs.getString("FUNCSCHEMA").trim();
                        String name = rs.getString("FUNCNAME").trim();
                        if (options.isInBlackList(name, LDMTypes.oFunction)) {
                            logger.debug("Function '" + name + "' is in the black list");
                            continue;
                        }
                        String text = rs.getString("BODY");

                        // create new function
                        ObjectX newFun = createFunction(model);
                        ReversedSchema reversedSchema = getOrCreateSchema(model, schema);
                        setSchemaInfoToObject(reversedSchema, newFun);
                        newFun.setName(name);
                        if (!Strings.isNullOrEmpty(text)) {
                            newFun.setProperty(LDMTypes.pSQL, text);
                        }

                        String def = rs.getString("REMARKS");
                        if (!Strings.isNullOrEmpty(def)) {
                            setCommentToObject(newFun, def);
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get db2i Function SQL", e);
        }
    }
}
