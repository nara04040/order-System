// src/eventSystem.js

/**
 * 간단한 이벤트 시스템 생성 함수
 * 함수형 프로그래밍 방식으로 클로저를 활용한 이벤트 관리
 * @returns {Object} 이벤트 구독 및 발행 메서드 제공 객체
 */
const createEventSystem = () => {
  // 이벤트 리스너 보관용 객체 (클로저 내부 상태)
  const listeners = {};
  
  /**
   * 이벤트 구독 메서드
   * @param {string} event 구독할 이벤트 이름
   * @param {Function} callback 이벤트 발생 시 실행할 콜백 함수
   * @returns {Function} 구독 취소 함수
   */
  const subscribe = (event, callback) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    
    // 구독 취소 함수 반환 (함수형 프로그래밍의 일급 시민으로서의 함수 특성 활용)
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  };
  
  /**
   * 이벤트 발행 메서드
   * @param {string} event 발행할 이벤트 이름
   * @param {*} data 이벤트와 함께 전달할 데이터
   */
  const emit = (event, data) => {
    if (!listeners[event]) return;
    listeners[event].forEach(callback => callback(data));
  };
  
  // 메서드들을 객체로 묶어 반환
  return { 
    subscribe, 
    emit 
  };
};

export { createEventSystem };