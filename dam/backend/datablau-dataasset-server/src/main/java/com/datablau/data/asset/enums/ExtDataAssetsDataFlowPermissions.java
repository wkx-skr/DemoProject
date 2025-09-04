package com.datablau.data.asset.enums;

import java.util.Arrays;
import java.util.Comparator;
import java.util.stream.Collectors;

public enum ExtDataAssetsDataFlowPermissions {
  C(8), R(4), U(2), D(1);

  private final int code;
  ExtDataAssetsDataFlowPermissions(int code) { this.code = code; }

  public static int crudToMask(String crudStr) {
    return crudStr.chars()
        .mapToObj(c -> Character.toUpperCase((char) c))
        .filter(c -> Arrays.stream(values()).anyMatch(p -> p.name().equals(String.valueOf(c))))
        .mapToInt(c -> valueOf(String.valueOf(c)).code)
        .sum();
  }

  public static String maskToCrud(int mask) {
    return Arrays.stream(values())
        .filter(p -> (mask & p.code) != 0)
        .sorted(Comparator.comparingInt(p -> -p.code)) // 高位优先
        .map(p -> p.name())
        .collect(Collectors.joining());
  }
}