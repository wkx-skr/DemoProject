package com.datablau.security.management.rest.controller;

import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dao.UserDao;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserRoleDetails;
import com.datablau.security.management.dto.*;
import com.datablau.security.management.jpa.entity.User;
import com.datablau.security.management.jpa.repository.OrganizationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class UserAndOrgSyncController {

    private final Logger logger = LoggerFactory.getLogger(UserAndOrgSyncController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    protected OrganizationRepository orgRepository;

    @Autowired
    protected UserDao userDao;

    @PostMapping(path = "/user")
    public ResultResponse operationUser (@RequestBody UserWesisDto userWesisDto) {
        if (userWesisDto.getActionFlag()==null) {
            return ResultResponse.error("actionFlag为空");
        }
        if (userWesisDto.getActionFlag()==0) {
            //新增
            UserDetails user = userService.getUserDetails(userWesisDto.getAccountNo());
            if (user!=null) {
                return ResultResponse.error("用户已存在！");
            }

            String orgCode = null;
            List<OrganizationWesisDto> orgs = userWesisDto.getOrgs();
            if (orgs!=null && orgs.size()>0) {
                orgCode = orgs.get(0).getOrgCode();
            }

            String gender = null;
            if (userWesisDto.getGender()!=null) {
                gender = userWesisDto.getGender()==0?"男":"女";
            }
            UserDetails userDetails = new UserDetails(null, userWesisDto.getAccountNo(), userWesisDto.getUserName(), userWesisDto.getEmail(),
                    userWesisDto.getAccountNo().toLowerCase(), true, false, null, null,
                    userWesisDto.getMobile(), null, orgCode, gender);
            UserRoleDetails role = userService.getRoleByRoleName("ROLE_USER");
            HashSet<Long> roleIds = new HashSet<>();
            roleIds.add(role.getUserRoleId());
            try {
                userService.createUser(userDetails,roleIds,"");
            } catch (Exception e) {
                return ResultResponse.error("新增用户失败，error："+e.getMessage());
            }
            return ResultResponse.success("新增用户成功!");
        } else if (userWesisDto.getActionFlag()==1) {
            //修改
            UserDetails user = userService.getUserDetails(userWesisDto.getAccountNo());
            if (user==null) {
                return ResultResponse.error("系统没有该用户，无法修改！");
            }
            //只能修改名字、email、电话
            UserDetails userDetails = new UserDetails();
            userDetails.setFullUserName(userWesisDto.getUserName());
            userDetails.setEmailAddress(userWesisDto.getEmail());
            userDetails.setPhoneNumber(userWesisDto.getMobile());

            String orgCode = null;
            List<OrganizationWesisDto> orgs = userWesisDto.getOrgs();
            if (orgs!=null && orgs.size()>0) {
                orgCode = orgs.get(0).getOrgCode();
            }
            userDetails.setBm(orgCode);
            try {
                userService.updateUserDetails(user.getUserId(),userDetails);
            } catch (Exception e) {
                return ResultResponse.error("修改用户失败，error："+e.getMessage());
            }
            return ResultResponse.success("修改用户成功!");
        } else if (userWesisDto.getActionFlag()==3) {
            //启用
            UserDetails user = userService.getUserDetails(userWesisDto.getAccountNo());
            if (user==null) {
                return ResultResponse.error("系统没有该用户！");
            }
            try {
                userService.restoreUser(user.getUsername());
            } catch (Exception e) {
                return ResultResponse.error("启用用户失败，error："+e.getMessage());
            }
            return ResultResponse.success("启用用户成功!");
        } else if (userWesisDto.getActionFlag()==4) {
            //禁用
            UserDetails user = userService.getUserDetails(userWesisDto.getAccountNo());
            if (user==null) {
                return ResultResponse.error("系统没有该用户！");
            }
            try {
                userService.disableUser(user.getUsername(),"admin");
            } catch (Exception e) {
                return ResultResponse.error("禁用用户失败，error："+e.getMessage());
            }
            return ResultResponse.success("禁用用户成功!");
        } else {
            return ResultResponse.error("actionFlag错误："+userWesisDto.getActionFlag());
        }
    }

    @PostMapping(path = "/org")
    public ResultResponse operationOrg (@RequestBody OrganizationWesisDto organizationWesisDto) {
        if (organizationWesisDto.getActionFlag()==null) {
            return ResultResponse.error("actionFlag为空");
        }
        if (organizationWesisDto.getActionFlag()==0) {
            //新增
            OrganizationDto org = organizationService.getOrganizationsByBmNull(organizationWesisDto.getOrgCode());
            if (org!=null) {
                return ResultResponse.error("机构已存在！");
            }
            String pbm = organizationWesisDto.getParentOrgCode()==null? "@ROOT":organizationWesisDto.getParentOrgCode();
            OrganizationDto organizationDto = new OrganizationDto();
            organizationDto.setBm(organizationWesisDto.getOrgCode());
            organizationDto.setFullName(organizationWesisDto.getOrgName());
            organizationDto.setPbm(pbm);
            try {
                organizationService.createOrganization(organizationDto);
            } catch (Exception e) {
                return ResultResponse.error("新增机构失败，error:"+e.getMessage());
            }
            return ResultResponse.success("新增机构成功!");
        } else if (organizationWesisDto.getActionFlag()==1) {
            //修改
            OrganizationDto org = organizationService.getOrganizationsByBm(organizationWesisDto.getOrgCode());
            if (org==null) {
                return ResultResponse.error("没有该机构编码对应的机构！");
            }
            OrganizationDto organizationDto = new OrganizationDto();
            organizationDto.setBm(organizationWesisDto.getOrgCode());
            organizationDto.setFullName(organizationWesisDto.getOrgName());
            organizationDto.setPbm(organizationWesisDto.getParentOrgCode());
            try{
                organizationService.modifyOrganization(organizationDto);
            } catch (Exception e) {
                return ResultResponse.error("修改机构失败，error:"+e.getMessage());
            }
            return ResultResponse.success("修改机构成功!");
        } else {
            return ResultResponse.error("actionFlag错误："+organizationWesisDto.getActionFlag());
        }
    }

    @GetMapping(path = "/deleteUser")
    public void deleteUser() {
        List<User> userList = userDao.getAllUser(true);
        logger.info("开始删除用户数据，共："+userList.size());
        int i =0;
        for (User user : userList) {
            if (user.getUsername().equals("admin")) {
                continue;
            }
            userService.deleteUser(user.getId(),"admin");
            i++;
        }
        logger.info("共删除用户："+i);
    }

}
