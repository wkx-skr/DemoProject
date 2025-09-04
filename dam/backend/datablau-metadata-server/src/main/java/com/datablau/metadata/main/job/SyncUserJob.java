package com.datablau.metadata.main.job;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.descriptor.SyncUserJobDescriptor;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserRoleDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;

import java.util.*;
public class SyncUserJob extends DatablauJobAdapter {

    private final Logger logger = LoggerFactory.getLogger(SyncUserJob.class);

    private Environment environment;

    private UserService userService;

    private OrganizationService organizationService;

    private SyncUserJobDescriptor jobDescriptor;

    public SyncUserJob() {

    }

    public SyncUserJob(DatablauJobDescriptor jobDescriptor) {
        this.jobDescriptor = new SyncUserJobDescriptor(jobDescriptor);
    }

    @Override
    protected void prepare() throws Exception {
        this.userService = BeanHelper.getBean(UserService.class);
        this.organizationService = BeanHelper.getBean(OrganizationService.class);
        this.environment = BeanHelper.getBean(Environment.class);
        if (this.organizationService == null) {
            throw new RuntimeException("cannot find organizationService");
        }
        if (this.userService == null) {
            throw new RuntimeException("cannot find userService");
        }
        if (this.environment == null) {
            throw new RuntimeException("cannot find environment");
        }
        super.prepare();
    }

    public void execute() throws Exception {
        logger.info("开始执行用户全量同步任务");
        int successcnt = 0;
        int failcnt = 0;

        String queryApi = environment.getProperty("sync.query_api");
        String appId = environment.getProperty("sync.user_app_id");
        String token = environment.getProperty("sync.token");
        if (queryApi==null) {
            queryApi = "https://dataleap.pipechina.com.cn/invoker_engine/query_with_params";
        }
        if (appId==null) {
            appId = "1905190578698588160";
        }
        if (token==null) {
            token = "eyJhbGciOiJBRVMiLCJ0eXAiOiJKV1QifQ.eyJhcHAiOiJzanp0Mi5kci56eWd4IiwiaWF0IjoxMiwidGlkIjoiMiIsInVuaXgiOjE3NDY2NzA4MTJ9.Djlt6wprQPEua-XRQR-pCEAAC8H5LehpJ0Awu_ul8jbkWHqi70VjP8omQ66H1S0zfiv0louwWmr5M7wr1Azm1qxgpz6paiY93lx57gaOUe3Szp6iNR6UJNWY7EmdYLXioEQ1aicS9UEx434XrzFskTNdGA";
        }

        List<String> bms = organizationService.findAllOrganizationBms();

        if (bms!=null && bms.size()>0) {
            for (String bm : bms) {
                if (bm.equals("@ROOT")) {
                    continue;
                }
                //请求头
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Type", "application/json");

                // 创建JSON对象来表示Option
                JSONObject option = new JSONObject();
                option.put("Id", 100); //定义option键值对
                option.put("Val", 0);
                option.put("Val_", token);

                JSONObject params = new JSONObject();
                params.put("departmentId",bm);
                params.put("staffCode","");
                params.put("searchKey","");

                // 创建JSON对象来表示整个API请求
                JSONObject apiRequest = new JSONObject();
                apiRequest.put("ApiID", appId); //设置ApiID
                apiRequest.put("Option", new JSONObject[]{option}); //将Option整体放入ApiRequest
                apiRequest.put("Params", params.toString()); //将Params整体放入ApiRequest

                logger.info("queryApi:"+queryApi);
                logger.info("appId:"+appId);
                logger.info("token:"+token);

                String body = null;
                try {
                    body = HttpUtil.createPost(queryApi)
                            .addHeaders(headers)
                            .body(apiRequest.toString())
                            .execute()
                            .body();
                } catch (RuntimeException e) {
                    throw new RuntimeException("全量用户拉取接口调用失败！"+e.getMessage());
                }

                if (body==null) {
                    throw new RuntimeException("获取全量用户信息为空！");
                }

                // 解析 JSON 字符串
                JSONArray data = null;
                try {
                    JSONObject jsonObject = new JSONObject(body);
                    data = jsonObject.getJSONArray("Data");
                } catch (Exception e) {
                    logger.info("获取用户组数据失败："+e.getMessage());
                    logger.info("获取失败的机构编码bm为：" + bm);
                    continue;
                }

                int m = data.size();

                for (int i=0;i<m;i++) {

                    // 获取用户对象
                    JSONArray user = data.getJSONArray(i);
                    // 获取用户对应信息
//                    String accountNo = user.get(3).toString();
                    String userName = user.get(1).toString();
                    String staffCode = user.get(2).toString();

                    String orgCode = user.get(4).toString();

                    UserDetails userDetails1 = userService.getUserDetails(staffCode);
                    if (userDetails1!=null) {
                        logger.info("username已存在："+staffCode);
                        continue;
                    }
                    String genderStr = null;

                    UserDetails userDetails = new UserDetails(null, staffCode, userName, null,
                            staffCode.toLowerCase(), true, false, null, null,
                            null, null, orgCode, genderStr);

//                    Map<String, Object> map = new HashMap<>();
//                    map.put("userId",staffCode);
//                    userDetails.setAdditionalProperties(map);

                    UserRoleDetails role = userService.getRoleByRoleName("ROLE_USER");
                    HashSet<Long> roleIds = new HashSet<>();
                    roleIds.add(role.getUserRoleId());

                    try {
                        userService.createUser(userDetails,roleIds,"");
                        logger.info("新增用户成功，用户名:"+userName);
                        successcnt++;
                    } catch (Exception e) {
                        logger.info("新增用户失败，用户名:"+userName);
                        logger.info("error："+e.getMessage());
                        failcnt++;
                    }
                }
            }
        }
        logger.info("共同步成功用户："+successcnt);
        logger.info("共同步失败用户："+failcnt);
        logger.info("用户全量同步任务执行结束");
    }
}
