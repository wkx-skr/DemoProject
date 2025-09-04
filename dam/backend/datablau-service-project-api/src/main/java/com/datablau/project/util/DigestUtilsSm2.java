package com.datablau.project.util;

import org.bouncycastle.asn1.gm.GMNamedCurves;
import org.bouncycastle.asn1.x9.X9ECParameters;
import org.bouncycastle.crypto.AsymmetricCipherKeyPair;
import org.bouncycastle.crypto.engines.SM2Engine;
import org.bouncycastle.crypto.generators.ECKeyPairGenerator;
import org.bouncycastle.crypto.params.*;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.math.ec.ECPoint;
import org.bouncycastle.util.encoders.Hex;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.Security;

/**
 * @author: hxs
 * @date: 2025/6/4 10:08
 */
public class DigestUtilsSm2 {

    //sm2加密密钥
    private static final String sm2PrivateKeyHex = "3334f8211ab609c1540fc71a7de7f71cb967ff933cc97c0229ef5b9e2ba6d0bb";
    private static final String sm2PublicKeyHex = "044e864ec58726e50f908dfdab4dcc090719764418252378a90f5d199863d50674d062b9374e158a1cc6d7f8355e0d2d1cd7646f658563196f7ce74da808f265b3";
    private static final String Sm2GmName = "sm2p256v1";


    //加密
    public static String encryptSm2(String plaintext) throws Exception {
        // 添加 Bouncy Castle 作为加密提供程序
        Security.addProvider(new BouncyCastleProvider());

        // 将明文转换为字节数组
        byte[] plaintextBytes = plaintext.getBytes(StandardCharsets.UTF_8);

        // 将十六进制公钥转换为字节数组
        byte[] publicKeyBytes = Hex.decode(sm2PublicKeyHex);

        // 使用字节数组创建 ECPublicKeyParameters 对象
        X9ECParameters ecParameters = GMNamedCurves.getByName(Sm2GmName);
        ECDomainParameters domainParameters = new ECDomainParameters(ecParameters.getCurve(), ecParameters.getG(), ecParameters.getN());
        ECPoint publicKeyPoint = ecParameters.getCurve().decodePoint(publicKeyBytes);
        ECPublicKeyParameters publicKeyParameters = new ECPublicKeyParameters(publicKeyPoint, domainParameters);

        SM2Engine sm2Engine = new SM2Engine();
        sm2Engine.init(true, new ParametersWithRandom(publicKeyParameters, new SecureRandom()));

        // 使用公钥进行 SM2 加密
        byte[] ciphertextBytes = sm2Engine.processBlock(plaintextBytes, 0, plaintextBytes.length);

        //16进制加密结果
        return Hex.toHexString(ciphertextBytes);
    }


    //解密
    public static String decryptEncodedSm2(String cipherData) throws Exception {
        if (!cipherData.startsWith("04")) {
            cipherData = "04" + cipherData;
        }

        // 添加 Bouncy Castle 作为加密提供程序
        Security.addProvider(new BouncyCastleProvider());

        // 将十六进制私钥转换为字节数组
        byte[] privateKeyBytes = Hex.decode(sm2PrivateKeyHex);

        // 使用字节数组创建 ECPrivateKeyParameters 对象
        X9ECParameters ecParameters = GMNamedCurves.getByName(Sm2GmName);
        ECDomainParameters domainParameters = new ECDomainParameters(ecParameters.getCurve(), ecParameters.getG(), ecParameters.getN());
        ECPrivateKeyParameters privateKeyParameters = new ECPrivateKeyParameters(new BigInteger(1, privateKeyBytes), domainParameters);

        SM2Engine sm2Engine = new SM2Engine();
        sm2Engine.init(false, privateKeyParameters);

        byte[] ciphertextBytes = Hex.decode(cipherData);

        // 使用私钥进行 SM2 解密
        byte[] decryptedBytes = sm2Engine.processBlock(ciphertextBytes, 0, ciphertextBytes.length);

        // 将解密后的字节数组转换为字符串
        return  new String(decryptedBytes, StandardCharsets.UTF_8);
    }


    /**
     * sm2生成密钥对代码
     * @throws Exception
     */
    private static void generateKey() throws Exception {
        X9ECParameters sm2ECParameters = GMNamedCurves.getByName(Sm2GmName);
        ECDomainParameters domainParameters = new ECDomainParameters(sm2ECParameters.getCurve(), sm2ECParameters.getG(), sm2ECParameters.getN());
        ECKeyPairGenerator keyPairGenerator = new ECKeyPairGenerator();
        keyPairGenerator.init(new ECKeyGenerationParameters(domainParameters, SecureRandom.getInstance("SHA1PRNG")));
        AsymmetricCipherKeyPair asymmetricCipherKeyPair = keyPairGenerator.generateKeyPair();

        //私钥，16进制格式
        BigInteger privatekey = ((ECPrivateKeyParameters) asymmetricCipherKeyPair.getPrivate()).getD();
        String sm2PrivateKeyHex = privatekey.toString(16);
        System.out.println("sm2PrivateKeyHex -----"+sm2PrivateKeyHex);
        //公钥，16进制格式
        ECPoint ecPoint = ((ECPublicKeyParameters) asymmetricCipherKeyPair.getPublic()).getQ();
        String sm2PublicKeyHex = Hex.toHexString(ecPoint.getEncoded(false));
        System.out.println("sm2PublicKeyHex -----"+sm2PublicKeyHex);
    }


//    public static void main(String[] args) throws Exception {
//        String name = "123456";
//        String password = encryptSm2(name);
//        System.out.println("加密---"+password);
//
//        String test = "046279fe319bb8bf045ba1a14140a8c96537501945a4bcdf53f4a2e6111786d6b5f84897d052f4c293fd7298d07d998cf86da248f1309bdfe3a367789dace247df36e26f88cac7cd211854ce33cb84521d913c358bd3490e7e09c73d5ee2beaffd61702251c31f";
//        String mingWen = decryptEncodedSm2(test);
//        System.out.println("解密---"+mingWen);
//    }

}
