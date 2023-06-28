const express = require("express");
const Configuration = require("openai").Configuration;
const OpenAIApi = require("openai").OpenAIApi;
require("dotenv").config();
const path = require("path");
const cors = require("cors");

const app = express();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function generatePrompt(poem) {
  const capitalizedPoem = poem[0].toUpperCase() + poem.slice(1).toLowerCase();
  return `
    Act as a poet and create a poem of about 15 lines on the topic: ${capitalizedPoem},
    try to be as creative as possible. It should have the rhyme scheme of ABAB.
  `;
}

async function generatePoem(poem) {
  if (!configuration.apiKey) {
    throw new Error(
      "OpenAI API key not configured, please follow instructions in README.md"
    );
  }

  if (poem.trim().length === 0) {
    throw new Error("Please enter a valid topic");
  }

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: generatePrompt(poem),
    temperature: 0.9,
    max_tokens: 100,
  });
  const result = completion.data.choices[0].text;
  return result;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.post("/generate-poem", async (req, res) => {
  const poemTopic = req.body.poemTopic;
  try {
    const poem = await generatePoem(poemTopic);
    res.status(200).send({ poem, ok: true });
  } catch (error) {
    res.status(500).send({ error: error.message, ok: false });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
