document.addEventListener('DOMContentLoaded', function() {
  // Fungsi untuk menangani pengiriman pertanyaan
  document.getElementById('sendBtn').addEventListener('click', function() {
    const question = document.getElementById('pertanyaan').value;
    console.log('Sending question:', question); // Tambahkan logging

    fetch('chat.html', { // Pastikan endpoint sesuai
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

  // Fungsi dan kode lainnya dari js.js yang sebelumnya
  // ...



const container = document.querySelector(".container-fluid");
const chatContainer = document.querySelector(".chat_container");

// Fungsi untuk memindahkan toggle ke dalam atau luar sidebar
const togglePosition = () => {
  if (window.innerWidth < 768) {
    // Pindahkan tombol ke dalam sidebar jika layar kecil
    sidebar.appendChild(toggleSidebar);
    toggleSidebar.style.position = "absolute";
    toggleSidebar.style.top = "10px";
    toggleSidebar.style.right = "10px";
  } else {
    // Pindahkan tombol ke luar sidebar jika layar besar
    container.insertBefore(toggleSidebar, sidebar);
    toggleSidebar.style.position = "relative";
    toggleSidebar.style.top = "";
    toggleSidebar.style.right = "";
  }
};

// Fungsi untuk toggle sidebar
toggleSidebar.addEventListener("click", () => {
  container.classList.toggle("show-sidebar"); // Mengelola kelas pada container
});

$(document).ready(() => {
  const container = $(".container-fluid");
  const sidebar = $(".contacts_card");
  const chatContainer = $(".chat_container");
  const chatBody = $(".msg_card_body");
  const inputPertanyaan = $("#pertanyaan");
  const sendButton = $("#sendBtn");
  const micButton = $("#micBtn");
  const clearButton = $("#clearBtn"); // Tombol hapus utama
  const confirmationAlert = $("#confirmationAlert"); // Popup konfirmasi
  const alertBox = $(".alert-box");
  const alertMessage = $("#alertMessage");
  const confirmYes = $("#confirmYes");
  const confirmNo = $("#confirmNo");

  let isMicUsed = false; // Menandai apakah mic digunakan untuk mengajukan pertanyaan
  let isSpeaking = false; // Menandai apakah teks sedang dibacakan

  const scrollToBottom = () => {
    chatBody.scrollTop(chatBody[0].scrollHeight);
  };

  // Mic Alert dengan animasi zoom-in dan zoom-out dan fitur Batalkan dengan double-click
  const micAlert = $("<div>", {
    id: "micListeningAlert",
    class: "mic-alert",
    html: `
    <div class="mic-alert-box no-select">
      <i class="fas fa-microphone-alt fa-2x "></i>
      <span class="no-select">Sedang Mendengarkan...</span>
    </div>
  `,
  });

  $("body").append(micAlert);
  micAlert.hide(); // Sembunyikan alert pada awalnya

  const showMicAlert = () => {
    micAlert
      .css({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        zIndex: 2000,
      })
      .find(".mic-alert-box")
      .css({
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        animation: "zoomIn 0.3s ease-in-out",
      });
    micAlert.fadeIn(300);
  };

  const hideMicAlert = () => {
    micAlert.find(".mic-alert-box").css({
      animation: "zoomOut 0.3s ease-in-out",
    });
    setTimeout(() => micAlert.fadeOut(300), 300);
  };

  // Mencegah teks di-drag atau dipilih dengan CSS
  $("<style>")
    .prop("type", "text/css")
    .html(
      `
    .no-select {
      user-select: none;
    }
  `
    )
    .appendTo("head");

  // Tambahkan variabel global untuk mengelola status recognition
  let recognition; // Pastikan recognition didefinisikan di luar fungsi
  let isRecognitionActive = false; // Untuk memantau status aktifnya mic

  // Tambahkan validasi dan debug logging untuk Speech Recognition
  const startSpeechRecognition = () => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      // Gantikan alert dengan popup modern
      showErrorPopup(
        "Browser Anda tidak mendukung Speech Recognition. Silakan gunakan Google Chrome."
      );
      console.error("Speech Recognition tidak didukung di browser ini.");
      return;
    }

    // Gunakan SpeechRecognition atau webkitSpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = true; // Mengambil hasil sementara
    recognition.continuous = false; // Tidak berjalan terus-menerus

    // Event ketika proses speech recognition dimulai
    recognition.onstart = () => {
      micButton.prop("disabled", true);
      showMicAlert();
      isRecognitionActive = true; // Mic sedang aktif
      console.log("Speech recognition dimulai.");
    };

    // Event ketika hasil speech recognition berhasil diterima
    recognition.onresult = (event) => {
      let finalTranscript = ""; // Variabel untuk menyimpan hasil final
      let interimTranscript = ""; // Variabel untuk menyimpan hasil sementara

      // Iterasi melalui semua hasil yang diterima
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        console.log("Hasil Speech Recognition:", transcript);

        // Jika hasil final, masukkan ke dalam finalTranscript
        if (result.isFinal) {
          finalTranscript += transcript + " "; // Tambahkan hasil final
          isMicUsed = true; // Tandai mic telah digunakan
          kirimPertanyaan(); // Kirim pertanyaan secara otomatis
        } else {
          // Jika hasil sementara, masukkan ke dalam interimTranscript
          interimTranscript += transcript + " "; // Tambahkan hasil sementara
        }
      }

      // Update input dengan hasil final dan sementara
      inputPertanyaan.val(finalTranscript + interimTranscript); // Gabungkan dan masukkan ke input
    };

    // Event ketika speech recognition selesai
    recognition.onend = () => {
      micButton.prop("disabled", false);
      hideMicAlert();
      isRecognitionActive = false; // Mic telah berhenti
      console.log("Speech recognition telah selesai.");
    };

    // Mulai proses speech recognition
    try {
      recognition.start();
    } catch (error) {
      console.error("Gagal memulai Speech Recognition:", error);
      showErrorPopup("Gagal memulai Speech Recognition. Silakan coba lagi.");
    }
  };

  // Tangani double-click untuk menghentikan mic
  $(document).on("dblclick", () => {
    if (isRecognitionActive && recognition) {
      console.log("Proses Speech Recognition dihentikan dengan double-click.");
      recognition.abort(); // Hentikan proses speech recognition
      inputPertanyaan.val(""); // Bersihkan input jika proses dihentikan
      showInfoPopup("Mic telah Anda Non-Aktifkan.");
      hideMicAlert();
      isRecognitionActive = false;
    }
  });

  // Fungsi untuk menampilkan popup informasi
  const showInfoPopup = (message) => {
    const infoPopup = $(`
    <div class="popup-overlay">
      <div class="popup-box">
        <div class="popup-content">
          <i class="fas fa-info-circle info-icon"></i>
          <p>${message}</p>
        </div>
      </div>
    </div>
  `);

    $("body").append(infoPopup);
    $(".popup-overlay").fadeIn(300);

    $(".popup-close").on("click", () => {
      $(".popup-overlay").fadeOut(300, () => infoPopup.remove());
    });

    setTimeout(() => {
      $(".popup-overlay").fadeOut(300, () => infoPopup.remove());
    }, 3000); // Popup otomatis hilang setelah 3 detik
  };

  // Fungsi untuk menampilkan animasi loading
  const generateAnimation = (role) => {
    const time = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const animationHtml = `
      <div class="d-flex justify-content-start mb-4" id="loadingAnimation">
      <div class="img_cont_msg">
        <img src="/static/img/kitty.png" class="rounded-circle user_img_msg" />
      </div>
      <div class="msg_cotainer" style="position: relative">
        <div class="loading-animation">
          <span class="wave-dots">
            <span class="dot"></span>
          </span>
        </div>
        <span class="msg_time">${time}</span>
      </div>
    </div>
    `;

    chatBody.append(animationHtml);
    scrollToBottom();
  };

  const removeAnimation = () => {
    $("#loadingAnimation").remove();
  };

  const sanitizeForSpeech = (text) =>
    text
      .replace(/<[^>]+>/g, "") // Hilangkan semua tag HTML
      .replace(/\*/g, "") // Hilangkan asterisks (*)
      .trim();

  const kirimPertanyaan = () => {
    const pertanyaan = inputPertanyaan.val().trim();
    if (!pertanyaan) {
      alert("Harap masukkan pertanyaan.");
      return;
    }

    addMessage("user", pertanyaan);

    inputPertanyaan.val(""); // Kosongkan textarea setelah kirim pertanyaan

    generateAnimation(); // Tampilkan animasi saat proses generate jawaban dimulai

    fetch('chat.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'question=' + encodeURIComponent(pertanyaan),
    }).then(response => response.json()).then(data => {
      console.log('Received response:', data); // Tambahkan logging
      if (data.answer) {
        // Tampilkan jawaban di area chat
        const chatArea = document.getElementById('chatArea');
        const userMessage = document.createElement('div');
        userMessage.className = 'd-flex justify-content-end mb-4';
        userMessage.innerHTML = `
          <div class="msg_cotainer_send">
            ${pertanyaan}
            <span class="msg_time_send">${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="img_cont_msg">
            <img src="Testing/static/img/boy.png" class="rounded-circle user_img_msg" />
          </div>
        `;
        const botResponse = document.createElement('div');
        botResponse.className = 'd-flex justify-content-start mb-4';
        botResponse.innerHTML = `
          <div class="img_cont_msg">
            <img src="Testing/static/img/kitty.png" class="rounded-circle user_img_msg" />
          </div>
          <div class="msg_cotainer" style="position: relative">
            ${data.answer}
            <span class="msg_time">${new Date().toLocaleTimeString()}</span>
          </div>
        `;
        chatArea.appendChild(userMessage);
        chatArea.appendChild(botResponse);
        document.getElementById('pertanyaan').value = ''; // Clear the input field

        // Teks ke Suara
        if (isMicUsed) {
          if (typeof responsiveVoice !== "undefined") {
            responsiveVoice.speak(sanitizeForSpeech(data.answer), "Indonesian Female");
            isSpeaking = true;
          }
        }

        isMicUsed = false;
      }
      removeAnimation(); // Hapus animasi setelah jawaban diterima
    }).catch(error => {
      console.error('Error:', error);
      removeAnimation(); // Hapus animasi jika terjadi kesalahan
      addMessage("bot", "Terjadi kesalahan, silakan coba lagi nanti.");
      isMicUsed = false;
    });
  };

  sendButton.on("click", kirimPertanyaan);

  inputPertanyaan.on("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      kirimPertanyaan();
    }
  });

  chatBody.on("click", ".speaker-button", function () {
    const text = $(this).data("text");
    const sanitizedText = sanitizeForSpeech(text);
    if (isSpeaking && typeof responsiveVoice !== "undefined") {
      responsiveVoice.cancel();
      isSpeaking = false;
    } else if (typeof responsiveVoice !== "undefined") {
      responsiveVoice.speak(sanitizedText, "Indonesian Female");
      isSpeaking = true;
    }
  });

  chatBody.on("click", ".copy-button", function () {
    const text = $(this).data("text");
    const icon = $(this).find("i");

    navigator.clipboard.writeText(text).then(() => {
      icon.removeClass("fa-copy").addClass("fa-check");
      setTimeout(() => {
        icon.removeClass("fa-check").addClass("fa-copy");
      }, 2000);
    }).catch((err) => {
      console.error("Gagal menyalin teks:", err);
      alert("Gagal menyalin teks. Silahkan coba lagi.");
    });
  });

  clearButton.on("click", (e) => {
    e.preventDefault();
    confirmationAlert.css("display", "flex");
  });

  confirmYes.on("click", () => {
    alertMessage.html(
      '<i class="fas fa-check-circle" style="color: green; font-size: 24px;"></i> Chat berhasil dihapus!'
    );

    confirmYes.hide();
    confirmNo.hide();

    setTimeout(() => {
      closeAlert(() => {
        $("form").submit();
      });
    }, 1000);
  });

  confirmNo.on("click", () => {
    closeAlert();
  });

  const closeAlert = (callback) => {
    alertBox.css("animation", "zoomOut 0.3s forwards");
    setTimeout(() => {
      confirmationAlert.css("display", "none");
      alertBox.css("animation", "zoomIn 0.3s forwards");
      if (callback) callback();
    }, 300);
  };
});
});
