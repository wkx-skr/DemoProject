package com.datablau.domain.management.config;

import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.impl.DomainExtServiceImpl;
import com.datablau.project.api.DomainExtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.remoting.httpinvoker.HttpInvokerServiceExporter;

@Configuration("httpExporterConfigurationExt")
@ConditionalOnProperty(
        name = {"datablau.transport.http"},
        havingValue = "true"
)
public class HttpExporterConfigurationExt extends HttpExporterConfiguration {
    private static final Logger logger = LoggerFactory.getLogger(HttpExporterConfigurationExt.class);

    @Bean(
            name = {"/DomainExtService"}
    )
    public HttpInvokerServiceExporter domainServiceExporter(DomainExtService domainExtService) {
        HttpInvokerServiceExporter exporter = new HttpInvokerServiceExporter();
        exporter.setService(domainExtService);
        exporter.setServiceInterface(DomainExtService.class);
        logger.info("DomainExtService using port httpInvoker");
        return exporter;
    }
}
