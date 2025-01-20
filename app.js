window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", "G-FB7V9WMN30");

(function (m, e, t, r, i, k, a) {
  m[i] =
    m[i] ||
    function () {
      (m[i].a = m[i].a || []).push(arguments);
    };
  m[i].l = 1 * new Date();
  for (var j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === r) {
      return;
    }
  }
  (k = e.createElement(t)),
    (a = e.getElementsByTagName(t)[0]),
    (k.async = 1),
    (k.src = r),
    a.parentNode.insertBefore(k, a);
})(
  window,
  document,
  "script",
  "https://mc.webvisor.org/metrika/tag_ww.js",
  "ym"
);

ym(92988225, "init", {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: true,
});

window.chatIntl = JSON.parse(
  '{"newChat":"New chat","textareaPlaceholder":"Start writing here...","sendButton":"Send","you":"You","copy":"Copy","copied":"Copied","wait":"Wait...","requestsLimit":"You have {0} out of {1} requests left.","fix":"Pin","rename":"Rename","delete":"Delete","choose":"Choose","subscriptions":"Try TalkAI Premium","aboutTariffs":"Learn more about Premium","premiumChat":"https://premium.talkai.info/chat/","premiumLanding":"https://premium.talkai.info/","imageYouUrl":"/files/you.svg","imageBotUrl":"/files/bot.svg","likeUrl":"/files/like.svg","billedMonthly":"Billed Monthly","billedAnnually":"Billed Annually","billing":"Billing","monthly":"Monthly","yearly":"Yearly","saveUp":"Save up to","month":"month","year":"year","chatLimitTitle":"Chats limit exceeded","chatLimitMessage":"The limit on the number of chats has been exceeded. To add a new chat, you need to delete at least one existing chat.","attachButton":"Attach a file or image. Available in Premium","settings":{"settingsButton":"Settings","defaultButton":"Default","saveButton":"Save","temperatureTitle":"Temperature","temperatureDescription":"Lower values for temperature result in more consistent outputs (for example, for writing code), while higher values generate more diverse and creative results (for example, for writing poetry). Select a temperature value based on the desired trade-off between coherence and creativity for your specific task.","topPTitle":"TOP P","topPDescription":"Controls diversity via nucleus sampling. Adjusting the Top P value allows to explore a range of responses, from more deterministic (low values) to more diverse and exploratory (high values). The option is available in TalkAI Premium.","frequencyPenaltyTitle":"Frequency penalty","frequencyPenaltyeDescription":"The extent to which new tokens should be penalized depending on their existing frequency in the text up to that point. Reduces the model\'s tendency to repeat the same line word for word. Increasing frequency penalty is like telling not to use the same words too often. The option is available in TalkAI Premium.","presencePenaltyTitle":"Presence penalty","presencePenaltyeDescription":"The degree to which new tokens should be penalized based on their appearance in the text up to now. Enhances the model\'s probability to discuss new topics. Increasing presence penalty is like telling ChatGPT not to use repetitive phrases or ideas. The option is available in TalkAI Premium.","removeRestrictionsTitle":"Remove limitations","removeRestrictionsDescription":"Attention! By removing the limitations on settings, you gain access to a wider range of adjustments for the chatbot. Adjusting the values close to the maximum and minimum can significantly impact the quality of the chatbot\'s responses, up to the point of rendering them meaningless. To revert to the original settings, simply click the Default” button.","modelChatTitle":"Model","modelChatDescription":"GPT-3.5 is fast, but rather old model. Limited to knowledge until 2021.\\n        GPT-4o is the most advanced and “smartest” model to day, but slower. Knowledge about the world is constantly updated. Available with TalkAI Premium.\\n        GPT-4o mini is a simplified version of GPT-4о with fewer parameters, not as smart, but works faster. Limited to knowledge until 2023.","modelImageTitle":"Model","modelImageDescription":"DALL-E 2 is an old image generation model from OpenAI. DALL-E 3 is a new model capable of generating images of significantly better quality and higher resolution.","resolutionTitle":"Resolution","resolutionDescription":"Resolution of images that the neural network will generate.","chatHistoryTitle":"Dialogue Memory","chatHistoryDescription":"Enabling the \\"Dialogue Memory\\" option allows the chatbot to remember previous messages and replies in this chat and take previous context into account when communicating. Please keep in mind that enabling this option may result in quicker use of your word limit.","numberOfMessagesTitle":"Messages in memory","numberOfMessagesDescription":"The number of previous messages that the chatbot will remember. Increasing this value may result in your word limit being reached more quickly.","fastModelsTitle":"Fast Models","smartModelsTitle":"Smart Models","modelButton":"Model","models":{"dall-e-2":{"description":"Old image generation model from $blue{OpenAI}","tooltip":""},"dall-e-3":{"description":"New model from $blue{OpenAI} capable of generating high-quality and high-resolution images","tooltip":""},"gpt-3.5-turbo":{"description":"Old proven model from $blue{OpenAI}","tooltip":""},"gpt-4o-mini":{"description":"Developer: $blue{OpenAI}. Fast resource-efficient model that can answer questions and help with a variety of tasks","tooltip":""},"gpt-4o":{"description":"Developer: $blue{OpenAI}. High-speed model optimized for coding tasks, text analysis and logical reasoning","tooltip":"Available in Premium"},"gemini-1.5-pro":{"description":"Developer: $blue{Google}. Highly intelligent model proficient in math and science","tooltip":"Available in Premium"},"claude-3-5-sonnet":{"description":"Developer: $blue{Anthropic}. All-around model that is especially good at writing and coding","tooltip":"Available in Premium"},"claude-3-haiku":{"description":"Developer: $blue{Anthropic}. State-of-the-art model for nuanced content creation and meaningful conversations","tooltip":""},"gemini-1.5-flash-8b":{"description":"Developer: $blue{Google}. Best for lower-complexity tasks such as translation or creating content for social media","tooltip":""}},"conversationStyleTitle":"Conversation style","conversationStyleDescription":"Choose the style of answers that best suits your task. For example, for writing poetry, go for creative, for writing code, go for precise","conversationStyleValues":{"1":"More $blue{creative}","0.7":"More $blue{balanced}","0.2":"More $blue{precise}"},"dialogueContextTitle":"Dialogue context","dialogueContextDescription":"Enables the dialog context to be passed to the bot. Available in Premium","contextSizeTitle":"Context size","contextSizeDescription":"Choose the size of the context to be passed to the bot","contextSizeSymbols":"symbols","contextSizeWords":"words","contextSizeHint":"The number of words spent is calculated approximately and depends on the language, AI model and attachments","claudeUrl":"https://claude.talkai.info/","geminiUrl":"https://gemini.talkai.info/"}}'
);

(adsbygoogle = window.adsbygoogle || []).push({});

function showBanner() {
  const consentBanner = document.getElementById("consent-banner");
  consentBanner.classList.remove("hidden");
}

function hideBanner() {
  localStorage.setItem("term-of-use-accepted", "yes");
  const consentBanner = document.getElementById("consent-banner");
  consentBanner.classList.add("hidden");
  consentBanner.remove();
}

function initializeBanner() {
  let isAccepted = localStorage.getItem("term-of-use-accepted");
  if (isAccepted === null) {
    localStorage.setItem("term-of-use-accepted", "no"); 
    showBanner();
  }
  if (isAccepted !== "yes") {
    showBanner();
  }
}

const accentBtn = document.getElementById("accept-btn");
accentBtn &&
  accentBtn.addEventListener("click", function (e) {
    e.preventDefault();
    hideBanner();
  });
document.addEventListener("DOMContentLoaded", (event) => {
  initializeBanner();
});
