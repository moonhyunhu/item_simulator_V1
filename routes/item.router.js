import express from 'express';
import Item from '../schemas/item.schema.js';
import Joi from 'joi';

const router = express.Router();

//유효성 검사
const createdItemSchema = Joi.object({
  item_name: Joi.string().min(1).max(50).required(),
  item_stat: Joi.object().required(),
});

//아이템 생성 API
router.post('/item', async (req, res, next) => {
  try {
    //1.클라이언트로부터 받아온 item_name데이터를 가져온다.
    const getname = await createdItemSchema.validateAsync(req.body);
    const { item_name } = getname;
    const getstat = await createdItemSchema.validateAsync(req.body);
    const { item_stat } = getstat;

    //1-1.클라이언트에서 item_name데이터가 전달되지 않았으면 에러메세지 전달 //이전에 유효성 검사를 하기 때문에 조건이 필요 없을 것 같음
    if (!item_name) {
      return res
        .status(400)
        .json({ errormessege: '아이템이 존재하지 않습니다.' });
    }
    //2.해당하는 마지막 item_code를 조회한다.
    const itemMaxcode = await Item.findOne().sort('-item_code').exec();

    //3.item_code가 있으면 기존 code+1 없으면 1로 설정
    const item_code = itemMaxcode ? Number(itemMaxcode.item_code) + 1 : 1;
    //4.아이템 생성
    const newitem = new Item({ item_name, item_code, item_stat });
    await newitem.save();

    //5.클라이언트로 반환
    return res.status(200).json({ newitem });
  } catch (error) {
    //에러처리 다음 미들웨어 실행
    next(error);
  }
});

//아이템 목록 조회 API
router.get('/item', async (req, res, next) => {
  //1.아이템 전체목록 조회
  const items = await Item.find().sort('-item_code').exec();

  //1-1.전체 조회는 item_stat 생략한 객체
  //skipItems는 배열이고 바꿔야 할 부분은 객체이기 때문에 먼저 배열을 map으로 접근한 다음 각 객체 매개변수를 구조분해할당을 통해 item_stat생략한 객체로 반환
  const skipItems = items.map((item) => {
    const skipObj = {
      item_code: item.item_code,
      item_name: item.item_name,
    };
    return skipObj;
  });
  //2.아이템 전체 목록 조회결과를 클라이언트에 반환
  return res.status(200).json({ ItemList: skipItems });
});

//아이템 상세목록 조회 API
router.get('/item/:DetailItem', async (req, res, next) => {
  //1.상세조회할 아이템 이름을 매개변수값으로 입력받아 변수 선언하기
  const { DetailItem } = req.params;

  //2.변수값과 Item모델안에 값과 비교해서 해당 객체 찾기
  const pickItem = await Item.find({ item_code: DetailItem }).exec();

  //2-1.해당 객체가 없다면 에러메세지 출력
  if (!pickItem) {
    return res
      .status(404)
      .json({ errormessege: '삭제할 아이템이 존재하지 않습니다.' });
  }

  //3. 클라이언트에 반환
  return res.status(200).json({ itemDetail: pickItem });
});

//아이템 수정 API
router.patch('/item/:OPitem', async (req, res, next) => {
  //url매개변수에 입력된 값을 읽기
  const { OPitem } = req.params;

  //body에 입력된 값을 읽어옴
  const { item_name, item_stat } = req.body;
  
  //1.매개변수에 입력된 값과 일치한 아이템 찾기
  const findOPitem = await Item.findOne({ item_name: OPitem }).exec();

  //1-1. 일치하지 않는다면 에러메세지 출력
  if (!findOPitem) {
    res
      .status(404)
      .json({ errormessege: '입력한 아이템이 존재하지 않습니다.' });
  }

  //2.입력된 body값을 기존 아이템에 덮어쓰기
  if (item_name) {
    findOPitem.item_name = item_name;
  }
  if (item_stat) {
    findOPitem.item_stat = item_stat;
  }

  //3.데이터베이스에 저장
  await findOPitem.save();

  //4.클라이언트에 반환하기
  return res.status(200).json({ messege: '수정 완료' });
});

export default router;
