package com.datablau.security.management.util;

import org.bouncycastle.asn1.gm.GMNamedCurves;
import org.bouncycastle.crypto.params.ECDomainParameters;
import org.bouncycastle.crypto.params.ECPrivateKeyParameters;
import org.bouncycastle.crypto.signers.SM2Signer;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.math.ec.ECPoint;
import org.bouncycastle.util.encoders.Hex;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.Security;

public class SM2SignClient {

    // 客户自己的 SM2 私钥（hex 字符串）
    private static final String PRIVATE_KEY_HEX = "3334f8211ab609c1540fc71a7de7f71cb967ff933cc97c0229ef5b9e2ba6d0bb";
    private static final String CURVE_NAME = "sm2p256v1";

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    /**
     * 用私钥签名 username
     */
    public static String signUsername(String username) throws Exception {
        byte[] data = username.getBytes(StandardCharsets.UTF_8);
        byte[] privateKeyBytes = Hex.decode(PRIVATE_KEY_HEX);

        var ecParams = GMNamedCurves.getByName(CURVE_NAME);
        var domainParams = new ECDomainParameters(ecParams.getCurve(), ecParams.getG(), ecParams.getN());
        var privateKey = new ECPrivateKeyParameters(new BigInteger(1, privateKeyBytes), domainParams);

        SM2Signer signer = new SM2Signer();
        signer.init(true, privateKey); // true 表示签名
        signer.update(data, 0, data.length);

        byte[] signature = signer.generateSignature();
        return Hex.toHexString(signature);
    }

    public static void main(String[] args) throws Exception {
        String username = "admin";
        String sign = signUsername(username);
        System.out.println("username: " + username);
        System.out.println("sign: " + sign);
    }
}
