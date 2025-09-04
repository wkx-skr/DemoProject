package com.datablau.datasources.iceberg;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.datablau.datasources.hive.HiveDatasource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: hive
 * @author: wang tong
 * @create: 2023-05-09 14:08
 **/
public class IcebergOnHiveSparkDatasource extends HiveDatasource {

    private static final Logger logger = LoggerFactory.getLogger(IcebergOnHiveSparkDatasource.class);
    public IcebergOnHiveSparkDatasource() {
        super("ICEBERGONHIVESPARK");
    }

    public IcebergOnHiveSparkDatasource(String type) {
        super(type);
    }

    @Override
    public String getDriverTypeName() {
        return "ICEBERGONHIVESPARK";
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("68D97736-E3BC-4566-A61C-B012AB796AB1");
    }

}
