package com.datablau.security.management.ext.impl;

import com.datablau.security.management.impl.UserServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * @author nicky - 数语科技有限公司
 * date 2024/5/15 10:53
 */
@Service("userServiceExt")
public class UserServiceImplExt extends UserServiceImpl {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserServiceImplExt.class);
    @Override
    protected void initRole() throws Exception{
        LOGGER.info("in userServiceImplExt!!!");
        super.initRole();
    }

}
