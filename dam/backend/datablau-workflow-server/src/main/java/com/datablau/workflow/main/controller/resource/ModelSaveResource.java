/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.datablau.workflow.main.controller.resource;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.workflow.main.service.ModelService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * 保存模型数据
 */
@RestController
public class ModelSaveResource {
    private static final Logger LOGGER = LoggerFactory.getLogger(ModelSaveResource.class);

    @Autowired
    private ModelService modelService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private MessageService msgService;

    /**
     * 保存模型数据
     * @param modelId 模型id
     * @param name 模型名称
     * @param description 模型描述
     * @param jsonXml 模型json数据
     * @param svgXml 模型svg数据
     */
    @RequestMapping(value = "/model/{modelId}/save", method = RequestMethod.PUT)
    @ResponseStatus(value = HttpStatus.OK)
    public void saveModel(@PathVariable String modelId, String name,
                          String description, String jsonXml, String svgXml) {
        modelService.saveModel(modelId, name, description, jsonXml, svgXml);
    }

}
