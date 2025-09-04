package com.datablau.project.api;


import java.util.Map;

public interface RemoteBaseExtendService {
    void sendToWeact(String user, String name, Map<String, Object> content);
}
