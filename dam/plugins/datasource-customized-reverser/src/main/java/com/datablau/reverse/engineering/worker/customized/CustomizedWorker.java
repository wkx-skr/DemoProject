package com.datablau.reverse.engineering.worker.customized;

import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;

/**
 * @program: datablau-datasource-plugins
 * @description: CustomizedWorker
 * @author: wang tong
 * @create: 2023-08-23 15:06
 **/
public class CustomizedWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {
    @Override
    public String getType() {
        return "CUSTOMIZED";
    }


}
