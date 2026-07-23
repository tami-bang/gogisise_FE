import { useState, useEffect } from 'react';
import { PageLayout } from '../components/common/PageLayout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { FontSizeSelector } from '../components/common/FontSizeSelector';
import { useAuthContext } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../api/services/userService'; // 💡 [한글 주석] 신규 회원수정/비번변경/탈퇴 API 연동
import { ConfirmDialog } from '../components/common/ConfirmDialog'; // 💡 [한글 주석] 회원탈퇴 더블 컨펌용 모달 다이얼로그
import { validateEmail, validatePassword, validateNickname, validatePhone } from '../utils/validation';

export function SettingsPage() {
  const { user, accessToken, setAuth, clearAuth } = useAuthContext();
  const { logout } = useAuth();

  // 프로필 정보 수정 필드 상태
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // 비밀번호 변경 필드 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // 다이얼로그 및 스피너 로딩 상태
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // 현재 사용자 정보가 변경될 때 필드 초기화
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // 💡 [한글 주석] 프로필 정보(이메일, 닉네임, 연락처) 수정 처리
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !user) return;

    // 잘못된 이메일 형식 검증
    if (email && !validateEmail(email)) {
      alert('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    // 닉네임 길이 검증
    if (!validateNickname(nickname)) {
      alert('닉네임은 2자 이상 20자 이하로 입력해 주세요.');
      return;
    }

    // 연락처 형식 검증
    if (phone && !validatePhone(phone.replace(/[^0-9]/g, ''))) {
      alert('올바른 연락처 형식을 입력해 주세요.');
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const updatedUser = await userService.updateProfile(
        { nickname, email, phone },
        accessToken
      );
      // 전역 인증 상태 동기화 (Header 아바타 실시간 반영)
      setAuth(accessToken, updatedUser);
      alert('변경이 완료되었습니다.');
    } catch (err: any) {
      console.error(err);
      // 중복 및 서버 실패 사유 팝업 노출
      const errorMsg = err?.message || '회원 정보 수정에 실패했습니다. 입력한 정보를 다시 확인해 주세요.';
      alert(errorMsg);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // 💡 [한글 주석] 비밀번호 변경 처리
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    // 새 비밀번호 형식 만족 여부 검증
    if (!validatePassword(newPassword)) {
      alert('새 비밀번호는 8자 이상이며, 영문자와 숫자를 최소 1개 이상 포함해야 합니다.');
      return;
    }

    // 새 비밀번호와 확인 비밀번호 일치 검증
    if (newPassword !== newPasswordConfirm) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await userService.updatePassword(
        { currentPassword, newPassword, newPasswordConfirm },
        accessToken
      );
      alert('변경이 완료되었습니다.');
      // 필드 리셋
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      console.error(err);
      // 서버 내부 오류(500) 또는 네트워크 실패 시 에러 안내창
      alert('비밀번호 변경에 실패했습니다. 입력한 정보를 다시 확인해 주세요.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // 💡 [한글 주석] 로그아웃 처리
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        alert('로그아웃이 완료되었습니다.');
      } else {
        alert('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  // 💡 [한글 주석] 회원탈퇴 처리 (Hard Delete)
  const handleDeactivate = async () => {
    if (!accessToken) return;
    setIsConfirmOpen(false);
    setIsDeactivating(true);
    try {
      await userService.deleteAccount(accessToken);
      // 세션 클리어
      clearAuth();
      alert('회원탈퇴가 정상적으로 완료되었습니다.');
    } catch (err) {
      console.error(err);
      alert('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <PageLayout>
      <Header title="계정 및 설정" />
      
      <div className="w-full flex-1 flex flex-col gap-6 py-4 px-4 max-w-md mx-auto">
        {user ? (
          // 로그인한 유저용 마이페이지 통합 영역
          <div className="w-full flex flex-col gap-6">
            
            {/* 프로필 정보 수정 카드 */}
            <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
              <h3 className="text-title font-bold text-gray-900">프로필 정보 설정</h3>
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">이메일 주소</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 px-4 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-gray-800 bg-gray-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">닉네임</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="h-11 px-4 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-gray-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">휴대폰 번호</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 px-4 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-gray-800"
                    placeholder="010-0000-0000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="h-11 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl active:scale-95 transition-transform text-sm mt-2 disabled:opacity-50"
                >
                  {isSubmittingProfile ? '변경 사항 적용 중...' : '회원 정보 수정'}
                </button>
              </form>
            </div>

            {/* 비밀번호 변경 카드 */}
            <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
              <h3 className="text-title font-bold text-gray-900">비밀번호 변경</h3>
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">현재 비밀번호</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="h-11 px-4 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-gray-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">새 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (8자 이상, 영문+숫자)"
                    className="h-11 px-4 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-gray-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="새 비밀번호를 한 번 더 입력하세요"
                    className="h-11 px-4 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-gray-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="h-11 w-full bg-gray-950 hover:bg-gray-800 text-white font-bold rounded-xl active:scale-95 transition-transform text-sm mt-2 disabled:opacity-50"
                >
                  {isSubmittingPassword ? '비밀번호 변경 중...' : '비밀번호 변경'}
                </button>
              </form>
            </div>

            {/* 계정 관리 액션 버튼들 */}
            <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-sm flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="h-11 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl active:scale-[0.98] transition-transform text-sm"
              >
                로그아웃
              </button>
              <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isDeactivating}
                className="h-11 w-full text-red-500 hover:bg-red-50 font-bold rounded-xl active:scale-[0.98] transition-transform text-sm disabled:opacity-50"
              >
                {isDeactivating ? '회원탈퇴 처리 중...' : '회원탈퇴'}
              </button>
            </div>

          </div>
        ) : null}

        {/* 기존 설정 기능: 글자 크기 조절 */}
        <div className="w-full bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
          <FontSizeSelector />
        </div>
      </div>

      <Footer activeTab="settings" />

      {/* 회원탈퇴 더블 컨펌용 모달 다이얼로그 */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="회원 탈퇴"
        message="정말로 고기시세를 탈퇴하시겠습니까? 탈퇴 시 즐겨찾기 목록 등 모든 개인정보와 활동 데이터가 즉시 영구 삭제되며 복구할 수 없습니다."
        confirmText="탈퇴하기"
        cancelText="취소"
        isDestructive={true}
        onConfirm={handleDeactivate}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </PageLayout>
  );
}
