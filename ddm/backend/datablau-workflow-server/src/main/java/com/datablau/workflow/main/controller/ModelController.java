package com.datablau.workflow.main.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import com.datablau.workflow.common.entity.dto.query.ModelQueryDto;
import com.datablau.workflow.common.utils.PageVo;
import com.datablau.workflow.main.service.ModelService;
import com.datablau.workflow.main.util.ServerConstants;
import com.datablau.workflow.main.util.SpringContextUtils;
import org.activiti.engine.repository.Model;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

/**
 * activiti流程模型相关api接口
 */
@RestController
@RequestMapping("/model")
public class ModelController extends BaseController {

    @Autowired
    private ModelService modelService;


    public ModelController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 获取流程模型列表
     * @param pageSize 每页大小
     * @param currentPage 当前页数
     * @param name 流程模型名称
     * @return 分页结果
     */
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public PageVo<Model> getModelList(@RequestParam(value = "pageSize", required = false) Integer pageSize,
                                      @RequestParam(value = "currentPage", required = false) Integer currentPage,
                                      @RequestParam(value = "name", required = false) String name) {
        try {
            name = URLDecoder.decode(name, "UTF-8");
        } catch (Exception ignored) {

        }
        return modelService.getModelList(pageSize, currentPage, name);
    }

    /**
     * 新建流程模型
     * @param modelQueryDto 流程模型信息dto
     * @return 返回流程模型id
     */
    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public String addModel(@RequestBody ModelQueryDto modelQueryDto) {
        return modelService.addModel(modelQueryDto);
    }

    /**
     * 删除流程模型
     * @param id 流程模型id
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void deleteModel(@PathVariable("id") String id) {
        modelService.deleteModel(id);
    }

    /**
     * 部署流程模型
     * @param modelId 模型id
     * @return 返回部署成功后生成的流程实例id
     */
    @RequestMapping(value = "/deploy/{modelId}", method = RequestMethod.GET)
    public String deploy(@PathVariable("modelId") String modelId) {
       return modelService.deploy(modelId);
    }

    /**
     * 获取流程相关配置
     * @return 返回workflow的ip、端口、地址
     */
    @RequestMapping(value = "/config", method = RequestMethod.GET)
    public Map<String, String> getPortAndUrl() {
        Environment environment = SpringContextUtils.getBean(Environment.class);
        Map<String, String> map = new HashMap<>();
        map.put("port", environment.getProperty("server.mapping.port"));
        map.put("path", environment.getProperty("server.servlet.context-path"));
        map.put("ip", environment.getProperty("server.ip"));
        return map;
    }

    /**
     * 下载流程模型的bpmn文件
     * @param modelId 流程模型id
     * @return 返回文件字节码
     * @throws Exception 下载失败，抛出异常
     */
    @RequestMapping(value = "/download/{modelId}", method = RequestMethod.GET)
    public ResponseEntity<byte[]> getBpmnFile(@PathVariable("modelId") String modelId) throws Exception {
        File file = modelService.downloadBpmn(modelId);


        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        String realName = file.getName();
        realName = URLEncoder.encode(realName, "UTF-8");
        headers.setContentDispositionFormData("attachment", realName);

        return new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);

    }

}
