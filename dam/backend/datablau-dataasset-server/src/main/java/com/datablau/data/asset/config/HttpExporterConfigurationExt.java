package com.datablau.data.asset.config;

import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.remoting.httpinvoker.HttpInvokerServiceExporter;

/**
 * @author: hxs
 * @date: 2025/4/7 17:58
 */

@Configuration("httpExporterConfigurationExt")
public class HttpExporterConfigurationExt extends HttpExporterConfiguration {
    private static final Logger LOGGER = LoggerFactory.getLogger(HttpExporterConfigurationExt.class);

    @Bean(name = {"/RemoteDataAssetExtendService"})
    public HttpInvokerServiceExporter remoteMetadataExtendServiceExporter(RemoteDataAssetExtendService remoteDataAssetExtendService) {
        HttpInvokerServiceExporter exporter = new HttpInvokerServiceExporter();
        exporter.setService(remoteDataAssetExtendService);
        exporter.setServiceInterface(RemoteDataAssetExtendService.class);
        LOGGER.info("RemoteMetadataExtendService using port httpInvoker");
        return exporter;
    }
}
