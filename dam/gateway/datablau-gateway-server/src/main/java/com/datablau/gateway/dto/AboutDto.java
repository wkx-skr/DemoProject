package com.datablau.gateway.dto;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/4/3 16:02
 */
public class AboutDto implements Serializable {

    private String buildNumber;
    private String version;
    private String buildTimestamp;
    private long   features;
    private String licModelNumber;
    private Date licExpireTime;
    private String licUser;
    private String licCompany;
    private String licEdition;

    private boolean isRelease;
    private String customerId;
    private boolean strongPassword;
    private Set<String> disabledPages;

    private boolean tagRcmdEnabled;
    private boolean knowledgeGraphEnabled;

    private boolean authServerEnabled;

    private Date createTime;

    private boolean esEnabled;

    private int maxInterval;

    public String getBuildNumber() {
        return buildNumber;
    }

    public void setBuildNumber(String buildNumber) {
        this.buildNumber = buildNumber;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getBuildTimestamp() {
        return buildTimestamp;
    }

    public void setBuildTimestamp(String buildTimestamp) {
        this.buildTimestamp = buildTimestamp;
    }

    public long getFeatures() {
        return features;
    }

    public void setFeatures(long features) {
        this.features = features;
    }

    public String getLicModelNumber() {
        return licModelNumber;
    }

    public void setLicModelNumber(String licModelNumber) {
        this.licModelNumber = licModelNumber;
    }

    public boolean isRelease() {
        return isRelease;
    }

    public void setRelease(boolean release) {
        isRelease = release;
    }

//    public Set<String> getDisabledPages() {
//        return disabledPages;
//    }
//
//    public void setDisabledPages(Set<String> disabledPages) {
//        this.disabledPages = disabledPages;
//    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public boolean isStrongPassword() {
        return strongPassword;
    }

    public void setStrongPassword(boolean strongPassword) {
        this.strongPassword = strongPassword;
    }

    public Date getLicExpireTime() {
        return licExpireTime;
    }

    public void setLicExpireTime(Date licExpireTime) {
        this.licExpireTime = licExpireTime;
    }

    public String getLicUser() {
        return licUser;
    }

    public void setLicUser(String licUser) {
        this.licUser = licUser;
    }

    public String getLicCompany() {
        return licCompany;
    }

    public void setLicCompany(String licCompany) {
        this.licCompany = licCompany;
    }

    public String getLicEdition() {
        return licEdition;
    }

    public void setLicEdition(String licEdition) {
        this.licEdition = licEdition;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public boolean isTagRcmdEnabled() {
        return tagRcmdEnabled;
    }

    public void setTagRcmdEnabled(boolean tagRcmdEnabled) {
        this.tagRcmdEnabled = tagRcmdEnabled;
    }

    public boolean isKnowledgeGraphEnabled() {
        return knowledgeGraphEnabled;
    }

    public void setKnowledgeGraphEnabled(boolean knowledgeGraphEnabled) {
        this.knowledgeGraphEnabled = knowledgeGraphEnabled;
    }

    public boolean isAuthServerEnabled() {
        return authServerEnabled;
    }

    public void setAuthServerEnabled(boolean authServerEnabled) {
        this.authServerEnabled = authServerEnabled;
    }

    public boolean isEsEnabled() {
        return esEnabled;
    }

    public void setEsEnabled(boolean esEnabled) {
        this.esEnabled = esEnabled;
    }

    public int getMaxInterval() {
        return maxInterval;
    }

    public void setMaxInterval(int maxInterval) {
        this.maxInterval = maxInterval;
    }
}
