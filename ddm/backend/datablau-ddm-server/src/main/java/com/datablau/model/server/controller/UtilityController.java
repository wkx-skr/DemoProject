package com.datablau.model.server.controller;

import com.andorj.common.core.annotation.Ignore;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.lic.data.LicenseFeatureInfo;
import com.andorj.lic.service.LicenseService;
import com.andorj.model.common.utility.DigestUtils;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.CategoryService;
import com.datablau.model.data.api.PermissionHelper;
import com.datablau.model.data.dto.SimpleUserDto;
import com.datablau.model.data.dto.UsersOfResourcesDto;
import com.datablau.model.data.jpa.entity.Category;
import com.datablau.model.data.jpa.entity.ThirdPartyInfo;
import com.datablau.model.data.jpa.repository.ThirdPartyInfoRepository;
import com.datablau.model.data.utility.DynamicConfigurations;
import com.datablau.model.local.utility.Configurations;
import com.datablau.model.local.utility.ModelStoreConfigurations;
import com.datablau.model.local.utility.ServerConstants;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.dto.AboutDto;
import com.datablau.model.server.dto.LicInfoDto;
import com.datablau.model.server.utils.GitlabConfigurations;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/10/10 0010 下午 4:46
 */
@RestController("utilityController")
@ConditionalOnMissingBean(name = "utilityControllerExt")
@RequestMapping("/utils")
@Tag(name = "工具类REST API", description = "工具类REST API")
public class UtilityController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(UtilityController.class);

    @Autowired
    protected UserService userService;

    @Autowired
    protected CategoryService categoryService;

    @Autowired
    protected PermissionHelper permissionHelper;



    @Autowired
    protected ThirdPartyInfoRepository thirdPartyInfoDao;

//    @RequestMapping("/location")
//    public String getWebAppLocation() {
//        return System.getProperty("webapp.root");
//    }

    @Value("${datablau.server.build.version}")
    protected String version;

    @Value("${datablau.server.build.number}")
    protected String buildNumber;

    @Value("${lic.server.url}")
    protected String licserverUrl;

    @Autowired
    protected LicenseService licenseService;

    protected volatile SimpleUserDto superuserDto;
    protected AboutDto about;


    @RequestMapping(value = "/encrypt", method = RequestMethod.POST)
    @Operation(summary = "加密一个字符串", description = "加密一个字符串,返回的字符串可以填写到配置文件中作为数据库连接密码")
    public String getEncryptedString(@RequestBody String toBeEncrypt) {
        if (Strings.isNullOrEmpty(toBeEncrypt)) {
            return null;
        } else {
            return DigestUtils.encrypt(toBeEncrypt);
        }
    }


    @RequestMapping("/about")
    @Operation(summary = "获取服务器的版本信息", description = "获取服务器的版本信息")
    public AboutDto getVersion() {
            synchronized (this) {
                    about = new AboutDto();
                    about.setBuildNumber(buildNumber);
                    about.setVersion(version);
                    about.setCustomerId(Configurations.INSTANCE.getCustomerId());
                    about.setDamConnectable(Configurations.INSTANCE.isDamConnectable());
                    about.setLicServerEmbedded(!Strings.isNullOrEmpty(licserverUrl));
                    try {
                        List<LicenseFeatureInfo> feDdmArch = licenseService.getFeatureInfo(Collections.singletonList("FE_DDM_ARCH"));
                        if (!CollectionUtils.isEmpty(feDdmArch)) {
                            LicInfoDto dto = new LicInfoDto(feDdmArch.get(0));
                            about.setWeb(dto);
                        }
                    } catch (Exception e) {
                        logger.error(e.getMessage(), e);
                }
        }

        return about;
    }


    @RequestMapping("/modelStoreConfigurations")
    @Operation(summary = "获取模型库的设置信息", description = "获取模型库的设置信息")
    public ModelStoreConfigurations getModelStoreConfigurations() {
        return DynamicConfigurations.INSTANCE.getModelStoreConfigurations();
    }


    @RequestMapping("/gitConfigurations")
    @Operation(summary = "获取gitlab信息", description = "获取gitlab信息")
    public GitlabConfigurations getGitlabConfigurations() {
        return GitlabConfigurations.INSTANCE;
    }


    @RequestMapping(value = "/cloudRegister", method = RequestMethod.POST)
    @Operation(summary = "注册Cloud 用户信息", description = "注册Cloud 用户信息")
    @Ignore
    @Transactional
    public void registrCloudUser(@RequestBody SimpleUserDto user) {

        //final Long userId, final String username,
        //        final String fullUsername, final String emailAddress,
        //        final String password, final Boolean enabled, final String staffId,
        //        final String title, final boolean ldapAuthenticated

        UserDetails userDetails = new UserDetails(
                null, user.getUsername(), user.getFirstname(), user.getEmail(),
                "ddm123", true, null, false, OrganizationService.ORG_ROOT_BM);
        Long userId = userService.createUser(userDetails,
                Collections.singleton(userService.getRoleByRoleName(
                        AuthTools.ROLE_USER).getUserRoleId()), ServerConstants.APPNAME);

        user.setUserId(userId);

        final HashSet<GrantedAuthority> grantedAuthorities = new HashSet<GrantedAuthority>();
        grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        UsernamePasswordAuthenticationToken runAsAuthentication =
                new UsernamePasswordAuthenticationToken(user.getUsername(), "ignore it", grantedAuthorities);

        SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
        SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

        Category category = new Category();
        category.setDescription("User's private repository");
        category.setName(user.getUsername());
        category.setParentId(categoryService.getRootCategory().getId());
        category = categoryService.createCategoryWithoutPermissionCheck(category);

        UsersOfResourcesDto users = new UsersOfResourcesDto();
        users.setEditorUsers(Collections.singletonList(user));
        users.setAdminUsers(Collections.singletonList(getSuperuser()));
        permissionHelper.setCategoryUsersWithoutPermissionCheck(users, category.getId());

        logger.info("cloud user " + user.getUsername() + " is registered");
    }

    protected synchronized SimpleUserDto getSuperuser() {
        if (superuserDto == null) {
            Set<UserDetails> users = userService.getUsersForRole(userService.getRoleByRoleName(AuthTools.ROLE_SUPERUSER).getUserRoleId());
            if (users == null) {
                throw new UnexpectedStateException("No superuser found");
            }
            UserDetails superuser = users.iterator().next();
            superuserDto = new SimpleUserDto(superuser);
        }

        return superuserDto;
    }

    @GetMapping("/thirdParty")
    @Operation(summary = "获取第三方调用信息", description = "获取调用的第三方信息")
    public List<ThirdPartyInfo> getThirdPartyInfo() {
       return thirdPartyInfoDao.findAll();
    }

    @PostMapping("/udp/val")
    public String reUdp() throws Exception {
        Thread.sleep(1000 * 60 * 10);
        return null;
    }

// 客户端兼容原因，已不可用
//    @RequestMapping(method = RequestMethod.POST, description ="/update/DDM/file")
//    @PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
//    public void uploadNewDdmRelease(@RequestParam("file") MultipartFile multipartFile)
//            throws Exception {
//        logger.info(AuthTools.currentUsernameNullSafe() + " is uploading file " + multipartFile.getName());
//
//        String name = multipartFile.getOriginalFilename();
//        File file = UploadFile.uploadFile(multipartFile);
//        File target = new File(DDMUtility.getDdmUpdatePath(name));
//
//        Files.move(Paths.get(file.getAbsolutePath()), Paths.get(target.getAbsolutePath()), StandardCopyOption.REPLACE_EXISTING);
//    }
//
//    @RequestMapping(method = RequestMethod.POST, description ="/update/DDM/config")
//    @PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
//    public void updateDdmReleaseConfig(@RequestBody DdmClientUpdateInfo info)
//            throws Exception {
//        if(info.getHost() == null || info.getVersion() == null){
//            throw new IllegalArgumentException("host or version cannot be null");
//        }
//
//        info.createXml(DDMUtility.getDdmUpdatePath("checkVersion.xml"));
//    }
}
