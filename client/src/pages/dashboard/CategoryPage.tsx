import { useState, useEffect, Fragment } from 'react'; // Fragment 추가
import useCategoryStore from '../../store/categoryStore';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Transition, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import CategoryInputModal from '../../components/dashboard/CategoryInputModal';
import { fetchDefaultMajorCategories, fetchDefaultMinorCategories } from '../../api/categoryApi';
import type { RecommendedCategory } from '../../types/api';

export default function CategoryPage() {
  const {
    majorCategories,
    isLoading,
    loadUserCategories,
    addUserMajorCategory,
    addUserMinorCategory,
    deleteCategory,
  } = useCategoryStore();

  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(null);
  const [majorRecs, setMajorRecs] = useState<RecommendedCategory[]>([]);
  const [minorRecsCache, setMinorRecsCache] = useState<Record<string, RecommendedCategory[]>>({});
  const [isLoadingMajorRecs, setIsLoadingMajorRecs] = useState(false);
  const [isLoadingMinorRecs, setIsLoadingMinorRecs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'major' | 'minor' | null>(null);
  const selectedMajorCategory = majorCategories.find(c => c.id === selectedMajorId);

  useEffect(() => {
    loadUserCategories();
  }, [loadUserCategories]);

  useEffect(() => {
    const loadMajorRecs = async () => {
      setIsLoadingMajorRecs(true);
      try {
        const data = await fetchDefaultMajorCategories();
        setMajorRecs(data.filter(item => item.id != null));
      } catch (error) {
        console.error("대분류 추천 목록 조회 실패:", error);
      } finally {
        setIsLoadingMajorRecs(false);
      }
    };
    loadMajorRecs();
  }, []);

  const handleOpenMinorMenu = async () => {
    if (!selectedMajorCategory || minorRecsCache[selectedMajorCategory.id]) return;
    setIsLoadingMinorRecs(true);
    try {
      const data = await fetchDefaultMinorCategories(selectedMajorCategory.id);
      setMinorRecsCache(prev => ({ ...prev, [selectedMajorCategory.id]: data.filter(item => item.id != null) }));
    } catch (error) {
      console.error("소분류 추천 목록 조회 실패:", error);
    } finally {
      setIsLoadingMinorRecs(false);
    }
  };

  const userMajorCategoryNames = majorCategories.map(c => c.name);
  const userMinorCategoryNames = selectedMajorCategory?.minorCategories.map(c => c.name) || [];
  const availableMajorRecommendations = majorRecs.filter(rec => !userMajorCategoryNames.includes(rec.name));
  const availableMinorRecommendations = selectedMajorCategory ? (minorRecsCache[selectedMajorCategory.id] || []).filter(rec => !userMinorCategoryNames.includes(rec.name)) : [];

  const openModal = (mode: 'major' | 'minor') => { setModalMode(mode); setIsModalOpen(true); };

  const handleModalSubmit = async (data: { name: string; type: 'income' | 'expense' }) => {
    try {
      if (modalMode === 'major') {
        if (userMajorCategoryNames.includes(data.name)) { alert('이미 존재하는 대분류입니다.'); return; }
        await addUserMajorCategory(data.name, data.type);
      } else if (modalMode === 'minor' && selectedMajorCategory) {
        if (userMinorCategoryNames.includes(data.name)) { alert('이미 존재하는 소분류입니다.'); return; }
        await addUserMinorCategory(selectedMajorCategory.id, data.name, data.type);
      }
    } catch (error) {
      alert('카테고리 추가에 실패했습니다.');
    }
  };

  const handleAddMajor = async (name: string, type: 'income' | 'expense') => {
    try {
      await addUserMajorCategory(name, type);
    } catch (error) {
      alert('카테고리 추가에 실패했습니다.');
    }
  };

  const handleAddMinor = async (name: string, type: 'income' | 'expense') => {
    if (selectedMajorCategory) {
      try {
        await addUserMinorCategory(selectedMajorCategory.id, name, type);
      } catch (error) {
        alert('카테고리 추가에 실패했습니다.');
      }
    }
  };

  const handleDeleteMajor = async (majorId: string) => {
    if (window.confirm('대분류를 삭제하면 포함된 모든 소분류가 함께 삭제됩니다. 정말 삭제하시겠습니까?')) {
      try {
        await deleteCategory(majorId);
        if (selectedMajorId === majorId) {
          setSelectedMajorId(null);
        }
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleDeleteMinor = async (minorId: string) => {
    try {
      await deleteCategory(minorId);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  // ✅ majorCategories를 수입과 지출로 분리합니다.
  const incomeCategories = majorCategories.filter(cat => cat.type === 'income');
  const expenseCategories = majorCategories.filter(cat => cat.type === 'expense');

  if (isLoading) {
    return <div className="p-6">카테고리 목록을 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">카테고리 관리</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">대분류</h2>
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                <Plus size={16} /> 추가
              </MenuButton>
              <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="px-1 py-1">
                    {isLoadingMajorRecs ? ( <div className="px-2 py-2 text-sm text-gray-500">불러오는 중...</div> ) 
                    : availableMajorRecommendations.length > 0 ? (
                      availableMajorRecommendations.map(rec => (
                        <MenuItem key={`major-rec-${rec.id}`}>
                          <button onClick={() => handleAddMajor(rec.name, rec.type)} className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 data-[active]:bg-indigo-500 data-[active]:text-white">
                            {rec.name}
                          </button>
                        </MenuItem>
                      ))
                    ) : ( <div className="px-2 py-2 text-sm text-gray-500">추가할 추천 항목이 없습니다.</div> )}
                  </div>
                  <div className="px-1 py-1">
                    <MenuItem>
                      <button onClick={() => openModal('major')} className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 data-[active]:bg-indigo-500 data-[active]:text-white">
                        <Edit className="w-4 h-4 mr-2" /> 직접 입력...
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
          
          {/* ✅ 수입/지출 분리 렌더링 시작 */}
          <div className="space-y-6">
            {/* 수입 섹션 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-blue-600 border-b pb-2">수입</h3>
              <ul className="space-y-2 pt-2">
                {incomeCategories.length > 0 ? (
                  incomeCategories.map(major => (
                    <li key={`major-user-${major.id}`} onClick={() => setSelectedMajorId(major.id)} 
                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedMajorId === major.id ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100'}`}>
                      <span className="font-semibold">{major.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteMajor(major.id); }} 
                              className={`p-1 rounded-full ${selectedMajorId === major.id ? 'hover:bg-indigo-500' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-2 text-sm">수입 카테고리가 없습니다.</p>
                )}
              </ul>
            </div>

            {/* 지출 섹션 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-red-600 border-b pb-2">지출</h3>
              <ul className="space-y-2 pt-2">
                {expenseCategories.length > 0 ? (
                  expenseCategories.map(major => (
                    <li key={`major-user-${major.id}`} onClick={() => setSelectedMajorId(major.id)} 
                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedMajorId === major.id ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100'}`}>
                      <span className="font-semibold">{major.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteMajor(major.id); }} 
                              className={`p-1 rounded-full ${selectedMajorId === major.id ? 'hover:bg-indigo-500' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-2 text-sm">지출 카테고리가 없습니다.</p>
                )}
              </ul>
            </div>
          </div>
          {/* ✅ 수입/지출 분리 렌더링 끝 */}

          {majorCategories.length === 0 && (<p className="text-gray-500 text-center py-4">추천 카테고리를 추가하여 시작해 보세요.</p>)}
        </div>

        <Transition show={!!selectedMajorCategory} as={Fragment} enter="transition-all duration-300" enterFrom="opacity-0 -translate-y-4" enterTo="opacity-100 translate-y-0" leave="transition-all duration-200" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-4">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">'{selectedMajorCategory?.name}'의 소분류</h2>
              <Menu as="div" className="relative">
                <MenuButton onClick={handleOpenMinorMenu} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"><Plus size={16}/> 추가</MenuButton>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                    <div className="px-1 py-1">
                      {isLoadingMinorRecs ? ( <div className="px-2 py-2 text-sm text-gray-500">불러오는 중...</div> ) 
                      : availableMinorRecommendations.length > 0 ? (
                        availableMinorRecommendations.map(rec => (
                          <MenuItem key={`minor-rec-${rec.id}`}>
                            <button onClick={() => handleAddMinor(rec.name, rec.type)} className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 data-[active]:bg-indigo-500 data-[active]:text-white">{rec.name}</button>
                          </MenuItem>
                        ))
                      ) : ( <div className="px-2 py-2 text-sm text-gray-500">추가할 추천 항목이 없습니다.</div> )}
                    </div>
                    <div className="px-1 py-1">
                      <MenuItem>
                        <button onClick={() => openModal('minor')} className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 data-[active]:bg-indigo-500 data-[active]:text-white">
                          <Edit className="w-4 h-4 mr-2" /> 직접 입력...
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>
            <ul className="space-y-2">
              {selectedMajorCategory?.minorCategories.map(minor => (
                <li key={`minor-user-${minor.id}`} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100">
                  <span className="text-gray-700">{minor.name}</span>
                  <button onClick={() => handleDeleteMinor(minor.id)} className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600"><Trash2 size={16} /></button>
                </li>
              ))}
              {selectedMajorCategory?.minorCategories.length === 0 && (<p className="text-gray-500 text-center py-4">추천 소분류를 추가하거나 직접 만들어 보세요.</p>)}
            </ul>
          </div>
        </Transition>
        
        {!selectedMajorCategory && majorCategories.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center min-h-[200px]">
            <p className="text-gray-500">대분류를 선택하여 소분류를 관리하세요.</p>
          </div>
        )}
      </div>

      {isModalOpen && <CategoryInputModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} title={modalMode === 'major' ? '새 대분류 추가' : '새 소분류 추가'} />}
    </div>
  );
}