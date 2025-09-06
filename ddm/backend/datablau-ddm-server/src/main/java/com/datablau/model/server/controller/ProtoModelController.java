package com.datablau.model.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedSystemException;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.proto.Model.ProtoCreateModelRequest;
import com.andorj.common.core.proto.Model.ProtoSaveModelRequest;
import com.andorj.common.core.proto.Model.ProtoSavedModel;
import com.andorj.common.data.Data.ProtoObjectX;
import com.andorj.model.common.api.MessageService;
import com.datablau.model.data.api.ModelService;
import com.datablau.model.data.api.semantic.RuleChecker;
import com.datablau.model.data.dto.CreateModelDto;
import com.datablau.model.data.dto.ModelDto;
import com.datablau.model.data.dto.NewModelDto;
import com.datablau.model.data.dto.SaveModelDto;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.rex.dto.ReverseEngineeringDto;
import com.datablau.model.rex.re.ReverseForwardEngineering;
import com.datablau.model.server.utils.ServerExceptionCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
/**
 * @author Nicky - 数语科技有限公司
 * date 2020/1/10 18:32
 */
@Controller("protoModelController")
@ConditionalOnMissingBean(name = "protoModelControllerExt")
@RequestMapping("/proto/models")
@Tag(name = "protobuf 相关模型接口", description = "protobuf 相关模型接口")
public class ProtoModelController extends ProtoBaseController {

    @Autowired
    protected ModelController modelController;

    @Autowired
    protected ModelService modelService;

    @Autowired
    protected RuleChecker ruleChecker;

    @Autowired
    protected MessageService msgService;


    @RequestMapping("/{modelId}/content")
    @Operation(summary = "使用protobuf序列化获取一个模型所有内容", description = "使用protobuf序列化获取一个模型所有内容")
    @Parameters({
            @Parameter(name = "recordId", description = "模型自增ID", in = ParameterIn.QUERY),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH)})
    public ResponseEntity<ProtoSavedModel> getProtoModelContent(@RequestParam(value = "recordId", required = false) Long recordId,
                                                                @RequestParam(value = "versionId", required = false) Long versionId,
                                                                @PathVariable("modelId") Long modelId) {
        ModelDto dto = modelController.getModelContent(recordId, versionId, modelId);
        return ResponseEntity.ok(dto.toProto());
    }


    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "使用protobuf序列化创建模型, 限client使用", description = "使用protobuf序列化创建模型, 限client使用")
    @ResponseBody
    public Model createModel(RequestEntity<ProtoCreateModelRequest> createModelRequest) throws Exception {
        ProtoCreateModelRequest request = createModelRequest.getBody();
        CreateModelDto dto = new CreateModelDto(request);

        NewModelDto info = dto.getModelInfo();
        if (info != null) {
            info.setUseProto(true);
        }

        Model model = modelService.createModel(dto);
        ruleChecker.check(model.getId());
        return model;
    }


    @RequestMapping(value = "/{modelId}/save", method = RequestMethod.POST)
    @ResponseBody
    @Operation(summary = "使用protobuf序列化保存一个模型的内容", description = "使用protobuf序列化保存一个模型的内容")
    @Parameters({
            @Parameter(name = "notReturn", description = "是否不返回已经保存的模型内容", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH)})
    public ModelDto saveModel(RequestEntity<ProtoSaveModelRequest> saveRequest,
                              @PathVariable("modelId") Long modelId,
                              @RequestParam(value = "notReturn", defaultValue = "false") Boolean notReturn) {
        return modelController.saveModel(new SaveModelDto(saveRequest.getBody()), modelId, notReturn);
    }


    @RequestMapping(value = "/re/", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE, produces = "application/x-protobuf; charset=UTF-8")
    @Operation(summary = "逆向工程师数据库", description = "逆向工程师数据库")
    public ResponseEntity<ProtoObjectX> reverseEngineerDatabase(
            @RequestBody ReverseEngineeringDto reParams)
            throws Exception {
        if (reParams.getConnInfo() == null) {
            throw new InvalidArgumentException(msgService.getMessage("reConnectionParamMissing"),
                    ServerExceptionCode.SERVER_RE_CONNECTION_INFO_MISSING);
        }

        if (reParams.getConnInfo().getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = reParams.getConnInfo().getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        ModelX model = engine
                .reverseEngineering(reParams.getConnInfo(), reParams.getOptions(), reParams.getJobId());

        ProtoObjectX.Builder result = ProtoObjectX.newBuilder();
        model.serialize(result);
        return ResponseEntity.ok(result.build());

    }
}
