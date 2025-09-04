package com.datablau.base.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/test")
public class TestController extends BaseController {


    @Autowired
    private MessageService messageService;


    @GetMapping(value = "/")
    public String test() {
        return messageService.getMessage("duplicateSysAbbreviation");
    }

}
