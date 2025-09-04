package com.datablau.datasources.customized;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.datablau.datasource.util.DataAccessCustomDriverManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.SQLException;
import java.util.Properties;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: CustomizedDatasource
 * @author: wang tong
 * @create: 2023-08-23 14:06
 **/
public class CustomizedDatasource extends DatasourceJdbcBase {

    private static final Logger logger = LoggerFactory.getLogger(CustomizedDatasource.class);

    private Driver driver;

    public CustomizedDatasource() {
        super("CUSTOMIZED");
    }




    @Override
    public String getDriverTypeName() {
        return "Customized";
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        return null;
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("1dc4a288-3cf9-4b6d-aafd-7fb587b5a59c");
    }

    @Override
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
    protected boolean createConnection(String url, Properties props) throws Exception {
        try {
            if (getProperties().getDriverId() != null) {
                DataAccessCustomDriverManager dataAccessCustomDriverManager = BeanHelper.getBean(DataAccessCustomDriverManager.class);
                Driver driver = dataAccessCustomDriverManager.getDriver(getProperties().getDriverId());
                if (driver != null) {
                    setDriver(driver);
                }
            }
            logger.info("driver is loaded from jar:" + driver.getClass().getProtectionDomain().getCodeSource().getLocation().toString());
            addConnection(driver.connect(url, props));
        } catch (SQLException e) {
            logger.error("Connection Failed! Check output console", e);
            throw e;
        }
        return true;
    }

    public void setDriver(Driver customizedDriver) {
        this.driver = customizedDriver;
    }
}
