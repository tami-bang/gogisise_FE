// 가격 정보 조회 Mock API (추후 실제 API 연동 시 이 부분을 수정하면 됩니다)
// State(상태)를 UI에서 분리하고 비동기 호출을 시뮬레이션 합니다.

export const fetchTodayPriceSummary = async (category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isHanwoo = category === 'HANWOO';
      resolve({
        price: isHanwoo ? '21,500' : '18,200',
        diff: isHanwoo ? '1,200' : '350',
        isUp: isHanwoo, // 한우는 상승, 한돈은 하락으로 더미 연출
      });
    }, 300);
  });
};

export const fetchPriceDetail = async (category, part) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isHanwoo = category === 'HANWOO';
      resolve({
        price: isHanwoo ? '21,500' : '18,200',
        diff: isHanwoo ? '1,200' : '350',
        isUp: isHanwoo,
        date: new Date().toISOString()
      });
    }, 300);
  });
};

export const shareKakaoMock = async (category, part, price) => {
  const isHanwoo = category === 'HANWOO';
  const dummyApiData = {
    "status": 200,
    "message": "카카오톡 공유 API 호출 성공",
    "data": {
      "title": `[고기시세] ${isHanwoo ? '한우 암컷' : '한돈 암컷'} ${part} 시세 안내`,
      "price": `${price}원`,
      "trend": isHanwoo ? "상승" : "하락",
      "diff": isHanwoo ? "+1,200원" : "-350원",
      "date": new Date().toISOString()
    }
  };

  console.log("=== [API SIMULATION] Kakao Share Payload ===");
  console.log(JSON.stringify(dummyApiData, null, 2));

  return Promise.resolve(dummyApiData);
};
