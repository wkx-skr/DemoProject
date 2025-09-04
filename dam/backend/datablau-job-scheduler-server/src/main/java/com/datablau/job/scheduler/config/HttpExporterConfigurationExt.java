package com.datablau.job.scheduler.config;

import com.datablau.job.scheduler.service.RemoteJobSchedulerServiceNewImpl;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.RemoteJobSchedulerServiceNew;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.remoting.httpinvoker.HttpInvokerServiceExporter;

@Configuration("httpExporterConfigurationExted")
public class HttpExporterConfigurationExt {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpExporterConfigurationExt.class);


    @Bean(name = {"/RemoteJobSchedulerServiceNew"})
    public HttpInvokerServiceExporter remoteJobSchedulerServiceNewExporter(RemoteJobSchedulerServiceNew remoteJobSchedulerServiceNew) {
        HttpInvokerServiceExporter exporter = new HttpInvokerServiceExporter();
        exporter.setService(remoteJobSchedulerServiceNew);
        exporter.setServiceInterface(RemoteJobSchedulerServiceNew.class);
        LOGGER.info("RemoteJobSchedulerServiceNew using port httpInvoker");
        return exporter;
    }
}
