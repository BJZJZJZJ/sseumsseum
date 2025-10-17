import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { uploadTransactions } from '../../api/transactionApi';
import type { UploadTransactionsResponse } from '../../types/api';

interface TransactionUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export default function TransactionUploadModal({ isOpen, onClose, onUploadSuccess }: TransactionUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadTransactionsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // ✅ 파일의 MIME 타입 대신 이름의 확장자를 확인하는 방식으로 변경
            if (file.name.toLowerCase().endsWith('.csv')) {
                setSelectedFile(file);
                setError(null);
            } else {
                setError('CSV 파일만 업로드할 수 있습니다.');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);
        setUploadResult(null);

        try {

            const result = await uploadTransactions(selectedFile);
            setUploadResult(result);
            onUploadSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || '업로드 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setUploadResult(null);
        setError(null);
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={handleClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    거래 내역 업로드 (CSV)
                                </Dialog.Title>

                                {uploadResult ? (
                                    // --- 업로드 결과 표시 ---
                                    <div className="mt-4">
                                        <p className="text-green-700 font-semibold">{uploadResult.message}</p>
                                        {uploadResult.error && uploadResult.error.length > 0 && (
                                            <div className="mt-4 max-h-60 overflow-y-auto rounded-md bg-red-50 p-4">
                                                <h4 className="font-bold text-red-800">일부 항목 실패:</h4>
                                                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                                    {uploadResult.error.map((err, index) => (
                                                        <li key={index}>
                                                            <span className="font-semibold">{err.row + 1}번째 행:</span> {err.errors.join(', ')}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div className="mt-6 text-right">
                                            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                                닫기
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // --- 파일 업로드 폼 ---
                                    <div className="mt-4 space-y-4">
                                        <label htmlFor="csvFile" className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                                            <span className="flex items-center space-x-2">
                                                <UploadCloud className="w-6 h-6 text-gray-600" />
                                                <span className="font-medium text-gray-600">
                                                    파일을 드래그하거나 클릭하여 업로드
                                                </span>
                                            </span>
                                            <p className="text-xs text-gray-500">CSV 파일만 가능</p>
                                        </label>
                                        <input id="csvFile" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />

                                        {selectedFile && (
                                            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                                <div className="flex items-center space-x-2">
                                                    <FileIcon className="w-5 h-5 text-gray-500" />
                                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                                </div>
                                                <button onClick={() => setSelectedFile(null)}><X className="w-5 h-5 text-gray-500 hover:text-red-600" /></button>
                                            </div>
                                        )}

                                        {error && <p className="text-sm text-red-600">{error}</p>}

                                        <div className="pt-2 flex justify-end space-x-2">
                                            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                                취소
                                            </button>
                                            <button type="button" onClick={handleUpload} disabled={!selectedFile || isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                                {isLoading ? '업로드 중...' : '업로드하기'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}