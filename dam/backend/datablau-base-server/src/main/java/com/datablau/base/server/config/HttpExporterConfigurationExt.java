package com.datablau.base.server.config;

import com.andorj.cloud.service.LogFileReader;
import com.datablau.project.api.RemoteBaseExtendService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.remoting.httpinvoker.HttpInvokerServiceExporter;
import org.springframework.stereotype.Service;

@Service("httpExporterConfigurationExt")
public class HttpExporterConfigurationExt extends HttpExporterConfiguration {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpExporterConfigurationExt.class);

    @Bean(
            name = {"/RemoteBaseExtendService"}
    )
    public HttpInvokerServiceExporter remoteBaseExtendServiceExporter(RemoteBaseExtendService remoteBaseExtendService) {
        HttpInvokerServiceExporter exporter = new HttpInvokerServiceExporter();
        exporter.setService(remoteBaseExtendService);
        exporter.setServiceInterface(RemoteBaseExtendService.class);
        LOGGER.info("RemoteBaseExtendService using port httpInvoker");
        return exporter;
    }
}
