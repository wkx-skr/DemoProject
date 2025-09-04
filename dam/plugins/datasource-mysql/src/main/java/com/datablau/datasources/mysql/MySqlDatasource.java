package com.datablau.datasources.mysql;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.google.common.base.Strings;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class MySqlDatasource extends DatasourceJdbcBase {
    private static final Logger logger = LoggerFactory.getLogger(MySqlDatasource.class);

    private Thread keepAlivedThread;
    private AtomicBoolean quitKeepAlived = new AtomicBoolean(false);

    public MySqlDatasource() {
        super("MYSQL");
    }

    public String getDriverTypeName() {
        return "mysql";
    }

    public UUID getUniqueId() {
        return UUID.fromString("0F691FA0-3FD7-42F1-B868-051B0FFAD10C");
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

        baseSql =  " SELECT * " + baseSql;

        if (page == null) {
            return baseSql;
        } else {
            Integer pageSize = page.getPageSize();
            Integer currentPage = page.getCurrentPage();

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(quoteName(sort.getField()) + " " +
                        sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return baseSql + " LIMIT " + ((currentPage - 1) * pageSize) + " , " + pageSize;
        }
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String timeZone = getProperties().getParameterMap().getOrDefault(DatasourceKnownParameterType.TimeZone.name(), "&serverTimezone=CST");
        if (db == null) {
            db = "information_schema";
        }else {
            db = db.trim().split(";")[0];
        }
        String bitSet = "?useUnicode=true&characterEncoding=UTF-8&tinyInt1isBit=false&verifyServerCertificate=false&useSSL=true&getProceduresReturnsFunctions=false" + timeZone;
        String url = String
            .format("jdbc:%s://%s:%s/%s%s", "mysql", host, port, db, bitSet);
        return url;
    }

    @Override
    public List<String> getDatabases() {
        List<String> res = super.getDatabases();
        Collection<String> reserved = new ArrayList<String>(
                Arrays.asList("information_schema", "performance_schema", "mysql"));
        res.removeAll(reserved);
        return res;
    }

    @Override
    protected boolean connect() throws Exception {
        boolean connect = super.connect();

        executeSessionKeepAliveThread();

        return connect;
    }

    private synchronized void executeSessionKeepAliveThread() {
        try {
            init();
        } catch (Exception e) {
            logger.error("execute keep alive sql failed : " + e.getMessage(), e);
        }
    }

    private void init() {
        if (keepAlivedThread == null) {
            logger.info("creating keepalived thread for datasource ");
            keepAlivedThread = new Thread(()->{
                while(!quitKeepAlived.get()) {
                    try {
                        Thread.sleep(5 * 1000);
                    } catch (InterruptedException ie) {
                        break;
                    }
                    List<Connection> toBeKeepAliveConnections = new ArrayList<>();
                    toBeKeepAliveConnections.addAll(connections);
                    toBeKeepAliveConnections.addAll(borrowedConnections.keySet());
                    toBeKeepAliveConnections.addAll(borrowedConnections.values());
                    logger.debug("connection size [{}], borrowed connection size [{}]", connections.size(), borrowedConnections.size());
                    for (Connection connection : toBeKeepAliveConnections) {
                        try {
                            if (connection == null || connection.isClosed()) {
                                continue;
                            } else {
                                try(Statement stmt = connection.createStatement()) {
                                    logger.debug("execute keep alive sql");
                                    stmt.execute(getKeepAliveSql());
                                } catch (Throwable se) {
                                    logger.warn("connection has problem:" + se.getMessage());
                                }
                            }
                        } catch (SQLException se) {
                            logger.info("connection is closed");
                        }
                    }
//                log.info(connections.size() + " all checked...");
                }
                logger.info("kill keep alive thread for datasource ");
            }, "KAT");
            keepAlivedThread.setDaemon(true);
            keepAlivedThread.start();
        }
    }

    private String getKeepAliveSql () {
        return "select CURRENT_DATE;";
    }

    @Override
    public void close() {
        logger.info("close connection");
        this.quitKeepAlived.set(true);
        super.close();
    }

    @Override
    public Connection getConnection() {
        logger.info("mysql get connection 222");
        Connection c = borrowConnection();
        if (isConnectionValid(c)) {
            return c;
        }

        for (Connection connection : borrowedConnections.values()) {
            try {
                connection.close();
            } catch (Exception ex) {
                logger.warn("unable to return connection:" + ex.getMessage(), ex);
            }
        }
        logger.info("closed " + borrowedConnections.size() + " borrowedConnections");

        for (Connection connection : connections) {
            try {
                connection.close();
            } catch (Exception ex) {
                logger.warn("unable to close connection:" + ex.getMessage(), ex);
            }
        }

        logger.info("closed " + connections.size() + " connections");

        super.connections.clear();
        super.borrowedConnections.clear();

        return borrowConnection();
    }

    public boolean isConnectionValid(Connection connection) {
        String query = "SELECT 1";
        try (PreparedStatement stmt = connection.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            return true; // Should always return true for "SELECT 1"
        } catch (Throwable e) {
            // Handle exception, typically log and return false
            logger.error(e.getMessage(), e);
            return false;
        }
    }
}
