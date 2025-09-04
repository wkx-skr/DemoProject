package com.datablau.domain.management.utils;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.*;
import java.util.Base64;

public class RsaTokenUtil {

    /**
     * 生成一对 RSA 密钥（返回 Base64 编码的私钥 + 公钥）
     */
    public static KeyPair generateRsaKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048); // 可设置 1024, 2048, 4096
        return keyGen.generateKeyPair();
    }

    /**
     * 使用私钥签名（生成 Token）
     */
    public static String generateToken(String data, String base64PrivateKey) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(base64PrivateKey);
            PrivateKey privateKey = KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(keyBytes));

            Signature signature = Signature.getInstance("MD5withRSA");
            signature.initSign(privateKey);
            signature.update(data.getBytes(StandardCharsets.UTF_8));
            byte[] signBytes = signature.sign();
            return Base64.getEncoder().encodeToString(signBytes);
        } catch (Exception e) {
            throw new RuntimeException("签名失败", e);
        }
    }

    /**
     * 用公钥验证 Token
     */
    public static boolean verifyToken(String data, String base64Token, String base64PublicKey) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(base64PublicKey);
            PublicKey publicKey = KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(keyBytes));

            Signature signature = Signature.getInstance("MD5withRSA");
            signature.initVerify(publicKey);
            signature.update(data.getBytes(StandardCharsets.UTF_8));
            return signature.verify(Base64.getDecoder().decode(base64Token));
        } catch (Exception e) {
            throw new RuntimeException("验签失败", e);
        }
    }

    /**
     * 示例：生成密钥、签名数据、验证签名
     */
    public static void main(String[] args) throws Exception {
        // 1. 生成密钥对
        KeyPair keyPair = generateRsaKeyPair();
        String base64PrivateKey = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());
        String base64PublicKey = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());

        System.out.println("🔐 私钥：\n" + base64PrivateKey);
        System.out.println("\n🔓 公钥：\n" + base64PublicKey);

        // 2. 要签名的数据（如用户名/ID）
        String username = "ziliang_zhang";

        // 3. 签名生成 Token
        String token = generateToken(username, base64PrivateKey);
        System.out.println("\n✅ 生成的 Token（签名）:\n" + token);

        // 4. 验证 Token
        boolean valid = verifyToken(username, token, base64PublicKey);
        System.out.println("\n🔍 Token 验签结果: " + valid);
    }


}
