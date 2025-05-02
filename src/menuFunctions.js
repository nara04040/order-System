import { menu, CATEGORIES } from './data.js';
import { curry, pipe, compose } from './utils.js';

/**
 * 전체 메뉴 반환
 */
const getMenu = () => menu;

/**
 * 카테고리별 메뉴 필터링 (curried 함수)
 */
const filterMenuByCategory = curry((category, menuItems) => 
  menuItems.filter(item => item.category === category)
);

/**
 * ID로 메뉴 아이템 검색 (curried 함수)
 */
const findMenuItem = curry((id, menuItems) => 
  menuItems.find(item => item.id === id)
);

/**
 * 이름으로 메뉴 아이템 검색 (부분 일치)
 */
const searchMenuByName = curry((searchTerm, menuItems) => {
  const term = searchTerm.toLowerCase();
  return menuItems.filter(item => 
    item.name.toLowerCase().includes(term)
  );
});

/**
 * 가격 범위로 메뉴 필터링
 */
const filterMenuByPriceRange = curry((minPrice, maxPrice, menuItems) => 
  menuItems.filter(item => 
    item.price >= minPrice && item.price <= maxPrice
  )
);

/**
 * 메뉴 아이템 정렬
 * sortBy: 'price', 'name'
 * order: 'asc', 'desc'
 */
const sortMenu = curry((sortBy, order, menuItems) => {
  const sorted = [...menuItems].sort((a, b) => {
    if (sortBy === 'price') {
      return a.price - b.price;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });
  
  return order === 'desc' ? sorted.reverse() : sorted;
});

/**
 * 버거 카테고리 메뉴 가져오기 (함수 합성 예시)
 */
const getBurgers = compose(
  filterMenuByCategory(CATEGORIES.BURGER),
  getMenu
);

/**
 * 저렴한 메뉴 아이템 가져오기 (함수 합성 예시)
 */
const getCheapItems = pipe(
  getMenu,
  filterMenuByPriceRange(0, 3000)
);

/**
 * 세트 메뉴의 구성 상품 정보 가져오기
 */
const getSetComponents = curry((setId, menuItems) => {
  const setItem = findMenuItem(setId, menuItems);
  if (!setItem || !setItem.components || setItem.category !== CATEGORIES.SET) {
    return [];
  }
  
  return setItem.components.map(id => findMenuItem(id, menuItems))
    .filter(item => item !== undefined);
});

/**
 * 메뉴 아이템의 할인된 가격 계산
 */
const calculateDiscountedPrice = curry((discountRate, menuItem) => ({
  ...menuItem,
  discountedPrice: Math.round(menuItem.price * (1 - discountRate / 100))
}));

/**
 * 메뉴에 할인 적용 (예: 할인 이벤트)
 */
const applyDiscount = curry((discountRate, menuItems) => 
  menuItems.map(item => calculateDiscountedPrice(discountRate, item))
);

export {
  getMenu,
  filterMenuByCategory,
  findMenuItem,
  searchMenuByName,
  filterMenuByPriceRange,
  sortMenu,
  getBurgers,
  getCheapItems,
  getSetComponents,
  calculateDiscountedPrice,
  applyDiscount
};