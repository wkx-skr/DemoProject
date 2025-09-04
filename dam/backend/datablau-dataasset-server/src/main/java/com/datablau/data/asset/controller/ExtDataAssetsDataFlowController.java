package com.datablau.data.asset.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.jpa.entity.ExtDataAssetsDataFlowId;
import com.datablau.data.asset.service.ExtDataAssetsDataFlowService;
import com.datablau.data.asset.utils.DatablauUtil;
import com.datablau.data.common.controller.BaseController;
import org.apache.commons.io.FileUtils;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/dataflow")
public class ExtDataAssetsDataFlowController extends BaseController {

  private static final Logger LOGGER = LoggerFactory.getLogger(ExtDataAssetsDataFlowController.class);

  @Autowired
  private ExtDataAssetsDataFlowService extDataAssetsDataFlowService;
  @Autowired
  private RedissonClient redissonClient;

  @RequestMapping(value = "/sync", method = RequestMethod.GET)
  public ExtDataAssetsDataFlowSyncResult syncDataFlow() {
    RLock dataflowSyncLock = redissonClient.getLock("dataflow_sync_lock");
    try {
      if (dataflowSyncLock.isLocked()) {
        ExtDataAssetsDataFlowSyncResult result = new ExtDataAssetsDataFlowSyncResult();
        result.setSuccess(false);
        result.setMessage("同步操作正在进行中，请稍后再试");
        return result;
      }
      dataflowSyncLock.lock(1, TimeUnit.HOURS);
      return extDataAssetsDataFlowService.sync();
    } catch (Exception e) {
      LOGGER.warn("dataflow sync error: ", e);
      ExtDataAssetsDataFlowSyncResult result = new ExtDataAssetsDataFlowSyncResult();
      result.setSuccess(false);
      result.setMessage("同步失败：" + e.getMessage());
      return result;
    } finally {
      dataflowSyncLock.forceUnlock();
    }
  }

  @RequestMapping(value = "/page", method = RequestMethod.POST)
  public ExtDataAssetsDataFlowResDto pageDataFlow(@RequestBody ExtDataAssetsDataFlowReqDto reqDto) {
    return extDataAssetsDataFlowService.getPage(reqDto);
  }

  @RequestMapping(value = "/download", method = RequestMethod.POST)
  public void downloadTemplate(HttpServletResponse response) {
    File file = new File(DatablauUtil.getResourcePath("/ddc/data_flow_template.xlsx"));
    String realName = "";

    try {
      realName = URLEncoder.encode("数据流管理模板", StandardCharsets.UTF_8);
      realName = realName.replace("+", "%20");
    } catch (Exception ex) {
      LOGGER.warn("Failed to convert template file name");
    }

    response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
    response.setHeader("Content-Length", String.valueOf(file.length()));

    try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
         BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
      byte[] buff = new byte[2048];
      int bytesRead;
      while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
        bos.write(buff, 0, bytesRead);
      }

    } catch (Exception ex) {
      throw new UnexpectedStateException("下载模板失败", ex);
    }
  }

  @RequestMapping(value = "/upload", method = RequestMethod.POST)
  public ExtDataAssetsDataFlowImportResult uploadDataFlow(@RequestParam("file") MultipartFile multipartFile) throws Exception {
    String filePath = GeneralUtility.getWebRootPath() + "/files/" + multipartFile.getOriginalFilename();
    File file = new File(filePath);
    FileUtils.copyInputStreamToFile(multipartFile.getInputStream(), file);
    if (!file.exists()) {
      throw new UnexpectedStateException("上传文件失败");
    }
    
    ExtDataAssetsDataFlowImportResult result = extDataAssetsDataFlowService.uploadDataFlow(file.getAbsolutePath());
    
    // 如果有跳过的记录，记录日志便于调试
    if (result.getSkipCount() > 0) {
      LOGGER.warn("导入完成，但存在跳过记录：{}", result.getSummary());
      for (String reason : result.getSkipReasons()) {
        LOGGER.warn("跳过原因：{}", reason);
      }
    }
    
    return result;
  }

  @RequestMapping(value = "/export", method = RequestMethod.POST)
  public ResponseEntity<byte[]> exportDataFlow(@RequestBody ExtDataAssetsDataFlowReqDto reqDto) throws Exception {
    return extDataAssetsDataFlowService.exportDataFlow(reqDto);
  }

  @RequestMapping(value = "/create", method = RequestMethod.POST)
  public void createDataFlow(@RequestBody ExtDataAssetsDataFlowReqDto reqDto) {
    extDataAssetsDataFlowService.createDataFlow(reqDto);
  }

  @RequestMapping(value = "/delete", method = RequestMethod.POST)
  public void deleteDataFlow(@RequestBody List<ExtDataAssetsDataFlowId> extDataAssetsDataFlowIdList) {
    extDataAssetsDataFlowService.deleteDataFlow(extDataAssetsDataFlowIdList);
  }

  @RequestMapping(value = "/getCatalogs", method = RequestMethod.GET)
  public List<ExtDataAssetsCatalogDto> getCatalogs(@RequestParam Long parentId) {
    return extDataAssetsDataFlowService.getCatalogs(parentId);
  }

  @RequestMapping(value = "/getCatalogByCode", method = RequestMethod.GET)
  public ExtDataAssetsCatalogDto getCatalogByCode(@RequestParam String code) {
    return extDataAssetsDataFlowService.getCatalogByCode(code);
  }

  @RequestMapping(value = "/getCatalogById", method = RequestMethod.GET)
  public ExtDataAssetsCatalogDto getCatalogById(@RequestParam Long catalogId) {
    return extDataAssetsDataFlowService.getCatalogById(catalogId);
  }

  @RequestMapping(value = "/searchLogicalEntities", method = RequestMethod.GET)
  public List<ExtDataAssetsCatalogDto> searchLogicalEntities(@RequestParam String keyword) {
    return extDataAssetsDataFlowService.searchLogicalEntities(keyword);
  }

  /*@RequestMapping(value = "/getDiagrams", method = RequestMethod.POST)
  public Map<String, List<ModelCategoryDto>> getDiagrams(@RequestBody ExtDataAssetsDataFlowDiagramsLineReqDto reqDto) {
    Long modelCategoryId = reqDto.getModelCategoryId();
    return extDataAssetsDataFlowService.getDiagrams(modelCategoryId);
  }*/

  @RequestMapping(value = "/getAllDiagrams", method = RequestMethod.POST)
  public Map<Long,Map<String, List<DataFlowDto>>> getAllDiagrams() {
    return extDataAssetsDataFlowService.getAllDiagrams();
  }

  @RequestMapping(value = "/getLineDetails", method = RequestMethod.POST)
  public List<ExtDataAssetsDataFlowDiagramsLineResDto> getLineDetails(@RequestBody ExtDataAssetsDataFlowDiagramsLineReqDto reqDto) {
    return extDataAssetsDataFlowService.getLineDetails(reqDto);
  }
}
