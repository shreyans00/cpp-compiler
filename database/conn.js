const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log(`connection success`);
  })
  .catch((e) => {
    console.log(`${e}no connection`);
  });
