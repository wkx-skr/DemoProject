package com.datablau.gateway.util;

import org.bouncycastle.crypto.engines.SM2Engine;
import org.bouncycastle.crypto.params.*;
import org.bouncycastle.jcajce.provider.asymmetric.ec.BCECPrivateKey;
import org.bouncycastle.jcajce.provider.asymmetric.ec.BCECPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECParameterSpec;
import org.bouncycastle.util.encoders.Hex;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

@Component
public class SM2Utils {

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    @Value("${sm2.publickey1:3059301306072a8648ce3d020106082a811ccf5501822d03420004832e7e2e10d58debe7375857e69b596cd9dc52ff1199dfc59bd5d0f31ceda469e7773e32333f1ac093c83ec1ff51675bda6ca0672a96e7bcd8cc77d5e9a5be54}")
    private String publickey1;
    @Value("${sm2.privatekey1:308193020100301306072a8648ce3d020106082a811ccf5501822d047930770201010420612b487de100b847093670eb8e82f59b31bd7dc45f7954bd103538a320256e8ca00a06082a811ccf5501822da14403420004832e7e2e10d58debe7375857e69b596cd9dc52ff1199dfc59bd5d0f31ceda469e7773e32333f1ac093c83ec1ff51675bda6ca0672a96e7bcd8cc77d5e9a5be54}")
    private String privatekey1;

    /**
     * 生成SM2密钥对
     *
     * @return KeyPair 包含公钥和私钥的密钥对
     */
    public static KeyPair generateKeyPair() {
        try {
            ECGenParameterSpec ecGenParameterSpec = new ECGenParameterSpec("sm2p256v1");
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC", "BC");
            keyPairGenerator.initialize(ecGenParameterSpec, new SecureRandom());
            return keyPairGenerator.generateKeyPair();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 使用SM2公钥加密数据
     *
     * @param publicKey 公钥
     * @param data      要加密的数据
     * @return 加密后的数据（十六进制字符串）
     */
    public static String encrypt(BCECPublicKey publicKey, String data) {
        SM2Engine.Mode mode = SM2Engine.Mode.C1C3C2;
        ECParameterSpec ecParameterSpec = publicKey.getParameters();
        ECDomainParameters ecDomainParameters = new ECDomainParameters(
                ecParameterSpec.getCurve(),
                ecParameterSpec.getG(),
                ecParameterSpec.getN()
        );
        ECPublicKeyParameters ecPublicKeyParameters = new ECPublicKeyParameters(
                publicKey.getQ(),
                ecDomainParameters
        );
        SM2Engine sm2Engine = new SM2Engine(mode);
        sm2Engine.init(true, new ParametersWithRandom(ecPublicKeyParameters, new SecureRandom()));
        byte[] encryptedBytes = null;
        try {
            byte[] plainBytes = data.getBytes("UTF-8");
            encryptedBytes = sm2Engine.processBlock(plainBytes, 0, plainBytes.length);
        } catch (Exception e) {
            System.out.println("加密时出现异常: " + e.getMessage());
            e.printStackTrace();
        }
        return encryptedBytes != null ? Hex.toHexString(encryptedBytes) : null;
    }

    /**
     * 使用SM2私钥解密数据
     *
     * @param privateKey 私钥
     * @param cipherData 加密后的数据（十六进制字符串）
     * @return 解密后的原始数据
     */
    public static String decrypt(BCECPrivateKey privateKey, String cipherData) {
        SM2Engine.Mode mode = SM2Engine.Mode.C1C3C2;
        byte[] cipherBytes = Hex.decode(cipherData);
        ECParameterSpec ecParameterSpec = privateKey.getParameters();
        ECDomainParameters ecDomainParameters = new ECDomainParameters(
                ecParameterSpec.getCurve(),
                ecParameterSpec.getG(),
                ecParameterSpec.getN()
        );
        ECPrivateKeyParameters ecPrivateKeyParameters = new ECPrivateKeyParameters(
                privateKey.getD(),
                ecDomainParameters
        );
        SM2Engine sm2Engine = new SM2Engine(mode);
        sm2Engine.init(false, ecPrivateKeyParameters);
        byte[] decryptedBytes = null;
        try {
            decryptedBytes = sm2Engine.processBlock(cipherBytes, 0, cipherBytes.length);
        } catch (Exception e) {
            System.out.println("解密时出现异常: " + e.getMessage());
            e.printStackTrace();
        }
        return decryptedBytes != null ? new String(decryptedBytes, java.nio.charset.StandardCharsets.UTF_8) : null;
    }
    /**
     * 将十六进制字符串转换为 PublicKey 对象
     *
     * @param hexString 十六进制字符串
     * @return PublicKey 还原的公钥对象
     */
    public static PublicKey hexStringToPublicKey(String hexString) {
        try {
            // 将十六进制字符串转换为字节数组
            byte[] publicKeyBytes = Hex.decode(hexString);

            // 使用 KeyFactory 和 X509EncodedKeySpec 还原公钥
            KeyFactory keyFactory = KeyFactory.getInstance("EC", "BC");
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
            return keyFactory.generatePublic(keySpec);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 将十六进制字符串转换为 PrivateKey 对象
     *
     * @param hexString 十六进制字符串
     * @return PrivateKey 还原的私钥对象
     */
    public static PrivateKey hexStringToPrivateKey(String hexString) {
        try {
            // 将十六进制字符串转换为字节数组
            byte[] privateKeyBytes = Hex.decode(hexString);

            // 使用 KeyFactory 和 PKCS8EncodedKeySpec 还原私钥
            KeyFactory keyFactory = KeyFactory.getInstance("EC", "BC");
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            return keyFactory.generatePrivate(keySpec);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 加密数据
     * @param text
     * @return
     */
    public String sm2Encrypt(String text) {
        PublicKey publicKey = hexStringToPublicKey(publickey1);
        String encryptedData = encrypt((BCECPublicKey) publicKey, text);
        return encryptedData;
    }

    public static void main(String[] args) {
        // 生成密钥对
        KeyPair keyPair = generateKeyPair();
        if (keyPair == null) {
            System.out.println("密钥对生成失败");
            return;
        }


        String publickey1= "3059301306072a8648ce3d020106082a811ccf5501822d03420004832e7e2e10d58debe7375857e69b596cd9dc52ff1199dfc59bd5d0f31ceda469e7773e32333f1ac093c83ec1ff51675bda6ca0672a96e7bcd8cc77d5e9a5be54";
        System.out.println("十六进制公钥: " + publickey1 );
        PublicKey publicKey = hexStringToPublicKey(publickey1);
        System.out.println("还原回来的公钥 " + publicKey);

        String privatekey1 = "308193020100301306072a8648ce3d020106082a811ccf5501822d047930770201010420612b487de100b847093670eb8e82f59b31bd7dc45f7954bd103538a320256e8ca00a06082a811ccf5501822da14403420004832e7e2e10d58debe7375857e69b596cd9dc52ff1199dfc59bd5d0f31ceda469e7773e32333f1ac093c83ec1ff51675bda6ca0672a96e7bcd8cc77d5e9a5be54";
        System.out.println("十六进制私钥: " + privatekey1);
        PrivateKey privateKey = hexStringToPrivateKey(privatekey1);
        System.out.println("还原回来的私钥 " + privateKey);
//        PublicKey publicKey = keyPair.getPublic();
//        System.out.println("公钥"+publicKey);
//        String publicKey1 =Hex.toHexString(publicKey.getEncoded());
//        System.out.println("十六进制公钥: " + publicKey1 );
//        PublicKey publicKey2 = hexStringToPublicKey(publicKey1);
//        System.out.println("还原回来的公钥 " + publicKey2);
//        PrivateKey privateKey = keyPair.getPrivate();
//        System.out.println("私钥"+privateKey);
//        String privateKey1 = Hex.toHexString(privateKey.getEncoded());
//        System.out.println("十六进制私钥: " + privateKey1);
//        PrivateKey privateKey2 = hexStringToPrivateKey(privateKey1);
//        System.out.println("还原回来的私钥: " + privateKey2);

        // 要加密的数据
        String plainText = "Hello,World";
        System.out.println("原始数据: " + plainText);

        // 加密数据
        String encryptedData = encrypt((BCECPublicKey) publicKey, plainText);
        System.out.println("加密后的数据: " + encryptedData);

        String text ="04145f14abac821386c8817e1844864d4f099e9cbf1594ba158028eaaf8c9dc1429fc52e47899215b261654a6b7c3cb3d84bf50318b6013d843ad1908840e4b61b682407b792d231e174b9ca456203977e824c7760e83ea9d037743457adbcaba21e3e403d87712f0dbde77ebf17b08536cf2dac5673c06d67ad48551d85be583b1953291f984a858a90baad2d7cba07031e17d5c0cf848ab85909699b2d377cef9847b87fa88e72c077f31569b9b24f44d5c28ecdfff60531888334710486349de76c62a1";
        // 解密数据
        String decryptedData = decrypt((BCECPrivateKey) privateKey, text);
        System.out.println("解密后的数据: " + decryptedData);
    }
}