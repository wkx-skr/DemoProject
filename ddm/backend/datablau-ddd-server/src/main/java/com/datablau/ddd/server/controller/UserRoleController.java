package com.datablau.ddd.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.security.management.api.UserService;

@RestController
public class UserRoleController {

    @Autowired
    UserService userService;

    @GetMapping("/user")
    public String echoHello() {
        return null;
    }
}
