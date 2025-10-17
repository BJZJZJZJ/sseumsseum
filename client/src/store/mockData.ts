import type { MajorCategory } from "../types/category";

// 예시 목업 데이터 (실제로는 스토어 내부에서 관리)
export const mockMajorCategories: MajorCategory[] = [
  {
    id: 'major-1',
    name: '식비',
    minorCategories: [
      { id: 'minor-1-1', name: '점심' },
      { id: 'minor-1-2', name: '저녁' },
      { id: 'minor-1-3', name: '카페/간식' },
    ],
  },
  {
    id: 'major-2',
    name: '교통',
    minorCategories: [
      { id: 'minor-2-1', name: '지하철/버스' },
      { id: 'minor-2-2', name: '택시' },
      { id: 'minor-2-3', name: '주유비' },
    ],
  },
  {
    id: 'major-3',
    name: '생활',
    minorCategories: [
      { id: 'minor-3-1', name: '생필품' },
      { id: 'minor-3-2', name: '통신비' },
    ],
  },
];