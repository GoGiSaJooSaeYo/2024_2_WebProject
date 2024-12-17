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

