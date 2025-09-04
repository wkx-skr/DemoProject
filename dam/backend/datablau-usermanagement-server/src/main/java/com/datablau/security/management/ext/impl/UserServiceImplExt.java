package com.datablau.security.management.ext.impl;

import com.datablau.security.management.impl.UserServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;
import java.util.List;

/**
 * @author nicky - 数语科技有限公司
 * date 2024/5/15 10:53
 */
@Service("userServiceExt")
public class UserServiceImplExt extends UserServiceImpl {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserServiceImplExt.class);
    @Override
    protected void initRole() throws Exception{
        LOGGER.info("in userServiceImplExt!!!");
        super.initRole();
    }


    @Autowired
    protected EntityManagerFactory managerFactory;

    public List<String> a(){
        String sql = "SELECT CONCAT(table_schema, '.', table_name) AS full_table_name FROM information_schema.tables WHERE table_schema = DATABASE()";
        EntityManager em = managerFactory.createEntityManager();
        Query query = em.createNativeQuery(sql);
        List<String> resultList = query.getResultList();
        em.close();
        return resultList;
    }

    public Integer b(){
        EntityManager em = null;
        EntityTransaction transaction = null;
        try {
//            String sql = "INSERT INTO users (username, password, enabled) VALUES ('nacos', '$2a$10$EuWPZHzz32dJN7jexM34MOeYirDdFAZm2kuWj7VEOJhhZkDrxfvUu', TRUE)";
            String sql = "";
            em = managerFactory.createEntityManager();

            transaction = em.getTransaction();
            transaction.begin();

            int i = em.createNativeQuery(sql).executeUpdate();
            transaction.commit();  // 提交事务
            return i;
        }catch (Exception e){
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();  // 回滚事务
            }
            throw new RuntimeException("Insert failed", e);
        }finally {
            if (em != null && em.isOpen()) {
                em.close();  // 关闭EntityManager
            }
        }

    }

    public Integer c(){
        EntityManager em = null;
        EntityTransaction transaction = null;


        try {
//            String sql = "INSERT INTO roles (username, role) VALUES ('nacos', 'ROLE_ADMIN');";
            String sql = "";
            em = managerFactory.createEntityManager();
            transaction = em.getTransaction();
            transaction.begin();

            int i = em.createNativeQuery(sql).executeUpdate();
            transaction.commit();  // 提交事务
            return i;
        }catch (Exception e){
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();  // 回滚事务
            }
            throw new RuntimeException("Insert failed", e);
        }finally {
            if (em != null && em.isOpen()) {
                em.close();  // 关闭EntityManager
            }
        }

    }
}
