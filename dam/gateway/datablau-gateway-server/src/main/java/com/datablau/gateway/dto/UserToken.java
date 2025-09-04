package com.datablau.gateway.dto;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.util.Collection;
import java.util.Set;
import org.springframework.security.core.GrantedAuthority;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/11/29 19:00
 */
public class UserToken {
    private String username;
    private String remoteIp;
    private Collection<? extends GrantedAuthority> roles;
    private Long expireLimit;
    private Long createTime;

    public UserToken() {
        this.createTime = System.currentTimeMillis();
    }

    public UserToken(String username, String remoteIp,
        Set<GrantedAuthority> roles, Long expireLimit) {
        this.username = username;
        this.remoteIp = remoteIp;
        this.roles = roles;
        this.expireLimit = expireLimit;
        this.createTime = System.currentTimeMillis();
    }

    public String parseToString(){
        ObjectMapper objectMapper = new ObjectMapper();
        try{
            String token = objectMapper.writeValueAsString(this);
            return Base64.getEncoder().encodeToString(token.getBytes());
        }catch (Exception e){
            throw new RuntimeException("init token failed cause by:"+e.getMessage());}
    }

    public Long getExpireLimit() {
        return expireLimit;
    }

    public void setExpireLimit(Long expireLimit) {
        this.expireLimit = expireLimit;
    }

    public Long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Long createTime) {
        this.createTime = createTime;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRemoteIp() {
        return remoteIp;
    }

    public void setRemoteIp(String remoteIp) {
        this.remoteIp = remoteIp;
    }

    public Collection<? extends GrantedAuthority> getRoles() {
        return roles;
    }

    public void setRoles(Collection<? extends GrantedAuthority> roles) {
        this.roles = roles;
    }
}
