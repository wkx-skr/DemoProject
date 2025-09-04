package com.datablau.reverse.engineering.worker.hudiOnHiveSpark;

import com.datablau.reverse.engineering.worker.hive.HiveWorker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @Author zhangKun - 北京数语科技有限公司
 * @Date 2024/4/25 14:17
 */
public class HudiOnHiveSparkWorker extends HiveWorker {

    private static final Logger logger = LoggerFactory.getLogger(HudiOnHiveSparkWorker.class);

    @Override
    public String getType() {
        return "HUDIONHIVESPARK";
    }
}
