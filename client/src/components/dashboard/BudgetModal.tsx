import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, useFieldArray, Controller } from 'react-hook-form'; // Controller 추가
import useCategoryStore from '../../store/categoryStore';
import type { CreateBudgetRequest, BudgetData } from '../../types/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetRequest) => void;
  month: string;
  existingBudgetData?: BudgetData | null;
}

type FormValues = {
  categories: {
    categoryId: string;
    categoryName: string;
    amount: number;
  }[];
};

export default function BudgetModal({ isOpen, onClose, onSubmit, month, existingBudgetData }: BudgetModalProps) {
  const { majorCategories, loadUserCategories } = useCategoryStore();
  // ✅ register 대신 control을 사용하도록 변경
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { categories: [] }
  });

  const { fields, replace } = useFieldArray({ control, name: "categories" });

  useEffect(() => {
    if (isOpen) {
      loadUserCategories();
    } else {
      // ✅ 모달이 닫힐 때 폼 상태를 초기화하여 다음 열릴 때 이전 값이 남지 않도록 함
      reset({ categories: [] });
    }
  }, [isOpen, loadUserCategories, reset]);

  useEffect(() => {
    // ✅ majorCategories가 없으면 아무 작업도 하지 않도록 조건 추가
    if (!isOpen || majorCategories.length === 0) return;

    // 기존 예산 데이터를 쉽게 조회할 수 있도록 Map으로 변환
    const categoryMap = (existingBudgetData && existingBudgetData.categories)
      ? new Map(existingBudgetData.categories.map(c => [c.categoryId, c.amount]))
      : new Map();
      
    // ✅ --- 변경된 부분 ---
    // 'expense' 타입의 카테고리만 필터링합니다.
    // 만약 카테고리 객체의 타입 속성명이 'type'이 아니거나, 값이 'expense'가 아니라면 이 부분을 수정해주세요.
    const expenseCategories = majorCategories.filter(cat => cat.type === 'expense');

    replace(expenseCategories.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      amount: categoryMap.get(cat.id) || 0,
    })));

  }, [isOpen, majorCategories, existingBudgetData, replace]);

  const onFormSubmit = (data: FormValues) => {
    const budgetData: CreateBudgetRequest = {
      month,
      categories: data.categories
        .filter(cat => cat.amount > 0)
        .map(cat => ({
          categoryId: cat.categoryId,
          // ✅ 입력값이 문자열로 들어올 수 있으므로 Number()로 확실하게 변환
          amount: Number(cat.amount),
        })),
    };
    onSubmit(budgetData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {month} 예산 설정
                </Dialog.Title>
                <form onSubmit={handleSubmit(onFormSubmit)} className="mt-4">
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-3 gap-3 items-center">
                        <label className="col-span-1 text-sm font-medium text-gray-700 truncate">{field.categoryName}</label>
                        {/* ✅ Controller를 사용하여 숫자 입력 필드를 더 안정적으로 관리 */}
                        <Controller
                          control={control}
                          name={`categories.${index}.amount`}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <input
                              type="number"
                              step="1000"
                              className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="예산액 입력"
                              onBlur={onBlur}
                              onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
                              value={value || ''}
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                      취소
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                      저장하기
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}