package com.datablau.datasources.oracle;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import org.springframework.util.CollectionUtils;

import java.lang.reflect.Field;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class OracleDatasource extends DatasourceJdbcBase {

    public OracleDatasource() {
        super("ORACLE");
    }

    public String getDriverTypeName() {
        return "oracle";
    }

    public UUID getUniqueId() {
        return UUID.fromString("F2B1C0D4-1E4E-4CE4-9C98-988191D63C55");
    }

    public void testConnection() throws ConnectionEstablishException {
        try (Connection c = getConnection()) {
            if (!c.isValid(1000)) {
                throw new ConnectionEstablishException("Unable to call isValid function on the connection");
            }
        } catch (Exception ex) {
            throw new ConnectionEstablishException("Unable to create the connection", ex);
        }
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        String baseSql = " FROM " + quoteName(schema) + "." + quoteName(table);
        if (countSql) {
            return " SELECT COUNT(*) " + baseSql;
        }

        if (page == null) {
            return "SELECT * " + baseSql;
        } else {
            Integer pageSize = page.getPageSize();
            Integer currentPage = page.getCurrentPage();

            int start = ((currentPage - 1) * pageSize);
            int end = start + pageSize;

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(quoteName(sort.getField()) + " " +
                            sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            baseSql = "SELECT * FROM "
                    + "(SELECT tt.*, ROWNUM AS rowno FROM "
                    + "( SELECT * " + baseSql + " ) tt WHERE ROWNUM <= " + (start + end) + " ) table_alias "
                    + "WHERE table_alias.rowno > " + start;

            return baseSql;
        }
    }

    @Override
    public String quoteName(String name) {
        return  name ;
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());

        if (db.startsWith("SID:")) {
            return String.format("jdbc:oracle:thin:@%s:%s:%s", host, port,
                    db.substring("SID:".length()));
        } else if (db.startsWith("Service Name:")) {
            return String.format("jdbc:oracle:thin:@//%s:%s/%s", host, port,
                    db.substring("Service Name:".length()));
        } else {
            throw new InvalidArgumentException("Oracle connection target must be starts with 'sid' or 'service name'");
        }
    }

    @Override
    protected boolean createConnection(String url, Properties props) throws Exception {
        props.put("remarksReporting", "false");
        props.put("includeSynonyms", "false");

        return super.createConnection(url, props);
//
//        boolean result = super.createConnection(url, props);
//
//        DatabaseMetaData dmd = getConnection().getMetaData();
//        int majorVer = dmd.getDatabaseMajorVersion();
//        int minorVer = dmd.getDatabaseMinorVersion();
//
//        if (majorVer == 9 && minorVer >= 2) {
//            for (Connection connection : connections) {
//                setFieldValue(connection, "minVcsBindSize", 4001);
//                setFieldValue(connection, "maxRawBytesSql", 2000);
//                setFieldValue(connection, "maxRawBytesPlsql", 32512);
//                setFieldValue(connection, "maxVcsCharsSql", 32766);
//                setFieldValue(connection, "maxVcsNCharsSql", 32766);
//                setFieldValue(connection, "maxVcsBytesPlsql", 32512);
//                setFieldValue(connection, "maxVcsBytesPlsqlOut", 32512);
//                setFieldValue(connection, "maxIbtVarcharElementLength", 32766);
//                setFieldValue(connection, "maxVarcharLength", 4000);
//                setFieldValue(connection, "maxNVarcharLength", 4000);
//                setFieldValue(connection, "maxRawLength", 4000);
//            }
//        } else if (majorVer <= 9 || (majorVer == 9 && minorVer < 2)) {
//            for (Connection connection : connections) {
//                setFieldValue(connection, "minVcsBindSize", 4001);
//                setFieldValue(connection, "maxRawBytesSql", 2000);
//                setFieldValue(connection, "maxRawBytesPlsql", 2000);
//                setFieldValue(connection, "maxVcsCharsSql", 4000);
//                setFieldValue(connection, "maxVcsNCharsSql", 4000);
//                setFieldValue(connection, "maxVcsBytesPlsql", 4000);
//                setFieldValue(connection, "maxVcsBytesPlsqlOut", 4000);
//                setFieldValue(connection, "maxIbtVarcharElementLength", 4000);
//                setFieldValue(connection, "maxVarcharLength", 4000);
//                setFieldValue(connection, "maxNVarcharLength", 4000);
//                setFieldValue(connection, "maxRawLength", 4000);
//            }
//        }
//
//        return result;
    }

    private void setFieldValue(Connection connection, String fieldName, Object value) throws NoSuchFieldException, IllegalAccessException {
        Field field = findField(connection.getClass(), fieldName);
        field.setAccessible(true);
        field.set(connection, value);
    }

    private Field findField(Class clazz, String fieldName) throws NoSuchFieldException {
        if (clazz.equals(Object.class)) {
            throw new NoSuchFieldException();
        } else {
            try {
                Field field = clazz.getDeclaredField(fieldName);
                return field;
            } catch (NoSuchFieldException nfe) {
                return findField(clazz.getSuperclass(), fieldName);
            }
        }
    }

    @Override
    public List<String> getSchemas() {
        List<String> schemas = new ArrayList<>();
        ResultSet rs = null;
        String curSchema = null;
        Collection<String> reserved = new ArrayList<String>(
                Arrays.asList("anonymous", "appqossys", "audsys", "ctxsys", "dbsfwuser",
                        "dbsnmp", "dip", "dvf", "dvsys", "ggsys", "gsmadmin_internal",
                        "gsmcatuser", "gsmrootuser", "gsmuser", "hr", "lbacsys", "mddata",
                        "mdsys", "ojvmsys", "olapsys", "oracle_ocm", "orddata",
                        "ordplugins", "ordsys", "outln", "remote_scheduler_agent",
                        "si_informtn_schema", "sys", "sys$umf", "sysbackup", "sysdg",
                        "syskm", "sysrac", "system", "wmsys", "xdb", "xs$null"));
        try {
            DatabaseMetaData dmd = getConnection().getMetaData();
            rs = dmd.getSchemas();
            while (rs.next()) {
                curSchema = rs.getString("TABLE_SCHEM");
                if (curSchema != null && !reserved.contains(curSchema.toLowerCase())) {
                    schemas.add(curSchema);
                }
            }

        } catch (SQLException e) {
            throw new UnexpectedStateException("Unable to get schemas:" + e.getMessage(), e);
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
            } catch (Exception e) {
            }

            close();
        }
        return schemas;
    }
}
