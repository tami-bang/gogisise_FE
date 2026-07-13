// src/utils/crypto.ts

/**
 * 프론트엔드 환경에서 Payload 암호화(E2EE)를 수행하는 모의 모듈.
 * 실제 구현에서는 SubtleCrypto, RSA 비대칭키, AES-GCM 등을 활용합니다.
 */

export const cryptoService = {
  /**
   * 민감한 문자열(비밀번호 등)을 서버와 약속된 공개키로 암호화합니다.
   * @param payload 암호화할 원본 텍스트
   * @returns 암호화된(JWE 호환) 문자열
   */
  encryptPayload: (payload: string): string => {
    if (!payload) return payload;
    // TODO: 실제 RSA/AES 암호화 로직 구현 (현재는 모의 Base64 래핑)
    return `enc_jwe_${btoa(payload)}`;
  },

  /**
   * 서버로부터 수신된 JWE 토큰이 올바른 포맷인지 검증합니다.
   * @param token 수신된 JWE 토큰
   */
  verifyJWEFormat: (token: string): boolean => {
    // 실제 JWE는 5개의 파트(header.encryptedKey.iv.ciphertext.tag)로 구성됨
    // 모의 구현이므로 약식 검증
    return token.length > 20;
  }
};
