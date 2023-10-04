const express = require("express");
const app = express();
const http = require("http");
const fs = require("fs");
const PORT = 8888;
const HOST = "0.0.0.0";

console.log("🚀 ~ file: index.js:8 ~ fs.readdir ~ __dirname:", __dirname);

const reports = [];
const folderReport = "reports/";
// const prefixFolderReport = "reports/";

app.use("/reports", express.static("reports"));
app.set("view engine", "ejs");

fs.readdir(__dirname + "/reports", (err, files) => {
  if (err) console.log(err);
  else {
    files.forEach((file) => {
      reports.push({
        file,
        source: "/"+ folderReport + file + "/index.html",
      });
    });
  }
});

app.get("/", (req, res) => {
  res.render("home", {
    title: "titulo de la pagina",
    reports: JSON.stringify(reports),
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
