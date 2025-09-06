package com.datablau.archy.server.dto;

import com.andorj.common.core.model.LDMTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import org.apache.commons.lang.ObjectUtils;

import java.io.Serializable;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author Nicky - 数语科技有限公司
 * date 2020/7/8 17:14
 */
@Schema(title = "元素版本修改内容对象")
public class VersionElementChangesDto implements Serializable {

    @Schema(title = "版本号")
    protected Long ver;

    @Schema(title = "签入版本ID1 + | + 对比签入版本ID2")
    protected String versions;

    @Schema(title = "元素列表")
    protected List<ElementChangesDto> elements;

    public Long getVer() {
        return ver;
    }

    public void setVer(Long ver) {
        this.ver = ver;
    }

    public String getVersions() {
        return versions;
    }

    public void setVersions(String versions) {
        this.versions = versions;
    }

    public List<ElementChangesDto> getElements() {
        return elements;
    }

    public void setElements(List<ElementChangesDto> elements) {
        this.elements = elements;
    }
}
