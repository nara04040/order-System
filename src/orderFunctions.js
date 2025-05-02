// src/orderFunctions.js
import { ORDER_STATUS } from './data.js';
import { curry, pipe, updateObject, compose } from './utils.js';

/**
 * 새 주문 객체 생성
 */
const createOrder = (items = []) => ({
  items: items,
  total: calculateTotal(items),
  status: ORDER_STATUS.CREATING,
  timestamp: Date.now(),
  itemCount: calculateItemCount(items)
});

/**
 * 주문 아이템 총 개수 계산
 */
const calculateItemCount = (items) => 
  items.reduce((count, item) => count + (item.quantity || 1), 0);

/**
 * 주문 총액 계산
 */
const calculateTotal = (items) => 
  items.reduce((sum, item) => 
    sum + (item.price * (item.quantity || 1)), 0);

/**
 * 주문에 아이템 추가 (불변성 유지)
 */
const addItemToOrder = curry((item, order) => {
  // 이미 동일한 아이템이 있는지 확인
  const existingItemIndex = order.items.findIndex(i => i.id === item.id);
  
  let newItems;
  if (existingItemIndex >= 0) {
    // 동일 아이템이 있으면 수량만 증가
    newItems = [...order.items];
    const existingItem = newItems[existingItemIndex];
    newItems[existingItemIndex] = {
      ...existingItem,
      quantity: (existingItem.quantity || 1) + (item.quantity || 1)
    };
  } else {
    // 새 아이템 추가
    const itemWithQuantity = item.quantity ? item : { ...item, quantity: 1 };
    newItems = [...order.items, itemWithQuantity];
  }
  
  return {
    ...order,
    items: newItems,
    total: calculateTotal(newItems),
    itemCount: calculateItemCount(newItems)
  };
});

/**
 * 주문에서 아이템 제거 (불변성 유지)
 */
const removeItemFromOrder = curry((itemId, order) => {
  const newItems = order.items.filter(item => item.id !== itemId);
  
  return {
    ...order,
    items: newItems,
    total: calculateTotal(newItems),
    itemCount: calculateItemCount(newItems)
  };
});

/**
 * 주문 아이템 수량 변경 (불변성 유지)
 */
const updateItemQuantity = curry((itemId, newQuantity, order) => {
  if (newQuantity <= 0) {
    // 수량이 0 이하면 아이템 제거
    return removeItemFromOrder(itemId, order);
  }
  
  const itemIndex = order.items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) return order; // 아이템이 없으면 주문 그대로 반환
  
  const newItems = [...order.items];
  newItems[itemIndex] = {
    ...newItems[itemIndex],
    quantity: newQuantity
  };
  
  return {
    ...order,
    items: newItems,
    total: calculateTotal(newItems),
    itemCount: calculateItemCount(newItems)
  };
});

/**
 * 주문번호 생성
 */
const generateOrderNumber = (lastOrderNumber) => lastOrderNumber + 1;

/**
 * 주문 상태 변경 (불변성 유지)
 */
const updateOrderStatus = curry((newStatus, order) => ({
  ...order,
  status: newStatus,
  ...(newStatus === ORDER_STATUS.PLACED ? { placedAt: Date.now() } : {}),
  ...(newStatus === ORDER_STATUS.COMPLETED ? { completedAt: Date.now() } : {})
}));

/**
 * 주문에 할인 적용
 */
const applyDiscount = curry((discount, order) => {
  const discountAmount = typeof discount === 'function' 
    ? discount(order.total) 
    : discount;
  
  return {
    ...order,
    discount: discountAmount,
    total: Math.max(0, order.total - discountAmount)
  };
});

/**
 * 주문 접수 처리 (불변성 유지)
 */
const placeOrder = curry((state, order) => {
  const orderNumber = generateOrderNumber(state.lastOrderNumber);
  
  // 파이프라인을 통해 주문 완료 처리
  const finalizedOrder = pipe(
    updateOrderStatus(ORDER_STATUS.PLACED),
    (obj) => updateObject(obj, { orderNumber })
  )(order);
  
  // 새로운 상태 반환 (불변성 유지)
  return {
    ...state,
    orders: [...state.orders, finalizedOrder],
    orderQueue: [...state.orderQueue, finalizedOrder],
    currentOrder: null,
    lastOrderNumber: orderNumber,
    // 일일 통계 업데이트
    dailyStats: {
      ...state.dailyStats,
      totalSales: state.dailyStats.totalSales + finalizedOrder.total,
      orderCount: state.dailyStats.orderCount + 1
    }
  };
});

/**
 * 주문 취소
 */
const cancelOrder = curry((orderNumber, state) => {
  // 접수된 주문 중에서 해당 주문번호 찾기
  const orderIndex = state.orders.findIndex(o => o.orderNumber === orderNumber);
  if (orderIndex === -1) return state;
  
  const order = state.orders[orderIndex];
  
  // 이미 처리 중이거나 완료된 주문은 취소 불가
  if (order.status === ORDER_STATUS.PROCESSING || 
      order.status === ORDER_STATUS.COMPLETED) {
    return state;
  }
  
  // 취소된 주문으로 상태 변경
  const cancelledOrder = updateOrderStatus(ORDER_STATUS.CANCELLED, order);
  
  // 새로운 주문 목록 생성 (불변성 유지)
  const newOrders = [...state.orders];
  newOrders[orderIndex] = cancelledOrder;
  
  // 대기열에서 해당 주문 제거
  const newOrderQueue = state.orderQueue.filter(
    o => o.orderNumber !== orderNumber
  );
  
  // 새로운 상태 반환
  return {
    ...state,
    orders: newOrders,
    orderQueue: newOrderQueue,
    // 취소된 주문이 있으면 통계에서도 제외
    dailyStats: {
      ...state.dailyStats,
      totalSales: state.dailyStats.totalSales - order.total,
      orderCount: state.dailyStats.orderCount - 1
    }
  };
});

/**
 * 주문 요약 정보 생성
 */
const createOrderSummary = (order) => ({
  orderNumber: order.orderNumber,
  status: order.status,
  total: order.total,
  itemCount: order.itemCount,
  items: order.items.map(item => ({
    name: item.name,
    quantity: item.quantity || 1,
    price: item.price * (item.quantity || 1)
  })),
  timestamp: order.timestamp
});

/**
 * 현재 활성화된 주문 찾기 (처리 중 + 접수됨)
 */
const getActiveOrders = (state) => 
  state.orders.filter(order => 
    order.status === ORDER_STATUS.PLACED || 
    order.status === ORDER_STATUS.PROCESSING
  );

/**
 * 주문 이력 가져오기 (완료 + 취소)
 */
const getOrderHistory = (state) => 
  state.orders.filter(order => 
    order.status === ORDER_STATUS.COMPLETED || 
    order.status === ORDER_STATUS.CANCELLED
  );

/**
 * 특정 주문 찾기
 */
const findOrderById = curry((orderNumber, state) => 
  state.orders.find(order => order.orderNumber === orderNumber)
);

export {
  createOrder,
  addItemToOrder,
  removeItemFromOrder,
  updateItemQuantity,
  calculateTotal,
  generateOrderNumber,
  updateOrderStatus,
  applyDiscount,
  placeOrder,
  cancelOrder,
  createOrderSummary,
  getActiveOrders,
  getOrderHistory,
  findOrderById
};