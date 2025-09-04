package com.datablau.base.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

/**
 * @author: hxs
 * @date: 2025/7/25 11:37
 */
@RestController
public class TestSqlController {

//    @Autowired
//    private JdbcTemplate jdbcTemplate;

    @PostMapping("/sql")
    public List<Map<String, Object>> executeSql(@RequestBody String sql) {
        if (sql == null || sql.isBlank()) {
            throw new IllegalArgumentException("sql is null or empty");
        }
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource());
        return jdbcTemplate.queryForList(sql);
    }

    @PostMapping("/sql/update")
    public int executeUpdateSql(@RequestBody String sql) {
        if (sql == null || sql.isBlank()) {
            throw new IllegalArgumentException("sql is null or empty");
        }
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource());
        return jdbcTemplate.update(sql);
    }

    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://10.40.226.195:2883/datablau_metadata?useSSL=false&serverTimezone=UTC");
        dataSource.setUsername("datablau_prod@datablau#bms_sjzt_ob");
        dataSource.setPassword("6fCzR|usNv#o@g7KzaY,;y[{pgQp1wx3");
        return dataSource;
    }
}