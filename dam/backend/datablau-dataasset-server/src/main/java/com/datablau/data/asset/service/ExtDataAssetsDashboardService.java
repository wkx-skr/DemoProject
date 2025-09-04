package com.datablau.data.asset.service;

import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.dto.ExtDataAssetsDashboardCoverageDto;
import com.datablau.data.asset.dto.ExtDataAssetsDashboardDto;
import com.datablau.data.asset.jpa.repository.ExtCommonCatalogRepository;
import com.datablau.data.asset.jpa.repository.ExtDataAssetsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ExtDataAssetsDashboardService {

  private static final Logger LOGGER = LoggerFactory.getLogger(ExtDataAssetsDashboardService.class);

  @Autowired
  private ExtCommonCatalogRepository extCommonCatalogRepository;
  @Autowired
  private ExtDataAssetsRepository extDataAssetsRepository;

  public ExtDataAssetsDashboardDto dashboard() {
    ExtDataAssetsDashboardDto result = new ExtDataAssetsDashboardDto();
    try {
      Integer count1 = 0;
      Integer count2 = 0;
      Integer count3 = 0;
      Integer count4 = 0;
      Integer count5 = 0;
      List<CommonCatalog> commonCatalogList = extCommonCatalogRepository.findAllList();
      Set<Long> catalogIds5 = new HashSet<>();
      Map<Long, Set<Long>> catalogId1CatalogIds5Map = new HashMap<>();
      Map<Long, String> catalogId1CatalogNameMap = new HashMap<>();
      for (CommonCatalog commonCatalog : commonCatalogList) {
        if (EnumAssetsCatalogStatus.PUBLISHED.equals(commonCatalog.getStatus())) {
          Integer level = commonCatalog.getLevel();
          switch (level) {
            case 1:
              count1++; // 已发布的一级目录数量
              break;
            case 2:
              count2++; // 已发布的二级目录数量
              break;
            case 3:
              count3++; // 已发布的三级目录数量
              break;
            case 4:
              count4++; // 已发布的四级目录数量
              break;
            case 5:
              count5++; // 已发布的五级目录数量
              // 已发布的五级目录ID
              catalogIds5.add(commonCatalog.getId());
              // 已发布的五级目录ID按所属一级目录分组
              String[] path = commonCatalog.getCatalogPath().split("/");
              Long catalogId1 = Long.valueOf(path[1]);
              Set<Long> catalogIds;
              if (catalogId1CatalogIds5Map.containsKey(catalogId1)) {
                catalogIds = catalogId1CatalogIds5Map.get(catalogId1);
              } else {
                catalogIds = new HashSet<>();
              }
              catalogIds.add(commonCatalog.getId());
              catalogId1CatalogIds5Map.put(catalogId1, catalogIds);
            default:
              break;
          }
        }
        if (commonCatalog.getLevel() == 1) {
          catalogId1CatalogNameMap.put(commonCatalog.getId(), commonCatalog.getName());
        }
      }

      Set<Long> catalogIds5Reg = extDataAssetsRepository.findAllCatalogIdSetByCatalogIdIn(catalogIds5); // 资产表中的（已注册数据了的）五级目录ID，前提是已发布
      // 数据资产量统计
      Map<String, Integer> count = new HashMap<>();
      Integer count0 = count1 + count2 + count3 + count4 + count5;
      count.put("count0", count0); // 数据资产总量
      count.put("count1", count1); // 业务域
      count.put("count2", count2); // 主题域
      count.put("count3", count3); // 业务对象
      count.put("count4", count4); // 逻辑数据实体
      count.put("count5", count5); // 属性
      // 数据资产注册状态占比
      Map<String, Integer> registrationPct = new HashMap<>();
      registrationPct.put("regY", catalogIds5Reg.size());          // 已注册
      registrationPct.put("regN", count5 - catalogIds5Reg.size()); // 未注册
      Set<Long> complianceYCatalogIds5 = new HashSet<>(); // TODO 落标成功的五级目录
      // 数据资产落标占比
      Map<String, Integer> compliancePct = new HashMap<>();
      compliancePct.put("complianceY", complianceYCatalogIds5.size());                      // 已落标
      compliancePct.put("complianceN", catalogIds5.size() - complianceYCatalogIds5.size()); // 未落标
      // 数据资产扭转漏斗
      Map<String, Integer> conversionFunnel = new HashMap<>();
      conversionFunnel.put("all", count5);                               // 全部
      conversionFunnel.put("reg", catalogIds5Reg.size());                // 注册
      conversionFunnel.put("compliance", complianceYCatalogIds5.size()); // 落标
      // 业务域名数据资产覆盖统计
      List<ExtDataAssetsDashboardCoverageDto> coverageList = new ArrayList<>();
      for (Long catalogId1 : catalogId1CatalogIds5Map.keySet()) {
        ExtDataAssetsDashboardCoverageDto coverageDto = new ExtDataAssetsDashboardCoverageDto();
       coverageDto.setLevel1(catalogId1CatalogNameMap.get(catalogId1)); // 业务域名称
        Set<Long> catalogIds5InCatalog1 = catalogId1CatalogIds5Map.get(catalogId1);
        coverageDto.setCount5InLevel1(catalogIds5InCatalog1.size());    // 属性数
        Set<Long> commonR = new HashSet<>(catalogIds5InCatalog1);
        commonR.retainAll(catalogIds5Reg);
        coverageDto.setReg5InLevel1(commonR.size());                    // 注册数
        Set<Long> commonC = new HashSet<>(catalogIds5InCatalog1);
        commonC.retainAll(complianceYCatalogIds5);
        coverageDto.setCompliance5InLevel1(commonC.size());             // 落标数
        int count5InLevel1 = coverageDto.getCount5InLevel1();
        int compliance5InLevel1 = coverageDto.getCompliance5InLevel1();
        double complianceRate;
        if (count5InLevel1 > 0) {
          complianceRate = (double) compliance5InLevel1 / count5InLevel1 * 100;
        } else {
          complianceRate = 0.0;
        }
        complianceRate = Math.round(complianceRate * 100.0) / 100.0;    // 落标率
        coverageDto.setCompliance5RateInLevel1(complianceRate);
        coverageList.add(coverageDto);
      }

      result.setCount(count);
      result.setRegistrationPct(registrationPct);
      result.setCompliancePct(compliancePct);
      result.setConversionFunnel(conversionFunnel);
      result.setCoverageList(coverageList);
    } catch (Exception e) {
      LOGGER.warn(e.getLocalizedMessage(), e);
    }
    return result;
  }

  // 1. 数据资产量统计
  public Map<String, Long> getCount() {
    return null;
  }

  // 2. 数据资产注册状态占比
  public Map<String, Long> getRegistrationPct() {
    return null;
  }

  // 3. 数据资产落标占比
  public Map<String, Long> getCompliancePct() {
    return null;
  }

  // 4. 数据资产扭转漏斗
  public Map<String, Long> getConversionFunnel() {
    return null;
  }

  // 5. 业务域数据资产覆盖统计
  public Map<String, Long> getCoverage() {
    return null;
  }
}
