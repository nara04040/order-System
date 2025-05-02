import { CATEGORIES, ORDER_STATUS } from "./data";
import { curry } from "./utils";

/**
 * [x] updateOrderStatus - 주문 상태 업데이트
 * [x] processNextOrder - 대기열에서 다음 주문을 가져와 처리 상태로 변경
 * [x] completeOrder - 주문 처리 완료 처리
 * [x] getNextOrderFromQueue - 대기열에서 다음 처리할 주문 가져오기
 * [x] estimateProcessingTime - 주문 처리 예상 시간 계산 (선택적)
 * [] cancelProcessingOrder - 처리 중인 주문 취소 (선택적)
 */

// 주문 상태 업데이트

const updateOrderStatus = curry((newStatus, order) => ({
  ...order,
  status: newStatus,
  statusUpdatedAt: Date.now()
}));

/**
 * queue에서 다음 주문 처리를 시작
 * 대기열의 첫 번째 주문을 처리 상태로 변경하고 큐에서 제거시킴
 * @param {*} state 
 * @returns 
 */
const processNextOrder = (state) => {
  // queue가 비어있다면? 그대로 반환
  if (state.orderQueue.length === 0) return state;

  // queue의 첫 번째 주문을 그대로 가져온다.
  const [nextOrder, ...remainingQueue] = state.orderQueue;

  // 주문 상태를 processing으로 변경한다.
  const processingOrder = updateOrderStatus(ORDER_STATUS.PROCESSING, nextOrder);

  // 전체 주문 목록에서 해당 주문 상태를 업데이트 시킨다.
  const updatedOrders = state.orders.map(order => order.orderNumber === processingOrder.orderNumber ? processingOrder : order);

  return {
    ...state,
    order: updatedOrders,
    orderQueue: remainingQueue,
    processingOrder: processingOrder  // 현재 처리 중인 주문 추적하게 함
  }
};

/**
 * 주문 처리 완료
 * - 주문번호로 특정 주문을 찾는다.
 * - 주문 상태를 COMPLETED로 변경시킨다.
 * - 주문 목록을 업데이트 시킨다.
 * - 만약 현재 처리 중인 주문이 완료된다면 processingOrder값을 null로 설정시킨다.
 */

const completeOrder = curry((orderNumber, state) => {
  // 주문 찾기
  const orderIndex = state.orders.findIndex(order => order.orderNumber === orderNumber);

  // 주문이 없거나 완료된 경우라면 상태를 그대로 반환
  if (orderIndex = -1) return state;
  const order = state.orders[orderIndex];
  if(order.status === ORDER_STATUS.COMPLETED) return false;

  // 주문 상태를 complated로 변경
  const completedOrder = updateOrderStatus(ORDER_STATUS.COMPLETED, order);

  // 주문 목록을 업데이트 시킨다.
  const updatedOrders = [...state.orders];
  updatedOrders[orderIndex] = completedOrder;

  // 새로운 상태 반환
  return {
    ...state,
    orders: updatedOrders,
    // 완료된 주문이 현재 처리 중이였던 주문이라면 ? processingOrder를 제거시킴
    ...(state.processingOrder?.orderNumber === orderNumber ? {processingOrder: null} : {})
  };
});

/**
 * 대기열에서 다음 처리할 주문을 가져오기
 * - 상태 변경 X, 다음 처리할 주문 정봄나 반환 시키는 것
 * 활용 예시 : 주문 모니터링하기, 예상 처리 시간 계산
 *
 * @param {*} state 
 * @returns 
 */
const getNextOrderFromQueue = (state) => {
  // queue 가 비어잇다면 null 반환
  if(state.orderQueue.length === 0) return null;

  // queue의 첫 번째 주문 반환
  return state.orderQueue[0];
};

/**
 * 주문 처리 예상 시간 계산
 * 각 메뉴 아이템 마다 기본 처리시간이 존재하고, 주문 아이템 수에 따라 시간도 증가한다.
 * @param {*} order 
 * @returns 
 */

const estimateProcessingTime = (order) => {
  if(!order || !order.items || order.items.length === 0) return 0;

  // 기본 처리 시간(sec)
  const categoryProcessingTime = {
    [CATEGORIES.BURGER]: 120,
    [CATEGORIES.SIDE]: 60,
    [CATEGORIES.DRINK]: 30,
    [CATEGORIES.DESSERT]: 45,
    [CATEGORIES.SET]: 180,
  };

  // 총 예산 시간 계산 
  // 가장 오래 걸리는 item + 추가 item마다 30초
  const baseTime = Math.max(
    ...order.items.map(item => categoryProcessingTime[item.category] || 60)
  );
  
  // 아이템 개수에 따른 추가 시간 (첫 아이템 제외)
  const additionalTime = Math.max(0, order.items.length - 1) * 30;
  
  return baseTime + additionalTime;
};

const cancelProcessingOrder = curry((reson, orderNumber, state) => {
    // 주문 찾기
    const orderIndex = state.orders.findIndex(order => order.orderNumber === orderNumber);
  
    // 주문이 없거나 이미 완료/취소된 경우 상태 그대로 반환
    if (orderIndex === -1) return state;
    const order = state.orders[orderIndex];
    
    // 이미 완료되었거나 취소된 주문은 취소 불가
    if (order.status === ORDER_STATUS.COMPLETED || 
        order.status === ORDER_STATUS.CANCELLED) {
      return state;
    }
    
    // 주문 상태를 cancelled로 변경하고 취소 이유 기록
    const cancelledOrder = {
      ...updateOrderStatus(ORDER_STATUS.CANCELLED, order),
      cancellationReason: reason,
      cancelledAt: Date.now()
    };
    
    // 주문 목록 업데이트
    const updatedOrders = [...state.orders];
    updatedOrders[orderIndex] = cancelledOrder;
    
    // 새로운 상태 반환
    return {
      ...state,
      orders: updatedOrders,
      // 취소된 주문이 현재 처리 중이었던 주문이면 processingOrder 제거
      ...(state.processingOrder?.orderNumber === orderNumber 
        ? { processingOrder: null } 
        : {})
    };
});

export {
  updateOrderStatus,
  processNextOrder,
  completeOrder,
  getNextOrderFromQueue,
  estimateProcessingTime,
  cancelProcessingOrder
}