import mongoose from "mongoose";

const resetSchema = new mongoose.Schema({
  email: String,
  expireAt: {
    type: Date,
    default: () => Date.now() + 600,
  },
});

resetSchema.statics.format = (reset) => {
  const { _id, email } = reset;

  return {
    _id,
    email,
  };
};

const Reset = mongoose.model("Reset", resetSchema);

export default Reset;
