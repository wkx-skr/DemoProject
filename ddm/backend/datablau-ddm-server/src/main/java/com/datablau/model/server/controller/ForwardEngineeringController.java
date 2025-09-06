package com.datablau.model.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedSystemException;
import com.andorj.model.common.api.MessageService;
import com.datablau.model.rex.dto.ForwardEngineeringDto;
import com.datablau.model.rex.re.ReverseForwardEngineering;
import com.datablau.model.server.utils.ServerExceptionCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import com.datablau.data.common.controller.BaseController;
/**
 * @Author Senyan - 北京数语科技
 * @Date 2019/04/26
 */
@RequestMapping("/fe")
@RestController("forwardEngineeringController")
@ConditionalOnMissingBean(name = "forwardEngineeringControllerExt")
@Tag(name = "正向工程相关REST API", description = "正向工程相关REST API")
public class ForwardEngineeringController extends BaseController {

    @Autowired
    protected MessageService msgService;


    @RequestMapping(value = "/stat", method = RequestMethod.POST)
    @Operation(summary = "正向工程", description = "正向工程")
    public void forwardEngineStatement(@RequestBody ForwardEngineeringDto params)
            throws Exception {
        if (params.getConnInfo() == null) {
            throw new InvalidArgumentException(msgService.getMessage("reConnectionParamMissing"),
                    ServerExceptionCode.SERVER_RE_CONNECTION_INFO_MISSING);
        }

        if (params.getConnInfo().getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = params.getConnInfo().getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        engine.forwardEngineering(params.getConnInfo(), params.getSql());
    }

}
