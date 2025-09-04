package com.datablau.reverse.engineering.worker.sqlserver;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.datasource.data.ConnectType;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @program: datablau-datasource-plugins
 * @description: SqlServerWorker
 * @author: wang tong
 * @create: 2023-08-21 15:02
 **/
public class SqlServerWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(SqlServerWorker.class);

    @Override
    public String getType() {
        return "SQLSERVER";
    }

    @Override
    public void postExecution() {
        setDatabaseVersion();
    }


    protected void setDatabaseVersion() {
        try {
            if (datasource.getProperties().getConnectType() == ConnectType.JDBC) {
                String version = "";//getSingleConnection(0).getMetaData().getDatabaseProductVersion();
                int majar = getDatabaseMetadata().getJDBCMajorVersion();
                ;
                switch (majar) {
                    case 9:
                        version = "SQL Server 2005";
                        break;
                    case 10:
                        version = "SQL Server 2008";
                        break;
                    case 11:
                        version = "SQL Server 2012";
                        break;
                    case 12:
                        version = "SQL Server 2014";
                        break;
                    case 13:
                        version = "SQL Server 2016";
                        break;
                    case 14:
                        version = "SQL Server 2016";
                        break;
                    case 15:
                        version = "SQL Server 2019";
                    default:
                        break;
                }

                if (!Strings.isNullOrEmpty(version)) {
                    version += "(" + jdbcDatasource.getConnection().getMetaData().getDatabaseProductVersion() + ")";
                } else {
                    version += jdbcDatasource.getConnection().getMetaData().getDatabaseProductVersion();
                }

                datasource.getProperties().getParameterMap().put(DatasourceKnownParameterType.DBVersion.toString(), version);
            }
        } catch (Exception e) {
            logger.error("Failed to get database version", e);
        }
    }


    /**
     *
     */
    public String getSQL(String schema) {

//        return String.format("SELECT objname, cast(value as varchar(8000)) as value "
//                + "FROM fn_listextendedproperty ('MS_DESCRIPTION', 'schema', '%s', 'table', null, null, null)", schema);
        return String.format("SELECT \n" +
                "        obj.name AS objname ,\n" +
                "        ISNULL(epTwo.[value], '') AS value \n" +
                "FROM    dbo.syscolumns col\n" +
                "        LEFT  JOIN dbo.systypes t ON col.xtype = t.xusertype\n" +
                "        inner JOIN dbo.sysobjects obj ON col.id = obj.id\n" +
                "                                         AND obj.xtype = 'U'\n" +
                "                                         AND obj.status >= 0\n" +
                "        LEFT  JOIN dbo.syscomments comm ON col.cdefault = comm.id\n" +
                "        LEFT  JOIN sys.extended_properties ep ON col.id = ep.major_id\n" +
                "                                                      AND col.colid = ep.minor_id\n" +
                "                                                      AND ep.name = 'MS_Description'\n" +
                "        LEFT  JOIN sys.extended_properties epTwo ON obj.id = epTwo.major_id\n" +
                "                                                         AND epTwo.minor_id = 0\n" +
                "                                                         AND epTwo.name = 'MS_Description'\n" +
                "              LEFT OUTER JOIN sys.tables s ON obj.id = s.object_id\n" +
                "              LEFT OUTER JOIN sys.schemas tt ON tt.schema_id = s.schema_id\n" +
                "WHERE   1=1\n" +
                "and tt.Name ='%s'\n" +
                "ORDER BY obj.name,col.colorder ", schema);
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

    @Override
    public String generateFullDataType(ResultSet columnResultSet, String datatype, Integer scale, Integer precision) {

        String colDataType = datatype;

        if (datatype.compareToIgnoreCase("BIGINT") == 0
                || datatype.compareToIgnoreCase("BIT") == 0
                || datatype.compareToIgnoreCase("DATE") == 0
                || datatype.compareToIgnoreCase("DATETIME") == 0
                || datatype.compareToIgnoreCase("FLOAT") == 0
                || datatype.compareToIgnoreCase("GEOGRAPHY") == 0
                || datatype.compareToIgnoreCase("GEOMETRY") == 0
                || datatype.compareToIgnoreCase("HIERARCHYID") == 0
                || datatype.compareToIgnoreCase("IMAGE") == 0
                || datatype.compareToIgnoreCase("INT") == 0
                || datatype.compareToIgnoreCase("MONEY") == 0
                || datatype.compareToIgnoreCase("NTEXT") == 0
                || datatype.compareToIgnoreCase("REAL") == 0
                || datatype.compareToIgnoreCase("SMALLDATETIME") == 0
                || datatype.compareToIgnoreCase("SMALLINT") == 0
                || datatype.compareToIgnoreCase("SMALLMONEY") == 0
                || datatype.compareToIgnoreCase("SQL_VARIANT") == 0
                || datatype.compareToIgnoreCase("TEXT") == 0
                || datatype.compareToIgnoreCase("TIMESTAMP") == 0
                || datatype.compareToIgnoreCase("TINYINT") == 0
                || datatype.compareToIgnoreCase("UNIQUEIDENTIFIER") == 0
                || datatype.compareToIgnoreCase("XML") == 0) {
            // no scale & precision
        } else if (datatype.compareToIgnoreCase("VARCHAR") == 0
                || datatype.compareToIgnoreCase("VARBINARY") == 0) {
            if (scale > 8000) {
                colDataType += "(MAX)";
            } else {
                colDataType += "(" + scale + ")";
            }
        } else if (datatype.compareToIgnoreCase("NVARCHAR") == 0) {
            if (scale > 4000) {
                colDataType += "(MAX)";
            } else {
                colDataType += "(" + scale + ")";
            }
        } else if (datatype.compareToIgnoreCase("DATETIME2") == 0) {
            if (precision > -1) {
                colDataType += "(" + precision + ")";
            }
        } else if (datatype.contains(" IDENTITY")) {
            colDataType = colDataType.replace(" IDENTITY", "");
        } else if (datatype.compareToIgnoreCase("DECIMAL") == 0
                || datatype.compareToIgnoreCase("VARBINARY") == 0) {
            colDataType += "(" + scale + "," + precision + ")";
        } else {
            colDataType += "(" + scale;
            colDataType += ")";
        }

        return colDataType;
    }


    @Override
    public String getViewSqlOfView(String catalog, String schema, String viewName) {
        try {
            logger.debug("try to get SQLServer view sql");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "select definition from sys.objects o join sys.sql_modules m on m.object_id = o.object_id"
                        + " where o.object_id = object_id('" + schema + "." + viewName + "') and o.type = 'V'";
                logger.debug(query);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String value = results.getString(1);
                        if (!Strings.isNullOrEmpty(value)) {
                            // replace \n to \r\n , so we can show it in client correctly
                            //value = value.replaceAll("\n", "\r\n");
                            return value;
                        }
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Failed to get SQLServer view sql", e);
        }
        return null;
    }


    @Override
    protected void buildProcedures(ModelX model, String catalog) {
        logger.debug("Building Procedures...");
        try {
            for (String s_schema : schemaPattern) {
                this.readProcedures(model, s_schema, catalog);
            }
            logger.debug("Finished building Procedures");
        } catch (Exception e) {
            logger.error("Failed to build Procedures", e);
        }
    }

    protected void readProcedures(ModelX modelX, String s_schema, String catalog) throws Exception {
        try {
            logger.trace("try to get ss Procedures");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "select o.name, SCHEMA_NAME(o.schema_id) as schema_name, m.definition  from sys.objects o join sys.sql_modules m on m.object_id = o.object_id "
                        + " where o.type = 'P' " + (s_schema.equals("%") ? "" : "and o.schema_id = schema_id('" + s_schema + "')")
                        + " order by o.schema_id, name";

                stmt.setFetchSize(10000);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String schema = results.getString("SCHEMA_NAME");
                        String name = results.getString("NAME");
                        if (options.isInBlackList(name, LDMTypes.oStoredProcedure)) {
                            logger.debug("SP '" + name + "' is in the black list");
                            continue;
                        }

                        String text = results.getString("definition");

                        // create new sp
                        ObjectX newSp = createStoredProcedure(modelX);
                        ReversedSchema reversedSchema = getOrCreateSchema(modelX, schema);
                        setSchemaInfoToObject(reversedSchema, newSp);
                        newSp.setName(name);
                        if (!Strings.isNullOrEmpty(text)) {
                            newSp.setProperty(LDMTypes.pSQL, text);
                        }
                        newSp.setObjectIsFullyCreated();
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Failed to get ss SQL", e);
        }
    }


    @Override
    protected void buildFunctions(ModelX model, String catalog) {
        logger.debug("Building Functions...");
        try {
            for (String s_schema : schemaPattern) {
                readFunctions(model, s_schema, catalog);
            }
            logger.debug("Finished building Functions");
        } catch (Exception e) {
            logger.error("Failed to build Functions", e);
        }
    }

    private void readFunctions(ModelX modelX, String s_schema, String catalog) {
        try {
            logger.trace("try to get ss Functions");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

                String query = "select o.name, SCHEMA_NAME(o.schema_id) as schema_name, m.definition  from sys.objects o join sys.sql_modules m on m.object_id = o.object_id "
                        + " where type_desc LIKE '%FUNCTION%' " + (s_schema.equals("%") ? "" : "and o.schema_id = schema_id('" + s_schema + "')")
                        + " order by o.schema_id, name";

                stmt.setFetchSize(10000);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String schema = results.getString("SCHEMA_NAME");
                        String name = results.getString("NAME");
                        if (options.isInBlackList(name, LDMTypes.oFunction)) {
                            logger.debug("Function '" + name + "' is in the black list");
                            continue;
                        }

                        String text = results.getString("definition");

                        // create new func
                        ObjectX newSp = createFunction(modelX);
                        ReversedSchema reversedSchema = getOrCreateSchema(modelX, schema);
                        setSchemaInfoToObject(reversedSchema, newSp);
                        newSp.setName(name);
                        if (!Strings.isNullOrEmpty(text)) {
                            newSp.setProperty(LDMTypes.pSQL, text);
                        }
                        newSp.setObjectIsFullyCreated();
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Failed to get Functions SQL", e);
        }
    }

    protected void readColumnComments(String catalog, String schema) throws Exception {
        ReversedSchema reversedSchema = schemaMap.get(schema);
        if (reversedSchema == null) {
            return;
        }
        for (ReversedTable table : reversedSchema.getAllTables()) {
            readTableExtendProperty(table);
        }
    }


    protected void readTableExtendProperty(ReversedTable table) {
        String s_schema = table.getSchema();

        if (s_schema == null)
            return;

        // has to read column comment as below...   stupid SQLServer !!


        String sql = "SELECT \n" +
                "        col.name AS objname ,\n" +
                "        ISNULL(ep.[value], '') AS value \n" +
                "FROM    dbo.syscolumns col\n" +
                "        LEFT  JOIN dbo.systypes t ON col.xtype = t.xusertype\n" +
                "        inner JOIN dbo.sysobjects obj ON col.id = obj.id\n" +
                "                                         AND obj.xtype = 'U'\n" +
                "                                         AND obj.status >= 0\n" +
                "        LEFT  JOIN dbo.syscomments comm ON col.cdefault = comm.id\n" +
                "        LEFT  JOIN sys.extended_properties ep ON col.id = ep.major_id\n" +
                "                                                      AND col.colid = ep.minor_id\n" +
                "                                                      AND ep.name = 'MS_Description'\n" +
                "        LEFT  JOIN sys.extended_properties epTwo ON obj.id = epTwo.major_id\n" +
                "                                                         AND epTwo.minor_id = 0\n" +
                "                                                         AND epTwo.name = 'MS_Description'\n" +
                "              LEFT OUTER JOIN sys.tables s ON obj.id = s.object_id\n" +
                "              LEFT OUTER JOIN sys.schemas tt ON tt.schema_id = s.schema_id\n" +
                "WHERE   1=1\n" +
                "and tt.Name ='" + s_schema + "'\n" +
                " and ep.value <>'' " +
                "AND obj.name = '" + table.getName() + "' --表名\n" +
                "ORDER BY obj.name,col.colorder ";


        try (Statement stmt = jdbcDatasource.getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                checkStopSign();
                String name = rs.getString(1);
                String comment = rs.getString(2);
                if (!Strings.isNullOrEmpty(name) && !Strings.isNullOrEmpty(comment)) {
                    table.addColumnComment(name, comment);
                }
            }

        } catch (Exception e) {
            logger.error("Failed to retrieve table extend info", e);
        }


    }


    @Override
    protected void buildTablesOfSchema(ModelX model, String catalog, String schema)
            throws Exception {
        checkStopSign();

        logger.info("reading table metadata of schema \'" + schema + "\' ...");

        if (options.getSelectedTableNamePatterns().isEmpty()) {
            ResultSet rs = getTablesOfSchema(catalog, schema, "%");

            if (rs == null) {
                rs = getDatabaseMetadata().getTables(catalog, schema, "%",
                                new String[]{"TABLE"});
            }
            readTables(model, catalog, schema,
                    Lists.newArrayList(rs));
        } else {
            for (String tableNamePattern : options.getSelectedTableNamePatterns()) {
                ResultSet rs = getTablesOfSchema(catalog, schema,
                        jdbcDatasource.quoteName(tableNamePattern));

                if (rs == null) {
                    rs = getDatabaseMetadata()
                            .getTables(catalog, schema, tableNamePattern,
                                    new String[]{"TABLE"});
                }

                readTables(model, catalog, schema,
                        Lists.newArrayList(rs));
            }
        }
    }

    @Override
    protected void buildViewsOfSchema(ModelX model, String catalog, String schema)
            throws Exception {
        checkStopSign();
        logger.info("reading view metadata of schema \'" + schema + "\' ...");
        if (options.getSelectedTableNamePatterns().isEmpty()) {
            ResultSet rs = getViewsOfSchema(catalog, schema, "%");

            if (rs == null) {
                rs = getDatabaseMetadata().getTables(catalog, schema, "%",
                                new String[]{"VIEW"});
            }
            readViews(model, catalog, schema, Lists.newArrayList(rs));
        } else {
            for (String tableNamePattern : options.getSelectedTableNamePatterns()) {
                ResultSet rs = getViewsOfSchema(catalog, schema,
                        jdbcDatasource.quoteName(tableNamePattern));

                if (rs == null) {
                    rs = getDatabaseMetadata()
                            .getTables(catalog, schema, jdbcDatasource.quoteName(tableNamePattern),
                                    new String[]{"VIEW"});
                }
                readViews(model, catalog, schema, Lists.newArrayList(rs));
            }
        }
    }

}
