package org.springframework.session.data.redis;

import com.datablau.gateway.dto.TenantParams;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.session.FlushMode;
import org.springframework.session.MapSession;
import org.springframework.session.SaveMode;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/7/8
 */
public class DatablauSessionRepository implements SessionRepository<DatablauSessionRepository.RedisSession> {

    private static final String DEFAULT_KEY_NAMESPACE = "spring:session";

    private final RedisOperations<String, Object> sessionRedisOperations;

    private Duration defaultMaxInactiveInterval = Duration.ofSeconds(MapSession.DEFAULT_MAX_INACTIVE_INTERVAL_SECONDS);

    private String keyNamespace = DEFAULT_KEY_NAMESPACE + ":";

    private FlushMode flushMode = FlushMode.ON_SAVE;

    private SaveMode saveMode = SaveMode.ON_SET_ATTRIBUTE;

    public static final ThreadLocal<String> tdTenantId = new ThreadLocal<>();

    /**
     * Create a new {@link DatablauSessionRepository} instance.
     * @param sessionRedisOperations the {@link RedisOperations} to use for managing
     * sessions
     */
    public DatablauSessionRepository(RedisOperations<String, Object> sessionRedisOperations) {
        Assert.notNull(sessionRedisOperations, "sessionRedisOperations mut not be null");
        this.sessionRedisOperations = sessionRedisOperations;
    }

    /**
     * Set the default maxInactiveInterval.
     * @param defaultMaxInactiveInterval the default maxInactiveInterval
     */
    public void setDefaultMaxInactiveInterval(Duration defaultMaxInactiveInterval) {
        Assert.notNull(defaultMaxInactiveInterval, "defaultMaxInactiveInterval must not be null");
        this.defaultMaxInactiveInterval = defaultMaxInactiveInterval;
    }

    /**
     * Set the key namespace.
     * @param keyNamespace the key namespace
     * @deprecated since 2.4.0 in favor of {@link #setRedisKeyNamespace(String)}
     */
    @Deprecated
    public void setKeyNamespace(String keyNamespace) {
        Assert.hasText(keyNamespace, "keyNamespace must not be empty");
        this.keyNamespace = keyNamespace;
    }

    /**
     * Set the Redis key namespace.
     * @param namespace the Redis key namespace
     */
    public void setRedisKeyNamespace(String namespace) {
        Assert.hasText(namespace, "namespace must not be empty");
        this.keyNamespace = namespace.trim() + ":";
    }

    /**
     * Set the flush mode.
     * @param flushMode the flush mode
     */
    public void setFlushMode(FlushMode flushMode) {
        Assert.notNull(flushMode, "flushMode must not be null");
        this.flushMode = flushMode;
    }

    /**
     * Set the save mode.
     * @param saveMode the save mode
     */
    public void setSaveMode(SaveMode saveMode) {
        Assert.notNull(saveMode, "saveMode must not be null");
        this.saveMode = saveMode;
    }

    @Override
    public RedisSession createSession() {
        MapSession cached = new MapSession();
        cached.setMaxInactiveInterval(this.defaultMaxInactiveInterval);
        RedisSession session = new RedisSession(cached, true);
        session.flushIfRequired();
        return session;
    }

    @Override
    public void save(RedisSession session) {
        if (!session.isNew) {
            String key = getSessionKey(session.hasChangedSessionId() ? session.originalSessionId : session.getId());
            Boolean sessionExists = this.sessionRedisOperations.hasKey(key);
            if (sessionExists == null || !sessionExists) {
                throw new IllegalStateException("Session was invalidated");
            }
        }
        session.save();
    }

    @Override
    public RedisSession findById(String sessionId) {
        String key = getSessionKey(sessionId);
        Map<String, Object> entries = this.sessionRedisOperations.<String, Object>opsForHash().entries(key);
        if (entries.isEmpty()) {
            return null;
        }
        MapSession session = new RedisSessionMapper(sessionId).apply(entries);
        if (session.isExpired()) {
            deleteById(sessionId);
            return null;
        }
        return new RedisSession(session, false);
    }

    @Override
    public void deleteById(String sessionId) {
        String key = getSessionKey(sessionId);
        this.sessionRedisOperations.delete(key);
    }

    /**
     * Returns the {@link RedisOperations} used for sessions.
     * @return the {@link RedisOperations} used for sessions
     */
    public RedisOperations<String, Object> getSessionRedisOperations() {
        return this.sessionRedisOperations;
    }

    private String getSessionKey(String sessionId) {
        String tenantId = tdTenantId.get();
        if(StringUtils.isEmpty(tenantId)){
            return this.keyNamespace + "sessions:" + sessionId;
        }else {
            return tenantId + ":" + this.keyNamespace + "sessions:" + sessionId;
        }
    }

    private static String getAttributeKey(String attributeName) {
        return RedisSessionMapper.ATTRIBUTE_PREFIX + attributeName;
    }

    /**
     * An internal {@link Session} implementation used by this {@link SessionRepository}.
     */
    final class RedisSession implements Session {

        private final MapSession cached;

        private final Map<String, Object> delta = new HashMap<>();

        private boolean isNew;

        private String originalSessionId;

        RedisSession(MapSession cached, boolean isNew) {
            this.cached = cached;
            this.isNew = isNew;
            this.originalSessionId = cached.getId();
            if (this.isNew) {
                this.delta.put(RedisSessionMapper.CREATION_TIME_KEY, cached.getCreationTime().toEpochMilli());
                this.delta.put(RedisSessionMapper.MAX_INACTIVE_INTERVAL_KEY,
                        (int) cached.getMaxInactiveInterval().getSeconds());
                this.delta.put(RedisSessionMapper.LAST_ACCESSED_TIME_KEY, cached.getLastAccessedTime().toEpochMilli());
            }
            if (this.isNew || (DatablauSessionRepository.this.saveMode == SaveMode.ALWAYS)) {
                getAttributeNames().forEach((attributeName) -> this.delta.put(getAttributeKey(attributeName),
                        cached.getAttribute(attributeName)));
            }
        }

        @Override
        public String getId() {
            return this.cached.getId();
        }

        @Override
        public String changeSessionId() {
            return this.cached.changeSessionId();
        }

        @Override
        public <T> T getAttribute(String attributeName) {
            T attributeValue = this.cached.getAttribute(attributeName);
            if (attributeValue != null && DatablauSessionRepository.this.saveMode.equals(SaveMode.ON_GET_ATTRIBUTE)) {
                this.delta.put(getAttributeKey(attributeName), attributeValue);
            }
            return attributeValue;
        }

        @Override
        public Set<String> getAttributeNames() {
            return this.cached.getAttributeNames();
        }

        @Override
        public void setAttribute(String attributeName, Object attributeValue) {
            this.cached.setAttribute(attributeName, attributeValue);
            this.delta.put(getAttributeKey(attributeName), attributeValue);
            flushIfRequired();
        }

        @Override
        public void removeAttribute(String attributeName) {
            setAttribute(attributeName, null);
        }

        @Override
        public Instant getCreationTime() {
            return this.cached.getCreationTime();
        }

        @Override
        public void setLastAccessedTime(Instant lastAccessedTime) {
            this.cached.setLastAccessedTime(lastAccessedTime);
            this.delta.put(RedisSessionMapper.LAST_ACCESSED_TIME_KEY, getLastAccessedTime().toEpochMilli());
            flushIfRequired();
        }

        @Override
        public Instant getLastAccessedTime() {
            return this.cached.getLastAccessedTime();
        }

        @Override
        public void setMaxInactiveInterval(Duration interval) {
            this.cached.setMaxInactiveInterval(interval);
            this.delta.put(RedisSessionMapper.MAX_INACTIVE_INTERVAL_KEY, (int) getMaxInactiveInterval().getSeconds());
            flushIfRequired();
        }

        @Override
        public Duration getMaxInactiveInterval() {
            return this.cached.getMaxInactiveInterval();
        }

        @Override
        public boolean isExpired() {
            return this.cached.isExpired();
        }

        private void flushIfRequired() {
            if (DatablauSessionRepository.this.flushMode == FlushMode.IMMEDIATE) {
                save();
            }
        }

        private boolean hasChangedSessionId() {
            return !getId().equals(this.originalSessionId);
        }

        private void save() {
            saveChangeSessionId();
            saveDelta();
            if (this.isNew) {
                this.isNew = false;
            }
        }

        private void saveChangeSessionId() {
            if (hasChangedSessionId()) {
                if (!this.isNew) {
                    String originalSessionIdKey = getSessionKey(this.originalSessionId);
                    String sessionIdKey = getSessionKey(getId());
                    DatablauSessionRepository.this.sessionRedisOperations.rename(originalSessionIdKey, sessionIdKey);
                }
                this.originalSessionId = getId();
            }
        }

        private void saveDelta() {
            if (this.delta.isEmpty()) {
                return;
            }
            String key = getSessionKey(getId());
            DatablauSessionRepository.this.sessionRedisOperations.opsForHash().putAll(key, new HashMap<>(this.delta));
            DatablauSessionRepository.this.sessionRedisOperations.expireAt(key,
                    Date.from(Instant.ofEpochMilli(getLastAccessedTime().toEpochMilli())
                            .plusSeconds(getMaxInactiveInterval().getSeconds())));
            this.delta.clear();
        }

    }
}
