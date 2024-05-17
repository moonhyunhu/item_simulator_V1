import express from 'express';
import Character from '../schemas/characters.schema.js';
import Joi from 'joi';

const router = express.Router();

//유효성 검사
const createdCharSchema = Joi.object({
  Nickname: Joi.string().min(2).max(8).required(),
});

//캐릭터 생성 API
router.post('/char', async (req, res, next) => {
  try {
    //1.클라이언트로부터 받아온 Nickname 데이터를 가져온다.
    const getNickname = await createdCharSchema.validateAsync(req.body);
    const { Nickname } = getNickname;

    //1-1.클라이언트에서 Nickname데이터가 전달되지 않았으면 에러메세지 전달
    if (!Nickname) {
      return res
        .status(400)
        .json({ errormessege: '캐릭터가 존재하지 않습니다.' });
    }

    //2.해당하는 마지막 char_id를 조회한다
    const charMaxId = await Character.findOne().sort('-character_Id').exec();

    //3.char_id가 있으면 기존 id+1 없으면 1로 설정
    const character_Id = charMaxId ? Number(charMaxId.character_Id) + 1 : 1;

    //3-1.HP와 power 디폴트 값 설정
    let HP = 500;
    let power = 100;

    //4.캐릭터 생성
    const newchar = new Character({ Nickname, character_Id, HP, power });
    await newchar.save(); //데이터베이스에 저장

    //5.클라이언트로 반환
    return res.status(200).json({ newchar });
  } catch (error) {
    next(error);
  }
});

//캐릭터 목록 조회 API
router.get('/char', async (req, res, next) => {
  //1.캐릭터 목록 조회
  const chars = await Character.find().sort('-character_Id').exec();

  //2. 전체 조회니 간소화해서 출력하자
  //skipChars는 배열이고 바꿔야 할 부분은 객체이기 때문에 먼저 배열을 map으로 접근한 다음 각 객체 매개변수를 구조분해할당을 통해 item_stat생략한 객체로 반환
  const skipChars = chars.map((char) => {
    const skipObj = {
      Nickname: char.Nickname,
    };
    return skipObj;
  });
  //3.캐릭터 목록 조회결과를 클라이언트에 반환
  return res.status(200).json({ CharacterList: skipChars });
});

//캐릭터 상세 조회 API
router.get('/char/:DetailChar', async (req, res, next) => {
  //1.url매개변수값 읽기
  const { DetailChar } = req.params;

  //2.매개변수값과 일치하는 캐릭터 찾기
  const pickChar = await Character.findOne({ character_Id: DetailChar }).exec();

  //2-1.해당하는 캐릭터가 없으면 에러메세지 출력
  if (!pickChar) {
    res.status(404).json({ errormessege: '찾는 캐릭터가 없습니다.' });
  }

  //3.캐릭터 상세 목록 조회결과를 클라이언트에 반환
  return res.status(200).json({ CharacterDetail: pickChar });
});

//캐릭터 삭제 API
router.delete('/char/:charId', async (req, res, next) => {
  //1.url매개변수값을 req.params로 읽어서 변수 선언
  const { charId } = req.params;

  //2.변수값과 Character모델안에 값과 비교해서 해당 객체 찾기
  const pickChar = await Character.find({ character_Id: charId }).exec();

  //2-1.객체가 없다면 에러메세지 출력
  if (!pickChar) {
    return res.status(404).json({ errormessage: '삭제할 캐릭터가 없습니다' });
  }

  //3.해당 객체 삭제하기
  await Character.deleteOne({ character_Id: charId }).exec();

  //4.클라이언트로 삭제완료 메세지반환
  return res.status(200).json({ character: '삭제완료' });
});

export default router;
