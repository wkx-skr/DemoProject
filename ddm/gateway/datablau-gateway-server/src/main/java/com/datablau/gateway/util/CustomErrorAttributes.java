package com.datablau.gateway.util;


import com.andorj.model.common.dto.ErrorDto;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

@Component
public class CustomErrorAttributes extends DefaultErrorAttributes {

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, ErrorAttributeOptions options) {
        Map<String, Object> superMap = super.getErrorAttributes(request, options);
        Throwable ex = getError(request);

        ErrorDto result = new ErrorDto();
        result.setErrorType(ex.getClass().getName());
        result.setErrorMessage(ex.getMessage());

        Throwable root = findRootCause(ex);
        result.setRootErrorType(root.getClass().getName());
        result.setRootErrorMessage(root.getMessage());
        if (StringUtils.isEmpty(result.getErrorMessage())) {
            result.setErrorMessage(result.getRootErrorMessage());
        }


        superMap.put("errorType", result.getErrorType());
        superMap.put("errorMessage", result.getErrorMessage());
        superMap.put("rootErrorType", result.getRootErrorType());
        superMap.put("rootErrorMessage", result.getRootErrorMessage());


        return superMap;
    }

    private Throwable findRootCause(Throwable tr) {
        Throwable root = tr;
        while (root.getCause() != null) {
            root = root.getCause();
        }

        return root;
    }
}
