package com.datablau.metadata.main.job;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.descriptor.SyncOrgJobDescriptor;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.dto.OrganizationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;

import java.util.HashMap;
import java.util.Map;

public class SynOrgJob extends DatablauJobAdapter {

    private final Logger logger = LoggerFactory.getLogger(SynOrgJob.class);

//    @Value("${sso.wesis_ip}")
//    private String wesisIp;

    private Environment environment;

    private OrganizationService organizationService;


    private SyncOrgJobDescriptor jobDescriptor;

    public SynOrgJob() {

    }

    public SynOrgJob(DatablauJobDescriptor jobDescriptor) {
        this.jobDescriptor = new SyncOrgJobDescriptor(jobDescriptor);
    }

    @Override
    protected void prepare() throws Exception {
        this.organizationService = BeanHelper.getBean(OrganizationService.class);
        this.environment = BeanHelper.getBean(Environment.class);
        if (this.organizationService == null) {
            throw new RuntimeException("cannot find organizationService");
        }
        if (this.environment == null) {
            throw new RuntimeException("cannot find environment");
        }
        super.prepare();
    }

    @Override
    protected void execute() throws Exception {
        logger.info("开始执行机构全量同步任务");
        int successcnt = 0;
        int failcnt = 0;

        String queryApi = environment.getProperty("sync.query_api");
        String appId = environment.getProperty("sync.org_app_id");
        String token = environment.getProperty("sync.token");
        if (queryApi==null) {
            queryApi = "https://dataleap.pipechina.com.cn/invoker_engine/query_with_params";
        }
        if (appId==null) {
            appId = "1905168315395870720";
        }
        if (token==null) {
            token = "eyJhbGciOiJBRVMiLCJ0eXAiOiJKV1QifQ.eyJhcHAiOiJzanp0Mi5kci56eWd4IiwiaWF0IjoxMiwidGlkIjoiMiIsInVuaXgiOjE3NDY2NzA4MTJ9.Djlt6wprQPEua-XRQR-pCEAAC8H5LehpJ0Awu_ul8jbkWHqi70VjP8omQ66H1S0zfiv0louwWmr5M7wr1Azm1qxgpz6paiY93lx57gaOUe3Szp6iNR6UJNWY7EmdYLXioEQ1aicS9UEx434XrzFskTNdGA";
        }

        logger.info("queryApi:"+queryApi);
        logger.info("appId:"+appId);
        logger.info("token:"+token);

        //请求头
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        // 创建JSON对象来表示Option
        JSONObject option = new JSONObject();
        option.put("Id", 100); //定义option键值对
        option.put("Val", 0);
        option.put("Val_", token);

        JSONObject params = new JSONObject();

        // 创建JSON对象来表示整个API请求
        JSONObject apiRequest = new JSONObject();
        apiRequest.put("ApiID", appId); //设置ApiID
        apiRequest.put("Option", new JSONObject[]{option}); //将Option整体放入ApiRequest
        apiRequest.put("Params", params.toString()); //将Params整体放入ApiRequest

        String body = null;
        try {
            body = HttpUtil.createPost(queryApi)
                    .addHeaders(headers)
                    .body(apiRequest.toString())
                    .execute()
                    .body();
        } catch (RuntimeException e) {
            throw new RuntimeException("全量机构拉取接口调用失败！");
        }

        if (body==null) {
            throw new RuntimeException("获取全量机构信息为空！");
        }

        // 解析 JSON 字符串
        JSONObject jsonObject = new JSONObject(body);
        JSONArray data = jsonObject.getJSONArray("Data");
        int m = data.size();

        for (int i=0;i<m;i++) {
            // 获取机构对象
            JSONObject org = data.getJSONObject(i);
            // 获取机构对应信息
            String bm = org.get("dept_id").toString();
            String fullName = org.get("dept_name").toString();
            String pbm = (Integer) org.get("parent_id")==0?"@ROOT":org.get("parent_id").toString();


            OrganizationDto organizationDto1 = organizationService.getOrganizationsByBmNull(bm);
            if (organizationDto1!=null) {
                logger.info("bm已存在："+bm);
                continue;
            }

            OrganizationDto organizationDto = new OrganizationDto();
            organizationDto.setBm(bm);
            organizationDto.setFullName(fullName);
            organizationDto.setPbm(pbm);
            try {
                organizationService.createOrganization(organizationDto);
                logger.info("新增机构成功，机构名:"+fullName);
                successcnt++;
            } catch (Exception e) {
                logger.info("新增机构失败，机构名:"+fullName);
                logger.info("error："+e.getMessage());
                failcnt++;
            }
        }
        logger.info("共同步成功机构："+successcnt);
        logger.info("共同步失败机构："+failcnt);
        logger.info("机构全量同步任务执行结束");
    }
}
