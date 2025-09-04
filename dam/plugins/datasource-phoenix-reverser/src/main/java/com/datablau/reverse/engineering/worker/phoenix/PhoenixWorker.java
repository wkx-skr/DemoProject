package com.datablau.reverse.engineering.worker.phoenix;

import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;

/**
 * @program: datablau-datasource-plugins
 * @description: PhoenixWorker
 * @author: wang tong
 * @create: 2023-08-07 17:07
 **/
public class PhoenixWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {
    @Override
    public String getType() {
        return "PHOENIX";
    }

}
