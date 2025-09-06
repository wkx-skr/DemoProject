package com.datablau.dds.core.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/baseApi")
public class TestApiController {
    @RequestMapping(value = "/test333")
    public String test(){
        return  "test success！";
    }

}
