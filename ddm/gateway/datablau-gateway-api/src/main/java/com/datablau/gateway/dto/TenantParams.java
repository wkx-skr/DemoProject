package com.datablau.gateway.dto;

import com.andorj.model.common.utility.RootBeanHelper;
import org.apache.commons.lang.StringUtils;
import org.springframework.core.env.Environment;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/7/9
 */
public class TenantParams {

    public static final String TENANT_HEADER_ID = "x-tenant-id";

    public static String DEFAULT_TENANT = "";

    public static final String TENANT_ID = "tenantId";


    static {
        Environment environment = RootBeanHelper.getBean(Environment.class);

        //先判断是开启多租户，如果未开启，初始化值为空
        String enableStr = environment.getProperty("datablau.multitenant.connectable", "false");
        Boolean enable = Boolean.valueOf(enableStr);
        if (enable) {
            String property = environment.getProperty("datablau.multitenant.defaultTenant");
            if (!StringUtils.isBlank(property)) {
                DEFAULT_TENANT = property;
            }
        }

    }

}
