package com.datablau.dataSecurity.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.TagService;
import com.datablau.base.data.TagDto;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.DataSecurityAssetsQueryDto;
import com.datablau.dataSecurity.dto.DataSecurityLevelDataObjectDto;
import com.datablau.dataSecurity.dto.DataSecurityLevelTagClassifyDto;
import com.datablau.dataSecurity.dto.DataSecurityLevelTagDto;
import com.datablau.dataSecurity.enums.EnumClassificationType;
import com.datablau.dataSecurity.service.api.DataSecurityClassificationService;
import com.datablau.dataSecurity.service.impl.DataSecurityLocalTagService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.dataSecurity.utils.JsonUtils;
import com.datablau.security.management.api.RoleService;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import org.apache.commons.lang3.StringUtils;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static com.datablau.dataSecurity.enums.EnumClassificationType.DATA_SECURITY_LEVEL;

/**
 * @Author: leipengfei
 * @CreateTime: 2022-11-29  10:46
 * @Description: TODO
 */
@io.swagger.v3.oas.annotations.tags.Tag(name = "数据分级", description = "数据分级相关接口")
@RestController
@RequestMapping(value = "/datasecurity/level")
public class DataSecurityLevelController extends BaseController {
    private static final String ASSETS_LEVEL_LOCK = "assets_level_lock";

    @Autowired
    private TagService tagService;
    @Autowired
    private DataSecurityLocalTagService dataSecurityLocalTagService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private DataSecurityClassificationService dataSecurityClassificationService;

    @Autowired
    private RedissonClient redissonClient;
    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityLevelController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "新增或修改安全等级")
    @PostMapping(value = "/addorupdate")
    public ResResultDto<DataSecurityLevelTagClassifyDto> addOrUpdateDataSecurityLevel(@RequestBody @Valid DataSecurityLevelTagDto param,
                                                                                      BindingResult bindingResult) {
        RLock lock = redissonClient.getLock(ASSETS_LEVEL_LOCK);
        try {
            lock.lock();
            DataSecurityLevelTagClassifyDto result = new DataSecurityLevelTagClassifyDto();

            if (bindingResult.hasErrors()) {
                String errorMsg = bindingResult.getAllErrors().stream().map(ObjectError::getDefaultMessage).collect(
                        Collectors.joining(","));
                return ResResultDto.error(errorMsg);
            }

            //判断tagId是否为空，为空则新增否则更新
            if (param.getTagId() != null) {
                TagDto tag = tagService.getTagById(param.getTagId());
                tag.setName(param.getTagName());
                Map<String, String> map = JsonUtils.toObject(tag.getProperties(), Map.class);
                map.put("description", param.getDescription());
                map.put("type", param.getClassificationType().name());
                map.put("color", param.getColor());
                tag.setProperties(JsonUtils.toJSon(map));
                try {
                    tagService.updateTag(tag);
                }catch (Exception e){
                    if (e instanceof UndeclaredThrowableException){
                        throw new InvalidArgumentException(msgService.getMessage(e.getCause().getCause().getMessage(), param.getTagName()));
                    }
                }
                result.setTag(tag);
                logUtils.modifyDataSecurityLevel(param, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
            } else {
                TagDto parentTag = tagService.getTagByBuiltInCode(param.getClassificationType().getBuiltInCode());
                List<TagDto> tags = tagService.getTagsByParentId(parentTag.getTagId());
                Optional<TagDto> optional = tags.stream().filter(tag -> tag.getName().equals(param.getTagName())).findAny();
                if (optional.isPresent()) {
                    throw new InvalidArgumentException(msgService.getMessage("tagWithNameExisted", param.getTagName()));
                }
                Optional<TagDto> optionalTag = tags.stream().max((Comparator.comparingInt(o -> o.getTagId().intValue())));
//                if (!optionalTag.isPresent()) {
//                    throw new RuntimeException("tag not exist!");
//                }
                String builtInCode = incrBuiltInCodes(getCurrentCode(optionalTag,parentTag));

                Map<String, String> properties = Maps.newHashMap();
                properties.put("builtInCode", builtInCode);
                properties.put("description", param.getDescription());
                properties.put("type", param.getClassificationType().name());
                properties.put("color", param.getColor());
                TagDto tag = tagService.addTag(param.getTagName(), parentTag.getTagId(), null, JsonUtils.toJSon(properties), null, 1L, false, false, builtInCode);
                result.setTag(tag);
                logUtils.addDataSecurityLevel(param, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
            }
            result.setClassificationType(param.getClassificationType());
            //todo 是否要同步tag服务
            return ResResultDto.ok(result);
        }catch (UndeclaredThrowableException e) {
            Throwable targetException = e.getCause();
            if (targetException instanceof InvocationTargetException){
                return ResResultDto.error(((InvocationTargetException)e.getCause()).getTargetException().getMessage());
            }
            return ResResultDto.error(targetException.getMessage());
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }finally {
            lock.forceUnlock();
        }
    }

    /**
     * @param tagId
     * @throws Exception
     */
    @PostMapping("/del")
    @Description("删除数据安全等级")
    public ResResultDto del(@Description("数据安全标签id") @RequestParam("tagId") Long tagId) throws Exception {
        //做删除前的校验
        try {
            TagDto tagDto = tagService.getTagById(tagId);
            DataSecurityLevelTagDto param = new DataSecurityLevelTagDto();
            param.setTagName(tagDto.getName());
            param.setDescription(getTagDescription(tagDto.getProperties()));
            logUtils.deleteDataSecurityLevel(param,getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());

            boolean delete = dataSecurityClassificationService.deleteValid(tagId);
            if (delete) {
                tagService.deleteTag(tagId);
                TagDto parentTag = tagService.getTagById(tagDto.getParentId());
                EnumClassificationType type = getTypeByParentTag(parentTag);
                if (type != null) {
                    dataSecurityClassificationService.syncAssetsDefault(type,tagId);
                }
            }
            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }

    }

    private EnumClassificationType getTypeByParentTag(TagDto parentTag){
        for (EnumClassificationType value : EnumClassificationType.values()) {
            if (value.getBuiltInCode().equals(parentTag.getBuiltInCode())){
                return value;
            }
        }
        return null;
    }

    @Operation(summary = "安全等级列表")
    @GetMapping("/securitylist")
    public ResResultDto<List<DataSecurityLevelTagClassifyDto>> getAllSecurity() {
        return ResResultDto.ok(queryDataSecurityLevelList());
    }

    @Operation(summary = "安全等级名称检索")
    @Parameters({@Parameter(name = "name", description = "分级名称")})
    @GetMapping("/securitylist/checkname")
    public ResResultDto<List<DataSecurityLevelTagClassifyDto>> getSecurityByName(
            @RequestParam("name") String name) {
        List<DataSecurityLevelTagClassifyDto> result = Lists.newArrayList();

        List<String> list = Lists.newArrayList();
        for (EnumClassificationType type : EnumClassificationType.values()) {
            list.add(type.getBuiltInCode());
        }
        List<TagDto> tags = dataSecurityLocalTagService.searchSecurityTagByName(name, list);
        for (TagDto tag : tags) {
            Map<String, String> map = JsonUtils.toObject(tag.getProperties(), Map.class);
            DataSecurityLevelTagClassifyDto vo = new DataSecurityLevelTagClassifyDto();
            vo.setTag(tag);
            vo.setClassificationType(map.get("type") != null ? EnumClassificationType.valueOf(map.get("type")) : DATA_SECURITY_LEVEL);
            result.add(vo);
        }
        return ResResultDto.ok(result);
    }

    @Operation(summary = "安全等级资产列表")
    @PostMapping("/queryassets")
    public ResResultDto<PageResult<DataSecurityLevelDataObjectDto>> getPageList(@RequestBody @Valid DataSecurityAssetsQueryDto queryDto,
                                                                                BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getAllErrors().stream().map(ObjectError::getDefaultMessage).collect(Collectors.joining(","));
            return ResResultDto.error(errorMsg);
        }

        PageResult<DataSecurityLevelDataObjectDto> pageResult = dataSecurityClassificationService.getPageList(queryDto);
        return ResResultDto.ok(pageResult);
    }

    private List<DataSecurityLevelTagClassifyDto> queryDataSecurityLevelList() {
        List<DataSecurityLevelTagClassifyDto> result = Lists.newArrayList();

        Set<TagDto> tags = tagService.getAllTags(null);
        Map<Long, TagDto> tagMap = new HashMap<>();
        for (TagDto tag : tags) {
            tagMap.put(tag.getTagId(), tag);
        }

        List<String> parentTags = Lists.newArrayList();
        for (EnumClassificationType type : EnumClassificationType.values()) {
            if (type == EnumClassificationType.DATA_SENSITIVE) {
                continue;
            }
            parentTags.add(type.getBuiltInCode());
        }

        for (TagDto tag : tags) {
            //跳过父节点
            if (!tagMap.containsKey(tag.getParentId())) {
                continue;
            }
            //处理子节点
            TagDto parentTag = tagMap.get(tag.getParentId());
            //处理数据安全的子节点
            if (parentTags.contains(parentTag.getBuiltInCode())) {
                DataSecurityLevelTagClassifyDto vo = new DataSecurityLevelTagClassifyDto();
                vo.setTag(tag);
                vo.setClassificationType(EnumClassificationType.valueByBuildInCode(parentTag.getBuiltInCode()));
                result.add(vo);
            }
        }
        return result.stream().sorted(Comparator.comparing(u -> u.getTag().getTagId())).collect(Collectors.toList());
    }

    private String incrBuiltInCodes(String builtInCodes) {
        int length = builtInCodes.length();
        String pre = builtInCodes.substring(0, length - 1);
        int next = Integer.parseInt(builtInCodes.substring(length - 1)) + 1;

        return pre + next;
    }

    private String getCurrentCode(Optional<TagDto> optional, TagDto parentTag){
        if (optional.isPresent()){
            return optional.get().getBuiltInCode();
        }

        switch (parentTag.getBuiltInCode()){
            case "dataAuth":
                return "dataAuthA4";
            case "DATA_IMPORTANCE":
                return "IMPORTANCE5";
            case "DATA_INFLUENCE_OBJECT":
                return "OBJECT4";
            case "DATA_INFLUENCE_SCOPE":
                return "SCOPE4";
            case "DATA_IMPACT_DEGREE":
                return "DEGREE4";
            case "DATA_SENSITIVE":
                return "SENSITIVE2";
            default:
                return "dataAuthA4";
        }
    }

    private String getTagDescription(String properties) {
        if (StringUtils.isNotBlank(properties)) {
            Map<String, String> map = JsonUtils.toObject(properties, Map.class);
            return map.get("description");
        }
        return "";
    }
}
