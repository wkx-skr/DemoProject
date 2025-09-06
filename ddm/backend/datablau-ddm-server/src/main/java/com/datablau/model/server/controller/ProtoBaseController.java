package com.datablau.model.server.controller;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.dto.ErrorDto;
import com.andorj.model.common.utility.GeneralExceptionCode;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.local.utility.ServerConstants;
import com.datablau.model.security.api.AuthorizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserRoleDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
/**
 * @author Nicky - 数语科技有限公司
 * date 2020/1/13 18:36
 */
@Controller("protoBaseController")
@ConditionalOnMissingBean(name = "protoBaseControllerExt")
public class ProtoBaseController {
    protected static final Logger log = LoggerFactory.getLogger(BaseController.class);

    @Autowired
    protected MessageService msgService;

    @Autowired
    protected AuthorizationService authService;
    @Autowired
    protected UserService userService;

    @ExceptionHandler({AccessDeniedException.class})
    @ResponseBody
    public ErrorDto accessDenied(HttpServletResponse response, Exception re) {
        log.error("no permission", re);
        response.setStatus(HttpStatus.FORBIDDEN.value());

        ErrorDto errorDto = new ErrorDto();
        errorDto.setErrorCode(GeneralExceptionCode.ACCESS_DENIED);
        errorDto.setErrorMessage(msgService.getMessage("accessIsDenied"));
        errorDto.setErrorType(AccessDeniedException.class.getSimpleName());
        errorDto.setRootErrorMessage(errorDto.getErrorMessage());
        errorDto.setRootErrorType(errorDto.getErrorType());

        return errorDto;
    }

    @ExceptionHandler({Exception.class})
    @ResponseBody
    public ErrorDto internalServerError(HttpServletResponse response, Exception re)
        throws IOException {
        log.error("failed to process the request", re);
        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());

        return buildError(re);
    }

    @ExceptionHandler({RuntimeException.class})
    @ResponseBody
    public ErrorDto internalServerError(HttpServletResponse response, RuntimeException re)
        throws IOException {
        log.error("failed to process the request", re);
        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());

        return buildError(re);
    }

    protected ErrorDto buildError(Exception ex) {
        ErrorDto result = new ErrorDto();
        result.setErrorType(ex.getClass().getName());
        result.setErrorMessage(ex.getMessage());

        Throwable root = findRootCause(ex);
        result.setRootErrorType(root.getClass().getName());
        result.setRootErrorMessage(root.getMessage());

        if (ex instanceof AndorjRuntimeException) {
            result.setErrorCode(((AndorjRuntimeException)ex).getErrorCode());
        } else {
            result.setErrorCode(GeneralExceptionCode.SYSTEM_EXCEPTION);
        }

        return result;
    }

    protected Throwable findRootCause(Throwable tr) {
        Throwable root = tr;
        while (root.getCause() != null) {
            root = root.getCause();
        }

        return root;
    }

    protected boolean isSuperuser(String username) {
        for (UserRoleDetails role : userService.getUserAllRoles(username, ServerConstants.APPNAME)) {
            if (role.getRoleName().equals("ROLE_SUPERUSER_DDM")) {
                return true;
            }
        }

        return true;
    }
}
