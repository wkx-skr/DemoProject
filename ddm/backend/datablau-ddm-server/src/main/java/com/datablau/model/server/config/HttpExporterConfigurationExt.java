package com.datablau.model.server.config;

import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.RemoteArchyExtendService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.remoting.httpinvoker.HttpInvokerServiceExporter;

/**
 * @author: hxs
 * @date: 2025/4/7 18:09
 */
@Configuration("httpExporterConfigurationExted")
public class HttpExporterConfigurationExt {
    private static final Logger LOGGER = LoggerFactory.getLogger(HttpExporterConfigurationExt.class);


    @Bean(name = {"/DatablauRemoteDdmModelServiceNew"})
    public HttpInvokerServiceExporter datablauRemoteDdmModelServiceNewExporter(DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew) {
        HttpInvokerServiceExporter exporter = new HttpInvokerServiceExporter();
        exporter.setService(datablauRemoteDdmModelServiceNew);
        exporter.setServiceInterface(DatablauRemoteDdmModelServiceNew.class);
        LOGGER.info("DatablauRemoteDdmModelServiceNew using port httpInvoker");
        return exporter;
    }

}
