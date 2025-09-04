package com.datablau.data.asset.controller;

import com.datablau.data.asset.dto.ExtDataAssetsDashboardDto;
import com.datablau.data.asset.service.ExtDataAssetsDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ext/dashboard")
public class ExtDataAssetsDashboardController {

  @Autowired
  private ExtDataAssetsDashboardService extDataAssetsDashboardService;

  @RequestMapping(value = "/all", method = RequestMethod.GET)
  public ExtDataAssetsDashboardDto dashboardAll() {
    return extDataAssetsDashboardService.dashboard();
  }
}
