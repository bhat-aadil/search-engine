const query = document.querySelector(".searchBox");
const results = document.querySelector(".results");

let count = 20;
let audio = new Audio("sounds/alert.mp3");
async function search(e) {
  if (query.value) {
    try {
      const response = await fetch(
        `/search?q=${encodeURIComponent(query.value)}`
      );
      results.innerHTML = `<div><p>Showing results for <b>${query.value}</b></p></div>`;
      const data = await response.json();
      data.items.forEach((item) => {
        const link = item.link;
        const snippet = item.snippet;
        const title = item.title;
        const pm = item.pagemap;
        let imgSrc;
        if (item.pagemap.cse_image) {
          imgSrc = item.pagemap.cse_image[0].src;
          console.log(imgSrc);
        } else {
          imgSrc = "../images/icon-1.png";
        }

        let div = document.createElement("div");
        div.innerHTML = ` <div class="result-item">
                      <img src="${imgSrc}" alt="" width="50px">
                      <div>
                           <a href="${link}" target=blank><h4>${title}</h4></a>
                          
                          <p>${snippet}</p>
                      </div>
                      
                  </div>`;

        results.appendChild(div);
      });

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  } else {
    results.innerHTML = `<div class="warning"><h3>Type to search</h3></div>`;
    setTimeout(() => {
      results.innerHTML = "";
    }, 2000);
  }
}

const searchBtn = document.querySelector(".searchBtn");

//EventListeners
searchBtn.addEventListener("click", (event) => {
  event.preventDefault();
  results.innerHTML = "";
  search();
});

query.addEventListener("input", (event) => {
  if (query.value) {
    document.querySelector(".cut").style.display = "block";
  } else {
    document.querySelector(".cut").style.display = "none";
  }
});

document.querySelector(".fa-xmark").addEventListener("click", (event) => {
  event.preventDefault();
  query.value = "";
});

//Ai ChatBot Logic.....................................
const chatBot = document.querySelector(".chatBot-container");
const fileUpload = document.querySelector(".img-upload");
const uploadBtn = document.querySelector(".fa-file-arrow-up");
const hideChatBot = document.querySelector(".hide-chatbot");
const showChatBot = document.querySelector(".show-chatbot");
const chatDisplay = document.querySelector(".chat-body");
uploadBtn.addEventListener("click", (event) => fileUpload.click());

showChatBot.addEventListener("click", (event) => {
  showChatBot.style.display = "none";
  chatBot.classList.toggle("visible");
  hideChatBot.classList.toggle("showCross");
});

hideChatBot.addEventListener("click", (event) => {
  showChatBot.style.display = "block";
  chatBot.classList.toggle("visible");
  hideChatBot.classList.toggle("showCross");
});

const chatInput = document.querySelector(".chat-input");

let userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const chatHistory = [];

async function sendMessage() {
  const chatInput = document.querySelector(".chat-input");
  userData.message = chatInput.value;

  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data ? [{ inline_data: userData.file }] : []),
    ],
  });

  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: chatHistory }),
  });
  const data = await response.json();
  console.log(data);
  let displayMessage = data.candidates[0].content.parts[0].text;

  chatHistory.push({
    role: "model",
    parts: [{ text: displayMessage }],
  });
  const div = document.createElement("div");
  const divUser = document.createElement("div");
  divUser.innerHTML = ` <div class="user">
                <i class="fa-solid fa-user"></i>
                <p class="user-query">${userData.message}</p>

              </div>
              ${
                userData.file.data
                  ? `<p class="user"><img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" /></p>`
                  : ""
              }`;

  let divLoading = document.createElement("div");
  divLoading.classList.add("bot");
  divLoading.innerHTML = `<i class="fa-solid fa-robot"></i><div class="thinking-indicator">
               
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                      </div>`;

  const divBot = document.createElement("div");
  divBot.innerHTML = `<div class="bot">
                <i class="fa-solid fa-robot"></i>
                <p class="bot-answer">${displayMessage}</p>
              </div>`;
  div.appendChild(divUser);
  div.appendChild(divLoading);

  setTimeout(() => {
    div.removeChild(divLoading);
    div.appendChild(divBot);
    if (response.ok) audio.play();
  }, 800);

  chatDisplay.appendChild(div);

  userData.file = {};
  chatDisplay.scrollTo({ top: chatDisplay.scrollHeight, behavior: "smooth" });
  chatInput.value = "";

  console.log(chatHistory);
}

fileUpload.addEventListener("click", (event) => {
  const file = fileUpload.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64String = e.target.result.split(",")[1];

    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
    fileUpload.value = "";
  };
  reader.readAsDataURL(file);
});
