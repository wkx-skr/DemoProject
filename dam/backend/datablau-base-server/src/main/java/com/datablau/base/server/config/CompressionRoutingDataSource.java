//package com.datablau.base.server.config;
//
//import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
//
///**
// * @author zhiqiang
// */
//public class CompressionRoutingDataSource extends AbstractRoutingDataSource {
//    private static final ThreadLocal<Boolean> USE_COMPRESSION = ThreadLocal.withInitial(() -> true);
//
//    public static void enableCompression() {
//        USE_COMPRESSION.set(true);
//    }
//
//    public static void disableCompression() {
//        USE_COMPRESSION.set(false);
//    }
//
//    @Override
//    protected Object determineCurrentLookupKey() {
//
//        String key = USE_COMPRESSION.get() ? "defaultDataSource" : "noCompressedDataSource";
//        System.out.println("使用:"+key);
//        return key;
//    }
//}
