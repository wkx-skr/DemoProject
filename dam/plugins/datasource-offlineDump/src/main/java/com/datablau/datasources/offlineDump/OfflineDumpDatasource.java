package com.datablau.datasources.offlineDump;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.search.QueryPage;
import com.datablau.datasource.api.JdbcDatasource;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.datablau.datasources.mysql.MySqlDatasource;
import com.datablau.datasources.oracle.OracleDatasource;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class OfflineDumpDatasource extends DatasourceJdbcBase {
    private static final Logger logger = LoggerFactory.getLogger(OfflineDumpDatasource.class);

    private static String TablePattern = "DUMP_TABLES";

    private JdbcDatasource realDatasource;

    public OfflineDumpDatasource() {
        super("OFFLINEDUMP");
    }

    private JdbcDatasource getRealDatasource() {
        if (realDatasource == null) {
            try {
                DatasourceProperties realProp = new DatasourceProperties(getProperties());
                realProp.setType(getProperties().getParameter(
                        DatasourceKnownParameterType.OfflineDumpSourceDriverType.toString()));
                realDatasource = (JdbcDatasource) getDatasourceManager().getDatasource(realProp);
            } catch (Exception e) {
                throw new UnexpectedStateException("offline dump get real datasource failed", e);
            }
        }
        return realDatasource;
    }

    public String getDriverTypeName() {
        return getRealDatasource().getDriverTypeName();
    }

    public UUID getUniqueId() {
        return UUID.fromString("2A659B75-E1E0-4D17-8CF1-DDE98420B7F6");
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    public void testConnection() throws ConnectionEstablishException {
        getRealDatasource().testConnection();
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        return getRealDatasource().getTableSampleSql(schema, table, page, countSql);
    }

    @Override
    public Connection getConnection() {
        return getRealDatasource().getConnection();
    }

    @Override
    public List<Connection> getConnections(int size) {
        return getRealDatasource().getConnections(size);
    }

    @Override
    public List<String> getDatabases() {
        if (Strings.isNullOrEmpty(getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString()))) {
            return getRealDatasource().getDatabases();
        } else {
            return getTables();
        }
    }

    @Override
    public List<String> getSchemas() {
        if (Strings.isNullOrEmpty(getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpTargetDBName.toString()))
                && Strings.isNullOrEmpty(getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpTargetSchemaName.toString()))) {
            return getRealDatasource().getSchemas();
        } else {
            return getTables();
        }
    }

    @Override
    public String getUrl() {
        if (getRealDatasource() instanceof MySqlDatasource) {
            return ((MySqlDatasource) getRealDatasource()).getUrl();
        } else if (getRealDatasource() instanceof OracleDatasource) {
            return ((OracleDatasource) getRealDatasource()).getUrl();
        }
        return null;
    }

    public String getRealSchema() {
        return getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpTargetSchemaName.toString());
    }

    private ResultSet readDumpInfoResultSet() throws Exception {
        String schema = getRealSchema();
        String dumpDb = getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpTargetDBName.toString());

        logger.info("schema is : " + schema);
        logger.info("dumpDb is : " + dumpDb);

        String sql = "";
        if (Strings.isNullOrEmpty(dumpDb)) {
            sql = "select DISTINCT DATABASE_INFO from "
                    + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + TablePattern;
        } else {
            sql = "select DISTINCT TABLE_SCHEM from "
                    + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + TablePattern
                    + " where DATABASE_INFO = '" + dumpDb + "'";
        }

        PreparedStatement stmt = getRealDatasource().getConnection().prepareStatement(sql);

        return stmt.executeQuery();
    }

    public List<String> getTables() {
        List<String> res = new ArrayList<>();
        try {
            try (ResultSet rs = readDumpInfoResultSet()) {
                logger.info("Get resultset from metadata with schema " + getRealSchema());
                while (rs.next()) {
                    res.add(rs.getString(1));
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get tables", e);
        }
        return res;

    }
}
