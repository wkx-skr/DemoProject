# Datablau Ddm Projects

**backend目录:**
所有ddm所需的后台微服务

1. 代码编译和运行必须JDK17
2. 如果编译不了，请先进入**backend/datablau-parent**目录执行``` mvn install ```
3. 启动程序样例： 
```shell
#!/bin/bash
instancename="DatablauMetadata"
PRG="$0"
while [ -h "$PRG" ] ; do
  ls=`ls -ld "$PRG"`
  link=`expr "$ls" : '.*-> \(.*\)$'`
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG=`dirname "$PRG"`/"$link"
  fi
done
PRGDIR=`dirname "$PRG"`

export METADATA_HOME=/opt/datablau_metadata
export LOCALAPPDATA=$METADATA_HOME
export JAVA_HOME=/usr/lib/java/jdk-17
export JRE_HOME=/usr/lib/java/jdk-17
echo -e "\033[31m-----------------------------------------------------------------\033[0m"
echo -e "\033[34m Copyright ? 2021 Datablau,Inc. All Rights Reserved.\033[0m"
echo -e "\033[31m-----------------------------------------------------------------\033[0m"
echo -e "\033[33m Now, Startup the Datablau $instancename Service...\033[0m"

echo $METADATA_HOME
loginParam=" -Dspring.cloud.nacos.username=[nacos-user] -Dspring.cloud.nacos.password=[nacos-password] "
jLowS="--add-exports java.base/jdk.internal.loader=ALL-UNNAMED --add-exports java.base/jdk.internal.perf=ALL-UNNAMED  --add-opens=java.security.jgss/sun.security.krb5=ALL-UNNAMED"
nohup $JAVA_HOME/bin/java -XX:+UseG1GC -XX:-OmitStackTraceInFastThrow -Xms2g -Xmx8g -jar $jLowS $loginParam  -Djava.io.tmpdir=$METADATA_HOME/tmp   -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=false -Dspring.cloud.nacos.discovery.ip=[current-machine-address]   -Dspring.cloud.nacos.discovery.port=[service-expose-port] -Dspring.cloud.nacos.discovery.group=DEFAULT_GROUP -Dspring.cloud.nacos.config.group=DEFAULT_GROUP -Dspring.cloud.nacos.discovery.namespace=datablau70 -Dspring.cloud.nacos.discovery.server-addr=[nacos-server-address]:8848  -Dlogging.file.path=$METADATA_HOME/logs $METADATA_HOME/app/datablau-metadata-server*.jar > /dev/null 2>&1 &
```


**frontend目录：**
所有ddm所需的前端代码

