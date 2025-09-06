package org.springframework.session.data.redis;

import com.datablau.gateway.dto.TenantParams;
import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.ReactiveRedisOperations;
import org.springframework.session.MapSession;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.SaveMode;
import org.springframework.session.Session;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/7/8
 */
public class DatablauReactSessionRepository implements ReactiveSessionRepository<DatablauReactSessionRepository.RedisSession> {
    /**
     * The default namespace for each key and channel in Redis used by Spring Session.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(DatablauReactSessionRepository.class);
    public static final String DEFAULT_NAMESPACE = "spring:session";

    private final ReactiveRedisOperations<String, Object> sessionRedisOperations;

    /**
     * The namespace for every key used by Spring Session in Redis.
     */
    private String namespace = DEFAULT_NAMESPACE + ":";

    /**
     * If non-null, this value is used to override the default value for
     * {@link DatablauReactSessionRepository.RedisSession#setMaxInactiveInterval(Duration)}.
     */
    private Integer defaultMaxInactiveInterval;

    private SaveMode saveMode = SaveMode.ON_SET_ATTRIBUTE;

    /**
     * Create a new {@link DatablauReactSessionRepository} instance.
     * @param sessionRedisOperations the {@link ReactiveRedisOperations} to use for
     * managing sessions
     */
    public DatablauReactSessionRepository(ReactiveRedisOperations<String, Object> sessionRedisOperations) {
        Assert.notNull(sessionRedisOperations, "sessionRedisOperations cannot be null");
        this.sessionRedisOperations = sessionRedisOperations;
    }

    public void setRedisKeyNamespace(String namespace) {
        Assert.hasText(namespace, "namespace cannot be null or empty");
        this.namespace = namespace.trim() + ":";
    }

    /**
     * Sets the maximum inactive interval in seconds between requests before newly created
     * sessions will be invalidated. A negative time indicates that the session will never
     * timeout. The default is 1800 (30 minutes).
     * @param defaultMaxInactiveInterval the number of seconds that the {@link Session}
     * should be kept alive between client requests.
     */
    public void setDefaultMaxInactiveInterval(int defaultMaxInactiveInterval) {
        this.defaultMaxInactiveInterval = defaultMaxInactiveInterval;
    }

    /**
     * Set the save mode.
     * @param saveMode the save mode
     */
    public void setSaveMode(SaveMode saveMode) {
        Assert.notNull(saveMode, "saveMode must not be null");
        this.saveMode = saveMode;
    }

    /**
     * Returns the {@link ReactiveRedisOperations} used for sessions.
     * @return the {@link ReactiveRedisOperations} used for sessions
     */
    public ReactiveRedisOperations<String, Object> getSessionRedisOperations() {
        return this.sessionRedisOperations;
    }

    @Override
    public Mono<DatablauReactSessionRepository.RedisSession> createSession() {
        return Mono.defer(() -> {
            MapSession cached = new MapSession();
            if (this.defaultMaxInactiveInterval != null) {
                cached.setMaxInactiveInterval(Duration.ofSeconds(this.defaultMaxInactiveInterval));
            }
            DatablauReactSessionRepository.RedisSession session = new DatablauReactSessionRepository.RedisSession(cached, true);
            return Mono.just(session);
        });
    }

    @Override
    public Mono<Void> save(DatablauReactSessionRepository.RedisSession session) {
        if (session.isNew) {
            return session.save();
        }
        return Mono.subscriberContext().map(context -> (String)context.getOrDefault(TenantParams.TENANT_ID, TenantParams.DEFAULT_TENANT))
                .flatMap(sessionKey -> {
                    sessionKey = getSessionKey(sessionKey, session.hasChangedSessionId() ? session.originalSessionId : session.getId());
                    return this.sessionRedisOperations.hasKey(sessionKey).flatMap(
                            (exists) -> exists ? session.save() : Mono.error(new IllegalStateException("Session was invalidated")));
                });
    }

    @Override
    public Mono<DatablauReactSessionRepository.RedisSession> findById(String id) {
        return Mono.subscriberContext().map(context -> (String)context.getOrDefault(TenantParams.TENANT_ID, TenantParams.DEFAULT_TENANT))
                .flatMap(sessionKey -> {
                    sessionKey = getSessionKey(sessionKey, id);
                    return this.sessionRedisOperations.opsForHash().entries(sessionKey)
                            .collectMap((e) -> e.getKey().toString(), Map.Entry::getValue)
                            .filter((map) -> !map.isEmpty())
                            .map(new RedisSessionMapper(id))
                            .filter((session) -> !session.isExpired())
                            .map((session) -> new DatablauReactSessionRepository.RedisSession(session, false))
                            .switchIfEmpty(Mono.defer(() -> deleteById(id).then(Mono.empty())));
                });

        // @formatter:off

        // @formatter:on
    }

    @Override
    public Mono<Void> deleteById(String id) {
        return Mono.subscriberContext().map(context -> (String)context.getOrDefault(TenantParams.TENANT_ID, TenantParams.DEFAULT_TENANT))
                .flatMap(sessionKey -> {
                    sessionKey = getSessionKey(sessionKey, id);
                    return this.sessionRedisOperations.delete(sessionKey).then();
                });

    }

    private static String getAttributeKey(String attributeName) {
        return RedisSessionMapper.ATTRIBUTE_PREFIX + attributeName;
    }

    private String getSessionKey(String sessionId) {
        return this.namespace + "sessions:" + sessionId;
    }

    public String getSessionKey(String tenantId, String sessionId) {
        String id = "";
        if(StringUtils.isEmpty(tenantId)){
            id = this.namespace + "sessions:" + sessionId;
        }else {
            id = tenantId + ":" + this.namespace + "sessions:" + sessionId;
        }
        LOGGER.debug(id);
        return id;
    }

    /**
     * A custom implementation of {@link Session} that uses a {@link MapSession} as the
     * basis for its mapping. It keeps track of any attributes that have changed. When
     * {@link DatablauReactSessionRepository.RedisSession#saveDelta()} is invoked all the attributes that have been
     * changed will be persisted.
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
            if (this.isNew || (DatablauReactSessionRepository.this.saveMode == SaveMode.ALWAYS)) {
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
            if (attributeValue != null
                    && DatablauReactSessionRepository.this.saveMode.equals(SaveMode.ON_GET_ATTRIBUTE)) {
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
        }

        @Override
        public void removeAttribute(String attributeName) {
            this.cached.removeAttribute(attributeName);
            this.delta.put(getAttributeKey(attributeName), null);
        }

        @Override
        public Instant getCreationTime() {
            return this.cached.getCreationTime();
        }

        @Override
        public void setLastAccessedTime(Instant lastAccessedTime) {
            this.cached.setLastAccessedTime(lastAccessedTime);
            this.delta.put(RedisSessionMapper.LAST_ACCESSED_TIME_KEY, getLastAccessedTime().toEpochMilli());
        }

        @Override
        public Instant getLastAccessedTime() {
            return this.cached.getLastAccessedTime();
        }

        @Override
        public void setMaxInactiveInterval(Duration interval) {
            this.cached.setMaxInactiveInterval(interval);
            this.delta.put(RedisSessionMapper.MAX_INACTIVE_INTERVAL_KEY, (int) getMaxInactiveInterval().getSeconds());
        }

        @Override
        public Duration getMaxInactiveInterval() {
            return this.cached.getMaxInactiveInterval();
        }

        @Override
        public boolean isExpired() {
            return this.cached.isExpired();
        }

        private boolean hasChangedSessionId() {
            return !getId().equals(this.originalSessionId);
        }

        private Mono<Void> save() {
            return Mono.defer(() -> saveChangeSessionId().then(saveDelta()).doOnSuccess((aVoid) -> this.isNew = false));
        }

        private Mono<Void> saveDelta() {
            if (this.delta.isEmpty()) {
                return Mono.empty();
            }

            return Mono.subscriberContext().map(context -> (String)context.getOrDefault(TenantParams.TENANT_ID, TenantParams.DEFAULT_TENANT))
                    .flatMap(sessionKey -> {
                        sessionKey = getSessionKey(sessionKey, getId());
                        Mono<Boolean> update = DatablauReactSessionRepository.this.sessionRedisOperations.opsForHash()
                                .putAll(sessionKey, new HashMap<>(this.delta));
                        Mono<Boolean> setTtl;
                        if (getMaxInactiveInterval().getSeconds() >= 0) {
                            setTtl = DatablauReactSessionRepository.this.sessionRedisOperations.expire(sessionKey,
                                    getMaxInactiveInterval());
                        }
                        else {
                            setTtl = DatablauReactSessionRepository.this.sessionRedisOperations.persist(sessionKey);
                        }

                        return update.and(setTtl).and((s) -> {
                            this.delta.clear();
                            s.onComplete();
                        }).then();
                    });
        }

        private Mono<Void> saveChangeSessionId() {
            if (!hasChangedSessionId()) {
                return Mono.empty();
            }

            String sessionId = getId();

            Publisher<Void> replaceSessionId = (s) -> {
                this.originalSessionId = sessionId;
                s.onComplete();
            };

            if (this.isNew) {
                return Mono.from(replaceSessionId);
            }
            else {
                return Mono.subscriberContext().map(context -> (String)context.getOrDefault(TenantParams.TENANT_ID, TenantParams.DEFAULT_TENANT))
                        .flatMap(sessionKey -> {
                            String newSession = getSessionKey(sessionKey, sessionId);
                            String originalSessionKey = getSessionKey(sessionKey, originalSessionId);
                            LOGGER.info("rename op: new sessionId" + newSession + "old sessionId" + originalSessionKey + "original/session" + originalSessionId + ":" + sessionId);
                            return DatablauReactSessionRepository.this.sessionRedisOperations.rename(originalSessionKey, newSession)
                                    .and(replaceSessionId);
                        });

            }
        }

    }
}
