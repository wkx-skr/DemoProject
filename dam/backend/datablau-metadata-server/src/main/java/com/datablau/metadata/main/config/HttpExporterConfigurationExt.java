package com.datablau.metadata.main.config;

import com.datablau.project.api.RemoteMetaDataExtendService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.remoting.httpinvoker.HttpInvokerServiceExporter;

@Configuration("httpExporterConfigurationExt")
public class HttpExporterConfigurationExt extends HttpExporterConfiguration{

    private static final Logger logger = LoggerFactory.getLogger(HttpExporterConfiguration.class);


    @Bean(
            name = {"/RemoteMetaDataExtendService"}
    )
    public HttpInvokerServiceExporter remoteMetaDataExtendServiceExporter(RemoteMetaDataExtendService remoteMetaDataExtendService) {
        HttpInvokerServiceExporter exporter = new HttpInvokerServiceExporter();
        exporter.setService(remoteMetaDataExtendService);
        exporter.setServiceInterface(RemoteMetaDataExtendService.class);
        logger.info("RemoteMetaDataExtendService using port httpInvoker");
        return exporter;
    }
}
