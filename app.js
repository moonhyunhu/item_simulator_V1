import express from 'express';
import connect from './schemas/index.js';
import charsRouter from './routes/characters.router.js';
import itemsRouter from './routes/item.router.js';
import errorHandlerMiddlewares from './middlewares/error-handler.middlewares.js';

const app = express();
const PORT = 3333;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json()); //미들웨어를 사용하게 해주는 코드 맨처음 인자값에 의해서 인자 경로로 접근하는 경우에만 json미들웨어를 거친 뒤 router로 연결되게 함
//express.json 미들웨어? 클라이언트의 요청을 받을때 body에 있는 데이터를 정상적으로 사용할 수 있게 분석해주는 역할
app.use(express.urlencoded({ extended: true }));

const router = express.Router(); //해당하는 router에 개발한 기능을 연결한 후 별도의 module로 분리 예정

router.get('/', (req, res, next) => {
  return res.json({ project: 'game_item_simulator' });
});

app.use('/main', [router, charsRouter, itemsRouter]);

//라우터 실행 중 에러 발생 시 next함수 넣어서 아래 미들웨어 실행 시키기
app.use(errorHandlerMiddlewares);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버 OPEN');
});
