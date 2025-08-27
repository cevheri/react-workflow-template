import { create } from 'zustand';
import { Material, UnitType } from '@/lib/types';

interface MaterialFilter {
  category?: string;
  subcategory?: string;
  query?: string;
}

interface MaterialStore {
  materials: Material[];
  categories: string[];
  subcategoriesByCategory: Record<string, string[]>;
  filter: MaterialFilter;
  setFilter: (partial: Partial<MaterialFilter>) => void;
  resetFilter: () => void;
  getFiltered: () => Material[];
}

const CATEGORIES = {
  Office: ['Stationery', 'Furniture', 'Electronics'],
  Lab: ['Chemicals', 'Glassware', 'Instruments'],
  IT: ['Laptops', 'Peripherals', 'Network'],
  Maintenance: ['Tools', 'Consumables', 'Safety']
} as const;

const defaultUnits: UnitType[] = ['Piece', 'Kg', 'Liter', 'Package'];

const generateMockMaterials = (): Material[] => {
  const list: Material[] = [];
  let idCounter = 1;
  Object.entries(CATEGORIES).forEach(([category, subs]) => {
    subs.forEach((subcategory, subIdx) => {
      for (let i = 1; i <= 50; i++) {
        const id = `${category}-${subcategory}-${i}`;
        list.push({
          id,
          code: `${category.substring(0,2).toUpperCase()}-${subcategory.substring(0,2).toUpperCase()}-${i
            .toString()
            .padStart(3, '0')}`,
          name: `${subcategory} Item ${i}`,
          category,
          subcategory,
          unit: defaultUnits[(i + subIdx) % defaultUnits.length]
        });
        idCounter++;
      }
    });
  });
  return list;
};

export const useMaterialStore = create<MaterialStore>((set, get) => ({
  materials: generateMockMaterials(),
  categories: Object.keys(CATEGORIES),
  subcategoriesByCategory: Object.fromEntries(
    Object.entries(CATEGORIES).map(([k, v]) => [k, [...v]])
  ),
  filter: {},
  setFilter: (partial) => set((state) => ({ filter: { ...state.filter, ...partial } })),
  resetFilter: () => set({ filter: {} }),
  getFiltered: () => {
    const { materials, filter } = get();
    const q = (filter.query || '').toLowerCase().trim();
    return materials.filter((m) => {
      const matchCat = filter.category ? m.category === filter.category : true;
      const matchSub = filter.subcategory ? m.subcategory === filter.subcategory : true;
      const matchQuery = q
        ? m.name.toLowerCase().includes(q) ||
          (m.code ? m.code.toLowerCase().includes(q) : false)
        : true;
      return matchCat && matchSub && matchQuery;
    });
  }
}));


