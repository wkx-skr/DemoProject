package com.datablau.metadata.main.ext;

import com.datablau.metadata.main.dto.TableMetadataMessageDto;

/**
 * @ClassName：DataModelSyncUdpService
 * @Author: dingzicheng
 * @Date: 2025/8/21 21:11
 * @Description: 消息同步udp服务
 */
public interface DataModelSyncUdpService {
    /**
     *
     *
     * 消费udp同步消息
     * @param: dto - [TableMetadataMessageDto]
     * @return
     */
    void syncDataModelUdp(TableMetadataMessageDto dto);
}
