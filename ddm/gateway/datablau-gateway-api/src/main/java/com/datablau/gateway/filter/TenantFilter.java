package com.datablau.gateway.filter;

import com.datablau.gateway.dto.TenantParams;
import org.springframework.core.annotation.Order;
import org.springframework.session.data.redis.DatablauSessionRepository;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/7/8
 */
@Order(TenantFilter.DEFAULT_ORDER)
public class TenantFilter extends OncePerRequestFilter {

    public static final int DEFAULT_ORDER = Integer.MIN_VALUE + 49;

    public TenantFilter() {
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try{
            String tenantId = request.getHeader(TenantParams.TENANT_HEADER_ID);
            if(StringUtils.isEmpty(tenantId)){
                DatablauSessionRepository.tdTenantId.set(TenantParams.DEFAULT_TENANT);
            }else {
                DatablauSessionRepository.tdTenantId.set(tenantId);
            }
            filterChain.doFilter(request, response);
        }finally {
            DatablauSessionRepository.tdTenantId.remove();
        }
    }
}
