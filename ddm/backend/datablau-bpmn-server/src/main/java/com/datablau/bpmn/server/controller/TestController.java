package com.datablau.bpmn.server.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("test")
public class TestController {

    @RequestMapping("hello")
    public String test(){
        return "Hello BPMN";
    }

}
