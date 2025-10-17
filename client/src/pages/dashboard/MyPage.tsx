import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import useAuthStore from '../../store/authStore';
import type { ProfileUpdateRequest, PasswordChangeRequest, PasswordVerifyResponse } from '../../types/api';
import { updateUserProfile, changeUserPassword, deleteUserAccount } from '../../api/userApi';
import axios, { type AxiosResponse } from 'axios';
import { ShieldCheck, User, Cake, KeyRound, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

// --- 내부 컴포넌트들 ---

const LoadingSpinner = () => (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const ApiMessage = ({ type, text }: { type: 'success' | 'error', text: string }) => ( <div className={`flex items-center justify-center gap-2 text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}> {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} <span>{text}</span> </div> );

const PasswordVerificationForm = ({ onSuccess }: { onSuccess: (token: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<{ password: string }>();

  const onSubmit: SubmitHandler<{ password: string }> = async (data) => {
    setIsLoading(true);
    setError(null);
    const { accessToken } = useAuthStore.getState();
    try {
      const response: AxiosResponse<PasswordVerifyResponse> = await axios.post( '/api/v1/users/me/password', { currentPassword: data.password }, { headers: { 'Authorization': `Bearer ${accessToken}` }, withCredentials: true } );
      const passwordToken = response.headers['x-password-token'];
      if (passwordToken && typeof passwordToken === 'string') {
        onSuccess(passwordToken);
      } else {
        setError('비밀번호 확인에 성공했으나, 인증 토큰을 받지 못했습니다.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || '비밀번호가 일치하지 않습니다.');
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
      <div className="flex flex-col items-center text-center">
        <ShieldCheck size={48} className="text-indigo-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">비밀번호 확인</h2>
        <p className="mt-2 text-gray-600">안전한 정보 수정을 위해 현재 비밀번호를 입력해주세요.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label htmlFor="password-verify" className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><KeyRound /></div>
            <input id="password-verify" type="password" {...register('password', { required: true })} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
        {error && <ApiMessage type="error" text={error} />}
        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? <LoadingSpinner /> : '확인'}
        </button>
      </form>
    </div>
  );
};

const ProfileEditor = ({ passwordToken }: { passwordToken: string }) => {
  const navigate = useNavigate();
  const { profile, updateProfileState, clearProfile: clearUserProfile } = useUserStore();
  const { login: updateAuthToken, logout: logoutAuth } = useAuthStore();
  
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [profileApiMessage, setProfileApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordApiMessage, setPasswordApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset, watch: watchProfile } = useForm<ProfileUpdateRequest>();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, watch: watchPassword, reset: resetPasswordForm } = useForm<PasswordChangeRequest>();
  const newPassword = watchPassword('newPassword');

  useEffect(() => {
    if (profile?.user) {
      reset({
        nickname: profile.user.nickname,
        birth: profile.user.birth.split('T')[0],
        gender: profile.user.gender,
      });
    }
  }, [profile, reset]);

  const onProfileSubmit: SubmitHandler<ProfileUpdateRequest> = async (data) => {
    setIsProfileUpdating(true);
    setProfileApiMessage(null);
    try {
      const updatedProfile = await updateUserProfile(data);
      updateProfileState(updatedProfile);
      setProfileApiMessage({ type: 'success', text: '프로필이 성공적으로 수정되었습니다.' });
    } catch (err) {
      if (axios.isAxiosError(err)) setProfileApiMessage({ type: 'error', text: err.response?.data?.message || '프로필 수정 중 오류가 발생했습니다.' });
      else setProfileApiMessage({ type: 'error', text: '알 수 없는 오류가 발생했습니다.' });
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const onPasswordChangeSubmit: SubmitHandler<PasswordChangeRequest> = async (data) => {
    setIsPasswordUpdating(true);
    setPasswordApiMessage(null);
    try {
      const response = await changeUserPassword(data, passwordToken);
      updateAuthToken(response.accessToken); 
      setPasswordApiMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
      resetPasswordForm();
    } catch (err) {
      if (axios.isAxiosError(err)) setPasswordApiMessage({ type: 'error', text: err.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.' });
      else setPasswordApiMessage({ type: 'error', text: '알 수 없는 오류가 발생했습니다.' });
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.')) {
      try {
        await deleteUserAccount(passwordToken);
        alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
        logoutAuth();
        clearUserProfile();
        navigate('/');
      } catch (error) {
        alert('회원 탈퇴 처리 중 오류가 발생했습니다.');
        console.error(error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* 프로필 정보 수정 폼 */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">프로필 정보</h2>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">닉네임</label>
            <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User /></div>
              <input type="text" {...registerProfile('nickname', { required: '닉네임은 필수입니다.' })} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" />
            </div>
            {profileErrors.nickname && <p className="mt-1 text-sm text-red-500">{profileErrors.nickname.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">생년월일</label>
            <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Cake /></div>
              <input type="date" {...registerProfile('birth', { required: '생년월일은 필수입니다.' })} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" />
            </div>
            {profileErrors.birth && <p className="mt-1 text-sm text-red-500">{profileErrors.birth.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">성별</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${watchProfile('gender') === '남' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}>
                <input type="radio" value="남" {...registerProfile('gender')} className="sr-only" /> 남성
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${watchProfile('gender') === '여' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}>
                <input type="radio" value="여" {...registerProfile('gender')} className="sr-only" /> 여성
              </label>
            </div>
          </div>
          {profileApiMessage && <ApiMessage type={profileApiMessage.type} text={profileApiMessage.text} />}
          <button type="submit" disabled={isProfileUpdating} className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {isProfileUpdating ? <LoadingSpinner /> : '프로필 저장'}
          </button>
        </form>
      </div>

      {/* 비밀번호 변경 폼 */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">비밀번호 변경</h2>
        <form onSubmit={handlePasswordSubmit(onPasswordChangeSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
            <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><KeyRound /></div>
              <input type="password" {...registerPassword('newPassword', { required: '새 비밀번호를 입력해주세요.', minLength: { value: 8, message: '8자 이상 입력해주세요.' } })} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" />
            </div>
            {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
            <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><KeyRound /></div>
              <input type="password" {...registerPassword('confirmNewPassword', { required: '새 비밀번호를 다시 입력해주세요.', validate: value => value === newPassword || '새 비밀번호가 일치하지 않습니다.' })} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" />
            </div>
            {passwordErrors.confirmNewPassword && <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmNewPassword.message}</p>}
          </div>
          {passwordApiMessage && <ApiMessage type={passwordApiMessage.type} text={passwordApiMessage.text} />}
          <button type="submit" disabled={isPasswordUpdating} className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50">
            {isPasswordUpdating ? <LoadingSpinner /> : '비밀번호 변경'}
          </button>
        </form>
      </div>
      
      {/* 회원 탈퇴 섹션 */}
      <div className="bg-red-50 p-8 rounded-xl shadow-lg border border-red-200">
        <h2 className="text-2xl font-bold text-red-800 mb-4">회원 탈퇴</h2>
        <p className="text-red-700 mb-6">
          회원 탈퇴 시 계정과 관련된 모든 데이터(거래 내역, 예산, 카테고리 등)가 영구적으로 삭제되며, 복구할 수 없습니다. 신중하게 결정해주세요.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <LogOut size={16} />
          회원 탈퇴 진행
        </button>
      </div>
    </div>
  );
};

// --- 메인 MyPage 컴포넌트 ---
export default function MyPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [passwordToken, setPasswordToken] = useState<string | null>(null);

  const handleVerificationSuccess = (token: string) => {
    setPasswordToken(token);
    setIsVerified(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">마이페이지</h1>
      {isVerified && passwordToken ? (
        <ProfileEditor passwordToken={passwordToken} />
      ) : (
        <PasswordVerificationForm onSuccess={handleVerificationSuccess} />
      )}
    </div>
  );
}

