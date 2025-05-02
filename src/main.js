import { menu, initialState, CATEGORIES, ORDER_STATUS } from './data.js';
import { getMenu, filterMenuByCategory, findMenuItem } from './menuFunctions.js';
import { createOrder, addItemToOrder, placeOrder } from './orderFunctions.js';
import { createEventSystem } from './eventSystem.js';

// 콘솔에 표 형태로 출력하는 유틸리티 함수
const printTable = (items, properties) => {
  // 헤더 생성
  const headers = properties.map(p => p.label || p.key);
  const widths = properties.map(p => Math.max(
    p.width || 10,
    p.label?.length || p.key.length
  ));

  // 헤더 출력
  console.log('\n' + headers.map((h, i) => h.padEnd(widths[i])).join(' | '));
  console.log(widths.map(w => '-'.repeat(w)).join('-+-'));

  // 데이터 행 출력
  items.forEach(item => {
    const row = properties.map((p, i) => {
      const value = p.format ? p.format(item[p.key]) : item[p.key];
      return String(value).padEnd(widths[i]);
    });
    console.log(row.join(' | '));
  });
  console.log();
};

// 메뉴 출력
const displayMenu = (menuItems) => {
  console.log("\n===== 맥도날드 메뉴 =====");
  printTable(menuItems, [
    { key: 'id', label: '상품코드', width: 6 },
    { key: 'name', label: '메뉴명', width: 15 },
    { key: 'price', label: '가격', width: 8, format: p => `${p}원` },
    { key: 'category', label: '분류', width: 10 }
  ]);
};

// 주문 내역 출력
const displayOrder = (order) => {
  console.log(`\n===== 주문 내역 =====`);
  if (!order || !order.items || order.items.length === 0) {
    console.log("주문 내역이 없습니다.");
    return;
  }

  printTable(order.items, [
    { key: 'name', label: '메뉴명', width: 15 },
    { key: 'quantity', label: '수량', width: 6, format: q => q || 1 },
    { key: 'price', label: '단가', width: 8, format: p => `${p}원` }
  ]);

  console.log(`총 금액: ${order.total}원`);
  if (order.orderNumber) {
    console.log(`주문번호: ${order.orderNumber}`);
  }
  console.log(`상태: ${order.status}`);
};

// 주문 상태 변경 출력
const displayOrderStatus = (order) => {
  console.log(`\n주문번호 ${order.orderNumber}의 상태가 [${order.status}](으)로 변경되었습니다.`);
};

// 이벤트 시스템 생성
const events = createEventSystem();

// 이벤트 구독 설정
events.subscribe('order:placed', (order) => {
  console.log(`\n[알림] 주문 ${order.orderNumber}번이 접수되었습니다!`);
});

events.subscribe('order:processing', (order) => {
  console.log(`\n[알림] 주문 ${order.orderNumber}번 조리를 시작합니다!`);
});

events.subscribe('order:completed', (order) => {
  console.log(`\n[알림] 주문 ${order.orderNumber}번이 완료되었습니다!`);
  console.log(`픽업 카운터에서 음식을 받아가세요.`);
});

// 상태 관리
let state = initialState;

const updateState = (newState) => {
  state = newState;
  return state;
};

// 메인 함수
const main = () => {
  console.log("\n===== 맥도날드 주문 시스템 =====");
  
  // 1. 메뉴 표시
  const fullMenu = getMenu();
  displayMenu(fullMenu);
  
  // 2. 버거 카테고리만 표시
  console.log("\n===== 버거 메뉴 =====");
  const burgers = filterMenuByCategory(CATEGORIES.BURGER, fullMenu);
  displayMenu(burgers);

  // 3. 주문 생성
  console.log("\n===== 새 주문 시작 =====");
  let order = createOrder();
  displayOrder(order);

  // 4. 아이템 추가: 빅맥
  const bigMac = findMenuItem('b1', fullMenu);
  console.log(`\n${bigMac.name}을(를) 주문에 추가합니다.`);
  order = addItemToOrder(bigMac, order);
  displayOrder(order);

  // 5. 아이템 추가: 후렌치 후라이
  const fries = findMenuItem('s1', fullMenu);
  console.log(`\n${fries.name}을(를) 주문에 추가합니다.`);
  order = addItemToOrder(fries, order);
  displayOrder(order);

  // 6. 아이템 추가: 콜라
  const coke = findMenuItem('d1', fullMenu);
  console.log(`\n${coke.name}을(를) 주문에 추가합니다.`);
  order = addItemToOrder(coke, order);
  displayOrder(order);

  // 7. 주문 접수
  console.log("\n===== 주문 접수 =====");
  state = updateState(placeOrder(state, order));
  const placedOrder = state.orders[0];
  displayOrder(placedOrder);
  events.emit('order:placed', placedOrder);

  // 현재까지 구현된 주문 처리 단계까지만 진행
  // 주문 처리와 완료 함수는 다음 단계에서 구현할 예정

  // 시스템 상태 출력
  console.log("\n===== 시스템 상태 =====");
  console.log(`접수된 주문 수: ${state.orders.length}`);
  console.log(`대기 중인 주문 수: ${state.orderQueue.length}`);
  console.log(`마지막 주문번호: ${state.lastOrderNumber}`);
  
  return state;
};

// 프로그램 실행
const finalState = main();