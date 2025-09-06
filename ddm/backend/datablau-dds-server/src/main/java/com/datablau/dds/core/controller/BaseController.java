/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */


package com.datablau.dds.core.controller;

import com.andorj.common.core.exception.AndorjUserException;
import com.andorj.model.common.dto.ErrorDto;
import java.io.IOException;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

/**
 * Base controller for handling exceptions and status code.
 *
 * @author Nicky
 * @since 1.0
 */

@RestController("base")
public class BaseController {

    private static final Logger logger = LoggerFactory.getLogger(BaseController.class);

    private static final int DEFAULT_ERROR_CODE = 599;

    @ExceptionHandler({ServletRequestBindingException.class})
    public void requestError(HttpServletResponse response, ServletRequestBindingException se) {
        logger.warn("request parameter binding error:" + se.getMessage());

        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    @ExceptionHandler({Throwable.class})
    public ErrorDto internalServerError(HttpServletResponse response, Exception re)
            throws IOException {
        if (re instanceof AndorjUserException) {
            logger.warn("wrong parameter:" + re.getMessage());
        } else {
            logger.error("failed to process the request", re);
        }
        response.setStatus(DEFAULT_ERROR_CODE);

        return buildError(re);
    }

    private ErrorDto buildError(Exception ex) {
        ErrorDto result = new ErrorDto();
        result.setErrorType(ex.getClass().getName());
        result.setErrorMessage(ex.getMessage());

        Throwable root = findRootCause(ex);
        result.setRootErrorType(root.getClass().getName());
        result.setRootErrorMessage(root.getMessage());

        if(StringUtils.isEmpty(result.getErrorMessage())) {
            result.setErrorMessage(result.getRootErrorMessage());
        }

        return result;
    }

    private Throwable findRootCause(Throwable tr) {
        Throwable root = tr;
        while (root.getCause() != null) {
            root = root.getCause();
        }

        return root;
    }

}
