import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';

// ✅ onSubmit으로 전달할 데이터 타입에 type 추가
interface SubmitData {
  name: string;
  type: 'income' | 'expense';
}

interface CategoryInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitData) => void;
  title: string;
}

// ✅ 폼 데이터 타입에 type 추가
interface FormData {
  name: string;
  type: 'income' | 'expense';
}

export default function CategoryInputModal({ isOpen, onClose, onSubmit, title }: CategoryInputModalProps) {
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'expense', // 기본값은 '지출'
    }
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setFocus('name'), 100);
      reset({ name: '', type: 'expense' });
    }
  }, [isOpen, setFocus, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
    onClose();
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
                  {title}
                </Dialog.Title>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
                  {/* ✅ 유형(수입/지출) 선택 라디오 버튼 추가 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">유형</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                       <label className="flex items-center justify-center p-3 border rounded-md cursor-pointer has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:border-indigo-600">
                        <input type="radio" value="expense" {...register('type')} className="sr-only" />
                        지출
                      </label>
                      <label className="flex items-center justify-center p-3 border rounded-md cursor-pointer has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:border-indigo-600">
                        <input type="radio" value="income" {...register('type')} className="sr-only" />
                        수입
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리 이름</label>
                    <input
                      type="text"
                      {...register('name', { required: '카테고리 이름을 입력해주세요.' })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="예: 온라인 강의, 저녁 약속"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                      취소
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                      추가하기
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
