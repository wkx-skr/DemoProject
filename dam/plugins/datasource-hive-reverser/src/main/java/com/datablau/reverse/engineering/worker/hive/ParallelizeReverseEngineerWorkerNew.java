package com.datablau.reverse.engineering.worker.hive;

import com.datablau.datasource.util.ConnectionManager;
import com.datablau.reverse.engineering.worker.utility.WorkerJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @ClassName：ParallelizeReverseEngineerWorker
 * @Author: dingzicheng
 * @Date: 2025/6/27 22:35
 * @Description: 获取索引等信息
 */
public class ParallelizeReverseEngineerWorkerNew {
    private static final Logger LOGGER = LoggerFactory.getLogger(ParallelizeReverseEngineerWorkerNew.class);
    private static final int JOB_CONCURRENCY = 4;
    private List<Connection> currentConnections;
    protected ConnectionManager connectionManager;
    private ExecutorService executorService;
    private BlockingQueue<WorkerJob> jobs = new LinkedBlockingQueue(100);
    private List<WorkerJob> endJobs = new ArrayList();
    private CountDownLatch countDownLatch;

    public ParallelizeReverseEngineerWorkerNew(ConnectionManager connectionManager) {
        this.connectionManager = connectionManager;
        this.executorService = Executors.newFixedThreadPool(4, new ThreadFactory() {
            private AtomicInteger id = new AtomicInteger(0);

            public Thread newThread(Runnable r) {
                Thread t = new Thread(r, "PRE-WORKER-" + this.id.getAndIncrement());
                return t;
            }
        });
        this.countDownLatch = new CountDownLatch(4);
    }

    public void startBatchOfJob() {
        this.endJobs.clear();
        this.currentConnections = getConnections(4);

        for(int i = 0; i < 4; ++i) {
            this.executorService.submit(new LocalWorker((Connection)this.currentConnections.get(i)));
            this.endJobs.add(new WorkerJob() {
                public void execute(Connection connection) {
                    throw ParallelizeReverseEngineerWorkerNew.this.new EndOfJobException();
                }
            });
        }

    }

    public List<Connection> getConnections(int size) {
        List<Connection> result = new ArrayList();

        for(int i = 0; i < size; ++i) {
            result.add(this.connectionManager.borrowConnection());
        }

        return result;
    }

    public void endBatchOfJobs() {
        Iterator var1 = this.endJobs.iterator();

        while(var1.hasNext()) {
            WorkerJob job = (WorkerJob)var1.next();

            try {
                this.submitJob(job);
            } catch (InterruptedException var5) {
            }
        }

        try {
            this.countDownLatch.await();
        } catch (InterruptedException var4) {
        }

    }

    public void submitJob(WorkerJob job) throws InterruptedException {
        this.jobs.put(job);
    }

    private class LocalWorker implements Runnable {
        Connection connection;

        LocalWorker(Connection connection) {
            this.connection = connection;
        }

        public void run() {
            try {
                while(true) {
                    try {
                        WorkerJob job = (WorkerJob) ParallelizeReverseEngineerWorkerNew.this.jobs.take();
                        job.execute(this.connection);
                    } catch (InterruptedException var7) {
                        break;
                    } catch (EndOfJobException var8) {
                        break;
                    } catch (Throwable var9) {
                        ParallelizeReverseEngineerWorkerNew.LOGGER.warn("failed to run the job:" + var9.getMessage(), var9);
                    }
                }
            } finally {
                ParallelizeReverseEngineerWorkerNew.this.countDownLatch.countDown();
            }

        }
    }

    private class EndOfJobException extends RuntimeException {
        private EndOfJobException() {
        }
    }
}
