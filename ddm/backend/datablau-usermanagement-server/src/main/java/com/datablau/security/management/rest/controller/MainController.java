package com.datablau.security.management.rest.controller;

import com.datablau.data.common.util.NacosConfigReader;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Currently, controllers are created for testing, service call should via rmi invocation
 *
 * @author Nicky - 数语科技有限公司
 * date 2020/9/22 10:15
 */
@RestController
@RequestMapping("/main")
public class MainController {

    @Autowired
    private NacosConfigReader nacosConfigReader;

    @RequestMapping("/hello")
    public String echoHello(HttpServletRequest request) {
        return "hello " + request.getRemoteUser();
    }

    @PostMapping("/editionInfos")
    public Map<String, Object> getEditionInfo(){
        return nacosConfigReader.getEditionInfos();
    }
}
