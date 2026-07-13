// src/utils/errorDictionary.ts

/**
 * 백엔드 시스템 에러 코드(errorCode)를 사용자 친화적인 한국어 UX 문구로 매핑합니다.
 */
export const errorDictionary: Record<string, string> = {
  'INVALID_REQUEST_BODY': '입력하신 정보가 올바르지 않습니다. 다시 확인해 주세요.',
  'AUTHENTICATION_REQUIRED': '로그인이 만료되었거나 권한이 없습니다. 다시 로그인해 주세요.',
  'LOGIN_FAILED': '가입되지 않은 이메일이거나 비밀번호가 다릅니다.', // 사용자 친화적 통합
  'FORBIDDEN_ACTION': '해당 기능을 사용할 수 있는 권한이 없습니다.',
  'USER_NOT_FOUND': '계정 정보를 찾을 수 없습니다.',
  'DUPLICATE_EMAIL': '이미 가입된 이메일 주소입니다.',
  'TOO_MANY_REQUESTS': '비정상적인 요청이 감지되었습니다. 잠시 후 다시 시도해 주세요.',
  'INTERNAL_SERVER_ERROR': '서버에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  
  // 클라이언트 내부에서 정의한 가상의 에러
  'NETWORK_ERROR': '네트워크 연결이 불안정합니다. 인터넷 연결을 확인해 주세요.',
  'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다. 문제가 지속되면 고객센터로 문의해 주세요.'
};

/**
 * 에러 코드를 받아 매핑된 메시지를 반환합니다.
 * 매핑되지 않은 코드일 경우 UNKNOWN_ERROR 문구를 반환합니다.
 */
export const getErrorMessage = (errorCode?: string): string => {
  if (!errorCode) return errorDictionary['UNKNOWN_ERROR'];
  return errorDictionary[errorCode] || errorDictionary['UNKNOWN_ERROR'];
};
