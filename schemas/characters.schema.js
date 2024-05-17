import mongoose from 'mongoose';

//캐릭터스키마 생성
const charSchema = new mongoose.Schema(
  {
    Nickname: {
      type: String,
      required: true,
      unique: true,
    },
    character_Id: {
      type: String,
      required: true,
    },
    HP: {
      type: Number,
      required: true,
    },
    power: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model('Character', charSchema);
