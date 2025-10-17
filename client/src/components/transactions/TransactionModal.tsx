import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Transaction } from '../../types/transaction';
import useCategoryStore from '../../store/categoryStore';
import dayjs from 'dayjs';

type FormValues = {
  date: string;
  type: 'income' | 'expense';
  majorCategoryId: string;
  minorCategoryId: string;
  description: string;
  amount: number;
};

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  transactionToEdit?: Transaction | null;
}

export default function TransactionModal({ isOpen, onClose, onSubmit, transactionToEdit }: TransactionModalProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>();
  
  const { majorCategories, loadUserCategories } = useCategoryStore();

  const transactionType = watch('type');
  const selectedMajorCategoryId = watch('majorCategoryId');
  
  // ✅ 선택된 유형(수입/지출)에 따라 대분류 목록을 필터링합니다.
  const availableMajorCategories = majorCategories.filter(cat => cat.type === transactionType);
  const availableMinorCategories = availableMajorCategories.find(m => m.id === selectedMajorCategoryId)?.minorCategories || [];

  const isEditing = !!transactionToEdit;

  useEffect(() => {
    if (isOpen) {
      loadUserCategories();
    }
  }, [isOpen, loadUserCategories]);
  
  // ✅ 유형(수입/지출)이 변경될 때, 선택했던 카테고리를 초기화합니다.
  useEffect(() => {
    // 수정 모드가 아닐 때만 카테고리 초기화
    if (!isEditing) {
      setValue('majorCategoryId', '');
      setValue('minorCategoryId', '');
    }
  }, [transactionType, setValue, isEditing]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && transactionToEdit && majorCategories.length > 0) {
      let foundMajorId = '';
      let foundMinorId = '';

      for (const major of majorCategories) {
        if (major.type !== transactionToEdit.type) continue; // 유형이 다르면 건너뛰기
        const foundMinor = major.minorCategories.find(minor => minor.name === transactionToEdit.category);
        if (foundMinor) {
          foundMajorId = major.id;
          foundMinorId = foundMinor.id;
          break;
        } else if (major.name === transactionToEdit.category) { // 대분류가 카테고리인 경우
          foundMajorId = major.id;
          break;
        }
      }
      
      reset({
        date: dayjs(transactionToEdit.date).format('YYYY-MM-DD'),
        type: transactionToEdit.type,
        majorCategoryId: foundMajorId,
        minorCategoryId: foundMinorId,
        description: transactionToEdit.description,
        amount: Number(transactionToEdit.amount)
      });
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        majorCategoryId: '',
        minorCategoryId: '',
        description: '',
        amount: 0,
      });
    }
  }, [isOpen, isEditing, transactionToEdit, reset, majorCategories]);

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{isEditing ? '거래 내역 수정' : '새 거래 추가'}</h2>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">날짜</label>
              <input type="date" {...register('date', { required: true })} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">유형</label>
              <select {...register('type')} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">대분류</label>
              <select {...register('majorCategoryId', { required: '대분류를 선택해주세요.' })} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                <option value="">-- 선택 --</option>
                {/* ✅ 필터링된 대분류 목록을 사용 */}
                {availableMajorCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.majorCategoryId && <p className="text-sm text-red-500 mt-1">{errors.majorCategoryId.message}</p>}
            </div>

            {/* ✅ 소분류 목록이 있을 때만 소분류 선택창을 보여줌 */}
            {availableMinorCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">소분류</label>
                <select 
                  {...register('minorCategoryId')} 
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  disabled={!selectedMajorCategoryId}
                >
                  <option value="">-- 선택 --</option>
                  {availableMinorCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">내용</label>
              <input type="text" {...register('description', { required: '내용을 입력해주세요.' })} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
               {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">금액</label>
              <input type="number" {...register('amount', { required: '금액을 입력해주세요.', valueAsNumber: true, min: { value: 1, message: '0보다 큰 값을 입력해주세요.'} })} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
               {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                취소
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                {isEditing ? '수정하기' : '추가하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

