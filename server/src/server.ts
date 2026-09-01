import "dotenv/config";

import app from "./app.js";

const PORT =
  Number(
    process.env.PORT,
  ) || 4000;

const HOST =
  "0.0.0.0";

app.listen(
  PORT,
  HOST,
  () => {
    console.log(
      `Luxe Watch is running on port ${PORT}`,
    );
  },
);
