/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */


package com.datablau.job.scheduler.controller;

import com.andorj.common.core.exception.AndorjUserException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.LicenseNotSupportException;
import com.andorj.model.common.dto.ErrorDto;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.security.management.utils.AuthTools;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.sql.SQLException;

/**
 * Base controller for handling exceptions and status code.
 *
 * @author Nicky
 * @since 1.0
 */

@RestController
public class BaseControllers {

    private static final Logger logger = LoggerFactory.getLogger(BaseControllers.class);

    private static final int DEFAULT_ERROR_CODE = 599;


    /**
     * 用户微服务不存在的时候需要注释掉该方法
     */
    @ModelAttribute
    public void checkPermission(HttpServletRequest request) {

    }

    @ExceptionHandler({ServletRequestBindingException.class})
    public void requestError(HttpServletResponse response, ServletRequestBindingException se) {
        logger.warn("request parameter binding error:" + se.getMessage());
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class})
    public void requestError(HttpServletResponse response, MethodArgumentTypeMismatchException se) {
        logger.warn("request parameter binding error:" + se.getMessage());
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    @ExceptionHandler({LicenseNotSupportException.class})
    public ErrorDto licError(HttpServletResponse response, LicenseNotSupportException le) {
        logger.warn("license is not support current method invocation: " + le.getClassName() + "->" + le.getMethodName());

        response.setStatus(DEFAULT_ERROR_CODE);

        ErrorDto error = new ErrorDto();
        error.setErrorMessage(GeneralUtility.getMessageService().getMessage("errorInfo", le.getMessage()));
        error.setErrorType(le.getClass().getName());
        error.setRootErrorMessage(error.getErrorMessage());
        error.setRootErrorType(error.getErrorType());
        error.setErrorCode(-1);

        return error;
    }

    @ExceptionHandler({AccessDeniedException.class})
    public ErrorDto accessError(HttpServletResponse response, AccessDeniedException le) {
        logger.error("access is denied");

        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        ErrorDto error = new ErrorDto();
        error.setErrorMessage(GeneralUtility.getMessageService().getMessage("noPermissionToOperate"));
        error.setErrorType(AccessDeniedException.class.getName());
        error.setRootErrorMessage(error.getErrorMessage());
        error.setRootErrorType(error.getErrorType());
        return error;
    }

    @ExceptionHandler({SQLException.class})
    public ErrorDto internalSqlError(HttpServletResponse response, SQLException se)
        throws IOException {
        logger.error("failed to execute sql", se);
        response.setStatus(DEFAULT_ERROR_CODE);

        ErrorDto error = new ErrorDto();
        error.setErrorMessage(GeneralUtility.getMessageService().getMessage("errorInfo", se.getMessage()));
        error.setErrorType(se.getClass().getName());
        error.setRootErrorMessage(error.getErrorMessage());
        error.setRootErrorType(error.getErrorType());

        return error;
    }

    @ExceptionHandler({Throwable.class})
    public ErrorDto internalServerError(HttpServletResponse response, Exception re)
        throws IOException {
        Throwable te = null;
        if (re instanceof AndorjUserException) {
            logger.warn("wrong parameter:" + re.getMessage());
        } else if ((te = findRootCause(re)) instanceof InvalidArgumentException) {
            logger.info("invalid argument:" + te.getMessage());
        } else {
            logger.error("failed to process the request", re);
        }
        response.setStatus(DEFAULT_ERROR_CODE);

        return buildError(re);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class})
    public ErrorDto processHttpMessageError(HttpServletResponse response,
        HttpMessageNotReadableException re) throws IOException {
        logger.error("failed to process the http message", re);
        response.setStatus(HttpStatus.BAD_REQUEST.value());

        ErrorDto error = new ErrorDto();
        error.setErrorMessage(GeneralUtility.getMessageService().getMessage("failedToAnalyzeRequest"));
        error.setErrorType(HttpMessageNotReadableException.class.getName());

        Throwable root = findRootCause(re);
        error.setRootErrorType(root.getClass().getName());
        error.setRootErrorMessage(root.getMessage());
        return error;
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

    protected String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    protected String getCurrentUser(HttpServletRequest request) {
        String username = AuthTools.currentUsername();
        if (org.springframework.util.StringUtils.isEmpty(username)) {
            return request.getHeader("username");
        } else {
            return username;
        }
    }

    protected void exportFile(File file, HttpServletResponse response, String downloadName) {
        if (file.exists()) {
            response.setContentType("application/octet-stream");
            String realName = downloadName;

            try {
                realName = URLEncoder.encode(downloadName, "UTF-8");
                realName = realName.replace("+", "%20");
            } catch (Exception ex) {
                //logger.warn("Failed to convert template file name");
            }

            response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
            response.setHeader("Content-Length", String.valueOf(file.length()));

            try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
                BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
                byte[] buff = new byte[2048];
                int bytesRead;
                while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                    bos.write(buff, 0, bytesRead);
                }

            } catch (Exception ex) {
                throw new IllegalStateException("failed to export template file");
            }
        }
    }
}
