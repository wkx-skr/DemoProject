package com.datablau.datasources.hudiOnHiveSpark;

import com.datablau.datasources.hive.HiveDatasource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

/**
 * @author zhangKun - 数语科技有限公司
 * @date 2024/4/25 14:17
 **/
public class HudiOnHiveSparkDatasource extends HiveDatasource {

    private static final Logger logger = LoggerFactory.getLogger(HudiOnHiveSparkDatasource.class);

//    public HudiOnHiveSparkDatasource() {
//        super("HUDIONHIVESPARK");
//    }

    @Override
    public String getDriverTypeName() {
        return "Hive";
    }


    @Override
    public UUID getUniqueId() {
        return UUID.fromString("D3356B7F-D7A3-4C91-936B-8BCC0B4EEDD2");
    }
}
