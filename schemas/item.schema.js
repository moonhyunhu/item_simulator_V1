import mongoose from 'mongoose';

//아이템 스키마생성
const itemSchema = new mongoose.Schema(
  {
    item_code: {
      type: String,
      required: true,
    },
    item_name: {
      type: String,
      required: true,
    },
    item_stat: {
      //type: {},
      type: Object,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model('Item', itemSchema);
