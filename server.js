const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sleep = (time) =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), time);
  });

const fetchProfileDetails = async (url) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    slowMo: 100,
  });
  const page = await browser.newPage();

  await page.goto(url);
  await sleep(100);

  await page.click(
    "#public_profile_contextual-sign-in > div > section > button"
  );
  await sleep(100);

  const data = await page.evaluate(() => {
    const personName = document.querySelector(
      "section.profile > section > div > div > div > h1"
    ).innerText;

    const companyName = document.querySelector(
      "ul.experience__list > li > div > h4 > a"
    ).innerText;

    const position = document.querySelector(
      "ul.experience__list > li > div > h3"
    ).innerText;

    const connections = document.querySelector(
      "section.profile > section > div > div > div > h3 > span.top-card__subline-item--bullet"
    ).innerText;

    const location = document.querySelector(
      "section.profile > section > div > div > div > h3 > div"
    ).innerText;

    return { personName, companyName, position, connections, location };
  });

  await browser.close();

  return data;
};

app.get("/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const data = await fetchProfileDetails(
      `https://www.linkedin.com/in/${name}`
    );
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server listening on port 8000");
});
