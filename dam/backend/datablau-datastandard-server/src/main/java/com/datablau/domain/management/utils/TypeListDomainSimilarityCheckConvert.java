package com.datablau.domain.management.utils;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.model.common.utility.postgres.BaseUserType;
import com.datablau.domain.management.dto.DomainSimilarityCheckResultDetailDto;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.HibernateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class TypeListDomainSimilarityCheckConvert extends BaseUserType {

    private static final Logger logger = LoggerFactory.getLogger(TypeListDomainSimilarityCheckConvert.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public TypeListDomainSimilarityCheckConvert() {
    }

    public Class returnedClass() {
        return List.class;
    }

    public Object deepCopy(Object value) throws HibernateException {
        if (value == null) {
            return null;
        } else {
            List<DomainSimilarityCheckResultDetailDto> oldList = (List)value;
            List<DomainSimilarityCheckResultDetailDto> newList = new ArrayList();
            newList.addAll(oldList);
            return newList;
        }
    }

    public Serializable disassemble(Object dbData) throws HibernateException {
        if (dbData == null) {
            return null;
        } else {
            try {
                List<DomainSimilarityCheckResultDetailDto> result = (List)objectMapper.readValue(dbData.toString(), new TypeReference<List<DomainSimilarityCheckResultDetailDto>>() {});
                return (Serializable)result;
            } catch (Exception var3) {
                throw new AndorjRuntimeException("convert value from db to pojo failed");
            }
        }
    }

    public Object assemble(Serializable serializable, Object value) throws HibernateException {
        if (value == null) {
            return null;
        } else {
            try {
                return objectMapper.writeValueAsString(value);
            } catch (Exception var4) {
                throw new AndorjRuntimeException("convert value from pojo to db failed");
            }
        }
    }

    static {
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }
}

