package com.datablau.ddd.server.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;

@RestController
public class ReadynessCheckController {

    @Operation(summary = "探活API", description = "探活API")
    @GetMapping("/isalive")
    public String echoHello() throws UnknownHostException {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = new Date(System.currentTimeMillis());
        InetAddress local = InetAddress.getLocalHost();
        return "ok " + local.getHostName() + " " + local.getHostAddress() + " " + formatter.format(date);
    }

}
