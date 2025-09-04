package com.datablau.gateway.util;

import com.datablau.data.common.api.UserFullNameGetter;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.SimpleUserDto;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Lists;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.concurrent.TimeUnit;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/11 15:50
 */
public class UserFullNameGetterImpl implements UserFullNameGetter {

    @Autowired
    private UserService userService;

    private LoadingCache<String, String> usernameMap = CacheBuilder
        .newBuilder().expireAfterWrite(2, TimeUnit.MINUTES)
        .build(new CacheLoader<String, String>() {
            @Override
            public String load(String key) throws Exception {
                SimpleUserDto user = userService.getUsersByUsernames(Lists.newArrayList(key)).get(0);
                if (user != null) {
                    return user.getFirstName();
                } else {
                    return key;
                }
            }
        });

    @Override
    public String getFullName(String username) {
        return usernameMap.getUnchecked(username);
    }
}
