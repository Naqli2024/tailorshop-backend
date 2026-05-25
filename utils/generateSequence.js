const Counter = require("../models/Counter");

const generateSequence = async (
  businessId,
  counterName
) => {
  const counter =
    await Counter.findOneAndUpdate(
      {
        businessId,
        counterName,
      },
      {
        $inc: {
          sequenceValue: 1,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

  return counter.sequenceValue;
};

module.exports = generateSequence;