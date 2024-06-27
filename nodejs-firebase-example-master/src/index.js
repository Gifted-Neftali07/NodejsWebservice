const app = require("./app");
const cors = require("cors");

app.use(cors());
async function main() {
  app.listen(3000);
  console.log("Server on port", 3000);
}

main();
