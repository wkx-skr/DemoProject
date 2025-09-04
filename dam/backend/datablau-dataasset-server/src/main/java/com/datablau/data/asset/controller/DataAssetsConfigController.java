package com.datablau.data.asset.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.catalog.enums.EnumCodeType;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.catalog.jpa.entity.CommonCatalogStructure;
import com.datablau.catalog.jpa.entity.CommonCatalogType;
import com.datablau.catalog.jpa.entity.CommonCatalogTypeIcon;
import com.datablau.catalog.jpa.entity.CommonCodeGenerate;
import com.datablau.catalog.jpa.repository.CommonCatalogTypeRepository;
import com.datablau.data.asset.api.DataAssetsCatalogCompleteAlgorithmService;
import com.datablau.data.asset.api.DataAssetsCatalogStructureService;
import com.datablau.data.asset.api.DataAssetsCatalogTypeService;
import com.datablau.data.asset.api.DataAssetsCatalogUdpService;
import com.datablau.data.asset.api.DataAssetsCodeGenerateService;
import com.datablau.data.asset.api.DataAssetsStructureOrderService;
import com.datablau.data.asset.dto.AlgorithmDto;
import com.datablau.data.asset.dto.AlgorithmPropertyDto;
import com.datablau.data.asset.dto.DataAssetsCatalogTypeDto;
import com.datablau.data.asset.dto.DataAssetsCatalogUdpDto;
import com.datablau.data.asset.dto.DataAssetsStructureDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogStructureOrder;
import com.datablau.data.asset.utils.KafkaLogUtils;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @ClassName : DataAssetsConfigController
 * @Description : 数据资产通用设置
 * @Author : Xu XiaoQian
 * @Date : 2022/6/16
 **/
@RestController
@RequestMapping("/config")
@Tag(name = "数据资产通用配置REST API")
public class DataAssetsConfigController extends BaseController {

    @Autowired
    private KafkaLogUtils kafkaLogUtils;
    @Autowired
    private DataAssetsCatalogUdpService udpService;
    @Autowired
    private DataAssetsCatalogTypeService catalogTypeService;
    @Autowired
    private DataAssetsCodeGenerateService codeGenerateService;
    @Autowired
    private DataAssetsCatalogStructureService structureService;
    @Autowired
    private DataAssetsStructureOrderService structureOrderService;
    @Autowired
    private DataAssetsCatalogCompleteAlgorithmService algorithmService;
    @Autowired
    CommonCatalogTypeRepository commonCatalogTypeRepository;
    @Autowired
    private MessageService messageService;

    public DataAssetsConfigController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取所有资产目录类型")
    @GetMapping("/catalog/type/all")
    public Map<String, Object> getAllType() {
        Map<String, Object> resMap = new HashMap<>();
        resMap.put("catalogTypes", catalogTypeService.findAll());

        Set<String> assetTypes = new LinkedHashSet<>();
        List<String> enumTypeNames = new ArrayList<>();
        for (EnumSupportType supportType : EnumSupportType.values()) {
            assetTypes.add(supportType.name());
            enumTypeNames.add(supportType.name());
        }

        for (CommonCatalogType catalogType : commonCatalogTypeRepository.findAll()) {
            assetTypes.addAll(catalogType.getAssetsTypes());
        }

        List<String> metaModelTypes = new ArrayList<>(assetTypes);
        metaModelTypes.removeAll(enumTypeNames);
        resMap.put("assetsTypes", assetTypes);
        resMap.put("metaModelTypes", metaModelTypes);

        return resMap;
    }

    @Operation(summary = "按id获取单个资产目录类型")
    @GetMapping("/catalog/single/type/{id}")
    public DataAssetsCatalogTypeDto getAssetsCatalogType(@PathVariable("id") Long id) {
        return catalogTypeService.getType(id);
    }

    @Operation(summary = "新建资产目录类型")
    @PostMapping("/catalog/type")
    public void defineDataAssetsCatalogType(@RequestBody DataAssetsCatalogTypeDto dto) {
        catalogTypeService.save(dto);
        kafkaLogUtils.addNewCatalogType(this.getCurrentUser(), dto, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "删除资产目录类型")
    @DeleteMapping("/catalog/type/{id}")
    public void deleteType(@PathVariable("id") Long id) {
        String name = catalogTypeService.deleteType(id);
        kafkaLogUtils.deleteCatalogType(this.getCurrentUser(), name, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "获取图标")
    @PutMapping("/catalog/type/icon/{id}/{iconId}")
    public void changeIcon(@PathVariable("id") Long id, @PathVariable("iconId") Long iconId) {
        catalogTypeService.changeIcon(id, iconId);
    }

    @Operation(summary = "拉取某个资产目录类型的完成度算法", parameters = {@Parameter(name = "catalogTypeId", description = "目录类型id", in = ParameterIn.PATH)})
    @GetMapping("/catalog/algorithm/{catalogTypeId}")
    public AlgorithmDto getAlgorithms(@PathVariable("catalogTypeId") Long catalogTypeId) {
        return algorithmService.getAll(catalogTypeId);
    }

    @Operation(summary = "拉取某个资产目录类型的属性",
            parameters = {@Parameter(name = "catalogTypeId", description = "目录类型id", in = ParameterIn.PATH)})
    @GetMapping("/catalog/udps/{catalogTypeId}")
    public List<DataAssetsCatalogUdpDto> getUdpsByType(@PathVariable("catalogTypeId") Long catalogTypeId) {
        return udpService.getAll(catalogTypeId);
    }

    @Operation(summary = "拉取某个资产目录类型的属性",
            parameters = {@Parameter(name = "structureId", description = "目录结构id", in = ParameterIn.PATH),
                    @Parameter(name = "level", description = "目录类型层级", in = ParameterIn.PATH)})
    @GetMapping("/catalog/{structureId}/{level}/udps")
    public List<DataAssetsCatalogUdpDto> getUdpsBySidAndLevel(@PathVariable("structureId") Long structureId, @PathVariable("level") Integer level) {
        return udpService.getAll(structureId, level);
    }

    @Operation(summary = "获取完属成度算法性下拉框",
            parameters = {@Parameter(name = "catalogTypeId", description = "目录类型id", in = ParameterIn.PATH)})
    @GetMapping("/catalog/algorithm/properties")
    public AlgorithmPropertyDto getProperties(@RequestParam("catalogTypeId") Long catalogTypeId) {
        return algorithmService.getProperties(catalogTypeId);
    }

    @Operation(summary = "获取所有的目录结构",
            parameters = {@Parameter(name = "openStatus", description = "是否开启", in = ParameterIn.QUERY)})
    @GetMapping("/structures")
    public List<DataAssetsStructureDto> getStructures(@RequestParam(value = "openStatus", required = false) Boolean openStatus) {
        return structureService.getAll(openStatus);
    }

    @Operation(summary = "获取某个目录结构",
            parameters = {@Parameter(name = "id", description = "结构id", in = ParameterIn.PATH)})
    @GetMapping("/structure/{id}")
    public DataAssetsStructureDto getStructure(@PathVariable("id") Long id) {
        return structureService.getOne(id, true);
    }

    @Operation(summary = "保存新的目录结构")
    @PostMapping("/structure")
    public void saveStructure(@RequestBody DataAssetsStructureDto dto) {
        String username = this.getCurrentUser();
        CommonCatalogStructure save = structureService.save(username, dto);
//        DataSecurityStructureDto one = securityStructureService.getOne(EnumStructureType.DATA_SECURITY);
//        if (one.getConfigDto() != null && one.getConfigDto().getStructureId() != null && one.getConfigDto().getStructureId().longValue() == save.getId().longValue()) {
//            securityStructureService.syncStructure();
//        }
        kafkaLogUtils.addNewStructure(username, dto, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "修改目录结构的状态",
            parameters = {@Parameter(name = "id", description = "目录结构id", in = ParameterIn.PATH),
                    @Parameter(name = "openStatus", description = "是否开启", in = ParameterIn.QUERY),
                    @Parameter(name = "assetsStraightPublish", description = "资产直接发布", in = ParameterIn.QUERY),
                    @Parameter(name = "catalogStraightPublish", description = "目录直接发布", in = ParameterIn.QUERY)})
    @PostMapping("/structure/{id}")
    public void open(@PathVariable("id") Long id,
                     @RequestParam(value = "openStatus", required = false) Boolean openStatus,
                     @RequestParam(value = "assetsStraightPublish", required = false) Boolean assetsStraightPublish,
                     @RequestParam(value = "catalogStraightPublish", required = false) Boolean catalogStraightPublish) {
        String name = structureService.changeStatus(id, openStatus, assetsStraightPublish, catalogStraightPublish);
        kafkaLogUtils.changeStructure(this.getCurrentUser(), name, openStatus, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "删除某个目录结构",
            parameters = {@Parameter(name = "id", description = "目录结构id", in = ParameterIn.PATH)})
    @DeleteMapping("/structure/{id}")
    public void deleteStructure(@PathVariable("id") Long id) {
        String name = structureService.delete(id);
        kafkaLogUtils.deleteStructure(this.getCurrentUser(), name, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "保存结构排序")
    @PostMapping("/structures/order")
    public void structureOrder(@RequestBody List<DataAssetsCatalogStructureOrder> orders) {
        structureOrderService.save(orders);
    }

    @Operation(summary = "上传目录类型icon")
    @PostMapping("/upload")
    public ResResultDto<CommonCatalogTypeIcon> uploadIcon(@RequestParam("icon") MultipartFile icon) {
        return ResResultDto.ok(catalogTypeService.upload(icon));
    }

    @Operation(summary = "获取目录类型icon")
    @GetMapping("/icon/{iconId}")
    public void getIcon(HttpServletResponse response, @PathVariable("iconId") Long iconId) throws IOException {
        CommonCatalogTypeIcon icon = catalogTypeService.getIcon(iconId);
        response.getOutputStream().write(icon.getIcon());
    }

    @Operation(summary = "恢复icon")
    @GetMapping("/recover")
    public ResResultDto<Long> recover(@RequestParam("imageName") String imageName) {
        CommonCatalogTypeIcon icon = catalogTypeService.getIdByName(imageName);
        return ResResultDto.ok(icon.getId());
    }

    @Operation(summary = "获取自动生成编码配置")
    @GetMapping("/generate/{type}/{id}")
    public CommonCodeGenerate getGenerate(@PathVariable("type") EnumCodeType type, @PathVariable("id") Long id) {
        return codeGenerateService.get(type, id);
    }

    @Operation(summary = "资产编码保存")
    @PostMapping("/generate/assets")
    public void updateGenerate(@RequestBody CommonCodeGenerate generate) {
        codeGenerateService.saveOrUpdate(generate);
    }

    @Operation(summary = "验证是否存在编码")
    @PostMapping("/code/check")
    public boolean checkCode(@RequestBody Map<String, Object> params) {
        if (params == null || params.isEmpty() || !params.containsKey("stdCode") || !params.containsKey("type")) {
            throw new IllegalArgumentException(messageService.getMessage("stdCodeError"));
        }
        return codeGenerateService.checkCode(EnumCodeType.valueOf(params.get("type").toString()), params.get("stdCode").toString(), Long.parseLong(params.get("id").toString()));
    }

}
