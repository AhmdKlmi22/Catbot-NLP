document.getElementById('sendBtn').addEventListener('click', function() {
    const question = document.getElementById('pertanyaan').value;
    console.log('Sending question:', question); // Tambahkan logging
  
    fetch('/chat', { // Pastikan endpoint sesuai
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'question=' + encodeURIComponent(question),
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      console.log('Received response:', data); // Tambahkan logging
      if (data.answer) {
        // Tampilkan jawaban di area chat
        const chatArea = document.getElementById('chatArea');
        const userMessage = document.createElement('div');
        userMessage.className = 'd-flex justify-content-end mb-4';
        userMessage.innerHTML = `
          <div class="msg_cotainer_send">
            ${question}
            <span class="msg_time_send">${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="img_cont_msg">
            <img src="/static/img/boy.png" class="rounded-circle user_img_msg" />
          </div>
        `;
        const botResponse = document.createElement('div');
        botResponse.className = 'd-flex justify-content-start mb-4';
        botResponse.innerHTML = `
          <div class="img_cont_msg">
            <img src="/static/img/kitty.png" class="rounded-circle user_img_msg" />
          </div>
          <div class="msg_cotainer" style="position: relative">
            ${data.answer}
            <span class="msg_time">${new Date().toLocaleTimeString()}</span>
          </div>
        `;
        chatArea.appendChild(userMessage);
        chatArea.appendChild(botResponse);
        document.getElementById('pertanyaan').value = ''; // Bersihkan kolom input
  
        // Teks ke Suara
        if (isMicUsed) {
          if (typeof responsiveVoice !== "undefined") {
            responsiveVoice.speak(sanitizeForSpeech(data.answer), "Indonesian Female");
            isSpeaking = true;
          }
        }
  
        isMicUsed = false;
      }
    }).catch(error => {
      console.error('Error:', error);
      addMessage("bot", "Terjadi kesalahan, silakan coba lagi nanti.");
    });
  });
  