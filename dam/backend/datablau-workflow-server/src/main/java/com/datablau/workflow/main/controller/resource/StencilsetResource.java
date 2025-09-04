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

import com.datablau.data.common.util.ShareKit;
import org.activiti.engine.ActivitiException;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;

/**
 * 模板集
 */
@RestController
public class StencilsetResource {

    /**
     * 模板集
     * @throws ActivitiException 加在模板集失败
     */
    @RequestMapping(value = "/editor/stencilset", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    public String getStencilset() {

        InputStream stencilsetStream;
        String locale = ShareKit.getLocale();
        if("zh_CN".equals(locale)){
            stencilsetStream = this.getClass().getClassLoader().getResourceAsStream("stencilset-zh.json");
        }else {
            stencilsetStream = this.getClass().getClassLoader().getResourceAsStream("stencilset-en.json");
        }


        try {
            return IOUtils.toString(stencilsetStream, "utf-8");
        } catch (Exception e) {
            throw new ActivitiException("Error while loading stencil set", e);
        }
    }
}
