package com.datablau.base.server.controller;

import com.andorj.lic.data.LicenseFeatureInfo;
import com.andorj.lic.data.LicenseInfo;
import com.andorj.lic.data.LicenseStatus;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.server.dto.LicenseDetail;
import com.datablau.base.server.jpa.entity.Configurations;
import com.datablau.base.server.jpa.repository.ConfigurationsRepository;
import com.datablau.base.server.service.LocalLicenseService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.DynamicConfigurations;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.compress.utils.Lists;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Nicky - 数语科技有限公司
 * date 2019/7/15 16:46
 */
@RefreshScope
@RestController
@RequestMapping("/configs")
@Tag(name = "编辑可以及时生效的配置REST API")
public class ConfigurationController extends BaseController {

	private static final Logger LOGGER = LoggerFactory.getLogger(DatasourceController.class);

	@Value("${spring.cloud.nacos.config.group}")
	private String group;

	@Value("${spring.cloud.nacos.discovery.server-addr}")
	private String serverAddr;

	@Value("${lixinghua.test:2000}")
	private String testStr;

	@Autowired
	private MessageService msgService;
	@Autowired
	private LocalLicenseService localLicenseService;
	@Autowired
	private ConfigurationsRepository configDao;
	@Autowired
	protected DynamicConfigurations dynamicConfigurations;

	@GetMapping("/")
	@Operation(summary = "获取所有属性")
	public List<Configurations> getAllConfigs() {
		LicenseDetail licenseDetail = localLicenseService.getLicenseDetail();
		LicenseInfo licenseInfo = licenseDetail.getLicenseInfo();
		List<LicenseFeatureInfo> featureInfos = licenseInfo.getFeatureInfos();
		Map<String, LicenseStatus> featureInfoMap = featureInfos.stream().collect(Collectors.toMap(LicenseFeatureInfo::getFeatureCode, LicenseFeatureInfo::getStatus));

		Iterable<Configurations> iterable = configDao.findAll();
		List<Configurations> configs = Lists.newArrayList();
		iterable.forEach(configs::add);
		Iterator<Configurations> it = configs.iterator();
		while(it.hasNext()) {
			Configurations config = it.next();

			if (isFilterConfiguration(config, featureInfoMap)) {
				it.remove();
			}
			config.setFeatureName(msgService.getMessage(config.getFeatureCode()));

			if (msgService.getMessage("FE_Type").equalsIgnoreCase("English")) {
				config.setPropertyDescription(config.getPropertyEnDescription());
			} else {
				config.setPropertyDescription(config.getPropertyCnDescription());
			}
		}

		configs.sort(Comparator.comparing(Configurations::getPropertyName));
		return configs;
	}

	protected boolean isFilterConfiguration(Configurations config, Map<String, LicenseStatus> featureInfoMap) {
		if (Strings.isNullOrEmpty(config.getFeatureCode())) {
			return true;
		}
		if ("FE_SYSCONFIG".equals(config.getFeatureCode())) {
			return false;
		}
		if (!featureInfoMap.containsKey(config.getFeatureCode())
			|| featureInfoMap.get(config.getFeatureCode()).equals(LicenseStatus.EXPIRED)) {
			return true;
		}
		return false;
	}

	@PutMapping("/")
	@Operation(summary = "修改一个属性")
	//@PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
	public void updateConfiguration(@RequestBody Configurations configuration) {
		configDao.save(configuration);
		dynamicConfigurations.setPropertyValue(configuration.getPropertyName(), configuration.getPropertyValue());
	}

	@GetMapping("/get_one") // 统一使用POST, 2021/12/30
	@Operation(summary = "获取一个配置信息, jsonp: callback name: 'jsonp'")
	public String getConfiguration(
			@RequestParam("name") String name,
			@RequestParam(name = "jsonp", required = false) String jsonp,
			HttpServletRequest request, HttpServletResponse response) throws JsonProcessingException {
		String configuration = DynamicConfigurations.INSTANCE.getPropertyValue(name);
		ObjectMapper objectMapper = new ObjectMapper();
		if (StringUtils.isBlank(jsonp)) {
			//response.setContentType("application/json; charset=UTF-8");
			return configuration;
		} else {
			//response.setContentType("text/javascript; charset=UTF-8");
			return jsonp + "(" + configuration + ")";
		}
	}

}
