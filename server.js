const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');

const SERVICE_KEY = 'aBCeE33mjmqEhr%2F2mSYiVTzbvscZ7pIVretDFwq6tGRTMY3ovfshg6OYTPGUgFHPfAwsHRF%2Bn7Pm4%2FRlE3Y%2BWQ%3D%3D';

let cachedPerforList = [];
let lastCacheTime = null;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/plays', async (req, res) => {
  const { from = '20240101', to = '20251231', realmCode = 'A000', page = '1', rows = '10' } = req.query;
  const parsedPage = parseInt(page, 10);
  const parsedRows = parseInt(rows, 10);
  const CACHE_VALIDITY_MS = 60 * 60 * 1000;
  const now = new Date();

  if (cachedPerforList.length > 0 && lastCacheTime && (now - lastCacheTime < CACHE_VALIDITY_MS)) {
    console.log('캐시된 데이터를 사용합니다.');
    return sendPaginatedData(res, cachedPerforList, parsedPage, parsedRows);
  }

  try {
    let cPage = 1;
    const maxRows = 10;
    let allPerforList = [];
    let fromT = '20241111';

    while (true) {
      const apiUrl = `http://www.culture.go.kr/openapi/rest/publicperformancedisplays/realm?serviceKey=${SERVICE_KEY}&realmCode=${realmCode}&from=${from}&to=${to}&cPage=${cPage}&rows=${maxRows}`;
      const response = await axios.get(apiUrl);

      const result = await new Promise((resolve, reject) => {
        xml2js.parseString(response.data, { explicitArray: false }, (err, parsedResult) => {
          if (err) reject(err);
          else resolve(parsedResult);
        });
      });

      const body = result.response && result.response.msgBody;
      if (!body || !body.perforList) break;

      const perforList = Array.isArray(body.perforList) ? body.perforList : [body.perforList];
      allPerforList = allPerforList.concat(perforList);
      cPage++;

      if (perforList.length < maxRows) break;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const convertToDate = (dateStr) => {
      if (!dateStr) return null;
      return new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
    };

    cachedPerforList = allPerforList.filter(item => {
      const endDate = convertToDate(item.endDate);
      return endDate && endDate >= today;
    }).sort((a, b) => {
      const endDateA = convertToDate(a.endDate || '99991231');
      const endDateB = convertToDate(b.endDate || '99991231');
      return endDateA - endDateB;
    });

    lastCacheTime = new Date();
    console.log('모든 연극 데이터가 캐시되었습니다.');
    return sendPaginatedData(res, cachedPerforList, parsedPage, parsedRows);
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error.message);
    if (error.response) {
      return res.status(error.response.status).send(`외부 API 오류: ${error.response.data}`);
    } else {
      res.status(500).send('서버 오류: 외부 API 요청 실패');
    }
  }
});

function sendPaginatedData(res, data, page, rows) {
  const totalCount = data.length;
  const totalPages = Math.ceil(totalCount / rows);
  const startIndex = (page - 1) * rows;
  const endIndex = Math.min(startIndex + rows, data.length);
  const paginatedList = data.slice(startIndex, endIndex);

  res.json({
    totalCount,
    totalPages,
    currentPage: page,
    rowsPerPage: rows,
    perforList: paginatedList.map((item, index) => ({
      ...item,
      title: `${item.title || '제목 없음'}`,
    })),
  });
}

app.get('/api/plays/details/:seq', async (req, res) => {
  const { seq } = req.params;
  try {
    const apiUrl = `http://www.culture.go.kr/openapi/rest/publicperformancedisplays/d/?seq=${seq}&serviceKey=${SERVICE_KEY}`;
    const response = await axios.get(apiUrl);

    if (response.status !== 200) {
      return res.status(response.status).send('API 요청에 실패하였습니다.');
    }

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(500).send('서버 오류: XML 파싱 실패');
      }

      const perforInfo = result?.response?.msgBody?.perforInfo;
      if (!perforInfo) {
        return res.status(404).send('해당 연극 정보를 찾을 수 없습니다.');
      }

      res.json(perforInfo);
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).send(`외부 API 오류: ${error.response.data}`);
    } else {
      res.status(500).send('서버 오류: 외부 API 요청 실패');
    }
  }
});

app.listen(PORT, () => {
  console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});



/* 
const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');

// 인증키 설정
const SERVICE_KEY = 'aBCeE33mjmqEhr%2F2mSYiVTzbvscZ7pIVretDFwq6tGRTMY3ovfshg6OYTPGUgFHPfAwsHRF%2Bn7Pm4%2FRlE3Y%2BWQ%3D%3D';

// 데이터 캐싱을 위한 변수
let cachedPerforList = [];
let lastCacheTime = null;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// 메인 화면 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 연극 목록 조회 라우트
app.get('/api/plays', async (req, res) => {
  const { from = '20240701', to = '20241231', realmCode = 'A000', page = '1', rows = '10' } = req.query;
  const parsedPage = parseInt(page, 10);
  const parsedRows = parseInt(rows, 10);

  // 캐시 유효 시간 설정 (예: 1시간)
  const CACHE_VALIDITY_MS = 60 * 60 * 1000;

  // 현재 시간
  const now = new Date();

  // 캐시된 데이터가 있고, 캐시가 유효하다면 캐시 사용
  if (cachedPerforList.length > 0 && lastCacheTime && (now - lastCacheTime < CACHE_VALIDITY_MS)) {
    console.log('캐시된 데이터를 사용합니다.');
    return sendPaginatedData(res, cachedPerforList, parsedPage, parsedRows);
  }

  // 그렇지 않다면 API 호출하여 모든 데이터 가져오기
  try {
    let cPage = 1;
    const maxRows = 10;
    let allPerforList = [];
    let fromT = '20241111'

    while (true) {
      const apiUrl = `http://www.culture.go.kr/openapi/rest/publicperformancedisplays/realm?serviceKey=${SERVICE_KEY}&realmCode=${realmCode}&from=${fromT}&to=${to}&cPage=${cPage}&rows=${maxRows}`;
      console.log(`외부 API 호출 URL: ${apiUrl}`);

      // 외부 API 호출
      const response = await axios.get(apiUrl);

      // XML 데이터를 JSON으로 변환
      const result = await new Promise((resolve, reject) => {
        xml2js.parseString(response.data, { explicitArray: false }, (err, parsedResult) => {
          if (err) reject(err);
          else resolve(parsedResult);
        });
      });

      const body = result.response && result.response.msgBody;
      if (!body || !body.perforList) break;

      const perforList = Array.isArray(body.perforList) ? body.perforList : [body.perforList];
      allPerforList = allPerforList.concat(perforList);
      cPage++;

      if (perforList.length < maxRows) break;
    }

    // 필터링 및 정렬
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const convertToDate = (dateStr) => {
      if (!dateStr) return null;
      const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      return new Date(formattedDate);
    };

    cachedPerforList = allPerforList.filter(item => {
      const endDate = convertToDate(item.endDate);
      return endDate && endDate >= today;
    }).sort((a, b) => {
      const endDateA = convertToDate(a.endDate || '99991231');
      const endDateB = convertToDate(b.endDate || '99991231');
      return endDateA - endDateB;
    });

    // 캐시 시간 갱신
    lastCacheTime = new Date();

    console.log('모든 연극 데이터가 캐시되었습니다.');
    return sendPaginatedData(res, cachedPerforList, parsedPage, parsedRows);
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error.message);
    if (error.response) {
      console.error('API 응답 코드:', error.response.status);
      console.error('API 응답 데이터:', error.response.data);
      return res.status(error.response.status).send(`외부 API 오류: ${error.response.data}`);
    } else {
      res.status(500).send('서버 오류: 외부 API 요청 실패');
    }
  }
});

// 페이지네이션 처리 및 응답 함수
function sendPaginatedData(res, data, page, rows) {
  const totalCount = data.length;
  const totalPages = Math.ceil(totalCount / rows);
  const startIndex = (page - 1) * rows;
  const endIndex = Math.min(startIndex + rows, data.length);
  const paginatedList = data.slice(startIndex, endIndex);

  console.log(`현재 페이지: ${page}, 총 페이지 수: ${totalPages}, 페이지 데이터:`, paginatedList);

  const modifiedPaginatedList = paginatedList.map((item, index) => ({
    ...item,
    title: `${item.title || '제목 없음'} (Page ${page} - Item ${index + 1})`,
  }));

  res.json({
    totalCount,
    totalPages,
    currentPage: page,
    rowsPerPage: rows,
    perforList: modifiedPaginatedList,
  });
}

// 연극 상세 정보 조회 라우트 (변경 없음)
app.get('/api/plays/details/:seq', async (req, res) => {
  const { seq } = req.params;
  console.log(`Received request for play details with seq: ${seq}`);

  try {
    const apiUrl = `http://www.culture.go.kr/openapi/rest/publicperformancedisplays/d/?seq=${seq}&serviceKey=${SERVICE_KEY}`;
    console.log(`API 호출 URL: ${apiUrl}`);

    const response = await axios.get(apiUrl);

    if (response.status !== 200) {
      console.error(`API 요청 실패: 상태 코드 ${response.status}`);
      return res.status(response.status).send('API 요청에 실패하였습니다.');
    }

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('XML 파싱 중 오류 발생:', err);
        return res.status(500).send('서버 오류: XML 파싱 실패');
      }

      const perforInfo = result?.response?.msgBody?.perforInfo;
      if (!perforInfo) {
        console.error('상세 정보가 없습니다.');
        return res.status(404).send('해당 연극 정보를 찾을 수 없습니다.');
      }

      res.json(perforInfo);
    });
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error.message);
    if (error.response) {
      return res.status(error.response.status).send(`외부 API 오류: ${error.response.data}`);
    } else {
      res.status(500).send('서버 오류: 외부 API 요청 실패');
    }
  }
});

app.listen(PORT, () => {
  console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

*/

