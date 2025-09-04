package com.datablau.domain.management.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class JsonUtils {
    private static ObjectMapper objectMapper = new ObjectMapper();

    static {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
    public JsonUtils() {
    }

    public static <T> T toObject(String json, Class<T> objectType) {
        try {
            T obj = objectMapper.readValue(json, objectType);
            return obj;
        } catch (JsonProcessingException var4) {
            throw new RuntimeException(var4);
        }
    }

    public static <T> T toObject(String json, TypeReference<T> valueTypeRef) {
        try {
            T objList = objectMapper.readValue(json, valueTypeRef);
            return objList;
        } catch (JsonProcessingException var4) {
            throw new RuntimeException(var4);
        }
    }

    public static String toJSon(Object object) {
        try {
            String json = objectMapper.writeValueAsString(object);
            return json;
        } catch (JsonProcessingException var3) {
            throw new RuntimeException(var3);
        }
    }

    public static <T> List<T> toObjectList(String json, Class<T> objectType) {
        try {
            List<T> objList = (List)objectMapper.readValue(json, new TypeReference<List<T>>() {
            });
            return objList;
        } catch (JsonProcessingException var4) {
            throw new RuntimeException(var4);
        }
    }
}
