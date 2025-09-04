package com.datablau.datasource.api;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.datablau.datasource.data.CredentialInfo;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.exception.ConnectionEstablishException;
import jdk.internal.joptsimple.internal.Strings;
import okhttp3.Call;
import okhttp3.Headers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * @program: datablau-datasource-plugins
 * @description: api 类型
 * @author: wang tong
 * @create: 2024-10-31 16:07
 **/
public class ApiDatasource implements Datasource {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiDatasource.class);
    private DatasourceProperties datasourceProperties;

    private final OkHttpClient okHttpClient =  new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)//链接超时，单位为秒
            .writeTimeout(3 * 60, TimeUnit.SECONDS)//写入超时，单位为秒
            .readTimeout(3 * 60, TimeUnit.SECONDS)//读取超时，单位为秒
            .build();;
    private final Map<String, String> headers = new HashMap<>();

    public static Headers MapToHeaders(Map<String, String> headerMap) {
        Headers.Builder headerBuilder = new Headers.Builder();
        headerBuilder.add("Accept", "application/json");
        if (null != headerMap) {
            headerMap.forEach((k, v) -> {
                headerBuilder.add(k, v);
            });
        }
        return headerBuilder.build();
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("C5240D60-75C2-44C8-A3B4-1418F05455E1");
    }

    @Override
    public DatasourceProperties getProperties() {
        return this.datasourceProperties;
    }

    @Override
    public void setProperties(DatasourceProperties datasourceProperties) {
        this.datasourceProperties = datasourceProperties;
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {

//        CredentialInfo info = datasourceProperties.getCredentialInfo();
//        if (info != null) {
//            if (!Strings.isNullOrEmpty(info.getUser())) {
//                headers.put("user", info.getUser());
//            }
//            if (!Strings.isNullOrEmpty(info.getPassword())) {
//                headers.put("password", info.getPassword());
//            }
//        }

        try {
            JSONObject res = get(datasourceProperties.getParameterMap().get("HostServer"),
                    headers);

        } catch (Exception e) {
            throw new ConnectionEstablishException("Test failed:" + e.getMessage(), e);
        }


    }


    @Override
    public String getType() {
        return "API";
    }

    @Override
    public List<String> getSchemas() {
        List<String> schemas = new ArrayList<>();



        try {
            JSONObject res = get(datasourceProperties.getParameterMap().get("HostServer"),
                    headers);
            JSONObject sch = (JSONObject) res.get("schema");
            schemas.add(sch.getString("name"));

        } catch (Exception ignored) {

        }
        return schemas;
    }

    @Override
    public List<String> getDatabases() {
        return new ArrayList<>();
    }

    /**
     * Closes this stream and releases any system resources associated
     * with it. If the stream is already closed then invoking this
     * method has no effect.
     *
     * <p> As noted in {@link AutoCloseable#close()}, cases where the
     * close may fail require careful attention. It is strongly advised
     * to relinquish the underlying resources and to internally
     * <em>mark</em> the {@code Closeable} as closed, prior to throwing
     * the {@code IOException}.
     *
     * @throws IOException if an I/O error occurs
     */
    @Override
    public void close() throws IOException {
        okHttpClient.dispatcher().executorService().shutdown();
    }

    public JSONObject get(String url, Map<String, String> headerMap) {
        Headers headers = MapToHeaders(headerMap);
        Request request = new Request.Builder()
                .get()
                .url(url)
                .headers(headers)
                .build();
        return this.requestProcessor(request);
    }

    public JSONObject requestProcessor(Request request) {
        Call call = okHttpClient.newCall(request);
        Response response;
        try {
            response = call.execute();
            if (response.isSuccessful()) {
                String responseBody;
                responseBody = Objects.requireNonNull(response.body()).string();
                return JSON.parseObject(responseBody);
            }
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
        return null;
    }
}
