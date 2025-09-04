package com.datablau.datasources.hive;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.andorj.model.common.utility.AndorjClassLoader;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.DigestUtils;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.*;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.datablau.datasource.util.ConnectionManager;
import com.datablau.datasource.util.ConnectionWrapper;
import com.datablau.datasource.util.DataAccessCustomDriverManager;
import com.datablau.datasource.util.DatasourceManager;
import com.google.common.base.Strings;
import com.nimbusds.jose.shaded.gson.Gson;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.util.CollectionUtils;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.sql.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * @program: datablau-datasource-plugins
 * @description: hive
 * @author: wang tong
 * @create: 2023-05-09 14:08
 **/
public class HiveDatasource implements Datasource, ReverseDelegator, ConnectionManager {

    private static final Logger LOGGER = LoggerFactory.getLogger(HiveDatasource.class);

    private static final int FETCH_SIZE = 2000;

    private DatasourceProperties datasourceProperties;

    protected Driver driver;

    protected List<Connection> connections = new CopyOnWriteArrayList();

    protected Map<Connection, Connection> borrowedConnections = new ConcurrentHashMap();

    private static RemoteFileLoader fileLoader;

    private static Map<String, Driver> localLoadedDrivers = new ConcurrentHashMap();

    private static DataAccessCustomDriverManager dataAccessCustomDriverManager;

    private static DatasourceManager datasourceManager;

    private AtomicBoolean quitKeepAlived = new AtomicBoolean(false);

    private Gson gson = new Gson();

    protected DataAccessCustomDriverManager getDataAccessCustomDriverManager() {
        if (dataAccessCustomDriverManager == null) {
            Class var1 = DatasourceJdbcBase.class;
            synchronized(DatasourceJdbcBase.class) {
                if (dataAccessCustomDriverManager == null) {
                    dataAccessCustomDriverManager = (DataAccessCustomDriverManager) BeanHelper.getBean(DataAccessCustomDriverManager.class);
                    if (dataAccessCustomDriverManager == null) {
                        throw new UnexpectedStateException("Unable to get DataAccessCustomDriverManager");
                    }
                }
            }
        }

        return dataAccessCustomDriverManager;
    }


    protected DatasourceManager getDatasourceManager() {
        if (datasourceManager == null) {
            Class var1 = DatasourceJdbcBase.class;
            synchronized(DatasourceJdbcBase.class) {
                if (datasourceManager == null) {
                    datasourceManager = (DatasourceManager)BeanHelper.getBean(DatasourceManager.class);
                    if (datasourceManager == null) {
                        throw new UnexpectedStateException("Unable to get DatasourceManager");
                    }
                }
            }
        }

        return datasourceManager;
    }
    @Override
    public UUID getUniqueId() {
        return UUID.fromString("1e345e89-8ea3-4a0f-895e-50e6c18e975c");
    }

    public Connection getConnection() {
        return this.borrowConnection();
    }

    //    @Override
    public List<Connection> getConnections(int size) {
        List<Connection> result = new ArrayList();

        for(int i = 0; i < size; ++i) {
            result.add(this.borrowConnection());
        }

        return result;
    }


    @Override
    public void testConnection() throws ConnectionEstablishException {
        try (Connection c = getConnection()) {
            if (c == null) {
                throw new ConnectionEstablishException("Unable to call isValid function on the connection");
            }
        } catch (Exception ex) {
            LOGGER.error("connection error:{}", ex);
            throw new ConnectionEstablishException("Unable to create the connection", ex);
        }
    }

    @Override
    public String getType() {
        return "HIVE";
    }

    @Override
    public List<String> getSchemas() {
        List<String> schemas = new ArrayList();
        ResultSet rs = null;

        try {
            DatabaseMetaData dmd = this.getConnection().getMetaData();
            rs = dmd.getSchemas();

            while(rs.next()) {
                schemas.add(rs.getString("TABLE_SCHEM"));
            }
        } catch (SQLException var11) {
            throw new UnexpectedStateException("Unable to get schemas:" + var11.getMessage(), var11);
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
            } catch (Exception var10) {
            }

            try {
                this.close();
            } catch (IOException e) {
                LOGGER.warn("datasource close error:{}", e);
            }
        }

        return schemas;
    }

    public synchronized void returnConnection(Connection connection) {
        try {
            this.borrowedConnections.remove(connection);
            this.connections.add(connection);
        } finally {
            LOGGER.info("after return connection, current datasource \"" + this.getType() + "\" status:");
            Logger var10000 = LOGGER;
            int var10001 = this.borrowedConnections.size();
            var10000.info("borrowed:" + var10001 + "/idle:" + this.connections.size());
        }

    }

    public synchronized Connection borrowConnection() {
        Connection var3;
        try {
            if (this.connections.isEmpty()) {
                try {
                    if (!this.connect()) {
                        throw new UnexpectedStateException("Failed to create jdbc connection");
                    }
                } catch (Exception var7) {
                    LOGGER.error("connect error:{}", var7);
                    throw new UnexpectedStateException("Failed to get connection", var7);
                }
            }

            Connection realConnection = (Connection)this.connections.get(0);
//            this.connections.remove(realConnection);
            if (borrowedConnections.isEmpty()) {
                Connection toBeBorrowed = (Connection) ProxyFactory.getProxy(Connection.class, new ConnectionWrapper(realConnection, this));
                this.borrowedConnections.put(realConnection, toBeBorrowed);
                var3 = toBeBorrowed;
            } else {
                var3 = borrowedConnections.get(realConnection);
            }


        } finally {
            LOGGER.info("after borrow connections, current datasource \"" + this.getType() + "\" status:");
            Logger var10000 = LOGGER;
            int var10001 = this.borrowedConnections.size();
            var10000.info("borrowed:" + var10001 + "/idle:" + this.connections.size());
        }

        return var3;
    }

    protected boolean connect() throws Exception {
        if (this.getProperties().getConnectType() == ConnectType.JDBC) {
            return this.connect(this.getProperties().getCredentialInfo());
        } else {
            return this.getProperties().getConnectType() == ConnectType.WebLogic ? this.connectWebLogic() : false;
        }
    }


    protected void addConnection(Connection connection) {
        if (connection != null) {
            this.connections.add(connection);
        } else {
            StackTraceElement[] ste = Thread.currentThread().getStackTrace();
            if (ste.length > 1) {
                Logger var10000 = LOGGER;
                String var10001 = ste[0].getClassName();
                var10000.warn("trying to add a null connection by :" + var10001 + ":" + ste[0].getMethodName());
            }
        }

    }

    private boolean connectWebLogic() throws Exception {
        String host = this.getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = this.getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String jdniName = this.getProperties().getParameter(DatasourceKnownParameterType.JNDIName.toString());
        Properties props = new Properties();
        props.put("java.naming.factory.initial", "weblogic.jndi.WLInitialContextFactory");
        Context context = new InitialContext(props);
        DataSource ds = (DataSource)context.lookup(jdniName);
        LOGGER.debug("Going to create connection(s)");
        boolean result = true;

        try {
            this.addConnection(ds.getConnection());
        } catch (Exception var9) {
            result = false;
            this.close();
            LOGGER.error("Failed to create expected connections ", var9);
        }

        return result;
    }

    protected DatabaseMetaData getDatabaseMetadata() {
        try {
            return this.getConnection().getMetaData();
        } catch (SQLException var2) {
            throw new UnexpectedStateException("Unable to get database metadata:" + var2.getMessage());
        }
    }
    private boolean connect(CredentialInfo info) throws Exception {
        Properties props = new Properties();
        String url = null;
        String connUrl = this.getProperties().getConnUrl();
        if (StringUtils.isNotBlank(connUrl)) {
            url = connUrl;
        } else {
            url = this.getUrl();
        }

        int authenticationType = Integer.parseInt(this.getProperties().getParameter(DatasourceKnownParameterType.AuthenticationType.toString()));
        ClassLoader currentLoader = null;
        if (this.driver != null && this.driver.getClass().getClassLoader() instanceof AndorjClassLoader) {
            currentLoader = Thread.currentThread().getContextClassLoader();
            ClassLoader cl = this.driver.getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(cl);
        }

        try {
            switch (authenticationType) {
                case 0:
                    props.put("user", info.getUser());
                    props.put("password", DigestUtils.decryptIfIsEncrypted(info.getPassword()));
                    break;
                case 1:
                    Method mMajorVer = Driver.class.getMethod("getMajorVersion");
                    Method mMinorVer = Driver.class.getMethod("getMinorVersion");
                    Object majorVer = mMajorVer.invoke(this.driver);
                    Object minorVer = mMinorVer.invoke(this.driver);
                    LOGGER.info("driver major ver:" + majorVer);
                    LOGGER.info("driver minor ver:" + minorVer);
                    if (ObjectUtils.equals(-1949, majorVer) && ObjectUtils.equals(-1001, minorVer)) {
                        try {
                            this.getConnectionByUsingCustomDriver();
                        } catch (Exception var18) {
                            this.close();
                            LOGGER.error("Failed to create expected connections");
                            boolean var12 = false;
                            return var12;
                        }
                    } else {
                        this.kerberosUseDbFile();
                    }
            }

            LOGGER.info("going to connect with jdbc url : " + url);
            boolean result = true;

            try {
                this.createConnection(url, props);
            } catch (Exception var17) {
                result = false;
                this.close();
                LOGGER.error("Failed to create expected connections", var17);
            }

            boolean var22 = result;
            return var22;
        } finally {
            if (currentLoader != null) {
                Thread.currentThread().setContextClassLoader(currentLoader);
            }

        }
    }

    protected boolean createConnection(String url, Properties props) throws Exception {
        try {
            if (this.driver != null) {
                this.addConnection(this.driver.connect(url, props));
                return true;
            } else {
                LOGGER.error("The jdbc driver is null");
                return false;
            }
        } catch (SQLException var4) {
            LOGGER.error("Connection Failed! Check output console", var4);
            throw var4;
        }
    }

    private void kerberosUseDbFile() throws Exception {
        Class configClass = this.loadClass("org.apache.hadoop.conf.Configuration");
        Object hadoopConf = configClass.newInstance();
        String krb5FileId = this.getProperties().getParameter(DatasourceKnownParameterType.Krb5Path.toString());
        String keyTabFileId = this.getProperties().getParameter(DatasourceKnownParameterType.KeyTabPath.toString());
        File krb5File = this.getDriverUtil().loadFileToLocal(krb5FileId, "krb5");
        File keyTabFile = null;
        if (!Strings.isNullOrEmpty(keyTabFileId)) {
            keyTabFile = this.getDriverUtil().loadFileToLocal(keyTabFileId, "keytab");
        }

        if (krb5File != null && krb5File.exists()) {
            System.setProperty("java.security.krb5.conf", krb5File.getAbsolutePath());
            LOGGER.info("krb5 file : " + krb5File.getAbsolutePath());
        }

//        this.setContextForKerberos();
        Method confSetMethod = configClass.getMethod("set", String.class, String.class);
        confSetMethod.invoke(hadoopConf, "hadoop.security.authentication", "Kerberos");
        Class userGroupClass = this.loadClass("org.apache.hadoop.security.UserGroupInformation");
        Method setConfMethod = null;
        Method loginUserFromSubjectMethod = null;
        Method loginUserFromKeytabMethod = null;
        Method[] var12 = userGroupClass.getMethods();
        int var13 = var12.length;

        for(int var14 = 0; var14 < var13; ++var14) {
            Method method = var12[var14];
            if (method.getName().equals("setConfiguration")) {
                setConfMethod = method;
            } else if (method.getName().equals("loginUserFromSubject")) {
                loginUserFromSubjectMethod = method;
            } else if (method.getName().equals("loginUserFromKeytab")) {
                loginUserFromKeytabMethod = method;
            }
        }

        if (setConfMethod == null) {
            throw new UnexpectedStateException("unable to find setConfMethod");
        } else {
            setConfMethod.invoke((Object)null, hadoopConf);
            String servicePrincipal = this.getProperties().getParameter(DatasourceKnownParameterType.ServicePrincipal.toString());
            String userPrincipal = this.getProperties().getParameter(DatasourceKnownParameterType.UserPrincipal.toString());
            if (Strings.isNullOrEmpty(servicePrincipal)) {
                throw new Exception("Service Principal can't be empty!");
            } else {
                if (Strings.isNullOrEmpty(userPrincipal)) {
                    if (loginUserFromSubjectMethod == null) {
                        throw new UnexpectedStateException("Unable to find loginUserFromSubject method");
                    }

                    loginUserFromSubjectMethod.invoke((Object)null, null);
                } else {
                    if (keyTabFile == null || !keyTabFile.exists()) {
                        throw new Exception("Cannot find keytab file!");
                    }

                    LOGGER.info("key tab file : " + keyTabFile.getAbsolutePath());
                    if (loginUserFromKeytabMethod == null) {
                        throw new UnexpectedStateException("Unable to find loginUserFromKeytab method");
                    }

                    loginUserFromKeytabMethod.invoke((Object)null, userPrincipal, keyTabFile.getAbsolutePath());
                }

            }
        }
    }

    protected synchronized RemoteFileLoader getDriverUtil() {
        if (fileLoader == null) {
            fileLoader = (RemoteFileLoader)BeanHelper.getBeanByName("remoteFileLoader");
        }

        return fileLoader;
    }

    private Class loadClass(String classPath) throws ClassNotFoundException {
        try {
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            return cl.loadClass(classPath);
        } catch (ClassNotFoundException var3) {
            return this.getClass().getClassLoader().loadClass(classPath);
        }
    }

    private boolean getConnectionByUsingCustomDriver() throws Exception {
        String krb5FileId = this.getProperties().getParameter(DatasourceKnownParameterType.Krb5Path.toString());
        String keyTabFileId = this.getProperties().getParameter(DatasourceKnownParameterType.KeyTabPath.toString());
        File krb5File = this.getDriverUtil().loadFileToLocal(krb5FileId, "krb5");
        File keyTabFile = this.getDriverUtil().loadFileToLocal(keyTabFileId, "keytab");
        String servicePrincipal = this.getProperties().getParameter(DatasourceKnownParameterType.ServicePrincipal.toString());
        String userPrincipal = this.getProperties().getParameter(DatasourceKnownParameterType.UserPrincipal.toString());
        if (Strings.isNullOrEmpty(servicePrincipal)) {
            throw new InvalidArgumentException("Service Principal can't be empty!");
        } else {
            Method getConnectionMethod;
            Object connection;
            if (Strings.isNullOrEmpty(userPrincipal)) {
                getConnectionMethod = this.driver.getClass().getMethod("getConnection", String.class, String.class, String.class);
                if (getConnectionMethod == null) {
                    throw new UnexpectedStateException("unable to find getConnection(String, String, String) in " + this.driver.getClass().getName());
                } else {
                    connection = getConnectionMethod.invoke((Object)null, servicePrincipal, keyTabFile.getAbsolutePath(), krb5File.getAbsolutePath());
                    if (connection != null) {
                        this.addConnection((Connection)connection);
                        return true;
                    } else {
                        throw new UnexpectedStateException("unable to get connection by calling getConnection(String, String, String), parameters are :[" + servicePrincipal + "][" + keyTabFile.getAbsolutePath() + "][" + krb5File.getAbsolutePath() + "]");
                    }
                }
            } else {
                getConnectionMethod = this.driver.getClass().getMethod("getConnection", String.class, String.class, String.class, String.class);
                if (getConnectionMethod == null) {
                    throw new UnexpectedStateException("unable to find getConnection(String, String, String, String) in " + this.driver.getClass().getName());
                } else {
                    connection = getConnectionMethod.invoke((Object)null, userPrincipal, servicePrincipal, keyTabFile.getAbsolutePath(), krb5File.getAbsolutePath());
                    if (connection != null) {
                        this.addConnection((Connection)connection);
                        return true;
                    } else {
                        throw new UnexpectedStateException("unable to get connection by calling getConnection(String, String, String, String), parameters are :[" + userPrincipal + "][" + servicePrincipal + "][" + keyTabFile.getAbsolutePath() + "][" + krb5File.getAbsolutePath() + "]");
                    }
                }
            }
        }
    }
    @Override
    public void setProperties(DatasourceProperties properties) {
        this.datasourceProperties = properties;
        if (properties != null) {
            this.datasourceProperties = properties;
            if (this.datasourceProperties != null && this.datasourceProperties.getDriverId() != null) {
                try {
                    this.driver = this.getDataAccessCustomDriverManager().getDriver(this.datasourceProperties.getDriverId());
                } catch (Exception var5) {
                    throw new UnexpectedStateException("Unable to load driver", var5);
                }
            } else {
                String className = this.getDatasourceManager().getJdbcDriverClass(properties.getType());
                if (!Strings.isNullOrEmpty(className)) {
                    if (localLoadedDrivers.containsKey(className)) {
                        this.driver = (Driver)localLoadedDrivers.get(className);
                        LOGGER.info("using registered driver for " + className);
                        return;
                    }

                    Class driverClass;
                    try {
                        driverClass = this.getClass().getClassLoader().loadClass(className);
                    } catch (ClassNotFoundException var7) {
                        throw new InvalidArgumentException("The driver ID should not be null - not found class " + className);
                    }

                    try {
                        Object object = driverClass.newInstance();
                        if (object instanceof Driver) {
                            localLoadedDrivers.putIfAbsent(className, (Driver)object);
                            this.driver = (Driver)localLoadedDrivers.get(className);
                            Logger var10000 = LOGGER;
                            String var10001 = properties.getType();
                            var10000.info("Datasource \"" + var10001 + "\" is using local jdbc driver class \"" + className + "\"");
                            return;
                        }
                    } catch (Exception var6) {
                        LOGGER.warn("Unable to new driver instance for class " + className);
                    }
                }

                throw new InvalidArgumentException("The driver ID should not be null");
            }
        }
    }

    @Override
    public DatasourceProperties getProperties() {
        return this.datasourceProperties;
    }


    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString()).trim().split(";")[0];

        String url = String.format("jdbc:hive2://%s:%s/%s", host, port, db);

        int authenticationType = Integer.parseInt(getProperties().getParameter(DatasourceKnownParameterType.AuthenticationType.toString()));
        if (authenticationType == 1) {
            String servicePrincipal = getProperties().getParameter(DatasourceKnownParameterType.ServicePrincipal.toString());
            url += ";principal=" + servicePrincipal;
        }

        return url;
    }

    //    @Override
    public String getDriverTypeName() {
        return "Hive";
    }

    //    @Override
    public String quoteName(String name) {
        return name;
    }

    //    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        String baseSql = " FROM " + schema + "." + table;
        if (countSql) {
            return " SELECT COUNT(*) " + baseSql;
        }

        baseSql =  " SELECT * " + baseSql;

        if (page == null) {
            return baseSql;
        } else {
            int pageSize = page.getPageSize();
            int currentPage = page.getCurrentPage();

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(sort.getField() + " " +
                            sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return baseSql + " LIMIT " + ((currentPage - 1) * pageSize) + " , " + pageSize;
        }
    }

    @Override
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList<>();
        String sql = "show databases";
        try (Statement stmt = this.getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                dblist.add(rs.getString(1));
            }
        } catch (SQLException e) {
            LOGGER.error("kudu getDatabases failed", e);
        }
        return dblist;
    }


//    public static void main(String[] args) {
//
//
//            Configuration conf = new Configuration();
//            conf.set("hadoop.security.authentication", "Kerberos");
//            String krb5File ="D:\\中石化\\生产环境连接信息\\krb5.conf";
//            String keyTabFile = "D:\\中石化\\生产环境连接信息\\sjfw_rfcywlpt00 (生产).keytab";
//
//           // if (krb5File != null && krb5File.exists()) {
//                System.setProperty("java.security.krb5.conf", krb5File);
//                //LOGGER.info("krb5 file : " + krb5File.getAbsolutePath());
//           // }
//            String userPrincipal = "sjfw_rfcsykj00";
//            LOGGER.info("userPrincipal is:{}", userPrincipal);
//            UserGroupInformation.setConfiguration(conf);
//
//            UserGroupInformation ugi = UserGroupInformation.loginUserFromKeytabAndReturnUGI(userPrincipal, keyTabFile);
//
//            //Map<String, String> parameterMap = datasourceProperties.getParameterMap();
//            //KuduClient client=null;
//            //if (parameterMap.containsKey("KuduHostServerUrl")) {
//                String kuduHostServerUrl = "10.5.141.2:7051,10.5.141.3:7051,10.5.141.4:7051";
//                KuduClient kuduClient= ugi.doAs(new PrivilegedAction<KuduClient>() {
//
//                    @Override
//                    public KuduClient run() {
//                       KuduClient client = new KuduClient.KuduClientBuilder(kuduHostServerUrl)
//                                .build();
//                        return client;
//                    }
//                });
//
//
//        System.out.println(kuduClient.openTable("default.bkpf_kudu").getTableId());
////                if (Objects.isNull(client)) {
////                    client = new KuduClient.KuduClientBuilder(kuduHostServerUrl)
////                            .build();
////                }
//           // }
//
//
//
//
//
//
//    }







    @Override
    public List<DelegateReverseObject> getNamespaces() {
        return null;
    }


    @Override
    public void close() throws IOException {
        this.quitKeepAlived.set(true);
        Iterator var1 = this.borrowedConnections.values().iterator();

        Connection connection;
        while(var1.hasNext()) {
            connection = (Connection)var1.next();

            try {
                connection.close();
            } catch (Exception var5) {
                LOGGER.warn("unable to return connection:" + var5.getMessage(), var5);
            }
        }

        LOGGER.info("closed " + this.borrowedConnections.size() + " borrowedConnections");
        var1 = this.connections.iterator();

        while(var1.hasNext()) {
            connection = (Connection)var1.next();

            try {
                connection.close();
            } catch (Exception var4) {
                LOGGER.warn("unable to close connection:" + var4.getMessage(), var4);
            }
        }

        LOGGER.info("closed " + this.connections.size() + " connections");
        this.connections.clear();
    }

    @Override
    public List<DelegateReverseObject> getChildren(DelegateReverseObject delegateReverseObject) {
        //通过mysql获取需要的扩展属性信息
        try {
            String name = delegateReverseObject.getName();
            LOGGER.info("delegateReverseObject name is:{}", name);
            LOGGER.info("datasourceProperties is:{}", gson.toJson(this.datasourceProperties));
            if (name != null && !name.equals("")) {
                String mysqlHostServerUrl = getProperties().getParameter("MysqlHostServerUrl");
                String user = getProperties().getParameter("userMysql");
                String password = getProperties().getParameter("passwordMysql");
                if (mysqlHostServerUrl != null &&
                        !mysqlHostServerUrl.equals("")
                        && user != null && !user.equals("")
                        && password != null && !password.equals("")) {
                    try {
                        Class.forName("com.mysql.jdbc.Driver");
                    } catch (ClassNotFoundException e) {
                        LOGGER.error("get mysql class error:{}", e);
//                    throw new RuntimeException(e);
                    }
                    Connection connection = DriverManager.getConnection(mysqlHostServerUrl, user, DigestUtils.decryptIfIsEncrypted(password));
                    String querySql = "with tbls2 as ( select   DB_ID,TBL_ID,TBL_NAME as table_name, --表英文名\n" +
                            "            CREATE_TIME as table_create_time,--表创建时间戳,    \n" +
                            "            case when substr(TBL_NAME, length(TBL_NAME) -3, 3) = '_i_' then 1 else 0 end is_inc_tab -- 是否为增量表1:是，0：否\n" +
                            "            from    tbls\n" +
                            "            where substr(TBL_NAME, 0, 4) in ('ods_')\n" +
                            "            union all \n" +
                            "            select  DB_ID,TBL_ID,TBL_NAME as table_name, --表英文名\n" +
                            "                    CREATE_TIME as table_create_time,--表创建时间戳\n" +
                            "                    0 as is_inc_tab\n" +
                            "            from    tbls\n" +
                            "            where substr(TBL_NAME, 0, 4) not in ('ods_')\n" +
                            ")\n" +
                            ",table_info_cnt as (SELECT d.NAME AS database_name, --数据库名\n" +
                            "          t.TBL_NAME AS table_name, --表英文名\n" +
                            "          ifnull(tp.PARAM_VALUE,'') AS table_alis_name, --表名\n" +
                            "          ifnull(tp2.PARAM_VALUE,'') AS table_comment, --表描述\n" +
                            "          t.is_inc_tab, -- 是否增量表\n" +
                            "          t.CREATE_TIME AS table_create_time, --表创建时间(timestamp)\n" +
                            "          ifnull(tp3.PARAM_VALUE,0) AS table_num_rows, -- 表数据条数\n" +
                            "          ifnull(tp4.PARAM_VALUE,0) AS table_total_size, -- 表存储空间（B）\n" +
                            "          ifnull(pa.PART_NAME, '') AS partition_name, --分区\n" +
                            "          ifnull(pa.CREATE_TIME, '') AS partition_create_time, --分区创建时间\n" +
                            "          ifnull(pap.PARAM_VALUE, 0)  AS partition_num_rows, --分区数据条数\n" +
                            "          ifnull(pap2.PARAM_VALUE, 0) AS partition_total_size --分区存储空间(B)\n" +
                            "    FROM    dbs d\n" +
                            "    INNER JOIN tbls2 t          ON      t.DB_ID = d.DB_ID\n" +
                            "    LEFT JOIN table_params tp   ON      (t.TBL_ID = tp.TBL_ID  AND  tp.PARAM_KEY = 'alias')\n" +
                            "    LEFT JOIN table_params tp2  ON      (t.TBL_ID = tp2.TBL_ID  AND tp2.PARAM_KEY = 'comment')\n" +
                            "    LEFT JOIN table_params tp3  ON      (t.TBL_ID = tp3.TBL_ID  AND tp3.PARAM_KEY = 'numRows')\n" +
                            "    LEFT JOIN table_params tp4  ON      (t.TBL_ID = tp4.TBL_ID  AND tp4.PARAM_KEY = 'totalSize')\n" +
                            "    LEFT JOIN partitions pa     ON      pa.TBL_ID = t.TBL_ID\n" +
                            "    LEFT JOIN partition_params pap   ON  (pap.PART_ID = pa.PART_ID AND pap.PARAM_KEY = 'numRows')\n" +
                            "    LEFT JOIN partition_params pap2  ON  (pap2.PART_ID = pa.PART_ID AND pap2.PARAM_KEY = 'totalSize')\n" +
                            ")\n" +
                            ",t_pa as ( --各表的最新分区\n" +
                            "    SELECT  database_name,\n" +
                            "            table_name,\n" +
                            "            table_create_time,\n" +
                            "            table_alis_name,\n" +
                            "            table_comment,\n" +
                            "            table_num_rows,-- 表数据条数（当有分区数据条数时，以分区为主；全量表取最新分区，增量表取全部分区）\n" +
                            "            table_total_size, -- 表存储空间（B）\n" +
                            "            partition_name,\n" +
                            "            partition_create_time,\n" +
                            "            partition_num_rows, -- 分区记录条数\n" +
                            "            partition_total_size -- 分区存储空间(B)           \n" +
                            "    FROM    ( SELECT  table_name,table_create_time,\n" +
                            "            table_alis_name,table_comment,table_num_rows,table_total_size,\n" +
                            "            partition_name,partition_create_time, partition_num_rows,partition_total_size,\n" +
                            "            row_number() OVER(PARTITION BY database_name,table_name ORDER BY partition_create_time DESC) AS rn\n" +
                            "            FROM    table_info_cnt\n" +
                            "            )\n" +
                            "    WHERE   rn = 1\n" +
                            ")\n" +
                            ",t_cnt as ( -- 统计所有分区的记录数  ods和dwd表：全量a增量i，若表名不规范无i，默认为a；dws和dim层为全量a； 以下逻辑为 not增量表\n" +
                            "    SELECT  database_name,\n" +
                            "            table_name,\n" +
                            "            SUM(partition_num_rows) AS num_rows, -- 分区记录条数\n" +
                            "            SUM(partition_total_size) AS total_size -- 分区存储空间(B)\n" +
                            "    FROM    table_info_cnt\n" +
                            "    WHERE   ( -- 对特定增量表设定增量时间起点\n" +
                            "        case when table_name='ods_pps_analysis_gas_daily_download_i_d' then partition_name >= 'dw_month=202406/dw_day=20240611'\n" +
                            "            when table_name='ods_pps_analysis_gas_daily_upload_i_d' then partition_name >= 'dw_month=202407/dw_day=20240707'\n" +
                            "            when table_name='ods_pps_analysis_product_oil_marketing_selling_oil_i_d' then partition_name >= 'dw_month=202405/dw_day=20240512'\n" +
                            "            when table_name='ods_pps_analysis_product_oil_marketing_tank_stock_i_d' then partition_name >= 'dw_month=202406/dw_day=20240613'\n" +
                            "            when table_name='ods_etr_item_pipechina_segment_sale_data_i_d' then partition_name >= 'dw_month=202409/dw_day=20240926'\n" +
                            "            when table_name='ods_etr_trade_direct_user_requirement_record_i_d' then partition_name >= 'dw_month=202409/dw_day=20240926'\n" +
                            "            when table_name='ods_etr_mkt_mkt_day_designate_pps_send_i_d' then partition_name >= 'dw_month=202409/dw_day=20240925'\n" +
                            "            when table_name='ods_etr_mkt_mkt_day_designate_pps_i_d' then partition_name >= 'dw_month=202409/dw_day=20240926'\n" +
                            "            when table_name='ods_etr_mkt_mkt_meter_gas_data_record_i_d' then partition_name >= 'dw_month=202409/dw_day=20240926'\n" +
                            "            else True\n" +
                            "        end)\n" +
                            "    GROUP BY database_name,table_name\n" +
                            ")\n" +
                            ",table_entry_info as (SELECT \n" +
                            "        t_tab.database_name, -- 来源库名，对应数仓分层\n" +
                            "        t_tab.table_name, -- 表名\n" +
                            "        t_tab.table_create_time, -- 表创建时间戳\n" +
                            "        t_tab.table_alis_name, -- 表别名\n" +
                            "        t_tab.table_comment, -- 表注释\n" +
                            "        t_pa.partition_name, -- 表最新的分区名\n" +
                            "        t_pa.partition_create_time, -- 最新分区创建时间戳\n" +
                            "        case when t_tab.is_inc_tab=1 then t_cnt.num_rows  -- 增量分区取所有分区数\n" +
                            "            else case when t_pa.partition_name!='' then t_pa.partition_num_rows else t_tab.table_num_rows  -- 全量分区取最新分区数; 若无分区，取表记录数\n" +
                            "            end\n" +
                            "        end entry_num_rows, -- 表记录条数(全量表统计最新分区，增量表统计所有分区)\n" +
                            "        case when t_tab.is_inc_tab=1 then t_cnt.total_size\n" +
                            "            else case when t_pa.partition_name!='' then t_pa.partition_total_size else t_tab.table_total_size -- 全量分区取最新分区数; 若无分区，取表大小 \n" +
                            "            end \n" +
                            "        end table_total_size, -- 表存储空间(B)(全量表统计最新分区，增量表统计所有分区)\n" +
                            "        case when t_cnt.table_name is not null then t_cnt.num_rows else t_tab.table_num_rows end  all_pt_num_rows, -- 表所有分区记录条数\n" +
                            "        case when t_cnt.table_name is not null then t_cnt.total_size else t_tab.table_total_size end all_pt_total_size, -- 表所有分区存储空间(B)\n" +
                            "  FROM  table_info_cnt as t_tab\n" +
                            "left join t_pa -- 去重的表名(默认是全量表)\n" +
                            "ON      (t_pa.database_name = t_tab.database_name AND t_pa.table_name = t_tab.table_name)\n" +
                            "LEFT JOIN t_cnt -- 所有分区表记录数统计\n" +
                            "ON      (t_tab.database_name = t_cnt.database_name AND t_tab.table_name = t_cnt.table_name)\n" +
                            ")\n" +
                            "\n" +
                            "select database_name-- 数据库名\n" +
                            ",table_name-- 表英文名\n" +
                            ",table_create_time -- 表创建时间\n" +
                            ",table_alis_name   -- 表名    可以作为补充\n" +
                            ",table_comment     -- 表描述  可以作为补充\n" +
                            ",entry_num_rows    -- 表记录条数\n" +
                            ",table_total_size  -- 表存储空间(B)\n" +
                            "-- ,all_pt_num_rows,all_pt_total_size\n" +
                            "from (select  distinct\n" +
                            "          database_name  -- 数据库名\n" +
                            "         ,table_name  as -- 表英文名\n" +
                            "         ,fromUnixTimestamp(table_create_time) as table_create_time  -- 表创建时间\n" +
                            "         ,table_alis_name    -- 表名 \n" +
                            "         ,table_comment      -- 表描述 \n" +
                            "         ,entry_num_rows     -- 表记录条数(全量表统计最新分区，增量表统计所有分区)\n" +
                            "         ,table_total_size   -- 表存储空间(B)(全量表统计最新分区，增量表统计所有分区)\n" +
                            "         ,all_pt_num_rows    -- 表所有分区记录条数\n" +
                            "         ,all_pt_total_size  -- 表所有分区存储空间(B)\n" +
                            "         ,row_number()over(partition by database_name,table_name order by fromUnixTimestamp(partition_create_time) desc) as rn\n" +
                            "  from table_entry_info\n" +
                            ") a where rn=1 and database_name = ?\n" +
                            "order by   database_name,table_name";
                    ResultSet resultSet = getResultSet(null, name, querySql, connection);
                    List<DelegateReverseObject> list = new ArrayList<>();
                    while (resultSet.next()) {
                        //获取扩展属性信息
                        DelegateReverseObject reverseObject = new DelegateReverseObject();
                        Map<String, String> map = new HashMap<>();
                        reverseObject.setProperties(map);
                        String tableName = resultSet.getString("table_name");
                        //设置表英文名
                        reverseObject.setName(tableName.toLowerCase());
                        //设置表创建时间、修改时间
                        String tableCreateTime = resultSet.getString("table_create_time");
                        map.put("createTime", tableCreateTime);
                        map.put("updateTime", tableCreateTime);
                        //设置存储大小
                        String tableTotalSize = resultSet.getString("table_total_size");
                        map.put("tableTotalSize", tableTotalSize);
                        //设置数据量
                        String entryNumRows = resultSet.getString("entry_num_rows");
                        map.put("entryNumRows", entryNumRows);
                    }
                    return list;

                }
            }
        } catch (Exception e) {
            LOGGER.error("获取扩展属性失败:{}", e);
            throw new RuntimeException(e);
        }

        return null;
    }

    private ResultSet getResultSet(String catalog, String schema, String querySql, Connection conn) {
        PreparedStatement preparedStatement;
//        Connection conn = jdbcDatasource.getConnection();
        try {
            preparedStatement = conn.prepareStatement(querySql);
            preparedStatement.setString(1, Objects.nonNull(schema)? schema : catalog);
            preparedStatement.setFetchSize(FETCH_SIZE);
            return preparedStatement.executeQuery();
        } catch (SQLException e) {
            LOGGER.error("get mysql udp error:{}", e);
            throw new RuntimeException(e);
        }
    }
}
