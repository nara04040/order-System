// 메뉴 카테고리 정의
const CATEGORIES = {
  BURGER: 'burger',
  SIDE: 'side',
  DRINK: 'drink',
  DESSERT: 'dessert',
  SET: 'set'
};

// 주문 상태 정의
const ORDER_STATUS = {
  CREATING: 'creating',   // 장바구니에 담는 중
  PLACED: 'placed',       // 주문 접수됨
  PROCESSING: 'processing', // 조리 중
  COMPLETED: 'completed',   // 조리 완료
  DELIVERED: 'delivered',    // 고객에게 전달됨
  CANCELLED: 'cancelled'
};

// 메뉴 데이터
const menu = [
  // 버거
  { id: 'b1', name: '빅맥', category: CATEGORIES.BURGER, price: 5500, imageUrl: 'bigmac.jpg', description: '100% 순쇠고기 패티 두 장에 특별한 소스, 양상추, 치즈, 피클, 양파까지' },
  { id: 'b2', name: '쿼터파운더 치즈', category: CATEGORIES.BURGER, price: 6000, imageUrl: 'qpc.jpg', description: '쿼터파운더 치즈의 패티는 100% 순 쇠고기 패티' },
  { id: 'b3', name: '맥크리스피', category: CATEGORIES.BURGER, price: 6500, imageUrl: 'mccrispy.jpg', description: '100% 통닭다리살 겉바속촉 케이준 치킨 패티' },
  
  // 사이드
  { id: 's1', name: '후렌치 후라이', category: CATEGORIES.SIDE, price: 2500, imageUrl: 'fries.jpg', description: '맥도날드의 역사가 담긴 월드 클래스 후렌치 후라이' },
  { id: 's2', name: '맥너겟', category: CATEGORIES.SIDE, price: 3000, imageUrl: 'nuggets.jpg', description: '바삭하고 촉촉한 치킨이 한입에 쏙!' },
  
  // 음료
  { id: 'd1', name: '콜라', category: CATEGORIES.DRINK, price: 2000, imageUrl: 'coke.jpg', description: '코카콜라' },
  { id: 'd2', name: '스프라이트', category: CATEGORIES.DRINK, price: 2000, imageUrl: 'sprite.jpg', description: '스프라이트' },
  
  // 디저트
  { id: 'ds1', name: '아이스크림', category: CATEGORIES.DESSERT, price: 1500, imageUrl: 'icecream.jpg', description: '부드러운 바닐라 아이스크림' },
  { id: 'ds2', name: '애플 파이', category: CATEGORIES.DESSERT, price: 1800, imageUrl: 'applepie.jpg', description: '바삭한 파이와 사과 필링' },
  
  // 세트
  { id: 'set1', name: '빅맥 세트', category: CATEGORIES.SET, price: 8500, imageUrl: 'bigmac_set.jpg', description: '빅맥 + 후렌치 후라이 + 콜라', components: ['b1', 's1', 'd1'] }
];

// 초기 상태
const initialState = {
  orders: [],           // 모든 주문 목록
  currentOrder: null,   // 현재 진행 중인 주문
  orderQueue: [],       // 처리 대기 중인 주문 큐
  lastOrderNumber: 0,   // 마지막으로 발급된 주문번호
  dailyStats: {         // 일일 통계
    totalSales: 0,
    orderCount: 0,
    popularItems: {}
  }
};

export {
  CATEGORIES,
  ORDER_STATUS,
  menu,
  initialState
};